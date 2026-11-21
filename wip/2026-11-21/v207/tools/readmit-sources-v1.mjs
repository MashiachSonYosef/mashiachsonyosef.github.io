#!/usr/bin/env node
// GUARDS: readmission-rule-v1-a-source-our-own-label-struck-returns-on-what-its-own-source-says-it-is-for-the-rows-the-corpus-lane-lists
// LEDGER: M
// it writes the store's index entries of the sources that return (M: which source a row is of), and the record of
// the language admission. It writes no row of the store: the rows land by the landings' rule.
//
// A SOURCE OUR OWN LABEL STRUCK RETURNS ON WHAT ITS OWN SOURCE SAYS IT IS.
//
// The language admission of 31 August and 1 September 2026 (language-admission-rule-v1) struck 49 sources by the
// label this project had given each: a label that named no language, or named one outside Hebrew and Aramaic. Its
// record says of every source struck for silence that «the fix is a label at the source naming what its own title
// page names, not an exception here», and tools/strike-language-v1.mjs says the way back is for the source to carry
// the languages its own source names. The corpus lane's relay v207 (20 November 2026) is that fix, made row by
// row: every line of its lists quotes the source's own title, the row's own language field (PanLex, English
// Wiktionary's translation tables), or the dictionary's own columns (Harkavy). data/readmission-v1.json names the
// sources that return, each with what its own source says, the languages that names, and its index entry as the
// store held it before the strike; and it names the sources of the relay that wait for the owner's word, with why.
//
// This tool puts that into effect, and only that:
//
//   - each source's entry stands in the index again as it stood, with `languages` (what its own source names; the
//     admission reads that before any label), `sourceYear` as the record gives it (the lane: no ruling gives any of
//     these a wording year), and `readmitted` (the rule, the relay, and whether the source returns whole or for its
//     listed rows alone);
//   - its id leaves `language_admission.struck_m_ids` and stands in `language_admission.readmitted_m_ids`; the
//     cumulative figures of the strike stay as they are: 49 sources were struck, and the struck-ranks record still
//     types every rank they held;
//   - the admission's record gains the re-admission (`readmissions`), marks each returning source in
//     `struck_sources` (it was struck, and why, stays said), and lists it among `kept_sources` with the languages
//     its own source names, which is where the page reads a source's language from.
//
// A SOURCE THAT RETURNS FOR ITS LISTED ROWS ALONE IS NOT ADMITTED WHOLE. PanLex returns 3,956 of the 14,008 rows the
// strike took; 10,052 name Yiddish, Ladino and other languages in their own field and stay out. Only the landings
// write rows, and only the lines the lane lists. A tool that reads rows or cards of a source from outside the store
// must ask `readmitted.returns` before it takes one: tools/project-lattice-v12-v1.mjs does.
//
// PROVED BEFORE ANYTHING IS WRITTEN: the record is the rule's; the landings' pin names the record's lists and each
// is its pinned bytes; the sources the lists' lines name are exactly the record's, each with the record's count of
// lines and under the record's key; every source is struck now, or stands re-admitted already exactly as this tool
// writes it; the sources the record says stay struck are the rest of the struck list. Run again it writes nothing.
// It holds no clock: --stamp names the day.
//
// Usage: node tools/readmit-sources-v1.mjs --stamp <YYYY-MM-DD> [--store data/route-store] [--dry]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { classify } from "./strike-language-v1.mjs";
import { startedAs } from "./main-guard-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry");
const STORE = arg("store", join(K3, "data", "route-store"));
const STAMP = arg("stamp", null);
export const READMISSION_RULE_ID = "readmission-rule-v1-a-source-our-own-label-struck-returns-on-what-its-own-source-says-it-is-for-the-rows-the-corpus-lane-lists";
export const READMISSION_RECORD = "data/readmission-v1.json";
export const RETURNS_WHOLE = "whole";
const refuse = (why) => { console.log(`REFUSED — ${why}`); process.exit(1); };
const n = (x) => Number(x).toLocaleString("en-US");
const num = (m) => Number(String(m).slice(1));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** What the index carries for a source the record returns: its entry as it stood, the languages its own source
 *  names, the record's year, and how it returns. One place, read by this tool and by its check. */
export const entryOf = (rec, s) => ({ key: s.entry.key, label: s.entry.label, licensePosture: s.entry.licensePosture, licensePointer: s.entry.licensePointer,
  sourceYear: rec.source_year, languages: [...s.languages], readmitted: { rule_id: rec.rule_id, relay: rec.relay, returns: s.returns } });

