# Pass C2: Strong's 1890 (two editions' rows) and Brown-Driver-Briggs (two editions), each as it serves itself

Helper C2, 27 November 2026. Frozen tree: main at ea6e1ad08e, route store version 2882324f8ff3. Nothing was changed anywhere outside the work folder. Every data file named here stands in `w39/out/C2/`.

The four sources, confirmed in `data/route-store/index.json` (`m_sources`), one M-id each:

| M-id | key | rows served | readings they print |
|---|---|---|---|
| M9 | `openscriptures_strongs` | 23,726 | 36,157 |
| M14 | `wikisource_strongs_explicit_forms` | 148,404 | 148,531 |
| M5 | `openscriptures_bdb_1906` | 15,455 | 15,732 |
| M46 | `unabridged_bdb_1906` | 8,935 (6,927 pills, 2,008 notes) | 11,735 |

## Summary

**The answer to the question.** Every reading we print from these four says words the source's file says. By machine, of 196,520 rows: 196,386 are exactly a field of their source through the declared steps; 41 are a run of the source's text (2 of Strong's are a cut one closing bracket wider than the file's tag; 39 of the unabridged BDB are a run my reading of the step does not name as a field); 30 rows of the Wikisource edition could be held only to the corpus lane's landing line; 63 note rows of the unabridged BDB (no pill) I could not place. No row is respelled. The trouble is not in the bytes. It is in **which bytes were made into readings**, **which marks are honored**, and **where a reading is shown**.

| # | Finding | Sources | Size | Class | Seen on the page |
|---|---|---|---|---|---|
| 1 | A source filed by entry is found by letters only; STEP's tag names its entry and the entry's rows do not come | M9, M5, M46 | 116,980 / 114,216 / 111,091 words | a binding the source gives, used only to withhold | Amos 7:12 word 6 |
| 2 | Strong's × and + renderings are not offered at rest | M14, M9 | 15,688 readings at 972,262 pill places; 752 at 146,803 | overrides the source's own answer (ruled by the owner, 3 October) | 28 cards |
| 3 | The Open Scriptures file lost Strong's +; those renderings print plain | M9 | 352 readings at 158,412 pill places; 32 more with an emptied bracket at 11,541 | the source's own bytes; the two editions conflict (reconcile); the trace has no declared rule | Genesis 49:24 word 12 |
| 4 | Strong's condensed forms print condensed | M14, M9 | 11,064 readings at 370,029 pill places; 1,154 at 169,516 | no rule of ours; the reader has to work | 28 cards |
| 5 | The store's fold: a reading stands under one source's name only | M46, M5, M9 | 4,388 of 12,891 glosses; 2,745 of 18,742 definitions; 2,876 of 14,141 glosses | a rule of ours that overrides each source's own filing (known, held for the rebuild) | Genesis 14:1 word 4 |
| 6 | The unabridged BDB's italics are all taken for readings: grammar words, Latin and German, verse wordings, BDB's remarks | M46 | verse wordings at 27,276 pill places away from their verse; grammar words at 10,840; not English at 742 | a rule of ours (the catalog's field rule) that overrides what the mark means | 32 cards |
| 7 | The Open Scriptures BDB's tag breaks words and takes in related words' meanings | M5 | one letter: 2,450 pill places; root rows on words spelled the same: up to 12,008 word places; fragments such as «a» for hand at 1,372 | the source's own tagging, and our rule that every tag is a reading | 30 cards |
| 8 | Cuts of the Wikisource rows that are not renderings: Strong's note on the last rendering, fragments with a stray bracket, pieces of his sentence, the list dash | M14 | 8,397 + 4,367 + 5,773 + 7,224 pill places | cut wrongly (the catalog's comma cut) | 31 cards |
| 9 | The signs switch counts any square bracket as a source sign | M9 (22 readings), M46 (1) | 12,264 pill places | fired with nothing to decide (a pattern written for STEP) | Exodus 6:23 word 7; Genesis 1:1 word 4 |
| 10 | The last rendering carries Strong's pointer by bare number | M9 | 253 readings at 13,572 pill places | declared (the ledger leaves it); the reader has to work | 8 cards |
| 11 | A credit line names one source and another's year | all four give, others carry | 2,010 rows | a rule of ours (the fold's year) | Ezekiel 26:17 word 6 |
| 12 | The declarations: one says Strong's key was not found while its sister quotes it; × is declared as «not a plain rendering»; the capital X has no shape; 650 note rows hold marks no shape names | M9, M14, M46 | 69 of 181 shapes «unverified:» | a declared rule that contradicts the source's own explanation; marks with no declared rule | by file |

Sizes in «pill places» are pairs of a word of the 39 books and a reading standing on its card as the card opens, by a walk of all 305,431 non-mark entries (the plan counts 305,417 words) through the page's own gate functions; see «How the places were counted».

---

## The findings, ranked by the places they touch

### 1. A source filed by entry is found by its letters only (M9, M5, M46)

