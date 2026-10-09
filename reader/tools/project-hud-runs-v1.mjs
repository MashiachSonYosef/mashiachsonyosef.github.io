#!/usr/bin/env node
// project-hud-runs-v1 · the corpus lane's HUD record, laid on the zones the page draws
//
// RULE: hud-runs-rule-v1-a-stretch-the-record-puts-in-one-hud-wears-one-line
// LEDGER: -
// no frame letter. This reads the corpus lane's HUD record (moses-hud-record-v1,
// one line per place, which HUD the place sits in under each branch) and the
// zones on disk, and writes one small file per book; it decides no HUD.
//
// The owner, 2026-10-09: "gold underline will indicate how many words are in a
// single hud", and, on the record's arrival, "ok so show me a screenshot so we
// can push it all live". The record's HUDs are the corpus lane's: which words
// a dictionary names as one thing, under one license, is cut there (the v64.2
// relay, READY, candidate only). This only says where each HUD of two or more
// words stands in the zone the page draws, so the page can give its words one
// line, one strip and one card — the same lane the run cards already take:
//
//   - a place is a zone word that is not a mark, counted from 0 within the
//     book (the record's bp); the zone's words are checked against the
//     record's, byte for byte, and a book whose words do not match is held
//   - one branch is read (--branch, default OWN/UNION: the union, which cuts
//     nothing); a place whose ten branches agree is written "*" in the record
//     and read under any branch
//   - a HUD of one place is not written (it is the word's own card); a HUD of
//     kind MAQAF_CHAIN alone is not written either (the page already joins a
//     maqaf chain into one cell with one line); every other HUD of two or more
//     places is a run: LICENCE_RUN, MAQAF_CHAIN+LICENCE_RUN, UNION_OF_PARTIAL_OVERLAPS,
//     KETIV_QERE_SITE, CUT_REMAINDER
//   - a run is written as its section and the index of each of its words in
//     that section's words, with each word's own key; a run that crosses a
//     section, or holds a ketiv/qere pair, is held and counted, never cut
//
// Run: node tools/project-hud-runs-v1.mjs --record <dir of <book>.jsonl> [--branch OWN/UNION] [--out data/hud-runs]
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; };
const RECORD = arg("--record"), BRANCH = arg("--branch", "OWN/UNION"), OUT = arg("--out", "data/hud-runs");
if (!RECORD) { console.error("missing --record <dir>"); process.exit(2); }
const SKIP_KINDS = new Set(["SINGLE_WORD", "MAQAF_CHAIN"]);
mkdirSync(OUT, { recursive: true });
const index = { schema_version: "HUD_RUNS_INDEX_V1", rule_id: "hud-runs-rule-v1-a-stretch-the-record-puts-in-one-hud-wears-one-line", branch: BRANCH, candidate_only: true, books: {} };
const books = readdirSync(RECORD).filter((f) => f.endsWith(".jsonl")).map((f) => f.replace(/\.jsonl$/u, "")).sort();
for (const book of books) {
  const zonePath = join("data", "zones", `${book}.bin`);
  if (!existsSync(zonePath)) { console.error(`${book}: no zone on disk; held`); continue; }
  const raw = readFileSync(join(RECORD, `${book}.jsonl`));
  const lines = raw.toString("utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const header = lines[0], rows = lines.slice(1);
  const zone = JSON.parse(gunzipSync(readFileSync(zonePath)).toString("utf8"));
  // the zone's places: every word that is not a mark, in order, with its section
  const places = [];
  for (const sec of zone.sections || []) (sec.words || []).forEach((w, i) => { if (!w.mark) places.push({ sec, i, w }); });
  const held = { words_differ: 0, crosses_section: 0, ketiv_qere: 0, no_branch: 0 };
  if (places.length !== rows.length) { console.error(`${book}: ${places.length} zone places, ${rows.length} record places; held`); index.books[book] = { held: "place count differs", zone_places: places.length, record_places: rows.length }; continue; }
  let differ = 0;
  rows.forEach((r, bp) => { if (r.s !== places[bp].w.s) differ += 1; });
  if (differ) { console.error(`${book}: ${differ} places whose word differs from the zone's; held`); index.books[book] = { held: "words differ", differ }; continue; }
  // group the places by HUD under the branch
  const huds = new Map();
  rows.forEach((r, bp) => {
    const v = r.hud["*"] || r.hud[BRANCH];
    if (!v) { held.no_branch += 1; return; }
    const [id, , , kind] = v;
    let h = huds.get(id); if (!h) { h = { id, kind, bps: [] }; huds.set(id, h); }
    h.bps.push(bp);
  });
  const cards = []; const kinds = {};
  for (const h of huds.values()) {
    if (h.bps.length < 2 || SKIP_KINDS.has(h.kind)) continue;
    const ps = h.bps.map((bp) => places[bp]);
    if (ps.some((p) => p.sec !== ps[0].sec)) { held.crosses_section += 1; continue; }
    if (ps.some((p) => !p.w.k)) { held.ketiv_qere += 1; continue; }
    kinds[h.kind] = (kinds[h.kind] || 0) + 1;
    cards.push({ unit: ps[0].sec.unit, label: ps[0].sec.label, idx: ps.map((p) => p.i), keys: ps.map((p) => p.w.k), hud: h.id, kind: h.kind, text: ps.map((p) => p.w.s).join(" ") });
  }
  cards.sort((a, b) => (a.unit === b.unit ? a.idx[0] - b.idx[0] : 0));
  const out = { schema_version: "HUD_RUNS_V1", rule_id: index.rule_id, book, branch: BRANCH, candidate_only: true,
    from: { record: `corpus-lane-builds/moses-hud-record-v1/v1.2/build/hud-record-v1.2/${book}.jsonl`, record_sha256: createHash("sha256").update(raw).digest("hex"), relay: "FOR-ELIJAH-v64.2.md", record_date: header.date || null },
    place_axis: "a place is a zone word that is not a mark, counted from 0 within the book; written here as the section's unit and each word's index in that section's words",
    counts: { places: rows.length, huds: huds.size, runs: cards.length, kinds, held },
    cards };
  writeFileSync(join(OUT, `${book}.json`), JSON.stringify(out));
  index.books[book] = { runs: cards.length, kinds, held };
  console.log(`${book}: ${rows.length} places · ${huds.size} HUDs · ${cards.length} runs ${JSON.stringify(kinds)} · held ${JSON.stringify(held)}`);
}
writeFileSync(join(OUT, "index.json"), JSON.stringify(index, null, 1));
