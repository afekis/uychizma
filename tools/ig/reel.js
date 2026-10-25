// UyChizma reel generator: node reel.js spec.json out.mp4
// spec: {hook:"DIZAYNER|KERAK EMAS!", tag:"YER 14×28 m", title:"...<em>..</em>", plans:[svgString,...],
//        rows:["..",".."] (plans o'rniga ro'yxat), chips:["🏠 161 m²",...], cta:"SAYTGA KIRING|VA BOSHLANG!"}
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const [, , specPath, outPath] = process.argv;
const S = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const MASCOT = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'mascot.png')).toString('base64');
const FPS = 30;
const T1 = 3.2, T2 = S.rows ? 10.5 : 9.5, T3 = T2 + 4; // sahna chegaralari (s)
const DUR = T3;

const bokeh = Array.from({ length: 16 }, (_, i) => {
  const x = (i * 137) % 1080, y = (i * 389) % 1920, s = 90 + (i * 53) % 160, d = 6 + (i % 5);
  return `<i style="left:${x}px;top:${y}px;width:${s}px;height:${s}px;animation:drift ${d}s ease-in-out ${-i}s infinite alternate"></i>`;
}).join('');
const hook = S.hook.split('|');
const cta = (S.cta || 'SAYTGA KIRING|VA BOSHLANG!').split('|');
const body = S.rows
  ? `<div class="rows">${S.rows.map((r, i) => `<div class="row" style="animation:pop .5s ${T1 + 0.8 + i * 1.1}s both">${r}</div>`).join('')}</div>`
  : `<div class="card">${S.plans.map((p, k) => `<div class="pl">${p}${S.plans.length > 1 ? `<div class="cap">${k + 1}-qavat</div>` : ''}</div>`).join('')}</div>`;