**What the source gives.** Strong, PLAN OF THE BOOK, item 1: «All the original words are treated in their alphabetical Hebrew order, and are numbered regularly from the first to the last, each being known throughout by its appropriate number. This renders reference easy without recourse to the Hebrew characters.» His own binding of a word to its entry is the number. The Open Scriptures BDB reaches the same numbers through its Lexical Index, and the unabridged BDB carries them in its second column («This file contains Strong's number mapping»). STEP's tag gives that number at 304,198 of the 305,431 words.

**What we do.** A row is found by the letters of the place (the word's, or its core piece's) and the number is asked only afterward, to withhold (`tools/entry-gate-v1.mjs`; `zone.html` lines 8886 to 8896; `tools/gloss-store-v1.mjs` rule 1, «Key exactly»). These three sources file a row under the letters of the dictionary form. So at an inflected word the entry STEP names is the source's own, and its rows do not come.

**Count** (`entry-reach.json`): of the words STEP tags with an entry the source serves pill rows for,

| source | entries with pill rows | words tagged with one | the card's key is a key the entry is filed under | it is not |
|---|---|---|---|---|
| M9 Strong's (Open Scriptures) | 8,371 | 295,948 | 178,968 | **116,980** |
| M5 BDB (Open Scriptures) | 5,890 | 258,693 | 144,477 | **114,216** |
| M46 BDB unabridged | 4,475 | 253,534 | 142,443 | **111,091** |
| M14 Strong's (Wikisource forms) | 5,835 | 273,199 | 266,963 | 6,236 |

The Wikisource edition is the control: it is keyed by the forms themselves and misses 2 percent.

**Seen on the page.** Amos 7:12 word 6 לֵךְ (STEP H1980G): 41 pills; Strong's (Open Scriptures) 0, BDB (Open Scriptures) 0, BDB unabridged 0, Wikisource forms 33. All three hold entry H1980 under הלך.

**Class.** Not an override and not a reconciliation: a binding the source gives that we hold (fact `n` on every row) and use only to withhold. The principle says a row shows only where its entry is the one STEP names; the «only» is kept, the «where» is not.

**Mend, by rule.** At a place STEP tags with entry N, each source filed by entry is asked for its rows of N under whatever letters it files them, beside the rows under the place's letters; a row found so is «this entry» by construction. The word already carries its headword's key (`h`), and the page has a look-up switch that rests on «form» (`zone.html` 3749 to 3757). It adds pills at about 115,000 words per source, so it is the owner's to rule.

### 2. Strong's × and + renderings are not offered at rest (M14, M9)

**What the source says.** SIGNS EMPLOYED: «+ (addition) denotes a rendering in the A. V. of one or more Heb. words in connection with the one under consideration.» «× (multiplication) denotes a rendering in the A. V. that results from an idiom peculiar to the Heb.» Both are renderings; PLAN item 6 lists them among «all the different renderings of the word in the Authorized English Version».

**What the page shows.** A reading that opens with X, × or + and a space is sorted after every plain one and, while the signs switch rests off, is not offered as a pill; the card says «N readings carrying a source's own sign switched off» (`zone.html` 3644, 3684, 12858; the switch rests off by the owner's word of 3 October 2026, «preselect it off for now», line 3671).

**Count** (`class-places.json`): Wikisource forms 15,688 readings (10.6 percent of its readings) at 972,262 pill places; Open Scriptures 752 readings at 146,803.

**Seen on the page.** 28 cards: not offered at rest, offered and exact with the signs printed. Genesis 4:6 word 6 חָרָה «X earnestly»; Ecclesiastes 1:2 word 3 אָמַר «× expressly», where 36 readings are switched off.

**Two uneven edges, both seen.** The same sign held alone in a bracket is offered at rest: Exodus 7:4 word 11 «(+) battle», Esther 1:3 word 9 «(+) army» (83 rows). And the edition's capital X is a letter, so «X patrimony» is what prints.

**Class.** Overrides the source's own answer, by a ruling the owner made. It belongs on the departures list with its count; it is not mine to call a fault of the code.

**Mend, by rule.** Put to the owner whether Strong's signed renderings rest shown, last in order, as rule 7 already sorts them; and whichever way, treat «+ word» and «(+) word» alike.

### 3. The Open Scriptures file lost Strong's + (M9)

**The source's bytes.** `HebrewStrong.xml`, entry H68, usage: «␣␣carbuncle,␣␣␣mason,␣␣␣plummet, (chalk-, hail-, head-, sling-) stone(-ny), (divers) weight(-s).» The Wikisource edition of the same entry: «+ carbuncle, + mason, + plummet, …». The file writes 39 plus signs in all its usage fields; in the 5,806 entries both editions hold, Wikisource writes 539 and Open Scriptures 39 (the × signs agree, 884 and 884). The file has 487 places where a rendering opens after two or more blanks and 47 brackets that open on a blank (`plus-lost-openscriptures_strongs.tsv`).

**What we print.** The catalog made every run of blanks one blank, so the trace is gone and the rendering prints plain: 352 readings at 158,412 pill places. 32 readings keep an emptied bracket: «( ) army», «flock ( -s)», «nine ( -teen, -teenth, -th)», at 11,541.

**Seen on the page.** Genesis 49:24 word 12 אֶבֶן: at rest the pills «carbuncle» and «mason» stand, by Strong's (Open Scriptures), as plain renderings of «stone»; with the signs printed, «carbuncle» and «+ carbuncle» stand as two pills. Exodus 2:16 word 11 צֹאן: «lamb ( -s)», «flock ( -s)».

**Class.** The provider's own bytes, served as they are: no rule of ours overrides. But two editions of one work now disagree under the same letters, which is the overlap the principle asks to show and rule; and the run of blanks is a mark with no declared rule.

