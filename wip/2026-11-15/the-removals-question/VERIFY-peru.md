# Verify: lens Peru (Genesis 1:22:5, key פרו)

15 November 2026. A skeptic's pass over LENS-peru.md. Read only. Scripts and outputs: /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v66/verify-peru/ (an earlier run's measures reused: reach2-old.json, measure2-old.json, measure3-old.json; checked against the reader's own reach.txt, they agree).

## What holds

- Ruling 8 is verbatim: «1-3. ok agree», to «Names. Hide a dictionary's names, such as «Bara», where the word on the page is not a name.» (reader/data/rulings/rulings-v2/rulings-2026-11-13-options-v1.json lines 5, 16-17). The example put to the owner was «Bara»; the Peru pill appears only in the file's own list of effects.
- Ruling 1 (entry gate) «1-5. agree go ahead» (rulings-v1). The pointing default «1 seems like it» (wip/2026-10-15/STATUS-2026-10-16.md line 896). «why not just fix it» (wip/2026-11-06/FOR-MOSES-2026-11-06-print-step.md line 7). «shouldnt it be bundled into 1 pill with 2 M» (tools/gloss-store-v1.mjs line 25). «just push the ledgers we did live bro i cant check everyone before we push stuff» (OWNER-QUESTIONS-2026-11-14.md line 5). All verbatim.
- Names gate counts: 7,412 rows, 3,662 keys, by source as the reader gives; 34,577 name places; 35,029 places and 72,313 row-and-place pairs, recomputed by an independent script. ConceptNet retext: 11,759 rows, 10,242 in place (M1 6,287, M22 3,955), 1,517 folded (M1 1,355, M22 162); «peru (n)» at round 13 row 11746, folded into rank 18.
- Kaikki's B05 label_off: the answers file writes «by the owner, 2026-11-07», but its own ruling field says the page lane carried rulings 2 to 4 of 6 November to it. No ruling on B05 itself. The reader is right.
- Ship dates: 90eedeb6f3 13 Nov 12:31 UTC; 05d4fd0f88 6 Nov 01:40; 7078bab6b0 6 Nov 17:40; ef9e89af36 7 Nov 06:02.
- The pointing switch is still drawn only under ?rail=all on the live page.

## What does not hold

1. **The live site has moved.** origin/main is 46bbbf7d50 (15 Nov 07:56 UTC; gh-pages 8cc09f3ece 07:57), not 857a3dc0fb. The reader's card run was on the 857a3dc0fb reference server. The 23 rows under פרו are the same in 46bbbf7d50's shard (compared row by row). But **the pointer extension of the names gate is live**, not queued: `formOfIsAName` is in 46bbbf7d50's zone.html (lines 3552-3557, 7723) and is absent from 857a3dc0fb. 34 pointers (form-of-pills-v1.json counts.resolved_to_a_name, same in the live file).

2. **Rows 14 and 15 are not withheld on what their source says.** Wiktionary's own record of the verb פָּרָה (the dictionary store, reader/data/dictionary-store, key פרה, records 33059b753d06bd08 M25, fa678cf5e1ed2dbb M13) lists in its own conjugation table `('פְּרוּ', ['imperative', 'masculine', 'plural'])`, the very pointing of the place. The store's M25 rows under פרו carry only the past form פָּרוּ as headword. The pointing grades them "otherwise" because the corpus lane carried one linked form and not the other. The deciding part is the store's carriage: OUR_RULE, with the owner's default. Shelf-wide (measure2-old.json, part C): 30,750 row-and-place pairs graded otherwise although the entry's own table lists the place's form, 29,908 of them where the gate acts, under 693 keys. Also: the quote «therefore should stand, meaning bara cant be cut down», cited by the page and the reader for the pointing default, argues for keeping a reading, not for withholding.

3. **The provider's file is on this machine for Kaikki.** The dictionary store carries Kaikki's own records. They give each M13 row's entry a pointed canonical head form and a part of speech:
   - «Pro-»: pos prefix, head פְּרוֹ (p'ró).
   - «his bull»: pos noun, form of פָּר, head פָּרוֹ.
   - «Peru (a country in South America)»: pos name, head פֵּרוּ (perú).
   - «Third-person plural past ...»: pos verb, head פָּרוּ.
   - «Masculine plural imperative ...»: pos verb, head פְּרוּ (as the place).
   The store's M13 rows carry bare letters (16,224 of 16,225 rows have no pointed headword; measure2-old.json A). So «Pro-» and «his bull» "carry no pointing" in the store only. Their source points them otherwise than the place. Had the store carried Wiktionary's head form, the pointing (the owner's default) would hold back «Pro-», «his bull», «Peru» and the past-form pointer, and keep the imperative. The silence the card reads at these rows is ours, not the source's. That is not a removal, but it is our choice deciding what stays, and the answer_in_short says otherwise.

4. **Names gate basis.** SOURCE_SAYS + OWNER_RULED is right for the row and the ruling, but the gate's edges also decide removals: the Classical Hebrew Words mapping (prn/pln/propn/prpn/prm: 868 rows), gentilic places counted as not names (so name rows are withheld there), and "every entry reached is a name". Basis should carry OUR_RULE too. For Peru itself the deciding parts are the source's own (Kaikki pos name; TAHOT H6509 qal) and nothing ours decides it; Wiktionary's own head פֵּרוּ also differs from the place.

## Missed within the lens

- The stripping of Wiktionary's head form from the M13 rows (above, 3).
- The single-linked-form headword of the M25 rows (above, 2).
- The pointer extension is live (above, 1).
- The page lane's own note GENESIS-1-VERB-CARDS-12-NOV-AND-NOW.md line 30 says OmegaWiki's «Peru» and «Republic of Peru» come «from two sources that mark no names». That is false by letter v194: OmegaWiki marks names by its own part of speech on 13 of 387 rows, just not these. The reader's answer has it right; the note should be corrected.
- Not checked by me: the 158 places of אל (the earlier run's part B2 gives 161 places where Wiktionary points «God, the God of Israel.» as the place, which is consistent); the «4 of 25» of 12 November; the 1 of 400,242 line move.
