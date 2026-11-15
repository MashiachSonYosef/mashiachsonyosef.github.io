// RUN: page
// GUARDS: form-of-pills-rule-v2-the-pointer-stays-the-sources-bytes-the-resolution-rides-beside-it-a-pure-pointer-prints-the-english-the-lanes-map-carries
// A READING THAT POINTS AT ANOTHER WORD'S READING (the corpus lane's map of
// pointer readings: its relay v175 of 13 November 2026, map v1.3, and its
// v191 of 14 November, the lines of map v1.4 that differ from it, kept in
// data/pointer-entries/ and laid together by tools/pointer-map-v1.mjs: a
// source's reading written as "singular construct state form of <Hebrew>"
// or "passive of <Hebrew>" points at an entry, which the lane names from the
// pointer's own bytes, and resolves to that entry's first English where the
// store serves a row of the source with it, or else, by the owner's answer of
// 14 November, carries that English from the source's own file as a ruled
// print; baked under the owner's rulings by tools/bake-form-of-pills-v1.mjs
// into data/form-of-pills-v1.json). The
// owner's law (data/rule-demonstrations-v1.json): the C0 never moves;
// selection governs what is defined, never what is displayed. So:
//   F1  the record stands, under the rule this check guards: a map keyed by
//       route key, each entry naming the pointer's source, its text, its
//       relation and target, and, where it resolves, the resolved reading's
//       text with the key of the row that serves it, or the mark of a ruled
//       print and no key; its counts are its own entries (the pills it
//       carries; JUDGMENT, USAGE_NOTE and NOT pointers are read and counted
//       but wait on the owner's branch)
//   F2  the page loads the map after its first paint and says so
//       (window.__formOf: keys, pills, resolved as the record counts them)
//   F3  on the card of a word whose key holds a resolved pointer, with every
//       switch lifted: the pointer's pill prints the resolved reading with
//       the pointer's relation and target in parentheses and carries the
//       pointer's own text as data-pointer (the pill is the source's row;
//       what it prints is the resolution); the pointer's bare text stands on
//       no pill
//   F4  that pill pressed, a ruling: the line under the word prints the
//       same, and the Hebrew is the Hebrew
//   F5  another pill pressed moves the line to that reading; the pointer
//       pill pressed again puts the resolved text back on the line, and the
//       Hebrew never moved
//   F6  the record is the corpus lane's pinned map, as its relays lay it,
//       under the owner's pinned rulings, derived again here: every pure
//       pointer of the map and no other reading; each resolved as the map
//       resolves it, or by the source's first entry where the pointer cannot
//       tell its entries apart and the ruling rests that branch so, or else
//       by the ruled print of the branch it fills; none resolved to a text
//       that is itself a pure pointer (under its own key for a served row,
//       under any key for a ruled print); no reading with English of its own
//   F7  on the page, with every switch lifted: a reading the lane classes as
//       having English of its own beside its pointer stands on a pill as its
//       own words, and that pill carries no pointer
//   F8  a pointer whose text holds a "/" (the source's own, which prints
//       " + "): F3 to F5 hold for it too. The page once found a pointer's
//       entry by its text as written on the pill and as printed on the
//       line, so such a pointer resolved on its pill and stood bare on the
//       line once pressed. A word carrying one is found on purpose and
//       pressed, where any is served
//   F9  every ruled print the record prints is the lane's, byte for byte:
//       its line's ruled print, credited to the line's own m id, saying the
//       store does not serve it, read from one of the source files the
//       lane's receipt names; and no row of its source (the store index's
//       source key of that m id) carries the text at any key the lane looked
//       at. A row a named list landed after the store the map was made on is
//       counted and named, not failed, until the lane makes the map again on
//       the store it stands in. The lane's own tally of the 458 pure pointers
//       of v1.4 is the record's. The text against the source's own file is
//       counted and not judged while the files are not in this tree
//   F10 every row the map names, on every slot, stands in the store at its
//       key and rank with its m id and text, and its sha16 where it writes
//       one; a row a named list re-keyed after the map's store is followed
//       through the row-strikes record
//   F11 a pointer whose pill prints a ruled print: F3 to F5 hold for it too.
//       A word carrying one is found on purpose and pressed
// The words are found from the data on disk, never named here
// (check-scope-derived S1). NO LINE RESTS ON A PURE POINTER under the maps of
// 13 and 14 November 2026: the forty plain words whose lead was a pointer
// under the map before them were readings with English of their own, which
// print as themselves now. So the pointer is met on its pill, and on the line
// once the pill is pressed.
// Usage: node tools/check-form-of-v1.mjs [url-base]
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zoneUrls, zoneIdOf } from "./zones-on-disk-v1.mjs";
import { sha256Of } from "./pinned-v1.mjs";
import { rulingsPinned } from "./rulings-v1.mjs";
import { pointerMap } from "./pointer-map-v1.mjs";
import { openRouteStore, routePrinted, printedForm } from "./gloss-store-v1.mjs";
import { STATES } from "./card-readings-v1.mjs";
import { linesOnPage } from "./resting-lines-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const RECORD = "data/form-of-pills-v1.json";
const RULE_ID = "form-of-pills-rule-v2-the-pointer-stays-the-sources-bytes-the-resolution-rides-beside-it-a-pure-pointer-prints-the-english-the-lanes-map-carries";
const noDot = (t) => String(t).replace(/\.$/u, "");
const target = (e) => { if (!e.at) return e.target; const b = Buffer.from(e.t, "utf8"); return b.subarray(e.at[0], e.at[1]).toString("utf8") || e.target; };
const says = (e) => `${e.resolved.text} (${e.relation} ${target(e)})`;

