# RULE — the names gate: which words are names, and which rows are names (names v1)

13 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone.

## What is asked

The owner's ruling of 13 November 2026 AD (the third of the three options put after relay v176): hide a dictionary's names, such as «Bara», where the word on the page is not a name. The page needs two facts it does not hold: which words of the text are names, and which rows a dictionary gives as a name.

## Which words are names

Every word place of the 39 books as the word numbering numbers them (`moses-word-numbering-v1/build/numbering-v1`: book, verse, word number), read against the sources the numbering ties to the place:

- **TAHOT.** A line in the place's `tahot.tied`, read from the TAHOT file. Its fifth column (the tags) and sixth (the grammar) are each parted at `/`, each part taken up to its first backslash, and a single `H` or `A` at the head of the grammar column taken off. The **core** is the part whose tag stands in braces. TAHOT calls the place a name when the core's grammar begins `Np`, and a gentilic when it begins `Ng`.
- **MACULA.** A word in the place's `macula_xml_ids`, read from `macula-hebrew.tsv`. MACULA calls the place a name when one of its words has the class `noun` and the type `proper`, and a gentilic when the type is `gentilic`.

A place is a **name** when TAHOT or MACULA calls it one. Listed: every name place, with which of the two say so. A place that only one calls a gentilic, or both, is not a name; such places are counted apart.

## Which rows are names

Every served row of the route store from a source that marks a name in its own data, read by the road of row entries v1 (relay v172: the row's cell and route text, else its definition text, else the cells the row-strikes record names):

- **Classical Hebrew Words** (M23): the record's part of speech is a name, read as relay v174 reads it (with its full stops, square brackets and spaces taken off and in lower case, it begins `prn`, `pln`, `propn` or `prpn`, or is `prm`).
- **English Wiktionary as Kaikki gives it** (the store's m_ids whose source key is `kaikki_wiktionary_hebrew`) and **Aramaic Wiktionary** (`kaikki_wiktionary_aramaic`): the source line's `pos` is `name`.
- **The SDBH via HiperBiblia** (M17): the record's `part_of_speech` is `name`.
- **The UBS dictionary** (M18): the base form that holds the cited meaning (its `lex-id`) has `name` among its `PartsOfSpeech`.
- **Wikidata's Hebrew lexemes** (`wikidata_hebrew_lexeme_gloss` and `wikidata_hebrew_explicit_form_english_sense`): the source line's `lexical_category_id` is `Q147276`, a proper noun.

A row is a **name row** when it reaches at least one catalog row and every catalog row it reaches is a name. A row that reaches names and other entries both is **partly a name**: counted, not listed. Every other source of the store is not read for a name, and neither is the Jastrow overlay; their names stand. (Amended before any ship: the first wording said those sources mark no name, which was not checked for each of them.)

## The gate, as ruled

At a place that is not listed as a name, a name row is withheld, and counted. At a place listed as a name, a name row stands.

## The line

- `place-names-v1.jsonl`: one line per name place, `{book, place, address, by}`, where `place` is `<chapter>:<verse>:<word number>` as the page's cards write it, `address` the numbering's own, and `by` the sources that call it a name (`tahot`, `macula`).
- `name-rows-v1.jsonl`: one line per name row, `{k, rank, m, sha, entries}`, the row told apart by rank, m_id and the first 16 hex of the sha256 of its route text, as in row entries v1; `entries` the source's own entries that are names.

## Measured on the reader's cards

The outside reader's fourteen verb cards of Genesis 1: the pills whose every row is a name row, at their places (none of which is a name), beside the reader's call.

## Checks

Two runs to the same bytes. A second count finds the name places by another join (TAHOT's own reference and word number, and MACULA's own reference and word order, set against the numbering's verse and word number) and the name rows by the evidence road of store v2.2 (the sidecar's cards and their evidence ids) where that road reaches the row.
