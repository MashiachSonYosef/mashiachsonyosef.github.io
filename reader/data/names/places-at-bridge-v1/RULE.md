# RULE — places at the bridge v1: the place list at the spelling bridge's places, and readers of their own for STEP's expanded Strong (M51) and the translation tables (M78, M103)

21 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone. Nothing served is changed: these are lists for the serving lane. This is the work relay v213 promised for relay v218.

## What is asked

Relay v213 (`<the Tabernacle>/corpus-lane-builds/moses-names-gate-v1/FOR-ELIJAH-v213.md`):

- section 3: «Should names v1's place list hold Ezekiel 27:6 word 11, and the bridge's places like it, as names on TAHOT's own mark? Relay v218 answers it, from TAHOT's own lines at the bridge's places.»
- section 4: «A reader of M51's own comes in v218.» and «The translation tables (M78, M103, 134 lines): not read by M34's reader, by the same CALL. A reader of their own comes in v218.»

The owner's rule stands as names v2 quotes it: a row is set apart only on what its own source says of it; never on our reading of the English; never by a class list we chose; never row by row. Every case below goes into the output as a labelled class or branch, negatives too.

## Part 1. The place list at the bridge's places

### What names v1's list is, and why it can miss a place

Names v1 (`<the Tabernacle>/corpus-lane-builds/moses-names-gate-v1/names-v1/RULE.md`) built its list (`place-names-v1.jsonl`) from the word numbering v1 (`<the Tabernacle>/corpus-lane-builds/moses-word-numbering-v1/build/numbering-v1`, the set of 39 files whose sha256 names v1's receipt gives). Its TAHOT clause, word for word: «**TAHOT.** A line in the place's `tahot.tied`, read from the TAHOT file. Its fifth column (the tags) and sixth (the grammar) are each parted at `/`, each part taken up to its first backslash, and a single `H` or `A` at the head of the grammar column taken off. The **core** is the part whose tag stands in braces. TAHOT calls the place a name when the core's grammar begins `Np`, and a gentilic when it begins `Ng`.» A place is a name when TAHOT or MACULA calls it one.

The spelling bridge (`<the Tabernacle>/corpus-lane-builds/moses-spelling-bridge-v1/bridge-v1/` and `bridge-v1.1/`) reads the word numbering v1.1 (`<the Tabernacle>/corpus-lane-builds/moses-word-numbering-v1/build-v1.1/numbering-v1.1`). Its lines are v1's except where v1.1 found TAHOT's line by looking in TAHOT's own file (`found_by` `DIRECT_LOOKUP`). At such a place names v1 read no TAHOT line, or another one.

### Which places are read

Every line of `bridge-v1.1/bridge-places-v1.1.jsonl`, a **bridge place**. Line for line it must name the same place as `bridge-v1/bridge-places-v1.jsonl` (`book`, `ref`, `place`, `class`, `tahot_rows` the same). A bridge place's **word** is the line of numbering v1.1 of its book whose `ref`, a colon and `word_number` make the place; there must be exactly one, its `address` with its full stop made a colon must be the place, and its surface `s` must be the place's `lattice_v12.surface`. The same place is found in numbering v1 the same way, with the same `address` and `s`.

### TAHOT's lines at a place

The place's TAHOT lines are its word's `tahot.tied` in numbering v1.1, in order: the bridge's own rows. Each line's first column must be the bridge line's `tahot_rows` entry in the same order. Each line is read by names v1's TAHOT clause, unchanged, and labelled by what the clause gives:

- `name`: the core's grammar begins `Np`;
- `gentilic`: it begins `Ng`;
- `other`: another grammar (its first two letters are kept, as data);
- `no core`: no part of the tag column stands in braces;
- `no grammar`: the line's tag column or grammar column is empty. (Such a line's other columns are not read: names v1's clause reads these two only. The line's meaning-variant column is quoted as data.)

TAHOT calls the place a name when any of its lines is labelled `name`.

### The classes [places]: every bridge place in exactly one, with its branch

First by whether names v1's list holds the place (its `book` and `place`):

