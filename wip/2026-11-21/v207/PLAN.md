# Ship 12, relay v207: the plan (21 November 2026, written while ship 11d's round ran)

Page lane (Elijah). Nothing of this is built. It adds to `wip/2026-11-20/v207/WHAT-V207-NEEDS.md`, and corrects one figure in it: the lists name **35** sources, not 34 (17 of Davidson's, 12 of Harkavy's, ETCBC, STEP's expanded Strong, PanLex's two, the translation tables' two).

## 1. The sources come back as the index held them

Every one of the 35 is among the 49 the language admission struck, and none is in the store's index today. Their entries as the index held them are recovered from the history, byte for byte (`the-35-sources-as-the-index-held-them.json`):

- 31 from the index of bb165bf712 (1 September, before the second round): the 17 Davidson, the 12 Harkavy, ETCBC (M8), STEP's expanded Strong (M51).
- 4 from the index before f1bb9455d7 (31 August, before the first round): PanLex M24 and M82, the translation tables M78 and M103.

License postures as they stood: 29 public domain (Davidson 1855, Harkavy 1925), PanLex `cc_by_nc_sa_4_0_conservative_current`, the translation tables `cc_by_sa_gfdl`, ETCBC `cc_by_nc_4_0_noncommercial`, STEP's expanded Strong `cc_by_4_0`. The site already serves non-commercial sources with their attribution (MUSE, PanLex's other table), so none of these is a hold.

14 struck sources stay out: M12, M39, M40, M49, M52, M63, M65, M75, M99, M104, M106, M108, M131, M168. v207 says nothing of their rows (M99 had none).

## 2. What must be built

1. **A re-admission**, as a tool with a pin: the 35 entries back in `index.m_sources`, the 35 ids out of `language_admission.struck_m_ids`, and a third round in `data/language-admission-v1.json` saying the ground: the corpus lane's relay v207 judged each row by what its own source says (the row's own language field; the dictionary's own title; Harkavy's own columns). The rule gains a second version: v1 judged a source by our label. Six tools read `struck_m_ids` and must hold after it.
2. **The hole's rank** in `derive-landings-v1`: for these lists a named rank is the hole the strike left. It is taken where no row stands at it now; where one does, or where a list landed before has taken it, the line lands as a null rank (the lane's own words). 20,106 lines name an empty hole today.
3. **The landing itself**, three lists in the pin's order, 22,630 lines; 4 lines come off a key ending in a maqaf; 9 rows are held by the lane.
4. **The kinds.** PanLex's two keys and the translation tables' two go back into their families (word lists: shut by kind). Harkavy is a new family, a general dictionary (shut by kind since 19 November). ETCBC and STEP's expanded Strong are new families of Bible dictionaries by their own titles.
5. **What rests open.** See section 3.
6. The store steps after a landing (ship 11c's sequence), the round, every resting line against live, the gate, the suite.

### What the admission record itself says about this

`data/language-admission-v1.json` holds, on every source struck for silence, this note: «admission is affirmative: a source answers for a Hebrew or Aramaic span only if it says that is what it is answering about. If this source is a Hebrew or Aramaic lexicon, the fix is a label at the source naming what its own title page names, not an exception here.» Davidson's one source still in the store (M97) was kept because its label names «Hebrew and Chaldee»; his other seventeen were struck because theirs did not, though they are the same book. v207 is that fix made by the corpus lane, row by row: each line's `why` quotes the source's own title or the row's own language field. So the third round is not an exception to the rule. It is the rule's own remedy, with the evidence the rule asked for, and the record should say it in those words.

The returning sources are admitted **for the rows the lane lists**, not wholesale: PanLex returns 3,956 of its rows and 10,052 stay out by their own language field (Yiddish 9,654, Ladino 228, and others).

Davidson's entries carried `sourceYear` 1855 before the strike. M97 carries «S_NO_SOURCE_YEAR» today, by the years ruling (relay v165), and the lane gives every returning line the same. The returning entries follow the years ledger, not the old index.

## 3. What rests open is the owner's twelve, so two things follow

The owner's ruling of 19 November: «12 it is lets go with that for now», and «slowly add». The twelve are the families of kind `bible` in the kinds record. Davidson's Analytical Lexicon is one of them (one key of his is in the store now and rests open).

- **Davidson's 12,487 rows return to a dictionary that already stands.** By the ruling they rest open with it. They carry no wording year (the lane: a year for them is the owner's to rule), so they do not outrank a dated row. I expect few resting lines to move, and each one that moves is read before the ship. If the count is large I stop and send the owner the list instead of shipping it.
- **ETCBC and STEP's expanded Strong would be a thirteenth and a fourteenth.** They are filed as Bible dictionaries, which is what they say they are, and a resting entry holds them shut until the owner adds them: «slowly add» is the owner's to do. Opened by the reader they stand as any shut dictionary does.

So at rest this ship can move a line only through Davidson's rows.

## 4. Asked of the owner when it is measured

- ETCBC and STEP's expanded Strong: add them to the twelve, or leave them a press away. With what each would move at rest.
- A year for Davidson's rows (1855 is the catalog's date; the lane holds 1848 off them).

