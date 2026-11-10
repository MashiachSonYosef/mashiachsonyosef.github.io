// What the per-verse lists change in what "cites here" leads with: every verse entry of every sidecar (v[<verse>]),
// its leader set beside its surface's first-verse leader (o.c).
// node cites-own-leaders.mjs <zones dir>
// Reads every <slug>.lattice.bin. Nothing is written.
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const dir = process.argv[2];
const printed = (t) => String(t ?? "").split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/, "").toLowerCase();
const tot = { books: 0, surfaces: 0, surfaces_with_verses_of_their_own: 0, verse_entries: 0, same_leader: 0, same_reading_another_credit: 0, another_reading: 0, none_here_where_the_first_verse_has_one: 0, one_here_where_the_first_verse_has_none: 0, none_either: 0 };
const per = [];
for (const f of readdirSync(dir).filter((x) => x.endsWith(".lattice.bin")).sort()) {
  const grades = JSON.parse(gunzipSync(readFileSync(join(dir, f))).toString("utf8")).grades;
  tot.books += 1;
  const b = { book: f.replace(".lattice.bin", ""), verse_entries: 0, leader_differs: 0 };
  for (const gr of Object.values(grades)) {
    tot.surfaces += 1;
    if (!gr.v) continue;
    tot.surfaces_with_verses_of_their_own += 1;
    const first = gr.o ? gr.o.c : null;
    for (const own of Object.values(gr.v)) {
      tot.verse_entries += 1; b.verse_entries += 1;
      const c = own.c;
      let kind;
      if (!c && !first) kind = "none_either";
      else if (!c) kind = "none_here_where_the_first_verse_has_one";
      else if (!first) kind = "one_here_where_the_first_verse_has_none";
      else if (printed(c[0]) !== printed(first[0])) kind = "another_reading";
      else if (JSON.stringify(c) !== JSON.stringify(first)) kind = "same_reading_another_credit";
      else kind = "same_leader";
      tot[kind] += 1;
      if (kind !== "same_leader" && kind !== "none_either") b.leader_differs += 1;
    }
  }
  per.push(b);
}
for (const b of per) console.log(`${b.book}: ${b.verse_entries} verse entries, the leader differs from the first verse's at ${b.leader_differs}`);
console.log(JSON.stringify(tot));
