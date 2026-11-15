#!/usr/bin/env node
// GUARDS: fold-strike-landing-rule-v1-a-line-lands-at-the-hole-its-struck-row-left-unless-a-row-under-its-key-now-prints-its-words
// LEDGER: M R
// it writes the list of rows a landing lands, each of its own source (M) with
// its own route text (R), and the list of the lines it does not land, with
// why. It writes no row of the store: tools/strike-rows-v1.mjs lands the list.
//
// THE CORPUS LANE'S LANDING LIST IS LANDED AS ITS OWN RULE READS ON THE STORE
// IT MEETS, AND EVERY LINE NOT LANDED IS NAMED.
//
// The store build kept one route per key and words and credited it to one
// source. Where the store later struck that source whole, every admitted
// source that printed the same words under the key went out with it. The
// corpus lane's relay v188 (14 November 2026) lists those readings, 4,252
// lines, each to land at the rank the struck row left
// (data/fold-strike-landing/landing-v1/, kept byte for byte; PIN.json names
// it). Its own rule leaves a reading out when a row of the page store prints
// it under the key now, compared by bytes and with white space read as one
// space (RULE.md, step 6).
//
// The list was read at store 4d1357b26ca5. The page lands the lane's call 5
// before it (relay v189: the rows under keys that end in a maqaf; 357 of
// them move to the plain key), as both letters ask, and after that move 48
// of the list's lines name words a moved row now prints under their key. The
// list flags each of them itself (served_now_under_the_key_with_a_maqaf) and
// says: land the move first, then skip any line whose words its key then
// prints. So the list the page lands is DERIVED here, on the store as it
// stands after call 5:
//
//   - every line is proved again: it is a landing, no two lines share a key
//     and a rank, the store's struck-ranks record types its rank under its
//     key with the struck source the build credited, and no row stands at
//     that key and rank now;
//   - a line some row under its key prints (bytes, or white space read as
//     one space) is NOT landed, and is written to its own list with its
//     words and its definition, the row that prints its words, and the list
//     and action that put that row there;
//   - every other line is written to the list that lands, with the fields
//     the landing reads (its key, rank, route, definition, headwords, year
//     and cut), its place "before", and its line in the lane's file.
//
// THREE LINES LAND UNDER A KEY THAT ENDS IN A MAQAF, AND ARE NOT LANDED. The
// list was made while such keys stood. Call 5 took every row under them off
// the store, on the owner's answer of 14 November (move the readings the
// plain key lacks, drop the rest), because a key that ends in a maqaf is
// never looked up. Landing a row under one after that would put back what
// the call took, where no card can reach it. Neither letter speaks of these
// lines, so the page does not decide them by a rule of its own making: the
// pin NAMES them (derived.lines_under_a_key_that_ends_in_a_maqaf, each by
// its line, source, key, rank and words, with why), and this holds each to
// the store: no row stands under its key, and its plain key prints its words
// (so call 5's own rule would have struck its row, not moved it). They are
// written to the list of lines not landed, with the rows that print their
// words under the plain key, and are put back to the corpus lane.
//
// REFUSED, in words and with nothing written:
//   - the lane's list, or its pin, is not the bytes the pin names;
//   - the row-strikes record's last round is not the landing of call 5's
//     list (the pin names it by sha256): before it the 48 lines would land
//     beside the words the move brings, and after any later round this is
//     not the store the derivation is made on. Once the list has landed, a
//     row under every line's key prints its words, and this refuses too;
//   - a line that is no landing, or whose hole is not typed or is taken;
//   - a line under a key that ends in a maqaf that the pin does not name, or
//     one it names that has a row under its key or whose plain key does not
//     print its words; or a line the pin names that is not such a line;
//   - the lines not landed are not exactly the lines the list flags, or one
//     of them is printed by a row call 5 did not move there. The lane's
//     flags and the page's reading of its rule must give the same lines;
//   - the two lists as derived are not the bytes PIN.json names for them
//     (derived). --dry prints what would be written, with its sha256, and
//     writes nothing; that is how the pin was first written.
//
// Run twice on the same store it writes the same bytes: it holds no clock.
//
// Usage: node tools/derive-fold-strike-landing-v1.mjs [--store data/route-store]
//          [--record data/row-strikes-v1.json] [--dry]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { readStruckRanks } from "./emit-struck-ranks-v1.mjs";
import { readPinned, readPinnedLines, heldToPin, sha256Of, PinFault } from "./pinned-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry");
const STORE = arg("store", join(K3, "data", "route-store"));
const RECORD = arg("record", join(K3, "data", "row-strikes-v1.json"));
const HOME = join(K3, "data", "fold-strike-landing");
export const FOLD_STRIKE_LANDING_RULE_ID = "fold-strike-landing-rule-v1-a-line-lands-at-the-hole-its-struck-row-left-unless-a-row-under-its-key-now-prints-its-words";
const refuse = (why) => { console.log(`REFUSED — ${why}`); process.exit(1); };
const n = (x) => Number(x).toLocaleString("en-US");
// white space read as one space, as the lane's rule compares two texts
const spaced = (t) => String(t).replace(/\s+/gu, " ").trim();
const sha16 = (t) => sha256Of(Buffer.from(String(t), "utf8")).slice(0, 16);
const MAQAF = "\u05be";

