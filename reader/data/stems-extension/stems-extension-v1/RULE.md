# RULE — the binyan ledger's file 2, extended to the UBS dictionary, the SDBH and Jastrow (stems extension v1)

13 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone. Everything in the binyan ledger's rules (RULE-binyan-ledger-file2-v1.md and RULE-binyan-ledger-v2.md, strand moses-binyan-ledger-v1) stands except what is said here. Its file 1 (place-stems-v2.jsonl) and file 2 (row-stems-v2.jsonl) are not changed. This is a third file beside them.

## What is asked

The serving lane's ask 4 of 12 November: the binyan ledger extended to the SDBH, the UBS dictionary and Jastrow, where each says a stem for a sense. And its question: is a stem one source says for a reading good for the same words from a source that says nothing?

## Which rows have a line

- The served route store (as read on 12 November 2026 AD): every row of M18 (the UBS dictionary) and of M17 (the SDBH via HiperBiblia) whose key is the letters of at least one verb in file 1, as file 2's rule reads those letters.
- The page's Jastrow overlay (`reader/data/overlays/jastrow/`, as read on 13 November 2026 AD): every row whose key is such letters. Its m_ids are M12, M39, M49, M65, M75 and M106, all Jastrow's.

One line per row: the route store's rows first, then the overlay's, each in its store's order (shards `00` to `ff`, keys in each shard's order, rows in each key's order).

## The line

File 2's line: `{"m", "key", "rank", "route", "stems", "basis", "evidence"}`, m, key, rank and route the row's own values byte for byte. A line whose basis is `unknown` also has `why`. A line may have `branch` (below).

## The road from a row to its source's sense

As row entries v1 (relay v172) reads it: the row's catalog rows are the catalog rows of its cell (its key, and its source's label as its store's index names it) whose `r_route_text` is the route; where there are none, those whose `d_exact_text` is the row's definition text; where there are none and the row is the route store's, the cells the row-strikes record names for it. A row reached by none has the why `no_catalog_row`.

## What a catalog row says about a stem

