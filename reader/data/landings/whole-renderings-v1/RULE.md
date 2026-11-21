# RULE — the two whole renderings whose halves are withheld (whole renderings v1)

20 November 2026 AD. Corpus lane (Moses). Written before the builder. Nothing served is changed: this is a landing list for the serving lane.

## Why

The store's cut began after the colon of a verse reference inside Strong's bracket, so two of Wikisource Strong's (M14) renderings became halves: «48 marg)» under 13 keys of Strong's H6238, and «8 (defective plural))» under 2 keys of H4482. The lane's v146 rejoin list (`fragments/rejoin-v1.jsonl`) gave each its whole text. The page held those 15 lines (its row round of v146's rejoin list, `left_off`: «its record's other renderings are missing from the store … held until the missing renderings land with it») and withheld the halves (the round whose list is `withhold-store-halves-v1.jsonl`). The lane's v147 landed the other renderings. The serving lane asked (letter of 15 November, ask 6): «Row round 12's two whole renderings, still missing from 15 cards … Please land the two whole renderings (a landing list).»

## Terms

- **The store**: the page's store as served now, store_version 54416ff5785b. **The row strikes**: the page's `row-strikes-v1.json` as served with it.
- **A held rejoin line**: a line of v146's `rejoin-v1.jsonl` that the row strikes' round for that list names in `left_off` with the reason that its record's other renderings were missing.
- **The half**: the row the held line names (`rows`, one row: rank and route).
- **The siblings**: the store's M14 rows under the line's key, at the half's rank, whose definition holds the line's `rejoined_text`.
- **A rendering of a definition**: Strong's list of renderings is the part of the definition after its first colon that stands outside round brackets, up to its first full stop outside round brackets (as «. See עָשָׂר.» closes H6238's list). The list is cut at every comma that stands outside round brackets, and each part is trimmed.

## The lines

`whole-renderings-v1.jsonl`, one line per held rejoin line, in the shape of v188's landing list: `m, key, rank, route, action, to_key, kind, why, source, headwords, definition, year, facts, record_loc, record_file, rid, item`, and `half_withheld`.

- `route` and `item` are the held line's `rejoined_text`; `rank` is the half's rank, where the siblings stand now; `kind` is `whole_rendering_of_a_withheld_half`.
- `headwords`, `definition`, `year` and `facts` are the siblings' (they must agree among themselves).
- `record_loc` and `record_file` are those v147's landing list gives the same record (`strongs`) under the same key.
- `rid` is null: the catalog holds the half, not the whole.
- `half_withheld` names the half (rank, route) and says it stays withheld.

## Checks, each a hard stop

1. The held rejoin lines are those the row strikes name for this reason, and each names one row.
2. Each half is withheld in the row strikes' round for `withhold-store-halves-v1.jsonl`, at its key, rank and route.
3. Under each key, the siblings stand at the half's rank, at least one, all with one definition, one year and one set of facts; and no M14 row under the key prints the whole rendering now.
4. The whole rendering is a rendering of the siblings' definition, and the half is its tail.
5. v147's landing list gives one record_loc and one record_file for the record under the key.
6. A second count by another road agrees (`verify-whole-renderings-v1.mjs`).
7. No path of this machine and no name of its owner in any file written.
