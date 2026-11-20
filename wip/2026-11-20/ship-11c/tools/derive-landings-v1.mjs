#!/usr/bin/env node
// GUARDS: landings-rule-v1-a-landing-list-lands-as-its-own-rule-reads-on-the-store-it-meets-each-line-at-the-rank-its-list-gives-or-after-the-last-row-of-its-key-and-a-line-its-own-source-already-prints-is-named-not-landed
// LEDGER: M R
// it writes, for one landing list of the corpus lane (a pinned list of rows the store never held or once lost, each
// of its own source (M) with its own route text (R)), the list the page lands and the list of its lines the page
// does not land, with why. It writes no row of the store: tools/strike-rows-v1.mjs lands the first.
//
// A LANDING LIST IS LANDED AS ITS OWN RULE READS ON THE STORE IT MEETS.
//
// The corpus lane sends rows to land as lists in one shape (relay v188's: m, key, rank, route, action "land", the
// record's definition and headwords, the source's year, the facts its source gives the row). Each was read at one
// version of the store; the page lands them one after another, so each is DERIVED here on the store as it stands
// when its turn comes (data/landings/PIN.json names the lists in their order, each with the list it lands after):
//
//   - every line is proved again: it is a landing under its own key, of a source the store admits under the key
//     the line names for it, with the fields a landing reads; no key ends in a maqaf (call 5 emptied those keys);
//   - a line whose own source prints its words under its key now (bytes, or white space read as one space) is NOT
//     landed: it is written to the list of lines not landed with the row that prints it. Another source printing
//     the same words is no hold: a source's records stay its own (the owner, 7 November 2026);
//   - a line that names its rank lands there, AFTER its own source's rows at that rank (the corpus lane's v201: a
//     whole rendering beside its record's other renderings), and such rows must stand there, or the line is refused;
//   - a line with no rank takes the highest rank under its key plus one, in the list's order (the lane's own words
//     in v200 and v202), counting the rows this derivation has ranked before it; under a key new to the store, 1;
//   - the facts the line names for its row (n, t, b: what its own source says of the row, as the store carried
//     them before or as STEP's own tags give them) go with it, for the landing to write;
//   - lines of one source with the same words under one key are ONE row (the store holds one row of a source for a
//     key and its words, and gathers on it what the source says at each place: relay v202, section 3). They land as
//     one row at the first line's rank, carrying every line's facts and headwords, each once, in the lines' order,
//     and the row names every line it gathers. Lines that disagree on the definition or the year are refused.
//
// REFUSED, in words and with nothing written: a pinned file that is not its bytes; a list whose turn it is not (the
// row-strikes record's last round must be the landing of the list it lands after, or, for the first, no landing of
// any of the pin's lists); a line that is no landing or lacks a field; a source the store names otherwise; a key
// that ends in a maqaf; a rank named where no row of the line's own source stands; the two lists as derived that
// are not the bytes the pin names (derived). --dry prints what would be written, with its sha256, and writes
// nothing; that is how the pin is first written.
//
// Run twice on the same store it writes the same bytes: it holds no clock. The summary ends in one line of its
// figures as JSON (`figures {...}`).
// Usage: node tools/derive-landings-v1.mjs --list <id of a list in data/landings/PIN.json> [--store data/route-store] [--record data/row-strikes-v1.json] [--dry]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { readPinned, readPinnedLines, heldToPin, sha256Of, PinFault } from "./pinned-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry");
const STORE = arg("store", join(K3, "data", "route-store"));
const RECORD = arg("record", join(K3, "data", "row-strikes-v1.json"));
const HOME = arg("pin", join(K3, "data", "landings"));
const ID = arg("list", null);
export const LANDINGS_RULE_ID = "landings-rule-v1-a-landing-list-lands-as-its-own-rule-reads-on-the-store-it-meets-each-line-at-the-rank-its-list-gives-or-after-the-last-row-of-its-key-and-a-line-its-own-source-already-prints-is-named-not-landed";
const refuse = (why) => { console.log(`REFUSED — ${why}`); process.exit(1); };
const n = (x) => Number(x).toLocaleString("en-US");
const spaced = (t) => String(t).replace(/\s+/gu, " ").trim();
const sha16 = (t) => sha256Of(Buffer.from(String(t), "utf8")).slice(0, 16);
const MAQAF = "־";
const FACTS = ["n", "t", "b"];

