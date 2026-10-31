The ask for Moses is Part 1 below and the owner's summary is Part 2 (247 words); the two are separated by the ===== line.

=====

# For Moses: each provider's own punctuation, ledgered

From Elijah (page lane), 31 October 2026. This is draft 2, written after a ten-provider pilot run on the page lane. Please name this draft in your relay.

## Why

Every English reading the site prints comes from a provider in the route store. The store holds 654,886 routes on 124,911 letters keys, from 119 M ids under 36 source keys (store version 87b13b1169b4).

Today the card divides every provider's text with one global rule:

1. `reader/tools/gloss-store-v1.mjs` (packSplit) cuts a route at each semicolon that sits outside parentheses.
2. `reader/tools/sense-split-v1.mjs` (senseSplit, sense-split-rule-v3) then cuts each sense at commas outside parentheses:
   - A comma piece of at most four words that is not a bare "and", "or", "nor" or "but" is a reading. Words inside parentheses are not counted.
   - If any piece is longer than four words, the short pieces print and the whole sense prints beside them.
   - A sense whose parentheses do not balance is held whole as damaged, and the card prints nothing for it.

That rule reads a mark the same way in every provider, but the providers do not use their marks the same way. Here is what the pilot found in ten of them (counts are occurrences in route text):

| mark | what it does, by provider |
|---|---|
| `,` | Kaikki: divides one gloss from the next (69,591 of 84,201). Wikisource Strong's: almost always inside one optional group (22,129 of 23,179), because the store already cut the KJV list at its commas. UBS: English prose inside one definition (0 of 10,405 separated). TAHOT, MACULA and MUSE write no commas. |
| `;` | UBS: joins the parts of one record, such as head to note or literal wording to "hence" (15,999, of which only 26 offer a second meaning). HiperBiblia: divides gloss items in the definition (10,456), already cut upstream, so no route carries one. Open Scriptures Strong's: divides the senses of Strong's sentence (2,046). |
| `/` | TAHOT: the boundary between segments of one Hebrew word, inside one reading (63,983). Kaikki: alternatives packed inside one reading's frame (354). PanLex: two readings, as in אלש "Elche/Elx" (3). UBS: and/or (148). |
| `+` | Wikisource Strong's and Open Scriptures Strong's: Strong's sign on a rendering (4,743 and 39). Kaikki: composition in a grammar note (19). MACULA: inside a lexicon-number equation (2). UBS: adds an instrument or manner (6). |
| `( )` | Wikisource Strong's: optional words (23,603), syllables and alternatives (9,177). Kaikki: a qualifier (21,579). UBS: the open slot of an idiom (1,274). MACULA: a lexicon number on part of a name (4). |
| `>` | TAHOT: closes a Hebrew element that English drops (5,947). UBS and HiperBiblia: leads from an idiom's literal wording to its meaning (120 and 190). |
| `:` | Wikisource Strong's: opens the KJV rendering list (':' in 5,556 definitions, ':--' in 119). Kaikki: divides a head gloss from the explanation that defines it (5,768). UBS: closes a label such as "literally:" (3,404). |

The owner wants each provider's conventions written down as a ledger, so the page divides and prints each provider's text by that provider's own rules.

The machinery has existed since August. It is provider-declaration-rule-v1, in `reader/tools/declarations-v1.json`, applied by `reader/tools/declaration-v1.mjs`. Its defaults stand:
- A provider with no declaration ships whole.
- A declared provider's mark set is closed: a row that carries an undeclared mark is reported and ships whole.
- "A separation keeps every piece the mark divides and each piece is a run of the provider's own characters. A derivation keeps one piece and discards the rest, or joins pieces the provider never wrote together. This project does the first and never the second."

Two providers were declared on 17 August:
- wikisource_strongs_explicit_forms: M14, 20,670 routes then, 148,506 now.
- bolls_bdbt_brown_driver_briggs_hebrew_1906: M20, with separates_on null; it has since been withdrawn from the store.

The machine reads one `separates_on.mark`, has no regions and no per-shape conditions, and checks that the pieces rejoin using the mark plus a space. Five of the ten pilot declarations need more than that:
- Wikisource Strong's and Open Scriptures Strong's need a step that locates each route in its record.
- PanLex, BDB and HiperBiblia need either two marks or a rule that only certain shapes divide.

I will extend the machine. Write the ledger as if the machine reads every field you give it.

### Why this goes to you and not the page lane

The pilot worked from the route store alone: key, route, definition text, M id, year and cut. The store keeps no provider record id and no field name. Wherever the record decides the answer, the pilot had to guess, and its worst errors were those guesses:

- **openscriptures_strongs:** whether a definition is Strong's own sentence or the KJV rendering list was decided from the characters. That test reads 7 list records as sentences (יה, שיה, מצפה, דיבון, הי, שכר, ינח), so 15 rendering separators are never cut. The Open Scriptures file keeps the two fields apart.
- **wikisource_strongs_explicit_forms:** 11,023 routes occur more than once inside their own definition, so the locator had to choose which occurrence each route is. 538 routes sit outside a single item of the list.
- **kaikki_wiktionary_hebrew:** in 92 rows (M50 66, M69 26) the store cut a leading topic label off the route; in 114 others it left the label on.
- **hiperbiblia_sdbh:** 35 glosses in the definitions were never emitted as routes, and one item (צהב) was cut into two routes inside its own parenthesis.
- **stepbible_tahot_aligned_translation:** 4 '[' open into a neighboring word's route and 2 ']' close one opened there. That can only be tested with word positions, which the TAHOT file has.

