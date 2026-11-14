# tools/bake-word-senses-v1.mjs: a listed word sense's bare twin is held back with it. Jastrow's overlay serves a
# bracketed note twice: a row whose definition field is the entry with its bracket, and a twin whose definition field
# is the route itself, under the same key and source id. The corpus lane lists both twins where it found the note in
# the record (PLAIN_NOTE, NOTE_WITH_MORE), but only the bracketed row where it found it by the definition field
# (ITS_DEF_FIELD): 456 twins under 428 keys stood at rest as blue definitions beside the count of word senses held
# back (the review of 14 November 2026: Obadiah 1:8, «retentive» by M39). The record carries them apart, named as
# twins, and the page holds them back as it holds the list's own. Refused unless each text stands once.
# python3 -I 124-the-bake-holds-the-twins.py <bake-word-senses-v1.mjs>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
one("""// THE LEGEND. The owner's wording, «brackets mean sense, not definition»,""", """// THE TWINS. Jastrow's overlay serves a bracketed note twice: a row whose
// definition field is the entry with its bracket, and a twin whose definition
// field is the route itself, under the same key and source id. The lane lists
// both where it found the note in the record, but only the bracketed row
// where it found it by the definition field (ITS_DEF_FIELD), so the bare twin
// stood at rest as a definition beside the count of word senses held back
// (the review of 14 November 2026: Obadiah 1:8, «retentive»). The record
// carries such twins apart, as twins, and the page holds them back with the
// list's own: an unlisted row under a listed word sense's key and source id,
// printing its route, whose definition field is that route and nothing else.
//
// THE LEGEND. The owner's wording, «brackets mean sense, not definition»,""")
one("""  const keys = [...rows.keys()].sort();
  // the legend, and the served rows whose record card it holds on""", """  // the twins: an unlisted row under a listed word sense's key and source id, printing its route, whose definition
  // field is that route
  let twins = 0;
  const listedAt = new Set(lines.map((r) => `${r.k}\\u0001${r.rank}\\u0001${r.m}`));
  for (const r of lines) {
    if (r.branch !== "WORD_SENSE") continue;
    for (const x of overlayRowsOf(r.k)) {
      if (!Array.isArray(x) || x[3] !== r.m || x[1] !== r.route || x[2] !== r.route || listedAt.has(`${r.k}\\u0001${x[0]}\\u0001${x[3]}`)) continue;
      if ((rows.get(r.k) || []).some(([rk, m]) => rk === x[0] && m === x[3])) continue;
      if (!rows.has(r.k)) rows.set(r.k, []);
      rows.get(r.k).push([x[0], x[3]]);
      twins += 1;
    }
  }
  const keys = [...rows.keys()].sort();
  // the legend, and the served rows whose record card it holds on""")
one("""    counts: { rows: senses, keys: keys.length, by_m: Object.fromEntries(Object.entries(byM).sort()) },""",
    """    counts: { rows: senses, twins, keys: keys.length, by_m: Object.fromEntries(Object.entries(byM).sort()) },
    twins: "the rows below hold the list's word senses and their bare twins: an unlisted row under a listed word sense's key and source id, printing its route, whose definition field is that route (counts.twins); the corpus lane lists both twins where it found a note in the record and only the bracketed one where it found it by the definition field",""")
one("""    console.log(`word senses: ${record.counts.rows} rows under ${record.counts.keys} keys · the legend""",
    """    console.log(`word senses: ${record.counts.rows} rows and ${record.counts.twins} twins under ${record.counts.keys} keys · the legend""")
open(p, "w", encoding="utf-8").write(s); print("bake-word-senses-v1: the twins")
