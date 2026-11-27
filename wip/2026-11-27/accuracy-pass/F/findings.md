# Helper F: the text's own marks, in the source and on the page

Measured 27 November 2026 on the frozen tree (main at ea6e1ad08e). Nothing was changed, built or shipped.

The question: is every mark of the Hebrew text that the source carries also on our page, in the right place, drawn as the mark asks; and is every division of a word on our page one the text or a dictionary makes?

The short answer. Every character of the 39 books is on the page: the provider's published text, the corpus lane's restore, our zones and the page as a browser draws it agree letter for letter and point for point, and every mark stands at its right place. What goes wrong is what the page calls a mark or says about it, in a handful of classes, and one class of words whose English is wrong (the eight words written and not read). The divisions are sound: the pieces under the words are STEP's own cut at every word I could line up, and the joined cells are a dictionary's or follow the text's own stroke.

## Summary

Ranked by the places touched. «Machine» means every place of the 39 books was measured; «browser» means the page was opened and pressed.

| # | Finding | Places | How seen | Class by the principle |
|---|---|---|---|---|
| F1 | A legarmeh is named and drawn as a paseq | 1,795, in 37 books | machine, all; browser, 30 pressed | overrides the edition's own answer |
| F2 | The gray maqaf is drawn as any maqaf, its card says of the source what the source does not do, and 9 words wear its flag wrongly | 109, and 9 more | machine, all; browser, 39 pressed | overrides; the 9 fired with nothing to decide |
| F3 | A hover title says «Leningrad differs» and shows the same letters on both sides (72), or prints a code (35) | 107 of 1,173 titles | machine, all | fired with nothing to decide |
| F4 | The edition's notes on scroll differences are carried nowhere | 31, in 6 books | machine, all | a part of the source that is not served |
| F5 | «The source marks this word as a ketiv-qere of spelling» is said of words the source does not mark | 30, in 15 books | machine, all; browser, 30 pressed | fired with nothing to decide |
| F6 | The English under a pair is marked on the written form, and offered as its reading, though it is the read form's | 19 | machine, all; browser, 6 pressed | overrides STEP's own statement at 11; STEP is silent at 8 |
| F7 | Words that stand with no English at all | 14 | machine, all (browser census) | a hold; at 4 of them STEP's own row already answers |
| F8 | STEP's square brackets are taken off its words at read forms of several words | 9 | machine | overrides STEP's own writing |
| F9 | A word written and not read wears an English line, and the line is a wrong word (mother, raw, sign, archer, fifth) | 8 of 8 | browser, all 8; STEP's rows | overrides the text's own mark and STEP's answer |
| F10 | A word read and not written: the card never says that nothing is written there | 9 of 9 | browser, all 9 | small |
| F11 | The empty verse's card says the edition prints a dash | 2 | browser | small |
| F12 | Dots set above and below are said to be «a dot above» | 1 | browser | small |
| R1 | Ruled, shown for its size: on a first visit no sof pasuq, bar or section mark is drawn | 29,056 | browser census, all | the owner's standing ruling |
| R2 | Ruled, shown for its size: the word after a maqaf stands apart, after a space | 35,715 of 42,635 strokes | browser census, all | the owner's ruling of 20 November 2026 |

By weight for a reader, F9 comes first (wrong English in the line), then F7, F6, F1, F2.

## 1. The source, and the edition's own account of its marks

**The text as received.** The corpus lane extracted the edition from a Sefaria dump it holds locally; that dump is not on the store. I fetched the same edition from the provider's public export today (39 files, 6 MB, `dl-sefaria/mam/`) and used it as the text as published. It carries the edition's markup whole.

**The text as restored.** `v2/ledgers/mam/mam-restore/mam-<book>-restored-v5.csv.gz` for all 39 books, with the receipts and the restore's own script (`dl-restore/`). The restore's receipt totals: 292,199 positions, 262,804 words, 29,395 marks.

**The two agree.** The provider's export of today and the restore surface hold the same characters in the same order in every one of the 23,206 verses, apart from 16 verses where the restore set a bar after a pair that the edition writes inside its read form (known; the page puts each back).

**The edition's own account.** The edition's Hebrew introduction is on Hebrew Wikisource, which this session could not reach. I read instead what the edition publishes in English through its tooling maintainer (fetched to `dl-mamdoc/`): «The encoding of MAM for Sefaria» (revision 26 October 2026), the guide to the edition's JSON, the page on the gray maqaf (the introduction's chapter 2 with a translation), and the provider's own version note. What each mark means, in the edition's words:

