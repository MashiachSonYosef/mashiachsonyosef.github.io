# RULE: pointer map v1.4, the ruled print for the pure pointers

14 November 2026 AD. Corpus lane (Moses). Written before the builder. If a run shows a want, the rule is amended below in the open, under "Amended".

## 0. What this answers, and what stands

- The serving lane's letter of 14 November ("the owner's answers"), section 3. The owner's answer on the 458 pure pointers with no English of their own: «print the English your map's file carries for the pointer's entry». The serving lane asked the corpus lane to restate the rule in the map, so the page prints it as a ruled print and its check holds it to the lane's file. This is that restatement.
- The serving lane's letter of 13 November ("the rulings of 13 November, wired"), 3.1 (a resolution that is itself a pointer) and 3.2 (the 458).
- The rulings of 13 November (relay v176): a MIXED reading prints its own words (ruling 5); a pointer whose words cannot tell its entries apart takes the source's first entry, as a branch (ruling 7).
- A seat of the lane drafted v1.4 on 14 November and another seat checked it. This rule is the draft's rule with the check's corrections. The draft was never sent.
- Map v1.3 (relay v175, `pointer-entries-v1/RULE.md`) stands in every part this rule does not name.

## 1. Terms

- **Map v1.3**: `pointer-entries-v1/zone-pills-v1.3.jsonl`, 3,015 lines. A line's number is its place in that file, counted from one.
- **A slot**: one place on a line where the map resolves a pointer: the line's own target (`form_of`), and each further target (`form_of.also`). A slot's ruling 7 branch (`several_branch.first_in_the_sources_order`) belongs to the slot.
- **The 458**: the lines classed FORM_OF whose own target has no served resolution in v1.3 (no `form_of.resolved`, and no `resolved` on the ruling 7 branch) and which carry an English (`not_served.english`, or the branch's `english`). The builder counts them again and stops if they are not 458 lines at 58,007 places.
- **The source** of an m id: its source key in the store's index (`m_sources[m].key`). **The same source**: every m id with that source key. At store_version 4d1357b26ca5 the index gives:
  - `kaikki_wiktionary_hebrew` (English Wiktionary as Kaikki gives it): M11, M13, M25, M30, M35, M50, M69;
  - `kaikki_wiktionary_aramaic` (Aramaic Wiktionary as Kaikki gives it): M60, M72, M112, M177;
  - `ubs_sdbh_hebrew_v0_9_2` (the UBS dictionary): M18 alone.
  The builder reads these from the index and stops if they differ from this list. Strong's (M14) is left as v1.3 has it.
- **The source's file**, as v1.3: `kaikki.org-dictionary-Hebrew.jsonl` for M11, M13 and M25; `kaikki.org-dictionary-Aramaic-words.jsonl` for M60; `UBSHebrewDic-v0.9.2-en.JSON` for M18.
- **The entry the pointer names** (`named_entry`): the entry v1.3's steps name, with the two amendments of section 3. Under ruling 7's branch, the source's first entry.
- **The entry the English stands in** (`entry`): the named entry; or, where every sense of the named entry is itself a pointer, the entry reached by following the first of those once (section 2).
- **A served row**: a row of the route store at store_version 4d1357b26ca5, with its key, rank, m id and route text. It is named as the page's bake re-resolves a row: key, rank, m id and sha16, the first 16 hex characters of the sha256 of the route text's UTF-8 bytes.
- **Three keys of a slot**:
  - **the line's own key**: the line's `key`, the word the reading stands under (as אבירים);
  - **the key the pointer names**: the slot's `key` (`form_of.key`, or the `also` target's `key`), the letters of the word the pointer writes (as חודשים for «defective spelling of חודשים»);
  - **the key followed to**: the letters of the entry the English stands in, when a pointer was followed (as חודש).

## 2. Which English is first (v1.3, with one amendment)

As v1.3: the entry's senses in the source's own order; the first sense that has a gloss and is not a pointer; its first gloss. In the UBS dictionary: its meanings in order (base forms in order, meanings in order), the first with an English gloss, and its first gloss.

**Amended (the serving lane's 3.1). A sense whose own words are a pointer is a pointer.** v1.3 took a sense to be a pointer only where the source tags it so (Kaikki's `form_of` or `alt_of`). Now a sense is also a pointer when its first gloss reads, in its own words, as: some words, then a Hebrew word (or several, parted by " / " or by a space), then, if there is one, a romanization in round brackets, then, if there are any, more words; and its relation is one of the relations the map's FORM_OF lines carry. Its relation is the words before the Hebrew, with " … " and the words after when there are any, a closing full stop set aside, in lower case, with runs of spaces made one. The map's relations are read the same way, from `form_of.relation` and the `relation` of each `also` of every FORM_OF line. Left-to-right and right-to-left marks are set aside for this test only.