// F1 the record
const rec = existsSync(RECORD) ? JSON.parse(readFileSync(RECORD, "utf8")) : null;
const entries = rec ? Object.values(rec.keys).flat() : [];
const resolved = entries.filter((e) => e.resolved);
// a resolution is a served row's text under its key, or a ruled print's text under no key
const wellResolved = (r) => !!r.text && (r.ruled === true ? r.key === null : !!r.key && !("ruled" in r));
const wellFormed = entries.every((e) => e.m && e.t && e.class === "FORM_OF" && e.relation && e.target && (!e.resolved || wellResolved(e.resolved)));
const ruledPrinted = resolved.filter((e) => e.resolved.ruled);
check("F1  the record, under the rule this check guards: a map by route key of pointers with source, text, relation and target, and the resolution, a served row's or a ruled print; its counts are its own entries",
  !!rec && rec.rule_id === RULE_ID && rec.keys && wellFormed && rec.counts.carried === entries.length && rec.counts.pills >= entries.length && rec.counts.resolved === resolved.length && resolved.length > 0
    && (rec.counts.resolved_by || {}).the_ruled_print === ruledPrinted.length,
  rec ? `${rec.rule_id === RULE_ID ? "rule v2" : `rule "${rec.rule_id}"`} · ${Object.keys(rec.keys).length} keys · ${entries.length} pointers carried (record says ${rec.counts.carried} of ${rec.counts.pills} read) · ${resolved.length} resolved (record says ${rec.counts.resolved}), ${ruledPrinted.length} of them by a ruled print (record says ${(rec.counts.resolved_by || {}).the_ruled_print}) · well formed ${wellFormed}` : "no record");
if (!rec) { console.log("\nFAIL"); process.exit(1); }

// F6 the record against the lane's own map, as its relays lay it, and the owner's rulings, derived again
const PIN_DIR = "data/pointer-entries";
const tupleId = (...parts) => parts.join("\u0001");
const RULED = "(a ruled print, under no key)";
let laneMap = null, lane = [];
{
  const faults = [];
  let several = null;
  try {
    laneMap = pointerMap(PIN_DIR);
    lane = laneMap.lines;
    if ((rec.taken_from || {}).sha256 !== laneMap.assembled_sha256) faults.push("the record was not baked from the pinned map as its relays lay it");
    // the rulings name the map the first relay sent; each later relay's rule keeps it standing where it does not speak
    const on = rulingsPinned().filter((r) => [r.file, ...(r.files || [])].some((f) => f && f.sha256 === laneMap.base_sha256));
    if (!on.some((r) => r.class === "MIXED" && typeof r.print === "string")) faults.push("no pinned ruling says what a reading with English of its own prints");
    several = (on.find((r) => r.branch === "several_branch") || {}).resting ?? null;
  } catch (e) { faults.push(e.message); }
  const pure = new Set(), pureAnywhere = new Set();
  for (const l of lane) if (l.class === "FORM_OF") { pure.add(tupleId(l.key, noDot(l.text))); pureAnywhere.add(noDot(l.text)); }
  const takesFirst = several === "FIRST_IN_THE_SOURCES_ORDER";
  const want = new Map();   // key, source, text -> the resolution the map gives it under the rulings, or null
  for (const l of lane) {
    if (l.class !== "FORM_OF") continue;
    const fo = l.form_of || {};
    const f = (fo.several_branch || {}).first_in_the_sources_order, rp = fo.ruled_print;
    let r = fo.resolved && fo.resolved.text ? fo.resolved : null;
    if (!r && takesFirst) r = f && f.resolved && f.resolved.text ? f.resolved : null;
    if (!r && rp && (rp.fills === "resolved" || (rp.fills === "first_in_the_sources_order" && takesFirst))) r = { key: RULED, text: rp.text };
    if (r && (r.key === RULED ? pureAnywhere.has(noDot(r.text)) : pure.has(tupleId(r.key, noDot(r.text))))) r = null;
    want.set(tupleId(l.key, l.m_id, l.text), r ? tupleId(r.key, r.text) : null);
  }
  const have = new Map();
  for (const [k, list] of Object.entries(rec.keys)) for (const e of list) have.set(tupleId(k, e.m, e.t), e.resolved ? tupleId(e.resolved.ruled ? RULED : e.resolved.key, e.resolved.text) : null);
  const say = (x) => x.split("\u0001").join(" · ").slice(0, 90);
  for (const [x, r] of want) { if (!have.has(x)) faults.push(`a pure pointer of the lane's map is not in the record: ${say(x)}`); else if (have.get(x) !== r) faults.push(`the record resolves a pointer otherwise than the lane's map under the rulings: ${say(x)}`); }
  for (const x of have.keys()) if (!want.has(x)) faults.push(`the record carries a reading that is no pure pointer of the lane's map: ${say(x)}`);
  const mixed = lane.filter((l) => l.class === "MIXED").length;
  const got = [...want.values()].filter(Boolean);
  check("F6  the record is the corpus lane's pinned map, as its relays lay it, under the owner's pinned rulings, derived again: every pure pointer and no other reading, each resolved as the map and the rulings say",
    lane.length > 0 && faults.length === 0,
    faults.length ? `${faults.length} · ${faults.slice(0, 3).join(" · ")}` : `${lane.length} lines of the lane's map as relays ${laneMap.relays.map((r) => r.relay).join(" + ")} lay it (${laneMap.assembled_sha256.slice(0, 12)}) · ${want.size} pure pointers, ${got.length} resolved, ${got.filter((x) => x.startsWith(RULED)).length} of them by a ruled print · the branch of several entries rests at ${several} · ${mixed} readings with English of their own are not in the record`);
}

