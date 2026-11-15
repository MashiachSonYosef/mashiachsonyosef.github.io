# The combined ship, 15 November 2026: every resting line against live

The ship tree (`S/ship`, branch ship-next) carries the corpus lane's ships 2 (v192, the read words) and 4 (the store round: call 5, v188 with v188.1, the facts through the follower), the default sources' first fix round, and the dictionaries that rest shut. After the round's lines step, every resting line of the 40 records (39 books and the Tikkunei Zohar) was set beside live's (main 46bbbf7d50), and each line that moved was put in the class that owes it, judged under the word's own key (`lines-compare-v2.mjs`; the list: `LINES-MOVED-v2.json`).

## The count

400,474 lines live; 4,259 moved; none unexplained.

| class | lines | what it is |
|---|---|---|
| store-v188 | 3,646 | under the word's key a row relay v188 landed prints the new line's reading (3,626 on the Tikkunei Zohar, 20 in the 39 books) |
| kinds-shut | 556 | the line live drew credited a source the kinds shut whole, or a row of the credited source that rests shut; 10 of them now print STEP's own words, 1 also has a v188 carrier |
| kinds-shut (its words) | 39 | a run whose line a shut source drew fell to its words, which TAHOT's pieces now carry («Mount Zion» to «[the] mountain of» «Zion»; «EVERYWHERE» to «in + every» «place») |
| kinds-rank | 2 | the reading lost a carrier that rests shut, and with it its rank (Esther 9:17 «three» to «+ fork», the design's case) |
| read-words | 16 | the 13 lines of the plan at relay v192's places, and 3 where the place's words also lost a shut source's line (Ezekiel 8:6, I Samuel 20:2, and the two «Rabshakeh») |

The largest kinds lines: «the Jewish people» (Wikidata) to «the Children of Israel, Israelites, Jews» (English Wiktionary) at 370 places; «human, common name of Homo sapiens, ...» to «son of man; human being (literally, son of Adam)» at 97 (Ezekiel); «people of the Land (of Israel)» to «commoners, laymen» at 21; «Rabshakeh» to «Rabshakeh, a Babylonian official» at 14.

## How the first comparison went wrong, and was mended

The first classifier (`S/v76/lines-compare.mjs`) matched a moved line's text against rows met anywhere in the store, and tried the kinds before the store round. It filed 965 Tikkunei Zohar lines under the kinds, which leave that work whole, and 6 store lines as rank losses (Ezekiel 9:4 «nay» to «behold»: no row under that word's key that prints «nay» rests shut; v188 landed «behold» there). The second classifier names each word's key from the ship's zone and asks the store under that key only, and gives the kinds classes to the 39 books alone. Every class it gives was then read again by a second road (`lines-verify-kinds.mjs`, `lines-explain.mjs`).

## What the store round does to the Tikkunei Zohar's line

The Tikkunei Zohar has no witnessed order: its line is the store's reading carried by the oldest source. v188 lands 4,201 rows the fold and the whole-source strikes had lost, many of them Strong's (1890), so where a landed row joins a reading, that reading now has the oldest carrier and leads. 3,626 lines move: 754 where no line stood (568 «this», 49 «third», 30 «water», 27 «death», 22 «Gehinnom»), and 2,861 from one reading to another, mostly for the better («debt» to «Moses» at 137 places, «hitherto» to «now» 133, «mother, female parent of the subject» to «mother» 141, «Ijob» to «Job» 84, «Jirmejah» to «Jeremiah» 71, «asking» to «prayer» 53).

**A class that is worse:** a landed Strong's row that is a name now leads at a word that is not one: «young» to «Bani» (96 places), «fat» to «Beri» (65), «know» to «Jada» (52), «them» to «Ham» (24), «number» to «Minni» (24), «do» to «Esau» (21), «dust» to «Epher» (20), «mandrake» to «Dodai» (19), «north» to «Zephon» (19). The landed rows carry no facts (slot 10; the ship 4 store builder's report said so: «none of the 4,201 landed rows carries slot 10»), so neither the names gate nor the entry gate can judge them, on any page. On the Bible pages the line is the witnessed order's, so 20 lines move; on the cards the landed rows stand as pills a gate cannot judge. The mend is the corpus lane's facts for the 4,201 landed rows (their entries and their name marks); asked in the next letter. Nothing here is our reading of the English: the rows are Strong's own, landed by the lane's list.

## The gate's first cards (S2), each pill read under its word's key

The gate (`check-same-product-v1`, live against the ship tree) compared 54 first cards. 19 lost 57 pills of the dictionaries that rest shut, each held back and counted. 27 others differ in ways the gate does not know, because it knows the kinds' classes and not the store round's (`gate-diff.txt`). Each pill was read under its word's own key (`cards-explain.mjs`, `cards-deep.mjs`; `cards-explain.json`):

- 312 pills whose every row rests shut.
- 8 pills whose only carriers no gate could judge (they carry no facts) now rest shut; the carriers left are another entry's, or a name at a word that is not one, and the gates hold them as they hold every such row: «HAPPINESS» (M17 «happiness» is H837) and «Asher» (M17, H836, a name) at «who» (H834); «plague» (H1698) at «word» (H1697); «God» (H3069) at the Name (H3068); «complete» (H8003) at «Solomon».
- 22 the same reading printed now by another of its carriers («ben» to «Ben», «day» to «Day»).
- 6 landed by v188 and 6 moved to the plain key by call 5: «be happy», «sleep», «Ben»; «Darius» first at Haggai 1:1 (M5 «Darius» landed at rank 0).
- 14 cards whose order moved as a carrier rests shut («Jehovah» loses its shut carriers and their rank) or landed.
- The gate's S2 opens the book's first verse on every chapter page it samples (task 112), so Amos 1 and Amos 5 compare the same three cards.

## The suite's three reds

- check-nothing-unlanded-v1: red until landing, as on every ship.
- check-ruled-equals-first-paint-v1 E1 under UBS, Amos 1:1 cell 14: a pointer pill pressed («face (plural construct state form of פָּנִים)») and the section laid again prints the row's own words («plural construct state form of פָּנִים (paním)»). Live does the same (`pointer-relay.mjs` against live and the ship); the check reached it now because the kinds took two pills off that card (159 to 157) and its pick moved to the pointer pill. Task 131.
- check-default-picks-v1 D5 and D11: the page crashed under the suite's load («Target crashed»); run again alone after the gate.