// ---- the pin, the lane's list ------------------------------------------------------------------
const pinPath = join(HOME, "PIN.json");
if (!existsSync(pinPath)) refuse(`the pin of the landings is missing (${pinPath})`);
const pin = JSON.parse(readFileSync(pinPath, "utf8"));
if (pin.schema_version !== "LANDINGS_PIN_V1" || pin.rule_id !== LANDINGS_RULE_ID || !Array.isArray(pin.lists) || !pin.lists.length) refuse(`${pinPath} is not a pin of the landings (LANDINGS_PIN_V1 under ${LANDINGS_RULE_ID})`);
if (!ID) refuse(`name the list to derive: --list <${pin.lists.map((l) => l.id).join(" | ")}>`);
const at = pin.lists.findIndex((l) => l.id === ID);
if (at < 0) refuse(`the pin names no list "${ID}" (it names ${pin.lists.map((l) => l.id).join(", ")})`);
const L = pin.lists[at], derived = L.derived || {};
if (!L.folder || !L.rule || !L.list || !derived.folder || !derived.landed || !derived.not_landed) refuse(`the pin's list "${ID}" does not name its folder, rule, list and the two lists derived here`);
let lines;
try {
  readPinned(join(HOME, L.folder, L.rule.file), L.rule, `${L.folder}/${L.rule.file}`);
  if (L.receipt) readPinned(join(HOME, L.folder, L.receipt.file), L.receipt, `${L.folder}/${L.receipt.file}`);
  lines = readPinnedLines(join(HOME, L.folder, L.list.file), L.list, `${L.folder}/${L.list.file}`);
} catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; }

// ---- the store this is derived on: after the list before it has landed, and before this one has ----------------
if (!existsSync(RECORD)) refuse(`the row-strikes record is not here (${RECORD})`);
const rounds = (JSON.parse(readFileSync(RECORD, "utf8")).rounds || []);
const landedSha = (l) => ((l.derived || {}).landed || {}).sha256 || null;
const roundOf = (l) => rounds.findIndex((r) => r.list && r.list.sha256 === landedSha(l));
if (roundOf(L) >= 0) refuse(`the row-strikes record holds the landing of "${ID}" already (round ${roundOf(L) + 1}): its list is derived on the store before it lands`);
for (const later of pin.lists.slice(at + 1)) if (roundOf(later) >= 0) refuse(`the row-strikes record holds the landing of "${later.id}", which the pin lands after "${ID}"`);
if (at > 0) {
  const before = pin.lists[at - 1], r = roundOf(before);
  if (r < 0) refuse(`"${ID}" lands after "${before.id}", and the row-strikes record holds no landing of that list's derived bytes: derive and land it first`);
  if (r !== rounds.length - 1) refuse(`${rounds.length - 1 - r} round(s) of the row-strikes record ran after the landing of "${before.id}": "${ID}" is derived on the store as it stands right after it`);
}
const store = openRouteStore(STORE);

