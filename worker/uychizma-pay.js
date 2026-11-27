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
      const b = await req.json().catch(() => ({})); const img = String(b.img || ''), cid = String(b.cid || '').slice(0, 40);
      const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(img);
      if (!m || img.length > 1200000 || !cid) return J(req, { ok: false, error: 'bad' }, 400);
      const ip = req.headers.get('CF-Connecting-IP') || '', rk = 'rl:' + ip, n = +(await env.PAYKV.get(rk) || 0);
      if (n >= 12) return J(req, { ok: false, error: 'too_many' }, 429);
      await env.PAYKV.put(rk, String(n + 1), { expirationTtl: 3600 });
      const id = 'c' + crypto.randomUUID().replace(/-/g, '').slice(0, 15);
      const o = { id, cid, name: String(b.name || '').slice(0, 60), phone: String(b.phone || '').slice(0, 20), n: Math.max(1, Math.min(10, +b.n || 1)), at: Date.now(), status: 'wait' };
      await env.PAYKV.put('ord:' + id, JSON.stringify(o), { expirationTtl: 30 * 86400 });
      await env.PAYKV.put('img:' + id, img, { expirationTtl: 30 * 86400 });
      if (!env.BOT_TOKEN || !env.ADMIN_CHAT_ID) return J(req, { ok: true, id });
      const base = url.origin + '/pay/act?id=' + id;
      const okU = base + '&a=ok&s=' + await sign(env, id + '|ok'), noU = base + '&a=no&s=' + await sign(env, id + '|no');
      const bin = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0)), fd = new FormData();
      fd.append('chat_id', String(env.ADMIN_CHAT_ID));
      fd.append('photo', new Blob([bin], { type: 'image/' + m[1] }), 'chek.' + (m[1] === 'jpeg' ? 'jpg' : m[1]));
      fd.append('caption', `🧾 Yangi chek (saytdan)\n👤 ${o.name || '—'}\n📞 ${o.phone || '—'}\n🏠 ${o.n} ta uy\n🆔 ${cid}`);
      fd.append('reply_markup', JSON.stringify({ inline_keyboard: [[{ text: '✅ Tasdiqlash', url: okU }, { text: '❌ Rad etish', url: noU }]] }));
      const tr = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendPhoto`, { method: 'POST', body: fd }).then(r => r.json()).catch(() => ({}));
      return J(req, { ok: true, id });
    }

    if (url.pathname === '/pay/act') {
      const id = String(url.searchParams.get('id') || '').slice(0, 20), a = url.searchParams.get('a') === 'ok' ? 'ok' : 'no';
      if (!env.BOT_TOKEN || url.searchParams.get('s') !== await sign(env, id + '|' + a)) return H('⛔ Havola noto\'g\'ri', false);
      const o = JSON.parse(await env.PAYKV.get('ord:' + id) || 'null'); if (!o) return H('Chek topilmadi (eskirgan)', false);
      o.status = a === 'ok' ? 'paid' : 'no'; o.doneAt = Date.now(); await env.PAYKV.put('ord:' + id, JSON.stringify(o), { expirationTtl: 30 * 86400 });
      return a === 'ok' ? H(`✅ Tasdiqlandi<br><small>${esc(o.name)} — Premium ochildi</small>`, true) : H(`❌ Rad etildi<br><small>${esc(o.name)}</small>`, false);
    }

    /* Admin sahifasi: /admin?k=ADMIN_KEY — cheklar ro'yxati, ✅/❌ */
    if (url.pathname === '/admin' || url.pathname === '/admin/act') {
      if (!env.ADMIN_KEY || url.searchParams.get('k') !== env.ADMIN_KEY) return H('⛔ Ruxsat yo\'q', false);
      const k = encodeURIComponent(env.ADMIN_KEY);
      if (url.pathname === '/admin/act' && req.method === 'POST') {
        const f = await req.formData(); const id = String(f.get('id') || '').slice(0, 20), a = f.get('a') === 'ok' ? 'paid' : 'no';
        const o = JSON.parse(await env.PAYKV.get('ord:' + id) || 'null'); if (o) { o.status = a; o.doneAt = Date.now(); await env.PAYKV.put('ord:' + id, JSON.stringify(o), { expirationTtl: 30 * 86400 }); }
        return Response.redirect(url.origin + '/admin?k=' + k, 303);
      }
      const ls = await env.PAYKV.list({ prefix: 'ord:', limit: 200 }); const rows = [];
      for (const x of ls.keys) { const o = JSON.parse(await env.PAYKV.get(x.name) || 'null'); if (o && o.id && o.id[0] === 'c') rows.push(o); }
      rows.sort((a, b) => (a.status === 'wait' ? 0 : 1) - (b.status === 'wait' ? 0 : 1) || b.at - a.at);
      const cards = await Promise.all(rows.slice(0, 60).map(async o => { const img = await env.PAYKV.get('img:' + o.id) || '';
        const st = o.status === 'wait' ? '<b style="color:#B26A00">⏳ Kutilmoqda</b>' : o.status === 'paid' ? '<b style="color:#1F7A4D">✅ Tasdiqlangan</b>' : '<b style="color:#C62828">❌ Rad etilgan</b>';
        return `<div class="c">${img ? `<a href="${img}" target="_blank"><img src="${img}" alt="chek"></a>` : ''}<div class="i"><div>${st}</div><div>👤 ${esc(o.name) || '—'}</div><div>📞 ${esc(o.phone) || '—'}</div><div>🏠 ${o.n} ta uy · ${new Date(o.at + 5 * 3600e3).toISOString().slice(0, 16).replace('T', ' ')}</div>
          <form method="post" action="/admin/act?k=${k}"><input type="hidden" name="id" value="${o.id}"><button name="a" value="ok" class="ok">✅ Tasdiqlash</button><button name="a" value="no" class="no">❌ Rad etish</button></form></div></div>`; }));
      return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>UyChizma — cheklar</title><style>body{font:15px system-ui;margin:0;background:#F3F6FB;color:#0E1626}h1{font-size:20px;margin:0;padding:14px 16px;background:#061A55;color:#fff}.w{padding:12px;display:grid;gap:12px;max-width:760px;margin:0 auto}.c{background:#fff;border:1px solid #D6DEEA;border-radius:14px;padding:10px;display:flex;gap:12px}.c img{width:120px;height:160px;object-fit:cover;border-radius:10px;background:#eee}.i{display:grid;gap:4px;flex:1}form{display:flex;gap:8px;margin-top:6px}button{flex:1;border:0;border-radius:10px;padding:10px;font:inherit;font-weight:700;cursor:pointer}.ok{background:#1F7A4D;color:#fff}.no{background:#FDECEC;color:#C62828}</style><h1>🧾 Cheklar (${rows.filter(r => r.status === 'wait').length} ta kutilmoqda)</h1><div class="w">${cards.join('') || '<p>Hozircha chek yo\'q.</p>'}</div>`, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
    }

    if (url.pathname === '/pay/st') {
      const o = JSON.parse(await env.PAYKV.get('ord:' + String(url.searchParams.get('id') || '').slice(0, 20)) || 'null');
      return J(req, o ? { ok: true, status: o.status } : { ok: false, status: 'none' });
    }
    return new Response('UyChizma chek xizmati ishlayapti' + (env.BOT_TOKEN ? '' : ' (BOT_TOKEN hali qo\'yilmagan)') + (env.ADMIN_CHAT_ID ? '' : ' (ADMIN_CHAT_ID yo\'q)'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  },
};