const chips = (S.chips || []).map((c, i) => `<div class="chip" style="animation:pop .4s ${T1 + 2.6 + i * 0.35}s both">${c}</div>`).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;overflow:hidden;font-family:Inter,sans-serif;background:radial-gradient(ellipse at 50% 42%,#7a4a2a 0%,#4a2b17 55%,#25150b 100%)}
.bk i{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,214,160,.22),rgba(255,214,160,0) 70%);filter:blur(4px)}
@keyframes drift{from{transform:translate(0,0)}to{transform:translate(40px,-60px)}}
@keyframes pop{0%{opacity:0;transform:scale(.6)}70%{opacity:1;transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes fadeOut{from{opacity:1}to{opacity:0}}
@keyframes up{from{opacity:0;transform:translateY(80px)}to{opacity:1;transform:none}}
@keyframes wipe{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes bob{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-14px) rotate(1deg)}}
.sc{position:absolute;inset:0}
.h{font-family:'DejaVu Serif',serif;font-weight:700;color:#FBE7C2;text-transform:uppercase;text-align:center;letter-spacing:2px;text-shadow:0 5px 0 #6B3A1C,0 10px 24px rgba(0,0,0,.45)}
.h .a{color:#FFC13B}
#s1{animation:fadeOut .35s ${T1 - 0.35}s both}
#s1 .h{position:absolute;left:40px;right:40px;top:260px;font-size:104px;line-height:1.12}
#s1 .h div{animation:pop .6s both}
#s1 .m{position:absolute;left:250px;top:760px;width:580px;animation:up .7s .3s both}
#s1 .m img{width:100%;animation:bob 2s ease-in-out infinite}
#s2{animation:fadeIn .35s ${T1}s both, fadeOut .35s ${T2 - 0.35}s forwards}
.tag{position:absolute;left:60px;top:150px;background:#FFC13B;color:#2A1606;font-weight:800;font-size:40px;padding:14px 30px;border-radius:40px;animation:pop .5s ${T1 + 0.1}s both}
.title{position:absolute;left:60px;right:60px;top:250px;font-size:84px;line-height:1.08;text-align:left;animation:up .6s ${T1 + 0.2}s both}
.title em{font-style:normal;color:#FFC13B}
.card{position:absolute;left:50px;right:50px;top:560px;height:820px;background:#fff;border-radius:40px;display:flex;gap:16px;padding:30px;box-shadow:0 20px 50px rgba(0,0,0,.4);animation:pop .5s ${T1 + 0.5}s both}
.card .pl{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;animation:wipe 1.6s ${T1 + 0.9}s both}
.card .pl svg{width:100%;height:100%;max-height:740px}
.card .cap{font-weight:800;font-size:30px;color:#333}
.rows{position:absolute;left:50px;right:50px;top:600px;display:flex;flex-direction:column;gap:26px}
.row{background:#FFF8EC;color:#2A1606;border-radius:30px;padding:30px 36px;font-size:44px;font-weight:700;line-height:1.2;box-shadow:0 10px 30px rgba(0,0,0,.3)}
.row b{color:#C2410C}
.chips{position:absolute;left:50px;right:50px;top:1410px;display:flex;flex-wrap:wrap;gap:16px}
.chip{background:#FFF8EC;color:#2A1606;border-radius:26px;padding:16px 24px;font-size:38px;font-weight:800}
#s2 .m{position:absolute;right:20px;bottom:-50px;width:250px;animation:up .6s ${T1 + 1.2}s both}
#s2 .m img{width:100%;animation:bob 2.2s ease-in-out infinite}
#s3{animation:fadeIn .4s ${T2}s both}
#s3 .h{position:absolute;left:40px;right:40px;top:300px;font-size:96px;line-height:1.15;animation:pop .6s ${T2 + 0.1}s both}
#s3 .btn{position:absolute;left:110px;right:110px;top:640px;background:#2563EB;color:#fff;font-weight:800;font-size:50px;text-align:center;padding:34px 0;border-radius:70px;box-shadow:0 0 0 8px rgba(37,99,235,.25),0 18px 40px rgba(0,0,0,.4);animation:pop .5s ${T2 + 0.6}s both}
#s3 .sub{position:absolute;left:0;right:0;top:820px;text-align:center;color:#FBE7C2;font-size:44px;font-weight:700;animation:fadeIn .5s ${T2 + 1}s both}
#s3 .m{position:absolute;left:300px;top:960px;width:480px;animation:up .6s ${T2 + 0.4}s both}
#s3 .m img{width:100%;animation:bob 2s ease-in-out infinite}
</style></head><body><div class="bk">${bokeh}</div>
<div class="sc" id="s1"><div class="h">${hook.map((l, i) => `<div class="${i ? 'a' : ''}" style="animation-delay:${0.1 + i * 0.6}s">${l}</div>`).join('')}</div><div class="m"><img src="${MASCOT}"></div></div>
<div class="sc" id="s2"><div class="tag">${S.tag}</div><div class="h title">${S.title}</div>${body}<div class="chips">${chips}</div><div class="m"><img src="${MASCOT}"></div></div>
<div class="sc" id="s3"><div class="h">${cta.map((l, i) => `<div class="${i ? 'a' : ''}">${l}</div>`).join('')}</div><div class="btn">🌐 afekis.github.io/uychizma</div><div class="sub">Tekin · 1 daqiqada · havola profilda 👆</div><div class="m"><img src="${MASCOT}"></div></div>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.setContent(html);
  await p.waitForTimeout(300);
  await p.evaluate(() => document.getAnimations().forEach(a => a.pause()));
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-f', 'lavfi', '-t', String(DUR), '-i', 'anullsrc=r=44100:cl=stereo',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', '-movflags', '+faststart', outPath]);
  const N = Math.round(DUR * FPS);
  for (let f = 0; f < N; f++) {
    const t = f * 1000 / FPS;
    await p.evaluate(t => document.getAnimations().forEach(a => { a.currentTime = t; }), t);
    const buf = await p.screenshot({ type: 'jpeg', quality: 88 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await b.close();
  console.log('ok', outPath, DUR + 's');
})();
