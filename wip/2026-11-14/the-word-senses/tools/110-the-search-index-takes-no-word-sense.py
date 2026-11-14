# bake-search-index-v1.mjs, word-senses-rule-v1: a row of Jastrow's the corpus lane lists as a word sense gives no pill
# while its switch rests off, so it enters no search, as a note of a numbered sense enters none. Refused unless each
# text stands exactly once. python3 -I 110-the-search-index-takes-no-word-sense.py <tool>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:90]!r}, found {n}")
    s = s.replace(old, new)
one("""  const rows = readShards(join(DATA, "overlays", id, "shards"), (oix.counts || {}).shards);
  const pillsHere = pillsUnder(oix);
""", """  const rows = readShards(join(DATA, "overlays", id, "shards"), (oix.counts || {}).shards);
  const pillsHere = pillsUnder(oix);
  // A WORD SENSE GIVES NO PILL AT REST (word-senses-rule-v1): a row of
  // Jastrow's the corpus lane lists as a word sense is held back from the card
  // while its switch rests off, where it rests, so it enters no search; a
  // reader who turns the switch on meets it on the card. Named by key, rank and
  // source id, as data/word-senses/jastrow-v1.json names it.
  const senses = new Set();
  if (id === "jastrow") {
    const wsPath = join(DATA, "word-senses", "jastrow-v1.json");
    let ws = null;
    try { ws = JSON.parse(readFileSync(wsPath, "utf8")); } catch (e) { fail(`the word senses record cannot be read at ${wsPath} (${e.message}): refusing to write a search index that would take them as readings`); }
    for (const [K, list] of Object.entries(ws.rows || {})) for (const [rank, m] of list) senses.add(`${K}|${rank}|${m}`);
  }
""")
one("""      const src = (oix.m_sources || {})[row[3]];
      if (!src) continue;
      overlayRows += 1;""", """      const src = (oix.m_sources || {})[row[3]];
      if (!src) continue;
      if (senses.has(`${K}|${row[0]}|${row[3]}`)) continue;
      overlayRows += 1;""")
open(p, "w", encoding="utf-8").write(s); print("bake-search-index-v1.mjs: 2 edits")
