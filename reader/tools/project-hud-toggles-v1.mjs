#!/usr/bin/env node
// project-hud-toggles-v1 · the corpus lane's megacompspan toggle ledger, laid on the zones the page draws
//
// RULE: hud-toggles-rule-v1-a-part-of-the-family-turned-off-re-lays-the-huds-from-the-groups-that-stand
// LEDGER: -
// no frame letter. This writes one small file per book under data/hud-toggles/
// (and its index) from the corpus lane's moses-megacompspan-toggles-v1/build/
// toggles-v1/<book>.json; it decides no HUD and writes nothing on a zone.
//
// The corpus lane's relay FOR-ELIJAH-v66 (Moses, 9 October 2026 AD, READY,
// candidate only): every group that can make a HUD, by part of the family
// (P1 MAQAF a maqaf chain of the ink, P2 LICENCE_RUN a spaced run a dictionary
// names, P3 KETIV_QERE a site, P4 WELD_FOLD a pill, P5 IN_WORD a word a source
// divides, P6 ABBREVIATION, empty), and the lattice of HUDs for every way of
// turning the parts on and off, under the record's two admissions (OWN: the
// group's own licence names exactly these words; ALL: OWN plus the run
// namings of kind sub_entry_phrase and unsure). With every part on it equals
// the HUD record v1.2's OWN/UNION and ALL/UNION branches at every one of
// 305,431 places (the tie), so each part is a safe toggle. The owner,
// 8 October 2026: "each megacompspan-family part as its own toggle ledger".
//
// Only two parts move a HUD's edge: P1 and P2. P3 off changes a site's kind
// and nothing the page draws as a cell; P4 off takes a pill off a card the
// page does not carry; P5 off takes the pieces off a card; P6 is empty. So
// this lays, per book, the RUNS (a HUD of two or more places that is not a
// maqaf chain alone, which the page joins from the ink already) of the
// lattices the page's two switches can reach: ALL_ON, ALL_BUT_P1,
// ALL_BUT_P2 and P4 alone (both parts off: the 16 weld runs, which stand by
// the weld ledger), each under OWN and ALL. A run is laid as the HUD record's
// runs are (tools/project-hud-runs-v1.mjs): the section's unit, each word's
// index in that section, each word's key, the kind, the record's id; a run
// that crosses a section or holds a ketiv/qere pair is held and counted. The
// zone's places are the lattice's: a place is a zone word that is not a
// mark, from 0 within the book (p - first_shelf_place), and the book's place
// count must equal the lattice's. Before anything is written, the tie is
// asked again here: the ALL_ON/OWN runs must be the served file's runs
// (data/hud-runs/<book>.json), id for id and kind for kind.
//
// Run: node tools/project-hud-toggles-v1.mjs --in <dir of toggles-v1/<book>.json> [--out data/hud-toggles] [--hud-runs data/hud-runs] [--zones data/zones]
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

