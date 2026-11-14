# v51 tally: two judges, a third on disagreements, 672 card pills

14 November 2026. Scratch tally for the page lane. Inputs: `batches/b1..b4.json` (48 words, 16 per pack, 672 sampled pills of 1,267 on the cards), the eight judge returns (relayed in the task), `adjudications.tsv` (the third judge, 64 pills), `dsplit.tsv` (the D pills split for the fresh-reader comparison). Per-pill finals: `finals.jsonl`. Numbers: `stats.json`. Scripts: `parse.py`, `build_finals.py`, `stats.py`, `write_tally.py`.

Scale: A right here; B this word, another sense; C same root or entry, another stem or form; D another word (homograph, modern word, proper name, or no word at all); E not a reading.

Intervals: 95% percentile intervals from a cluster bootstrap that resamples whole words (48 clusters; 10,000 draws overall, 4,000 per pack, 3,000 per source). Pills on one card are not independent, so these are wider than per-pill intervals; Wilson per-pill intervals are given beside the unweighted overall line for comparison only. The bootstrap ignores the 16/16/16 stratification by pack, so it is slightly conservative.

## 1. Completeness

Every pill of every batch was judged by both judges: 4 batches × 168 = 672 pills, 0 missing, 0 extra, for each judge. The b4 first judge's list matches its own `judges/b4-first/out.json` exactly.

Self-reported tallies in four of the eight returns do not match their own itemized lists (the itemized lists were used throughout):

| return | says | itemized list gives |
|---|---|---|
| b1 first | A 78, B 55, C 20, D 8, E 12 (sums to 173) | A 63, B 60, C 25, D 8, E 12 |
| b1 second | A 69, B 53, C 23, D 8, E 15 | A 61, B 56, C 24, D 8, E 19 |
| b2 first | about A 51, B 66, C 15, D 30, E 6 | A 40, B 73, C 19, D 30, E 6 |
| b3 second | A 58, B 63, C 17, D 19, E 11 | A 49, B 65, C 16, D 24, E 14 |
| b3 first, b4 first | match | match |

## 2. Agreement

- Same level: **608 of 672 = 90.5%** (word-cluster 95% interval 85.9–94.4%).
- Cohen's kappa (unweighted, 5 levels): **0.871** (95% 0.808–0.923); chance agreement 26.0%. Linear-weighted kappa (levels as ordered): 0.897.
- By batch: b1 150/168 (κ 0.850); b2 149/168 (κ 0.845); b3 149/168 (κ 0.843); b4 160/168 (κ 0.936).
- Agreement on each cut: A vs rest 642/672 (95.5%); A+B vs rest 643/672 (95.7%); A+B+C vs rest 654/672 (97.3%); A–D vs E 656/672 (97.6%).

Confusion (rows: first judge, columns: second judge):

| first \ second | A | B | C | D | E | total |
|---|---|---|---|---|---|---|
| **A** | 202 | 9 | 1 | 0 | 3 | 215 |
| **B** | 16 | 203 | 11 | 3 | 5 | 238 |
| **C** | 1 | 4 | 74 | 0 | 4 | 83 |
| **D** | 0 | 1 | 2 | 93 | 3 | 99 |
| **E** | 0 | 0 | 0 | 1 | 36 | 37 |
| total | 219 | 217 | 88 | 97 | 51 | 672 |

The 64 disagreements are concentrated: ve-038 (Micah 2:4, the niphal of hayah) holds 14, na-049 (YHWH, Hosea 3:5) 7, ve-107 and ve-078 6 each. By pair of levels: A/B 25, B/C 15, a fragment call (E against A, B, C or D) 16, B/D 4, C/D 2, A/C 2. The A/B pills turn on whether a sense of the same niphal, adjective or name is the sense here (14 of the 25 on ve-038, na-049, na-011, no-093); the B/C pills on whether a Strong's/KJV list item belongs to this stem; the E pills on whether a KJV fragment («assuredly», «how much», «call») carries a meaning alone.

## 3. The third judge's calls on the 64 disagreements

Rules kept: the scale as given; the lower level where truly unsure; and the same call on the same pill text across the two YHWH cards (na-049, na-011) and on the same sense where the judges agreed elsewhere on the card (e.g. 'consider', 'mark' B on ve-078; '(cause to let, make) know' A on ve-107 graded by its core word).

