// UyChizma Telegram bot — Cloudflare Worker (v2)
// Kerak: Secret BOT_TOKEN. Ixtiyoriy: ADMIN_CHAT_ID (yangi raqamlar shu chatga ham keladi).
// O'rnatgandan keyin bir marta oching: https://<worker-manzili>/setup
// Yangi: savollarga AI (odamdek) javob beradi; telefon raqamini so'raydi va Firestore'ga saqlaydi (admin panel → 🤖 Bot).
const SITE = 'https://afekis.github.io/uychizma/';
const ADMIN = 'https://t.me/amirhonsh';
const FB_PROJECT = 'uychizma';
const FB_KEY = 'AIzaSyC9zJhKMXVnMd-wB72hcWkF-2sG4phnlto'; // ochiq web kalit (saytda ham bor)
const FS = `https://firestore.googleapis.com/v1/projects/${FB_PROJECT}/databases/(default)/documents`;

const T = {
  uz: {
    hi: n => `Assalomu alaykum${n ? ', ' + n : ''}! 👋\n\n<b>UyChizma</b> — uyingizni qurishdan oldin ko'ring:\n\n🏠 <b>Uy loyihasi</b> — yer o'lchamini yozing yoki chizmangizni yuklang: 1 daqiqada reja, 3D, narx va smeta.\n🛋 <b>Bo'sh joy dizayni</b> — bo'sh xona yoki hovli rasmini oling, AI uni jihozlab beradi.\n👷 <b>Usta topish</b> — uyingizni qurib beradigan ustalar.\n\nSavolingiz bo'lsa — shu yerga yozing, javob beraman 🙂`,
    house: '🏠 Uy loyihasi', empty: "🛋 Bo'sh joy dizayni", usta: '👷 Usta topish', biz: '🏢 Firmalar uchun',
    admin: "✈️ Admin bilan bog'lanish", lang: '🇷🇺 Русский',
    photo: "📐 Chizma yoki rasmni saytning o'zida yuklasangiz, AI uni o'qib uyni chizadi. Pastdagi tugmani bosing:",
    help: "Buyruqlar:\n/start — bosh menyu\n/uy — uy loyihasi\n/joy — bo'sh joy dizayni\n/usta — usta topish\n/til — tilni almashtirish\n\nIstalgan savolni oddiy yozing — javob beraman.",
    menu: 'Ochish',
    askPhone: "📱 Siz bilan bog'lana olishimiz uchun telefon raqamingizni yuboring — pastdagi <b>«Raqamni yuborish»</b> tugmasini bosing.",
    phoneBtn: '📱 Raqamni yuborish',
    thanks: n => `Rahmat${n ? ', ' + n : ''}! ✅ Raqamingiz saqlandi. Kerak bo'lsa mutaxassisimiz siz bilan bog'lanadi.`,
    notYours: "Iltimos, o'zingizning raqamingizni pastdagi tugma orqali yuboring 🙏",
    aiFail: "Kechirasiz, hozir javob bera olmadim 😔 Birozdan keyin qayta yozing yoki adminga murojaat qiling: @amirhonsh",
  },
  ru: {
    hi: n => `Здравствуйте${n ? ', ' + n : ''}! 👋\n\n<b>UyChizma</b> — увидьте свой дом до начала стройки:\n\n🏠 <b>Проект дома</b> — введите размеры участка или загрузите чертёж: за 1 минуту план, 3D, цена и смета.\n🛋 <b>Дизайн пустого помещения</b> — сфотографируйте пустую комнату или двор, ИИ её обставит.\n👷 <b>Найти мастера</b> — мастера, которые построят ваш дом.\n\nЕсть вопрос — пишите сюда, отвечу 🙂`,
    house: '🏠 Проект дома', empty: '🛋 Дизайн помещения', usta: '👷 Найти мастера', biz: '🏢 Для компаний',
    admin: '✈️ Связаться с админом', lang: "🇺🇿 O'zbekcha",
    photo: '📐 Загрузите чертёж или фото прямо на сайте — ИИ прочитает его и нарисует дом. Нажмите кнопку ниже:',
    help: 'Команды:\n/start — главное меню\n/uy — проект дома\n/joy — дизайн помещения\n/usta — найти мастера\n/til — сменить язык\n\nЛюбой вопрос просто напишите — отвечу.',
    menu: 'Открыть',
    askPhone: '📱 Чтобы мы могли с вами связаться, отправьте номер телефона — нажмите кнопку <b>«Отправить номер»</b> ниже.',
    phoneBtn: '📱 Отправить номер',
    thanks: n => `Спасибо${n ? ', ' + n : ''}! ✅ Номер сохранён. При необходимости наш специалист свяжется с вами.`,
    notYours: 'Пожалуйста, отправьте свой номер кнопкой ниже 🙏',
    aiFail: 'Извините, сейчас не смог ответить 😔 Напишите чуть позже или админу: @amirhonsh',
  },
};

