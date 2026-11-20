# RULE — the entry ledger for Classical Hebrew Words and Hebrew Wiktionary (entry ledger v1, relay v204)

20 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone. Nothing served is changed: these are lists for the serving lane.

## 1. What is asked

The serving lane's plan of 16 November 2026 AD, agreed by the owner: «Every row gets the entry it belongs to, chosen by the word as the text points it.» Part 1: «The entry ledger. Row -> entry, with its evidence, in the shape of row-entries v1.1, for the sources that carry none.» This strand answers it for two of the sources named: the Classical Hebrew Words database (M23) and Hebrew Wiktionary (its entries and its form tables). English Wiktionary is another seat's (v203).

An **entry** is what the page's gate compares with the place's entry, as the row-entries ledger writes it in a row's facts (slot 10): Strong's numbers (`n`) and BDB's own entry ids (`b`). STEP's lettered tags (`t`) are not given here: the page reads `t` only on rows of TAHOT (M4) and TBESH (M19), and BDB's entries, which STEP's letters follow, are given as `b`.

The owner's standing doctrine binds every clause: a row is judged only by its own source's marks and the other dictionaries' own marks, by category, never by reading the English and never by a row list chosen here; every case is in the ledger as a labelled branch, negatives too; nothing is guessed; sources are read byte for byte and never changed.

## 2. Which rows

Every row of the served route store (store_version 54416ff5785b) whose m_id is:

- **M23**, `index.json` `m_sources` key `classical_hebrew_words` (Classical Hebrew Words database);
- every m_id whose `m_sources` key is one of Hebrew Wiktionary's five: `hewiktionary_hebrew_exact_english_translation` (its entries, at the page title), `hewiktionary_hebrew_explicit_inflection_english_translation` and `hewiktionary_hebrew_explicit_inflection_recovery_english_translation` (its form tables, the param נטיות), `hewiktionary_hebrew_explicit_full_spelling_english_translation` (the param כתיב מלא), `hewiktionary_hebrew_explicit_heading_alternate_english_translation` (a spelling the heading gives beside its own). The builder finds these m_ids in `m_sources` and in the serving lane's `dictionary-kinds-v1.json` (family `hebrew-wiktionary`), and stops if the two disagree.

English Wiktionary's keys (`kaikki_wiktionary_hebrew`, `kaikki_english_wiktionary_hebrew_translation_table`, `dbnary_english_wiktionary_hebrew_translation_gloss`, `kaikki_wiktionary_aramaic`) are not read.

## 3. What is read

- The route store as served, `index.json` and its 256 shards, store_version 54416ff5785b. A row is `[rank, route text, definition text, m_id, year, cut, headwords, …, facts]`; its facts are slot 10 where the row has one, else none (`{}`).
- The page's row-strikes record, `reader/data/row-strikes-v1.json`, as read from fireandhail.com on 20 November 2026 AD.
- The serving lane's `dictionary-kinds-v1.json`, as read from fireandhail.com on 20 November 2026 AD (only for the m_ids of §2).
- The structured evidence catalog v86 (`structured-evidence-catalog-v86.csv.gz`).
- The sources' own files: `classical-hebrew-words.json` (the source's records, as scraped on 12 July 2026 AD) and Hebrew Wiktionary's dump `hewiktionary-latest-pages-articles.xml` (as taken on 12 July 2026 AD).
- The Bible dictionaries joined to (§6): Open Scriptures' `LexicalIndex.xml` and `HebrewStrong.xml`.
- The row entries ledger v1.2 (`row-entries-v1.2.jsonl`), for one check only (§10, check 3).
- The declared part-of-speech tables, `pos-tables-v1.json`, beside this file and part of this rule (§5).

Each is named in the receipt by its bytes and sha256.

## 4. The road from a row to its source's entries

