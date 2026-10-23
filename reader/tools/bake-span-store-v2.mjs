// THE SPAN STORE, SERVED FROM V2 (Moses's relay v80, 22 October 2026: "span
// store v2: 9 of 9 acceptance tests pass"). v2 SHARES THE RECORD, NEVER THE
// CLAIM: a place is a claim naming the dictionary records (rids) that stand
// there, and carries no record text; the record's R, D and headwords are the
// dictionary store's, read here from the shards the page already serves
// (data/dictionary-store), where every span rid resolves (checked: a rid
// that does not stops the bake). The page reads the same served shape as
// before (span-store-served-v1): data/span-store/<book>.json with each ink
// key's rows in by-key order (names first) and the book's places; nothing
// on the page changes.
// The owner's rules stand: NO WELD (2026-10-16/17: "drop welding", "and
// weld fix") — a rid v2 marks WELD, a closed-up entry standing across a
// maqaf, is withheld and counted; and the 21 rows v1.4 added are held
// (--hold-added-in v1.4, with --v14-rows to tell which), each serving its
// entry's first reading at every place, seven of them wrong (the review of
// 2026-10-17), until the lane chooses a reading per place.
// Usage: node tools/bake-span-store-v2.mjs --from <build>/span-store-v2 --relay FOR-ELIJAH-v80.md
//          [--taken-from <the R2 prefix the build was read from>]
//          [--v14-rows <span-store-v1.4/rows.jsonl>] [--hold-added-in v1.4]
//          [--out data/span-store] [--store data/route-store] [--dict data/dictionary-store]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync, renameSync } from "node:fs";
import { join, basename } from "node:path";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const FROM = arg("from", "");
if (!FROM || !existsSync(join(FROM, "index.json"))) { console.error("usage: --from <folder holding index.json, index/by-key.jsonl, claims/places/>"); process.exit(2); }
const OUT = arg("out", "data/span-store"), STORE = arg("store", "data/route-store"), DICT = arg("dict", "data/dictionary-store");
const BUILD = basename(FROM.replace(/\/+$/u, ""));
const RELAY = arg("relay", ""), TAKEN_FROM = arg("taken-from", ""), V14 = arg("v14-rows", ""), HOLD_ADDED_IN = arg("hold-added-in", "");
if (!RELAY) { console.error("--relay <the relay file that hands this build over> is required"); process.exit(2); }
const sha = (b) => createHash("sha256").update(b).digest("hex");
const stop = (m) => { console.error(`STOP: ${m}`); process.exit(1); };
const ix = JSON.parse(readFileSync(join(FROM, "index.json"), "utf8"));
if (ix.schema_version !== "span-store-v2") stop(`not a span store v2 build: ${ix.schema_version}`);
const lines = (f) => readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));

// ---- the records, from the served dictionary shards: rid -> record ------
const records = new Map();
const dix = JSON.parse(readFileSync(join(DICT, "index.json"), "utf8"));
for (const f of readdirSync(join(DICT, "shards")).filter((x) => /^[0-9a-f]{2}\.bin$/u.test(x)).sort()) {
  const shard = JSON.parse(gunzipSync(readFileSync(join(DICT, "shards", f))).toString("utf8"));
  for (const v of Object.values(shard)) for (const r of v.records || []) if (r && r.rid && !records.has(r.rid)) records.set(r.rid, r);
}

