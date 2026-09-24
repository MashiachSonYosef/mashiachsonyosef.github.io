#!/usr/bin/env node
// GUARDS: source-switch-rule-v1-a-reading-remembers-who-carried-it
// GUARDS: source-short-names-rule-v1-a-shelf-chip-wears-a-short-name-this-record-keeps-and-the-full-name-on-press
//
// THE SOURCE SWITCHES, PRESSED.
//
// The primary toggle the two lanes settled on: the source itself, each one
// removable, on every card. A source turned off is not asked — its rows never
// enter the pool — and the line under every word follows without a fetch,
// from the carriers and the alternate baked on the key. Two harms, told
// apart: a line that CHANGES because another carrier remains or an alternate
// leads, and a line that goes DARK because nobody else carries anything.
//
//   S1  the sources row is on the rail: one row per source key, every one
//       ON, each carrying two numbers (change · dark) and its ledger ids
//   S2  the receipt's sources agree with the chips, and its counts with the
//       zone's own gloss_m (every printed reading carries its carriers)
//   S3  a source with SOLE carriage of some line, switched off: that line
//       moves to the baked alternate, the chip on the line names the
//       alternate's witness, and the card's first pill says the same
//   S4  a line the same source carries WITH another carrier stays carried:
//       it never goes dark, it says what its card's first pill says, and it
//       does not move unless its card's lead moved (the switched-off carrier
//       can be what ranked the reading first; the line follows the card)
//   S5  the card says how many records the switch withheld, and no pill on
//       it is carried only by the switched-off ids
//   S6  the Hebrew of the section never changed by a byte (the ink alone:
//       the English lines under it are S3's and S4's to move)
//   S7  switched back on, the line and the pool are exactly what they were
//   S8  a key whose every carrier is off and whose alternate is absent goes
//       bare on the line, marked as the reader's own doing — found on this
//       shelf or stated absent, never assumed
//
// Runs against the first served zone whose receipt carries the switches.
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

let ZONE = null, zone = null;
for (const z of zonesServed()) {
  const s = JSON.parse(gunzipSync(readFileSync(`data/zones/${z}.bin`)).toString("utf8"));
  if (s.emitted_from && s.emitted_from.toggles && s.emitted_from.toggles.sources && s.emitted_from.toggles.sources.sources) { ZONE = z; zone = s; break; }
}
if (!ZONE) { console.log("SKIPPED — no served zone carries the source switches' receipt; run tools/regloss-zone.mjs"); process.exit(3); }
const rec = zone.emitted_from.toggles.sources;

const BASE = (defaultZoneUrl()).split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${BASE}?b=${ZONE}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(600);
console.log(`— ${ZONE} —`);

// S1
const rail = await p.evaluate(() => {
  const row = document.querySelector('.rail .row[data-toggle="sources"]'); if (!row) return null;
  const chips = [...row.querySelectorAll(".dfp")];
  return {
    dead: row.classList.contains("dead"),
    n: chips.length,
    allOn: chips.every((c) => c.getAttribute("aria-pressed") === "true"),
    withIds: chips.filter((c) => /^M\d+( M\d+)*$/u.test(c.dataset.ids || "")).length,
    keys: chips.map((c) => c.dataset.key),
    // what each chip says its switch costs, read off the chip — the two
    // numbers by value, in whatever words, never by the shape of a separator.
    // Since 2026-09-23 the strip wears short names and the cost rides on the
    // chip's title and on its shelf's line; a reader on a phone sees the cost
    // on the shelf switch and on press, not printed beside every chip.
    said: Object.fromEntries(chips.map((c) => [c.dataset.key, (String(c.title || "").match(/[\d,]+/gu) || []).map((x) => Number(x.replace(/,/gu, "")))])),
    // the strip's short names: which chips fell back for want of a record entry
    fallbacks: window.__shortNameFallbacks || [],
    shelvings: [...row.querySelectorAll(".shelve-opt")].map((b) => b.dataset.shelving),
    shelves: [...row.querySelectorAll(".shelf")].length,
  };
});
const keysInReceipt = new Set(Object.values(rec.sources).map((s) => s.key || ""));
// the two costs the receipt bakes for each source key, summed over its ids —
// what the chip must be saying, by value
const costOf = new Map();
for (const s of Object.values(rec.sources)) {
  const k = s.key || "";
  const c = costOf.get(k) || { changes: 0, darkens: 0 };
  c.changes += Number(s.changes) || 0; c.darkens += Number(s.darkens) || 0;
  costOf.set(k, c);
}
const wrongCost = rail ? rail.keys.filter((k) => {
  const want = costOf.get(k), said = (rail.said || {})[k] || [];
  if (!want) return true;
  // a cost of zero may be left unsaid in words; a non-zero one may not
  return (want.changes && !said.includes(want.changes)) || (want.darkens && !said.includes(want.darkens));
}) : [];
check("S1  the sources row is on the rail, every chip on, each saying what its switch costs and carrying its ids",
  rail && !rail.dead && rail.n > 0 && rail.allOn && wrongCost.length === 0 && rail.withIds === rail.n,
  rail ? `${rail.n} chips · ${rail.n - wrongCost.length} say both their costs · ${rail.withIds} with ids${wrongCost.length ? ` · not saying them: ${wrongCost.slice(0, 3).join(", ")}` : ""}` : "no row");