// ---- the pin, the lane's list ------------------------------------------------------------------
const pinPath = join(HOME, "PIN.json");
if (!existsSync(pinPath)) refuse(`the pin of the fold-strike landing is missing (${pinPath})`);
const pin = JSON.parse(readFileSync(pinPath, "utf8"));
const derived = pin.derived || {};
if (pin.schema_version !== "FOLD_STRIKE_LANDING_PIN_V1" || !pin.landing || !pin.lands_after || !derived.folder || !derived.landed || !derived.not_landed) refuse(`${pinPath} is not a pin of this landing (FOLD_STRIKE_LANDING_PIN_V1: the lane's list, the list it lands after, and the two lists derived here)`);
let lines;
try {
  readPinned(join(HOME, pin.folder, pin.rule.file), pin.rule, `${pin.folder}/${pin.rule.file}`);
  lines = readPinnedLines(join(HOME, pin.folder, pin.landing.file), pin.landing, `${pin.folder}/${pin.landing.file}`);
} catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; }

// ---- the store this is derived on: as it stands after call 5, and before anything else ---------
if (!existsSync(RECORD)) refuse(`the row-strikes record is not here (${RECORD})`);
const record = JSON.parse(readFileSync(RECORD, "utf8"));
const rounds = Array.isArray(record.rounds) ? record.rounds : [];
const after = pin.lands_after;
const at = rounds.findIndex((r) => r.list && r.list.sha256 === after.sha256);
if (at < 0) refuse(`the row-strikes record holds no round that landed ${after.file} (relay ${after.relay}, call ${after.call}): this list is derived on the store as it stands after it`);
if (at !== rounds.length - 1) {
  const later = rounds.slice(at + 1).map((r) => `${r.list ? r.list.file : "a round with no list"} (${r.ran_at})`);
  refuse(`${later.length} round(s) of the row-strikes record ran after ${after.file}: ${later.join(", ")}; this list is derived on the store as it stands after call ${after.call} and before any later list`);
}
const rekeyedHere = new Map();   // "to_key\u0001to_rank\u0001m\u0001route" -> the re-key that put a row there
for (const x of rounds[at].rows || []) if (x.action === "re-key" && x.to_rank !== undefined) rekeyedHere.set([x.to_key, x.to_rank, x.m, x.route].join("\u0001"), x);
const store = openRouteStore(STORE);
const holes = (readStruckRanks(STORE) || { keys: {} }).keys;