// ---- v1.4's rows, for the order kind and the held rows ------------------
// v2 keeps v1.4's order (names first) but not its NAME/PHRASE label; the
// label rides from v1.4's rows through v2's own row-to-rid map, where given
const v14 = new Map();
if (V14) for (const r of lines(V14)) v14.set(r.row_id, r);
const rowToRid = new Map();
// the build writes its row-to-rid map beside the store (build/outputs/), or inside it
const r2r = [join(FROM, "outputs", "row-to-rid.jsonl"), join(FROM, "..", "outputs", "row-to-rid.jsonl")].find((p) => existsSync(p)) || "";
if (r2r) for (const r of lines(r2r)) if (r.row_id && r.rid) rowToRid.set(r.row_id, r.rid);
// a record's rows: v1.4 added a copy of a v1.3 row under its own row id
// (r01748 beside r01661, one M14 record), so a rid may carry two rows; the
// rid reads from its row that stood before the held build, else its first
const ridRows = new Map(); for (const [row, rid] of rowToRid) { if (!ridRows.has(rid)) ridRows.set(rid, []); ridRows.get(rid).push(row); }
const ridToRow = new Map([...ridRows].map(([rid, rows]) => [rid, rows.find((row) => !HOLD_ADDED_IN || (v14.get(row) || {}).added_in !== HOLD_ADDED_IN) || rows[0]]));
const orderKindOf = (rid) => { const row = v14.get(ridToRow.get(rid)); return row ? row.order_kind || null : null; };
const held = new Set();
// held: a rid every row of which the held build added (a rid with a row
// from before it is served, as that row); a WELD row is withheld, not held
if (HOLD_ADDED_IN) { if (!V14 || !rowToRid.size) stop("--hold-added-in needs --v14-rows and the build's outputs/row-to-rid.jsonl"); for (const [rid, rows] of ridRows) { const rs = rows.map((row) => v14.get(row)).filter(Boolean); if (rs.length && rs.every((r) => r.added_in === HOLD_ADDED_IN) && rs.some((r) => r.gap !== "NONE")) held.add(rid); } }

// ---- the sources the served store names, and the ones it lacks ----------
const served = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const postures = JSON.parse(readFileSync(new URL("../data/license-postures-v1.json", import.meta.url), "utf8")).postures;
const m_sources = {};
const nameSource = (m) => {
  if (m_sources[m] || (served.m_sources && served.m_sources[m])) return;
  const s = (dix.m_sources || {})[m];
  if (!s) stop(`${m} is named by a span record and by no served source`);
  const posture = (s.licence || {}).short_label || s.licence;
  if (!posture || !postures[posture]) stop(`${m} names a licence the page has no posture for: ${posture}`);
  const twin = Object.values(served.m_sources || {}).find((x) => x.key === s.key);
  m_sources[m] = { key: s.key, label: s.label, licensePosture: posture, licensePointer: twin && twin.licensePointer ? twin.licensePointer : "", sourceYear: "S_NO_SOURCE_YEAR", from: BUILD, licence_label: (s.licence || {}).licence_label || "" };
};

// ---- the keys: by-key order, each rid a row in the served shape ---------
const byKey = new Map();
for (const k of lines(join(FROM, "index", "by-key.jsonl"))) byKey.set(k.key, k.rids);
const withheld = new Set(), unresolved = new Set();
const ridKinds = new Map();   // rid -> the kind v2 gives it at its places (SPAN | WELD), and its gap
// THE READING OF A RECORD. The served dictionary record of most sources
// (Kaikki, BDB, 80 others) carries R "" and the record whole in D: the pill
// text a span row showed ("Rishon LeZion (a city in central Israel)") was
// the lane's own reading of that record in span-rows, not a field of the
// record; and where a record has an R, the row's text was the lane's
// trimming of it (":except" on the record, "except" on the row). v2 shares
// the record and drops the row's text, so the reading rides from v1.4's row
// through v2's own row-to-rid map (the bytes the page served on 17 October);
// a rid with no v1.4 row reads the record's own R, and one with neither is
// counted and named (rids_unread).
const unread = new Set(), readFromRecord = new Set(), readFromRows = new Set();
const rowOf = (rid, n) => {
  const r = records.get(rid);
  if (!r) { unresolved.add(rid); return null; }
  nameSource(r.m);
  const old = v14.get(ridToRow.get(rid));
  let R = String(r.R || ""), D = String(r.D || "");
  if (old && old.slots && String(old.slots[1] || "").trim()) { R = old.slots[1]; D = old.slots[2]; readFromRows.add(rid); }
  else if (R.trim()) readFromRecord.add(rid);
  else { unread.add(rid); return null; }
  // the seven slots as v1 rows carried them: rank, R, D, m, year, 0, headwords
  return { row_id: rid, keys: [], slots: [n, R, D, r.m, "S_NO_SOURCE_YEAR", 0, r.headwords || []], gap: (ridKinds.get(rid) || {}).gap || r.gap || null, order_kind: orderKindOf(rid), kind: (ridKinds.get(rid) || {}).kind || "SPAN" };
};

