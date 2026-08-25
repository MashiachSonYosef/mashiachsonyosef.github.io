#!/usr/bin/env node
// Synthesis lane · derived-work-ranges-rule-v1-the-atlas-names-every-range-so-none-is-typed
//
// Every work's C0 range, derived from the corpus atlas rather than typed.
//
// Why this exists. The typed work records carry four works' ranges by hand,
// each entry naming the day it dies. The atlas — emitted from the bridge,
// with the bridge's sha as its receipt — already carries first row and row
// count for every work the bridge records. last = first + rows − 1; the
// law of this repository is that nothing derivable is typed, so the ranges
// of the works to come are derived here, once, for the whole shelf. The
// four typed entries were reconciled against this derivation before it was
// adopted: all four match to the row.
//
// This record plans; it does not publish. A work reaches the build plan by
// its Y ledger or its typed record, exactly as before. What this record
// adds is the fleet's worth of ranges standing ready, so the day a work's
// shards arrive nothing about it needs typing.
//
// GUARDS: derived-work-ranges-rule-v1-the-atlas-names-every-range-so-none-is-typed
//
// Run: node tools/emit-derived-work-ranges-v1.mjs
//      [--atlas data/corpus-atlas-v1.json] [--out data/derived-work-ranges-v1.json]

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : join(K3, ...dflt.split("/"));
};

const ATLAS_PATH = arg("atlas", "data/corpus-atlas-v1.json");
const OUT = arg("out", "data/derived-work-ranges-v1.json");
const atlasBytes = readFileSync(ATLAS_PATH);
const atlas = JSON.parse(atlasBytes.toString("utf8"));

const works = [];
for (const [familyValue, fam] of Object.entries(atlas.families)) {
  for (const w of fam.works) {
    if (!Number.isInteger(w.c0_first) || !Number.isInteger(w.c0_rows) || w.c0_rows < 1) {
      console.error(`REFUSED — ${w.id} carries no well-formed range in the atlas`);
      process.exit(2);
    }
    works.push({
      id: w.id,
      published_as: w.id.split("/").pop(),
      family_value: familyValue,
      c0_first: w.c0_first,
      c0_last: w.c0_first + w.c0_rows - 1,
      c0_rows: w.c0_rows,
      unit_count: w.units,
    });
  }
}
works.sort((a, b) => a.c0_first - b.c0_first || (a.id < b.id ? -1 : 1));

// Two works may not claim one row. Overlap is a bridge fault worth refusing
// on, not recording.
for (let i = 1; i < works.length; i += 1) {
  if (works[i].c0_first <= works[i - 1].c0_last) {
    console.error(`REFUSED — ${works[i].id} overlaps ${works[i - 1].id} in C0`);
    process.exit(2);
  }
}

const record = {
  schema_version: "DERIVED_WORK_RANGES_V1",
  rule: "derived-work-ranges-rule-v1-the-atlas-names-every-range-so-none-is-typed",
  derived_from: {
    atlas: ATLAS_PATH.replace(/\\/g, "/").split("/").slice(-1)[0],
    atlas_schema: atlas.schema_version || null,
    atlas_sha256: createHash("sha256").update(atlasBytes).digest("hex"),
    law: "c0_last = c0_first + c0_rows - 1; adopted after reconciling every typed work record to the row",
  },
  plans_not_publishes: "a work reaches the build by its Y ledger or its typed record; this record stands the whole shelf's ranges ready so nothing needs typing when shards arrive",
  work_count: works.length,
  works,
};
writeFileSync(OUT, JSON.stringify(record, null, 1) + "\n");
console.log(`${OUT.replace(/\\/g, "/").split("/").slice(-1)[0]}: ${works.length} works, every range derived`);
