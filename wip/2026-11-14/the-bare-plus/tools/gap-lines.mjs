// Every line at rest that holds a hidden sign's gap, book by book: laid as a row of pieces (each piece its own span,
// the joiners their own), left as one text, or a maqaf run's line (word cells and their joiners); and how many of
// the joiners in those lines stand beside a gap. It measures; it changes nothing.
// node gap-lines.mjs <reader dir> <reader base url> [book ...]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readdirSync } from "node:fs";
const [reader, base, ...only] = process.argv.slice(2);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const { zonesServed } = await import(pathToFileURL(join(reader, "tools", "zones-on-disk-v1.mjs")).href);
const books = only.length ? only : zonesServed();
const browser = await (await loadPlaywright()).chromium.launch(launchOptions());
const T = { books: 0, lines: 0, laid: 0, whole: 0, runs: 0, joiners_beside_a_gap: 0, examples_whole: [] };
for (const b of books) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const p = await ctx.newPage();
  try {
    await p.goto(`${base}/zone.html?b=${b}`, { waitUntil: "networkidle", timeout: 120000 });
    await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
    await p.evaluate(() => window.__materialise());
    await p.waitForTimeout(1500);
    const got = await p.evaluate(() => {
      const GAP = String.fromCharCode(0x200b);
      const r = { lines: 0, laid: 0, whole: 0, runs: 0, beside: 0, eg: [] };
      for (const g of document.querySelectorAll(".he-text .wb > .g, .he-text .wjoin > .g")) {
        const t = g.textContent || "";
        if (!t.includes(GAP)) continue;
        r.lines += 1;
        if (t.includes(" + " + GAP) || t.includes(GAP + " + ")) r.textBeside = (r.textBeside || 0) + 1;
        if (g.classList.contains("parts")) {
          r.runs += 1;
          const kids = [...g.children];
          kids.forEach((k, i) => { if (k.classList.contains("g-sep") && ((kids[i - 1] && kids[i - 1].classList.contains("gap")) || (kids[i + 1] && kids[i + 1].classList.contains("gap")))) r.beside += 1; });
        } else if (g.querySelector(":scope > .g-pcs")) {
          r.laid += 1;
          const kids = [...g.querySelector(":scope > .g-pcs").children];
          kids.forEach((k, i) => { if (k.classList.contains("g-pp") && ((kids[i - 1] && kids[i - 1].classList.contains("gap")) || (kids[i + 1] && kids[i + 1].classList.contains("gap")))) r.beside += 1; });
        } else {
          r.whole += 1;
          if (r.eg.length < 3) { const sec = g.closest("section.seg"); r.eg.push(`${(sec && sec.querySelector(".vnum") || {}).textContent || "?"} «${t.split(GAP).join("<gap>").trim().slice(0, 50)}»`); }
        }
      }
      r.textBeside = r.textBeside || 0;
      return r;
    });
    T.books += 1; T.lines += got.lines; T.laid += got.laid; T.whole += got.whole; T.runs += got.runs; T.joiners_beside_a_gap += got.beside;
    for (const e of got.eg) if (T.examples_whole.length < 12) T.examples_whole.push(`${b} ${e}`);
    T.text_joiner_beside_a_gap = (T.text_joiner_beside_a_gap || 0) + got.textBeside;
    console.log(`${b}: ${got.textBeside} with a joiner beside the gap in its text · ${got.lines} lines with a gap · ${got.laid} laid · ${got.whole} whole · ${got.runs} runs · ${got.beside} joiners beside a gap`);
  } catch (e) {
    console.log(`${b}: not read (${String(e.message || e).split("\n")[0]})`);
  } finally { await ctx.close(); }
}
await browser.close();
console.log(JSON.stringify(T, null, 1));
