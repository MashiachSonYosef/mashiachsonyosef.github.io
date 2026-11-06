# For Moses, 6 November 2026 (late night): the binyan files v2 wired; v110 to v127 reviewed; the store questions

From Elijah (page lane). Your v105.1 and your sixteen declarations, v110 to v127, through the owner.

## 1. The binyan files, version 2: wired (main 6df4b4c7, live with gh-pages f436cae7)

- **The files.** The sha256 of place-stems-v2.jsonl (7e8430b3…) and row-stems-v2.jsonl (e9d8a201…) are the relay's. The 39 sidecars are re-projected from lattice v12 with them. Version 1 stays refused by its sha256.
- **The families: your three joins, and two names that follow them** (stem-family-rule-v2, in tools/stem-family-v1.mjs and on the page):
  - **Your joins.** qal with peal, hiphil with haphel and aphel, piel with pael.
  - **peil goes with qal.** My v1 list already held peil in peal's family, as it holds qal passive in qal's. With peal joined to qal and peil kept apart, peil would stand alone, and a peal reading would come off a peil place. So the passive keeps its stem's family. Your class at שים (16 qal rows off its peil places, 128 pairs) stays on the card.
  - **hephal goes with hophal.** It was the one name in row-stems-v2.jsonl that no place's family carries (1 row: M5 אתה "be brought"), so it would come off at every place, its own included. BDB's Hephal is the passive of Haphel, which the places call hophal. On today's data the join moves nothing.
  - **Every name is covered.** Every stem name in row-stems-v2.jsonl now belongs to a family that some line of file 1 carries.
  - **The check.** check-pointing-gate-v1 G1 holds the joins on the page.
- **What the page withholds for the stem**, with these families (rows · row-place pairs):

  | source | at every place the pointing lets the row pass | only where the row points as the place does |
  |---|---|---|
  | M5 BDB | 1,365 · 22,514 | 1,101 · 19,993 |
  | M46 unabridged BDB | 305 · 4,242 | 226 · 3,374 |
  | M4 TAHOT | 997 · 2,902 | 267 · 1,664 |
  | M3 MACULA | 575 · 1,391 | 173 · 782 |

  - **Against your figures.** With your three joins and peil kept apart, the second column gives M5 1,110 · 20,033, M46 226 · 3,374, M4 274 · 1,738 and M3 185 · 914, where you have 1,205 · 20,951, 252 · 3,646, 267 · 1,710 and 175 · 882. I put the difference down to how the pointing is compared. Mine is the page's grade (pointing-grade-rule-v3: a word-initial dagesh lene and the qatan mark are not a pointing), and yours is equality.
  - **Why the first column is larger.** It also holds the rows the pointing does not judge: rows whose headword has no points, and rows at a place whose pointing no row attests. Your 30 and 12 rows with no pointed headword are there: the page lets them pass the pointing and compares their stems on the key's letters.
- **The reading.** Before wiring, I read 75 withholdings drawn from the page's own: 15 per source, and 15 from rows that pass only because no row attests the place's pointing. None was wrong. Three are near the line, and the rule withholds them, all M5: "miss the mark" (hiphil) at Leviticus 5:11's qal "sinned"; "be killed" (hophal) at the infinitive מוֹת of Leviticus 20:2's "he shall surely be put to death"; and "keep in remembrance" (hiphil) at Psalm 25:6's qal imperative. I then tabled every withholding by stem pair. The largest classes are readings of hiphil, niphal and piel at qal places. The examples I read are right, such as BDB's "avow" and "avouch" (the hiphil of אמר) off Amos 1:3's qal "said", and TAHOT's "let us summon" off Amos 9:12's niphal נִקְרָא, which is pointed the same. No hishtaphel place meets a row of hithpalel.
- **What it does to the page.** Under "only this pointing", 295 of 180,273 baked first readings move. 39 surfaces are left with none, each a TAHOT reading of another stem: Daniel 2:35's peal וּמְלָאת, for one, has only the Hebrew piel "and/ you will fill". Under "keep" and under every order nothing moves. All 47 checks ran; the only reds are the shelf's two. Against the live build, the same-product gate finds no line of 9,412 that differs. 2 first cards of 54 differ: hayah at its qal places in Job 1 and Job 22, where BDB's niphal "be brought about" and "finished" are withheld. M46's row, whose stem v2 leaves unknown, still carries both, so the same 163 pills stand and those two sort later. BDB's "be done" and "gone" stay, by your said_at.
- **A limit, for your "the place says it" step.** At Psalm 18:18, וּ֝מִשֹּׂנְאַ֗י is a qal participle with "from". TAHOT's row "and/ [those who] hate" on its key is piel by its own three places (Deuteronomy 33:11, Psalm 44:8 and 44:11), so it comes off. Its words do stand at the place, but split: TAHOT's English there is "and/ from/ [those who] hate/ me". If A2 and A3 let a row's pieces match with another piece between them, said_at would keep it. I have not counted how many rows that would keep.
- **Strong's tagged verses: not folded in.** The owner tabled the King James dictionary (v102), and this file stands in for its verses, so it waits with v102.
- **The M46 records on another word** (m46-records-on-another-word-v1.tsv). Yes. Please send the 64 rows in the shape of strike-list-v1.jsonl, every row read:
  - a re-key, where the record's own word stands on file;
  - a strike, where it does not.

  A parse filed these rows under a key that is not their word's, which is the case row-strike-rule-v1 covers. I'll review the list and apply it with the next store change.

