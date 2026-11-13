// Synthesis lane · stems-carried-rule-v1-a-key-carries-its-rows-stems-only-where-a-card-of-the-book-can-ask-them
// LEDGER: -
// no frame letter. Which keys of a book its lattice sidecar carries the rows'
// stems for: the one rule the projector writes by and the checks hold it to.
//
// THE STEMS A CARD CAN ASK (13 November 2026). The page asks a row's stems on
// one kind of card only: one whose word, or half of a word written one way and
// read another, has a pointed surface whose places in the book have a known
// stem (the sidecar's grades[surface].st), under that form's own key (zone.html,
// poolFor: askedWord gives the pointed surface only where the key asked is
// the form's own, and the stem gate asks grades[that surface].st first). The
// projector asks them for the leaders it bakes under the same condition,
// under the graded surface's own key (grades[surface].k). A key no such card
// or leader is asked under is never asked its rows' stems, so the sidecar
// does not carry them. Measured before this was written: 13,791 of the 51,971
// keys that carried stems, 427,331 of their 937,350 rows, 5.25 MB of the
// 37.4 MB the lattice sidecars weighed gzipped. Nothing the page draws or
// withholds moves.
//
// The pairs are taken wide, so no key a card asks is ever left out: a word's
// surface and key; each half's, as the zone writes it and without its
// brackets, as the read half is graded; and each piece's, though a piece's
// card asks no stem today.
export const STEMS_CARRIED_RULE_ID = "stems-carried-rule-v1-a-key-carries-its-rows-stems-only-where-a-card-of-the-book-can-ask-them";

/** A surface without the brackets a read half is written in. */
const unbracket = (s) => {
  let a = 0, b = s.length;
  while (a < b && s[a] === "[") a += 1;
  while (b > a && s[b - 1] === "]") b -= 1;
  return s.slice(a, b);
};

/** Whether the sidecar's grades give this pointed surface a known stem in the book. */
export const stemsKnownAt = (grades, s) => typeof s === "string" && !!grades && !!grades[s] && Array.isArray(grades[s].st) && grades[s].st.length > 0;

/** The surface and key pairs a word of the zone is asked under: its own, each half's (as written and unbracketed), each piece's. */
export const pairsOfWord = (w) => {
  const pairs = [[w.s, w.k]];
  for (const h of Array.isArray(w.w) ? w.w : []) if (h && typeof h.s === "string") pairs.push([h.s, h.k], [unbracket(h.s), h.k]);
  for (const p of Array.isArray(w.pg) ? w.pg : []) if (p) pairs.push([p.s, p.k]);
  return pairs;
};

/** The keys of one word a card asks its rows' stems under, given the sidecar's grades. */
export const keysAskedAtWord = (w, grades) => {
  const out = new Set();
  for (const [s, k] of pairsOfWord(w)) if (typeof k === "string" && k && stemsKnownAt(grades, s)) out.add(k);
  return out;
};

/** Every key of a book its rows' stems are asked under: the zone's words, halves and pieces, and the graded surfaces' own keys. */
export const keysAskedWithStems = (zone, grades) => {
  const out = new Set();
  for (const [s, g] of Object.entries(grades || {})) if (stemsKnownAt(grades, s) && g && typeof g.k === "string" && g.k) out.add(g.k);
  for (const sec of (zone && zone.sections) || []) for (const w of sec.words || []) {
    if (w.mark) continue;
    for (const k of keysAskedAtWord(w, grades)) out.add(k);
  }
  return out;
};