| Mark | The edition's own words |
|---|---|
| paseq and legarmeh | «A legarmeh and a paseq are both the code point PASEQ. The files tell them apart by markup and spacing»: a legarmeh is the bar in `<b>` after a thin space, a paseq the bar in `<small>` between two thin spaces. «So the spacing keeps a legarmeh with the atom before it, and puts a paseq between two atoms.» «The lp-legarmeih type identifies legarmeh, which is part of the cantillation system. The lp-paseq type identifies paseq in the narrow sense, which is not part of the cantillation system.» The provider's note: «Legarmeih and paseq are visibly distinguished.» |
| maqaf, atom, word | «An atom is one written form between spaces or maqaf marks. A chanted word is one atom or a complete maqaf compound.» «only maqaf joins atoms into a chanted word» |
| gray maqaf | «Maqaf that is implicit in the manuscript.» The introduction: many words in the poetic books «should have a maqaf … But in the vast majority of cases, there is no maqaf … Therefore, we added a gray maqaf after words of this type in our edition.» |
| ketiv and qere | «the ketiv, unpointed and in parentheses … and the qere, pointed and in square brackets». The qere stands first in about one pair in eight, after a maqaf: «the reading should not break after the maqaf». |
| written, not read; read, not written | «A ketiv velo qere, a ketiv that is written but not read»; «A qere velo ketiv, a qere that is read but not written». |
| trivial pair | «a ketiv/qere whose two forms differ in a way that needs no separate display», given as «one pointed atom». |
| section breaks | A samekh break is `{ס}` with one no-break space before it and eight after; a pe break is `{פ}` with a line break after it. «Most end a verse, but 145 samekh and 24 pe breaks are inside one.» |
| inverted nun | Nine, at Numbers 10:35–36 and Psalms 107:23–28 and 40. |
| small, large, hung letters | «A small letter is in `<small>` (23 times), a large letter in `<big>` (27 times) and a hung letter in `<sup>` (4 times)». |
| song spacing | a run of eight no-break spaces inside a line, 328 in eight chapters. |
| the dash | «Sefaria's numbering has Josh 21:36–37, for which MAM has no text. Each of these rows has only an EM DASH, since an empty field would let the text of another version show at that verse on Sefaria.» |
| notes on scroll differences | a note on the word it is about («in the scrolls of Yemen …», «in the Aleppo Codex there was written …»). The provider's export carries 31 of them as footnotes. |

## 2. Every mark counted four ways

Per book and per mark in `marks-by-book.tsv` (1,360 rows): the provider's export, the restore surface, the zone, the page as drawn, and the page as shown on a first visit. Totals for the 39 books:

| Mark | Source | Restore | Zone | Page, drawn | Page, shown on a first visit |
|---|---|---|---|---|---|
| maqaf (every stroke) | 42,635 | 42,635 | 42,635 | 42,635 | 42,635 (35,715 followed by a space) |
| gray maqaf | 109 | 107 rows | 118 words flagged | 118 | never drawn gray |
| sof pasuq | 23,211 | 23,211 | 23,211 | 23,211 | 0 |
| legarmeh | 1,795 | not told apart | 0 | 0 | 0 |
| paseq | 498 | not told apart | 2,293 (every bar) | 2,293 | 0 |
| bar inside a read form | 16 | set after the pair | 16, put back | 16 | 0 |
| petuchah | 1,570 | 1,570 | 1,570 | 1,570 | 0 |
| setumah | 1,982 | 1,982 | 1,982 | 1,982 | 0 |
| inverted nun | 9 | 9 | 9 | 9 | 9 |
| song spacing | 328 | 328 | 328 | 328 | 328 |
| empty verse dash | 2 | 2 | 2 | 2 | 2 |
| ketiv/qere places | 1,062 | 1,062 | 1,062 | 1,062 | 1,062 |
| of them: ketiv first / qere first / written only / read only | 916 / 129 / 8 / 9 | the same | the same | the same | the same |
| trivial pair | 130 | 130 rows | 160 words flagged | 160 | nothing is drawn for it |
| words with a large / small / hung / dotted letter | 27 / 23 / 4 / 17 | the same | the same | the same | the same |
| dots over or under letters | 57 | 57 | 57 | 57 | 57 |
| meteg or silluq (U+05BD) | 38,330 | 38,330 | 38,330 | 38,330 | 38,330 |
| rafe | 64 | 64 | 64 | 64 | 64 |
| every point and accent | 1,297,940 | 1,297,940 | 1,297,940 | 1,297,940 | 1,297,940 |
| letters | 1,205,351 | 1,205,351 | 1,205,351 | 1,205,351 | 1,205,351 |
| the edition's notes | 31 | 0 | 0 | 0 | 0 |

The books where a count differs: legarmeh, the 37 books that have one (all but Joel and Obadiah); trivial pair, 15 books; the notes, 6 books (the five of the Torah and Esther); gray maqaf, Psalms and Proverbs. The places are in `data/flag-places.tsv` (39 words), `data/edition-notes.tsv` (31) and `read-by-hand.tsv`.

