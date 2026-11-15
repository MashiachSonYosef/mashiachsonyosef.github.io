# RULE — the fold-strike landing (landing v1)

14 November 2026 AD. Corpus lane (Moses). A seat of the lane wrote this list and its scripts on 14 November, a second seat tried to refute them, and the lane adopted both here with the second seat's corrections marked. Nothing served is changed: this is a landing list for the serving lane.

## What went wrong

The store build kept one route per key and words, and credited it to one source (`PREDECESSOR_ORDER_D_THEN_OLDEST_KNOWN_NUMERIC_YEAR_M`). (The served store has since gained rows by later landings and by reading some sources in pieces, so it now holds some key and words more than once; the build did not.) Every other source that printed the same words under the same key stood behind that one row. Later the store struck some sources whole: the language admission (the m ids it did not admit) and the source strike (M20). Where the struck source held the credit, its row went out, and with it every admitted source that printed the same words under that key. Those admitted readings were never struck; they were lost by the fold. The error is the lane's: the fold and the strikes were each right alone, and no one counted what the two did together.

This list puts each such reading back as the store build itself would have served it had the struck source never been there. The lasting mend is a store with one row per key, words and source, which is the owner's to rule on.

## The lines

`landing-fold-strike-v1.jsonl`, one line per reading to land, in the shape of the earlier landing lists, field for field: `m, key, rank, rank_from, route, action, to_key, kind, why, source, headwords, definition, year, year_rows_at_rank, rows_at_rank, record_loc, record_file, rid, item`. `kind` is fold_strike_whole, or fold_strike_piece where the store reads the source's text as pieces. Added fields: `cut`, `cit_local_pointer`, `cit_external_pointer`, `row_ordinal`, `d_id`, `r_id`, `evidence_support_id`, `headwords_of_the_credited_source_at_this_key_and_words`, `credited_in_the_build_to` (the struck source and its definition), `the_choice`, `admitted_sources_asserting`, `reading`, `route_served_whole_now_by_another_row`, and the flags below.

`left-out-v1.jsonl`: every reading the rule leaves out, with why and the evidence.

## How a line is made

1. **Which routes.** Every route of the store's own input (the compcell `k-r-routes`) whose credited source (`primary_m_id`) the store has struck whole. Of these, the ones where an admitted source (one the page's `m_sources` names now, not struck) asserts the same key and route are the candidates. Every assertion of these routes belongs to an admitted or a struck source.
2. **The credit.** The build's own two steps (`build_three_lane_successor_lprms_rdm_compact_successor_v1.mjs`, lines 83-108), run over the admitted sources' assertions only: first the definition (lowest status penalty, then lowest source_priority, source_order, p_group_id by bytes, evidence_support_id by bytes, row ordinal); then, among the rows of that definition, the credit to the row with the oldest known year (no year last), then the same order. `route_primary` is 0 for every row, since the catalog v86 header has no `route_primary_support` column and the build read it as absent. The year is the m's `s_source_year_or_no_source_year`, read by the build's own `numericSourceYear`.
3. **The test.** `replicate.mjs` runs the same code over all assertions of every route and must give the build's own credit (evidence id, definition and source) at every route of the build's routes file and every route the store read (`replication-test-v1.json`). Run over the struck-credited routes with every assertion, it must give the struck source every time (`counts-v1.json`, `choice`).
4. **The words.** The route's text read as the store builder reads it under the credited source (`readingOf` of `genesis-book-reader-v4/tools/declaration-v1.mjs`, run, not changed): whole for every source but Strong's concordance (M14), which the store reads in pieces at commas outside brackets.
5. **The rank.** The hole the struck row left. `struck-ranks-v1` holds under each key the rank and m of every row the strikes took. A line takes the build's `semantic_route_rank` of its route when struck-ranks holds exactly that rank under the key with the struck source the build credited; then `action` is land. Every piece of a route takes the route's rank, as the builder gives it.
6. **Left out.** A reading is left out when a row of the page store prints it under the key now, compared by bytes and with white space read as one space. The row-strikes record is read too, and every reading it acts on is named in the evidence; a reading left out by the record alone would be named so, and the receipt counts them.
7. **The cut.** The store's rule 8: a line whose words stand inside a longer route of the same key, source and definition, among the rows served now and the lines of this list, is marked `cut` 1, or refused where its licence does not let the store show a cut.
8. **The headwords** (slot 6) by the store's own rule: the catalog rows at the key under the same source label whose words are the line's words (for M14, a comma piece of them).
9. **The year.** The year slot most rows of that source carry in the page store now, with `year_in_the_build` beside it. *Corrected by the second seat:* where the two differ, it is because the year ruling of 23 September 2026 AD set row slot 4 to the ruled wording year (store 94bc125695bf to 3411c86e94e7, moses-year-repair-v1.1), not the source-year rule of 10 November, which moved only 2 years in the store.

## Flags, for reading, not reasons to leave a line out

- `near_copy_served_now`: a row under the key prints the same words but for capitals or edge marks. *Corrected by the second seat:* the lines where a Strong's (M9) row under the key is the same words with a closing full stop are counted as such in `counts-v1.json` (`near_copy_served_now_by_strongs_m9_with_a_closing_full_stop`), not by the first near copy found.
- `near_copy_in_this_list`: two lines of this list under one key are near copies of each other.
- `served_now_under_the_key_with_a_maqaf`: the same words are served now under the same key with a maqaf at its end. If the rows under keys that end in a maqaf are moved to the plain key (the audit of 13 November, v182), those words would print twice under the plain key: one of the two must give way.
- `jastrow_overlay_prints_the_words`: the Jastrow overlay prints the same words under the key. The overlay is candidate only and off at rest; with it on, the page merges readings by text.
- `admitted_sources_asserting`: every admitted source that printed the words. The build kept one route per key and words, so only the build's choice lands here and the others stay behind it.
- A landed row has no row-entries line. Whatever the page's entry gate does with a row that has none, it does here.

## Inputs

Each by sha256 in `counts-v1.json` (`inputs`): the store's own inputs (the compcell routes, the rdm-compact routes, residuals and r, d and m identities, each checked against the sha256 the page's index names, `input_checks`), the page store (`index.json` and its shards, by store_version), struck-ranks-v1, the row-strikes record, the Jastrow overlay, and the store builder's reading code. The catalog v86 is read by the second count.

One input does not match: the local `declarations-v1.json` is not the one the page's index names, and the site does not serve that file. It matters only for M14, the one source the store reads in pieces; the second seat found that any comma rule gives the same pieces for the M14 lines here, so the effect is very likely nil.

## Proof by a second road

`second-count.mjs` reads the admitted sources' assertions from the catalog itself, by key, words and the source's five-field tuple, not from the residuals or their ids; chooses the credit again on the catalog's own fields; and must agree with the first count on every total and with every line of the list on source, definition and evidence id. It stops if not.

## Checks, each a hard stop

1. The replication test gives the build's own credit at every route (`replication-test-v1.json`, mismatches 0).
2. Every candidate route finds its hole; no hole is taken by a row now; no two lines share a key and rank.
3. The second count agrees.
4. No path of this machine and no name of its owner stands in any file written.

usage, in order, each with the same six arguments: `node --max-old-space-size=3072 replicate.mjs`, then `landing.mjs`, then `second-count.mjs`, each followed by `<999 footsteps folder> <the Tabernacle folder> <page store copy: index.json and shards/> <struck-ranks-v1.json.gz> <row-strikes-v1.json> <Jastrow overlay copy: index.json and shards/>`.
