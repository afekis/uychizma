// UyChizma Reel generator (1080x1920 MP4): node reel.js spec.json out.mp4
// spec.style — har xil kreativ shablon (bir xil video qilmaslik uchun ALMASHTIRIB ishlating):
//  'klassik' : jigarrang bokeh + quruvchi personaj; hook → reja (plans) YOKI ro'yxat (rows) → CTA
//  'chizma'  : ko'k chizma (blueprint) qog'oz, terminal-yozuv hook, reja skaner bilan chiziladi; plans YOKI rows
//  'quiz'    : "Qaysi biri yoqadi?" — 3 variant A/B/C ketma-ket, keyin "izohga harfini yozing"; variants:[{svgs,area,beds,floors}]×3
//  'tur'     : och krem fon, reja kattalashib xonalar bo'ylab yuradi, xona nomlari+m² chiqadi; plans + rooms:[[[nom,m2]..] har qavat]
//  'fakt'    : kinetik matn — sariq/qora chaqnovchi fonlarda katta jumlalar (xato/to'g'ri, faktlar); rows (3–6)
//  'yer'     : yashil fon, bo'sh yer chegarasi o'lchamlari bilan chiziladi → ichida 1-qavat rejasi masshtabda paydo bo'ladi; plot:{W,L} + house:{W:v.W, D:v.maxY-v.minY} + plans
// voice: "diktor matni" (o'zbekcha AI ovoz; ixtiyoriy voiceName: uz-UZ-SardorNeural | uz-UZ-MadinaNeural)
// Umumiy maydonlar: hook:"1-QATOR|2-QATOR", tag, title (<em> urg'u), chips:[..], cta:"1|2" (ixtiyoriy)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const [, , specPath, outPath] = process.argv;
const S = JSON.parse(fs.readFileSync(specPath, 'utf8'));
// spec.mascot: 'mascot.png' (quruvchi, standart) yoki 'bobo.svg' (bobo personaj)
const MFILE = path.join(__dirname, S.mascot || 'mascot.png');
const MASCOT = (MFILE.endsWith('.svg') ? 'data:image/svg+xml;base64,' : 'data:image/png;base64,') + fs.readFileSync(MFILE).toString('base64');
const FPS = 30;
const URL = 'afekis.github.io/uychizma';
const split = s => String(s || '').split('|');
const KF = `@keyframes pop{0%{opacity:0;transform:scale(.6)}70%{opacity:1;transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes fadeOut{from{opacity:1}to{opacity:0}}
@keyframes up{from{opacity:0;transform:translateY(80px)}to{opacity:1;transform:none}}
@keyframes left{from{opacity:0;transform:translateX(-120px)}to{opacity:1;transform:none}}
@keyframes wipe{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes wipeDown{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes bob{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-14px) rotate(1deg)}}
@keyframes slam{0%{opacity:0;transform:scale(2.4)}60%{opacity:1;transform:scale(.94)}100%{opacity:1;transform:scale(1)}}
@keyframes type{from{width:0}to{width:100%}} @keyframes blink{50%{opacity:0}}
@keyframes drift{from{transform:translate(0,0)}to{transform:translate(40px,-60px)}}
@keyframes scan{from{top:0%}to{top:100%}}
@keyframes draw{to{stroke-dashoffset:0}}
*{box-sizing:border-box;margin:0;padding:0} body{width:1080px;height:1920px;overflow:hidden;font-family:Inter,sans-serif}
.sc{position:absolute;inset:0} em{font-style:normal}`;
// sahna: [boshlanish, tugash] — fade in/out
const scene = (id, a, b, inner, last) => `<div class="sc" id="${id}" style="animation:fadeIn .35s ${a}s both${last ? '' : `, fadeOut .35s ${b - 0.35}s forwards`}">${inner}</div>`;
const pls = (svgs, cls = 'pl') => svgs.map((p, k) => `<div class="${cls}">${p}${svgs.length > 1 ? `<div class="cap">${k + 1}-qavat</div>` : ''}</div>`).join('');
const chips = (list, t0, cls = 'chip') => (list || []).map((c, i) => `<div class="${cls}" style="animation:pop .4s ${t0 + i * 0.35}s both">${c}</div>`).join('');
const mascot = (cls, d) => `<div class="${cls}" style="animation:up .6s ${d}s both"><img src="${MASCOT}" style="width:100%;animation:bob 2.1s ease-in-out infinite"></div>`;

