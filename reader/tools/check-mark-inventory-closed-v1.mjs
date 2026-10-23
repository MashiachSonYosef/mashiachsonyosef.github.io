#!/usr/bin/env node
// GUARDS: mark-inventory-rule-v1-closed-set-over-route-text
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// The inventory tool, tools/mark-inventory-v1.mjs, walks every shard of the
// route store and lists, for every provider, every mark its route text uses.
// A mark is "any character that is not a letter, not a digit and not
// whitespace." The tool says of itself:
//
//     This tool makes NO claim about what any mark means. It only
//     establishes the closed set that a declaration must cover, so that a
//     missing rule is distinguishable from a rule nobody has written yet.
//
// So the inventory is worth exactly as much as it is closed. A mark in route
// text that the inventory does not name is a slot no declaration will ever be
// asked for. A mark the inventory names that no route carries is a slot a
// declaration gets written for nothing. And a field on the inventory that
// says what a mark means is the tool doing the job it said it would not do:
// a meaning on the page with no declaration behind it.
//
// This check re-walks the shards with the tool's own definition of a mark and
// holds the inventory to what is on disk.
//
//   L1  the inventory was emitted from the store on this disk
//   L2  every provider present in the store is named
//   L3  every mark a provider uses in route text is in that provider's list
//   L4  no provider and no mark is named that the store no longer carries
//   L5  what the inventory states (codepoint, counts, labels, examples) is
//       what the shards hold, and it states each thing once: a provider or a
//       mark record that repeats is a second statement about one slot and
//       fails here, so no copy goes unjudged
//   L6  the inventory makes no claim of meaning: every record carries the
//       counting fields of MARK_INVENTORY_V1 and nothing else
//
// L6 is a closed field set on purpose. The schema is versioned, so a field
// this check does not know is a claim until the schema says otherwise.
//
// What this check does NOT prove: that a declaration covers the set. That is
// the provider-declaration rule's question, held by tools/declarations-v1.json
// and its own checks. This one proves only that the set they must cover is
// the set that is there.
//
// Run: node tools/check-mark-inventory-closed-v1.mjs [--inventory build/mark-inventory-v1.json]
//                                                   [--store data/route-store/index.json]
//                                                   [--shards data/route-store/shards]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const INVENTORY = arg("inventory", join(K3, "build", "mark-inventory-v1.json"));
const STORE = arg("store", join(K3, "data", "route-store", "index.json"));
const SHARDS = arg("shards", join(dirname(STORE), "shards"));

const RULE_ID = "mark-inventory-rule-v1-closed-set-over-route-text";
const SCHEMA = "MARK_INVENTORY_V1";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

if (!existsSync(INVENTORY)) {
  console.log(`SKIPPED — no mark inventory at ${INVENTORY}; emit one with: node tools/mark-inventory-v1.mjs data/route-store ${INVENTORY}`);
  process.exit(3);
}
if (!existsSync(STORE)) { console.log(`SKIPPED — no route store index at ${STORE}`); process.exit(3); }
if (!existsSync(SHARDS)) { console.log(`SKIPPED — no shards at ${SHARDS}`); process.exit(3); }

let inv;
try { inv = JSON.parse(readFileSync(INVENTORY, "utf8")); } catch (e) {
  console.log(`SKIPPED — ${INVENTORY} is not readable JSON: ${e.message}`);
  process.exit(3);
}
const index = JSON.parse(readFileSync(STORE, "utf8"));
const shardFiles = readdirSync(SHARDS).filter((f) => f.endsWith(".bin")).sort();
if (!shardFiles.length) { console.log(`SKIPPED — no shards in ${SHARDS}`); process.exit(3); }

// The tool's own definition, copied rather than paraphrased. A check that
// counts marks by a different rule is checking a different inventory.
const isMark = (ch) => !/[\p{L}\p{N}\s]/u.test(ch);
const cpName = (ch) => "U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
// Offenders are named by codepoint. A mark may be a vowel sign of the corpus
// script, and this output is read by people who cannot see one. ASCII marks
// are shown beside their codepoint because they are ours to print.
const show = (ch) => (ch.codePointAt(0) < 0x80 ? `${cpName(ch)} ${JSON.stringify(ch)}` : cpName(ch));
const few = (list, n = 4) => list.slice(0, n).join(" · ") + (list.length > n ? ` · +${list.length - n} more` : "");