How the page was counted: a browser opened each of the 39 books as a first visit, the page's own function built every section, and every entry of every Hebrew line was recorded as drawn: 23,206 sections, 334,826 entries (`data/page/`, script `scripts/p_census.mjs`). Against the zone, entry by entry: the same text at all 334,826, the same mark kind at all 29,395 marks, the same letter spans at all 69 marked words, the same pair halves at all 1,062 pairs. No difference (`data/page-vs-zone-diffs.tsv` is empty).

## 3. The findings

### F1. A legarmeh is named and drawn as a paseq (1,795 places)

- **The source.** 1,795 bars are a legarmeh (`<b>׀</b>`) and 498 a paseq (`<small>׀</small>`). The edition keeps a legarmeh with the word before it and sets a paseq between two words; the provider's note says the two «are visibly distinguished».
- **The page.** All 2,293 are one kind in the zone, `PASEQ`, drawn the same way, and every card says «a paseq: not a word of the book, but the scribes' bar standing between two words». Pressed in a browser at 30 places the source marks as a legarmeh, among them Genesis 2:5 (the edition's own example of a legarmeh, `shots/genesis-2-5-legarmeh-pressed.png`) and Deuteronomy 14:23: all 30 say «a paseq».
- **Cause.** The restore folds the two markups into one bar (`restore-mam-apparatus-v5.mjs` line 76, one pattern for `<b>`, `<small>`, `<strong>`), so the surface has one `paseq` column. `tools/zone-lib-v1.mjs:550` names every U+05C0 a paseq, and `MARK_KINDS` (line 561) has no legarmeh. The corpus lane's marks ledger already classes them apart (LEGARMEH 1,795, PASEQ 498, in `data/masoretic-marks-v1.json`, `classes_seen.mark_words`), and the page does not read that class.
- **Class.** Overrides a source's own answer.
- **Mend, by rule.** A bar is named by the class the edition gives it. The zone's mark carries the class from the source (the lane's mark-words ledger, or a reissued restore with the class in a column); `markOf` gains a legarmeh kind with its own sentence; a legarmeh is drawn with the word before it, a paseq between two words. A check then holds, per book, that the legarmeh and paseq counts equal the source's.

### F2. The gray maqaf (109 places, and 9 words flagged wrongly)

- **The source.** 109 strokes are wrapped as `mam-implicit-maqaf` (Psalms 75, Job 18, Proverbs 14 in the 107 my pattern reads). The edition added each one where the manuscripts write none, and draws it gray. None stands beside a space: `יְֽהִ֫י<span class="mam-implicit-maqaf">־</span>חֹ֥שֶׁךְ` (Job 3:4).
- **The page.** The stroke is drawn in the same gold as every maqaf (computed style at 30 places), so a reader cannot tell it from one the manuscripts write. The card says: «The source writes this joiner spaced out from the words on either side; it is read as a maqaf all the same (rule 2), and the two words stand as their own cards, joined.» Pressed at 30 of the 109 and at the 9 below: the same sentence each time (`shots/job-3-4-gray-maqaf-pressed.png`). The source does not write it spaced out.
- **The 9.** The zone flags 118 words. Nine of them carry an ordinary maqaf of their own and stand in a compound whose other stroke is the gray one: Proverbs 6:26 עַֽד־, 19:7 אֲחֵי־, 27:22 תִּכְתּֽוֹשׁ־ and אֶת־; Psalms 1:3 עַֽל־, 5:5 אֵֽל־, 18:1 הִֽצִּיל־, 42:5 עַד־, 66:20 לֹֽא־.
- **Cause.** The card's sentence: `zone.html:10732-10735`. The flag: the restore carries it on the whole compound, and `tools/serve-from-restore-v5.mjs:212` sets it on every piece that ends in a stroke.
- **Class.** The sentence overrides (it says of the source what the source does not do). The 9 fired with nothing to decide.
- **Mend, by rule.** The flag belongs to the stroke the source wraps and to no other. The stroke is drawn as the edition draws it, gray. The card says what the edition says: the edition added this maqaf; the manuscripts write none here. A check holds the flagged strokes to the source's spans, one for one.

### F3. Hover titles that say «Leningrad differs» (107 of 1,173)

