#!/usr/bin/env node
// bake-word-senses-v1 · which of Jastrow's served rows are a word sense, for the page to hold back or mark
//
// RULE: word-senses-rule-v1-a-word-sense-is-not-a-definition-and-prints-only-under-the-word-senses-switch-which-rests-off
// LEDGER: -
// no frame letter. It reads the corpus lane's pinned list and the Jastrow
// overlay beside the store, and writes one record, data/word-senses/
// jastrow-v1.json. No row is judged here and no text is changed.
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
// elijah». The corpus lane listed the rows (relay v185.1: WORD_SENSE, 2,974
// rows under 1,559 keys, its rule in data/word-senses/jastrow-word-senses-v1/
// RULE.md). The page holds them back while its «word senses» switch is off,
// which is where it rests, and prints them as «word sense, not definition: »
// and the route while it is on (zone.html, the word senses gate).
//
// This tool carries the list to the page. A listed row is found in the
// served overlay by its key, its rank and its source id together, and must
// print the route and hold the definition the list says, byte for byte. The
// record names each row by key, rank and source id, nothing more; the texts
// stay where they are served.
//
// THE TWINS. Jastrow's overlay serves a bracketed note twice: a row whose
// definition field is the entry with its bracket, and a twin whose definition
// field is the route itself, under the same key and source id. The lane lists
// both where it found the note in the record, but only the bracketed row
// where it found it by the definition field (ITS_DEF_FIELD), so the bare twin
// stood at rest as a definition beside the count of word senses held back
// (the review of 14 November 2026: Obadiah 1:8, «retentive»). The record
// carries such twins apart, as twins, and the page holds them back with the
// list's own: an unlisted row under a listed word sense's key and source id,
// printing its route, whose definition field is that route and nothing else.
//
// THE LEGEND. The owner's wording, «brackets mean sense, not definition»,
// lives in the lane's legends-v1.json, for the record card, which shows
// Jastrow's definition as served, brackets and all. It is not true of every
// bracket: the lane lists the cards where a bracket is an aside, and counts
// rows it could not match. The owner, 14 November 2026: «i dont really see
// your legend that signifies its a sense, should it say that in purple
// somewhere if we are stripping the brackets». The record names the served
// rows whose card it holds on by the lane's own lists, and no other: the
// row's definition field holds exactly one "[", the lane lists a word sense
// with the same key, source id and definition field (so that one bracket is
// the sense), and its cards with an aside hold no row with that key, source
// id and definition field.
//
// REFUSED, each in words and with nothing written:
//   - a list, rule or receipt that is not the bytes its pin names;
//   - a line with no branch the rule names, or with no key, rank, source id
//     or route; a word sense whose print is not «word sense, not
//     definition: » and its route; a row listed twice;
//   - a word sense the served overlay does not hold under its key, rank and
//     source id, or holds with another route or definition;
//   - a legend file or an aside list that is not its pinned bytes, a legend
//     file with no legend for Jastrow's square brackets, or one with no words.
//
// Run: node tools/bake-word-senses-v1.mjs [--out data/word-senses/jastrow-v1.json]
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { readPinned, readPinnedLines, sha256Of, PinFault } from "./pinned-v1.mjs";
import { startedAs } from "./main-guard-v1.mjs";

export const WORD_SENSES_RULE_ID = "word-senses-rule-v1-a-word-sense-is-not-a-definition-and-prints-only-under-the-word-senses-switch-which-rests-off";
export const WORD_SENSE_PRINTS = "word sense, not definition: ";
const BRANCHES = new Set(["WORD_SENSE", "NOTE_WORDS_ALSO_A_WORDING", "ASIDE_WORDING"]);

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
export const WORD_SENSES_DIR = join(K3, "data", "word-senses");
export const WORD_SENSES_RECORD = join(WORD_SENSES_DIR, "jastrow-v1.json");
const FOLDER = join(WORD_SENSES_DIR, "jastrow-word-senses-v1");
const OVERLAY = join(K3, "data", "overlays", "jastrow");

