// "Cites here" belongs to the verse; the sidecar keeps one list per pointed surface, from the surface's first verse.
// How many word places carry a list that is not their own, book by book?
// node cites-per-verse.mjs <lattice dir> <reader dir> [book ...]
// For every ON position's megacompspan entry that has route grades: the list of the surface's first place in the
// book (what the sidecar keeps) against this place's own list.
import { createReadStream, readdirSync } from "node:fs";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { join } from "node:path";
const [dir, , ...only] = process.argv.slice(2);
const books = readdirSync(dir).filter((f) => /^positions-.*-v12\.jsonl\.gz$/u.test(f)).map((f) => f.replace(/^positions-|-v12\.jsonl\.gz$/gu, "")).filter((b) => !only.length || only.includes(b)).sort();
const tot = { books: 0, places: 0, places_of_a_surface_seen_before: 0, list_not_theirs: 0, told_a_card_cites_here: 0, lose_a_citing_card: 0, surfaces: 0, surfaces_whose_lists_differ: 0 };
const rows = [];
for (const b of books) {
  const first = new Map();
  const differing = new Set();
  const c = { places: 0, again: 0, wrong: 0, told: 0, lose: 0 };
  const rl = createInterface({ input: createReadStream(join(dir, `positions-${b}-v12.jsonl.gz`)).pipe(createGunzip()), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line) continue;
    const p = JSON.parse(line);
    if (p.c0 !== "ON") continue;
    for (const m of p.megacompspan || []) {
      const rg = m.route_grades;
      if (!rg) continue;
      const mine = [...(rg.names_this_verse || [])].sort((x, y) => x - y);
      c.places += 1;
      if (!first.has(m.surface)) { first.set(m.surface, mine); continue; }
      c.again += 1;
      const kept = first.get(m.surface);
      if (JSON.stringify(kept) === JSON.stringify(mine)) continue;
      c.wrong += 1; differing.add(m.surface);
      if (kept.some((x) => !mine.includes(x))) c.told += 1;
      if (mine.some((x) => !kept.includes(x))) c.lose += 1;
    }
  }
  tot.books += 1; tot.places += c.places; tot.places_of_a_surface_seen_before += c.again; tot.list_not_theirs += c.wrong; tot.told_a_card_cites_here += c.told; tot.lose_a_citing_card += c.lose; tot.surfaces += first.size; tot.surfaces_whose_lists_differ += differing.size;
  rows.push(`${b}: ${c.wrong} of ${c.places} graded places carry a list that is not theirs (${c.told} told a card cites here that does not, ${c.lose} lose one that does)`);
}
for (const r of rows) console.log(r);
console.log(JSON.stringify(tot));