const SYSTEM = l => `Sen — UyChizma kompaniyasining Telegram'dagi yordamchisisan. O'zbekistondagi oddiy, samimiy, xushmuomala menejer kabi gapir: qisqa (2–5 gap), tushunarli, kerak bo'lsa 1 ta emoji. Robotdek ro'yxat va uzun matn yozma. ${l === 'ru' ? 'Javobni RUS tilida yoz.' : "Javobni O'ZBEK tilida (lotin yozuvida) yoz. Agar odam ruscha yozsa — ruscha javob ber."}
Agar "sen botmisan/odammisan" deb so'rashsa — samimiy qilib UyChizma'ning sun'iy intellekt yordamchisi ekaningni ayt va kerak bo'lsa admin @amirhonsh bilan bog'lanishni taklif qil.
UyChizma haqida bilganlaring (faqat shularga tayan, to'qima):
- Sayt: ${SITE}. Yer o'lchamini kiritsangiz yoki chizma/rasm yuklasangiz, 1 daqiqada uy rejasi, 3D ko'rinishi, taxminiy qurilish narxi va smeta (PDF) chiqadi. AR orqali uyni hovlida telefon kamerasida ko'rish mumkin.
- Bo'sh joy dizayni: bo'sh xona/hovli rasmini yuklasangiz, AI uni jihozlab, mebel va taxminiy narxlarni ko'rsatadi.
- Usta topish: ustalar.html — shahar va ish turi bo'yicha ustalar; usta bo'lsangiz «Men ustaman» orqali bepul qo'shilasiz.
- Narx: har bir yangi foydalanuvchiga 1 ta uy loyihasi bepul. Premium — 25 000 so'm, bir to'lovga 2 ta uy loyihasi; to'lov kartaga, chek yuboriladi; yoqmasa pul qaytariladi. 2 ta do'stni taklif qilsangiz (ular ro'yxatdan o'tsa) — 1 ta uy bepul.
- Firmalar uchun (biznes.html): Start 490 000, Biznes 700 000, Korporativ 1 200 000 so'm/oy; to'lov tasdiqlangach 30 kun cheksiz loyiha (VIP).
- Rus va o'zbek tillari bor. Admin: @amirhonsh.
Aniq bilmagan narsani (aniq qurilish narxi, muddat, yuridik savol) taxmin qilib aytma — saytda hisoblab ko'rishni yoki adminga yozishni taklif qil. Siyosat, din va boshqa mavzularga chalg'ima — xushmuomalalik bilan uy/qurilish mavzusiga qaytar.`;

const langOf = (u, kv) => (kv === 'ru' || kv === 'uz') ? kv : (/^(ru|kk|ky|be|uk)/.test((u && u.language_code) || '') ? 'ru' : 'uz');
const isRuText = t => /[а-яё]/i.test(t || '') && !/[ўқғҳ]/i.test(t || '');
const app = (l, path) => ({ url: SITE + (path || '') + (l === 'ru' ? (path && path.includes('?') ? '&' : '?') + 'lang=ru' : '') });
function kb(l) {
  const t = T[l];
  return { inline_keyboard: [
    [{ text: t.house, web_app: app(l, '') }],
    [{ text: t.empty, web_app: app(l, 'bosh-joy.html') }],
    [{ text: t.usta, web_app: app(l, 'ustalar.html') }, { text: t.biz, web_app: app(l, 'biznes.html') }],
    [{ text: t.admin, url: ADMIN }, { text: t.lang, callback_data: 'lang:' + (l === 'ru' ? 'uz' : 'ru') }],
  ] };
}
const phoneKb = l => ({ keyboard: [[{ text: T[l].phoneBtn, request_contact: true }]], resize_keyboard: true, one_time_keyboard: true });

