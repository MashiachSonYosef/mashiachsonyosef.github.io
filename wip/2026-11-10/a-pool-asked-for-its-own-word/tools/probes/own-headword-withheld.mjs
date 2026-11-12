// Where "only this pointing" withholds a word's OWN dictionary entry. A zone word carries its headword (h, the
// letters) and that headword's pointed form (hp). At a place whose letters are the headword's own letters and whose
// vowels are not the headword's (a construct form, a pausal form, a name's by-form), a store row whose source's own
// headword is that headword form grades "pointed otherwise" by pointing-grade-rule-v4, and under "only" it is withheld
// wherever any row attests the place's own pointing. This counts those places and rows on the served zones and store.
// node own-headword-withheld.mjs <reader dir> [--show N]
// The grade is the tools' own (tools/pointing-grade-v1.mjs), the same the page runs. Rows that carry no headwords are
// not counted (the lattice's grade decides those), so the counts are a floor. Nothing is written.
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const argv = process.argv.slice(2);
const si = argv.indexOf("--show"); const SHOW = si < 0 ? 16 : Number(argv.splice(si, 2)[1]);
const [reader] = argv;
const { gradeRow, vowelForm, isPointed, rowCarriesHeadwords } = await import(pathToFileURL(join(reader, "tools", "pointing-grade-v1.mjs")).href);
const store = new Map();
const sdir = join(reader, "data/route-store/shards");
for (const f of readdirSync(sdir).filter((x) => /^[0-9a-f]{2}\.bin$/u.test(x))) for (const [k, rows] of Object.entries(JSON.parse(gunzipSync(readFileSync(join(sdir, f))).toString("utf8")))) store.set(k, rows);
const LABEL = Object.fromEntries(Object.entries(JSON.parse(readFileSync(join(reader, "data/route-store/index.json"), "utf8")).m_sources || {}).map(([id, m]) => [id, m.label || ""]));
const zdir = join(reader, "data/zones");
// the served books, as the tools list them (a zone's sidecars and the zones held off the door are not read)
const { zonesServed } = await import(pathToFileURL(join(reader, "tools", "zones-on-disk-v1.mjs")).href);
const SERVED = zonesServed(zdir).map((x) => (typeof x === "string" ? x : x.id || x.zone || x.name)).filter(Boolean);
const tot = { books: 0, words: 0, own: 0, ownOther: 0, gateOn: 0, hit: 0, rows: 0, kept: 0, otherRows: 0, keptRows: 0 };
const bySource = new Map(), bySurface = new Map(), perBook = [];
for (const f of SERVED.map((id) => `${id}.bin`).sort()) {
  let z; try { z = JSON.parse(gunzipSync(readFileSync(join(zdir, f))).toString("utf8")); } catch { continue; }
  const b = { book: f.replace(/\.bin$/u, ""), words: 0, own: 0, ownOther: 0, gateOn: 0, hit: 0, rows: 0 };
  for (const sec of z.sections || []) for (const w of sec.words || []) {
    if (!w || w.mark || w.kq || !w.k || !w.s) continue;
    b.words += 1;
    if (!w.h || !w.hp || w.k !== w.h || !isPointed(w.hp) || !isPointed(w.s)) continue;
    b.own += 1;                                   // the place's letters are its own headword's letters
    const vs = vowelForm(w.s), vh = vowelForm(w.hp);
    if (vs === vh) continue;
    b.ownOther += 1;                              // ... and its vowels are not the headword's
    const rows = (store.get(w.k) || []).filter(rowCarriesHeadwords);
    const grades = rows.map((r) => gradeRow(r, w.s));
    if (!grades.includes("m")) continue;          // a pointing no row attests withholds nothing
    b.gateOn += 1;
    const lost = rows.filter((r, i) => grades[i] === "x" && r[6].filter(isPointed).map(vowelForm).includes(vh));
    if (!lost.length) continue;
    b.hit += 1; b.rows += lost.length;
    // what the filter withholds at the same place that is NOT the word's own headword form (other words on these
    // letters): a rule that kept the word's own entry would leave these withheld
    tot.otherRows += rows.filter((r, i) => grades[i] === "x").length - lost.length;
    tot.keptRows += grades.filter((g) => g !== "x").length;
    for (const m of new Set(lost.map((r) => r[3]))) bySource.set(m, (bySource.get(m) || 0) + 1);
    const key = `${w.s.replace(/[֑-ֽ֯׀׃]/gu, "")} (its headword ${w.hp})`;
    const e = bySurface.get(key) || { n: 0, rows: lost.length, at: `${b.book} ${sec.label}` }; e.n += 1; bySurface.set(key, e);
  }
  if (b.words) { perBook.push(b); tot.books += 1; for (const k of ["words", "own", "ownOther", "gateOn", "hit", "rows"]) tot[k] += b[k]; }
}
const n = (x) => x.toLocaleString("en-US");
console.log(`${tot.books} served books · ${n(tot.words)} words (marks and pairs not counted)`);
console.log(`  a place whose letters are its own headword's letters: ${n(tot.own)}`);
console.log(`  of those, pointed otherwise than the headword (another state of the same word): ${n(tot.ownOther)}`);
console.log(`  of those, some store row attests the place's own pointing, so "only" withholds: ${n(tot.gateOn)}`);
console.log(`  of those, at least one row of the word's own headword form is withheld: ${n(tot.hit)} places, ${n(tot.rows)} rows in all`);
console.log(`  at those places the filter also withholds ${n(tot.otherRows)} rows headed by other forms (other words on the same letters), and keeps ${n(tot.keptRows)} rows`);
console.log(`  the sources whose own entry is withheld, by places: ${[...bySource].sort((a, c) => c[1] - a[1]).slice(0, 10).map(([m, k]) => `${m} ${(LABEL[m] || "").slice(0, 34)} ${n(k)}`).join(" · ")}`);
console.log("  by book (places where an own-headword row is withheld / places pointed otherwise than the headword):");
console.log(`     ${perBook.filter((b) => b.ownOther).sort((a, c) => c.hit - a.hit).slice(0, 40).map((b) => `${b.book} ${b.hit}/${b.ownOther}`).join(" · ")}`);
console.log(`  the forms it happens at most often (${n(bySurface.size)} distinct):`);
for (const [k, e] of [...bySurface].sort((a, c) => c[1].n - a[1].n).slice(0, SHOW)) console.log(`     ${String(e.n).padStart(5)} places · ${k} · ${e.rows} rows withheld · first at ${e.at}`);
