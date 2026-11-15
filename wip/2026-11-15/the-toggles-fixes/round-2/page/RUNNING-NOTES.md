# The page part of the toggles fixes, round 2: running notes (15 November 2026)

Tree: scratch pt, branch toggles-fixes (from cdd93e381f). The page part edits reader/zone.html only, and the checks
that hold its fixes. Probes and logs: scratch v75/page/ (probes/, out/, out/checks/, merge/).

Note on the tools: a tool call's text turns a written `־` into the character itself; lines with escapes are
written through a script (v75/page/escape-code.py) and every added line is scanned (v75/page/scan-added.sh).

## Order of work (the brief's)

1. N1 the concordance's «0 locations» for a default source's own words.
2. N2 one unit a source reads at two words printed twice.
3. N3 a source press repaints every built line in one task.
4. N4 the first card at rest rebuilt (and its pills moved) when the book file lands.
5. N7 a kept source's book file asked after the zone and the index.
6. N8 MACULA's title with STEP switched off; N9 «TAHOT» beside «STEP» on one card.
7. The question-3 hold in the page's comment; check-line-reads-the-place-v1 P3 on Ruth.

## 1. N1 (done, 47c5a68277)

Reproduced (probes/n1-concord.mjs, out/n1-concord-{live,tree-before,tree}.json): live and the tree before, Ruth with
the concordance on, said «0 locations» at 1:19:8 and 3:14:2 at rest (STEP's own words), at 1:1:1, 1:1:5, 1:19:8
under MACULA, 1:1:3 and 1:19:8 under UBS and under BDB (STEP's words filling there). After: each says «1 location»
with «here · Ruth …» first; MACULA's «and happened» at 1:1:1 says «2 locations» (here and Ruth 3:8:1, where MACULA
reads the same words).

How: renderDictTab files the default sources' own readings beside the store's for the whole word (madeOf): every
place of the book with these letters where a source reads those words (each pick, as the card makes its pills,
from the book file; STEP's own words and STEP's leaves from the index before the file), this place among them,
by the store's byte equality; a place takes the store's language where the store reads it there. A block's own
letters are counted as before. (The places of the book by their letters are made once a page: DICT.atLetters.)

New check tools/check-concordance-counts-the-line-v1.mjs: K1 at rest at the places of STEP's own words drawn (the
first work by size that draws one: nahum, 2 of its 5), K2-K4 under each source over the work's first 24 words that
stand alone. Live: K1-K4 FAIL («0 locations», 11 min 40 s, since live's page never says ready at rest); tree: all
pass, 100 s. check-dictionary-toggle-v1 on Amos: all pass on the tree (68 s).