- **M18.** The citation's `#lex-id:<id>` names a meaning of the UBS dictionary (the `LEXID` of one of its `LEXMeanings`). Each of that meaning's `LEXForms` that begins with `verb ` names a stem by the UBS table below. A meaning with no such form names no stem.
- **Jastrow.** The citation's `#sense:senses.<i>` (with or without further `.senses.<j>`) or `#grammar:senses.<i>` names the entry (its `rid`, on its `#line:`) and its top-level sense i, counted from one: `senses.1` is the entry's first top-level sense. (Corrected after the second count, which found a citation past an entry's last sense: the first run had counted from nought, so every Jastrow reading was taken one sense late. A sense the entry does not have now stops the build.) If that sense carries `grammar.verbal_stem`, the value names the stem or stems by the Jastrow table below. If it does not, the reading stands under no name of a stem: **the record has no heading** when no top-level sense of the entry carries a `verbal_stem`; **before the first heading** when a later one does and no earlier one; **under no stem name** when an earlier one does.

A reading that stands under no name of a stem in an entry that names stems elsewhere (a UBS meaning of a verb with no `verb ` form, while the entry's other meanings name some; a Jastrow sense before the first heading or under no stem name) is the source's reading for the verb at large, as file 2 calls a general gloss. A reading in a record with no heading, under a heading with no name of a stem, or in M17 gives nothing.
- **M17.** HiperBiblia's record gives each meaning its part of speech ("verb") and no stem. Its catalog rows name no stem.

## The tables

**UBS.** The words after `verb `, with a participle, infinitive, imperative or number after them taken off (`ptc.act`, `ptc.pass`, `inf.cs`, `inf.abs`, `imp`, `sg`): qal → qal; qal.pass → qal passive; nif → niphal; pi → piel; pu'al → pual; hif → hiphil; hof → hophal; hit → hithpael; po'el → poel; po'al → poal; hitpo'el → hithpoel; hotpa'al → hothpaal; tif'al → tiphil; nitp → nithpael; pe'al → peal; pe'il → peil; pa → pael; haf'el → haphel; af'el → aphel; hitpe'el → hithpeel; hitpa'al → hithpaal; etpa''al → ithpaal; etpe'el → ithpeel; shaf'el → shaphel; hishtaf'al → hishtaphel. `verb` alone names no stem. A form beginning `verb ` outside the table stops the build.

**Jastrow.** The value is read with any `*` and spaces at its ends taken off; a leading `Part.` and a trailing `, part. pass.` are taken off; values joined by ` a. ` name each. Pi. → piel; Pu. → pual; Hif. → hiphil; Hof. → hophal; Nif., Nef. → niphal; Hithpa., Hitpa., Hithp. → hithpael in a Hebrew entry and hithpaal in an Aramaic one; Nithpa., Nithpa → nithpael; Pol., Polel. → polel; Po., Poël. → poel; Hithpol., Hitpol. → hithpolel; Hithpo. → hithpoel; Nithpo. → nithpoel; Pilp., Pilpel. → pilpel; Palp., Palpel. → palpel; Hithpalp. → hithpalpel; Nithpalp. → nithpalpel; Pe. → peal; Pa. → pael; Af. → aphel; Ithpe., Itphe. → ithpeel; Ithpa. → ithpaal; Ithpalp. → ithpalpal; Ithpol., Ithpolel., Ithpoli. → ithpolel; Ithpo., Ithpoël. → ithpoel; Ittaf., Ittafel., Ittof. → ittaphal; Nittaf. → nittaphal; Shaf. → shaphel; Ishtaf. → ishtaphel. Any other value made of a capital and small Latin letters ending in a full stop (Pulpel., Pali., Paeli., Ithpaeli., Pirel., Ithpar., Pl.) keeps Jastrow's own abbreviation, lower case, without its full stop, as its name. A value that is none of these (`Fem.`, `Compounds…`, a bracket, a full stop alone, Hebrew) is a heading with no name of a stem: a reading under it gets none, why `heading_with_no_stem_name`. An entry is Aramaic when its `language_code`, trimmed, begins `ch.` or `(ch.`; otherwise Hebrew.

## The verdict of a row

Its stems are the names over all its catalog rows, each once, in order; its evidence those names as the source writes them (the UBS form with its meaning's LEXID, `verb pi · 001155002001000`; Jastrow's value with the entry's rid and the sense, `Pi. · A00031 · senses.2`). The base stem is qal, or peal in an Aramaic entry. As file 2:

- stems found and the base stem among them: `own_label`;
- stems found, no base stem, and a general gloss among the row's readings: `unknown`, why `general_gloss`;
- stems found, no base stem, no general gloss: `own_label`;
- no stems: `unknown`, and its why is the reason of the row's first reading in catalog order: `the_sense_names_no_stem` (a UBS meaning that names none), `the_record_names_no_stem` (a UBS entry none of whose meanings names one), `record_has_no_heading`, `before_the_first_heading`, `under_no_stem_name`, `heading_with_no_stem_name` (Jastrow), `the_source_names_no_stem` (M17), or `no_catalog_row`.

No stem is read from the English of a route, and none is added by inference.

## Branches (the owner's to set; resting null)

- **M17, the UBS edition.** HiperBiblia's SDBH and the UBS dictionary are two editions of one work. An M17 line carries `branch: {"name": "the_ubs_edition", "options": ["THE_UBS_EDITION", "NONE"], "resting": null, "the_ubs_edition": {...}}`, where `the_ubs_edition` is the verdict the row would have from the UBS meanings of the same entry that give the same gloss: the UBS entries whose `StrongCodes` hold the M17 record's number (its letter and digits, the digits padded to four: `H1254`, `A0002`; a small letter after the digits taken off) and, among their meanings, those whose English `Glosses` hold the route byte for byte. Where no such meaning stands, `the_ubs_edition` is null.
- **Jastrow, the base stem.** A Jastrow line whose readings all stand before the first heading, in entries that name at least one stem, carries `branch: {"name": "the_base_stem", "options": ["THE_BASE_STEM", "NONE"], "resting": null, "the_base_stem": {"stems": [...], "basis": "own_label", "evidence": [...]}}`: the base stem of each entry (qal, or peal in an Aramaic one), read from Jastrow's order (an entry lists its base stem's senses first and names the others), not from a name it prints.

## The question, measured

Over the lines of this file and file 2 (row-stems-v2.jsonl, as shipped in v105.1) whose basis is `own_label`, by **work**: Jastrow's six m_ids are one work, BDB's two editions (M5, M46) one, the SDBH's two (M17, M18) one, and every other source is its own. Pairs of lines of two works with the same key and the same route are counted by whether their stems are the same, share a stem, or share none. Pairs within one work are counted apart, as a check on the reading, not as an answer. And file 2's lines whose basis is `unknown` with the same key and route as an `own_label` line of another work: counted by source and by the work that names the stems.

(Amended after the first run, before any ship: the first run paired m_ids, and nearly every pair it found was two of Jastrow's own partitions.)

## The reader's cards

On the outside reader's fourteen verb cards of Genesis 1 (the serving lane's `verb-cards-cross.tsv` and `cards-genesis-1-verbs.json`): each pill carried by M17, M18 or Jastrow, its line here, the place's stem from file 1, and whether the stem gate would keep or withhold it, beside the reader's call: as the page stands, with this file, and with both branches set. And, for the question: the pills that a Strong's row naming no stem keeps on the card while every other row behind the pill names stems that leave out the place's stem.

## The checks

- Every row with a line reaches the line by one of the roads, or has the why `no_catalog_row`, counted.
- Every UBS form beginning `verb ` and every Jastrow value met is in its table or is counted where the table puts it; a UBS form outside the table stops the build.
- The builder runs twice to the same bytes. A second count reads the same rows by other means.