So the ledger is yours: read each provider's own records, and take the evidence from them.

## What to ledger

Write one declaration per source key, in the declarations-v1 shape. That is an entry under `providers.<source_key>` with `label`, `m_ids`, `routes`, `declared_from`, `marks`, `precedence`, `refusals`, `export`, `separates_on` and `not_done_here`, as M14 has. The pilot adds three things: each mark carries a list of `shapes`, and each entry carries `regions` and `branches`.

**`declared_from`** gives:
- the provider files you read, with their version or hash;
- the route store version you counted against;
- the provider's own key to its signs, by name. Examples: Strong's "signs employed" page, the notes at the head of the TAHOT files, the SDBH legend for ◄ ► ≈.

If you find no key to the signs, say so, and begin every meaning that is not backed by one with "unverified:".

**`regions`** names the parts of the provider's record and says which part every route sits in, read from the record's own fields and offsets. Examples:
- Strong's: definition, KJV list, and the note after the list.
- Open Scriptures: strongs_def and kjv_def.
- UBS: head, the ◄ ► ≈ notes, and the "literally:" and "hence:" parts.

**`marks`** covers every mark the 31 October inventory lists for the source key's M ids. A mark is any character that is not a letter, a digit or whitespace; Hebrew points, the maqaf and the geresh count. Also add any sign the inventory cannot see because it is a letter (Strong's X: 11,910 in M14). Each mark has `governs` (its occurrences) and `routes`, and then one of:
- `shapes`, or
- `"inert": "<one sentence>"`, for a mark that never divides and means the same thing everywhere, such as the points of a cited Hebrew word.

**Each shape** has:
- `id`: `<mark name>.<what it does>`, lowercase with underscores.
- `test`: deterministic, and worded exactly enough that a stranger writes the same code and gets the same count. Write every word list out in full. Say where positions are measured from, whether text inside brackets counts, and which brackets "outside parentheses" includes.
- `order`: its place among that mark's tests. The first test that matches names the shape.
- `region`: where it sits in the record.
- `count`: occurrences and routes, from your script.
- `means`: one plain sentence on what the provider uses the mark for here.
- `divides`: true only if a reader sees two readings on either side, every time. If a shape divides in meaning but should not be cut until the owner rules, set `divides: false` and open a branch.
- `falsifier`: required when the shape divides. Say what text would prove it wrong, and how many such cases you found.
- `evidence`: at least three items for a dividing shape, up to three otherwise. Each item gives:
  - the provider's record id and field;
  - the byte range of the mark in that field;
  - the letters key and the route the mark lands in;
  - a window of at most 60 characters.

  Wherever the record decides the answer (field kind, entry identity, which occurrence, whether the store cut the route), take the evidence from the record, not the route text.

**`precedence`**: scopes first, then the dividing shapes from the largest unit to the smallest.

**`refusals`**: the August rules for unbalanced brackets, with counts: a closer with nothing open is inert, and nothing is cut from an unclosed opener onward. Also list routes whose pieces do not rejoin and rows that carry an undeclared mark.

**`separates_on`**: the dividing shapes, the scope, and `rejoin_with`, the provider's own characters between pieces. Use `null` if nothing separates.

**`export`**: the license posture named in the store's M record.

**`branches`**: every question the data cannot settle (see test 6).

### Acceptance tests

1. **Closed set.** Every mark the inventory lists for the provider's M ids has shapes or an explicit `inert`. Your script finds 0 routes carrying an undeclared mark. Marks seen only in definitions and never in a route are listed as such (M14 has five).
2. **Completeness.** Every occurrence falls in exactly one shape. Unexplained is 0, or each leftover is named, keyed and counted (PanLex: the 2 '?' on "Hayward?" at כישרון and יכולת; Kaikki: 1 '@' at קשיטה). Where two tests could match, the stated order decides.
3. **Rejoin.** For every divided field, the pieces joined with the characters that stood between them equal the provider's bytes. State `rejoin_with`: today's machine joins pieces with the mark plus a space, so it refuses PanLex אלש "Elche/Elx" and that provider's two other slash routes.
4. **Separation, never derivation.** Every piece is kept and is a run of the provider's own characters:
   - no head word is carried over to a later piece (און "be fatigued, tired" never prints "be tired");
   - no group is spread across its head;
   - no X or + is stripped;
   - no region of a record is picked out as the reading;
   - no missing piece is made up.
5. **Counts reproduce.** A second script, written from your declaration's words alone by someone who has not seen your code, gets every count. I will write that script.
6. **Owner branch.** Anything the data cannot settle becomes a branch. It states the question, the shapes and occurrences it covers, two or more options with what each prints and how many routes each changes, and a resting option, which is the one that does not divide.

With each ship, also report the comparison with today's engine, as six counts:
1. same division;
2. today's rule divides where yours keeps whole;
3. yours divides where today's keeps whole;
4. divided differently;
5. today's prints nothing where yours prints;
6. same division but printed differently.

### What failed in the pilot, so it doesn't fail again

Five of the ten drafts did not survive the recount. The failures fell into these kinds:

- **Word lists left open.** Tests ended in "...", "and the like" or "such as".
  - Kaikki: 30 of 148 shape rows do not reproduce from the words (paren.argument_slot comes out at 1,911 against 2,337).
  - Open Scriptures Strong's: def_label is 812 by the draft's label list and 1,055 by the verifier's.
  - UBS: the open list of appositive words moves 11 commas into a dividing shape.
  - MACULA: the verbal-particle figure is 668 in the draft and 477 with the five particles it names.
