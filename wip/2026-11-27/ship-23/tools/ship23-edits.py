# Ship 23's two edits beyond the place card, applied to the ship tree after the copy: the chapter head and the
# basis note say the chapter is its number (no «chapter title: no name is on record» over «commonly read as»),
# and the door's gloss under a book's Hebrew title is STEP's reading where the title stands in the book's first
# verse, not the store's oldest reading of the title's letters anywhere («bee» under Deuteronomy's title).
# Usage: python3 -I ship23-edits.py <tree root>
import sys, pathlib
root = pathlib.Path(sys.argv[1])
def edit(rel, old, new):
    p = root / rel; s = p.read_text(encoding="utf-8")
    assert s.count(old) == 1, (rel, s.count(old), old[:80])
    p.write_text(s.replace(old, new, 1), encoding="utf-8")

# 1. the chapter head
edit("reader/zone.html",
'''      const r1 = document.createElement("div"); r1.className = "nh-row";
      r1.append(Object.assign(document.createElement("span"),
        { className: "nh-lab", textContent: `${MAJOR} title` }));
      if ((n.name_tokens && n.name_tokens.length) || n.name_he) {
        const t = titleRow(n.name_tokens, n.name_he);
        if (n.y) t.dataset.namedBy = n.y;
        r1.append(t);
      } else {
        r1.append(Object.assign(document.createElement("span"),
          { className: "nh-he unnamed", textContent: "no name is on record" }));
      }
      const r2 = document.createElement("div"); r2.className = "nh-row";
      // a named sequence's node carries the sealed id's own words, which is a
      // record and not a reading anybody forces
      r2.append(Object.assign(document.createElement("span"),
        { className: "nh-lab", textContent: NAMED_SHAPE ? "recorded as" : "commonly read as" }));
''',
'''      // THE CHAPTER IS ITS NUMBER (28 November 2026). The Hebrew text names no
      // chapter, and every source on this shelf (STEP, MACULA, the edition)
      // addresses a chapter by its number, so the number is the record, not a
      // common reading: where no record names the chapter, the head prints the
      // number plainly and no title row. Until this day every chapter of the
      // thirty-nine books printed «chapter title: no name is on record» over
      // «commonly read as Chapter 2», which read as a title that failed to load
      // over a number nobody records.
      const named = !!((n.name_tokens && n.name_tokens.length) || n.name_he);
      const r1 = document.createElement("div"); r1.className = "nh-row";
      if (named) {
        r1.append(Object.assign(document.createElement("span"),
          { className: "nh-lab", textContent: `${MAJOR} title` }));
        const t = titleRow(n.name_tokens, n.name_he);
        if (n.y) t.dataset.namedBy = n.y;
        r1.append(t);
      }
      const r2 = document.createElement("div"); r2.className = "nh-row";
      // a named sequence's node carries the sealed id's own words, which is a
      // record and not a reading anybody forces; a name's English is a reading
      // of the name; a bare number is the sources' own address and wears no label
      if (NAMED_SHAPE || named) r2.append(Object.assign(document.createElement("span"),
        { className: "nh-lab", textContent: NAMED_SHAPE ? "recorded as" : "commonly read as" }));
''')
edit("reader/zone.html", "      nh.append(r1, r2);\n", "      if (named) nh.append(r1);\n      nh.append(r2);\n")
edit("reader/zone.html",
     "Chapters and verses are numbered as the source text numbers them, in the order of this book\\u2019s contents record. No chapter carries a name here: no source on this shelf gives one.",
     "Chapters and verses are numbered as the source text numbers them, in the order of this book\\u2019s contents record.")

# 2. the door's gloss under a book's title
edit("reader/tools/build-front-door-v1.mjs",
'''  const titleKey = (z.work_he_tokens || []).map((t) => t.k).filter(Boolean)[0] || null;
  const titleGloss = titleKey ? (STORE.glossFor(titleKey).text || "") : "";
''',
'''  // THE TITLE IS READ AT ITS PLACE (28 November 2026). The store's oldest
  // reading of the title's letters anywhere gave «bee» under Deuteronomy's
  // title and a dictionary's definition of the book under Leviticus'. A
  // title is a word only where it stands in the text: many books are named
  // by their opening words, or by the prophet their first verse names, and
  // there the gloss is STEP's reading of that word at that place
  // (titleGlossAt). A title that does not stand in the first verse carries no
  // gloss. The hover still names the store's record for the printed reading
  // (glossSource), so a reading no record carries under the key is not shown.
  const titleKey = (z.work_he_tokens || []).map((t) => t.k).filter(Boolean)[0] || null;
  const atPlace = titleGlossAt(z);
  const titleGloss = titleKey && atPlace && glossSource(titleKey, atPlace) ? atPlace : "";
''')
edit("reader/tools/build-front-door-v1.mjs",
     "const titleReading = (tokens, en) => {\n",
     '''// A book's title read where it stands: each word of the title is found in the
// book's first verse, as the whole word (the gloss is STEP's pieces joined as
// STEP writes them) or as the word's core piece (the gloss is that piece's),
// by the zone's own piece readings from STEP (pg, s "tahot"). Every word of
// the title must stand there, or there is no gloss.
const titleGlossAt = (z) => {
  const keys = (z.work_he_tokens || []).map((t) => t.k).filter(Boolean);
  const first = (z.sections || [])[0];
  if (!keys.length || !first || first.label !== "1:1") return "";
  const out = [];
  for (const k of keys) {
    let hit = "";
    for (const w of first.words || []) {
      const pg = (w.pg || []).filter((p) => p.s === "tahot");
      if (!pg.length) continue;
      if (w.k === k) { hit = pg.map((p) => p.g).join("/").trim(); break; }
      const core = pg.find((p) => p.r === "core" && p.k === k);
      if (core) { hit = String(core.g).trim(); break; }
    }
    if (!hit) return "";
    out.push(hit);
  }
  return out.join(" ");
};
const titleReading = (tokens, en) => {
''')
print("edits applied")