class Refused extends Error {}

// the overlay's rows under a key, as served: its shard is the first byte of the key's sha256
const shardRows = new Map();
const LEGEND_ID = "jastrow-square-brackets";
const overlayRowsOf = (key) => {
  const shard = createHash("sha256").update(Buffer.from(key, "utf8")).digest("hex").slice(0, 2);
  if (!shardRows.has(shard)) {
    const p = join(OVERLAY, "shards", `${shard}.bin`);
    shardRows.set(shard, existsSync(p) ? JSON.parse(gunzipSync(readFileSync(p)).toString("utf8")) : {});
  }
  return shardRows.get(shard)[key] || [];
};

export const bakeWordSenses = () => {
  const pin = JSON.parse(readFileSync(join(FOLDER, "PIN.json"), "utf8"));
  for (const k of ["rule", "receipt"]) readPinned(join(FOLDER, pin[k].file), pin[k]);
  const lines = readPinnedLines(join(FOLDER, pin.word_senses.file), pin.word_senses);
  const ix = JSON.parse(readFileSync(join(OVERLAY, "index.json"), "utf8"));
  const rows = new Map();   // key -> [[rank, m], ...]
  const seen = new Set();
  const byM = {};
  let senses = 0;
  lines.forEach((r, at) => {
    const where = `line ${at + 1}`;
    if (!r || !BRANCHES.has(r.branch)) throw new Refused(`${where} names no branch the rule names (${r && r.branch})`);
    if (typeof r.k !== "string" || !r.k || !Number.isInteger(r.rank) || typeof r.m !== "string" || typeof r.route !== "string" || !r.route) throw new Refused(`${where} names no key, rank, source id and route`);
    const id = `${r.k}\u0001${r.rank}\u0001${r.m}`;
    if (seen.has(id)) throw new Refused(`${where} lists a row listed already (${r.k}, rank ${r.rank}, ${r.m})`);
    seen.add(id);
    if (r.branch !== "WORD_SENSE") return;
    if (r.prints !== `${WORD_SENSE_PRINTS}${r.route}`) throw new Refused(`${where} is a word sense whose print is not «${WORD_SENSE_PRINTS}» and its route`);
    const served = overlayRowsOf(r.k).find((x) => Array.isArray(x) && x[0] === r.rank && x[3] === r.m);
    if (!served) throw new Refused(`${where}: the served overlay holds no row of ${r.k} at rank ${r.rank} from ${r.m}`);
    if (served[1] !== r.route || served[2] !== r.def) throw new Refused(`${where}: the served row of ${r.k} at rank ${r.rank} prints another route or holds another definition than the list says`);
    if (!rows.has(r.k)) rows.set(r.k, []);
    rows.get(r.k).push([r.rank, r.m]);
    byM[r.m] = (byM[r.m] || 0) + 1;
    senses += 1;
  });
  // the twins: an unlisted row under a listed word sense's key and source id, printing its route, whose definition
  // field is that route
  let twins = 0;
  const listedAt = new Set(lines.map((r) => `${r.k}\u0001${r.rank}\u0001${r.m}`));
  for (const r of lines) {
    if (r.branch !== "WORD_SENSE") continue;
    for (const x of overlayRowsOf(r.k)) {
      if (!Array.isArray(x) || x[3] !== r.m || x[1] !== r.route || x[2] !== r.route || listedAt.has(`${r.k}\u0001${x[0]}\u0001${x[3]}`)) continue;
      if ((rows.get(r.k) || []).some(([rk, m]) => rk === x[0] && m === x[3])) continue;
      if (!rows.has(r.k)) rows.set(r.k, []);
      rows.get(r.k).push([x[0], x[3]]);
      twins += 1;
    }
  }
  const keys = [...rows.keys()].sort();
  // the legend, and the served rows whose record card it holds on
  const legends = JSON.parse(readPinned(join(FOLDER, pin.legends.file), pin.legends).toString("utf8"));
  const legend = (legends.legends || []).find((x) => x && x.id === LEGEND_ID);
  if (!legend || typeof legend.text !== "string" || !legend.text.trim()) throw new Refused(`the legend file holds no legend ${LEGEND_ID} with words`);
  const defKey = (k, m, def) => `${k}\u0001${m}\u0001${def}`;
  const senseDefs = new Set(lines.filter((r) => r.branch === "WORD_SENSE").map((r) => defKey(r.k, r.m, r.def)));
  const asideDefs = new Set(readPinnedLines(join(FOLDER, pin.cards_with_an_aside.file), pin.cards_with_an_aside).map((a) => defKey(a.k, a.m, a.def)));
  const legendRows = new Map();
  let legendCount = 0;
  for (const f of readdirSync(join(OVERLAY, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
    const shard = JSON.parse(gunzipSync(readFileSync(join(OVERLAY, "shards", f))).toString("utf8"));
    for (const [k, list] of Object.entries(shard)) {
      for (const x of list || []) {
        if (!Array.isArray(x) || typeof x[2] !== "string" || x[2].split("[").length !== 2) continue;
        const dk = defKey(k, x[3], x[2]);
        if (!senseDefs.has(dk) || asideDefs.has(dk)) continue;
        if (!legendRows.has(k)) legendRows.set(k, []);
        legendRows.get(k).push([x[0], x[3]]);
        legendCount += 1;
      }
    }
  }
  const legendKeys = [...legendRows.keys()].sort();
  const record = {
    schema_version: "WORD_SENSES_V1",
    rule_id: WORD_SENSES_RULE_ID,
    generated_by: "tools/bake-word-senses-v1.mjs",
    what: "the served Jastrow rows the corpus lane lists as a word sense and not a definition, each by its key, its rank and its source id; the page holds them back while its word senses switch is off and prints each as the print below and its route while it is on (zone.html)",
    pin: "reader/data/word-senses/jastrow-word-senses-v1/PIN.json",
    list: { file: pin.word_senses.file, sha256: pin.word_senses.sha256, relay: pin.relay },
    overlay: { id: "jastrow", dir: "data/overlays/jastrow/", store_version: ix.store_version || null },
    prints: WORD_SENSE_PRINTS,
    counts: { rows: senses, twins, keys: keys.length, by_m: Object.fromEntries(Object.entries(byM).sort()) },
    twins: "the rows below hold the list's word senses and their bare twins: an unlisted row under a listed word sense's key and source id, printing its route, whose definition field is that route (counts.twins); the corpus lane lists both twins where it found a note in the record and only the bracketed one where it found it by the definition field",
    rows: Object.fromEntries(keys.map((k) => [k, rows.get(k).sort((a, b) => a[0] - b[0])])),
    legend: {
      id: LEGEND_ID,
      text: legend.text,
      whose_wording: legend.whose_wording || null,
      where: "the record card under a served Jastrow row whose definition field holds exactly one \"[\", whose words the corpus lane lists as a word sense under the same key, source id and definition field, and which its cards with an aside do not hold",
      file: { legends: pin.legends.file, cards_with_an_aside: pin.cards_with_an_aside.file },
      counts: { rows: legendCount, keys: legendKeys.length },
      rows: Object.fromEntries(legendKeys.map((k) => [k, legendRows.get(k).sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1))])),
    },
  };
  return record;
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
    console.log(`word senses: ${record.counts.rows} rows and ${record.counts.twins} twins under ${record.counts.keys} keys · the legend on ${record.legend.counts.rows} rows' record cards under ${record.legend.counts.keys} keys · ${Buffer.byteLength(text)} bytes · ${was === sha256Of(Buffer.from(text)) ? "the same as before" : "written"} · ${out}`);
  } catch (e) {
    if (e instanceof Refused || e instanceof PinFault) { console.error(`REFUSED · ${e.message} · nothing written`); process.exit(1); }
    throw e;
  }
}
