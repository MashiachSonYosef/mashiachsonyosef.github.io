// The cards the corpus lane's lattice holds for one key of one book: each card's reading, source, headwords and the
// verses of this book it names.
// node lattice-routes.mjs <lattice dir> <book> <key as \uXXXX escapes>
// Reads routes-<book>-v12.jsonl.gz. Nothing is written.
import { createReadStream } from "node:fs";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { join } from "node:path";
const [dir, book, keyEsc] = process.argv.slice(2);
const key = JSON.parse(`"${keyEsc}"`);
const cut = (v, n = 200) => { const s = JSON.stringify(v); return s.length > n ? `${s.slice(0, n)}…` : s; };
const rl = createInterface({ input: createReadStream(join(dir, `routes-${book}-v12.jsonl.gz`)).pipe(createGunzip()), crlfDelay: Infinity });
let n = 0;
for await (const line of rl) {
  if (!line) continue;
  const r = JSON.parse(line);
  n += 1;
  if (n === 1) console.log("a line's fields:", Object.keys(r).join(", "), "· a card's:", Object.keys((r.routes || [{}])[0] || {}).join(", "));
  if (r.key !== key) continue;
  (r.routes || []).forEach((c, i) => console.log(`   [${i}] ${cut(c.text, 60)} · ${cut(c.primary_source, 70)} · year ${c.year ?? c.earliest_year} · headwords ${cut(c.headwords, 80)} · names in this book ${cut(c.verse_refs_in_this_book, 200)}`));
}
