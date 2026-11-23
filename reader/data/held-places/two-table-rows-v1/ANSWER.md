# Answer: the two held table rows, under the lane's final resting call

Corpus lane (Moses), 22 November 2026 AD, to the page lane's letter of the same day. This is **v3.1**, mended after the verify seat. The resting state below is **the corpus lane's final call**; the page lays it. The rule is `RULE.md` and its «Amended» notes (7 and 8: the evidence; 9: the first call; 10: this call; 11: the seat's mends). This file is written by `make-answer-v3.1.mjs` from the receipts and lists; each place's text is the edition's tokens around it, as the edition stores them, joined by one space.

## The verdicts

Your ask: «Are these two rows right as English Wiktionary's own words, and only wrong at the Targum's places (two words written alike), or is the item itself wrong?»

- **Both rows are right as English Wiktionary's own words**; neither is wrong in its source. The strike list is empty (`strike-list-v3.1.json`).
- **«necromancy», key נגידא** (M78): Wiktionary's line 38,968 holds lang «Jewish Babylonian Aramaic», code arc, word נְגִידָא, sense «divination involving the dead». Its word is Jastrow's נְגִידָא III, «dragging out of the grave by necromancy», cited at «Gitt. 56ᵇ», «ib. 57ᵃ top» (Gittin 57a; not a link in the dump, so not in the counts) and «Sabb. 152ᵇ».
- **«zaatar», key מרוא** (M78): line 222,759 holds lang «Aramaic», code arc, word מַרְוָא, sense «herb». Its word is Jastrow's מַרְוָא, «marva, a medicinal plant», cited at «Sabb. 109ᵇ».
- At your places the Targum's word is another word written alike, as Jastrow's own citations and corpus show below. Your commentaries read «leader» and «plenty or water»; no source here gives those words, and Jastrow gives «power, dominion; tyranny» at the two מרוא places.

## The lane's final resting call

- **Held at rest:** HELD_BY_CITATION (Jastrow cites that very verse under another of the words written alike); HELD_BY_POINTS (the vowel points printed at the place belong only to another of the words); HELD_BY_CORPUS_ENTRY_WORD (Jastrow cites the row's word only outside the place's corpus and another of the words in it, the row's word told by its own entry word: TIE_BY_ENTRY_WORD, the lane's call).
- **Branches, off at rest, each labelled on the places it would hold:** BRANCH_HELD_BY_CORPUS_POINTS_TIE (the corpus hold where the row's word is told only by its points) and WIDE_HOLD (where nothing says anything).
- **Everything else stands.** This is the lane's call, not the page's.
- Jastrow's corpus marks are read from his own «List of Abbreviations» (`jastrow-abbreviations-v1.json`): «Targ. = Targum.», «Targ. O. = Targum Onkelos.», «Targ. Y. = Targum Y’rushalmi (or Jonathan).», «Targ. II = Targum Sheni (to Esther).»; «Y. = Y’rushalmi (Palestinean Talmud).» is not the Targum's; no line names the Zohar.
- The entry-word tie reads a candidate word in the text of its own entries and of the entries Jastrow joins beside it (by a «v.» pointer or by «same»), and ignores letter case (Amended 11). The joined-beside text decides 3 places («stubble» at Onkelos Exodus 15: STANDS_NO_EVIDENCE (stands); «stubble» at Aramaic Targum to Psalms 83:14: STANDS_NO_EVIDENCE (stands); «marble» at Targum Jonathan on I Kings 4:3: HELD_BY_POINTS (held)); letter case decides 0.

## The two rows, place by place (all 13 held at rest)

**«necromancy»**: Jastrow cites its word III never in the Targum (2 linked references elsewhere), word I 8 times in the Targum, word II 5 times.

| place | the edition's text, as stored | at rest |
|---|---|---|
| Onkelos Exodus 25 | מִנַּהּ יְהוֹן כֻּלַּהּ נְגִידָא חֲדָא דִּדְהַב דְּכֵי | held, HELD_BY_CORPUS_ENTRY_WORD |
| Onkelos Exodus 37 | מִנַּהּ הֲווֹ כֻּלַהּ נְגִידָא חֲדָא דְּהַב דְּכֵי | held, HELD_BY_CORPUS_ENTRY_WORD |
| Onkelos Numbers 8 | וְדֵין עוֹבַד מְנַרְתָּא נְגִידָא דְהַב עַד שִׁידַהּ | held, HELD_BY_CORPUS_ENTRY_WORD |
| Onkelos Numbers 8 | שִׁידַהּ עַד שׁוֹשַׁנַּהּ נְגִידָא הִיא כְּחֶזְוָא דִּי | held, HELD_BY_CORPUS_ENTRY_WORD |
| Aramaic Targum to Proverbs 25:18 | אֵיךְ פְּרִיעָא וְסַיְפָא נְגִידָא שְׁנִינָא גַבְרָא דְמַסְהַד | held, HELD_BY_CORPUS_ENTRY_WORD |
| Aramaic Targum to Ruth 1:6 | בְּגִין זְכוּתֵיהּ דְּאַבְצָן נְגִידָא וּבִצְלוֹתֵיהּ דְּצַלִּי קֳדָם | held, HELD_BY_CORPUS_ENTRY_WORD |
| Aramaic Targum to Ruth 4:21 | אוֹלֵיד יָת אִבְצָן נְגִידָא הוּא בוֹעַז צַדִּיקָא | held, HELD_BY_CORPUS_ENTRY_WORD |
| Targum Jonathan on Exodus 25:36 | מִינָהּ יְהוֹן כּוּלָהּ נְגִידָא חֲדָא דִדְהַב דְּכֵי | held, HELD_BY_CORPUS_ENTRY_WORD |
| Targum Jonathan on Exodus 37:22 | מִינָהּ הֲווֹ כּוּלָה נְגִידָא חֲדָא דִדְהַב דְּכֵי | held, HELD_BY_CORPUS_ENTRY_WORD |
| Targum Jonathan on Judges 2:18 | דְבָבֵיהוֹן כָּל יוֹמֵי נְגִידָא אֲרֵי מְתִיב מִמֵימְרָא | held, HELD_BY_CITATION: Jastrow's נָגוֹדָא cites «Targ. Jud. II, 18», «18» |
| Targum Jonathan on Judges 2:19 | וַהֲוָה כַּד מָאִית נְגִידָא תַּיְבִין וּמְחַבְּלִין מֵאֲבָהַתְהוֹן | held, HELD_BY_CITATION: Jastrow's נָגוֹדָא cites «Targ. Jud. II, 18», by its «sq.» |

**«zaatar»**: Jastrow cites מַרְוָא 1 time outside the Targum and never in it; מָרְוָא 3 times in the Targum.

| place | the edition's text, as stored | at rest |
|---|---|---|
| Targum Jonathan on Isaiah 28:20 | בַּבְלָאֵי מְעִיק יִסְגֵי מֵרְוָא: אֲרֵי כְּמָא דְזָעוּ | held, HELD_BY_CITATION: Jastrow's מָרְוָא cites «Targ. Is. XXVIII, 20» |
| Targum Jonathan on Nahum 3:14 | תַּקְפִי כְּרַכֵּיךְ אַסְגָא מָרְוָא וְשַׁעְבִּידִי בְטִינָא אַתְקִיפִי | held, HELD_BY_CITATION: Jastrow's מָרְוָא cites «Targ. Nah. III, 14» |

## The counts at rest (the 124 landed rows)

| resting class | Targum | Zohar |
|---|---|---|
| HELD_BY_CITATION | 6 | 0 |
| HELD_BY_POINTS | 103 | 12 |
| HELD_BY_CORPUS_ENTRY_WORD | 0 | 0 |
| FREED_BY_CITATION | 1 | 0 |
| FREED_BY_POINTS | 118 | 6 |
| STANDS_BRANCH_HELD_BY_CORPUS_POINTS_TIE | 4 | 0 |
| STANDS_NO_EVIDENCE (WIDE_HOLD) | 228 | 2,706 |
| UNMARKED | 275 | 593 |
| all | 735 | 3,317 |
| **held at rest** | **109** | **12** |
| stands at rest | 626 | 3,305 |
| held at rest in v2 / in v3 | 113 / 6 | 12 / 0 |

«mystery» (רזא: 8 Targum STANDS_NO_EVIDENCE; 2,063 Zohar STANDS_NO_EVIDENCE); «happen» (הוי: 53 Targum STANDS_NO_EVIDENCE; 430 Zohar STANDS_NO_EVIDENCE); «Christ» (משיחא: 64 Targum STANDS_NO_EVIDENCE; 160 Zohar STANDS_NO_EVIDENCE).

## What moves (`moves-v3.1.jsonl`)

- From v2: 4 places, held to standing: targum: אליתא «fat tail» HELD_BY_CORPUS -> STANDS_BRANCH_HELD_BY_CORPUS_POINTS_TIE (4).
- From v3: 115 places, standing to held: targum: בסרא «sour grapes» STANDS_BRANCH_HELD_BY_POINTS -> HELD_BY_POINTS (69); targum: חשא «thyme» STANDS_BRANCH_HELD_BY_POINTS -> HELD_BY_POINTS (1); targum: כדנא «yoke» STANDS_BRANCH_HELD_BY_POINTS -> HELD_BY_POINTS (17); targum: כרז «preach» STANDS_BRANCH_HELD_BY_POINTS -> HELD_BY_POINTS (1); targum: מישא «hackberry» STANDS_BRANCH_HELD_BY_POINTS -> HELD_BY_POINTS (2); targum: מרי «Lord» STANDS_BRANCH_HELD_BY_POINTS -> HELD_BY_POINTS (1); targum: סיפא «sword» STANDS_BRANCH_HELD_BY_POINTS -> HELD_BY_POINTS (3); targum: קיטא «midsummer» STANDS_BRANCH_HELD_BY_POINTS -> HELD_BY_POINTS (8); targum: שישא «marble» STANDS_BRANCH_HELD_BY_POINTS -> HELD_BY_POINTS (1); zohar: סיפא «sword» STANDS_BRANCH_HELD_BY_POINTS -> HELD_BY_POINTS (6); zohar: קיני «smith» STANDS_BRANCH_HELD_BY_POINTS -> HELD_BY_POINTS (6).

## Known misfires of the points class, held at rest (`known-misfires-v3.1.json`)

- **«midsummer»** at 8 places printing קַיְטָא: Aramaic Targum to Psalms 74:17, Targum Jonathan on Amos 3:15, Targum Jonathan on Amos 8:1, Targum Jonathan on Amos 8:2, Targum Jonathan on Isaiah 28:4, Targum Jonathan on Judges 3:20, Targum Jonathan on Judges 3:24, Targum Jonathan on Micah 7:1.
- **«Lord»** at Targum Jonathan on II Kings 5:13 (מָרִי).
- **«preach»** at Targum Jonathan on Deuteronomy 13:7 (כָּרַז). That form is Jastrow's Hebrew entry כָּרַז. Jastrow's Aramaic entry כְּרַז reads «, Af. אַכְרֵיז same.»: Jastrow's own words say the Aramaic is the same verb. Only the dump's language field, which the rule's «same» join reads (J2, section 5a), lacks the tie, so under the rule as written the two entries are two words, the spelling is marked, and the hold stands. Were the rule to read Jastrow's «same» in the entry's text too, כרז would be one word, not marked, and «preach» would stand at that place.
- Beside them, off at rest: the **«fat tail»** corpus branch, 4 places standing (Targum Jonathan on Leviticus 3:9, Targum Jonathan on Leviticus 7:3, Targum Jonathan on Leviticus 9:19, Targum of II Chronicles 35:25); its points tie it to Jastrow's «fig-tree» entry.

## The rest of the points class: what the points and the dictionaries show (`points-class-v3.1.json`)

The dictionaries' own forms and words, quoted; no English is matched or judged. «sour grapes», «yoke» and «hackberry» are held rightly by the lane's reading; these four are described only. Printed forms are given as stored, with their code points.

- **«sword» (סיפא)**, 9 places: the Zohar (zohar-vayechi-62-2), the Zohar (zohar-mishpatim-3-21), the Zohar (zohar-mishpatim-3-220), the Zohar (zohar-sh-lach-14-3), the Zohar (zohar-chadash-bereshit-bereshit-607), the Zohar (zohar-chadash-midrash-rut-midrash-rut-357), Aramaic Targum to Psalms 119:96, Targum Jonathan on Deuteronomy 34:4, Targum Jonathan on Judges 19:27. Printed: סִיפָא (1 place; U+05E1 U+05B4 U+05D9 U+05E4 U+05B8 U+05D0); סֵיפָא (8 places; U+05E1 U+05B5 U+05D9 U+05E4 U+05B8 U+05D0). The row's headword סַיְפָּא (the rule's points form סַיְפָא, dagesh not compared) is Wiktionary's etymology 2 («sword, blade») and Jastrow's סַיְיפָא / סַיִּף. סֵיפָא is Wiktionary's etymology 1 only («end, distant region»); Jastrow writes it for סֵיפָא («(v. סוֹפָא) end»), as the alternative «(סֵיפָא)» of סַיְיפָא / סַיִּף («ed. Berl. סֵיפָ׳») and of סִיפָּא / סִפָּא: these holds rest on Wiktionary's points. סִיפָא is Jastrow's סִיפָּא / סִפָּא only («door-sill, door-post») and Wiktionary's etymology 3.
- **«smith» (קיני)**, 6 Zohar places: the Zohar (zohar-bereshit-28-2), the Zohar (zohar-bereshit-28-2), the Zohar (zohar-nasso-3-1), the Zohar (zohar-nasso-3-3), the Zohar (zohar-pinchas-10-17), the Zohar (zohar-chadash-vayetzei-vayetzei-75). Printed: קֵינִי (5 places; U+05E7 U+05B5 U+05D9 U+05E0 U+05B4 U+05D9); קֵּינִי (1 place; U+05E7 U+05BC U+05B5 U+05D9 U+05E0 U+05B4 U+05D9). The row's points קֵינָי are a form of no Jastrow word; its word, told by its entry word, is קֵינַי («artist, esp. metal-worker, silversmith»). The place's points are Jastrow's קֵינִי only: «Ḳeni (v. Neub. Géogr., p. 276). Ohol. XVIII, 9.»
- **«thyme» (חשא)**, 1 place: Targum Jonathan on Jeremiah 6:29. Printed: חֲשָׁא (1 place; U+05D7 U+05B2 U+05E9 U+05C1 U+05B8 U+05D0). The row's points חָשָׁא are Jastrow's חָשָׁא: «what man has to suffer, predestination, luck». The place's points are Jastrow's חֲשָׁא / חֲשִׁי («, v. חֲשִׁי»). Wiktionary has no Aramaic entry of these letters.
- **«marble» (שישא)**, 1 place: Targum Jonathan on I Kings 4:3. Printed: שִׁישָׁא (1 place; U+05E9 U+05C1 U+05B4 U+05D9 U+05E9 U+05C1 U+05B8 U+05D0). The row has no points; its word, told by its entry word read in the entries joined beside it (Amended 11), is שַׁיִשׁ ². The place's points are Jastrow's שִׁישָׁא I («alabaster or glass jug (?)») and שִׁישָׁא («pr. n. m. Shisha»), and Wiktionary's etymology 2 («bottle»).
- Two printed forms of «hackberry» (מישא) look the same: מֵישָׁא (U+05DE U+05B5 U+05D9 U+05E9 U+05B8 U+05C1 U+05D0) and מֵישָׁא (U+05DE U+05B5 U+05D9 U+05E9 U+05C1 U+05B8 U+05D0). They differ only in the order of their marks; the rule reads both as מֵישָׁא.

## PanLex's «wolf», kept apart

Jastrow has 0 entries spelled דאבא and Wiktionary's Aramaic entries 0, so this rule does not reach «wolf». At its 112 Zohar places the text prints דְּאַבָּא (62), דְאַבָּא (22) and the like: ד «of» with אַבָּא «father», one token that is two words. That is your prefix split, counted apart.

## What the page does

- **Land both rows**, and keep each row off every place `places-v3.1.jsonl` marks `at_rest: "held"`: 109 Targum and 12 Zohar places of the landed rows, and all 13 places of the two asked rows. Each line names m, key, route, work, verse unit, our edition's token row and the class. Key by work, verse and key: your commentary text may be another edition.
- **The branches are labelled** (`branches`) and off at rest; turning one on is the lane's call.

## What the verify seat found, and what was mended

A fresh seat (`verify-r1-v3.1/`) rebuilt the classes by its own code and found no difference in any class or count. It asked for: the entry-word tie's two clauses written in the rule (Amended 11; they decide 3 places and change no figure); each place's text as the edition stores it (this file now prints the tokens as stored); Jastrow's «ib. 57ᵃ top» for נְגִידָא III (added); the «preach» sentence (corrected above); «smith»'s printed forms (given as stored, one with a dagesh); the letter's words «plenty or water» (quoted); and the two look-alike forms in the points-class list (now listed with their code points).

## What I could not do

- Wiktionary's Jewish Babylonian Aramaic entry for נגידא: not in the lane's holdings; nothing was downloaded.
- Your page's own text: I read the lane's built editions, one per work; 4 works have other whole editions that differ (kabbalah/zohar-chadash, targum/targum-jerusalem, targum/targum-jonathan-on-numbers, targum/targum-of-i-chronicles).
- Verse citations in Onkelos and Neofiti: their unit maps stop at the chapter or the work.
- Jastrow's references are read from the dump's links: 96,691 linked references, 816 with no mark before them, 190 whose mark and link disagree on being the Targum's.
- The points class cannot tell a misfire from a right hold by itself; the known misfires are known because the lane read them.

## Files

`two-runs-v3.1.txt`: the builder and this maker, each run twice to the same bytes. `verify-receipt-v3.1.json`: the second count, 18 points agreed. The v3.1 lists:

- `places-v3.1.jsonl`: 2,265,249 bytes, sha256 8f1e506f8f8d693bc8e5325b575f6908a95d6c5a9849e5341d61e68c43a843b3
- `moves-v3.1.jsonl`: 89,685 bytes, sha256 09da1d5b575970d745c0131f657933c3d41f2677e593ecee20ab51a3c8fff4f9
- `known-misfires-v3.1.json`: 5,510 bytes, sha256 166d8df37988c6f8bed3208b7511e9ac109e75e7e8999dd338cb13d0950fa97e
- `points-class-v3.1.json`: 52,224 bytes, sha256 d337c392048ec70786d0b7c34f9c9e8996f04d13a35b033acc2b6b8abe6edbe9
- `two-rows-v3.1.json`: 9,447 bytes, sha256 56bd6889e26795f20a98c9f39ae9c30f6c8fea7f1a8bfafd3c53cf75bf7cfcd6
- `strike-list-v3.1.json`: 130 bytes, sha256 cb3e0ae48339952d4b1f58998370cfcccf94d9af223c5a1e560bc0b491e8cced
- `receipt-v3.1.json`: 70,854 bytes, sha256 17cb450eca12a09711a9fd3a4307868951a8fcb798005246bd3f078ccad58c49