// ---- every line, proved again -------------------------------------------------------------------
const seen = new Set();
const landed = [], notLanded = [];
const newKeys = new Set(), cuts = {};
const from = (i) => ({ relay: pin.relay, list: pin.landing.file, line: i + 1 });
// the lines the pin names as landing under a key that ends in a maqaf: not landed, each held to the store below
const underMaqaf = derived.lines_under_a_key_that_ends_in_a_maqaf || { lines: [] };
const namedUnderMaqaf = new Map((underMaqaf.lines || []).map((x) => [x.line, x]));
const printsOf = (rows, text) => rows.filter((r) => r[1] === text || spaced(r[1]) === spaced(text));
lines.forEach((e, i) => {
  const where = `${pin.landing.file} line ${i + 1} (${e.m} ${e.key} rank ${e.rank})`;
  if (e.action !== "land" || (e.to_key !== null && e.to_key !== undefined)) refuse(`${where} is not a landing under its own key`);
  if (typeof e.m !== "string" || typeof e.key !== "string" || !e.key || !Number.isInteger(e.rank) || e.rank < 1 || typeof e.route !== "string" || !e.route.trim() || typeof e.definition !== "string" || !e.definition.trim()
    || !Array.isArray(e.headwords) || !e.headwords.length || typeof e.year !== "string" || (e.cut !== null && e.cut !== 1)) refuse(`${where} does not name what a landing reads: its source, key, rank, route, definition, headwords, year, and a cut that is 1 or null`);
  if (!store.index.m_sources[e.m]) refuse(`${where}: the store admits no source ${e.m}`);
  const id = `${e.key}\u0001${e.rank}`;
  if (seen.has(id)) refuse(`${where}: an earlier line lands at the same key and rank`);
  seen.add(id);
  const rows = store.routesFor(e.key) || [];
  if (e.key.endsWith(MAQAF)) {
    const named = namedUnderMaqaf.get(i + 1);
    if (!named || named.m !== e.m || named.key !== e.key || named.rank !== e.rank || named.route !== e.route) refuse(`${where} lands under a key that ends in a maqaf, which call ${after.call} emptied, and the pin does not name it among the lines it holds off for that (derived.lines_under_a_key_that_ends_in_a_maqaf)`);
    if (rows.length) refuse(`${where}: ${rows.length} row(s) stand under its key, which ends in a maqaf; call ${after.call} took every such row`);
    const plain = e.key.slice(0, -1), twins = printsOf(store.routesFor(plain) || [], e.route);
    if (!twins.length) refuse(`${where}: its key ends in a maqaf and no row under the plain key prints its words; call ${after.call} would have moved such a row, and no list says where this one goes`);
    notLanded.push({ m: e.m, key: e.key, rank: e.rank, route: e.route, definition: e.definition, from: from(i), kind: "its_key_ends_in_a_maqaf",
      not_landed_because: underMaqaf.why,
      printed_under_the_plain_key_by: twins.map((r) => ({ key: plain, rank: r[0], m: String(r[3]), route: r[1], sha16: sha16(r[1]), equal: r[1] === e.route ? "bytes" : "white space aside" })),
      same_source: twins.some((r) => String(r[3]) === e.m) });
    namedUnderMaqaf.delete(i + 1);
    return;
  }
  const prints = printsOf(rows, e.route);
  if (prints.length) {
    notLanded.push({ m: e.m, key: e.key, rank: e.rank, route: e.route, definition: e.definition, from: from(i), kind: "printed_under_its_key",
      not_landed_because: "a row of the store prints these words under this key now, by bytes or with white space read as one space: the list's own rule for what is left out (RULE.md, step 6), read on the store as it stands after call 5",
      printed_under_the_key_by: prints.map((r) => {
        const moved = rekeyedHere.get([e.key, r[0], String(r[3]), r[1]].join("\u0001")) || null;
        return { rank: r[0], m: String(r[3]), route: r[1], sha16: sha16(r[1]), equal: r[1] === e.route ? "bytes" : "white space aside",
          put_there_by: moved ? { relay: after.relay, call: after.call, list: after.file, action: "re-key", from_key: moved.key, from_rank: moved.rank } : null };
      }),
      same_source: prints.some((r) => String(r[3]) === e.m),
      flagged_in_the_list: Array.isArray(e.served_now_under_the_key_with_a_maqaf) ? e.served_now_under_the_key_with_a_maqaf : [] });
    return;
  }
  const credited = (e.credited_in_the_build_to || {}).m;
  if (!(holes[e.key] || []).some((h) => h[0] === e.rank && h[1] === credited)) refuse(`${where}: the store's struck-ranks record does not type rank ${e.rank} under its key with ${credited}, the struck source the build credited`);
  const taken = rows.filter((r) => r[0] === e.rank);
  if (taken.length) refuse(`${where}: its rank is taken now by ${taken.map((r) => `${r[3]} «${String(r[1]).slice(0, 40)}»`).join(", ")}`);
  if (!rows.length) newKeys.add(e.key);
  if (e.cut === 1) cuts[e.m] = (cuts[e.m] || 0) + 1;
  landed.push({ action: "land", m: e.m, key: e.key, rank: e.rank, rank_from: e.rank_from ?? null, route: e.route, place: "before", definition: e.definition, headwords: e.headwords, year: e.year, cut: e.cut,
    kind: e.kind ?? null, why: e.why ?? null, record_loc: e.record_loc ?? null, record_file: e.record_file ?? null, from: from(i) });
});

if (namedUnderMaqaf.size) refuse(`the pin names line(s) ${[...namedUnderMaqaf.keys()].join(", ")} of ${pin.landing.file} as landing under a key that ends in a maqaf, and they do not`);

