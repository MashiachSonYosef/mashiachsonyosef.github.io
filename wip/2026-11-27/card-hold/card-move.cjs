// Does the card move when a reader presses another reading? Sampled every 25 ms for a second after the press.
const { chromium } = require('playwright');
const BASE = process.argv[3] || 'http://127.0.0.1:8961/reader';
(async () => {
  const b = await chromium.launch();
  for (const book of (process.argv[2] || 'amos').split(',')) {
    const p = await b.newPage({ viewport: { width: 412, height: 915 } });
    await p.goto(BASE + '/zone.html?b=' + book, { waitUntil: 'networkidle' });
    await p.waitForSelector('section.seg .he-text .wb', { timeout: 30000 });
    for (const wi of [0, 3, 7]) {
      await p.keyboard.press('Escape');
      const ok = await p.evaluate((i) => {
        const w = document.querySelectorAll('section.seg .he-text .wb')[i];
        if (!w) return false;
        (w.querySelector('.w span') || w.querySelector('.w') || w).click();
        return true;
      }, wi);
      if (!ok) continue;
      try { await p.waitForSelector('#hud .r-pills button', { timeout: 8000 }); } catch (e) { console.log(book, 'word', wi + 1, 'no pills opened'); continue; }
      await p.waitForTimeout(700);
      const before = await p.evaluate(() => {
        const h = document.getElementById('hud');
        return { top: Math.round(parseFloat(h.style.top)), h: h.offsetHeight, n: h.querySelectorAll('.r-pills button').length };
      });
      const pills = await p.$$('#hud .r-pills button');
      if (pills.length < 2) { console.log(book, wi + 1, 'one pill'); continue; }
      const trace = [];
      await pills[1].click();
      for (let t = 0; t < 40; t++) {
        trace.push(await p.evaluate(() => {
          const h = document.getElementById('hud');
          return Math.round(parseFloat(h.style.top)) + '/' + h.offsetHeight;
        }));
        await p.waitForTimeout(25);
      }
      const uniq = trace.filter((x, i) => i === 0 || x !== trace[i - 1]);
      console.log(book, 'word', wi + 1, 'pills', before.n, '| before top/height', before.top + '/' + before.h, '| after the press:', uniq.join(' -> '));
    }
    await p.close();
  }
  await b.close();
})();
