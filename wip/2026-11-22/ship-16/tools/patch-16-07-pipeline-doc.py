# Ship 16, patch 7: PIPELINE.md says what ship 16 does. Ship 12's paragraph (its patch 9) said what ship 12 would
# have landed and was never shipped; relay v210 corrects relay v207, so the paragraph is said again for what lands
# now: the translation tables for their admitted rows, PanLex held with its source, Harkavy and the Bible
# dictionaries not pinned, and the source record from the ledger v1.1. Applied after ship 12's patch 9.
# Usage: patch-16-07-pipeline-doc.py <reader>
import io, sys
p = sys.argv[1] + "/PIPELINE.md"; s = io.open(p, encoding="utf-8").read()
def swap(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new)
swap("""> Ship 12 (the corpus lane's relay v207 of 20 November 2026: the rows our
> own label struck, judged again by what each row's own source says) adds
> no step to the round either. A source the language admission struck
""", """> Ship 16 (the corpus lane's relay v210 of 21 November 2026, which corrects
> its relay v207: the rows our own label struck, judged again by what each
> row's own source says, under the source ledger v1.1) adds no step to the
> round either. A source the language admission struck
""")
swap("""> struck. A source returns whole, or for its listed rows alone where each
> row's own language field decides (PanLex, English Wiktionary's
> translation tables); only the landings write rows, and
""", """> struck. A source returns whole, or for its listed rows alone where each
> row's own language field decides: English Wiktionary's translation
> tables (M78, M103) return so, for the 126 rows the ledger v1.1 admits.
> Only the landings write rows, and
""")
swap("""> gzipped and weighed as the bytes it holds (`tools/pinned-v1.mjs`). The
> ledgers' manifest says why a returning source has no ledger (`excluded`),
> and the kinds record files its key. The relay's third list, the Bible
> dictionaries (Davidson's seventeen other sources, the ETCBC's glosses,
> STEP's Expanded Strong tags), is proved and not landed: the record names
> its sources as held for the owner's word, with why.
""", """> gzipped and weighed as the bytes it holds (`tools/pinned-v1.mjs`). A
> list's pin may hold sources back (`held_sources`, each with why): every
> line of such a source is named not landed, held with its source, and
> nothing of it lands. PanLex's lines of the own-language list (M24, M82)
> wait so on the Zohar's prefix split, and the record names PanLex as held,
> so it stays struck. Harkavy's list (withdrawn by the lane, refused by the
> owner) and the Bible dictionaries' (the owner's to add) are not pinned;
> the record names both, with why. The ledgers' manifest says why a
> returning source has no ledger (`excluded`), and the kinds record files
> its key. `data/source-corpus-v1.json` is emitted from the source ledger
> v1.1, and `tools/check-source-corpus-v1.mjs` holds a witness of a label
> the ledger judges row by row (BY_ROW) to the rows its `admitted_rows`
> names, by m, key and words.
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)