// ── what the inventory says ───────────────────────────────────────────────
const invProviders = Array.isArray(inv.providers) ? inv.providers : [];
// provider id -> { p, marks: Map(mark -> entry), examples: Map(mark -> Map(example -> seen)), listed }
const named = new Map();
// A record that repeats is two statements about one slot. Folding them into
// a Map would keep only the last and judge that one alone, so a false first
// copy would pass. Every repeat is kept here and L5 fails on it.
const repeated = [];
let markRecords = 0;
for (const p of invProviders) {
  const id = String(p.provider);
  if (named.has(id)) { repeated.push(`provider ${id} listed twice`); continue; }
  const marks = new Map();
  const examples = new Map();
  let listed = 0;
  for (const m of Array.isArray(p.marks) ? p.marks : []) {
    listed += 1;
    markRecords += 1;
    const mark = String(m.mark);
    if (marks.has(mark)) { repeated.push(`${id} ${show(mark)} listed twice`); continue; }
    marks.set(mark, m);
    const ex = new Map();
    for (const e of Array.isArray(m.examples) ? m.examples : []) ex.set(String(e), false);
    examples.set(mark, ex);
  }
  named.set(id, { p, marks, examples, listed });
}

// ── what the shards hold ──────────────────────────────────────────────────
// provider id -> { routes, marks: Map(mark -> {n, rows}), region }
const seen = new Map();
const bump = (id) => {
  let b = seen.get(id);
  if (!b) { b = { routes: 0, marks: new Map(), region: { whole: 0, slice: 0, absent: 0 } }; seen.set(id, b); }
  return b;
};
let totalRoutes = 0, totalKeys = 0;
for (const f of shardFiles) {
  let shard;
  try { shard = JSON.parse(gunzipSync(readFileSync(join(SHARDS, f))).toString("utf8")); } catch (e) {
    console.log(`SKIPPED — shard ${f} would not open: ${e.message}`);
    process.exit(3);
  }
  for (const rows of Object.values(shard)) {
    totalKeys += 1;
    for (const row of rows) {
      const R = String(row[1]);
      const D = String(row[2]);
      const source = String(row[3]);
      const b = bump(source);
      b.routes += 1;
      totalRoutes += 1;
      const Rt = R.trim(), Dt = D.trim();
      if (Rt === Dt) b.region.whole += 1;
      else if (Dt.includes(Rt)) b.region.slice += 1;
      else b.region.absent += 1;

      const here = new Set();
      for (const ch of R) {
        if (!isMark(ch)) continue;
        let m = b.marks.get(ch);
        if (!m) { m = { n: 0, rows: 0 }; b.marks.set(ch, m); }
        m.n += 1;
        if (!here.has(ch)) { here.add(ch); m.rows += 1; }
      }
      if (!here.size) continue;
      // An example the inventory quotes must be a route on disk that carries
      // the mark it is quoted for. Collapsed whitespace is the tool's own form.
      const nm = named.get(source);
      if (!nm) continue;
      let collapsed = null;
      for (const ch of here) {
        const ex = nm.examples.get(ch);
        if (!ex || !ex.size) continue;
        if (collapsed === null) collapsed = R.replace(/\s+/g, " ");
        if (ex.has(collapsed)) ex.set(collapsed, true);
      }
    }
  }
}

const slotsOnDisk = [...seen.values()].reduce((a, b) => a + b.marks.size, 0);
const slotsNamed = [...named.values()].reduce((a, b) => a + b.marks.size, 0);
console.log(`— ${shardFiles.length} shards · ${totalRoutes.toLocaleString()} routes over ${totalKeys.toLocaleString()} keys · ${seen.size} providers on disk, ${invProviders.length} provider records · ${slotsOnDisk} slots on disk, ${slotsNamed} named in ${markRecords} mark records —\n`);
if (index.counts && (index.counts.routes !== totalRoutes || index.counts.keys !== totalKeys)) {
  console.log(`  note: the index counts ${index.counts.routes} routes over ${index.counts.keys} keys; the walk found ${totalRoutes} over ${totalKeys}. The walk is what this check judges against.\n`);
}