const store = openRouteStore("data/route-store");
// the lane's last receipt: the store the map was made on, and the rounds of named lists run on it or after it, by
// the store index's own history of its versions
const laneReceipt = laneMap ? laneMap.relays[laneMap.relays.length - 1].files.receipt || {} : {};
const madeOn = ((laneReceipt.inputs || {}).route_store || {}).store_version || null;
const since = new Set(madeOn ? [madeOn] : []);
for (const h of store.index.store_version_history || []) if (since.has(h.was)) since.add(h.now);
const strikes = existsSync("data/row-strikes-v1.json") ? JSON.parse(readFileSync("data/row-strikes-v1.json", "utf8")) : { rounds: [] };
const roundsSince = (strikes.rounds || []).filter((r) => r.store_version && since.has(r.store_version.was));
const placedSince = new Map(), rekeyedSince = new Map();
for (const r of roundsSince) for (const x of r.rows || []) {
  const at = x.action === "land" || x.action === "restore" ? x.key : x.action === "re-key" ? x.to_key : null;
  if (at) placedSince.set(tupleId(at, x.m, x.route), `${x.action}, ${String(r.ran_at).slice(0, 10)}`);
  if (x.action === "re-key") rekeyedSince.set(tupleId(x.key, x.rank, x.m, x.route), { key: x.to_key, rank: x.to_rank });
}

