# RULE — the read words of a place read as two or three words, with TAHOT's tags, and the stroke's two facts (read words v1)

14 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone.

It answers the serving lane's letter of 13 November 2026 AD ("ruling 4 and your v179, wired"): its §3, first point (a read form of two or more words carries no tag), and its §2 question (how the next lattice carries a stroke inside a read form). It builds on v179 (`moses-paseq-place-v1/`), whose list it reads and whose key it keeps: lattice v12, book, i and j, and the place's surface, so that the page refuses a line wherever the place's surface no longer matches.

## 1. Terms

- **The lattice**: lattice v12, one file per book, `moses-lattice-ledger-v1/candidate/positions-<book>-v12.jsonl.gz`, one position per line, read in file order. A position's key is its book, `i` and `j`.
- **A place written one way and read another**: a position whose `megacompspan_source` is `MAM_KQ`. Its surface holds the written form in round brackets and, when the place is read, the read form in square brackets.
- **The read form**: the inside of the square bracket of the place's surface, exactly as the surface holds it, with the edition's own points, accents and maqaf. A place written but not read has no square bracket and so no read form.
- **The read-form entry**: the place's `megacompspan` entry whose `reading` is `qere`.
- **A read word**: the read form cut at every space (the thin space U+2009 counts as a space) and after every maqaf (U+05BE), the maqaf staying on the word before it. A piece with no letter is not a read word. Read words are numbered from 1 in the order the edition writes them. The read word is carried as the edition writes it, maqaf and all.
- **Letters**: the Hebrew letters U+05D0 to U+05EA only. Points, accents, maqaf, the stroke (U+05C0), slashes and backslashes are not letters.
- **A listed place**: a place whose read form holds two or more read words.
- **How the read words are joined**: `SPACE` when the read form holds a space and no maqaf; `MAQAF` when it holds a maqaf and no space; `BOTH` when it holds both (a maqaf at the end of the last read word joins it to the next word of the verse, outside the read form).
- **Pieces of the lattice**: the position's `pieces` array, in the shape `{index, role, hebrew, consonants, english_tahot, english_macula, tag, macula_class, source}`. A place "has pieces" when that array is not empty.
- **TAHOT**: STEP's Translators Amalgamated Hebrew OT, its four files (Gen-Deu, Jos-Est, Job-Sng, Isa-Mal). **A TAHOT row** is a line whose first column is `Book.C.V#NN=TYPE`, with `(C.V)` after the verse where the Hebrew numbering differs; the row's verse is that Hebrew one, else the first. Its columns, counted from 0: 1 Hebrew, 3 English, 4 tags, 7 spelling variants. Rows of type R and X are kept out, as the affix walk keeps them out.
- **A TAHOT piece**: a row's Hebrew, English and tag columns, each cut at every `/`. The three cuts must give the same count. Within a piece, everything from its first backslash on is a mark: in the Hebrew column the mark's sign (maqaf, stroke, end of verse), in the tag column the mark's tag (H9014 maqaf, H9015 stroke, H9016 end of verse, and so on). The piece's Hebrew and its tag are the parts before that backslash. This is the reader proposed in §8: it does not stop at a row's first backslash.
- **A break**: a TAHOT piece with no letters (a space, an empty piece, a maqaf standing as its own piece), and the start and end of every row.
- **A main tag**: a tag TAHOT writes in braces `{..}`. It is carried without the braces.
- **TBESH**: STEP's Translators Brief lexicon of Extended Strongs for Hebrew. A TBESH entry is a line whose second column starts with `H` and a digit; its tag is the first word of that column; its Hebrew is the fourth column and its gloss the seventh, both as TBESH writes them. Where two lines give one tag, the first stands.
- **The STEP manifest**: `stepbible-data-2026-07-14/acquisition-manifest.json`, which lists the bytes and sha256 of each STEP file.

## 2. Finding TAHOT's words for the read words