1. **ALREADY_LISTED**: the list holds it. Branches:
   - `TAHOT_ALREADY_A_WITNESS`: the list's `by` names `tahot`, and TAHOT's lines call it a name;
   - `TAHOT_ADDED_AS_A_WITNESS`: the `by` does not name `tahot`, and TAHOT's lines call it a name;
   - `TAHOT_NOT_A_NAME`: the `by` does not name `tahot`, the word ties a TAHOT line, and none calls it a name;
   - `NO_TAHOT_LINE`: the `by` does not name `tahot`, and the word ties no TAHOT line;
   - `TAHOT_A_WITNESS_BUT_NOT_ON_THE_LINES_TIED_NOW`: the `by` names `tahot`, and the lines tied now do not call it a name. Counted and listed; nothing is taken off the list here.
2. **ADDED_ON_TAHOTS_MARK**: the list does not hold it, and TAHOT's lines call it a name.
3. **NOT_A_NAME_BY_TAHOTS_MARK**: the list does not hold it, the word ties a TAHOT line, and none calls it a name. Branch, the first that holds: `GENTILIC` (a line is labelled `gentilic`), `NO_GRAMMAR`, `NO_CORE`, `OTHER`.
4. **NO_TAHOT_LINE**: the list does not hold it, and the word ties no TAHOT line.

Every place also carries what numbering v1 tied there (names v1's road): `same` (the same lines), `other` (other lines, named), or `none`; and numbering v1.1's `found_by`.

### The addition: `places-v1.1-additions.jsonl`

One line per place of class 2 and of branch `TAHOT_ADDED_AS_A_WITNESS`, in names v1's list order: its books in the order its lines give them, then the numbering's order within the book (the numbering line's `p`; the builder checks that the list follows this order). Each line:

- names v1's four fields: `book`, `place`, `address` (numbering v1's), and `by`, the witnesses after the addition (for a witness added, names v1's `by` with `tahot` put in, in name order; for a place added, `["tahot"]`);
- `change`: `ADDED` (class 2) or `WITNESS_ADDED`;
- `names_v1`: for `WITNESS_ADDED`, the list's line (its number, from 1) and its `by` as written; for `ADDED`, null;
- `beside`: for `ADDED`, the two lines of names v1's list it stands between in that order, `before` and `after`, each `{line, place, by}` (null past an end of the file); for `WITNESS_ADDED`, null (the place is that line itself);
- `same_verse`: names v1's places in the place's verse, `{line, place, by}`, in list order;
- `tahot`: each TAHOT line read: `file`, `line`, `ref` (its first column), `tags` and `grammar` (its fifth and sixth columns as STEP writes them), `core` (the core's part number, from 0), `mark` (the core's grammar part), `call` (its label);
- `macula`: MACULA's words numbering v1.1 ties at the place (`macula_xml_ids`), each `{xml_id, class, type}` as `macula-hebrew.tsv` writes them. Data only: MACULA's witness stays as names v1's list gives it;
- `numbering_v1`: what numbering v1 tied (`same`, `other`, `none`, with its lines), and v1.1's `found_by`;
- `bridge`: the place's line number in bridge v1.1 (from 1), its `class` and `use`.

The list then held is names v1's lines, with each `WITNESS_ADDED` place's `by` as the addition gives it, and each `ADDED` place put in where `beside` says. The receipt counts it [places].

### Every bridge place, labelled: `bridge-places-read-v1.jsonl`

One line per bridge place, in the bridge's order: `book`, `place`, `bridge_line`, `bridge_class`, `class`, `branch`, `listed` (names v1's line and `by`, or null), `tahot` (each line `{file, line, ref, mark, call}`; for a `no grammar` line also `meaning_variants`, its seventh column as STEP writes it), `numbering_v1` and `found_by` as above.

### The gate at v213's 22 marks

v213's name rows (`<the Tabernacle>/corpus-lane-builds/moses-names-gate-v1/names-landed-v1/name-rows-landed-v1.jsonl`). For a row of v202: every place its lines name in `bridge-v1/form-rows-v1.jsonl` (`places`, by the line numbers the row's `lines` gives). For each such place: whether names v1's list holds it and by whom, and whether the list with the addition does; and what the gate does at it, before and after: `withheld` where the place is not listed as a name, `stands` where it is. For a row of v200: its lines name no place, and the gate judges it at every place by the list. The addition changes the list only at bridge places, so the receipt counts, for each such row, the bridge places whose `key_ours` is the row's key, and those of them the addition changes.

