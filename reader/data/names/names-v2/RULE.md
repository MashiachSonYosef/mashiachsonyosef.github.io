# RULE — names v2: every served dictionary that marks a name in its own data, read by its own mark

20 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone.

## What is asked

The page's names gate (ruling 8, relay v177) withholds, at a word that is not a name, every row its own dictionary marks as a name. Names v1 read the marks of six dictionaries. The page lane asked (letter of 15 November, ask 2) that the marks be read where the gate has not read them: Strong's, BDB, the Lexical Index, Hebrew Wiktionary and OmegaWiki; and (addendum, ask 9) that the rows landed by v188, which carry no facts, be judged too.

The owner's rule stands (14 and 15 November): a row is set apart only on what its own source says of it. Never on the lane's reading of the English. Never by a class list the lane chose. Never row by row. Removing is no taboo, but only on the source's own statement. The page lane took these recommendations, and they stand: a people's name (a gentilic: Israelite, Kenite) is counted apart from names, as STEP files them; a reading that gives a name's meaning, where its own dictionary marks the entry a name (BDB's «gaze», marked n.pr.m), is a name, as its source marks it; the gate the other way (at a name, holding back rows their own source marks as common words) waits until the page measures its reach, so those rows are sent as data; and only the source's own mark makes a reading a name.

## Which words are names (unchanged)

Names v1's place list stands as it is: `names-v1/place-names-v1.jsonl`, a place is a name where TAHOT or MACULA calls it one. v2 does not rebuild it.

## Which rows are read

Every row of the page's store as served now (store_version 54416ff5785b, `index.json` and its 256 shards). A row is `[rank, route text, definition text, m_id, year, cut, headwords, ., ., closes, facts]` under its key. A row's source is `index.json.m_sources[m_id]`: its `key` (the source key) and its `label`.

A source is **read** when its own data carries a mark that tells a name from other words. Each read source, its mark and how it is read, is below. Every other source is **not read**, and is named in the receipt with its rows. Their rows stand both ways: they are in none of the lists.

## How a row reaches its source's entries (the road of names v1, widened to the record of strikes)

A catalog row is a row of `structured-evidence-catalog-v86.csv.gz`. Its **cell** is its `k_normalized_key` with edge spaces taken off, and its `m_source_label`. A store row's cell is its key and its source's label.

1. **Route text.** The catalog rows in the store row's cell whose `r_route_text` is the row's route text, byte for byte.
2. **Definition text.** If road 1 finds none: the catalog rows in the cell whose `d_exact_text` is the row's definition text, byte for byte.
3. **The record of strikes.** If road 2 finds none: the row's earlier forms, read from the page's record of strikes (`row-strikes-v1.json`, the copy served beside store 54416ff5785b). An action's **result** is the row it leaves: key `to_key` if it has one, else `key`; rank `to_rank` if it has one, else the rank of `land` if it has one, else `rank`; its m_id `m`. A strike or a withhold leaves no row, and neither does a re-key folded into other rows (`folded_into`). An action whose result is the store row's key, rank and m_id gives the row an **earlier form**: the action's `key` with the words `route` and the definition `row[2]`; a restore gives a second, its `restored_from.key` with the same words; a rejoin (whose result is its `key`, the rank of its first joined row, its `m`) gives one per joined row: `key` with that row's words and definition. An earlier form is itself followed back the same way (its key, the action's `rank`, `m`), until no new form comes. The catalog rows reached are those in each earlier form's cell whose `r_route_text` is that form's words; if none at all, those whose `d_exact_text` is that form's definition.
4. If no road reaches a catalog row, the row is **not reached**. It is listed (below), never guessed.

A reached catalog row is read only through its own source key (`m_source_key`) and its citation (`cit_local_pointer`, all of it, every part between its `|`).

## Each read source: its mark, and how it is read

Each reached catalog row gets the **kinds** its source's mark says, out of: **name**, **people** (a people's name, a gentilic), **word** (a common word: the source gives a part of speech that is not a name or a people), **title** (TBESH's own class), **pn** (Strong's second mark, below), **other** (a mark the source writes that this rule does not read as one of these), and **none** (the source gives the entry no mark). A mark made of several parts gives the kinds of its parts. Where a source's documentation is in the source cache it is quoted; where it is not, that is said, and the mark is read as the source writes it.

