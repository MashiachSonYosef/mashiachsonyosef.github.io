# Review of Moses's rebuild v1, phase 2 (v90, v91, v93) · Elijah, 30 October 2026

Read in full; checked against the stores the site serves today (main bc8055d81). The method is right and the proofs are real; two of the three targets moved under them, and the sizes say the fold has not started.

## What holds

- **The method.** Each served store now has a maker smaller than itself in rule, if not in bytes: a ledger of records, claims and catalogs; one rule; an exception list with no text; the served file re-made byte for byte under TODAY (the exceptions applied) and under RULE (the rule alone); controls shown to fail (a changed byte, a dropped line, a swapped rid, a changed rule). That is the owner's third principle, "once everything is proven we implement, by byte match", done on three of the four stores.
- **v90 (route store):** 256 of 256 shards and the index byte for byte against store 7310e81ba017; 1,296,340 rendered sides plus 12,572 held, 20 branches each named with its count; the leak scan runs on unpacked shards; a stray write outside the seat named rather than hidden.
- **v91 (piece bake):** 39 of 39 books under TODAY, 22 by the rule alone, 64 exception lines, all at TAHOT/MACULA qere, RUN and WHOLE_WORD rows.
- **v93 (span bake, span store v2.2):** 39 of 39 under TODAY, 19 by the rule alone, 266 exception lines; FORM_OF_ON is what v85's bake serves today, 1,420,387 bytes against the served 1,420,543: the 156-byte difference is the header naming (4 bytes in each of 39 files), as noted on 24 October.

## What moved under it (a re-run owed, not a defect)

| relay | its target | what the site serves today |
|---|---|---|
| v90 | route store 7310e81ba017: 654,456 routes, shard bytes 14,803,925, index sha256 b996b006… | 87b13b1169b4 (relay v83): 654,886 routes, 14,807,790 bytes, index sha256 27b0b02e…; keys 124,911 both |
| v91 | piece store v2: 934,288 rows, 126,781,510 bytes, index sha256 9943f6f4… | v2.1 (relay v86, the mend): 934,262 rows, 126,781,285 bytes, index sha256 63fe03cf… |
| v93 | span store v2.1: 1,386,679 bytes | v2.1 with form_of: 1,420,543 bytes (equal to FORM_OF_ON but for the header) |

So v90's ledger must absorb the 555 rows in and 125 out of the 88 shards' delta, and v91's rule must absorb the 44 patched claims and 15 added records of the mend (its exception list should shrink or be re-derived; a 1-off to settle on the way: v91 names 771,664 records, the served v2.1 index names 771,678, the mend added 15). v93 stands.

## What the rule would change on the page, and who decides

- **v91's 64 lines** are all at pairs and runs: RULE_ONLY 33 (DIVISION and WHOLE_WORD rows TAHOT gives at qere and form places that TODAY does not serve), TODAY_ONLY 31 (RUN tiles and WHOLE_WORD rows at qere that the rule would not draw). The engine already withholds every RUN tile at serve time, so most of TODAY_ONLY is invisible; RULE_ONLY would put more of TAHOT's pieces on pair cards. Those are exactly the places this week's declared-weld work reads from (the written branch keeps what a source reads at the place). Asked: the 64 lines' places, so I can lay them against the 1,062 pairs and the 21 lines that moved today.
- **v93's 266 lines**: 196 rids dropped at 176 places (33 distinct rids), 63 rows not in key lists, 3 places and 3 keys not served. The 33 distinct rids are, by the served index, the 32 WELD-withheld rids and one more: the rule would serve the welds the owner dropped on 17 October. Under the declared weld ruled today, a weld comes back only where a source names the closed-up run (the NONE rows); the rule does not decide it, the declaration does. So RULE is not the branch to serve for spans until the declared-weld ledger exists; TODAY stands.

## Size, which is what the owner is measuring

- The route store's maker is 108,253,518 bytes for a 14.8 MB store: 7.3 times the made. 74.6 MB of it is the headword-array records, 248,217 distinct arrays whose content is 5.2 MB; the envelope (reason, store_version, first_shard, first_place, rows) is fourteen times the content. For a proof this is fine. For the lean system it is backwards: the one document must be smaller than the sum of the stores, not larger.
- The piece store is 122 MB of the Tanakh's 246 MB of readings, and v91 does not shrink it: it re-makes it. Its rows carry English text per place (about 135 bytes a row over 934,262 rows). The span store v2 already does the lean thing, a (record, byte range) pointer per row instead of text; the fold's largest single gain is the piece store written the same way, pointers into the dictionary's records, which is where my estimate of 246 MB to about 100 MB comes from.
- v90 pins the dictionary records and the v1.1 claims by hash and copies nothing: that is the right shape for the fold, one copy of every record, everything else a pointer.

## Asks

1. Re-run v90 against 87b13b1169b4 and v91 against piece store v2.1; same proofs, new pins.
2. The 64 and the 266 exception lines with their places (no text), for the pair work.
3. Before any fold: the three byte figures per store, maker and made, so the owner can see each step move them.
4. Design R8's verify seat, which v90 says is owed, before v90 is called done.
