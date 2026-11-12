// The word entries a zone holds for the verses named, as they stand, and the zone's top-level keys.
// node verse-words.mjs <zone.bin> <label> [<label> ...]   (a label as the zone gives it, e.g. 1:8)
// Nothing is written. It prints; it does not judge.
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const [path, ...labels] = process.argv.slice(2);
const z = JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
console.log(`zone keys: ${Object.keys(z).join(" ")}`);
for (const sec of z.sections || []) {
  if (!labels.includes(sec.label)) continue;
  console.log(`\n== ${sec.label} · section keys: ${Object.keys(sec).join(" ")}`);
  (sec.words || []).forEach((w, i) => console.log(`${String(i + 1).padStart(3)} ${JSON.stringify(w)}`));
  for (const k of Object.keys(sec)) if (k !== "words" && k !== "label") console.log(`   ${k}: ${JSON.stringify(sec[k]).slice(0, 600)}`);
}
