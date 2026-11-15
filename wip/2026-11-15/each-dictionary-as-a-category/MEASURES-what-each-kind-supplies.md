# What each kind of dictionary supplies to the cards and the lines

15 November 2026. The page lane, «each dictionary as a category», the measuring part. Read only; nothing served was changed. The tree measured is main 857a3dc0fb (the copy in scratchpad/old). No grade below decides anything. Every grade is information for the owner.

Scripts and outputs: `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v69/measure/` (card-lib.mjs, card.mjs: the card rebuilt as the page builds it; families.mjs: where each M id is placed; validate14.mjs, validate-chain.mjs; measure.mjs; lines.mjs; graded.mjs; measure-classes.mjs; overlap.mjs; classify.py; outputs under out/).

An earlier run of this part was stopped partway. It had written and validated the rebuild, the whole-shelf measure at rest, the lines and the graded samples. This run checked those outputs, re-read the scripts that made them, and added the class passes (measure-classes.mjs, overlap.mjs, classify.py) and this write-up. A pass "lifted" (the gates lifted) was stopped at Obadiah and is not used here.

## How

- **The card.** Every word of the 39 books is rebuilt in node, as zone.html builds it at rest. The steps are: the rows under the word's key, less the rows the gates withhold at that word (pointing, entry, stem, name, word senses held back, the openings of a numbered sense printed as a note, the sources switched off at rest), then merged into one pill per printed form. Each step was read off the page's own code (card-lib.mjs and card.mjs name the page function each step copies).
- **Validation, the fourteen live cards.** The cards are in cards-genesis-1-verbs-live-857a3dc0fb.json, read with a browser by the lead. Result: 14 of 14 cards the same. Live 264 pills, rebuilt 264. All 264 texts found, and all 264 with the same carriers (the M ids). All 14 cards have the same order, the same withheld counts and the same pill pressed.
- **Validation, the twelve chain books.** These are the page's own recording of every card in 12 books, read off the page by the build's chain tool, with each file checked by sha256 against this tree. At rest: 14,354 of 14,354 cards are the same pill for pill, in order, with the same sources behind each pill (760,426 pills). Every class of card is covered: own-whole, own-core, span, the ketiv and qere cards, and own-set.
- **Kind, by the best-placed carrier of a pill.** The order is 1 (a Bible dictionary, or the place's own reading), then 2, 3, 4, 5, then 6 (outside the five). 101 M ids appear on a resting card, and all 101 were placed:
  - 14 by the corpus record's BIBLICAL;
  - 22 kind 4 and 50 kind 2 by the corpus record's UNDECLARED, with the family read from the source's key;
  - 2 kind 5 by ARAMAIC;
  - Jastrow's 5 by its overlay's own index (RABBINIC);
  - the place's own reading's 2 piece ids (PIECE:TAHOT, PIECE:MACULA) as kind 1;
  - the span store's 2 sources (the ETCBC BHSA lexeme gloss, the TAHOT expanded-Strong frame) as kind 1, by their titles. They are not in the corpus record. **This is the doubtful placement.**
  - The Samaritan overlay's 4 ids are kind 6, because none of the five kinds names them. They carry 39,647 pills at rest. They are kept apart, not folded into another kind.
- A pill "only a family carries" means every row behind that pill is that family's. "Shared with a Bible dictionary" means a kind-1 carrier stands behind the same pill. For a kind-1 family, it means another kind-1 family does.

## a. Pills at rest, the 39 books

305,431 words (29,395 marks set aside). 305,149 cards have a pill and 282 have none. **16,348,776 pills**, counting a pill once per card.

| kind (best-placed carrier) | pills at rest | share | cards where it is on the card (any carrier) |
|---|---|---|---|
| 1 Bible dictionary or the place | 11,609,447 | 71.0% | 301,132 |
| 2 Wiktionary (English, Hebrew) | 1,630,745 | 10.0% | 260,606 |
| 3 Jastrow | 1,056,436 | 6.5% | 194,099 |
| 4 word lists, knowledge bases, titles | 1,964,419 | 12.0% | 231,289 |
| 5 Aramaic Wiktionary | 48,082 | 0.3% | 48,183 |
| 6 Samaritan overlay | 39,647 | 0.2% | 36,372 |

No Bible dictionary and no place reading stands behind **4,739,329 pills (29.0%)**. These are 95,372 distinct (word, text) pills. The figure is the same in two separate passes.

By family: pills it carries / only it carries / shared with a Bible dictionary / shared only with other non-Bible families / lines it leads.

| kind | family | carries | only it | with a Bible dictionary | with others only | lines led |
|---|---|---|---|---|---|---|
| 1 | MACULA (Cherith definitions) | 3,983,207 | 3,250,297 | 634,088 | 98,822 | 19 |
| 1 | Strong's (3 editions) | 3,810,672 | 2,923,089 | 802,546 | 85,037 | 380 |
| 1 | SDBH and UBS | 1,750,534 | 1,474,555 | 204,463 | 71,516 | 368 |
| 1 | BDB (2 editions) | 1,439,450 | 1,063,278 | 306,174 | 69,998 | 90 |
| 1 | STEP TAHOT | 1,019,945 | 886,959 | 124,482 | 8,504 | 385 |
| 1 | Classical Hebrew Words | 454,773 | 418,703 | 20,569 | 15,501 | 1 |
| 1 | the place's own reading | 452,158 | 22,266 | 421,715 | 8,177 | 299,933 |
| 1 | STEP TBESH | 60,121 | 16,010 | 41,613 | 2,498 | 65 |
| 1 | Open Scriptures lexical index | 3,000 | 1,053 | 1,947 | 0 | 17 |
| 1 | UHAL | 2,600 | 1,877 | 720 | 3 | 0 |
| 1 | Davidson 1855 | 1,722 | 1,525 | 2 | 195 | 0 |
| 1 | ETCBC BHSA | 780 | 384 | 396 | 0 | 5 |
| 2 | English Wiktionary (Kaikki, DBnary) | 1,741,272 | 1,257,974 | 308,651 | 174,647 | 1,127 |
| 2 | Hebrew Wiktionary | 227,353 | 172,307 | 12,280 | 42,766 | 2 |
| 3 | Jastrow | 1,412,724 | 1,023,913 | 299,362 | 89,449 | 0 |
| 4 | PanLex | 1,358,039 | 1,208,166 | 42,422 | 107,451 | 18 |
| 4 | ConceptNet | 450,921 | 72,791 | 149,336 | 228,794 | 10 |
| 4 | OmegaWiki | 182,679 | 159,790 | 5,312 | 17,577 | 0 |
| 4 | Hebrew WordNet | 176,224 | 174,393 | 88 | 1,743 | 3 |
| 4 | Wikidata | 150,769 | 108,169 | 24,301 | 18,299 | 523 |
| 4 | Lexibank (NorthEuraLex) | 142,196 | 13,213 | 66,882 | 62,101 | 6 |
| 4 | MUSE | 107,401 | 64,068 | 20,760 | 22,573 | 0 |
| 4 | Hebrew Wikipedia's titles | 77,054 | 23,794 | 22,550 | 30,710 | 0 |
| 5 | Aramaic Wiktionary | 129,116 | 48,082 | 62,865 | 18,169 | 14 |
| 6 | Samaritan overlay | 40,589 | 39,647 | 595 | 347 | 0 |

Per M id (out/measure-rest.json, byM), the largest non-Bible carriers by pills only they carry are:
- M12 Jastrow: 833,852
- M13 Kaikki Hebrew: 732,225
- M21 PanLex 2024: 715,477
- M42 PanLex 2025: 489,935
- M25 Kaikki strict linked forms: 380,966
- M32 OmegaWiki: 159,790
- M43 Hebrew WordNet: 156,927

Concentration: 12,219 keys carry a non-Bible pill. Five keys carry 17.9% of all non-Bible pills (את, בית, אשר, אל, אמר), ten keys 27.8%, thirty keys 44.6%. For example, את has 27 such pills on each of 11,536 words.

## b. The line at rest

Read from reader/data/resting-lines (the page's own recording; each record's files were checked by sha256 against this tree). Who leads a line is whoever its chip credits. 305,431 words: 305,184 sit under a line and 247 under none. There are 302,959 lines.

| kind | lines led | words under them |
|---|---|---|
| 1 | 301,257 (the place's own reading 299,933) | 301,827 |
| 2 | 1,129 | 2,248 |
| 4 | 559 | 1,081 |
| 5 | 14 | 28 |
| 3, 6 | 0 | 0 |

Classes of line:
- **One word, the place's own reading:** 299,933 lines. All of them are kind 1.
- **A joined run (a span the store names):** 2,177 lines over 4,402 words. Kind 2 leads 1,097, kind 4 leads 521, kind 1 leads 545 and kind 5 leads 14. The non-Bible lines (out/span-lines-non-bible.tsv, 173 run texts) fall into these groups:
  - modern epithets and people-names: «Epithet of the God of Israel: the Lord of Hosts» 218 lines; «the Jewish people» (Wikidata, בני ישראל, 370 lines in two spellings); «the Jewish people; Jewry» 14+4.
  - an encyclopedia's definition: «human, common name of Homo sapiens…» (Wikidata, בן־אדם) 98 lines; «gemstone…»; «an institution where people are cared for».
  - numbers as Modern Hebrew grammar gives them: «twelve», «six hundred (600)», «feminine of שְׁנֵים עָשָׂר», «defective spelling of…». About 60 run texts and several hundred lines.
  - weekdays and modern idiom: «Monday», «Tuesday», «Wednesday», «Thursday» (Genesis 1, one line each); «takeout»; «once upon a time»; «What's the matter?»; «call for participation (in a conference…)»; «Rishon LeZion (a city in central Israel)»; «Mea Shearim»; «coyote»; «pub»; «birthday»; «Amidah» for שמונה עשרה.
  - liturgy and later Jewish usage: «The fifth parashah of the Torah», «Ma Tovu», «the Three Weeks», «ner tamid».
  - function phrases a Bible dictionary also gives: «therefore» 144, «according to» 49, «beside, near», «why».
  - Lexibank's capital labels: «EVERYWHERE», «BEFORE», «GOOD-LOOKING».
  - «A (male) cousin» for בן־דוד.
- **One word the place gives no reading:** 814 lines (kind 1 746, kind 2 30, kind 4 38). Examples are PanLex «Rabshakeh» 16, ConceptNet «walk», Kaikki «to button» and Hebrew Wiktionary «gamification».
- **Written one way, read another:** 35 lines (kind 1 33, kind 2 2).

Also measured: the pill a rebuilt card opens on (card.on), by kind: 1 296,267; 2 4,926; 3 1,259; 4 2,602; 5 42; 6 53. This is not the line. The line at rest is the page's recording above, and the two disagree for kind 3, which leads no line. I did not trace why.

## c. Shutting a kind

| shut | cards it stands on | cards that lose a pill | pills that leave | left with only the place's reading | the kind is all the card has |
|---|---|---|---|---|---|
| 1 without the place (the Bible dictionaries) | 298,995 | 297,371 | 10,642,003 | 27,061 | 1,944 |
| 2 Wiktionary | 260,606 | 256,559 | 1,443,816 | 8 | 2,412 |
| 3 Jastrow | 194,099 | 162,108 | 1,023,913 | 3 | 2 |
| 4 lists, bases, titles | 231,289 | 224,736 | 1,961,194 | 596 | 62 |
| 5 Aramaic Wiktionary | 48,183 | 26,224 | 48,082 | 0 | 42 |
| 6 Samaritan | 36,372 | 35,654 | 39,647 | 0 | 0 |
| 3+4+5+6 | 245,014 | 238,961 | 3,108,584 | 613 | 106 |
| 2+3+4+5+6 | 276,073 | 274,604 | 4,739,329 | 2,066 | 4,017 |

By family (out/measure-rest.json, shutFamily):
- Wikidata alone leaves 590 cards with only the place's reading, and is all 47 cards have.
- English Wiktionary is all 2,410 cards have.
- STEP TAHOT is all 261 cards have.
- BDB is all 198 cards have.

The overlap pass separately counts 9,874 non-Bible pill places that stand on a card with no Bible-dictionary pill at all (English Wiktionary 8,247, Wikidata 1,442).

## d. The graded samples, by family (pills only that family carries)

**Sample 1.** The outside reader, 12 November: 291 pills of 14 Genesis 1 verb cards, as the page served them that day. One reader made the calls. R is right; S is another stem, W another word, B broken, M bundled, U unsure. "Not right" means every call but R.

| family | only it | R | not right (calls) |
|---|---|---|---|
| Strong's | 121 | 46 | 75 (S38 W23 M9 B2 U3) |
| English Wiktionary | 30 | 23 | 7 (W6 S1) |
| SDBH and UBS | 23 | 9 | 14 (S6 B6 U2) |
| Jastrow | 19 | 0 | 19 (W12 S5 U2) |
| PanLex | 14 | 2 | 12 (W12) |
| BDB | 10 | 2 | 8 (B4 W3 S1) |
| STEP TAHOT | 8 | 6 | 2 (W2) |
| MACULA | 8 | 7 | 1 (W1) |
| Classical Hebrew Words | 6 | 2 | 4 |
| ConceptNet | 3 | 1 | 2 (W2) |
| OmegaWiki | 3 | 0 | 3 (W3) |
| Hebrew Wiktionary, TBESH, Wikidata, Aramaic Wiktionary | 1 each | 0 | 1 each |
| MUSE | 1 | 1 | 0 |

By kind, all pills: 1 is 104 of 212 right; 2 is 24 of 32; 3 is 0 of 20; 4 is 4 of 26; 5 is 0 of 1.

**Sample 2.** The stricter re-grade, 14 November: 672 pills of 48 cards of the twelve chain books. Two agent judges graded, and a third settled their 64 disagreements; they agreed on 90.5%. The pills are sampled, not weighted to whole cards. A is right in this verse; B is this word in its stem with another sense; C is its root in another stem or form; D is another word on these letters; E is not a reading.

| family | only it | A | B | C | D | E |
|---|---|---|---|---|---|---|
| Strong's | 216 | 40 | 78 | 48 | 40 | 10 |
| STEP TAHOT | 66 | 48 | 16 | 2 | 0 | 0 |
| MACULA | 60 | 21 | 29 | 4 | 2 | 4 |
| SDBH and UBS | 54 | 8 | 27 | 13 | 3 | 3 |
| English Wiktionary | 47 | 10 | 15 | 3 | 13 | 6 |
| PanLex | 45 | 18 | 10 | 2 | 12 | 3 |
| BDB | 32 | 3 | 10 | 6 | 2 | 11 |
| Classical Hebrew Words | 18 | 2 | 1 | 2 | 13 | 0 |
| Jastrow | 17 | 1 | 3 | 1 | 5 | 7 |
| MUSE | 5 | 1 | 0 | 0 | 3 | 1 |
| Hebrew Wiktionary | 5 | 0 | 1 | 1 | 3 | 0 |
| Wikidata | 5 | 4 | 1 | 0 | 0 | 0 |
| the place's own reading | 5 | 5 | 0 | 0 | 0 | 0 |
| Hebrew WordNet | 4 | 1 | 2 | 1 | 0 | 0 |
| TBESH | 4 | 2 | 2 | 0 | 0 | 0 |
| a source no index names | 3 | 0 | 0 | 0 | 0 | 3 |
| ConceptNet, OmegaWiki, Hebrew Wikipedia's titles, UHAL, Aramaic Wiktionary | 2 each | | | | | |

The two-pill rows: ConceptNet B1 C1; OmegaWiki A2; Hebrew Wikipedia's titles C1 D1; UHAL B2; Aramaic Wiktionary B2.

The samples are small for every family except Strong's, and sample 1 covers only Genesis 1's verbs.

## e. The classes

The test covers every non-Bible pill at rest: 4,739,329 places and 95,372 distinct.

**1. The same word on these letters, but another sense: the biggest class.** The overlap test (overlap.mjs) asks whether the pill shares an English content word with any pill a Bible dictionary or the place carries on the same card. It lowercases, drops a stopword list and strips plain suffixes, so it is crude. It undercounts rewordings (for example, «nope» beside «not»), so the "shares none" count is an upper bound on the senses the card's Bible dictionaries do not name.

| family | pill places | shares a word | shares none | no content word |
|---|---|---|---|---|
| English Wiktionary | 1,241,032 | 29.4% | 65.5% | 62,397 |
| PanLex | 1,205,925 | 26.6% | 68.7% | 56,206 |
| Jastrow | 1,015,170 | 16.8% | 76.8% | 65,462 |
| two or more of these together | 431,193 | 15.1% | 74.9% | 42,914 |
| Hebrew WordNet | 174,393 | 46.7% | 53.3% | |
| Hebrew Wiktionary | 163,731 | 9.6% | 89.2% | |
| OmegaWiki | 159,660 | 46.0% | 53.0% | |
| Wikidata | 107,408 | 39.5% | 56.7% | |
| MUSE | 63,912 | 3.7% | 83.7% | |
| ConceptNet | 55,556 | 12.5% | 74.7% | |
| Aramaic Wiktionary | 45,438 | 25.7% | 59.2% | |
| Samaritan | 39,547 | 16.8% | 45.4% | 14,910 |
| Hebrew Wikipedia's titles | 23,765 | 10.5% | 80.6% | |
| Lexibank | 12,599 | 19.3% | 80.6% | |
| all | 4,739,329 | 1,167,287 (24.6%) | 3,298,178 (69.6%) | 273,864 |

Examples of pills that share no word, with the number of words they stand on:
- the object marker את read as «shovel», «spade», «thou», «sign» (11,536 words)
- אשר read as «to confirm», «to credit», «praise» (Jastrow, Modern ִאִשֵּׁר), «IRIX Interactive Desktop», «Escher», «usher» (5,519 words)
- כי read as «chi, the Greek letter» (4,298 words)
- בית read as «byte», «verse (part of a song)», «military uniform» (2,036 words)
- על read as «Super-» and «yoke» (4,302 words)

**2. Pattern classes (classify.py; each test is a stated regex, so it misses some and hits some wrongly).** Places / distinct:
- A grammatical note, a form of another word («plural of», «feminine of», «defective spelling of»): 168,944 / 1,503. Mostly English Wiktionary (146,692). Examples are את «singular informal form of "you"» and אשר «defective spelling of אישר».
- A modern country, city or region: 52,784 / 701. English Wiktionary 25,906, OmegaWiki 8,710, PanLex 6,986, Hebrew WordNet 5,080, Wikidata 3,896. Examples are «State of Israel», «A country in Southwest Asia…», «Hit, Iraq» and «Hiiu County». The regex also hits biblical Israel, so this is an upper bound for modern places.
- A letter of an alphabet: 36,081 / 71. Jastrow 8,534, English Wiktionary 8,387, Hebrew WordNet 7,301. Examples are כי «the Greek letter Chi» and בית «the 2nd letter of the Hebrew alphabet».
- A person's given name or surname, as the dictionary says: 34,666 / 253. PanLex 19,833, English Wiktionary 12,263. Examples are ישראל «given name», עלי «male given name from Arabic» and שם «first name».
- A modern thing, trade or science: 32,875 / 738. This regex has known false hits («to credit», «verse (part of a song)», «In the company of»), so read it as an upper bound.
- A prefix, suffix, abbreviation or clipped form: 28,819 / 266. Almost all are English Wiktionary (28,723). Examples are אל «-less» and על «Super-».
- A concept list's capital label: 24,325 / 225. Lexibank 12,599, PanLex 6,592. Examples are «YHVH», «HAPPINESS» for אשר and «WTF» for מה.
- A named person or figure, described: 20,734 / 296. These are mostly biblical («king of Judah», «first son of Jacob»), so they are not foreign to the text.
- An encyclopedia article's title (Hebrew Wikipedia's titles, no other pattern): 16,828 / 751. Examples are «Emar», «M», «Psyche (psychology)», «E (musical note)», «Kohen» and «Thoroughfare».
- A later Jewish sense (Talmud, halakha, liturgy, «the Jewish people»): 9,661 / 125.
- A species or genus: 7,267 / 273. Examples are «Homo (genus)» and «a tree of the genus Pistacia».
- A number or a date: 6,531 / 115. Examples are שני «monday» and «Sunday name».
- None of the patterns: 4,314,340 / 90,167. These are plain English glosses; class 1 above is the measure that splits them.

**3. Aramaic and rabbinic senses on Hebrew verses.** The Bible's Aramaic stretches hold 4,839 words (Daniel 2:4–7:28, Ezra 4:8–6:18 and 7:12–26, Jeremiah 10:11, Genesis 31:47).
- Jastrow: 1,001,064 of its 1,015,170 only-it pill places stand on Hebrew verses, and 14,106 in the Aramaic stretches.
- Aramaic Wiktionary: 44,148 on Hebrew verses, 1,290 in the Aramaic stretches.
- Samaritan: 38,697 on Hebrew verses, 850 in the Aramaic stretches.

**4. The «Peru» class: a reading the gates withheld from one row and let stand from another.** This is a reading withheld on its source's own mark in one row, standing at the same card from a source that marks nothing (measure-classes.mjs). Pill places:
- Withheld by the name gate:
  - The same text letter for letter: 5,669. The standing pills come from ConceptNet 3,719, English Wiktionary 2,129, Jastrow 751, MUSE 743, PanLex 572 and Hebrew Wikipedia's titles 421. The withheld rows are from English Wiktionary 3,011 and Aramaic Wiktionary 1,975.
  - The withheld row adds a bracket after the same word (the «Peru (a country in South America)» shape): 9,747. The standing pills come from ConceptNet 9,249, MUSE 6,427 and Hebrew Wikipedia's titles 5,932. The withheld rows are from English Wiktionary 9,608 and Classical Hebrew Words 5,770.
- Withheld by the entry gate: 267,510 exact plus 42,028 with a bracket. Here the withheld row is a Bible dictionary's other entry (Strong's 148,843, SDBH and UBS 89,324, BDB 71,408). The same text then stands from Jastrow, English Wiktionary, ConceptNet and Lexibank.
- Withheld by the pointing gate: 169,164 exact. The withheld rows are mostly Jastrow (109,861), PanLex and Wiktionary.
- Withheld by the stem gate: 2,665 exact plus 6 with a bracket.

## Could not measure

- Kind 3 opens 1,259 rebuilt cards (card.on) but leads no resting line. I did not trace why the two measures differ.
- The pattern classes are regex tests with stated false hits and misses (modern place and modern thing are upper bounds). No hand reading checked them.
- The overlap test is lexical and crude. "Shares none" is an upper bound on "another sense", and it does not separate a homograph (another word) from another sense of the same word.
- The cards with the gates lifted were not measured (that pass was stopped at Obadiah).
- The placement of the span store's two sources (ETCBC BHSA, the TAHOT expanded-Strong frame) as kind 1 rests on their titles, not on the corpus record. The Samaritan overlay is kept apart as kind 6.
- The graded samples are small (291 and 672 pills). Sample 1 covers Genesis 1's verbs only, and sample 2 is not weighted to whole cards.
