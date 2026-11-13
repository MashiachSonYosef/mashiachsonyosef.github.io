// A word's card and its notes: the pills it prints, the line of notes under them as the page draws it (the words a
// dictionary opens a numbered sense with), what the page says of the pool's notes, whether any pill prints a note's
// words, and what the card says it withheld. With --keep the pointing is lifted first, so every row of the key is
// asked nothing. With --shot <dir> a picture of each card is kept.
// node notes-on-a-card.mjs <reader dir> <zone url base> <book> <section label>:<word number> [more places ...] [--keep] [--shot <dir>]
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
const argv = process.argv.slice(2);
const si = argv.indexOf("--shot"); const SHOT = si >= 0 ? argv[si + 1] : null; if (si >= 0) argv.splice(si, 2);
const ki = argv.indexOf("--keep"); const KEEP = ki >= 0; if (KEEP) argv.splice(ki, 1);
const [reader, base, book, ...places] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: SHOT ? 2 : 1 });
if (KEEP) await ctx.addInitScript(() => { try { localStorage.setItem("fh.masorah", "keep"); } catch (e) { /* a visit that keeps nothing */ } });
const p = await ctx.newPage();
const faults = [];
p.on("pageerror", (e) => faults.push(String((e && e.stack) || e).slice(0, 600)));
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.evaluate(() => window.__materialise && window.__materialise());
await p.waitForTimeout(1200);
if (SHOT) mkdirSync(SHOT, { recursive: true });
for (const place of places) {
  const cut = place.lastIndexOf(":");
  const label = place.slice(0, cut), n = Number(place.slice(cut + 1));
  await p.keyboard.press("Escape");
  await p.waitForTimeout(150);
  const word = await p.evaluate(async ({ label, n }) => {
    const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && String(s.__sec.label) === label);
    if (!sec) return null;
    for (let g = 0; g < 400 && !sec.querySelector(".he-text .wb"); g += 1) { sec.scrollIntoView({ block: "center" }); await new Promise((q) => setTimeout(q, 20)); }
    const wb = [...sec.querySelectorAll(".he-text .wb:not(.mark)")][n - 1];
    if (!wb) return null;
    wb.scrollIntoView({ block: "center" });
    await new Promise((q) => setTimeout(q, 120));
    window.__pool = null; window.__poolNotes = null;
    (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
    return { s: wb.__word ? wb.__word.s : "", k: wb.__word ? wb.__word.k : "", line: ((wb.querySelector(":scope > .g") || {}).textContent || "").trim() };
  }, { label, n });
  if (!word) { console.log(`${book} ${place}: no such word on the page`); continue; }
  const t0 = Date.now();
  while (Date.now() - t0 < 12000 && !(await p.evaluate(() => Array.isArray(window.__poolNotes)))) await p.waitForTimeout(80);
  await p.waitForTimeout(500);
  const card = await p.evaluate(() => {
    const hud = document.getElementById("hud");
    const txt = (el) => (el ? el.textContent.replace(/\s+/gu, " ").trim() : "");
    const line = hud.querySelector(".sense-notes");
    const where = line ? (line.closest(".d-card") ? "with the record" : line.closest(".b-read") ? "in the readings' band" : "elsewhere") : "nowhere";
    const pills = hud.querySelector(".b-read .r-pills");
    const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height), shown: getComputedStyle(el).display !== "none" }; };
    return { pool: window.__pool || [], notes: window.__poolNotes || [], line: txt(line), where, counted: line ? line.dataset.notes : null,
      spans: line ? [...line.querySelectorAll(".sense-note")].map((x) => ({ ...x.dataset, text: txt(x), color: getComputedStyle(x).color })) : [],
      withheld: txt(hud.querySelector(".b-read .withheld-line")), said: [...hud.querySelectorAll(".b-read > p")].map(txt).filter(Boolean),
      lineBox: box(line), pillsBox: box(pills), hud: hud.className, data: pills ? { ...pills.dataset } : {} };
  });
  const lower = new Set(card.pool.map((t) => String(t).toLowerCase()));
  const asPill = card.notes.filter((x) => lower.has(String(x.text).toLowerCase()));
  console.log(`${book} ${place} · ${word.s} (${word.k}) · the line under the word: «${word.line}»`);
  console.log(`    ${card.pool.length} pills · the page says ${card.notes.length} notes; the line counts ${card.counted ?? "none"} and holds ${card.spans.length} · ${asPill.length} note(s) also stand as a pill`);
  if (card.line) console.log(`    the notes (${card.where}): ${card.line.slice(0, 700)}`);
  for (const s of card.spans.slice(0, 3)) console.log(`      a note: source ${s.m} · entry ${s.entry} · point ${s.point} · «${s.text.slice(0, 80)}» · ink ${s.color}`);
  if (card.withheld) console.log(`    withheld: ${card.withheld.slice(0, 300)}`);
  if (!card.pool.length) console.log(`    the band says: ${card.said.join(" | ").slice(0, 400)}`);
  console.log(`    boxes: pills ${JSON.stringify(card.pillsBox)} · notes ${JSON.stringify(card.lineBox)} · the card is "${card.hud}"`);
  if (SHOT) await p.screenshot({ path: join(SHOT, `${book}-${label.replace(/:/gu, "-")}-${n}${KEEP ? "-keep" : ""}.png`) });
}
if (faults.length) console.log(`PAGE ERRORS (${faults.length}): ${faults[0]}`);
await b.close();
