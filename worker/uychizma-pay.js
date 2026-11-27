/* UyChizma — chek (to'lov skrinshoti) qabul qilish xizmati.
   Sayt chekni shu yerga yuboradi → admin Telegramda rasmni oladi → "✅ Tasdiqlash" / "❌ Rad etish" havolasini bosadi.
   Kerakli sozlamalar: PAYKV (KV), BOT_TOKEN (secret), ADMIN_CHAT_ID (oddiy o'zgaruvchi). */
const ORIGINS = [/^https?:\/\/(www\.)?uychzma\.uz$/, /^https:\/\/afekis\.github\.io$/, /^https?:\/\/localhost(:\d+)?$/];
const cors = req => { const o = req.headers.get('Origin') || ''; return { 'Access-Control-Allow-Origin': ORIGINS.some(r => r.test(o)) ? o : 'https://uychzma.uz', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' }; };
const J = (req, o, st) => new Response(JSON.stringify(o), { status: st || 200, headers: { ...cors(req), 'content-type': 'application/json' } });
const H = (t, ok) => new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font:20px system-ui;display:grid;place-items:center;height:90vh;text-align:center;background:${ok ? '#E9F7EF' : '#FDECEC'}"><div>${t}</div>`, { headers: { 'content-type': 'text/html; charset=utf-8' } });
async function sign(env, s) { const k = await crypto.subtle.importKey('raw', new TextEncoder().encode('uc-pay|' + env.BOT_TOKEN), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); const b = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 32); }
const esc = s => String(s || '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) });
    if (!env.PAYKV) return J(req, { ok: false, error: 'no_kv' }, 500);

    if (url.pathname === '/pay/chek' && req.method === 'POST') {
      if (!env.BOT_TOKEN || !env.ADMIN_CHAT_ID) return J(req, { ok: false, error: 'not_configured' }, 500);
      const b = await req.json().catch(() => ({})); const img = String(b.img || ''), cid = String(b.cid || '').slice(0, 40);
      const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(img);
      if (!m || img.length > 1200000 || !cid) return J(req, { ok: false, error: 'bad' }, 400);
      const ip = req.headers.get('CF-Connecting-IP') || '', rk = 'rl:' + ip, n = +(await env.PAYKV.get(rk) || 0);
      if (n >= 12) return J(req, { ok: false, error: 'too_many' }, 429);
      await env.PAYKV.put(rk, String(n + 1), { expirationTtl: 3600 });
      const id = 'c' + crypto.randomUUID().replace(/-/g, '').slice(0, 15);
      const o = { id, cid, name: String(b.name || '').slice(0, 60), phone: String(b.phone || '').slice(0, 20), n: Math.max(1, Math.min(10, +b.n || 1)), at: Date.now(), status: 'wait' };
      await env.PAYKV.put('ord:' + id, JSON.stringify(o), { expirationTtl: 30 * 86400 });
      const base = url.origin + '/pay/act?id=' + id;
      const okU = base + '&a=ok&s=' + await sign(env, id + '|ok'), noU = base + '&a=no&s=' + await sign(env, id + '|no');
      const bin = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0)), fd = new FormData();
      fd.append('chat_id', String(env.ADMIN_CHAT_ID));
      fd.append('photo', new Blob([bin], { type: 'image/' + m[1] }), 'chek.' + (m[1] === 'jpeg' ? 'jpg' : m[1]));
      fd.append('caption', `🧾 Yangi chek (saytdan)\n👤 ${o.name || '—'}\n📞 ${o.phone || '—'}\n🏠 ${o.n} ta uy\n🆔 ${cid}`);
      fd.append('reply_markup', JSON.stringify({ inline_keyboard: [[{ text: '✅ Tasdiqlash', url: okU }, { text: '❌ Rad etish', url: noU }]] }));
      const tr = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendPhoto`, { method: 'POST', body: fd }).then(r => r.json()).catch(() => ({}));
      if (!tr.ok) { await env.PAYKV.delete('ord:' + id); return J(req, { ok: false, error: 'tg' }, 502); }
      return J(req, { ok: true, id });
    }

    if (url.pathname === '/pay/act') {
      const id = String(url.searchParams.get('id') || '').slice(0, 20), a = url.searchParams.get('a') === 'ok' ? 'ok' : 'no';
      if (!env.BOT_TOKEN || url.searchParams.get('s') !== await sign(env, id + '|' + a)) return H('⛔ Havola noto\'g\'ri', false);
      const o = JSON.parse(await env.PAYKV.get('ord:' + id) || 'null'); if (!o) return H('Chek topilmadi (eskirgan)', false);
      o.status = a === 'ok' ? 'paid' : 'no'; o.doneAt = Date.now(); await env.PAYKV.put('ord:' + id, JSON.stringify(o), { expirationTtl: 30 * 86400 });
      return a === 'ok' ? H(`✅ Tasdiqlandi<br><small>${esc(o.name)} — Premium ochildi</small>`, true) : H(`❌ Rad etildi<br><small>${esc(o.name)}</small>`, false);
    }

    if (url.pathname === '/pay/st') {
      const o = JSON.parse(await env.PAYKV.get('ord:' + String(url.searchParams.get('id') || '').slice(0, 20)) || 'null');
      return J(req, o ? { ok: true, status: o.status } : { ok: false, status: 'none' });
    }
    return new Response('UyChizma chek xizmati ishlayapti' + (env.BOT_TOKEN ? '' : ' (BOT_TOKEN hali qo\'yilmagan)') + (env.ADMIN_CHAT_ID ? '' : ' (ADMIN_CHAT_ID yo\'q)'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  },
};