The test is the gloss's own words. Whether the gloss is, byte for byte, the text of another line of the map is not a test (the draft had that as a second test; it is dropped, and the builder counts what it would have added).

Where every sense with a gloss is a pointer, the first of them is followed once, as v1.3 follows a tagged one: to its first Hebrew word, with the romanization written after it, named by the steps of section 3. So a resolution whose own words are a pointer is followed one pointer more where the source names one entry. A second pointer is not followed: `THE_TARGET_POINTS_ON_AGAIN`. Where the pointer followed names no single entry, the reason is `THE_TARGET_POINTS_ON_TO_` and that pointer's reason. Ruling 7 is not applied to a pointer followed (that question is open: section 10).

## 3. The entry the pointer names (v1.3, with two amendments)

v1.3's steps stand: the pointed form, then the short spelling, the romanization, a quoted gloss, the reading's own pointing; several left gives ruling 7's branch.

**Amendment A, a geresh (the draft's).** A candidate whose every pointed headword (or, with none, whose word) holds a geresh or gershayim (U+05F3, U+05F4, or the marks ' " and U+2019) is set aside when the target holds none of these. Such an entry is the name of a letter or an abbreviation, not the word the pointer writes. Where that leaves no candidate, the reason is `NO_ENTRY_HAS_THE_FORM` (a pointed target) or `NO_ENTRY_UNDER_THE_LETTERS`. A target that holds the mark itself (as יו״ד) is not touched.

**Amendment B, a prefix (new).** A target is a prefix when, its points set aside, it is one Hebrew letter, and either it is written with a maqaf (U+05BE) or a hyphen after it (as ש־, ל־, כ־), or it is a bare letter with a romanization after it that ends in a hyphen (as «ב (b-)»). A prefix does not name the letter's own entry: the entry whose headword (`word`) is that one letter alone, with no maqaf or hyphen, the entry of the letter of the alphabet («Shin or sin: the twenty-first letter …»). Where the steps above would name the letter's own entry for a prefix, as the one entry or as ruling 7's first, the slot stays unresolved, with the reason `A_PREFIX_IS_NOT_THE_LETTERS_ENTRY`, and it carries no ruling 7 branch. A bare letter with no such romanization is the letter itself (as «word-final form of מ»): it is not a prefix, and it is not touched. This rule does not name the prefix's own entry in the letter's place, where the file has one; that is left as it stands.

Both amendments apply wherever an entry is named: the line's own target, each `also`, and a pointer followed (section 2). A line v1.3 named by the reading's own pointing (a step that reads the catalog, and that this build does not run again) keeps v1.3's entry, and the amendments are not applied to it.

## 4. Where the served row is looked for (amended twice)

For a slot whose English is found, the served row is the first found, at these keys in this order:

1. the key followed to, where a pointer was followed; otherwise the key the pointer names (v1.3 looked here and only here);
2. the key the pointer names (the draft's amendment): for a pointer followed, the same source can serve the English at the word the pointer writes, as «month» at חודשים;
3. the line's own key (new, the check's correction): the same source can serve the identical English at the very word, under another m id of the source, as «mighty, valiant» under M25 at אבירים, beside M13's pointer.

At each key, the m ids in this order: the line's own m id, then the other m ids of the same source in the order the store's index lists them. Under an m id, the first row in the store's order whose route text is the English, byte for byte. A row found is written `{key, m, rank, text, sha16, entry, sense, how, found_at}`, and `found_at` says which of the three keys it stands at: `the_key_followed_to`, `the_key_the_pointer_names` or `the_lines_own_key`. A key that is two of these is named by the first. (Amended below, after the check of the ship draft: a row that follows a pointer also carries `named_entry` and `followed`.)

The serving lane's premise for the 458, "in no served row of that source", was true only at the key v1.3 looked at. Where a row of the same source stands at one of the three keys, the slot resolves to that row and carries no ruled print.

## 5. The ruled print (the owner, 14 November)

Where the English is read from the source's file (sections 2 and 3) and no served row of the same source has it at the three keys of section 4, the slot keeps v1.3's fields (`resolved_why` NOT_SERVED, with `not_served` or the branch's `english`) and carries `ruled_print`:

- `rule`: `pointer-map-v1.4`.
- `text`: the English, byte for byte as the file gives it.
- `fills`: `resolved` where the pointer names one entry; `first_in_the_sources_order` where it is ruling 7's branch.
- `m`: the pointer reading's own m id (the line's `m_id`). `source`: its source key. The card credits that m id's label and licence, as for any row of that m id.
- `named_entry`: `{entry, headword}`, the entry the pointer names.
- `entry`, `headword`, `sense`: where the English stands. These equal `named_entry` where no pointer was followed.
- `followed`: null; or `{from_sense, word, entry, by}`: the sense of the named entry that points on (counted from one), the word it writes, the entry reached, and `by` (`tag` where the source tags the sense, `own_words` where its own words are the pointer).
- `how`: as v1.3 (`pointed`, `pointed_short_spelling`, `romanized`, `letters`, `quoted_gloss`, `own_pointing`, `followed_one_pointer`, `first_in_the_sources_order`).
- `file`: the file's name and sha256; for Kaikki its line, word, headword, sense and gloss 1; for the UBS dictionary the MainId, lemma, base form, meaning, LEXID and gloss 1.
- `served`: false. `looked_at`: the keys of section 4 at which no served row of the same source has the English.
- `also_in_the_source`: the source's own rows in the structured evidence catalog v86 with the same English, at the key the pointer names or the key of the entry the English stands in, that cite another entry of the source's file than `entry`; each `{entry, headword, keys, evidence_support_ids}`. Empty where there are none. The English is the source's own at each of these entries as well.

The page prints `ruled_print` exactly where it would print a served resolution of the same slot. A MIXED reading still prints its own words (ruling 5). A USAGE_NOTE or JUDGMENT line still follows its owner's branch. The field stands on those lines too, so one rule serves every slot.

## 6. The lines written

Only the lines that change are written (`zone-pills-v1.4.changed.jsonl`), each whole, with `line` (its number in v1.3) first, then v1.3's fields. Every other line of v1.3 stands byte for byte. A line changes when one of its slots changes its English, its served row, its served state or its entry named, or carries a ruled print. Outside `form_of` a changed line is v1.3's line, byte for byte in value.

In a changed slot v1.3's values stand beside the new ones: `in_v1_3` where the entry named changes; `resolved_in_v1_3` where the slot's own resolution changes; `first_in_the_sources_order.in_v1_3` where ruling 7's branch changes. A served row set by v1.4 carries `sha16` and `found_at`. (Amended below, after the check of the ship draft: `resolved_in_v1_3` keeps v1.3's entry.)