const T = {};
// ---------------- klassik ----------------
T.klassik = () => {
  const T1 = 3.2, T2 = S.rows ? 10.5 : 9.5, D = T2 + 4;
  const bokeh = Array.from({ length: 16 }, (_, i) => `<i style="left:${(i * 137) % 1080}px;top:${(i * 389) % 1920}px;width:${90 + (i * 53) % 160}px;height:${90 + (i * 53) % 160}px;animation:drift ${6 + i % 5}s ease-in-out ${-i}s infinite alternate"></i>`).join('');
  const body = S.rows ? `<div class="rows">${S.rows.map((r, i) => `<div class="row" style="animation:pop .5s ${T1 + 0.8 + i * 1.1}s both">${r}</div>`).join('')}</div>`
    : `<div class="card" style="animation:pop .5s ${T1 + .5}s both">${pls(S.plans).replace(/class="pl"/g, `class="pl" style="animation:wipe 1.6s ${T1 + .9}s both"`)}</div>`;
  const css = `body{background:radial-gradient(ellipse at 50% 42%,#7a4a2a 0%,#4a2b17 55%,#25150b 100%)}
.bk i{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,214,160,.22),rgba(255,214,160,0) 70%);filter:blur(4px)}
.h{font-family:'DejaVu Serif',serif;font-weight:700;color:#FBE7C2;text-transform:uppercase;text-align:center;letter-spacing:2px;text-shadow:0 5px 0 #6B3A1C,0 10px 24px rgba(0,0,0,.45)} .h .a,.h em{color:#FFC13B}
#s1 .h{position:absolute;left:40px;right:40px;top:260px;font-size:104px;line-height:1.12} #s1 .m{position:absolute;left:250px;top:760px;width:580px}
.tag{position:absolute;left:60px;top:150px;background:#FFC13B;color:#2A1606;font-weight:800;font-size:40px;padding:14px 30px;border-radius:40px}
.title{position:absolute;left:60px;right:60px;top:250px;font-size:84px;line-height:1.08;text-align:left}
.card{position:absolute;left:50px;right:50px;top:560px;height:820px;background:#fff;border-radius:40px;display:flex;gap:16px;padding:30px;box-shadow:0 20px 50px rgba(0,0,0,.4)}
.pl{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center} .pl svg{width:100%;height:100%;max-height:740px} .cap{font-weight:800;font-size:30px;color:#333}
.rows{position:absolute;left:50px;right:50px;top:600px;display:flex;flex-direction:column;gap:26px}
.row{background:#FFF8EC;color:#2A1606;border-radius:30px;padding:30px 36px;font-size:44px;font-weight:700;line-height:1.2;box-shadow:0 10px 30px rgba(0,0,0,.3)} .row b{color:#C2410C}
.chips{position:absolute;left:50px;right:50px;top:1410px;display:flex;flex-wrap:wrap;gap:16px} .chip{background:#FFF8EC;color:#2A1606;border-radius:26px;padding:16px 24px;font-size:38px;font-weight:800}
#s2 .m{position:absolute;right:20px;bottom:-50px;width:250px}
#s3 .h{position:absolute;left:40px;right:40px;top:300px;font-size:96px;line-height:1.15}
.btn{position:absolute;left:110px;right:110px;top:640px;background:#2563EB;color:#fff;font-weight:800;font-size:50px;text-align:center;padding:34px 0;border-radius:70px;box-shadow:0 0 0 8px rgba(37,99,235,.25),0 18px 40px rgba(0,0,0,.4)}
.sub{position:absolute;left:0;right:0;top:820px;text-align:center;color:#FBE7C2;font-size:44px;font-weight:700} #s3 .m{position:absolute;left:300px;top:960px;width:480px}${S.bg ? `body{background:${S.bg}}` : ''}`;
  const cta = split(S.cta || 'SAYTGA KIRING|VA BOSHLANG!');
  const html = `<div class="bk">${bokeh}</div>`
    + scene('s1', 0, T1, `<div class="h">${split(S.hook).map((l, i) => `<div class="${i ? 'a' : ''}" style="animation:pop .6s ${0.1 + i * 0.6}s both">${l}</div>`).join('')}</div>${mascot('m', .3)}`)
    + scene('s2', T1, T2, `<div class="tag" style="animation:pop .5s ${T1 + .1}s both">${S.tag}</div><div class="h title" style="animation:up .6s ${T1 + .2}s both">${S.title}</div>${body}<div class="chips">${chips(S.chips, T1 + 2.6)}</div>${mascot('m', T1 + 1.2)}`)
    + scene('s3', T2, D, `<div class="h" style="animation:pop .6s ${T2 + .1}s both">${cta.map((l, i) => `<div class="${i ? 'a' : ''}">${l}</div>`).join('')}</div><div class="btn" style="animation:pop .5s ${T2 + .6}s both">🌐 ${URL}</div><div class="sub" style="animation:fadeIn .5s ${T2 + 1}s both">Tekin · 1 daqiqada · havola profilda 👆</div>${mascot('m', T2 + .4)}`, true);
  return { css, html, D };
};
// ---------------- chizma (blueprint) ----------------
T.chizma = () => {
  const T1 = 3.4, T2 = S.rows ? 11 : 10, D = T2 + 3.8;
  const hook = split(S.hook);
  const body = S.rows ? `<div class="rows">${S.rows.map((r, i) => `<div class="row" style="animation:left .45s ${T1 + .8 + i * 1.15}s both"><span>${String(i + 1).padStart(2, '0')}</span>${r.replace(/<b>[^<]*<\/b>\s*/, '')}</div>`).join('')}</div>`
    : `<div class="card"><div class="scan" style="animation:scan 2.2s linear ${T1 + .6}s both"></div>${pls(S.plans).replace(/class="pl"/g, `class="pl" style="animation:wipeDown 2.2s linear ${T1 + .6}s both"`)}</div>`;
  const css = `body{background:#0B2D52;background-image:linear-gradient(rgba(255,255,255,.07) 2px,transparent 2px),linear-gradient(90deg,rgba(255,255,255,.07) 2px,transparent 2px),linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:120px 120px,120px 120px,24px 24px,24px 24px}
.mono{font-family:'DejaVu Sans Mono',monospace;color:#E8F1FF}
.ln{white-space:nowrap;overflow:hidden;display:block;font-size:80px;font-weight:700;line-height:1.25}
.cur{display:inline-block;width:40px;height:80px;background:#7FD3FF;vertical-align:middle;animation:blink .8s steps(1) infinite}
#s1 .box{position:absolute;left:70px;right:70px;top:620px}
.lbl{position:absolute;left:70px;top:150px;border:3px solid #7FD3FF;color:#7FD3FF;font-size:34px;padding:10px 22px;font-weight:700}
.title{position:absolute;left:70px;right:70px;top:240px;font-size:70px;line-height:1.15;font-weight:700} .title em{color:#7FD3FF}
.card{position:absolute;left:50px;right:50px;top:520px;height:860px;background:#0D3260;border:3px dashed rgba(127,211,255,.6);padding:26px;display:flex;gap:14px}
.pl{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;mix-blend-mode:screen} .pl svg{width:100%;height:100%;max-height:780px;filter:invert(1) hue-rotate(180deg) saturate(1.4) brightness(1.05)}
.cap{color:#7FD3FF;font-family:'DejaVu Sans Mono',monospace;font-size:30px;font-weight:700}
.scan{position:absolute;left:0;right:0;height:6px;background:#7FD3FF;box-shadow:0 0 30px 8px rgba(127,211,255,.7);z-index:2}
.rows{position:absolute;left:60px;right:60px;top:560px;display:flex;flex-direction:column;gap:30px}
.row{border-left:8px solid #7FD3FF;background:rgba(127,211,255,.1);color:#E8F1FF;font-size:46px;font-weight:700;padding:26px 30px;line-height:1.2} .row span{font-family:'DejaVu Sans Mono',monospace;color:#7FD3FF;margin-right:24px}
.chips{position:absolute;left:50px;right:50px;top:1430px;display:flex;flex-wrap:wrap;gap:16px} .chip{border:3px solid #E8F1FF;color:#E8F1FF;font-family:'DejaVu Sans Mono',monospace;padding:14px 22px;font-size:34px;font-weight:700}
#s3 .big{position:absolute;left:70px;right:70px;top:520px;font-size:84px;line-height:1.2;font-weight:700}
.url{position:absolute;left:70px;right:70px;top:900px;border:4px dashed #7FD3FF;color:#fff;text-align:center;padding:34px 0;font-size:50px;font-weight:700;font-family:'DejaVu Sans Mono',monospace}
.sub{position:absolute;left:70px;right:70px;top:1080px;color:#9CC8F0;font-size:40px;text-align:center}`;
  const html = scene('s1', 0, T1, `<div class="box mono">${hook.map((l, i) => `<div style="position:relative"><span class="ln" style="animation:type ${0.9}s steps(${l.length}) ${0.2 + i * 1.1}s both">&gt; ${l}</span></div>`).join('')}<span class="cur"></span></div>`)
    + scene('s2', T1, T2, `<div class="lbl mono" style="animation:fadeIn .4s ${T1 + .1}s both">${S.tag}</div><div class="title mono" style="animation:left .5s ${T1 + .2}s both">${S.title}</div>${body}<div class="chips">${chips(S.chips, T1 + 3)}</div>`)
    + scene('s3', T2, D, `<div class="big mono" style="animation:up .5s ${T2 + .1}s both">${split(S.cta || 'O\'Z YERINGIZGA|CHIZDIRING →').join('<br>')}</div><div class="url" style="animation:pop .5s ${T2 + .6}s both">${URL}</div><div class="sub mono" style="animation:fadeIn .5s ${T2 + 1}s both">tekin · 1 daqiqa · havola profilda</div>`, true);
  return { css, html, D };
};
// ---------------- quiz (A/B/C) ----------------
T.quiz = () => {
  const V = S.variants.slice(0, 3), L = 'ABC', T1 = 2.8, per = 2.9, T2 = T1 + per * V.length, T3 = T2 + 3.4, D = T3 + 3.4;
  const css = `body{background:linear-gradient(160deg,#4C1D95 0%,#7C3AED 45%,#DB2777 100%)}
.h{color:#fff;font-weight:900;text-align:center;letter-spacing:-1px;text-shadow:0 8px 30px rgba(0,0,0,.35)} .h em{color:#FDE047}
#s1 .h{position:absolute;left:50px;right:50px;top:600px;font-size:130px;line-height:1.05}
.q{position:absolute;inset:0}
.let{position:absolute;left:50%;top:170px;margin-left:-120px;width:240px;height:240px;border-radius:50%;background:#FDE047;color:#4C1D95;font-size:170px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 40px rgba(0,0,0,.35)}
.qc{position:absolute;left:50px;right:50px;top:470px;height:900px;background:#fff;border-radius:44px;padding:30px;display:flex;gap:14px;box-shadow:0 20px 60px rgba(0,0,0,.35)}
.pl{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center} .pl svg{width:100%;height:100%;max-height:820px} .cap{font-weight:800;font-size:30px;color:#333}
.qs{position:absolute;left:50px;right:50px;top:1420px;display:flex;justify-content:center;gap:16px} .chip{background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.5);color:#fff;border-radius:26px;padding:16px 26px;font-size:40px;font-weight:800}
.grid{position:absolute;left:40px;right:40px;top:470px;display:flex;flex-direction:column;gap:24px}
.gi{background:#fff;border-radius:34px;height:300px;display:flex;align-items:center;padding:20px;gap:20px}
.gi .l{width:150px;height:150px;flex:none;border-radius:50%;background:#FDE047;color:#4C1D95;font-size:100px;font-weight:900;display:flex;align-items:center;justify-content:center}
.gi .s{flex:1;height:100%;display:flex;gap:8px} .gi .s svg{height:100%;width:auto;max-width:48%}
.gi .t{font-size:38px;font-weight:800;color:#3B0764;width:230px;line-height:1.3}
#s9 .h{position:absolute;left:50px;right:50px;top:200px;font-size:96px;line-height:1.08}
.ans{position:absolute;left:40px;right:40px;top:1450px;text-align:center;color:#fff;font-size:50px;font-weight:900;line-height:1.2}
.btn{position:absolute;left:100px;right:100px;top:760px;background:#FDE047;color:#4C1D95;font-weight:900;font-size:52px;text-align:center;padding:36px 0;border-radius:70px;box-shadow:0 18px 40px rgba(0,0,0,.35)}
#s10 .h{position:absolute;left:50px;right:50px;top:420px;font-size:100px;line-height:1.08}
.sub{position:absolute;left:0;right:0;top:960px;text-align:center;color:#fff;font-size:44px;font-weight:700}`;
  let html = scene('s1', 0, T1, `<div class="h">${split(S.hook || 'QAYSI BIRI|<em>YOQADI?</em>').map((l, i) => `<div style="animation:slam .55s ${0.1 + i * .5}s both">${l}</div>`).join('')}</div>`);
  V.forEach((v, i) => {
    const a = T1 + i * per;
    html += scene('q' + i, a, a + per, `<div class="let" style="animation:slam .5s ${a + .05}s both">${L[i]}</div><div class="qc" style="animation:up .5s ${a + .2}s both">${pls(v.svgs)}</div><div class="qs">${chips([`🏠 ${v.area} m²`, `🛏 ${v.beds} yotoq.`, `🏢 ${v.floors} qavat`], a + .7)}</div>`);
  });
  html += scene('s9', T2, T3, `<div class="h" style="animation:pop .5s ${T2 + .1}s both">${S.title || 'Sizga <em>qaysi biri?</em>'}</div><div class="grid">${V.map((v, i) => `<div class="gi" style="animation:left .4s ${T2 + .3 + i * .3}s both"><div class="l">${L[i]}</div><div class="s">${v.svgs.join('')}</div><div class="t">${v.area} m²<br>${v.beds} yotoq.</div></div>`).join('')}</div><div class="ans" style="animation:slam .5s ${T2 + 1.4}s both">Izohga A, B yoki C yozing 👇</div>`)
    + scene('s10', T3, D, `<div class="h" style="animation:slam .5s ${T3 + .1}s both">${split(S.cta || 'O\'Z YERINGIZ UCHUN|<em>3 TA VARIANT</em>').join('<br>')}</div><div class="btn" style="animation:pop .5s ${T3 + .6}s both">🌐 ${URL}</div><div class="sub" style="animation:fadeIn .5s ${T3 + 1}s both">Tekin · 1 daqiqada · havola profilda 👆</div>`, true);
  return { css, html, D };
};
// ---------------- tur (xonalar bo'ylab) ----------------
T.tur = () => {
  const F = S.plans.length, T1 = 3, per = 5.2, T2 = T1 + per * F, D = T2 + 3.6;
  const css = `body{background:#F4EDE2}
.h{color:#1E1B18;font-weight:900;letter-spacing:-1px} .h em{color:#D9480F}
#s1 .h{position:absolute;left:70px;right:70px;top:560px;font-size:120px;line-height:1.02}
#s1 .ln{position:absolute;left:70px;top:520px;width:200px;height:14px;background:#D9480F}
.ft{position:absolute;left:60px;top:120px;font-size:44px;font-weight:800;color:#D9480F;letter-spacing:4px}
.tt{position:absolute;left:60px;right:60px;top:180px;font-size:72px;line-height:1.05}
.vp{position:absolute;left:40px;right:40px;top:400px;height:940px;background:#fff;border-radius:30px;overflow:hidden;box-shadow:0 14px 40px rgba(60,40,20,.18)}
.vp .in{position:absolute;inset:20px;display:flex;align-items:center;justify-content:center} .vp svg{width:100%;height:100%}
.rl{position:absolute;left:40px;right:40px;top:1380px;display:flex;flex-wrap:wrap;gap:14px}
.rc{background:#1E1B18;color:#F4EDE2;border-radius:18px;padding:14px 22px;font-size:34px;font-weight:700} .rc b{color:#FFB37A}
.foot{position:absolute;left:60px;right:60px;bottom:90px;display:flex;gap:16px} .chip{background:#D9480F;color:#fff;border-radius:20px;padding:14px 22px;font-size:36px;font-weight:800}
#s9 .h{position:absolute;left:70px;right:70px;top:480px;font-size:104px;line-height:1.05}
.btn{position:absolute;left:70px;right:70px;top:900px;background:#1E1B18;color:#fff;font-weight:800;font-size:50px;text-align:center;padding:34px 0;border-radius:24px}
.sub{position:absolute;left:70px;right:70px;top:1070px;color:#6B5B4B;font-size:42px;font-weight:700}`;
  let html = scene('s1', 0, T1, `<div class="ln" style="animation:wipe .6s .1s both"></div><div class="h">${split(S.hook).map((l, i) => `<div style="animation:up .5s ${.2 + i * .4}s both">${l}</div>`).join('')}</div>`);
  const pans = [['1', '0%', '0%'], ['1.7', '18%', '14%'], ['1.7', '-18%', '-12%'], ['1.0', '0%', '0%']];
  S.plans.forEach((svg, k) => {
    const a = T1 + k * per, kf = `pan${k}`;
    const rooms = ((S.rooms || [])[k] || []).slice(0, 8);
    html += `<style>@keyframes ${kf}{0%{transform:scale(1)}30%{transform:scale(1.7) translate(16%,12%)}65%{transform:scale(1.7) translate(-16%,-10%)}100%{transform:scale(1)}}</style>`;
    html += scene('f' + k, a, a + per, `<div class="ft" style="animation:fadeIn .4s ${a + .1}s both">${F > 1 ? (k + 1) + '-QAVAT' : (S.tag || '')}</div><div class="h tt" style="animation:up .5s ${a + .15}s both">${S.title}</div><div class="vp" style="animation:pop .5s ${a + .3}s both"><div class="in" style="animation:${kf} ${per - .6}s ease-in-out ${a + .5}s both">${svg}</div></div><div class="rl">${rooms.map((r, i) => `<div class="rc" style="animation:pop .35s ${a + .9 + i * (per - 1.6) / Math.max(rooms.length, 1)}s both">${r[0]} <b>${String(r[1]).replace('.', ',')} m²</b></div>`).join('')}</div>`);
  });
  html += scene('s9', T2, D, `<div class="h" style="animation:up .5s ${T2 + .1}s both">${split(S.cta || 'SIZNING UYINGIZ|<em>QANDAY BO\'LADI?</em>').join('<br>')}</div><div class="btn" style="animation:pop .5s ${T2 + .6}s both">🌐 ${URL}</div><div class="sub" style="animation:fadeIn .5s ${T2 + 1}s both">Tekin · 1 daqiqada · havola profilda 👆</div><div class="foot">${chips(S.chips, T2 + 1.2)}</div>`, true);
  return { css, html, D };
};
// ---------------- fakt (kinetik matn) ----------------
T.fakt = () => {
  const R = S.rows, T1 = 2.4, per = 2.2, T2 = T1 + per * R.length, D = T2 + 3.4;
  const pal = [['#FFD600', '#111'], ['#111', '#FFD600'], ['#2563EB', '#fff'], ['#fff', '#111']];
  const css = `body{background:#111}
.full{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 70px;text-align:center}
.big{font-weight:900;font-size:118px;line-height:1.02;letter-spacing:-2px;text-transform:uppercase}
.mid{font-weight:900;font-size:86px;line-height:1.08;letter-spacing:-1px}
.mid b{display:block;font-size:150px;line-height:1;margin-bottom:24px;opacity:.9}
.cnt{position:absolute;top:140px;left:0;right:0;text-align:center;font-weight:900;font-size:44px;letter-spacing:6px;opacity:.7}
.tagx{position:absolute;bottom:160px;left:0;right:0;text-align:center;font-size:40px;font-weight:800;letter-spacing:4px;opacity:.75}
.btn{margin-top:60px;background:#FFD600;color:#111;font-weight:900;font-size:50px;padding:34px 60px;border-radius:20px}
.sub{margin-top:30px;color:#fff;font-size:40px;font-weight:700;opacity:.85}`;
  let html = scene('s1', 0, T1, `<div class="full" style="background:#FFD600;color:#111"><div class="big">${split(S.hook).map((l, i) => `<div style="animation:slam .45s ${.05 + i * .45}s both">${l}</div>`).join('')}</div></div>`);
  R.forEach((r, i) => {
    const a = T1 + i * per, [bg, fg] = pal[i % pal.length];
    const m = r.match(/^<b>([^<]*)<\/b>\s*(.*)$/); const num = m ? m[1] : (i + 1) + '.'; const txt = m ? m[2] : r;
    html += scene('r' + i, a, a + per, `<div class="full" style="background:${bg};color:${fg}"><div class="cnt">${i + 1} / ${R.length}</div><div class="mid" style="animation:slam .45s ${a + .05}s both"><b>${num}</b>${txt}</div><div class="tagx">${S.tag || 'UYCHIZMA'}</div></div>`);
  });
  html += scene('s9', T2, D, `<div class="full" style="background:#111;color:#fff"><div class="big" style="animation:slam .45s ${T2 + .05}s both">${split(S.cta || 'SAQLAB|QO\'YING 📌').join('<br>')}</div><div class="btn" style="animation:pop .5s ${T2 + .6}s both">🌐 ${URL}</div><div class="sub" style="animation:fadeIn .5s ${T2 + 1}s both">Uy loyihasini tekin chizdiring</div></div>`, true);
  return { css, html, D };
};
// ---------------- yer (bo'sh yer → uy) ----------------
T.yer = () => {
  const { W, L } = S.plot, Hh = S.house || { W: W - 4, D: L / 2 }, T1 = 4.2, T2 = 10.2, D = T2 + 3.6;
  const sc = Math.min(760 / W, 1000 / L), pw = W * sc, ph = L * sc, px = (1080 - pw) / 2, py = 470;
  const per = 2 * (pw + ph);
  const css = `body{background:radial-gradient(ellipse at 50% 40%,#1F5130 0%,#123620 60%,#0A2214 100%)}
.h{color:#fff;font-weight:900;text-align:center;letter-spacing:-1px} .h em{color:#B8F36B}
.top{position:absolute;left:50px;right:50px;top:170px;font-size:96px;line-height:1.05}
.dim{position:absolute;color:#B8F36B;font-weight:900;font-size:52px;font-family:'DejaVu Sans Mono',monospace}
.hs{position:absolute;left:${(1080 - (Hh.W + 5.2) * sc) / 2}px;top:${py + ph - (Hh.D + 5.6) * sc - 0.4 * sc}px;width:${(Hh.W + 5.2) * sc}px;height:${(Hh.D + 5.6) * sc}px;border-radius:10px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.4)}
.hs svg{width:100%;height:100%;display:block}
.street{position:absolute;left:0;right:0;top:${py + ph + 10}px;text-align:center;color:#D7F5C0;font-size:30px;font-weight:700;letter-spacing:6px}
.chips{position:absolute;left:50px;right:50px;top:${py + ph + 70}px;display:flex;flex-wrap:wrap;justify-content:center;gap:16px} .chip{background:#B8F36B;color:#0A2214;border-radius:24px;padding:16px 24px;font-size:38px;font-weight:900}
.tm{position:absolute;left:0;right:0;top:${py + ph / 2 - 60}px;text-align:center;font-size:110px;font-weight:900;color:#B8F36B}
.btn{position:absolute;left:100px;right:100px;top:880px;background:#B8F36B;color:#0A2214;font-weight:900;font-size:52px;text-align:center;padding:36px 0;border-radius:70px}
.sub{position:absolute;left:0;right:0;top:1060px;text-align:center;color:#D7F5C0;font-size:44px;font-weight:700}
#s9 .h{position:absolute;left:50px;right:50px;top:480px;font-size:104px;line-height:1.05}`;
  const plot = `<svg style="position:absolute;left:0;top:0" width="1080" height="1920"><rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="rgba(184,243,107,.07)" stroke="#B8F36B" stroke-width="8" stroke-dasharray="${per}" stroke-dashoffset="${per}" style="animation:draw 1.8s ease-out .6s forwards"/></svg>`;
  const html = `<div class="sc">${plot}<div class="dim" style="left:0;right:0;text-align:center;top:${py - 80}px;animation:fadeIn .4s 2.2s both">${W} m</div><div class="dim" style="left:${px + pw + 14}px;top:${py + ph / 2 - 30}px;animation:fadeIn .4s 2.4s both;writing-mode:vertical-rl">${L} m</div></div>`
    + scene('s1', 0, T1, `<div class="h top">${split(S.hook).map((l, i) => `<div style="animation:up .5s ${.1 + i * .4}s both">${l}</div>`).join('')}</div><div class="tm" style="animation:pop .4s 3s both">?</div>`)
    + scene('s2', T1, T2, `<div class="h top" style="animation:up .5s ${T1 + .1}s both">${S.title}</div><div class="hs" style="animation:pop .6s ${T1 + .4}s both">${S.plans[0]}</div><div class="street" style="animation:fadeIn .4s ${T1 + .8}s both">↓ KO'CHA ↓</div><div class="chips">${chips(S.chips, T1 + 1.6)}</div>`)
    + scene('s9', T2, D, `<div style="position:absolute;inset:0;background:#0A2214"></div><div class="h" style="animation:up .5s ${T2 + .1}s both">${split(S.cta || 'YERINGIZ O\'LCHAMINI|<em>KIRITING</em>').join('<br>')}</div><div class="btn" style="animation:pop .5s ${T2 + .6}s both">🌐 ${URL}</div><div class="sub" style="animation:fadeIn .5s ${T2 + 1}s both">1 daqiqada 3 xil reja · tekin · havola profilda 👆</div>`, true);
  return { css, html, D };
};