**Mend, by rule.** Declare the shape in the ledger (a rendering that opens after two or more blanks in the file's usage field stands where the file lost a sign). Where the Wikisource row of the same entry and rendering carries the sign, the two are one rendering: one pill, both carriers, drawn as the edition that kept the sign draws it. The owner rules which edition leads.

### 4. Strong's condensed forms print condensed (M14, M9)

**What the source says.** SIGNS EMPLOYED: «( ) (parenthesis), in the renderings from the A. V., denotes a word or syllable sometimes given in connection with the principal word to which it is annexed.» PLAN item 6: the renderings are «conveniently condensed according to the explanations given below». So «(fore-) father(-less)» is three renderings: father, forefather, fatherless.

**What we print.** The bracket as written. Readings with a bracketed word end or word start: Wikisource 11,064 at 370,029 pill places, Open Scriptures 1,154 at 169,516. Readings with any round group: 36,266 at 901,395 and 6,214 at 480,046. 180 Wikisource readings are a bracket alone, cut from its word: «(deal, make)» at Proverbs 27:1 word 2, «(+ well)» at 619 places.

**Seen.** Jeremiah 6:15 word 6 בּוֹשׁ: «(be, make, bring to, cause, put to, with, a-) shamed(-d)». Exodus 11:5 word 3: «firstborn(-ling)».

**Class.** No fault of a rule: the bytes are the source's and the Wikisource ledger names every bracket shape from the print's key. By the week's standard it is a place a reader stops and works.

**Mend, by rule.** A print step under the ledger's own bracket shapes (word end, word start, choices) that writes the expansion out beside the condensed form, on the record under the pill. The source text stays as it is. The owner's to rule.

### 5. The fold: a reading stands under one source's name only (M46, M5, M9)

**What the store does.** Where two sources say the same words under a key, one row stands, under one name (`index.json`, `source_years`: «until the store keeps one row per key, text and source (road A's rebuild)»; `data/source-years-v1/HELD.json`). I measured it for these four (`fold-check.json`, `fold-check-m46.json`), each reading field of the source's file under the letters of its entry:

| source and field | fields | under its own name | inside a longer row of its own | only under another source that rests open | only under one that rests shut | not served |
|---|---|---|---|---|---|---|
| BDB unabridged, main gloss and point highlights | 12,891 | 6,893 | 1,108 | **4,366** (3,390 under M5, 837 under M17) | 22 | 394 |
| BDB (Open Scriptures), def elements | 18,742 | 15,801 | 16 | **2,726** (2,472 under M17, the SDBH) | 19 | 38 |
| Strong's (Open Scriptures), tagged glosses | 14,141 | 8,397 | 2,529 | **2,733** (1,153 under M5, 926 under M17) | 143 | 38 |
| Strong's (Open Scriptures), meaning fields | 8,435 | 7,512 | 146 | 433 | 40 | 34 |
| Strong's (Open Scriptures), usage fields | 8,673 | 8,353 | 0 | 12 | 2 | 36 |

(108 to 301 fields per line have no row at all under the key: headwords of two words.)

**What it costs each source.** Its name (the card does not say BDB reads «king»), its year (BDB's words of 1906 stand dated 2023 where the SDBH carries them), and its entry (the row is gated by the carrier's entry numbers, not its own). 19 to 143 readings per source stand only under a source that rests shut, so at rest the card does not offer them under any name unless another row prints the same.

**Seen on the page.** Genesis 14:1 word 4 מֶלֶךְ: 14 pills; «king» is carried by M9, M14, M17 and M4; neither BDB carries a pill on the card of «king», though both files give «king» as the entry's first gloss.

**Class.** A rule of ours that overrides each source's own answer. It is known to both lanes and held for the rebuild; I add only the measure.

**Also to note.** 2,805 of the Wikisource edition's 8,640 entries with a form list have no row under its name (5,835 do). The fold is the likely cause (an entry of one plain rendering, as «lion»); suspected, not verified, see «could not check».

### 6. The unabridged BDB's italics are all taken for readings (M46)

**The source's mark.** The provider's README: «highlight { font-style: italic; }». In BDB italics set English renderings, and also the wording of a cited phrase, grammar terms (this provider wrote BDB's abbreviations out as words: Perfect, Imperfect, preposition), Latin and German, a contrasted word, and titles. The catalog's rule (`data/made-spaces/made-spaces-v2/RULE.md`): a route is «the inside of a `<highlight>` that stands in a numbered point before the point's first `<ref`».

**Counts** (`class-places.json`, `bdb-verse-binding-stats.json`):

- Grammar words alone as a pill: 20 rows at 10,840 pill places. «preposition» and «conjunction» stand on עַד at 1,282 places each.
- Not English: 16 rows at 742.
- The wording of a verse: 457 pill rows are a highlight set directly before their point's first reference; they stand at 68,119 pill places, 250 of them the verse cited. Of those with four words or more, 127 rows stand at 27,276 places away from their verse and 66 at it (`bdb-verse-wording-elsewhere-M46.tsv`).
- Fragments by the same road (`function-word-pills-M46.tsv`; that file also holds true glosses of particles): «the» on אֱלֹהִים at 1,178 places, «me» on נֶפֶשׁ at 703, «not» on דָּבָר at 452.

**Seen on the page** (32 cards in the cards file; among them):

| place | pill | what the record says |
|---|---|---|
| Deuteronomy 1:2 word 8 עַד | «preposition» | «…), preposition as far as, even to, up to, until, while» |
| Daniel 1:8 word 6 לֹא | «verb» | a grammar word |
| Genesis 30:33 word 5 מָחָר | «substantive» | «a. as substantive Exod 16:23» |
| Daniel 8:20 word 7 מָדַי | «et» | «proper name, of a people et terr.» |
| Ezra 10:2 word 18 יֵשׁ | «es gibt» | «German es gibt, is similar in use» |
| Amos 9:1 word 9 כַּפְתּוֹר | «sphaerula» | the Vulgate's word |
| Nahum 3:17 word 9 קָרָה | «yet Voigt Bu, attractively» | BDB's remark on two scholars |
| Proverbs 28:15 word 2 נֹהֵם | «roar» | «growl, of a lion (… opposed to שׁאג, of roar with which it springs upon it)»: the pill says what BDB sets against the word |
| Ecclesiastes 1:13 word 17 אֱלֹהִים | «Yahweh is God in truth» | BDB cites it at Jeremiah 10:10 |
| Jeremiah 5:28 word 7 דִּין | «between plea and plea» | BDB cites it at Deuteronomy 17:8 |
| Exodus 18:4 word 3 אֱלִיעֶזֶר | «prophet in time of Jehoshaphat» | another man of the name, 2 Chronicles 20:37 |
| 1 Chronicles 26:16 word 9 מִשְׁמָר | «goal» | the provider's «goal» for gaol |
| 2 Samuel 9:4 word 4 אֵיפֹה | «quails ?)» | the provider's «quails» for Latin qualis |
| Amos 2:10 word 5 מִצְרָיִם | «Mªƒªr(u), Muƒru, Miƒir» | Assyrian forms, characters mis-decoded |

**Class.** A rule of ours (the catalog's field rule) that takes the source's mark for more than the source means by it: it overrides. The mis-decoded and mistyped words are the provider's bytes.

**Mend, by rule.** (a) A highlight whose whole text is one of the provider's written-out grammar words, or an outline letter, is no route. (b) A highlight inside the provider's transliteration tag, or that the record itself introduces as Latin, German or French, is no route. (c) A highlight set directly before a reference, after a Hebrew phrase, is the wording of that verse: a reading at that verse, an example on the card elsewhere. (d) The corpus lane's repair of mis-decoded characters is asked to cover the ones still in served rows («ƒ», «‚», «‡», «ª»).

### 7. The Open Scriptures BDB's tag breaks words and takes in related words' meanings (M5)

**The source's mark.** The documentation: «The `<def>` element contains a definition, as distinguished in BDB either by bold face or by italics. Normally, each in a series of definitions will have a separate `<def>` element.» The tag follows the type, so it stops at a bracket and at a word in plain type, and it stands as well on a related word's meaning in the entry's opening bracket. Every `<def>` is one row, exact (15,455 of 15,455).

**Seen on the page** (30 cards; among them):

| place | pill | the file |
|---|---|---|
| Genesis 12:11 word 11 נָא | «we» | `<def>I</def> (<def>we</def>) <def>pray</def>, <def>now</def>`; the unabridged BDB prints «I (we) pray» whole |
| Exodus 13:3 word 16 יָד | «a» | a one-letter tag |
| Exodus 6:4 word 10 כְּנָעַן | «s» | `<def>merchant</def>(<def>s</def>)` |
| Daniel 8:14 word 4 עֶרֶב | «set» | `(sun)<def>set</def>`; the unabridged BDB prints «(sun)set» |
| Proverbs 16:24 word 1 צוּף | «comb» | `(honey-)<def>comb</def>` |
| 1 Kings 6:18 word 6 פְּקָעִים | «knob-», «gourd-» | «either ball-, knob-shaped or gourd-shaped» |
| Deuteronomy 1:35 word 5 הָאֵלֶּה (these) | «fear» | root אלה: «hence אֱלהַּ `<def>fear & object of fear</def>`» |
| Amos 6:2 word 14 הָאֵלֶּה | «object of fear» | the same root row |
| 2 Samuel 19:8 word 19 וְרָעָה (evil) | «purpose», «aim at», «regard» | a root's bracket: «[Ba … derive foll. from I. רעה = observe, attend to, specif, tend sheep, also aim at, purpose]» |
| Nehemiah 2:19 word 7 וְגֶשֶׁם (Geshem) | «be bulky, massive» | root גשׁם: «cf. Arabic be bulky, massive» |
| Jeremiah 8:13 word 12 נָבֵל (withers, H5034B) | «if thou hast been foolish» | the other נבל, same Strong's number |
| Daniel 8:5 word 18 קֶרֶן | «rays at his side(s) he had» | the wording of Habakkuk 3:4 |

**Counts.** One letter: 31 rows at 2,450 pill places. Half a word: 19 rows at 82. Written against letters of the entry: 18 rows at 213 («set» at 123). Fragments (`function-word-pills-M5.tsv`, which also holds true glosses of particles): «a» on יָד at 1,372 places, «I» and «we» on נָא at 404 each, «have», «has», «had» on אֵין at 686 each. Rows in an entry's opening bracket: 1,771; of those that carry a number, 596 are a name's meaning (24,642 pill places, rightly: «he laugheth» for Isaac) and 336 are not (4,152: «tilled» on אֲדָמָה at 138, «hidden» and «dark» on צָפוֹן at 99). Root rows in the opening bracket carry no number (501 rows): under a word's own letters the pointing gate holds nearly all back (13 of 10,922 pairs pass); under a core piece's letters 192 of them stand, at up to 12,008 word places by the walk, and on the page at 5 of the 5 places I tried (`m5-root-rows-at-piece-keys.tsv`; «possess, own exclusively» and «counsellor» under מלך at 1,297 places were not tried on the page). The source's own references follow 1,454 rows; they stand at 920 pill places that are the verse cited and 2,705 that are not.

**Cause.** The provider's tagging, served as it is; our rule that every tag is a reading; and for the root rows, the entry gate's parting for BDB's own entries, which acts only where a numbered BDB row is left under the key, which the fold often removes.

**Class.** The source's own answer, where nothing of ours overrides; and a rule of ours firing where the source says otherwise (the documentation calls a def a definition as BDB's type distinguishes it, and marks a root entry as a root).

**Mend, by rule.** (a) A def written against a letter or a bracket of the entry's running text prints with the word it is part of, read from the entry's own bytes. (b) A def of one letter is no row. (c) A def in the opening bracket of an entry the file marks `type="root"` is a related word's meaning: a note of the root, not a pill. (d) A def that a `<ref>` follows, after a Hebrew phrase, is that verse's wording, as in finding 6.

### 8. Cuts of the Wikisource rows that are not renderings (M14)

The catalog cut each definition at every comma outside a round bracket, before any ledger. Where the edition's text does not hold the print's shape, the pieces are wrong (`m14-route-position.tsv`, `class-places.json`):

| kind | readings | pill places | seen on the page |
|---|---|---|---|
| Strong's note on the entry rides on the last rendering | 106 | 8,397 | Genesis 13:13 word 3 «wrong. (Incl. feminine raaah; as adjective or noun.)»; by the walk, «who(-m, -soever, -se). As it is indeclinable, …» on אֲשֶׁר at 5,501 places |
| The edition's dash for the list sign printed on the rendering | 328 | 7,224 | Daniel 2:23 word 10 «(Aramaic) corresponding to יָהַב; -deliver» |
| A row before or across the list opener, or in a definition with none (most are pieces of Strong's own sentence; a few of the last kind are plain renderings) | 344 | 5,773 | Ezekiel 26:11 word 13 «a primitive root; to descend (literally, to go downwards; …); causatively» (41 form keys of ירד); Isaiah 34:10 word 12 «or (objectively) confidence; but usually (adverbially)» |
| A fragment with a stray closing bracket | 91 | 4,367 | Genesis 3:1 word 2 הָיָה: «accomplished», «committed», «like)», each at 3,555 places; Strong: be(-come, accomplished, committed, like) |
| Two renderings glued | 45 | 893 | Exodus 34:3 word 3 «grow (over) increase» |
| A rendering Strong binds to one verse, shown at others | 53 | 140 | Daniel 11:2 word 12 «make (1 Kings 22:48 marg)»; Isaiah 28:27 word 4 «at grass (Jer. 50:11, by mistake for דֶּשֶׁא)» |

(The second and third lines overlap where a row crosses the opener.)

PLAN item 6 names the sign: the renderings come «after the punctuation-mark :—». The edition writes it as a colon almost everywhere (5,992 colons in 5,806 definitions) and as a dash, a semicolon or nothing at a few dozen entries; there the cut ran through item 4's «tracing of the etymology, radical meaning, and applied signification».

**Class.** Cut wrongly: a rule of ours (the catalog's cut) acting where the source's mark asked for something else. The ledger sees most of it and leaves it («not done here»; branches B01 to B03 rule 127 rows).

**Mend, by rule.** In the ledger, under the print's key the lane already holds: the list opens at the edition's sign for :— whatever it wrote there; nothing before it is a route; a note after the list's stop is the entry's note, printed as a note; a text whose brackets do not balance is held whole, as the Open Scriptures ledger already holds it.

### 9. Any square bracket counts as a source sign (M9, M46)

`SOURCE_SIGN` (`zone.html` 3684) holds STEP's pattern for a square-bracket group and asks it of every source. Strong's bracket means something else («[ ] (bracket), in the rendering from the A.V., denotes the inclusion of an additional word in the Heb.»), and BDB's something else again («indicates that the form, etc., enclosed, is not actually found»).

**Count.** 22 readings of Strong's (Open Scriptures) at 12,264 pill places, 10,576 of them אֵת; one row of the unabridged BDB.

**Seen.** Exodus 6:23 word 7 אֲחוֹת: Strong's whole meaning, «a sister (used very widely [like 251], literally and figuratively)», is not offered at rest. Genesis 1:1 word 4 אֵת: Strong's «[as such unrepresented in English]» is not offered from the Open Scriptures row and is offered from the Wikisource row, which writes round brackets.

**Class.** Fired with nothing to decide. **Mend:** each sign pattern is asked only of the source whose sign it is.

### 10. The last rendering carries Strong's pointer (M9)

The file writes «See», «See also» or «Compare» with a number 273 times, the number tagged as a link (`<w src="H5555">`). The ledger keeps the pointer in the last piece. 253 readings at 13,572 pill places print it: Genesis 14:3 word 5 «valley (often used as a part of proper names). See also 1025»; Genesis 29:34 word 20 «Levi. See also 3879, 3881». The pill does not join the plain «Levi» of another source, and the number leads nowhere. The Wikisource rows drop what follows the list's stop (527 routes), so the two editions differ. **Mend:** a print step under the ledger: the pointer after the list's stop prints apart, as the file's own link.

### 11. A credit line with another source's year

Where the fold wrote «the year of an older witness of the same words» on a row, the card prints that year after the carrier's name. Seen: Ezekiel 26:17 word 6 אֵיךְ, pill «how?», record line «Semantic Dictionary of Biblical Hebrew via HiperBiblia · wording 1890». 2,010 rows of other sources carry 1890 or 1906 so (ConceptNet 1,172, BiblicalTools 190, MACULA 184, TBESH 122, TAHOT 115, the SDBH 65). It goes with the fold.

### 12. The declarations against the sources' own keys

- **Strong's (Open Scriptures).** `ledgers-v1/openscriptures_strongs/declaration.json`, `read_from`: «The source's own key to its signs: none found»; branch B02: «the lane could not check the source's own account of the two signs». 69 of its 181 shapes begin «unverified:». The same lane's Wikisource declaration quotes that key (SIGNS EMPLOYED, the file `M14-strongs-scan-first12pages.txt`) and writes 76 shapes from it. One work, two statuses.
- **The meaning of ×.** The five × shapes say the sign flags a word «used only inside a phrase made with this Hebrew word (an idiom), not as a plain rendering of it». Strong: «denotes a rendering in the A. V. that results from an idiom peculiar to the Heb.» A declared rule that contradicts the source's own explanation.
- **The capital X** (Wikisource) has no shape; the ledger says so («a letter is no mark under the ask (11,874 routes hold it standing alone)»). The page's own pattern handles it. A mark with no declared rule.
- **The unabridged BDB.** 650 rows hold marks no shape names (the classifier stops on them): all are notes whose Hebrew was given back by relay v187 after the ledger was declared; no pill. The shapes for «|» and «√» begin «unverified:» though BDB's own list states both («|| parallel, of words…», «√ root or stem»).
- **The Open Scriptures BDB.** 38 of 39 shapes begin «unverified:», rightly: its documentation names no sign of punctuation.

### 13. What a reader also meets (small)

- A piece cut at a semicolon keeps its label: 1,494 readings of Strong's at 82,192 pill places open with also, hence, or, by implication («also antique», «hence, to drip»). The cut honors Strong's mark; the piece leans.
- Stray closing marks: «the heart (as the most interior organ);» (Exodus 14:5 word 8), «together,» (Ecclesiastes 2:14 word 11): 10 readings at 1,035 places.
- Three tagged glosses of the file took in a closing bracket: «suspension of labor)» (Deuteronomy 15:1 word 5), «third-story cell)».
- Strong says of one entry that it belongs elsewhere: 1 Samuel 1:8 word 12 יֵרַע, pill «be grevious (only Isaiah 15:4; the rest belong to 7489)».
- The edition's own «&»: «& presume», «lay & to (take a) pledge» (8 readings).

---

## Per source

### Strong's 1890, the Open Scriptures rows (M9)

**1. Its bytes.** `HebrewStrong.xml` of Open Scriptures `HebrewLexicon`, commit 21c9add13bc727d3a951361778e97e3ff7afd1ce, sha256 a628f4f8…bdd0c4, the hash this tree's receipts name. XML, 8,674 `<entry id="H…">`; each has `<w>` (pointed headword, `pos`, `pron`, `xlit`, `xml:lang`), `<source>` (the derivation), `<meaning>` (with 14,154 `<def>` glosses) and `<usage>` (the Authorized Version's renderings). Of itself (readme.md): «HebrewStrong.xml contains the content for Strong's Hebrew Dictionary. Numerous corrections have been made»; «released under the Creative Commons Attribution 4.0 International license. The actual text of … Strong's Hebrew dictionary remain in the public domain. For attribution purposes, credit the Open Scriptures Hebrew Bible Project.» Updated 8/27/2019. The work: «A Concise Dictionary of the Words in the Hebrew Bible; with their renderings in the Authorized English Version», «Copyright, 1890».

