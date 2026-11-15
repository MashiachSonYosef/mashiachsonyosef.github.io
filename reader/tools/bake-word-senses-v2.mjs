#!/usr/bin/env node
// bake-word-senses-v2 · which of Jastrow's served rows are a word sense, and under which the legend holds, for the page to hold back or mark
//
// RULE: word-senses-rule-v1-a-word-sense-is-not-a-definition-and-prints-only-under-the-word-senses-switch-which-rests-off
// LEDGER: -
// no frame letter. It reads the corpus lane's pinned list and the Jastrow
// overlay beside the store, and writes one record, data/word-senses/
// jastrow-v2.json. No row is judged here and no text is changed.
//
// «POINTED OUT» STOOD AS A READING OF yadid. Some of Jastrow's entries open a
// sense with a short note in square brackets on the word's sense, and the
// served overlay serves each such note as a reading of its own: under yadid,
// whose entry reads «[pointed out,] chosen, beloved; chosen spot.», the note
// «pointed out» was a pill and ranked first. The owner, 13 November 2026:
// «seems like the correct definition would be to strip the brackets and add
// their meaning. then maybe toggle it so it could be like "toggle on word
// senses" and the actual R pill showing something like "word sense, not
// definition: pointed out"», and «wherher the toggles on or off leave that to
// elijah». The corpus lane lists the rows; the page holds them back while its
// «word senses» switch is off, which is where it rests, and prints them as
// «word sense, not definition: » and the route while it is on (zone.html, the
// word senses gate).
//
// THE LIST, v2 (relay v185.2, data/word-senses/jastrow-word-senses-v2/RULE.md,
// which is v1's rule with its amendments). The lane now reads every row it
// had left unlisted through the catalog card the row was made from, which
// names the entry (A5), and so lists 1,078 word senses more; it lists the bare
// twins itself (A1); and it says, row by row, where the legend holds (A4).
// The record holds the list's word senses and no other row: the page infers
// nothing. A listed row is found in the served overlay by its key, its rank
// and its source id together, and must print the route and hold the
// definition the list says, byte for byte. The record names each row by key,
// rank and source id, nothing more; the texts stay where they are served.
//
// THE TWINS. Jastrow's overlay serves a bracketed note twice: a row whose
// definition field is the entry with its bracket, and a twin whose definition
// field is the route itself, under the same key and source id. Until v2 the
// lane listed only the bracketed row where it found the note by the
// definition field, and the page found the bare twin itself (the review of 14
// November 2026: Obadiah 1:8, «retentive»). v2 lists each twin, found
// DEF_FIELD_TWIN, naming its bracketed row. That search stays here as a guard
// only: a row it would find that the list names in no branch is refused.
//
// THE LEGEND. The owner's wording, «brackets mean sense, not definition»,
// lives in the lane's legends file, for the record card, which shows
// Jastrow's definition as served, brackets and all. It is not true of every
// bracket. The owner, 14 November 2026: «i dont really see your legend that
// signifies its a sense, should it say that in purple somewhere if we are
// stripping the brackets». The lane lists every served row whose definition
// field holds a bracket, each with its class and whether the legend holds on
// it (legend-cards-v2.jsonl), and the record names the rows it holds on and
// no other. The page's own rule for it (one bracket, a word sense of the same
// definition field, no aside) is retired.
//
// REFUSED, each in words and with nothing written:
//   - a list, rule, receipt, legend file or card list that is not the bytes
//     its pin names;
//   - a line with no branch the rule names, found as that branch is never
//     found, or with no key, rank, source id or route; a row listed twice; a
//     line the served overlay does not hold under its key, rank and source
//     id, or holds with another route or definition;
//   - a word sense whose print is not «word sense, not definition: » and its
//     route; a row found through its cards that names none; a word sense
//     found through its cards with a card that is not a NOTE;
//   - a twin that names no word sense found by its definition field under its
//     key and source id with its route, or whose definition field is not its
//     route; such a word sense with not exactly one twin; a bare twin of a
//     word sense that the list names in no branch;
//   - a card whose class is none the rule names, or whose legend holds where
//     its class says it does not (or the other way); a card list that is not
//     exactly the served rows whose definition field holds a bracket, or an
//     aside list that is not exactly its SOME_ASIDE cards;
//   - counts that are not the receipt's or the legend file's;
//   - a legend file with no legend for Jastrow's square brackets, or one with
//     no words.
//
// Run: node tools/bake-word-senses-v2.mjs [--out data/word-senses/jastrow-v2.json]
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { readPinned, readPinnedLines, sha256Of, PinFault } from "./pinned-v1.mjs";
import { startedAs } from "./main-guard-v1.mjs";

