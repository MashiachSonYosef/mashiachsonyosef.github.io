# Ship 12, patch 9: PIPELINE.md says the re-admission and the landing at a strike's holes.
import io, sys
p = sys.argv[1] + "/PIPELINE.md"; s = io.open(p, encoding="utf-8").read()
old = """> `tools/check-landings-v1.mjs` holds the landings: every line accounted for
> once, one round per list in the pin's order, and each landed line standing
> as its row with its entries.
"""
new = old + """> Ship 12 (the corpus lane's relay v207 of 20 November 2026: the rows our
> own label struck, judged again by what each row's own source says) adds
> no step to the round either. A source the language admission struck
> returns by `tools/readmit-sources-v1.mjs` (readmission-rule-v1), run once
> before its rows land: `data/readmission-v1.json` names each returning
> source with what its own source says it is, the languages that names and
> its index entry as the store held it; the tool puts the entry back with
> those languages (the admission reads them before any label), moves the
> source from the struck to the re-admitted in the index, and marks it in
> the admission's record. The strike's own figures stand: 49 sources were
> struck. A source returns whole, or for its listed rows alone where each
> row's own language field decides (PanLex, English Wiktionary's
> translation tables); only the landings write rows, and
> `tools/project-lattice-v12-v1.mjs` takes a lattice card of such a source
> for the headword's line only where a served row of that source speaks it.
> The lists of this relay are lists of HOLES (`a_named_rank_is` in the pin):
> a line's rank is the hole its row left, which the struck-ranks record
> must hold for that source under that key; the row lands at it, or, where
> another row stands at the hole now, after the last row and the last typed
> hole of its key, as a line with no rank does. A large list is kept
> gzipped and weighed as the bytes it holds (`tools/pinned-v1.mjs`). The
> ledgers' manifest says why a returning source has no ledger (`excluded`),
> and the kinds record files its key. The relay's third list, the Bible
> dictionaries (Davidson's seventeen other sources, the ETCBC's glosses,
> STEP's Expanded Strong tags), is proved and not landed: the record names
> its sources as held for the owner's word, with why.
> `tools/check-readmission-v1.mjs` holds the re-admission: the record
> against the lists, the index, the admission's record, and every row of a
> returning source a landed line's. `tools/strike-language-v1.mjs` keeps a
> re-admission when it is run again.
"""
assert s.count(old) == 1; s = s.replace(old, new)
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)
