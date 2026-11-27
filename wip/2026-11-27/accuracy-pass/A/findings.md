# Helper A: the departures list, the homonyms, and the 124 words

Measured on the frozen tree (`S/base`, main at ea6e1ad08e), 27 November 2026. Nothing was changed anywhere outside this folder.

## How to read the numbers

- **A placing** is one store row of one of the twelve Bible dictionaries, under the letters of one block of one word's card, at one place. A card has a block for the whole form and, where STEP divides the word, a block for each of STEP's pieces. Over the 39 books there are 305,431 word entries, 614,394 blocks and **48,822,198 placings**; 25,814,043 of them are on the block the card opens on (the whole form of an undivided word, the core piece of a divided one).
- Every count below is by machine over every word, unless it says «read by hand» or «sample». «Verified on the page» means I opened the card in a browser on the frozen tree and saw it.
- **The model was checked against the page first.** 186 card openings in all 39 books, 388 blocks read (the block the card opens on, every piece's block, 12 whole-form blocks of divided words): what the card says each gate withheld (entry, name, pointing, unpointed, stem) and the pills it draws, against the model. First pass 387 of 388 agreed; the one that did not (Leviticus 13:59:14) was a branch the model lacked (finding 10). With it mended, **388 of 388 agree**. Pairs (written and read) are not in that comparison.
- Classes, as the briefing gives them: **reconciles** (a real conflict between sources; not a fault), **nothing to decide** (the rule fired where no source contested), **overrides** (a source's own answer is set aside).

## Summary

| # | Finding | Placings or places | On the block the card opens on | Class | Standing |
|---|---|---|---|---|---|
| 1 | The entry gate is never asked on a prefix or suffix block, so every row of those letters stands | 12,271,895 placings on 162,177 blocks | 0 | a rule missing where STEP does answer | verified on the page |
| 2 | Homonyms let through by number alone where STEP parts the number by letter | 6,486,787 (2,814,272 at letters A to F) | 6,380,441 | the gate judged it and let it through | verified on the page |
| 3 | A row filed under several numbers stands where one of them is the place's | 1,684,252 | 1,676,900 | let through | counted |
| 4 | The piece class reads the unabridged BDB's article as a suffix and withholds it on every article block | 136,638 (6 rows on 22,773 blocks) | 0 | overrides | verified on the page |
| 5 | Where STEP's core tag is a piece number («to him»), MACULA's rows can never be «this entry» | 250,350 at 6,053 places | 227,317 | overrides (suspected: needs the lane's crosswalk to split) | verified on the page |
| 6 | The names gate withholds a dictionary's own entry for the very word (gentilics) | 1,138 | 1,110 | nothing to decide | verified on the page |
| 7 | The maqaf pair's options | at rest 0 of 41,171 chains; under «as written» 39,966 of 40,980 with no dictionary behind the pair | | nothing to decide, under the switch only | verified both ways |
| 8 | The line: 124 words led by another of the twelve; at 116 STEP gives its own words | 124 words | | see part 4 | 4 verified |
| 9 | 14 words stand under no line, and their cards hold no pill | 14 words | | not in the plan's figures | 2 verified |
| 10 | A word whose only vowel sign is the qatan mark is graded by the lattice's card, not the rows' own headwords | 2,903 places, 0 rows of the twelve | | a defect beside the twelve | verified on the page |
| 11 | The pointing grade and «unpointed rows: none» barely reach the twelve | 14,514 in all; 787 with nothing to decide | 10,858 | reconciles, 787 nothing to decide | verified |
| 12 | The stems | 193,095; 14 on the place's own reading | 174,747 | reconciles | verified |
| 13 | The span grade | 187 row-places; 80 with nothing to decide | | reconciles, 80 nothing to decide | counted |

The entry gate itself, the largest rule, withheld 10,853,770 placings and is the principle's own line; apart from finding 5 and the 3,535 of TAHOT's own rows named under part 3, I found no false alarm in it.

## Part 1 and 2: every rule, counted two ways

`rules.tsv` has one row per rule (26): where it lives, what it reads from a source, the ruling behind it, and how its two counts are defined. `counts-by-rule-and-dictionary.tsv` has every count by dictionary, for every block and for the block the card opens on. `examples.tsv` gives up to five places from different books for each cell (48 cells, 44 with five). `departures.tsv.gz` has one row for each of the 392,879 placings counted as «nothing to decide» or «overrides».

| Rule | Changed what a reader sees | A real conflict | Nothing to decide, or overrides | Neither |
|---|---|---|---|---|
| Entry gate | 10,853,770 | 10,559,005 (another number 9,954,093, another STEP letter 858,797, less the cells to the right) | 3,535 verified, 250,350 suspected | 28,624 parted by BDB's own entry; 12,256 where STEP gives no tag and MACULA's lemma decides |
| Names gate | 44,301 | 42,883 | 1,138 | 280 at places with no STEP tag |
| Pointing grade (pointed otherwise) | 2,951 | 263 | 337 | 2,351 at places with no STEP tag |
| Unpointed rows: none | 11,563 | 9,765 | 450 | 1,348 at places with no STEP tag |
| Piece class (prefix or suffix) | 2,629,319 | 2,492,344 | 136,975 | |
| Stems | 193,095 | 193,081 | 14 | |
| Span grade | 187 | 107 | 80 | |
| Joined cells at rest | 744 cells | 744 (a row of the twelve files the place) | 0 | 2,101 span places rest as words |
| Maqaf pair's options | at rest 0 | | at rest 0; under «as written» 39,966 | |
| Division the card offers | 394 places | 394 (MACULA's own division, a press away) | 0 | |
| Held places | 0 | | | commentary words only |

Rules that cannot be split this way, with why:

- **The signs switch at rest** (6,666,505 placings, 2,538,637 on the open block; approximate, since the page keeps the pill the line reads): it acts on a source's own mark, never on a conflict. Every placing is «no conflict». It is the owner's standing switch (3 October 2026, «preselect it off for now»).
- **UBS's collocation rows rest shut** (435,402), **sense openings print as notes** (317,889, the unabridged BDB), **the print slot gives no pill** (993,731, TAHOT 983,037): each reads a mark or a declaration of the source's own.
- **The whole form sets aside a divided reading** (806,569, all TAHOT's): the same words stand as the set on STEP's own division. It follows STEP's division; not a departure.
- **The declared weld on a pair's written half** (24,198 rows on 1,071 written halves): the owner's rule for pairs.
- **The joining dagesh, the dagesh lene, the qatan mark, the shureq** live inside the grade. Among the twelve's rows the grade decides 14,514 placings in all, so none of the four can have moved more than that. I did not separate them further (it needs a re-grade under each variant).
- **A pointer never leads; the name leads; oldest first**: orders. They move no row off a card. 80 rows of the twelve are pointers in the lane's map (Strong's form lists 56, UBS 24).

Definitions of the two counts are in `rules.tsv`, column `how_b_and_c_are_defined`. In short: for the entry gate, a conflict is a row its own source files under another number or STEP letter than STEP's tag; for the names gate, nothing to decide is a row whose one entry is STEP's entry, with no other number and no letter left to part; for the pointing and unpointed rules, nothing to decide is a key under which every numbered row is of the place's entry; for the piece class, a conflict is a headword whose own vowels say the other kind.

## Findings, ranked by how many places they touch

### 1. The entry gate is not asked on a prefix or suffix block

- **What the page shows.** Genesis 1:1:5 (the heavens), block ה: the pills open «whether | direct | indirect | ob | seeing | this | those | who …» and hold «interrogative particle» (the Lexical Index), UBS's «marker denoting that the truth value of the following statement is under investigation», «Hē» (BDB's letter name) and «towards» (TAHOT's directional he). Amos 2:4:21 (their lies), block הם: «abundance», «abundance, i.e. wealth» (Strong's H1991), «wealth», «of their moaning», «wailing» (BDB). Genesis 1:26:5 (in our image), block נו: the first pills are «habitation | comely | dwelling (place) | fold | pleasant place | sheepcote | stable | tarried | cause | sake», before «us».
- **Count.** 162,177 prefix and suffix blocks. 12,271,895 placings stand there with no gate asked (12,034,457 rows of an ordinary entry, 237,437 rows with no entry). A further 5,293,021 standing placings carry STEP's own piece numbers and are not compared either. None of this is on the block the card opens on; it is one press away.
- **Sample with STEP's own piece tags** (Obadiah, Ruth and Jonah, where I read the corpus lane's lattice v12): of the standing rows that carry a STEP piece number, 3,790 of 37,491 on prefix blocks (10%) and 1,599 of 2,001 on suffix blocks (80%) carry another piece's number than the place's (the interrogative and the directional he on an article block; the object «you» on a possessive «your» block).
- **Cause.** `zone.html:3532-3537` (`coreTagsAt`) gives a tag to the core piece's block alone, because the zone carries STEP's tag for the core piece only. The lattice carries a tag on every piece: 1,248 of 1,248 non-core pieces in the three books.
- **Class.** No rule of ours fired; the source's answer exists and is not used.
- **Mend, by rule.** Carry STEP's tag on every piece of the zone and ask the entry gate on every block. Rows that carry STEP's piece numbers (TAHOT's and the unabridged BDB's) are then judged at once. MACULA numbers the same pieces otherwise (finding 5), so its rows need the corpus lane's crosswalk before they are asked.

### 2. Homonyms let through by number alone

- **What the page shows.** Genesis 1:1:2 (he created, STEP H1254A): the card stands «be fat» (BDB) and «make (fat)» (Strong's), readings of STEP's H1254B. Obadiah 1:1:13 (among the nations, H1471A): «Tid‛al king of Goim» (BDB) stands; seven other rows of the same kind are withheld only because their source marks them a name.
- **By machine.** «excitement» (BDB) stands at 667 places of «city» (H5892B); «true», «veritable», «honest» (BDB) at 734 places of «thus» (H3651C).
- **Count.** 6,486,787 placings where the place carries a STEP letter, STEP gives that number two letters or more, and the row carries the number and no letter. 2,814,272 of them are at letters A to F, where STEP parts separate words; 3,672,515 at G and after, where the letters mostly part senses and namesakes of one word (my reading of STEP's lettering from its rows, not from its documentation). At 89,951 placings the row is BDB's and BDB itself files two or more of its own entries under that number at that key, so at least one of them is not STEP's.
- **By dictionary** (letters A to F): MACULA 1,251,580, Strong's 1,136,188, BDB unabridged 147,038, BDB 107,945, SDBH 76,544, UBS 69,248, BiblicalTools 25,684.
- **Cause.** `tools/entry-gate-v1.mjs:134-136`, `zone.html:3384-3386`: a row with the place's number and no letter is «this entry». The parting by BDB's own entry is asked only of a row with no number (`:130-133`).
- **Class.** The gate judged the row and let it through.
- **Mend, by rule.** Where the place is lettered and the key's BDB rows under the place's number name two or more BDB entries, part them by BDB's own entry, as the gate already does for rows with no number. That needs the corpus lane to say which BDB entry each STEP letter is (TBESH says of itself it is based on BDB). For a dictionary whose one entry spans what STEP parts (Strong's H1254, SDBH's and UBS's ברא), nothing in the source parts it; those stay.

### 3. Rows filed under several numbers

1,684,252 placings stand because one of the row's numbers is the place's (UBS 383,280, SDBH 273,678, MACULA 262,160, BDB 247,233, Strong's 231,714, BDB unabridged 222,932). Most are a Hebrew word and its Aramaic twin under one entry (SDBH's «to judge», H8199 and H8200). The names gate catches 28,780 of this kind that are names (UBS's «man; son of Micah» under the numbers of «king»). Counted, not read by hand beyond the examples.

### 4. The piece class withholds the unabridged BDB's article

- **What the page shows.** Genesis 1:1:5, block ה: «7 of 116 pointed otherwise, withheld»; no pill from the unabridged BDB reads «the». The only «the» is the place's own piece.
- **Count.** 6 rows («the», «substantives», «adjectives, participles», «demonstrative pronouns», «is defined by it likewise», «verb») on 22,773 article blocks: 136,638 placings. With them gone, the block's own-kind rows that lead are BDB's interrogative he.
- **Cause.** `zone.html:3441-3448`: for he, a dagesh is tested first and read as the suffix's mappiq. The unabridged BDB writes the article's headword with a patah and a dagesh (the doubling it causes).
- **Class.** Overrides: the row is the article's own entry, on the article's block.
- **Mend, by rule.** Read a he's dot as a mappiq only where the he carries no prefix's vowel (patah, hataf patah, segol, hataf segol). Expected among the twelve: those 136,638 come back and nothing else moves (no other headword of the twelve under ה has both).
- A further 337 placings: MACULA's «he» withheld on a suffix block whose own gloss is «he».

### 5. MACULA at the places whose core is a pronoun

- **What the page shows.** Exodus 1:10:3 (to him; STEP's core tag H9033): the card opens on block ו with «112 of another entry than H9033, withheld» and five pills (he, him, it, Wāw, them), none from MACULA's rows; the line above still says «here MACULA reads with them». The whole-form block holds no pill at all. Esther 1:12:15 the same.
- **Count.** 6,053 places (לו 1,115, לך 869, לי 748, להם 644, לכם 470, בו 363 …). 250,350 MACULA placings withheld on the whole form and the core block; MACULA stands 0 times there. 1,139 of those on the whole form are MACULA rows headed by the verse's own pointed form.
- **Cause.** MACULA numbers the pieces by its own scheme; the rows carry it as plain numbers (the vav 2050, the lamed 3807, the bet 871, the he 1886), never STEP's H9033. The gate reads the number.
- **Class.** Suspected overrides: the two sources agree on the word and number its pieces differently. I cannot split MACULA's conjunction rows from its suffix rows under ו by number (both are 2050), so the count is an upper bound.
- **Mend, by rule.** A crosswalk of piece numbers from the corpus lane; until then, at a place whose core tag is a piece number, do not ask the entry gate of a row whose numbers are all another scheme's.
- **For the corpus lane, suspected:** those plain numbers collide with real Strong's numbers (H2050, H3807, H871). I saw no card harmed by it, since the keys differ.

### 6. The names gate at gentilics

- **What the page shows.** Amos 2:9:4 (the Amorite, H0567): «4 given as a name by their source, withheld»: BDB's «Amorites» and «mountain-dwellers», and two rows of the unabridged BDB. Strong's and MACULA's «Amorite» stand.
- **Count.** 1,138 placings on 284 distinct rows and keys: the row's one entry is STEP's entry and it is withheld. The largest: אמרי 348, then «Hebrew», «Temanite», «Tishbite», «Gileadite», «Gershonite», «Shunammite», TAHOT's own «[the] River» (13) and TBESH's «Red (Sea)» (24).
- **Not all 1,138 are faults.** Read by hand, the top 45 rows (772 placings): 148 placings, about a fifth, are the gate rightly catching a name filed under a common word's number (UBS's «Gashmu» under the number of «rain», 30; UBS's towns under «pomegranate», 45; «Karnaim» under «horn», 30).
- **Cause.** The place is listed a name only where TAHOT's grammar is a proper noun's or MACULA's type is proper; a gentilic is neither. The row's source marks its entry a name.
- **Mend, by rule.** Where the row's one entry is the place's entry, the entry gate has already answered; let the row stand. The mis-numbered names it would let back (Gashmu) are the corpus lane's to renumber.
- **For the corpus lane, suspected:** BiblicalTools' «(over) against» (34 places) and «aloud» are marked names.

### 7. The maqaf pair's options (the owner's example)

- **At rest: gone.** Genesis 1:2:6 and 1:2:7 (עַל־פְּנֵי), seen on the page: each word opens its own card, no division row, no chain band. By the code's rule (`zone.html:14981`, the stroke joins nothing while the switch rests at «as separate words», and all 39 books are listed for the switch) the same holds at every chain: 0 of 41,171 are offered as a pair at rest, except the 271 the span store names with a row of the twelve.
- **Under the maqaf switch «as written»: still there.** The same word's card carries a band «Chain · complete divisions · 2» with the pair as written. Pressed, it says «No dictionary on this shelf gives the run as written, maqaf and all. The words one by one are a press away.» (Genesis 1:2:6; Obadiah 1:1:3.)
- **Count.** 41,171 chains (39,743 pairs, 1,400 threes, 28 fours; 191 hold a written-and-read pair). Of 40,980 keyed chains, the joined key is filed by a dictionary of the twelve in the store at 0; the span store names 1,014 (302 with a row of the twelve open at rest); **39,966 are filed by no dictionary at all**. `maqaf-chains.tsv` lists every chain.
- **Cause.** `zone.html:9695` (`coversOfRun` returns the as-written rung whatever the shelf answers) and `:11665-11686` (the chain band).
- **Mend, by rule.** The owner's rule after: offer the pair as one unit only where a source files that very pair. Under «as written», draw the rung only where the span store or the store holds a row under the joined key.

### 8. The 124 words (part 4)

`line-not-step.tsv` lists all 124 with place, key, line, credit, the zone's pieces, STEP's tag, STEP's own picks at the place (from the corpus lane's default picks), call 4's line for the place, and a cause column.

| Cause, as a machine sees it | Words |
|---|---|
| Call 4 lists STEP's words, written with « \| » (one word of ours, two of STEP's); the house holds the line as it rests | 36 |
| MACULA's pieces lead where STEP spells the word otherwise; STEP's own words differ | 30 |
| STEP has its own words (the index lists them to fill a bare line) and another dictionary's row leads | 18 |
| The line reads STEP's own words, credited to another | 15 |
| A pair; its line keeps today's; STEP's own words differ | 14 |
| STEP gives no translation here, only a dictionary pick | 7 |
| STEP has its own words and another dictionary's row leads (not in the index) | 3 |
| STEP gives nothing here | 1 |

So **STEP gives its own words at 116 of the 124**; at 8 another of the twelve rightly leads. Credits: MACULA's pieces 53, Strong's 57, TBESH 6, SDBH 4, MACULA's rows 2, the Lexical Index 2 (as the plan says).

Verified on the page: II Samuel 7:22:5 אֱלֹהִים reads **«judges»** (Strong's; the place carries no tag, STEP's text lacks the word) and 7:22:4 יְהֹוָה reads «God» while the card says «here STEP reads Yahweh»; Zephaniah 2:9:27 reads «nation» where STEP reads «nation/ my».

The rule behind the 21 (18 + 3): `zone.html:4149-4156`, «STEP's own words never replace a line another dictionary gives», held on the owner's question 3 of 14 November.

### 9. Fourteen words under no line

The resting lines' own counts: 305,431 words, 305,417 under a line, **14 under none**. The plan's «305,417 words; none bare» takes the second figure for the first. The 14 are in `words-under-no-line.json`: 7 pairs, and 7 words STEP reads as two (I Samuel 14:49:6; Job 18:15:3; Psalms 44:15:6, 57:10:5, 102:4:6, 108:4:5, 149:7:5). Verified on the page: Job 18:15:3 and Jeremiah 48:5:3 have a blank line and a card with no pill; Job's card says «here STEP reads because/ not · 2 «[belonging] to/ him»».

### 10. The qatan mark and the grade

At the 2,903 places whose only vowel sign is the qatan mark (כׇּל־), `isPointed` (`zone.html:3323`) says the word is not pointed, so the gate takes the lattice card's stored grade instead of the rows' own headwords (`:8953-8963`). Leviticus 13:59:14: the card says «10 of 182 not pointed by their source, held back»; graded by their own headwords, Hebrew Wiktionary's «each» (headed כָּל־) would match. No row of the twelve moves (they are of the place's entry and stand whatever their points). It moves rows of the sources that rest shut, and the count line. Mend: read U+05C7 as a qamats in `isPointed`, as the grade's own v3 says is done «before anything else».

### 11. The pointing grade and unpointed rows

All but 1,016 of the 373,777 store rows of the twelve carry a number, and a row of the place's entry stands whatever its points. So these two rules reach 14,514 placings of the twelve in all. Nothing to decide at 787: the unabridged BDB's four numberless rows under מקום withheld at 84 places as pointed otherwise (337), and Davidson's rows held back as unpointed (378 of the 450; Davidson's 85 served rows carry no pointed headword and no number). Mend for Davidson: the corpus lane's, to give his rows their entries.

### 12. The stems

193,095 withheld; verified on the page (Genesis 1:1:2: «25 of another stem than qal»). 193,076 are rows of the place's own entry, so by the entry alone nothing needed deciding; the conflict is on the stem, between the row's source and STEP's morphology. 14 placings withhold MACULA's row whose reading is the place's own («he filled» at Deuteronomy 1:36:17: the row's stem is filed qal, the place's piel).

### 13. The span grade

Of the twelve's rows at the span store's 2,845 places: 4,063 stand, 107 are held as pointed otherwise where STEP tags the words as separate entries («Lodebar» at Deuteronomy 32:47), 80 are held for having no pointing (the unabridged BDB's «except, but» at אם־לא), where no source contests the pair.

## Part 3: homonyms, by cause

A standing row whose own entry is not shown to be the one STEP's tag names. Full table by dictionary in `counts-by-rule-and-dictionary.tsv` (rule `homonym`); every row with its places in `homonyms.tsv.gz` (2,929,374 lines, one per block signature and row; the places of each signature are in `cells.tsv.gz`, joined on `sig_id`; one line per placing would be about 20 million).

| Cause | Every block | The block the card opens on |
|---|---|---|
| Gate not asked: a prefix or suffix block, the row of an ordinary entry | 12,034,457 | 0 |
| Gate not asked: a prefix or suffix block, the row carries no entry | 237,437 | 0 |
| Gate not asked: the place carries no tag | 66,772 | 1,813 |
| Gate not asked: a word of two cores | 1,210 | 434 |
| Judged by MACULA's lemma (STEP gives no tag) | 15,270 | 15,008 |
| Judged and let through: number alone, the place's letter A to F | 2,814,272 | 2,774,350 |
| Judged and let through: number alone, the place's letter G and after | 3,672,515 | 3,606,091 |
| Judged and let through: one of the row's several numbers | 1,684,252 | 1,676,900 |
| Judged and let through: a TAHOT row of several numbers, its letter agrees | 73,952 | 73,567 |
| The row carries no entry, so no gate could judge it | 2,216 | 2,196 |
| The row names BDB's entry only and the gate could not part it | 15,696 | 15,392 |

Not counted as homonyms: 1,532,808 placings where the letter agrees, 4,991,818 where the number agrees and the place carries no letter, 97,911 where STEP gives the number one letter only.

By dictionary, every block, all causes: MACULA 13,243,252; Strong's 3,405,565; BDB 1,858,916; BDB unabridged 692,771; UBS 687,891; SDBH 491,143; TAHOT 176,263; BiblicalTools 31,436; the Lexical Index 25,382; TBESH 3,326; Davidson 2,102; UHAL 3. MACULA's figure is mostly its own prefix and suffix rows on prefix and suffix blocks (10,435,970), unjudged rather than shown wrong.

Rows with no entry: Davidson 856, the unabridged BDB 1,352, UBS 8. Rows with BDB's entry only: BDB's letter names («Wāw» on the suffix block of «to him», 1,548 places; «Yôdh» 907; «Hē» 490) and roots («possess, own exclusively» at «king», 1,284).

**The gate's false alarms.** Rows withheld although their entry is STEP's:

- 3,535 placings: a TAHOT row whose printed reading is the place's own reading, withheld because its letter or number is another place's («[the] House of», lettered K, G, J, at places lettered M, B, Q; «Yahweh», H3068, at the 304 places tagged H3069). Nothing is lost on the card: the place's own pill reads the same.
- 250,350 placings, suspected: finding 5.
- 0 withheld on a number written otherwise (a leading nought, a letter).
- 559,801 placings where the withheld row's own headword is pointed exactly as the verse's word (`entry-false-alarms.tsv.gz`). I read the top 60 groups by hand: all are true homographs (Hebrew «upon» and its Aramaic twin, «Most High», the object marker and «with», «year» and «he repeated»). No pattern of one word under two numbers.

## What I checked and found clean

- The model against the page: 388 of 388 blocks on 186 card openings, all 39 books.
- The zone against the corpus lane's lattice v12, in Obadiah, Ruth and Jonah: division, roles, core tag and English (brackets aside) agree at 2,251 of 2,253 words; the 2 are places the spelling bridge laid.
- The division the card offers against the place's own pieces: at 144,445 divided words the card's division is the place's (118,800 by the ledger's row, 25,645 by the place's own pieces; the pieces are STEP's at all but 46 places, where they are MACULA's); 0 places where the place's division cannot be offered; 0 divisions no source makes.
- STEP's tag against MACULA's lemma: agree at 276,478 places, disagree at 5,929, of which all but about 60 are the pronoun cores of finding 5.
- Held places: 0 on the books' own words.
- Every store row carries the headword slot: 0 without, so no row of the store falls to the lattice's grade except through finding 10.
- The resting lines' totals: 304,494 TAHOT's pieces + 799 TAHOT's rows + 124 = 305,417; 6 lines over two words (12 of the 124).
- Joined cells at rest: every one of the 744 has a row of the twelve behind it.

## What I could not check, and why

- **TAHOT as received.** I did not find STEP's own file under `v2/sources/` in the store listing. STEP's division and tags here are the zone's, checked against the lane's lattice in three books only (the lattice for all 39 is about 150 MB).
- **Prefix and suffix blocks against STEP's piece tags**, beyond those three books, for the same reason.
- **Which homonyms let through are wrong.** That needs a crosswalk from STEP's letters to BDB's entries. The counts in finding 2 are exposure, not a count of wrong pills; five places were read.
- **Pairs** (1,062 places): modeled roughly (the read half as a word, the written half as the declared weld) and not compared on the page.
- **The signs count** is approximate: the page keeps the pill the line reads, which the model does not know.
- **Rows beside the store** (the place's own pieces, the span store's pills, Jastrow, the Samaritan works) are not in the tallies; the comparison on the page did count them.
- **The four readings inside the grade** (the joining dagesh and the rest): not separated.
- **Orders** (a pointer never leads, the name leads, the default picks' order): not counted by placing.
- **The 799 words where STEP's own words are the line**: their card opens on the whole form; the tallies «on the block the card opens on» take the core block there.

## Files

In `S/w39/out/A/`:

- `rules.tsv` — the 26 rules.
- `departures.tsv.gz` — 392,879 placings, one per row.
- `homonyms.tsv.gz`, `cells.tsv.gz` — the homonyms by signature and row, and each signature's places.
- `line-not-step.tsv` — the 124 words. `words-under-no-line.json` — the 14.
- `counts-by-rule-and-dictionary.tsv`, `examples.tsv`, `walk-summary.json`.
- `entry-false-alarms.tsv.gz`, `entry-inferred-and-by-lemma.tsv.gz`, `piece-class-rows.json`, `step-vs-macula-lemma.json`, `maqaf-chains.tsv`, `span-grade-held-silent.tsv`.
- `probe/` — what the page said on every card opened (`*.out.json`).
- Scripts: `model.mjs` (the gates, in the page's order), `walk.mjs`, `probe.mjs`, `probe-chain.mjs`, `compare.mjs`, `line-not-step.mjs`, `maqaf.mjs`, `span-grade.mjs`, `piece-number-cores.mjs`, `piece-tags-sample.mjs`, `lattice-check.py`, `finish.py`, `make-rules.py`.

Housekeeping: no git state was changed and nothing was written outside the work folder; no process or server of mine is left running; the one download (three small lattice files, under 1 MB) was deleted after use; the folder holds 54 MB.