### Places like it outside the bridge

The receipt counts every place of numbering v1.1 whose `found_by` is `DIRECT_LOOKUP` [places]: how many are bridge places; how many TAHOT's lines call a name by names v1's clause; and how many of those names v1's list does not hold with `tahot` among its witnesses, bridge places and other places apart, each other place named. The addition covers the bridge's places only, as asked; any other place is named in the receipt for the place list's next reissue (the lane's call).

## Part 2. STEP's expanded Strong (M51): its own mark

### Which lines

Every line of v207's Bible dictionaries list (`<the Tabernacle>/corpus-lane-builds/moses-send-back-v1/send-back-v1/landing-bible-dictionaries-v1.jsonl`, carried unchanged by v210) whose `m` is `M51`. Its `source` must be `stepbible_tahot_expanded_strong`. Each must stand in v213's `no-rule-yet-v1.jsonl` as the line of that list with the same line number, `k`, `rank`, `m` and `sha`, and the class `NO_RULE_YET`.

### The record and its tag

The line's `record_file` names a TAHOT file under the cache folder (`<999 footsteps>/` + `record_file`), and its `record_loc` is `line:<n>#c0:<reference>#expanded-tag:<i>#route:<j>`. Line n of the file (from 1) must begin with the reference and then `=`. Its twelfth column (from 1), under the heading «Expanded Strong tags» on the file's heading line (the line whose first column is «Eng (Heb) Ref & Type»), is cut at every `/` and every backslash; each part has the spaces at its ends taken off; empty parts are dropped. The i-th part (from 1) is the record's **tag**. It must be `H`, four digits, at most one capital letter, `=`, the Hebrew, `=`, the gloss, with `{` before it and `}` after it where STEP writes them (and `}+` where one tag goes on over the next word). The Hebrew, with the spaces at its ends taken off, must be among the line's `headwords`, and the line's `route` must stand in the gloss byte for byte.

STEP's own words for this column, at the head of each TAHOT file: «A copy of the dStrong tags with additional tags for punctuation elements. Each tag is accompanied by the lexical form in Heberew, an English gloss, and its sub-meaning after " » " where appropriate.» and «People and place names have unique IDs such as "Abram»Abraham@Gen.11.26-1Pe" which means: in this location the name given is Abram but the most common name is Abraham. This individual occurs first at Gen.11.26 and last in 1Peter. The ID and the accompanying dStrong number belongs to only one individual who is distinct from anyone else who shares any of their names.»

### The mark

- A tag whose gloss holds an **ID**, `@` followed at once by a reference as STEP writes one (a book's short name: at most one digit, a capital letter, small letters; then a full stop, a chapter number, a full stop and a verse number, as «Gen.11.26» or «1Ki.7.13»), is a **name**.
- A tag whose gloss holds `@` not so followed is **other**.
- A tag whose gloss holds no `@` is **none**: the column gives no part of speech, and STEP's sentence speaks of names only.

STEP's column has no mark of its own for a people's name (a gentilic). So a tag of a people's name that carries an ID, as «Agagite»Agag@1Sa.15.8-Est», is read as STEP writes it: a name, the ID of the one individual STEP's sentence names. (The lane's call: this reader reads M51's own column only.)

### As data, not read as a mark

For each line, the grammar column of the same TAHOT line at the tag's piece, as names v1 reads that column (a single `H` or `A` at its head taken off, parted at `/`, each part up to its first backslash). The tag's piece is the part of the expanded column, cut at `/` alone, that holds the tag; a tag after a backslash in its part is punctuation and has no grammar. The receipt counts the lines by class and by the first two letters of that grammar, and names the name rows whose grammar begins `Ng` and the rows with no mark whose grammar begins `Np`. This is TAHOT's grammar column (M4's), not M51's own; it changes no class. It shows where M51's mark and TAHOT's grammar part ways.

