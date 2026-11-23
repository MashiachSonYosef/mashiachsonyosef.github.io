#!/usr/bin/env node
// RUN: tree
// GUARDS: names-gate-rule-v1-a-row-its-own-source-gives-as-a-name-is-withheld-where-the-word-on-the-page-is-not-a-name
// LEDGER: -
// no frame letter. A check reads the lists' pin, the store, the zones and the
// pages and judges them; it is not the ledger for one.
//
// A ROW ITS OWN SOURCE GIVES AS A NAME IS WITHHELD WHERE THE WORD ON THE PAGE
// IS NOT A NAME. A dictionary lists a man called Bara under the letters of
// the verb "he created". The corpus lane listed the served rows whose every
// entry their own source marks a name, and the word places of the
// thirty-nine books that are a name (relay v177; data/names/).
// tools/apply-name-rows-v1.mjs marks the rows (the facts slot: name),
// tools/project-lattice-v12-v1.mjs marks the places on each word (np), and
// the page asks, with the entry and before the pointing, whether the place
// is a name (tools/names-gate-v1.mjs holds the gate's own function, and the
// page carries it under the same name).
//
// What is held here, each recomputed and none read from a tool's receipt:
//
//   N1  the lists, their rule and their receipt are the bytes their pin
//       names, and the corpus lane's receipt names both lists by the pin's
//       sha256 and lines
//   N2  the lists themselves: every place is a book, a verse and a word
//       number, listed once, with the sources that call it a name, counted
//       as the lane's receipt counts them; every row is a key, a rank, an m
//       id and a hash, listed once, of a source the lane read for names,
//       and the rows are counted source by source as the receipt counts
//       them
//   N3  every row of the store: a listed line finds exactly one row where
//       the row-strikes record says its row now stands (as listed, or under
//       the key a round since moved it to: tools/row-strikes-follow-v1.mjs),
//       and that row carries the mark; no other row carries it; a line whose
//       row a round struck or withheld since finds none, and is counted so
//   N4  the store's index names the rule, the pin and the list, totals that
//       are a recount's, and the rounds since as the record gives them
//   N5  the places on the words: in every book the list names, each listed
//       place marks the word of that number in its verse, as the card's
//       head counts it, and no other word carries the mark; the zone's
//       receipt names the list and counts as a recount does; a book the
//       list does not name carries none
//   N6  the page's own functions, read out of zone.html and run: the gate
//       itself gives what the module gives, and a place is a name where its
//       word is marked, or anywhere in a book whose receipt names no list
//   N7  the addendum (relay v194: the 26 served rows names v1 counted and
//       did not list, 22 whose source gives part of them as a name and part
//       not, 4 its reading did not reach): its list, rule and receipt are the
//       bytes the pin names, and the lane's receipt names the list so; every
//       line is a key, a rank, an m id and a hash, listed once and on no line
//       of the name rows; each finds exactly one row of the store where the
//       record says it stands, with the line's own route and definition; no
//       such row carries the mark (tools/apply-name-rows-v1.mjs never reads
//       this list); and the lines are counted source by source as names v1's
//       own receipt counts its rows partly a name and unreached
//   N8  on the page, at a place that is not a name whose key carries a row
//       given as a name: under the default the card withholds exactly those
//       rows (the entry's own withheld are not counted twice), says so on
//       its withheld line, and prints no reading that only such rows carry;
//       under "keep" it withholds none and the reading is back
//   N9  at a place that is a name the same kind of row stands: nothing is
//       withheld as a name, and a reading only such rows carry is on the
//       card, credited to its source
//   N9  a pointer whose target the form-of map resolves to a row its source
//       marks a name (data/form-of-pills-v1.json, resolved.name) is no row
//       given as a name: its own source gives it as a form of another word.
//       At a place that is not a name, under the default, the card counts
//       as given as a name exactly N7's rows, and the pointer's pill prints
//       the pointer as itself, unresolved; under "keep" it prints the
//       name's English with the pointer beside it (the review of 15
//       November 2026: the card counted such pointers «given as a name by
//       its source» and withheld them)
//
// MORE LISTS OF ROWS, AND THE PLACES WITH THE LANE'S ADDITION (ship 20, 23
// November 2026). The pin names, beside names v2's list of rows, relay v213's
// (the rows relays v200 and v202 landed) and relay v219's (the translation
// tables' rows), each with its own rule and receipt and the way its lines find
// their row; and, on names v1's list of places, relay v219's addition
// (Ezekiel 27:6 word 11 added, TAHOT a witness at 6 more places), laid as its
// letter says (tools/name-lists-v1.mjs). So N1 holds every list, rule and
// receipt to its pin and each receipt names its own list; N2 counts names v1's
// list as names v1's receipt does and the list as laid as relay v219's
// receipt does, and each list of rows as its own receipt counts it; N3 finds
// every list's rows, followed from the store its receipt names or, where the
// lane read no store for them, by key, m id and sha16 in the store as it
// stands, a row listed once over every list; N4 holds the index's record of
// each list beside names v2's; N5 reads the places as laid, and each zone's
// receipt names the addition too; N7's addendum is on no list of rows.
//
// The words are found in the data, never named.
//
// Run: node tools/check-names-gate-v1.mjs   (SERVE_BASE=<a reader's
// address, the folder of its zone.html> presses that page's cards instead
// of this checkout's: the page laws N7 to N9 then judge it against this
// checkout's data)
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore, factsOf, readingKey } from "./gloss-store-v1.mjs";
import { NAMES_GATE_RULE_ID, nameWithheld } from "./names-gate-v1.mjs";
import { placeEntry, placeTags, bdbEntriesAt, entryVerdict } from "./entry-gate-v1.mjs";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { nameRowLists, namePlaces } from "./name-lists-v1.mjs";
import { openFollower, followedRecord, FollowFault } from "./row-strikes-follow-v1.mjs";
import { gradeRow, heldByPointing } from "./pointing-grade-v1.mjs";
import { isOtherStem } from "./stem-family-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { plainWord, openGatedCard } from "./gated-card-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const STORE = join(K3, "data", "route-store");
const PINS = join(K3, "data", "names");
const ZONES = join(K3, "data", "zones");
const HOME = "reader/data/names";   // the same folder as the index names it
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const nf = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const first = (list, n = 3) => list.slice(0, n).join(" · ");
const gz = (path) => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));