// ---- every line, proved again -------------------------------------------------------------------
const landed = [], notLanded = [];
const nextRank = new Map();   // key -> the highest rank under it, with the rows ranked here
const newKeys = new Set(), byKind = {}, bySource = {};
let gathered = 0;   // the lines that joined the row an earlier line of the same source made for the same words
const from = (i) => ({ relay: L.relay, list: L.list.file, line: i + 1 });
lines.forEach((e, i) => {
  const where = `${L.list.file} line ${i + 1} (${e.m} ${e.key})`;
  if (e.action !== "land" || (e.to_key !== null && e.to_key !== undefined)) refuse(`${where} is not a landing under its own key`);
  if (typeof e.m !== "string" || typeof e.key !== "string" || !e.key || typeof e.route !== "string" || !e.route.trim() || typeof e.definition !== "string" || !e.definition.trim()
    || !Array.isArray(e.headwords) || !e.headwords.length || e.headwords.some((h) => typeof h !== "string" || !h) || typeof e.year !== "string" || !(e.rank === null || (Number.isInteger(e.rank) && e.rank >= 1))
    || (e.cut !== undefined && e.cut !== null && e.cut !== 1)) refuse(`${where} does not name what a landing reads: its source, key, route, definition, headwords, year, a rank or none, and a cut that is 1 or nothing`);
  const mine = store.index.m_sources[e.m];
  if (!mine) refuse(`${where}: the store admits no source ${e.m}`);
  if (typeof e.source === "string" && mine.key !== e.source) refuse(`${where}: the line names ${e.m} as ${e.source}, and the store holds ${mine.key} there`);
  if (e.key.endsWith(MAQAF)) refuse(`${where}: its key ends in a maqaf, and call 5 emptied every such key: no card looks one up`);
  let facts = null;
  if (e.facts !== null && e.facts !== undefined) {
    if (typeof e.facts !== "object" || Array.isArray(e.facts)) refuse(`${where}: its facts are not an object`);
    for (const [k, v] of Object.entries(e.facts)) {
      if (!FACTS.includes(k)) refuse(`${where}: its facts name "${k}", which a landing does not carry (n, t, b)`);
      if (!Array.isArray(v) || !v.length || v.some((y) => typeof y !== "string" || !y)) refuse(`${where}: its fact ${k} is not a list of entries`);
    }
    if (e.facts.n && e.facts.n.some((y) => !/^H[1-9]\d*$/u.test(y))) refuse(`${where}: a number that is not H and digits`);
    facts = Object.fromEntries(FACTS.filter((k) => k in e.facts).map((k) => [k, e.facts[k]]));
    if (!Object.keys(facts).length) facts = null;
  }
  const rows = store.routesWhole(e.key) || [];
  const own = rows.filter((r) => String(r[3]) === e.m && (r[1] === e.route || spaced(r[1]) === spaced(e.route)));
  if (own.length) {
    notLanded.push({ m: e.m, key: e.key, rank: e.rank, route: e.route, definition: e.definition, from: from(i), kind: "printed_under_its_key_by_its_own_source",
      not_landed_because: "a row of its own source prints these words under this key now (bytes, or white space read as one space): the source's record already stands there",
      printed_by: own.map((r) => ({ rank: r[0], m: String(r[3]), route: r[1], sha16: sha16(r[1]), equal: r[1] === e.route ? "bytes" : "white space aside" })) });
    return;
  }
  if (!nextRank.has(e.key)) { nextRank.set(e.key, rows.reduce((a, r) => Math.max(a, Number(r[0]) || 0), 0)); if (!rows.length) newKeys.add(e.key); }
  // one row for a source's words under a key: a later line with the same words joins the row an earlier line made
  const sameWords = landed.find((x) => x.key === e.key && x.m === e.m && x.route === e.route);
  if (sameWords) {
    if (sameWords.definition !== e.definition || sameWords.year !== e.year || (e.rank !== null && e.rank !== sameWords.rank_named)) refuse(`${where}: an earlier line (${sameWords.from.line}) lands the same words of the same source under the same key, and the two do not agree on the definition, the year or the rank`);
    for (const h of e.headwords) if (!sameWords.headwords.includes(h)) sameWords.headwords.push(h);
    if (facts) { sameWords.facts = sameWords.facts || {}; for (const k of FACTS) if (facts[k]) sameWords.facts[k] = [...(sameWords.facts[k] || []), ...facts[k].filter((y) => !(sameWords.facts[k] || []).includes(y))]; sameWords.facts = Object.fromEntries(FACTS.filter((k) => sameWords.facts[k]).map((k) => [k, sameWords.facts[k]])); }
    sameWords.from.gathers = [...(sameWords.from.gathers || [sameWords.from.line]), i + 1];
    gathered += 1;
    return;
  }
  let rank = e.rank, rankFrom = "the list names the rank: its record's other rows stand there";
  if (rank === null) { rank = nextRank.get(e.key) + 1; nextRank.set(e.key, rank); rankFrom = "the highest rank under the key plus one, in the list's order"; }
  else if (!rows.some((r) => Number(r[0]) === rank && String(r[3]) === e.m)) refuse(`${where}: it names rank ${rank}, and no row of ${e.m} stands at that rank under its key: where it lands is not decided`);
  byKind[e.kind || "none"] = (byKind[e.kind || "none"] || 0) + 1;
  bySource[e.m] = (bySource[e.m] || 0) + 1;
  landed.push({ action: "land", m: e.m, key: e.key, rank, rank_named: e.rank, rank_from: rankFrom, route: e.route, place: "after", definition: e.definition, headwords: [...e.headwords], year: e.year, cut: e.cut ?? null, facts,
    kind: e.kind ?? null, why: e.why ?? null, record_loc: e.record_loc ?? null, record_file: e.record_file ?? null, from: from(i) });
});
for (const x of landed) delete x.rank_named;

