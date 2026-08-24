// Synthesis lane · licence-posture-name-rule-v1-the-record-names-the-licence
//
// One projection of tools/declarations-v1.json for the pages: per posture,
// the declared name, whether export is permitted, what attribution is owed,
// and the obligations that ride along. The reader fetches this file; the
// door embeds it at build time. Neither re-derives any of it from the
// letters of the posture's key — the record names the licence, or the key
// is printed verbatim and the export is refused, which is the record's own
// default for the undeclared.
import { readFileSync, writeFileSync } from "node:fs";

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const DECL = arg("declarations", "tools/declarations-v1.json");
const OUT = arg("out", "data/license-postures-v1.json");

const d = JSON.parse(readFileSync(DECL, "utf8"));
const postures = {};
for (const [key, row] of Object.entries(d.export_postures)) {
  if (!row.name || typeof row.name !== "string")
    throw new Error(`posture without a declared name: ${key} — a projection may not invent one`);
  postures[key] = {
    name: row.name,
    export: row.export,
    attribution: row.attribution,
    obligations: row.obligations,
  };
}

const doc = {
  schema_version: "LICENSE_POSTURES_V1",
  emitted_by: "tools/emit-license-postures-v1.mjs",
  derived_from: DECL,
  rule: "A licence chip prints the name this record carries for its posture; the export gate asks this record for permission and obligations. A posture absent from this record is named by its key, verbatim, and is not exported — no licence is as absolute as a forbidding one.",
  undeclared: {
    reading: d.defaults.reading,
    export: d.defaults.export,
  },
  postures,
};
writeFileSync(OUT, JSON.stringify(doc, null, 1) + "\n");
console.log(`${OUT}: ${Object.keys(postures).length} postures projected from ${DECL}`);
