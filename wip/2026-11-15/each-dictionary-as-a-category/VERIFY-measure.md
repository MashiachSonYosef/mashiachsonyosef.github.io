# Verify: what each kind supplies (15 November 2026)

This note checks the reader's MEASURES-what-each-kind-supplies.md against the tree at main 857a3dc0fb (scratchpad/old). The scripts and outputs are in scratchpad/v69/verify-measure/. There was no earlier run of this check, so everything here is new.

## 1. The fourteen live cards

`check14.mjs` is my own comparison and does not use validate14.mjs. It takes the reader's rebuild (card-lib.mjs and card.mjs) and compares it with cards-genesis-1-verbs-live-857a3dc0fb.json:
- It compares each pill as a multiset of (text, sorted M ids), so a duplicate text would be caught.
- It compares the order and the pressed pill.
- It tallies kinds on both sides.

Result:
- 14 of 14 cards are the same.
- Live has 264 pills and the rebuild has 264. All 264 match exactly on text and carriers.
- All 14 cards are in the same order, and all 14 have the same pressed pill.
- Live has no duplicate texts on any card.
- By kind, live and rebuilt are identical: 1:193, 2:32, 3:13, 4:25, 5:1.

**Holds.**

## 2. Two whole books by an independent road

`chain-kinds.mjs` does not rebuild anything. It reads the page's own browser recording of every card (chain/<book>/chain-v1.json.gz) for Amos and Zechariah.
- Each pill's source-label hashes are mapped to M ids, and the ids to a kind by my own placement: the corpus record (BIBLICAL 1, ARAMAIC 5; UNDECLARED split by label, so Wiktionary/Kaikki/DBnary is 2 and the rest is 4), plus the overlay indexes (Jastrow 3, Samaritan 6, span and piece stores 1).
- No label hash is shared by ids of different kinds, and no hash went unknown.

| Book | Recorded by kind | Reader's perBook |
|---|---|---|
| Amos | 1:74947 2:10610 3:6650 4:14241 5:339 6:292 (107,079) | identical |
| Zechariah | 1:128016 2:16929 3:11545 4:21483 5:508 6:464 (178,945) | identical |

**Holds.** The limit: the chain books are only the twelve Minor Prophets. No Aramaic stretch and no Torah book could be checked this way. Genesis is covered only by the 14 cards.

## 3. Lines against resting-lines

`lines-check.mjs` reads reader/data/resting-lines directly and places kinds my own way.

