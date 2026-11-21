# Ship 13: where a plain untagged word carries no headword of the zone's, the entries are read from the lattice's own
# lemma for the position (the corpus lane's third list of relay v208 found these places: where our text spells the word
# otherwise, the zone's headword projection reached no headword, and the lattice's entry still carries MACULA's lemma).
import sys
p = sys.argv[1] + "/tools/project-lattice-v12-v1.mjs"
t = open(p, encoding="utf-8").read()
def sub(a, b, n=1):
    global t
    if t.count(a) != n: sys.exit("patch-04: expected %d of: %s (found %d)" % (n, a[:100], t.count(a)))
    t = t.replace(a, b)

sub("""// ---- the lost tags of the read words' amendment (rule 9) --------------------""",
    """const latticeLemma = new Map();    // zone word -> MACULA's lemma as the lattice's own entry carries it for the position
// ---- the lost tags of the read words' amendment (rule 9) --------------------""")
sub("""    // rule 9: a piece that lost TAHOT's tag is read with it, once it is proved to be the piece the list names""",
    """    // the lemma of the position as the lattice's own entry carries it (the form's entry; a plain word has one)
    { const lm = (p.megacompspan || []).map((m) => (m.lemma && typeof m.lemma.macula === "string" && m.lemma.macula.trim() ? m.lemma.macula : null)).find(Boolean) || null; if (lm) latticeLemma.set(w, lm); }
    // rule 9: a piece that lost TAHOT's tag is read with it, once it is proved to be the piece the list names""")
sub("""// ---- the entry where STEP gives no tag (entry-by-lemma-rule-v1) -------------
// A plain word (no halves, no read form apart) that carries no tag after the
// join, in a verse joined or held, takes the entries of MACULA's lemma (hp),
// read from the store's rows headed by the lemma as MACULA points it
// (tools/entry-gate-v1.mjs, lemmaEntries). Written as te, apart from tg; the
// gate reads tg, else te (placeTags). Cleared first on every word, so a word
// a later projection tags carries no te of an earlier one.
for (const sec of zone.sections || []) for (const w of sec.words || []) {
  delete w.te;
  if (w.mark || w.tg || w.w || w.kq || w.kqw || !w.k || typeof w.hp !== "string" || !w.hp) continue;
  stats.places_untagged_asked_by_lemma += 1;
  if (/\\s/u.test(w.hp.trim())) { stats.places_lemma_of_several_words += 1; continue; }
  const te = lemmaEntries(w.hp, (k) => store.routesFor(k), factsOf);
  if (!te.length) continue;
  w.te = te.length === 1 ? te[0] : te;
  stats.places_entry_by_lemma += 1;
  if (te.length > 1) stats.places_entry_by_lemma_several += 1;
}""",
    """// ---- the entry where STEP gives no tag (entry-by-lemma-rule-v1) -------------
// A plain word (no halves, no read form apart) that carries no tag after the
// join, in a verse joined or held, takes the entries of MACULA's lemma (hp),
// read from the store's rows headed by the lemma as MACULA points it
// (tools/entry-gate-v1.mjs, lemmaEntries). Written as te, apart from tg; the
// gate reads tg, else te (placeTags). Cleared first on every word, so a word
// a later projection tags carries no te of an earlier one.
//
// WHERE THE ZONE CARRIES NO HEADWORD, THE LEMMA IS THE LATTICE'S OWN (21
// November 2026). At the places our text spells a word otherwise than the
// text MACULA follows, the zone's headword projection reached no headword
// (no h, no hp), so the place was asked no entry at all, while the lattice's
// own entry for the position carries MACULA's lemma (lemma.macula). The
// corpus lane's list of untagged places (relay v208, its third list) set the
// two side by side: 108 such places of the 39 books. There the entries are
// read from the lattice's lemma, by the same reading of the store, and the
// word says which lemma they were read from (tl), so the check can read them
// again without the lattice. A word that carries a headword of its own is
// read from it, as before, and carries no tl.
for (const sec of zone.sections || []) for (const w of sec.words || []) {
  delete w.te; delete w.tl;
  if (w.mark || w.tg || w.w || w.kq || w.kqw || !w.k) continue;
  const own = typeof w.hp === "string" && w.hp ? w.hp : null;
  const lemma = own || latticeLemma.get(w) || null;
  if (!lemma) continue;
  stats.places_untagged_asked_by_lemma += 1;
  if (!own) stats.places_untagged_asked_by_the_lattices_lemma += 1;
  if (/\\s/u.test(lemma.trim())) { stats.places_lemma_of_several_words += 1; continue; }
  const te = lemmaEntries(lemma, (k) => store.routesFor(k), factsOf);
  if (!te.length) continue;
  w.te = te.length === 1 ? te[0] : te;
  if (!own) { w.tl = lemma; stats.places_entry_by_the_lattices_lemma += 1; }
  stats.places_entry_by_lemma += 1;
  if (te.length > 1) stats.places_entry_by_lemma_several += 1;
}""")
sub("""  places_untagged_asked_by_lemma: 0, places_entry_by_lemma: 0, places_entry_by_lemma_several: 0, places_lemma_of_several_words: 0,""",
    """  places_untagged_asked_by_lemma: 0, places_untagged_asked_by_the_lattices_lemma: 0, places_entry_by_lemma: 0, places_entry_by_the_lattices_lemma: 0, places_entry_by_lemma_several: 0, places_lemma_of_several_words: 0,""")
open(p, "w", encoding="utf-8").write(t)
print("patch-04 ok")
