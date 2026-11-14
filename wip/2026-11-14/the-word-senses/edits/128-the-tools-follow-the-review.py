# The review of 14 November 2026, the tools' side.
#  tools/bake-word-senses-v1.mjs: its header says it is the ledger for no letter ("LEDGER: -"), as its reason says: it
#    judges no row and changes no text; it said "M R" and then "no frame letter".
#  tools/check-search-v1.mjs: its model of the index leaves out the word senses as the bake does (a word sense gives no
#    pill at rest, and the index takes none), so a fault in the bake's skip turns it red instead of agreeing with it.
# Refused unless each text stands once.
# python3 -I 128-the-tools-follow-the-review.py <reader dir>
import os, sys
R = sys.argv[1]
def edit(rel, pairs):
    p = os.path.join(R, rel); s = open(p, encoding="utf-8").read()
    for old, new in pairs:
        n = s.count(old)
        if n != 1: sys.exit(f"{rel}: expected one of {old[:90]!r}, found {n}")
        s = s.replace(old, new)
    open(p, "w", encoding="utf-8").write(s); print(f"{rel}: {len(pairs)} edits")
edit("tools/bake-word-senses-v1.mjs", [
    ("""// LEDGER: M R
// no frame letter. It reads the corpus lane's pinned list (M, the source the
// rows are Jastrow's; R, their route text) and the Jastrow overlay beside the
// store, and writes one record, data/word-senses/jastrow-v1.json. No row is
// judged here and no text is changed.""",
     """// LEDGER: -
// no frame letter. It reads the corpus lane's pinned list and the Jastrow
// overlay beside the store, and writes one record, data/word-senses/
// jastrow-v1.json. No row is judged here and no text is changed."""),
])
edit("tools/check-search-v1.mjs", [
    ("""  for (const id of overlayIds) {
    const oix = await maybeJson(`${DATA}overlays/${id}/index.json`);
    if (!oix) continue;
    await inPool(HEX2, 16, async (h) => {""",
     """  // a word sense gives no pill at rest (word-senses-rule-v1), and the index
  // takes none: the model leaves out the rows the record names, by key, rank
  // and source id, as the bake does, so a fault in the bake's skip shows here
  const senseRows = new Set();
  { const ws = await maybeJson(`${DATA}word-senses/jastrow-v1.json`); for (const [K, list] of Object.entries((ws && ws.rows) || {})) for (const [rank, m] of list) senseRows.add(`${K}|${rank}|${m}`); }
  for (const id of overlayIds) {
    const oix = await maybeJson(`${DATA}overlays/${id}/index.json`);
    if (!oix) continue;
    await inPool(HEX2, 16, async (h) => {"""),
    ("""        for (const row of rows) {
          const src = (oix.m_sources || {})[row[3]];
          if (!src) continue;
          // an overlay's division slots stand at 8 and 9""",
     """        for (const row of rows) {
          const src = (oix.m_sources || {})[row[3]];
          if (!src) continue;
          if (id === "jastrow" && senseRows.has(`${K}|${row[0]}|${row[3]}`)) continue;
          // an overlay's division slots stand at 8 and 9"""),
])
