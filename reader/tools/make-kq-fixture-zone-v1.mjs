#!/usr/bin/env node
// Synthesis lane · a fixture zone from the MAM presentation candidate bundle
//
// The construction lane's sealed handoff carries, per source-marked site,
// the exact MAM carrier and its branch selectors. This builds a small zone
// from those rows — every word a kq site, every surface the carrier as MAM
// writes it, every branch carrying its own lexical key — so the reader's
// presentation and the pair-law gate can be proven against source-exact
// data BEFORE any promotion. The fixture is scratch: it is written under
// build/, never under data/zones, so the zones-on-disk law can never serve
// it. Candidate ids ride along verbatim; nothing here is current.
//
// GUARDS: kq-rule-v1-both-halves-as-written
//
// Run: node tools/make-kq-fixture-zone-v1.mjs --bundle <dir> [--out build/kq-fixture/kq-fixture-v1.bin]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { readSpanSlice, cellsOf, SPAN_RULE_ID } from "./span-slice-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const BUNDLE = arg("bundle", null);
const OUT = arg("out", join(K3, "build", "kq-fixture", "kq-fixture-v1.bin"));
// A fixture that carries only the pair proves only the pair. The layers
// under a word — its component system and the catalog's readings — are
// what the card is mostly made of, and a presentation proof without them
// shows an empty card and calls it a rendering. Same store, same span
// slice, same derivation as a served zone; the fixture stays scratch.
const SPANS = arg("spans", null);
const STORE_DIR = arg("store", join(K3, "data", "route-store"));
// The bundle has carried its rows under two names and two shapes across
// candidate generations. Both are read here, and a bundle that is PRESENT
// but carries neither is a loud failure rather than a quiet skip — the
// silent skip is how this tool sat broken against a renamed file while its
// check reported nothing at all.
const ROW_FILES = ["mam-presentation-records-candidate-v1.jsonl", "mam-reader-overlay-v1.jsonl"];
const rowsPath = BUNDLE ? ROW_FILES.map((f) => join(BUNDLE, "candidate", f)).find(existsSync) : null;
if (!BUNDLE || !existsSync(join(BUNDLE, "candidate"))) {
  console.log("the MAM presentation candidate bundle is not here — nothing to build a fixture from");
  process.exit(3);
}
if (!rowsPath) {
  console.error(`REFUSED — ${BUNDLE}/candidate carries none of: ${ROW_FILES.join(", ")}`);
  process.exit(2);
}

const rows = readFileSync(rowsPath, "utf8")
  .split("\n").filter(Boolean).map((l) => JSON.parse(l));
const seal = JSON.parse(readFileSync(join(BUNDLE, "candidate", "closed-world-seal-v1.json"), "utf8"));

// K key for a branch: its lexical surface with the marks the K rule strips.
// The chain's K is W normalized; for the fixture the lexical surface inside
// the source's own delimiters is the branch's key, marks removed.
const kOf = (s) => String(s).normalize("NFC").replace(/[֑-ׇ]/g, "");

const sections = [];
let siteCount = 0, pairCount = 0;
for (const r of rows) {
  const pres = r.presentation || r;
  const p = pres.exact_mam_carrier;
  const carrier = p.exact_presentation_text;
  const word = { s: carrier };
  const branchRows = pres.branch_selectors || pres.branches || [];
  if (branchRows.length) {
    // the branches, in the carrier's own order, each with its exact printed
    // text and its own lexical key — and the pair the gate holds to
    const branches = branchRows.map((b) => ({
      s: b.exact_branch_presentation_text || b.exact_presentation_text,
      k: kOf(b.exact_lexical_surface_inside_source_delimiters || b.lexical_surface_inside_source_delimiters),
      role: b.role,
    }));
    // the carrier must be exactly the branches in order with the source's
    // own separators — refuse a fixture that would retype the text
    let probe = carrier;
    for (const b of branches) {
      const at = probe.indexOf(b.s);
      if (at === -1) { console.error(`REFUSED — ${r.unit_id}: branch text not found inside the carrier`); process.exit(2); }
      probe = probe.slice(at + b.s.length);
    }
    const q = branches.find((b) => b.role === "QERE");
    const k = branches.find((b) => b.role === "KETIV");
    if (!q || !k) { console.error(`REFUSED — ${r.unit_id}: a pair without both halves`); process.exit(2); }
    word.w = branches;
    word.kq = { q: q.s, k: k.s, order: p.presentation_order };
    pairCount += 1;
  } else {
    // a trivial site: the carrier is one witnessed form, no branches
    word.k = kOf(carrier);
  }
  siteCount += 1;
  sections.push({ unit: r.unit_id, node: r.work_id, label: r.unit_id.split("-").slice(-2).join(":"), words: [word] });
}

// ---- the layers under the word, exactly as a served zone derives them ----
const keysNeeded = new Set();
for (const sec of sections) for (const w of sec.words) {
  if (w.k) keysNeeded.add(w.k);
  for (const b of (w.w || [])) if (b.k) keysNeeded.add(b.k);
}
const span = SPANS ? await readSpanSlice(SPANS, keysNeeded) : null;
const cellSurfaces = new Set(keysNeeded);
if (span) for (const [, sp] of span.spans) for (const c of cellsOf(sp.s)) cellSurfaces.add(c.surface);
const store = openRouteStore(STORE_DIR);
const { table: gloss } = store.tableFor([...cellSurfaces]);
const spanRoles = [], spanRules = [], spanConf = [];
const intern = (arr, v) => { let i = arr.indexOf(v); if (i < 0) { i = arr.length; arr.push(v); } return i; };
const spans = {};
if (span) for (const [k, sp] of span.spans)
  spans[k] = [sp.s, sp.r.map((r) => intern(spanRoles, r)), intern(spanRules, sp.rule), intern(spanConf, sp.conf)];

const zone = {
  schema_version: "KQ_FIXTURE_ZONE_V1",
  rule_id: "kq-rule-v1-both-halves-as-written",
  work: "", // no licensed record backs an English name; the address reads plainly
  work_he: "",
  byline: "a fixture from the MAM presentation integration candidate — candidate only, no current effect",
  route: "KQ_FIXTURE__CANDIDATE_ONLY",
  emitted_from: {
    kq_policy: "BOTH_HALVES_AS_WRITTEN",
    current_effect: "NONE",
    // the receipt fields a zone page prints, filled with the candidate's own
    // identities — the seal is the oracle a fixture honestly has
    acquisition: {
      source: "Miqra According to the Masorah — presentation integration candidate bundle, sealed",
      payload_sha256_transferred: seal.seal_sha256 || seal.sha256 || "candidate-seal",
    },
    identity_oracle: {
      bridge_sha256: seal.seal_sha256 || seal.sha256 || "candidate-seal",
      sealed_units: sections.length,
      first_c0_numeric_id: 0,
      last_c0_numeric_id: 0,
    },
    license_receipts: {
      per_occurrence: "candidate bundle rights ride per site; nothing is served",
      work_activation: "candidate only — no current effect",
    },
  },
  counts: { sections: sections.length, words: siteCount, kq_pairs: pairCount,
    forms_with_a_component_system: Object.keys(spans).length,
    cell_surfaces_read: Object.keys(gloss).length },
  span_roles: spanRoles,
  span_rules: spanRules,
  span_conf: spanConf,
  spans,
  gloss,
  sections,
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, gzipSync(Buffer.from(JSON.stringify(zone), "utf8")));
console.log(`${OUT.split("/").slice(-1)[0]}: ${siteCount} sites (${pairCount} pairs) from the sealed candidate — scratch, never served`);
