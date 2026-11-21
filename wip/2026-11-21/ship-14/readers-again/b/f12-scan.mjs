// Finding 12, step 2: walk a whole book (scrolling, so every section is built) and print each run line the page let
// down to fit (an inline font size on the run's line), with a count of the keyed cells seen.
// node f12-scan.mjs <book> <extra query> <width> [max screens]
import { chromium, BASE, ready, mask } from "./lib.mjs";
const [BOOK, EXTRA = "", WIDTH = "412", MAXS = "400"] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: Number(WIDTH), height: 915 } });
await p.goto(`${BASE}?b=${BOOK}${EXTRA}`, { waitUntil: "domcontentloaded" }); await ready(p);
const seen = new Map(); let cells = 0; const all = new Set();
for (let s = 0; s < Number(MAXS); s++) {
  const r = await p.evaluate(() => { const out = []; let n = 0; for (const r of document.querySelectorAll(".wjoin")) { if (!r.__key) continue; n++; const g = r.querySelector(":scope > .g"); const sec = r.closest("section.seg"); const id = `${(sec.querySelector(".vnum") || {}).textContent}#${[...sec.querySelectorAll(".wjoin")].indexOf(r)}`; out.push({ id, fs: g && g.style.fontSize ? g.style.fontSize : "", cls: g ? g.className : "", words: r.__words ? r.__words.length : 0, chain: !!r.__chain, named: !!r.__run, text: g ? g.textContent.trim().slice(0, 70) : "" }); } const end = window.scrollY + innerHeight >= document.documentElement.scrollHeight - 4; window.scrollBy(0, innerHeight * 3); return { out, end, y: window.scrollY }; });
  for (const x of r.out) { all.add(x.id); if (x.fs && !seen.has(x.id)) { seen.set(x.id, x); console.log(`let down: ${x.id} words=${x.words} chain=${x.chain} named=${x.named} line[${x.cls}] fontSize=${x.fs} text=${JSON.stringify(mask(x.text))}`); } }
  if (r.end) break;
  await p.waitForTimeout(350);
}
console.log(`${BOOK}${EXTRA || " (at rest)"} at ${WIDTH}px: keyed cells seen ${all.size}; run lines let down ${seen.size}`);
await b.close();