| word | n | pill | 1st | 2nd | final | why |
|---|---|---|---|---|---|---|
| ve-107 | 7 | assuredly | C? | E? | **E**? | 'assuredly' renders the infinitive absolute in KJV 'know assuredly'; alone it is an adverb fragment, no sense of yada' |
| ve-107 | 9 | (un-)awares | C? | E? | **E**? | '(un-)awares' is the KJV of a negated phrase; a fragment, not a sense of yada' |
| ve-107 | 11 | certainly | C? | E? | **E**? | 'certainly': same as 'assuredly' |
| ve-107 | 24 | be (ig-)norant | C? | E? | **E**? | 'be (ig-)norant' renders lo yada' (not know); fragment of a negated phrase |
| ve-107 | 43 | (can) tell | B | C? | **B** | '(can) tell' = can know/discern (Jonah 3:9 qal 'who can tell'); qal, another sense |
| ve-107 | 51 | known | C? | A | **A**? | 'known' = have known (tense variation of qal know) |
| ve-082 | 17 | followed | B | D? | **B**? | 'followed' is MACULA's contextual gloss of qal yatsa' (go out after = follow); same word, another sense |
| no-093 | 11 | favour | A | B? | **A** | 'favour' is KJV's rendering of this adjective (Ps 35:27 'that favour my righteous cause' = delight in); same sense as agreed A 'to like', 'be (well) pleased' |
| no-093 | 22 | wish | B? | A | **A**? | 'wish' = desire; agreed A 'desiring', 'he had desired' and STEP's 'desirous of' fix the desire sense |
| no-093 | 38 | favors | A | B? | **A** | 'favors': as n11 |
| na-049 | 4 | Existent | B | C? | **C**? | etymological gloss of the root hwh/hyh; both judges gave C on the same pill of na-011 |
| na-049 | 8 | the one bringing into being | B | C? | **C**? | as n4 (both judges C on na-011) |
| na-049 | 9 | life-giver | B | C? | **C**? | as n4 (both judges C on na-011) |
| na-049 | 15 | (Jerusalem of) the Lord | B? | A | **B**? | the parenthetical ties 'the Lord' to a use (Jerusalem of) that is not this verse; strict reading |
| na-049 | 16 | God | A | B? | **B**? | 'God' is a title for the referent, not the name; strict reading (same call on na-011) |
| na-049 | 26 | Transliteration of the Masoretic vocalization of the Tetr… | A | E? | **E** | defines the English word Jehovah, not a reading; both judges gave E on the same pill of na-011 |
| na-049 | 27 | Tetragrammaton | A | E? | **A** | the Tetragrammaton is this word; both judges gave A on the same pill of na-011 |
| na-020 | 7 | farren | D | E | **E**? | 'farren' has no English meaning; E (lower of D/E) |
| ve-038 | 11 | come (to pass) | B? | A | **B**? | niphal 'come to pass' sense; STEP fixes 'it is finished' here (be done, over); same stem, other sense (lower of A/B) |
| ve-038 | 12 | do | D? | B? | **D**? | hayah has no sense 'do' in any stem; KJV artifact like the agreed D 'beacon', 'cause', 'require' |
| ve-038 | 15 | happen | B? | A | **B**? | as n11 |
| ve-038 | 20 | undergo a change or development | B | C | **C** | WordNet 'become': a qal sense (hayah le-), not the niphal here |
| ve-038 | 21 | happened | B? | A | **B**? | as n11 |
| ve-038 | 23 | is | B? | C | **C** | 'is' = qal 'be' |
| ve-038 | 27 | there was | B | C | **C** | 'there was' = qal wayehi |
| ve-038 | 28 | become | B | C | **C** | 'become' = qal |
| ve-038 | 32 | has it happened | B? | A | **B**? | STEP's own niphal rendering in other verses (Deut 4:32 'has it happened'); this verse STEP renders 'it is finished' |
| ve-038 | 33 | has it occurred | B? | A | **B**? | as n32 |
| ve-038 | 34 | it has occurred | B? | A | **B**? | as n32 |
| ve-038 | 36 | it happened | B? | A | **B**? | as n32 |
| ve-038 | 37 | to become | B | C | **C** | 'to become' = qal |
| ve-038 | 38 | come to be | B | C? | **C**? | 'come to be' = qal come into being (lower of B/C) |
| ve-104 | 44 | set yourselves | B | A | **B** | 'set yourselves' = position yourselves (1 Kgs 20:12); here the object is 'your hearts' |
| na-009 | 36 | Judah (Bible) | A | B? | **B**? | PanLex 'Judah (Bible)' is listed beside the tribe and the given name, most likely the biblical person; lower of A/B |
| na-009 | 38 | male given name | B | E | **E** | 'male given name' is a category label, not a rendering |
| na-009 | 42 | yehuda | A? | B? | **A**? | a transliteration of the name, like agreed A 'Jehudah', 'Juda' |
| ve-002 | 7 | divide | A? | C | **C**? | Strong's 'divide' is qal 'divide the sea'; here piel 'split open'; lower of A/C |
| ve-078 | 2 | attend | C | B | **B**? | 'attend' = give heed; agreed B on 'consider', 'mark', 'regard', 'view' (the same sense) |
| ve-078 | 6 | direct | B | D? | **D** | KJV 'direct' in Prov 21:29 follows the ketiv yakin (kun), another verb |
| ve-078 | 9 | feel | B | C? | **C**? | 'feel' is qal (Ps 58:10); here hiphil; lower of B/C |
| ve-078 | 21 | think | C | B? | **C**? | 'think' is hithpolel (Job 31:1); lower of B/C |
| ve-078 | 22 | (cause, make to, get, give, have) understand(-ing) | B? | A | **A** | core word 'understand' is this verse; parenthetical items graded by core word as on agreed A ve-107 n28 |
| ve-078 | 24 | (deal) wise(-ly, man) | C? | B | **C**? | 'wise (man)' is mostly the niphal participle navon; lower of B/C |
| no-039 | 26 | obtain children | D? | C | **D**? | 'obtain children' is niphal of banah; ben is not from banah in current lexica (C only on Strong's etymology); lower |
| no-039 | 28 | repair | D? | C | **D**? | 'repair' is banah; as n26 |
| no-039 | 33 | appointed to | B | E? | **B**? | 'appointed to (death)' is the ben-mavet idiom, like agreed B 'worthy' |
| no-039 | 69 | A direct male descendant | B | A | **B** | Wiktionary lists 'a direct male descendant' beside 'son'; = descendant, agreed B 'descendants' |
| no-038 | 59 | light of prosperity | A | B? | **A**? | BDB's figurative 'light of prosperity' is the sense of Amos 5:18-20 (darkness, not light) |
| na-068 | 16 | else | B | E? | **E**? | Strong's '+ else' marks a word of a compound rendering; fragment |
| na-068 | 65 | other | D? | E | **E**? | 'other' is a fragment of 'other than' (ki im); lower of D/E |
| na-068 | 77 | how much | B | E? | **E**? | 'how much' is a fragment of 'how much more' (af ki) |
| na-068 | 88 | ever | D | E | **E**? | 'ever' is a fragment; lower of D/E |
| na-104 | 9 | call | B | E? | **E**? | 'call' is a fragment of 'call to mind' (hashiv el lev) |
| na-104 | 17 | will I give back | A | B | **A** | 'give back' = return (something), agreed A on 'return (something)', 'restore' |
| ve-068 | 6 | (be, do, do a, shew) marvelous(-ly, -els, things, work) | B? | A | **A** | KJV here reads 'be marvellous'; core word graded as on ve-107 n28 |
| ve-068 | 11 | (be, great, make) wonderful(-ers, -ly, things, works) | B? | A | **A**? | '(be) wonderful' = be marvellous/beyond, the niphal sense here |
| ve-069 | 26 | to count | C? | B? | **C**? | bare 'to count' (number) is piel; lower of B/C |
| no-062 | 26 | The northern parts of Israel: the Galilee and the Golan H… | B? | D? | **B** | 'the North' of Israel is the same noun used of a region (as 'land of the north' here) |
| no-062 | 28 | N | A | E? | **A**? | 'N' is the standard abbreviation of north |
| no-081 | 18 | (too, very) much | A | B? | **A**? | 'much' (abundant) fits 'their wickedness is great' with the vats overflowing (LXX 'multiplied') |
| no-081 | 56 | much | A | B? | **A**? | as n18 |
| na-011 | 15 | (Jerusalem of) the Lord | B | A | **B**? | as na-049 n15 |
| na-011 | 16 | God | B? | A | **B**? | as na-049 n16 |
| na-011 | 22 | Altissimo | E | D | **D** | 'Altissimo': both judges gave D on the same pill of na-049 |

The 64 went: A 14, B 19, C 14, D 5, E 12. (? = unsure.)

## 4. Final levels

Final level = the agreed level (608 pills), else the third judge's (64).

Counts over the 672 sampled pills: A 216, B 222, C 88, D 98, E 48.

### 4a. Over the 672 sampled pills (each sampled pill counts once)

| level | share | 95% (words as clusters) | per-pill Wilson |
|---|---|---|---|
| A | 32.1% | 26.5–39.1% | 28.7–35.8% |
| B | 33.0% | 24.3–41.2% | 29.6–36.7% |
| C | 13.1% | 9.2–17.0% | 10.8–15.9% |
| D | 14.6% | 8.5–20.8% | 12.1–17.5% |
| E | 7.1% | 4.8–9.7% | 5.4–9.3% |
| A+B | 65.2% | 58.3–71.9% | 61.5–68.7% |
| A+B+C | 78.3% | 72.5–84.1% | 75.0–81.2% |
| A+B+C+D | 92.9% | 90.3–95.2% | 90.7–94.6% |

### 4b. By pack (sampled pills)

| pack | words | pills | A | B | C | D | E | A+B | A+B+C |
|---|---|---|---|---|---|---|---|---|---|
| verbs | 16 | 280 | 29.6% (22.6–39.0%) | 36.1% (20.9–49.1%) | 18.6% (12.4–24.8%) | 12.1% (2.6–23.1%) | 3.6% (0.9–6.5%) | 65.7% (52.9–77.1%) | 84.3% (74.8–92.9%) |
| nouns-and-describing-words | 16 | 222 | 24.8% (17.5–37.8%) | 35.1% (19.3–49.4%) | 10.4% (4.3–16.7%) | 23.0% (11.6–33.3%) | 6.8% (3.9–9.4%) | 59.9% (48.6–71.7%) | 70.3% (61.7–80.3%) |
| names-and-small-words | 16 | 170 | 45.9% (34.2–63.0%) | 25.3% (4.9–39.6%) | 7.6% (0.0–13.0%) | 7.6% (2.6–13.4%) | 13.5% (8.2–18.1%) | 71.2% (62.5–84.0%) | 78.8% (69.7–88.5%) |

### 4c. By source (first S-code of the pill)

Unweighted counts and shares of the sampled pills; intervals by word clusters; the last column is the card-weighted A.

| source | name | pills | words | A | B | C | D | E | A share | A+B | A+B+C | A weighted |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| S3 | Strong's Hebrew concordance with explicit source form lists via Hebrew Wikisource | 186 | 19 | 25 | 77 | 43 | 33 | 8 | 13.4% (9.4–18.0%) | 54.8% (39.0–68.7%) | 78.0% (62.5–91.0%) | 11.4% |
| S1 | STEP Bible Translators Amalgamated Hebrew OT aligned component translation | 82 | 43 | 64 | 16 | 2 | 0 | 0 | 78.0% (66.2–90.0%) | 97.6% (93.2–100.0%) | 100.0% (100.0–100.0%) | 78.6% |
| S4 | MACULA exact Hebrew morph surfaces with Cherith English definitions | 73 | 20 | 31 | 32 | 4 | 2 | 4 | 42.5% (28.4–61.2%) | 86.3% (76.2–96.0%) | 91.8% (81.8–100.0%) | 32.2% |
| S11 | Strong's Hebrew Dictionary via Open Scriptures | 53 | 13 | 27 | 12 | 5 | 7 | 2 | 50.9% (32.7–72.0%) | 73.6% (61.0–84.8%) | 83.0% (68.8–94.6%) | 36.6% |
| S19 | UBS Dictionary of Biblical Hebrew v0.9.2 exact definitions and glosses | 42 | 10 | 4 | 22 | 11 | 3 | 2 | 9.5% (3.8–26.1%) | 61.9% (45.5–80.0%) | 88.1% (63.2–98.5%) | 6.6% |
| S21 | Kaikki machine-readable Hebrew dictionary from English Wiktionary | 26 | 14 | 6 | 8 | 3 | 3 | 6 | 23.1% (4.3–44.4%) | 53.8% (28.6–77.8%) | 65.4% (40.9–88.0%) | 12.1% |
| S22 | PanLex 2024 exact same-meaning Hebrew-English lexical expression | 23 | 9 | 9 | 5 | 0 | 9 | 0 | 39.1% (17.6–50.0%) | 60.9% (46.2–70.0%) | 60.9% (46.2–70.0%) | 32.1% |
| S23 | PanLex 2025 explicit English definition joined to continuity-confirmed Hebrew meaning | 23 | 12 | 9 | 6 | 2 | 3 | 3 | 39.1% (18.2–61.9%) | 65.2% (47.8–84.0%) | 73.9% (56.5–88.0%) | 33.5% |
| S6 | Kaikki machine-readable Hebrew dictionary strict source-explicit linked forms from English Wiktionary | 20 | 7 | 4 | 7 | 0 | 9 | 0 | 20.0% (5.6–50.0%) | 55.0% (21.9–100.0%) | 55.0% (21.9–100.0%) | 22.1% |
| S9 | Brown-Driver-Briggs Hebrew Lexicon via Open Scriptures | 20 | 8 | 5 | 6 | 6 | 2 | 1 | 25.0% (10.0–42.9%) | 55.0% (35.0–75.0%) | 85.0% (70.0–100.0%) | 30.1% |
| S20 | Classical Hebrew Words database | 20 | 11 | 4 | 1 | 2 | 13 | 0 | 20.0% (0.0–47.6%) | 25.0% (4.5–56.2%) | 35.0% (13.0–64.7%) | 9.4% |
| S12 | Marcus Jastrow Dictionary via Sefaria structured MongoDB dump | 19 | 7 | 2 | 5 | 0 | 5 | 7 | 10.5% (0.0–16.7%) | 36.8% (6.2–56.2%) | 36.8% (6.2–56.2%) | 13.1% |
| S17 | Unabridged Brown-Driver-Briggs Hebrew Lexicon structured source | 16 | 8 | 1 | 4 | 0 | 1 | 10 | 6.2% (0.0–25.0%) | 31.2% (5.3–64.7%) | 31.2% (5.3–64.7%) | 3.5% |
| S18 | Semantic Dictionary of Biblical Hebrew via HiperBiblia | 12 | 5 | 4 | 5 | 2 | 0 | 1 | 33.3% (0.0–53.3%) | 75.0% (33.3–100.0%) | 91.7% (70.0–100.0%) | 25.9% |
| S27 | Wikidata Hebrew source-explicit form linked to exact English lexeme sense | 7 | 7 | 5 | 2 | 0 | 0 | 0 | 71.4% (42.9–100.0%) | 100.0% (100.0–100.0%) | 100.0% (100.0–100.0%) | 74.6% |
| S16 | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | 5 | 4 | 0 | 1 | 1 | 3 | 0 | 0.0% (0.0–0.0%) | 20.0% (0.0–75.0%) | 40.0% (0.0–100.0%) | 0.0% |
| S13 | STEP Bible Translators Brief Lexicon Hebrew scholar-created Gloss column | 5 | 5 | 2 | 3 | 0 | 0 | 0 | 40.0% (0.0–80.0%) | 100.0% (100.0–100.0%) | 100.0% (100.0–100.0%) | 46.1% |
| S30 | DBnary English Wiktionary source-explicit Hebrew translations and English glosses | 5 | 5 | 0 | 2 | 2 | 1 | 0 | 0.0% (0.0–0.0%) | 40.0% (0.0–80.0%) | 80.0% (40.0–100.0%) | 0.0% |
| S5 | MACULA Hebrew: the morphology's pieces (PIECE:MACULA) | 5 | 5 | 5 | 0 | 0 | 0 | 0 | 100.0% (100.0–100.0%) | 100.0% (100.0–100.0%) | 100.0% (100.0–100.0%) | 100.0% |
| S7 | MUSE large-scale ground-truth Hebrew-English bilingual dictionary | 5 | 3 | 1 | 0 | 0 | 3 | 1 | 20.0% (0.0–100.0%) | 20.0% (0.0–100.0%) | 20.0% (0.0–100.0%) | 26.4% |
| S24 | Hebrew WordNet exact Princeton WordNet 3.0 synset alignment and English gloss | 4 | 3 | 1 | 2 | 1 | 0 | 0 | 25.0% (0.0–100.0%) | 75.0% (0.0–100.0%) | 100.0% (100.0–100.0%) | 14.8% |
| S26 | ConceptNet 5.7 exact Hebrew-English lexical assertions (CC BY 4.0 edge) | 4 | 3 | 1 | 1 | 2 | 0 | 0 | 25.0% (0.0–100.0%) | 50.0% (0.0–100.0%) | 100.0% (100.0–100.0%) | 18.2% |
| S28 | a source no index names | 3 | 3 | 0 | 0 | 0 | 0 | 3 | 0.0% (0.0–0.0%) | 0.0% (0.0–0.0%) | 0.0% (0.0–0.0%) | 0.0% |
| S31 | OmegaWiki structured Hebrew-English DefinedMeaning relations and definitions | 3 | 2 | 3 | 0 | 0 | 0 | 0 | 100.0% (100.0–100.0%) | 100.0% (100.0–100.0%) | 100.0% (100.0–100.0%) | 100.0% |
| S25 | Hebrew Wikipedia 20260701 direct English interlanguage title | 2 | 2 | 0 | 0 | 1 | 1 | 0 | 0.0% (0.0–0.0%) | 0.0% (0.0–0.0%) | 50.0% (0.0–100.0%) | 0.0% |
| S8 | ConceptNet 5.7 exact Hebrew-English lexical assertions (CC BY-SA 4.0 edge) | 2 | 2 | 1 | 1 | 0 | 0 | 0 | 50.0% (0.0–100.0%) | 100.0% (100.0–100.0%) | 100.0% (100.0–100.0%) | 58.3% |
| S33 | Marcus Jastrow Dictionary explicit listed forms via Sefaria structured MongoDB dump | 2 | 2 | 1 | 0 | 1 | 0 | 0 | 50.0% (0.0–100.0%) | 50.0% (0.0–100.0%) | 100.0% (100.0–100.0%) | 53.1% |
| S37 | unfoldingWord Hebrew-Aramaic Lexicon | 2 | 1 | 0 | 2 | 0 | 0 | 0 | 0.0% (0.0–0.0%) | 100.0% (100.0–100.0%) | 100.0% (100.0–100.0%) | 0.0% |
| S15 | Kaikki machine-readable Aramaic dictionary from English Wiktionary | 2 | 1 | 0 | 2 | 0 | 0 | 0 | 0.0% (0.0–0.0%) | 100.0% (100.0–100.0%) | 100.0% (100.0–100.0%) | 0.0% |
| S39 | BiblicalTools Living Lexicon exact Strong glosses and STEPBible Hebrew-Aramaic lemmas | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 100.0% (100.0–100.0%) | 100.0% (100.0–100.0%) | 100.0% (100.0–100.0%) | 100.0% |

## 5. Weighted to whole cards

Each pill weighs pills_on_card / pills_sampled for its word (1 on the 34 uncapped cards; up to 161/30 = 5.37 on ve-082). The weighted shares stand for the 1,267 pills on the 48 cards, so they are the ones to set beside a whole-card count such as the fresh readers'.

Weighted totals: A 341.3, B 477.9, C 164.1, D 187.9, E 95.8 (of 1,267).

| level | share | 95% (words as clusters) |
|---|---|---|
| A | 26.9% | 22.2–34.0% |
| B | 37.7% | 29.3–44.6% |
| C | 13.0% | 8.0–17.5% |
| D | 14.8% | 8.4–21.4% |
| E | 7.6% | 4.9–10.8% |
| A+B | 64.7% | 59.1–70.5% |
| A+B+C | 77.6% | 70.6–84.9% |
| A+B+C+D | 92.4% | 89.2–95.1% |

By pack, weighted:

| pack | pills on cards | A | B | C | D | E | A+B | A+B+C |
|---|---|---|---|---|---|---|---|---|
| verbs | 491 | 25.7% (21.2–35.2%) | 42.9% (25.8–52.0%) | 19.3% (12.5–23.9%) | 7.8% (1.6–19.7%) | 4.3% (1.3–7.6%) | 68.6% (56.4–76.4%) | 87.9% (77.4–93.8%) |
| nouns-and-describing-words | 509 | 23.4% (15.8–36.5%) | 35.6% (23.1–47.9%) | 10.8% (3.5–17.0%) | 23.5% (14.1–32.6%) | 6.7% (3.9–9.8%) | 59.0% (51.5–68.5%) | 69.8% (61.6–77.5%) |
| names-and-small-words | 267 | 35.9% (24.3–62.7%) | 32.2% (4.9–41.9%) | 5.4% (0.0–12.9%) | 11.3% (2.6–17.1%) | 15.2% (8.0–19.0%) | 68.1% (61.4–83.2%) | 73.4% (64.3–88.7%) |

### Other views of the same finals

| view | A | A+B | A+B+C | A+B+C+D |
|---|---|---|---|---|
| sampled pills, all 48 cards | 32.1% | 65.2% | 78.3% | 92.9% |
| whole cards (weighted), all 48 | 26.9% | 64.7% | 77.6% | 92.4% |
| whole cards (weighted), the 28 cards with more than one pill | 25.8% | 64.2% | 77.3% | 92.3% |
| whole cards (weighted), leaving out pill 1 (the line under the word) | 22.9% | 62.7% | 76.3% | 92.0% |
| mean of per-card shares, all 48 cards (each card counts once) | 61.9% | 78.7% | 88.1% | 95.4% |
| mean of per-card shares, 28 cards with more than one pill | 38.3% | 67.1% | 79.5% | 92.1% |
| mean of per-card shares, 16 verb cards | 47.1% | 71.5% | 90.6% | 97.9% |
| mean of per-card shares, 11 verb cards with more than one pill | 32.2% | 67.6% | 86.3% | 97.0% |

20 of the 48 words have one pill, STEP's own reading; 19 are A and one is C (ve-060, Nahum 3:8, «have you been made good» for a qal «are you better than», both judges). Pill 1, the line under the word, is A on 47 of 48 cards.

### Sensitivity to the third judge

| whose call on the 64 | A | A+B | A+B+C | A+B+C+D | A weighted | A+B weighted | A+B+C weighted |
|---|---|---|---|---|---|---|---|
| first judge | 32.0% | 67.4% | 79.8% | 94.5% | 26.7% | 66.4% | 79.2% |
| second judge | 32.6% | 64.9% | 78.0% | 92.4% | 26.7% | 64.0% | 77.3% |
| lenient of two | 34.5% | 68.3% | 80.2% | 94.6% | 28.6% | 67.0% | 79.7% |
| strict of two | 30.1% | 64.0% | 77.5% | 92.3% | 24.8% | 63.4% | 76.7% |
| third judge (final) | 32.1% | 65.2% | 78.3% | 92.9% | 26.9% | 64.7% | 77.6% |

Whoever settles the 64, A moves by at most ±2.5 points and A+B by ±3. The adjudication does not drive the result; the boundary chosen does.

## 6. Which boundary each outside figure uses

The fresh readers' scale (v184, `FOR-ELIJAH-v184.md`) has four verdicts: right here; possible («a true meaning of these letters, not the meaning in this verse»); wrong word («no meaning of any word written with these letters»); not a reading. «Possible» is about the letters, so it takes in our B, our C, and the part of our D that is a real other word written with these letters (a homograph, a modern word, a place of the same name). Only D with no such word behind it is their «wrong word». The 98 D pills were split for this (`dsplit.tsv`): 59 another real word on these letters, 39 no word.

| figure | who | their boundary | our nearest rung (whole cards, weighted) | consistent? |
|---|---|---|---|---|
| 18.5% right here (1,630 of 8,828 pills, 330 words) | corpus lane's fresh readers | A | A = 26.9% (22.2–34.0%) | **No, ours is higher.** 18.5% is below our interval. Per pack they have verbs 20.1%, nouns 13.7%, names 21.7%; we have 25.7%, 23.4%, 35.9%. |
| 87.9% right or possible | same | A + B + C + D on these letters | A+B+C = 77.6% (70.6–84.9%); + D on these letters = **86.1%** (80.8–90.8%); A+B+C+D = 92.4% | **Yes.** It falls inside our interval for the matching boundary. |
| 58% right (152 of 264 pills) | the outside reader, second look at Genesis 1's verb cards (`wip/2026-11-14/the-outside-readers-second-look/`) | «right for the word in its stem» = A + B | verbs A+B = 68.6% (56.4–76.4%); unweighted 65.7% (52.9–77.1%) | **Yes**, inside both intervals, though his cards are Genesis 1 and ours are the twelve chain books. On the A rung, our verbs are only 25.7%. The file found says fourteen cards, not 19; no 19-card figure was found. |
| about 48% accurate | the auditor (`wip/2026-11-14/no-claims/`: «my own labels today (the ~48%)») | not stated; he sorts pills into «meaning» and «not a meaning», which is the A+B kind of cut | A = 26.9% (22.2–34.0%); A+B = 64.7% (59.1–70.5%) | **Not on either rung.** 48% is above our A interval and below our A+B interval. It fits a boundary between them, or a different set of cards or an earlier build. |

Reading of the ladder. On one set of cards judged once, the same pills give:

- right here (A): 26.9%
- a meaning of this word in this stem (A+B): 64.7%
- a meaning of this root or entry (A+B+C): 77.6%
- a meaning of some word on these letters (A+B+C+D on these letters): 86.1%
- any English meaning at all (A–D): 92.4%

So 18.5%, 48%, 58% and 87.9% are not readings of one quantity that disagree. They are four cuts on one ladder. The gap between 48% and 87.9% is the gap between «a meaning of this word» and «a meaning of these letters». What does need explaining is the bottom rung: our judges give A about 8 points more often than the fresh readers did. Possible reasons:

- the fresh readers kept «right here» for this verse's exact sense, and passed transliterations, definitions of the name, and tense or voice variants as «possible»;
- their build may predate the 13 November entry gate, which removed other-entry pills and raised the right share on the outside reader's cards from 45% to 58%;
- they set 247 pills aside as not shown, where our judges graded nulls E.

For the auditor, the nearest reading is the A+B kind of cut, with things he would not call a meaning taken out. One such exclusion was measured: definitions of the thing, such as «son of Jacob and Leah» or «the planet we live on», are 5.6% of card weight, all inside our B. Taking them out brings A+B down only to about 59%, still above 48%. So either the auditor's cards hold more of Strong's lists than ours, or his cut sits nearer «right here» than «a meaning of this word». It is not the «right or possible» cut, and it is not the «right here» cut.

## 7. Per word

| word | ref | grammar | on card | sampled | A | B | C | D | E | disagreements |
|---|---|---|---|---|---|---|---|---|---|---|
| na-009 | zechariah 2:16 | HNpl | 43 | 30 | 9 | 15 | 3 | 1 | 2 | 3 |
| na-011 | habakkuk 2:2 | HNpt | 29 | 29 | 15 | 2 | 5 | 2 | 5 | 3 |
| na-020 | habakkuk 3:3 | HNpl | 7 | 7 | 4 | 0 | 0 | 2 | 1 | 1 |
| na-030 | jonah 3:5 | HNpl | 5 | 5 | 5 | 0 | 0 | 0 | 0 | 0 |
| na-036 | micah 1:5 | HNpl | 5 | 5 | 3 | 0 | 0 | 0 | 2 | 0 |
| na-039 | micah 1:1 | HNpl | 6 | 6 | 5 | 0 | 0 | 0 | 1 | 0 |
| na-045 | obadiah 1:1 | HR/Npm | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| na-049 | hosea 3:5 | HNpt | 29 | 29 | 15 | 2 | 5 | 2 | 5 | 7 |
| na-061 | micah 3:12 | HR/D | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| na-065 | joel 4:7 | HD/Sd | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| na-068 | joel 2:13 | HTc | 114 | 30 | 5 | 13 | 0 | 6 | 6 | 4 |
| na-080 | micah 6:5 | HTo/Sp3ms | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| na-088 | zechariah 14:12 | HC/Tm | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| na-090 | haggai 1:9 | HR/Sp3ms | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| na-099 | zechariah 4:2 | Hc/Vqw1cs | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| na-104 | joel 4:1 | HVhi1cs | 22 | 22 | 10 | 11 | 0 | 0 | 1 | 2 |
| no-011 | hosea 2:24 | HTd/Ncmsa | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| no-019 | zephaniah 1:1 | HR/Ncmpc | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| no-025 | malachi 1:4 | HC/Td/Ncmsa | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| no-038 | amos 5:20 | HNcfsa | 134 | 30 | 6 | 10 | 6 | 7 | 1 | 1 |
| no-039 | hosea 10:14 | HNcmpa | 76 | 30 | 5 | 11 | 0 | 12 | 2 | 4 |
| no-062 | zechariah 6:8 | HNcfsa | 31 | 30 | 7 | 2 | 7 | 13 | 1 | 2 |
| no-063 | amos 2:10 | HRd/Ncmsa | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| no-067 | zechariah 9:12 | HTd/Ncmsa | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| no-071 | hosea 12:2 | HC/Ncmsa | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| no-076 | habakkuk 3:5 | HR/Ncmpc/Sp3ms | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| no-078 | amos 2:7 | HNcfsa | 70 | 30 | 3 | 18 | 0 | 5 | 4 | 0 |
| no-081 | joel 4:13 | HAafsa | 67 | 30 | 4 | 11 | 3 | 11 | 1 | 2 |
| no-082 | amos 1:13 | HAafpc | 4 | 4 | 3 | 0 | 1 | 0 | 0 | 0 |
| no-085 | micah 7:2 | HC/Aamsa | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| no-089 | jonah 1:16 | HAafsa | 38 | 30 | 4 | 21 | 2 | 0 | 3 | 0 |
| no-093 | micah 7:18 | HAamsc | 81 | 30 | 15 | 5 | 4 | 3 | 3 | 3 |
| ve-002 | habakkuk 3:9 | HVpi2ms | 13 | 13 | 4 | 4 | 5 | 0 | 0 | 1 |
| ve-026 | amos 4:2 | HVNp3ms | 29 | 29 | 16 | 2 | 2 | 9 | 0 | 0 |
| ve-031 | zephaniah 3:8 | HR/Vqcc | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| ve-038 | micah 2:4 | HVNp3ms | 39 | 30 | 4 | 8 | 9 | 8 | 1 | 14 |
| ve-044 | amos 5:10 | HVqp3cp | 9 | 9 | 6 | 3 | 0 | 0 | 0 | 0 |
| ve-045 | zechariah 14:2 | Hc/VNq3fs | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| ve-052 | amos 1:11 | HVqp3ms/Sp3fs | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| ve-060 | nahum 3:8 | HTi/Vqi2fs | 1 | 1 | 0 | 0 | 1 | 0 | 0 | 0 |
| ve-062 | malachi 3:3 | HVprmsa | 28 | 28 | 7 | 0 | 8 | 13 | 0 | 0 |
| ve-068 | zechariah 8:6 | HVNi3ms | 16 | 16 | 8 | 4 | 4 | 0 | 0 | 2 |
| ve-069 | micah 2:3 | HVqrmsa | 50 | 30 | 6 | 15 | 6 | 0 | 3 | 1 |
| ve-073 | zechariah 9:13 | Hc/Vpq1cs | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| ve-078 | micah 4:12 | HVhp3cp | 30 | 30 | 9 | 14 | 5 | 1 | 1 | 6 |
| ve-082 | micah 5:1 | HVqi3ms | 161 | 30 | 6 | 16 | 7 | 0 | 1 | 1 |
| ve-104 | haggai 2:18 | HVqv2mp | 48 | 30 | 5 | 22 | 0 | 3 | 0 | 1 |
| ve-107 | hosea 5:3 | HVqp1cs | 63 | 30 | 8 | 13 | 5 | 0 | 4 | 6 |

## 8. Caveats

- 48 words is a small draw. The intervals are wide (A+B ±6 to 7 points overall, ±10 to 13 within a pack), and the source rows rest on few words each. S3 (Strong's concordance) has 186 pills but only 19 words.
- Within-sample means: the per-card mean over all 48 cards (A 61.9%) is dominated by the 20 one-pill cards and is not a pill share. Do not compare it with the fresh readers' pooled shares.
- The D split into «these letters» vs «no word» is the third judge's alone, made only for the comparison in section 6. It moves the 87.9% comparison by at most the D share (A+B+C 77.6% to A–D 92.4%), and 87.9% lies inside that range either way.
- 45 of the 64 third-judge calls are marked unsure; where the doubt lay between two levels the lower was taken, as the scale asks. That pulls disputed pills down; section 5's sensitivity table bounds the effect.
- 16 of the 48 E pills are empty texts (None). The fresh readers set such pills aside as not shown; leaving them out of our denominator would raise every rung by about 1 point.
