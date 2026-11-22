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
    m: { house: '🏠 Uy loyihasi', empty: "🛋 Bo'sh joy", usta: '👷 Usta topish', biz: '🏢 Firmalar uchun', price: '💰 Narxlar', ask: '❓ Savol berish', admin: '✈️ Admin', lang: '🌐 Tilni almashtirish', app: '📲 Ilovani yuklab olish' },
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
    m: { house: '🏠 Проект дома', empty: '🛋 Пустое помещение', usta: '👷 Найти мастера', biz: '🏢 Для компаний', price: '💰 Цены', ask: '❓ Задать вопрос', admin: '✈️ Админ', lang: '🌐 Сменить язык', app: '📲 Скачать приложение' },
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
    [{ text: m.app }],
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
const AILOG = [];
async function tfetch(url, opt, ms) { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms); try { return await fetch(url, { ...(opt || {}), signal: c.signal }); } finally { clearTimeout(t); } }
async function aiReply(env, l, user, text) {
  AILOG.length = 0;
  const sys = SYSTEM(l), q = (user && user.first_name ? `[Mijoz ismi: ${user.first_name}] ` : '') + String(text).slice(0, 1200);
  const messages = [{ role: 'system', content: sys }, { role: 'user', content: q }];
  // 1) Pollinations (OpenAI uslubi)
  try {
    const r = await tfetch('https://text.pollinations.ai/openai', { method: 'POST', headers: { 'content-type': 'application/json', 'user-agent': 'Mozilla/5.0 UyChizmaBot', referer: 'https://afekis.github.io/uychizma/' }, body: JSON.stringify({ model: 'openai', messages, referrer: 'uychizma', private: true }) }, 20000);
    AILOG.push('p1 ' + r.status);
    if (r.ok) { const j = await r.json(); const a = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content; if (a && a.trim()) return a.trim(); }
  } catch (e) { AILOG.push('p1 err ' + (e && e.message)); }
  // 2) Pollinations (oddiy GET)
  try {
    const u = 'https://text.pollinations.ai/' + encodeURIComponent(q) + '?model=openai&private=true&referrer=uychizma&system=' + encodeURIComponent(sys.slice(0, 2500));
    const r = await tfetch(u, { headers: { 'user-agent': 'Mozilla/5.0 UyChizmaBot', referer: 'https://afekis.github.io/uychizma/' } }, 20000);
    AILOG.push('p2 ' + r.status);
    if (r.ok) { const a = (await r.text()).trim(); if (a && a[0] !== '{') return a; }
  } catch (e) { AILOG.push('p2 err ' + (e && e.message)); }
  // 3) Cloudflare Workers AI (binding: AI) — bir nechta model, birinchisi ishlamasa keyingisi
  if (env.AI) {
    for (const mdl of ['@cf/meta/llama-3.3-70b-instruct-fp8-fast', '@cf/mistralai/mistral-small-3.1-24b-instruct', '@cf/meta/llama-3.1-8b-instruct-fp8']) {
      try { const o = await env.AI.run(mdl, { messages, max_tokens: 500 }); const a = o && (o.response || (o.choices && o.choices[0] && o.choices[0].message && o.choices[0].message.content)); AILOG.push(mdl.split('/').pop() + (a ? ' ok' : ' bo\'sh')); if (a && String(a).trim()) return String(a).trim(); }
      catch (e) { AILOG.push(mdl.split('/').pop() + ' err ' + String(e && e.message).slice(0, 80)); }
    }
  } else AILOG.push('cf none');
  // 4) Oddiy javob (AI ishlamasa ham bot jim qolmasin)
  return faq(l, text);
  return '';
}
function faq(l, text) {
  const t = String(text).toLowerCase(), ru = l === 'ru';
  if (/narx|qancha|necha pul|pul|to'lov|tolov|цен|стоим|сколько|оплат/.test(t)) return ru ? "Первый проект дома — бесплатно 🎁 Премиум — 25 000 сум за 2 проекта (план, 3D, смета, PDF). Для компаний: Start 490 000, Biznes 700 000, Korporativ 1 200 000 сум в месяц. Подробнее — кнопка «💰 Цены» внизу." : "Birinchi uy loyihasi — bepul 🎁 Premium — 25 000 so'm, 2 ta uy loyihasi (reja, 3D, smeta, PDF). Firmalar uchun: Start 490 000, Biznes 700 000, Korporativ 1 200 000 so'm/oy. Batafsil — pastdagi «💰 Narxlar» tugmasi.";
  if (/usta|мастер|quruvchi|строител/.test(t)) return ru ? "Мастеров можно найти по городу и виду работ — нажмите «👷 Найти мастера» внизу 👇" : "Ustalarni shahar va ish turi bo'yicha topishingiz mumkin — pastdagi «👷 Usta topish» tugmasini bosing 👇";
  if (/xona|bo'sh|bosh joy|mebel|интерьер|комнат|мебел/.test(t)) return ru ? "Загрузите фото пустой комнаты — AI обставит её и покажет примерные цены. Кнопка «🛋 Пустое помещение» внизу 👇" : "Bo'sh xona rasmini yuklang — AI uni jihozlab, taxminiy narxlarni ko'rsatadi. Pastdagi «🛋 Bo'sh joy» tugmasi 👇";
  if (/uy|loyiha|reja|chizma|3d|дом|проект|план/.test(t)) return ru ? "Введите размеры участка или загрузите чертёж — за 1 минуту получите план дома, 3D, примерную стоимость и смету. Нажмите «🏠 Проект дома» внизу 👇" : "Yer o'lchamini kiriting yoki chizma yuklang — 1 daqiqada uy rejasi, 3D ko'rinish, taxminiy narx va smeta chiqadi. Pastdagi «🏠 Uy loyihasi» tugmasini bosing 👇";
  return ru ? "Спасибо за вопрос! 🙂 Выберите нужный раздел в меню ниже, а если нужен живой ответ — напишите админу: @amirhonsh" : "Savolingiz uchun rahmat! 🙂 Pastdagi menyudan kerakli bo'limni tanlang, jonli javob kerak bo'lsa — adminga yozing: @amirhonsh";
}
const clean = s => String(s).replace(/\*\*(.+?)\*\*/g, '$1').replace(/^#+\s*/gm, '').slice(0, 3500);


/* ===== AVTO-TO'LOV: noyob summa + bank SMS (Android "SMS to URL Forwarder") ===== */
const PAY_ORIGINS = [/^https?:\/\/(www\.)?uychzma\.uz$/, /^https:\/\/afekis\.github\.io$/, /^https?:\/\/localhost(:\d+)?$/];
function cors(req) { const o = req.headers.get('Origin') || ''; return { 'Access-Control-Allow-Origin': PAY_ORIGINS.some(r => r.test(o)) ? o : 'https://uychzma.uz', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' }; }
const J = (req, o, st) => new Response(JSON.stringify(o), { status: st || 200, headers: { ...cors(req), 'content-type': 'application/json' } });
async function smsKey(env) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('sms:' + env.BOT_TOKEN)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32); }
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
/* SMS matnidan kirim summasini olish: "Kartaga o'tkazma: ... Miqdor:25037.00 UZS" */
function parseSms(t) { t = String(t || ''); const inc = /kartaga\s*o.?tkazma|popolnenie|пополнение|зачисление|kirim|postuplenie/i.test(t); if (!inc || /kartadan\s*chiqim|списание|oplata|оплата/i.test(t)) return 0;
  const m = t.match(/(?:miqdor|summa|сумма|amount)\s*[:=]?\s*([\d\s]+(?:[.,]\d{1,2})?)/i) || t.match(/([\d][\d\s]{2,}(?:[.,]\d{2})?)\s*(?:UZS|so.?m|сум)/i); if (!m) return 0; return Math.round(parseFloat(m[1].replace(/\s/g, '').replace(',', '.'))) || 0; }
async function payRoute(req, env, url) {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) });
  if (!env.PAYKV) return J(req, { ok: false, error: 'no_kv' }, 500);
  if (url.pathname === '/pay/new' && req.method === 'POST') {
    const b = await req.json().catch(() => ({})); const base = Math.round(+b.base || 0), cid = String(b.cid || '').slice(0, 40);
    if (!(base >= 1000 && base <= 10000000) || !cid) return J(req, { ok: false, error: 'bad' }, 400);
    for (let i = 0; i < 25; i++) { const amount = base + 1 + Math.floor(Math.random() * 299); if (await env.PAYKV.get('amt:' + amount)) continue;
      const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16), o = { id, cid, amount, at: Date.now(), status: 'wait' };
      await env.PAYKV.put('amt:' + amount, id, { expirationTtl: 86400 }); await env.PAYKV.put('ord:' + id, JSON.stringify(o), { expirationTtl: 3 * 86400 });
      return J(req, { ok: true, id, amount }); }
    return J(req, { ok: false, error: 'busy' }, 503);
  }
  if (url.pathname === '/pay/st') { const o = JSON.parse(await env.PAYKV.get('ord:' + String(url.searchParams.get('id') || '').slice(0, 20)) || 'null'); return J(req, o ? { ok: true, status: o.status, amount: o.amount } : { ok: false, status: 'none' }); }
  if (url.pathname === '/sms' && req.method === 'POST') {
    if (url.searchParams.get('k') !== await smsKey(env)) return new Response('forbidden', { status: 403 });
    const raw = await req.text(); let text = raw; try { const j = JSON.parse(raw); text = j.text || j.message || j.body || raw; } catch (_) { try { const f = new URLSearchParams(raw); text = f.get('text') || f.get('message') || raw; } catch (_) {} }
    const sum = parseSms(text); if (!sum) return new Response('skip');
    const id = await env.PAYKV.get('amt:' + sum); const o = id ? JSON.parse(await env.PAYKV.get('ord:' + id) || 'null') : null;
    if (o && o.status === 'wait') { o.status = 'paid'; o.paidAt = Date.now(); await env.PAYKV.put('ord:' + id, JSON.stringify(o), { expirationTtl: 3 * 86400 }); await env.PAYKV.delete('amt:' + sum); await env.PAYKV.put('done:' + sum, '1', { expirationTtl: 3600 });
      await notifyAdmin(env, `💳 <b>Avtomatik to'lov</b>: ${fmt(sum)} so'm — Premium o'zi ochildi ✅\n🆔 <code>${o.cid}</code>`); return new Response('paid'); }
    if (await env.PAYKV.get('done:' + sum)) return new Response('dup');
    await notifyAdmin(env, `💳 Kartaga <b>${fmt(sum)} so'm</b> tushdi — saytdagi buyurtma topilmadi (qo'lda tekshiring).`); return new Response('nomatch');
  }
  return J(req, { ok: false }, 404);
}
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (!env.BOT_TOKEN) return new Response('BOT_TOKEN sozlanmagan (Settings → Variables and Secrets → Secret: BOT_TOKEN)', { status: 500 });
    const secret = await secretOf(env.BOT_TOKEN);

    if (url.pathname.startsWith('/pay/') || url.pathname === '/sms') return payRoute(req, env, url);
    if (url.pathname === '/setup') {
      const hook = url.origin + '/hook';
      const a = await tg(env, 'setWebhook', { url: hook, secret_token: secret, allowed_updates: ['message', 'callback_query'], drop_pending_updates: true });
      await tg(env, 'setMyCommands', { commands: [ { command: 'start', description: 'Boshlash / Начать' }, { command: 'menu', description: 'Menyu / Меню' }, { command: 'til', description: 'Til / Язык' } ] });
      await tg(env, 'setChatMenuButton', { menu_button: { type: 'web_app', text: 'UyChizma', web_app: { url: SITE } } });
      await tg(env, 'setMyDescription', { description: "Uyingizni qurishdan oldin 3D-da ko'ring: reja, narx, smeta. Bo'sh xonani AI bilan jihozlash. Ustalar. Savollarga darhol javob beramiz." });
      const me = await tg(env, 'getMe', {});
      return new Response((a.ok ? `✅ Bot ulandi: @${me.result && me.result.username}\nWebhook: ${hook}` : '❌ Xato: ' + JSON.stringify(a)) + `\nAdmin xabarlari: ${env.ADMIN_CHAT_ID ? 'yoqilgan' : "yo'q (ADMIN_CHAT_ID qo'ying)"}`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }

    if (url.pathname === '/aitest') {
      const a = await aiReply(env, 'uz', { first_name: 'Test' }, url.searchParams.get('q') || 'Uy loyihasi qancha turadi?');
      return new Response((a || "(javob yo'q)") + '\n\n' + AILOG.join(' | '), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
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

  if (/^\/smsurl\b/.test(txt) && env.ADMIN_CHAT_ID && String(chat) === String(env.ADMIN_CHAT_ID)) return tg(env, 'sendMessage', { chat_id: chat, parse_mode: 'HTML', text: `📲 <b>SMS to URL Forwarder</b> sozlamasi\n\nSender: <code>5800</code>\nURL:\n<code>https://uychizma-bot.macbookmmacbook.workers.dev/sms?k=${await smsKey(env)}</code>\n\nBu havolani hech kimga bermang.` });
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
  if (/^\/app\b/.test(txt) || txt === T.uz.m.app || txt === T.ru.m.app) return tg(env, 'sendMessage', { chat_id: chat, text: l === 'ru' ? '📲 Приложение UyChizma для Android. Нажмите кнопку → скачайте файл → «Установить».\niPhone: откройте uychzma.uz в Safari → «Поделиться» → «На экран Домой».' : "📲 UyChizma ilovasi (Android). Tugmani bosing → faylni yuklab oling → «Установить».\niPhone: Safari'da uychzma.uz → «Ulashish» → «Ekranga qo'shish».", reply_markup: { inline_keyboard: [[{ text: '🤖 Android — yuklab olish', url: 'https://github.com/afekis/uychizma/releases/latest/download/UyChizma.apk' }]] } });
  if (/^\/help\b/.test(txt)) return tg(env, 'sendMessage', { chat_id: chat, text: t.help, reply_markup: menuKb(l) });
  if (m.photo || m.document) return one(M.house, '');
  if (!txt) return;

  // 💬 Savol — AI odamdek javob beradi
  await tg(env, 'sendChatAction', { chat_id: chat, action: 'typing' });
  const ans = await aiReply(env, l, m.from, txt);
  await tg(env, 'sendMessage', { chat_id: chat, text: ans ? clean(ans) : t.aiFail, reply_markup: menuKb(l) });
}
