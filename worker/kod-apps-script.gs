/* UyChizma — Gmail'ga tasdiqlash kodi (Google Apps Script web app)
   Amallar: send (kod yuborish), verify (ro'yxatdan o'tish kodi), mark (Gmail tasdiqlandi), reset (kod + yangi parol)
   Joylash: script.google.com → yangi loyiha → shu kod → Deploy → Web app (Execute as: Me, Who has access: Anyone) */
var PROJECT = 'uychizma';
var MAX_SEND = 5, MAX_TRY = 5, TTL = 600;

function doGet() { return out({ ok: true, service: 'UyChizma kod' }); }
function doPost(e) {
  var b = {};
  try { b = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (x) { return out({ ok: false, error: 'bad_json' }); }
  try { return out(handle(b)); } catch (err) { console.error(err); return out({ ok: false, error: 'server', detail: String(err).slice(0, 200) }); }
}
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function handle(b) {
  var email = String(b.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return { ok: false, error: 'bad_email' };
  var purpose = b.purpose === 'reset' ? 'reset' : 'reg';
  var cache = CacheService.getScriptCache();
  var ck = 'c_' + purpose + '_' + email, tk = 't_' + purpose + '_' + email;

  if (b.action === 'send') {
    var rk = 'rl_' + email, n = +(cache.get(rk) || 0);
    if (n >= MAX_SEND) return { ok: false, error: 'too_many' };
    cache.put(rk, String(n + 1), 3600);
    var uid = userUid(email);
    if (purpose === 'reg' && uid) return { ok: false, error: 'exists' };
    if (purpose === 'reset' && !uid) return { ok: false, error: 'no_user' };
    var code = String(Math.floor(100000 + Math.random() * 900000));
    cache.put(ck, code, TTL); cache.put(tk, '0', TTL);
    var title = purpose === 'reset' ? 'Parolni tiklash kodi' : 'Gmail\'ni tasdiqlash kodi';
    MailApp.sendEmail({
      to: email, name: 'UyChizma', subject: 'UyChizma: ' + code + ' — ' + title,
      htmlBody: '<div style="font-family:Arial,sans-serif;max-width:460px;margin:auto;padding:24px;border:1px solid #e3e8f0;border-radius:16px">' +
        '<h2 style="margin:0 0 8px;color:#0E1626">🏠 UyChizma</h2><p style="color:#566275;margin:0 0 18px">' + title + ':</p>' +
        '<div style="font-size:36px;font-weight:800;letter-spacing:10px;text-align:center;background:#EEF3FF;color:#1F5FE0;border-radius:12px;padding:16px 0">' + code + '</div>' +
        '<p style="color:#566275;font-size:13px;margin:18px 0 0">Kod 10 daqiqa amal qiladi. Uni hech kimga bermang. Agar siz so\'ramagan bo\'lsangiz, bu xatga e\'tibor bermang.</p></div>'
    });
    return { ok: true };
  }

  if (b.action === 'verify' || b.action === 'reset' || b.action === 'check') {
    var saved = cache.get(ck), tries = +(cache.get(tk) || 0);
    if (!saved) return { ok: false, error: 'expired' };
    if (tries >= MAX_TRY) { cache.remove(ck); return { ok: false, error: 'too_many' }; }
    if (String(b.code || '').replace(/\D/g, '') !== saved) { cache.put(tk, String(tries + 1), TTL); return { ok: false, error: 'wrong_code', left: MAX_TRY - tries - 1 }; }
    if (b.action === 'check') return { ok: true };
    if (b.action === 'verify') { cache.remove(ck); var tok = Utilities.getUuid(); cache.put('ok_' + email, tok, 1800); return { ok: true, token: tok }; }
    var pw = String(b.password || '');
    if (pw.length < 6) return { ok: false, error: 'weak' };
    var id = userUid(email); if (!id) return { ok: false, error: 'no_user' };
    itk('accounts:update', { localId: id, password: pw, emailVerified: true });
    cache.remove(ck);
    return { ok: true };
  }

  if (b.action === 'mark') {
    if (!b.token || cache.get('ok_' + email) !== b.token) return { ok: false, error: 'bad_token' };
    var u = userUid(email); if (!u) return { ok: false, error: 'no_user' };
    itk('accounts:update', { localId: u, emailVerified: true });
    cache.remove('ok_' + email);
    return { ok: true };
  }
  return { ok: false, error: 'bad_action' };
}

function userUid(email) {
  var r = itk('accounts:lookup', { email: [email] });
  return (r && r.users && r.users[0] && r.users[0].localId) || '';
}
function itk(method, body) {
  var res = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/projects/' + PROJECT + '/' + method, {
    method: 'post', contentType: 'application/json', payload: JSON.stringify(body), muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), 'X-Goog-User-Project': PROJECT }
  });
  var code = res.getResponseCode(), txt = res.getContentText();
  if (code >= 300) throw new Error('itk ' + method + ' ' + code + ' ' + txt.slice(0, 300));
  return JSON.parse(txt || '{}');
}
/* Bir marta qo'lda ishga tushiring (Run → test) — ruxsatlarni beradi va API ishlashini tekshiradi */
function test() { console.log(JSON.stringify(itk('accounts:lookup', { email: ['admin@uychizma.app'] })).slice(0, 200)); }
