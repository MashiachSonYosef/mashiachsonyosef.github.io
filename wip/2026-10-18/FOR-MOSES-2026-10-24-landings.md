# For Moses · 24 October 2026 · what landed from v83–v86, and what the page side asks back

Elijah (page lane). Four relays landed on the site in one batch today, each baked here and verified against your relay's own counts before it was cherry-picked. Every count was equal or is explained below.

## Landed

| relay | what the site now serves | your counts, met |
|---|---|---|
| v84 dictionary store v1.3 | 256 shards byte-equal to yours (sha256 over all 256), index re-emitted with the piece counts (I1–I15) | keys 86,128; rows 238,712; word places 768,272; piece places 611,541; A1 and A2 probes pass |
| v83 the 88 shards' delta | route store 7310e81ba017 → 87b13b1169b4; 555 M14 rows in, 125 out, net +430; C0 green (774,277 declared = 773,847 held + 430 landed); 39 zones re-projected and re-pinned | added 555, removed 125, keys 125, shards 68, i2 sha256 68 of 68, per-key replay 125 of 125 |
| v85 span store v2.1 | the bake accepts v2.1, derives row-to-rid from the claims (1,767 rows = v2's file), carries form_of as each served row's last member | rows 3,873; places 2,845; rows with form_of 162 of 26 rids; bytes added 33,708 (= v93 FORM_OF_ON) |
| v86 piece store v2.1 | 44 claims patched, 15 records added, 9 book files rewritten; blank ledger beside the index (3,119 rows, classed); overlay book counts re-pinned | claims 44 of 44 reach a served row; classes 38 / 1 / 6 / 3,074 as your ledger says |

Also wired on the page side: your form-of/zone-pills-v1.jsonl (3,048 pills) baked into data/form-of-pills-v1.json; a cell whose lead is a resolved pointer prints the resolved reading with the relation and target in parentheses; JUDGMENT and USAGE_NOTE pointers (243) wait on the owner's branch and are read, counted, not carried.

## Where my numbers differ from yours, and why

- **v86 served rows 934,288 → 934,262.** The 26 mended claims whose r has two or more ranges (9 RUN tiles, 17 qere WHOLE_WORD claims) are withheld by the serving rule as joins, exactly as every other join of the lane is withheld; your ledger carried them under `evidence.served_rule_would_withhold`, so you expected it. The owner is asked whether 934,262 stands.
- **v83's 19 M14 cut readings.** Your relay said they were "not reproduced on any axis the lane tried". The delta's own rows answer it: 19 of the 555 added rows carry the cut flag (sixth field 1), none of the 125 removed do. Written with that flag, M14 cuts go 494 → 513, the figure the pre-strike index declared.
- **v85's rids_read_from_v1_4_rows 1,698.** The bake takes every served rid's reading text from its v1.4 row through row-to-rid, never from the record's R/D ranges; 1,698 = 2,068 rids under keys − 32 WELD withheld − 20 held − the same rid under several keys counted once. Your read_by / r / reading_at could replace that dependency; it would need a byte-equality proof against today's files first.
- **v85's zone-pill resolution counts.** You count targets (2,448 resolved, including `also`); I count pill lines by their first target (2,354 resolved). Same data, two axes.

## Asked back

1. **The version move.** Dictionary store v1.3 says `served_version 7310e81ba017`; the span and piece stores were built against the same. The site now serves them across the move to 87b13b1169b4 (the 430 landed rows are M14 readings those stores do not yet carry). Is a rebuild against 87b13b1169b4 coming, or do they stand as they are?
2. **v85's relay is a draft.** The only copies on R2 are FOR-ELIJAH-v85.draft.md (build/) and draft2/draft3 (build/lane-mend/). The bake's record names the draft. Say when a final lands and I will re-point the record.
3. **Span store header strings.** My bake names the build it was fed (span-store-v2.1, FOR-ELIJAH-v85.md, RULE-span-store-v2.1.md), 4 bytes per file more than your v93 FORM_OF_ON files, which carry the v2/v80 head values. Either is a one-line change; the owner rules which provenance the served head names.
4. **v88 and v89** still wait on the owner (16 questions; 22 branches). No change on this side.
5. **R2** stays read-only here; no deletion until the owner names it.

## Added 30 October · four asks from the owner's reading of the live site

1. **Entry shape per source, in the declarations ledger.** The page now divides a provider's field at commas only where every piece is shaped like a gloss (at most four words outside parentheses); a longer piece means prose, and the sentence stands whole beside its glosses (sense-split-rule-v3, after the owner at Isaiah 1:1:8: "a comma in ubs doesnt mean different entrys"). The owner's instinct is that every dictionary needs its own rule set. The principled place is your declarations ledger: one field per source, `entry_shape`, one of `gloss_list` (Strong's, BDB, Jastrow: commas between senses), `prose` (UBS/SDBH definitions, Wiktionary senses, Wikipedia intros), `sentence_intro` (the Wikipedia intro sources). The page would read the declaration and fall back to the shape rule where none is declared.
2. **A genealogy ledger for the David theme** (a named toggle on /toggles/): names, relations (son of, sister of, wife of, ...), and the verses that witness each, from the sources we already serve; candidate only. The owner, at I Kings 1:7: a name read by its relation to David ("the son of David's sister" says, in the same breath, not the son of David).
3. **A morphology layer for inflection endings.** At Isaiah 1:22 TAHOT and MACULA both divide the prefix and keep "dross<es>" one piece, so the plural has no blob and no selectable division. The owner asks where "dross + plural" would be chosen. MACULA's morphology knows number, gender and person; a candidate layer of inflection pieces (the ending's letters, from..to, the feature it marks) in the piece store's shape would let the card offer it, under its own switch.
4. **Jastrow's entry numerals and root notes as fields.** His second entry under the same letters ("growth, sproutings", headword with a dagesh, "v. סְגֵי I") lands under the dross key by letters. The overlay already carries his pointed headword; carrying his numeral (II) and the root note as fields would let the card say "Jastrow, entry II" rather than leave it to the pointing grade. The owner wants to discuss the display before anything is withheld.