**2. Rows against the source.** 23,726 rows: 8,271 a whole usage field, 7,491 a whole meaning field, 7,962 one tagged gloss. With the declared steps (tags out, the made spaces closed, the provider's note at H269 printed apart): printed text exact 23,724; 2 rows are a run of the meaning one bracket wider than a tag (גשם H1655, ערוגה H6170, where the file's tag reads `<def>hard rain)</def>`). Source entry not found: 0. Every reading is a run of its row. `rows-differ-openscriptures_strongs.tsv.gz` (7 lines; 5 are a definition slot shared by two entries, no difference in what prints).

**3. Marks.** `marks-openscriptures_strongs.tsv`. Every mark of every served row is named by a declared shape (the classifier stops on none). Cuts: 10,759 commas, 1,669 semicolons and 3 full stops, each on a shape that divides by the declaration or by the owner's answers of 7 November. Findings 2, 3, 4, 9, 10, 12.

**4. Binding.** The source gives: the number, the pointed headword, a part of speech, a language, and in 23 readings a verse. We use the number (to withhold) and the headword's points. Held and not used: the number to find the row (finding 1), the part of speech, the verse inside a reading (23 readings at 1,132 pill places).

**5. On the page.** 105 cards in 31 books (`cards-openscriptures_strongs.tsv`): 44 say what the source says; 13 the same in condensed form; 7 the same, leaning on the sense before; 12 not offered at rest for the sign and exact when printed; 5 not offered for a square bracket; 13 carry the file's defects (a lost sign's blank, a pointer by number, or both); 8 a stray mark or unbalanced bracket of the file's own; 1 cut wrongly; 1 another entry by Strong's own word; 1 not on the card as it opens. Credit read on 103 cards: «Strong's Hebrew Dictionary via Open Scriptures · wording 1890 · CC BY 4.0 · License terms». It agrees with the readme and with the print's «Copyright, 1890».