/** The record, proved to be the rule's and whole; throws one sentence. */
export const readReadmission = (path) => {
  if (!existsSync(path)) throw new Error(`the record of the re-admission is not here (${path})`);
  const rec = JSON.parse(readFileSync(path, "utf8"));
  if (rec.schema_version !== "READMISSION_V1" || rec.rule_id !== READMISSION_RULE_ID) throw new Error(`${path} is not the record of the re-admission (READMISSION_V1 under ${READMISSION_RULE_ID})`);
  if (!Array.isArray(rec.sources) || !rec.sources.length || !Array.isArray(rec.lists) || !rec.lists.length || !Array.isArray(rec.stay_struck) || typeof rec.source_year !== "string" || typeof rec.relay !== "string") throw new Error(`${path} does not name its sources, its lists, the sources that stay struck, the year and the relay`);
  const seen = new Set();
  for (const s of rec.sources) {
    const at = `${path}: ${s && s.m}`;
    if (!s || !/^M[1-9]\d*$/u.test(String(s.m)) || seen.has(s.m)) throw new Error(`${at} is not a source id of its own`);
    seen.add(s.m);
    const e = s.entry || {};
    if (![e.key, e.label, e.licensePosture, e.licensePointer, s.returns, s.ground, s.says, s.list, s.work].every((x) => typeof x === "string" && x)) throw new Error(`${at} does not say its entry, how it returns, on what ground and in which list`);
    if (!Array.isArray(s.languages) || !s.languages.length || !s.languages.every((x) => typeof x === "string" && x)) throw new Error(`${at} names no language its own source names`);
    if (!Array.isArray(s.own_words) || s.own_words.some((w) => typeof w !== "string" || !w || !s.says.includes(`«${w}»`))) throw new Error(`${at}: a word given as its own is not quoted in what it says`);
    if (!Number.isInteger(s.rows_listed) || s.rows_listed < 1) throw new Error(`${at} counts no listed row`);
    if (!rec.lists.includes(s.list)) throw new Error(`${at} returns in ${s.list}, which is not a list of the record`);
  }
  for (const m of rec.stay_struck) if (seen.has(m)) throw new Error(`${path}: ${m} returns and stays struck at once`);
  return rec;
};

