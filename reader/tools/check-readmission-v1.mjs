#!/usr/bin/env node
// RUN: tree
// GUARDS: readmission-rule-v1-a-source-our-own-label-struck-returns-on-what-its-own-source-says-it-is-for-the-rows-the-corpus-lane-lists
// LEDGER: -
// no frame letter. A check reads the re-admission's record, the landings' pin and its lists, the store and the
// admission's record and judges them; it is not the ledger for one.
//
// A SOURCE OUR OWN LABEL STRUCK RETURNS ON WHAT ITS OWN SOURCE SAYS IT IS, FOR THE ROWS THE CORPUS LANE LISTS.
// tools/readmit-sources-v1.mjs puts data/readmission-v1.json into effect (the index's entries, the admission's
// record); the rows land by the landings' rule. This is the standing law of it:
//
//   R1  the record is the rule's and whole; the lists it names are lists of the landings' pin, of its relay, each
//       its pinned bytes; the sources the lists' lines name are exactly the record's, each with the record's count
//       of lines, under the record's key, in the list the record says; a source the record holds for the owner's
//       word is none of them. A source the record holds back (`held`, 22 November 2026: relay v210's own-language
//       list carries PanLex's lines beside the translation tables') has exactly its count of lines in the list it
//       names, that list's pin holds it back with the record's reason, and it stays struck. A line the pin holds
//       back by itself (held_lines, 22 November 2026) is a listed row of its source not served: the record counts
//       them for the source (held_by_their_line), and that is the pin's count (R1); none stands as a row (R4)
//   R2  in the index each returning source stands exactly as the record returns it (its entry as it stood, the
//       languages its own source names, the record's year, how it returns), and the admission's own rule admits
//       it by those languages; it is among the re-admitted and not among the struck; the struck and the
//       re-admitted together are every source the admission's record ever struck, none twice; a source that stays
//       struck has no entry
//   R3  the admission's record says so too: each returning source is still among the sources it struck, marked
//       re-admitted with the record's ground; it is among the sources kept, as the admission's rule lists a
//       source it admits; and a re-admission names exactly these sources
//   R4  every row the store holds of a returning source is a row a landing of the record's lists made: its key
//       and words are a landed line's of that source, and no landed line of such a source is without its row. So
//       a source that returned for its listed rows alone carries no other row, and no source that stays struck or
//       is held for the owner's word carries a row at all
//
// A tree with no record of the re-admission is skipped (exit 3).
// Run: node tools/check-readmission-v1.mjs [--store data/route-store]
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { readReadmission, entryOf, heldOf, READMISSION_RECORD, READMISSION_RULE_ID } from "./readmit-sources-v1.mjs";
import { classify } from "./strike-language-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const STORE = arg("store", join(K3, "data", "route-store"));
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const nf = (x) => Number(x).toLocaleString("en-US");
const first = (xs, k = 4) => xs.slice(0, k).join(" · ") + (xs.length > k ? ` · and ${xs.length - k} more` : "");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const num = (m) => Number(String(m).slice(1));

console.log(`— ${READMISSION_RULE_ID} —\n`);
if (!existsSync(join(K3, READMISSION_RECORD))) { console.log(`not run here · this tree holds no record of the re-admission (${READMISSION_RECORD})`); process.exit(3); }
let rec = null, recFault = null;
try { rec = readReadmission(join(K3, READMISSION_RECORD)); } catch (e) { recFault = e.message; }
if (!rec) { check("R1  the record is the rule's and whole", false, recFault); console.log("\n1 FAILED"); process.exit(1); }
const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const la = index.language_admission || {};
const admission = existsSync(join(K3, la.record || "")) ? JSON.parse(readFileSync(join(K3, la.record), "utf8")) : {};
const back = new Map(rec.sources.map((s) => [s.m, s]));
const heldIds = new Set(Object.values((rec.held_for_the_owners_word || {}).sources || {}).flatMap((w) => w.m || []));
const heldBack = heldOf(rec);   // the sources the record holds back in its own lists, each with why
// the single lines the landings' pin holds back in the record's lists (held_lines), each of its source
const landingsPin = existsSync(join(K3, "data", "landings", "PIN.json")) ? JSON.parse(readFileSync(join(K3, "data", "landings", "PIN.json"), "utf8")) : { lists: [] };
const heldLinesOf = (m) => (landingsPin.lists || []).filter((l) => rec.lists.includes(l.id)).flatMap((l) => (Array.isArray(l.held_lines) ? l.held_lines : []).filter((h) => h && h.m === m));
for (const m of heldBack.keys()) heldIds.add(m);

