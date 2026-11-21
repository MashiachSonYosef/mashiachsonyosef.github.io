// Finding 12, step 1: which run lines the page let down to fit (an inline font size on the run's line).
// Visits each place given as book:label and prints every run line in the sections drawn there.
// node f12-find.mjs <extra query> <width> <book> <label> [label ...]
import { chromium, BASE, ready, noHe, mask } from "./lib.mjs";
const [EXTRA, WIDTH, BOOK, ...LABELS] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: Number(WIDTH), height: 915 } });
const seen = new Set();
for (const LABEL of LABELS) {
  const p = await ctx.newPage();
  await p.goto(`${BASE}?b=${BOOK}${EXTRA}#${LABEL}`, { waitUntil: "domcontentloaded" }); await ready(p);
  await p.waitForFunction((label) => [...document.querySelectorAll("section.seg")].some((s) => (s.querySelector(".vnum") || {}).textContent === label && s.querySelector(".he-text .wb")), LABEL, { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(1500);
  const rows = await p.evaluate(() => [...document.querySelectorAll(".wjoin")].filter((r) => r.__key).map((r) => { const g = r.querySelector(":scope > .g"); const sec = r.closest("section.seg"); const c = g ? g.cloneNode(true) : null; if (c) c.querySelectorAll(".g-lic").forEach((x) => x.remove());
    return `${(sec.querySelector(".vnum") || {}).textContent} words=${r.__words ? r.__words.length : "?"} chain=${!!r.__chain} named=${!!r.__run} line[${g ? g.className : "none"}] fontSize=${g && g.style.fontSize ? g.style.fontSize : "-"} computed=${g ? getComputedStyle(g).fontSize : "-"} text=${JSON.stringify(c ? c.textContent.trim().slice(0, 60) : null)}`; }));
  for (const r of rows) if (!seen.has(r)) { seen.add(r); console.log(mask(r)); }
  await p.close();
}
await b.close();
