#!/usr/bin/env node
// GUARDS: rule-demonstration-rule-v1-a-demonstration-is-the-reader-on-a-passage-never-a-drawing-of-one
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// A DEMONSTRATION IS THE READER ON A PASSAGE, NEVER A DRAWING OF ONE.
//
// The page this replaces imitated the reader's card with typed Hebrew inside
// it, and a drawing of a card demonstrates a drawing. Each of the eight rules
// now stands on a real zone, built by the builder every served book goes
// through and opened by the reader with the reader's own card. The whole
// difference between a demonstration and a book is that a demonstration says
// three things out loud, and this check is what holds it to them:
//
//   it is an instrument · its ink is carried or typed, per row · it is
//   nobody's work
//
//   L1  the record declares the rule and its two tiers, and every entry
//       carries plain English, the C0 law in a line, a tier, and rows
//   L2  every rule in the record has a zone, and every demonstration zone on
//       disk answers to a rule in the record: no orphan either way
//   L3  every demonstration zone is branded an instrument in its own file,
//       rides the demonstration route, and claims no position in the corpus's
//       id space — its rows run 1..n in a space of its own
//   L4  a carried rule names its source, its work, its unit and a hash; a
//       typed rule names why and where the wire goes; a rule with typed rows
//       names them, and the zone marks exactly those words and no others
//   L5  no demonstration is served as a work: its rights are the instrument's
//       own declaration, it is not in the fleet's ledger, and the door does
//       not list it among the books
//   L6  the pages are the reader: an index that names every rule, and one
//       page per built zone, each carrying that zone's own reader metas
//   L7  the index prints no Hebrew at all — every character of every passage
//       is in the zone the link opens, where the card answers for it
//
// What this does NOT prove: that a carried passage is what its source says
// (the probe read the source and the record names it by hash), or that a
// rule's plain English is a good sentence. It proves that nothing here
// pretends to be a book, and that what claims to be carried names what it
// was carried from.
//
// Run: node tools/check-demonstrations-v1.mjs [--record data/rule-demonstrations-v1.json]
//        [--zones data/zones] [--out deploy-root]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); const v = i > -1 ? process.argv[i + 1] : undefined; return v && !v.startsWith("--") ? v : d; };
const RECORD = arg("record", join(K3, "data", "rule-demonstrations-v1.json"));
const ZONES = arg("zones", join(K3, "data", "zones"));
const OUT = arg("out", join(K3, "deploy-root"));
const LEDGER = join(K3, "build", "fleet-ledger-v2.json");
const RULE = "rule-demonstration-rule-v1-a-demonstration-is-the-reader-on-a-passage-never-a-drawing-of-one";
const ROUTE = "DEMONSTRATION_PASSAGE__INSTRUMENT";
const RIGHTS = "RIGHTS_FIXTURE__NEVER_SERVABLE";
const HEX64 = /^[0-9a-f]{64}$/u;
const HEBREW = /[֐-׿יִ-ﭏ]/u;

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (l, n = 3) => l.slice(0, n).join(" · ");

if (!existsSync(RECORD)) { console.log(`SKIPPED — no demonstration record at ${RECORD}`); process.exit(3); }
const rec = JSON.parse(readFileSync(RECORD, "utf8"));

// L1
const why1 = [];
if (rec.schema_version !== "RULE_DEMONSTRATIONS_V1") why1.push(`schema ${rec.schema_version}`);
if (rec.rule_id !== RULE) why1.push("the record names another rule");
if (!rec.the_law_every_card_obeys || !rec.the_fence || !rec.the_tiers) why1.push("the record states no law, no fence or no tiers");
for (const r of rec.rules || []) {
  for (const need of ["id", "n", "name_en", "letter", "the_c0_law", "plainly", "tier", "rows"])
    if (r[need] === undefined) why1.push(`${r.id || "?"}: no ${need}`);
  if (!(r.rows || []).length) why1.push(`${r.id}: no rows`);
  if (!rec.the_tiers[r.tier]) why1.push(`${r.id}: tier ${r.tier} is not one the record declares`);
}
check("L1  the record declares the rule and its tiers, and every entry is complete", why1.length === 0,
  why1.length ? `${why1.length} — ${few(why1)}` : `${(rec.rules || []).length} rules · ${Object.keys(rec.the_tiers).length} tiers`);

// L2
const onDisk = existsSync(ZONES) ? readdirSync(ZONES).filter((f) => /^fixture-rule-.+\.bin$/u.test(f)).map((f) => f.replace(/^fixture-rule-|\.bin$/gu, "")) : [];
const inRecord = (rec.rules || []).map((r) => r.id);
const noZone = inRecord.filter((id) => !onDisk.includes(id));
const noRule = onDisk.filter((id) => !inRecord.includes(id));
check("L2  every rule has a zone and every demonstration zone answers to a rule", noZone.length + noRule.length === 0,
  noZone.length || noRule.length
    ? `${noZone.length ? `no zone: ${few(noZone)}` : ""}${noZone.length && noRule.length ? " · " : ""}${noRule.length ? `no rule: ${few(noRule)}` : ""}`
    : `${onDisk.length} built${noZone.length ? "" : ""}`);

const zones = new Map();
for (const id of onDisk) {
  try { zones.set(id, JSON.parse(gunzipSync(readFileSync(join(ZONES, `fixture-rule-${id}.bin`))).toString("utf8"))); } catch { /* L2 said so */ }
}