// S1b · the short names. Every chip on the strip wears the record's name for
// its key (source-short-names-rule-v1); a chip with no entry falls back to its
// own label cut short, and this says which, so the record can be completed.
check("S1b every chip wears a short name from the record",
  rail && rail.fallbacks.length === 0,
  rail ? (rail.fallbacks.length ? `falling back: ${rail.fallbacks.join(", ")}` : `${rail.n} chips named by data/source-short-names-v1.json`) : "no row");

// S1c · THREE SHELVINGS, ONE STRIP. The chooser offers century, language and
// license; under each the same chips stand with the same ids — a shelving is a
// way of reading the strip, not a different set of switches.
const under = async (id) => p.evaluate((sid) => {
  const row = document.querySelector('.rail .row[data-toggle="sources"]');
  const b = row && row.querySelector(`.shelve-opt[data-shelving="${sid}"]`); if (!b) return null;
  b.click();
  const chips = [...row.querySelectorAll(".dfp")].map((c) => `${c.dataset.key}=${c.dataset.ids}`).sort();
  return { chips, shelves: [...row.querySelectorAll(".shelf")].map((sh) => ({ title: sh.dataset.shelf, n: sh.querySelectorAll(".dfp").length, state: sh.querySelector(".shelf-sw").getAttribute("aria-checked") })), pressed: b.getAttribute("aria-pressed") };
}, id);
const byShelving = {};
for (const id of ["century", "language", "license"]) byShelving[id] = await under(id);
const sameChips = ["language", "license"].every((id) => byShelving[id] && byShelving.century && JSON.stringify(byShelving[id].chips) === JSON.stringify(byShelving.century.chips));
check("S1c the chooser offers three shelvings and each regroups the same chips with the same ids",
  rail && JSON.stringify(rail.shelvings) === JSON.stringify(["century", "language", "license"]) && sameChips
    && Object.values(byShelving).every((v) => v && v.shelves.length >= 2 && v.shelves.reduce((a, x) => a + x.n, 0) === rail.n),
  Object.entries(byShelving).map(([k, v]) => `${k}: ${v ? v.shelves.map((x) => `${x.title} ${x.n}`).join(" · ") : "?"}`).join("  |  "));

// S1d · the century shelves are cut where the reading order cuts its era
// tier — one constant, said in AM, read off the page rather than typed here
const eraCut = await p.evaluate(() => window.__eraCutCE);
const centuryOK = await p.evaluate((cut) => {
  const row = document.querySelector('.rail .row[data-toggle="sources"]');
  row.querySelector('.shelve-opt[data-shelving="century"]').click();
  const bad = [];
  for (const sh of row.querySelectorAll(".shelf")) {
    const title = sh.dataset.shelf;
    // a chip stands on the shelf of its WORDING century (the owner's ruling),
    // said in AM; "none" stands on no year given
    const cutC = Math.ceil((cut + 3760) / 100);
    for (const c of sh.querySelectorAll(".dfp")) {
      const cen = String(c.dataset.century);
      const dated = /^\d+$/.test(cen);
      if (title === "no year given" ? dated : !dated) bad.push(`${c.dataset.key}@${title}`);
      else if (dated && parseInt(title, 10) !== Number(cen)) bad.push(`${c.dataset.key}:${cen}@${title}`);
      else if (dated && (Number(cen) <= cutC) !== (parseInt(title, 10) <= cutC)) bad.push(`${c.dataset.key}:${cen}@${title}`);
    }
  }
  return bad;
}, eraCut);
check("S1d the century shelves follow the era cut the reading order uses",
  Number.isInteger(eraCut) && eraCut + 3760 === 5700 && centuryOK.length === 0,
  `era cut ${eraCut} CE = ${eraCut + 3760} AM${centuryOK.length ? ` · astray: ${centuryOK.slice(0, 3).join(", ")}` : ""}`);