- **Test order not stated.**
  - M14: all 733 commas in an unclosed group also pass the in-group test, and 210 hyphens match both opener_tail and suffix_syllable.
  - UBS: 17 pairs of tests overlap.
  - Kaikki: about 900 occurrences pass two tests.
- **Positions measured from the wrong place.**
  - M14: measuring "first in the rendering" from the start of the route moves 42 X's into mid_rendering.
  - TAHOT: "first character of its segment" gives 31, not 70, unless it means the first character that is not whitespace.
- **Dividing meanings with uncounted exceptions.**
  - M14 period.list_end: in 12 routes the piece after the full stop is a rendering (גבולת "landmark. place", מלין "thing. word", לודיים "Ludim. Lydians").
  - BDB comma.between_glosses: in 5 routes (6 commas) a piece depends on a word in another piece (חשש "particles of straw, sand, dust").
  - Open Scriptures Strong's comma.def_between_tagged_glosses: 4 commas cut a name's meaning from the name.
  - UBS semicolon.before_alternative_label: 3 of 26 open the first alternative, not a second one.
- **The record guessed from the route.** See "Why this goes to you" above.

### Store questions only you can answer

These showed up as marks, but they are cuts the store made. Answer each from the record, give it a count, and say whether the store should re-cut:

- **M14:**
  - 201 list routes are a syllable or a group standing alone ("-s", "(put)").
  - 45 routes were cut after a chapter:verse colon (bare "3" eight times, "11" ten times).
  - 42 of the 229 routes withheld today come from a store cut through a group the provider closed.
- **Kaikki:** 92 leading labels were cut off and 114 were kept (M25 85, M13 19, M50 6, M11 3, M69 1). Which is right?
- **Open Scriptures Strong's:** 2 routes where the store cut through a group in Strong's sentence.
- **HiperBiblia:** the 35 glosses never emitted (among them ים sea, ענן cloud, גרם bone, מלח salt, שמש sun), and the צהב item cut in two.
- **TAHOT:** the 4 '[' and 2 ']' that cross into neighboring words, and the 4 stray '>' in "<into> the>".
- **MUSE:** 2 rows dated 2026 (מחל, טבילה), where the other 24,512 read S_NO_SOURCE_YEAR.
- **M14 license:** August's export line says cc_by_4_0_underlying_public_domain; the store's M14 record says cc_by_sa_4_0_underlying_public_domain.

## Order of work

Work by routes, top down. In the table, "marks" and "occurrences" are the provider's closed set in route text, from the 31 October inventory. 43 of the 119 M ids use no marks. A source key whose M ids use no marks still gets a declaration with `marks: {}`, unless the owner rules otherwise on the MUSE question.

| # | source key | M ids | routes | cumulative | marks | occurrences | |
|---|---|---|---|---|---|---|---|
| 1 | wikisource_strongs_explicit_forms | 1 | 148,506 | 22.68% | 27 | 137,744 | pilot |
| 2 | kaikki_wiktionary_hebrew | 5 | 123,558 | 41.54% | 68 | 194,769 | pilot |
| 3 | stepbible_tahot_aligned_translation | 1 | 95,089 | 56.06% | 13 | 123,841 | pilot |
| 4 | macula_hebrew_cherith_surface_english_2022 | 1 | 43,304 | 62.68% | 11 | 2,360 | pilot |
| 5 | panlex_hebrew_english_meanings_20240301 | 1 | 28,439 | 67.02% | 14 | 908 | pilot |
| 6 | muse_hebrew_english_ground_truth_dictionary | 2 | 24,514 | 70.76% | 0 | 0 | pilot |
| 7 | openscriptures_strongs | 1 | 23,646 | 74.37% | 18 | 52,371 | pilot |
| 8 | ubs_sdbh_hebrew_v0_9_2 | 1 | 21,626 | 77.67% | 41 | 58,686 | pilot |
| 9 | openscriptures_bdb_1906 | 1 | 15,238 | 80.00% | 16 | 1,040 | pilot |
| 10 | hiperbiblia_sdbh | 1 | 14,823 | 82.27% | 16 | 2,422 | pilot |
| 11 | wikimedia_hebrew_english_interlanguage_title_20260701 | 1 | 12,355 | 84.15% | 12 | 5,163 | |
| 12 | hewiktionary_hebrew_explicit_inflection_english_translation | 17 | 12,134 | 86.00% | 7 | 157 | |
| 13 | wikidata_hebrew_explicit_form_english_sense | 5 | 11,440 | 87.75% | 17 | 11,263 | |
| 14 | conceptnet_5_7_hebrew_english_cc_by_sa_4_0 | 1 | 11,378 | 89.49% | 6 | 18,928 | |
| 15 | hewiktionary_hebrew_exact_english_translation | 20 | 10,496 | 91.09% | 10 | 175 | |
| 16 | panlex_hebrew_english_definitions_20250201 | 1 | 9,831 | 92.59% | 27 | 5,007 | |
| 17 | unabridged_bdb_1906 | 1 | 8,927 | 93.96% | 30 | 8,704 | |
| 18 | classical_hebrew_words | 1 | 7,322 | 95.07% | 27 | 3,711 | |
| 19 | dbnary_english_wiktionary_hebrew_translation_gloss | 1 | 6,156 | 96.01% | 5 | 110 | |
| 20 | omegawiki_structured_defined_meaning | 1 | 5,363 | 96.83% | 31 | 6,497 | |
| 21 | omw_hebrew_pwn30 | 1 | 4,174 | 97.47% | 14 | 2,480 | |
| 22 | conceptnet_5_7_hebrew_english_cc_by_4_0 | 1 | 4,117 | 98.10% | 3 | 15,824 | |
| 23 | kaikki_wiktionary_aramaic | 3 | 2,700 | 98.51% | 28 | 2,512 | |
| 24 | stepbible_tbesh_gloss | 1 | 2,645 | 98.92% | 13 | 1,262 | |
| 25 | hewiktionary_hebrew_explicit_full_spelling_english_translation | 16 | 2,322 | 99.27% | 6 | 41 | |
| 26 | lexibank_analysed_v2_2_northeuralex_hebrew | 1 | 974 | 99.42% | 3 | 336 | |
| 27 | kaikki_english_wiktionary_hebrew_translation_table | 1 | 850 | 99.55% | 5 | 24 | |
| 28 | hewiktionary_hebrew_explicit_inflection_recovery_english_translation | 9 | 847 | 99.68% | 2 | 7 | |
| 29 | biblicaltools_living_lexicon | 1 | 753 | 99.79% | 11 | 139 | |
| 30 | wikidata_hebrew_lexeme_gloss | 7 | 324 | 99.84% | 9 | 289 | |
| 31 | omw_hebrew_oewn2025_permanent_sense_key_bridge | 1 | 313 | 99.89% | 12 | 337 | |
| 32 | unfoldingword_uhal | 1 | 286 | 99.93% | 5 | 15 | |
| 33 | openscriptures_lexical_index | 1 | 138 | 99.95% | 4 | 103 | |
| 34 | kethoneth_yoseph_1887_source_image_reviewed | 1 | 107 | 99.97% | 6 | 95 | |
| 35 | hewiktionary_hebrew_explicit_heading_alternate_english_translation | 9 | 106 | 99.99% | 1 | 2 | |
| 36 | davidson_1855_manual_source_image_reviewed_v1 | 1 | 85 | 100.00% | 3 | 5 | |

