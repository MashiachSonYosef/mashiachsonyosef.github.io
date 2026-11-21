# RULE — call 5's other-source rows, and v188's three maqaf-key lines, back under the plain key (call 5 returns v1)

20 November 2026 AD. Corpus lane (Moses). Written before the builder. Nothing served is changed: this is a landing list for the serving lane.

## Why

Relay v189's call 5 struck 5,760 rows standing under keys that end in a maqaf, keys the page never looks up. 1,294 of them (class `OTHER_SOURCE_TWIN`) were struck although their words stood under the plain key only from another source; v189 carried for each, as a branch, a re-key to the plain key that would keep the row's own source. The owner's rule of 7 November is that a source's records stay its own, and the recommendation that the store keeps one reading per dictionary now stands (the owner, 15 November: «just push the ledgers»). The serving lane asked (letter of 15 November, ask 4): «Call 5's 1,294 rows back under the plain keys, each credited to its own source beside the other ("1 pill with 2 M"), as a landing list in v188's shape.» And (ask 5): v188's three lines under a maqaf key, lines 961, 1881 and 1983: «say drop, or reissue them under the plain key».

## The lines

`call5-returns-v1.jsonl`, in the shape of v188's landing list: `m, key, rank, route, action, to_key, kind, why, source, headwords, definition, year, facts, record_loc, record_file, rid, item`.

1. **Call 5's other-source rows.** For each line of v189's `call5-maqaf-keys-v1.jsonl` whose `class` is `OTHER_SOURCE_TWIN`: the struck row as the store served it before ship 4 (the store copy at store_version 4d1357b26ca5, the store v189 was read at), found by its key, rank, source and text; landed under its plain key (`to_key` of its branch), with its own source, words, definition, headwords, year and facts, `kind` call5_return. `rank` is left for the page to give at landing (the highest served rank under the key plus one, in the list's order), as it gives a re-keyed row its rank.
2. **v188's three maqaf-key lines.** For each line of v188's landing list whose key ends in a maqaf: reissued under the plain key, `kind` fold_strike_whole, its own source kept. Where a served row of the same source under the plain key already prints the same words, it is dropped instead, and the drop is listed with that row.
3. A line is not written where a served row of its own source under the plain key prints the same words now (store_version 54416ff5785b, the page's store as served); such a line is listed apart with that row.

## Checks, each a hard stop

1. Every call-5 line's row stands in the store copy v189 read, at its key, rank, source and text.
2. Every landing line's plain key is its key with the maqaf taken off, and no served row of its own source there prints its words now.
3. A second count by another road agrees: the class read again from v189's list, the rows joined again from both stores by their own reader.
4. No path of this machine and no name of its owner in any file written.
