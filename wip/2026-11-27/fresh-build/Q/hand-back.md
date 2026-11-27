# Auditor Q2: is every line at its word? (the audit, finished)

Throughout, `S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`. I wrote only under `S/s47w/q2/`. I read the frozen copy and the raw files and changed neither, and I ran every raw-reading script with `python3 -I`. I did not commit or push.

## In brief

- **Most of the card holds.** On 599 sampled words I confirmed 6,008 lines in the raw files at the right word, with no failures. That covers STEP, MACULA, UBS, the Open Scriptures BDB, and the one lines of six dictionaries.
- **The unabridged BDB's «cites this verse» line fails at 14 of 381 lines (13 words).** At each of them the card names a sense or unit of another verb stem. 3 more lines are unconfirmed, all on written-and-read pairs.
  - The first auditor's check d passed all 381. Its reader cuts the record exactly as the page does, so it could not see a stem. I mended the check (section 1).
- **597 UHAL rows cannot be confirmed.** They say «This dictionary has an entry for the number, but its file is not on hand here». The files on hand (151 UHAL files) cannot show that an entry exists, so these are unconfirmed.
- **The stem fault across the whole page is larger than the lead's notes say.** The «about 4,000» was a cap in the first sweep's script (`if len(rows) < 4000`), so its file covers only 14 books.
  - The sweep's own uncapped count is 7,536 lines on 7,342 words.
  - My stricter test sets aside stems named in passing and takes STEP's grammar as witness. It gives 6,052 lines on 6,018 words, plus 544 lines where the card prints «the opening».
  - Of 20 sweep rows I read by hand: 7 print another stem's numbered sense, 8 print another stem's name with no sense, and 5 are something else.
- **Reading the 60 cards by hand, 12 show a line that does not belong to the word** (section 6).

## 1. The first auditor's checks: what I judged and what I changed

I redrew the sample and re-ran checks a to e unchanged. All six outputs came out byte-identical to the first ones.