// ---- the places, book by book -------------------------------------------
const books = [];
let placesTotal = 0, nested = 0, overlaps = 0, weldPlaces = 0; const emptied = [], keysServed = new Set(), keysGone = new Set();
mkdirSync(OUT, { recursive: true });
const TMP = `${OUT.replace(/\/$/u, "")}.tmp`;
rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });
const claimFiles = readdirSync(join(FROM, "claims", "places")).filter((f) => f.endsWith(".jsonl")).sort();
const claimBytes = [];
for (const f of claimFiles) {
  const book = basename(f, ".jsonl");
  const raw = readFileSync(join(FROM, "claims", "places", f));
  claimBytes.push(sha(raw));
  const claims = raw.toString("utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
  // what v2 says of each rid at its places: a WELD anywhere is a weld
  for (const c of claims) (c.rids || []).forEach((rid, i) => { const k = ridKinds.get(rid) || { kind: "SPAN", gap: c.gap[i] }; if (c.kinds[i] === "WELD") k.kind = "WELD"; if (c.gap[i] && c.gap[i] !== k.gap) k.gap = k.gap === c.gap[i] ? k.gap : (k.gap ? "MIXED" : c.gap[i]); ridKinds.set(rid, k); });
  const keys = {};
  const serves = (rid) => { if ((ridKinds.get(rid) || {}).kind === "WELD") { withheld.add(rid); return false; } if (held.has(rid)) return false; return true; };
  for (const c of claims) {
    if (!keys[c.ink_key]) keys[c.ink_key] = (byKey.get(c.ink_key) || c.rids).filter(serves).map((rid, i) => rowOf(rid, i + 1)).filter(Boolean);
    for (const r of keys[c.ink_key]) if (!r.keys.includes(c.ink_key)) r.keys.push(c.ink_key);
  }
  const kept = claims.filter((c) => { if (keys[c.ink_key] && keys[c.ink_key].length) return true; emptied.push(`${book} ${c.ref} ${c.ink_key}`); return false; });
  for (const k of Object.keys(keys)) { if (!keys[k].length) { delete keys[k]; keysGone.add(k); } else keysServed.add(k); }
  const gone = new Set(claims.filter((c) => !kept.includes(c)).map((c) => `${c.ref}\u0001${c.ink_key}`));
  if (gone.size) for (const c of kept) {
    const here = (k) => !gone.has(`${c.ref}\u0001${k}`);
    if (Array.isArray(c.overlaps)) c.overlaps = c.overlaps.filter(here);
    if (Array.isArray(c.contains)) c.contains = c.contains.filter(here);
    if (c.inside_of && !here(c.inside_of)) c.inside_of = null;
  }
  for (const c of kept) { if (c.inside_of) nested += 1; if (c.overlaps && c.overlaps.length) overlaps += 1; if (c.kinds.includes("WELD")) weldPlaces += 1; }
  placesTotal += kept.length;
  const out = { schema_version: "span-store-served-v1", from: `${BUILD} (Moses, ${RELAY}, ${ix.date || "no date"})`, book, places: kept.length,
    places_axis: "places", rule: ix.rule || null, keys_axis: "ink keys", keys,
    placesList: kept.map((c) => ({ key: c.ink_key, ref: c.ref, first: c.w_first, last: c.w_last, row_ids: c.rids.filter((rid) => serves(rid) && records.has(rid) && !unread.has(rid)), inside_of: c.inside_of, contains: c.contains || [], overlaps: c.overlaps || [] })) };
  writeFileSync(join(TMP, `${book}.json`), JSON.stringify(out));
  books.push({ book, places: kept.length, keys: Object.keys(keys).length });
}
if (unresolved.size) stop(`${unresolved.size} rids resolve in no served dictionary record: ${[...unresolved].slice(0, 5).join(", ")}`);
const rowsServed = new Set(); for (const [k, rids] of byKey) if (keysServed.has(k)) for (const rid of rids) if (!withheld.has(rid) && !held.has(rid)) rowsServed.add(rid);
const index = {
  schema_version: "span-store-served-v1", from: BUILD, relay: RELAY, relay_standing: null, taken_from: TAKEN_FROM || null, date: ix.date, rule: ix.rule, rule_sha256_before_any_script: ix.rule_sha256_before_any_script,
  standing_rule: ix.standing_rule, records_live_in: ix.records_live_in, definitions: ix.definitions, invariants: ix.invariants, instruction_lines: ix.instruction_lines,
  what_a_row_is: "a dictionary record (rid) v2 names at a place, read from the served dictionary store: its R, D, M and headwords are that record's own bytes",
  ink_key: (ix.definitions || {}).span_place || null,
  by_key_rule: "ink key -> rids as v2's index/by-key.jsonl orders them (names first, v1.4's order), less the rids withheld (WELD) and held",
  counts: {
    rids_received: { value: [...byKey.values()].reduce((n, rs) => n + rs.length, 0), axis: "rids under keys" },
    rows: { value: rowsServed.size, axis: "records served", what: "served: the rids received less those withheld and held" },
    rids_weld_withheld: { value: withheld.size, axis: "records", what: "WELD rids (a closed-up entry across a maqaf), withheld by the no-weld rule" },
    rids_held: { value: held.size, axis: "records", what: HOLD_ADDED_IN ? `rows ${HOLD_ADDED_IN} added, held until the lane chooses a reading per place` : "none held" },
    rids_read_from_v1_4_rows: { value: readFromRows.size, axis: "records", what: "the reading is v1.4's row for the record, through row-to-rid" },
    rids_read_from_the_record: { value: readFromRecord.size, axis: "records", what: "no v1.4 row: the record's own R" },
    rids_unread: { value: unread.size, axis: "records", what: "no R on the record and no v1.4 row: not served" },
    ink_keys_received: { value: byKey.size, axis: "ink keys" }, ink_keys: { value: keysServed.size, axis: "ink keys" }, ink_keys_withheld: { value: keysGone.size, axis: "ink keys" },
    places: { value: placesTotal, axis: "places" }, places_withheld: { value: emptied.length, axis: "places" }, places_nested: { value: nested, axis: "places" }, places_overlapping: { value: overlaps, axis: "places" }, places_with_a_weld_rid: { value: weldPlaces, axis: "places" },
    books: { value: books.length, axis: "books" },
  },
  books: Object.fromEntries(books.map((b) => [b.book, { places: b.places, keys: b.keys }])),
  claims_sha256: sha(Buffer.from(claimBytes.join("\n"))), by_key_sha256: sha(readFileSync(join(FROM, "index", "by-key.jsonl"))), index_sha256: sha(readFileSync(join(FROM, "index.json"))),
  dictionary_store_version: dix.store_version,
  m_sources,
};
writeFileSync(join(TMP, "index.json"), JSON.stringify(index, null, 1));
rmSync(OUT, { recursive: true, force: true });
renameSync(TMP, OUT);
console.log(`${OUT}: ${index.counts.rids_received.value} rids received, ${rowsServed.size} served under ${keysServed.size} keys of ${byKey.size} · ${placesTotal} places in ${books.length} books · ${withheld.size} weld rids withheld · ${held.size} held · ${emptied.length} places withheld · sources named here: ${Object.keys(m_sources).join(", ") || "none beyond the store's"}`);
if (emptied.length) console.log(`places withheld: ${emptied.slice(0, 12).join(" | ")}${emptied.length > 12 ? " ..." : ""}`);
