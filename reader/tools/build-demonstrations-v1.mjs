#!/usr/bin/env node
// GUARDS: rule-demonstration-rule-v1-a-demonstration-is-the-reader-on-a-passage-never-a-drawing-of-one
// LEDGER: C0
//
// EIGHT RULES, EIGHT PASSAGES, ONE READER.
//
// The frame carries eight rules about what a word of a book is. Seven of them
// could not be shown on this site, because the books that carry their marks
// are held: markup bled into their text, or the source resolved a reading
// silently, or nobody holds the note at all. The answer for a year was a
// drawing — a page that imitated the reader's card with typed Hebrew inside
// it. A drawing of a card demonstrates a drawing.
//
// This tool builds the other thing. For each rule it takes a passage from the
// record, runs it through the SAME builder every served book goes through,
// and writes a zone the SAME reader opens with the SAME card. Nothing is
// imitated. What differs between a demonstration and a book is only this:
//
//   * a demonstration is branded an instrument, in its own file, so that no
//     gate mistakes it for a work and no reader is told it is one;
//   * its rows are either CARRIED from a real source, named and hashed, or
//     TYPED, and the record says which for every rule, out loud, on the page;
//   * a typed rule names WHERE THE WIRE GOES: the field in the corpus lane's
//     coming reissue that will carry the real thing, so the day it lands the
//     demonstration is replaced by the book rather than repaired.
//
// The passages are short on purpose. A demonstration is a place to press one
// word and see what the frame says about it, not a place to read.
//
// Run: node tools/build-demonstrations-v1.mjs [--record data/rule-demonstrations-v1.json]
//        [--zones data/zones] [--work build/rule-demonstrations] [--only <rule id>]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); const v = i > -1 ? process.argv[i + 1] : undefined; return v && !v.startsWith("--") ? v : d; };
const RECORD = arg("record", join(K3, "data", "rule-demonstrations-v1.json"));
const ZONES = arg("zones", join(K3, "data", "zones"));
const WORKDIR = arg("work", join(K3, "build", "rule-demonstrations"));
const ONLY = arg("only", null);
const die = (code, detail = "") => { console.error(`${code}${detail ? `: ${detail}` : ""}`); process.exit(1); };
const sha = (b) => createHash("sha256").update(b).digest("hex");

const rec = JSON.parse(readFileSync(RECORD, "utf8"));
if (rec.schema_version !== "RULE_DEMONSTRATIONS_V1") die("RECORD_SCHEMA", rec.schema_version);
const RULE_ID = rec.rule_id;

// The nine rights fields a demonstration declares. They are not resolved from
// any binding, because a demonstration is not a work and no licensor spoke
// for it; they are the instrument's own declaration, and the source they
// carry (RIGHTS_FIXTURE__NEVER_SERVABLE) says so to every gate that reads it.
// Where the passage is carried from a real source, the record carries that
// source's own credit beside it and the page prints it — carrying somebody's
// ink into a demonstration does not suspend their licence.
const INSTRUMENT_RIGHTS = {
  reader_display_axis: "ALLOW",
  public_distribution_axis: "ALLOW_WITH_OBLIGATIONS",
  attribution_required: "POLICY_DEPENDENT",
  noncommercial_required: "FALSE_OR_NOT_ESTABLISHED",
  share_alike_required: "FALSE_OR_NOT_ESTABLISHED",
  no_derivatives_required: "FALSE_OR_NOT_ESTABLISHED",
  normalized_license_class: "PUBLIC_DOMAIN",
  license_version: "UNSPECIFIED",
  terminal_resolution_state: "RESOLVED",
};

