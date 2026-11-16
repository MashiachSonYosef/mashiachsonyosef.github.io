#!/usr/bin/env node
// RUN: tree
// GUARDS: fold-strike-landing-rule-v1-a-line-lands-at-the-hole-its-struck-row-left-unless-a-row-under-its-key-now-prints-its-words
// GUARDS: row-strike-rule-v7-a-named-list-strikes-withholds-re-keys-rejoins-re-heads-retexts-restores-or-lands-a-row-the-hole-is-typed-and-a-landed-cut-is-counted-a-retext-from-words-back-keeps-the-rows-closes-and-facts
// LEDGER: -
// no frame letter. A check reads the lists, the record and the store and
// judges them; it is not the ledger for one.
//
// EVERY LINE OF THE LANDING LIST EITHER STANDS IN THE STORE AS THE LIST GIVES
// IT, OR IS NAMED WITH THE ROW THAT PRINTS ITS WORDS.
//
// The store build kept one route per key and words, credited to one source.
// Where that source was later struck whole, the admitted sources that
// printed the same words went out with it. The corpus lane's relay v188 (14
// November 2026) lists those readings, 4,252 lines, each to land at the rank
// the struck row left (data/fold-strike-landing/landing-v1/). The page
// landed the lane's call 5 first, as both letters ask, and derived the list
// it lands from the lane's on the store that stood then
// (tools/derive-fold-strike-landing-v1.mjs): a line whose words a row under
// its key prints is not landed, by the list's own rule, and three lines
// under a key that ends in a maqaf are not landed either, each named in the
// pin. tools/strike-rows-v1.mjs landed the rest.
//
// What is held here, each read again from the lists and the store:
//
//   F1  the lane's rule, counts, landing list, left-out list and proofs are
//       the bytes the pin names, and the list this one lands after is the
//       one the audit calls' own pin names (call 5)
//   F2  the two derived lists are the bytes the pin names; between them they
//       hold every line of the lane's list once, by its line there; and a
//       line that lands carries the lane's own source, key, rank, route,
//       definition, headwords, year and cut, and stands "before"
//   F3  one round of the row-strikes record landed the derived list, under
//       the pin's reason and after the round of call 5; it landed every
//       line and found none already held, its rows are the list's lines,
//       and the cuts it counts are the list's, source by source
//   F4  every landed line stands once at its key and rank, and nothing else
//       stands there: its route, its definition, its source, its year, its
//       cut in slot 5 and its headwords. One a later round of the record
//       took, moved or retexted is named, not failed
//   F5  the rank each landed line took is a rank the store's struck-ranks
//       record types under its key: the hole a strike left
//   F6  every line not landed for its words has those words printed under
//       its key now, by bytes or with white space read as one space
//   F7  every line not landed for its key is one the pin names: its key
//       ends in a maqaf, no row stands under it, and its plain key prints
//       its words
//
// Run: node tools/check-fold-strike-landing-v1.mjs [--store data/route-store] [--record data/row-strikes-v1.json]
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { readStruckRanks } from "./emit-struck-ranks-v1.mjs";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { headwordsBeforeOwnPointing } from "./apply-own-pointing-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const STORE = arg("store", join(K3, "data", "route-store"));
const RECORD = arg("record", join(K3, "data", "row-strikes-v1.json"));
const HOME = join(K3, "data", "fold-strike-landing");
const RULE = "fold-strike-landing-rule-v1-a-line-lands-at-the-hole-its-struck-row-left-unless-a-row-under-its-key-now-prints-its-words";
const MAQAF = "\u05be";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const nf = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const first = (list, n = 3) => list.slice(0, n).join(" · ");
const spaced = (t) => String(t).replace(/\s+/gu, " ").trim();
const idOf = (m, key, rank, route) => [m, key, rank, route].join("\u0001");

console.log(`— ${RULE} —\n`);
if (!existsSync(join(HOME, "PIN.json"))) { console.log("SKIPPED — no fold-strike landing on this disk (data/fold-strike-landing/PIN.json)"); process.exit(3); }
if (!existsSync(join(STORE, "index.json"))) { console.log(`SKIPPED — no store at ${STORE}`); process.exit(3); }
const pin = JSON.parse(readFileSync(join(HOME, "PIN.json"), "utf8"));
const derived = pin.derived || {};