## Part 3. The translation tables (M78, M103): the English entry's own part of speech

### Which lines

Every line of send back v1.1's own-language list (`<the Tabernacle>/corpus-lane-builds/moses-send-back-v1/send-back-v1.1/landing-own-language-v1.1.jsonl`) whose `m` is `M78` or `M103`: the lines v210 keeps. Its `source` must be `kaikki_english_wiktionary_nonhebrew_hebrew_script_translation_table`. Each must find exactly one line of v213's `no-rule-yet-v1.jsonl` by `k`, `m` and `sha`, with the same `rank`, from v207's own-language list (`landing-own-language-v1.jsonl`). v213's lines of M78 and M103 that none of them finds must each be a line of `withdrawn-own-language-v1.1.jsonl` (the same v1 line number, `m`, key and rank).

### The record

`record_file` names `kaikki.org-dictionary-English.jsonl.gz`, under `<999 footsteps>/`; its sha256 must be the one the cache's `source-manifest-v1.json` names (`compressed_source`). `record_loc`, up to its first `|`, is `line:<n>#sense:<s>#translation:<k>` or `line:<n>#entry#translation:<k>`. Line n of the file (from 1, read through gzip as it streams) is one English entry. The translation is `senses[s-1].translations[k-1]`, or `translations[k-1]`; its `word` must be among the line's `headwords`, its `lang` the line's `language.value` and its `code` the line's `language.code`.

### The mark

The entry's own `pos`, the part of speech of the English entry whose table gives the word, as Kaikki writes it: `name` is a **name**; empty or missing is **none**; any other value is a **word**. It is the mark names v2 reads for M34 (`english_part_of_speech`), here read from the entry itself. Kaikki's documentation of `pos` is not in the cache, so the value is read as the file writes it.

## The class of a row, and the lists

Names v2's classes, unchanged, word for word: «- **a name row**: every catalog row's kinds are exactly name;», «- **a people's name row** (gentilic): every catalog row's kinds are exactly people;», «- **a common-word row**: every catalog row's kinds are exactly word;», «- **partly a name**: some catalog row has the kind name, and not every catalog row's kinds are exactly name;», «- **other**: everything else, labelled by its kinds joined with ` and ` in the order name, people, word, title, pn, other, none (for example `title`, `pn`, `none`, `people and word`); and the rows **not reached**, labelled `not reached`.»

No line of v207 has landed, so each line is its own row, as in v213: `k` its key (`to_key` if it has one, else `key`), `rank` the line's (null where it names none), `m`, `sha` the first 16 hex of the sha256 of its `route`. Each row reaches one record, its own; here a record stands where names v2 has a catalog row.

The lists, each in its source list's line order:

- M51: `name-rows-m51-v1.jsonl`, `partly-a-name-rows-m51-v1.jsonl`, `gentilic-rows-m51-v1.jsonl`, `common-word-rows-m51-v1.jsonl`, `other-rows-m51-v1.jsonl`; `relay` `v207`, `list` `landing-bible-dictionaries-v1.jsonl`, `lines` its line number there.
- M78 and M103: the same five names with `-tables-v1`; `relay` `v210`, `list` `landing-own-language-v1.1.jsonl`, `lines` its line number there, and `v207_lines`, the v1 line number v213's list names.