// L3
const l3 = [];
for (const [id, z] of zones) {
  const e = z.emitted_from || {}, walk = e.walk || {}, io = e.identity_oracle || {};
  const w = [];
  if (!e.test_instrument || !e.test_instrument.generator) w.push("not branded an instrument");
  if (z.route !== ROUTE) w.push(`route ${z.route}`);
  if (!walk.demonstration_oracle) w.push("no demonstration oracle");
  if (walk.fixture !== true) w.push("the serve was not branded a fixture");
  if (io.first_c0_numeric_id !== 1) w.push(`its positions start at ${io.first_c0_numeric_id}, not 1`);
  const n = (z.counts || {}).c0_rows_walked ?? (z.counts || {}).words;
  if (io.last_c0_numeric_id !== n) w.push(`positions run to ${io.last_c0_numeric_id} over ${n} rows`);
  if (w.length) l3.push(`${id}: ${w.join("; ")}`);
}
check("L3  every demonstration is branded an instrument, on its own route, in its own id space", l3.length === 0,
  l3.length ? `${l3.length} — ${few(l3)}` : `${zones.size} zones, positions 1..n of their own`);

// L4
const l4 = [];
for (const r of rec.rules || []) {
  const z = zones.get(r.id); if (!z) continue;
  const dm = ((z.emitted_from || {}).walk || {}).demonstration_oracle || {};
  const w = [];
  if (r.carried_from) {
    const c = r.carried_from;
    for (const need of ["work_id", "unit_id", "source"]) if (!c[need]) w.push(`carried with no ${need}`);
    if (c.sha256 && !HEX64.test(String(c.sha256))) w.push("a source hash that is not 64 hex");
    if (!dm.carried) w.push("the record says carried, the zone does not");
  } else {
    if (!(r.typed && r.typed.why)) w.push("typed with no reason");
    if (!(r.typed && r.typed.where_the_wire_goes)) w.push("typed with no wire named");
    if (!dm.typed) w.push("the record says typed, the zone does not");
  }
  const typedRows = (r.rows || []).map((x, i) => (x && x.typed ? i : -1)).filter((i) => i >= 0);
  if (typedRows.length) {
    const named = dm.typed_rows || [];
    if (named.join(",") !== typedRows.join(",")) w.push(`the record types rows ${typedRows.join(",")}, the zone names ${named.join(",")}`);
    if (!dm.typed_rows_why) w.push("typed rows with no reason");
    const marked = [];
    (z.sections || []).forEach((s) => (s.words || []).forEach((word, i) => { if (word.typed_here) marked.push(i); }));
    if (marked.join(",") !== typedRows.join(",")) w.push(`the zone marks words ${marked.join(",")} as typed, the record types ${typedRows.join(",")}`);
  }
  if (w.length) l4.push(`${r.id}: ${w.join("; ")}`);
}
const carriedN = (rec.rules || []).filter((r) => r.carried_from).length;
const typedRowsN = (rec.rules || []).reduce((n, r) => n + (r.rows || []).filter((x) => x && x.typed).length, 0);
check("L4  carried names its source, typed names its reason and its wire, typed rows are marked on the word", l4.length === 0,
  l4.length ? `${l4.length} — ${few(l4)}` : `${carriedN} carried, ${(rec.rules || []).length - carriedN} typed, ${typedRowsN} typed row(s) marked`);

// L5
const l5 = [];
for (const [id, z] of zones) {
  const r = ((z.emitted_from || {}).walk || {}).rights || {};
  if (r.source !== RIGHTS) l5.push(`${id}: rights source ${r.source}`);
}
if (existsSync(LEDGER)) {
  const led = JSON.parse(readFileSync(LEDGER, "utf8")).ledger || [];
  for (const e of led) if (String(e.work || "").startsWith("demonstration/")) l5.push(`${e.work} is in the fleet's ledger`);
}
const receipt = join(OUT, "front-door-counts-receipt-v1.json");
if (existsSync(receipt)) {
  const rz = (JSON.parse(readFileSync(receipt, "utf8")).rendered || {}).zones || [];
  for (const p of rz) if (String(p.path || "").includes("fixture-rule-")) l5.push(`the door lists ${p.path} among the books`);
}
check("L5  no demonstration is served as a work: instrument rights, not in the fleet, not on the shelf list", l5.length === 0,
  l5.length ? `${l5.length} — ${few(l5)}` : "the instrument's own rights, and nowhere among the books");

// L6 and L7
const idx = join(OUT, "demonstrations", "index.html");
if (!existsSync(idx)) console.log("  --  L6 and L7 SKIPPED — the door has not been built into this directory");
else {
  const html = readFileSync(idx, "utf8");
  const l6 = [];
  for (const r of rec.rules || []) {
    if (!html.includes(`/demonstrations/${r.id}/`)) l6.push(`${r.id} is not linked from the index`);
    const page = join(OUT, "demonstrations", r.id, "index.html");
    if (!zones.has(r.id)) continue;
    if (!existsSync(page)) { l6.push(`${r.id} has no page`); continue; }
    const p = readFileSync(page, "utf8");
    if (!p.includes(`name="reader-book" content="fixture-rule-${r.id}"`)) l6.push(`${r.id}'s page does not open its own zone`);
    if (!p.includes('name="reader-demonstration"')) l6.push(`${r.id}'s page carries no rule line`);
  }
  check("L6  the pages are the reader: an index that names every rule, one page per zone", l6.length === 0,
    l6.length ? `${l6.length} — ${few(l6)}` : `1 index · ${zones.size} pages, each opening its own zone`);
  const body = html.slice(html.indexOf("<body"));
  const heb = [...body.replace(/<[^>]+>/gu, " ")].filter((c) => HEBREW.test(c));
  check("L7  the index prints no Hebrew: every passage is in the zone its link opens", heb.length === 0,
    heb.length ? `${heb.length} character(s) on the index` : "none");
}

console.log("\n  what this does not say: that a carried passage is what its source says — the record names");
console.log("  the source and its hash, and the probe that cut it read the source itself.");
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