// ---- F1: the pinned bytes ------------------------------------------------------------------------
const pinFaults = [];
const held = (read) => { try { return read(); } catch (e) { if (!(e instanceof PinFault)) throw e; pinFaults.push(e.message); return null; } };
if (pin.schema_version !== "FOLD_STRIKE_LANDING_PIN_V1" || !pin.landing || !pin.lands_after || !derived.landed || !derived.not_landed) pinFaults.push("the pin is not FOLD_STRIKE_LANDING_PIN_V1 with the lane's list, the list it lands after and the two derived lists");
const inFolder = (p) => join(HOME, pin.folder, p.file);
for (const p of [pin.rule, pin.counts, ...(pin.proofs || [])]) if (p) held(() => readPinned(inFolder(p), p, `${pin.folder}/${p.file}`));
const lanes = held(() => readPinnedLines(inFolder(pin.landing), pin.landing, `${pin.folder}/${pin.landing.file}`)) || [];
const leftOut = held(() => readPinnedLines(inFolder(pin.left_out), pin.left_out, `${pin.folder}/${pin.left_out.file}`)) || [];
const after = pin.lands_after || {};
const callsPinPath = join(HOME, after.pin || "");
const theirList = existsSync(callsPinPath) ? Object.values(JSON.parse(readFileSync(callsPinPath, "utf8")).lists || {}).find((l) => l.file === after.file) : null;
if (!theirList || theirList.sha256 !== after.sha256) pinFaults.push(`the list this landing lands after (${after.file}) is not named with the same sha256 by ${after.pin}`);
check("F1  the lane's rule, counts, landing list, left-out list and proofs are the bytes the pin names, and the list this one lands after is the one the audit calls' pin names", pinFaults.length === 0,
  pinFaults.length ? first(pinFaults) : `relay ${pin.relay} · ${nf(lanes.length)} lines to land, ${nf(leftOut.length)} readings the lane left out · lands after ${after.file} (relay ${after.relay}, call ${after.call})`);

// ---- F2: the two derived lists ---------------------------------------------------------------------
const derivedFaults = [];
const readDerived = (p) => { try { return readPinnedLines(join(HOME, derived.folder || "", p.file), p, `${derived.folder}/${p.file}`); } catch (e) { if (!(e instanceof PinFault)) throw e; derivedFaults.push(e.message); return []; } };
const landed = derived.landed ? readDerived(derived.landed) : [], notLanded = derived.not_landed ? readDerived(derived.not_landed) : [];
{
  const seen = new Map();
  for (const x of [...landed, ...notLanded]) { const l = (x.from || {}).line; seen.set(l, (seen.get(l) || 0) + 1); }
  const missing = lanes.map((_, i) => i + 1).filter((l) => seen.get(l) !== 1);
  if (missing.length) derivedFaults.push(`${missing.length} line(s) of the lane's list are not in exactly one of the two derived lists (first: line ${missing[0]})`);
  else if (seen.size !== lanes.length) derivedFaults.push(`the two derived lists name ${seen.size} lines of the lane's list, which as read here holds ${lanes.length}`);
  for (const x of landed) {
    const e = lanes[(x.from || {}).line - 1];
    if (!e) continue;
    if (x.action !== "land" || x.place !== "before" || x.m !== e.m || x.key !== e.key || x.rank !== e.rank || x.route !== e.route || x.definition !== e.definition || !same(x.headwords, e.headwords) || x.year !== e.year || (x.cut ?? null) !== (e.cut ?? null))
      derivedFaults.push(`the derived line of the lane's line ${x.from.line} does not carry its source, key, rank, route, definition, headwords, year and cut, to land "before"`);
  }
  for (const x of notLanded) {
    const e = lanes[(x.from || {}).line - 1];
    if (e && (x.m !== e.m || x.key !== e.key || x.rank !== e.rank || x.route !== e.route || x.definition !== e.definition)) derivedFaults.push(`the line not landed of the lane's line ${x.from.line} does not carry its source, key, rank, words and definition`);
  }
}
check("F2  the two derived lists are the bytes the pin names; between them they hold every line of the lane's list once; a line that lands carries the lane's own source, key, rank, route, definition, headwords, year and cut, and stands \"before\"",
  landed.length > 0 && derivedFaults.length === 0, derivedFaults.length ? `${derivedFaults.length} · ${first(derivedFaults)}` : `${nf(landed.length)} lines land (${derived.landed.file} ${String(derived.landed.sha256).slice(0, 12)}) · ${notLanded.length} do not (${derived.not_landed.file} ${String(derived.not_landed.sha256).slice(0, 12)})`);