The ten pilot providers cover 538,743 routes (82.27%). Their drafts and the recount's corrections travel with this ask; start from them, but take the evidence from the record.
- The five that held (TAHOT, MACULA, PanLex, MUSE, HiperBiblia) need record evidence and their branches.
- The five that did not hold (Wikisource Strong's, Kaikki, Open Scriptures Strong's, UBS, BDB) need the corrections first.

Ship wikisource_strongs_explicit_forms first and wait for my recount. After that, ship one source key per ship, in this order.

## The pilot, as worked examples

How to read the tables:
- **Bold** marks a shape that divides and is separated.
- "(m)" marks a shape that divides in meaning but is not separated until the owner rules.
- The last column gives the occurrences that divide.

"Recount" is the verifier's independent script, written from the draft's words.

### 1. wikisource_strongs_explicit_forms (M14, 148,506 routes). Recount: did not hold

The record runs: Strong's definition, then an opener, then the KJV rendering list, then sometimes a note.
- The opener is ':' in 5,556 definitions, ':--' in 119, '--' in 24 and '; -' in 8; 11 definitions have none.
- The store already cut the list at its commas: 147,968 routes (99.64%) are exactly one list item, so August's comma rule divides 0 routes today.

| mark (occurrences) | shapes (count) | divides |
|---|---|---|
| `(` 45,793 · `)` 45,814 | optional_words 23,603 · suffix_syllable 9,589 · alternatives 9,177 · prefix_syllable 2,526 · list_aside 527 · head_aside 174 · opener_never_closed 120 · note 77 · `)` closer_with_nothing_open 141 | no; scopes every cut |
| `,` 23,179 | in_group 22,129 · in_unclosed_group 733 · in_head_aside 259 · note_prose 57 · **rendering_separator 1** | 1 |
| `-` 15,919 | suffix_syllable 12,118 · prefix_syllable 2,734 · detached_syllable 527 · opener_tail 310 · compound 226 · bare_in_group 3 · misplaced_opener_tail 1 | no |
| X 11,910 (a letter) | whole_rendering 11,263 · in_group 543 · mid_rendering 104 | no |
| `+` 4,743 | whole_rendering 4,387 · in_group 275 · mid_rendering 81 | no |
| `.` 932 | ellipsis 616 · abbreviation 126 · **list_end 108** · note_sentence_end 68 · stray_in_rendering 8 · head_sentence_end 6 | 108 |
| `;` 537 | **head_separator 218** · **rendering_separator 102** · **opener 97** · in_head_aside 82 · note_prose 38 | 417 |
| `:` 9 | citation 7 · **opener 2** | 2 |
| `` ` `` 213 · `'` 113 · `"` 26 · `&` 18 · `?` 5 · `!` 1 | ayin in a transliteration · apostrophe · quotation in a note · '&' unresolved (branch) · interrogative · exclamation | no |
| 13 Hebrew points, 442 | part of a cited Hebrew word | no |

The draft divides 431 routes into 982 pieces, and 0 fail to rejoin.

The recount reproduces the division, the comparison with today's engine and 41 of 54 shape counts. The 13 that differ need a test order and three rules the census code applies but the words never state. As worded:
- '(' and ')': optional_words 23,659, alternatives 9,420, prefix_syllable 2,125, list_aside 553;
- X: whole_rendering 11,305, mid_rendering 62;
- '.': abbreviation 127, note_sentence_end 67, ellipsis 612.

