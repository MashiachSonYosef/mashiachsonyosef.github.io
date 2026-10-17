# For Moses: what the page withholds from piece store v2 and span store v1.4

From Elijah's lane (the serving lane), 17 October 2026. Both stores are
wired on the page. These are the rows the page does not serve, by rule, and
why. Each count is in the served index; each rule can be dropped the day the
lane's build makes it unnecessary.

## Piece store v2 (FOR-ELIJAH-v77)

Served: 934,275 of 1,296,994 claims, at 304,335 places; 771,649 of 778,083
records. For each kind, served plus withheld equals your counts table
(WHOLE_WORD 608,654; DIVISION 615,724; RUN 72,616).

1. **Whole-word joins: 290,064 withheld.** A WHOLE_WORD claim naming two or
   more records (MACULA) or two or more ranges of one record (TAHOT) has the
   lane's join of the pieces' slices for its English ("in  beginning"). It
   is not a reading either source prints. The pieces are served. Every
   withheld one is fully covered, letter for letter, by served DIVISION
   pieces of the same source and reading.
2. **Run joins: 72,607 withheld.** The same for RUN claims. The 9 RUN claims
   with no record are served (they carry no English).
3. **TAHOT lines over two ink words: 42 withheld** (24 whole-word, 18
   division, over 16 records whose gap is not NONE). The second word's
   claims point into the first word's part of the line, so the second word
   gets the first word's English. Examples: II Kings 19:37:9 (the ו of
   בניו reads "Sharezer"), Ruth 3:5:6 (אלי reads "you are saying"), Numbers
   7:59:17 (the whole פדהצור reads "Pedah"). These need the lane to split
   the line by word, or to give the second word's ranges its own part.
4. **TAHOT on a division TAHOT does not make: 6 withheld.** Claims whose
   16th element names declared_alongside[0], where TAHOT's own line keeps
   the word in one part: TAHOT's whole-word English stands on the first
   piece only (I Chronicles 24:26:7 and 24:27:4 "Beno"; Nehemiah 11:14:11
   "Haggedolim" on the letter ה alone).

Also seen, not withheld: every MACULA record carries year "2022" and every
TAHOT record "S_NO_SOURCE_YEAR". The page no longer lets a piece row lead a
reading, so the year no longer matters for order, but the two sources'
years are worth a look in the source-year ledger.

## Span store v1.4 (FOR-ELIJAH-v75.4.draft, NOT READY)

Wired on the owner's word. Served: v1.3's 1,714 rows under 462 keys at
2,845 places.

1. **Closed-up rows: 32 withheld** (the 29 v1.4 added, and 3 from v1.3:
   r00162 and r00254 under בית־לחם, r01405 under בן־אדם). The no-weld rule.
   With r01405 gone, the first row of בן־אדם changes at 99 places (93 in
   Ezekiel), to r01408, Wiktionary's "human, common name of Homo sapiens".
   That is a poor first reading for Ezekiel's "son of man"; worth a look.
2. **The 21 rows v1.4 added: held.** Each serves its entry's first reading
   at every place of the key, and seven read wrong at some of them:
   - r01747 בן־הדד "time of Asa & Baasha", at all 21 places; at Amos 1:4,
     Jeremiah 49:27 and II Kings 13:3, 13:24, 13:25 the entry's own readings
     give "son of Hazael".
   - r01750 בת־שוע "wife of David, mother of Solomon, etc." at Genesis
     38:12, its only place, where the entry's readings[1] is "wife of Judah".
   - r01753 בית דגון "in Judah" at I Samuel 5:2 and 5:5 and I Chronicles
     10:10, where the words are the house (temple) of Dagon.
   - r01754 כל־חזה "father of one of the builders, Shallun" at II Kings
     17:13, where the words mean "every seer".
   - r01755 חפצי־בה "mother of king Manasseh" at Isaiah 62:4, where its
     readings[1] "figurative name of Zion" fits.
   - r01756 נתן מלך "an official of Judah" at Jeremiah 40:11, where the
     words are a verb and a noun ("the king of Babylon had left"); the
     place itself is the problem, and it predates v1.4.
   - r01767 מלכי־צדק "king of" at Psalm 110:4.
   Also r01748 (M14) repeats r01661 byte for byte under פת־בג.
   The fix the page needs from the lane is a reading chosen per place, which
   span store v2 can carry.

## One question for the owner, not for the lane

650 of the 2,845 served places end or start inside a maqaf compound
(Psalms 1:2 כי אם inside כי אם־בתורת; Daniel 1:2 כלי בית inside כלי
בית־האלהים). The page draws such a place inside the compound's cell, and
its card opens on the span with the store's readings, but the line under it
reads word by word. The span check now counts these and names them instead
of passing them silently.
