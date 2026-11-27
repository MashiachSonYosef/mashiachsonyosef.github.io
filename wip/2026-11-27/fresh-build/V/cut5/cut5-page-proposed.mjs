// Scratch (fifth cut): the change proposed for reader/place.html, run here on the tag files with stand-ins for
// the page (el gives its text; no MACULA forms, so only the number's own records are first). Not the page.
import { readFileSync, readdirSync } from "node:fs"; import { gunzipSync } from "node:zlib"; import { join } from "node:path";
const P = process.argv[2]; const show = process.argv.slice(3);
const el = (tag, cls, ...kids) => kids.join("");
/** What the card says of the records a number stands on: how many are this word's, and how many are set behind for their language. */
function unabridgedSays(ids0, first, other, tongue, citesFirst) {
  const set = ids0.filter((id) => other.has(id)).length;
  const lang = set ? ` ${set === 1 ? "One is a" : `${set} are`} Biblical ${tongue[1]} record${set === 1 ? "" : "s"}; STEP says this word is ${tongue[0]}.` : "";
  const head = `This number stands on ${ids0.length} records of this file.`;
  if (first.length === 1) return `${head}${lang} One has this word's own headword${set ? " in its language" : ""}.`;
  if (first.length) return `${head}${lang} ${first.length} of them have this word's own headword${set ? " in its language" : ""}, and nothing in the files says which is meant.${citesFirst ? " The record that cites this verse stands first." : ""}`;
  return `${head}${lang} None has this word's own headword${set ? " in its language" : ""}.`;
}
/** The block of drawEntries that parts the unabridged records, as proposed; returns what it appends and the two lists. */
function part(line, ids0, byMacula, cites) {
  const row = []; const several = ids0.length > 1; let ids = ids0.slice(), behind = [];
  // a record that says it is of the other language than STEP's lexicon says this word is (line.ol) is not this word's
  const other = new Set(line.ol || []); const tongue = line.lg === "a" ? ["Aramaic", "Hebrew"] : ["Hebrew", "Aramaic"];
  const own = new Set([...Object.keys(line.own || {}), ...ids0.filter((id) => byMacula.has(id))].filter((id) => !other.has(id)));
  if (several) {
    behind = ids.filter((id) => !own.has(id)); ids = ids.filter((id) => own.has(id));
    row.push(el("p", "sub", unabridgedSays(ids0, ids, other, tongue, ids.some(cites))));
  } else if (other.has(ids0[0])) row.push(el("p", "sub", `This record is a Biblical ${tongue[1]} record, and STEP says this word is ${tongue[0]}, so it is not said to cite this word.`));
  else if (!own.has(ids0[0])) row.push(el("p", "sub", "This record's headword is spelled otherwise than this word's dictionary form, so it is not said to cite this word."));
  return { row, ids, behind };
}
const kinds = new Map(); let n = 0;
for (const f of readdirSync(join(P, "entries", "t"))) { const F = JSON.parse(gunzipSync(readFileSync(join(P, "entries", "t", f))).toString("utf8")); for (const [tag, line] of Object.entries(F.tags)) { const ids0 = line.b.unabridged_bdb_1906.slice(1); if (!ids0.length) continue; n += 1; const r = part(line, ids0, new Set(), () => false); const k = (r.row[0] || "(no sentence)").replace(/\d+/g, "N"); kinds.set(k, (kinds.get(k) || 0) + 1); if (show.includes(tag)) console.log(tag, "::", r.row[0] || "(no sentence)", "| first", r.ids.join(","), "| behind", r.behind.join(",")); } }
console.log(`${n} numbers with a record; the sentences, by kind:`); for (const [k, c] of [...kinds].sort((a, b) => b[1] - a[1])) console.log(`${String(c).padStart(6)}  ${k}`);
