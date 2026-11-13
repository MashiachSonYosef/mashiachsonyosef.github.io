# RULE — the entry a pointer names, and its first English (pointer entries v1)

13 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone. It answers the serving lane's letter of 13 November ("a pointer pill prints another entry's English"), and replaces one field of the map of pointer readings that relay v101 shipped (`form-of/zone-pills-v1.2.jsonl`): the resolution. Every other field of every line stands as v101 wrote it.

## What is asked

1. A resolution of the entry the pointer names, by what the pointer says (its own bytes carry the target's points), and a reason where the target's entry cannot be told from its neighbours.
2. For a MIXED reading, whether the map should carry which part is the reading's own English.
3. A declared rule for which English of the target is "first": the target's leading sense as the source orders its senses, not the store's row order.
4. The readings of one key and source that print alike, after rule 1.

## What is read

- The map: `zone-pills-v1.2.jsonl` (relay v101), its lines classed FORM_OF or MIXED, each with `form_of` (the target's key, the relation, the byte range `at` of the target in the line's text, the resolution, and `also`, the further targets, each the same shape).
- The served route store, as read on 12 November 2026 AD.
- The structured evidence catalog v86, only for the source line a reading's own catalog row cites (its key, its source's label and its route text), so that the reading's own entry can be read.
- Each line's own source, in its own file: English Wiktionary as Kaikki gives it (`kaikki.org-dictionary-Hebrew.jsonl`) for M11, M13 and M25; Aramaic Wiktionary as Kaikki gives it (`kaikki.org-dictionary-Aramaic-words.jsonl`) for M60; the UBS dictionary (`UBSHebrewDic-v0.9.2-en.JSON`) for M18; Strong's as Hebrew Wikisource gives it (the `SRCEXP-0037-H*-strongs.wikitext.txt` files) for M14, with the row entries ledger of relay v172 for which M14 rows belong to which of its entries.

## The target

The bytes of the line's text at `at`, read as UTF-8: the target as the pointer writes it. It is **pointed** when it holds a Hebrew point.

## The target's candidates

The entries of the line's own source whose headword, with its points and cantillation taken off, has the letters of `form_of.key`:

- Kaikki (Hebrew and Aramaic): a line of the file is an entry; its letters are its `word`; its pointed headwords are its forms tagged `canonical`; its romanizations its forms tagged `romanization`; its senses in the file's order.
- The UBS dictionary: an entry is one of its entries; its pointed headword is its `Lemma`; its senses are its meanings in the file's order (base forms in order, meanings in order), each with its English `Glosses`.
- Strong's via Wikisource: an entry is a `==N==` block; its pointed headword is the Hebrew in bold on the block's first text line.

## The entry the pointer names

1. **A pointed target** names the candidates whose pointed headword is the same form, compared as span grade v1 compares two forms (its steps 1 to 4: NFD; the cantillation and the marks it lists taken off; the qamats qatan read as qamats and the holam for vav as holam; a holam moved onto a following bare vav), the maqaf and spaces read as the parting of words.
2. **An unpointed target** in a Kaikki line names the candidates whose romanization is the one the pointer writes in round brackets right after the target, both read with apostrophes, right single quotation marks and the acute accent taken off, and in lower case. With no romanization there, it names every candidate.
3. **A gloss the pointer quotes** between “ and ” right after the target (Kaikki Aramaic writes these) keeps, of the candidates named so far, those with a sense whose gloss holds it between word edges, when any does.
4. One candidate left: the pointer names it. Several: `SEVERAL_ENTRIES_SHARE_THE_FORM` (pointed) or `SEVERAL_ENTRIES_SHARE_THE_LETTERS` (unpointed), with how many. None: `NO_ENTRY_HAS_THE_FORM` (pointed) or `NO_ENTRY_UNDER_THE_LETTERS`.

Amended after the first run, before any ship, with three steps the first run showed were wanting:

- **A spelling's own pointing.** Where the relation says the reading is only another spelling of the target (defective spelling of, alternative spelling of, alternative form of, excessive spelling of, archaic spelling of, obsolete spelling of, misspelling of, scriptio continua form of) and several candidates are left, the reading's own entry in the source (the source line its catalog row cites) gives its own pointed headwords, and the candidates whose pointed headword is one of them are kept, when any is; how: `own_pointing`. A spelling is pointed as the word it spells.
- **Full and short spelling.** Where a pointed target names no candidate, the comparison is made again with both forms read in short spelling: a vav carrying only a holam after a letter with no vowel becomes a holam on that letter; a vav carrying only a dagesh after a letter with no vowel becomes a qubbuts on that letter; a yod with no point after a hiriq or a tsere is taken out; and a dagesh at a word's first letter, except on a vav, is set aside, as span grade v1's step 6 sets it aside; how: `pointed_short_spelling`.
- **The source's own first, as a branch.** Where several candidates are left after every step, the line carries `first_in_the_sources_order`: the first of them in the source file's own order, with its first English and the served row that has it. It is an option for the owner (`options: ["UNRESOLVED", "FIRST_IN_THE_SOURCES_ORDER"]`, resting null), not a resolution.

## Which English is first (ask 3)

The named entry's senses in the source's own order:

- Kaikki: the first sense that has a gloss and is not itself a pointer (it has no `form_of` and no `alt_of`); its first gloss. When every sense with a gloss is a pointer, the first of them is followed once, by the same rules, to the entry it names (the `word` of its `form_of` or `alt_of`, pointed or not, with that entry's own source), and that entry's first English is taken; how: `followed_one_pointer`. A second pointer is not followed: `THE_TARGET_POINTS_ON_AGAIN`. Where the pointer followed names no single entry, the reason is that one's, after `THE_TARGET_POINTS_ON_TO_` (as `THE_TARGET_POINTS_ON_TO_SEVERAL_ENTRIES_SHARE_THE_LETTERS`): the line's own target was named, and the entry it points on to was not.
- The UBS dictionary: the first meaning with an English gloss; its first gloss.
- Strong's via Wikisource: the served M14 rows at the target's key whose entries in the row entries ledger are the named entry's number alone, in the store's order; the first of them.

The resolution is then the served row at the target's key whose route text is that English byte for byte, under the line's own m_id, or, where it has none, under another m_id to which the store's index gives the same source key (English Wiktionary's partitions); and its rank and m_id. For Strong's it is the row itself. When no served row has it: `NOT_SERVED`, with the English named, so the page can say what the source gives.

## The line

v101's line, with `form_of.resolved` (and `resolved` of each of `also`) replaced by `{key, m, rank, text, entry, sense, how}`, or by null with `resolved_why` from the reasons above; and with `resolved_in_v1_2`, what v101 wrote, beside it. `entry` names the source's entry (Kaikki: its line in the file; UBS: its MainId; Strong's: its number); `sense` its place among the entry's senses, counted from one; `how` is `pointed`, `pointed_short_spelling`, `romanized`, `letters`, `quoted_gloss`, `own_pointing` or `followed_one_pointer`. The lines keep v101's order.

## MIXED readings (ask 2)

The map keeps `class` and `at`, and so says which part of a MIXED reading is the pointer; it carries no further division of the reading's own English. If the owner rules that a MIXED pill prints its own words whole, the page needs nothing more.

## Readings that print alike (ask 4)

Counted before and after: the keys and sources where two or more readings of one key and source would print one text (the resolution's English with the relation and the target, as the page builds it), and their readings; listed after.

## Checks

- The builder runs twice to the same bytes.
- A second count names the entry of every line by other means: the Kaikki headword from the head template's expansion instead of the forms tagged canonical, the UBS lemmas and the Strong's headwords read by a separate parse.
- The serving lane's four cards (Hosea 4:14 `הם`, Amos 6:11 `מצוה`, `חמרים`, `אבטח`) are set beside what the map now says.