// ---- R1: the record against the landings' pin and its lists ------------------------------------------------
const landedOf = new Map();   // list id -> the landed lines derived from it
{
  const faults = [];
  const LAND = join(K3, "data", "landings");
  const pin = existsSync(join(LAND, "PIN.json")) ? JSON.parse(readFileSync(join(LAND, "PIN.json"), "utf8")) : { lists: [] };
  const counted = new Map(), keyed = new Map(), listOf = new Map();
  const heldCounted = new Map(), heldIn = new Map(), pinList = new Map();
  for (const id of rec.lists) {
    const L = pin.lists.find((l) => l.id === id);
    if (!L) { faults.push(`the landings' pin names no list ${id}`); continue; }
    pinList.set(id, L);
    if (L.relay !== rec.relay) faults.push(`${id} is of relay ${L.relay}, and the record is of ${rec.relay}`);
    try {
      for (const e of readPinnedLines(join(LAND, L.folder, L.list.file), L.list, `${L.folder}/${L.list.file}`)) {
        if (heldBack.has(e.m)) { heldCounted.set(e.m, (heldCounted.get(e.m) || 0) + 1); if (heldIn.has(e.m) && heldIn.get(e.m) !== id) faults.push(`${e.m} is held back and has lines in two lists`); heldIn.set(e.m, id); continue; }
        counted.set(e.m, (counted.get(e.m) || 0) + 1);
        if (keyed.has(e.m) && keyed.get(e.m) !== e.source) faults.push(`${id}: ${e.m} is named under two keys`);
        keyed.set(e.m, e.source);
        if (listOf.has(e.m) && listOf.get(e.m) !== id) faults.push(`${e.m} has lines in two lists`);
        listOf.set(e.m, id);
      }
      const d = (L.derived || {}).landed;
      landedOf.set(id, d && d.lines ? readPinnedLines(join(LAND, L.derived.folder, d.file), d, `${L.derived.folder}/${d.file}`) : []);
    } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
  }
  for (const s of rec.sources) {
    if (counted.get(s.m) !== s.rows_listed) faults.push(`${s.m}: the record counts ${s.rows_listed} listed rows and the lists hold ${counted.get(s.m) || 0}`);
    if (keyed.get(s.m) !== s.entry.key) faults.push(`${s.m}: the record's entry is ${s.entry.key} and the lists name ${keyed.get(s.m)}`);
    if (listOf.get(s.m) !== s.list) faults.push(`${s.m}: the record says ${s.list} and its lines are in ${listOf.get(s.m)}`);
    if (heldIds.has(s.m)) faults.push(`${s.m} returns and is held for the owner's word at once`);
  }
  for (const m of counted.keys()) if (!back.has(m)) faults.push(`${m} has lines in the record's lists and is not a source of the record`);
  for (const m of heldIds) if (!rec.stay_struck.includes(m)) faults.push(`${m} is held for the owner's word and is not among the sources that stay struck`);
  for (const [m, x] of heldBack) {
    if ((heldCounted.get(m) || 0) !== x.rows_listed) faults.push(`${m}: the record holds back ${x.rows_listed} listed rows and the lists hold ${heldCounted.get(m) || 0}`);
    if (heldIn.get(m) !== x.list) faults.push(`${m}: the record says it is held back in ${x.list} and its lines are in ${heldIn.get(m)}`);
    if ((((pinList.get(x.list) || {}).held_sources) || {})[m] !== x.why) faults.push(`${m}: the pin's list ${x.list} does not hold it back with the record's reason`);
  }
  for (const [id, L] of pinList) for (const m of Object.keys(L.held_sources || {})) if (!heldBack.has(m)) faults.push(`the pin's list ${id} holds back ${m}, and the record does not`);
  for (const s of rec.sources) if (heldLinesOf(s.m).length !== (s.held_by_their_line || 0)) faults.push(`${s.m}: the record says its pin holds back ${s.held_by_their_line || 0} of its lines by their line, and the pin holds back ${heldLinesOf(s.m).length}`);
  for (const [id, L] of pinList) for (const h of L.held_lines || []) if (!h || !back.has(h.m)) faults.push(`the pin's list ${id} holds back a line of ${h && h.m}, which is not a source the record returns`);
  check("R1  the record is the rule's and whole; its lists are the landings' pin's, each its pinned bytes; the sources the lists name are exactly the record's, each with its count, key and list; a source held for the owner's word is none of them; a source the record holds back has its count of lines in its list, held back there by the pin with the record's reason",
    faults.length === 0, faults.length ? `${faults.length} · ${first(faults)}` : `relay ${rec.relay} · ${rec.sources.length} sources in ${rec.lists.length} lists, ${nf(rec.sources.reduce((a, s) => a + s.rows_listed, 0))} rows listed · ${rec.sources.filter((s) => s.returns === "whole").length} return whole, ${rec.sources.filter((s) => s.returns !== "whole").length} for their listed rows alone · ${heldIds.size - heldBack.size} held for the owner's word${heldBack.size ? ` · ${heldBack.size} held back with their source (${[...heldBack].map(([m, x]) => `${m} ${nf(x.rows_listed)} lines`).join(", ")}), each as the pin's list holds it` : ""}`);
}

// ---- R2: the index ----------------------------------------------------------------------------------------
{
  const faults = [];
  const struck = la.struck_m_ids || [], readm = la.readmitted_m_ids || [];
  for (const s of rec.sources) {
    const want = entryOf(rec, s), have = index.m_sources[s.m];
    if (!have) { faults.push(`${s.m} has no entry in the index`); continue; }
    if (!same(have, want) && !same({ ...have, ledger: undefined }, { ...want, ledger: undefined })) faults.push(`${s.m}: its entry is not the record's (${Object.keys(want).filter((k) => !same(have[k], want[k])).join(", ")} differ)`);
    const d = classify(have);
    if (!d.admitted) faults.push(`${s.m}: the admission's own rule does not admit it by its languages (${d.reason})`);
    if (!readm.includes(s.m)) faults.push(`${s.m} is not among the re-admitted`);
    if (struck.includes(s.m)) faults.push(`${s.m} is among the struck still`);
  }
  for (const m of readm) if (!back.has(m)) faults.push(`${m} is among the re-admitted and is not a source of the record`);
  const ever = (admission.struck_sources || []).map((x) => x.m_id).sort((a, b) => num(a) - num(b));
  const now = [...struck, ...readm].sort((a, b) => num(a) - num(b));
  if (!same(ever, now)) faults.push(`the struck (${struck.length}) and the re-admitted (${readm.length}) are not the ${ever.length} sources the admission's record struck, each once`);
  if (!same([...struck].sort((a, b) => num(a) - num(b)), [...rec.stay_struck].sort((a, b) => num(a) - num(b)))) faults.push("the struck list is not the sources the record says stay struck");
  for (const m of struck) if (index.m_sources[m]) faults.push(`${m} stays struck and has an entry in the index`);
  for (const [m, v] of Object.entries(index.m_sources)) if ((v.readmitted || v.languages) && !back.has(m)) faults.push(`${m} carries the marks of a re-admission and is not a source of the record`);
  const r = la.readmission || {};
  if (r.rule_id !== rec.rule_id || r.record !== READMISSION_RECORD || r.relay !== rec.relay || r.sources !== rec.sources.length) faults.push("the index does not name the re-admission's rule, record, relay and count");
  check("R2  in the index each returning source stands as the record returns it and the admission's own rule admits it by its languages; the struck and the re-admitted together are every source the admission struck, each once; a source that stays struck has no entry",
    faults.length === 0, faults.length ? `${faults.length} · ${first(faults)}` : `${readm.length} re-admitted, ${struck.length} struck now, ${ever.length} ever struck · ${Object.keys(index.m_sources).length} sources in the index`);
}

// ---- R3: the admission's record ---------------------------------------------------------------------------
{
  const faults = [];
  const struckRec = new Map((admission.struck_sources || []).map((x) => [x.m_id, x])), kept = new Map((admission.kept_sources || []).map((x) => [x.m_id, x]));
  for (const s of rec.sources) {
    const x = struckRec.get(s.m);
    if (!x) { faults.push(`${s.m} is not among the sources the admission's record struck`); continue; }
    const r = x.readmitted || {};
    if (r.rule_id !== rec.rule_id || r.relay !== rec.relay || r.returns !== s.returns || r.ground !== s.ground || !same(r.languages, s.languages) || r.rows_listed !== s.rows_listed) faults.push(`${s.m}: the admission's record does not mark it re-admitted as the record returns it`);
    const k = kept.get(s.m), d = classify(entryOf(rec, s));
    if (!k || k.reason !== d.reason || k.evidence !== d.evidence || k.label !== s.entry.label) faults.push(`${s.m} is not among the sources kept as the admission's rule lists a source it admits`);
  }
  for (const [m, x] of struckRec) if (x.readmitted && !back.has(m)) faults.push(`${m} is marked re-admitted and is not a source of the record`);
  const all = (admission.readmissions || []).flatMap((r) => r.readmitted || []).sort((a, b) => num(a) - num(b));
  if (!same(all, rec.sources.map((s) => s.m).sort((a, b) => num(a) - num(b)))) faults.push(`the admission's record names ${all.length} sources re-admitted, and the record returns ${rec.sources.length}`);
  check("R3  the admission's record marks each returning source re-admitted with the record's ground, lists it among the sources kept as its rule lists an admitted source, and a re-admission names exactly these sources",
    faults.length === 0, faults.length ? `${faults.length} · ${first(faults)}` : `${rec.sources.length} sources marked and kept · ${(admission.readmissions || []).length} re-admission(s) on record`);
}

// ---- R4: every row of a returning source is a landed line's --------------------------------------------------
{
  const faults = [];
  const want = new Map();   // m -> Set of key \u0001 words, the landed lines of the record's lists
  let lines = 0;
  for (const list of landedOf.values()) for (const x of list) { if (!want.has(x.m)) want.set(x.m, new Set()); want.get(x.m).add(`${x.key}\u0001${x.route}`); lines += 1; }
  const seen = new Map(); const perM = {}; let rowsOfOut = 0;
  const heldLineIds = new Set(rec.sources.flatMap((s) => heldLinesOf(s.m).map((h) => `${h.m}\u0001${h.key}\u0001${h.route}`)));
  const out = new Set([...(la.struck_m_ids || []), ...heldIds]);
  for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin"))) {
    const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
    for (const [k, rows] of Object.entries(body)) for (const r of rows) {
      const m = String(r[3]);
      if (out.has(m)) { rowsOfOut += 1; if (faults.length < 40) faults.push(`${m} is struck or held and carries a row`); continue; }
      if (!back.has(m)) continue;
      perM[m] = (perM[m] || 0) + 1;
      const id = `${k}\u0001${r[1]}`;
      if (heldLineIds.has(`${m}\u0001${id}`)) faults.push(`${m}: a line its pin holds back by itself stands as a row («${String(r[1]).slice(0, 40)}»)`);
      if (!(want.get(m) || new Set()).has(id)) { if (faults.length < 40) faults.push(`${m} carries a row no landed line of the record's lists names («${String(r[1]).slice(0, 40)}»)`); }
      else { if (!seen.has(m)) seen.set(m, new Set()); if (seen.get(m).has(id)) faults.push(`${m} carries one landed line twice`); seen.get(m).add(id); }
    }
  }
  for (const [m, ids] of want) if (back.has(m) && (seen.get(m) || new Set()).size !== ids.size) faults.push(`${m}: ${ids.size} lines landed and ${(seen.get(m) || new Set()).size} of them stand as rows`);
  const alone = rec.sources.filter((s) => s.returns !== "whole");
  check("R4  every row the store holds of a returning source is a row a landing of the record's lists made, and every such landed line stands as a row; a source that stays struck or is held for the owner's word carries none, and no line the pin holds back by itself stands as a row",
    faults.length === 0 && lines > 0, faults.length ? `${faults.length} · ${first(faults)}` : `${nf(Object.values(perM).reduce((a, b) => a + b, 0))} rows of ${Object.keys(perM).length} returning sources, each a landed line's (${nf(lines)} lines landed) · the sources that returned for their listed rows alone carry ${nf(alone.reduce((a, s) => a + (perM[s.m] || 0), 0))} rows (${alone.map((s) => `${s.m} ${nf(perM[s.m] || 0)}${s.held_by_their_line ? ` of ${nf(s.rows_listed)} listed: ${s.held_by_their_line} held by their line, named and not served` : ""}`).join(", ")}) and no other · ${rowsOfOut} rows of a struck or held source`);
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