const RULE = "hud-toggles-rule-v1-a-part-of-the-family-turned-off-re-lays-the-huds-from-the-groups-that-stand";
const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; };
const IN = arg("--in"), OUT = arg("--out", "data/hud-toggles"), HUD = arg("--hud-runs", "data/hud-runs"), ZONES = arg("--zones", "data/zones");
if (!IN) { console.error("missing --in <dir of toggles-v1/<book>.json>"); process.exit(2); }
const SETS = ["ALL_ON", "ALL_BUT_P1", "ALL_BUT_P2", "P4"];
const ADMS = ["OWN", "ALL"];
const SKIP_KINDS = new Set(["SINGLE_WORD", "MAQAF_CHAIN"]);
const sha = (b) => createHash("sha256").update(b).digest("hex");
mkdirSync(OUT, { recursive: true });
const index = {
  schema_version: "HUD_TOGGLES_INDEX_V1", rule_id: RULE, candidate_only: true, relay: "FOR-ELIJAH-v66.md",
  lane: "corpus-lane-builds/moses-megacompspan-toggles-v1/", lane_rule: "RULE-megacompspan-toggles-v1.md", date: null,
  parts: null,
  admissions: { OWN: "the group's own licence names exactly these words", ALL: "the admission the HUD record calls ALL, which is OWN plus the run namings of kind sub_entry_phrase and unsure" },
  sets: { "ALL_ON": "every part on: the HUD record v1.2's UNION branch (the tie)", "ALL_BUT_P1": "the maqaf off: a chain's HUD goes; its words are HUDs of one unless a license run holds them", "ALL_BUT_P2": "license runs off: every run's HUD goes; the 16 weld runs stand by the weld ledger", "P4": "the maqaf and license runs both off: the weld runs alone" },
  what_a_run_is: "a HUD of two or more places that is not a maqaf chain alone (the page joins a maqaf chain from the ink); laid as the section's unit, each word's index in that section, each word's key, the kind, the record's id",
  books: {}, totals: { runs: 0, held: { crosses_section: 0, ketiv_qere: 0 } },
};
const books = readdirSync(IN).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/u, "")).sort();
let bad = 0;
for (const book of books) {
  const zonePath = join(ZONES, `${book}.bin`);
  if (!existsSync(zonePath)) { console.error(`${book}: no zone on disk; held`); continue; }
  const raw = readFileSync(join(IN, `${book}.json`));
  const T = JSON.parse(raw.toString("utf8"));
  if (T.book !== book || T.candidate_only !== true || !T.lattices || !T.tie) { console.log(`FAIL  ${book}: the toggles file names ${T.book} or lacks its lattices or its tie`); bad += 1; continue; }
  const zone = JSON.parse(gunzipSync(readFileSync(zonePath)).toString("utf8"));
  const places = [];
  for (const sec of zone.sections || []) (sec.words || []).forEach((w, i) => { if (!w.mark) places.push({ sec, i, w }); });
  if (places.length !== T.places || T.last_shelf_place - T.first_shelf_place + 1 !== T.places) { console.log(`FAIL  ${book}: ${places.length} zone places, ${T.places} in the lattice (${T.first_shelf_place}..${T.last_shelf_place})`); bad += 1; continue; }
  const first = T.first_shelf_place;
  // every run of every carried lattice, once; a set is a list of run numbers
  const runs = [], at = new Map(), sets = {}, held = {}, counts = {};
  for (const set of SETS) for (const adm of ADMS) {
    const L = T.lattices[set] && T.lattices[set][adm];
    if (!Array.isArray(L)) { console.log(`FAIL  ${book}: no lattice ${set}/${adm}`); bad += 1; continue; }
    const name = `${set}/${adm}`;
    const list = []; const h = { crosses_section: 0, ketiv_qere: 0 }; const kinds = {};
    let covered = 0, prev = first - 1;
    for (const [a, z, kind] of L) {
      if (a !== prev + 1) { console.log(`FAIL  ${book}: ${name} has a gap or overlap at ${a}`); bad += 1; }
      prev = z; covered += z - a + 1;
      if (z <= a || SKIP_KINDS.has(kind)) continue;
      const ps = []; for (let p = a; p <= z; p += 1) ps.push(places[p - first]);
      if (ps.some((x) => x.sec !== ps[0].sec)) { h.crosses_section += 1; continue; }
      if (ps.some((x) => !x.w.k)) { h.ketiv_qere += 1; continue; }
      const key = `${ps[0].sec.unit}:${ps.map((x) => x.i).join(",")}:${kind}`;
      let n = at.get(key);
      if (n === undefined) { n = runs.length; at.set(key, n); runs.push([ps[0].sec.unit, ps.map((x) => x.i), ps.map((x) => x.w.k), kind, `H-${a}-${z}`]); }
      list.push(n); kinds[kind] = (kinds[kind] || 0) + 1;
    }
    if (covered !== T.places || prev !== T.last_shelf_place) { console.log(`FAIL  ${book}: ${name} does not tile the book (${covered} of ${T.places})`); bad += 1; }
    sets[name] = list; held[name] = h; counts[name] = { runs: list.length, kinds };
  }
  // THE PARTS THAT MOVE NO EDGE, asked here and not assumed: with P3, P5 or
  // P6 off alone the runs are ALL_ON's run for run (a site's kind changes at
  // one place; the pieces and the pills leave a card), which is what lets
  // P4 alone stand for both switches off
  const runsOf = (set, adm) => (T.lattices[set] && T.lattices[set][adm] ? T.lattices[set][adm] : []).filter((s) => s[1] > s[0] && !SKIP_KINDS.has(s[2])).map((s) => s.join("|")).join("\n");
  const noEdge = {};
  for (const set of ["ALL_BUT_P3", "ALL_BUT_P5", "ALL_BUT_P6"]) for (const adm of ADMS) { const same = runsOf(set, adm) === runsOf("ALL_ON", adm); noEdge[`${set}/${adm}`] = same; if (!same) { console.log(`FAIL  ${book}: ${set}/${adm} moves a run's edge; the both-off lattice cannot be P4 alone here`); bad += 1; } }
  // THE TIE, asked here: the ALL_ON/OWN runs are the served HUD runs
  const hudPath = join(HUD, `${book}.json`);
  let tieHere = { hud_runs_file: null, holds: false, why: "no served HUD runs file for this book" };
  if (existsSync(hudPath)) {
    const Hraw = readFileSync(hudPath); const H = JSON.parse(Hraw.toString("utf8"));
    const served = new Map((H.cards || []).map((c) => [`${c.unit}:${c.idx.join(",")}`, c]));
    const here = (sets["ALL_ON/OWN"] || []).map((n) => runs[n]);
    let same = 0, kindDiff = 0, idDiff = 0, onlyHere = 0;
    for (const r of here) { const c = served.get(`${r[0]}:${r[1].join(",")}`); if (!c) { onlyHere += 1; continue; } if (c.kind !== r[3]) kindDiff += 1; else if (c.hud !== r[4]) idDiff += 1; else same += 1; }
    const onlyServed = served.size - (here.length - onlyHere);
    // and the record both rest on is one record: the lattice's input pin is the served file's
    const recordSha = T.inputs && T.inputs.record ? T.inputs.record.sha256 : null;
    const recordSame = !!(recordSha && H.from && H.from.record_sha256 === recordSha);
    tieHere = { hud_runs_file: `${HUD}/${book}.json`, hud_runs_sha256: sha(Hraw), record_sha256_served: H.from ? H.from.record_sha256 || null : null, record_sha256_lattice: recordSha, record_same: recordSame, served_runs: served.size, runs_here: here.length, same, only_here: onlyHere, only_served: onlyServed, kind_differs: kindDiff, id_differs: idDiff, holds: recordSame && onlyHere === 0 && onlyServed === 0 && kindDiff === 0 && idDiff === 0 && same === served.size };
  }
  const laneTie = T.tie["ALL_ON/OWN vs OWN/UNION"] && T.tie["ALL_ON/ALL vs ALL/UNION"] && T.tie["ALL_ON/OWN vs OWN/UNION"].holds === true && T.tie["ALL_ON/ALL vs ALL/UNION"].holds === true && T.tie["ALL_ON/OWN vs OWN/UNION"].differences === 0 && T.tie["ALL_ON/ALL vs ALL/UNION"].differences === 0;
  if (!laneTie) { console.log(`FAIL  ${book}: the lane's tie does not hold in its own file`); bad += 1; }
  if (!tieHere.holds) { console.log(`FAIL  ${book}: the ALL_ON/OWN runs are not the served HUD runs: ${JSON.stringify(tieHere)}`); bad += 1; }
  const out = {
    schema_version: "HUD_TOGGLES_V1", rule_id: RULE, book, candidate_only: true,
    from: { file: `corpus-lane-builds/moses-megacompspan-toggles-v1/build/toggles-v1/${book}.json`, sha256: sha(raw), bytes: raw.length, relay: "FOR-ELIJAH-v66.md", date: T.date || null, lane_rule: T.rule || null, record: T.inputs && T.inputs.record ? T.inputs.record : null, first_shelf_place: first, last_shelf_place: T.last_shelf_place },
    place_axis: "a place is a zone word that is not a mark, counted from 0 within the book (the lattice's p less the book's first shelf place); a run is written as the section's unit, each word's index in that section's words, each word's key, the kind and the record's id",
    parts: T.parts, admissions: index.admissions, sets_carried: index.sets,
    tie: { lane: T.tie, here: tieHere, no_edge_moves: noEdge },
    counts: { places: T.places, runs_distinct: runs.length, sets: counts, held },
    run: "[unit, [word index …], [key …], kind, record id]",
    runs, sets,
  };
  writeFileSync(join(OUT, `${book}.json`), JSON.stringify(out));
  index.date = index.date || T.date || null; index.parts = index.parts || T.parts;
  index.books[book] = { runs: runs.length, sets: Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, v.runs])), held: Object.fromEntries(Object.entries(held).filter(([, v]) => v.crosses_section || v.ketiv_qere)), tie: { lane: laneTie, here: tieHere.holds } };
  index.totals.runs += runs.length;
  for (const v of Object.values(held)) { index.totals.held.crosses_section += v.crosses_section; index.totals.held.ketiv_qere += v.ketiv_qere; }
  console.log(`  ok  ${book}: ${T.places} places · ${runs.length} distinct runs · ${Object.entries(counts).map(([k, v]) => `${k} ${v.runs}`).join(", ")} · tie lane ${laneTie} here ${tieHere.holds}`);
}
writeFileSync(join(OUT, "index.json"), JSON.stringify(index, null, 1));
console.log(bad ? `\n${bad} FAILED` : `\n${books.length} books · ${index.totals.runs} distinct runs · held ${JSON.stringify(index.totals.held)}`);
process.exit(bad ? 1 : 0);
