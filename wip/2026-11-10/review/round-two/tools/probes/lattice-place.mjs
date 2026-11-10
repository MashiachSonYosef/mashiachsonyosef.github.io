// What the corpus lane's lattice says of one key at given verses of one book: the route grades of each place.
// node lattice-place.mjs <lattice dir> <book> <key as \uXXXX escapes> <verse> [<verse>...]
// Reads positions-<book>-v12.jsonl.gz. Nothing is written.
import { createReadStream } from "node:fs";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { join } from "node:path";
const [dir, book, keyEsc, ...verses] = process.argv.slice(2);
const key = JSON.parse(`"${keyEsc}"`);
const want = new Set(verses);
const cut = (v, n = 420) => { const s = JSON.stringify(v); return s.length > n ? `${s.slice(0, n)}…` : s; };
const rl = createInterface({ input: createReadStream(join(dir, `positions-${book}-v12.jsonl.gz`)).pipe(createGunzip()), crlfDelay: Infinity });
let shownKeys = false;
for await (const line of rl) {
  if (!line) continue;
  const p = JSON.parse(line);
  if (!want.has(p.ref)) continue;
  for (const m of p.megacompspan || []) {
    if (m.key !== key) continue;
    if (!shownKeys) { console.log("a place's fields:", Object.keys(p).join(", ")); console.log("a span's fields:", Object.keys(m).join(", ")); console.log("route_grades' fields:", Object.keys(m.route_grades || {}).join(", ")); shownKeys = true; }
    const rg = m.route_grades || {};
    console.log(`${p.ref} · c0 ${p.c0} · ${m.surface} · names_this_verse ${cut(rg.names_this_verse)}`);
    for (const [k, v] of Object.entries(rg)) if (k !== "names_this_verse") console.log(`    ${k}: ${cut(v, 260)}`);
  }
}