Line shape as v213's: `k`, `rank`, `m`, `sha`, then `kinds` (partly a name only), `class` (other only), `entries` and `marks` (not on the common-word list), then where it comes from. An **entry** is `TAHOT <file> line <n> tag <i>` (the file named as names v1 names it, the part of its name before « - ») or `English line <n> sense <s> translation <k>` (`English line <n> translation <k>` for one under the entry). A **mark** is `gloss <the gloss as STEP writes it>` or `pos <the entry's pos>` (`pos ` and nothing after it where there is none). A line with no mark stands in the other list with the class `none`.

## The gate, as ruled (unchanged)

At a place that is not listed as a name, a name row is withheld, and counted. At a place listed as a name, a name row stands. A people's name row, a row partly a name, and every other row stand. The places are names v1's list with the addition of Part 1.

## Checks (each one stops the build)

1. Every input's sha256 is the one its record names: names v1's place list, MACULA and the numbering v1 set (names v1's receipt); the TAHOT files (STEP's acquisition manifest, and the set names v1's receipt names); bridge v1.1's places (its receipt) and bridge v1's places (bridge v1.1's receipt); v213's lists, and v202's form rows and v207's Bible dictionaries list (v213's receipt); send back v1.1's lists (its receipt); the Kaikki file (its manifest).
2. Bridge v1.1 and v1 name the same places in the same order; each place finds one line in each numbering, with the same address, reference and surface; numbering v1.1's tied lines are the bridge's rows.
3. Every TAHOT line read stands in its file; every bridge place is in exactly one class and branch; the classes add up to the bridge places.
4. Names v1's list holds each place once and follows the order the addition reads; the addition holds only places of class 2 and branch `TAHOT_ADDED_AS_A_WITNESS`, each once.
5. STEP's quoted words stand byte for byte in each TAHOT file; names v1's and names v2's quoted words stand byte for byte in their RULE files; v213's quoted words stand byte for byte in its relay.
6. Every M51 line: the record's shape, the line's reference, the tag's shape, its Hebrew among the headwords and the route in its gloss; and it stands in v213's list.
7. Every table line: its entry and translation are found, with the translation's word, language and code; it finds exactly one line of v213's list; the lines of v213's list found by none are the withdrawn ones.
8. Every line read is in exactly one row, and every row in exactly one list.
9. No file written holds a machine path, the home folder's name or its parent folder's name, or an e-mail address.
10. The second count agrees on every list and on the addition.
11. Two runs give the same bytes.

## The second count

`verify-places-at-bridge-v1.mjs`, which does not import the builder:

- Part 1: it finds each bridge place's TAHOT rows by their first column (the bridge's `tahot_rows`) in the TAHOT files, not by the numbering's line numbers; reads the tag and grammar columns by its own code, the core being the first part whose tag begins with `{`; reads names v1's list and numbering v1 by its own code; makes every class, branch and line of the addition again, and compares the builder's two files line for line. It also recounts the places like it outside the bridge.
- Part 2: it finds each record's TAHOT row by its reference (the row's first column up to `=`) and checks it is line n; finds the tag by its shape (STEP's tag form matched along the column, in order), not by cutting at the separators; and checks that the line's catalog card (`rid`, in `structured-evidence-catalog-v86.csv.gz`) is of the line's source key and cites the line's record.
- Part 3: it reads the lane's own extraction row that the record's second part names (after `|`: a `nonhebrew-hebrew-script-translation-*.csv.gz` file and `#line:<n>`, its data rows counted from 1): its `english_part_of_speech`, `source_line`, `sense_index`, `translation_index` and `source_headword` must agree with the record and with the builder's mark; and it reads the catalog card's `part_of_speech` beside it.
- It writes `verify-receipt-v1.json`, whose `agree` is true only when every list and the addition are the builder's, line for line.

## Not here

The store is not changed. Names v1's list file is not rewritten: the addition is its own file. Names v2's lists and v213's lists are not changed. Nothing is fetched. No rule is written for any other source.

usage: `node build-places-at-bridge-v1.mjs --name=<path> ...` with every input named on the command line (the receipt lists them by placeholder), and the out folder last; then `node verify-places-at-bridge-v1.mjs` with its inputs the same way.

## Amended

**Amended after the builder's first run (into its work folder), before the two runs: how an M51 entry is written.** The first wording, «`TAHOT <file> line <n> tag <i>` (the file named as names v1 names it, the part of its name before « - »)», doubles the word: the part of the file's name before « - » is already «TAHOT Jos-Est», so the first run wrote «TAHOT TAHOT Jos-Est line 142012 tag 1». An M51 entry is `<file> line <n> tag <i>`, `<file>` being that part of the file's name («TAHOT Jos-Est line 142012 tag 1»), as names v2 writes TAHOT's entries («TAHOT Gen-Deu line 88688 span 1-1»). No class and no count changes.