export const WORD_SENSES_RULE_ID = "word-senses-rule-v1-a-word-sense-is-not-a-definition-and-prints-only-under-the-word-senses-switch-which-rests-off";
export const WORD_SENSE_PRINTS = "word sense, not definition: ";
// the list's branches, and how the lane may have found a row of each (RULE.md v2: v1's branches, A1, A5)
const FOUND_BY = {
  WORD_SENSE: new Set(["PLAIN_NOTE", "NOTE_WITH_MORE", "ITS_DEF_FIELD", "DEF_FIELD_TWIN", "THROUGH_ITS_CARD"]),
  NOTE_WORDS_ALSO_A_WORDING: new Set(["THROUGH_ITS_CARD", null]),
  ASIDE_WORDING: new Set(["THROUGH_ITS_CARD", null]),
};
// a card's class, and whether the legend holds on it (RULE.md v2, A4)
const LEGEND_HOLDS = { ONLY_SENSE_NOTES: true, BY_THE_LIST: true, SOME_ASIDE: false, NOT_MATCHED: false };
const LEGEND_ID = "jastrow-square-brackets";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
export const WORD_SENSES_DIR = join(K3, "data", "word-senses");
export const WORD_SENSES_RECORD = join(WORD_SENSES_DIR, "jastrow-v2.json");
export const WORD_SENSES_FOLDER = join(WORD_SENSES_DIR, "jastrow-word-senses-v2");
const OVERLAY = join(K3, "data", "overlays", "jastrow");

class Refused extends Error {}

// the overlay's shards, each read once; a key's rows stand in the shard named by the first byte of its sha256
const shards = new Map();
const shard = (name) => {
  if (!shards.has(name)) {
    const p = join(OVERLAY, "shards", `${name}.bin`);
    shards.set(name, existsSync(p) ? JSON.parse(gunzipSync(readFileSync(p)).toString("utf8")) : {});
  }
  return shards.get(name);
};
/** The served Jastrow rows under a key, as the overlay holds them. */
export const overlayRowsOf = (key) => shard(createHash("sha256").update(Buffer.from(key, "utf8")).digest("hex").slice(0, 2))[key] || [];
/** A row by its key, its rank and its source id: how the list, the record and the page name it. */
export const rowId = (k, rank, m) => `${k}\u0001${rank}\u0001${m}`;
const byRankThenM = (a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0);
const tally = (o, k) => { o[k] = (o[k] || 0) + 1; };
const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
const first = (list) => list.slice(0, 3).join(" · ");

