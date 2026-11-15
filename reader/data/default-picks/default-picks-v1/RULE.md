# RULE — each source's own pick at a word place (default picks v1)

13 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone.

The owner's idea (13 November): each source that names its own meaning at a place is a default toggle of its own (STEP default, UBS default, MACULA default, BDB default), and where a source makes more than one pick at a place, its picks stand 1, 2, 3 in its own order. This ledger gives, for every word place of the 39 books, each such source's picks. It changes nothing served; which default rests on first is the owner's.

**Amended after the builder's first runs, before anything was written to the store.** The first runs showed six things this rule had wrong or left open, and each is now written in its place below: (1) a text two sources share under one key can stand as one row credited to one of them, so a pick names any served row that prints its words under its key, its own source's first; (2) the catalog builder's reader of STEP does not read a line that writes the Hebrew verse beside the English one (`Gen.31.55(32.1)#01=L`), nor a line with no Hebrew to read; this ledger reads both and counts them; (3) UBS counts a verse's words as MACULA does less the pronoun endings MACULA writes as words of their own, and counts some joined words as one where MACULA makes two (`לָמָּה`, Numbers 27:4), so a reference is placed on the word whose dictionary form has the entry's letters, nearest the counted place; (4) a prefix's UBS meaning is a piece of the word, not a second pick for it, so UBS's picks stand piece by piece; (5) a BDB pick carries its record's highlighted words beside its point's words; (6) the lines were too heavy written as named fields (286 MB), so they are written as short arrays, and the rows once, in a table.

## The places

The word numbering v1 (`moses-word-numbering-v1/build/numbering-v1/<book>.jsonl`), every line: the place is the book and the line's `address` with its stop written as a colon (`1:1.2` is `1:1:2`), as the serving lane's cards write it. A line names the TAHOT lines it is tied to (`tahot.tied`) and the MACULA words it is tied to (`macula_xml_ids`).

## A pick, and the rows that print it

One meaning a source itself sets at the place: its number in the source's order (from 1), the source's own id of the entry and of the meaning where it has them, the source's own words for it, and the rows that print it.

The rows: every row of the served route store, of any source, whose key is the key the source's words are served under and whose route text is those words. A text two sources share under one key can stand as one row credited to one of them, so the row may be another source's. A pick names its own source's rows where there are any, and otherwise every row that prints its words. Each row is written once, in `rows-v1.jsonl` (one row a line, `[key, rank, m_id, the first 16 hexadecimal digits of the sha256 of its route text]`, as relay v172 names a row), and a pick names its rows by their line number there, from 0. The receipt counts, for each source, the picks printed by a row of its own, by another source's row only, and by no row under its key.

## STEP (TAHOT, M4; its dictionary TBESH, M19)

For each TAHOT line the place is tied to, in the order the numbering gives them:

1. **its reading** (`r`): the entry is the core of the line's dStrongs (the segment in braces); the meaning is the one STEP's expanded tag names for that entry (the text after `»`, to `@` or the closing brace), or the tag's own gloss where it names none; the words are the line's Translation. Its key and words are those the catalog builder cuts from the line's whole word (`tahotAlignedSpans`, the span with `isFullTokenSpan`).
2. **each meaning variant** (`v`, column 7, a variant to each `X=`), in the column's order: the entry is the core number of the variant's tag (the first under 9000), the words are the variant's own quoted words, and the line carries the variant's letter and its Hebrew.
3. **each alternative number** (`a`, column 10, each distinct `H` number under 9000 in the column's order; STEP's numbers from 9000 name prefixes, endings and marks, such as `H9014` the maqaf, and are not meanings; amended after the second count's first run found three): the entry is that number, the words its TBESH gloss.

A pick of 2 or 3 prints through TBESH: its rows are those that print the entry's TBESH gloss under the keys of the entry's TBESH headwords (`parseTbeshRecord`), so a variant's rows print its entry's gloss and not the variant's own quoted words. Picks with the same entry and words are one pick.

The catalog builder's reader (`parseTahotRecord`) reads only a line whose reference runs straight to `#`. A line that writes the Hebrew verse beside the English one is read here with the Hebrew verse set aside; a line with no Hebrew to read (a written word with nothing read, its word standing only in a variant) gives no reading, only its variants and alternatives. The receipt counts both, and how many of their places a row from elsewhere prints anyway.

## MACULA (M3)

One pick: the words MACULA itself gives the place, piece by piece: each MACULA word the place is tied to, in order, with its id, its Hebrew, its `english` column and its rows (the catalog builder's reading rule for M3, as relay v172 writes it: the word's form keyed, its `english`). The pick's words are the pieces' words joined by a space.

MACULA's `sdbh` column names a UBS meaning by an older numbering than the UBS dictionary v0.9.2 the store serves (its 006653 is רֵאשִׁית; v0.9.2's 006653 is רֵאשׁ). This ledger does not read it; matching it is later work.

