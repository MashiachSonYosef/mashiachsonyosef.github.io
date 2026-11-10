#!/usr/bin/env node
// RUN: tree
// GUARDS: lattice-projection-rule-v1-the-lattice-is-projected-over-a-zones-own-positions-and-never-replaces-the-store
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// The lattice (moses-ledgers/lattice-v12/) is projected over a zone by
// tools/project-lattice-v12-v1.mjs: three small fields on the word (hg, hm,
// ld), a typed receipt, and a sidecar <slug>.lattice.bin the card fetches on
// demand. This reads what was written and asks the file the questions the
// rule makes:
//
//   L1  the projector still declares the rule this check enforces
//   L2  every layered zone carries the receipt the rule names, and its
//       sidecar is beside it, pinned, and of the schema the receipt names
//   L3  hg stands only on a word that carries a headword, with its M, and
//       that M is a source the served store still holds (rule 1: a card the
//       store does not hold is never shown); the receipt's counts are the
//       zone's counts, recounted
//   L4  in the sidecar every graded surface grades exactly the cards its key
//       carries, in the lattice's order, and every first-under entry names a
//       card of that key
//   L4b every order's leader is credited to a row that carries its reading
//       under the store's own rule (carriersOf: the printed form), with that
//       row's wording year; under the orders that sort the whole pool
//       (masoretic, vowels differ, cites here) it is the OLDEST such row —
//       the source the card credits for the same pill. (Until 10 November
//       2026 the projector found carriers by the text as written, and 16,816
//       leaders on the 39 books stood on part of their carriers.)
//   L4c the citations are the verse's: a surface's entry for another verse
//       (v[<verse>]) lists cards of its key, differs from the first verse's
//       list, and names a leader the store holds; and where the corpus
//       lane's lattice is on this machine (--lattice <dir>, or LATTICE_DIR)
//       every graded word place reads exactly the cards that name its own
//       verse. Without the lattice that half says it was not judged.
//   L5  the fingerprints join the store: for the keys the sidecar carries,
//       the store's rows find their lattice card by fingerprint — and where
//       one does not, the count is on the record, never a guess
//   L6  the sidecar's sources are the lattice files the corpus lane sealed,
//       by hash, as the receipt records them
//   L7  the reader's positions read the layer, so a projected zone is drawn
//       live and an unprojected one dead
//   L8  the parts ride ONLY on a word the catalog answers nothing for, every
//       piece names a role and at least one witness, the witnesses named on
//       the receipt are in the store under the posture it records, and the
//       line of such a word is still bare — the frame's finding stands
//
// Run: node tools/check-lattice-projection-v1.mjs [--zones data/zones]
import { readFileSync, readdirSync, existsSync, createReadStream } from "node:fs";
import { gunzipSync, createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { gradeRow } from "./pointing-grade-v1.mjs";
import { fnv1a, LATTICE_RULE_ID, SIDECAR_SCHEMA } from "./lattice-lib-v1.mjs";
import { isSidecar } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
// the corpus lane's lattice, where this machine holds it (it is too large to
// keep beside the door): L4c's second half reads it
const LATTICE = arg("lattice", process.env.LATTICE_DIR || null);
const PROJECTOR = join(HERE, "project-lattice-v12-v1.mjs");

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const note = (arr, s) => { arr.push(arr.length < 12 ? s : null); };
const few = (arr, n = 3) => arr.filter(Boolean).slice(0, n).join(" · ");

// L1
{
  const src = readFileSync(PROJECTOR, "utf8");
  const gone = [];
  if (!src.includes(LATTICE_RULE_ID)) gone.push("the rule id");
  for (const [name, re] of [["the store clause", /The store stays the store/u], ["the join clause", /proved by the key/u], ["the parts clause", /a bare word stays bare/u], ["the maqaf clause", /maqaf toggle is a different question/u]])
    if (!re.test(src)) gone.push(name);
  check("L1  the projector still declares the rule this check enforces", gone.length === 0, gone.length ? `${gone.join(", ")} gone from ${PROJECTOR.split("/").pop()}` : "quoted from the rule declared before output");
}

if (!existsSync(ZONES)) { console.log(`\nSKIPPED — no zones at ${ZONES}`); process.exit(bad ? 1 : 3); }
const load = (f) => { try { return JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { return null; } };
const store = openRouteStore(join(K3, "data", "route-store"));
const labels = new Set(Object.values(store.index.m_sources || {}).map((m) => m.label));
const pins = existsSync(join(K3, "data", "zone-store-v1.json")) ? (JSON.parse(readFileSync(join(K3, "data", "zone-store-v1.json"), "utf8")).pins || {}) : {};
const layered = [];
for (const f of readdirSync(ZONES).filter((x) => x.endsWith(".bin") && !isSidecar(x)).sort()) {
  const z = load(f); if (!z) continue;
  const t = z.emitted_from && z.emitted_from.toggles && z.emitted_from.toggles.lattice;
  if (t) layered.push({ slug: f.replace(/\.bin$/u, ""), z, t });
}
if (!layered.length) { console.log("\nSKIPPED — no zone on this shelf carries the lattice layer"); process.exit(bad ? 1 : 3); }
console.log(`\n— ${layered.length} zones carry the lattice layer —`);

const l2 = [], l3 = [], l4 = [], l4b = [], l4c = [], l5 = [], l6 = [], l8 = [];
let leadersHeld = 0, versesOwn = 0, placesRead = 0, booksRead = 0;
const labelOfRow = (row) => (store.index.m_sources[row[3]] || {}).label;
const yearOfRow = (row) => { const y = store.wordingYear(row); return Number.isFinite(y) ? y : null; };
let hgAll = 0, ldAll = 0, surfacesAll = 0, joinRows = 0, joinHits = 0, pcAll = 0, pcPieces = 0, bareAll = 0;
const ROLES = new Set(["prefix", "core", "suffix", "between_cores"]);
for (const { slug, z, t } of layered) {
  // L2
  const sp = join(ZONES, `${slug}.lattice.bin`);
  if (t.rule !== LATTICE_RULE_ID || !t.projected_by || !t.projected_on || !t.counts || !t.source) note(l2, `${slug}: receipt incomplete`);
  if (!existsSync(sp)) { note(l2, `${slug}: no ${slug}.lattice.bin beside it`); continue; }
  if (!pins[`${slug}.lattice.bin`]) note(l2, `${slug}: ${slug}.lattice.bin is not pinned in the store record`);
  const s = load(`${slug}.lattice.bin`);
  if (!s || s.schema_version !== SIDECAR_SCHEMA || s.rule_id !== LATTICE_RULE_ID) { note(l2, `${slug}: sidecar is ${s ? s.schema_version : "unreadable"}`); continue; }
  const pb = z.emitted_from.post_build;
  if (!(pb && Array.isArray(pb.wrote) && pb.wrote.includes("emitted_from.toggles") && String(pb.by || "").includes("project-lattice-v12-v1"))) note(l2, `${slug}: the write is not typed under the single-pass exemption`);
  // L3
  let hg = 0, ld = 0, hgNoH = 0, hgNoM = 0, hgNotHeld = 0;
  for (const sec of z.sections || []) for (const w of sec.words || []) {
    if (w.hg) { hg += 1; if (!w.h) hgNoH += 1; if (!w.hm || !w.hm.m || !w.hm.lic) hgNoM += 1; else if (!labels.has(w.hm.m)) hgNotHeld += 1; }
    if (w.ld) ld += 1;
  }
  if (hgNoH) note(l3, `${slug}: ${hgNoH} words carry hg without a headword`);
  if (hgNoM) note(l3, `${slug}: ${hgNoM} words carry hg without its M`);
  if (hgNotHeld) note(l3, `${slug}: ${hgNotHeld} words carry hg credited to a source the store does not hold`);
  if (t.counts.hg !== hg || t.counts.ld !== ld) note(l3, `${slug}: receipt says hg ${t.counts.hg} / ld ${t.counts.ld}, the zone carries ${hg} / ${ld}`);
  hgAll += hg; ldAll += ld;
  // L8 — the parts, and the finding they stand on
  {
    const wit = (t.pieces || {}).witnesses || {};
    if (!t.pieces || !Object.keys(wit).length) note(l8, `${slug}: the receipt records no piece witnesses`);
    for (const [field, w] of Object.entries(wit)) {
      const src = Object.values(store.index.m_sources || {}).find((m) => m.label === w.label);
      if (!src) note(l8, `${slug}: ${field} names ${String(w.label).slice(0, 40)}…, which the store does not carry`);
      else if (src.licensePosture !== w.licence) note(l8, `${slug}: ${field} says ${w.licence}, the store says ${src.licensePosture}`);
    }
    let pc = 0, pieces = 0, bare = 0;
    for (const sec of z.sections || []) for (const w of sec.words || []) {
      if (w.mark) continue;
      const ks = w.w ? w.w.map((r) => r.k).filter(Boolean) : w.k ? [w.k] : [];
      if (!ks.length) continue;
      const answered = ks.some((k) => z.gloss[k]) || !!(w.h && z.gloss[w.h]);
      if (!answered) bare += 1;
      if (!w.pc) continue;
      pc += 1; pieces += w.pc.length;
      // the whole of the rule, on the file: only on a word nothing answers,
      // every piece with a role and a witness, and the line still bare
      if (answered) note(l8, `${slug}: ${sec.label} carries parts on a word the catalog answers`);
      if (!w.pc.length) note(l8, `${slug}: ${sec.label} carries an empty parts list`);
      for (const x of w.pc) {
        if (!ROLES.has(x.r)) note(l8, `${slug}: ${sec.label} has a piece with role ${JSON.stringify(x.r)}`);
        if (!x.s) note(l8, `${slug}: ${sec.label} has a piece with no Hebrew`);
        if (!x.t && !x.m) note(l8, `${slug}: ${sec.label} has a piece no witness answers for`);
      }
    }
    const c = t.counts || {};
    if (c.pc !== pc || c.pc_pieces !== pieces) note(l8, `${slug}: receipt says ${c.pc} words / ${c.pc_pieces} pieces, the zone carries ${pc} / ${pieces}`);
    if (c.bare !== bare) note(l8, `${slug}: receipt says ${c.bare} bare words, the zone carries ${bare}`);
    pcAll += pc; pcPieces += pieces; bareAll += bare;
  }
  // L4
  const routes = s.routes || {}, grades = s.grades || {};
  let badLen = 0, badFirst = 0;
  // since the pointing grade (now pointing-grade-rule-v4) a leader rests on
  // the row's own grade where the store row carries its headwords, and on
  // the lattice card's grade where it does not — so the tier a leader leads
  // must exist among the
  // key's cards OR among the key's store rows graded by their own headwords
  // against this surface. The sidecar says which rule it was projected under.
  const rowGraded = !!(s.first_under && s.first_under.row_grade);
  for (const [surface, gr] of Object.entries(grades)) {
    const r = routes[gr.k];
    if (!r || r.f.length !== gr.g.length) { badLen += 1; continue; }
    if (!/^[mnx-]*$/u.test(gr.g)) badLen += 1;
    if ((gr.n || []).some((ix) => ix >= r.f.length)) badFirst += 1;
    const own = rowGraded ? new Set((store.routesFor(gr.k) || []).filter((row) => store.index.m_sources[row[3]]).map((row) => gradeRow(row, surface)).filter((g) => g !== "-")) : new Set();
    const has = (ch) => gr.g.includes(ch) || own.has(ch);
    // a first-under entry is [reading, source label, licence key, year]:
    // the reading is one the card would group, its witness is a source the
    // store holds, and the tier it leads must exist among the key's cards
    for (const [ch, first] of Object.entries(gr.o || {})) {
      if (first === null) continue;
      // l and la carry their carriers as a fifth element: ids the store
      // holds, at least one, la's disjoint from l's (la is the leader with
      // l's carriers out); la stands only beside a leader
      const withBy = ch === "l" || ch === "la";
      if (!Array.isArray(first) || first.length !== (withBy ? 5 : 4) || !String(first[0] || "").trim() || !labels.has(first[1])) badFirst += 1;
      else if (withBy && (!Array.isArray(first[4]) || !first[4].length || first[4].some((id) => !store.index.m_sources[id]))) badFirst += 1;
      else if (ch === "la" && (!Array.isArray(gr.o.l) || !Array.isArray(gr.o.l[4]) || gr.o.l[4].some((id) => first[4].includes(id)))) badFirst += 1;
      // the tier a leader leads must exist among the key's cards. The two
      // masorah filter leaders lead a set, not a tier: strict needs a match
      // card; lenient needs any card that is not a mismatch, and an ungraded
      // row counts, so only an all-mismatch grade string refuses it
      // strict keeps only rows graded m, so its leader implies an m card.
      // Lenient keeps ungraded rows too — store rows the lattice never
      // carded — so an all-mismatch grade string can still have a lenient
      // leader; there is nothing in g alone that refuses it. The first
      // draft refused it and was wrong at 92 surfaces across three books.
      else if (ch === "s" && !has("m")) badFirst += 1;
      else if (!["c", "l", "la", "s"].includes(ch) && !has(ch)) badFirst += 1;
    }
  }
  // L4b — who a leader is credited to
  {
    let notACarrier = 0, notTheOldest = 0;
    const WHOLE_POOL = new Set(["m", "x", "c"]);
    const judge = (k, ch, first) => {
      if (!Array.isArray(first)) return;
      leadersHeld += 1;
      const carriers = store.carriersOf(store.routesFor(k) || [], first[0]);
      if (!carriers.some((row) => labelOfRow(row) === first[1] && yearOfRow(row) === (first[3] ?? null))) { notACarrier += 1; return; }
      if (WHOLE_POOL.has(ch) && !(labelOfRow(carriers[0]) === first[1] && yearOfRow(carriers[0]) === (first[3] ?? null))) notTheOldest += 1;
    };
    for (const gr of Object.values(grades)) {
      for (const [ch, first] of Object.entries(gr.o || {})) judge(gr.k, ch, first);
      for (const own of Object.values(gr.v || {})) judge(gr.k, "c", own && own.c);
    }
    if (notACarrier) note(l4b, `${slug}: ${notACarrier} leaders credited to a row that does not carry the reading`);
    if (notTheOldest) note(l4b, `${slug}: ${notTheOldest} leaders of a whole-pool order credited to another carrier than the oldest`);
  }
  // L4c — the verse's own citations, as written
  {
    let malformed = 0;
    for (const gr of Object.values(grades)) {
      const r = routes[gr.k];
      for (const own of Object.values(gr.v || {})) {
        versesOwn += 1;
        const ok = own && Array.isArray(own.n) && r && own.n.every((ix) => Number.isInteger(ix) && ix >= 0 && ix < r.f.length)
          && JSON.stringify(own.n) !== JSON.stringify(gr.n || [])
          && (own.c === null || (Array.isArray(own.c) && own.c.length === 4 && labels.has(own.c[1])))
          && (own.n.length > 0 || own.c === null);
        if (!ok) malformed += 1;
      }
    }
    if (malformed) note(l4c, `${slug}: ${malformed} per-verse entries are not a list of the key's cards that differs from the first verse's, with a leader the store holds`);
  }
  // ... and against the lattice itself, place by place, where it is here
  if (LATTICE && existsSync(join(LATTICE, `positions-${slug}-v12.jsonl.gz`))) {
    booksRead += 1;
    let wrong = 0;
    const rl = createInterface({ input: createReadStream(join(LATTICE, `positions-${slug}-v12.jsonl.gz`)).pipe(createGunzip()), crlfDelay: Infinity });
    for await (const line of rl) {
      if (!line) continue;
      const p = JSON.parse(line);
      if (p.c0 !== "ON") continue;
      for (const m of p.megacompspan || []) {
        const gr = grades[m.surface], rg = m.route_grades, r = routes[m.key];
        if (!gr || !rg || !r) continue;
        placesRead += 1;
        const theirs = (rg.names_this_verse || []).filter((ix) => ix < r.f.length);
        const ours = gr.v && Object.prototype.hasOwnProperty.call(gr.v, p.ref) ? gr.v[p.ref].n : (gr.n || []);
        if (JSON.stringify(theirs) !== JSON.stringify(ours)) wrong += 1;
      }
    }
    if (wrong) note(l4c, `${slug}: ${wrong} graded word places read another verse's citing cards`);
  }
  if (badLen) note(l4, `${slug}: ${badLen} surfaces grade a different number of cards than their key carries`);
  if (badFirst) note(l4, `${slug}: ${badFirst} first-under entries name no card or own-graded row of their key`);
  if (s.counts.surfaces_graded !== Object.keys(grades).length || s.counts.keys !== Object.keys(routes).length) note(l4, `${slug}: sidecar counts do not match its tables`);
  surfacesAll += Object.keys(grades).length;
  // L5 — the join, sampled over every key the sidecar carries
  let rows = 0, hits = 0;
  for (const [k, r] of Object.entries(routes)) {
    const fps = new Set(r.f);
    const srows = store.routesFor(k);
    if (!srows) continue;
    for (const row of srows) {
      const m = store.index.m_sources[row[3]]; if (!m) continue;
      rows += 1; if (fps.has(fnv1a(`${row[1]}|${m.label}`))) hits += 1;
    }
  }
  joinRows += rows; joinHits += hits;
  if (!hits) note(l5, `${slug}: no store row finds a lattice card`);
  // L6
  const src = s.source || {};
  for (const part of ["positions", "routes"]) {
    const a = src[part] && src[part].sha256, b = t.source && t.source[part] && t.source[part].sha256;
    if (!a || !/^[0-9a-f]{64}$/u.test(a) || a !== b) note(l6, `${slug}: ${part} sha256 differs between sidecar and receipt`);
  }
  if (src.candidate_only !== true) note(l6, `${slug}: the sidecar does not say the lattice is candidate-only`);
}

check("L2  every layered zone carries the receipt, and its sidecar is beside it, pinned, of the named schema", !l2.length, l2.length ? few(l2) : `${layered.length} sidecars, each pinned`);
check("L3  hg stands only on a word with a headword, with its M, a source the store holds; the counts are recounted", !l3.length, l3.length ? few(l3) : `${hgAll.toLocaleString()} headword readings, ${ldAll.toLocaleString()} Leningrad differences, as recorded`);
check("L4  every graded surface grades its key's cards in the lattice's order; every first-under names a card", !l4.length, l4.length ? few(l4) : `${surfacesAll.toLocaleString()} pointed surfaces graded`);
check("L4b every leader is credited to a carrier of its reading by the store's own rule, and under a whole-pool order to the oldest", !l4b.length,
  l4b.length ? few(l4b) : `${leadersHeld.toLocaleString("en-US")} leaders`);
check("L4c the citations are the verse's: every per-verse entry lists its key's cards, differs from the first verse's, and names a held leader", !l4c.length,
  l4c.length ? few(l4c) : `${versesOwn.toLocaleString("en-US")} verses carry their own list beside their surface's first${booksRead ? `; ${placesRead.toLocaleString("en-US")} graded word places on ${booksRead} books read against the lattice, each its own verse's cards` : ""}`);
if (!booksRead) console.log(`  --  L4c's second half was not judged here: the corpus lane's lattice is not on this machine (--lattice <dir> or LATTICE_DIR), so no word place was read against the lattice's own list for its verse`);
else if (booksRead < layered.length) console.log(`  --  L4c's second half was not judged for ${layered.length - booksRead} of ${layered.length} books: their positions file is not in ${LATTICE}`);
check("L5  the fingerprints join the store", !l5.length && joinHits > 0, l5.length ? few(l5) : `${joinHits.toLocaleString()} of ${joinRows.toLocaleString()} store rows find their lattice card (${(100 * joinHits / Math.max(1, joinRows)).toFixed(1)}%); the rest sort after the graded ones, never dropped`);
check("L6  the sidecar's sources are the sealed lattice files, by hash, as the receipt records them", !l6.length, l6.length ? few(l6) : "positions and routes sha256 agree on every layered zone");
check("L8  the parts ride only on a word nothing answers, each piece named and witnessed", !l8.length,
  l8.length ? `${l8.filter(Boolean).length}: ${few(l8)}`
    : `${pcAll.toLocaleString()} of ${bareAll.toLocaleString()} words with no English of their own carry ${pcPieces.toLocaleString()} pieces; every other word carries none`);
const reader = existsSync(join(K3, "zone.html")) ? readFileSync(join(K3, "zone.html"), "utf8") : "";
check("L7  the reader's positions read the layer", /needs: "lattice"/u.test(reader) && /emitted_from\.toggles\.lattice/u.test(reader) && /const latticeReady = /u.test(reader),
  "zone.html: DEF_POS needs the lattice, liveness reads emitted_from.toggles.lattice, the sidecar is fetched on demand");
// and the parts are drawn as parts: the card renders them, and no code path
// joins them into the line — the reading a bare word shows is still nothing
check("  and it draws the parts without ever joining them into a reading",
  /const renderParts = /u.test(reader) && /not a reading of the word/u.test(reader) && !/\.pc\b[^\n]*join\(/u.test(reader),
  "zone.html: renderParts draws each piece with its role and both witnesses; nothing joins pc into a line");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
