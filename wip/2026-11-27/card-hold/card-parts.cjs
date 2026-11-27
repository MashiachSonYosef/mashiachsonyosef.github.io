// Which part of the card changes height when another reading is pressed? Lists the card's parts before and after.
const { chromium } = require('playwright');
const BASE = process.argv[3] || 'http://127.0.0.1:8961/reader';
const parts = () => {
  const h = document.getElementById('hud');
  const out = [];
  const say = (el, depth) => {
    const r = el.getBoundingClientRect();
    out.push({ d: depth, tag: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''), top: Math.round(r.top), h: Math.round(r.height), sh: el.scrollHeight, st: el.scrollTop, mh: el.style.maxHeight || '', hh: el.style.height || '' });
  };
  say(h, 0);
  for (const c of h.children) { say(c, 1); for (const g of c.children) { say(g, 2); if (/band|rows|b-/.test(g.className || '')) for (const k of g.children) say(k, 3); } }
  const a = h.querySelector('.r-pills button[aria-pressed="true"]');
  const w = document.querySelector('.wb.open, .wb[aria-expanded="true"]');
  return { parts: out, pressedTop: a ? Math.round(a.getBoundingClientRect().top) : null, win: window.innerHeight, scrollY: Math.round(window.scrollY) };
};
(async () => {
  const b = await chromium.launch();
  const book = process.argv[2] || 'amos';
  const wi = Number(process.argv[4] || 0);
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  await p.goto(BASE + '/zone.html?b=' + book, { waitUntil: 'networkidle' });
  await p.waitForSelector('section.seg .he-text .wb', { timeout: 30000 });
  await p.evaluate((i) => { const w = document.querySelectorAll('section.seg .he-text .wb')[i]; (w.querySelector('.w span') || w.querySelector('.w') || w).click(); }, wi);
  await p.waitForSelector('#hud .r-pills button', { timeout: 8000 });
  await p.waitForTimeout(900);
  const before = await p.evaluate(parts);
  const pills = await p.$$('#hud .r-pills button');
  const second = await pills[1].evaluate((el) => Math.round(el.getBoundingClientRect().top));
  await pills[1].click();
  await p.waitForTimeout(900);
  const after = await p.evaluate(parts);
  console.log('window', before.win, 'scrollY', before.scrollY, '->', after.scrollY, '| the second pill stood at', second, 'and stands pressed at', after.pressedTop);
  const key = (x, i) => x.d + ' ' + x.tag.replace(/\.(on|sel|open|pressed)\b/g, '');
  const n = Math.max(before.parts.length, after.parts.length);
  for (let i = 0; i < n; i++) {
    const x = before.parts[i], y = after.parts[i];
    const fmt = (z) => z ? `${'  '.repeat(z.d)}${z.tag.slice(0, 60)} top ${z.top} h ${z.h} sh ${z.sh}${z.st ? ' st ' + z.st : ''}${z.mh ? ' maxH ' + z.mh : ''}${z.hh ? ' H ' + z.hh : ''}` : '(none)';
    const same = x && y && x.tag === y.tag && x.top === y.top && x.h === y.h;
    console.log(same ? '  = ' + fmt(x) : '  < ' + fmt(x) + '\n  > ' + fmt(y));
  }
  await b.close();
})();
