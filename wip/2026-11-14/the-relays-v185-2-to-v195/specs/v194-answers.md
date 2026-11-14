# v194-answers

## Verified

FETCH AND HASH. I downloaded 26 keys under r2 v2/ledgers/all/elijah-asks-2026-11-14/ into dl-v195/v194-answers/, about 0.36 MB in all, with no file near 60 MB. All 19 files the letter lists (FOR-ELIJAH-v194.md lines 68-86) match on bytes and sha256: 19 OK, 0 mismatched, checked by v53/v194-answers/hashcheck.py. The letter on the store (sha256 e52e428b...cdcc1) is byte-identical to the copy under dl-v195/v2/letters/ and to FOR-ELIJAH-v194.draft.md, and it equals relay_sha256 in ship-v194/RECEIPT-ship.json. two-runs-v1.txt gives the same 7 output hashes in both runs, and they match the letter. verify-receipt-v1.json reads agree:true, fails:[].

FIGURES RE-DERIVED BY MY OWN SCRIPTS (v53/v194-answers/):
(1) Made spaces, section 4 item 3. Read from v188's landing-fold-strike-v1.jsonl (11,581,861 B, sha c1990493..., 4,252 lines, the file the count names) against the page's own pinned lists, which are the same bytes Moses counted against: made-spaces-v1 M9 c984e782..., M5 5fc6db69...; made-spaces-v2 M46 2f8b86bc.... Landing lines M9 80 / M5 236 / M46 21 / M14 58 = 395. Texts 121/296/20/112 = 549. In a list 30/62/0/0 = 92. In no list 91/234/20/112 = 457. For the addendum 345. With the sign 14, all M5. Each source's set equals the matching set in made-spaces-v188-texts-in-no-list-v1.jsonl exactly. HOLDS. Cross-check: the 14 sign texts are exactly the 14 texts v188.1 adds to the M5 list (v1.1 list against the page's v1 list: 14 added, 0 removed).
(2) Names addendum, section 3. I held all 26 lines against the page's own store. data/route-store/index.json has sha 1cd2e558..., the same index names-addendum-receipt-v1.json names, at store_version 4d1357b26ca5. All 26 are found by k, rank, m and the first 16 hex of sha256(route), with route and definition byte-equal. None is in name-rows-v1.jsonl and none carries `name` in slot 10. By source: M13 4, M17 9, M18 4, M23 5, M25 1, M60 2, M72 1. That is exactly the page's data/names/names-v1/receipt-v1.json partly_a_name (lines 180-185) plus unreached (lines 186-190). The 5 M23 lines read "no part of speech given". HOLDS. Five lines share key, rank and m with a second row, so only the sha tells them apart: עדן 11 M17, טוסון 1 M25, כף 95 M60, אביזרי 3 M72, אבזרי 7 M60. No list line of v185.2, v187, v188, v188.1, v189, v191, v192, v193 or v195 names any of the 26. 18 of them have a v190 row-entries line, and their texts are unchanged.
(3) TBESH, section 2, on the page store. M19 rows served: 2,645, the same as "wins ... at 2,645". Numbers with a served M19 row lettered H or later: 294. Of those, numbers with no served M19 row lettered G: 166. M19 rows with a small letter: 0. HOLDS. The sums check: 113+9+17 = 139, and 139+27 = 166. MACULA's kinds: 1,149+30+1,065+40+2 = 2,286. Small-letter TBESH entries, from RULE.md line 17's own list: 5+1+4 = 10. Early lines: 10+1+3 = 14. v188 does bring back «Jezreel» (יזרעאל rank 1), «Amminadab» (עמינדב 1), «Gilboa» (גלבע 1) and «Ir» (עיר 14), but credited to M3 (MACULA), not TBESH.
(4) Stem map, section 5. The page's tools/stem-family-v1.mjs lines 19-26 and zone.html lines 3105-3112 hold 31 names pointing at 8 heads, and Moses's copy (amendment lines 9-14) equals them. Part A adds 11 new names, giving 42 names and 8 heads. A+C gives 43 names and 7 heads. The one-lookup property holds in A, A+B and A+C. The whole map at amendment lines 61-69 equals map + A + C exactly. "61 rows of Jastrow" equals the page's stems-extension receipt: by_source M12 55 + M49 6. A+B's 201 = 184 (verify-receipt: B within the 61 rows' pairs) + 17 (B alone: 21 − 4). HOLDS.

NOT RE-DERIVABLE HERE, because the seats' files are not shipped: the ruling-6 measures (76,188 / 451,716; 34,219 / 94,940; 26,921 / 68,549), MACULA's word pairs, the names v2 counts, and the individual stem pairs.

## Landing spec

## What the page lands from v194: nothing served

No apply tool runs for v194. The store, the slots and the sidecars stay as they are. There are three items: a record, a measured code change, and a future tool change.

### 1. Names addendum: pin it and hold it (record only)
- **When:** after this round's store moves, so it is held at the final store version.
- **What to copy, byte for byte,** into `reader/data/names/names-v177-addendum-v1/`:
  - `answers-v1/names-v177-addendum-v1.jsonl` (10,331 B, sha 99a414fb..., 26 lines)
  - `names-addendum-receipt-v1.json` (sha 9f0bf4a5...)
  - `RULE.md` (sha 7b7a0408...)
- **Pin:** add an `addendum` entry to `reader/data/names/PIN.json` (relay v194, letter r2:mishkan/v2/letters/moses-elijah-asks-2026-11-14/FOR-ELIJAH-v194.md).
- **Do NOT** pass the file to `tools/apply-name-rows-v1.mjs`. None of the 26 is a name row, and that tool would mark them.
- **Check:** add a clause N7 to `tools/check-names-gate-v1.mjs`:
  - the addendum is the pinned bytes;
  - each line finds exactly one store row by (k, rank, m, sha16), with route and definition equal to the line's;
  - that row carries no `name` in slot 10;
  - the counts by source equal names-v1 receipt `partly_a_name` + `unreached`.
- **Key by sha.** Five lines share key, rank and m with another row.
- **Its later use:** this is the exemption list that the page's own reverse-gate note asked for (THE-NAMES-GATE-BOTH-WAYS §2, "would treat those 26 as not names"). Use it in the re-measure for owner question 4.

### 2. Stem family amendment: measure first, then wire as `stem-family-rule-v3`
The map is the page's own. Earlier joins (v105.1) were wired by the page lane without an owner ruling.
- **When:** after v188 and v190 land and the round re-projects. The stem test is asked after the entry gate and the pointing (zone.html 7520-7710), and both move this round.
- **Measure:** a new read-only tool, `tools/measure-stem-amendment-v1.mjs`. For A, A+B and A+C, with the page's own order (entry gate → pointing, with `attested` → piece → stem), count:
  - (a) card pills whose verdict moves, by source, at attested and at unattested places separately;
  - (b) resting-line leaders that move (the rowLeader logic of `project-lattice-v12-v1.mjs` 555-566);
  - (c) the change in the counts behind «N of another stem than X, withheld».
- **Read by hand** 20 pairs per draft. Include Daniel 4:16:6, Daniel 8:27:11, Isaiah 63:5:4 and M46 שמם rank 60 «that, because».
- **Wire:**
  - always the five certain lines: palpel, ithpolel, ithpalpal, nithpalpel, nithpoel;
  - on the measure, the six readings plus C (Moses's lean), or plus B (the narrow fallback);
  - in `tools/stem-family-v1.mjs` 19-26 and `zone.html` 3105-3112, identically, with a new `STEM_FAMILY_RULE_ID`.
- **Then:** re-project, so the sidecars' `binyan.rule` moves.
- **Checks:**
  - `check-pointing-gate-v1.mjs`: page map = tool map (lines 153, 198);
  - `check-stems-extension-v1.mjs`;
  - `check-stems-carried-v1.mjs`;
  - a new clause: every stem name in `data/stems-extension/stems-extension-v1/receipt-v1.json` by_source.*.stems is a map key or a head. Today 11 fail; after A, 0.

### 3. Made spaces: nothing from v194
- **v188.1 carries the lists.** Pin them with v188 in `data/made-spaces/PIN.json`, run `apply-made-spaces-v1.mjs` again, and hold with `check-made-spaces-v1.mjs`.
- **v194's count is only information.** Its 92 in-list texts are v188.1's 92 changed lines, and its 14 sign texts are v188.1's 14 new M5 lines.
- **After the skip:** v194 counted all 395 landing lines. Once v188 skips its 48 maqaf lines (19 of them are M5 17, M46 1, M14 1), the figures are at most:

  | | All 395 lines | After the skip, at most |
  |---|---:|---:|
  | Texts | 549 | 534 |
  | In a list | 92 | 91 |
  | In no list | 457 | 443 |
  | For the addendum | 345 | 331 |
  | With the sign | 14 | 14 |

- **Item 2 (future, not now):** when the M9 ledger is reissued with print fields, `apply-made-spaces-v1.mjs` must read the list's "closes moot" mark instead of refusing a row that has both a print slot and a close.

### 4. STEP's letters, TBESH's G entries, small letters, the row of 3.6: nothing to land
- The entry gate stays `entry-gate-rule-v1`, and the bare H4397 row stays kept.
- If the owner answers yes to question 1, Moses must send a list mapping TBESH's 447 "a Meaning of" entries to their targets. The page would then write `entry-gate-rule-v2`, which folds those letters, measure it, and ship.

### Order
1. v189 call 5
2. v188, skipping its 48 lines, with v188.1 pinned
3. v190
4. v195's 5 lines that wait on v190
5. One re-projection
6. v194 item 1: pin and N7, at the final store
7. v194 item 2: the measure, which ships nothing
8. The stem wiring in a ship of its own

Every ship ends by merging main into gh-pages ("gh-pages follows main") and pushing gh-pages.

## Depends on

- v189 call 5, then v188 (skipping its 48 maqaf-flagged lines) with v188.1 pinned with it. v188.1's lists replace v194's made-spaces count. The 17 TBESH G readings that stand nowhere (H3157G «Jezreel», H5992G «Amminadab», H1533G «Gilboa», H5893G «Ir») come back only through v188, credited to M3, not TBESH.
- v190 (row entries v1.1). It keeps, unchanged, the v1 sentence that v194 says is wrong about small letters, and its rewrite of the facts slot has to come before the stem measure.
- v195's lines that wait on v190, then one re-projection of the round. The 26 addendum rows are held, and the stem drafts measured, on that final store and those sidecars.
- The owner's answers to v194 section 6, items 1 to 4, before any change to the entry gate or the names gate.

## Moves at rest

Nothing. v194 changes no served byte: no store row, no slot, no resting line, no pill, no count. Pinning the names addendum and adding check N7 move nothing either. If the stem amendment is wired later, this is what it can move. Draft A cannot move a resting line. The eleven names are only on Jastrow rows (M12 55, M49 6), no Jastrow source id is a store source, and the line is baked from store rows only (project-lattice-v12-v1.mjs 555-566). On the card, A moves Jastrow pills only where no store row matches the place's pointing (the `attested` test). All 180 of A's pairs have pointing grade x, and at places where the pointing matches, zone.html 7697-7703 withholds grade-x overlay rows by the pointing before the stem is asked. At those unattested places the counts behind «N of another stem than X, withheld» go down. Options B and C do touch store rows: M18 carries ithpaal 14 and hithpaal 9, B touches M3 [ithpoel] at Isaiah 63:5:4 and M46 שמם rank 60 at Daniel 4:16. So B and C can move resting lines; measure that before wiring.

## Put back to the corpus lane

- Ruling 6 figures not reconciled. Section 2 (line 25) gives 76,188 places / 451,716 rows as ruled, against the page's 75,998 / 450,215 (page letter of 13 November, section 3.4). That is 190 places and 1,501 rows apart, and the letter does not say why. Please give the store version and the variant (the f-summary's 'whole-word keys'). The owner is about to be asked on these figures.
- The small-letter sentence. Line 29 says it 'gets reworded at that rule's next version'. Row entries v1.1 (v190), shipped the same day, is that next version, and its RULE.md lines 11 and 21 keep 'every clause' of v1. So v1's RULE.md line 74 ('MACULA's small ones', the page's pinned copy data/row-entries/row-entries-v1/RULE.md:74) is still in force. Please reword it now as an amendment to v1.1, or name the version that will.
- Made spaces, item 3 (line 49). The example «[ בְּקִיעַ , בָּקִיעַ ] n.[m.] fissure , breach» comes right after 'so do some of the provider's own spaces'. But v188.1 closes all four of its spaces as made spaces (closes [1,10,21,38]) and adds it as a new M5 line. All 14 sign texts are v188.1's 14 new lines. Please say plainly that the 14 hold made spaces and the other 331 hold none.
- Made spaces count. The count covers all 395 landing lines. In the lane's own order, v189 call 5 runs first and v188 skips its 48 maqaf lines, 19 of which are M5 17, M46 1, M14 1. After that skip the figures are at most 534 texts, 91 in a list, 443 in no list (M5 221, M46 19) and 331 for the addendum. Please state the count after the skip, as v188.1 section 3 does for its lists.
- Made spaces, item 2 (line 47). Please name the field by which the reissued M9 list or ledger will mark a row's closes as moot. The page's letter of 13 November (section 5, item 2) asked to be told before it ships. Until the field is named, apply-made-spaces-v1.mjs refuses such a row.
- Line 27 says 'the Jastrow overlay, which is off at rest'. On the page, overlay rows enter the card at rest (zone.html 7503-7504, overlay-rule-v2). Only the resting line is baked from the store alone, and only Jastrow's word senses rest off. If the meaning is 'not on the resting line', please say so: the words of the 9 numbers are on the card at rest.
- Line 23, 'The rest are people, places, names of another entry...': the rest of which set? 2,268 − 447 − 181 ('a Name of') − 1,496 = 144, and 447 − 330 = 117. Please name the set and count it by relation.
- Line 27, 'TBESH's year is 2026': that is the build's year. The page store serves M19 rows with slot 4 set to S_NO_SOURCE_YEAR (2,409 rows), 1890 (122), 2023 (68) and 2026 (46). Please say which year decides the credit, and whether the mixed served years are intended.
- Names v2 reading clauses, under the owner's no-claims ruling (no-claims doc line 17). The OmegaWiki 'class list I chose' (374 of 387 rows) is the lane's reading, not OmegaWiki's own mark. x-pn and the gentilics need the same treatment. Each should be the source's own mark, or go to the owner before names v2 runs.
- The reverse gate (section 6, item 4) is put with the trade at Rimmon but no reach. The page measured the narrow converse for the 7 sources read for names: 65,627 row×place, 16,319 name places, 6,961 rows (THE-NAMES-GATE-BOTH-WAYS line 24). That was before WordNet's and Strong's marks. Please send the rows their own source marks as a common word, so the page can measure before the owner rules.
- RULE.md line 23: 'licences' should be 'licenses' (American spelling, as CLAUDE.md requires).
- Low priority: the amendment (lines 79-83) could say that A+B's 201 = 184 (the 61 rows' pairs under B, as the verify receipt gives them) + 17 (B alone: 21 − 4 the other way). The 433 rows whose English is only a stem's name (line 88) are waiting on their own strike or mend list; nothing is needed now.