console.log(`— ${NAMES_GATE_RULE_ID} —\n`);
if (!existsSync(join(PINS, "PIN.json"))) { console.log("SKIPPED — no list of names on this disk (data/names/PIN.json)"); process.exit(3); }
const pin = JSON.parse(readFileSync(join(PINS, "PIN.json"), "utf8"));
const store = openRouteStore(STORE);
const index = store.index;
const rec = index.name_rows || null;

// ---- N1: the pinned bytes ---------------------------------------------------------------------
// THE TWO LISTS MAY COME FROM TWO RELAYS (ship 11, 20 November 2026). Names v2 (relay v198) takes the place of names
// v1's list of name rows, and «the places stay v1's» (the lane's letter). So the pin gives the list of places its own
// folder, rule and receipt where they are not the rows', and each list is held to the receipt of its own relay:
// theirs is the receipt beside the rows, theirsPlaces the one beside the places (the same file where the pin gives
// the places none of their own). The two receipts are of two shapes, read here by what each says:
//   the rows' list      names v1: rows.file          names v2: lists.name
//   the sources read    names v1: rows.m_ids_read    names v2: m_ids_read (by m id)
//   the rows by source  names v1: rows.name_rows     names v2: by_m[m].name
//   the lists beside names v2's  their receipts name their list under lists (relay v213's lists.name, relay v219's a
//                                list of files), and their rows by source under by_m_rows[m].name (v213) or
//                                part_3_tables.by_m_and_class["<m> / name"] (v219)
let theirs = null, theirsPlaces = null, places = [], rowLines = [], lists = [], laid = null;
const listSaid = (t, file) => [((t || {}).rows || {}).file, ...Object.values((t || {}).lists || {})].find((x) => x && x.file === file) || null;
const placesFolder = (pin.place_names && pin.place_names.folder) || pin.folder;
const placesRelay = (pin.place_names && pin.place_names.relay) || pin.relay;
{
  const faults = [];
  if (pin.schema_version !== "NAMES_PIN_V1" || !pin.place_names || !pin.name_rows || !pin.rule || !pin.receipt) faults.push("the pin names no lists, rule or receipt");
  else {
    const ownOfPlaces = !!(pin.place_names.rule || pin.place_names.receipt);
    if (ownOfPlaces && !(pin.place_names.rule && pin.place_names.receipt && pin.place_names.folder)) faults.push("the pin gives the list of places a rule or a receipt of its own, and not its folder, its rule and its receipt together");
    try {
      // every list of rows, each with its rule and receipt, the bytes the pin names (names v2's first)
      lists = nameRowLists(PINS, pin);
      theirs = lists[0].theirs;
      if (ownOfPlaces && pin.place_names.rule && pin.place_names.receipt) {
        readPinned(join(PINS, placesFolder, pin.place_names.rule.file), pin.place_names.rule, `${placesFolder}/${pin.place_names.rule.file}`);
        theirsPlaces = JSON.parse(readPinned(join(PINS, placesFolder, pin.place_names.receipt.file), pin.place_names.receipt, `${placesFolder}/${pin.place_names.receipt.file}`).toString("utf8"));
      } else theirsPlaces = theirs;
      // names v1's places and the addition the pin names, each the bytes it names, laid as the lane's letter says
      laid = namePlaces(PINS, pin);
      places = laid.v1;
      rowLines = lists[0].lines;
    } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
    const named = (f, p) => !!f && f.file === p.file && f.sha256 === p.sha256 && f.lines === p.lines && f.bytes === p.bytes;
    const rowsFileSaid = theirs ? (theirs.rows || {}).file || (theirs.lists || {}).name || null : null;
    if (theirsPlaces && !named((theirsPlaces.places || {}).file, pin.place_names)) faults.push("the lane's receipt names another list of name places than the pin");
    if (theirs && !named(rowsFileSaid, pin.name_rows)) faults.push("the lane's receipt names another list of name rows than the pin");
    if (theirs && (theirs.rule || {}).sha256 !== pin.rule.sha256) faults.push("the lane's receipt names another rule than the pin");
    if (theirsPlaces && theirsPlaces !== theirs && (theirsPlaces.rule || {}).sha256 !== pin.place_names.rule.sha256) faults.push("the lane's receipt of the places names another rule than the pin gives them");
    for (const L of lists.slice(1)) {
      if (!named(listSaid(L.theirs, L.rows.file), L.rows)) faults.push(`the receipt of relay ${L.relay} names another list of name rows than the pin`);
      if ((L.theirs.rule || {}).sha256 !== L.rule.sha256) faults.push(`the receipt of relay ${L.relay} names another rule than the pin`);
    }
    if (laid && laid.addition) {
      if (!named(listSaid(laid.theirs, laid.addition.file), laid.addition)) faults.push(`the receipt of relay ${laid.addition.relay} names another addition to the list of places than the pin`);
      if ((laid.theirs.rule || {}).sha256 !== laid.addition.rule.sha256) faults.push(`the receipt of relay ${laid.addition.relay} names another rule than the pin gives the addition`);
    }
  }
  check("N1  the lists, their rules and their receipts are the bytes their pin names, and the corpus lane's receipt of each list names it as the pin does", faults.length === 0,
    faults.length ? first(faults) : `${nf(pin.place_names.lines)} name places of relay ${placesRelay} (${String(pin.place_names.sha256).slice(0, 12)}…)${laid && laid.addition ? `, with relay ${laid.addition.relay}'s addition of ${laid.addition.lines} lines (${String(laid.addition.sha256).slice(0, 12)}…)` : ""} · ${lists.map((L) => `${nf(L.rows.lines)} name rows of relay ${L.relay} (${String(L.rows.sha256).slice(0, 12)}…)`).join(", ")}`);
}

// ---- N2: the lists themselves -----------------------------------------------------------------
const placesOf = new Map();   // book -> verse label -> the word numbers that are a name, from the list as laid
const READ_FOR_NAMES = (() => { const r = ((theirs || {}).rows || {}).m_ids_read || (theirs || {}).m_ids_read || []; return new Set(Array.isArray(r) ? r : Object.keys(r)); })();
const listed = new Map();     // key -> "rank m sha16" -> the line, names v2's lines as listed
const allLines = lists.flatMap((L) => L.lines);
// a list's rows source by source, as its own receipt counts them (THE TWO LISTS MAY COME FROM TWO RELAYS, above)
const rowsBySaid = (t) => (t && t.rows && t.rows.name_rows)
  || (t && t.by_m && typeof t.by_m === "object" ? Object.fromEntries(Object.entries(t.by_m).filter(([, v]) => v && v.name).map(([m, v]) => [m, v.name])) : null)
  || (t && t.by_m_rows && typeof t.by_m_rows === "object" ? Object.fromEntries(Object.entries(t.by_m_rows).filter(([, v]) => v && v.name).map(([m, v]) => [m, v.name])) : null)
  || (t && t.part_3_tables && t.part_3_tables.by_m_and_class ? Object.fromEntries(Object.entries(t.part_3_tables.by_m_and_class).filter(([k]) => / \/ name$/u.test(k)).map(([k, v]) => [k.split(" / ")[0], v])) : null);
{
  const faults = [];
  const by = {}, byLaid = {};
  const shapeOf = (l, where) => {
    const cut = String(l.place).lastIndexOf(":");
    const verse = String(l.place).slice(0, cut), n = Number(String(l.place).slice(cut + 1));
    if (typeof l.book !== "string" || cut < 1 || !Number.isInteger(n) || n < 1 || !Array.isArray(l.by) || !l.by.length) { faults.push(`${where} is not a book, a verse and a word number with the sources that say so`); return null; }
    return { verse, n, k: [...l.by].sort().join(" and ") };
  };
  // names v1's own list, counted as names v1's receipt counts it
  places.forEach((l, at) => { const x = shapeOf(l, `${pin.place_names.file} line ${at + 1}`); if (x) by[x.k] = (by[x.k] || 0) + 1; });
  // the list as laid, each place once: what the projection marks
  const seen = new Set();
  const laidLines = (laid && laid.laid) || [];
  laidLines.forEach((l, at) => {
    const x = shapeOf(l, `the list as laid, line ${at + 1}`);
    if (!x) return;
    const id = `${l.book} ${l.place}`;
    if (seen.has(id)) faults.push(`the list as laid, line ${at + 1}: ${id} is listed twice`);
    seen.add(id);
    byLaid[x.k] = (byLaid[x.k] || 0) + 1;
    const book = placesOf.get(l.book) || placesOf.set(l.book, new Map()).get(l.book);
    (book.get(x.verse) || book.set(x.verse, new Set()).get(x.verse)).add(x.n);
  });
  const said = (theirsPlaces || {}).places || {};
  if (theirsPlaces && said.names !== places.length) faults.push(`the lane's receipt counts ${said.names} name places and the list holds ${places.length}`);
  if (theirsPlaces && !same(Object.fromEntries(Object.entries(said.by || {}).sort()), Object.fromEntries(Object.entries(by).sort()))) faults.push(`by the sources that say so the list counts ${JSON.stringify(by)} and the lane's receipt ${JSON.stringify(said.by)}`);
  // the addition as the lane's receipt of it counts it, and the list it says the addition makes
  const withTahot = laidLines.filter((l) => Array.isArray(l.by) && l.by.includes("tahot")).length;
  if (laid && laid.addition) {
    const p1 = (laid.theirs || {}).part_1 || {}, a = p1.addition || {}, held = p1.the_list_then_held || {};
    if (a.lines !== laid.additions.length || a.added !== laid.added || a.witness_added !== laid.witnessAdded) faults.push(`the addition lays ${laid.added} added and ${laid.witnessAdded} witnesses added, and its receipt counts ${a.added} and ${a.witness_added}`);
    if (held.names_v1_lines !== places.length || held.places !== laidLines.length || held.of_them_with_tahot_among_the_witnesses !== withTahot) faults.push(`laid, the list holds ${laidLines.length} places (${withTahot} with TAHOT among the witnesses), and the addition's receipt says it then holds ${held.places} (${held.of_them_with_tahot_among_the_witnesses})`);
  } else if (laidLines.length !== places.length) faults.push("the list as laid is not names v1's, and the pin names no addition");
  // every list's rows: a key, a rank where its lines are followed, an m id and a hash; names v2's of a source names v2
  // read; each list counted source by source as its own receipt counts it (that a row is listed once over every list
  // is N3's, where each line finds its row)
  for (const L of lists) {
    L.lines.forEach((l, at) => {
      const where = `${L.folder}/${L.rows.file} line ${at + 1}`;
      if (typeof l.k !== "string" || (L.readAt && !Number.isInteger(l.rank)) || typeof l.m !== "string" || !/^[0-9a-f]{16}$/u.test(String(l.sha))) { faults.push(`${where} names no key, ${L.readAt ? "rank, " : ""}m id or hash`); return; }
      if (!L.main) return;
      if (READ_FOR_NAMES.size && !READ_FOR_NAMES.has(l.m)) faults.push(`${where} names a row of ${l.m}, which the lane did not read for names`);
      const rows = listed.get(l.k) || listed.set(l.k, new Map()).get(l.k);
      const id = `${l.rank} ${l.m} ${l.sha}`;
      if (rows.has(id)) faults.push(`${where}: the row ${id} under ${l.k} is listed twice`);
      rows.set(id, l);
    });
    const rowsBy = {};
    for (const l of L.lines) if (typeof l.m === "string") rowsBy[l.m] = (rowsBy[l.m] || 0) + 1;
    const saidBy = rowsBySaid(L.theirs);
    if (!saidBy || typeof saidBy !== "object" || !same(Object.fromEntries(Object.entries(saidBy).sort()), Object.fromEntries(Object.entries(rowsBy).sort())))
      faults.push(`source by source relay ${L.relay}'s list holds ${JSON.stringify(rowsBy)} name rows and its receipt counts ${JSON.stringify(saidBy)}`);
  }
  check("N2  every listed place is a book, a verse and a word number, listed once and counted as the lane's receipt counts them, names v1's list and the list as laid with the addition; every listed row is a key, a rank where it is followed, an m id and a hash, of a source the lane read for names, each list counted as its receipt counts it",
    places.length > 0 && rowLines.length > 0 && faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(places.length)} places of names v1 (${Object.entries(by).map(([k, v]) => `${k} ${nf(v)}`).join(", ")})${laid && laid.addition ? `; laid with the addition ${nf(laidLines.length)} (${laid.added} added, ${laid.witnessAdded} witnesses added; ${Object.entries(byLaid).map(([k, v]) => `${k} ${nf(v)}`).join(", ")})` : ""} in ${placesOf.size} books · ${lists.map((L) => `relay ${L.relay} ${nf(L.lines.length)} rows of ${new Set(L.lines.map((l) => l.m)).size} source(s)`).join(", ")}`);
}

// ---- N3, N4: every row of the store -----------------------------------------------------------
// where the rows the lists read have gone since, by the row-strikes record kept beside the store
const followerSince = (readAt) => { try { return [openFollower({ data: dirname(STORE), index, readAt }), ""]; } catch (e) { if (e instanceof FollowFault) return [null, e.message]; throw e; } };
// each list's rows, each under the name its row has now: followed from the store its receipt names, or, for a list
// joined in the store as it stands, found under its key by m id and sha16, exactly one row; the lines whose row a round
// since struck or withheld, set apart; a row listed once over every list
const listedNow = new Map();   // key now -> "rank m sha16" -> { l, L }
const followFaults = [];
for (const L of lists) {
  const [f, why] = L.readAt ? followerSince(L.readAt) : [null, ""];
  if (L.readAt && !f) followFaults.push(`relay ${L.relay}: ${why}`);
  L.follow = f; L.gone = []; L.rekeyed = []; L.marked = 0;
  for (const l of L.lines) {
    let went = { state: "served", name: [l.k, l.rank] };
    if (L.readAt) {
      if (!f) continue;
      try { went = f.nowOf([l.k, l.rank, l.m, l.sha]); } catch (e) { if (e instanceof FollowFault) { followFaults.push(e.message); continue; } throw e; }
    } else {
      const found = (store.routesFor(l.k) || []).filter((r) => String(r[3]) === l.m && sha256(Buffer.from(String(r[1] ?? ""), "utf8")).slice(0, 16) === l.sha);
      if (found.length !== 1) { followFaults.push(`relay ${L.relay}: the row of ${l.m} (${l.sha}) under its key stands ${found.length} times in the store as it stands`); continue; }
      went = { state: "served", name: [l.k, found[0][0]] };
    }
    if (went.state === "struck" || went.state === "withheld") { L.gone.push(went); continue; }
    if (went.state === "re-keyed") L.rekeyed.push(went);
    const mine = listedNow.get(went.name[0]) || listedNow.set(went.name[0], new Map()).get(went.name[0]);
    const id = `${went.name[1]} ${l.m} ${l.sha}`;
    if (mine.has(id)) followFaults.push(`relay ${L.relay} lists the row of ${l.m} at rank ${went.name[1]} (${l.sha}), which relay ${mine.get(id).L.relay} lists too`);
    mine.set(id, { l, L });
  }
}
const follow = lists.length ? lists[0].follow : null;
const followWhy = lists.length ? "" : "the lane's receipt was not read, so the version the list was read at is not known";
const goneLines = lists.flatMap((L) => L.gone), rekeyedLines = lists.length ? lists[0].rekeyed : [];
let marked = 0;
{
  const faults = follow ? [...followFaults] : [followWhy || followFaults[0] || "names v2's list could not be followed"];
  const met = new Map();   // key, then the line's id -> how many rows of the store are that row
  let rows = 0, strays = 0;
  for (const name of readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort()) {
    const body = gz(join(STORE, "shards", name));
    for (const [k, list] of Object.entries(body)) for (const row of list) {
      rows += 1;
      const f = factsOf(row);
      const has = !!(f && "name" in f);
      if (has && f.name !== 1) faults.push(`${k} (${row[3]}, rank ${row[0]}): the mark is ${JSON.stringify(f.name)}, not 1`);
      const mine = listedNow.get(k);
      const id = `${row[0]} ${row[3]} ${sha256(Buffer.from(String(row[1] ?? ""), "utf8")).slice(0, 16)}`;
      const isListed = !!(mine && mine.has(id));
      if (isListed) met.set(`${k}\u0001${id}`, (met.get(`${k}\u0001${id}`) || 0) + 1);
      if (has) marked += 1;
      if (has && isListed) mine.get(id).L.marked += 1;
      if (has && !isListed) { strays += 1; if (faults.length < 6) faults.push(`${k} (${row[3]}, rank ${row[0]}): carries the mark and no line lists it`); }
      if (!has && isListed) faults.push(`${k} (${row[3]}, rank ${row[0]}): listed and carries no mark`);
    }
  }
  let none = 0, several = 0;
  for (const [k, mine] of listedNow) for (const id of mine.keys()) { const n = met.get(`${k}\u0001${id}`) || 0; if (!n) none += 1; else if (n > 1) several += 1; }
  const t = (rec && rec.totals) || {};
  if (none) faults.push(`${none} line(s) find no row, and no round of the row-strikes record struck, withheld or moved their row`);
  if (goneLines.length !== (t.lines_that_find_no_row || 0)) faults.push(`${goneLines.length} line(s) name a row a round struck or withheld since, and the index says ${t.lines_that_find_no_row || 0}`);
  if (several !== (t.lines_that_find_more_than_one_row || 0)) faults.push(`${several} line(s) find more rows than one, and the index says ${t.lines_that_find_more_than_one_row || 0}`);
  check("N3  every listed line finds exactly one row of the store where the row-strikes record says its row stands, that row carries the mark, and no other row does; a line whose row a round struck or withheld since finds none", listed.size > 0 && faults.length === 0,
    faults.length ? `${nf(faults.length)}${strays ? ` (${nf(strays)} rows carry the mark unlisted)` : ""} · ${first(faults)}` : `${nf(rows)} rows read · ${nf(marked)} carry the mark, each a listed line's one row · ${lists.map((L) => `relay ${L.relay} ${nf(L.marked)} of ${nf(L.lines.length)}${L.follow ? ` (since store ${L.follow.readAt}, ${L.follow.rounds.length} round(s): ${L.gone.length} line(s) name a row struck or withheld, ${L.rekeyed.length} followed to another key)` : " (joined in the store as it stands)"}`).join(" · ")}`);
}
{
  const faults = [];
  if (!rec) faults.push("the index holds no name_rows record");
  else {
    if (rec.rule_id !== NAMES_GATE_RULE_ID) faults.push("the record names another rule");
    if (rec.pin !== `${HOME}/PIN.json` || rec.relay !== pin.relay) faults.push("the record names another pin or relay");
    if (!same(rec.name_rows, { file: `${HOME}/${pin.folder}/${pin.name_rows.file}`, sha256: pin.name_rows.sha256, lines: pin.name_rows.lines })) faults.push("the record names another list than the pin");
    if (rec.read_at_store_version !== ((((theirs || {}).inputs || {}).route_store || {}).store_version || null)) faults.push("the record says the list was read at another version of the store than the lane's receipt says");
    const t = rec.totals || {};
    const sources = new Set(allLines.map((l) => l.m)).size;
    if (t.rows_listed !== allLines.length || t.rows_marked !== marked || t.sources !== sources) faults.push(`totals say ${t.rows_listed} listed, ${t.rows_marked} marked, ${t.sources} sources; a recount gives ${allLines.length}, ${marked}, ${sources}`);
    if (!follow) faults.push(followWhy || "names v2's list could not be followed");
    else if (!same(rec.followed, followedRecord(follow, { left: lists[0].gone, rekeyed: rekeyedLines }))) faults.push("the record's account of the rounds since the list was read is not the row-strikes record's");
    // each list beside names v2's, as the tool that lays them records it: its relay, rule, receipt and list, how its
    // lines find their row, the rounds since where they are followed, and what they found, recounted here
    const homeOf = (L, f) => `${HOME}/${L.folder}/${f.file}`;
    const want = lists.slice(1).map((L) => ({ relay: L.relay, letter: L.letter, rule: homeOf(L, L.rule), receipt: homeOf(L, L.receipt),
      name_rows: { file: homeOf(L, L.rows), sha256: L.rows.sha256, lines: L.rows.lines }, joined_by: L.join, read_at_store_version: L.readAt,
      ...(L.follow ? { followed: followedRecord(L.follow, { left: L.gone, rekeyed: L.rekeyed }) } : {}),
      totals: { rows_listed: L.lines.length, rows_marked: L.marked, lines_that_find_no_row: L.gone.length } }));
    if (want.length ? !same(rec.more_lists, want) : rec.more_lists !== undefined) faults.push(`the record names ${JSON.stringify((rec.more_lists || []).map((x) => [x.relay, x.name_rows && x.name_rows.sha256, x.totals]))} beside names v2's list, and a recount ${JSON.stringify(want.map((x) => [x.relay, x.name_rows.sha256, x.totals]))}`);
  }
  check("N4  the store's index names the rule, the pin and the lists, totals that are a recount's, and the rounds since as the row-strikes record gives them", faults.length === 0, faults.length ? first(faults) : `${nf(marked)} rows marked of ${nf(allLines.length)} listed${lists.length > 1 ? ` (${lists.map((L) => `relay ${L.relay} ${nf(L.lines.length)}`).join(", ")})` : ""}`);
}

// ---- N5: the places on the words, and the words for the page ----------------------------------
const rowsOf = (k) => (store.routesFor(k) || []).filter((r) => index.m_sources[r[3]]);
// a reading only rows of the given kind carry, among the key's rows: [text, a row carrying it] or null
const readingOnlyOf = (rows, isOfKind, wanted) => {
  for (const [i, row] of rows.entries()) {
    if (!wanted(row, i)) continue;
    for (const grp of store.readingPool([row], "oldest")) {
      const carriers = store.carriersOf(rows, grp.text);
      if (carriers.length && carriers.every((c) => isOfKind(c, rows.indexOf(c)))) return [grp.text, row];
    }
  }
  return null;
};
const served = zonesServed().filter((z) => existsSync(join(ZONES, `${z}.lattice.bin`)));
// N9: the pointers the form-of map resolves to a row its source marks a name (resolved.name), by the key they stand
// under: the page's map, as it carries it (tools/bake-form-of-pills-v1.mjs)
const FORM_OF_FILE = join(K3, "data", "form-of-pills-v1.json");
const FORM_OF = existsSync(FORM_OF_FILE) ? JSON.parse(readFileSync(FORM_OF_FILE, "utf8")) : null;
const pointersToAName = (k) => (((FORM_OF && FORM_OF.keys) || {})[k] || []).filter((x) => x && x.resolved && x.resolved.name);
// The words for the page, a few of each kind (notAName, aName): a word the page joins to its neighbors in one cell
// opens the cell's card and not its own, which only the page can say, so the first whose card is its own is judged.
const MOST = 4;
const picks = {};
const more = (kind) => (picks[kind] || []).length < MOST;
const n5 = { books: 0, marks: 0, listed: 0, faults: [] };
for (const z of served) {
  const zone = gz(join(ZONES, `${z}.bin`));
  const said = (((zone.emitted_from || {}).toggles || {}).lattice || {}).names || null;
  const mine = placesOf.get(z) || null;
  let marks = 0, hit = 0, missing = 0;
  const grades = (existsSync(join(ZONES, `${z}.lattice.bin`)) && (more("notAName") || more("aName") || more("pointer"))) ? gz(join(ZONES, `${z}.lattice.bin`)) : null;
  for (const [si, sec] of (zone.sections || []).entries()) {
    const words = sec.words || [];
    const numbered = words.filter((w) => !w.mark);
    const here = mine ? mine.get(String(sec.label)) || null : null;
    numbered.forEach((w, at) => {
      const want = !!(here && here.has(at + 1));
      if (w.np !== undefined && w.np !== 1) n5.faults.push(`${z} ${sec.label} word ${at + 1}: the mark is ${JSON.stringify(w.np)}, not 1`);
      if (w.np) marks += 1;
      if (want && w.np) hit += 1;
      if (want && !w.np) n5.faults.push(`${z} ${sec.label} word ${at + 1}: listed as a name and carries no mark`);
      if (!want && w.np) n5.faults.push(`${z} ${sec.label} word ${at + 1}: carries the mark and no line lists the place`);
    });
    for (const w of words) if (w.mark && w.np) n5.faults.push(`${z} ${sec.label}: a mark of the text carries the name mark`);
    if (here) for (const n of here) if (!numbered[n - 1]) missing += 1;
    // the words for the page: one region its place does not divide, in a book whose places were read for names
    if (!said || !grades || (!more("notAName") && !more("aName") && !more("pointer"))) continue;
    for (const [e, w] of words.entries()) {
      if (!plainWord(words, e)) continue;
      const kind = w.np ? "aName" : "notAName";
      // (N9: at a place that is not a name, the pointers under its key whose target is a name)
      const pointers = !w.np && more("pointer") ? pointersToAName(w.k) : [];
      if (!more(kind) && !pointers.length) continue;
      const rows = rowsOf(w.k);
      const named = rows.some((r) => (factsOf(r) || {}).name);
      if (!named && !pointers.length) continue;
      // what the entry and the pointing do with each row here, as the page asks them
      const place = placeTags(w) ? placeEntry(placeTags(w)) : null;
      const facts = rows.map(factsOf);
      const bdbHere = place ? bdbEntriesAt(place, facts) : null;
      const verdicts = rows.map((r, i) => (place ? entryVerdict(facts[i], place, bdbHere) : "none"));
      const rowGrades = rows.map((r) => gradeRow(r, w.s));
      const attested = rowGrades.includes("m");
      const gr = (grades.grades || {})[w.s], rs = (grades.stems || {})[w.k] || null;
      const otherStem = (row) => !!(rs && gr && Array.isArray(gr.st) && gr.st.length && isOtherStem(rs[`${row[3]}\u0001${row[0]}\u0001${row[1]}`], gr.st));
      // a name's row the entry leaves; and one the pointing and the stem would leave too
      const nameLeft = (row, i) => !!(facts[i] && facts[i].name) && verdicts[i] !== "other";
      // (a row the entry, the pointing and the stem all leave)
      const left = (row, i) => verdicts[i] !== "other" && (verdicts[i] === "this" || !attested || !heldByPointing(rowGrades[i])) && !otherStem(row);
      const stands = (row, i) => nameLeft(row, i) && left(row, i);
      const pick = { zone: z, section: si, entry: e, label: sec.label, s: w.s, k: w.k, tags: placeTags(w), rows: rows.length, names: rows.filter(nameLeft).length };
      // N9: a pointer to a name whose own row, no name's, every other gate leaves here
      const pointer = pointers.find((x) => rows.some((row, i) => String(row[3]) === x.m && !(facts[i] && facts[i].name) && store.carriersOf([row], x.t).length && left(row, i)));
      if (pointer) (picks.pointer ||= []).push({ ...pick, pointer });
      if (!named || !more(kind)) continue;
      if (kind === "notAName") {
        // a reading that only withheld rows carry: a name's, or another entry's
        const only = readingOnlyOf(rows, (row, i) => nameLeft(row, i) || verdicts[i] === "other", stands);
        if (only && rows.some((row, i) => !nameLeft(row, i) && left(row, i))) (picks.notAName ||= []).push({ ...pick, reading: only[0], m: String(only[1][3]) });
      } else {
        const only = readingOnlyOf(rows, nameLeft, stands);
        if (only) (picks.aName ||= []).push({ ...pick, reading: only[0], m: String(only[1][3]) });
      }
    }
  }
  if (mine) {
    n5.books += 1; n5.listed += [...mine.values()].reduce((a, s) => a + s.size, 0); n5.marks += marks;
    const listedHere = [...mine.values()].reduce((a, s) => a + s.size, 0);
    const addition = pin.place_names.additions || null;
    if (!said || said.rule !== NAMES_GATE_RULE_ID || (said.place_names || {}).sha256 !== pin.place_names.sha256) n5.faults.push(`${z}: its receipt does not name the gate's rule and this list`);
    else if (addition ? (said.additions || {}).sha256 !== addition.sha256 || (said.additions || {}).lines !== addition.lines : said.additions !== undefined) n5.faults.push(`${z}: its receipt names ${said.additions ? `the addition ${String(said.additions.sha256).slice(0, 12)}` : "no addition"} to the list of places, and the pin ${addition ? `the addition ${String(addition.sha256).slice(0, 12)}` : "none"}`);
    else if (said.listed_for_this_book !== listedHere || said.marked !== hit || said.with_no_word !== missing) n5.faults.push(`${z}: its receipt counts ${said.listed_for_this_book} listed, ${said.marked} marked, ${said.with_no_word} with no word; a recount gives ${listedHere}, ${hit}, ${missing}`);
    if (missing) n5.faults.push(`${z}: ${missing} listed place(s) name a word the book does not have`);
  } else if (marks) n5.faults.push(`${z}: ${marks} word(s) carry the name mark and the list names no place of the book`);
}
for (const b of placesOf.keys()) if (!served.includes(b)) n5.faults.push(`the list names places of ${b}, which is not a served book with the lattice layer`);
check("N5  in every book the list as laid names, each listed place marks the word of that number in its verse and no other word carries the mark; each zone's receipt names the list and its addition and counts as a recount does", n5.books > 0 && n5.faults.length === 0,
  n5.faults.length ? `${nf(n5.faults.length)} · ${first(n5.faults)}` : `${n5.books} books · ${nf(n5.marks)} words marked of ${nf(n5.listed)} listed places`);

// ---- N6: the page's own functions -------------------------------------------------------------
{
  const faults = [];
  let page = null;
  try {
    const html = readFileSync(join(K3, "zone.html"), "utf8");
    const grab = (head, end) => { const a = html.indexOf(head); if (a < 0 || html.indexOf(head, a + 1) >= 0) throw new Error(`zone.html does not hold exactly one "${head.trim()}"`); const b = html.indexOf(end, a); if (b < 0) throw new Error(`zone.html does not close "${head.trim()}"`); return html.slice(a, b + end.length); };
    page = new Function("zone", `${grab("\n  const nameWithheld = (facts, placeIsAName) => ", ";\n")}${grab("\n  const namesMarked = () => ", ";\n")}${grab("\n  const isNamePlace = (word) => ", ";\n")}\n return { nameWithheld, isNamePlace };`);
  } catch (e) { faults.push(e.message); }
  if (page) {
    const marked2 = page({ emitted_from: { toggles: { lattice: { names: { rule: NAMES_GATE_RULE_ID } } } } });
    const unread = page({ emitted_from: { toggles: { lattice: {} } } });
    for (const facts of [null, {}, { n: ["H1"] }, { name: 1 }, { name: 1, n: ["H1"] }]) for (const isName of [true, false])
      if (marked2.nameWithheld(facts, isName) !== nameWithheld(facts, isName)) faults.push(`the gate, for ${JSON.stringify(facts)} at a place that is ${isName ? "" : "not "}a name`);
    if (marked2.isNamePlace({ np: 1 }) !== true || marked2.isNamePlace({}) !== false || marked2.isNamePlace(null) !== false) faults.push("in a book read for names, a place is not a name exactly where its word is marked");
    if (unread.isNamePlace({}) !== true || unread.isNamePlace({ np: 1 }) !== true) faults.push("in a book not read for names, a place is not read as a name");
  }
  check("N6  the page's own functions, read out of zone.html and run: the gate gives what the module gives, and a place is a name where its word is marked, or anywhere in a book whose receipt names no list", !!page && faults.length === 0, faults.length ? first(faults) : "10 askings of the gate · 5 of the place");
}

// ---- N7: the addendum, the rows names v1 counted and did not list ----------------------------------
{
  const faults = [], a = pin.addendum || null;
  let lines = [], theirsToo = null;
  if (!a || !a.list || !a.rule || !a.receipt || !a.folder) faults.push("the pin names no addendum with its list, rule and receipt");
  else try {
    readPinned(join(PINS, a.folder, a.rule.file), a.rule, `${a.folder}/${a.rule.file}`);
    theirsToo = JSON.parse(readPinned(join(PINS, a.folder, a.receipt.file), a.receipt, `${a.folder}/${a.receipt.file}`).toString("utf8"));
    lines = readPinnedLines(join(PINS, a.folder, a.list.file), a.list, `${a.folder}/${a.list.file}`);
  } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
  const out = (theirsToo && theirsToo.output) || {}, counts = (theirsToo && theirsToo.counts) || {};
  if (theirsToo && (out.sha256 !== a.list.sha256 || out.bytes !== a.list.bytes || counts.lines !== a.list.lines)) faults.push("the lane's receipt names another list than the pin's addendum");
  // each line's row, where the record says it stands: the addendum was read at its own receipt's store
  const [f2, why2] = theirsToo ? followerSince((((theirsToo.inputs || {}).store || {}).store_version) || null) : [null, ""];
  if (theirsToo && !f2) faults.push(why2);
  const wanted = new Map();   // key now -> the lines to find under it
  const seen = new Set(), byKind = {};
  lines.forEach((l, at) => {
    const where = `${a.list.file} line ${at + 1}`;
    if (typeof l.k !== "string" || !Number.isInteger(l.rank) || typeof l.m !== "string" || !/^[0-9a-f]{16}$/u.test(String(l.sha)) || typeof l.route !== "string" || typeof l.definition !== "string" || typeof l.kind !== "string") { faults.push(`${where} names no key, rank, m id, hash, route, definition and kind`); return; }
    const id = `${l.rank} ${l.m} ${l.sha}`;
    if (seen.has(`${l.k}\u0001${id}`)) faults.push(`${where}: the row ${id} is listed twice`);
    seen.add(`${l.k}\u0001${id}`);
    if ((listed.get(l.k) || new Map()).has(id)) faults.push(`${where}: the row ${id} is on the list of name rows too`);
    for (const L of lists.slice(1)) if (L.lines.some((x) => x.k === l.k && x.m === l.m && x.sha === l.sha && (!L.readAt || x.rank === l.rank))) faults.push(`${where}: the row ${id} is on relay ${L.relay}'s list of name rows`);
    (byKind[l.kind] ||= {})[l.m] = ((byKind[l.kind] || {})[l.m] || 0) + 1;
    let went = { state: "served", name: [l.k, l.rank] };
    if (f2) try { went = f2.nowOf([l.k, l.rank, l.m, l.sha]); } catch (e) { if (e instanceof FollowFault) { faults.push(e.message); return; } throw e; }
    if (went.state === "struck" || went.state === "withheld") { faults.push(`${where}: its row (${id}) was ${went.state} by ${went.by.list} since the addendum was read, and the addendum's rows are to stand`); return; }
    (wanted.get(went.name[0]) || wanted.set(went.name[0], []).get(went.name[0])).push({ l, rank: went.name[1], where, id });
  });
  let stand = 0;
  for (const [k, list] of wanted) for (const { l, rank, where, id } of list) {
    const rows = (store.routesFor(k) || []).filter((r) => r[0] === rank && String(r[3]) === l.m && sha256(Buffer.from(String(r[1] ?? ""), "utf8")).slice(0, 16) === l.sha);
    if (rows.length !== 1) { faults.push(`${where}: the row ${id} stands ${rows.length} times in the store`); continue; }
    if (rows[0][1] !== l.route || String(rows[0][2] ?? "") !== l.definition) faults.push(`${where}: the row ${id} has another route or definition than the line`);
    if ((factsOf(rows[0]) || {}).name) faults.push(`${where}: the row ${id} carries the mark of a name row, and the addendum's rows are none`);
    stand += 1;
  }
  // names v1's own receipt counted these rows and did not list them: partly a name, and unreached
  const sorted = (o) => Object.fromEntries(Object.entries(o || {}).sort());
  // (the addendum is names v1's: its counts stand in names v1's receipt, the one beside the places)
  const said = (theirsPlaces && theirsPlaces.rows) || {};
  if (theirsPlaces && (!same(sorted(byKind["partly a name"]), sorted(said.partly_a_name)) || !same(sorted(byKind["not reached"]), sorted(said.unreached)) || Object.keys(byKind).some((kind) => kind !== "partly a name" && kind !== "not reached")))
    faults.push(`by kind and source the addendum holds ${JSON.stringify(byKind)}, and names v1's receipt counts partly a name ${JSON.stringify(said.partly_a_name)} and unreached ${JSON.stringify(said.unreached)}`);
  check("N7  the addendum of rows names v1 counted and did not list: its list, rule and receipt are the bytes the pin names; every line is listed once and on no line of the name rows, finds exactly one row of the store with its own route and definition, and that row carries no mark; the lines are counted as names v1's receipt counts its rows partly a name and unreached", !!a && lines.length > 0 && faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `relay ${a.relay} · ${lines.length} lines (${String(a.list.sha256).slice(0, 12)}…) · ${stand} rows stand, none marked · ${Object.entries(byKind).map(([kind, by]) => `${kind} ${Object.values(by).reduce((x, y) => x + y, 0)}`).join(", ")} · read at store ${f2 ? f2.readAt : "?"}, ${f2 ? f2.rounds.length : 0} round(s) since`);
}

// ---- N8, N9: on the page -----------------------------------------------------------------------
const lacking = ["notAName", "aName"].filter((kind) => !picks[kind]);
if (lacking.length) check("N8–N9 on the page", false, `no served word was found: ${lacking.map((k) => (k === "aName" ? "at a place that is a name, whose key carries a row given as a name that the other gates leave" : "at a place that is not a name, whose key carries such a row and another reading")).join("; ")}`);
else {
  // SERVE_BASE: another reader's page pressed instead of this checkout's (the Run line above)
  const tree = process.env.SERVE_BASE ? { base: process.env.SERVE_BASE.replace(/\/$/u, ""), close: async () => {} } : await serveTree(K3);
  const pw = await loadPlaywright();
  const browser = await pw.chromium.launch(launchOptions());
  // the dictionaries that rest shut (dictionary-kinds-rule-v1) are asked open: this holds the names gate, and the
  // words were found over the store whole, as a card with them open reads it (English Wiktionary's own names rest
  // shut at a name place too, so N8's reading would be held back by the kinds, not the gate)
  const open = (pick, masorah = null) => openGatedCard(browser, tree.base, pick, { masorah, kinds: "open" });
  const where = (pick) => `${pick.zone} ${pick.label}, entry ${pick.entry} (${pick.k}${pick.tags ? ` under ${pick.tags.join(" ")}` : ""})`;
  const pillOf = (got, pick) => got.said.find(([text, by, own]) => [text, own].some((t) => t && readingKey(t) === readingKey(pick.reading)) && by.split(/[\s,]+/u).includes(pick.m)) || null;
  // the first of the words found whose card is its own, opened; [null, null] where the page joins every one of them
  // to its neighbors
  const own = async (list) => {
    for (const pick of list || []) { const got = await open(pick); if (got.fault || !got.joined) return [pick, got]; }
    return [null, null];
  };
  const JOINED = (list) => `each of the ${(list || []).length} word(s) found stands in a cell the page joins to its neighbors, so no card of its own was read`;
  try {
    {
      const [pick, got] = await own(picks.notAName);
      const says = pick ? `${pick.names} given as a name by ${pick.names === 1 ? "its" : "their"} source, withheld` : "";
      check("N8  at a place that is not a name, the card withholds exactly the rows given as a name that the entry left, says so, and prints no reading only such rows carry", !!pick && !got.fault && !!got.data && Number(got.data.nameWithheld) === pick.names && got.line.includes(says) && got.name === "not a name" && !pillOf(got, pick),
        !pick ? JOINED(picks.notAName) : got.fault || `${where(pick)} · ${pick.names} of ${pick.rows} rows are a name's; the card says ${got.data ? got.data.nameWithheld : "nothing"} and takes its place for ${JSON.stringify(got.name)} · "${got.line}" · «${String(pick.reading).slice(0, 40)}» (${pick.m}) ${pillOf(got, pick) ? "stands on a pill" : "is on no pill"} · ${got.said.length} pills`);
      if (pick) {
        const keep = await open(pick, "keep");
        check("    and under \"keep\" it withholds none as a name, and the reading is back on a pill of its source", !keep.fault && !!keep.data && Number(keep.data.nameWithheld) === 0 && !/given as a name/u.test(keep.line) && !!pillOf(keep, pick),
          keep.fault || `name ${keep.data ? keep.data.nameWithheld : "?"} · "${keep.line}" · «${String(pick.reading).slice(0, 40)}» ${pillOf(keep, pick) ? "stands on a pill" : "is on no pill"} · ${keep.said.length} pills`);
      }
    }
    {
      const [pick, got] = await own(picks.aName);
      check("N9  at a place that is a name the same kind of row stands: nothing is withheld as a name, and a reading only such rows carry is on the card, credited to its source", !!pick && !got.fault && !!got.data && Number(got.data.nameWithheld) === 0 && !/given as a name/u.test(got.line) && got.name === "a name" && !!pillOf(got, pick),
        !pick ? JOINED(picks.aName) : got.fault || `${where(pick)} · ${pick.names} of ${pick.rows} rows are a name's; the card says ${got.data ? got.data.nameWithheld : "nothing"} and takes its place for ${JSON.stringify(got.name)} · "${got.line}" · «${String(pick.reading).slice(0, 40)}» (${pick.m}) ${pillOf(got, pick) ? "stands on a pill" : "is on no pill"}`);
    }
    {
      // N9: a pointer to a name at a place that is not a name, counted with no name of its source's and printed as
      // itself; under "keep" resolved to the name's English, the pointer beside it
      const law = "N9  at a place that is not a name, a pointer whose target is a name is no row given as a name: the card counts N7's rows alone, and the pointer's pill prints the pointer as itself, unresolved";
      const [pick, got] = await own(picks.pointer);
      if (!pick) check(law, false, picks.pointer ? JOINED(picks.pointer) : "no served word was found at a place that is not a name whose key carries such a pointer on a row every other gate leaves");
      else {
        const x = pick.pointer, isIt = (t) => !!t && readingKey(t) === readingKey(x.t);
        const asItself = got.said.find(([t, , ptr]) => isIt(t) && !ptr) || null;
        const resolved = got.said.find(([, , ptr]) => isIt(ptr)) || null;
        check(law, !got.fault && !!got.data && Number(got.data.nameWithheld) === pick.names && !!asItself && !resolved,
          got.fault || `${where(pick)} · the pointer «${String(x.t).slice(0, 60)}» (${x.m}) resolves to «${String(x.resolved.text).slice(0, 40)}», a name · ${pick.names} row(s) its source gives as a name here; the card says ${got.data ? got.data.nameWithheld : "nothing"} · "${got.line}" · the pointer ${asItself ? "stands as itself" : resolved ? "prints the name" : "is on no pill"} · ${got.said.length} pills`);
        const keep = await open(pick, "keep");
        const back = keep.said.find(([t, , ptr]) => isIt(ptr) && String(t).includes(x.resolved.text)) || null;
        check("    and under \"keep\" the pointer's pill prints the name's English, the pointer beside it", !keep.fault && !!back,
          keep.fault || `«${back ? String(back[0]).slice(0, 80) : "no pill resolves it"}» · ${keep.said.length} pills`);
      }
    }
  } finally { await browser.close().catch(() => {}); await tree.close(); }
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
