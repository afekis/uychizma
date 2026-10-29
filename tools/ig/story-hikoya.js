// Story (1080x1920 JPEG) 'hikoya' uslubida: node story-hikoya.js specs.json outDir
// specs: [{id, palette, scene:{type,...}}] — sahna turlari hikoya.js dagidek (say kerak emas). Animatsiyalar oxirgi holatda suratga olinadi.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [, , specPath, outDir] = process.argv;
const L = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const KF = fs.readFileSync(path.join(__dirname, 'reel.js'), 'utf8').match(/const KF = `([\s\S]*?)`;/)[1];
const scene = (id, a, b, inner) => `<div class="sc" id="${id}">${inner}</div>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const S of L) {
    const sc = Object.assign({ say: 'x x x x x x' }, S.scene);
    const { css, html } = require(path.join(__dirname, 'hikoya.js'))({ scenes: [sc], palette: S.palette, voice: 'x' }, { scene, URL: 'afekis.github.io/uychizma' });
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${KF}${css}.kb{animation:none!important;transform:scale(1.03)}</style></head><body>${html}</body></html>`);
    await p.waitForTimeout(300);
    await p.evaluate(() => document.getAnimations().forEach(a => { try { a.finish(); } catch (e) { a.currentTime = 1e6; } }));
    await p.waitForTimeout(100);
    await p.screenshot({ path: path.join(outDir, S.id + '.jpg'), type: 'jpeg', quality: 90 });
    console.log('ok', S.id);
  }
  await b.close();
})();
