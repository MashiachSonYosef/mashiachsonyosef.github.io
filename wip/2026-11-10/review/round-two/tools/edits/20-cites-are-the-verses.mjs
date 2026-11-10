// "Cites here" answers for the word's own verse (the fifth reader's finding 8; measured 10 November 2026 over the
// 39 books: 14,781 of 306,493 graded word places carried the citation list of another verse, 4,129 of them in
// Genesis). The sidecar keeps one record per pointed surface, taken at the surface's first place in the book,
// and the list of cards that name THIS verse rode on it as if it repeated wherever the pointing does. The grade
// does; the citations do not. The first place's list stays where it was (n, o.c), and every verse whose list
// differs carries its own beside it (v[<verse>] = { n, c }); the page reads the list and the leader of the
// word's own verse.
// node 20-cites-are-the-verses.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "project-lattice-v12-v1.mjs"), [
  // rule 4 in the header says what repeats and what does not
  [`//   4. In the sidecar, per key the lattice's card fingerprints in the
//      lattice's own order with the transliteration flags, and per pointed
//      surface the tier of each card (m vowel match · n normalized · x vowel
//      mismatch) and which cards cite this verse. Keyed by the pointed
//      surface, because the grade is a fact about the pointing and repeats
//      wherever the pointing does.`,
   `//   4. In the sidecar, per key the lattice's card fingerprints in the
//      lattice's own order with the transliteration flags, and per pointed
//      surface the tier of each card (m vowel match · n normalized · x vowel
//      mismatch) and which cards cite this verse. Keyed by the pointed
//      surface, because the grade is a fact about the pointing and repeats
//      wherever the pointing does. THE CITATIONS DO NOT: which cards name a
//      verse is a fact about the verse. The record carries the list of the
//      surface's first verse in the book (n, and its leader o.c), and for
//      every other verse of that surface whose list differs, that verse's
//      own list and leader (v[<verse label>] = { n, c }). A verse not named
//      there reads the first verse's, which is then also its own.`],
  // one place decides who leads under "cites here", for the first verse and for every other
  [`const grades = {};          // pointed surface -> { k, g, n }`,
   `const grades = {};          // pointed surface -> { k, g, n, o, v? }
// what the sidecar prints of a reading's credit: its text, its oldest
// carrier's label and licence key, and that row's wording year
const credit = (text, row) => { const src = store.index.m_sources[row[3]]; const y = store.wordingYear(row); return [text, src.label, src.licensePosture, Number.isFinite(y) ? y : null]; };
// WHO LEADS UNDER "CITES HERE", for one key and one verse's list of citing
// cards: the first reading of the store's pool, oldest first, that a citing
// card carries, credited to its oldest carrier — what the card puts first
// when it sorts the citing readings ahead. Asked once for the surface's
// first verse and again for every verse whose list differs. The pool and the
// cards behind each reading are the key's, so they are kept per key.
const citeGroupsByKey = new Map();
const citeGroupsOf = (key, list) => {
  if (!citeGroupsByKey.has(key)) {
    const srows = store.routesFor(key) || [];
    const fpIx = new Map(list.map((c, ix) => [c.fp, ix]));
    const ixOf = (row) => { const src = store.index.m_sources[row[3]]; const ix = src ? fpIx.get(fnv1a(\`\${row[1]}|\${src.label}\`)) : undefined; return ix === undefined ? -1 : ix; };
    citeGroupsByKey.set(key, store.readingPool(srows, "oldest").map((grp) => {
      const carriers = store.carriersOf(srows, grp.text);
      return { text: grp.text, first: carriers[0] || null, cards: carriers.map(ixOf).filter((ix) => ix >= 0) };
    }));
  }
  return citeGroupsByKey.get(key);
};
const citesLeader = (key, list, names) => {
  if (!names.length) return null;
  const hit = citeGroupsOf(key, list).find((g) => g.cards.some((ix) => names.includes(ix)));
  return hit && hit.first ? credit(hit.text, hit.first) : null;
};
const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);`],
  [`      if (!rg || !list || grades[m.surface]) continue;
      const g = new Array(list.length).fill("-");
      for (const [tier, idxs] of Object.entries(rg.grade_of_index || {})) for (const ix of idxs) if (ix < g.length) g[ix] = GRADE_CHAR[tier] || "-";
      const names = (rg.names_this_verse || []).filter((ix) => ix < list.length);`,
   `      if (!rg || !list) continue;
      const names = (rg.names_this_verse || []).filter((ix) => ix < list.length);
      // the surface is graded already, at its first verse: this verse adds
      // only what is its own, the cards that name it, where they are not
      // the first verse's
      if (grades[m.surface]) {
        const base = grades[m.surface];
        if (!sameList(base.n, names) && !(base.v && Object.prototype.hasOwnProperty.call(base.v, sec.label))) {
          (base.v ||= {})[sec.label] = { n: names, c: citesLeader(m.key, list, names) };
          stats.verses_with_their_own_citations += 1;
        }
        continue;
      }
      const g = new Array(list.length).fill("-");
      for (const [tier, idxs] of Object.entries(rg.grade_of_index || {})) for (const ix of idxs) if (ix < g.length) g[ix] = GRADE_CHAR[tier] || "-";`],
  // the group's own "cites" bit and the credit helper give way to the one place above
  [`        let tier = 3, cites = 1;
        for (const row of carriers) { const t = TIER[gradeOfRow(row)]; if (t !== undefined && t < tier) tier = t; const ix = rowIx(row); if (ix >= 0 && names.includes(ix)) cites = 0; }
        return { text: grp.text, tier, cites, carriers };
      });
      const credit = (text, row) => { const src = store.index.m_sources[row[3]]; const y = store.wordingYear(row); return [text, src.label, src.licensePosture, Number.isFinite(y) ? y : null]; };`,
   `        let tier = 3;
        for (const row of carriers) { const t = TIER[gradeOfRow(row)]; if (t !== undefined && t < tier) tier = t; }
        return { text: grp.text, tier, carriers };
      });`],
  [`        c: firstUnder((gi) => gi.cites, (gi) => gi.cites === 0),`, `        c: citesLeader(m.key, list, names),`],
  [`  ld: 0, grades: 0, verses_held_j_not_sound: 0,`, `  ld: 0, grades: 0, verses_with_their_own_citations: 0, verses_held_j_not_sound: 0,`],
  [`    m: "masoretic — the oldest VOWEL_MATCH card", x: "vowels differ — the oldest VOWEL_MISMATCH card", c: "cites here — the oldest card naming this verse",`,
   `    m: "masoretic — the oldest VOWEL_MATCH card", x: "vowels differ — the oldest VOWEL_MISMATCH card", c: "cites here — the oldest card naming this verse: o.c for the surface's first verse in the book, v[<verse>].c for every other verse whose citing cards differ",`],
  [`  what_the_sidecar_carries: "per key the cards' fingerprints in lattice order with transliteration flags; per pointed surface the tier of each card, which cite this verse, and the first reading`,
   `  what_the_sidecar_carries: "per key the cards' fingerprints in lattice order with transliteration flags; per pointed surface the tier of each card, which cite its first verse (n) and, for every other verse of the surface whose citing cards differ, that verse's own (v[<verse>].n, with its cites-here leader v[<verse>].c), and the first reading`],
]);