// S1e · A SHELF SWITCH FLIPS THE WHOLE SHELF. Off turns off exactly its chips
// and no other; one chip pressed back on makes the shelf say "mixed"; pressing
// a mixed shelf turns it off; pressing an off shelf turns it on. Then every
// chip is on again for the rest of this check.
const shelfPlay = await p.evaluate(() => {
  const row = document.querySelector('.rail .row[data-toggle="sources"]');
  const sh = [...row.querySelectorAll(".shelf")].find((x) => x.querySelectorAll(".dfp").length >= 2); if (!sh) return null;
  const title = sh.dataset.shelf;
  const inShelf = () => [...row.querySelector(`.shelf[data-shelf="${CSS.escape(title)}"]`).querySelectorAll(".dfp")];
  const others = () => [...row.querySelectorAll(".dfp")].filter((c) => !inShelf().includes(c));
  const sw = () => row.querySelector(`.shelf[data-shelf="${CSS.escape(title)}"] .shelf-sw`);
  const out = { title, n: inShelf().length };
  sw().click();
  out.afterOff = { shelfAllOff: inShelf().every((c) => c.getAttribute("aria-pressed") === "false"), othersAllOn: others().every((c) => c.getAttribute("aria-pressed") === "true"), state: sw().getAttribute("aria-checked"), says: row.querySelector(`.shelf[data-shelf="${CSS.escape(title)}"] .shelf-count`).textContent };
  inShelf()[0].click();
  out.afterOne = { state: sw().getAttribute("aria-checked"), says: row.querySelector(`.shelf[data-shelf="${CSS.escape(title)}"] .shelf-count`).textContent };
  sw().click();
  out.afterMixedPress = { state: sw().getAttribute("aria-checked"), shelfAllOff: inShelf().every((c) => c.getAttribute("aria-pressed") === "false") };
  sw().click();
  out.afterOn = { state: sw().getAttribute("aria-checked"), allOn: [...row.querySelectorAll(".dfp")].every((c) => c.getAttribute("aria-pressed") === "true") };
  return out;
});
check("S1e a shelf switch turns off exactly its shelf, says mixed when one comes back, and turns the shelf on again",
  shelfPlay && shelfPlay.afterOff.shelfAllOff && shelfPlay.afterOff.othersAllOn && shelfPlay.afterOff.state === "false" && /off:/.test(shelfPlay.afterOff.says)
    && shelfPlay.afterOne.state === "mixed" && new RegExp(`\\b${shelfPlay.n - 1} off\\b`).test(shelfPlay.afterOne.says)
    && shelfPlay.afterMixedPress.state === "false" && shelfPlay.afterMixedPress.shelfAllOff
    && shelfPlay.afterOn.state === "true" && shelfPlay.afterOn.allOn,
  shelfPlay ? `${shelfPlay.title} (${shelfPlay.n}) · off "${shelfPlay.afterOff.says}" · one back "${shelfPlay.afterOne.says}" · mixed→${shelfPlay.afterMixedPress.state} · on→${shelfPlay.afterOn.state}` : "no shelf with two chips");

// S2
const byCount = Object.values(zone.gloss_m || {}).filter((e) => Array.isArray(e.by) && e.by.length).length;
check("S2  the receipt agrees with the chips and with gloss_m",
  rail && rail.n === keysInReceipt.size && rec.counts.keys_with_carriers === byCount && byCount > 0,
  `${rail ? rail.n : "?"} chips vs ${keysInReceipt.size} source keys · ${byCount} keys carry their carriers (receipt ${rec.counts.keys_with_carriers})`);