// ---- what is written, held to the pin ----------------------------------------------------------
const bytesOf = (list) => Buffer.from(list.map((x) => JSON.stringify(x)).join("\n") + (list.length ? "\n" : ""), "utf8");
const out = [[derived.landed, bytesOf(landed), landed.length], [derived.not_landed, bytesOf(notLanded), notLanded.length]];
const pinned = out.map(([p, b, count]) => heldToPin(b, count, p));
const figures = { list: ID, relay: L.relay, store_version: store.index.store_version, lines: lines.length, landed: landed.length, not_landed: notLanded.length,
  lines_gathered_into_an_earlier_lines_row: gathered, keys: new Set(landed.map((x) => x.key)).size, keys_new_to_the_store: newKeys.size, ranked_here: landed.filter((x) => x.rank_from.startsWith("the highest")).length,
  with_facts: landed.filter((x) => x.facts).length, by_kind: byKind, by_source: bySource,
  files: out.map(([p, b, count]) => ({ file: `${derived.folder}/${p.file}`, bytes: b.length, sha256: sha256Of(b), lines: count })), the_pin_names_these_bytes: pinned.every(Boolean) };
console.log(`landings · ${ID} (relay ${L.relay}) · ${n(lines.length)} lines read on store ${store.index.store_version}${at > 0 ? `, after the landing of ${pin.lists[at - 1].id}` : ""} · ${n(landed.length)} rows land${gathered ? ` (${n(gathered)} more lines gathered into a row of the same source and words)` : ""} under ${n(figures.keys)} keys (${n(newKeys.size)} new to the store), ${n(figures.ranked_here)} ranked here, ${n(figures.with_facts)} with facts · ${n(notLanded.length)} not landed (their own source prints their words under their key)`);
for (const [p, b, count] of out) console.log(`  ${derived.folder}/${p.file} · ${count} lines · ${b.length} bytes · sha256 ${sha256Of(b)}`);
console.log(`figures ${JSON.stringify(figures)}`);
if (DRY) { console.log(`dry run — nothing written · the pin ${figures.the_pin_names_these_bytes ? "names these bytes" : "names other bytes, or none"}`); process.exit(0); }
out.forEach(([p, , count], i) => { if (!pinned[i]) refuse(`${derived.folder}/${p.file} as derived (${count} lines, ${figures.files[i].bytes} bytes, ${figures.files[i].sha256}) is not the bytes the pin names (${p.lines} lines, ${p.bytes} bytes, ${p.sha256})`); });
mkdirSync(join(HOME, derived.folder), { recursive: true });
for (const [p, b] of out) writeFileSync(join(HOME, derived.folder, p.file), b);
console.log(`written · ${out.map(([p]) => `${derived.folder}/${p.file}`).join(" and ")}, the bytes the pin names`);
