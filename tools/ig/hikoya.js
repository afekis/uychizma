// 'hikoya' uslubi — kinematografik hikoya (to'q fon, qog'oz yorliqlar, gazeta, xarita, polaroid, muhr, katta raqamlar, sekin kamera).
// spec.scenes: [{type, say, ...}] — har sahna davomiyligi diktor matni (say) so'zlari soniga mutanosib; voice = barcha say birlashmasi.
// Turlar: big{num,tag,icon:'clock'|'house'} | gazeta{head,svg,tag} | yer{W,L,tag} | polaroid{items:[{svg,cap}],stamp}
//         uslub{num,list:[..]} | sketch{stamp,tag} | hujjat{title,num,tags:[..]} | final{q,a,cta}
const fs = require('fs'), path = require('path');
module.exports = (S, { scene, URL }) => {
  const f64 = n => 'data:font/woff2;base64,' + fs.readFileSync(path.join(__dirname, n)).toString('base64');
  const SC = S.scenes, words = SC.map(s => Math.max(4, String(s.say || '').split(/\s+/).filter(Boolean).length));
  const per = words.map(w => Math.max(3.2, w * 0.5)), starts = [];
  let t = 0; per.forEach(p => { starts.push(t); t += p; }); const D = t + 0.6;
  if (!S.voice) S.voice = SC.map(s => s.say).join(' ');
  const tag = (txt, st = '') => `<div class="tg" style="${st}">${txt}</div>`;
  const ptag = `<div class="pt"><b>UC</b></div>`;
  const clock = (a, d) => `<svg viewBox="0 0 200 200" class="ico"><circle cx="100" cy="100" r="86" fill="none" stroke="#f1e6cf" stroke-width="8"/>${Array.from({ length: 12 }, (_, i) => `<line x1="100" y1="22" x2="100" y2="${i % 3 ? 34 : 42}" stroke="#f1e6cf" stroke-width="${i % 3 ? 4 : 8}" transform="rotate(${i * 30} 100 100)"/>`).join('')}<line x1="100" y1="100" x2="100" y2="58" stroke="#f1e6cf" stroke-width="9" stroke-linecap="round"/><g style="transform-origin:100px 100px;animation:spin ${d}s linear ${a}s both"><line x1="100" y1="112" x2="100" y2="30" stroke="#d1352b" stroke-width="5" stroke-linecap="round"/></g><circle cx="100" cy="100" r="9" fill="#d1352b"/></svg>`;
  const sketch = (a) => { let sd = 3; const r = () => (sd = (sd * 9301 + 49297) % 233280) / 233280 - .5; const L = [[40, 40, 360, 40], [360, 40, 360, 300], [360, 300, 40, 300], [40, 300, 40, 40], [200, 40, 200, 170], [40, 170, 360, 170], [130, 170, 130, 300], [260, 170, 260, 300]];
    return `<svg viewBox="0 0 400 340">${L.map((l, i) => `<path d="M${l[0] + r() * 6} ${l[1] + r() * 6} Q${(l[0] + l[2]) / 2 + r() * 10} ${(l[1] + l[3]) / 2 + r() * 10} ${l[2] + r() * 6} ${l[3] + r() * 6}" pathLength="1" style="fill:none;stroke:#1d2a4a;stroke-width:5;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;animation:draw .4s ${a + .3 + i * .18}s forwards"/>`).join('')}
<g class="hw" style="animation:fadeIn .4s ${a + 1.8}s both"><text x="120" y="112">Zal</text><text x="280" y="112">Oshxona</text><text x="85" y="245">Yotoq</text><text x="195" y="245">Yotoq</text><text x="310" y="245">Vanna</text></g></svg>`; };
  const body = SC.map((s, i) => {
    const a = starts[i], d = per[i], id = 'h' + i, last = i === SC.length - 1, kb = `animation:kb ${d + .6}s linear ${a}s both`;
    let inner = '';
    if (s.type === 'big') inner = `<div class="bg night"></div><div class="kb" style="${kb}">${s.icon === 'clock' ? clock(a + .2, d) : ''}</div><div class="big" style="${s.size ? `font-size:${s.size}px;` : ''}animation:slam .5s ${a + .3}s both">${s.num}</div>${tag(s.tag, `position:absolute;left:80px;top:1250px;transform:rotate(-2deg);animation:pop .4s ${a + 1}s both`)}`;
    else if (s.type === 'gazeta') inner = `<div class="bg navy"></div><div class="kb" style="${kb}"><div class="gz" style="animation:up .6s ${a + .1}s both"><div class="gm">${s.mast || 'UYCHIZMA XABARLARI · №1'}</div><div class="gh">${s.head}</div><div class="gp">${s.svg}</div><div class="gl"><i></i><i></i><i></i><i></i><i></i><i></i></div>${tag(s.tag, 'position:absolute;left:50px;bottom:40px')}</div></div>${ptag}`;
    else if (s.type === 'yer') { const sc = Math.min(26, 560 / s.W, 860 / s.L), w = s.W * sc, h = s.L * sc, x0 = Math.round((1080 - w) / 2 - 40), y0 = 560, H = s.house;
      inner = `<div class="bg paper"></div><div class="kb" style="${kb}"><svg viewBox="0 0 1080 1920" class="full"><path d="M-40 1720 C 300 1560, 700 1640, 1120 1480" fill="none" stroke="#3b3b3b" stroke-width="4" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.4s ${a + .2}s forwards"/>
<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="rgba(209,53,43,.06)" stroke="#d1352b" stroke-width="7" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.2s ${a + .8}s forwards"/>
${H ? `<rect x="${x0 + (w - H.w * sc) / 2}" y="${y0 + 3 * sc}" width="${H.w * sc}" height="${H.d * sc}" fill="#2b2f36" opacity=".85" style="animation:pop .5s ${a + 2.2}s both"/><text x="${x0 + w / 2}" y="${y0 + 3 * sc + H.d * sc / 2 + 14}" text-anchor="middle" style="font-family:Typ;font-size:38px;fill:#efe6d2;animation:fadeIn .4s ${a + 2.6}s both">${H.label || 'UY'}</text>` : ''}
<circle cx="${x0 + w / 2}" cy="${y0 + h / 2}" r="${Math.max(w, h) * .62}" fill="none" stroke="#d1352b" stroke-width="3" opacity=".45" style="animation:fadeIn .5s ${a + 1.8}s both"/></svg></div>
${tag(s.W + ' M', `position:absolute;left:${x0 + w / 2 - 70}px;top:${y0 - 72}px;animation:pop .35s ${a + 1.6}s both`)}${tag(s.L + ' M', `position:absolute;left:${Math.min(x0 + w + 20, 900)}px;top:${y0 + h / 2 - 30}px;animation:pop .35s ${a + 1.8}s both`)}${tag(s.tag, `position:absolute;left:80px;top:${Math.max(y0 + h + 60, 1400)}px;transform:rotate(-2deg);animation:pop .35s ${a + 2.1}s both`)}${ptag}`; }
    else if (s.type === 'polaroid') inner = `<div class="bg navy"></div><div class="kb" style="${kb}">${s.items.map((p, k) => `<div class="pol" style="left:${[50, 330, 610][k]}px;top:${[330, 960, 380][k]}px;--r:${[-7, 3, 8][k]}deg;animation:drop .5s ${a + .3 + k * .7}s both"><div class="pi">${p.svg}</div><div class="pc">${p.cap}</div></div>`).join('')}</div><div class="stamp" style="left:90px;top:1060px;animation:stamp .4s ${a + 2.6}s both">${s.stamp}</div>${ptag}`;
    else if (s.type === 'uslub') inner = `<div class="bg night"></div><div class="kb" style="${kb}"><svg viewBox="0 0 600 400" class="house"><path d="M60 380 V180 L300 40 L540 180 V380 Z M230 380 V260 H370 V380 M110 220 h70 v60 h-70z M420 220 h70 v60 h-70z" fill="none" stroke="#f1e6cf" stroke-width="6" stroke-linejoin="round" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.6s ${a + .2}s forwards"/></svg></div><div class="big" style="top:250px;animation:slam .5s ${a + .2}s both">${s.num}</div><div class="ul">${s.list.map((x, k) => tag(x, `transform:rotate(${[-3, 2, -1, 3, -2][k % 5]}deg);animation:pop .35s ${a + .9 + k * .3}s both`)).join('')}</div>${ptag}`;
    else if (s.type === 'sketch') inner = `<div class="bg navy"></div><div class="kb" style="${kb}"><div class="pol big1" style="left:140px;top:420px;--r:-4deg;animation:drop .5s ${a + .1}s both"><div class="pi note">${sketch(a)}</div><div class="pc">${s.cap || 'daftardagi chizma'}</div></div></div><div class="stamp green" style="left:520px;top:1300px;animation:stamp .4s ${a + 2.6}s both">${s.stamp}</div>${tag(s.tag, `position:absolute;left:90px;top:1480px;animation:pop .35s ${a + 1}s both`)}${ptag}`;
    else if (s.type === 'hujjat') inner = `<div class="bg night"></div><div class="kb" style="${kb}"><div class="doc" style="left:220px;top:640px;transform:rotate(7deg);animation:up .5s ${a + .1}s both"></div><div class="doc" style="left:190px;top:620px;transform:rotate(-4deg);animation:up .5s ${a + .25}s both"></div><div class="doc" style="left:180px;top:600px;transform:rotate(1deg);animation:up .5s ${a + .4}s both"><div class="dt">${s.title}</div><div class="gl"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="sig">imzo: ________</div></div></div><div class="big" style="top:220px;animation:slam .5s ${a + .8}s both">${s.num}</div><div class="ul" style="top:1640px">${s.tags.map((x, k) => tag(x, `animation:pop .35s ${a + 1.4 + k * .3}s both`)).join('')}</div>${ptag}`;
    else if (s.type === 'reja') inner = `<div class="bg navy"></div><div class="kb" style="${kb}"><div class="pol big1" style="left:120px;top:${s.title ? 400 : 300}px;--r:${s.r || -3}deg;animation:drop .5s ${a + .1}s both"><div class="pi" style="gap:10px">${s.svgs.map(x => `<div style="flex:1;height:100%">${x}</div>`).join('')}</div><div class="pc">${s.cap || ''}</div></div></div>${s.title ? `<div class="q" style="top:150px;font-size:96px;animation:up .5s ${a + .1}s both">${s.title}</div>` : ''}<div class="ul" style="top:${s.title ? 1360 : 1260}px">${(s.tags || []).map((x, k) => tag(x, `transform:rotate(${[-2, 2, -1, 3][k % 4]}deg);animation:pop .35s ${a + 1 + k * .35}s both`)).join('')}</div>${s.stamp ? `<div class="stamp${s.green ? ' green' : ''}" style="left:520px;top:${s.title ? 1180 : 1080}px;animation:stamp .4s ${a + 2.2}s both">${s.stamp}</div>` : ''}${ptag}`;
    else if (s.type === 'royxat') inner = `<div class="bg night"></div><div class="kb" style="${kb}"><div class="doc" style="left:110px;top:${s.big ? 560 : 380}px;width:860px;height:${s.big ? 1080 : 1240}px;transform:rotate(-1.5deg);animation:up .5s ${a + .1}s both"><div class="dt">${s.title}</div>${s.rows.map((r, k) => `<div class="rw" style="animation:left .35s ${a + .8 + k * (Math.max(.5, (d - 2) / s.rows.length))}s both">${r.replace(/^❌/, '<b class="no">✗</b>').replace(/^✅/, '<b class="ok">✓</b>')}</div>`).join('')}</div></div>${s.big ? `<div class="big" style="top:200px;font-size:150px;animation:slam .5s ${a + .2}s both">${s.big}</div>` : ''}${ptag}`;
    else if (s.type === 'final') inner = `<div class="bg navy"></div><div class="q" style="animation:up .5s ${a + .1}s both">${s.q}</div><div class="stamp" style="left:110px;top:760px;font-size:96px;animation:stamp .45s ${a + 1.2}s both">${s.a}</div><div class="url" style="animation:pop .5s ${a + 2.4}s both">🌐 ${URL}</div><div class="cta" style="animation:fadeIn .5s ${a + 2.8}s both">${s.cta || 'havola profilda 👆'}</div>`;
    return scene(id, a, a + d, inner, last);
  }).join('');
  const css = `@font-face{font-family:Osw;src:url(${f64('oswald.woff2')})}@font-face{font-family:Typ;src:url(${f64('courierprime.woff2')})}@font-face{font-family:Hand;src:url(${f64('caveat.woff2')})}
@keyframes kb{from{transform:scale(1)}to{transform:scale(1.08)}} @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes drop{0%{opacity:0;transform:translateY(-140px) rotate(calc(var(--r) - 12deg)) scale(1.15)}100%{opacity:1;transform:rotate(var(--r))}}
@keyframes stamp{0%{opacity:0;transform:scale(2.6) rotate(-6deg)}70%{opacity:1;transform:scale(.94) rotate(-6deg)}100%{opacity:1;transform:scale(1) rotate(-6deg)}}
body{background:#0d1426;font-family:Inter,sans-serif}
.bg{position:absolute;inset:0}.night{background:radial-gradient(ellipse at 50% 30%,#22345e 0%,#111b33 55%,#070b16 100%)}.navy{background:radial-gradient(ellipse at 50% 45%,#1a2541,#0b1120 75%)}
.paper{background:#ece3cf;background-image:radial-gradient(rgba(120,90,40,.10) 1px,transparent 1.5px);background-size:9px 9px}
.kb{position:absolute;inset:0;transform-origin:50% 45%} .full{position:absolute;inset:0;width:100%;height:100%}
.ico{position:absolute;left:290px;top:420px;width:500px}
.big{position:absolute;left:40px;right:40px;top:1000px;text-align:center;font-family:Osw;font-weight:700;font-size:190px;line-height:1;color:#f1e6cf;letter-spacing:2px;text-shadow:0 10px 40px rgba(0,0,0,.6)}
.tg{display:inline-block;background:#efe6d2;color:#1b1b1b;font-family:Typ;font-weight:700;font-size:40px;letter-spacing:3px;text-transform:uppercase;padding:12px 26px;box-shadow:0 8px 20px rgba(0,0,0,.45)}
.pt{position:absolute;left:60px;bottom:120px;width:120px;height:70px;background:#c8a46a;border-radius:6px 18px 18px 6px;display:flex;align-items:center;justify-content:center;transform:rotate(-12deg);box-shadow:0 6px 14px rgba(0,0,0,.4);font-family:Typ;color:#3a2a14;font-size:30px}
.pt:before{content:'';position:absolute;left:12px;width:14px;height:14px;border-radius:50%;background:#0d1426}
.gz{position:absolute;left:90px;right:90px;top:330px;height:1200px;background:#f1ead9;transform:rotate(-3deg);padding:50px;box-shadow:0 30px 70px rgba(0,0,0,.6)}
.gm{font-family:Typ;font-size:30px;letter-spacing:4px;color:#333;border-bottom:3px solid #222;padding-bottom:14px;text-align:center}
.gh{font-family:Osw;font-weight:700;font-size:96px;line-height:1.02;color:#111;margin:26px 0;text-transform:uppercase;text-align:center}
.gp{height:520px;background:#fff;border:3px solid #222;padding:16px;display:flex;filter:grayscale(1) contrast(1.15)} .gp svg{width:100%;height:100%}
.gl{margin-top:26px;display:flex;flex-direction:column;gap:16px} .gl i{display:block;height:12px;background:#b9b1a0;border-radius:3px} .gl i:nth-child(3n){width:70%}
.pol{position:absolute;width:420px;background:#f7f4ec;padding:22px 22px 0;box-shadow:0 24px 50px rgba(0,0,0,.6);transform:rotate(var(--r))}
.pol.big1{width:800px} .pi{height:420px;background:#fff;display:flex;align-items:center;justify-content:center} .pol.big1 .pi{height:680px}
.pi svg{width:100%;height:100%} .pi.note{background:#fbf6e9;background-image:repeating-linear-gradient(#fbf6e9 0 46px,#cfd9ee 46px 48px)}
.pc{font-family:Typ;font-weight:700;font-size:38px;color:#222;text-align:center;padding:18px 0 22px;text-transform:uppercase;letter-spacing:2px}
.hw{font-family:Hand;font-size:34px;fill:#1d2a4a}
.stamp{position:absolute;font-family:Osw;font-weight:700;font-size:78px;color:#d1352b;border:8px solid #d1352b;padding:6px 30px;letter-spacing:3px;text-transform:uppercase;background:rgba(209,53,43,.06)} .stamp.green{color:#2f9e5b;border-color:#2f9e5b}
.house{position:absolute;left:190px;top:620px;width:700px;opacity:.85}
.ul{position:absolute;left:70px;right:70px;top:1180px;display:flex;flex-wrap:wrap;gap:22px;justify-content:center}
.doc{position:absolute;width:720px;height:900px;background:#f3eee2;box-shadow:0 20px 50px rgba(0,0,0,.55);padding:60px}
.dt{font-family:Osw;font-weight:700;font-size:70px;color:#111;text-align:center;border-bottom:4px solid #222;padding-bottom:20px} .sig{font-family:Typ;font-size:34px;color:#333;margin-top:60px}
.q{position:absolute;left:60px;right:60px;top:380px;text-align:center;font-family:Osw;font-weight:700;font-size:120px;line-height:1.05;color:#f1e6cf;text-transform:uppercase} .q em{color:#d1352b;font-style:normal}
.url{position:absolute;left:90px;right:90px;top:1240px;background:#efe6d2;color:#111;text-align:center;font-family:Typ;font-weight:700;font-size:46px;padding:30px 0;box-shadow:0 10px 30px rgba(0,0,0,.5)}
.cta{position:absolute;left:0;right:0;top:1400px;text-align:center;font-family:Typ;font-size:40px;color:#cfc4ad}
.rw{font-family:Typ;font-weight:700;font-size:44px;color:#1b1b1b;margin-top:34px;line-height:1.25;padding-left:8px}.rw b{display:inline-block;width:56px}.rw .no{color:#d1352b}.rw .ok{color:#2f9e5b}
.vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,transparent 55%,rgba(0,0,0,.6) 100%)}
.grain{position:absolute;inset:0;pointer-events:none;opacity:.10;mix-blend-mode:overlay}`;
  const PAL = { tun: ['#22345e', '#111b33', '#070b16', '#1a2541', '#0b1120', '#f1e6cf', '#d1352b'],
    bordo: ['#6b1b2a', '#3a0d16', '#170408', '#5a1624', '#22060c', '#f6e7d2', '#f2b134'],
    zumrad: ['#1f6b5a', '#0f3b33', '#04140f', '#185447', '#06201a', '#eef3e2', '#ff7a45'],
    qahva: ['#7a4a2a', '#3d2414', '#170c05', '#5e3920', '#1f120a', '#f7e6c8', '#e0453a'],
    binafsha: ['#4b2d80', '#25144a', '#0d0620', '#3d2569', '#140a2c', '#f3e9ff', '#ffcc33'],
    komir: ['#3d3d3d', '#1e1e1e', '#080808', '#333333', '#111111', '#f5f5f0', '#ff6b1a'],
    okean: ['#1b6f86', '#0d3b4a', '#03161d', '#155b6e', '#061f28', '#eaf6f7', '#ffd166'],
    qizil: ['#a3262a', '#5e1214', '#220506', '#8a1f22', '#2e0809', '#fff1e0', '#ffd23f'] };
  const pc = PAL[S.palette] || PAL.tun;
  const palCss = `body{background:${pc[2]}}.night{background:radial-gradient(ellipse at 50% 30%,${pc[0]} 0%,${pc[1]} 55%,${pc[2]} 100%)}.navy{background:radial-gradient(ellipse at 50% 45%,${pc[3]},${pc[4]} 75%)}.big,.q{color:${pc[5]}}.q em{color:${pc[6]}}.stamp:not(.green){color:${pc[6]};border-color:${pc[6]}}.pt:before{background:${pc[2]}}`;
  const grain = `<svg class="grain" viewBox="0 0 1080 1920"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/></filter><rect width="1080" height="1920" filter="url(#n)"/></svg>`;
  return { css: css + palCss, html: body + `<div class="vig"></div>` + grain, D };
};