// pick the switch: a source key whose ids solely carry some visible line with
// a baked alternate, AND carry some other visible line with a second carrier
const visible = await p.evaluate(() => [...document.querySelectorAll("section.seg .he-text .wb")].slice(0, 120).map((wb, i) => {
  const g = wb.querySelector(".g"); const w = wb.querySelector(".w");
  return { i, s: w ? w.textContent.trim() : "", bare: !g || g.classList.contains("bare"), regions: wb.querySelectorAll(".wr").length, line: g ? g.textContent.replace(/\s+/g, " ").trim() : "" };
}));
const kOf = (s) => { for (const sec of zone.sections) for (const w of sec.words || []) if (w.s === s) return w.k || (w.w && w.w[0] && w.w[0].k) || null; return null; };
const groups = new Map();
for (const [id, s] of Object.entries(rec.sources)) { const gk = s.key || id; if (!groups.has(gk)) groups.set(gk, []); groups.get(gk).push(id); }
let pick = null;
for (const [gk, ids] of groups) {
  const set = new Set(ids);
  let sole = null, shared = null, dark = null;
  for (const v of visible) {
    if (v.bare || v.regions > 1) continue;
    const k = kOf(v.s); const gm = k && zone.gloss_m[k]; if (!gm || !gm.by) continue;
    const all = gm.by.every((m) => set.has(m)), some = gm.by.some((m) => set.has(m));
    if (all && gm.alt && !gm.alt.by.every((m) => set.has(m)) && !sole) sole = { ...v, k, gm };
    if (all && !gm.alt && !dark) dark = { ...v, k, gm };
    if (some && !all && !shared) shared = { ...v, k, gm };
  }
  if (sole && shared) { pick = { gk, ids, sole, shared, dark }; break; }
}
check("  a source that solely carries one visible line (with an alternate) and shares another stands on the page", !!pick,
  pick ? `${pick.gk} (${pick.ids.join(" ")}) · sole: ${pick.sole.s} "${pick.sole.line}" · shared: ${pick.shared.s}` : "none in the first 120 words");
// the Hebrew ink of the first section, without the English lines under it
const inkOf = () => p.evaluate(() => { const c = document.querySelector("section.seg .he-text").cloneNode(true); c.querySelectorAll(".g").forEach((x) => x.remove()); return c.textContent; });
// what a word's card offers first, and its line without the chip
const leadOf = (i) => p.evaluate(async (i) => {
  const wb = document.querySelectorAll("section.seg .he-text .wb")[i];
  (wb.querySelector(".w span") || wb.querySelector(".w")).click();
  const t0 = Date.now(); while (Date.now() - t0 < 5000 && !document.querySelector("#hud .r-pills button")) await new Promise((r) => setTimeout(r, 50));
  await new Promise((r) => setTimeout(r, 300));
  const first = ((document.querySelector("#hud .r-pills button") || {}).textContent || "").trim();
  const x = document.querySelector("#hud .head button"); if (x) x.click();
  await new Promise((r) => setTimeout(r, 200));
  const g = wb.querySelector(".g").cloneNode(true); g.querySelectorAll(".g-lic").forEach((c) => c.remove());
  return { first, line: g.textContent.replace(/\s+/g, " ").trim() };
}, i);
const sharedBefore = pick ? await leadOf(pick.shared.i) : null;
const heBefore = await inkOf();

// switch it off
const pressed = await p.evaluate((gk) => {
  const r = document.getElementById("rail"); if (r && !r.open) r.open = true;
  const btn = document.querySelector(`.rail .row[data-toggle="sources"] .dfp[data-key="${CSS.escape(gk)}"]`);
  if (!btn) return false; btn.click(); return true;
}, pick ? pick.gk : "");
await p.waitForTimeout(700);
const after = await p.evaluate((idx) => idx.map((i) => { const wb = document.querySelectorAll("section.seg .he-text .wb")[i]; const g = wb.querySelector(".g"); return { line: g.textContent.replace(/\s+/g, " ").trim(), chip: (g.querySelector(".g-lic") || {}).title || "", bare: g.classList.contains("bare") }; }), pick ? [pick.sole.i, pick.shared.i] : [0, 0]);
// S3
const altText = pick ? String(pick.sole.gm.alt.text) : "";
check("S3  the solely-carried line moved to the baked alternate, and its chip names the alternate's witness",
  pressed && pick && after[0].line.toLowerCase().startsWith(altText.toLowerCase().slice(0, 12)) && after[0].chip.includes(pick.sole.gm.alt.m.slice(0, 20)),
  pick ? `"${pick.sole.line}" -> "${after[0].line}" · alt "${altText}" · chip "${after[0].chip.slice(0, 50)}"` : "");
// S4 · held still outright until the line came to follow the card
// (2026-09-24): with one carrier off, the card can rank the reading lower —
// the carrier switched off may be what put it first — and the line says what
// the card now says. It never goes dark, and it moves only with the card.
const sharedAfter = pick ? await leadOf(pick.shared.i) : null;
const same = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
const s4 = pick && sharedBefore && sharedAfter && !after[1].bare && same(sharedAfter.line, sharedAfter.first)
  && (same(sharedBefore.first, sharedAfter.first) ? after[1].line === pick.shared.line : true);