### Strong's 1890, the Wikisource form lists (M14)

**1. Its bytes.** The Hebrew Wikisource edition «מילון הקונקורדנציה של סטרונג», 9 wikitext files fetched 12 July 2026. On hand: the dictionary store's `records/M14.jsonl`, 5,806 records, each the wikitext of one entry: `==N==`, the bold headword and pronunciation, the definition inside `{{ltr|1=…}}`, then the entry's forms and its verses («אב, אבות, … - [[בראשית ב, כד]] ; …»). Links to other entries read as the Hebrew headword. No italic quotes anywhere. License by the site: CC BY-SA 4.0.

**2. Rows against the source.** 148,404 rows. The definition slot equals the catalog's step on the record at 148,374; the route is a comma piece of it at 110,161, the part of a piece after the list opener at 16,556, a piece without its closing stop or up to its first stop at 20,380, another run at 1,277 (definitions whose brackets do not balance); every route is a run of its definition. 30 rows come from entries with no record on hand; each equals its landing line (relay v188). `rows-differ-wikisource_strongs_explicit_forms.tsv.gz` (those 1,277 and 30).

**3. Marks.** `marks-wikisource_strongs_explicit_forms.tsv`. Every mark is named by a shape; 76 shapes are written from the print's key. Cuts by the ledger: 127 (the owner's answers of 6 November). Findings 2, 4, 8, 12.

