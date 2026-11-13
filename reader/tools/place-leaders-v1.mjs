// Synthesis lane · the leaders under "only" at a place, where the place's own gates move them
// LEDGER: -
// no frame letter. It reads the sidecar's record of a surface and a place's
// two facts, and writes nothing.
//
// THE LEADERS UNDER "ONLY" AT A PLACE.
//
// The lattice sidecar bakes, for each pointed surface of a book, the reading
// that leads under "only this pointing" (o.l), its alternate with the
// leader's carriers switched off (o.la), and whether the name still leads
// (nl). Those are the surface's: they are computed with the pointing and the
// stem alone, and they are what stands at a place the gates below do not
// touch.
//
// Two gates read a place's own facts, and where one of them withholds a row
// the leaders can move:
//
//   the entry gate   reads the tags of the word's core piece (tg): a row of
//                    another entry is withheld, a row of the place's entry
//                    stands whatever its points (tools/entry-gate-v1.mjs);
//   the names gate   reads whether the place is a name (np): where it is
//                    not, a row its own source gives as a name is withheld
//                    (tools/names-gate-v1.mjs).
//
// So the sidecar keeps, beside the surface's leaders, the leaders at each
// kind of place the surface stands at in the book, where they are not the
// same: grades[surface].e[<key>] = { l, la, nl }. The key says what the
// place is:
//
//   "H1254A"     the core tags as the lattice writes them, joined by a
//                space: a place of that entry that is not a name (both
//                gates ask)
//   "H1254A|n"   the same entry at a place that is a name (the names stand)
//   ""           a place the lattice gives no tag, that is not a name (the
//                names gate alone)
//
// A place with no tag that is a name reads the surface's own leaders, and
// so does any place whose key e does not hold. A book whose places were not
// read for names (no list of name places in the tree) treats every place as
// a name: its names stand, as they did before the gate.
//
// The page carries leadersKey and onlyLeaders under the same names.
export const PLACE_IS_A_NAME = "|n";

/** The key of a place's kind in grades[surface].e: `tags` the word's tg (a tag, a list, or none), `isName` whether the place is a name. */
export const leadersKey = (tags, isName) => `${tags ? [].concat(tags).join(" ") : ""}${isName ? PLACE_IS_A_NAME : ""}`;

/** The leaders under "only" at a place: its own where the sidecar holds them, else the surface's. `gr` is the sidecar's record of the pointed surface. */
export const onlyLeaders = (gr, tags, isName) => {
  const own = gr && gr.e ? gr.e[leadersKey(tags, isName)] : null;
  return own ? { l: own.l || null, la: own.la || null, nl: !!own.nl } : { l: (gr && gr.o && gr.o.l) || null, la: (gr && gr.o && gr.o.la) || null, nl: !!(gr && gr.nl) };
};
