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

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const BUNDLE = arg("bundle", null);
const OUT = arg("out", join(K3, "build", "kq-fixture", "kq-fixture-v1.bin"));
if (!BUNDLE || !existsSync(join(BUNDLE, "candidate", "mam-reader-overlay-v1.jsonl"))) {
  console.log("the MAM presentation candidate bundle is not here — nothing to build a fixture from");
  process.exit(3);
}

const rows = readFileSync(join(BUNDLE, "candidate", "mam-reader-overlay-v1.jsonl"), "utf8")
  .split("\n").filter(Boolean).map((l) => JSON.parse(l));
const seal = JSON.parse(readFileSync(join(BUNDLE, "candidate", "closed-world-seal-v1.json"), "utf8"));

// K key for a branch: its lexical surface with the marks the K rule strips.
// The chain's K is W normalized; for the fixture the lexical surface inside
// the source's own delimiters is the branch's key, marks removed.
const kOf = (s) => String(s).normalize("NFC").replace(/[֑-ׇ]/g, "");

const sections = [];
let siteCount = 0, pairCount = 0;
for (const r of rows) {
  const p = r.presentation.exact_mam_carrier;
  const carrier = p.exact_presentation_text;
  const word = { s: carrier };
  if (r.presentation.branch_selectors && r.presentation.branch_selectors.length) {
    // the branches, in the carrier's own order, each with its exact printed
    // text and its own lexical key — and the pair the gate holds to
    const branches = r.presentation.branch_selectors.map((b) => ({
      s: b.exact_branch_presentation_text,
      k: kOf(b.exact_lexical_surface_inside_source_delimiters),
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
  counts: { sections: sections.length, words: siteCount, kq_pairs: pairCount },
  gloss: {},
  sections,
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, gzipSync(Buffer.from(JSON.stringify(zone), "utf8")));
console.log(`${OUT.split("/").slice(-1)[0]}: ${siteCount} sites (${pairCount} pairs) from the sealed candidate — scratch, never served`);