**4. Binding.** The source gives the form, the entry number, and 240,109 verse references in the records on hand. We use the form (the key) and the number. The verses are held and not used. Measured (`m14-verse-binding-stats.json`, under the word's own letters): of 167,255 word places with a row of this source, at 142,452 a row stands whose entry lists the verse; the entry gate withholds a row whose entry lists the verse at 5,932 places, and at 1,601 of them no listed row stands. So the source's own list and STEP's tag disagree at about 1 percent: a real conflict of two sources, which STEP leads by the owner's rule. Not a fault; a sample of 4,000 such pairs is in `m14-verse-binding-withheld-listed.tsv`.

**5. On the page.** 102 cards in 30 books (`cards-wikisource_strongs_explicit_forms.tsv`): 24 say what the source says, 15 the same in condensed form, 5 with the sign in a bracket, 16 not offered at rest for the sign, 31 cut wrongly (finding 8), 5 bound by Strong to another verse, 6 the edition's own slips. Credit: «Strong's Hebrew concordance with explicit source form lists via Hebrew Wikisource · wording 1890 · CC BY-SA 4.0». The label is this project's; the work calls itself a dictionary, not a concordance.

### Brown-Driver-Briggs, the Open Scriptures edition (M5)

**1. Its bytes.** `BrownDriverBriggs.xml`, same commit, sha256 2b52658a…c38f8 (the receipts' hash). 11,845 `<entry id="a.ab.ac">` in 46 parts; 21,343 `<def>`, 8,989 `<sense>` (6,427 numbered), 3,149 `<stem>`, 3,952 `<ref r="Job.8.12">`, `<pos>`, `<asp>`; an entry can be `type="root"`, `form="false"`, `mod="II"`; every entry ends in a `<status>` (base, ref, done, new, added, made). Of itself: «BrownDriverBriggs.xml contains the current BDB content. It remains a work in progress.» CC BY 4.0, the text public domain. BDB's first edition is 1906.

**2. Rows against the source.** 15,455 of 15,455 rows are the whole text of one `<def>` of an entry the row's own fact names. Nothing differs; `rows-differ-openscriptures_bdb_1906.tsv.gz` holds its header only.

**3. Marks.** `marks-openscriptures_bdb_1906.tsv`. 14,322 rows hold no mark at all. 273 commas cut (branch B01), 83 held whole (B02), 6 rows print by the keeping-signs and leave-off branches; seen right on the page («have a just cause»; «security»). The marks that matter here are the file's tags: finding 7.

**4. Binding.** The source gives: its own entry id, a root mark, a Roman numeral, a part of speech, numbered senses, the stem, the aspect, and a verse reference. We use the entry id and the Strong's number (to withhold), the stem, and the name mark. Held and not used: the number to find the row (finding 1), the root mark as a kind, the sense numbers, the references (finding 7).

**5. On the page.** 97 cards in 28 books (`cards-openscriptures_bdb_1906.tsv`): 54 say what the source says; 3 the tag's part of a bracketed word, harmlessly; 8 unreadable (a letter, half a word); 3 changed the sense; 8 a fragment; 8 another word or entry; 3 another verse's wording; 10 not on the card as it opens (rows under a prefix's letters; the card opens on the core piece). Credit: «Brown-Driver-Briggs Hebrew Lexicon via Open Scriptures · wording 1906 · CC BY 4.0». Right; the card does not say the edition is partial.

### Brown-Driver-Briggs, unabridged (M46)

**1. Its bytes.** `unabridged-BDB-Hebrew-lexicon.csv` out of `…csv.zip`, eliranwong/unabridged-BDB-Hebrew-lexicon at commit 6e8326c6884f8ef1399c7a365d660da9bb9e2d01, sha256 5e865974…92ccc (the receipts' hash). Tab separated, 10,022 records: BDB id, Strong's number or numbers (9,176 have one or more), and one HTML text. Tags: `highlightword` 7,830, `highlight` 49,601, `ref` 165,681 (book, chapter and verse as attributes), `bdbheb` 132,243, `lookup` 43,628, `div class="point"` 9,194; each record says BIBLICAL HEBREW (9,263) or BIBLICAL ARAMAIC (759). Of itself: «License: Public domain document; formatting developed for use in https://marvel.bible by Eliran Wong»; source «provided by Tim Morton»; references «parsed by Stephen Ku and his associates»; «Known issues: pending corrections of cross-references».

**2. Rows against the source.** 6,927 pill rows: 4,315 a whole main gloss, 2,573 a whole highlight of a point, 4 an opening: exact through the declared step with the made spaces closed. 35 are a run of the record's text that my reading of the step does not name as a field. 45 rows are found only in a record their own facts do not name. 2,008 note rows (sense openings, no pill): 1,501 a field of the record, 440 equal to the words-back list of relay v187, 4 a run, 63 I could not place. `rows-differ-unabridged_bdb_1906.tsv.gz` (147 lines).

**3. Marks.** `marks-unabridged_bdb_1906.tsv`. 4,803 commas, 20 semicolons and 3 colons cut, each on a branch the owner answered on 6 November; 9 rows print by the keeping-signs branch, seen right («lo!», «behold!»; «observe !» as the file spaces it). Findings 6, 12.

**4. Binding.** The source gives: BDB's id, Strong's number, the language, numbered points, stems in bold, and a verse for nearly every statement. We use the number (to withhold), the stem, the name mark, and the point (for a note's label). Held and not used: the number to find the row (finding 1), the language, the references (finding 6).

**5. On the page.** 92 cards in 30 books (`cards-unabridged_bdb_1906.tsv`): 59 say what the source says; 8 not a reading (grammar words, labels, BDB's remark); 14 unreadable (a letter, not English, mis-decoded); 3 another place; 2 changed the sense; 4 a fragment; 1 a stray mark; 1 not on the card. Credit: «Unabridged Brown-Driver-Briggs Hebrew Lexicon structured source · wording 1906 · Public Domain». It agrees with the README; the provider it names, Eliran Wong, is not on the card. On 19 of these cards the first record shown is another source's (BDB Open Scriptures 14), since the pill is shared.

---

## What I checked and found clean

- **Bytes.** The three files I fetched hash to what this tree's receipts name (`made-spaces` receipts): HebrewStrong.xml, BrownDriverBriggs.xml, the unabridged csv and its zip.
- **Rows against sources, all 196,520, by machine:** exact 196,386; a run of the source's text 41; held to a landing line 30; not placed 63 (notes, no pill); differing in what prints 0.
- **Made spaces.** After the closes, 23,724 Strong's rows, 15,455 BDB rows and 8,393 unabridged rows print exactly the source's text with nothing where a tag stood. No made space is left printing and no source space is closed.
- **The provider's note** (H269, «number 250, corrected to 251») prints apart from Strong's words.
- **Readings.** All 212,155 readings are runs of their rows; none is respelled.
- **Declared marks.** In M9, M14 and M5 every mark of every served row falls under a declared shape (187,585 rows, the classifier stops on none), and every cut stands on a shape that divides by the declaration or by an answer of the owner's.
- **The print branches** of both BDB ledgers print as declared (15 rows).
- **Sense openings.** All 2,008 give no pill; the cards print them as notes («BDB unabr. opens its numbered senses with: …»).
- **Strong's × counts** agree between the two editions (884 and 884 in the shared entries).
- **Years and licenses on the cards** agree with what each source says of itself (1890, 1906; CC BY 4.0, CC BY-SA 4.0, Public Domain).
- **The Wikisource verse lists** agree with the entry gate at 99 percent of word places.

## What I could not check, and why

- **The Wikisource edition's pages as fetched.** The 9 wikitext files are not on the store under a name the listing shows, and the site is not reachable from here. I read the dictionary store's records (5,806 entries, the wikitext of each). The 30 landed rows and the 2,805 entries with a form list and no row are therefore unread.
- **Strong's print by image.** The front matter is quoted from the corpus lane's text layer of the scan (`M14-strongs-scan-first12pages.txt`), which is OCR; I corrected its plain misreadings in the quotes («X» for ×, «t ]» for [ ], «treated to» for «treated in»).
- **BDB's own account of bold and italic type.** I found the list of signs and abbreviations in the scan's text, and no statement of what the two types mean; that rests on the Open Scriptures documentation and on reading entries.
- **Places for the fold.** I counted the readings folded, not the words they would stand on.
- **The pointing gate under a piece's letters.** The zone holds no pointed letters for a piece, so the walk does not ask it there. It can touch only rows with no entry number (871 of BDB Open Scriptures, 52 of the unabridged). The page offered such rows at 5 of 5 places tried, so the figure in finding 7 is an upper bound, not a count.
- **63 note rows** of the unabridged BDB that I could not place in a record. They print no pill.

## How the places were counted

`scripts/walk-counts.mjs` walks every non-mark entry of the 39 zones and asks, for each row of these four sources under the card's own key (the word's letters where the word is one piece, 160,376 words; its core piece's letters where it is several, 145,055), what the page asks: the entry gate, the names gate, the stem gate, and the pointing gate where the key is the word's own. It imports the tree's own functions and writes only in the work folder. A row standing at a word is one «pill place». By source, a row stands at: M14 267,460 words, M9 179,197, M5 149,720, M46 142,430 (`walk2-stats.json`). The browser read 396 chosen cards from the frozen tree at rest, 38 of them again with the signs printed, and 8 more to confirm single findings. Where the walk and the page disagreed I followed the page: the first walk counted rows under a whole word's letters where the card opens on the core piece (Ezra 5:1 word 13), and the second walk was written to the page's way.

## Data files

Named by the brief: `rows-differ-<key>.tsv.gz`, `marks-<key>.tsv`, `cards-<key>.tsv`, for the four keys.

Behind the findings: `entry-reach.json` (1); `class-places.json` (2, 3, 4, 6, 7, 8, 9, 10, 13); `plus-lost-openscriptures_strongs.tsv` (3); `fold-check.json`, `fold-check-m46.json` (5); `bdb-verse-binding-stats.json`, `bdb-verse-wording-elsewhere-M46.tsv`, `bdb-verse-wording-elsewhere-M5.tsv`, `function-word-pills-M46.tsv`, `function-word-pills-M5.tsv` (6, 7); `m5-row-context.tsv`, `m5-opening-bracket-standing.tsv`, `m5-root-rows-at-piece-keys.tsv` (7); `m14-route-position.tsv` (8); `m14-verse-binding-stats.json`, `m14-verse-binding-withheld-listed.tsv`, `m14-verse-binding-stands-unlisted.tsv`; `marks-served-<key>.json`, `marks-source.json`, `reading-shape-stats.json`, `reading-examples-<key>.json`; `row-place-counts.tsv` (every row, the words it stands at), `walk-stats.json`, `walk2-stats.json`; `cards-to-read.json`, `cards-read-rest.json`, `cards-read-signs.json`, `cards-confirm-rest.json`, `cards-confirm-signs.json`, `cards-review.json`, `cards-judgments.json`; the row dumps `rows-M9.jsonl.gz`, `rows-M14.jsonl.gz`, `rows-M5.jsonl.gz`, `rows-M46.jsonl.gz` (the scripts read them unzipped); the scripts in `scripts/`. Sources kept: `dl-os/` (Open Scriptures files), `dl-ubdb/` (the unabridged zip and README), `x-dict/` (the Wikisource records), `x-front/` (the front matter texts).