| Book | Lines (the record's own count) | By kind |
|---|---|---|
| Genesis | 20,470 (20,470) | 1:20385 2:74 4:11 |
| Daniel | 5,882 (5,882) | 1:5866 2:3 4:2 5:11 |
| Amos | 2,022 (2,022) | 1:2012 2:4 4:6 |

All 39 books:
- 1:301,257, 2:1,129, 4:559, 5:14. These are the reader's totals exactly.
- Lines credited only to PIECE ids: 299,933.
- Non-kind-1 lines: 1,702, of which 1,632 stand over more than one word.

Small differences in the named line texts (my count against the reader's):

| Line | My count | Reader's |
|---|---|---|
| "Epithet of the God of Israel: the Lord of Hosts" | 220 | 218 |
| "therefore" | 145 | 144 |

The other named texts match: "the Jewish people" 370 [Wikidata], "human, common name of Homo sapiens" 98. The reader may have counted joined runs only; I did not trace it.

## 4. Classes, 20 distinct pills drawn at random from each

The draw used seed 69 (`sample.py`, output in `sample.out`). `weigh.py` then split three classes by places.

| Class | Fit | What the sample shows |
|---|---|---|
| Grammatical note | 20/20 | |
| Given name or surname | 20/20 | Many are the biblical names themselves: Aaron, Isaac, Rachel. |
| Concept list's capital label | 19/20 | NIR is a Wikipedia title. |
| Encyclopedia title | 20/20 | Defined by family. Mixes transliterations, modern things (Rubella) and biblical names (Sanballat, Kohen). |
| Later Jewish sense | about 18/20 | Shabbat as "weekly day of rest" is biblical. |
| Species | about 18/20 | Mostly the right referent named by taxonomy: sycamore, myrtle, cedar, hyssop, goat, "adult male of the cow species" for פר. Not a wrong-sense class. |
| Numbers/dates | about 16/20 | ראובן "twelve tribes"; PanLex שבת "Sunday"; MUSE שלישי "tuesday". |
| Peru shape (same text withheld by the name gate at that card) | 20/20 | eli, shaul, kelly, shalom, Levi, Karen ... |
| Jastrow on Hebrew verses | not a class of sense | The class is a location. Many sampled senses are plausible biblical senses: lift up, uncover, succeed, wait. "Rabbinic or Aramaic sense" is not shown by the measure. |
| "No shared content word" | about 12 to 14/20 another sense | The rest are grammar notes (conjugation, defective spelling), transliterations (ramon, Abbun), a Jastrow grammar label (Nithpa) and right readings worded otherwise (created, captured, silvery). This confirms it is an upper bound. |

Three classes need correction:

**Modern prefix, suffix, abbreviation (28,819 places): does not fit.**
- 18 of 20 sampled are verb conjugation notes matched by "(prefix/suffix conjugation)".
- By places:

| Part of the class | Places | Distinct texts |
|---|---|---|
| Bound forms in "-" (-less, Super-, -fold) | 11,875 | 25 |
| "Alternative form of the prefix" and abbreviations | 4,502 | 16 |
| Conjugation notes | 12,442 | 225 |

- Real modern prefixes and abbreviations come to at most 16,377 places. The other 12,442 belong to grammatical notes.

**Modern country, city or region (52,784): about 5 of 20 truly modern.** The rest are:
- biblical places (Jebus, Gihon, Goshen, Geshur);
- "state of" grammar ("construct state", "absolute state");
- "region of the body";
- leopard "Africa and Asia".

By places:
- 27,658 name Israel or Jerusalem. Most of these are biblical Israel; "State of Israel" and "Jewish republic" are modern.
- 5,720 are "state of" phrases (construct state, a state of being, a state of hostility).
- 19,406 are other, including "region of land" and the Irish penny.

The real modern count is well below half of 52,784. It is not measured.

**Letter of an alphabet (36,081): 28,372 places alphabet (46 distinct); 7,709 another sense of "letter".** The other sense includes Jastrow "letter" on את (4,178), "letter (written message)" and "blood-letter".

## 5. Before or after the gates

| Figures | State |
|---|---|
| Pills by kind, family only/shared, shut-a-kind, cards opening on a kind, all pill classes, overlap, function-word share, Jastrow on Hebrew verses | After the gates: the rebuilt resting cards, validated as above |
| Lines | After everything: the page's own recording (resting-lines, sha-checked) |
| withheld_rows and asked_rows; the withheld side of the Peru counts; Classical Hebrew's 28,283 name rows | Before the gates (rows) |
| 12 Nov grades | Pills as the page served them on 12 November, an older build |
| 14 Nov grades | 48 chain-book cards from relay v184 packs, not weighted |
| Lifted pass | Stopped, not used |

## Other notes on the result

- **"words_where_it_is_on_the_card" mixes two definitions.** Kinds 2 to 6 take shutKind (any carrier; for kind 2, 260,606). Kind 1 takes byKind (best-placed carrier). By best-placed, kind 2 is on 258,604 cards.
- **Kind 6 is nearly all Cowley.** MSAM1 carries 39,618 of the 39,647 pills only kind 6 carries, and Nicholls (MSAM4) 29. MSAM5 is English Wiktionary's Samaritan Hebrew lemmas and sits in the Samaritan overlay, but it carries no resting pill, so the placement moves nothing at rest.
