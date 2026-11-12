// The plain list under a chapter set beside the lines the reader draws above it, on the chapter's own address, on
// any build: the list is read off the page as it arrives, the chapter's sections are built (by the page's own
// function where it offers one, else by landing on each section's anchor), the drawn lines are read by the one
// reading of "a line" the tools share, and the two are compared verse by verse, reading by reading.
// node list-vs-line.mjs <reader dir holding tools/resting-lines-v1.mjs> <site origin> <book> <chapter> [<book> <chapter> ...] [--show n]
// Nothing is written. It measures; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const argv = process.argv.slice(2);
const si = argv.indexOf("--show"); const SHOW = si >= 0 ? Number(argv[si + 1]) : 6; if (si >= 0) argv.splice(si, 2);
const [reader, origin, ...pairs] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const { linesInPage } = await import(pathToFileURL(join(reader, "tools", "resting-lines-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
let T = { verses: 0, versesSame: 0, listed: 0, drawn: 0, same: 0 };
for (let x = 0; x + 1 < pairs.length; x += 2) {
  const book = pairs[x], ch = pairs[x + 1];
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const p = await ctx.newPage();
  await p.goto(`${origin}/${book}/${ch}/`, { waitUntil: "networkidle", timeout: 60000 });
  await p.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
  const list = await p.evaluate(() => [...document.querySelectorAll("#porch article.pv")].map((a) => ({
    head: ((a.querySelector("h3") || {}).textContent || "").trim(),
    items: [...a.querySelectorAll(".r > span")].map((s) => { const c = s.cloneNode(true); c.querySelectorAll("sup").forEach((q) => q.remove()); return c.textContent; }),
  })));
  // the chapter's sections, by the labels the list names
  const range = await p.evaluate(async (heads) => {
    const secs = [...document.querySelectorAll("section.seg")];
    const at = [];
    secs.forEach((s, i) => { const l = ((s.querySelector(".vnum") || {}).textContent || "").trim(); if (l && heads.some((h) => h.endsWith(` ${l}`))) at.push(i); });
    // a waiting section shows no number yet on some builds: fall back to the page's own zone, if it offers it
    if (!at.length && window.__zone) { const want = new Set(heads.map((h) => h.split(" ").pop())); window.__zone.sections.forEach((s, i) => { if (want.has(String(s.label))) at.push(i); }); }
    const from = Math.min(...at), to = Math.max(...at) + 1;
    if (typeof window.__materialise === "function") window.__materialise(from, to);
    else for (let i = from; i < to; i += 1) { const a = document.createElement("a"); a.href = `#${secs[i].id}`; a.style.display = "none"; document.body.append(a); a.click(); a.remove(); }
    return [from, to];
  }, list.map((a) => a.head));
  await p.waitForTimeout(2500);
  const got = await p.evaluate(linesInPage, [range[0], range[1]]);
  const labelOf = await p.evaluate(([a, c]) => (window.__zone ? window.__zone.sections.slice(a, c).map((s) => String(s.label)) : []), range);
  let verses = 0, versesSame = 0, listed = 0, drawn = 0, same = 0;
  const eg = [];
  got.sections.forEach((s, i) => {
    const label = labelOf[i] || s.label;
    const L = (list.find((a) => a.head.endsWith(` ${label}`)) || { items: [] }).items;
    const D = s.units.map((u) => u[2]);
    verses += 1; listed += L.length; drawn += D.length;
    let k = 0; for (let j = 0; j < Math.min(L.length, D.length); j += 1) if (L[j] === D[j]) k += 1;
    same += k;
    if (L.length === D.length && k === L.length) versesSame += 1;
    else if (eg.length < SHOW) eg.push(`${label}\n       the list: ${L.join(" · ")}\n       the line: ${D.join(" · ")}`);
  });
  console.log(`${book} ${ch} at ${origin}: ${verses} verses · the list holds ${listed} readings and the reader draws ${drawn} lines · the same reading in the same place: ${same} · verses where the list is the line throughout: ${versesSame} of ${verses}`);
  for (const e of eg) console.log(`     ${e}`);
  T = { verses: T.verses + verses, versesSame: T.versesSame + versesSame, listed: T.listed + listed, drawn: T.drawn + drawn, same: T.same + same };
  await ctx.close();
}
console.log(`in all: ${T.verses} verses · ${T.listed} readings in the lists, ${T.drawn} lines drawn, ${T.same} the same in the same place · ${T.versesSame} verses where the list is the line throughout`);
await b.close();