// L1 — the inventory is an inventory, and it is of this store.
const from = inv.emitted_from || {};
const l1 = [];
if (inv.schema_version !== SCHEMA) l1.push(`schema_version ${JSON.stringify(inv.schema_version)} is not ${SCHEMA}`);
if (inv.rule_id !== RULE_ID) l1.push(`rule_id ${JSON.stringify(inv.rule_id)}`);
if (from.store_version !== index.store_version) l1.push(`store_version ${from.store_version} but the store is ${index.store_version}`);
if (from.route_store_rule !== index.rule_id) l1.push(`route_store_rule ${from.route_store_rule} but the store is under ${index.rule_id}`);
if (from.routes !== totalRoutes) l1.push(`emitted over ${from.routes} routes, ${totalRoutes} walked`);
if (from.keys !== totalKeys) l1.push(`emitted over ${from.keys} keys, ${totalKeys} walked`);
check("L1  the inventory was emitted from the store on this disk",
  l1.length === 0,
  l1.length ? few(l1) : `${SCHEMA} · store ${index.store_version} · ${totalRoutes.toLocaleString()} routes`);

// L2 — every provider on disk is named, with or without marks.
const unnamedProviders = [...seen.keys()].filter((id) => !named.has(id));
check("L2  every provider present in the store is named",
  unnamedProviders.length === 0,
  unnamedProviders.length
    ? `${unnamedProviders.length} not named — ${few(unnamedProviders.map((id) => `${id} (${seen.get(id).routes} routes, ${seen.get(id).marks.size} marks)`))}`
    : `${seen.size} providers, every one listed`);

// L3 — the set is closed from below: nothing in route text is missing from it.
const missing = [];
for (const [id, b] of seen) {
  const nm = named.get(id);
  for (const [mark, m] of b.marks) {
    if (!nm || !nm.marks.has(mark)) missing.push({ id, mark, rows: m.rows });
  }
}
missing.sort((a, b) => b.rows - a.rows);
check("L3  every mark a provider uses in route text is in that provider's list",
  missing.length === 0,
  missing.length
    ? `${missing.length} slot(s) unnamed — ${few(missing.map((x) => `${x.id} ${show(x.mark)} in ${x.rows} routes`))}`
    : `${slotsOnDisk} provider-mark slots on disk, all named`);

// L4 — and closed from above: nothing named has stopped occurring.
const staleProviders = [...named.keys()].filter((id) => !seen.has(id));
const staleMarks = [];
for (const [id, nm] of named) {
  const b = seen.get(id);
  if (!b) continue;
  for (const mark of nm.marks.keys()) if (!b.marks.has(mark)) staleMarks.push(`${id} ${show(mark)}`);
}
check("L4  no provider and no mark is named that the store no longer carries",
  staleProviders.length === 0 && staleMarks.length === 0,
  staleProviders.length || staleMarks.length
    ? [staleProviders.length ? `${staleProviders.length} provider(s) gone: ${few(staleProviders)}` : "",
       staleMarks.length ? `${staleMarks.length} mark(s) gone: ${few(staleMarks)}` : ""].filter(Boolean).join(" · ")
    : `${slotsNamed} slots named, every one still on disk`);