**Strong's, the Open Scriptures edition (M9, `openscriptures_strongs`).** The citation names `HebrewStrong.xml#entry:<id>`. The entry's first `<w>` carries `pos` and `xml:lang`. The edition's readme (in the cache) names the files and says the lexicon's documentation is `HebrewLexicon.pdf` and its schema `StrongSchema.xsd`; neither is in the cache, and fetching them waits on the owner's word. So the marks are read as the file writes them. `pos` is parted at spaces. A part that begins `n-pr` (the file's form for a proper name, on 2,423 entries) is a **name**; a part that holds `gent` (`a-gent`) is a **people**; the part `np` (three entries) is **other**, a form the file does not use elsewhere; every other part is a **word**. The second mark, `xml:lang="x-pn"` on the entry's `<w>` where the other entries write `heb` or `arc`: its meaning is not stated in the files at hand. On an entry with a name part it adds nothing. On an entry with no name part and no people part it is read as its own kind, **pn**, and the entry's word parts are not counted (so «Adar», «Perizzite», «Agagite» are neither names nor common words here: they are listed apart, under their mark).

**Strong's, the Wikisource transcription (M14, `wikisource_strongs_explicit_forms`).** Its own text carries no part of speech. Its title page names the work as Strong's (James Strong, «מילון הקונקורדנציה של סטרונג»), and it files each rendering under Strong's own number (`==N==`). The citation names that number: `#strong:H<number><letter?>`. **The citation's number decides**, not the row's facts: it is where the source itself files that rendering, and the facts slot `n` is the lane's gathering of the same citations. The number's mark is Strong's own, read in the edition that writes it down (M9's `HebrewStrong.xml`, `entry id` equal to the number), by the clause above. A number with no entry there is **none**. The receipt counts the rows whose citations' numbers are not their facts `n`.

**BDB, the Open Scriptures edition (M5, `openscriptures_bdb_1906`).** An entry may carry several `<pos>`; the catalog row's `part_of_speech` is the one that stands over the row's part of the entry, copied from the file, and it is read. The source's list of its abbreviations is not in the cache. With spaces taken out: empty is **none**; holding `gent` is **people** (`adj.gent`, `n.gent`, `n.pr.gent`: BDB writes a people's name as a kind of proper name); else beginning `n.pr` or `n.[pr` is a **name**; else a **word**. (`pr.1pl`, `demonstr.pr.m` are BDB's pronouns: they do not begin `n.pr`.)

**BDB, the unabridged edition (M46, `unabridged_bdb_1906`).** The file writes the part of speech in words, in bold, after each head word («proper name, masculine», «adjective, of a people»). The catalog row's `part_of_speech` is the bold words over the row's point, and it is read. Empty is **none**; holding `people` is **people** (its words for BDB's gentilic, «of a people»); else beginning `proper name` is a **name**; else a **word**.

**The Lexical Index (M33, `openscriptures_lexical_index`).** The citation names `LexicalIndex.xml#entry:<id>`; the entry's `<pos>` is read, parted at spaces. Its codes are Open Scriptures' own letters (the same family TAHOT names, below); the code list is not in the cache. `Np` is a **name**; `Ng` and `Ag` are **people** (the code list's `g`, gentilic); any other code is a **word**; no `<pos>` is **none**.

**TAHOT (M4, `stepbible_tahot_aligned_translation`).** The citation names a TAHOT file, `#line:<n>` and, mostly, `#span:<a>-<b>`. The line's grammar column (its sixth) has a single `H` or `A` at its head taken off and is parted at `/`, each part taken up to its first backslash; the parts from `a` to `b` (counted from 0) are the row's, all of them where there is no span. TAHOT's head: «Morphology codes follow the form defined by OpenScriptures at http://openscriptures.github.io/morphhb/parsing/HebrewMorphologyCodes.html#vt with some adaptations». A part beginning `Np` is a **name**; beginning `Ng` or `Ag` a **people**; any other part a **word**. A line with no grammar is **none**.

**MACULA (M3, `macula_hebrew_cherith_surface_english_2022`).** The citation names `macula-hebrew.tsv#line:<n>#xml-id:<id>` and `#last-line:<m>`: the first and the last of the words the route stands on. Both words are read from their lines (the first must carry the cited id). A word whose `class` is `noun` and whose `type` is `proper` is a **name** (as names v1 reads places); `type` `gentilic` a **people**; `type` `proper` with another class **other**; else a **word**. The README in the cache names no values of these columns.

**TBESH (M19, `stepbible_tbesh_gloss`).** The citation names the TBESH file and `#line:<n>`; the line's Morph column (its sixth) is read. Its head: «Language is A=Aramaic, H=Hebrew, G=Greek and n+Name (which is not language specific)» and «Extra for Names is L=Location, P=Person, LG/PG=Gentilic, T=Title (i.e. any other capitalised nouns such as titles, months, gods, planets etc)». The column is parted at `/`, each part trimmed. A part beginning `N:` is a name entry; its extra is the text after its last `-`: `P` or `L` is a **name**, `PG` or `LG` a **people**, `T` a **title**, any other (`TG`, which the head does not define) **other**. A part beginning `H:` or `A:` is a **word**. Empty is **none**.

**UHAL (M7, `unfoldingword_uhal`).** The citation names `content/H<nnnn>.md`; the value under the file's `* Part of Speech:` is read (on the same line, else the first line after it with text, before the next `*` or `#` line). Its README and project notes in the cache do not define the values. A value beginning `Noun Proper` is a **name**. A value holding `Proper` otherwise (`Demonstrative Proper Common`, `Proper 1st Person Plural`) is **other**. `Undefined` or empty is **none**. Any other value is a **word**. UHAL's word `Genitive` is not read as a people: the source does not say so.

**BiblicalTools' Living Lexicon (M45, `biblicaltools_living_lexicon`).** The citation names `#lexicon-index:<i>#id:<id>`; the record at that index of `lexicon` (with that `id`) is read, its `pos`. `Proper Noun` is a **name**; empty **none**; else a **word**.

**DBnary (M37, `dbnary_english_wiktionary_hebrew_translation_gloss`).** The citation names the translation's own DBnary subject (`#subject:<url-encoded>`); DBnary's id carries the English Wiktionary section it stands in, between the last two `__` before its closing number (`__tr_heb_1_Eos__Proper_noun__1`). `Proper_noun` is a **name**; any other a **word**; none found **none**.

**English Wiktionary's translation tables, via Kaikki (M34, `kaikki_english_wiktionary_hebrew_translation_table`).** The citation names `hebrew-translation-rows.jsonl#line:<n>`; that line's `english_part_of_speech` is read (the part of speech of the English entry whose table gives the Hebrew). `name` is a **name**; empty **none**; else a **word**.

**Hebrew Wiktionary (every source key that begins `hewiktionary`).** The citation names `hewiktionary-latest-pages-articles.xml#page:<id>` and a line of that page's text (`#wikitext-line:<n>`, or `#<kind>-line:<i>#translation-line:<n>`: the last number). The text's first line is the line of its `<text` tag, from after the tag's `>`. The mark is the template field `חלק דיבר` (part of speech) standing at or above that line on the page, the last one; its value runs from after `=` to the first `|` or `}`, trimmed. A value holding `פרטי` («proper»: `שם פרטי`, `שם־פרטי`, `שם־עצם פרטי`) is a **name**; an empty value, or no field above the line, is **none**; any other value a **word**.

**Hebrew WordNet (M43, `omw_hebrew_pwn30`; M57, `omw_hebrew_oewn2025_permanent_sense_key_bridge`).** The citation names, after `|`, a WordNet data file and `#line:<n>`. The synset's line before ` | ` is read. A synset holding the pointer ` @i ` (WordNet's instance of a class) is a **name**; any other synset a **word**. WordNet's own manual, where `@i` and its instances are defined, is not in the cache.

**OmegaWiki (M32, `omegawiki_structured_defined_meaning`).** The citation names `uw_defined_meaning:<id>` and `uw_syntrans:` with one id or more, parted at commas. (Amended after the first run, before any ship: the first wording said two ids; some citations name one.) OmegaWiki's own option attributes set on those objects are read from its SQL dump (active rows only, `remove_transaction_id` empty), each attribute and option named by the English spelling of its defined meaning (language 85). An option of the attribute `part of speech` whose option is `name` is a **name**; any other option of that attribute a **word**; none on those objects **none**. OmegaWiki's classes (country, city, river) are not marks: they are not its part of speech.

**English and Aramaic Wiktionary via Kaikki (`kaikki_wiktionary_hebrew`, `kaikki_wiktionary_aramaic`).** As v1: the line the citation names (`kaikki.org-dictionary-(Hebrew|Aramaic-words).jsonl#line:<n>`), its `pos`: `name` a **name**; empty **none**; else a **word**.

**The SDBH via HiperBiblia (M17, `hiperbiblia_sdbh`).** As v1: the record the citation names, its `part_of_speech`, parted at `,` and trimmed, empty parts dropped: `name` a **name**; any other part a **word**; no part **none**.

**The UBS dictionary (M18, `ubs_sdbh_hebrew_v0_9_2`).** As v1: the base form that holds the cited `lex-id`, its `PartsOfSpeech`, empty values dropped: `name` a **name**; any other a **word**; none **none**.

**Classical Hebrew Words (M23, `classical_hebrew_words`).** As v1: the record's `part_of_speech`, with full stops, square brackets and spaces taken off and in lower case: beginning `prn`, `pln`, `propn` or `prpn`, or equal to `prm`, a **name**; else beginning `gent` a **people**; empty **none**; else a **word**.

**Wikidata's Hebrew lexemes (`wikidata_hebrew_lexeme_gloss`, `wikidata_hebrew_explicit_form_english_sense`).** As v1: the line the citation names, its `lexical_category_id`: `Q147276` (Wikidata's «proper noun») a **name**; empty **none**; any other a **word**.

**Not read.** ConceptNet (M1, M22): its part of speech (`n`, `v`, `a`, `r`) does not part a name from a common word, and its `InstanceOf` means «a kind of», not a name. PanLex, MUSE, Hebrew Wikipedia's titles, Lexibank: their data has no such field. Kethoneth Yoseph: its catalog field is the lane's label. Davidson 1855 (M97): its marks stand on its printed page; the catalog's field is the lane's rewording of them in its own words, not the source's. Jastrow is not in the store.

## The class of a row

From the kinds of every catalog row a store row reaches:

- **a name row**: every catalog row's kinds are exactly name;
- **a people's name row** (gentilic): every catalog row's kinds are exactly people;
- **a common-word row**: every catalog row's kinds are exactly word;
- **partly a name**: some catalog row has the kind name, and not every catalog row's kinds are exactly name;
- **other**: everything else, labelled by its kinds joined with ` and ` in the order name, people, word, title, pn, other, none (for example `title`, `pn`, `none`, `people and word`); and the rows **not reached**, labelled `not reached`.

## The lists

Each line names a row as v1 does: `k` its key, `rank`, `m` its m_id, `sha` the first 16 hex of the sha256 of its route text. Each list is in the store's order (shards in name order, keys and rows as the shard holds them).

- `name-rows-v2.jsonl`: the name rows, with `entries` (the source's own entries reached, distinct, in order met) and `marks` (the marks read, distinct, in order met).
- `partly-a-name-rows-v2.jsonl`: the rows partly a name, with `kinds`, `entries` and `marks`.
- `gentilic-rows-v2.jsonl`: the people's name rows, with `entries` and `marks`.
- `common-word-rows-v2.jsonl`: the common-word rows, `k`, `rank`, `m`, `sha` only. Data for the page's measure of the gate the other way. Nothing is withheld by it.
- `other-rows-v2.jsonl`: every other row of a read source, with `class`, `entries` and `marks`.

A row of v188's landing carries `"v188": 1`. Such a row is one the store holds at the key and rank a line of `landing-fold-strike-v1.jsonl` gives it (`to_key` if it has one, else `key`; `rank`), with its m_id and its route text.

Every row of a read source is in exactly one list. The receipt counts each list by m_id and by source key, and the rows of each source not read.

## The gate, as ruled (unchanged)

At a place that is not listed as a name, a name row is withheld, and counted. At a place listed as a name, a name row stands. A people's name row, a row partly a name, and every other row stand.

## Compared with names v1

The page carries v1 on the store: `name: 1` in a row's facts (7,412 rows). A row **added** is a v2 name row without it. A row that **leaves** is a row with it that is not a v2 name row; its v2 class is its reason. Both are counted by m_id, and the leavers by class.

## Checks (each one stops the build)

1. Every read source key met in the store has a reader; every reached catalog row's `m_source_key` is its row's source key.
2. Every citation is of the shape its reader reads, and every entry it names is in its file (a Strong's number with no entry is `none`, counted, as above).
3. The five lists hold every row of a read source once.
4. No file written holds a machine path or the home folder's name.
5. The second count agrees on every list.
6. Two runs give the same bytes.

## The second count

A separate script, not importing the builder. It joins the store to the catalog by whole strings (not by hashes), follows the record of strikes by its own code, and reads the marks by another road where one exists: the catalog's own `part_of_speech` column for Strong's `pos`, the Lexical Index, TAHOT's grammar (with the span), TBESH, BiblicalTools, DBnary, the Kaikki tables, the Kaikki dictionaries, HiperBiblia, UBS, Classical Hebrew Words and Wikidata; the source files, read by its own code, where the catalog carries no mark (Strong's `x-pn`, M14's numbers, MACULA, Hebrew Wiktionary, WordNet, OmegaWiki) and for UHAL. (Amended after the first run, before any ship: the first wording put UHAL with the catalog's column. The second count found the column empty on the catalog rows of three UHAL files, H0215, H0216 and H3974, which write their value on the label's own line, «* Part of Speech: Verb». The file is the source's own, and the builder reads it; so the second count reads it too, by its own code. It changes 13 rows from «none» to a common word.) For the two BDBs it reads the catalog's column too, and checks each value against the source file (BDB's `<pos>` of the entry; the unabridged line's bold words), counting the values not found there. It also counts, for M9 and M14, the rows whose facts `n` would give another class than their citations. Its receipt says `agree: true` only when its five lists are the builder's, line for line.

## Not here

The store is not changed. The places are not rebuilt. The gate the other way is not built; its rows are data. Nothing is fetched.