## UBS (M18, the UBS dictionary v0.9.2)

UBS cites places by a reference of fourteen digits: the book (3, in the English Bible's order), the chapter (3), the verse (3), and twice the number of the word in the verse (5). It numbers a verse's words as MACULA does, every MACULA word in the order of their ids, less the pronoun endings MACULA writes as words of their own (`pos` `suffix`); and it counts some joined words as one where MACULA makes two. So a reference is placed on the MACULA word of the verse whose dictionary form (`lemma`) has the letters of the entry's lemma or one of its other lemmas (final letters read as their plain forms), the nearest to the counted place, the earlier of two equally near; where no word of the verse has them, on the word at the counted place. The receipt counts each way.

At a place, UBS's picks stand piece by piece: for each MACULA word the place is tied to, every meaning whose references are placed on it, in the dictionary's own order (entries, their base forms, their meanings, as the file stands), numbered from 1 for that piece. A pick is the meaning's id (`LEXID`, whose first six digits are its entry's), its glosses joined by ` / ` (or its short definition where it has none), and its rows: the M18 routes of that meaning in the catalog's UBS route file, each with the key it is served under.

## BDB (M46, the unabridged BDB)

A record cites a verse by a `<ref>` with its book (in the English Bible's order), chapter and verse; it numbers verses as the Hebrew Bible does, as the word numbering does. A citation is a pick of its record in one of two ways:

- it stands in a **numbered point** (a `<div class="point">` that opens with `<b>N.</b>` or `<b>a.</b>`; points do not nest): the meaning is that point, named `point<p>:<marker>` as made spaces v2 names it;
- the record has **no point at all**, and the citation stands in its main part: the meaning is `the entry`.

A citation in a point that opens with no number or letter (a stem's forms, `<b>Qal</b> …`), or in the main part of a record that has points (comparisons and forms), is not a pick; the receipt counts both. A citation of several verses cites each.

The places of a cited verse that take the pick are those whose STEP reading's entry has a number the record names (its `StrongNumber` cell, parted at `_`; a number is `H` and its digits without leading zeros, STEP's letter set aside). Where the verse as cited holds no such place, the builder looks again at the Hebrew verse STEP pairs with that English verse (TAHOT's reference `Eng(Heb)`). A citation no place takes is counted, not dropped silently; among them are citations of a neighbouring verse (BDB cites a verse and the next) and citation numbers the digitised file misreads (its 21:18 where BDB wrote 21:28).

At a place, BDB's picks are its records' meanings, records in file order and points in record order. A pick is the record's `BDBid`, the meaning, its words (the routes the catalog builder takes from that point: its highlights, or its opening where none; for `the entry`, the record's routes), its rows (those routes under the record's key), and the record's highlighted words.

## The files

One file per book, `<book>.jsonl`, one line per place in the numbering's order:

`{"p": place, "step": [...], "macula": ... , "ubs": [...], "bdb": [...]}`

- `step`: picks `[n, kind, entry, meaning, words, rows]`, kind `r`, `v` or `a`; a variant adds `[its letter, its Hebrew]`;
- `macula`: `[words, [[id, Hebrew, words, rows], …]]`, or null where MACULA gives the place no words;
- `ubs`: pieces `[id, Hebrew, [[n, meaning id, words, rows], …]]`;
- `bdb`: picks `[n, BDBid, meaning, words, rows, the record's highlighted words]`;

with rows as numbers into `rows-v1.jsonl`. And `receipt-v1.json` with every count named here.

## Checks the builder makes, each a hard stop

1. every place of the numbering has one line, and every TAHOT line and MACULA word it names exists;
2. every row named stands in the served store under its key with the pick's words;
3. every UBS reference is placed in a verse MACULA holds, or counted;
4. every pick has an entry, the picks of a place for one source (for UBS, of one piece) are numbered 1 to n, and a UBS meaning's id opens with its entry's;
5. the provider files are the bytes their manifests list (the unabridged BDB's file read out of the zip its manifest lists).

## The second count

`verify-default-picks-v1.mjs`, by the same hand and another road. It reads the ledger and holds it to the providers' files and the store: every pick's words are its source's own (STEP's Translation, quoted variant or TBESH gloss; MACULA's `english`; UBS's glosses; BDB's routes for that point), every row named prints the pick's words under its key, every UBS pick's word is one its reference can name, every BDB pick's verse holds a word with its record's number; and it counts each source's citations again from the files with its own scan, and must find the receipt's counts.