## Owner questions

- STEP's later letters (v194 section 6, item 1). Should an entry that TBESH files as 'a Meaning of' another entry of the same number count as that entry's word? As ruled: 451,716 rows withheld at 76,188 places by Moses's count (the page's own count is 450,215 at 75,998). With yes: 94,940 at 34,219, so about 356,776 rows at 41,969 places would come back. Context for the owner: call 6 was already answered 'Ruling 6's reach: kept as ruled' on 14 November (OWNER-ANSWERS line 12), before STEP's own relation column was read. 'A meaning of' is STEP's own statement, so counting it is the source speaking, not the site (no-claims line 17). TBESH's link column gives a third reading (68,549 rows at 26,921 places), and the letter does not offer it. Under both readings, the bearers of one name still stay apart.
- Gentilics: with the names, or apart? Names v1 counts gentilic places apart and does not treat them as names. TBESH sets apart 49 rows as gentilic (LG/PG). Strong's x-pn mark covers 263 entries, gentilics and months among them. TBESH's 5 TG rows (נפלים, רפאים, נפיסים, אפרסתכיא) are groups, and its key does not name that code.
- Rows that give a name's meaning and that their own source marks as a name, such as BDB's «gaze» under צפו, marked n.pr.m.: are they names or readings? Strong's «pomegranate.» at Rimmon is the same kind.
- The reverse gate (v194 section 6, item 4). At a name place, should rows that their own source marks as common words be held back? The trade at Rimmon: WordNet's grenade row «a small explosive bomb thrown by hand or fired from a missile» goes, and Strong's «pomegranate.» goes with it. PanLex's and ConceptNet's «grenade» stay, because sources that mark no names stand both ways. The page's earlier recommendation was to keep the gate one way (THE-NAMES-GATE-BOTH-WAYS line 34). Under the no-claims ruling there is another way: label such a row on the card in its source's terms instead of withholding it (no-claims line 18). Put this question only together with a measure of its reach.
- Only if the corpus lane keeps it for names v2: may a class list chosen by the lane make a row a name (OmegaWiki: 374 of 387 rows)? Or only the source's own name mark (OmegaWiki: 13 rows)?
