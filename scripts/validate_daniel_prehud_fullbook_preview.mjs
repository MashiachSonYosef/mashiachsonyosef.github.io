import fs from "node:fs";

const htmlPath = process.argv[2] || "reports/daniel-prehud-fullbook-preview.html";
const reportPath = "reports/daniel-prehud-fullbook-preview-report.json";
const sourcePath = "data/sources/daniel.json";

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const html = fs.readFileSync(htmlPath, "utf8");
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const expectedRows = source.units.reduce((sum, unit) => sum + (unit.hebrew || []).join(" ").split(/\s+/).filter(Boolean).length, 0);
const rowCount = (html.match(/data-hud-row/g) || []).length;
const tbdGlossCount = (html.match(/<span data-gloss-text>TBD<\/span>/g) || []).length;
const tbdMatchCount = (html.match(/<div class="prehud-match" data-match-text>TBD<\/div>/g) || []).length;

if (rowCount !== expectedRows) throw new Error(`row count mismatch: ${rowCount} !== ${expectedRows}`);
if (report.token_rows !== expectedRows) throw new Error(`report token_rows mismatch: ${report.token_rows} !== ${expectedRows}`);
if (report.source_units !== source.units.length) throw new Error("source unit count mismatch");
if (report.selectable_rows !== 0) throw new Error("selectable_rows must be zero");
if (tbdGlossCount !== expectedRows) throw new Error(`TBD gloss count mismatch: ${tbdGlossCount} !== ${expectedRows}`);
if (tbdMatchCount !== expectedRows) throw new Error(`TBD match count mismatch: ${tbdMatchCount} !== ${expectedRows}`);

const required = [
  "role=\"dialog\"",
  "data-lexical-hud",
  "reader-gloss-card",
  "reader-gloss-choice",
  "Sources / licenses",
  "HUD evidence only",
  "Lemma evidence remains HUD-only",
  "overflow-wrap:anywhere",
  "white-space:normal",
  "window.__danielPreview"
];
for (const needle of required) {
  if (!html.includes(needle)) throw new Error(`missing required preview marker: ${needle}`);
}

const forbidden = [
  "line-clamp",
  "-webkit-line-clamp",
  "text-overflow",
  "under-row HUD",
  "answer_eligible",
  "accepted gloss",
  "accepted text"
];
for (const needle of forbidden) {
  if (html.includes(needle)) throw new Error(`forbidden marker found: ${needle}`);
}

console.log(`Daniel pre-HUD preview validation passed. Rows: ${rowCount}; source units: ${source.units.length}; selectable rows: 0.`);
