// The lines the page reads LIVE from the store after a reader switches sources off (the baked leader's carriers and
// its alternate's are all off, so the page asks the pool), each set beside the first reading of that word's own card
// under the same switches. The card grades its pool by the word's own pointing; the question is whether the live line
// reads the same reading.
// node live-lines.mjs <reader dir> <zone url base> <book> --off <id,id,...> [--sections N] [--limit N] [--dump file]
// node live-lines.mjs <reader dir> <zone url base> <book> --survey          (which sources carry the lines, by words)
// Every line is read before any card is opened, so no card's word stands in the page's memory when the lines are
// painted. Nothing is written but the dump. It measures; it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
const argv = process.argv.slice(2);
const has = (f) => { const i = argv.indexOf(f); if (i < 0) return false; argv.splice(i, 1); return true; };
const flag = (f, d) => { const i = argv.indexOf(f); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const SURVEY = has("--survey"), OFF = flag("--off", "").split(",").map((x) => x.trim()).filter(Boolean);
const SECTIONS = Number(flag("--sections", "60")), LIMIT = Number(flag("--limit", "60")), DUMP = flag("--dump", null), SHOW = Number(flag("--show", "14"));
// [--lines <file>]: every line read live, a run's words and all, written as JSON and no card opened (to set two builds side by side)
const LINES = flag("--lines", null);
const [reader, base, book] = argv;
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const LABELS = Object.fromEntries(Object.entries(JSON.parse(readFileSync(join(reader, "data", "route-store", "index.json"), "utf8")).m_sources || {}).map(([id, m]) => [id, m.label || ""]));
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
if (OFF.length) await p.addInitScript((ids) => { try { localStorage.setItem("fh.sources.off", JSON.stringify(ids)); } catch { /* nothing remembered */ } }, OFF);
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(800);
if (SURVEY) {
  const s = await p.evaluate(() => {
    const z = window.__zone, by = {}, place = {};
    let words = 0;
    for (const sec of z.sections || []) for (const w of sec.words || []) {
      if (!w || w.mark) continue;
      words += 1;
      for (const pc of w.pg || []) if (pc && pc.s) place[pc.s] = (place[pc.s] || 0) + 1;
      const gm = z.gloss_m && w.k ? z.gloss_m[w.k] : null;
      for (const id of (gm && gm.by) || []) by[id] = (by[id] || 0) + 1;
    }
    return { words, by, place, off: window.__sourcesOff || [] };
  });
  console.log(`${book} · ${s.words.toLocaleString("en-US")} words · sources off now: ${s.off.join(" ") || "none"}`);
  console.log(`  the pieces at the place, by the source that wrote them: ${Object.entries(s.place).sort((a, c) => c[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(" · ")}`);
  console.log("  the table's line carried by (a word counts once for each carrier):");
  for (const [id, n] of Object.entries(s.by).sort((a, c) => c[1] - a[1]).slice(0, 16)) console.log(`    ${String(n).padStart(6)} · ${id} ${LABELS[id] || ""}`);
  await b.close();
  process.exit(0);
}
const norm = (t) => String(t ?? "").replace(/\s+/g, " ").trim();
const signOnly = (t) => /^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+)$/u.test(String(t).trim());
const printed = (t) => {
  const pieces = norm(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/, "").split(" + ").map((x) => x.replace(/​/gu, "").trim());
  const kept = pieces.filter((x) => x && !signOnly(x));
  return (kept.length ? kept : pieces.filter(Boolean)).join(" + ").toLowerCase();
};
// bring the first sections into being, one at a time
for (let i = 0; i < SECTIONS; i += 1) {
  const there = await p.evaluate(async (i) => { const s = document.getElementById(`s${i}`); if (!s) return false; s.scrollIntoView({ block: "center" }); for (let g = 0; g < 200 && !s.querySelector(".he-text .wb"); g += 1) await new Promise((r) => setTimeout(r, 20)); return true; }, i);
  if (!there) break;
  await p.waitForTimeout(40);
}
// and let the live lines settle: the count of lines marked live stands still for a while
const count = () => p.evaluate(() => document.querySelectorAll('.he-text .g[data-live="sources"]').length);
let last = -1, still = 0;
for (let t = 0; t < 120 && still < 6; t += 1) { await p.waitForTimeout(400); const n = await count(); if (n === last) still += 1; else { still = 0; last = n; } }
const state = await p.evaluate(() => ({ off: window.__sourcesOff || [], pointing: document.body.dataset.masorah || "", order: document.body.dataset.order || "" }));
const lines = await p.evaluate((N) => {
  const out = [], all = [], tally = { words: 0, live: 0, live_bare: 0, unreachable: 0, in_runs: 0, pairs: 0 };
  for (let i = 0; i < N; i += 1) {
    const s = document.getElementById(`s${i}`); if (!s) break;
    const label = (s.querySelector(".vnum") || {}).textContent || `s${i}`;
    [...s.querySelectorAll(".he-text .wb:not(.mark)")].forEach((wb, j) => {
      tally.words += 1;
      const g = wb.querySelector(":scope > .g"); if (!g) return;
      if (g.dataset.off === "unreachable") tally.unreachable += 1;
      if (g.dataset.live !== "sources") return;
      tally.live += 1;
      { const c0 = g.cloneNode(true); c0.querySelectorAll(".g-lic").forEach((x) => x.remove()); all.push({ at: `${label} word ${j + 1}`, surface: (wb.querySelector(".w") || {}).textContent || "", line: g.classList.contains("bare") ? "" : c0.textContent.replace(/\s+/g, " ").trim() }); }
      if (wb.closest(".wjoin")) { tally.in_runs += 1; return; }
      if (wb.classList.contains("kq") || wb.classList.contains("multi")) { tally.pairs += 1; return; }
      const c = g.cloneNode(true); const lic = c.querySelector(".g-lic"); const chip = lic ? lic.title || lic.textContent : ""; c.querySelectorAll(".g-lic").forEach((x) => x.remove());
      if (g.classList.contains("bare")) tally.live_bare += 1;
      out.push({ i, j, label, surface: (wb.querySelector(".w") || {}).textContent || "", line: c.textContent, bare: g.classList.contains("bare"), chip });
    });
  }
  return { out, all, tally };
}, SECTIONS);
if (LINES) { writeFileSync(LINES, JSON.stringify({ book, off: state.off, sections: SECTIONS, words: lines.tally.words, lines: lines.all }, null, 1)); console.log(`${book} · sources off: ${state.off.join(" ")} · ${lines.tally.words} words · ${lines.all.length} lines read live, written to ${LINES}`); await b.close(); process.exit(0); }
console.log(`${book} · sources off: ${state.off.map((id) => `${id} ${LABELS[id] || ""}`.trim()).join(" · ") || "none"}`);
console.log(`  the first ${SECTIONS} sections: ${lines.tally.words.toLocaleString("en-US")} words · ${lines.tally.live} lines read live from the store (${lines.tally.in_runs} of them inside a run, ${lines.tally.pairs} a pair, not asked here; ${lines.tally.live_bare} left bare) · ${lines.tally.unreachable} could not be reached`);
const rows = [], sum = { asked: 0, agree: 0, agree_under_an_overlay: 0, differ: 0, differ_by_an_overlays_row: 0, line_and_card_empty: 0, no_card: 0, several: 0, bare_and_card_has_readings: 0, bare_and_card_empty: 0 };
for (const one of lines.out.slice(0, LIMIT)) {
  sum.asked += 1;
  await p.keyboard.press("Escape");
  await p.evaluate(({ i, j }) => { const wb = [...document.querySelectorAll(`#s${i} .he-text .wb:not(.mark)`)][j]; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); }, one);
  // the card is read once its readings stand, or once its reading row has stood unchanged for a second (a card with no reading)
  { const t0 = Date.now(); let last = null, since = Date.now();
    while (Date.now() - t0 < 9000) {
      if (await p.$("#hud .b-read .r-pills button")) break;
      const now = await p.evaluate(() => { const hud = document.getElementById("hud"); const r = hud && !hud.hidden ? hud.querySelector(".b-read") : null; return r ? r.textContent : null; });
      if (now !== last) { last = now; since = Date.now(); } else if (now !== null && Date.now() - since > 1000) break;
      await p.waitForTimeout(80);
    } }
  await p.waitForTimeout(450);
  const card = await p.evaluate(() => {
    const hud = document.getElementById("hud"); if (!hud || hud.hidden) return null;
    const pills = [...hud.querySelectorAll(".b-read .r-pills button")];
    const txt = (x) => { const c = x.cloneNode(true); c.querySelectorAll(".m-n, .r-n, sup, .n").forEach((y) => y.remove()); return c.textContent; };
    const pressed = pills.find((x) => x.getAttribute("aria-pressed") === "true");
    // the card's own account of its pool (set only when it has readings): which readings stand on an overlay's rows
    // alone. An overlay's reading stands on the card and never on the line (the owner's ruling), so the line is set
    // beside the card's first reading that the store carries.
    const pool = pills.length ? (window.__pool || []) : [], ov = pills.length ? (window.__poolOv || []) : [], by = pills.length ? (window.__poolBy || []) : [];
    const si = pool.findIndex((t, i) => !ov[i]);
    return { headWords: hud.querySelectorAll(".head b > span:not(.mq)").length, first: pills[0] ? txt(pills[0]) : null, pressed: pressed ? txt(pressed) : null, n: pills.length,
      firstOfStore: si >= 0 ? pool[si] : null, firstOfStoreBy: si >= 0 ? by[si] || "" : "", overlayLeads: si > 0, gradedBy: window.__cardGradedBy || "" };
  });
  if (!card) { sum.no_card += 1; continue; }
  if (card.headWords > 1) { sum.several += 1; continue; }
  let verdict;
  if (one.bare) { verdict = card.n ? "the line is bare and the card has readings" : "bare, and the card has none"; if (card.n) sum.bare_and_card_has_readings += 1; else sum.bare_and_card_empty += 1; }
  else if (card.firstOfStore !== null && printed(one.line) === printed(card.firstOfStore)) { verdict = "same"; sum.agree += 1; if (card.overlayLeads) sum.agree_under_an_overlay += 1; }
  else if (!card.n) { verdict = "the line reads and the card has no reading"; sum.line_and_card_empty += 1; }
  // a source the store's index does not hold is an overlay's (or the place's pieces): its row behind a reading ranks
  // that reading on the card, and the line, which is the store's alone, ranks it without (the owner's open call)
  else if (card.firstOfStoreBy.split(" ").some((id) => id && !Object.prototype.hasOwnProperty.call(LABELS, id))) { verdict = "another reading: an overlay's row ranks the card's"; sum.differ_by_an_overlays_row += 1; }
  else { verdict = "DIFFER"; sum.differ += 1; }
  rows.push({ at: one.label, surface: one.surface, line: norm(one.line), chip: one.chip, first: norm(card.first), first_of_store: norm(card.firstOfStore), pressed: norm(card.pressed), pills: card.n, first_by: card.firstOfStoreBy, overlay_leads: card.overlayLeads, verdict });
}
await p.keyboard.press("Escape");
console.log(`  ${sum.asked} words standing alone asked: the live line is the first reading the card has from the store at ${sum.agree} (an overlay's reading ahead of it on the card at ${sum.agree_under_an_overlay}) · another reading at ${sum.differ + sum.differ_by_an_overlays_row} (${sum.differ_by_an_overlays_row} of them where an overlay's row ranks the card's reading, ${sum.differ} with no such row) · the line reads and the card has no reading at ${sum.line_and_card_empty} · bare where the card has readings ${sum.bare_and_card_has_readings} · bare and the card empty ${sum.bare_and_card_empty} · no card ${sum.no_card} · a card of several words ${sum.several}`);
for (const r of rows.filter((x) => x.verdict !== "same" && x.verdict !== "bare, and the card has none").slice(0, SHOW)) console.log(`     ${r.at} ${r.surface} · line ${JSON.stringify(r.line)} (${r.chip.slice(0, 44)}) · the card's first from the store ${JSON.stringify(r.first_of_store)} by ${r.first_by} · ${r.pills} pills · ${r.verdict}`);
if (errors.length) console.log(`  page errors: ${errors.slice(0, 3).join(" | ")}`);
if (DUMP) writeFileSync(DUMP, JSON.stringify({ book, off: state.off, tally: lines.tally, sum, rows }, null, 1));
await b.close();
