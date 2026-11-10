// "Cites here" at verses whose own list names another leader than the surface's first verse: what the line read on
// each build, set beside the two leaders the new sidecar holds (the first verse's, o.c, and the verse's own, v[<verse>].c).
// node cites-line-moved.mjs <new zones dir> <book> <dump before.json> <dump after.json>
// The dumps are line-vs-first-pill.mjs --dump files for the same case list, one per build. Nothing is written.
// A verse no card cites has no leader of its own (c: null): there the order has nothing to say and the line reads
// as it does without it; such places are counted apart, by whether the line still reads the first verse's leader.
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [zones, book, beforePath, afterPath] = process.argv.slice(2);
const grades = JSON.parse(gunzipSync(readFileSync(join(zones, `${book}.lattice.bin`))).toString("utf8")).grades;
const read = (p) => new Map(JSON.parse(readFileSync(p, "utf8")).map((r) => [`${r.at}\u0001${r.surface}`, r]));
const B = read(beforePath), A = read(afterPath);
// as the line prints a reading with the signs switch at rest: the pieces joined, a piece that is a source's sign and
// nothing else drawn as a gap beside the pieces that carry the reading (the same rule line-vs-first-pill.mjs keeps),
// a closing stop and the case set aside
const signOnly = (t) => /^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+)$/u.test(String(t).trim());
const printed = (t) => {
  if (t === null || t === undefined) return null;
  const pieces = String(t).replace(/\s+/g, " ").split("/").map((x) => x.trim()).join(" + ").replace(/\.$/, "").split(" + ").map((x) => x.replace(/​/gu, "").trim()).filter(Boolean);
  const kept = pieces.filter((x) => !signOnly(x));
  return (kept.length ? kept : pieces).join(" + ").toLowerCase();
};
const led = { places: 0, before_first: 0, before_own: 0, before_other: 0, after_own: 0, after_first: 0, after_other: 0, moved: 0 };
const bare = { places: 0, before_first: 0, after_first: 0, moved: 0 };
const rows = [];
for (const [key, a] of A) {
  const b = B.get(key); if (!b) continue;
  const gr = grades[a.surface]; const own = gr && gr.v ? gr.v[a.at] : null;
  if (!gr || !own) continue;
  const first = gr.o && gr.o.c ? printed(gr.o.c[0]) : null, mine = own.c ? printed(own.c[0]) : null;
  const lb = printed(b.line), la = printed(a.line);
  if (mine === null) {
    bare.places += 1;
    if (lb === first) bare.before_first += 1;
    if (la === first) bare.after_first += 1;
    if (lb !== la) bare.moved += 1;
  } else {
    led.places += 1;
    if (lb === first) led.before_first += 1; else if (lb === mine) led.before_own += 1; else led.before_other += 1;
    if (la === mine) led.after_own += 1; else if (la === first) led.after_first += 1; else led.after_other += 1;
    if (lb !== la) led.moved += 1;
  }
  if (rows.length < 6) rows.push(`   ${a.at} ${a.surface}: the first verse's leader ${JSON.stringify(first)} · this verse's ${JSON.stringify(mine)} · the line before ${JSON.stringify(lb)} · after ${JSON.stringify(la)}`);
}
console.log(`${book}: ${led.places + bare.places} places read on both builds`);
console.log(`  ${led.places} at a verse some card cites with another leader than the first verse's: before, the line read the first verse's leader at ${led.before_first}, this verse's at ${led.before_own}, another reading at ${led.before_other}; after, this verse's at ${led.after_own}, the first verse's at ${led.after_first}, another at ${led.after_other}; the line moved at ${led.moved}`);
console.log(`  ${bare.places} at a verse no card cites (the first verse has a leader): before, the line read the first verse's leader at ${bare.before_first}; after, at ${bare.after_first}; the line moved at ${bare.moved}`);
for (const r of rows) console.log(r);