// F9 every ruled print the record prints, against the lane's map, its receipts and the store
{
  const faults = [], named = [], byFile = {};
  const lineOf = new Map();
  for (const l of lane) if (l.class === "FORM_OF") lineOf.set(tupleId(l.key, l.m_id, l.text), l);
  // the source files the lane's receipts name, by file name
  const files = {};
  for (const r of laneMap ? laneMap.relays : []) for (const [name, f] of Object.entries((((r.files.verify_receipt || {}).inputs || {}).files) || {})) files[name] = f.sha256;
  const sourceOf = (m) => ((store.index.m_sources || {})[m] || {}).key || null;
  for (const [k, list] of Object.entries(rec.keys)) for (const e of list) {
    if (!e.resolved || !e.resolved.ruled) continue;
    const where = `${k} ${e.m} «${e.resolved.text.slice(0, 40)}»`;
    const l = lineOf.get(tupleId(k, e.m, e.t));
    const rp = l && (l.form_of || {}).ruled_print;
    if (!rp) { faults.push(`${where}: the lane's map has no ruled print for it`); continue; }
    if (rp.text !== e.resolved.text) faults.push(`${where}: the lane's text is «${String(rp.text).slice(0, 40)}»`);
    if (rp.m !== l.m_id || rp.served !== false) faults.push(`${where}: credited to ${rp.m}, its line to ${l.m_id}; served ${rp.served}`);
    const file = rp.file || {};
    if (!files[file.file] || files[file.file] !== file.sha256) faults.push(`${where}: read from ${file.file} ${String(file.sha256).slice(0, 12)}, which no receipt of the lane names`);
    byFile[file.file] = (byFile[file.file] || 0) + 1;
    const src = sourceOf(rp.m);
    if (!src || !Array.isArray(rp.looked_at) || !rp.looked_at.length) { faults.push(`${where}: ${src ? "the lane names no key it looked at" : `the store's index names no source for ${rp.m}`}`); continue; }
    for (const key of rp.looked_at) for (const row of store.routesFor(key) || []) {
      if (sourceOf(String(row[3])) !== src || String(row[1]) !== rp.text) continue;
      const placed = placedSince.get(tupleId(key, String(row[3]), String(row[1])));
      (placed ? named : faults).push(`${where}: ${row[3]} serves it at ${key}, rank ${row[0]}${placed ? ` (${placed})` : ""}`);
    }
  }
  // the lane's own tally of the 458 pure pointers that had no English of their own, against the record
  const tally = { ruled_print: 0, served: 0, unresolved: 0 }, off = [];
  const the458 = laneMap ? laneMap.relays.flatMap((r) => r.files.the_458 || []) : [];
  for (const t of the458) {
    const e = (rec.keys[t.key] || []).find((x) => x.m === t.m_id && x.t === t.text);
    const state = !e || !e.resolved ? "unresolved" : e.resolved.ruled ? "ruled_print" : "served";
    tally[state] += 1;
    if (state !== t.v1_4.state || (e && e.resolved && e.resolved.text !== t.v1_4.english)) off.push(`${t.key} ${t.m_id}: the lane says ${t.v1_4.state} «${String(t.v1_4.english).slice(0, 30)}», the record ${state}`);
  }
  const lanes = (laneReceipt.the_458 || {}).v1_4 || null;
  const laneTally = lanes ? { ruled_print: lanes.ruled_print.lines, served: lanes.served.lines, unresolved: lanes.unresolved.lines } : null;
  if (the458.length && JSON.stringify(tally) !== JSON.stringify(laneTally)) off.push(`the record's tally ${JSON.stringify(tally)} is not the lane's receipt's ${JSON.stringify(laneTally)}`);
  check("F9  every ruled print the record prints is the lane's, byte for byte, credited to its pointer's own m id, served false, read from a file the lane's receipt names, and served by no row of its source where the lane looked; the lane's tally of the 458 is the record's",
    ruledPrinted.length > 0 && faults.length === 0 && off.length === 0,
    faults.length || off.length ? `${faults.length + off.length} · ${[...faults, ...off].slice(0, 3).join(" · ")}`
      : `${ruledPrinted.length} ruled prints (${Object.entries(byFile).map(([f, n]) => `${f} ${n}`).join(", ")}) · the map made on store ${madeOn}; ${roundsSince.length} round(s) of named lists since, ${named.length} row(s) they put where a ruled print's source now serves its text${named.length ? `: ${named.slice(0, 3).join(" · ")}` : ""} · the 458: ${tally.ruled_print} ruled prints, ${tally.served} served, ${tally.unresolved} unresolved, as the lane's receipt says`);
  console.log(`--  F9 the text against the source's own file is not judged here: the lane's source files (${Object.keys(files).join(", ")}) are not kept in this tree; ${ruledPrinted.length} ruled prints counted`);
}

// F10 every row the map names stands in the store
{
  const named = [];
  for (const [i, l] of lane.entries()) {
    const fo = l.form_of || {};
    for (const slot of [fo, ...(Array.isArray(fo.also) ? fo.also : [])]) for (const r of [slot.resolved, ((slot.several_branch || {}).first_in_the_sources_order || {}).resolved]) if (r && r.key) named.push({ line: i + 1, ...r });
  }
  const faults = [];
  let followed = 0, withSha = 0;
  for (const r of named) {
    const rowsAt = (p) => (store.routesFor(p.key) || []).filter((x) => x[0] === p.rank && String(x[3]) === r.m && String(x[1]) === r.text);
    let at = { key: r.key, rank: r.rank }, rows = rowsAt(at), hops = 0;
    for (let next; !rows.length && hops <= 8 && (next = rekeyedSince.get(tupleId(at.key, at.rank, r.m, r.text))); hops += 1) { at = next; rows = rowsAt(at); }
    if (hops) followed += 1;
    const where = `line ${r.line}: ${r.m} rank ${r.rank} at ${r.key} «${String(r.text).slice(0, 40)}»`;
    if (rows.length !== 1) faults.push(`${where} stands ${rows.length} times at ${at.key} rank ${at.rank}`);
    if ("sha16" in r) { withSha += 1; if (sha256Of(Buffer.from(String(r.text), "utf8")).slice(0, 16) !== r.sha16) faults.push(`${where}: its text does not hash to its sha16 ${r.sha16}`); }
  }
  const lanes = laneReceipt.hard_stop_rows || {};
  check("F10 every row the map names stands once in the store at its key and rank with its m id and text, its sha16 where it writes one, a row a named list re-keyed since followed",
    named.length > 0 && faults.length === 0 && named.length === lanes.rows_named,
    faults.length ? `${faults.length} · ${faults.slice(0, 3).join(" · ")}` : `${named.length} rows named (the lane's receipt: ${lanes.rows_named}) · ${withSha} with a sha16 · ${followed} followed through a re-key since store ${madeOn} · store ${store.index.store_version}`);
}

// the words: served plain words whose key holds a row of the pointer's own source that carries a resolved pointer
const urls = zoneUrls();
const base = /^https?:/u.test(process.argv[2] || "") ? process.argv[2].replace(/\/zone\.html.*$/u, "") : null;
// three lists, so each kind is pressed on purpose: the words whose pointer resolves to a served row and whose text
// holds no "/", those whose pointer's text holds one (law F8), and those whose pointer prints a ruled print (law F11)
const plainOnes = [], slashed = [], ruledOnes = [];
const MAX = 12, MAX_SLASHED = 6, MAX_RULED = 6;
{
  const seen = new Set();
  const full = () => plainOnes.length >= MAX && slashed.length >= MAX_SLASHED && ruledOnes.length >= MAX_RULED;
  for (const u of urls) {
    if (full()) break;
    const id = zoneIdOf(u); const path = `data/zones/${id}.bin`;
    if (!existsSync(path)) continue;
    const z = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
    for (const [si, sec] of (z.sections || []).entries()) for (const [ei, w] of (sec.words || []).entries()) {
      if (full()) break;
      // one region its place does not divide, so the card opens on its whole form; in no span, joined to no word
      const l = w.k && !w.w && !seen.has(w.k) ? rec.keys[w.k] : null;
      if (!l || (z.spans && z.spans[w.k]) || /\u05BE/u.test(w.s || "") || (ei > 0 && /\u05BE$/u.test(sec.words[ei - 1].s || "")) || (Array.isArray(w.pg) && w.pg.length > 1)) continue;
      seen.add(w.k);
      const rows = (store.routesFor(w.k) || []).filter((r) => store.index.m_sources[r[3]]);
      const carried = (x) => x.resolved && store.carriersOf(rows, x.t).some((r) => String(r[3]) === x.m);
      const here = { url: base ? `${base}/zone.html?b=${id}` : u, id, label: sec.label, section: si, entry: ei, key: w.k, surface: w.s };
      const plain = plainOnes.length < MAX ? l.find((x) => !x.t.includes("/") && carried(x) && !x.resolved.ruled) : null;
      const slash = slashed.length < MAX_SLASHED ? l.find((x) => x.t.includes("/") && carried(x) && !x.resolved.ruled) : null;
      const ruled = ruledOnes.length < MAX_RULED ? l.find((x) => carried(x) && x.resolved.ruled) : null;
      if (plain) plainOnes.push({ ...here, e: plain });
      if (slash) slashed.push({ ...here, e: slash });
      if (ruled) ruledOnes.push({ ...here, e: ruled });
    }
  }
}
// F3 to F5 are witnessed on a pointer with no "/" where one is served
const candidates = plainOnes.length ? plainOnes : slashed;
check("F0  served zones hold plain words whose key carries a resolved pointer on a row of its own source (found from the zones on disk and the store)", candidates.length > 0,
  candidates.length ? `${candidates.length} word(s) in ${new Set(candidates.map((c) => c.id)).size} zone(s), and ${slashed.length} whose pointer's text holds a "/"; first ${candidates[0].id} ${candidates[0].label}, entry ${candidates[0].entry} · pointer "${candidates[0].e.t}" (${candidates[0].e.m}) · resolves to "${candidates[0].e.resolved.text}" under ${candidates[0].e.resolved.key}` : `none among ${urls.length} zones`);
if (!candidates.length) { console.log(bad ? "\nFAIL" : "\nall checks passed"); process.exit(bad ? 1 : 0); }

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
// in the page: the word's card opened as a reader opens it; then what stands on the card and under the word
const openCard = async ({ section, entry }) => {
  const hud = document.getElementById("hud");
  const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
  const sec = document.querySelectorAll("section.seg")[section];
  const wb = sec ? sec.querySelectorAll(".he-text .wb")[entry] : null;
  if (!wb) return "the word is not on the page";
  wb.scrollIntoView({ block: "center" });
  (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
  const t0 = Date.now();
  while (!settled() && Date.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 50));
  return settled() ? null : "the card's readings did not arrive";
};
const cardNow = ({ section, entry }) => {
  const sec = document.querySelectorAll("section.seg")[section];
  const wb = sec ? sec.querySelectorAll(".he-text .wb")[entry] : null;
  const g = wb ? wb.querySelector(":scope > .g") : null;
  let line = "";
  if (g) { const c = g.cloneNode(true); for (const x of c.querySelectorAll(".g-lic, .lic-chip, .lic")) x.remove(); line = c.textContent.trim(); }
  return {
    line, he: wb ? ((wb.querySelector(":scope > .w") || {}).textContent || "").trim() : "",
    pills: [...document.querySelectorAll("#hud > .rows > .b-read > .r-pills > button")].map((x) => ({ t: x.textContent.trim(), pointer: x.dataset.pointer || null, by: x.dataset.by || "", pressed: x.getAttribute("aria-pressed") === "true" })),
  };
};
const pressPill = (i) => { document.querySelectorAll("#hud > .rows > .b-read > .r-pills > button")[i].click(); };
// the pill carries the pointer's own text as it prints (printedForm: a "/" of the source's prints " + ")
const pointerPill = (card, e) => card.pills.findIndex((x) => x.pointer && printedForm(x.pointer) === printedForm(e.t) && x.by.split(/[\s,]+/u).includes(e.m));
// the letters alone: accents, meteg, rafe, masora circle, paseq, sof pasuq and the marks U+05C4 to U+05C7 set aside
// (points are kept: a resolution moves no point either)
const MARKS = new RegExp("[\\u0591-\\u05AF\\u05BD\\u05BF\\u05C0\\u05C3-\\u05C7\\s]", "gu");
const sameHe = (x, y) => String(x || "").normalize("NFC").replace(MARKS, "") === String(y || "").normalize("NFC").replace(MARKS, "");
// One word's pointer, pressed as a reader presses it. The first word of the list whose card carries the pointer on
// a pill is taken, and everything the laws ask is read from it: the pill as the card opens (F3), the line once the
// pill is pressed (F4), and the line after another pill is pressed and the pointer's pressed again (F5).
let map = null;
const pressed = async (list) => {
  const tried = [];
  for (const c of list) {
    const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
    const q = await ctx.newPage();
    q.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
    await q.goto(c.url, { waitUntil: "networkidle" });
    // every switch that withholds a reading lifted, so no row is kept off the card
    await q.evaluate((kv) => { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); }, STATES.lifted.keep);
    await q.reload({ waitUntil: "networkidle" });
    await q.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
    // the map arrives after the first paint
    await q.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => null);
    map = await q.evaluate(() => (window.__formOf === undefined ? "never" : window.__formOf));
    await linesOnPage(q, { from: c.section, to: c.section + 1 });
    const fault = await q.evaluate(openCard, c);
    await q.waitForTimeout(600);
    const first = fault ? null : await q.evaluate(cardNow, c);
    const at = first ? pointerPill(first, c.e) : -1;
    tried.push(`${c.id} ${c.label}, entry ${c.entry} (${c.key}): ${fault || (at < 0 ? "no pill carries the pointer" : "its pill stands")}`);
    if (at < 0) { await ctx.close(); continue; }
    const want = says(c.e);
    const pill = first.pills[at];
    const bare = first.pills.filter((x) => printedForm(x.t) === printedForm(c.e.t)).length;
    // the pill pressed: a ruling
    await q.evaluate(pressPill, at); await q.waitForTimeout(700);
    const ruled = await q.evaluate(cardNow, c);
    const stands = ruled.pills[pointerPill(ruled, c.e)] || null;
    // another ruling, and back
    const other = ruled.pills.findIndex((x) => !x.pressed && !x.pointer);
    let f5 = null;
    if (other >= 0) {
      await q.evaluate(pressPill, other); await q.waitForTimeout(700);
      const moved = await q.evaluate(cardNow, c);
      const back = pointerPill(moved, c.e);
      if (back >= 0) { await q.evaluate(pressPill, back); await q.waitForTimeout(700); }
      const restored = await q.evaluate(cardNow, c);
      f5 = { other: ruled.pills[other].t, moved: moved.line, back: back >= 0, restored: restored.line, he0: ruled.he, he1: restored.he };
    }
    await ctx.close();
    return { found: c, tried, want, first, pill, bare, ruled, stands, f5 };
  }
  return { found: null, tried };
};
// what the three laws ask of a pressed word
const f3Holds = (x) => x.pill.t === x.want && x.bare === 0;
const f4Holds = (x) => x.ruled.line === x.want && !!x.stands && x.stands.pressed && sameHe(x.ruled.he, x.found.surface);
const f5Holds = (x) => !!x.f5 && x.f5.moved !== x.want && x.f5.moved.includes(noDot(x.f5.other).split(" + ")[0].slice(0, 12)) && x.f5.back && x.f5.restored === x.want && x.f5.he0 === x.f5.he1;
const one = await pressed(candidates);
check("F2  the page loads the map after its first paint and says so", !!map && map !== "never" && map.keys === Object.keys(rec.keys).length && map.pills === rec.counts.pills && map.resolved === rec.counts.resolved,
  JSON.stringify(map));