export const bakeWordSenses = () => {
  const pin = JSON.parse(readFileSync(join(WORD_SENSES_FOLDER, "PIN.json"), "utf8"));
  for (const k of ["rule", "verify_receipt"]) readPinned(join(WORD_SENSES_FOLDER, pin[k].file), pin[k]);
  const receipt = JSON.parse(readPinned(join(WORD_SENSES_FOLDER, pin.receipt.file), pin.receipt).toString("utf8"));
  const lines = readPinnedLines(join(WORD_SENSES_FOLDER, pin.word_senses.file), pin.word_senses);
  const ix = JSON.parse(readFileSync(join(OVERLAY, "index.json"), "utf8"));

  // every line: a branch the rule names, found as that branch may be, a row the overlay serves as the list says it
  const listed = new Map();
  lines.forEach((r, at) => {
    const where = `line ${at + 1}`;
    if (!r || !FOUND_BY[r.branch]) throw new Refused(`${where} names no branch the rule names (${r && r.branch})`);
    if (typeof r.k !== "string" || !r.k || !Number.isInteger(r.rank) || typeof r.m !== "string" || typeof r.route !== "string" || !r.route) throw new Refused(`${where} names no key, rank, source id and route`);
    if (!FOUND_BY[r.branch].has(r.found_by)) throw new Refused(`${where} is ${r.branch} found ${r.found_by}, which the rule does not name for it`);
    const id = rowId(r.k, r.rank, r.m);
    if (listed.has(id)) throw new Refused(`${where} lists a row listed already (${r.k}, rank ${r.rank}, ${r.m})`);
    listed.set(id, r);
    const served = overlayRowsOf(r.k).find((x) => Array.isArray(x) && x[0] === r.rank && x[3] === r.m);
    if (!served) throw new Refused(`${where}: the served overlay holds no row of ${r.k} at rank ${r.rank} from ${r.m}`);
    if (served[1] !== r.route || served[2] !== r.def) throw new Refused(`${where}: the served row of ${r.k} at rank ${r.rank} prints another route or holds another definition than the list says`);
    if (r.found_by === "THROUGH_ITS_CARD" && !(Array.isArray(r.cards) && r.cards.length)) throw new Refused(`${where} was found through its cards and names none`);
    if (r.branch !== "WORD_SENSE") return;
    if (r.prints !== `${WORD_SENSE_PRINTS}${r.route}`) throw new Refused(`${where} is a word sense whose print is not «${WORD_SENSE_PRINTS}» and its route`);
    if (r.found_by === "THROUGH_ITS_CARD" && !r.cards.every((c) => c && c.class === "NOTE")) throw new Refused(`${where} is a word sense found through its cards, and not every card of it is a NOTE`);
  });
  const senses = lines.filter((r) => r.branch === "WORD_SENSE");

  // the twins (A1): each names a word sense found by its definition field, under its key and source id, with its
  // route, and its own definition field is that route; each such word sense has exactly one twin
  const twinsOf = new Map(senses.filter((r) => r.found_by === "ITS_DEF_FIELD").map((r) => [rowId(r.k, r.rank, r.m), 0]));
  for (const r of senses) {
    if (r.found_by !== "DEF_FIELD_TWIN") continue;
    const of = r.twin_of && r.twin_of.m === r.m ? rowId(r.k, r.twin_of.rank, r.twin_of.m) : null;
    if (!of || !twinsOf.has(of) || listed.get(of).route !== r.route) throw new Refused(`the twin ${r.k} rank ${r.rank} ${r.m} names no word sense found by its definition field under its key and source id with its route`);
    if (r.def !== r.route) throw new Refused(`the twin ${r.k} rank ${r.rank} ${r.m} holds a definition field that is not its route`);
    twinsOf.set(of, twinsOf.get(of) + 1);
  }
  const notOne = [...twinsOf].filter(([, n]) => n !== 1).map(([id, n]) => `${id.split("\u0001").join(" ")}: ${n}`);
  if (notOne.length) throw new Refused(`${notOne.length} word sense(s) found by the definition field have not exactly one twin (${first(notOne)})`);
  // the guard, the page's old search for twins: a bare row under a word sense's key and source id, printing its
  // route, that the list names in no branch
  const unlisted = [];
  for (const r of senses) {
    for (const x of overlayRowsOf(r.k)) {
      if (Array.isArray(x) && x[3] === r.m && x[1] === r.route && x[2] === r.route && !listed.has(rowId(r.k, x[0], x[3]))) unlisted.push(`${r.k} rank ${x[0]} ${x[3]}`);
    }
  }
  if (unlisted.length) throw new Refused(`${unlisted.length} served row(s) are the bare twin of a word sense and the list names them in no branch (${first(unlisted)})`);

  // the rows held back: the list's word senses, and no other
  const rows = new Map();
  const byM = {}, foundBy = {};
  for (const r of senses) {
    if (!rows.has(r.k)) rows.set(r.k, []);
    rows.get(r.k).push([r.rank, r.m]);
    tally(byM, r.m); tally(foundBy, r.found_by);
  }
  const keys = [...rows.keys()].sort();
  const twins = foundBy.DEF_FIELD_TWIN || 0;

  // the legend, and the served rows whose record card it holds on, card by card as the lane lists them (A4)
  const legends = JSON.parse(readPinned(join(WORD_SENSES_FOLDER, pin.legends.file), pin.legends).toString("utf8"));
  const legend = (legends.legends || []).find((x) => x && x.id === LEGEND_ID);
  if (!legend || typeof legend.text !== "string" || !legend.text.trim()) throw new Refused(`the legend file holds no legend ${LEGEND_ID} with words`);
  const bracketed = new Map();   // every served row whose definition field holds a bracket
  for (const f of readdirSync(join(OVERLAY, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
    for (const [k, list] of Object.entries(shard(f.slice(0, -4)))) {
      for (const x of list || []) if (Array.isArray(x) && typeof x[2] === "string" && x[2].includes("[")) bracketed.set(rowId(k, x[0], x[3]), x);
    }
  }
  const cards = new Map();
  readPinnedLines(join(WORD_SENSES_FOLDER, pin.legend_cards.file), pin.legend_cards).forEach((c, at) => {
    const where = `${pin.legend_cards.file} line ${at + 1}`;
    if (!c || !Object.hasOwn(LEGEND_HOLDS, c.class)) throw new Refused(`${where} names no class the rule names (${c && c.class})`);
    if (c.legend_holds !== LEGEND_HOLDS[c.class]) throw new Refused(`${where} says the legend ${c.legend_holds ? "holds" : "does not hold"} on a card of the class ${c.class}`);
    const id = rowId(c.k, c.rank, c.m);
    if (cards.has(id)) throw new Refused(`${where} lists a row listed already (${c.k}, rank ${c.rank}, ${c.m})`);
    const x = bracketed.get(id);
    if (!x) throw new Refused(`${where}: the served overlay holds no row of ${c.k} at rank ${c.rank} from ${c.m} whose definition field holds a bracket`);
    if (x[1] !== c.route || x[2] !== c.def) throw new Refused(`${where}: the served row of ${c.k} at rank ${c.rank} prints another route or holds another definition than the list says`);
    cards.set(id, c);
  });
  const notCarded = [...bracketed.keys()].filter((id) => !cards.has(id)).map((id) => id.split("\u0001").join(" "));
  if (notCarded.length) throw new Refused(`${notCarded.length} served row(s) whose definition field holds a bracket are not in ${pin.legend_cards.file} (${first(notCarded)})`);
  const someAside = new Set([...cards].filter(([, c]) => c.class === "SOME_ASIDE").map(([id]) => id));
  const asides = new Set();
  readPinnedLines(join(WORD_SENSES_FOLDER, pin.cards_with_an_aside.file), pin.cards_with_an_aside).forEach((a, at) => {
    const id = a ? rowId(a.k, a.rank, a.m) : "";
    const c = cards.get(id);
    if (!someAside.has(id) || asides.has(id) || c.route !== a.route || c.def !== a.def) throw new Refused(`${pin.cards_with_an_aside.file} line ${at + 1} is not a SOME_ASIDE card of ${pin.legend_cards.file}, or is listed twice`);
    asides.add(id);
  });
  if (asides.size !== someAside.size) throw new Refused(`${pin.cards_with_an_aside.file} lists ${asides.size} cards, and ${pin.legend_cards.file} has ${someAside.size} of the class SOME_ASIDE`);
  const legendRows = new Map();
  const byClass = {};
  for (const [, c] of cards) {
    tally(byClass, c.class);
    if (!c.legend_holds) continue;
    if (!legendRows.has(c.k)) legendRows.set(c.k, []);
    legendRows.get(c.k).push([c.rank, c.m]);
  }
  const legendKeys = [...legendRows.keys()].sort();
  const legendCount = [...legendRows.values()].reduce((n, l) => n + l.length, 0);

  // the counts are the receipt's and the legend file's, by a second road
  const said = [];
  for (const b of Object.keys(FOUND_BY)) {
    const of = lines.filter((r) => r.branch === b);
    const want = (receipt.branches || {})[b] || {};
    if (of.length !== want.rows || new Set(of.map((r) => r.k)).size !== want.keys) said.push(`${b}: ${of.length} rows under ${new Set(of.map((r) => r.k)).size} keys, the receipt ${want.rows} under ${want.keys}`);
  }
  const wantWs = (receipt.branches || {}).WORD_SENSE || {};
  if (JSON.stringify(sorted(byM)) !== JSON.stringify(sorted(wantWs.rows_by_m || {})) || JSON.stringify(sorted(foundBy)) !== JSON.stringify(sorted(wantWs.found_by || {}))) said.push("the word senses by source id or by how they were found are not the receipt's");
  const wantCards = legend.counts || {};
  if (cards.size !== wantCards.rows_whose_def_field_holds_a_bracket || Object.keys(LEGEND_HOLDS).some((k) => (byClass[k] || 0) !== wantCards[k])) said.push(`the cards by class (${JSON.stringify(sorted(byClass))}) are not the legend file's`);
  if (said.length) throw new Refused(`the list is not its receipt: ${said.join(" · ")}`);

  return {
    schema_version: "WORD_SENSES_V2",
    rule_id: WORD_SENSES_RULE_ID,
    generated_by: "tools/bake-word-senses-v2.mjs",
    what: "the served Jastrow rows the corpus lane lists as a word sense and not a definition, each by its key, its rank and its source id; the page holds them back while its word senses switch is off and prints each as the print below and its route while it is on (zone.html)",
    pin: "reader/data/word-senses/jastrow-word-senses-v2/PIN.json",
    list: { file: pin.word_senses.file, sha256: pin.word_senses.sha256, relay: pin.relay },
    overlay: { id: "jastrow", dir: "data/overlays/jastrow/", store_version: ix.store_version || null },
    prints: WORD_SENSE_PRINTS,
    counts: { rows: senses.length, twins, keys: keys.length, by_m: sorted(byM), found_by: sorted(foundBy) },
    twins: "the bare twins are listed (found_by DEF_FIELD_TWIN) and stand among the rows below (counts.twins of counts.rows): a row under a word sense's key and source id found by its definition field, printing its route, whose definition field is that route",
    rows: Object.fromEntries(keys.map((k) => [k, rows.get(k).sort(byRankThenM)])),
    legend: {
      id: LEGEND_ID,
      text: legend.text,
      whose_wording: legend.whose_wording || null,
      where: "the record card under a served Jastrow row whose definition field holds a bracket and which the corpus lane lists with the legend holding on it (legend_holds, its class ONLY_SENSE_NOTES or BY_THE_LIST)",
      file: { legends: pin.legends.file, legend_cards: pin.legend_cards.file, cards_with_an_aside: pin.cards_with_an_aside.file },
      counts: { rows: legendCount, keys: legendKeys.length, cards_by_class: sorted(byClass) },
      rows: Object.fromEntries(legendKeys.map((k) => [k, legendRows.get(k).sort(byRankThenM)])),
    },
  };
};

if (startedAs(import.meta.url)) {
  const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
  const out = arg("--out", WORD_SENSES_RECORD);
  try {
    const record = bakeWordSenses();
    const text = `${JSON.stringify(record)}\n`;
    mkdirSync(dirname(out), { recursive: true });
    const was = existsSync(out) ? sha256Of(readFileSync(out)) : null;
    writeFileSync(out, text);
    console.log(`word senses: ${record.counts.rows} rows under ${record.counts.keys} keys (${record.counts.twins} of them bare twins) · the legend on ${record.legend.counts.rows} rows' record cards under ${record.legend.counts.keys} keys · ${Buffer.byteLength(text)} bytes · ${was === sha256Of(Buffer.from(text)) ? "the same as before" : "written"} · ${out}`);
  } catch (e) {
    if (e instanceof Refused || e instanceof PinFault) { console.error(`REFUSED · ${e.message} · nothing written`); process.exit(1); }
    throw e;
  }
}