## 7. What a slot can be

- **served**: a served row (section 4), named by key, rank, m id and sha16.
- **ruled print**: section 5.
- **unresolved**, with its reason: v1.3's reasons, and `A_PREFIX_IS_NOT_THE_LETTERS_ENTRY` (section 3, amendment B).

## 8. The lists

- `zone-pills-v1.4.changed.jsonl`: the changed lines (section 6).
- `the-458-v1.4.jsonl`: one line for each of the 458: v1.3's English and entry; the entry named and the entry the English stands in (both, where a pointer was followed); what v1.4 makes of it (served row with `found_at`, ruled print, or unresolved with its reason); and why the store had no row of the source with it at the keys v1.3 and the draft looked at, by the classes below, read with v1.3's English at the key the pointer names and the key of the entry the English stands in:
  - **A** a served row of the same source has the English there;
  - **B** the catalog holds the source's own row with the English there, and the store serves the English there only under other sources (which, by m id);
  - **C** the catalog holds the source's own row with the English there, and the store serves the English there under no source;
  - **D** the catalog holds no row of the source with it there, and another source serves it there;
  - **E** the catalog holds no row of the source with it there, and no row serves it there.
  And, apart from the class, whether a served row of the same source has v1.3's English at the line's own key; and the catalog rows of the source that cite another entry (`also_in_the_source`).
- `naming-changes-v1.4.jsonl`: every slot whose entry named changes by section 3, with v1.3's naming and v1.4's.
- `pointer-resolutions-v1.4.jsonl`: every slot whose English changes because a sense is a pointer by its own words (section 2), with what v1.4 makes of it.
- `receipt-v1.4.json`: the inputs by placeholder and sha256, and every count.
- `verify-receipt-v1.4.json`: the second count (section 9).
- `against-the-draft-v1.4.jsonl` and `against-the-draft-receipt-v1.4.json`: every slot whose state differs from the draft's, with the cause.

## 9. Checks (each a stop)

- The map is 3,015 lines with the sha256 v175 shipped; the 458 are 458 lines at 58,007 places; the store is 4d1357b26ca5; the same-source m ids are those of section 1.
- v1.3's English is read again from the file for every slot that has a file entry, by v1.3's own test; the file must give it each time.
- v1.3's naming is made again by v1.3's steps for every Kaikki slot; it must agree, except where v1.3 used the reading's own pointing (listed, and kept).
- Every served row named anywhere in the map v1.4 (v1.3's rows that stand and v1.4's new rows) stands in the store at its key and rank, with its m id and route text, and its sha16 where written.
- No ruled print has a served row of the same source with its English at any of its three keys.
- No prefix target names the letter's own entry.
- A separate verify (`verify-pointer-map-v1.4.mjs`) takes another road: its own parse of the map, the changed lines, the files and the store. It re-reads every ruled print from its file, recounts every served-row resolution from the store, recounts the own-key resolutions, the prefix slots and the 458's fates, and must agree with the builder on every count.
- The builder, the verify and the comparison with the draft run twice with the same inputs to the same bytes.
- No written file holds a path of this machine or the home folder's name.

