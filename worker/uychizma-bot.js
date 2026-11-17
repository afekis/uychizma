// UyChizma Telegram bot — Cloudflare Worker (v3)
// Kerak: Secret BOT_TOKEN. Ixtiyoriy: ADMIN_CHAT_ID (yangi raqamlar shu chatga ham keladi).
// O'rnatgandan keyin bir marta oching: https://<worker-manzili>/setup
// Oqim: salom → telefon raqami → til (uz/ru) → pastki menyu. Savollarga AI javob beradi. Yangi mijoz ma'lumoti ADMIN_CHAT_ID ga yuboriladi va admin panel → 🤖 Bot'da saqlanadi.
// Admin ID: botga /myid yozing.
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
    ready: "Tayyor! ✅ Pastdagi menyudan kerakli bo'limni tanlang yoki savolingizni shu yerga yozing 👇",
    m: { house: '🏠 Uy loyihasi', empty: "🛋 Bo'sh joy", usta: '👷 Usta topish', biz: '🏢 Firmalar uchun', price: '💰 Narxlar', ask: '❓ Savol berish', admin: '✈️ Admin', lang: '🌐 Tilni almashtirish' },
    price: "💰 <b>Narxlar</b>\n\n🎁 Birinchi uy loyihasi — <b>bepul</b>\n⭐ Premium — <b>25 000 so'm</b>, 2 ta uy loyihasi (reja, 3D, smeta, PDF). Yoqmasa pul qaytariladi.\n👥 2 ta do'stingiz ro'yxatdan o'tsa — 1 ta uy bepul.\n\n🏢 Firmalar uchun (oyiga): Start 490 000 · Biznes 700 000 · Korporativ 1 200 000 so'm",
    askQ: "Savolingizni yozing — darhol javob beraman 🙂",
    adminTxt: "Admin bilan bog'lanish: @amirhonsh",
    open: n => `${n} — ochish uchun pastdagi tugmani bosing 👇`,
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
    ready: 'Готово! ✅ Выберите раздел в меню ниже или напишите свой вопрос сюда 👇',
    m: { house: '🏠 Проект дома', empty: '🛋 Пустое помещение', usta: '👷 Найти мастера', biz: '🏢 Для компаний', price: '💰 Цены', ask: '❓ Задать вопрос', admin: '✈️ Админ', lang: '🌐 Сменить язык' },
    price: "💰 <b>Цены</b>\n\n🎁 Первый проект дома — <b>бесплатно</b>\n⭐ Премиум — <b>25 000 сум</b>, 2 проекта дома (план, 3D, смета, PDF). Не понравится — вернём деньги.\n👥 Пригласите 2 друзей (они зарегистрируются) — 1 дом бесплатно.\n\n🏢 Для компаний (в месяц): Start 490 000 · Biznes 700 000 · Korporativ 1 200 000 сум",
    askQ: 'Напишите ваш вопрос — сразу отвечу 🙂',
    adminTxt: 'Связаться с админом: @amirhonsh',
    open: n => `${n} — нажмите кнопку ниже, чтобы открыть 👇`,
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
const WELCOME = n => `Assalomu alaykum${n ? ', ' + n : ''}! 👋 <b>UyChizma</b> botiga xush kelibsiz.\nЗдравствуйте! Добро пожаловать в бот <b>UyChizma</b>.\n\n📱 Davom etish uchun telefon raqamingizni yuboring — pastdagi tugmani bosing.\n📱 Чтобы продолжить, отправьте номер телефона — кнопка ниже.`;
const phoneKb = () => ({ keyboard: [[{ text: '📱 Raqamni yuborish / Отправить номер', request_contact: true }]], resize_keyboard: true, one_time_keyboard: true });
const LANG_ASK = "🌐 Qaysi tilda gaplashamiz?\nНа каком языке будем общаться?";
const langKb = (phone, src) => ({ inline_keyboard: [[{ text: "🇺🇿 O'zbekcha", callback_data: ['L', 'uz', phone || '', src || ''].join('|').slice(0, 64) }, { text: '🇷🇺 Русский', callback_data: ['L', 'ru', phone || '', src || ''].join('|').slice(0, 64) }]] });
/* Pastki doimiy menyu: bo'limlar Telegram ichida ochiladi */
function menuKb(l) {
  const m = T[l].m;
  return { keyboard: [
    [{ text: m.house, web_app: app(l, '') }, { text: m.empty, web_app: app(l, 'bosh-joy.html') }],
    [{ text: m.usta, web_app: app(l, 'ustalar.html') }, { text: m.biz, web_app: app(l, 'biznes.html') }],
    [{ text: m.price }, { text: m.ask }],
    [{ text: m.admin }, { text: m.lang }],
  ], resize_keyboard: true, is_persistent: true };
}

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
/* Foydalanuvchi holati (ommaviy, shaxsiy ma'lumotsiz): ro'yxatdan o'tganmi va qaysi til */
async function userState(id) {
  try { const r = await fetch(`${FS}/tgok/${encodeURIComponent(id)}?key=${FB_KEY}`); if (r.status !== 200) return { ok: false }; const j = await r.json(); const f = j.fields || {}; return { ok: true, lang: (f.lang && f.lang.stringValue) || '' }; } catch (_) { return { ok: false }; }
}
async function setState(id, lang) {
  const body = { fields: { at: fsVal(Date.now()), lang: fsVal(lang) } };
  await fetch(`${FS}/tgok/${encodeURIComponent(id)}?updateMask.fieldPaths=at&updateMask.fieldPaths=lang&key=${FB_KEY}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
}
const esc = s => String(s || '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
async function notifyAdmin(env, text) { if (env.ADMIN_CHAT_ID) { try { await tg(env, 'sendMessage', { chat_id: env.ADMIN_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true }); } catch (_) {} } }

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
      await tg(env, 'setMyCommands', { commands: [ { command: 'start', description: 'Boshlash / Начать' }, { command: 'menu', description: 'Menyu / Меню' }, { command: 'til', description: 'Til / Язык' } ] });
      await tg(env, 'setChatMenuButton', { menu_button: { type: 'web_app', text: 'UyChizma', web_app: { url: SITE } } });
      await tg(env, 'setMyDescription', { description: "Uyingizni qurishdan oldin 3D-da ko'ring: reja, narx, smeta. Bo'sh xonani AI bilan jihozlash. Ustalar. Savollarga darhol javob beramiz." });
      const me = await tg(env, 'getMe', {});
      return new Response((a.ok ? `✅ Bot ulandi: @${me.result && me.result.username}\nWebhook: ${hook}` : '❌ Xato: ' + JSON.stringify(a)) + `\nAdmin xabarlari: ${env.ADMIN_CHAT_ID ? 'yoqilgan' : "yo'q (ADMIN_CHAT_ID qo'ying)"}`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }

    if (url.pathname === '/hook' && req.method === 'POST') {
      if (req.headers.get('X-Telegram-Bot-Api-Secret-Token') !== secret) return new Response('forbidden', { status: 403 });
      const u = await req.json().catch(() => ({}));
      const work = handle(env, u).catch(e => console.log('hook err', e && e.stack || e));
      if (ctx && ctx.waitUntil) ctx.waitUntil(work); else await work;
      return new Response('ok');
    }
    return new Response('UyChizma bot ishlayapti (v3: salom → telefon → til → menyu). Sozlash: /setup');
  },
};

async function handle(env, u) {
  /* Til tanlandi: L|uz|+998...|src */
  if (u.callback_query) {
    const q = u.callback_query, p = (q.data || '').split('|'), chat = q.message.chat.id, uid = String(q.from.id);
    await tg(env, 'answerCallbackQuery', { callback_query_id: q.id });
    if (p[0] !== 'L') return;
    const l = p[1] === 'ru' ? 'ru' : 'uz', phone = p[2] || '', src = p[3] || '';
    const st = await userState(uid);
    await setState(uid, l);
    try { await tg(env, 'editMessageReplyMarkup', { chat_id: chat, message_id: q.message.message_id, reply_markup: { inline_keyboard: [] } }); } catch (_) {}
    if (phone) {
      const code = await fsCreate('botusers', uid, { phone, first: q.from.first_name || '', last: q.from.last_name || '', username: q.from.username || '', lang: l, src: src || 'bot', at: Date.now() });
      if (!st.ok || code === 200) await notifyAdmin(env, `🆕 <b>Yangi mijoz (bot)</b>\n👤 ${esc(q.from.first_name)} ${esc(q.from.last_name)}${q.from.username ? ' · @' + esc(q.from.username) : ''}\n📱 ${esc(phone)}\n🌐 ${l === 'ru' ? 'Русский' : "O'zbekcha"}${src ? '\n🔗 Qayerdan: ' + esc(src) : ''}\n🆔 <code>${uid}</code>`);
    }
    await tg(env, 'sendMessage', { chat_id: chat, text: T[l].ready, reply_markup: menuKb(l) });
    return;
  }

  const m = u.message; if (!m || !m.from || (m.chat && m.chat.type !== 'private')) return;
  const txt = (m.text || '').trim(), chat = m.chat.id, uid = String(m.from.id);

  if (/^\/myid\b/.test(txt)) return tg(env, 'sendMessage', { chat_id: chat, text: `Sizning chat ID: <code>${chat}</code>`, parse_mode: 'HTML' });

  // 1) Telefon raqami keldi → til so'raladi
  if (m.contact) {
    if (String(m.contact.user_id || '') !== uid) { await tg(env, 'sendMessage', { chat_id: chat, text: "Iltimos, o'z raqamingizni tugma orqali yuboring 🙏 / Отправьте свой номер кнопкой 🙏", reply_markup: phoneKb() }); return; }
    let phone = String(m.contact.phone_number || '').replace(/[^\d+]/g, ''); if (phone && phone[0] !== '+') phone = '+' + phone;
    await tg(env, 'sendMessage', { chat_id: chat, text: '✅ Rahmat! / Спасибо!', reply_markup: { remove_keyboard: true } });
    await tg(env, 'sendMessage', { chat_id: chat, text: LANG_ASK, reply_markup: langKb(phone, '') });
    return;
  }

  const st = await userState(uid);
  // 0) Salom → telefon
  if (/^\/start\b/.test(txt) || !st.ok) {
    if (!st.ok) { await tg(env, 'sendMessage', { chat_id: chat, text: WELCOME(m.from.first_name), parse_mode: 'HTML', reply_markup: phoneKb() }); return; }
  }
  const l = st.lang === 'ru' ? 'ru' : (st.lang === 'uz' ? 'uz' : langOf(m.from)), t = T[l], M = t.m;
  if (!st.lang) { await tg(env, 'sendMessage', { chat_id: chat, text: LANG_ASK, reply_markup: langKb('', '') }); return; }
  const one = (text, path) => tg(env, 'sendMessage', { chat_id: chat, text: t.open(text), reply_markup: { inline_keyboard: [[{ text: text, web_app: app(l, path) }]] } });

  if (/^\/start\b/.test(txt) || /^\/menu\b/.test(txt)) return tg(env, 'sendMessage', { chat_id: chat, text: t.hi(m.from.first_name), parse_mode: 'HTML', reply_markup: menuKb(l) });
  if (/^\/til\b/.test(txt) || txt === M.lang || txt === T.uz.m.lang || txt === T.ru.m.lang) return tg(env, 'sendMessage', { chat_id: chat, text: LANG_ASK, reply_markup: langKb('', '') });
  if (txt === M.price || txt === T.uz.m.price || txt === T.ru.m.price) return tg(env, 'sendMessage', { chat_id: chat, text: t.price, parse_mode: 'HTML', reply_markup: menuKb(l) });
  if (txt === M.ask || txt === T.uz.m.ask || txt === T.ru.m.ask) return tg(env, 'sendMessage', { chat_id: chat, text: t.askQ });
  if (txt === M.admin || txt === T.uz.m.admin || txt === T.ru.m.admin) return tg(env, 'sendMessage', { chat_id: chat, text: t.adminTxt, reply_markup: { inline_keyboard: [[{ text: '✈️ @amirhonsh', url: ADMIN }]] } });
  if (/^\/uy\b/.test(txt) || txt === M.house) return one(M.house, '');
  if (/^\/joy\b/.test(txt) || txt === M.empty) return one(M.empty, 'bosh-joy.html');
  if (/^\/usta\b/.test(txt) || txt === M.usta) return one(M.usta, 'ustalar.html');
  if (txt === M.biz) return one(M.biz, 'biznes.html');
  if (/^\/help\b/.test(txt)) return tg(env, 'sendMessage', { chat_id: chat, text: t.help, reply_markup: menuKb(l) });
  if (m.photo || m.document) return one(M.house, '');
  if (!txt) return;

  // 💬 Savol — AI odamdek javob beradi
  await tg(env, 'sendChatAction', { chat_id: chat, action: 'typing' });
  const ans = await aiReply(env, l, m.from, txt);
  await tg(env, 'sendMessage', { chat_id: chat, text: ans ? clean(ans) : t.aiFail, reply_markup: menuKb(l) });
}