// run as a program, not imported (tools/main-guard-v1.mjs says why it is asked this way)
if (startedAs(import.meta.url)) {
  if (!STAMP || !/^\d{4}-\d{2}-\d{2}$/u.test(STAMP)) refuse("name the day: --stamp <YYYY-MM-DD> (this tool holds no clock)");
  let rec;
  try { rec = readReadmission(join(K3, READMISSION_RECORD)); } catch (e) { refuse(e.message); }
  // ---- the lists, as the landings' pin names them -------------------------------------------------
  const LAND = join(K3, "data", "landings");
  const pin = JSON.parse(readFileSync(join(LAND, "PIN.json"), "utf8"));
  const counted = new Map(), keyed = new Map(), listOf = new Map();
  for (const id of rec.lists) {
    const L = (pin.lists || []).find((l) => l.id === id);
    if (!L) refuse(`the landings' pin names no list "${id}"`);
    if (L.relay !== rec.relay) refuse(`the list "${id}" is of relay ${L.relay}, and the record is of ${rec.relay}`);
    let lines;
    try { lines = readPinnedLines(join(LAND, L.folder, L.list.file), L.list, `${L.folder}/${L.list.file}`); } catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; }
    for (const e of lines) {
      counted.set(e.m, (counted.get(e.m) || 0) + 1);
      if (keyed.has(e.m) && keyed.get(e.m) !== e.source) refuse(`${id}: ${e.m} is named under two keys (${keyed.get(e.m)}, ${e.source})`);
      keyed.set(e.m, e.source);
      if (listOf.has(e.m) && listOf.get(e.m) !== id) refuse(`${e.m} has lines in two lists (${listOf.get(e.m)}, ${id})`);
      listOf.set(e.m, id);
    }
  }
  const faults = [];
  for (const s of rec.sources) {
    if (counted.get(s.m) !== s.rows_listed) faults.push(`${s.m}: the record counts ${s.rows_listed} listed rows and the lists hold ${counted.get(s.m) || 0}`);
    if (keyed.get(s.m) !== s.entry.key) faults.push(`${s.m}: the record's entry is ${s.entry.key} and the lists name ${keyed.get(s.m)}`);
    if (listOf.get(s.m) !== s.list) faults.push(`${s.m}: the record says it returns in ${s.list} and its lines are in ${listOf.get(s.m)}`);
  }
  for (const m of counted.keys()) if (!rec.sources.some((s) => s.m === m)) faults.push(`${m} has lines in the lists and is not a source of the record`);
  if (faults.length) refuse(`the record and the lists do not agree: ${faults.slice(0, 4).join("; ")}${faults.length > 4 ? `; and ${faults.length - 4} more` : ""}`);

  // ---- the index and the admission's record ---------------------------------------------------------
  const indexPath = join(STORE, "index.json");
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  const la = index.language_admission;
  if (!la || !Array.isArray(la.struck_m_ids) || typeof la.record !== "string") refuse(`${indexPath} carries no language admission`);
  const admissionPath = join(K3, la.record);
  const admission = JSON.parse(readFileSync(admissionPath, "utf8"));
  const struckNow = new Set(la.struck_m_ids), back = new Set(la.readmitted_m_ids || []);
  let fresh = 0, standing = 0;
  for (const s of rec.sources) {
    const want = entryOf(rec, s), have = index.m_sources[s.m];
    if (struckNow.has(s.m) && !have && !back.has(s.m)) { fresh += 1; continue; }
    if (!struckNow.has(s.m) && back.has(s.m) && have && same(have, want)) { standing += 1; continue; }
    refuse(`${s.m} is neither struck now nor re-admitted as this record returns it (in the struck list: ${struckNow.has(s.m)}; in the index: ${have ? "yes" : "no"}; among the re-admitted: ${back.has(s.m)})`);
  }
  if (fresh && standing) refuse(`${standing} of the record's sources stand re-admitted and ${fresh} are struck: a half-made re-admission is not finished by hand`);
  const rest = la.struck_m_ids.filter((m) => !rec.sources.some((s) => s.m === m));
  if (!same([...rest].sort((a, b) => num(a) - num(b)), [...rec.stay_struck].sort((a, b) => num(a) - num(b)))) refuse(`the sources that stay struck are ${rest.join(" ")} by the index and ${rec.stay_struck.join(" ")} by the record`);
  const struckRec = new Map((admission.struck_sources || []).map((x) => [x.m_id, x]));
  for (const s of rec.sources) if (!struckRec.has(s.m)) refuse(`${s.m} is not among the sources the admission's record struck`);
  const byWork = {};
  for (const s of rec.sources) { byWork[s.work] = byWork[s.work] || { sources: 0, rows_listed: 0 }; byWork[s.work].sources += 1; byWork[s.work].rows_listed += s.rows_listed; }
  const figures = { relay: rec.relay, sources: rec.sources.length, rows_listed: rec.sources.reduce((a, s) => a + s.rows_listed, 0), whole: rec.sources.filter((s) => s.returns === RETURNS_WHOLE).length,
    for_listed_rows_alone: rec.sources.filter((s) => s.returns !== RETURNS_WHOLE).length, stay_struck: rest.length, by_work: byWork };
  console.log(`re-admission · relay ${rec.relay} · ${rec.sources.length} sources (${figures.whole} whole, ${figures.for_listed_rows_alone} for their listed rows alone) · ${n(figures.rows_listed)} rows listed · ${rest.length} sources stay struck`);
  console.log(`figures ${JSON.stringify(figures)}`);
  if (standing) { console.log("nothing to write: every source of the record stands re-admitted as it returns it"); process.exit(0); }
  if (DRY) { console.log("dry run — nothing written"); process.exit(0); }

  // the index: the entries in the order of their ids among the others, the lists, the rule
  const all = { ...index.m_sources };
  for (const s of rec.sources) all[s.m] = entryOf(rec, s);
  index.m_sources = Object.fromEntries(Object.keys(all).sort((a, b) => num(a) - num(b)).map((m) => [m, all[m]]));
  const ids = rec.sources.map((s) => s.m).sort((a, b) => num(a) - num(b));
  la.struck_m_ids = la.struck_m_ids.filter((m) => !ids.includes(m));
  la.readmitted_m_ids = ids;
  la.readmission = { rule_id: rec.rule_id, record: READMISSION_RECORD, relay: rec.relay, on: STAMP, sources: ids.length, rows_listed: figures.rows_listed,
    whole: rec.sources.filter((s) => s.returns === RETURNS_WHOLE).map((s) => s.m), for_listed_rows_alone: rec.sources.filter((s) => s.returns !== RETURNS_WHOLE).map((s) => s.m),
    what: "sources the admission struck on our own label, back on what each one's own source says it is; the cumulative figures of the strike stand as they were, and the struck-ranks record still types every rank these sources held" };
  // the admission's record
  for (const s of rec.sources) struckRec.get(s.m).readmitted = { on: STAMP, rule_id: rec.rule_id, relay: rec.relay, returns: s.returns, ground: s.ground, says: s.says, languages: [...s.languages], rows_listed: s.rows_listed };
  const kept = (admission.kept_sources || []).filter((k) => !ids.includes(k.m_id));
  // listed as the admission itself decides an entry that carries its languages (classify), so the strike tool run again writes the same
  for (const s of rec.sources) { const d = classify(entryOf(rec, s)); if (!d.admitted) refuse(`${s.m}: the languages the record gives it (${s.languages.join(", ")}) are not admitted by the admission's own rule (${d.reason})`); kept.push({ m_id: s.m, reason: d.reason, evidence: d.evidence, label: s.entry.label }); }
  admission.kept_sources = kept.sort((a, b) => num(a.m_id) - num(b.m_id));
  admission.readmissions = [...(admission.readmissions || []), { on: STAMP, rule_id: rec.rule_id, relay: rec.relay, record: READMISSION_RECORD, readmitted: ids, rows_listed: figures.rows_listed, stay_struck: rest }];
  writeFileSync(admissionPath, JSON.stringify(admission, null, 1));
  writeFileSync(indexPath, JSON.stringify(index, null, 1));
  console.log(`written · ${la.record} (the re-admission, ${ids.length} sources marked and kept) and ${indexPath.replace(`${K3}/`, "")} (${ids.length} entries back; ${la.struck_m_ids.length} sources struck now)`);
}