- **What it is.** Not the edition's mark but ours: at the 1,173 places of the spelling bridge the zone's `ld` field gives the word a hover title, and an underline when the edition switch is on. Nothing shows at rest on a phone.
- **The fault.** At 72 places the title shows the same letters on both sides, for example Ruth 3:5 «Leningrad differs: תאמרי · MAM: תאמרי» and Ezekiel 48:16 «Leningrad differs: חמש · MAM: (חמש)[]». At 35 it prints a code: Deuteronomy 27:10 «Leningrad differs (macula:-|tahot:leningrad plus:י): מצותו · MAM: מצותו». At 76 more the difference is one of word division and the title shows a plus sign («בל+אמים»). All in `data/ld-places.tsv`.
- **Cause.** `zone.html:15460` prints the record's fields as they stand.
- **Class.** Fired with nothing to decide.
- **Mend.** A title only where the letters differ, in plain words; where the editions divide the words otherwise, say that.

### F4. The edition's notes on scroll differences (31 places)

- **The source.** 31 footnotes in six books, each on the word it is about, several of them about the scribes' marks themselves: Deuteronomy 11:21 «in the scrolls of Yemen הָאָֽרֶץ with a large tsadi», Numbers 25:12 «in the scrolls of Spain and Ashkenaz, a cut vav», Deuteronomy 27:19 «a doubtful closed section in the Aleppo Codex», Leviticus 7:21 «no section in the scrolls of Spain and Ashkenaz», Genesis 4:13 «in the scrolls of Spain and Ashkenaz מִנְּשֽׂוֹא». The full list with each note's text is `data/edition-notes.tsv`.
- **The page.** None. The restore lifts them out («FOOTNOTES lifted», lines 73–74 of its script; its receipts count `footnotes_lifted: 31`) and nothing after it carries them: no field of any zone, no line of the page or the card.
- **Class.** Not a rule of ours overriding an answer; a part of the source that is not served.
- **Mend, by rule.** A note is a record on its word: the note's own text, credited to the edition, marked on the line as the edition marks it and opened on the card. A check holds the count to the source's.
- **Note.** The edition's newer files for its provider leave the notes out («have no notes»), while the provider's export of today still serves them. Which the owner wants to follow is a ruling.

### F5. «A ketiv-qere of spelling» said of 30 words the source does not mark

- **The source** wraps one word: `כׇּל־<span class="mam-kq-trivial">מאֿוּם֩</span>` (Daniel 1:4). 130 spans.
- **The page.** 160 words wear the flag. The 30 extra are the neighbors a maqaf joins to the marked word: Daniel 1:4 כׇּל־, Deuteronomy 22:21 אֶת־, Ezekiel 43:11 three times, and the rest in `data/flag-places.tsv`. On each the card says: «The source marks this word as a ketiv-qere of spelling and prints it in one form; the page prints that form and chooses nothing.» Pressed at all 30: the sentence is there each time.
- **Cause.** `tools/serve-from-restore-v5.mjs:205`: the row's flag is set on every piece of the compound.
- **Class.** Fired with nothing to decide.
- **Mend.** The flag goes to the piece the source wraps; a check holds the flagged words to the source's spans.

### F6. The English marked on the written form (19 pairs)

- **What a reader sees.** Under a pair the page marks one half as the half the English reads, and the card opens on it. At 967 of the two-sided pairs the line is STEP's reading and the mark is on the read form. At 19 the mark is on the written form.
- **What STEP says.** At 11 of the 19, STEP's own row is of type Q, so its words read the Qere, and at 9 of those it gives the Ketiv its own reading apart: Deuteronomy 33:2 the page says the written אשדת reads «fire of + law», STEP gives the Ketiv as «fiery law»; Jeremiah 6:29 «from + a fire + it is complete» against the Ketiv's «from/ fire/ their»; Psalms 55:16 «may it deceive + death» against «desolation»; Psalms 10:10 «an army + of disheartened people» against «unfortunate people»; 1 Chronicles 9:4 «Bani + from» against «Benjamin»; and Ezekiel 42:9, 2 Samuel 5:2, Job 38:12, Nehemiah 5:7. At 8 (seven in Daniel, and Hosea 4:6) STEP's row is of type L and its Hebrew spells the letters of our written form, so STEP makes no statement either way. All 19 in `data/kq-line-on-written-form.tsv`.
- **Seen in a browser** at Deuteronomy 33:2 (`shots/deut-33-2-pair-pressed-written.png`): the card's head reads «ketiv — written · no vowels of its own, so its readings are matched by letters only», and under it «fire of + law». The same at Psalms 55:16, Ezekiel 42:9, Job 38:12, 2 Samuel 5:2.
- **Cause.** `zone.html:6339-6340` (`kqPlace`) and `6419-6421` (`kqPickG`) find the half by the letters STEP's pieces spell and take the first that fits. Where the two halves spell the same letters (one word for two, two for one) the written form stands first and wins.
- **Class.** Overrides STEP's own statement at the 11; at the 8 nothing is overridden.
- **Mend, by rule.** Where the source says which form its words read, the line stands on that form; where both halves spell the same letters and the source is silent, on the read form. A check holds every pair whose STEP row is of type Q to a line marked on the read form.

