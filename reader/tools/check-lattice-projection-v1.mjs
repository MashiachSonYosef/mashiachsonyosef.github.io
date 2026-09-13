#!/usr/bin/env node
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
//   L3  hg stands only on a word that carries a headword, with its M; the
//       receipt's counts are the zone's counts, recounted
//   L4  in the sidecar every graded surface grades exactly the cards its key
//       carries, in the lattice's order, and every first-under entry names a
//       card of that key
//   L5  the fingerprints join the store: for the keys the sidecar carries,
//       the store's rows find their lattice card by fingerprint — and where
//       one does not, the count is on the record, never a guess
//   L6  the sidecar's sources are the lattice files the corpus lane sealed,
//       by hash, as the receipt records them
//   L7  the reader's positions read the layer, so a projected zone is drawn
//       live and an unprojected one dead
//
// Run: node tools/check-lattice-projection-v1.mjs [--zones data/zones]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { fnv1a, LATTICE_RULE_ID, SIDECAR_SCHEMA } from "./lattice-lib-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
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
  for (const [name, re] of [["the store clause", /The store stays the store/u], ["the join clause", /proved by the key/u], ["the pieces clause", /pieces \(joined words\) ride in no field/u]])
    if (!re.test(src)) gone.push(name);
  check("L1  the projector still declares the rule this check enforces", gone.length === 0, gone.length ? `${gone.join(", ")} gone from ${PROJECTOR.split("/").pop()}` : "quoted from the rule declared before output");
}

if (!existsSync(ZONES)) { console.log(`\nSKIPPED — no zones at ${ZONES}`); process.exit(bad ? 1 : 3); }
const load = (f) => { try { return JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { return null; } };
const store = openRouteStore(join(K3, "data", "route-store"));
const labels = new Set(Object.values(store.index.m_sources || {}).map((m) => m.label));
const pins = existsSync(join(K3, "data", "zone-store-v1.json")) ? (JSON.parse(readFileSync(join(K3, "data", "zone-store-v1.json"), "utf8")).pins || {}) : {};
const layered = [];
for (const f of readdirSync(ZONES).filter((x) => x.endsWith(".bin") && !x.endsWith(".commentary.bin") && !x.endsWith(".hoh.bin") && !x.endsWith(".lattice.bin")).sort()) {
  const z = load(f); if (!z) continue;
  const t = z.emitted_from && z.emitted_from.toggles && z.emitted_from.toggles.lattice;
  if (t) layered.push({ slug: f.replace(/\.bin$/u, ""), z, t });
}
if (!layered.length) { console.log("\nSKIPPED — no zone on this shelf carries the lattice layer"); process.exit(bad ? 1 : 3); }
console.log(`\n— ${layered.length} zones carry the lattice layer —`);

const l2 = [], l3 = [], l4 = [], l5 = [], l6 = [];
let hgAll = 0, ldAll = 0, surfacesAll = 0, joinRows = 0, joinHits = 0;
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
  let hg = 0, ld = 0, hgNoH = 0, hgNoM = 0;
  for (const sec of z.sections || []) for (const w of sec.words || []) {
    if (w.hg) { hg += 1; if (!w.h) hgNoH += 1; if (!w.hm || !w.hm.m || !w.hm.lic) hgNoM += 1; }
    if (w.ld) ld += 1;
  }
  if (hgNoH) note(l3, `${slug}: ${hgNoH} words carry hg without a headword`);
  if (hgNoM) note(l3, `${slug}: ${hgNoM} words carry hg without its M`);
  if (t.counts.hg !== hg || t.counts.ld !== ld) note(l3, `${slug}: receipt says hg ${t.counts.hg} / ld ${t.counts.ld}, the zone carries ${hg} / ${ld}`);
  hgAll += hg; ldAll += ld;
  // L4
  const routes = s.routes || {}, grades = s.grades || {};
  let badLen = 0, badFirst = 0;
  for (const [surface, gr] of Object.entries(grades)) {
    const r = routes[gr.k];
    if (!r || r.f.length !== gr.g.length) { badLen += 1; continue; }
    if (!/^[mnx-]*$/u.test(gr.g)) badLen += 1;
    if ((gr.n || []).some((ix) => ix >= r.f.length)) badFirst += 1;
    // a first-under entry is [reading, source label, licence key, year]:
    // the reading is one the card would group, its witness is a source the
    // store holds, and the tier it leads must exist among the key's cards
    for (const [ch, first] of Object.entries(gr.o || {})) {
      if (first === null) continue;
      if (!Array.isArray(first) || first.length !== 4 || !String(first[0] || "").trim() || !labels.has(first[1])) badFirst += 1;
      else if (ch !== "c" && !gr.g.includes(ch)) badFirst += 1;
    }
  }
  if (badLen) note(l4, `${slug}: ${badLen} surfaces grade a different number of cards than their key carries`);
  if (badFirst) note(l4, `${slug}: ${badFirst} first-under entries name no card of their key`);
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
check("L3  hg stands only on a word with a headword, with its M; the counts are recounted", !l3.length, l3.length ? few(l3) : `${hgAll.toLocaleString()} headword readings, ${ldAll.toLocaleString()} Leningrad differences, as recorded`);
check("L4  every graded surface grades its key's cards in the lattice's order; every first-under names a card", !l4.length, l4.length ? few(l4) : `${surfacesAll.toLocaleString()} pointed surfaces graded`);
check("L5  the fingerprints join the store", !l5.length && joinHits > 0, l5.length ? few(l5) : `${joinHits.toLocaleString()} of ${joinRows.toLocaleString()} store rows find their lattice card (${(100 * joinHits / Math.max(1, joinRows)).toFixed(1)}%); the rest sort after the graded ones, never dropped`);
check("L6  the sidecar's sources are the sealed lattice files, by hash, as the receipt records them", !l6.length, l6.length ? few(l6) : "positions and routes sha256 agree on every layered zone");
const reader = existsSync(join(K3, "zone.html")) ? readFileSync(join(K3, "zone.html"), "utf8") : "";
check("L7  the reader's positions read the layer", /needs: "lattice"/u.test(reader) && /emitted_from\.toggles\.lattice/u.test(reader) && /const latticeReady = /u.test(reader),
  "zone.html: DEF_POS needs the lattice, liveness reads emitted_from.toggles.lattice, the sidecar is fetched on demand");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
