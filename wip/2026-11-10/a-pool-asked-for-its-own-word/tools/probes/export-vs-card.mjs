// The record an exported verse cites for a word, set beside what that word's own card shows: the source the card
// credits its first reading to, and whether that reading stands on the place's own row. The exported files are those
// probes/export-sections.mjs saved from the same build.
// node export-vs-card.mjs <reader dir> <zone url base> <book> <export dir> [--only "<address>;<address>..."] [--limit N] [--show N]
// An address is the file's own "for:" line, such as "Amos 1:2:1". A word whose card answers for several words (a run,
// a span) is counted apart: its card is not that word's alone. Nothing is written. It measures; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync, readdirSync } from "node:fs";
const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const ONLY = flag("--only", ""), LIMIT = Number(flag("--limit", "1000000")), SHOW = Number(flag("--show", "12"));
const [reader, base, book, dir] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const LABELS = Object.fromEntries(Object.entries(JSON.parse(readFileSync(join(reader, "data", "route-store", "index.json"), "utf8")).m_sources || {}).map(([id, m]) => [id, m.label || ""]));
// and the overlays' sources, which the store's index does not hold, from each overlay's own index
for (const d of readdirSync(join(reader, "data", "overlays"))) {
  let ix = null;
  try { ix = JSON.parse(readFileSync(join(reader, "data", "overlays", d, "index.json"), "utf8")); } catch { continue; }
  for (const [id, m] of Object.entries(ix.m_sources || {})) if (!LABELS[id]) LABELS[id] = (m && m.label) || "";
}
const records = (text) => {
  const out = [];
  const body = text.split("# Records, as received")[1] || "";
  let cur = null;
  for (const line of body.split("\n")) {
    const head = /^(\d+)\. (headword|reading): (.*)$/u.exec(line);
    if (head) { cur = { headword: "", reading: "", for: "", source: "" }; cur[head[2]] = head[3]; continue; }
    if (/^#/u.test(line)) { cur = null; continue; }
    const f = /^ {4}(reading|for|source): (.*)$/u.exec(line);
    if (cur && f) { cur[f[1]] = f[2]; if (f[1] === "for") out.push(cur); }
  }
  return out;
};
const src = (s) => s.replace(/^\[\d+\] /u, "").replace(/ · wording .*$/u, "");
const only = new Set(ONLY.split(";").map((x) => x.trim()).filter(Boolean));
let asked = [];
for (const f of readdirSync(dir).filter((x) => /^s\d+\.txt$/u.test(x)).sort()) for (const r of records(readFileSync(join(dir, f), "utf8"))) if (!only.size || only.has(r.for)) asked.push({ ...r, sec: Number(f.slice(1, 4)) });
asked = asked.slice(0, LIMIT);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(800);
const sum = { asked: asked.length, same: 0, place_row_both: 0, differ: [], several: 0, no_card: 0 };
for (const r of asked) {
  const n = Number(r.for.split(":").pop());
  await p.keyboard.press("Escape");
  const there = await p.evaluate(async ({ i, n }) => {
    const s = document.getElementById(`s${i}`); if (!s) return false;
    for (let g = 0; g < 300 && !s.querySelector(".he-text .wb"); g += 1) { s.scrollIntoView({ block: "center" }); await new Promise((q) => setTimeout(q, 20)); }
    const wb = [...s.querySelectorAll(".he-text .wb:not(.mark)")][n - 1]; if (!wb) return false;
    wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); return true;
  }, { i: r.sec, n });
  if (!there) { sum.no_card += 1; continue; }
  { const t0 = Date.now(); let last = null, since = Date.now();
    while (Date.now() - t0 < 9000) {
      if (await p.$("#hud .b-read .r-pills button")) break;
      const now = await p.evaluate(() => { const hud = document.getElementById("hud"); const q = hud && !hud.hidden ? hud.querySelector(".b-read") : null; return q ? q.textContent : null; });
      if (now !== last) { last = now; since = Date.now(); } else if (now !== null && Date.now() - since > 1000) break;
      await p.waitForTimeout(80);
    } }
  await p.waitForTimeout(400);
  const card = await p.evaluate(() => {
    const hud = document.getElementById("hud"); if (!hud || hud.hidden) return null;
    const k = hud.querySelectorAll(".b-read .r-pills button").length;
    return { n: k, several: hud.querySelectorAll(".head b > span:not(.mq)").length > 1, first: k ? (window.__pool || [])[0] ?? "" : "", lead: k ? (window.__poolLead || [])[0] ?? "" : "", place: k ? !!(window.__poolPlace || [])[0] : false };
  });
  if (!card || !card.n) { sum.no_card += 1; continue; }
  if (card.several) { sum.several += 1; continue; }
  const cardSource = LABELS[card.lead] || card.lead;
  if (cardSource === src(r.source)) { sum.same += 1; if (card.place && !r.headword) sum.place_row_both += 1; }
  else sum.differ.push(`${r.for}: the file cites ${src(r.source)} for ${JSON.stringify(r.reading)}; the card credits its first reading ${JSON.stringify(card.first)} to ${cardSource}`);
}
await p.keyboard.press("Escape");
console.log(`${book} · ${sum.asked} words asked: the file cites the source the card credits its first reading to at ${sum.same} (${sum.place_row_both} of them the place's own row in both) · another source at ${sum.differ.length} · a card of several words ${sum.several} · no card or no reading ${sum.no_card}`);
for (const x of sum.differ.slice(0, SHOW)) console.log(`     ${x}`);
if (sum.differ.length > SHOW) console.log(`     and ${sum.differ.length - SHOW} more`);
if (errors.length) console.log(`  page errors: ${errors.slice(0, 3).join(" | ")}`);
await b.close();