## Amended after the first run, before any ship

- **A pointer followed names no letter, but keeps its own reason.** The first run applied amendment B inside a pointer followed: at line 1332 (לן, «alternative form of לָהֶן»), the pointer followed from לָהֶן writes ל־ and names several entries, the first of them the letter's own entry, and the reason became `THE_TARGET_POINTS_ON_TO_A_PREFIX_IS_NOT_THE_LETTERS_ENTRY`. A pointer followed has no ruling 7 branch, so the letter's entry was never named there. Amendment B now applies to a pointer followed only where it would name the letter's own entry as its one entry; where it names several, the reason stays `THE_TARGET_POINTS_ON_TO_SEVERAL_…`, as in v1.3.
- **The guards the first run showed were wanting.** No English v1.4 prints may be the text of a FORM_OF line of the map (the dropped test of section 2 would have marked some senses of the files, counted in the receipt as `pointer_test.map_text_test_would_add`; the builder stops if any of them is the English of a slot). A naming v1.3's steps do not make again must be a spelling's own pointing, by its relation (v1.3's list of spelling relations), and it is not amended. A slot that stays unresolved under another reason than v1.3's is a change, and is written.

## Amended after the check of the ship draft, 14 November, before any ship

A second seat checked the strand. It found that one part of section 5 was carried on the ruled prints only. These amendments follow.

- **A served row that follows a pointer carries both entries.** Where v1.4 set a served row by following a pointer, the row named only the entry the English stands in (its `entry`), and the line lost the entry the pointer names. So it was at three of the 458: חדשים (line 864), ידים (line 1032) and מאלף (line 1390), and at every row v1.4 sets with `how` `followed_one_pointer`. Now such a row also carries `named_entry` `{entry, headword}` and `followed` `{from_sense, word, entry, by}`, as the ruled print does (section 5). Its `entry` stays the entry the English stands in. v1.3's own served rows that followed a pointer, which v1.4 does not set again, stand as v1.3 wrote them: their `entry` is the entry followed to. The receipt counts them (`v1_3_rows_that_followed_a_pointer_standing`).
- **`resolved_in_v1_3` keeps v1.3's entry.** Where v1.3 did not serve the slot, `resolved_in_v1_3` is now `{why, english, entry, sense, how}`. The last three are v1.3's `not_served` fields, null where v1.3 had none. Where v1.3 served the slot, it stays `{key, m, rank, text}`.
- **The names gate's mark is counted, not acted on.** A store row can carry the names gate's mark (the row's slot 10, `name`). The page withholds such a row where the place is not a name. The receipt lists every row v1.4 sets that carries it (`served_rows_set_by_v1_4.with_the_names_gate_mark`). The map does not change for it. What the pointer's pill prints at such a place is the page's call.
- **Checks added (section 9).** The builder stops if a served row v1.4 sets follows a pointer and does not carry both entries, and if a line of the 458 that follows a pointer does not carry both entries in the map, on its served row or its ruled print. The verify checks both by its own road. It also checks that every `resolved_in_v1_3` of a slot v1.3 did not serve names v1.3's entry, and it counts the names gate's mark from the store.

## 10. Not decided here

For the owner and the page, not the corpus lane:

- Ruled prints that read the letters as another word at Bible places (as «happiness» at אשר): the source's own reading of the letters, as the pointer's text was. The ruling makes their English visible; whether a gate holds them back at places of another word is for the owner and the page.
- Whether ruling 7 reaches a pointer followed that names several entries (as v1.3 is written, it does not, and those lines stay unresolved).
- The English that the catalog holds as the source's own rows but the store serves under another source or none (classes B and C): that belongs with the fold work (relay v188), not with this map.
- Whether a prefix target should name the prefix's own entry where the file has one (amendment B leaves the slot unresolved).
- (Added after the check of the ship draft.) Readings that print alike, the serving lane's ask 4 of 13 November. Where a slot resolves at the line's own key (section 4), the pointer's pill and the row it resolves to print the same English on the same card. Whether they are one pill is for the owner and the page. Where that row carries the names gate's mark, what the pointer's pill prints at a place that is not a name is the page's call.
