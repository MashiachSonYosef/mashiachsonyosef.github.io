// licence-name-rule-v1-the-record-names-the-licence
//
// A licence chip prints what the declarations record carries for its posture;
// the export gate asks the same record for permission and obligations. No
// page re-derives a licence's name, permission, or obligation from the
// letters of its key — that guesswork once chipped a WordNet licence "CC BY"
// and a REQUIRED-attribution dual "Public Domain", on the published site.
// This check holds the record and every consumer to the rule:
//
//   - every declared posture carries a name
//   - every posture the shipped store carries is declared — the set is closed
//   - the projection the reader fetches is exactly the record, re-serialized
//   - a posture whose key reads as NoDerivatives under the record's own
//     refuse_export_when test is not declared exportable
//   - the reader fetches the record; the published door embeds it; neither
//     carries a substring classifier
import { readFileSync, existsSync } from "node:fs";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad++; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

for (const need of ["tools/declarations-v1.json", "data/route-store/index.json", "zone.html"]) {
  if (!existsSync(need)) { console.log(`SKIPPED — required input absent: ${need}`); process.exit(3); }
}

const decl = JSON.parse(readFileSync("tools/declarations-v1.json", "utf8"));
const declared = decl.export_postures || {};

// every declared posture is named
const unnamed = Object.entries(declared).filter(([, r]) => !r.name || typeof r.name !== "string");
check("every declared posture carries a name", unnamed.length === 0, unnamed.map(([k]) => k).join(", "));

// the store's postures are all declared — closed set
const idx = JSON.parse(readFileSync("data/route-store/index.json", "utf8"));
const inStore = [...new Set(Object.values(idx.m_sources || {}).map((m) => String(m.licensePosture || "")))].filter(Boolean).sort();
const undeclared = inStore.filter((p) => !declared[p]);
check(`every store posture is declared (${inStore.length} in store, ${Object.keys(declared).length} declared)`, undeclared.length === 0, undeclared.join(", "));

// the projection is the record, re-serialized — derived, never typed
if (!existsSync("data/license-postures-v1.json")) {
  check("the projection data/license-postures-v1.json exists", false, "run tools/emit-license-postures-v1.mjs");
} else {
  const proj = JSON.parse(readFileSync("data/license-postures-v1.json", "utf8"));
  const want = Object.fromEntries(Object.entries(declared).map(([k, r]) => [k, { name: r.name, export: r.export, attribution: r.attribution, obligations: r.obligations }]));
  check("the projection equals the record", JSON.stringify(proj.postures) === JSON.stringify(want));
}

// the record's own NoDerivatives refusal, held mechanically: a key that reads
// as ND may not be declared exportable
const nd = Object.entries(declared).filter(([k, r]) => (/(^|[^a-z])nd([^a-z]|$)/i.test(k) || /noderivatives/i.test(k)) && r.export === true);
check("no NoDerivatives-keyed posture is declared exportable", nd.length === 0, nd.map(([k]) => k).join(", "));

// the consumers: the reader fetches the record and carries no classifier
const zone = readFileSync("zone.html", "utf8");
check("the reader fetches the posture record", zone.includes("data/license-postures-v1.json"));
check("the reader carries no substring licence law", !/includes\("wordnet"\)|includes\("gfdl"\)|startsWith\("public_domain"\)/.test(zone));

// the published door embeds the record — this reads the deployed page, so it
// is red from the moment the rule lands until the door is rebuilt against it
if (!existsSync("../index.html")) {
  console.log("SKIPPED — required input absent: ../index.html"); process.exit(3);
}
const door = readFileSync("../index.html", "utf8");
check("the published door embeds the posture record", door.includes("POSTURE_NAMES"));
check("the published door carries no substring licence law", !/indexOf\("wordnet"\)/.test(door));

console.log();
process.exit(bad ? 1 : 0);
