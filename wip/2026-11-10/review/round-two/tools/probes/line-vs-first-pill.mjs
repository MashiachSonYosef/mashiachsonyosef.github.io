// The line under a word against the card's first reading, for a list of pointed surfaces, under one setting of the switches.
// node line-vs-first-pill.mjs <reader dir> <zone url base> <book> <cases.json> [--ls key=value]... [--limit N] [--show N]
// cases.json: ["<pointed surface>", ...]  (surfaces as the zone writes them, w.s)
// For each surface: its first place in the book is scrolled to, the line read, the word pressed, the card's readings read.
// Nothing is written. Exit 0 always: this measures, it does not judge.
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { readFileSync } from "node:fs";
const argv = process.argv.slice(2);
const ls = []; for (let i = argv.indexOf("--ls"); i > -1; i = argv.indexOf("--ls")) { ls.push(argv[i + 1]); argv.splice(i, 2); }
const flag = (f, d) => { const i = argv.indexOf(f); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const LIMIT = Number(flag("--limit", "1000000")), SHOW = Number(flag("--show", "8"));
// [--dump <file>]: every case asked, with the line it read and the card's first and pressed readings, as JSON
const DUMP = flag("--dump", null), dumped = [];
const [reader, base, book, casesPath] = argv;
const cases = JSON.parse(readFileSync(casesPath, "utf8")).slice(0, LIMIT);
const { loadPlaywright, launchOptions } = await import(pathToFileURL(join(reader, "tools", "playwright-v1.mjs")).href);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
if (ls.length) await p.addInitScript((pairs) => { try { for (const kv of pairs) { const i = kv.indexOf("="); localStorage.setItem(kv.slice(0, i), kv.slice(i + 1)); } } catch { /* nothing remembered */ } }, ls);
await p.goto(`${base}?b=${book}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(800);
const LABELS = Object.fromEntries(Object.entries(JSON.parse(readFileSync(join(reader, "data", "route-store", "index.json"), "utf8")).m_sources || {}).map(([id, m]) => [id, m.label || ""]));
const norm = (t) => String(t ?? "").replace(/\s+/g, " ").trim();
// as the line draws a reading with the signs switch at rest (off): a piece that is a source's sign and nothing
// else is drawn as a gap beside the pieces that carry the reading, and the pill prints the reading whole; the
// two are the same reading (zone.html trimSigns), so the comparison leaves such pieces and gaps out of both
const signOnly = (t) => /^(<[^>]*>|\[[^\]]*\]|\u00bf|~|X|\u00d7|\+)$/u.test(String(t).trim());
const printed = (t) => {
  const pieces = norm(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/, "").split(" + ").map((x) => x.replace(/\u200b/gu, "").trim());
  const kept = pieces.filter((x) => x && !signOnly(x));
  return (kept.length ? kept : pieces.filter(Boolean)).join(" + ").toLowerCase();
};
const out = { asked: cases.length, found: 0, no_place: 0, no_card: 0, no_line: 0, agree: 0, differ: 0, credit_agree: 0, credit_differ: 0, credit_unread: 0, in_a_run: 0, card_of_several_words: 0, rows: [] };
for (const one of cases) {
  // a case is a pointed surface (its first place in the book), or { s, at } for the surface at one verse
  const surface = typeof one === "string" ? one : one.s, atLabel = typeof one === "string" ? null : one.at;
  const where = await p.evaluate(({ surface, atLabel }) => {
    const all = window.__zone.sections || [];
    const secs = atLabel === null ? all : all.map((s) => (s.label === atLabel ? s : { label: s.label, words: [] }));
    for (let i = 0; i < secs.length; i += 1) {
      const ws = secs[i].words || [];
      // a word standing alone is asked first; a word of a maqaf run only when the surface stands nowhere else
      for (let j = 0; j < ws.length; j += 1) if (ws[j] && !ws[j].mark && !ws[j].kq && ws[j].s === surface && !ws[j].presentation_join) return { i, label: secs[i].label, run: false };
    }
    for (let i = 0; i < secs.length; i += 1) {
      const ws = secs[i].words || [];
      for (let j = 0; j < ws.length; j += 1) if (ws[j] && !ws[j].mark && !ws[j].kq && ws[j].s === surface) return { i, label: secs[i].label, run: true };
    }
    return null;
  }, { surface, atLabel });
  if (!where) { out.no_place += 1; continue; }
  // a run's card is the run's (its whole forms, its pieces): another question, counted apart
  if (where.run) { out.in_a_run += 1; continue; }
  out.found += 1;
  await p.keyboard.press("Escape");
  await p.evaluate(async (idx) => { const s = document.getElementById(`s${idx}`); for (let g = 0; g < 400 && s && !s.querySelector(".he-text .wb"); g += 1) { s.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 25)); } }, where.i);
  await p.waitForTimeout(250);
  const before = await p.evaluate(({ idx, surface }) => {
    const wbs = [...document.querySelectorAll(`#s${idx} .he-text .wb`)];
    const wb = wbs.find((x) => { const w = x.querySelector(".w"); return w && w.textContent.normalize("NFC") === surface.normalize("NFC"); });
    if (!wb) return null;
    wb.scrollIntoView({ block: "center" });
    const g = wb.querySelector(":scope > .g") || (wb.closest(".wjoin") || document).querySelector(":scope > .g");
    const c = g ? g.cloneNode(true) : null; const lic = c ? c.querySelector(".g-lic") : null; const chip = lic ? lic.textContent : null; const chipTitle = lic ? lic.title : null; if (c) c.querySelectorAll(".g-lic").forEach((x) => x.remove());
    wb.dataset.probe = "1";
    return { line: c ? c.textContent : null, chip, chipTitle, title: g ? g.title : null };
  }, { idx: where.i, surface });
  if (!before) { out.no_place += 1; out.found -= 1; continue; }
  if (!norm(before.line)) { out.no_line += 1; }
  await p.evaluate(() => { const wb = document.querySelector('.wb[data-probe="1"]'); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); delete wb.dataset.probe; });
  const t0 = Date.now(); while (Date.now() - t0 < 12000 && !(await p.$("#hud .r-pills button"))) await p.waitForTimeout(60);
  await p.waitForTimeout(450);
  const card = await p.evaluate(() => {
    const hud = document.getElementById("hud"); if (!hud || hud.hidden) return null;
    const pills = [...hud.querySelectorAll(".b-read .r-pills button")];
    const txt = (x) => { const c = x.cloneNode(true); c.querySelectorAll(".m-n, .r-n, sup, .n").forEach((y) => y.remove()); return c.textContent; };
    const pressed = pills.find((x) => x.getAttribute("aria-pressed") === "true");
    const prov = hud.querySelector(".r-prov");
    return { headWords: hud.querySelectorAll(".head b > span:not(.mq)").length, first: pills[0] ? txt(pills[0]) : null, pressed: pressed ? txt(pressed) : null, n: pills.length, lead: (window.__poolLead || [])[0] ?? null, prov: prov ? prov.textContent.replace(/\s+/g, " ").trim().slice(0, 220) : null };
  });
  if (!card || card.first === null) { out.no_card += 1; continue; }
  // a card of several words (a chain the sources read whole) answers for the chain, not for this word alone
  if (card.headWords > 1) { out.card_of_several_words += 1; continue; }
  const same = printed(before.line) === printed(card.first);
  if (same) out.agree += 1; else out.differ += 1;
  // the credit: the chip beside the line names a source in its title; the card's first reading is credited to its oldest record
  const leadLabel = card.lead && LABELS[card.lead] ? LABELS[card.lead] : null;
  let creditSame = null;
  if (same) { if (!before.chipTitle || !leadLabel) out.credit_unread += 1; else { creditSame = before.chipTitle.startsWith(leadLabel); if (creditSame) out.credit_agree += 1; else out.credit_differ += 1; } }
  dumped.push({ surface, at: where.label, line: norm(before.line), chip: before.chipTitle || "", first: norm(card.first), pressed: norm(card.pressed), lead: card.lead });
  if (out.rows.length < SHOW && (!same || creditSame === false)) out.rows.push({ surface, at: where.label, line: norm(before.line), first: norm(card.first), pressed: norm(card.pressed), title: before.title, chip: (before.chipTitle || "").slice(0, 110), lead: `${card.lead} ${leadLabel}`, prov: card.prov });
}
await b.close();
if (DUMP) (await import("node:fs")).writeFileSync(DUMP, JSON.stringify(dumped, null, 1));
console.log(`${book} · ${ls.join(" ") || "resting switches"} · ${out.asked} surfaces asked · ${out.found} found at a place · line and first reading agree at ${out.agree}, differ at ${out.differ} · where they agree, the credit agrees at ${out.credit_agree}, differs at ${out.credit_differ}, was not read at ${out.credit_unread} · in a maqaf run and not asked ${out.in_a_run} · a card of several words ${out.card_of_several_words} · no card ${out.no_card} · no line ${out.no_line} · no place ${out.no_place}${errors.length ? ` · page errors ${errors.length}: ${errors[0]}` : ""}`);
for (const r of out.rows) console.log(`   ${r.at} ${r.surface}: line ${JSON.stringify(r.line)} · first ${JSON.stringify(r.first)} · pressed ${JSON.stringify(r.pressed)}\n      the line's chip ${JSON.stringify(r.chip)} · the card credits ${JSON.stringify(r.lead)}`);