mkdirSync(WORKDIR, { recursive: true });
const built = [];
for (const r of rec.rules) {
  if (ONLY && r.id !== ONLY) continue;
  const slug = `fixture-rule-${r.id}`;
  const work = `demonstration/${r.id}`;
  const rows = r.rows || [];
  if (!rows.length) die("RULE_HAS_NO_ROWS", r.id);
  // one unit, named so the coordinate parser reads it: <slug>-<chapter>-<section>
  const unit = `${r.id}-1-1`;

  // ---- the bridge slice. Seven columns, no quoted fields, one unit. -------
  const bridgeCsv = `work_id,unit_id,c0_rows,min_c0_numeric_id,max_c0_numeric_id,b_id,n_id\n`
    + `${work},${unit},${rows.length},1,${rows.length},B-DEM-${r.n},N-DEM-${r.n}\n`;
  if (bridgeCsv.includes('"')) die("BRIDGE_QUOTED", r.id);
  const bridgePath = join(WORKDIR, `${slug}-bridge.csv.gz`);
  writeFileSync(bridgePath, gzipSync(Buffer.from(bridgeCsv, "utf8")));

  // ---- the serve. The same shape every route emits, branded. -------------
  // Positions run 1..n in the demonstration's own space. The rows' real
  // home, where they have one, is named in the oracle rather than borrowed
  // as an id: two things may not claim one position, and a demonstration
  // claims none of the corpus's.
  const carried = r.carried_from || null;
  // ROW BY ROW, CARRIED OR TYPED. The honest middle case: a passage whose ink
  // is carried from a real source, into which one mark had to be typed
  // because no source this project holds writes it there. The inverted nunim
  // are exactly that — the twenty words they enclose are Numbers as the body
  // has it, and the two brackets are absent from every shard we hold. The
  // zone carries which positions were typed, so the page can say so on the
  // word rather than in a footnote nobody reads.
  const typedRows = rows.map((row, i) => (row && row.typed ? i : -1)).filter((i) => i >= 0);
  const oracle = {
    rule: r.id,
    // AN OVERLAY IS A RECORD OVER THE INK, NEVER IN IT. The eighth rule's
    // distinction arrives in the sources we hold as markup inside the text,
    // which the builder refuses and is right to refuse: a tag in the ink is a
    // tag in the book. The corpus lane's reissue records the run instead —
    // start row, length, kind — before anything is stripped, and that is the
    // shape carried here: the body's own ink, with the run recorded over it.
    ...(r.overlays && r.overlays.length ? { overlays: r.overlays } : {}),
    ...(typedRows.length ? { typed_rows: typedRows, typed_rows_why: r.typed_rows_why || "no source this project holds writes this mark here" } : {}),
    ...(carried
      ? { carried: {
          source: carried.source, kind: carried.kind, work_id: carried.work_id, unit_id: carried.unit_id,
          first_c0: carried.first_c0, last_c0: carried.last_c0, sha256: carried.sha256 || null,
          ...(carried.receipt_status ? { receipt_status: carried.receipt_status } : {}),
          ...(carried.credit ? { credit: carried.credit } : {}),
        } }
      : { typed: { why: (r.typed || {}).why || "the sources this project holds carry no instance of this mark", where_the_wire_goes: (r.typed || {}).where_the_wire_goes || null } }),
  };
  const provenance = {
    rule: RULE_ID,
    route: "DEMONSTRATION_PASSAGE__INSTRUMENT",
    fixture: true,
    test_instrument: {
      is: `a demonstration of the frame's ${r.name_en} rule, not a work`,
      generator: "tools/build-demonstrations-v1.mjs",
      no_component_layer_because: "a demonstration passage has no sealed component template behind it; it demonstrates one rule and offers whole forms only",
    },
    demonstration_oracle: oracle,
    identity: { bridge: `${slug}-bridge.csv.gz`, units: 1, c0_first: 1, c0_last: rows.length },
    rights: {
      source: "RIGHTS_FIXTURE__NEVER_SERVABLE",
      basis: "an instrument's declared rights; no licensor spoke for a demonstration, and nothing here is served as a work"
        + (carried && carried.credit ? " — the passage is carried, and its source's own credit rides on the page" : ""),
      sha256: sha(Buffer.from(JSON.stringify(INSTRUMENT_RIGHTS), "utf8")),
      ...(carried && carried.credit ? { credit: carried.credit } : {}),
    },
  };
  const lines = [JSON.stringify({ provenance })];
  rows.forEach((row, i) => {
    lines.push(JSON.stringify({
      c0_numeric_id: i + 1,
      status: "FOUND_EXACT",
      location: { local_unit_id: unit },
      token_ordinal_in_unit: i + 1,
      exact_surface_form: typeof row === "string" ? row : row.hebrew,
      visible_in_hebrew_reader: true,
      reader_display_axis: INSTRUMENT_RIGHTS.reader_display_axis,
      public_distribution_axis: INSTRUMENT_RIGHTS.public_distribution_axis,
      attribution_required: INSTRUMENT_RIGHTS.attribution_required,
      noncommercial_required: INSTRUMENT_RIGHTS.noncommercial_required,
      share_alike_required: INSTRUMENT_RIGHTS.share_alike_required,
      no_derivatives_required: INSTRUMENT_RIGHTS.no_derivatives_required,
      rights_authority: {
        normalized_license_class: INSTRUMENT_RIGHTS.normalized_license_class,
        license_version: INSTRUMENT_RIGHTS.license_version,
        terminal_resolution_state: INSTRUMENT_RIGHTS.terminal_resolution_state,
      },
    }));
  });
  const servePath = join(WORKDIR, `${slug}.ndjson`);
  writeFileSync(servePath, `${lines.join("\n")}\n`);

  // ---- the zone, by the builder every book goes through ------------------
  const out = join(ZONES, `${slug}.bin`);
  const args = ["--serve", servePath, "--bridge", bridgePath, "--store", join(K3, "data", "route-store"),
    "--work", work, "--title", r.title_en || r.name_en, "--out", out,
    "--stamp", rec.built_on || rec.authored_on, "--coord-labels", "passage,word"];
  if (r.title_he) args.push("--title-he", r.title_he);
  try {
    const said = execFileSync("node", [join(HERE, "build-zone.mjs"), ...args], { cwd: K3, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
    const first = said.trim().split("\n")[0];
    console.log(`  ${r.id.padEnd(14)} ${r.tier.padEnd(28)} ${first.split(": ").slice(1).join(": ") || first}`);
    built.push({ rule: r.id, slug, rows: rows.length, tier: r.tier });
  } catch (e) {
    const said = String(e.stderr || e.message).split("\n").map((l) => l.trim()).find((l) => /^[A-Z][A-Z_]+/.test(l)) || String(e.message).slice(0, 120);
    die("DEMONSTRATION_REFUSED", `${r.id}: ${said}`);
  }
}
console.log(`\n${built.length} demonstration zone(s) built into ${ZONES}`);
console.log(`  carried: ${rec.rules.filter((r) => r.carried_from).map((r) => r.id).join(", ") || "none"}`);
console.log(`  typed:   ${rec.rules.filter((r) => !r.carried_from).map((r) => r.id).join(", ") || "none"}`);