// ---- the lines not landed for their words are the lines the list flags, each printed by a row call 5 moved there
const printed = notLanded.filter((x) => x.kind === "printed_under_its_key"), heldOff = notLanded.filter((x) => x.kind === "its_key_ends_in_a_maqaf");
const flagged = lines.map((e, i) => (Array.isArray(e.served_now_under_the_key_with_a_maqaf) && e.served_now_under_the_key_with_a_maqaf.length ? i + 1 : 0)).filter(Boolean);
const dropped = printed.map((x) => x.from.line);
if (JSON.stringify(flagged) !== JSON.stringify(dropped)) {
  const onlyFlagged = flagged.filter((l) => !dropped.includes(l)), onlyDropped = dropped.filter((l) => !flagged.includes(l));
  refuse(`the list flags ${flagged.length} line(s) whose words stand under their key with a maqaf, and ${dropped.length} line(s) are printed under their key now: ${onlyFlagged.length} flagged and not printed (first: line ${onlyFlagged[0] ?? "none"}), ${onlyDropped.length} printed and not flagged (first: line ${onlyDropped[0] ?? "none"}); the list's flags and its rule read on this store must give the same lines`);
}
for (const x of printed) {
  const where = `${pin.landing.file} line ${x.from.line} (${x.m} ${x.key} rank ${x.rank})`;
  const moved = x.printed_under_the_key_by.filter((p) => p.put_there_by);
  if (!moved.length) refuse(`${where}: its words are printed under its key by ${x.printed_under_the_key_by.map((p) => `${p.m} rank ${p.rank}`).join(", ")}, and call ${after.call} moved none of those rows there`);
  // the list's own flag names the row as it stood under the key with a maqaf: its rank there, its source, its words
  if (!moved.some((p) => x.flagged_in_the_list.some((f) => f.rank === p.put_there_by.from_rank && f.m === p.m && f.route === p.route))) refuse(`${where}: the row the list flags under the key with a maqaf (${JSON.stringify(x.flagged_in_the_list).slice(0, 120)}) is not the row call ${after.call} moved under its key`);
}

// ---- what is written, held to the pin ----------------------------------------------------------
const bytesOf = (list) => Buffer.from(list.map((x) => JSON.stringify(x)).join("\n") + "\n", "utf8");
const out = [[derived.landed, bytesOf(landed), landed.length], [derived.not_landed, bytesOf(notLanded), notLanded.length]];
const pinned = out.map(([p, b, count]) => heldToPin(b, count, p));
const figures = { store_version: store.index.store_version, lines: lines.length, landed: landed.length, not_landed: notLanded.length,
  not_landed_their_words_printed_under_their_key: printed.length, of_those_by_a_row_of_their_own_source: printed.filter((x) => x.same_source).length, not_landed_their_key_ends_in_a_maqaf: heldOff.length,
  keys: new Set(landed.map((x) => x.key)).size, keys_new_to_the_store: newKeys.size, cuts, cuts_on_a_line_not_landed: notLanded.filter((x) => lines[x.from.line - 1].cut === 1).length,
  files: out.map(([p, b, count]) => ({ file: `${derived.folder}/${p.file}`, bytes: b.length, sha256: sha256Of(b), lines: count })), the_pin_names_these_bytes: pinned.every(Boolean) };
console.log(`fold-strike landing · relay ${pin.relay} · ${n(lines.length)} lines read on store ${store.index.store_version}, after ${after.file} · ${n(landed.length)} land under ${n(figures.keys)} keys (${n(newKeys.size)} new to the store), ${Object.values(cuts).reduce((a, x) => a + x, 0)} of them a cut of a sibling record ${JSON.stringify(cuts)} · ${notLanded.length} not landed: ${printed.length} whose words a row call ${after.call} moved under their key prints (${figures.of_those_by_a_row_of_their_own_source} of their own source, ${printed.length - figures.of_those_by_a_row_of_their_own_source} of another), ${heldOff.length} under a key that ends in a maqaf, which the pin names (lines ${heldOff.map((x) => x.from.line).join(", ") || "none"})`);
for (const [p, b, count] of out) console.log(`  ${derived.folder}/${p.file} · ${count} lines · ${b.length} bytes · sha256 ${sha256Of(b)}`);
console.log(`figures ${JSON.stringify(figures)}`);
if (DRY) { console.log(`dry run — nothing written · the pin ${figures.the_pin_names_these_bytes ? "names these bytes" : "names other bytes, or none"}`); process.exit(0); }
out.forEach(([p, , count], i) => { if (!pinned[i]) refuse(`${derived.folder}/${p.file} as derived (${count} lines, ${figures.files[i].bytes} bytes, ${figures.files[i].sha256}) is not the bytes the pin names (${p.lines} lines, ${p.bytes} bytes, ${p.sha256})`); });
mkdirSync(join(HOME, derived.folder), { recursive: true });
for (const [p, b] of out) writeFileSync(join(HOME, derived.folder, p.file), b);
console.log(`written · ${out.map(([p]) => `${derived.folder}/${p.file}`).join(" and ")}, the bytes the pin names`);
