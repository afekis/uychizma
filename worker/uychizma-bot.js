// UyChizma Telegram bot — Cloudflare Worker.
// Kerak: Secret BOT_TOKEN (BotFather bergan token). Boshqa sozlama shart emas.
// O'rnatgandan keyin bir marta oching: https://<worker-manzili>/setup
const SITE = 'https://afekis.github.io/uychizma/';
const ADMIN = 'https://t.me/amirhonsh';

const T = {
  uz: {
    hi: n => `Assalomu alaykum${n ? ', ' + n : ''}! 👋\n\n<b>UyChizma</b> — uyingizni qurishdan oldin ko'ring:\n\n🏠 <b>Uy loyihasi</b> — yer o'lchamini yozing yoki chizmangizni yuklang: 1 daqiqada reja, 3D, narx va smeta.\n🛋 <b>Bo'sh joy dizayni</b> — bo'sh xona yoki hovli rasmini oling, AI uni jihozlab beradi.\n👷 <b>Usta topish</b> — uyingizni qurib beradigan ustalar.\n\nPastdagi tugmani bosing 👇`,
    house: '🏠 Uy loyihasi', empty: "🛋 Bo'sh joy dizayni", usta: '👷 Usta topish', biz: '🏢 Firmalar uchun', admin: '✈️ Admin bilan bog\'lanish', lang: '🇷🇺 Русский',
    photo: "📐 Chizma yoki rasmni saytning o'zida yuklasangiz, AI uni o'qib uyni chizadi. Pastdagi tugmani bosing:",
    help: "Buyruqlar:\n/start — bosh menyu\n/uy — uy loyihasi\n/joy — bo'sh joy dizayni\n/usta — usta topish\n/til — tilni almashtirish",
    menu: 'Ochish',
  },
  ru: {
    hi: n => `Здравствуйте${n ? ', ' + n : ''}! 👋\n\n<b>UyChizma</b> — увидьте свой дом до начала стройки:\n\n🏠 <b>Проект дома</b> — введите размеры участка или загрузите чертёж: за 1 минуту план, 3D, цена и смета.\n🛋 <b>Дизайн пустого помещения</b> — сфотографируйте пустую комнату или двор, ИИ её обставит.\n👷 <b>Найти мастера</b> — мастера, которые построят ваш дом.\n\nНажмите кнопку ниже 👇`,
    house: '🏠 Проект дома', empty: '🛋 Дизайн помещения', usta: '👷 Найти мастера', biz: '🏢 Для компаний', admin: '✈️ Связаться с админом', lang: "🇺🇿 O'zbekcha",
    photo: '📐 Загрузите чертёж или фото прямо на сайте — ИИ прочитает его и нарисует дом. Нажмите кнопку ниже:',
    help: 'Команды:\n/start — главное меню\n/uy — проект дома\n/joy — дизайн помещения\n/usta — найти мастера\n/til — сменить язык',
    menu: 'Открыть',
  },
};

const langOf = (u, kv) => (kv && (kv === 'ru' || kv === 'uz')) ? kv : (/^(ru|kk|ky|be|uk)/.test((u && u.language_code) || '') ? 'ru' : 'uz');
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

async function tg(env, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  return r.json().catch(() => ({}));
}
async function secretOf(token) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('uychizma:' + token));
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 48);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!env.BOT_TOKEN) return new Response('BOT_TOKEN sozlanmagan (Settings → Variables and Secrets → Secret: BOT_TOKEN)', { status: 500 });
    const secret = await secretOf(env.BOT_TOKEN);

    if (url.pathname === '/setup') {
      const hook = url.origin + '/hook';
      const a = await tg(env, 'setWebhook', { url: hook, secret_token: secret, allowed_updates: ['message', 'callback_query'], drop_pending_updates: true });
      await tg(env, 'setMyCommands', { commands: [
        { command: 'start', description: 'Bosh menyu' }, { command: 'uy', description: 'Uy loyihasi' }, { command: 'joy', description: "Bo'sh joy dizayni" }, { command: 'usta', description: 'Usta topish' }, { command: 'til', description: 'Til / Язык' } ] });
      await tg(env, 'setMyCommands', { language_code: 'ru', commands: [
        { command: 'start', description: 'Главное меню' }, { command: 'uy', description: 'Проект дома' }, { command: 'joy', description: 'Дизайн помещения' }, { command: 'usta', description: 'Найти мастера' }, { command: 'til', description: 'Язык / Til' } ] });
      await tg(env, 'setChatMenuButton', { menu_button: { type: 'web_app', text: 'UyChizma', web_app: { url: SITE } } });
      await tg(env, 'setMyDescription', { description: "Uyingizni qurishdan oldin 3D-da ko'ring: reja, narx, smeta. Bo'sh xonani AI bilan jihozlash. Ustalar." });
      const me = await tg(env, 'getMe', {});
      return new Response(a.ok ? `✅ Bot ulandi: @${me.result && me.result.username}\nWebhook: ${hook}` : '❌ Xato: ' + JSON.stringify(a), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }

    if (url.pathname === '/hook' && req.method === 'POST') {
      if (req.headers.get('X-Telegram-Bot-Api-Secret-Token') !== secret) return new Response('forbidden', { status: 403 });
      const u = await req.json().catch(() => ({}));
      try {
        if (u.callback_query) {
          const q = u.callback_query, l = (q.data || '').split(':')[1] === 'ru' ? 'ru' : 'uz';
          await tg(env, 'answerCallbackQuery', { callback_query_id: q.id });
          await tg(env, 'sendMessage', { chat_id: q.message.chat.id, text: T[l].hi(q.from.first_name), parse_mode: 'HTML', reply_markup: kb(l) });
          return new Response('ok');
        }
        const m = u.message; if (!m) return new Response('ok');
        const l = langOf(m.from), t = T[l], chat = m.chat.id, txt = (m.text || '').trim();
        const one = (text, btn, path) => tg(env, 'sendMessage', { chat_id: chat, text, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: btn, web_app: app(l, path) }]] } });
        if (/^\/uy\b/.test(txt)) await one(t.house, t.menu + ' →', '');
        else if (/^\/joy\b/.test(txt)) await one(t.empty, t.menu + ' →', 'bosh-joy.html');
        else if (/^\/usta\b/.test(txt)) await one(t.usta, t.menu + ' →', 'ustalar.html');
        else if (/^\/til\b/.test(txt)) { const o = l === 'ru' ? 'uz' : 'ru'; await tg(env, 'sendMessage', { chat_id: chat, text: T[o].hi(m.from.first_name), parse_mode: 'HTML', reply_markup: kb(o) }); }
        else if (/^\/help\b/.test(txt)) await tg(env, 'sendMessage', { chat_id: chat, text: t.help });
        else if (m.photo || m.document) await one(t.photo, t.house, '');
        else await tg(env, 'sendMessage', { chat_id: chat, text: t.hi(m.from.first_name), parse_mode: 'HTML', reply_markup: kb(l) });
      } catch (e) { /* Telegram qayta yubormasligi uchun baribir 200 */ }
      return new Response('ok');
    }
    return new Response('UyChizma bot ishlayapti. Sozlash: /setup');
  },
};