// ---- F3: the round ---------------------------------------------------------------------------------
const record = existsSync(RECORD) ? JSON.parse(readFileSync(RECORD, "utf8")) : { rounds: [] };
const rounds = Array.isArray(record.rounds) ? record.rounds : [];
const mine = rounds.filter((r) => r.list && r.list.sha256 === (derived.landed || {}).sha256);
const round = mine[0] || { rows: [], counts: {}, list: {} };
const cutsOf = (list) => { const c = {}; for (const x of list) if (x.cut === 1) c[x.m] = (c[x.m] || 0) + 1; return c; };
{
  const faults = [];
  if (mine.length !== 1) faults.push(`${mine.length} rounds of the row-strikes record landed ${(derived.landed || {}).file}`);
  else {
    if (round.reason !== (pin.landed_by || {}).reason) faults.push(`the round stands under the reason «${round.reason}», and the pin gives «${(pin.landed_by || {}).reason}»`);
    const before = rounds.slice(0, rounds.indexOf(round)).some((r) => r.list && r.list.sha256 === after.sha256);
    if (!before) faults.push(`no round before it landed ${after.file}`);
    const by = (round.counts || {}).by_action || {};
    if (by.land !== landed.length || by.land_already_held) faults.push(`the round landed ${by.land} rows and found ${by.land_already_held} already held; the list holds ${landed.length} lines`);
    if ((round.list.left_off || []).length) faults.push(`the round left ${round.list.left_off.length} line(s) off`);
    const ids = new Set(landed.map((x) => idOf(x.m, x.key, x.rank, x.route)));
    const strays = (round.rows || []).filter((x) => x.action !== "land" || x.already_held || !ids.has(idOf(x.m, x.key, x.rank, x.route)));
    if (strays.length || (round.rows || []).length !== landed.length) faults.push(`the round holds ${(round.rows || []).length} rows, ${strays.length} of them no landed line of the list`);
    if (!same(Object.entries((round.counts || {}).cuts_landed || {}).sort(), Object.entries(cutsOf(landed)).sort())) faults.push(`the round counts the cuts ${JSON.stringify((round.counts || {}).cuts_landed)}, and the list's lines are ${JSON.stringify(cutsOf(landed))}`);
  }
  check("F3  one round of the row-strikes record landed the derived list, under the pin's reason and after call 5's round; it landed every line and found none already held, its rows are the list's lines, and the cuts it counts are the list's",
    faults.length === 0, faults.length ? `${faults.length} · ${first(faults)}` : `the round of ${round.ran_at}, store ${(round.store_version || {}).was} -> ${(round.store_version || {}).now} · ${nf(landed.length)} landed, ${(round.counts || {}).keys_made} keys made · cuts ${JSON.stringify((round.counts || {}).cuts_landed)}`);
}