// ---------------- yangilik (sayt yangiligi: qo'lda chizilgan reja → AI o'qiydi → toza reja → uslub → uy) ----------------
// spec: hook, rooms:[[nom, x, y, w, h]] (metr, uy chap-old burchagidan), houseW, houseD, styles:[..], cta, voice
T.yangilik = () => {
  let FONT = '';
  try { FONT = 'data:font/woff2;base64,' + fs.readFileSync(path.join(__dirname, 'caveat.woff2')).toString('base64'); } catch (e) {}
  const R = S.rooms, HW = S.houseW, HD = S.houseD, sc = 70, pad = 40;
  const VW = HW * sc + pad * 2, VH = HD * sc + pad * 2;
  const X = m => pad + m * sc, Y = m => pad + m * sc;
  let sd = 7; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280 - .5;
  const wob = (x1, y1, x2, y2) => { const mx = (x1 + x2) / 2 + rnd() * 9, my = (y1 + y2) / 2 + rnd() * 9; return `M${x1 + rnd() * 6} ${y1 + rnd() * 6} Q${mx} ${my} ${x2 + rnd() * 6} ${y2 + rnd() * 6}`; };
  const fmt = n => String(Math.round(n * 10) / 10).replace('.', ',');
  const segs = []; R.forEach(r => { const [, x, y, w, h] = r; segs.push([X(x), Y(y), X(x + w), Y(y)], [X(x + w), Y(y), X(x + w), Y(y + h)], [X(x + w), Y(y + h), X(x), Y(y + h)], [X(x), Y(y + h), X(x), Y(y)]); });
  const T1 = 3.2, T2 = 9.6, T3 = 13.6, T4 = 18.6, D = 22.2;
  const sketch = `<svg viewBox="0 0 ${VW} ${VH}">${segs.map((g, i) => `<path d="${wob(...g)}" pathLength="1" style="fill:none;stroke:#1d2a4a;stroke-width:6;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;animation:draw .5s ${T1 + .5 + i * (2.6 / segs.length)}s forwards"/>`).join('')}
${R.map((r, i) => `<text x="${X(r[1] + r[3] / 2)}" y="${Y(r[2] + r[4] / 2)}" text-anchor="middle" class="hw" style="animation:pop .35s ${T1 + 3.1 + i * .18}s both"><tspan x="${X(r[1] + r[3] / 2)}" dy="-8">${r[0]}</tspan><tspan x="${X(r[1] + r[3] / 2)}" dy="60">${fmt(r[3])}×${fmt(r[4])}</tspan></text>`).join('')}</svg>`;
  const clean = `<svg viewBox="0 0 ${VW} ${VH}"><defs><pattern id="gr" width="${sc / 2}" height="${sc / 2}" patternUnits="userSpaceOnUse"><path d="M${sc / 2} 0H0V${sc / 2}" fill="none" stroke="#dfe3ea" stroke-width="1.5"/></pattern></defs><rect width="${VW}" height="${VH}" fill="url(#gr)"/>
${R.map(r => `<rect x="${X(r[1])}" y="${Y(r[2])}" width="${r[3] * sc}" height="${r[4] * sc}" fill="#eceef2" stroke="#2b2f36" stroke-width="10"/>`).join('')}
${R.map((r, i) => `<text x="${X(r[1] + r[3] / 2)}" y="${Y(r[2] + r[4] / 2) - 6}" text-anchor="middle" class="cn">${r[0]}</text><text x="${X(r[1] + r[3] / 2)}" y="${Y(r[2] + r[4] / 2) + 34}" text-anchor="middle" class="cm" style="animation:pop .35s ${T2 + 1 + i * .3}s both">${fmt(r[3] * r[4])} m²</text>`).join('')}</svg>`;
  const styles = S.styles || ['Zamonaviy', 'Klassik', 'Milliy', 'Hi-tech', 'Minimalizm'], pick = S.pick != null ? S.pick : 2;
  const css = `${FONT ? `@font-face{font-family:Hand;src:url(${FONT})}` : ''}
@keyframes on{to{background:#FFC93C;color:#1A1300;border-color:#FFC93C;transform:scale(1.08)}}
@keyframes press{0%,100%{transform:scale(1)}40%{transform:scale(.92)}}
@keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(255,201,60,.6)}50%{box-shadow:0 0 0 26px rgba(255,201,60,0)}}
body{background:radial-gradient(ellipse at 50% 35%,#16306b,#0A1532 60%,#060c1d);font-family:Inter,sans-serif;color:#fff}
.hk{position:absolute;left:50px;right:50px;top:520px;text-align:center}
.nw{display:inline-block;background:#FFC93C;color:#1A1300;font-weight:900;font-size:56px;padding:14px 38px;border-radius:60px;letter-spacing:2px}
.big{font-weight:900;font-size:110px;line-height:1.05;letter-spacing:-2px;margin-top:50px} .big em{color:#FFC93C}
.hwb{font-family:Hand,cursive;font-size:84px;color:#9cc0ff;margin-top:40px}
.tt{position:absolute;left:60px;right:60px;top:150px;font-weight:900;font-size:70px;line-height:1.08;letter-spacing:-1px} .tt em{color:#FFC93C}
.paper{position:absolute;left:60px;right:60px;top:420px;height:900px;border-radius:24px;background:#FBF6E9;background-image:repeating-linear-gradient(#FBF6E9 0 58px,#cfd9ee 58px 60px);box-shadow:0 30px 60px rgba(0,0,0,.45);transform:rotate(-2deg);overflow:hidden;display:flex;align-items:center;justify-content:center;padding:40px}
.paper svg,.cl svg{width:100%;height:100%} .hw{font-family:Hand,cursive;font-size:66px;fill:#1d2a4a;font-weight:700}
.scan{position:absolute;left:0;right:0;height:14px;background:linear-gradient(90deg,transparent,#3DF2B0,transparent);box-shadow:0 0 40px 10px rgba(61,242,176,.55)}
.ai{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;top:1360px;white-space:nowrap;background:#3DF2B0;color:#052b1d;font-weight:900;font-size:46px;padding:18px 40px;border-radius:60px}
.det{position:absolute;left:60px;right:60px;top:1480px;display:flex;flex-wrap:wrap;gap:16px;justify-content:center} .det div{background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.3);border-radius:22px;padding:14px 24px;font-size:38px;font-weight:800}
.cl{position:absolute;left:60px;right:60px;top:420px;height:980px;background:#fff;border-radius:30px;padding:40px;box-shadow:0 30px 60px rgba(0,0,0,.45)}
.cn{font-size:38px;font-weight:800;fill:#2b2f36} .cm{font-size:40px;font-weight:900;fill:#1F5FE0}
.sub2{position:absolute;left:60px;right:60px;top:1450px;text-align:center;font-size:46px;font-weight:800;color:#cfe0ff}
.lb{position:absolute;left:60px;font-size:44px;font-weight:800;color:#9cc0ff}
.sg{position:absolute;left:60px;right:60px;display:flex;flex-wrap:wrap;gap:18px} .sg div{border:3px solid rgba(255,255,255,.45);border-radius:26px;padding:20px 32px;font-size:46px;font-weight:800;color:#fff}
.bt{position:absolute;left:90px;right:90px;top:1330px;background:#1F5FE0;border-radius:80px;text-align:center;font-weight:900;font-size:60px;padding:40px 0}
.url{position:absolute;left:90px;right:90px;top:900px;background:#FFC93C;color:#1A1300;border-radius:80px;text-align:center;font-weight:900;font-size:50px;padding:34px 0}
.path{position:absolute;left:60px;right:60px;top:1080px;text-align:center;font-size:48px;font-weight:800;color:#cfe0ff;line-height:1.5}`;
  const hook = split(S.hook || "QO'LDA CHIZGAN|<em>REJANGIZ</em> BORMI?");
  const cta = split(S.cta || "CHIZMANGIZNI|<em>UYGA AYLANTIRING</em>");
  const html = scene('s1', 0, T1, `<div class="hk"><div class="nw" style="animation:pop .5s .1s both">🆕 YANGILIK</div><div class="big">${hook.map((l, i) => `<div style="animation:slam .5s ${.5 + i * .5}s both">${l}</div>`).join('')}</div><div class="hwb" style="animation:fadeIn .5s 1.8s both">${S.hand || 'daftardagi chizma ham bo\'ladi ✍️'}</div></div>`)
    + scene('s2', T1, T2, `<div class="tt" style="animation:up .5s ${T1 + .1}s both">${S.title2 || 'Chizmangizni <em>yuklang</em> 📐'}</div><div class="paper" style="animation:pop .5s ${T1 + .2}s both">${sketch}<div class="scan" style="animation:scan 1.6s linear ${T1 + 4}s both"></div></div><div class="ai" style="animation:pop .4s ${T1 + 4}s both">🤖 AI o'qiyapti…</div><div class="det">${[...new Set(R.map(r => r[0]))].map((r, i) => `<div style="animation:pop .35s ${T1 + 4.6 + i * .25}s both">✔ ${r}</div>`).join('')}</div>`)
    + scene('s3', T2, T3, `<div class="tt" style="animation:up .5s ${T2 + .1}s both">${S.title3 || 'Aynan <em>sizning metrlaringiz</em>da'}</div><div class="cl" style="animation:wipe .8s ${T2 + .2}s both">${clean}</div><div class="sub2" style="animation:fadeIn .5s ${T2 + 1.6}s both">${S.sub3 || 'Xonalar, metrlar — o\'zgarmaydi ✅'}</div>`)
    + scene('s4', T3, T4, `<div class="tt" style="animation:up .5s ${T3 + .1}s both">${S.title4 || 'Qolgani — <em>2 ta bosish</em>'}</div><div class="lb" style="top:420px;animation:fadeIn .4s ${T3 + .3}s both">2. Uslubni tanlang</div><div class="sg" style="top:500px">${styles.map((t, i) => `<div style="animation:pop .35s ${T3 + .5 + i * .22}s both${i === pick ? `, on .3s ${T3 + 2}s forwards` : ''}">${t}</div>`).join('')}</div><div class="lb" style="top:860px;animation:fadeIn .4s ${T3 + 2.2}s both">3. Necha qavat?</div><div class="sg" style="top:940px"><div style="animation:pop .35s ${T3 + 2.4}s both">1 qavat</div><div style="animation:pop .35s ${T3 + 2.6}s both, on .3s ${T3 + 3}s forwards">2 qavat</div></div><div class="bt" style="animation:pop .45s ${T3 + 3.4}s both, press .4s ${T3 + 4.2}s, glow 1s ${T3 + 4.2}s 2">🏠 Uyimni tayyorla</div>`)
    + scene('s5', T4, D, `<div class="hk" style="top:300px"><div class="big" style="font-size:96px;margin:0">${cta.map((l, i) => `<div style="animation:slam .45s ${T4 + .1 + i * .35}s both">${l}</div>`).join('')}</div></div><div class="url" style="animation:pop .5s ${T4 + .9}s both">🌐 ${URL}</div><div class="path" style="animation:fadeIn .5s ${T4 + 1.3}s both">Loyiha boshlash → <b style="color:#FFC93C">📐 Chizmam bor</b><br>havola profilda 👆</div>`, true);
  return { css, html, D };
};
T.hikoya = () => require(path.join(__dirname, 'hikoya.js'))(S, { scene, URL });
const style = S.style || 'klassik';
if (!T[style]) throw new Error('Noma\'lum style: ' + style + ' (bor: ' + Object.keys(T).join(', ') + ')');
const { css, html, D: D0 } = T[style]();
// AI diktor ovozi (o'zbekcha, edge-tts: uz-UZ-SardorNeural / uz-UZ-MadinaNeural) — avval yasaladi, video uzunligi ovozga moslanadi.
// Tarmoq ruxsat bermasa — jim o'tkazib yuboriladi, faqat musiqa qoladi (VOICE_STATUS konsolga chiqadi).
const cp = require('child_process');
let VOICE_STATUS = 'yoq', VDUR = 0;
const mp3 = outPath.replace(/\.mp4$/, '') + '.voice.mp3', mixed = outPath.replace(/\.mp4$/, '') + '.mix.wav';
if (S.voice) {
  const tts = () => cp.execFileSync('python3', [path.join(__dirname, 'tts.py'), '--voice', S.voiceName || 'uz-UZ-SardorNeural', '--rate=' + (S.voiceRate || '+0%'), '--pitch=' + (S.voicePitch || '+0Hz'), '--text', S.voice, '--write-media', mp3], { stdio: 'pipe', timeout: 60000 });
  try {
    try { tts(); } catch (e) { cp.execFileSync('pip', ['install', '-q', 'edge-tts', '--break-system-packages'], { stdio: 'pipe', timeout: 120000 }); tts(); }
    VDUR = +cp.execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3]).toString().trim();
    if (!(VDUR > 0.5)) throw new Error('bo\'sh ovoz fayli');
    VOICE_STATUS = 'bor';
  } catch (e) { VOICE_STATUS = 'XATO: ' + String(e.stderr || e.message).slice(-200); }
}
// minDur yoki diktor ovozi uzunroq bo'lsa, butun animatsiya sekinlashtiriladi (vaqt cho'ziladi)
const D = Math.max(D0, +S.minDur || 0, VDUR ? VDUR + 1.5 : 0), TK = D0 / D;
// Ovoz: o'zimiz yaratgan fon musiqasi (music.py), uslubga mos; seed — fayl nomidan (har video boshqacha)
const seed = S.seed != null ? S.seed : [...path.basename(outPath)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 100003, 7);
const wav = outPath.replace(/\.mp4$/, '') + '.music.wav';
cp.execFileSync('python3', [path.join(__dirname, 'music.py'), wav, String(D), style, String(seed)]);
if (VOICE_STATUS === 'bor') {
  cp.execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-i', mp3, '-filter_complex',
    '[0]volume=0.22[m];[1]adelay=500|500,volume=1.8[v];[m][v]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95', mixed]);
  fs.renameSync(mixed, wav);
}
try { fs.unlinkSync(mp3); } catch (e) {}
const page = `<!doctype html><html><head><meta charset="utf-8"><style>${KF}${css}</style></head><body>${html}</body></html>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.setContent(page);
  await p.waitForTimeout(300);
  await p.evaluate(() => document.getAnimations().forEach(a => a.pause()));
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-i', wav,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', '-movflags', '+faststart', outPath]);
  const N = Math.round(D * FPS);
  for (let f = 0; f < N; f++) {
    await p.evaluate(t => document.getAnimations().forEach(a => { a.currentTime = t; }), f * 1000 / FPS * TK);
    const buf = await p.screenshot({ type: 'jpeg', quality: 88 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  try { fs.unlinkSync(wav); } catch (e) {}
  await b.close();
  console.log('ok', style, outPath, D.toFixed(1) + 's', 'diktor:', VOICE_STATUS);
})();