As worded, 152 parenthesis occurrences and 4 two-dot periods fit no shape.

Three dividing shapes were falsified:
- period.list_end: 12 routes where a rendering follows the full stop, and 2 where transcription debris does.
- semicolon.head_separator: 27 occurrences separate variant spellings of the headword (פדיון).
- semicolon.rendering_separator: 2 routes cut inside an aside (ירע, ירעה), and 1 displaced opener (חראי).

### 2. kaikki_wiktionary_hebrew (M13, M25, M11, M69, M50; 123,558 routes). Recount: did not hold

| mark (occurrences) | shapes (count) | divides |
|---|---|---|
| `,` 84,201 | **gloss_boundary 69,591** · in_parentheses 9,180 · list_inside_sentence 1,455 · before_clause 1,069 · before_serial_conjunction 1,053 · in_note 478 · pointer 302 · before_relative 288 · strongs_list 238 · after_label 165 · before_etc 140 · under_lead_label 123 · shared_object 71 · before_bare_group 47 · number 1 | 69,591 |
| `(` 28,641 · `)` 28,609 | qualifier 21,579 · romanization 2,931 · argument_slot 2,337 · nested 795 · grammar_label 436 · hebrew_note 197 · subject_pronoun 126 · lead_label 114 (holds the line whole) · trailing_note 51 · unclosed_opener 32 · mark_display 23 · trailing_label 20 (holds the line whole) | no |
| `.` 23,967 | terminal 21,914 · in_parentheses 1,586 · abbreviation 189 · **sentence_boundary 140** · **before_trailing_note 51** · decimal 46 · under_lead_label 20 · ellipsis 18 · lowercase_continuation 3 | 191 |
| `:` 6,560 | **head_explanation 5,768** · **pointer_gloss 278** · **gloss_pointer 194** · in_parentheses 174 · **strongs_list 74** · introduces_absent_list 62 · under_lead_label 7 · citation 3 | 6,314 |
| `;` 5,088 | **sense_boundary 3,955** · in_parentheses 804 · **note_follows 325** · under_lead_label 4 | 4,280 |
| `-` 3,852 | compound 3,382 · romanization 284 · bound_prefix_gloss 64 · strongs_list_marker 60 · range 30 · strongs_suffix 20 · spaced_dash 6 · bound_suffix_gloss 6 | no |
| `'` 2,128 | word_internal 1,553 · romanization 539 · word_final 30 · opening_quote 6 | no |
| `/` 633 | alternation_in_reading 354 · spelling_pair 235 · phoneme 22 · alternation_spaced 12 · per_unit 7 · url 3 | no |
| `[` `]` 356 each | government 327 · cross_reference 22 · wiki_markup 3 · supplied_word, phonetic, elision, equivalence 1 each | no |
| 16 Hebrew points, 8,268 | on a cited letter 8,222 · shown alone 46 | no |
| 41 other marks (quotes, dashes, maqaf 376, gershayim, symbols) | all inside one reading; '+' (19) is composition, not Strong's sign; 1 '@' at קשיטה is unexplained | no |

The draft divides 56,309 routes into 136,685 pieces, and 0 fail to rejoin. Each piece has a role: head, explanation, gloss, pointer (552), note (625) or strongs_list (74).

As worded, 30 of 148 shape rows do not reproduce, for example:
- argument_slot 1,911 against 2,337;
- grammar_label 323 against 436;
- before_relative 66 against 288;
- gloss_boundary 69,974 against 69,591.

With the draft's own word lists, every row and the division totals match. As worded, 12 occurrences are unexplained (9 en dashes, 2 gereshes and the '@'). The comparison with today's engine also reproduces only with the draft's lists; as worded it comes out at 112,034 / 1,508 / 3,303 / 6,681 / 32.

Falsified:
- comma.gloss_boundary: 97 commas in 19 texts. Causes include a lone "i.e." piece, coordinate adjectives (גברתן "a strong, muscular man"), and a clause about a named thing.
- semicolon.sense_boundary: 50, where a usage note follows.
- semicolon.note_follows: 16, where "; also" opens a sense.
- period.sentence_boundary: 34, at נערתו "Also, a servant.".
- colon.head_explanation: 118 where the explanation is a usage note, plus 59 inside a note.
- colon.pointer_gloss: 36 of 278, where the right side is another pointer.

### 3. stepbible_tahot_aligned_translation (M4, 95,089 routes). Recount: held

Each route is one rendering of one Hebrew word at one place, and the route equals its definition in all 95,089 rows. The route text has 0 commas, 0 parentheses and 1 semicolon.

| mark (occurrences) | shapes (count) | divides |
|---|---|---|
| `/` 64,013 | segment_boundary 63,983 · empty_segment 30 | no; segments one reading for print (`segments_on`) |
| `[` 22,719 · `]` 22,717 | supplied_words 21,430 · supplied_letters 1,268 · supplied_suffix 15 · open_continues_elsewhere 4 · close_opened_elsewhere 2 · supplied_punctuation 2 | no |
| `<` 5,943 · `>` 5,947 | hebrew_words 4,946 · hebrew_letters 884 · object_marker 113 · `>` close_opened_nowhere 4 | no |
| `-` 906 | compound 508 · word_continues_after 303 · word_continued_from_before 70 · supplied_suffix 15 · maqaf_segment 10 | no |
| `!` 560 | mark_only_segment 478 · exclamation 82 | no |
| `?` 471 | end_of_rendering 462 · before_construct_of 6 · supplied 2 · mark_only_segment 1 | no |
| `¿` 405 | interrogative_segment 405 | no |
| `.` 113 · `'` 38 · `:` 8 · `;` 1 | "obj." · possessive · the verse's colon · clause end before a supplied word (פלט, a branch) | no |