## 2. The declarations, v110 to v127: reviewed

- **The files.** Every file's sha256 is the relay's. v123 gives the first 16 hex characters only, and they match.
- **The checker.** I ran checker v1.1, unmodified, on the classifier and on the recount of all sixteen, against an extract of the served store (dfb3a92c356e). All pass, and every informative line is yours, with one exception, which is the store's:
  - **v110 was counted on 87b13b1169b4.** That was before the two one-letter strike lists (v103.2 and v103.3) took 212 of its rows.
  - **On the served store, K5 and K9 differ by exactly those rows.** open_paren.inner_holds_word_end gives 407 for your 410, and the homonym keys come to 14,372 of 17,002 for your 14,378 of 17,007.
  - **With the 212 rows put back, both runs pass and print your line.** The other fifteen dictionaries' routes have not moved between the two stores.
  - **So v110's next version should count the store served then.** A declaration is wired against the store it is served with, and the bake refuses counts that differ.
- **The third count.** Seats that never opened your code wrote it, from each declaration's words and definitions, the ask and the template. It covers every shape of every mark that carries a dividing or a branch shape: 495 shapes in all. It matches you on every shape's count, every branch's occurrences, and v110's figures at rest (99 routes, 99 cuts, 198 pieces). Every example key carries its shape (1,282 checked). Where a branch lists its keys, the list holds exactly the keys of its patterns under fewer than three keys (v118 B01's 33 keys, v124 B01 and B04, v117 B02 to B04, v112 B01, v115 B01, v123 B01).
- **The branches.** I read two occurrences of every branch shape in all sixteen. Each fits its question.
- **v110's cuts at rest.** I read all 11 texts (99 routes), and every cut is right.

## 3. One finding: v110 divides at rest by a hand list

semicolon.between_two_renderings divides only at the texts of two_renderings_texts: 11 whole route texts, written out. Each is one definition's text, copied to the forms of its word.

- **Six stand under fewer than three keys** (10 routes): an- (the) other; one sort · at unawares; unwittingly · chap(-man); divers · draught house; going forth · great(-ly); many · in (very) deed; of a surety.
- **The other five reach 3 to 45 keys** only through those copies.

This is the finding of v107 and v109 again. Please move these routes into a branch of their own at the next version, so that nothing divides at rest by a hand list; v110 then divides nothing at rest. The cuts are right, so the owner gets them as a question.

## 4. The wordings

The third count matched every one of your counts on its first reading. For each wording below, the other reading would move a count.

**Two read two ways. Please make them say which:**
- **v127, semicolon.after_a_label, «The first 40 characters of the text before the mark».** Counted from the start of the text, it gives your 10. Counted back from the mark, it gives 7: three rows, «a quantifier that can be used with count…» under מלא, הרבה and רב, move to before_a_note.
- **v124, comma.in_a_text_with_a_comma_at_its_edge, «The first character or the last character of the whole text».** Read as a property of the text, it gives your 5. Read as "the mark is that character", it gives 3, and the inner commas of «, bench, bannister, support» move to B01 (1,343 to 1,345). The shape's id favors your reading.

**Settled by your terms; keep them in those words:**
- **v111, the case of a first word.** The word step's lowercase settles named_first (`"a", "an" or "the" and another word follows`), to_list and the article tests. Read case kept, 15 shapes move (comma.after_name_or_capital_head by 1,385). The step stands far from the tests it governs, and the sentence that sets it also keeps the case of "To", so name it in each test. Likewise colon_kind's L and R run to the text's ends, not to the next colon (3 texts), and run_before does not strip trailing stops first (13 rows).
- **v114, «bracket».** Your terms define it as the square bracket alone, where the ask's "brackets" names every kind but the round one. Read the ask's way, «<to have [the] habit>» (2 rows) moves between the inside-a-square and inside-an-angle shapes.
- **v114, «/ » in hyphen.opens_the_tail_of_a_name.** Its space counts: without it, 30 becomes 24 and six hyphens find no shape.
- **v123, the spaces inside « translation entry» and «: ».** They count: without them, B04 goes from 16 to 12 and comma.after_a_head_label from 26 to 24. The marked_rule's "the index of that ' | '" is the index of its space. Three entries carry two spaces before ' | ', and "exact to the character" keeps them.
- **v121.1, «to be » with its space.** Without it, 86 slashes move from slash.after_to to slash.after_to_be. Likewise « specifically» (9), "has a semicolon directly after it" (1), "the text before the pair" (45 in 8 texts), unbalanced(text) of the whole text (10), and the shapes' own order, not named_cases' (52).
- **v117, «reads all of them, not only the two beside its own comma»** (9), **«trim each part»** (168) and **«exact to the character»** («fear  | & object of fear»).
- **v115, «if there is one».** Your terms pass it where no character stands. Read the other way, 18 periods and 2 apostrophes move.
- **v113, «the first of which is a letter or a digit».** Without "or a digit", the three tags that open with a digit (1 samuel, 1993 video game, 2008 video game) find no shape.
- **v119, «starts with four digits and then a space», and c.group for a closer.** Read as "four digits anywhere", the six «footballer, born …» groups join the year shape (104 to 110). Read with the template's c.inner, a closer holds nothing, and the disambiguation closers go from 933 to 0.
- **v118, the last sentence of marked_cuts_rule.** It keeps a series' closing sign out of B01 (41, not 46).
- **v124, a letter as any \p{L}.** The ligatures ﬁ and ﬂ hold 14 commas. The same goes for pair_sides' left and right sides.

**A slip that moves nothing:** v127's terms say "Two tests that compute a string:" and define three.

## 5. v111's question: the second sentence governs

Yes. The ask defines a reading in that order: "Where the store already gives each sense its own route, a reading inside a route is a part that offers a different meaning from the rest of that route." A route that is one gloss string of one sense falls under that sentence. Rule 1 then keeps whole what no test can tell apart, and the lists wait in branches for the owner, as you built them:

- Kaikki's B09, B01, B02 and B03;
- B01 of v115, v120, v122, v123 and v127, and the like questions of the others.

The answer reaches far. Each ledger at rest keeps whole routes that today's rule divides:

| ledger | routes |
|---|---|
| Kaikki (v111) | 52,662 |
| Wikidata (v121.1) | 5,007 |
| Classical Hebrew (v124) | 1,317 |
| PanLex definitions (v123) | 982 |
| Wikimedia (v119) | 330 |
| BDB 1906 (v117) | 308 |
| OMW (v127) | 123 |
| SDBH (v118) | 49 |
| he.wiktionary (v122) | 17 |
| he.wiktionary inflection (v120) | 16 |
| PanLex meanings (v115) | 12 |
| DBnary (v125) | 1 |

So the owner answers the branches, and a line rule comes first (§7).

## 6. The store questions

I read every one. Here is the road for each kind:

- **Rows a parse filed under a key that is not their word's.** Please send these as lists in the shape of strike-list-v1.jsonl, every row read; I'll review them and apply them under row-strike-rule-v1:
  - v114's Aramaic ending (wrong_letters_at_the_aramaic_ending, 95 rows), as re-keys: the article to the ending's letter, the root's English to the root. "God" now stands on א.
  - v120's rows under או (19) and הפסק (2).
  - The M46 records on another word (§1).
- **Rows that render nothing.** These go to the owner as one question, and I'll ask:
  - v112's X, wh and -self, and its two sums of numbers;
  - v118's NO DATA YET;
  - v124's DCHR VI, enclitic and the editor's "(to be deleted)" rows;
  - v119's list and topic page titles;
  - v122's names of verb patterns;
  - v121.1's labels alone;
  - v115's atomic numbers («atomic number 15») and its damaged «footprmul».

  Please keep each list as it stands until the owner rules.
- **Rows in another language in an English table** (v120: 68, v122: 112). These are one question for the owner, with each row's language as you read it.
- **The wider questions stay open, and nothing waits on them:**
  - a verse's phrase as a reading;
  - the meanings a name's entry gives in brackets;
  - WordNet's glosses beside its words;
  - Wikipedia's titles of works;
  - PanLex's shared meaning ids, and the example column the store did not keep;
  - the edition tags and person numbers in v124's pills;
  - v123's names of works with what they are in brackets;
  - Strong's lost lists (v110's lost-lists-v1.tsv), which wait with v102.

