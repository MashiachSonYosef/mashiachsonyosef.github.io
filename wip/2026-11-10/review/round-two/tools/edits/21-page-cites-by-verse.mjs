// The page reads "cites here" for the word's own verse (with edit 20: the sidecar carries each verse's own list
// and leader where they differ from the surface's first verse). The card's sort and the line under the word
// both ask one helper, by the verse the word stands in.
// node 21-page-cites-by-verse.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "zone.html"), [
  // the verse the open card stands in, beside the word and the key it was opened on
  [`  let openPointed = null, openKey = null;`,
   `  let openPointed = null, openKey = null;
  // THE CITATIONS ARE THE VERSE'S. The lattice's record of a pointed surface
  // is taken at the surface's first verse in the book, and which cards name
  // a verse is a fact about that verse: the record carries the first verse's
  // list (n, its leader o.c) and, for every other verse whose list differs,
  // that verse's own (v[<verse label>] = { n, c }; tools/project-lattice-
  // v12-v1.mjs, rule 4). So the card's sort and the line both ask for the
  // verse the word stands in. Until 10 November 2026 every place of a
  // surface read its first verse's list: 14,781 of 306,493 graded places on
  // the 39 books, 4,129 of them in the first book.
  let openVerse = null;                 // the label of the verse the open card stands in
  const WORD_VERSE = new WeakMap();     // a word of the zone -> its verse's label
  const versesOwn = (gr, verse) => (gr && gr.v && verse != null && Object.prototype.hasOwnProperty.call(gr.v, verse) ? gr.v[verse] : null);
  const citingCards = (gr, verse) => { const own = versesOwn(gr, verse); return own ? own.n : (gr ? gr.n : []); };
  // the baked leader of a lattice order for a surface at a verse (null: none)
  const latticeLeader = (gr, order, verse) => {
    if (!gr || !gr.o) return null;
    if (order === "c") { const own = versesOwn(gr, verse); if (own) return own.c || null; }
    return gr.o[order] || null;
  };`],
  [`    window.__zone = zone;`,
   `    window.__zone = zone;
    for (const sec of zone.sections || []) for (const w of sec.words || []) if (w && typeof w === "object") WORD_VERSE.set(w, sec.label);`],
  // the card: this verse's citing cards, and whether a lattice order has a leader here
  [`    const cites = (r) => (gr && rk(r).some((row) => gr.n.includes(idxOf(row))) ? 0 : 1);`,
   `    const citing = gr ? citingCards(gr, openVerse) : [];
    const cites = (r) => (gr && rk(r).some((row) => citing.includes(idxOf(row))) ? 0 : 1);`],
  [`      || (pos.needs === "lattice" && gr && gr.o && gr.o[pos.lattice])`,
   `      || (pos.needs === "lattice" && latticeLeader(gr, pos.lattice, openVerse))`],
  // the line
  [`      const gr = latticeStore.grades[word.s];
      const first = gr && gr.o && gr.o[pos.lattice];
      if (first) return { text: first[0], rs: [{ posture: first[2], m: first[1], y: first[3], ya: "wording" }], why: pos.id };`,
   `      const gr = latticeStore.grades[word.s];
      const first = latticeLeader(gr, pos.lattice, WORD_VERSE.get(word));
      if (first) return { text: first[0], rs: [{ posture: first[2], m: first[1], y: first[3], ya: "wording" }], why: pos.id };`],
  // the card's verse, set where the card's own site is read
  [`    openKey = bin === zone && region ? (region.form_k || region.k || null) : null;
    // Only the atoms tile the occurrence`,
   `    openKey = bin === zone && region ? (region.form_k || region.k || null) : null;
    openVerse = openSite ? openSite.ref : null;
    // Only the atoms tile the occurrence`],
]);