1. The rows read are the TAHOT rows of the listed place's verse (Hebrew numbering), in file order.
2. **A run** is a stretch of lettered pieces of those rows, in file order, that starts just after a break and ends just before one, whose letters, taken in order, spell the read words' letters in order, with each read word ending at the end of a piece. Breaks may stand between read words and are passed over there; a break inside a read word ends the run.
3. The letters are first compared as they are. Only where no run is found are they compared again with every yod and vav set aside on both sides (a fuller or shorter spelling of the same word).
4. Exactly one run must be found. If there is more than one, the one whose pieces all stand in rows whose type starts with Q is taken; if that does not leave one, the build stops.
5. A read word's TAHOT pieces are the run's pieces that spell it. They must all stand in one row.
6. **How found**, for each read word: `SAME_LETTERS` when its TAHOT pieces' letters are the read word's letters; `SPELLING_ASIDE` when they are the same only with yod and vav set aside. TAHOT's own spelling is carried beside it.

## 3. The roles and the English of the pieces

As the affix walk gives them, row by row: a piece whose tag TAHOT writes in braces is `core`; a piece before the row's first core is `prefix`; after its last core, `suffix`; between two cores, `between_cores`. Where a row has no tag in braces, its first lettered piece is `core` and the rest `suffix`. Letterless pieces are dropped, as the walk drops them. A piece's English is TAHOT's English for that piece with `<`, `>`, `[` and `]` taken out, runs of spaces closed to one, and the ends trimmed (the walk's rule). `english_macula` and `macula_class` are written empty and `source` is `TAHOT`, as the lattice writes a piece only TAHOT gives.

## 4. The list: `read-word-tags-v1.jsonl`

One line per read word of each listed place, in the order of the 39 books as the lattice is read, then of the places in file order, then of the read words. Each line:

- `book`, `ref`, `lattice_v12` (`i`, `j`, `surface` of the place), `read_form` (as the surface holds it), `joined_by`, `read_words_in_place`, `n` (the read word's number), `read_word` (as the edition writes it), `letters`.
- `use`: `NEW_PIECES` when the lattice gives the place no pieces, `TIES_EXISTING_PIECES` when it does.
- `lattice_piece_indexes`: on a tie line, the indexes of the lattice's own pieces that are this read word's. The lattice's pieces, in order, are laid against all the read words' TAHOT pieces in order; the two must be the same count, and each pair must agree on tag, role, Hebrew, letters and TAHOT English, or the build stops. Empty on a new-pieces line.
- `main_tag`: the read word's main tag, or null where TAHOT writes none. Two main tags in one read word stop the build.
- `main_gloss_tbesh`: TBESH's gloss for the main tag, as TBESH writes it; null where there is no main tag. A main tag TBESH lacks stops the build.
- `tags_as_tahot_writes_them`: the read word's parts of TAHOT's tag column, joined by `/`, with braces and marks as TAHOT writes them.
- `tags_tbesh`: each piece's tag with TBESH's gloss (null where TBESH lacks it).
- `marks_after`: the mark tags TAHOT writes after a backslash inside the read word, in order.
- `pieces`: the read word's TAHOT pieces in the lattice's piece shape (§3), `index` counted from 0 within the read word.
- `tahot_rows`: the first column of the row(s) the read word was read from. `tahot_spelling`: TAHOT's Hebrew for it, its pieces joined. `how_found`: §2.6.
- `read_form_entry_lemma`: the `lemma` the read-form entry carries today (`macula` and `tahot`), or null; the same on every line of a place.
- `tahot_rows_for_the_place`: how many TAHOT rows the place's read words stand in.
- `note`: plain words where a line needs them (no main tag; a spelling set aside); else null.

## 5. The stroke's two facts: `stroke-facts-v1.jsonl`

The stroke stays its own position, as lattice v12 has it and as rule 11 has it. One line per line of the v179 list, in its order:

- The lattice must hold the v179 place at its `i` and `j` with the same surface, and the very next position in the book file must be the v179 stroke: same `i` and `j`, `c0` OFF, `kind` PASEQ, `rule` 11, surface the stroke alone. The place's read words, cut as in §1, must be as many as v179's `read_words`.
- **On the stroke**: `stands_in_read_form_of` `{i, j, after_read_word}`: the place's key and v179's `the_stroke_follows_read_word`.
- **On the place**: `read_form_with_stroke`: the place's read words in order, each `{read_word: n, surface}`, with `{stroke: {i, j}}` standing after read word `after_read_word`.
- `among_the_listed_places`: true when the place is a listed place (§1).
- `tahot`, at a stroke place that is a listed place: `IN_THE_TAG_COLUMN` when the read word the stroke follows carries the mark tag H9015 and no other read word of the place does; `ONLY_IN_THE_SPELLING_COLUMN` when no read word of the place carries H9015 and the spelling-variants column of the row of the read word the stroke follows holds the stroke; anything else stops the build. Null at the other places.

## 6. Counts: `counts-v1.json`

Every figure the relay cites is written here: the lattice (positions, places written one way and read another, those with and without a read form, the listed places by number of read words and by how they are joined, with and without pieces, the read-form entry's `lemma` and any tag field it holds, the read-form entry's key), TAHOT (rows read by type, read words found, how found, main tags, rows per listed place, what TAHOT does at each listed place with no pieces, the rows whose Hebrew goes on after the row's first backslash), the stroke places, and what each shape of the stroke would move (§8). For each read word on a new-pieces line it also names the TBESH entries whose Hebrew has the same letters as the read word, with their glosses, so a reader can see which entries the bare letters could stand for.

## 7. Checks, each a hard stop

1. The TAHOT files and TBESH are the bytes and sha256 the STEP manifest lists.
2. Every listed place's read-form letters equal the letters of its read-form entry's surface.
3. Every listed place is found in TAHOT by exactly one run (§2), every read word's pieces stand in one row, and the yod-and-vav road is used only where the first road finds nothing.
4. Every main tag is in TBESH; no read word has two main tags.
5. At every place with pieces, the lattice's pieces agree with the read words' TAHOT pieces (§4).
6. The stroke checks of §5.
7. Every row whose Hebrew holds a letter after its first backslash is counted; the ones that are not a lone section letter (פ or ס) are named, and the lattice position of each such word is looked at for a TAHOT tag.
8. No file this build writes holds a path of this machine (a drive letter and `Users`) or the home folder's name.

## 8. The shape for the next lattice reissue (a proposal, not built here)

1. **The read-form entry carries `read_words`**: `[{n, surface, letters, pieces}]`, each piece in the lattice's piece shape with TAHOT's tag, as this list carries them. Today the entry carries a `lemma` (read word 1's headword, or null) and no tag for each read word.
2. **The affix walk gives pieces to a place TAHOT spreads over 2 or 3 rows.** Today it matches one TAHOT row to one lattice word. *Amended after the builder's first run, on a reading of the walk:* the walk does find a lattice word that is two or three TAHOT rows (it calls it a join), but it gives a word its TAHOT row only from a one-to-one match (`build-affix-v2-v1.mjs`, lines 322 and 323), so a joined word gets no pieces. The proposal is that a join gives its word the pieces of all its rows, in order.
3. **The TAHOT reader stops cutting a row at its first backslash** (`build-affix-v2-v1.mjs`, line 99, keeps only what stands before a row's first backslash). It should cut at every `/` and set apart the mark of each piece, as §1 reads TAHOT. Rows whose Hebrew goes on with letters after the first backslash, other than a lone section letter, are few; §7.7 names them.
4. **The stroke keeps its own position**, as now, and the two facts of §5 are carried on the stroke and the place. The other shapes, and what they would move:
   - the place's surface holds the stroke and the stroke's position goes: that many positions go, every later position of those books takes a new `j`, and rule 11 refuses a paseq carried inside a word instead of standing as its own mark;
   - the place's surface holds the stroke and its position stays: nothing is renumbered, but the stroke is written twice, once in the place and once at its own position. Whether rule 11 reaches a stroke written inside the place as well as at its own position is the owner's reading;
   - each read word becomes a position of its own: positions are added, every later position of those books takes a new `j`, and a written form of one word has no single place left.

Open for the owner and the page: whether `read_words` is carried at every place with a read form or only at the listed places; what the line under a read word with no main tag shows; whether the store has a line under each main tag this list names (the page's to check).

## 9. The second count

`verify-read-words-v1.mjs`, by another road, not importing the builder:

- it finds the places from the lattice surfaces alone (every position whose surface holds a square bracket), and cuts the read words by walking the bracket character by character;
- it reads TAHOT as one stream of letters over the verse (each letter keeping its row, piece and tag, letters taken before each piece's backslash), finds the read words' letters in it (again with yod and vav set aside only where the letters as they are are not found), and requires exactly one place in the stream;
- it parses TBESH by its own reading of the line, scans every TAHOT row again for letters after the first backslash, and checks the strokes against v179 and the lattice;
- it recounts every line of both lists and every count it can, field by field, and writes `verify-receipt-v1.json` with `agree` true, or stops.