// L5 — what it states is what is there.
const wrong = [];
const say = (s) => { if (wrong.length < 40) wrong.push(s); else wrong.push(null); };
// A repeated record first. Two records for one slot cannot both be what the
// shards hold, and one of them was never judged below.
for (const r of repeated) say(r);
const labels = index.m_sources || {};
for (const [id, nm] of named) {
  const b = seen.get(id);
  const p = nm.p;
  const expectLabel = (labels[id] && labels[id].label) || null;
  if ((p.label ?? null) !== expectLabel) say(`${id} label ${JSON.stringify(p.label)}`);
  if (p.mark_count !== nm.listed) say(`${id} mark_count ${p.mark_count} but lists ${nm.listed}`);
  if (!b) continue;
  if (p.routes !== b.routes) say(`${id} routes ${p.routes} vs ${b.routes}`);
  const r = p.route_region_in_definition || {};
  for (const k of ["whole", "slice", "absent"]) if (r[k] !== b.region[k]) say(`${id} region.${k} ${r[k]} vs ${b.region[k]}`);
  for (const [mark, m] of nm.marks) {
    const d = b.marks.get(mark);
    if (!d) continue;
    if ([...mark].length !== 1 || !isMark(mark)) say(`${id} ${JSON.stringify(mark)} is not a single mark`);
    if (m.codepoint !== cpName(mark)) say(`${id} ${show(mark)} codepoint ${m.codepoint}`);
    if (m.occurrences !== d.n) say(`${id} ${show(mark)} occurrences ${m.occurrences} vs ${d.n}`);
    if (m.routes_carrying_it !== d.rows) say(`${id} ${show(mark)} routes_carrying_it ${m.routes_carrying_it} vs ${d.rows}`);
    const ex = nm.examples.get(mark);
    if (ex.size > 3) say(`${id} ${show(mark)} quotes ${ex.size} examples, the tool quotes at most 3`);
    for (const [e, found] of ex) if (!found) say(`${id} ${show(mark)} example not on disk: ${JSON.stringify(e).slice(0, 48)}`);
  }
}
const c = inv.counts || {};
const onDisk = {
  providers: seen.size,
  providers_with_no_marks: [...seen.values()].filter((b) => b.marks.size === 0).length,
  declaration_slots: slotsOnDisk,
  slots_under_ten_routes: [...seen.values()].reduce((a, b) => a + [...b.marks.values()].filter((m) => m.rows < 10).length, 0),
  distinct_marks_store_wide: new Set([...seen.values()].flatMap((b) => [...b.marks.keys()])).size,
};
for (const k of Object.keys(onDisk)) if (c[k] !== onDisk[k]) say(`counts.${k} ${c[k]} vs ${onDisk[k]}`);
check("L5  what the inventory states is what the shards hold",
  wrong.length === 0,
  wrong.length
    ? `${wrong.length} statement(s) differ — ${few(wrong.filter(Boolean))}`
    : `codepoints, counts, labels and ${[...named.values()].reduce((a, nm) => a + [...nm.examples.values()].reduce((x, ex) => x + ex.size, 0), 0)} quoted examples all as on disk`);

// L6 — no claim of meaning. Every field is one of the counting fields.
const TOP = new Set(["schema_version", "rule_id", "emitted_from", "counts", "providers"]);
const EMITTED = new Set(["route_store_rule", "store_version", "keys", "routes"]);
const COUNTS = new Set(["providers", "providers_with_no_marks", "declaration_slots", "slots_under_ten_routes", "distinct_marks_store_wide"]);
const PROVIDER = new Set(["provider", "label", "routes", "route_region_in_definition", "mark_count", "marks"]);
const REGION = new Set(["whole", "slice", "absent"]);
const MARK = new Set(["mark", "codepoint", "occurrences", "routes_carrying_it", "examples"]);
const claims = [];
const claim = (s) => { if (claims.length < 40) claims.push(s); else claims.push(null); };
const strayKeys = (obj, allowed, where) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) { claim(`${where} is not a record`); return; }
  for (const k of Object.keys(obj)) if (!allowed.has(k)) claim(`${where}.${k}`);
};
strayKeys(inv, TOP, "inventory");
strayKeys(inv.emitted_from, EMITTED, "emitted_from");
strayKeys(inv.counts, COUNTS, "counts");
for (const p of invProviders) {
  const id = String(p.provider);
  strayKeys(p, PROVIDER, `providers[${id}]`);
  strayKeys(p.route_region_in_definition, REGION, `providers[${id}].route_region_in_definition`);
  for (const m of Array.isArray(p.marks) ? p.marks : []) {
    const where = `providers[${id}].marks[${typeof m.mark === "string" ? show(m.mark) : JSON.stringify(m.mark)}]`;
    strayKeys(m, MARK, where);
    if (m && !Array.isArray(m.examples)) claim(`${where}.examples is not a list`);
    else for (const e of m.examples) if (typeof e !== "string") claim(`${where}.examples holds a ${typeof e}, not route text`);
  }
}
check("L6  the inventory makes no claim of meaning: counting fields and nothing else",
  claims.length === 0,
  claims.length
    ? `${claims.length} field(s) beyond the schema — ${few(claims.filter(Boolean))}`
    : `${named.size} provider records and ${slotsNamed} mark records carry only ${[...MARK].join(", ")}`);

console.log("\n  what this does not say: that any declaration covers this set. The inventory");
console.log("  is the list of slots; tools/declarations-v1.json and the checks on the");
console.log("  provider-declaration rule say which slots have a rule. This one says only");
console.log("  that the list is the whole of what route text carries, and no more.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
