#!/usr/bin/env node
// GUARDS: audit-calls-rule-v1-a-call-lands-as-its-list-names-each-row-and-the-record-says-where-each-row-went
// LEDGER: M R
// it writes, for each row call 5 moved from a key that ends in a maqaf to its
// plain key, the name the row had (R, under its source M) and the name it
// has: a map read out of the row-strikes record. It writes no row.
//
// A ROW CALL 5 MOVED IS NAMED BY WHERE IT STOOD AND WHERE IT STANDS.
//
// Call 5 of the owner's audit calls (the corpus lane's relay v189, 14
// November 2026) strikes 5,403 rows under keys that end in a maqaf, whose
// words the plain key already holds, and moves the other 357 to the plain
// key. A moved row takes the next rank of its new key as the round lands it
// (tools/strike-rows-v1.mjs), so its new name exists only once the round has
// run. Other lists name those rows by the old one: the corpus lane's default
// picks name 26 of them 122 times, as [key, rank, source, sha16], and the
// lane's next issues are to carry the new names. This writes the map from
// the one to the other:
//
//   { "from": [key, rank, m, sha16], "to": [plain key, rank, m, sha16],
//     "to_headwords": [...], "named_by_a_pick": true|false,
//     "default_picks_naming_it": the list's own count, or null }
//
// one line per re-key line of the list, in the list's order. sha16 is the
// first 16 hex characters of the sha256 of the row's words, as the lane's
// lists write it; a move changes no word, so it is the same on both sides.
//
// It reads the lane's list as the bytes data/audit-calls/PIN.json names, and
// the round of data/row-strikes-v1.json that landed that list. REFUSED, in
// words and with nothing written: the list is not its pinned bytes; no round
// of the record landed it; a re-key line has no row of that round, or the
// row folded instead of landing; or the map as read is not the bytes the pin
// names for it (made_here). --dry prints what would be written, with its
// sha256, and writes nothing: that is how the pin was first written.
//
// The map says where the round put each row. A later round may move one
// again, and the record says so; tools/check-audit-calls-v1.mjs holds the
// rows to the store as it stands.
//
// Usage: node tools/emit-call5-rekey-map-v1.mjs [--record data/row-strikes-v1.json] [--dry]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readPinnedLines, heldToPin, sha256Of, PinFault } from "./pinned-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry");
const RECORD = arg("record", join(K3, "data", "row-strikes-v1.json"));
const HOME = join(K3, "data", "audit-calls");
export const AUDIT_CALLS_RULE_ID = "audit-calls-rule-v1-a-call-lands-as-its-list-names-each-row-and-the-record-says-where-each-row-went";
const refuse = (why) => { console.log(`REFUSED — ${why}`); process.exit(1); };
const sha16 = (t) => sha256Of(Buffer.from(String(t), "utf8")).slice(0, 16);

const pinPath = join(HOME, "PIN.json");
if (!existsSync(pinPath)) refuse(`the pin of the audit calls is missing (${pinPath})`);
const pin = JSON.parse(readFileSync(pinPath, "utf8"));
const listPin = (pin.lists || {}).call5_maqaf_keys, mapPin = (pin.made_here || {}).call5_rekey_map;
if (pin.schema_version !== "AUDIT_CALLS_PIN_V1" || !listPin || !mapPin) refuse(`${pinPath} is not a pin of the audit calls that names call 5's list and its re-key map (AUDIT_CALLS_PIN_V1)`);
let lines;
try { lines = readPinnedLines(join(HOME, pin.folder, listPin.file), listPin, `${pin.folder}/${listPin.file}`); }
catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; }
if (!existsSync(RECORD)) refuse(`the row-strikes record is not here (${RECORD})`);
const round = (JSON.parse(readFileSync(RECORD, "utf8")).rounds || []).find((r) => r.list && r.list.sha256 === listPin.sha256);
if (!round) refuse(`no round of the row-strikes record landed ${listPin.file}: the map is read out of that round`);

const moved = new Map();   // the round's re-keys, by the name the list gives the row
for (const x of round.rows || []) if (x.action === "re-key") moved.set([x.m, x.key, x.rank, x.route].join("\u0001"), x);
const map = [];
lines.forEach((e, i) => {
  if (e.action !== "re-key") return;
  const where = `${listPin.file} line ${i + 1} (${e.m} ${e.key} rank ${e.rank})`;
  const x = moved.get([e.m, e.key, e.rank, e.route].join("\u0001"));
  if (!x) refuse(`${where}: the round that landed the list holds no re-key of this row`);
  if (x.folded_into || x.to_key !== e.to_key || !Number.isInteger(x.to_rank)) refuse(`${where}: the round did not land the row under ${e.to_key} as a row of its own`);
  const picks = e.default_picks_naming_it || null;
  map.push({ from: [e.key, e.rank, e.m, sha16(e.route)], to: [x.to_key, x.to_rank, e.m, sha16(e.route)], to_headwords: x.to_headwords || null,
    named_by_a_pick: !!picks && Object.values(picks).some((c) => c > 0), default_picks_naming_it: picks });
});
const bytes = Buffer.from(map.map((x) => JSON.stringify(x)).join("\n") + "\n", "utf8");
const named = map.filter((x) => x.named_by_a_pick);
const figures = { list: listPin.file, round_ran_at: round.ran_at, lines: map.length, plain_keys: new Set(map.map((x) => x.to[0])).size, named_by_a_pick: named.length,
  references_by_picks: named.reduce((a, x) => a + Object.values(x.default_picks_naming_it).reduce((b, c) => b + c, 0), 0),
  file: mapPin.file, bytes: bytes.length, sha256: sha256Of(bytes), the_pin_names_these_bytes: heldToPin(bytes, map.length, mapPin) };
console.log(`call 5's re-key map · ${map.length} rows moved to ${figures.plain_keys} plain keys by the round of ${round.ran_at} · ${named.length} of them named by a default pick (${figures.references_by_picks} references) · ${mapPin.file} · ${bytes.length} bytes · sha256 ${figures.sha256}`);
console.log(`figures ${JSON.stringify(figures)}`);
if (DRY) { console.log(`dry run — nothing written · the pin ${figures.the_pin_names_these_bytes ? "names these bytes" : "names other bytes, or none"}`); process.exit(0); }
if (!figures.the_pin_names_these_bytes) refuse(`${mapPin.file} as read out of the record (${map.length} lines, ${bytes.length} bytes, ${figures.sha256}) is not the bytes the pin names (${mapPin.lines} lines, ${mapPin.bytes} bytes, ${mapPin.sha256})`);
writeFileSync(join(HOME, mapPin.file), bytes);
console.log(`written · data/audit-calls/${mapPin.file}, the bytes the pin names`);