- **a (STEP): sound.** The test that ordinals agree is lenient. Any w=2 or w=4–6 word, or any unmet row, in the verse excuses a difference. But it is backed by a strict verse-level test: every STEP row between the verse's first and last named row must be named or listed unmet, words must never go back, and the run must open and close STEP's verse.
  - The `un` list (STEP's unmet rows) is not compared to the raw file. I checked the only one in the sample by hand: 2 Sam 7:22, row 4, אֲדֹנָי «O Lord», matches the raw row.
- **b (MACULA): sound.** It meets our words with MACULA's by its own alignment on the letters.
- **c (UBS): sound.** It checks that the sense lists this verse at the printed word number, that the entry is this word's (STEP's number or MACULA's lemma), and that it is this occurrence (MACULA morphs counted ×2).
  - I tried MACULA's own `sdbh` column as a second witness. It follows another SDBH numbering: «tree» is 005588… in MACULA but 005596… in 0.9.4, and 005588… in 0.9.2 is «eyelids». It cannot be used without a crosswalk, and I concluded nothing from it.
- **d, Open Scriptures BDB: sound.** That file nests stems as senses.
- **d, unabridged BDB: unsound for this question.** `q_lib.units` cuts records only at `<div>` and lettered sub-points, and stems often begin in bold inside a unit. So «the reference is in the unit» is true at Gen 1:11 even though the unit is Niph`al's.
  - The mend, `q2_check_d2.py`: for each line, find the stem the record names last before the reference and the stem of the unit the card names. Stems named in passing are set apart: inside a nearby bracket, after see/compare/read/Kt/Qr/apparently/others, or anywhere in a record that is not a verb's. STEP's grammar on the raw row is the witness; a written form's grammar comes from its K= variant.
  - Verdict: failed when the unit's stem differs and STEP's stem (or its family) is the stem at the reference; unconfirmed when STEP does not settle it.
- **e (dictionaries): sound.** I now count UHAL's «not on hand» rows as unconfirmed instead of «no entry shown».

## 2. The sample

The sample was drawn by `S/s47w/scripts/q_sample.py`. Words are numbered 1 to 305,431 across the 39 books in index order, with marks not counted. EVERY1000 takes every multiple of 1,000. Each hard class is taken from the page's own marks: all its members if there are 40 or fewer, otherwise the members at index floor((j+0.5)·N/40).

| Class | In the class | Drawn |
|---|---|---|
| EVERY1000 | 305 | 305 |
| KQ (written and read) | 1,045 | 40 |
| K_ONLY (written, not read) | 8 | 8 |
| Q_ONLY (read, not written) | 9 | 9 |
| SPELL | 1,021 | 40 |
| ONE_FOR_TWO | 47 | 40 |
| TWO_FOR_ONE | 64 | 40 |
| VN (verses numbered otherwise) | 396 | 40 |
| UBS_MACULA_FORM | 19,753 | 40 |
| BDB_SEVERAL | 64,975 | 40 |
| NO_STEP | 2 | 2 |
| NO_MACULA | 8 | 8 |

That is 612 draws on 599 distinct words. One caveat on the sampling: BDB_SEVERAL holds only words with a «cites this verse» line whose number stands on several records (64,975). That is narrower than all 185,307 words whose number reaches several records.

## 3. Counts (lines: confirmed / failed / unconfirmed)

| Class | a STEP | b MACULA | c UBS word | c UBS verse | d BDB OS | d BDB unabr. | e six dicts | e UHAL shown | e UHAL not on hand |
|---|---|---|---|---|---|---|---|---|---|
| EVERY1000 | 306/0/0 | 305/0/0 | 279/0/0 | 7/0/0 | 2/0/0 | 136/5/0 | 1770/0/0 | 7/0/0 | 0/0/288 |
| KQ | 80/0/0 | 40/0/0 | 35/0/0 | 25/0/0 | 4/0/0 | 56/2/3 | 312/0/0 | 0/0/0 | 0/0/52 |
| K_ONLY | 8/0/0 | 8/0/0 | 2/0/0 | 5/0/0 | 0 | 4/0/0 | 48/0/0 | 4/0/0 | 0/0/4 |
| Q_ONLY | 9/0/0 | 9/0/0 | 5/0/0 | 1/0/0 | 0 | 2/0/0 | 48/0/0 | 0 | 0/0/8 |
| SPELL | 40/0/0 | 40/0/0 | 38/0/0 | 1/0/0 | 1/0/0 | 26/4/0 | 240/0/0 | 0 | 0/0/40 |
| ONE_FOR_TWO | 47/0/0 | 43/0/0 | 37/0/0 | 8/0/0 | 1/0/0 | 26/0/0 | 270/0/0 | 0 | 0/0/45 |
| TWO_FOR_ONE | 65/0/0 | 51/0/0 | 34/0/0 | 23/0/0 | 3/0/0 | 46/0/0 | 348/0/0 | 5/0/0 | 0/0/53 |
| VN | 40/0/0 | 40/0/0 | 28/0/0 | 1/0/0 | 0 | 5/0/0 | 234/0/0 | 2/0/0 | 0/0/37 |
| UBS_MACULA_FORM | 40/0/0 | 40/0/0 | 68/0/0 | 1/0/0 | 0 | 17/0/0 | 216/0/0 | 0 | 0/0/36 |
| BDB_SEVERAL | 40/0/0 | 40/0/0 | 36/0/0 | 2/0/0 | 0 | 46/3/0 | 240/0/0 | 1/0/0 | 0/0/39 |
| NO_STEP | 2/0/0 | 2/0/0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| NO_MACULA | 8/0/0 | 8/0/0 | 0 | 5/0/0 | 0 | 3/0/0 | 36/0/0 | 2/0/0 | 0/0/4 |
| **All** | 672/0/0 | 613/0/0 | 559/0/0 | 74/0/0 | 11/0/0 | 364/14/3 | 3696/0/0 | 19/0/0 | 0/0/597 |

- 59 written forms carry no MACULA line, as designed, and are not counted.
- By word, leaving out UHAL: 584 words have every line confirmed, 13 have a failure, and 2 have only unconfirmed lines.

## 4. Every failure and unconfirmed case

All are unabridged BDB «cites this verse» lines. In each failure the card names a unit of stem X, the record cites the verse under stem Y, and STEP gives the word stem Y.

**Failed (14 lines, 13 words):**
1. Exod 16:21 w10 וְנָמָס «Qal.» — the reference stands under Niph`al. EVERY1000.
2. Num 14:30 w10 לְשַׁכֵּן «2. e.» (Qal) — Pi`el; the right sense, «2. make to dwell», exists in the record. BDB_SEVERAL.
3. Deut 18:15 w5 יָקִים «2. a. c.» «impose» (Pi`el) — Hiph`il. BDB_SEVERAL.
4. 1 Sam 2:10 w3 מְרִיבָו «4.» «make complaint» (Qal) — Hiph`il. SPELL.
5. 2 Sam 11:24 w1 וַיֹּראוּ «Qal» — Hiph`il. SPELL.
6. Jer 4:22 w11 נְבוֹנִים «4.» «have discernment…» (Qal) — Niph`al. EVERY1000.
7. Jer 5:7 w15 יִתְגּוֹדָדוּ «Qal» — Hithpo`el. SPELL.
8. Ezek 7:21 w8, on both forms, «2.» «be polluted, defiled» (Niph`al) — Pi`el; the word means «profane». KQ.
9. Zech 3:6 w1 וַיָּעַד «Qal» — Hiph`il. EVERY1000.
10. Ps 74:10 w4 יְחָרֵף «Qal» — Pi`el. EVERY1000.
11. Ps 141:4 w6 לְהִתְעוֹלֵל «1.» «busy, divert oneself» (Hithpa.) — Hithpo`el. BDB_SEVERAL.
12. Ruth 2:11 w5 הֻגֵּד «5.» «avow, acknowledge, confess:» (Hiph`il) — Hoph`al. EVERY1000.
13. Dan 5:16 w16 לְהוֹדָעוּתַנִי «Pe`al» — Haph`el. SPELL.

**Unconfirmed (3 lines; all KQ):**
- Exod 16:2 w1, written form וילינו (Hiphil by STEP's K=): the line «Niph`al» is the stem of the read form.
- Prov 19:16 w7 (יומת)[יָמוּת]: the record cites the verse twice, under Qal 2 d and under Hoph`al 4, and the card puts both lines on both forms. The written form gets the Qal line and the read form gets the Hoph`al line; I count those two cross-matched lines as unconfirmed.

**Unconfirmed UHAL rows:** 597 (word, number) pairs. By class: EVERY1000 288, KQ 52, TWO_FOR_ONE 53, ONE_FOR_TWO 45, SPELL 40, BDB_SEVERAL 39, VN 37, UBS_MACULA_FORM 36, Q_ONLY 8, K_ONLY 4, NO_MACULA 4.

## 5. The stem sweep, verified

The first sweep's file stops at 4,000 rows. An uncapped copy, with only that line changed, gives 7,536 point lines on 7,342 words, plus 753 opening lines, across all 39 books. I picked 20 rows spread across books and stems by a fixed rule (`q2_pick20.py`) and read each in the raw record.

**Another stem's point** (the card prints a numbered sense of another stem): **7.**
In all 7 the reference stands in the right stem's list of forms, written inside the other stem's point.

| # | Word | Card prints | Word's stem | Right sense in the record |
|---|---|---|---|---|
| 1 | Lev 12:2 תַזְרִיעַ | «2. be fructified» (Niph`al) | Hiph`il | Hiph`il 2 cites the verse; the file labels it «Qal 2. 2.» and the card shows it too |
| 2 | 2 Kgs 4:4 | «4.» (Qal) | Hiph`il | «2. remove» cites the verse; also on the card |
| 3 | Hos 4:12 | «2.» (Niph`al) | Hiph`il | «3. cause to err» cites the verse; also on the card |
| 4 | Job 32:15 | «2. advance» (Qal) | Hiph`il | points exist, none cites the verse; only line |
| 5 | Num 12:12 | «6. devour» (Qal) | Niph`al | «3. be wasted» cites the verse; also on the card |
| 14 | Mic 1:4 מֻגָּרִים | «4. be stretched out (?)» (Niph`al) | Hoph`al | no point; only line |
| 17 | Nah 2:5 | «3. be praised, commended» (Hithpa.) | Hithpo`el, «act madly» | no point; only line |

**The verse in a stem's list of forms, with no point** (the card prints another stem's name and no sense number): **8.**

| # | Word | Card prints | Word's stem | Right stem's points |
|---|---|---|---|---|
| 7 | Prov 22:2 | «Qal» | Niph`al | none |
| 8 | Deut 1:24 | «Qal» «go about» | Pi`el «spy» | points, none cites the verse |
| 9 | Jer 51:20 | «Qal» | Pi`el | none |
| 10 | Song 1:9 | «Qal» | Pi`el | «1. liken» cites the verse; also on the card |
| 12 | Joel 1:10 | «Qal» | Pu`al | none |
| 13 | Amos 8:13 | «Pu`al» «covered, encrusted» | Hithpa`el «faint» | none |
| 15 | Dan 5:7 | «Pe`al» | Haph`el | none |
| 16 | Ezra 4:21 | «Pe`al» | Pa`el | none |

**Anything else: 5.**
- Four where the card is right and a stem named in passing fooled the sweep: 11 Ezek 5:16 «add (= Qal)»; 18 Obad 1:15 «see נתן Qal 2 b» in a noun record; 19 Exod 29:24 «compare נוף Hiph`il 4»; 20 1 Kgs 2:32 «compare Qal 7 f».
- One where the line belongs to another word: 6 Isa 66:8. The line «3.» is the record's Niph`al citation for יִוָּלֵד, another word of the verse, shown at the Qal יָלְדָה. The right «1. c.» is also on the card.

**Whole page, by my test** (STEP's grammar agreeing with the stem at the reference):
- Numbered sense of another stem: 3,457 lines on 3,435 words.
- Another stem's name with no sense: 2,595 lines on 2,584 words.
- Together 6,052 lines on 6,018 words; 2,863 of them print the other stem's gloss in «».
- Where the reference stands, for the numbered kind: the right stem has a point citing the verse 1,760, no point 1,269, points none citing 271, the reference inside a numbered point 157. For the name kind: 564, 1,938, 84 and 9.
- My test agrees with my hand verdict on all 20 rows. Of the first sweep's 7,536 rows it confirms 5,759; 1,260 are stems named in passing; 517 are cases where STEP disagrees or the word is not a verb. It adds 305 lines the sweep missed.
- A further 544 lines print «the opening» for a verse cited under a later stem.
- File slips: a cross-reference the file marks up as a point gives a stray stem label. Examples are BDB6428 «Hiph`il 1.» at 42 Qal words of עשׂה (Gen 6:22 «and he did») and BDB7550 «Qal 6.» at 56 Niph`al words of קרא. In all, 236 lines on 235 words.

## 6. The 60 cards read by hand

At 12 cards a line does not belong to the word:
- **7, 2 Sam 24:15 הָעָם:** BDB6147 עַם «kinsman» (II. עַם, another word) stands as one of the word's own records.
- **8, 2 Kgs 12:16 לְעֹשֵׂי:** BDB6436 עָשָׂה «press, squeeze» stands as one of the word's own records.
- **14, Ruth 2:11:** «5. avow, acknowledge, confess:» is Hiph`il's sense at a Hoph`al (failure 12).
- **17, 1 Sam 6:5 Kt:** BDB6252 עֹפֶל «mound, hill» stands beside «tumour».
- **22, Neh 5:7, read form:** under STEP's H5375K the only record is the Aramaic BDB9721 נְשָׂא «lift, take, carry», at «[are] lending», with no language word on the line. The raw file lists the Hebrew נָשָׂא (BDB5385) under H4984_H5379 and the Aramaic one under H5375_H5376.
- **23, 2 Sam 15:21 (אם), written not read:** «b. Special uses:» cites the verse for the later «אִם … אִם, whether … or», not for this «except».
- **41, Ps 10:10:** UBS's חֵילֵךְ «Helech» (a place) stands beside חַיִל. Borderline: the card says nothing in the files decides which.
- **44, Exod 20:16 נָמוּת:** the Aramaic noun BDB9653 מוֺת «death» stands as one of the word's own records at «we should die».
- **53, Exod 4:18 אֵלְכָה:** «** go» is the citation of לֵךְ לְשָׁלוֹם later in the verse.
- **54, Josh 5:1 יָמָּה:** «1. Mediterranean» belongs to הַיָּם later in the verse. The right line, «9.», is printed second.
- **57, Ps 92:15:** the Aramaic BDB9907 «flourishing» «cites this verse» only through «compare Biblical Hebrew Ps 92:15».
- **58, Dan 11:18 w12 יָשִׁיב:** both BDB lines, «Hiph`il» and «6. a. b. turn toward», are about word 1 (Kt וישב / Qr וישם, «set his face»).

The other 48 cards hold, with two caveats. Cards 3, 11, 12, 20, 43, 49, 55 and 56 show Aramaic records as the word's own, but labeled «(Biblical Aramaic)». Card 40 (Isa 9:6) is a wording problem only: it says STEP's English «for the whole stands under both» words, while the second written word carries only «[the] increase of». Dan 1:8 has the same issue.

## 7. What holds to the letter but misleads

1. **The stem fault** (section 5): about 6,000 words.
2. **«Cites this verse» at a word whose number recurs in the verse.** 29,728 unabridged lines (and 363 Open Scriptures lines) stand at such a word. 17,653 forms show one record cited at two or more places. The sense label reads as this word's, but it is often another word's (cards 23, 53, 54, 58; Isa 66:8; Gen 4:18).
3. **Homonym and other-language records standing as the word's own:** «kinsman», «press, squeeze», «mound, hill», «death». The Lexical Index's letter already parts these for the Open Scriptures BDB.
4. **The H5375 family** (about 650 Hebrew words, all with נשׂא «lift» numbers) shows only the Aramaic record. When there is one record, the card says no language.
5. **Italic runs printed in «» as if they were meanings:** «Special uses:», «see, further», «upon, subject often», «phrases:», «note here». The «**» label (a «remarks» section of the record) and stray stem labels have the same effect.
6. **Written-and-read pairs** show both forms' stem lines on both forms.
7. **UHAL** says «has an entry» on about 97% of its rows, and that cannot be confirmed from the files on hand.

## Paths

- My scripts, in `S/s47w/q2/scripts/`:
  - `q2_stems.py` — the stem reader and whole-page sweep
  - `q2_check_d2.py` — check d, mended
  - `q2_tally.py` — the counts
  - `q2_sweep_unit_uncapped.py` — the first sweep without its cap
  - `q2_pick20.py`, `q2_read20.py`, `q2_show.py` — picking and reading the 20 rows
  - `q2_verse_twice.py` — the recurring-number count
  - `q2_check_c_sdbh.py` — the MACULA `sdbh` attempt (a dead end)
- My outputs, in `S/s47w/q2/out/`:
  - `sample.json` and `check_a.json` to `check_e.json` — re-runs, identical to the first auditor's
  - `check_d2.json`, `tally.log`
  - `stems_all.tsv` and `stems_all.log` — every flagged line, with kind and STEP witness; the fix target list
  - `stems_sample.tsv`
  - `first_sweep_all_rows.tsv` — 7,536 rows
  - `pick20.json`
- The first auditor's scripts and outputs are unchanged in `S/s47w/scripts/` and `S/s47w/out/`.
- `README.md`'s line that every line Q could test «was found in the raw file at the right word» should now except these 14 unabridged lines.