Evidence that the segments follow the Hebrew:
- 19,104 of 19,124 routes that open on "and" sit on vav keys.
- 53,554 of 53,554 slash routes have no more segments than the key has letters.

The recount reproduced every count; the corrections are wording only:
- One '?' (ידעתה) matches two tests.
- "First character of its segment" must say the first character that is not whitespace.
- angle.hebrew_words' meaning misses 395 of 4,946, mostly pronouns the verb carries and conjunctions.

### 4. macula_hebrew_cherith_surface_english_2022 (M3, 43,304 routes). Recount: held

The route equals its definition in every row. 40,992 routes carry no mark. There are 0 commas and 0 semicolons.

| mark (occurrences) | shapes (count) | divides |
|---|---|---|
| `~` 1,880 | gap_between_words 1,871 · gap_at_head 8 · gap_at_tail 1 | no |
| `’` 281 | possessive_s 229 · plural_possessive 38 · contraction_nt 14 | no |
| `-` 118 | compound_join 117 · bound_suffix 1 | no |
| `!` 27 · `?` 22 | final on the gloss | no |
| `(` `)` 13 each | supplied_inside_route 4 · strongs_number 4 · supplied_whole_route 3 · number_equation 2 | no |
| `=` 2 · `+` 2 | inside a number equation | no |
| `.` 1 | glued to the head of ".and" | no |
| `/` 1 | between_words 1 (m) (בהנות "thumbs/big toes of") | held whole; branch |

The recount reproduced every count. Wording corrections:
- 4 of the 229 "’s" are contractions of "is".
- 2 of the 38 plural possessives are singular names (משה "Moses’").
- The 668 particle figure needs its full list.

### 5. panlex_hebrew_english_meanings_20240301 (M21, 28,439 routes). Recount: held

| mark (occurrences) | shapes (count) | divides |
|---|---|---|
| `-` 585 | compound_word 568 · designation 7 · ending_prefix 6 · opening_suffix 3 · between_spaces 1 | no |
| `’` 173 · `'` 19 | inside_word 155 + 12 · clipped_front 7 + 3 · word_final 8 · opening_name 3 · pair_token 4 | no |
| `.` 97 | after_abbreviation 50 · after_one_letter 46 · domain_name 1 | no |
| `,` 19 | **single_word_list 15** (8 routes) · postposed_to 1 · coordinated_idiom 1 · proper_name 1 · shared_tail 1 | 15 |
| `/` 3 | **between_capitalized_names 1** · **between_the_phrases 2** | 3 |
| `?` 3 | in_title 1 · 2 unexplained (כישרון, יכולת "Hayward?") | no |
| `:` 2 · `!` 2 · `_` `(` `)` `#` `\|` 1 each | clock time, subtitle, click letter, title, sense tag, acronym aside, wiki-link residue | no |

The draft divides 11 routes into 29 readings; 28,428 ship whole. The recount reproduced every count, and nothing was falsified.

On today's machine:
- As written, it divides 0 routes.
- Set to ',', it would also cut the 4 comma routes the draft keeps whole.
- Set to '/', it refuses all 3 slash routes on the rejoin check.

### 6. muse_hebrew_english_ground_truth_dictionary (M6, M62; 24,514 routes). Recount: held

MUSE uses no marks: 0 in routes, definitions or keys. Every route is one lowercase word. Alternatives come as separate records: 3,554 keys carry 2 to 6 routes, 8,011 routes in all. The declaration has `marks: {}` and `separates_on: null`, and changes no card.

### 7. openscriptures_strongs (M9, 23,646 routes). Recount: did not hold

Two fields arrive as one kind of route: the KJV rendering list (7,503 records) and Strong's own sentence (7,426 records). The draft told them apart with a test on the characters (see "Why this goes to you").

| mark (occurrences) | shapes (count) | divides |
|---|---|---|
| `,` 19,894 | **rendering_separator 11,081** (list) · name_then_description 2,094 · after_label 1,657 · in_group 1,289 · gloss_then_ie 1,072 · in_aside 759 · short_series 644 · gloss_then_last_piece 490 · **between_tagged_glosses 363** (sentence) · clause 287 · gloss_then_untagged 104 · in_note 28 · gloss_then_etc 21 · attaches_syllable 5 | 11,444 |
| `.` 11,809 | **list_end 8,190** · ie 3,008 · in_note 280 · ellipsis 148 · etc 61 · abbreviation 54 · aside_sentence_end 29 · in_group 15 · sentence_end 10 · trace_end 7 · stray_for_comma 6 · stray_before_comma 1 | 8,190 |
| `(` 7,674 · `)` 7,673 | def_aside 2,974 · list_optional_words 1,827 · list_suffix_syllable 1,022 · def_label 812 · list_alternatives 531 · list_prefix_syllable 211 · def_labelled_alternative 130 · list_aside 106 · list_prefix_syllables 24 · opener_never_closed 19 · def_syllable 15 · note 3 · `)` closer_with_nothing_open 16 · partner_outside_route 2 | no |
| `;` 2,131 | **sense_separator 2,046** · def_in_aside 55 · **rendering_separator 13** · before_ie 12 · after_bare_label 3 · in_group_note 1 · in_note 1 | 2,059 |
| `-` 2,047 | suffix_syllable 1,328 · compound 397 · prefix_syllable 286 · compound_split_by_space 26 · in_note 6 · bare_in_group 2 · elided_part_of_name 2 | no |
| `×` 816 · `+` 39 | Strong's signs: whole_rendering 761 / 38 · in_group 50 / 1 · mid_rendering 5 | no |
| `'` 159 · `!` 27 · `[` `]` 25 · `?` 25 · `:` 23 · 2 points · `’` 1 · `}` 1 | possessives and quotes · exclamation gloss · bracketed notes · question gloss · verse citations · cited Hebrew · possessive · stray closer | no |

