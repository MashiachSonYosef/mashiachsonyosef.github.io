# RULE — the spelling bridge: STEP's pieces at the places our text spells otherwise, and STEP's own spellings as form rows (spelling bridge v1)

20 November 2026 AD. Corpus lane (Moses). Written before the builder. Nothing served is changed: these are lists for the serving lane.

## Why

The serving lane's letter of 20 November (the owner's read of Isaiah):

- ask 5: «STEP's pieces at the 861 places (point 15: Isaiah 20:2 «feet + your», 9:16 «widows + its»). Our text spells the word otherwise than the Leningrad text STEP is aligned to, so STEP's pieces do not attach and a plain row leads. Can the piece store attach STEP's pieces through the spelling difference the zone records?»
- ask 6: «H413 under אלו … At Ezekiel 9:4, 40:34, 40:36 and 1 Samuel 22:13, אֵלָו is the defective spelling of «to him». MACULA's lemma gives H413, and no row of H413 stands under the key אלו. … A form list of H413 under אלו, as asked for H352 under אילו on 17 November, puts the right word back.»
- and its letter of 17 November, ask 2: «Is a form list of H352 (Strong's concordance's source forms) one the store can serve under אילו?»

Strong's concordance does not name these spellings (its forms of H413 are «אל, אלי», of H352 «איל, אילי, אילים, אילם, אל, אלי, אלים»). STEP's TAHOT does: at Ezekiel 9:4 its row writes the word as the Leningrad text reads it, אֵלָ֔י/ו, and its spelling column (`L= אֵלָ֔/ו`) writes it as our text spells it, already cut into its pieces. So the class is one: a place where our text spells a word otherwise than the text the aligned sources follow. The zone records it on every lattice position (`leningrad`).

## 1. Terms

- **The lattice**: lattice v12, `moses-lattice-ledger-v1/candidate/positions-<book>-v12.jsonl.gz`, read in file order. **A bridge place**: a position whose `leningrad.differs` is true.
- **The word numbering**: word numbering v1.1 (`moses-word-numbering-v1/build-v1.1/numbering-v1.1/<book>.jsonl`). A position's word is the numbering line of its book whose `ref` and `s` are the position's reference and surface. Where a verse holds that surface more than once, the k-th position of the verse with that surface takes the k-th such line; the two counts must be equal.
- **TAHOT** and **a TAHOT row**, its columns, **a TAHOT piece**, **a break**, **a main tag**, **a mark**, **TBESH**: as in `moses-read-words-v1/read-words-v1/RULE.md` §1 (v192). The **spelling column** is column 7. A **spelling-column form** is one part of it, the parts being cut at `;`: a label (letters before `=`), then the form up to `¦` or the end. Where the form holds round brackets, the Hebrew is the part inside them.
- **The place's rows**: the TAHOT rows the word ties (`tahot.tied`), in order.
- **Our form**: at a place written and read alike, the surface; at a place written one way and read another (`megacompspan_source` `MAM_KQ`), the read form inside the square brackets, or, where there is none, the written form inside the round ones. A maqaf at its end is taken off. **Our letters**: its letters (U+05D0 to U+05EA).
- **Their letters**: the letters of the place's rows' lettered pieces, in order.
- **A letter cluster** of our form: a letter with the points and accents after it, up to the next letter.

## 2. The classes, every bridge place in exactly one

In this order, the first that holds:

1. `NO_STEP_ROW`: the word ties no TAHOT row.
2. `WRITTEN_NOT_READ`: a written-and-read place with no read form.
3. `READ_FORM_OF_TWO_OR_MORE_WORDS`: our form holds a space or a maqaf inside it. Its read words are v192's list (v192.1); nothing new is given here.
4. `THE_SOURCES_JOIN_OUR_WORDS`: their letters hold our letters and more, because STEP writes as one word what our text writes as two or more (the lattice's `class_tahot` `JOINED`). The row is named; no pieces are cut.
5. `STEP_WRITES_OUR_SPELLING`: the place has one row, and its spelling column holds a form whose letters are our letters and whose `/` cut gives as many lettered parts as the row has lettered pieces. Our letters are cut as that form cuts them. Two such forms that cut otherwise hold the place (`HELD_TWO_CUTS`).
6. `SAME_LETTERS`: our letters are their letters (over one row or several). Our letters are cut as their pieces cut them.
7. `THROUGH_ONE_LETTER`: our letters and theirs differ by one letter, added, dropped or changed. Every place in our letters where that one letter can stand is tried. Our letters are cut along their pieces as follows: a letter both have takes the piece of its counterpart; a letter only ours has takes the piece of the letters on both sides of it, or of its one neighbour at an end. The place is cut only where every way gives the same cut, every letter of ours has a piece, and every lettered piece of theirs keeps at least one of our letters. Otherwise it is held (`HELD_ONE_LETTER_AT_A_SEAM`).
8. `HELD_TWO_OR_MORE_LETTERS`: anything else. The rows are named.

Classes 5, 6 and 7 give pieces. The others give the place's line with its rows and why, and no pieces.

## 3. The places: `bridge-places-v1.jsonl`

One line per bridge place, in the order of the 39 books as the lattice is read, then of the positions:

- `book`, `ref`, `place` (the word's address with its full stop as a colon, as v179 writes it), `lattice_v12` (`i`, `j`, `surface`), `class`, `leningrad` (the lattice's record as it stands).
- `our_form`, `our_letters`, `their_letters`, `key_ours` (our letters), `key_sources` (their letters).
- `tahot_rows` (each row's first column), `tags_as_tahot_writes_them` (the rows' tag columns, joined by ` + `), `main_tags`, `main_glosses_tbesh`.
- `use`: on a line with pieces, `NEW_PIECES` where the lattice gives the position no pieces, `BESIDE_THE_LATTICES_PIECES` where it gives some. In the second case the lattice's own pieces are named in `lattice_pieces_now`; nothing replaces them.
- `pieces`: in the lattice's piece shape, `{index, role, hebrew, hebrew_tahot, consonants, english_tahot, english_macula, tag, macula_class, source}`: `hebrew` is our letter clusters of the piece, `consonants` their letters, `hebrew_tahot` TAHOT's Hebrew for the piece, `english_macula` and `macula_class` empty and `source` `TAHOT`, as v192 writes a piece only TAHOT gives. Roles as v192 §3, row by row. `marks_after`: the mark tags after a backslash, in order.
- `spelling_column_form` (class 5): the label and the form as STEP writes it. `difference` (class 7): what the one letter is (`ADDED`, `DROPPED`, `CHANGED`), which letter, and at which of our letters.
- `store`: under `key_ours` and under `key_sources`, how many rows the store as served holds, and how many of them carry in `facts.n` the number of a main tag (`H0413` and `H413A` read as `H413`).
- `lemma_now`: the lemma the lattice's entry for our form carries today (`macula` and `tahot`; the read entry at a place written one way and read another), so the page can set STEP's tag beside MACULA's word. *Added after the third run, before any ship.*
- `note`: plain words where the line needs them.

## 4. The form rows: `form-rows-v1.jsonl`

For each place of class 5: STEP's own row, under our letters. STEP's spelling column names our spelling at that place, with the row's own tags and English. The store's STEP rows (M4, `stepbible_tahot_aligned_translation`) are printed as the row's English column, credited by all its tags, as `{"n":["H413","H9033"]}` for «to/ him». So the line is that row's English column under the key `key_ours`, in the shape of v188's landing list: `m` M4, `key`, `rank` null (the page gives the highest served rank under the key plus one, in the list's order), `route` and `definition` and `item` the English column as STEP writes it, `action` land, `to_key` null, `kind` `form_named_in_steps_spelling_column`, `why`, `source`, `headwords` (the form without its `/` and marks), `year` as the store gives M4, `facts` `{"n": [...]}` (every tag of the row, read as above, in order, once), `record_loc` (`line:<n>#ref:<first column>#spelling_column:<label>`), `record_file`, `rid` null, and `places` (every place it stands for).

*Amended after the second run, on a reading of its lines against the store:* the store's M4 rows count only the pieces' tags, never the marks after a backslash, and carry apart, in `t`, the tags that hold a letter as STEP writes them without the leading zeros: «tent/ his» under אהלו is `{"n":["H168","H9023"],"t":["H168G"]}`. The second run had put the marks (H9016, H9018) into `n`. So `facts` is now `n`, every lettered piece's tag read as a number, once, in the order of the numbers, as the store orders them (all 52,237 of its M4 rows with two or more numbers hold them so; «<on>/ thousands/ his» is `["H505","H9003","H9023"]`); and `t`, where any tag holds a letter, those tags in the same order. Where STEP's same words stand under `key_sources`, that row's facts are compared, and the counts are in the receipt. They can differ only where the store's row gathers the tags of more than one STEP row with the same words (`t` `["H1121A","H1121G"]` for «sons/ his»); a form row carries its own row's tags only.

*Amended after the builder's first run, which stopped:* the store does not give M4 one year (its M4 rows carry «S_NO_SOURCE_YEAR», 1890, 2023 and 2026). So `year` is the year of the M4 row under `key_sources` that prints the same words, STEP's same row under the Leningrad spelling, named in `year_from`. Where no such row stands, or two give other years, `year` is «S_NO_SOURCE_YEAR» and `year_from` says why.

Lines with the same key, words and facts are one line, its `places` all of them. A line is not written where an M4 row under that key already prints the same words; it is listed in `form-rows-not-landed-v1.jsonl` with that row.

## 5. Checks, each a hard stop

1. The TAHOT files and TBESH are the bytes and sha256 the STEP manifest lists.
2. Every bridge place has one word, its rows stand in TAHOT at the lines the numbering names, and each row's Hebrew, English and tag columns cut to the same count.
3. Our form's letter clusters are our letters, one each.
4. On every line with pieces: the pieces' `consonants`, in order, are our letters; their `hebrew`, in order, is our form; every piece has a letter; each piece's tag and English are its row's.
5. Every bridge place is in exactly one class, and the classes add up to the bridge places.
6. A second count by another road agrees (`verify-bridge-v1.mjs`): it reads the positions, the rows and the spelling column by its own reader, sorts the places by its own reading of the classes, tries every place of the one letter in both words by brute force, and recomputes every piece and every form row.
7. No file written holds a path of this machine or the home folder's name.
