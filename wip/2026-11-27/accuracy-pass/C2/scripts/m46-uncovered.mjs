import { readFileSync } from "node:fs"; import { join, resolve } from "node:path"; import { pathToFileURL } from "node:url";
const [BASE, OUT] = process.argv.slice(2);
const { classify } = await import(pathToFileURL(resolve(join(BASE, "data/ledgers-v1/unabridged_bdb_1906/classifier.mjs"))).href);
let notes = 0, pills = 0; const ex = [];
for (const line of readFileSync(join(OUT, "rows-M46.jsonl"), "utf8").split("\n")) { if (!line) continue; const r = JSON.parse(line);
  try { classify(String(r.route)); } catch (e) { if (r.readings.length) { pills += 1; ex.push(r.k + ": " + r.route.slice(0, 60)); } else notes += 1; } }
console.log(JSON.stringify({ rows_with_a_mark_no_shape_names: notes + pills, notes, pills, ex: ex.slice(0, 10) }));
