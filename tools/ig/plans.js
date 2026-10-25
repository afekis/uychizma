// Saytdan uy rejalarini olish: node plans.js configs.json out.json /path/to/uychizma(main klon)
// configs: [{id:"yer-11x22", A:{plotW:11, plotL:22, floors:1, beds:3, family:4, darvoza:false}}]
// A — DEF ustiga yoziladi (plotShape:'trap'|'tri', plotBackW, garage, ayvon, ...).
// Natija: [{id, variants:[{name, area, beds, floors, W, D, minY, maxY, svgs:[...]}]}]  (gabarit: W × (maxY-minY))
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [, , CFG, OUT, REPO] = process.argv;
const CFGS = JSON.parse(fs.readFileSync(CFG, 'utf8'));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  p.on('pageerror', e => console.error('pageerr', e.message));
  await p.goto('file://' + path.resolve(REPO) + '/index.html', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);
  const res = await p.evaluate((CFGS) => CFGS.map(c => {
    const A = Object.assign({}, DEF, c.A);
    return { id: c.id, variants: buildVariants(A).map(v => ({
      name: v.name, area: Math.round(calcArea(v)), beds: v.bedCount, floors: v.floors.length,
      W: v.W, D: v.D, minY: v.minY, maxY: v.maxY, svgs: v.floors.map((f, k) => planSVG(v, k)) })) };
  }), CFGS);
  fs.writeFileSync(OUT, JSON.stringify(res));
  res.forEach(r => console.log(r.id, r.variants.map(v => `${v.name}|${v.area}m2|${v.beds}y|${v.floors}q|${v.W.toFixed(1)}x${(v.maxY - v.minY).toFixed(1)}`).join('  ;  ')));
  await b.close();
})();