// ---- F4, F5: every landed line stands, in a hole a strike left ---------------------------------------
const store = openRouteStore(STORE);
const holes = (readStruckRanks(STORE) || { keys: {} }).keys;
{
  const faults = [], since = [], untyped = [];
  const later = mine.length === 1 ? rounds.slice(rounds.indexOf(round) + 1) : [];
  for (const x of landed) {
    const where = `line ${x.from.line}: ${x.m} ${x.key} rank ${x.rank} «${String(x.route).slice(0, 40)}»`;
    if (!(holes[x.key] || []).some((h) => h[0] === x.rank)) untyped.push(where);
    const at = (store.routesFor(x.key) || []).filter((r) => r[0] === x.rank);
    const row = at.find((r) => String(r[3]) === x.m && r[1] === x.route);
    if (!row) {
      const acted = later.flatMap((r) => (r.rows || []).filter((y) => y.m === x.m && y.key === x.key && y.rank === x.rank && y.route === x.route && ["strike", "withhold", "re-key", "retext"].includes(y.action)).map((y) => `${y.action} by ${r.list ? r.list.file : "a round with no list"}`))[0];
      if (acted) since.push(`${where}: ${acted}`); else faults.push(`${where} does not stand`);
      continue;
    }
    if (at.length !== 1) faults.push(`${where}: ${at.length} rows stand at its key and rank`);
    // its headwords as the list gave them: English Wiktionary's own pointed forms, laid after them since 16 November
    // 2026 (own-pointing-rule-v1), are that rule's, and check-own-pointing-v1 holds them
    if (row[2] !== x.definition || String(row[4]) !== x.year || (row[5] ?? null) !== (x.cut ?? null) || !same(headwordsBeforeOwnPointing(row, store.index.m_sources), x.headwords)) faults.push(`${where} stands with another definition, year, cut or headwords than the list gives it`);
  }
  check("F4  every landed line stands once at its key and rank, and nothing else stands there: its route, its definition, its source, its year, its cut in slot 5 and its headwords; one a later round took, moved or retexted is named",
    landed.length > 0 && faults.length === 0, faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(landed.length)} rows under ${nf(new Set(landed.map((x) => x.key)).size)} keys · ${Object.values(cutsOf(landed)).reduce((a, c) => a + c, 0)} carry the cut${since.length ? ` · ${since.length} acted on since: ${first(since)}` : " · none acted on by a later round"} · store ${store.index.store_version}`);
  check("F5  the rank each landed line took is a rank the store's struck-ranks record types under its key", landed.length > 0 && untyped.length === 0, untyped.length ? `${nf(untyped.length)} · ${first(untyped)}` : `${nf(landed.length)} ranks, each a hole a strike left`);
}

// ---- F6, F7: the lines not landed ---------------------------------------------------------------------
{
  const printsOf = (key, text) => (store.routesFor(key) || []).filter((r) => r[1] === text || spaced(r[1]) === spaced(text));
  const forWords = notLanded.filter((x) => x.kind === "printed_under_its_key"), forKey = notLanded.filter((x) => x.kind === "its_key_ends_in_a_maqaf");
  const faults = [];
  if (forWords.length + forKey.length !== notLanded.length) faults.push(`${notLanded.length - forWords.length - forKey.length} line(s) not landed give no kind this check knows`);
  for (const x of forWords) if (!printsOf(x.key, x.route).length) faults.push(`line ${x.from.line}: ${x.m} ${x.key} «${String(x.route).slice(0, 40)}» is not landed, and no row under its key prints its words`);
  check("F6  every line not landed for its words has those words printed under its key now, by bytes or with white space read as one space", faults.length === 0,
    faults.length ? `${faults.length} · ${first(faults)}` : `${forWords.length} lines · ${forWords.filter((x) => x.same_source).length} printed by a row of their own source, ${forWords.filter((x) => !x.same_source).length} by another's`);
  const named = ((derived.lines_under_a_key_that_ends_in_a_maqaf || {}).lines) || [], keyFaults = [];
  if (!same(named.map((l) => [l.line, l.m, l.key, l.rank, l.route]), forKey.map((x) => [x.from.line, x.m, x.key, x.rank, x.route]))) keyFaults.push(`the pin names ${named.length} line(s) under a key that ends in a maqaf, and the list of lines not landed holds ${forKey.length} of that kind, or other ones`);
  for (const x of forKey) {
    const where = `line ${x.from.line}: ${x.m} ${x.key} «${String(x.route).slice(0, 40)}»`;
    if (!x.key.endsWith(MAQAF)) keyFaults.push(`${where}: its key does not end in a maqaf`);
    else if ((store.routesFor(x.key) || []).length) keyFaults.push(`${where}: rows stand under its key`);
    else if (!printsOf(x.key.slice(0, -1), x.route).length) keyFaults.push(`${where}: its plain key does not print its words`);
  }
  // and no other line of the lane's list lands under such a key
  const strays = landed.filter((x) => x.key.endsWith(MAQAF));
  if (strays.length) keyFaults.push(`${strays.length} landed line(s) stand under a key that ends in a maqaf (first: line ${strays[0].from.line})`);
  check("F7  every line not landed for its key is one the pin names: its key ends in a maqaf, no row stands under it, and its plain key prints its words; no landed line stands under such a key", keyFaults.length === 0,
    keyFaults.length ? `${keyFaults.length} · ${first(keyFaults)}` : `${forKey.length} lines (${forKey.map((x) => `line ${x.from.line} ${x.m} «${x.route}»`).join(", ") || "none"})`);
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