A row's **cell** is the catalog rows whose `k_normalized_key`, trimmed, is the row's key, and whose `m_source_label` is `index.json`'s label for the row's m_id. (Several m_ids share one label; the cell is the label's.) As in row entries v1 and v1.2:

1. **By the text**: the rows of the cell whose `r_route_text` is the row's route text byte for byte.
2. **By the definition**: where step 1 finds none, the rows of the cell whose `d_exact_text` is the row's definition text byte for byte.
3. **By the record of strikes**: where steps 1 and 2 find none, the actions of the record that made this row (an action whose `to_key` and `to_rank`, or else `key` and `rank`, and `m` are the row's). A `retext` whose key is the row's and whose `to_text` is the row's text names the words the row had (`route`): steps 1 and 2 are made again in the row's own cell with those words. A re-key's `key` and a restore's `restored_from.key` name the key the row stood under: steps 1 and 2 are made again in that key's cell.
4. Otherwise the row is **unreached**.

A catalog row's citation is its `cit_local_pointer` up to the first `|`. It names the row's **source entry**:

- **M23**: `classical-hebrew-words.json#record:<n>`. The source entry is the record whose `id` is n, written `record:<n>` (as row entries v1.2 writes it).
- **Hebrew Wiktionary**: `hewiktionary-latest-pages-articles.xml#page:<p>#revision:<v>…`, and the translation line, `#translation-line:<l>` or `#wikitext-line:<l>`. The dump's page whose `<id>` is p must be of `<ns>` 0 and its revision's `<id>` must be v. Its wikitext is the text of `<text>`, the XML entities read as the characters they name, cut at each line feed into lines numbered from 1. A **level-2 heading** is a line that begins with exactly two `=` followed by a character other than `=`, and ends with `==` and any white space. The source entry is the **section** holding line l: from the last level-2 heading at or before line l to the line before the next level-2 heading, or the page's end. It is written `page:<p>#section:<heading line>`. A line before any level-2 heading has no section.

A row's source entries are those of all its catalog rows, distinct, in the order first met (catalog rows in catalog order).

## 5. The source's own marks, and the part-of-speech tables

### Classical Hebrew Words (a record)

- the **headword**: `unicode`, the source's pointed form;
- its **part of speech**: `part_of_speech`;
- its **homograph numeral**: `hebrew_number` (shown, never compared: no dictionary here says its numerals follow another's);
- its **count in the Hebrew Bible**: `hebrew_bible_count`, digits.

No served row's record holds a Strong's or BDB number (no gloss names one), so no number is read from this source. No served row reaches a record whose `unicode` is empty; the source's Hebrew written in its keyboard font (`lemma`, `keystrokes`, and the runs between `$$` in a few glosses) is not read, and no mapping of that font is made. A record with an empty `unicode` would be NO_ENTRY_NO_POINTED_HEADWORD.

### Hebrew Wiktionary (a section)

- its **spellings**, from the heading line's text between its `==` marks, read in this order: every template `{{…}}` is taken out (the innermost first, again until none is left); a link `[[A|B]]` is read as B and `[[A]]` as A; every HTML tag `<…>` is taken out; `'''` and `''` are taken out; each round-bracketed part `(…)` is taken out, and where its text, trimmed, begins with `גם`, `וגם` or `או` (with or without a colon after it), the rest of it, cut at each `,` and each ` או `, gives **alternate spellings** (each trimmed, empty ones dropped); each square-bracketed part `[…]` is taken out; what is left, trimmed, is the **main spelling**. The spellings are the main spelling and the alternates, distinct, in that order. The heading's homograph mark `{{משני|X}}` is shown, never compared.
- its **grammar template**: the first template in the section whose name (the text after `{{` up to the first `|` or `}}`, trimmed) is `ניתוח דקדוקי`, `ניתוח דקדוקי מקוצר`, `ניתוח דקדוקי לפועל` or `ניתוח דקדוקי לשורש`. Its params are its text cut at each `|` that stands outside any inner `{{…}}` or `[[…]]`; a named param is one holding `=`, its name the text before the first `=`, trimmed, its value the rest, trimmed.
- its **part of speech**: the value of the param named `חלק דיבר`; and the template's own name.
- its **root**: in the value of the param named `שורש` or `שורש וגזרה`, the first template named `שרש3`, `שרש4` or `שרש`. As the templates' own documentation says (they link to the root's page, `<letters>[ <mark>] (שורש)`): `שרש3`'s first three unnamed params are the letters and its fourth, where there is one, the mark of a second root of those letters; `שרש4`'s first four are the letters and its fifth the mark; `שרש`'s first param is the root's page name, the letters before its first space and the mark after it. The **root** is the letters with the mark, as the page name writes them.
- the **numbers it names**: every template `{{מקור/לקסיקון BDB|…}}` in the section. The template's own documentation: its first param is the caption, the entry's name; its second (and third and fourth) is «the entry number according to Strong's concordance». A number is an unnamed param after the first that is digits only, trimmed. The template names numbers **for this section's word** when its caption, with any round-bracketed part taken out, has the same letters (U+05D0 to U+05EA, every other character dropped) as one of the section's spellings. Otherwise it names them for another word (an etymon, a root); they are shown and not read as this word's.

Links to an outside lexicon page by a Strong's number (`strongs=H…` in a URL) name no word, so they are shown and not read as this word's.

### The part-of-speech classes (`pos-tables-v1.json`)

The tables read each dictionary's own values as one or more of these classes: VERB, NOUN, ADJ, NAME, GENTILIC, NUMBER, PARTICLE (adverbs, prepositions, conjunctions, particles, interjections, pronouns, demonstratives, the article), LETTER, ABBREVIATION, AFFIX, ROOT, PHRASE. The classes are kept coarse on purpose: they part words of different kinds that share a spelling (a noun from a verb, a name from a noun); they do not referee the finer grammar on which the dictionaries differ.

- **Open Scriptures' lexical index**, its `<pos>`: N NOUN; Np NAME; Ng and Ag GENTILIC; A and Ao ADJ; V VERB; D, R, C, `C?`, `R C`, P, Pp, Pd, Pi, Pf, Pr, T, Tj, Tm, Ti, To, Td PARTICLE. An entry with no `<pos>` has no class. Any other value stops the build.
- **Classical Hebrew Words**, its `part_of_speech`: all 145 values the source writes, each listed in the table file with its class (for example `vb.`, `vb. denom.`, `VB.` VERB; `n.m.`, `n.[m.]`, `nf`, `n[m]pl` NOUN; `pr.n.m.`, `prnm`, `pl.n.`, `pln` NAME; `gent.` GENTILIC; `adj.` ADJ; `adv.`, `prep.`, `conj.`, `pron.`, `interj.`, `part.`, `article` PARTICLE; `nm, adj` NOUN and ADJ; `nm&pln` NOUN and NAME; `letter` LETTER; `abbrev.` ABBREVIATION). Five values give no class: the empty value, `?`, `DJ,`, `ref.`, `unkn.`. A value not in the table stops the build.
- **Hebrew Wiktionary**, its `חלק דיבר`: its values are many and loosely written, so they are read by phrases. The value is read thus: templates taken out (innermost first); links read as their last part; HTML tags read as a space; the maqaf (U+05BE) and `-` read as a space; the points and accents (U+0591 to U+05C7, but not the maqaf) taken out; white space read as one space. Then these phrases are sought in this order, each one found giving its class and being taken out before the next is sought: PARTICLE `תואר הפועל`, `תואר הפעל`, `תאר הפועל`, `תאר הפעל`, `תאור הפועל`; VERB `שם הפועל`, `שם פועל`; NAME `שם עצם פרטי`, `שם פרטי`, `פרטי`; NOUN `שם פעולה`, `פעולה`, `עצם`; ADJ `תואר השם`, `תואר`, `תאר`; VERB `פועל`; NUMBER `מספר`, `כמת`; PARTICLE `מילת`, `מלת`, `מילית`, `מלית`, `כינוי`, `גוף`; AFFIX `תחילית`, `סופית`, `סיומת`; PHRASE `צירוף`, `צרף`, `ביטוי`. The template's own name adds a class: `ניתוח דקדוקי לפועל` (a verb's template) VERB; `ניתוח דקדוקי לשורש` (a root's) ROOT. A section with no grammar template, or whose value gives no class, has no class. Every value met is written, with its count and classes, in `pos-values-v1.json`.

**Agreement.** A source's classes agree with a target entry's class when one of them is that class; NUMBER also agrees with NOUN and ADJ (the lexical index marks numerals N, as שָׁלֹשׁ, or A, as אֶחָד). A source entry with no class does not part the candidates: every candidate its headword meets stands. A target entry with no class agrees with no source class.

## 6. The Bible dictionaries joined to, and why

The target is **Open Scriptures' lexical index** (`LexicalIndex.xml`), its Hebrew part (`<part xml:lang="heb">`). Its own readme calls it «the meeting place of BDB, Strong and the TWOT numbers». Every entry carries its own pointed headword (`<w>`), its own part of speech (`<pos>`), and its own cross-reference (`<xref>`) with BDB's entry id (`bdb`) and, for most, Strong's number (`strong`). So one entry gives both `b` and `n`, by the provider's own bridge, the same bridge row entries v1 read for BDB via Open Scriptures (M5) and the lexical index (M33). It holds 10,221 entries against Strong's 8,674, so BDB's homographs stand apart in it. Its Aramaic part is not joined: both sources here are dictionaries of Hebrew.

An entry of the lexical index is **met** by a source's headword in two ways, both by the dictionaries' own pointed headwords:

- **by the index's own headword**: the entry's `<w>`;
- **by Strong's own headword**: an entry of `HebrewStrong.xml` (its first `<w>`, whose `xml:lang` is not `arc`) whose headword meets the source's; the entries of the index's Hebrew part whose `strong` is that entry's number.

A number is `H` and the digits of `strong` with their leading zeros taken off; a `strong` of letters only (a prefix's code: `b`, `c`, `d`, `i`, `k`, `l`, `m`, `s`) is not a number (as row entries v1, "Numbers").

TBESH is not joined: its extended numbers follow BDB's entries by Open Scriptures' own mapping (its header says so), which the index already gives as `b`. BDB's own file (`BrownDriverBriggs.xml`) is not joined: the index carries its ids and headwords.

## 7. Keys: how a pointed headword is compared

Every normalisation is here; nothing else is done to a headword.

The **pointed key** of a headword:

1. Read it in Unicode canonical decomposition (NFD). This takes apart the presentation forms (U+FB2A, U+FB2B and the others, as Classical Hebrew Words writes shin and sin) into the letter and its dot, and sorts the marks under each letter in canonical order.
2. Take out the accents and the marks that are not points: U+0591 to U+05AF (the accents, among them the ole U+05AB the index writes for stress), U+05BD (meteg), U+05BF (rafe), U+05C0 (paseq), U+05C3 (sof pasuq), U+05C4 and U+05C5 (upper and lower dot), U+05C6 (nun hafukha), U+034F (combining grapheme joiner) and U+200B to U+200F (zero-width and direction marks).
3. Read U+05C7 (qamats qatan) as U+05B8 (qamats), and U+05BA (holam haser for vav) as U+05B9 (holam): each is one written sign that some sources mark apart.
4. A **letter** is U+05D0 to U+05EA; a **mark** is U+05B0 to U+05BC (the vowel points and the dagesh) and U+05C1, U+05C2 (the shin and sin dots). The marks that follow a letter, up to the next character that is not a mark, are that letter's; a mark that stands twice under one letter is read once. (Classical Hebrew Words writes a furtive patah as a patah under the last letter, then a paseq, then a second patah, as אָרִיחַ׀ַ; its own `keystrokes` field writes one patah there. Steps 2 and 4 read it as אָרִיחַ. The receipt counts every headword these steps change.)
5. Read it in NFD again, so the marks under each letter stand in canonical order.
6. Read each run of white space as one space, and trim both ends.

Final letters are kept as written. The maqaf (U+05BE) and every other character are kept as written.

A headword is **pointed** when its pointed key holds a vowel point or the dagesh (U+05B0 to U+05BC). Otherwise it is **written in letters only** (Classical Hebrew Words writes its verbs so, by their root letters with the shin and sin dots, as קדשׁ). Its **letters key** is its pointed key with only the letters, the shin and sin dots, the maqaf and the spaces kept.

**Meeting.** A pointed headword meets a target headword when their pointed keys are the same, letter by letter with each letter's marks, with one allowance: a shin (U+05E9) the source writes with no dot meets a shin with either dot. A headword written in letters only meets a target headword when their letters keys are the same, with the same allowance. A root (§5) is compared as a headword written in letters only.

## 8. The judgement of a source entry

In this order, the first that holds:

1. **No section** (Hebrew Wiktionary): the cited line stands before any level-2 heading. NO_ENTRY_NO_SECTION.
2. **No pointed headword** (Classical Hebrew Words): `unicode` is empty. NO_ENTRY_NO_POINTED_HEADWORD.
3. **A number the source names** (Hebrew Wiktionary): the section names numbers for its own word (§5). NUMBER_THE_SOURCE_NAMES. Its branches are, number by number in the source's order, the lexical index's entries (any part) whose `strong` is that number, or, where the index has none, the number alone. It beats any join; the join of step 5 is made all the same and shown beside (`join_gives`), and the receipt counts where the two differ.
4. **Outside the Hebrew Bible by the source's own count** (Classical Hebrew Words): `hebrew_bible_count` is 0. The source counts this word nowhere in the Hebrew Bible, so no Bible dictionary's entry is it. NO_ENTRY_OUTSIDE_THE_HEBREW_BIBLE. The join is shown beside (`join_would_give`).
5. **The join.** The **met** entries: the lexical index's Hebrew entries that the source's headword (for Hebrew Wiktionary, any of the section's spellings) meets, by either way of §6, in the index's order. The **candidates**: the met entries whose class agrees with the source entry's classes (§5).
   - No candidate, no met entry: NO_ENTRY_HEADWORD_NOT_IN_THE_DICTIONARIES.
   - No candidate, some met entry: NO_ENTRY_PART_OF_SPEECH_DIFFERS. The met entries are shown with their classes.
   - Candidates: each is a branch. Then the source's own words of the same spelling and kind are counted (S, below). Where S is more than the number of candidates, the source parts this spelling into more words than the dictionary does, so this word may be one the dictionary does not list: a branch NONE_SOURCE_HOLDS_MORE_WORDS is added. The entry is ONE_ENTRY (one candidate, no such branch), SEVERAL_ENTRIES (two or more, no such branch) or ENTRY_OR_NONE (with it).
6. **The root road** (Hebrew Wiktionary only), where step 5 found no candidate and the section's classes are exactly VERB and it has a root: the lexical index's Hebrew entries of class VERB whose headword (by either way of §6) meets the root's letters, compared as letters only (§7). A verb of Hebrew Wiktionary is headed by its own stem's form (פִּעֵל, הִפְעִיל and the others), while the index heads a verb by its root's form; the root is the source's own mark that ties them. Where it finds candidates, they are judged as in step 5, with S counted by roots (below), and the entry's road is `root`. Where it finds none, step 5's class stands.

**S, the source's own words of the same spelling and kind.**
- Classical Hebrew Words: the records with a `hebrew_bible_count` above 0 and a non-empty `unicode` whose key (of the same kind, pointed or letters only) is the same, byte for byte, as this record's, and whose classes meet this record's (they share a class, or either has none). The record counts itself.
- Hebrew Wiktionary: the sections of the dump's pages of `<ns>` 0 one of whose spellings has a key (of the same kind) that is the same, byte for byte, as one of this section's spellings' keys by which a candidate was met, and whose classes meet this section's. The section counts itself.
- The root road: the distinct roots (letters with mark, §5) of the sections whose classes are exactly VERB and whose root letters, without their shin and sin dots, are this root's letters without them.

What parts the branches is shown with them: each candidate's own headword, part of speech, class, Strong's number and BDB id, and the way it was met.

## 9. The row, the ledger and the lists

**A row's branches** are the branches of all its source entries: entries distinct (by the index's entry id, or the bare number), in the order first met, then the NONE branches, distinct, each named by its why (SOURCE_HOLDS_MORE_WORDS, OUTSIDE_THE_HEBREW_BIBLE, HEADWORD_NOT_IN_THE_DICTIONARIES, PART_OF_SPEECH_DIFFERS, NO_POINTED_HEADWORD, NO_SECTION, UNREACHED). An unreached row has the one branch NONE UNREACHED.

**A row's class:**
- no NONE branch, and every source entry is NUMBER_THE_SOURCE_NAMES: NUMBER_THE_SOURCE_NAMES;
- no NONE branch otherwise: ONE_ENTRY (one entry branch) or SEVERAL_ENTRIES (two or more);
- NONE branches beside entry branches: ENTRY_OR_NONE (held);
- NONE branches only: NO_ENTRY_<why> where they all name one why, else NO_ENTRY_MIXED.

**Its facts** (what the page would land in slot 10): for NUMBER_THE_SOURCE_NAMES, ONE_ENTRY and SEVERAL_ENTRIES, `n` the distinct numbers of its entry branches in ascending order of the digits, and `b` the distinct BDB ids of its entry branches in the order of the branches, each only where it holds any. For ENTRY_OR_NONE and every NO_ENTRY class, none: the row is held, or there is nothing to land.

**The ledger, `entry-ledger-v1.jsonl`**, in row entries v1.1's line shape: one line per key of the store that holds a row of §2, `{"k": K, "rows": [...]}`, in the store's order (shards `00` to `ff`, keys in each shard's order), each row of §2 under that key in the key's order, as an array:

1. `rank`, as the store holds it;
2. `m`, its m_id;
3. the first 16 hex of the sha256 of its route text's UTF-8 bytes;
4. its road: `text`, `definition`, `strikes` or `unreached`;
5. its source entries (§4);
6. its numbers: the distinct numbers of its entry branches, ascending (for a held row too: these are the numbers its branches name, not facts);
7. `{"class", "branches", "facts"}`: its class, its branches (an entry branch `{"e": <index entry id or number>, "n": <number or null>, "b": <BDB id or null>}`; a NONE branch `{"none": <why>}`), its facts or null.

A row is told apart by its rank, its m_id and the hash together.

**The source entries, `source-entries-v1.jsonl`**: one line per source entry reached by a row, Classical Hebrew Words' records first by id, then Hebrew Wiktionary's sections by page and heading line: its id; its marks as the source writes them (§5) with each field named; its spellings with their keys and kinds; its classes; its road (`numbers`, `pointed`, `letters`, `root` or none); the met entries, each with the index's id, headword, `<pos>`, class, number, BDB id, the ways it was met and whether its class agrees; S; its class and branches; `join_gives` or `join_would_give` where §8 says so; the numbers named for other words and the Strong's links, shown.

**The facts list, `facts-slot-v1.tsv`**, in the shape of v190's and v197's: every served row of §2 whose `n` or `b` under this ledger differ from its slot 10 as served now. Columns: key, rank, m_id, route text, the facts now, the facts under this ledger (the facts now with `n` and `b` set from the ledger; every other fact as it is), what changes, the class. Only rows of the three classes with facts can be on it.

**The held list, `facts-slot-held-v1.tsv`**: every row of class ENTRY_OR_NONE, in the same columns, with the facts it would carry if its entry branches stood, and the whys of its NONE branches. Every line is marked **held**. It changes nothing.

**`pos-values-v1.json`**: every part-of-speech value met (Classical Hebrew Words' records, Hebrew Wiktionary's sections, the index's entries), with its count and its classes.

**`receipt-v1.json`**: the inputs by bytes and sha256; per m_id, the rows, roads and classes; per source, the source entries by class and road; the counts of every clause of §7 that changed a headword; the named numbers read, and where they and the join differ; the checks.

## 10. The checks (each one stops the build)

1. The store is store_version 54416ff5785b. The m_ids of §2 are those `m_sources` and `dictionary-kinds-v1.json` give, and none is English Wiktionary's.
2. Every served row of §2 has its line and every line its row.
3. Every M23 row's road and source entries are what row entries v1.2 gives for it (the same key, rank, m_id and hash, the same road, the same entries), and every M23 row of v1.2 is met.
4. Every citation reached is read: the record exists; the page exists in the dump, of `<ns>` 0, at the cited revision; the cited line exists in the page.
5. Every part-of-speech value of Classical Hebrew Words and of the lexical index is in the tables.
6. The classes add up to the rows, per m_id.
7. Every row of the facts list and the held list is found in the store at its key and rank with its m_id and its text's hash.
8. No file written holds a path of this machine or the home folder's name.
9. The second count agrees.
10. Two runs give the same bytes.

## 11. The second road

A separate script, `verify-entry-ledger-v1.mjs`, not importing the builder. It reads the store, the record of strikes, the catalog, the sources' files and the two dictionaries by its own readers. It finds each Hebrew Wiktionary section by its own scan of the page, and holds its heading against the source's derived file the catalog cites beside the dump (the second part of `cit_local_pointer`, `…routes-v1.csv.gz#line:<n>` or `…rows-v1.csv.gz#line:<n>`, its column `entry_heading`): the two must be the same text, trimmed. It writes the keys by its own code, joins by sorting both sides and walking them (not by a lookup table), reads Hebrew Wiktionary's parts of speech by its own reading of the phrases, counts S by its own grouping, and makes every row's line, every source entry's class and branches, the facts list and the held list again. It writes `verify-receipt-v1.json` with `agree: true` only when every line, list and count is the builder's; otherwise it exits non-zero.

## 12. Not here

The store is not changed. The gate is not applied. Rows of other sources, other facts (`name`, `opens`, `collocations`, `picked_at`) and the other ledgers are not touched. Jastrow and the dictionaries beside the store are not read.

## Amended

**Amended before the builder was written, 20 November 2026 AD.** A trial of §11's heading check against the derived files found three things the clause did not say. (1) The derived file's `#line:<n>` counts its data rows, not its lines: row n is the n-th record after the header. (2) The derived file writes the heading without the direction marks U+200E and U+200F and with each run of white space read as one space (41 of the catalog rows reached differ from the dump's heading only so, as בֶ‏ּנְטוֹ‏ against בֶּנְטוֹ). (3) Where the cited line stands before any level-2 heading (13 catalog rows, on pages whose only heading is written `===` or has none), the derived file writes the page's title. So the check compares the two after taking U+200E and U+200F out of both and reading white space as one space, trimmed; and for a line before any level-2 heading it holds that the derived file writes the page's `<title>`. The builder's reading (§4, §5) is not changed by this: the section and its heading are read from the dump, and a line before any level-2 heading is NO_ENTRY_NO_SECTION.

**Amended after the first runs, before any ship, 20 November 2026 AD.** Each of these was found by reading the first runs' lines against the sources, and each was made in the builder and the second count alike. (1) §8, S for the root road: distinct roots are told apart by their letters **without the shin and sin dots** and their mark. Hebrew Wiktionary's root templates write one root's shin with its dot and without it (as `{{שרש3|ח|ב|שׁ}}` beside `{{שרש3|ח|ב|ש}}`), so the dot does not tell two of its roots apart; the root's own mark (`שרש3`'s fourth param, `שרש4`'s fifth, the text after the space in `שרש`'s first) does. The first run counted the root as written, and so held sections whose one root is written two ways (as חִבֵּשׁ). (2) Four readings the first run made, written here so a second count makes them too; none changes a line: a section's part of speech is the **first** param named `חלק דיבר`, and its root is read from the **first** param named `שורש` or `שורש וגזרה`; the caption of `{{מקור/לקסיקון BDB|…}}` is its first unnamed param (what the template itself reads as `{{{1}}}`), and its numbers are the unnamed params after it; a source entry with no section is written `page:<p>#no-section`; a source entry's road is `numbers`, `pointed`, `letters`, `pointed and letters` (a section whose candidates were met by spellings of both kinds) or `root`, and none where it has no entry branch. (3) §7, the letters key: it is the pointed key with the vowel points and the dagesh (U+05B0 to U+05BC) taken out, and every other character standing as written (the letters, the shin and sin dots, the maqaf, the spaces, and the gershayim, geresh and other marks of the source). The first run kept only the letters, the dots, the maqaf and the spaces, and so read Hebrew Wiktionary's abbreviation ער"ן (its own gershayim marks it so) as the letters ערן and met the name עֵרָן (H6197). An abbreviation's own mark now stays in its key, and it meets no word. No headword of Classical Hebrew Words written in letters only that a served row reaches holds such a mark. (4) §5, the root: it is read from the root's page name as the template builds it (`שרש3`: its first three unnamed params joined, then a space and the fourth where the fourth is not empty; `שרש4`: the first four, then the fifth; `שרש`: its first param), trimmed; the **letters** are that name up to its first white space and the **mark** is the rest, trimmed. The first run took `שרש3`'s first three params as the letters, so where the source writes the mark inside the third param (`{{שרש3|ס|ג|ל א}}`, which links to the root page סגל א all the same) it read the letters as «סגל א» and they met no verb. 62 sections the rows reach write the mark so, 21 of them verbs' sections, where the root road reads it; the receipt counts them (`roots_read`). Reading them so also tells their roots' marks apart in S, so S changes for 7 other sections whose roots share those letters. (5) §6, the way by Strong's own headword: a Strong's entry whose headword meets the source's reaches the index's entries of its number **only where the index's own headword met no entry of that number** (over all of the source entry's spellings, or the root); an entry the index's own headword met is marked as met both ways. Where the index's own headword has met an entry of a number, the index has itself said which of its entries of that number bears this spelling: BDB parts what Strong lumps under one number, so the first runs brought in, through Strong's אַתָּה (H859), the index's אַתְּ, אַתֶּם, אַתֵּן and אתִּי beside its own אַתָּה, and through Strong's אִם (H518) the index's כִּי אם־. A number the index's own headword did not meet is still reached through Strong's headword, as Strong's שְׂחוֹק (H7814) reaches the index's שְׂחֹק, and Strong's אוֹן (H204, the city On) reaches the index's אֹן beside the index's own אוֹן (H203). The receipt counts the source entries where a hit was set aside so.