The draft divides 5,026 routes into 18,795 pieces, with 0 refusals; 272 of the pieces are notes after the list.

The recount reproduces the field split, the regions, all 18 marks and the comparison with today's engine, the last with the draft's label list. As worded, 8 occurrences fit no test, and the label list ends in "...".

Falsified:
- The field test: 7 list records read as Strong's sentence, leaving 15 separators uncut.
- period.list_end: 3 renderings after a stray full stop (מלה, גבולה, לודי).
- comma.def_between_tagged_glosses: 4 cut a name's meaning from the name (בהן, זבוד, תיריא, שכרון).
- comma.rendering_separator: 2 syllables printed as renderings, and 9 commas in 8 damaged records that cut one group apart.
- semicolon.sense_separator: 1, at מהר.
- semicolon.rendering_separator: 2 of 13, at אפרת.

### 8. ubs_sdbh_hebrew_v0_9_2 (M18, 21,626 routes). Recount: did not hold

Each route is one whole SDBH record:
- either a gloss,
- or a definition: a head, then notes opened by ◄ ► ≈, with idioms written "literally: X; hence: = Y".

Nothing separates (`separates_on: null`). 58 occurrences in 46 routes divide in meaning, and those go to the owner.

| mark (occurrences) | shapes (count) | divides |
|---|---|---|
| `;` 15,999 | before_note_marker 8,312 · before_derived_meaning 3,295 · between_note_items 2,762 · head_to_further_clause 840 · before_hedged_meaning 507 · before_definition_equals 169 · before_literal_rendering 59 · before_alternative_label 26 (m) · before_or_clause 21 · in_quote_or_italic 6 · route_final 2 | 26 (m) |
| `,` 10,405 | definition_prose 4,848 · before_conjunction 2,115 · series_item 1,759 · before_note_marker 1,253 · label_punctuation 157 · series_closed_without_comma 108 · short_route_appositive 75 · in_parentheses 47 · packed_renderings_elliptic 15 (m) · packed_renderings_complete 9 (m) · coordinate_modifiers 6 · in_quote_or_italic 5 · name_variant 4 (m) · closes_interruption 2 · before_alternative_label 2 (m) | 30 (m) |
| `:` 7,478 | before_definition_equals 3,966 · after_literally 3,404 · introduces_explanation 54 · after_hedge_or_derivation_label 35 · after_alternative_label 15 · citation_number 4 | no |
| `◄` 4,745 · `►` 4,596 · `≈` 1,415 | open a note: origin and context · role and purpose · association | no |
| `=` 4,195 | after_label_colon 3,966 · after_semicolon 169 · six small shapes 60 | no |
| `(` 2,884 · `)` 2,892 | aside_or_optional_words 1,400 · slot_placeholder 1,274 · number_or_date 84 · reference_siglum 51 · alternative_wording 35 · optional_affix 13 · scientific_name 13 · equivalence 10 · cross_reference 2 · query 1 · open_never_closed 1 · `)` with nothing open 9 | no |
| `>` 120 | literal_to_figurative 120 | no; branch |
| `!` 5 | between_interjections 2 (m) · route_final 2 · in_literal_rendering 1 | 2 (m) |
| `'` 1,830 · `-` 962 · `/` 282 · `.` 240 · `"` 155 · `\|` 136 · `*` 68 · `’` 31 · `?` 9 · `+` 6 · `׃` 4 · 11 Hebrew points 211 · 8 more marks 18 | English punctuation; the italics code `\|i…\|i*`; '+' adds an instrument or manner (not Strong's sign); sof pasuq typed for ';'; `[a]` sense references | no |

The recount reproduces the inventory, every ';' shape and the comparison with today's engine. As worded:
- 24 shape counts differ; for the dividing commas, elliptic is 26 against 15 and complete is 7 against 9.
- 15 ◄ and ► fit no shape.
- Twelve amendments the data forces fix everything except 6 commas.

Falsified: semicolon.before_alternative_label, 3 of 26 (קנה, חשש, דבר), where "; either:" after a hedge opens the first alternative.

Non-dividing meanings that fail:
- before_or_clause holds 6 unlabeled alternatives (סנה "or perhaps this is a generic word for shrub").
- 69 commas inside "literally:" pack literal renderings (פקדה "literally: office, position").

### 9. openscriptures_bdb_1906 (M5, 15,238 routes). Recount: did not hold (counts and completeness reproduce)

2,549 routes are a whole definition and 12,689 are a slice of one; 1,858 of the slices sit inside the definition's parentheses. The store already cut at BDB's spaced ' , '.

| mark (occurrences) | shapes (count) | divides |
|---|---|---|
| `-` 467 | compound_join 447 · suspended_first_part 12 · bound_second_part 8 | no |
| `,` 383 | **between_glosses 273** · **between_glosses_after_head_word 84** · in_sentence 22 · trailing 1 · no_space_after 1 · before_bound_suffix 1 · before_open_possessive 1 | 357 |
| `!` 43 · `?` 25 | final 43 · final 24 · before_second_question 1 | no |
| `’` 35 · `'` 21 | possessive 29 + 19 · aleph sign 4 · closing quote 2 · plural possessive 2 | no |
| `.` 15 | abbreviation 10 · ellipsis 3 · final 1 · mid_after_word 1 | no |
| `(` `)` 13 each | supplied_word 7 · optional_letters 5 · label 1 | no |
| `‛` 13 · `…` 4 · `&` 3 · `‘` 2 · caron 1 · `׳` 1 | ayin sign · gap in a phrase · "and" · opening quote · transliteration · divine-name abbreviation | no |
| `;` 1 | **between_senses 1** | 1 |

The draft divides 292 routes; 22 cards change. The recount reproduces every count, the completeness and the comparison with today's engine.

Falsified: comma.between_glosses, in 5 routes (6 commas) where a piece depends on a word in another piece (דרר "run vehemently, easily", חשש, לאם, יען, דרג). Also, 4 more head words fall outside the closed head list, and one piece is French (ידד "amie").

### 10. hiperbiblia_sdbh (M17, 14,823 routes). Recount: held

The definition is a list of glosses divided by '; ', and every route is exactly one item, so no route carries ';'.

| mark (occurrences) | shapes (count) | divides |
|---|---|---|
| `;` 10,457 (definitions only) | **between_gloss_items 10,456** (cut upstream) · inside_parentheses 1 | upstream |
| `(` `)` 791 each | qualifier 396 · argument_placeholder 351 · optional_part 18 · list_inside 13 · uncertainty 7 · grammatical_label 2 · equivalence_aside 1 · extension_aside 1 · opener_never_closed 2 · closer_with_nothing_open 2 | no |
| `'` 242 | possessive | no |
| `>` 193 | literal_to_extended 190 · quoted_idiom_to_meaning 2 · inside_parentheses 1 | no |
| `-` 177 | compound_word 141 · name_join 34 · optional_part 2 | no |
| `,` 72 | **complete_nominal 19** · **complete_infinitives 4** · inside_parentheses 15 · verb_head_distributed 11 (m) · copula_elliptic 10 (m) · list_with_edge_parenthesis 7 (m) · of_head_distributed 4 (m) · before_subordinate_clause 2 | 23 |
| `.` 60 | ellipsis | no |
| `?` 46 | route_final_interrogative 23 · route_final_uncertainty 12 · parenthesized_uncertainty 7 · between_uncertain_alternatives 4 (m) | 4 (m) |
| `"` 18 · `!` 16 · `=` 9 · `:` 2 · `/` 2 · `\` `[` `]` 1 each | between_exclamations 3 (m) · colon between_two_nouns 1 (m) · spaced slash 1 (m); the rest sit inside one reading | 5 (m) |

The draft separates 19 routes. The four "distributed" comma shapes keep 32 commas whole: at חלה "to be, become weak", the piece "to be" alone is not a reading. The recount reproduced every count; the corrections are wording only (argument_placeholder means "contains", and the interrogative opening words must be listed).

The order table, the totals and the row sums above were computed by /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/punct/ask-v2/ask-numbers.mjs, with output in /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/punct/ask-v2/ask-numbers.out.json and /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/punct/ask-v2/ask-numbers.closed.txt. Every other count is the pilot's or the recount's.

=====

## For the owner

We ledgered the ten largest providers, 538,743 of 654,886 routes (82.27%), and a second script recounted each draft. Five held: TAHOT, MACULA, PanLex, MUSE, HiperBiblia. Five did not (Wikisource Strong's, Kaikki, Open Scriptures Strong's, UBS, BDB): word lists and test order went unwritten, and some cuts fail on cases nobody counted.

Where today's one comma rule and a provider's own rules disagree, 28,150 fields change:

- The global rule cuts, the provider keeps whole: 16,218. UBS 11,108 (its notes and labels become pills; "man" alone prints 2,894 times), Open Scriptures Strong's 3,324, Kaikki 1,726.
- The provider cuts, the global rule keeps whole: 3,588. Kaikki 3,300 (its colon), Open Scriptures Strong's 163, Wikisource Strong's 121.
- Cut differently: 8,079. Kaikki 6,495, Open Scriptures Strong's 1,566.
- The global rule prints nothing, the provider prints whole: 265, Wikisource Strong's 229 of them.

TAHOT changes 1 field, PanLex 7, MACULA and MUSE none.

Only you can rule:

1. A head, explanation or note printed beside the renderings (Kaikki's colon, 5,768; UBS notes, 5,943 routes): a reading pill, or a note?
2. Damaged parentheses, 265 routes: print whole or withhold?
3. Glosses sharing one word ("to be, become weak": UBS 27, HiperBiblia 30, BDB 66): one pill or several?
4. Idioms "literal > meaning" (UBS 120): one reading or two?
5. Strong's "+" (4,743): "with other Hebrew words" or "supplied by the translators"? M14's license: the store says CC BY-SA 4.0; August said CC BY 4.0.