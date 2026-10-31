// Feeds the draft declaration to declaration-v1.mjs IN MEMORY (no file edited) to confirm the draft's machine_gap note.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const KEY = "panlex_hebrew_english_meanings_20240301";
const { DECLARATIONS, readingOf } = await import(path.resolve(ROOT, "../ghp/reader/tools/declaration-v1.mjs"));
const draft = JSON.parse(fs.readFileSync(path.join(ROOT, "pilot", KEY, "declaration.json"), "utf8")).providers[KEY];
const rows = fs.readFileSync(path.join(ROOT, "by-source", KEY + ".jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const run = (label, decl) => {
  DECLARATIONS.providers[KEY] = decl;
  let divided = 0, readings = 0, refused = 0, unknown = 0; const ex = [];
  for (const r of rows) { const o = readingOf(r.route, r.def, KEY); if (o.unknownMarks.length) unknown++; if (o.refused) { refused++; ex.push(`refused ${r.key} | ${r.route.slice(0, 60)}`); } if (o.readings.length > 1) { divided++; readings += o.readings.length; ex.push(`${r.key} | ${r.route.slice(0, 60)} -> ${o.readings.join(" ‖ ")}`); } }
  return { label, divided, readings, refused, rows_with_unknown_marks: unknown, examples: ex };
};
const out = [
  run("draft as written (separates_on.marks array)", draft),
  run("draft with separates_on.mark=','", { ...draft, separates_on: { ...draft.separates_on, mark: "," } }),
  run("draft with separates_on.mark='/'", { ...draft, separates_on: { ...draft.separates_on, mark: "/" } }),
];
delete DECLARATIONS.providers[KEY];
fs.writeFileSync(path.join(HERE, "machine-check.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