### F7. Fourteen words with no English (14 places)

The page's own record of its lines at rest counts them (`data/resting-lines`, `words_under_no_line`: 14 in all), so the house figure «none bare» holds for 305,417 of the 305,431 words. The browser census finds the same 14:

- **Seven pairs** whose read form our text spells a letter otherwise than Leningrad: 1 Samuel 25:18, 2 Samuel 5:8, 2 Kings 2:16, 2 Kings 16:6, Isaiah 10:13, Jeremiah 48:5, Judges 16:26. STEP reads each: «prepared», «[who are] hated», «the/ valleys», «and/ Edomites», «and/ provisions/ their», «<the>/ Luhith», «and/ let feel/ me». The pin holds them: the bridge «lays pieces on a plain word only».
- **Four times בַּלְאֻמִּים** (Psalms 44:15, 57:10, 108:4, 149:7). STEP's own main row here is our word: `בָּ/לְאֻמִּים` «among the/ peoples», type V, with Leningrad's «not// peoples» given as the variant. The zone carries the variant's headword (בל, H1077) and no pieces. The pin holds the place «until the corpus lane says how STEP's line reads there»; STEP's bytes already say.
- **Three words** that STEP's text writes as two: 1 Samuel 14:49 וּמַלְכִּישׁוּעַ («and/ Malki-» + «Shua»), Job 18:15 מִבְּלִילוֹ («because/ not» + «[belonging] to/ him»), Psalms 102:4 כְּמוֹקֵד («like» + «a hearth»). A real difference between the two texts.
- **Class.** A hold, not a rule that overrides. At the four the source already answers; at the seven and the three two sources' answers want reconciling.
- **Mend, by rule.** Where STEP's main row spells our word, its pieces are the place's pieces. A pair's read form takes bridge pieces as a plain word does. Where STEP writes two words for our one, the line reads STEP's two readings side by side.

### F8. STEP's brackets taken off (9 places)

At read forms of several words the page prints STEP's words without the square brackets STEP writes around a word that is not in the Hebrew: Exodus 4:2 «what + is this?» (STEP: «what/ [is] this?»), Ezekiel 8:6, 1 Chronicles 27:12 («jaminites» for «jaminite[s]»), 2 Kings 18:27, 2 Samuel 8:3, Isaiah 3:15 and 36:12, Nehemiah 2:13, Psalms 10:10. Everywhere else the page keeps them («[am] a kinsman-redeemer»). Cause: the read-words list these places are laid from carries the words with the marks taken off. Class: overrides STEP's own writing. Mend: print each piece as STEP writes it, as the spelling bridge has done since its version 1.1. This belongs with the pass on STEP as it serves itself; it is listed here because it was found at the pairs.

### F9. A word written and not read wears a wrong English line (8 of 8)

- **The mark.** Eight words stand in parentheses with no read form: the tradition writes them and does not read them.
- **The page.** Each wears an English line like any word, credited to Strong's, found by its bare letters. The card's head says «ketiv — written · no vowels of its own, so its readings are matched by letters only» and never that the word is not read.
- **STEP's own row** at each place: the read text is empty (`[ ]`), and the written word is given apart with its reading.

