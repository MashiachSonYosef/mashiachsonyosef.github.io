// The file a reader gets when exporting a verse, for the first N verses of a book, each saved as the page wrote it.
// node export-sections.mjs <reader dir> <zone url base> <book> <out dir> [--from N] [--count N] [--kind 1|2|3] [--off id,id] [--open I:J]...
// --open I:J presses word J (from 0, marks not counted) of section I and closes its card before anything is exported,
// so a card's word stands in the page's memory (the state the export's pool used to read).
// Nothing in the tree is written. It collects; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const opens = []; for (let i = argv.indexOf("--open"); i > -1; i = argv.indexOf("--open")) { opens.push(argv[i + 1].split(":").map(Number)); argv.splice(i, 2); }
const FROM = Number(flag("--from", "0")), COUNT = Number(flag("--count", "10")), KIND = Number(flag("--kind", "3")), OFF = flag("--off", "").split(",").map((x) => x.trim()).filter(Boolean);
const [reader, base, book, outDir] = argv;
mkdirSync(outDir, { recursive: true });
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, acceptDownloads: true });
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
if (OFF.length) await p.addInitScript((ids) => { try { localStorage.setItem("fh.sources.off", JSON.stringify(ids)); } catch { /* nothing remembered */ } }, OFF);
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(800);
const bring = (i) => p.evaluate(async (i) => { const s = document.getElementById(`s${i}`); if (!s) return false; s.scrollIntoView({ block: "center" }); for (let g = 0; g < 200 && !s.querySelector(".he-text .wb"); g += 1) await new Promise((r) => setTimeout(r, 20)); return true; }, i);
for (const [i, j] of opens) {
  await bring(i);
  await p.evaluate(({ i, j }) => { const wb = [...document.querySelectorAll(`#s${i} .he-text .wb:not(.mark)`)][j]; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); }, { i, j });
  const t0 = Date.now(); while (Date.now() - t0 < 9000 && !(await p.$("#hud .b-read .r-pills button"))) await p.waitForTimeout(80);
  await p.waitForTimeout(500);
  const said = await p.evaluate(() => window.__cardGradedBy || "");
  await p.keyboard.press("Escape");
  await p.waitForTimeout(250);
  console.log(`  opened and closed a card at section ${i} word ${j} (graded by ${JSON.stringify(said)})`);
}
let saved = 0;
const exportOne = async (i) => {
  if (!(await bring(i))) return null;
  await p.waitForTimeout(250);
  // the export is one button in the section's pill row that drops a menu; the menu's first row is this section's
  const opener = await p.$(`#s${i} .xp-open`);
  if (!opener) { console.log(`  section ${i}: no export button`); return false; }
  if (!(await p.$(`#s${i} .xp-menu .xp-row .xp`))) { await opener.click(); await p.waitForSelector(`#s${i} .xp-menu .xp-row .xp`, { timeout: 15000 }); }
  const btn = await p.evaluateHandle(({ i, k }) => { const row = document.querySelector(`#s${i} .xp-menu .xp-row`); return row ? row.querySelectorAll(".xp")[k - 1] || null : null; }, { i, k: KIND });
  if (!btn.asElement()) { console.log(`  section ${i}: no export button of kind ${KIND}`); return false; }
  await btn.asElement().click();
  try { await p.waitForFunction((i) => /Press again/u.test((document.querySelector(`#s${i} .xp-note`) || {}).textContent || ""), i, { timeout: 30000 }); }
  catch { console.log(`  section ${i}: the export did not arm (${JSON.stringify(await p.evaluate((i) => ((document.querySelector(`#s${i} .xp-note`) || {}).textContent || "").slice(0, 120), i))})`); return false; }
  const [dl] = await Promise.all([p.waitForEvent("download", { timeout: 30000 }), p.click(`#s${i} .xp-menu .xp-row .xp.armed`)]);
  const text = readFileSync(await dl.path(), "utf8");
  writeFileSync(join(outDir, `s${String(i).padStart(3, "0")}.txt`), text);
  saved += 1;
  await p.waitForTimeout(150);
  return true;
};
for (let i = FROM; i < FROM + COUNT; i += 1) {
  let done = false;
  // a verse that did not export is asked once more (the menu's first paint and a download can cross)
  for (let tries = 0; tries < 2 && !done; tries += 1) {
    try { const r = await exportOne(i); if (r === null) { done = true; i = Infinity; } else done = r; }
    catch (e) { console.log(`  section ${i}: ${String(e.message || e).split("\n")[0].slice(0, 140)}${tries ? "" : " (asked again)"}`); await p.keyboard.press("Escape"); await p.waitForTimeout(400); }
  }
}
console.log(`${book} · ${saved} verses exported to ${outDir}${OFF.length ? ` · sources off: ${OFF.join(" ")}` : ""}${errors.length ? ` · page errors: ${errors.slice(0, 2).join(" | ")}` : ""}`);
await b.close();
