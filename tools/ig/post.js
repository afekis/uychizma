const { chromium } = require('playwright');
const fs = require('fs');
// Feed post (1080x1350 JPEG): node post.js specs.json outDir
const OUTDIR = process.argv[3];
const fmt = x => x.toFixed(1);

const CSS = `*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;background:#0A1120;font-family:Inter,sans-serif;color:#fff;position:relative;overflow:hidden}
.tag{position:absolute;left:64px;top:60px;background:#FFC93C;color:#1A1300;font-weight:800;font-size:30px;padding:12px 24px;border-radius:30px}
h1{position:absolute;left:64px;right:64px;top:140px;font-size:76px;line-height:1.05;font-weight:800;letter-spacing:-1.5px}
h1 em{font-style:normal;color:#7FB2FF}
.card{position:absolute;left:54px;right:54px;top:400px;height:700px;background:#fff;border-radius:36px;display:flex;align-items:center;justify-content:center;gap:24px;padding:36px}
.card .pl{flex:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center}
.card .pl svg{width:100%;height:100%;max-height:600px}
.card .cap{color:#334;font-weight:700;font-size:24px;margin-top:6px}
.chips{position:absolute;left:54px;right:54px;top:1166px;display:flex;gap:14px;flex-wrap:nowrap}
.chip{background:#152038;border:2px solid #24345A;border-radius:22px;padding:12px 20px;font-size:29px;font-weight:700;white-space:nowrap}
.foot{position:absolute;left:64px;right:64px;bottom:44px;display:flex;justify-content:space-between;font-size:30px;font-weight:600}
.foot .r{color:#9DB8E8}.foot span{color:#9DB8E8}
.list{position:absolute;left:54px;right:54px;top:420px;display:flex;flex-direction:column;gap:22px}
.row{background:#fff;color:#111;border-radius:28px;padding:0 34px;height:110px;display:flex;align-items:center;font-size:36px;font-weight:600}
.row b{color:#1F5FE0;margin-right:12px}
.cmp{position:absolute;left:54px;right:54px;top:400px;height:740px;display:flex;gap:20px}
.cmp .col{flex:1;background:#fff;border-radius:32px;padding:24px;display:flex;flex-direction:column;color:#111}
.cmp .col h3{font-size:36px;font-weight:800;margin-bottom:8px}
.cmp .col .svgs{flex:1;display:flex;flex-direction:column;gap:4px;align-items:center;justify-content:center;min-height:0}
.cmp .col .svgs svg{width:100%;flex:1;min-height:0}
.cmp .col .st{font-size:28px;font-weight:700;line-height:1.5;color:#1F2B44}
.cmp .col .st i{font-style:normal;color:#1F5FE0}`;

const foot = `<div class="foot"><div>UyChizma <span>· tekin, 1 daqiqada</span></div><div class="r">Havola profilda 👆</div></div>`;
function planPage(tag, title, v, extraChip) {
  const pls = v.svgs.map((s, k) => `<div class="pl">${s}${v.svgs.length > 1 ? `<div class="cap">${k + 1}-qavat</div>` : ''}</div>`).join('');
  const chips = [`🏠 ${v.area} m²`, `🛏 ${v.beds} yotoqxona`, `🏢 ${v.floors} qavat`, `📐 ${fmt(v.W)}×${fmt(v.maxY-v.minY)} m`].concat(extraChip || []);
  return `<div class="tag">${tag}</div><h1>${title}</h1><div class="card">${pls}</div><div class="chips">${chips.map(c => `<div class="chip">${c}</div>`).join('')}</div>${foot}`;
}
function listPage(tag, title, rows) {
  return `<div class="tag">${tag}</div><h1>${title}</h1><div class="list">${rows.map(r => `<div class="row">${r}</div>`).join('')}</div>${foot}`;
}
function cmpPage(tag, title, a, b) {
  const col = (h, v) => `<div class="col"><h3>${h}</h3><div class="svgs">${v.svgs.join('')}</div><div class="st">🏠 <i>${v.area} m²</i> · 🛏 ${v.beds} yotoq.<br>📐 ${fmt(v.W)}×${fmt(v.maxY-v.minY)} m</div></div>`;
  return `<div class="tag">${tag}</div><h1>${title}</h1><div class="cmp">${col('1 qavat', a)}${col('2 qavat', b)}</div>${foot}`;
}

// specs: [{id, kind:'plan', tag, title, v:<variant from plans.json>} | {id, kind:'list', tag, title, rows:[..5]} | {id, kind:'cmp', tag, title, a:<v>, b:<v>}]
const SPECS = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const pages = {};
for (const S of SPECS) pages[S.id] = S.kind === 'list' ? listPage(S.tag, S.title, S.rows) : S.kind === 'cmp' ? cmpPage(S.tag, S.title, S.a, S.b) : planPage(S.tag, S.title, S.v);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const [id, html] of Object.entries(pages)) {
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${html}</body></html>`);
    await p.waitForTimeout(200);
    const over = await p.evaluate(() => { const c = document.querySelector('.chips'); return c ? c.scrollWidth > c.clientWidth + 2 : false; });
    if (over) console.log('CHIPS OVERFLOW', id);
    await p.screenshot({ path: `${OUTDIR}/${id}.jpg`, type: 'jpeg', quality: 90 });
    console.log('ok', id);
  }
  await b.close();
})();