check("S4  the shared line stays carried: never dark, its card's first pill, and still unless the card's lead moved", s4,
  pick && sharedAfter ? `"${pick.shared.line}" (carriers ${pick.shared.gm.by.join(",")}) -> "${after[1].line}" · card led "${sharedBefore.first}", now "${sharedAfter.first}" · line "${sharedAfter.line}" bare ${after[1].bare}` : "");

// S5 · open the card on the moved word
await p.evaluate((i) => { const w = document.querySelectorAll("section.seg .he-text .wb")[i]; (w.querySelector(".w span") || w.querySelector(".w")).click(); }, pick ? pick.sole.i : 0);
await p.waitForTimeout(900);
const card = await p.evaluate(() => {
  const h = document.querySelector("#hud"); if (!h || h.hidden) return null;
  const pills = h.querySelector(".r-pills");
  return { withheld: Number(pills.dataset.withheldBySources || 0), rows: Number(pills.dataset.rows || 0), note: (h.querySelector(".sources-withheld") || {}).textContent || "", first: (pills.querySelector("button") || {}).textContent || "", bys: [...pills.querySelectorAll("button")].map((x) => x.dataset.by || "") };
});
const off = new Set(pick ? pick.ids : []);
const creditsOff = card ? card.bys.filter((by) => by.split(" ").every((m) => off.has(m))).length : -1;
check("S5  the card says how many records the switch withheld, and no pill is carried only by the switched-off ids",
  card && card.withheld > 0 && /withheld by your source switch/u.test(card.note) && creditsOff === 0,
  card ? `${card.withheld} of ${card.rows} withheld · "${card.note}" · pills credited only to the off ids: ${creditsOff}` : "no card");
check("    and the card's first pill is the line", card && pick && card.first.trim().toLowerCase() === after[0].line.replace(/\s*(CC|Public|License).*$/u, "").trim().toLowerCase(), card ? `pill "${card.first}" · line "${after[0].line}"` : "");

// S6
const heAfter = await inkOf();
check("S6  the Hebrew of the section never changed by a byte", heBefore === heAfter, `${heAfter.length} characters`);

// S7 · back on
await p.evaluate(() => { const h = document.getElementById("hud"); const x = h && h.querySelector(".head button"); if (x) x.click(); });
await p.evaluate((gk) => { const btn = document.querySelector(`.rail .row[data-toggle="sources"] .dfp[data-key="${CSS.escape(gk)}"]`); if (btn) btn.click(); }, pick ? pick.gk : "");
await p.waitForTimeout(700);
const back = await p.evaluate((i) => { const g = document.querySelectorAll("section.seg .he-text .wb")[i].querySelector(".g"); return g.textContent.replace(/\s+/g, " ").trim(); }, pick ? pick.sole.i : 0);
const onAgain = await p.evaluate(() => [...document.querySelectorAll('.rail .row[data-toggle="sources"] .dfp')].every((c) => c.getAttribute("aria-pressed") === "true"));
check("S7  switched back on, the line is what it was and every chip is on", pick && back === pick.sole.line && onAgain, pick ? `"${back}"` : "");

// S8 · the dark case, if this book has one in view
if (pick && pick.dark) {
  await p.evaluate((gk) => { const btn = document.querySelector(`.rail .row[data-toggle="sources"] .dfp[data-key="${CSS.escape(gk)}"]`); if (btn) btn.click(); }, pick.gk);
  await p.waitForTimeout(700);
  const d = await p.evaluate((i) => { const g = document.querySelectorAll("section.seg .he-text .wb")[i].querySelector(".g"); return { bare: g.classList.contains("bare"), line: g.textContent.trim() }; }, pick.dark.i);
  check("S8  a line whose every carrier is off and which has no alternate goes bare", d.bare && d.line === "", `${pick.dark.s} · was "${pick.dark.line}"`);
  await p.evaluate((gk) => { const btn = document.querySelector(`.rail .row[data-toggle="sources"] .dfp[data-key="${CSS.escape(gk)}"]`); if (btn) btn.click(); }, pick.gk);
} else {
  console.log(`  --  S8  no visible word in the first 120 is solely carried by ${pick ? pick.gk : "the chosen source"} with no alternate — the dark case has no site here today`);
}

await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