async function tg(env, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  return r.json().catch(() => ({}));
}
async function secretOf(token) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('uychizma:' + token));
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 48);
}

/* ---------- Firestore (REST) ---------- */
const fsVal = v => typeof v === 'number' ? { integerValue: String(Math.round(v)) } : { stringValue: String(v == null ? '' : v).slice(0, 200) };
async function fsCreate(col, id, data) {
  const fields = {}; for (const k in data) fields[k] = fsVal(data[k]);
  const r = await fetch(`${FS}/${col}?documentId=${encodeURIComponent(id)}&key=${FB_KEY}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fields }) });
  return r.status; // 200 ok, 409 bor edi
}
async function hasPhone(id) {
  try { const r = await fetch(`${FS}/tgok/${encodeURIComponent(id)}?key=${FB_KEY}`); return r.status === 200; } catch (_) { return false; }
}

/* ---------- AI (bepul: Pollinations, zaxira: Cloudflare Workers AI) ---------- */
async function aiReply(env, l, user, text) {
  const messages = [
    { role: 'system', content: SYSTEM(l) },
    { role: 'user', content: (user && user.first_name ? `[Mijoz ismi: ${user.first_name}] ` : '') + String(text).slice(0, 1500) },
  ];
  try {
    const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 25000);
    const r = await fetch('https://text.pollinations.ai/openai', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: 'openai', messages, temperature: 0.7, private: true }), signal: ctl.signal });
    clearTimeout(tm);
    if (r.ok) { const j = await r.json(); const a = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content; if (a && a.trim()) return a.trim(); }
  } catch (_) {}
  try { if (env.AI) { const o = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages, max_tokens: 400 }); if (o && o.response) return o.response.trim(); } } catch (_) {}
  return '';
}
const clean = s => String(s).replace(/\*\*(.+?)\*\*/g, '$1').replace(/^#+\s*/gm, '').slice(0, 3500);

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (!env.BOT_TOKEN) return new Response('BOT_TOKEN sozlanmagan (Settings → Variables and Secrets → Secret: BOT_TOKEN)', { status: 500 });
    const secret = await secretOf(env.BOT_TOKEN);

    if (url.pathname === '/setup') {
      const hook = url.origin + '/hook';
      const a = await tg(env, 'setWebhook', { url: hook, secret_token: secret, allowed_updates: ['message', 'callback_query'], drop_pending_updates: true });
      await tg(env, 'setMyCommands', { commands: [ { command: 'start', description: 'Bosh menyu' }, { command: 'uy', description: 'Uy loyihasi' }, { command: 'joy', description: "Bo'sh joy dizayni" }, { command: 'usta', description: 'Usta topish' }, { command: 'til', description: 'Til / Язык' } ] });
      await tg(env, 'setMyCommands', { language_code: 'ru', commands: [ { command: 'start', description: 'Главное меню' }, { command: 'uy', description: 'Проект дома' }, { command: 'joy', description: 'Дизайн помещения' }, { command: 'usta', description: 'Найти мастера' }, { command: 'til', description: 'Язык / Til' } ] });
      await tg(env, 'setChatMenuButton', { menu_button: { type: 'web_app', text: 'UyChizma', web_app: { url: SITE } } });
      await tg(env, 'setMyDescription', { description: "Uyingizni qurishdan oldin 3D-da ko'ring: reja, narx, smeta. Bo'sh xonani AI bilan jihozlash. Ustalar. Savollarga darhol javob beramiz." });
      const me = await tg(env, 'getMe', {});
      return new Response(a.ok ? `✅ Bot ulandi: @${me.result && me.result.username}\nWebhook: ${hook}` : '❌ Xato: ' + JSON.stringify(a), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }

    if (url.pathname === '/hook' && req.method === 'POST') {
      if (req.headers.get('X-Telegram-Bot-Api-Secret-Token') !== secret) return new Response('forbidden', { status: 403 });
      const u = await req.json().catch(() => ({}));
      const work = handle(env, u).catch(e => console.log('hook err', e && e.stack || e));
      if (ctx && ctx.waitUntil) ctx.waitUntil(work); else await work;
      return new Response('ok');
    }
    return new Response('UyChizma bot ishlayapti (v2: AI + telefon). Sozlash: /setup');
  },
};

async function handle(env, u) {
  if (u.callback_query) {
    const q = u.callback_query, l = (q.data || '').split(':')[1] === 'ru' ? 'ru' : 'uz';
    await tg(env, 'answerCallbackQuery', { callback_query_id: q.id });
    await tg(env, 'sendMessage', { chat_id: q.message.chat.id, text: T[l].hi(q.from.first_name), parse_mode: 'HTML', reply_markup: kb(l) });
    return;
  }
  const m = u.message; if (!m || !m.from || (m.chat && m.chat.type !== 'private')) return;
  const txt = (m.text || '').trim();
  const l = isRuText(txt) ? 'ru' : langOf(m.from), t = T[l], chat = m.chat.id, uid = String(m.from.id);
  const one = (text, btn, path) => tg(env, 'sendMessage', { chat_id: chat, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: btn, web_app: app(l, path) }]] } });

  // 📱 Telefon raqami keldi
  if (m.contact) {
    if (String(m.contact.user_id || '') !== uid) { await tg(env, 'sendMessage', { chat_id: chat, text: t.notYours, reply_markup: phoneKb(l) }); return; }
    let phone = String(m.contact.phone_number || '').replace(/[^\d+]/g, ''); if (phone && phone[0] !== '+') phone = '+' + phone;
    await fsCreate('botusers', uid, { phone, first: m.from.first_name || '', last: m.from.last_name || '', username: m.from.username || '', lang: l, src: 'bot', at: Date.now() });
    await fsCreate('tgok', uid, { at: Date.now() });
    await tg(env, 'sendMessage', { chat_id: chat, text: t.thanks(m.from.first_name), reply_markup: { remove_keyboard: true } });
    await tg(env, 'sendMessage', { chat_id: chat, text: t.hi(''), parse_mode: 'HTML', reply_markup: kb(l) });
    if (env.ADMIN_CHAT_ID) await tg(env, 'sendMessage', { chat_id: env.ADMIN_CHAT_ID, text: `📱 Yangi raqam (bot): ${phone}\n${m.from.first_name || ''} ${m.from.last_name || ''} ${m.from.username ? '@' + m.from.username : ''}` });
    return;
  }

  if (/^\/start\b/.test(txt)) {
    await tg(env, 'sendMessage', { chat_id: chat, text: t.hi(m.from.first_name), parse_mode: 'HTML', reply_markup: kb(l) });
    if (!(await hasPhone(uid))) await tg(env, 'sendMessage', { chat_id: chat, text: t.askPhone, parse_mode: 'HTML', reply_markup: phoneKb(l) });
    return;
  }
  if (/^\/uy\b/.test(txt)) return one(t.house, t.menu + ' →', '');
  if (/^\/joy\b/.test(txt)) return one(t.empty, t.menu + ' →', 'bosh-joy.html');
  if (/^\/usta\b/.test(txt)) return one(t.usta, t.menu + ' →', 'ustalar.html');
  if (/^\/til\b/.test(txt)) { const o = l === 'ru' ? 'uz' : 'ru'; return tg(env, 'sendMessage', { chat_id: chat, text: T[o].hi(m.from.first_name), parse_mode: 'HTML', reply_markup: kb(o) }); }
  if (/^\/help\b/.test(txt)) return tg(env, 'sendMessage', { chat_id: chat, text: t.help });
  if (m.photo || m.document) return one(t.photo, t.house, '');
  if (!txt) return;

  // 💬 Oddiy savol — AI odamdek javob beradi
  await tg(env, 'sendChatAction', { chat_id: chat, action: 'typing' });
  const [ans, ok] = await Promise.all([aiReply(env, l, m.from, txt), hasPhone(uid)]);
  await tg(env, 'sendMessage', { chat_id: chat, text: ans ? clean(ans) : t.aiFail, reply_markup: ok ? undefined : phoneKb(l) });
}