if (!one.found) check("F3  the pointer's pill prints the resolved reading and carries the pointer's own text", false, `no card of ${candidates.length} pressed carried its pointer on a pill: ${one.tried.join(" | ")}`);
else {
  const { found, want, first, pill, bare, ruled, stands, f5, tried } = one;
  check("F3  with every switch lifted the pointer's pill prints the resolved reading with the relation and target in parentheses and carries the pointer's own text; the pointer's bare text stands on no pill",
    f3Holds(one),
    `${found.id} ${found.label}, entry ${found.entry} (${found.key}): pill "${pill.t}" · wanted "${want}" · data-pointer "${pill.pointer}" · the bare pointer on ${bare} pill(s) · ${first.pills.filter((x) => x.pointer).length} pointer pill(s) of ${first.pills.length}${tried.length > 1 ? ` · tried ${tried.join(" | ")}` : ""}`);
  check("F4  that pill pressed, the line under the word prints the same, and the Hebrew is the Hebrew",
    f4Holds(one),
    `line "${ruled.line}" · wanted "${want}" · the pill ${stands && stands.pressed ? "pressed" : "not pressed"} · Hebrew ${sameHe(ruled.he, found.surface) ? "unmoved" : `"${ruled.he}" vs "${found.surface}"`}`);
  check("F5  another pill pressed moves the line to it; the pointer pill pressed again puts the resolution back; the Hebrew never moved",
    f5Holds(one),
    f5 ? `"${f5.other}" -> line "${f5.moved}" · back -> "${f5.restored}" · Hebrew ${f5.he0 === f5.he1 ? "unmoved" : "MOVED"}` : "the card offers no other plain pill to press");
}
// F8 the same on a pointer whose text holds a "/"
{
  const slashedInRecord = resolved.filter((e) => e.t.includes("/")).length;
  const held = candidates === slashed ? one : slashed.length ? await pressed(slashed) : null;
  const where = held && held.found ? `${held.found.id} ${held.found.label}, entry ${held.found.entry} (${held.found.key})` : "";
  check("F8  a pointer whose text holds a \"/\": its pill prints the resolution, the line prints the same once it is pressed, and pressed again after another it is put back",
    slashed.length === 0 || (!!held && !!held.found && f3Holds(held) && f4Holds(held) && f5Holds(held)),
    slashed.length === 0 ? `no served plain word carries one on a row of its own source (${slashedInRecord} of the record's ${resolved.length} resolved pointers hold a "/"), so there is nothing to press`
      : !held.found ? `no card of ${slashed.length} pressed carried its pointer on a pill: ${held.tried.join(" | ")}`
        : `${where}${held === one ? ", the word of F3 to F5" : ""}: pointer "${held.found.e.t}" · pill "${held.pill.t}" · pressed, line "${held.ruled.line}" · wanted "${held.want}"${held.f5 ? ` · after "${held.f5.other}" and back: "${held.f5.restored}"` : " · the card offers no other plain pill to press"} · ${slashed.length} such word(s) found, ${slashedInRecord} of the record's ${resolved.length} resolved pointers hold a "/"`);
}
// F11 the same on a pointer whose pill prints a ruled print
{
  const held = ruledOnes.length ? await pressed(ruledOnes) : null;
  const where = held && held.found ? `${held.found.id} ${held.found.label}, entry ${held.found.entry} (${held.found.key})` : "";
  check("F11 a pointer whose pill prints a ruled print: its pill prints the English the lane's map carries, the line prints the same once it is pressed, and pressed again after another it is put back",
    ruledPrinted.length === 0 || (!!held && !!held.found && f3Holds(held) && f4Holds(held) && f5Holds(held)),
    ruledPrinted.length === 0 ? "the record prints no ruled print, so there is nothing to press"
      : !held ? `no served plain word carries one on a row of its own source (the record prints ${ruledPrinted.length})`
        : !held.found ? `no card of ${ruledOnes.length} pressed carried its pointer on a pill: ${held.tried.join(" | ")}`
          : `${where}: pointer "${held.found.e.t}" (${held.found.e.m}) · pill "${held.pill.t}" · wanted "${held.want}" · pressed, line "${held.ruled.line}"${held.f5 ? ` · after "${held.f5.other}" and back: "${held.f5.restored}"` : " · the card offers no other plain pill to press"} · ${ruledOnes.length} such word(s) found, ${ruledPrinted.length} ruled prints in the record`);
}
// F7 a reading with English of its own prints its own words. The words are found in the data: a served plain word
// whose key holds such a reading on a row its ledger leaves whole; its card is opened with every switch lifted
{
  const mixedOf = new Map();   // key -> its readings with English of their own, as the lane's file names them
  for (const l of lane) if (l.class === "MIXED") (mixedOf.get(l.key) || mixedOf.set(l.key, []).get(l.key)).push(l);
  const picks = [], seen = new Set();
  for (const u of urls) {
    if (picks.length >= 8) break;
    const zid = zoneIdOf(u), path = `data/zones/${zid}.bin`;
    if (!existsSync(path)) continue;
    const z = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
    for (const [si, sec] of (z.sections || []).entries()) for (const [ei, w] of (sec.words || []).entries()) {
      if (picks.length >= 8 || !w.k || w.w || seen.has(w.k) || !mixedOf.has(w.k) || (z.spans && z.spans[w.k]) || /\u05BE/u.test(w.s || "")) continue;
      const row = (store.routesFor(w.k) || []).find((r) => !Array.isArray(r[7]) && !Array.isArray(r[8]) && mixedOf.get(w.k).some((l) => l.m_id === String(r[3]) && l.text === String(r[1])));
      if (!row) continue;
      seen.add(w.k);
      picks.push({ url: base ? `${base}/zone.html?b=${zid}` : u, zone: zid, label: sec.label, section: si, entry: ei, key: w.k, m: String(row[3]), own: printedForm(routePrinted(row).trim()) });
    }
  }
  const faults = [], judged = [];
  for (const pick of picks) {
    const c2 = await b.newContext({ viewport: { width: 412, height: 915 } });
    try {
      const q = await c2.newPage();
      await q.goto(pick.url, { waitUntil: "networkidle" });
      await q.evaluate((kv) => { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); }, STATES.lifted.keep);
      await q.reload({ waitUntil: "networkidle" });
      await q.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      await q.waitForFunction(() => window.__formOf !== undefined, null, { timeout: 30000 }).catch(() => null);
      await linesOnPage(q, { from: pick.section, to: pick.section + 1 });
      const got = await q.evaluate(async ({ section, entry, m, own }) => {
        const hud = document.getElementById("hud");
        const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
        const sec = document.querySelectorAll("section.seg")[section];
        const wb = sec ? sec.querySelectorAll(".he-text .wb")[entry] : null;
        if (!wb) return { fault: "the word is not on the page" };
        wb.scrollIntoView({ block: "center" });
        (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
        const t0 = Date.now();
        while (!settled() && Date.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 50));
        if (!settled()) return { fault: "the card's readings did not arrive" };
        await new Promise((r) => setTimeout(r, 600));
        const mine = [...hud.querySelectorAll(":scope > .rows > .b-read > .r-pills > button")].filter((x) => (x.dataset.by || "").split(/[\s,]+/u).includes(m));
        const asItself = mine.find((x) => x.textContent === own);
        const over = mine.find((x) => (x.dataset.pointer || "") === own);
        return { pills: mine.length, asItself: !!asItself, pointerOnIt: asItself ? asItself.dataset.pointer || null : null, printedOver: over ? over.textContent : null };
      }, pick);
      const where = `${pick.zone} ${pick.label}, entry ${pick.entry} (${pick.key}, ${pick.m})`;
      if (got.fault) { faults.push(`${where}: ${got.fault}`); continue; }
      if (got.printedOver !== null) faults.push(`${where}: «${pick.own.slice(0, 50)}» is printed over as «${String(got.printedOver).slice(0, 50)}»`);
      if (!got.asItself) continue;   // the card opened on a division of the word, or the reading is grouped under another's wording
      if (got.pointerOnIt) faults.push(`${where}: the pill of «${pick.own.slice(0, 50)}» carries a pointer`);
      judged.push(where);
    } finally { await c2.close(); }
  }
  check("F7  a reading with English of its own beside its pointer stands on a pill as its own words, and carries no pointer", faults.length === 0 && judged.length > 0,
    faults.length ? `${faults.length} · ${faults.slice(0, 3).join(" · ")}` : judged.length ? `${judged.length} of ${picks.length} cards pressed showed the reading: ${judged[0]}` : `none of ${picks.length} cards pressed showed such a reading on a pill of its own`);
}
await b.close();
console.log(bad ? `\nFAIL ${bad}` : "\nall checks passed");
process.exit(bad ? 1 : 0);
