// UyChizma story (1080x1920 JPEG): node story.js specs.json outDir
// spec.theme (har xil qiling, almashtirib): klassik (jigarrang+personaj) | chizma (ko'k blueprint) | quiz (binafsha-pushti) | tur (krem) | fakt (sariq-qora) | yer (yashil)
// specs: [{id:"s-1105-a", theme:"quiz", tag:"YER 11×22 m", title:"...<em>..</em>", plans:[svg..]  | rows:[".."] | big:"1 yoki 2?", sub:"...", chips:[..]}]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [, , specPath, outDir] = process.argv;
const L = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const MASCOT = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'mascot.png')).toString('base64');
const bokeh = Array.from({ length: 16 }, (_, i) => {
  const x = (i * 137) % 1080, y = (i * 389) % 1920, s = 90 + (i * 53) % 160;
  return `<i style="left:${x}px;top:${y}px;width:${s}px;height:${s}px"></i>`;
}).join('');
const CSS = `*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;overflow:hidden;font-family:Inter,sans-serif;background:radial-gradient(ellipse at 50% 42%,#7a4a2a 0%,#4a2b17 55%,#25150b 100%)}
.bk i{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,214,160,.22),rgba(255,214,160,0) 70%);filter:blur(4px)}
.h{font-family:'DejaVu Serif',serif;font-weight:700;color:#FBE7C2;text-transform:uppercase;letter-spacing:2px;text-shadow:0 5px 0 #6B3A1C,0 10px 24px rgba(0,0,0,.45)}
.h em{font-style:normal;color:#FFC13B}
.tag{position:absolute;left:60px;top:200px;background:#FFC13B;color:#2A1606;font-weight:800;font-size:40px;padding:14px 30px;border-radius:40px}
.title{position:absolute;left:60px;right:60px;top:300px;font-size:84px;line-height:1.08}
.card{position:absolute;left:50px;right:50px;top:620px;height:780px;background:#fff;border-radius:40px;display:flex;gap:16px;padding:30px;box-shadow:0 20px 50px rgba(0,0,0,.4)}
.card .pl{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center}
.card .pl svg{width:100%;height:100%;max-height:700px}
.card .cap{font-weight:800;font-size:30px;color:#333}
.rows{position:absolute;left:50px;right:50px;top:640px;display:flex;flex-direction:column;gap:24px}
.row{background:#FFF8EC;color:#2A1606;border-radius:30px;padding:28px 36px;font-size:42px;font-weight:700;line-height:1.2}
.row b{color:#C2410C}
.big{position:absolute;left:40px;right:40px;top:700px;text-align:center;font-size:150px;line-height:1.1}
.sub{position:absolute;left:80px;right:80px;top:1130px;text-align:center;color:#FBE7C2;font-size:46px;font-weight:700;line-height:1.3}
.chips{position:absolute;left:50px;right:50px;top:1430px;display:flex;flex-wrap:wrap;gap:16px}
.chip{background:#FFF8EC;color:#2A1606;border-radius:26px;padding:16px 24px;font-size:38px;font-weight:800}
.m{position:absolute;right:30px;bottom:150px;width:250px}
.m img{width:100%}
.foot{position:absolute;left:0;right:0;bottom:60px;text-align:center}
.foot span{display:inline-block;background:#2563EB;color:#fff;font-weight:800;font-size:40px;padding:22px 44px;border-radius:60px}`;
const TH = {
  chizma: `body{background:#0B2D52;background-image:linear-gradient(rgba(255,255,255,.07) 2px,transparent 2px),linear-gradient(90deg,rgba(255,255,255,.07) 2px,transparent 2px);background-size:120px 120px}.bk,.m{display:none}.h{font-family:'DejaVu Sans Mono',monospace;color:#E8F1FF;text-shadow:none;text-transform:none}.h em{color:#7FD3FF}.tag{background:none;border:3px solid #7FD3FF;color:#7FD3FF;border-radius:0}.row{background:rgba(127,211,255,.12);color:#E8F1FF;border-left:8px solid #7FD3FF;border-radius:0}.row b{color:#7FD3FF}.chip{background:none;border:3px solid #E8F1FF;color:#E8F1FF;border-radius:0}.card{background:#0D3260;border:3px dashed rgba(127,211,255,.6)}.card .pl{mix-blend-mode:screen}.card svg{filter:invert(1) hue-rotate(180deg) saturate(1.4)}.card .cap{color:#7FD3FF}.sub{color:#9CC8F0}`,
  quiz: `body{background:linear-gradient(160deg,#4C1D95,#7C3AED 45%,#DB2777)}.bk,.m{display:none}.h{font-family:Inter,sans-serif;font-weight:900;color:#fff;text-shadow:0 8px 30px rgba(0,0,0,.3);text-transform:none;letter-spacing:-1px}.h em{color:#FDE047}.tag{background:#FDE047;color:#4C1D95}.row{background:#fff;color:#3B0764}.row b{color:#DB2777}.chip{background:rgba(255,255,255,.2);color:#fff}.foot span{background:#FDE047;color:#4C1D95}`,
  tur: `body{background:#F4EDE2}.bk,.m{display:none}.h{font-family:Inter,sans-serif;font-weight:900;color:#1E1B18;text-shadow:none;text-transform:none;letter-spacing:-1px}.h em{color:#D9480F}.tag{background:#1E1B18;color:#F4EDE2}.row{background:#fff;color:#1E1B18;box-shadow:0 8px 24px rgba(60,40,20,.12)}.row b{color:#D9480F}.chip{background:#D9480F;color:#fff}.sub{color:#6B5B4B}.foot span{background:#1E1B18}`,
  fakt: `body{background:#FFD600}.bk,.m{display:none}.h{font-family:Inter,sans-serif;font-weight:900;color:#111;text-shadow:none;letter-spacing:-2px}.h em{color:#fff;background:#111;padding:0 14px}.tag{background:#111;color:#FFD600}.row{background:#111;color:#FFD600;border-radius:12px}.row b{color:#fff}.chip{background:#111;color:#FFD600}.sub{color:#111}.foot span{background:#111;color:#FFD600}`,
  yer: `body{background:radial-gradient(ellipse at 50% 40%,#1F5130,#123620 60%,#0A2214)}.bk,.m{display:none}.h{font-family:Inter,sans-serif;font-weight:900;color:#fff;text-shadow:none;text-transform:none;letter-spacing:-1px}.h em{color:#B8F36B}.tag{background:#B8F36B;color:#0A2214}.row{background:rgba(184,243,107,.12);color:#fff;border:2px solid #B8F36B}.row b{color:#B8F36B}.chip{background:#B8F36B;color:#0A2214}.sub{color:#D7F5C0}.foot span{background:#B8F36B;color:#0A2214}`,
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const S of L) {
    const body = S.plans ? `<div class="card">${S.plans.map((s, k) => `<div class="pl">${s}${S.plans.length > 1 ? `<div class="cap">${k + 1}-qavat</div>` : ''}</div>`).join('')}</div>`
      : S.rows ? `<div class="rows">${S.rows.map(r => `<div class="row">${r}</div>`).join('')}</div>`
      : `<div class="h big">${S.big || ''}</div><div class="sub">${S.sub || ''}</div>`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}${TH[S.theme] || ''}</style></head><body><div class="bk">${bokeh}</div>
${S.tag ? `<div class="tag">${S.tag}</div>` : ''}<div class="h title">${S.title || ''}</div>${body}
<div class="chips">${(S.chips || []).map(c => `<div class="chip">${c}</div>`).join('')}</div>
<div class="m"><img src="${MASCOT}"></div><div class="foot"><span>🌐 Havola profilda 👆</span></div></body></html>`;
    await p.setContent(html);
    await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(outDir, S.id + '.jpg'), type: 'jpeg', quality: 88 });
    console.log('ok', S.id);
  }
  await b.close();
})();