| Place | Written | The page's line | STEP gives the written word as |
|---|---|---|---|
| Ruth 3:12 | (אם) | mother | אִם «if» |
| 2 Samuel 13:33 | (אם)־ | mother | אִם «except» |
| 2 Samuel 15:21 | (אם) | mother | אִם «except» (STEP's text reads it) |
| Jeremiah 39:12 | (אם) | mother | אִם «except» |
| 2 Kings 5:18 | (נא)־ | raw | נָא «please» |
| Jeremiah 38:16 | (את) | sign | אֵת «<obj.>» |
| Jeremiah 51:3 | (ידרך) | archer | יִדְרֹךְ «he bend» |
| Ezekiel 48:16 | (חמש) | fifth | חֲמֵשׁ «five» |

- **Seen in a browser** at all eight (`shots/ruth-3-12-press-ketiv.png`; the pressed reading on the card is the same wrong word).
- **Cause.** `zone.html:6436-6457` (`kqPick`). The rule there keeps the written half from being backed by «the catalog's lead for its letters» because that lead «is a reading of another word spelled the same», and then excepts this case: «A pair with no read half keeps its one half.» So the one case with nothing read gets exactly the lead the rule exists to keep out.
- **Class.** Overrides the text's own mark (not read) and STEP's own answer.
- **Mend, by rule.** A written form with no read form is not read: its line is never the letters' lead. It shows STEP's own word for the written form, marked as written and not read, or nothing; and the card says «written, not read». The corpus lane has STEP's word for each in STEP's variant column.

### F10. A word read and not written (9 of 9)

Printed in its square brackets, with a line (MACULA's pieces at 8, Strong's at 2 Samuel 18:20), since STEP joins the word to the row before it. The card says «qere — read · its vowels are the reading» and then the two-sided sentence about parentheses and brackets; it never says that nothing is written here. At three the reading the card opens pressed is not the line's: Ruth 3:5 and 3:17 the line «to + me», the card «power»; 2 Kings 19:37 the line «sons + his», the card «Bani». Mend: the card of a one-sided place says which side is missing.

### F11. The empty verse (2 places)

Joshua 21:36 and 21:37 draw the dash and a rule, shown at rest. The card says «the edition prints a dash in its place». The edition has no verse there and no dash; the dash is in the files it makes for its provider, so that another version's text does not show. Cause: `tools/zone-lib-v1.mjs:556-558`. Mend: say that the numbering counts a verse the edition does not have.

### F12. Dots above and below (1 place)

Psalms 27:13 לׅׄוּׅׄלֵׅ֗ׄאׅׄ carries a dot above and a dot below each of four letters (four U+05C4 and four U+05C5). The dots are printed. The card says «letters 1, 2, 3, 4 of this word written with a dot above by the scribes». Cause: one sentence for the class (`zone.html:10712`). The other 16 dotted words have dots above only and read right.

### R1 and R2. Two rulings, shown for their size

- **R1.** On a first visit the page draws none of the 23,211 sof pasuq, 2,293 bars, 1,570 petuchah and 1,982 setumah: 29,056 marks, each in the page and hidden until the reader presses «show the scribes' marks». The frame holds them off by the owner's rules 4 to 6. Among them, 145 setumah, 24 petuchah and 7 sof pasuq stand inside a running verse, where at rest nothing shows the break. Once shown, each is a small tile; the card says what the mark asks (a petuchah, a new line; a setumah, the same line), and the page itself draws neither a new line nor a gap. The song spacing, the inverted nun and the empty verse are always drawn.
- **R2.** The maqaf is printed at every one of its 42,635 places, on the word before it. On a first visit 35,715 of them are followed by a space and the next word in its own cell (the owner, 20 November 2026: the words stand alone at rest); 6,920 are drawn joined (sign cells and span cells, section 5). The card of each word says «joined by a maqaf to the next word — one breath, each word its own card». A reader can set «joined words: as written».

Neither is a fault by the principle. They are here because, under them, two of the text's most common marks are not drawn as the mark asks on a first visit.

## 4. Each class read by hand

`read-by-hand.tsv` holds 719 places in 30 classes, up to 30 a class and every place of a class that has fewer: the source's markup, what the page draws on a first visit, what it draws with the marks shown, what a press shows, and my reading. 688 were opened and pressed in a browser (`scripts/p_read.mjs`, `data/read-by-hand-page.json`); the 31 notes have nothing on the page to press.

| Class | Read | Reading |
|---|---|---|
| maqaf | 30 | stroke printed in place; the next word apart (R2); the card says it joins |
| gray maqaf | 30 | F2 at all 30 |
| flagged gray, not so in the source | 9 | F2 at all 9 |
| ketiv and qere, written first | 30 | both forms as the source prints them; the line on the read form; the card says which is written and which is read |
| ketiv and qere, read first | 30 | the same; the source's order kept |
| one word for two, two for one | 30 | 24 right; 6 are F6 |
| written, not read | 8 | F9 at all 8 |
| read, not written | 9 | F10 |
| trivial pair | 30 | as the edition does: one pointed form, nothing set apart; the card says the source marks it |
| flagged trivial, not so in the source | 30 | F5 at all 30 |
| paseq | 30 | hidden at rest; right once shown |
| legarmeh | 30 | F1 at all 30 |
| bar inside a read form | 16 | its own block never drawn; the stroke drawn inside the brackets when the marks are shown |
| sof pasuq | 30 | hidden at rest; right once shown |
| petuchah; petuchah inside a verse | 30; 24 | hidden at rest; a tile once shown; the card says what it asks |
| setumah; setumah inside a verse | 30; 30 | the same |
| song spacing | 30 | drawn as a ruled space; right |
| inverted nun | 9 | drawn at rest; the card tells the pair of Numbers 10:35–36, the run of Psalms 107:23–28 and the lone one of 107:40 apart, each rightly |
| large, small, hung letter | 27, 23, 4 | drawn so on the right letter (1.45, 0.68 and 0.82 of the word's size, the hung one raised); the card names the letter |
| dotted letters | 17 | dots printed, letters tinted; F12 at one |
| meteg; rafe; two vowels on one letter | 30 each | printed in place; the card says nothing of them |
| our spelling against Leningrad's | 30 | a hover title only (F3) |
| empty verse | 2 | F11 |
| the edition's notes | 31 | absent (F4) |

## 5. Divisions: whose is each

`divisions.tsv` has one row per kind with its count and how it was counted. In short:

**Where the page divides a word of the source.**
- A maqaf compound into its words: 41,177 compounds, 42,635 strokes. The text's own mark, and STEP's too (STEP numbers words «dividing words by spaces and maqqef»).
- A word's line into pieces, each in its frame: 145,018 words by STEP, 34 by MACULA where STEP gives none. I held every word to STEP's own cut (the «/» in STEP's Hebrew column, fetched from STEP's public files to `dl-step/`): in the 23,097 verses whose words line up one to one with STEP's rows, 301,686 words spell STEP's letters, and **the pieces equal STEP's cut at every one of them; none differs** (`scripts/g_pieces_vs_step.py`).
- A pair into its two forms in one cell: 1,062. The text's own mark.
- On the card only: at 394 places the parts offered for the word's key cut a word STEP leaves whole (the name written אדני and the like). It is MACULA's own division, declared so in the zone. Two sources held side by side.
- The spelling bridge: 211 places laid with STEP's pieces cut onto our letters. Ours, and the one thing of our own the principle names.

**Where the page joins words of the source.**
- 6,556 cells of two words in which a word whose whole line is a hidden sign (אֶת־ at 6,445 of them) is drawn with the word its stroke joins it to. **Ours alone** as a drawing rule; it acts only where the text's own stroke already joins the two, each word keeps its own card, and it overrides no source.
- 742 cells of two to four words with one row of parts, where a dictionary that stands files the words as one entry. At 451 it is STEP's own: its tag on the first word carries the «+» that says the same entry covers the next word. At 286 it is a dictionary's only, STEP tagging each word apart: STEP's brief lexicon for כי אם at 151, the unabridged BDB for אף כי at 19, the UBS dictionary, the SDBH, Strong's and the Lexical Index for the rest. 5 I could not match. Every cell with the row its line reads is in `data/joined-cells-attributed.tsv`.
- 6 places where one English line stands under two words, a dictionary's row each time.
- 36 pairs whose written or read form holds two or three words. The text's own mark.

**Ours alone, small.** 13 words at 7 places carry pieces credited to no source (a role and letters, no words): Ezra 3:5, 1 Chronicles 20:4, 2 Chronicles 20:1, 20:35 and 24:4, 2 Samuel 18:20, Song of Songs 6:12, all places where STEP writes as one word what our text writes as two. Suspected, not traced.

**Not lined up.** 1,686 words in 109 verses where the zone's words and STEP's rows differ in number; my walk does not compare them.

## 6. The checks that guard this

| Check | What it proves | What it does not |
|---|---|---|
| check-restore-serve-v1 | the zone reproduces the restore's hash; no word holds a stroke inside it; every mark is keyless and at its own position | that the restore equals the source's markup; anything about what a mark is called |
| check-k-maqaf-preserved-v2, check-maqaf-lattice-v1 | keys and strokes obey the key rule; a compound's words rejoin to its surface | how the page draws a stroke |
| check-maqaf-pair-drawn-v1 | on the first runs it finds, the words stand alone at rest and join under the switch | every run (it samples) |
| check-implicit-maqaf-v1 | a joiner is never a word of its own | which stroke carries the flag; the card's sentence. Its header still says 103 places and that the three books are not served |
| check-kq-carried-v1, check-kq-presentation-v1 | both halves are carried and printed as the source writes them | which half the English is marked on |
| check-kq-lead-follows-switch-v1 | the card opens on the half the line reads; the Hebrew never moves | that the half is the one STEP's words read (F6) |
| check-kq-declared-weld-v1 | the written half's readings are the place's own; KW6: where there is no place reading and a read half, the line never prints the lead of the written letters | the pair with no read half (F9), which its rule excepts |
| check-kq-graded-v1 | the read half is graded by its vowels, the written by letters | |
| check-paseq-place-v1 | the 16 bars inside read forms print there, and the export writes them there | the other 2,277 bars; legarmeh |
| check-read-words-v1, check-spelling-bridge-v1 | the lists land as pinned; laid places read STEP's words | the places the pins hold back (F7) |
| check-masoretic-gold-v1 | every mark is gold by its class; on the first book's opening sections the page's text is the zone's | the whole page (my census did all 334,826 entries) |
| check-apparatus-not-stripped-v1 | a copy that lost the source's class labels is noticed | a label that never reached the surface (the notes, the legarmeh's markup) |
| check-c0-refusals-v1, check-nothing-welded-v1 | no mark is welded to a word; no torn word | |
| check-bookword-count-v1 | the stamped counts are the bytes' | |

**What no check proves:** that the zone's text equals the source as published (done here, all 39 books); that a flag sits on the word the source marks (F2, F5); that a bar is the kind the edition says (F1); that the notes are carried (F4); that a written-not-read word has no letters' lead under it (F9); that the line's mark is on the form STEP reads (F6); that a card's sentence about a mark is true of the source (F2, F11, F12); that a hover title's two sides differ (F3).

## 7. What I checked and found clean

- **The text.** All 23,206 verses of the 39 books: the provider's export of today, the restore surface and the zone hold the same characters in the same order: 1,205,351 letters and 1,297,940 points and accents, with every count of the table in section 2 equal. The only differences are the 16 bars of section 1.
- **The page against the zone.** 334,826 entries, the same text, kinds, letter spans and pair halves at every one.
- **Every mark at its place.** Because the characters agree in order within every verse, every sof pasuq, bar, section mark, inverted nun and song space stands where the source writes it, the 169 section marks inside verses among them.
- **The 16 bars inside read forms.** Each is drawn inside the brackets when the marks are shown, and its own block after the pair is not.
- **Letter marks.** All 71 marks on 69 words sit on the letter the source wraps (source markup against the zone's letter number against the span the page draws, with the points that ride on the letter), the small letter inside a written form at Job 7:5 among them.
- **Pairs.** 1,062 of 1,062 carried, in the source's order (916 written first, 129 read first, 8 and 9 one-sided). At 967 two-sided pairs the line is STEP's own reading, marked on the read form.
- **Pieces.** 301,686 words: the pieces under the word are STEP's own cut, with no difference.
- **The inverted nun's card.** All nine say rightly whether the mark opens or closes a pair, stands in a run or stands alone.

## 8. What I could not check, and why

- **The edition's Hebrew introduction** and the edition's own pages: Hebrew Wikisource, English Wikisource and the provider's live site are closed to this session. I used the provider's public export and the edition's English documentation as published by its tooling maintainer.
- **The corpus lane's dump.** It is not on the store. The provider's export of today stands in for it, and equals the restore surface, so the dump of July and the export of November agree.
- **The edition as it stands today.** Its own files for the provider (documented 26 October 2026) count 1,787 legarmeh, 508 paseq, 1,571 pe breaks, 1,047 pairs, 149 trivial pairs and 116 gray maqaf, and no notes. The provider serves, and we carry, 1,795, 498, 1,570, 1,045, 130, 109 and 31. Our text is the provider's, not the edition's latest.
- **How the glyphs look.** I read computed styles (size, raise, color, display) and five screenshots, not every accent's rendering in the font.
- **1,686 words in 109 verses** not lined up with STEP's rows.
- **Two cards** showed no readings within the wait on a loaded machine (Ezekiel 42:9, Isaiah 56:10); nothing is concluded from them.
- **Seen on the way, for other passes.** At 20 of 60 two-sided pairs pressed, the reading the card opens pressed is not part of the line (Deuteronomy 28:27 the line «and + with <the> + tumors», the card «emerod»). At four pairs the line is not STEP's and is a different word or form: 2 Kings 6:25 [דִּב־] «bear» where STEP reads dove's dung; 2 Samuel 18:12 «and + [will belong] to + him» where STEP reads «and/ if»; Daniel 5:16 «be able»; Ruth 4:5 «attain». All pairs against STEP's rows: `data/kq-against-step.tsv`.

## 9. Files

In `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/w39/out/F/`:

- `marks-by-book.tsv`: every mark, per book, counted in the source, the restore, the zone and on the page.
- `divisions.tsv`: every kind of division and join, its count, whose it is.
- `read-by-hand.tsv`: the 719 places read by hand.
- `data/flag-places.tsv`: the 30 and the 9 words flagged wrongly (F5, F2).
- `data/edition-notes.tsv`: the 31 notes with their text (F4).
- `data/kq-places.tsv`, `data/kq-against-step.tsv`, `data/kq-line-on-written-form.tsv`: every pair, what the page draws under it, and STEP's own row (F6, F7, F9, F10).
- `data/ld-places.tsv`: the 1,173 hover titles as the page writes them (F3).
- `data/joined-cells-attributed.tsv`: the 7,298 joined cells, each with the dictionary row its line reads and STEP's tag.
- `data/page/<book>.json`: the page as drawn, every entry of every section; `data/page-marks-by-book.tsv`; `data/page-vs-zone-diffs.tsv` (empty).
- `data/pieces-not-steps-cut.tsv` (empty: no difference); `data/verse-diffs.tsv` (the 16 verses and my own counting notes).
- `data/read-by-hand-page.json`: the browser's record for the 688 places pressed.
- `scripts/`: every script, read-only; `shots/`: five screenshots; `dl-*/`: the downloads (about 90 MB in all).