## 5. Order

Ship 11d (the bridge's pieces) first; it is in its round. Then this, measured in a sandbox before the ship tree is touched.

## 6. The lists against today's store (measured 21 November, on ship 11c's store 88fec6d59737)

`the-lists-against-todays-store.txt` (`measure-v207.mjs`; it reads and writes nothing).

| list | lines | hole empty | hole taken since | no rank | key not in the store | another source prints the words |
|---|---|---|---|---|---|---|
| own language (PanLex 3,956, translation tables 134) | 4,090 | 3,961 | 7 | 122 | 84 | 190 |
| Bible dictionaries (Davidson 12,487, ETCBC 4,246, STEP's expanded Strong 1,431) | 18,164 | 15,679 | 116 | 2,369 | 285 | 2,967 |
| Harkavy | 376 | 341 | 2 | 33 | 60 | 42 |

- **125 holes were taken since the lane read them** (it read at 54416ff5785b; ship 11c's landings took them). By the lane's own words those lines land as a null rank: after the last row of their key.
- 19,981 lines land at the hole the strike left. 2,524 name no rank.
- 429 lines land under a key the store does not hold now: those words gain a card.
- No line's own source prints its words now, and no two lines are one source's same words under one key, so nothing is gathered and nothing is left unlanded by that rule.
- 359 lines of the Bible dictionaries carry a bracket: ETCBC's 340 descriptions («<town>») and 19 others. 99 lines carry a cut.

## 7. Who reads the list of struck sources (the re-admission must hold for each)

`index.language_admission.struck_m_ids` is read by: the route delta (`apply-route-delta-v1`), the dictionary store's bake, the search index's bake, the pointing store's landing (`land-pointing-store-v2-v1`), the zone gloss redrive, the struck-ranks record (`emit-struck-ranks-v1`: it covers the struck ids' ranks, and v207's holes are read from it), the lane state, and six checks (`check-language-admitted-v1`, `check-route-store-exact-k-v1`, `check-search-v1`, `check-store-continuity-v1`, `check-lane-state-v1`, `check-zone-single-pass-receipts-v1`, which holds each zone to the struck list it was emitted under). Each must be read before the list changes: some filter an outside file by it (the lattice's cards, the pointing store's rows), and a source that returns only for its listed rows must not let its other rows in by that door.

## 8. The readers of the struck list, read (21 November, 06:05 UTC)

A read-only pass over the ship tree's tools (a helper's report; the three claims marked "read" I checked in the code myself, the rest are to be checked as each is touched).

**The way back the strike tool itself names** (read: `strike-language-v1.mjs`, the comment over its `languages` clause): «the way back for a struck-but-Hebrew source is to carry the field [`languages`], which is a smaller and more honest edit than rewriting a prose label». A declared `languages` on an index entry is read before the label. Without it the tool, run again, strikes the 35 again, and its repair path writes the record's 49 ids back into the index. So the re-admission must leave the record and the index in a state that tool keeps.

**Doors that open when the 35 stand in `m_sources` again:**

1. `project-lattice-v12-v1.mjs` (read): a lattice card heads a headword stack where its source's label is held, with no row asked. The tool's own note says the struck sources' cards head 8,352 headword stacks on the thirty-nine books. With the labels held again, such a card becomes the line under «the headword» whether or not a landed row carries its words. PanLex returns 3,956 rows of 14,008, so this is a real door. To be closed by asking a served row of that source for the card's words under the key, and measured.
2. `land-pointing-store-v2-v1.mjs`: drops rows by `m_sources`; a rebuild of its candidate would take every row of a returning source. The candidate is not served and its proof would fail. Not run by the round.
3. `bake-dictionary-store-v1.mjs`: refuses a lane build by the struck list, whole sources. Latent: the served dictionary store holds none of the 49.
4. `bake-search-index-v1.mjs`: filters the span store by the struck list. Latent: no span row is on any of the 49 today.

**Laws that a third round must keep true** (as reported): `check-language-admitted-v1` judges every index entry by its label alone (read), so 23 of the 35 fail it as labeled; it also ties the index's count of struck sources, the struck-ranks record's covered ids (49, which never shrinks) and the count of rounds to one another. `check-lane-state-v1` S2, S3, S5. `check-store-continuity-v1` C1 to C3: the returning rows must be counted as landed in the row-strikes record, which is what the landing tool writes; lowering the struck total instead breaks C3. `check-route-store-exact-k-v1` L7: no row may stand on a struck id, so the ids leave the list in the same step the rows land.

**So the order inside the ship:** the record's third round and the index's list first (with each returning entry carrying what its own source says it is), then the rows, then the round; and the lattice's door closed before the round reads the lattice.

**Holes already taken.** Ship 9's fold landing put other sources' rows at 2,601 of the returning sources' holes (ETCBC 2,072). The lane's lists already give those lines no rank (2,524 lines), and my measure found 125 more taken since by ship 11c: all land after the last row of their key, never at a taken hole.
