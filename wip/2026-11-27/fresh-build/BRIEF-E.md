# Builder E: the entries — each dictionary by its own id and its own structure, and the bridges to it

Read `S/s42w/FRAME.md` first (the why, the rule, the house rules, where the sources are). `S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`.

**Your sandbox:** `S/s15` (a git worktree at live `main`, ea6e1ad08e, clean). Your tools go in `reader/tools/` there, your output in `reader/data/place-answers-v1/entries/` and `…/bridges/`, your own scratch, downloads and logs in `S/s44w/`.

## What you make

Each dictionary of the twelve that is filed by entry, read from its own file into its own entries, keyed by its own id, with its own structure kept whole; and the bridge from STEP's tag to each. Nothing comes from today's store.

For each source below: `entries/<source key>.json.gz`, one record per entry by the source's own id. Every string is byte for byte a run of the source's file (white space inside a field kept as the source has it; say where a tag stood). The source's structure is held as the source gives it, not flattened into a list of rows:

| Source (key) | Read from | Keep |
|---|---|---|
| Strong's dictionary (`openscriptures_strongs`) | `S/w39/out/C2/dl-os/HebrewStrong.xml` | the entry number; the headword pointed, its language and part of speech; the derivation; the meaning; **the list of renderings as Strong lists it**, each item whole as he condensed it («be(-come, accomplished, committed, like)» is one item), each with his sign if it has one («+», «×»); his pointers to other entries as links, apart from the last rendering. The file lost many «+» signs (a rendering that opens after two or more blanks marks the place): keep that trace as a fact on the item, and where the Wikisource edition of the same entry writes the sign, say so. Read his own key in `S/w39/out/C2/x-front/`. |
| Strong's, the Wikisource edition (`wikisource_strongs_explicit_forms`) | `S/w39/out/C2/x-dict/` | per entry: the definition whole; where the list of renderings opens (the edition's sign for «:—»); the items; the entry's spelled forms and the verses it lists for them. This edition is the witness for Strong's signs. |
| STEP's TBESH (`stepbible_tbesh_gloss`) | `S/s38w/dl-step-latest/` | the line by STEP's lettered number: the gloss whole, the relation column, the morph column. Not the Meaning column (the file asks permission for it). |
| BDB, Open Scriptures (`openscriptures_bdb_1906`) | `BrownDriverBriggs.xml`, `LexicalIndex.xml`, `BdbSchema.xsd`, `readme.md` | the entry by BDB's id with its type (a root entry is a root), its numeral, its part of speech; its senses in their own nesting with their numbers and stems; each `<def>` in its place in the running text, with the text around it where the tag broke a word («(sun)set», «I (we) pray»); each `<ref>` with the sense it stands in. |
| BDB, unabridged (`unabridged_bdb_1906`) | `S/w39/out/C2/dl-ubdb/` | the record by BDB's id with its Strong's numbers and its language; its numbered points in order; in each point the main gloss, the italic runs **with what each is** where the record's own structure tells (a gloss; a written-out grammar word; another language; the wording of a verse that a reference follows), and the references. |
| The UBS dictionary (`ubs_sdbh_hebrew_v0_9_2`) | fetch its JSON from the provider (the tree's `data/ubs-collocations/PIN.json` names the file and sha256 1686a25d…; find the provider's public repository; if a later version is published, take the later and say what changed) | the lexical entry, its base forms, each sense with its definition and glosses, the verses each sense cites, the Strong's codes and where in the structure they sit (entry, base form or sense). |
| The Lexical Index (`openscriptures_lexical_index`), UHAL (`unfoldingword_uhal`) | `LexicalIndex.xml`; fetch UHAL from unfoldingWord | the entry by number, as given. |

Leave for now, and say so: the SDBH as HiperBiblia gives it (a second copy of the UBS dictionary's work, read from a web page), BiblicalTools (read from a web site), Davidson (85 rows read from page images).

**The bridges**, `bridges/step-tag-to-entry.json.gz` and one small file per source: for every tag STEP's TAHOT uses on any part of any word (roots and prefix or suffix tags alike; read them from the four TAHOT files), the entry or entries of each source it reaches, and **how**: by the number alone; by the number and STEP's letter where the source itself parts the number (TBESH does by design; for BDB say what in the files, if anything, tells which BDB entry a lettered tag is: TBESH's own columns, the Lexical Index, the unabridged file's numbers); by nothing (the source has no entry). Count every tag and every word of the 39 books it stands on: exact (one entry), ambiguous (several, with what would part them), absent. Do not guess a parting; an ambiguous bridge is held as ambiguous with all its entries.

A second bridge, from the verse: for BDB (both files) and the UBS dictionary, an index from verse to the senses that cite it (`bridges/verse-to-sense-<source key>.json.gz`), in the source's own book names mapped to ours by a table you state. Count how many of the 23,206 verses each source cites, and how many senses.

`PIN.json` entries for your sources; one command that makes all of it again from the files; a check (`reader/tools/check-place-answers-entries-v1.mjs`) that holds every string to its source file and every count.

## Prove it

1. **Counts per source:** entries, senses, renderings or glosses, references; strings held byte for byte (all of them, by machine).
2. **The bridge:** tags by how they reach each source; words of the 39 books by the same (take the tags per word from STEP's files directly: 305,652 rows). In particular the lettered homonyms: how many words stand on a lettered tag whose number reaches two or more BDB entries, and what the files give to part them.
3. **Against today's faults**, to show the structure answers them (each from the reports under `/home/user/mashiachsonyosef.github.io/wip/2026-11-27/accuracy-pass/`): Strong's H1961 holds «be(-come, accomplished, committed, like)» as one item; H68 marks «carbuncle» as signed; BDB's «preposition» on the entry of «until» is held as a grammar word, not a gloss; «(sun)set» is whole; the UBS entry of the letters of «so» keeps «mosquito» under its own base form with its own number and verses; BDB and Strong's are reached at «go» of Amos 7:12 (STEP's H1980) by the tag.
4. **Read by hand** 10 entries per source across the alphabet against the source's file as a person reads it.
5. **As words:** a script that prints, for a STEP tag, what each source says under it, in plain text. Print it for the root tags of Genesis 1:1 (seven words), H1961, H1980, H5704 («until»), H3651 with its letters («so»), into your final message.

## Hand back

Your final message, whole (no word limit): per source what its structure gave and what you kept, the counts, the bridges by how, the printed tags, what the files do not tell, the sizes, the one command that makes it again, and the paths of everything.