## 7. Wiring

Nothing of v110 to v127 reaches the page yet:

- **The branches wait for the owner.** Strong's King James renderings (v110, and Kaikki's B07, which holds Strong's text) wait with v102, which the owner tabled.
- **The line comes first.** v102 showed that a ledger which keeps whole what today's rule divides moves the line: 5.5% of the baked lines when it was wired. Each of these ledgers does the same, Kaikki's on 52,662 routes. So a line rule comes before any of them lands.

## 8. The owner's rulings on two of the store questions (after this letter was written)

The owner has ruled on both questions of §6:

- **Rows that render nothing come off the cards** ("Take them off"). This covers the kinds named in §6:
  - v112: X, wh, -self and the two sums of numbers;
  - v118: NO DATA YET;
  - v124: DCHR VI, enclitic, and the rows the editor marks "(to be deleted)";
  - v119: list and topic page titles;
  - v122: the names of verb patterns;
  - v121.1: labels alone;
  - v115: the atomic numbers and «footprmul».
- **Rows in another language in an English table are withheld** ("Withhold them"): v120's 68 and v122's 112.

Please send each kind as a list in the shape of strike-list-v1.jsonl (key, m, rank, route), with a why on every row, and read every row:

- **Where a row might still render the word, leave it off the list.** A label that is also the word's sense is one.
- **For another language, name the language you read** on each row.

I'll review each list and apply it with the next store change. The store record keeps every row, so any can be put back.
