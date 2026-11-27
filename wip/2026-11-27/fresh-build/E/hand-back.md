BUILDER E: THE ENTRIES AND THE BRIDGES — hand-back, 27 November 2026

S = /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad

SUMMARY

Eight dictionaries are read from their own files into their own entries, keyed by their own ids, structure kept whole; the tag bridge and three verse bridges are built; a check holds every string to its source and passes; nothing came from what the site serves today. Nothing is committed, pushed or shipped; zone.html is untouched; the sandbox holds only new, untracked files.

One command makes all of it again (21 seconds; two runs give identical bytes, PIN.json names every made file's sha256):
  cd S/s15 && node reader/tools/build-place-answers-entries-v1.mjs S/s44w/sources-entries.json
The check (40 seconds), exit 0, «place answers, entries and bridges: everything holds»:
  node reader/tools/check-place-answers-entries-v1.mjs S/s44w/sources-entries.json
As words: node reader/tools/say-place-answers-tag-v1.mjs [--full] H1961 H1254A …
Counts as tables: node reader/tools/say-place-answers-counts-v1.mjs

Four things the lead should know first:
1. STEP's own file says which BDB entry a lettered tag is. TBESH's first column (eStrong#) writes the Open Scriptures letter on each line («H1254a» on the line of H1254A), and the Lexical Index carries that letter (strong="1254" aug="a") beside BDB's id. By that declared road the Open Scriptures BDB is exact at 11,407 of 11,412 dictionary tags; «be fat» cannot stand on «he created».
2. The unabridged BDB cannot be parted by the files: its number column is a loose list (one record lists up to 8 numbers, one number stands on up to 9 records). 2,926 tags on 185,307 words reach several records. All are held; what the files state that could part them is measured, not applied (below).
3. Neither Strong's file writes «be(-come, accomplished, committed, like)». Both editions write «be(-come), accomplished, committed, like)», a bracket closed twice. It is held as ONE item in the file's own bytes, marked unbalanced (4 comma pieces held whole), never cut into «accomplished», «committed», «like)».
4. Measured in passing (builder P's ground): MACULA's SDBH sense mark is not an id of the published UBS file. Of 244,734 marked rows the mark is a sense id of v0.9.4 at 165,727, but that sense cites the row's verse at only 35,401 (v0.9.2: 166,725 and 36,158), evenly over all 39 books. The ids were renumbered. UBS's own address for a place is its reference list (verse and word number), which the verse bridge holds. Scripts: S/s44w/macula-probe.mjs, macula-probe3.mjs.

What I could not get: UHAL from its provider (git.door43.org is refused from this machine, 403; no public copy elsewhere), and seven of the nine Wikisource pages. Both are read from the corpus lane's record files as far as those reach (151 UHAL files; 6,178 of 8,674 Wikisource entries), said plainly in each file and in the bridge («absent here: the file is not on hand»).

FULL REPORT

A. THE SOURCES (PIN.json has each with bytes and sha256)

| key | read from | provider revision |
|---|---|---|
| openscriptures_strongs | HebrewStrong.xml, sha256 a628f4f8…bdd0c4 | openscriptures/HebrewLexicon 21c9add1 |
| openscriptures_bdb_1906 | BrownDriverBriggs.xml 2b52658a…c38f8 (+ BdbSchema.xsd, readme.md read) | same |
| openscriptures_lexical_index | LexicalIndex.xml 8f7a605c…c85f | same |
| stepbible_tbesh_gloss | TBESH 848eef2a…5dbb | STEPBible-Data 5de0a47f (latest) |
| (tags) | the four TAHOT files of the same revision | same |
| unabridged_bdb_1906 | the zip 056276bd…98e6; its member csv 5e865974…2ccc, inflated by the tool | eliranwong 6e8326c6 |
| wikisource_strongs_explicit_forms | the lane's record file M14.jsonl 652e4ad8…1c04 (5,806 entries) and the page H1 as fetched 16b4a3aa…9a9b (1,000 entries) | Hebrew Wikisource, cached 12 July / 23 September 2026 |
| ubs_sdbh_hebrew_v0_9_2 | UBSHebrewDic-v0.9.4-en.JSON 28d0b53a…8217 (+ README, LICENSE) | ubsicap/ubs-open-license a15a96cf, 21 October 2026 |
| unfoldingword_uhal | the lane's record file M7.jsonl 90c16984…a229 (151 files) | cached by the lane 12 July 2026 |

The UBS dictionary: the provider's public repository is github.com/ubsicap/ubs-open-license (dictionaries/hebrew/JSON). The file the tree pins (v0.9.2, 1686a25d…) stands at revision 3a6edd82 and I fetched it and confirmed the hash. The provider has since published v0.9.3 (22 September) and v0.9.4 (21 October); I took v0.9.4. What changed, by my count (PIN.json, ubs_earlier_version): entries 7,932 → 7,943; base forms 8,902 → 8,918; senses 16,224 → 16,619; glosses 23,881 → 24,566; references 260,813 → 291,411; 894 lemma strings only in the earlier and 905 only in the later (an earlier helper's finer comparison, S/w39/out/U/, reads this as 894 lemmas respelled and 11 entries added); the MainId of 4,226 entries of the same lemma moved; StrongCodes changed at 3. Ids are not stable between versions.

The two record files came out of the lane's store part v2/corpus/dictionary-store/build/TEXT-PART-v1.tar.gz (204,429,054 bytes, sha256 f1c6b41a…e29c), downloaded read only, the two members taken, the archive deleted.

Left for now, as the brief says: the SDBH as HiperBiblia gives it, BiblicalTools, Davidson.

B. PER SOURCE: WHAT ITS STRUCTURE GAVE, WHAT IS KEPT, THE COUNTS

How strings are held. The marked-up sources (the three Open Scriptures files, the unabridged BDB) are kept WHOLE as a tree or a run of pieces that writes back to the file's bytes; the check writes every entry back and compares bytes (0 of 8,674 + 11,845 + 10,221 + 10,022 differ). Beside it a view says where each tag stood, every string by its offset. The file's own character references (&amp;) stand as written; a reader that prints resolves them (the lib's printable). No blank is closed, nothing respelled.

1. Strong's, Open Scriptures. 8,674 entries. Kept: headword with part of speech, pronunciation, transliteration, language; derivation, meaning and usage as running text with where each def (15,469) and each link to another entry (7,934) stood; the provider's 167 notes apart from Strong's words. In the usage, his list as he lists it: 20,345 renderings, each whole (cut only at commas outside every bracket), the sign apart: × on 838, + on 38. The lost + sign: 453 renderings open after two or more blanks with no sign; the Wikisource edition writes + on the same rendering of the same entry at 447, has no entry on hand at 4, does not list it in those words at 2. The same trace inside an item («(  as) yet» for «(+ as) yet»): 35, Wikisource writes the sign there at 32. Unbalanced runs held whole: 19 items holding 22 comma pieces. What follows the list's stop is apart: 266 pointers («See», «Compare») with their links, plus his remarks. 3 empty pieces (a trailing comma in the file).

2. Strong's, Wikisource. 6,178 entries on hand of 8,674 (1,000 from the page file, 5,178 from records; the 628 in both are identical). Kept: headline, the definition whole, where the list opens, the items, what follows, links (5,129), the form lines. The edition's sign for «:—»: a colon at 6,013, «: -» 77, «:--» 39, «; --» 16, «; -» 10, «:-» 3; no sign at 20 entries, which are held whole and uncut. 17,722 renderings; X on 828, + on 490; 20 unbalanced. Forms: 6,163 form lines, 20,775 spelled forms, 242,791 verses listed, every one read to our book, chapter and verse (table of Hebrew book names in the lib, by code points).

3. TBESH. 11,682 lines by STEP's lettered number; the first seven columns as the file has them; the Meaning column not taken (the check asserts it). 4,350 lettered by STEP; 1,424 carry an Open Scriptures letter in the first column; 2,098 name a relation («a Meaning of», «in Aramaic of», «a Part of»).

4. BDB, Open Scriptures. 11,845 entries in 46 parts and 2,599 sections; 2,595 marked root; 1,934 with a numeral; 2,787 marked form="false". 8,989 senses in their own nesting (6,427 numbered), 3,149 stems, 21,343 defs, 3,952 refs (905 inside a sense), 9,195 pos. Each def carries: the sense it stands in; `joined` where the tag broke a word (111: «(sun)set», «(mountain-)slope», «(Deer-field)»); `phrase` where neighboring defs are one phrase parted only by brackets and the brackets balance (240 defs: «I (we) pray», «emit (show) redness»); in_bracket and before_first_sense (2,007 defs stand in a bracket of an entry's opening or of an entry with no sense: with type root these are a related word's or a name's meaning); after_hebrew and ref_next (285 defs are followed directly by a reference). 34 defs of one letter. Nothing is decided about a def; the facts are stated.

5. The Lexical Index. 10,221 entries (9,432 Hebrew, 789 Aramaic) as given: headword, transliteration, part of speech, gloss (9,304), xref (BDB id 10,175; Strong's number 9,299; added letter 1,157; TWOT 7,303), etymology line.

6. BDB, unabridged. 10,022 records (9,263 Hebrew, 759 Aramaic); 9,176 carry numbers, 10,636 in all. 11,522 paragraphs (the file parts them by <hr>), 9,802 points and sections, 4,511 sub-points, 165,681 references (all of the file's regular shape). 57,429 italic runs, each with what it is by its place among the record's own tags: main_gloss 7,190 (the provider's highlightword tag in a head); tagged_gloss 640 (the same tag inside a point); grammar_word 7,163 («Imperfect», «Infinitive construct»); other_language 1,969 (inside the transliteration tag, or after Latin, German, French, Vulgate); abbreviation 1,547 (id., ib.); outline_letter 606; verse_wording 1,754 (Hebrew right before, a reference right after); rendering_of_hebrew 4,215 (Hebrew right before, no reference); opening 6,456 (the first italic run of its head, point or sub-point, before its first reference, outside brackets); unclassed 25,889 (the structure does not tell). 27,278 bold runs held too: in a head they are the provider's written-out part of speech and stem, at a point its number. The file's tags do not nest (a point's div closes after its paragraph in 3,207 records), so the record is a run of pieces, not a tree; all divs pair.

7. The UBS dictionary. 7,943 entries, 8,918 base forms, 16,619 senses, 24,566 glosses, 16,615 definitions, 291,411 references, 2,265 notes, under the file's own field names. Where the Strong's codes sit: on the entry only. Counted: 0 codes on a base form or a sense. 9,092 codes; 6 entries with none, 6,991 with one, 946 with several; 469 entries have several codes and several base forms, and the file does not say which code is which base form's. 697 codes carry a letter of UBS's own (H0859b), 659 are Aramaic (A3652), 34 of another shape (two joined by +, a bare number).

8. UHAL. 151 files on hand, each whole, with a view of its own headings: 444 senses, 384 with a gloss, 793 glosses, 57 citations, 151 with a BDB reference (the Open Scriptures BDB id the file itself links to). Two files use other labels (Lexical Entry, Root Lexeme, a title after the sense number); the reader knows both shapes.

C. THE TAG BRIDGE (bridges/step-tag-to-entry.json.gz)

STEP's files (latest): 305,648 rows (the pinned revision has 305,652), 540,463 tagged parts, 11,461 distinct tags; 305,671 root parts (305,597 rows with one root, 37 with several, 14 with none). 49 tags are STEP's own numbers for prefixes, suffixes and marks (H9001 to H9049), standing on 240,873 parts and 6,081 root parts; no dictionary of Strong's numbers has them.

Tags | words by their root tag | how:

| source | exact | ambiguous | absent |
|---|---|---|---|
| Strong's (Open Scriptures) | 11,412 tags, 299,590 words, by the number alone | 0 | only STEP's own 49 |
| Strong's (Wikisource) | 7,887 / 277,102 by the number | 0 | 3,525 / 22,488 file not on hand |
| TBESH | 11,440 / 305,288 by STEP's own lettered number; 11 / 54 by the number alone | 10 / 329 (the tag is no line of TBESH; its number has several) | 0 |
| Lexical Index | 10,025 / 240,505 by the number alone; 1,382 / 59,046 by number and Open Scriptures letter | 4 / 9 | 1 / 30 (H2007) |
| BDB (Open Scriptures) | the same, through the index's BDB id | 4 / 9 | 1 / 30 |
| BDB (unabridged) | 8,424 / 113,602 by the number alone | 2,926 / 185,307 | 62 / 681 (H4725 at 401) |
| UBS dictionary | 10,368 / 241,897 by the number alone | 988 / 29,261 | 56 / 28,432 (H5921A 5,764; H0413 5,518; H3605 5,415; H3588A 4,336: the file has not reached these words) |
| UHAL | 138 / 6,503 | 0 | 11,274 / 293,087 file not on hand |

The lettered homonyms. 1,367 tags on 58,443 words stand on a number that reaches two or more Open Scriptures BDB entries. 1,363 of them (58,434 words) are parted by the Open Scriptures letter that TBESH's first column gives; 4 tags on 9 words are not (H1719C, H5867C, H5892I, H7417I: TBESH's first column gives them no letter or one the index lacks) and hold all their entries. Measured, not used: on the 1,382 tags bridged by letter, TBESH's headword and the index's agree in letters at 1,372; the 10 others are one word spelled or cut differently. The check holds every bridge line to the entries it names.

The unabridged BDB. The README says only «Strong's number mapping, where applicable (2nd column)». Ambiguous tags by records reached: 2,137 with two, 560 three, 129 four, 100 five to nine. Every record is held, each with its language, numeral, headword, main gloss and its column's numbers (bridges/step-tag-to-unabridged_bdb_1906.json.gz). What the two files themselves state that could part them, counted and NOT applied: one record of the tag's language (TBESH's Morph says H: or A:; the record says BIBLICAL HEBREW or ARAMAIC) 468 tags / 65,277 words; one record lists the number first 910 / 50,661; language and first place together 1,157 / 93,186; one record carries BDB's own numeral of the Open Scriptures entry the tag reaches 898 / 42,965; any of these 1,854 / 116,894; the facts name different records at 21 tags; left ambiguous by all of them 1,072 tags / 68,413 words. Also: both BDB files keep BDB's order (the README says so) with 11,522 paragraphs against 11,845 entries; an alignment in order would be a bridge of ours, not built.

UBS. Where a number stands on several entries they differ by UBS's own letter on the code, which is not STEP's letter (of 698 lettered codes 282 have no TBESH line of that letter and 61 have another headword), so the bridge is by the number alone and holds all. At a place the verse bridge parts them.

D. THE VERSE BRIDGES (bridges/verse-to-sense-<key>.json.gz), of our 23,206 verses

| source | references | indexed | verses cited | senses citing | entries citing | book names |
|---|---|---|---|---|---|---|
| BDB (Open Scriptures) | 3,952 | 3,897 | 3,021 | 2,932 | 2,826 | OSIS (r="Job.8.12") |
| BDB (unabridged) | 165,681 | 164,499 | 22,954 | 19,669 heads, points and sub-points | 9,030 | the book's number in English order (b="18") |
| UBS dictionary | 291,411 | 291,319 | 23,206 | 16,617 of 16,619 | 7,884 | BBB of BBBCCCVVVSSWWW, English order |

Each table is written into its file. A reference is taken at the chapter and verse the source writes and indexed only where our text has a verse of that number; nothing is moved. Not indexed: Open Scriptures BDB 22 outside the 39 books, 21 of another shape, 12 to verses our text does not number so (the provider's slips: Judges 8:52); the attribute and the shown verse differ at 4 only, so the attribute follows BDB's printed numbering. Unabridged: 96 New Testament, 1,076 not numbered so (slips such as 1 Kings 50:1, and Exodus 20:24 to 25); the provider writes a whole chapter as verses 1 to 200 (323 such), held apart under chapters_cited_whole, not spread over verses. UBS: 89 not numbered so (Exodus 20:24 to 25, Deuteronomy 5:31 to 33, Numbers 25:19: the Decalogue's two numberings), 3 of another shape; 2,811 carry a note caller after the reference and are read. A UBS value is [LEXID, word number], so at Exodus 8:13 «so» (word 6) and «mosquito» (word 66) part by the word.

E. THE PROOFS

1. Counts and strings held, by machine (the check's own tally): Strong's 87,149; Wikisource 298,950; TBESH 81,774; BDB Open Scriptures 68,606; Lexical Index 49,271; BDB unabridged 94,729; UBS 513,213; UHAL 2,187; bridge lines 91,688; verse values 3,897 + 165,220 + 291,319. The check also counts tags in the files themselves (entries, defs, refs, senses, roots, references, points) against the entries, recounts the tags and rows from STEP's four files with its own reading, and compares PIN.json. It can fail: ten plants in copies of the output (a rendering, a BDB def, a BDB tree, a TBESH gloss, a UBS gloss, an unabridged piece, a Wikisource verse, a bridge id, a bridge count, a verse value) each gave exit 1 naming the plant (S/s44w/plant.mjs, plant-*.log).

2. The bridge: section C.

3. Against today's faults (S/s44w/prove-faults.mjs):
- H1961: both editions hold one item {"t":"be(-come), accomplished, committed, like)","unbalanced":true,"comma_pieces_held_whole":4}; 17 items in all; «accomplished» is no item.
- H68 «carbuncle»: {"blanks_before":2,"lost_sign_trace":true,"wikisource_sign":"+"}; Wikisource {"t":"carbuncle","sign":"+"}.
- BDB unabridged «until» (BDB5808): bold in the head ["preposition"]; main gloss ["as far as, even to, up to, until, while"]; italic runs whose text is «preposition» or «conjunction»: 0. In this file the word is bold, not italic: a grammar label, held as one.
- «(sun)set»: p.ff.ab, def {"t":"set","joined":{"before":"(sun)","whole":"(sun)set"},"before_first_sense":true}. «I (we) pray»: n.ab.aa, three defs, one phrase.
- UBS, the letters of «so» (003347000000000, codes H3651 A3652 H3653 H3654 on the entry): base form 1 adv «thus, in this manner, in this way, so» 561 verses; base form 2 adj «pedestal, base» and six more senses; base form 3 adv «enough»; base form 4 noun m, sense 003347004001000 «mosquito», 5 verses (Exodus 8:12, 13, 14; Psalm 105:31; Isaiah 51:6). At Genesis 1:7 only the «so» sense cites the verse.
- Amos 7:12 word 6: STEP's row «go» {H1980G}. Strong's exact H1980 (41 renderings); BDB Open Scriptures exact e.bn.aa «go, come, walk»; unabridged ambiguous among BDB2162 (the article), BDB4419, BDB4423 (two cross-reference records); UBS exact.
- «be fat» on «he created»: H1254A → b.cw.aa «shape, create»; H1254B → b.cx.aa «be fat».

4. Read by hand: 10 entries per source spread over each id list (at 3, 13 … 93 percent), the file's bytes beside what is held (S/s44w/hand.mjs), 80 in all. All 80 say what the file says. What the reading found and mended: two UHAL files of another shape (H0215, H0216) whose senses were not read. What it showed and I left as the file's own: Wikisource H853 heads the entry with another word's letters; BDB5312's highlightword runs on into «according to»; BDB301's name meaning in a bracket is unclassed, rightly.

5. As words. STEP uses no bare H1980 (its tags are H1980G to O; G is printed, the tag at Amos 7:12). Genesis 1:1's seven words have six root tags (H0853 twice). H3651A and B are printed where they differ from C. Lines are shortened at 300 characters; --full prints all. The whole output is S/s44w/say-tags.txt.

══ H7225G ══
  STEP: stands on 41 words (41 parts; the root of 41)
  STEP's TBESH — EXACT: by STEP's own lettered number
    H7225G  רֵאשִׁית  re.shit  H:N-F  gloss «first: beginning»  first column H7225
  Strong's (Open Scriptures) — EXACT: by the number alone
    H7225  רֵאשִׁית (ray-sheeth')  n-f, heb
      derivation: from the same as 7218;
      meaning: the first, in place, time, order or rank (specifically, a firstfruit)   [tagged: first | firstfruit]
      his list of renderings (4): beginning | chief(-est) | first(-fruits, part, time) | principal thing
  Strong's (Wikisource) — EXACT: by the number alone
    H7225  רֵאשִׁית (ray-sheeth')
      definition: from the same as [[../H7#7218|רֹאשׁ]]; the first, in place, time, order or rank (specifically, a firstfruit): beginning, chief(-est), first(-fruits, part, time), principal thing.
      the list opens at «:» (4): beginning | chief(-est) | first(-fruits, part, time) | principal thing
      spelled forms: 3 (ראשית, ראשת, רשית)  in 49 verses listed
  Lexical Index — EXACT: by the number alone
    lqb  רֵאשִׁית  N  «beginning»  → bdb t.ad.ag, strong 7225, twot 2097e  etym sub
  BDB (Open Scriptures) — EXACT: by the number alone
    t.ad.ag  רֵאשִׁית  [entry]  n.f  status base
      before any sense: «beginning», «chief»
      sense 1. a.: «beginning»
      sense 1. b.: «first»
      sense 2.: «first», «chief»
  BDB (unabridged) — EXACT: by the number alone
    BDB7684  רֵאשִׁית  [BIBLICAL HEBREW; numbers in the record's column: H7225]
      bold in the head (grammar, stems): noun feminine
      main gloss: «beginning, chief»
      point 1.: (opens with no italic run)   sub-points: a. «beginning»; b. «first»
      point 2.: «first chief»   9 refs
      italic runs by kind: main_gloss 1, opening 3, unclassed 9
  UBS dictionary — EXACT: by the number alone
    006658000000000  רֵאשִׁית  codes on the entry: H7225  (1 base forms)
      base form 006658001000000  noun f
        sense 006658001006000  «first»  — = state in which a countable entity is the first or the previous in a range  [23 verses, first 001049003]
        sense 006658001001000  «beginning»  — = point in time at which an event starts happening  [17 verses, first 001001001]
        sense 006658001002000  «best»  — = state in which an object is of a relatively high quality  [7 verses, first 005033021]
        … 3 more
  UHAL — ABSENT: the source has the entry but its file is not on hand

══ H1254A ══
  STEP: stands on 53 words (53 parts; the root of 53)
  STEP's TBESH — EXACT: by STEP's own lettered number
    H1254A  בָּרָא  ba.ra  H:V  gloss «to create»  first column H1254a
  Strong's (Open Scriptures) — EXACT: by the number alone
    H1254  בָּרָא (baw-raw')  v, heb
      derivation: a primitive root;
      meaning: (absolutely) to create; (qualified) to cut down (a wood), select, feed (as formative processes)   [tagged: create | cut down | select | feed]
      his list of renderings (6): choose | create (creator) | cut down | dispatch | do | make (fat)
  Strong's (Wikisource) — EXACT: by the number alone
    H1254  בָּרָא (baw-raw')
      the list opens at «:» (6): choose | create (creator) | cut down | dispatch | do | make (fat)
      spelled forms: 12 (בורא, בוראי, ברא, בראת, בראתי, הברא, הבריא, יברא, … 4 more)  in 46 verses listed
  Lexical Index — EXACT: by the number and the Open Scriptures letter: TBESH's first column (eStrong#) gives the letter for this tag, and the Lexical Index carries it on one entry (aug)
    bxy  בָּרָא  V  «shape»  → bdb b.cw.aa, strong 1254, aug a, twot 278  etym main root ברא
  BDB (Open Scriptures) — EXACT: by the number and the Open Scriptures letter
    b.cw.aa  I. בָּרָא  [a ROOT entry]  vb  status base
      before any sense: «shape», «create»
      sense Qal: «shape», «fashion», «create»
      sense Niph 1.: «be created»
      sense Pi 1.: «cut down»
      sense Pi 2.: «cut out»
  BDB (unabridged) — AMBIGUOUS: the number reaches several entries and nothing in the files says which this tag is; all are held (2)
    BDB1300  I. בָּרָא  [BIBLICAL HEBREW; numbers in the record's column: H1254]
      bold in the head (grammar, stems): verb
      main gloss: «shape, create»
      point Qal: (opens with no italic run)   9 refs
      point 1.: (opens with no italic run)   16 refs
      point 2.: (opens with no italic run)   6 refs
      point 3.: (opens with no italic run)   6 refs
      … 6 more
      italic runs by kind: main_gloss 1, unclassed 9, other_language 2, rendering_of_hebrew 3, grammar_word 12, verse_wording 1, opening 3
    BDB1303  II. בָּרָא  [BIBLICAL HEBREW; numbers in the record's column: H1254]
      bold in the head (grammar, stems): verb
      main gloss: «be fat»
      point Hiph`il: (opens with no italic run)   1 refs
      italic runs by kind: main_gloss 1, unclassed 2, grammar_word 1
  UBS dictionary — EXACT: by the number alone
    001155000000000  ברא  codes on the entry: H1254  (3 base forms)
      base form 001155001000000  verb
        sense 001155001001000  «to create»  — = causative action by which a deity brings to existence something that did not exist befo…  [41 verses, first 001001001]
        sense 001155001002000  «to create (an event)», «to cause to happen»  — = causative action by which a deity causes something to happen that did not happen before  [7 verses, first 002034010]
      base form 001155002000000  verb
        sense 001155002001000  «to clear (by cutting)», «to carve»  — …  [4 verses, first 006017015]
        sense 001155002002000  «to cut down»  — literally: to cut; hence: = causative action by which humans kill other humans with the s…  [1 verses, first 026023047]
      base form 001155003000000  verb
        sense 001155003001000  «to fatten oneself»  — = causative action by which humans cause themselves to become fat by eating too much  [1 verses, first 009002029]
  UHAL — ABSENT: file not on hand

══ H0430G ══
  STEP: stands on 2385 words (2385 parts; the root of 2385)
  STEP's TBESH — EXACT: H0430G  אֱלֹהִים  e.lo.him  H:N-M  gloss «God»  first column H0430  relation: a Name of H3068G
  Strong's (Open Scriptures) — EXACT: by the number alone
    H430  אֱלֹהִים (el-o-heem')  n-m, heb
      derivation: plural of 433;
      meaning: gods in the ordinary sense; but specifically used (in the plural thus, especially with the article) of the supreme God; occasionally applied by way of deference to magistrates; and sometimes as a superlative   [tagged: gods | God | magistrates]
      his list of renderings (6): angels | × exceeding | God (gods) (-dess, -ly) | × (very) great | judges | × mighty
  Strong's (Wikisource) — EXACT: by the number alone
    H430  אֱלֹהִים (el-o-heem')
      the list opens at «:» (6): angels | X exceeding | God (gods)(-dess, -ly) | X (very) great | judges | X mighty
      spelled forms: 3 (אלה, אלהי, אלהים)  in 2244 verses listed
  Lexical Index — EXACT: by the number alone
    arn  אֱלֹהִים  N  «gods»  → bdb a.dl.ad, strong 430, twot 93c  etym sub
  BDB (Open Scriptures) — EXACT: by the number alone
    a.dl.ad  אֱלֹהִים  [entry]  n.m.pl  status base
      sense 1. a.: «rulers», «judges»
      sense 1. b.: «divine ones»
      sense 1. c.: «angels»
      sense 1. d.: «gods»
      sense 2. a.: «god», «goddess»
      sense 2. b.: «godlike one»
      sense 2. d.: «God»
      sense 3.: «the (true) God»
      … 1 more senses with a tag
  BDB (unabridged) — AMBIGUOUS (3)
    BDB430  אֱלֹהִים  [BIBLICAL HEBREW; numbers in the record's column: H430]
      bold in the head (grammar, stems): noun masculine plural | feminine
      main gloss: (the head carries none)
      point 1.: (opens with no italic run)   sub-points: a. «rulers, judges»; b. «divine ones»; c. ; d. «gods»
      point 2.: «Plural intensive.»   sub-points: a. «god or goddess»; b. «godlike one»; c. ; d.
      point 3.: (opens with no italic run)   132 refs
      point 4.: «God»   sub-points: a. ; b. «with persons»; c. «with suffix»   1 refs
      italic runs by kind: grammar_word 1, opening 9, unclassed 38, verse_wording 21, rendering_of_hebrew 11, outline_letter 3
    BDB2100  יהוה  [BIBLICAL HEBREW; numbers in the record's column: H3068 H3069 H1961 H430 H589 H2022 H6635]
      bold in the head (grammar, stems): proper name, of deity
      main gloss: «Yahweh»
      point 1.: (opens with no italic run)   4 refs
      point 2.: «the one bringing into being, life-giver»   1 refs
      … 6 more
      italic runs by kind: main_gloss 1, unclassed 17, opening 1, rendering_of_hebrew 4
    BDB2170  II. הָלַל  [BIBLICAL HEBREW; numbers in the record's column: H1984 H430 H3050]
      bold in the head (grammar, stems): verb | Pi`el
      main gloss: «be boastful», «praise»
      … (points of «praise»)
  UBS dictionary — EXACT: by the number alone
    000396000000000  אֱלֹהִים  codes on the entry: H0430  (1 base forms)
      base form 000396001000000  noun m
        sense 000396001001000  «heavenly beings»  — plural with plural meaning: = generic term for a supernatural being, worshiped by individ…  [182 verses, first 001031030]
        sense 000396001002000  «god (of someone)», «God (of someone)»  — plural with singular meaning: …  [1384 verses, first 001006002]
        sense 000396001003000  «God»  — plural with singular meaning: = the highest God, creator of heaven and earth  [1066 verses, first 001001001]
        … 7 more
  UHAL — ABSENT: file not on hand

══ H0853 ══
  STEP: stands on 10946 words (10946 parts; the root of 10946)
  STEP's TBESH — EXACT: H0853  אֵת  et  H:Part  gloss «[Obj.]»  first column H0853
  Strong's (Open Scriptures) — EXACT: by the number alone
    H853  אֵת (ayth)  prt, heb
      derivation: apparent contracted from 226 in the demonstrative sense of entity;
      meaning: properly, self (but generally used to point out more definitely the object of a verb or preposition, even or namely)   [tagged: self | even | namely]
      his list of renderings (1): [as such unrepresented in English]
  Strong's (Wikisource) — EXACT: by the number alone
    H853  אוֹת (ayth)
      the list opens at «:» (1): (as such unrepresented in English)
      spelled forms: 2 (אות, את)  in 6782 verses listed
  Lexical Index — EXACT: by the number alone
    bhu  אֵת  T  «mark of the accusative»  → bdb a.gm.aa, strong 853, twot 186  etym main root אות
  BDB (Open Scriptures) — EXACT: by the number alone
    a.gm.aa  I. אֵת  [a ROOT entry]    status base
      before any sense: «mark of the accusative»
  BDB (unabridged) — AMBIGUOUS (2)
    BDB853  I. אֵת  [BIBLICAL HEBREW; numbers in the record's column: H853]
      bold in the head (grammar, stems): mark of the accusative
      main gloss: (the head carries none)
      point 1.: (opens with no italic run)   sub-points: a. ; b. ; c. «neuter»; d.
      point 2.: (opens with no italic run)   sub-points: a. ; b. ; c.
      point 3.: (opens with no italic run)   51 refs
      italic runs by kind: unclassed 20, abbreviation 1, other_language 2, rendering_of_hebrew 3, outline_letter 1, grammar_word 2, opening 1
    BDB9600  יָת  [BIBLICAL ARAMAIC; numbers in the record's column: H853 H3487]
      bold in the head (grammar, stems): mark of accusative
      main gloss: (the head carries none)
  UBS dictionary — EXACT: by the number alone
    000791000000000  אֵת  codes on the entry: H0853 H0854 H0855  (3 base forms)
      base form 000791001000000  noun m
        sense 000791001001000  «mattock»  — exact meaning unknown; possibly: = wooden handle with an iron head …  [5 verses, first 009013020]
      base form 000791002000000  prep
        sense 000791002001000  «with», «together with»  — particle linking two entities …  [923 verses, first 001004001]
      base form 000791003000000  prep
        sense 000791003001000  «-»  — = a marker identifying the entity that is directly targeted by the event in focus, and wh…  [10944 verses, first 001001001]
  UHAL — ABSENT: file not on hand

══ H8064 ══
  STEP: stands on 421 words (421 parts; the root of 421)
  STEP's TBESH — EXACT: H8064  שָׁמַיִם  sha.ma.yim  H:N-M  gloss «heaven»  first column H8064
  Strong's (Open Scriptures) — EXACT: by the number alone
    H8064  שָׁמַיִם (shaw-mah'-yim)  n-m, heb
      derivation: dual of an unused singular שָׁמֶה; from an unused root meaning to be lofty;
      meaning: the sky (as aloft; the dual perhaps alluding to the visible arch in which the clouds move, as well as to the higher ether where the celestial bodies revolve)   [tagged: sky | aloft]
      his list of renderings (3): air | × astrologer | heaven(-s)
  Strong's (Wikisource) — EXACT: by the number alone
    H8064  שָׁמַ֫יִם (shaw-mah'-yim)
      the list opens at «:» (3): air | X astrologer | heaven(-s)
      spelled forms: 3 (שמי, שמים, שמימ)  in 395 verses listed
  Lexical Index — EXACT: by the number alone
    mzj  שָׁמַיִם  N  «heavens»  → bdb v.dy.ab, strong 8064, twot 2407a  etym sub
  BDB (Open Scriptures) — EXACT: by the number alone
    v.dy.ab  שָׁמַי  [entry, form not found (BDB's brackets)]  n.m  status base
      before any sense: «heavens», «sky»
      sense 1. a.: «visible heavens», «sky»
  BDB (unabridged) — AMBIGUOUS (2)
    BDB8792  שָׁמַי  [BIBLICAL HEBREW; numbers in the record's column: H8064]
      bold in the head (grammar, stems): noun masculine
      main gloss: «heavens, sky»
      point 1. a.: «visible heavens, sky», «rarely of angels», «before which fowl fly»   sub-points: b.    72 refs
      point 2. a.: «as abode of God»   sub-points: b.    53 refs
      point 3.: (opens with no italic run)   8 refs
      point 4.: (opens with no italic run)
      italic runs by kind: main_gloss 1, abbreviation 1, other_language 3, opening 1, tagged_gloss 3, unclassed 2, rendering_of_hebrew 1   (the record holds 2 paragraphs; the first is shown)
    BDB9965  שְׁמַ֫יִן  [BIBLICAL ARAMAIC; numbers in the record's column: H8064 H8065]
      bold in the head (grammar, stems): noun masculine plural
      main gloss: «heavens»
      point 1.: «sky»   20 refs
      point 2.: «heavens»   17 refs
  UBS dictionary — EXACT: by the number alone
    007463000000000  שָׁמַיִם  codes on the entry: H8064  (1 base forms)
      base form 007463001000000  noun m
        sense 007463001001000  «heaven», «sky»  — = the area above the earth, the location of sun, moon, and stars, the realm of the birds …  [420 verses, first 001001001]
        sense 007463001002000  «heavenly beings»  — literally "heaven", but with focus on the creatures that live there: = supernatural beings  [1 verses, first 018015015]
  UHAL — ABSENT: file not on hand

══ H0776G ══
  STEP: stands on 2318 words (2318 parts; the root of 2318)
  STEP's TBESH — EXACT: H0776G  אֶ֫רֶץ  e.rets  H:N-F  gloss «land: country/planet»  first column H0776  relation: in Hebrew of H0776H
  Strong's (Open Scriptures) — EXACT: by the number alone
    H776  אֶרֶץ (eh'-rets)  n-f, heb
      derivation: from an unused root probably meaning to be firm;
      meaning: the earth (at large, or partitively a land)   [tagged: earth | land]
      his list of renderings (10): × common | country | earth | field | ground | land | × natins | way | + wilderness | world
  Strong's (Wikisource) — EXACT: by the number alone
    H776  אָ֫רֶץ (eh'-rets)
      the list opens at «:» (10): X common | country | earth | field | ground | land | X nations | way | + wilderness | world
      spelled forms: 4 (ארץ, ארצ, ארצות, ארצת)  in 2190 verses listed
  Lexical Index — EXACT: by the number alone
    bep  אֶ֫רֶץ  N  «earth»  → bdb a.fx.aa, strong 776, twot 167  etym main root ארץ
  BDB (Open Scriptures) — EXACT: by the number alone
    a.fx.aa  אֶ֫רֶץ  [a ROOT entry]  n. f m  status base
      before any sense: «earth», «land»
      sense 1. a.: «earth»   sense 1. b.: «earth»   sense 1. c.: «earth»
      sense 2.: «land»   sense 2. e.: «land»
      sense 3. a.: «ground»   sense 3. b.: «soil»
      sense 4. a.: «people of the land»
      … 4 more senses with a tag
  BDB (unabridged) — AMBIGUOUS (2)
    BDB780  אֶ֫רֶץ  [BIBLICAL HEBREW; numbers in the record's column: H776]
      bold in the head (grammar, stems): noun feminine | masculine
      main gloss: «earth, land»
      point 1. a.: «earth»   sub-points: b. «earth»; c. «earth»   14 refs
      point 2.: «land»   sub-points: a. ; b. ; c. ; d. ; e. «land»; g. «Sh®°ôl»
      point 3. a.: «ground»   sub-points: b. «soil»   9 refs
      point 4.: (opens with no italic run)   sub-points: a. «people of the land»; b. ; c. ; d. ; e.
      … 1 more
    BDB9347  אֲרַע  [BIBLICAL ARAMAIC; numbers in the record's column: H772 H776]
      bold in the head (grammar, stems): noun [feminine]
      main gloss: «earth»
  UBS dictionary — EXACT: by the number alone
    000714000000000  אֶרֶץ  codes on the entry: H0776  (1 base forms)
      base form 000714001000000  noun f
        sense 000714001001000  «earth», «ground», «land», «country», «region», «area»  — = the earth as opposed to the sky; …  [2488 verses, first 001001001]
        sense 000714001002000  «short distance»  — literally: distance of land; hence: = a reference to a relatively short distance  [3 verses, first 001035016]
        sense 000714001003000  «heaven and earth», «universe»  — = a more or less fixed phrase: the heavens and the earth, …  [14 verses, first 001002004]
  UHAL — ABSENT: file not on hand

══ H1961 ══
  STEP: stands on 3562 words (3562 parts; the root of 3562)
  STEP's TBESH — EXACT: H1961  הָיָה  ha.yah  H:V  gloss «to be»  first column H1961
  Strong's (Open Scriptures) — EXACT: by the number alone
    H1961  הָיָה (haw-yaw)  v, heb
      derivation: a primitive root (compare 1933);
      meaning: to exist, i.e. be or become, come to pass (always emphatic, and not a mere copula or auxiliary)   [tagged: exist | be | become | come to pass]
      his list of renderings (17): beacon | × altogether | be(-come), accomplished, committed, like) [brackets do not balance in the file; held whole] | break | cause | come (to pass) | do | faint | fall | follow [the file lost the sign; Wikisource writes +] | happen | × have | last | pertain | quit (one-) self | require | × use
  Strong's (Wikisource) — EXACT: by the number alone
    H1961  הָיָה (haw-yaw)
      the list opens at «:» (17): beacon | X altogether | be(-come), accomplished, committed, like) [brackets do not balance in the file; held whole] | break | cause | come (to pass) | do | faint | fall | + follow | happen | X have | last | pertain | quit (one-)self | require | X use
      spelled forms: 30 (אהי, אהיה, הויה, היה, היו, היות, היי, היינו, … 22 more)  in 3131 verses listed
  Lexical Index — EXACT: by the number alone
    daq  הָיָה  V  «fall out»  → bdb e.bf.aa, strong 1961, twot 491  etym main root היה
  BDB (Open Scriptures) — EXACT: by the number alone
    e.bf.aa  הָיָה  [a ROOT entry]  vb  status base
      before any sense: «fall out», «come to pass», «become», «be»
      sense Qal I. 1. a.: «Fall out», «happen»
      sense Qal I. 1. b.: «occur», «take place», «come about», «come to pass»
      sense Qal I. 2.: «come about», «come to pass»
      sense Qal I. 2. a. (1).: «and it came to pass»
      sense Qal I. 2. b.: «and it shall come to pass», «came to pass»
      sense Qal II.: «Come into being», «become»
      sense Qal II. 1. a.: «arise», «appear», «come»
      sense Qal II. 2.: «become»
      … 8 more senses with a tag
  BDB (unabridged) — AMBIGUOUS (3)
    BDB2100  יהוה  [BIBLICAL HEBREW; numbers in the record's column: H3068 H3069 H1961 H430 H589 H2022 H6635]   main gloss: «Yahweh»
    BDB2145  הָיָה  [BIBLICAL HEBREW; numbers in the record's column: H1961]
      bold in the head (grammar, stems): verb
      main gloss: «fall out, come to pass, become, be»
      point Qal: (opens with no italic run)   57 refs
      point I. 1. a.: «Fall out, happen»   sub-points: b. «occur, take place, come about, come to pass:»   7 refs
      point 2.: «come about, come to pass»   sub-points: a. ; b. «and it shall come to pass»; a.
      point II. [section]: «Come into being, become:»
      … 9 more
      italic runs by kind: main_gloss 1, grammar_word 9, rendering_of_hebrew 6, opening 15, unclassed 115, outline_letter 18, abbreviation 3, verse_wording 3
    BDB9470  הֲוָא  [BIBLICAL ARAMAIC; numbers in the record's column: H1934 H1961]
      bold in the head (grammar, stems): verb
      main gloss: «come to pass, become, be»
      point Pe`al: 13 refs   point 1.: «come to pass»   point 2.: «come into being, arise»   point 3.: «be»
  UBS dictionary — EXACT: by the number alone
    001806000000000  היה  codes on the entry: H1961  (1 base forms)
      base form 001806001000000  verb
        sense 001806001001000  «to be», «to become»  — = state or process by which an object or event is (going to be) identical to another obje…  [253 verses, first 001001002]
        sense 001806001002000  «to serve as», «to act as»  — …  [459 verses, first 001001014]
        sense 001806001003000  «to be», «to become»  — = state in which an object is to be a participant in a certain activity  [94 verses, first 001012002]
        … 81 more
  UHAL — ABSENT: file not on hand

══ H1980G ══
  STEP: stands on 944 words (944 parts; the root of 944)
  STEP's TBESH — EXACT: H1980G  הָלַךְ  ha.lakh  H:V  gloss «to go: went»  first column H1980  relation: a Meaning of H1980I
  Strong's (Open Scriptures) — EXACT: by the number alone
    H1980  הָלַךְ (haw-lak')  v, heb
      derivation: akin to 3212; a primitive root;
      meaning: to walk (in a great variety of applications, literally and figuratively)   [tagged: walk]
      his list of renderings (41): (all) along | apace | behave (self) | come | (on) continually | be conversant | depart | be eased [the file lost the sign; Wikisource writes +] | enter | exercise (self) | follow [the file lost the sign; Wikisource writes +] | forth | forward | get | go (about, ab…
  Strong's (Wikisource) — EXACT: by the number alone
    H1980  הָלַך (haw-lak')
      the list opens at «:» (41): (all) along | apace | behave (self) | come | (on) continually | be conversant | depart | + be eased | enter | exercise (self) | + follow | forth | forward | get | go (about, abroad, along, away, forward, on, out, up and down) | + greater | grow | be wont to haunt |…
      spelled forms: 42 (אהלך, אתהלך, אתהלכה, הולך, הולכות, הולכים, הולכת, הלוך, … 34 more)  in 473 verses listed
  Lexical Index — EXACT: by the number alone
    dbi  הָלַךְ  V  «go»  → bdb e.bn.aa, strong 1980, twot 498  etym main root הלך
  BDB (Open Scriptures) — EXACT: by the number alone
    e.bn.aa  הָלַךְ  [a ROOT entry]  vb  status base
      before any sense: «go», «come», «walk»
      sense Qal II. 1.: «pass away», «die»
      sense Qal II. 2.: «live», «walk»
      sense Pi 1.: «walk»   sense Pi 2.: «walking about»   sense Pi 3.: «depart», «go entirely away»
      sense Hithp: «walk», «walk about», «move to and fro»
      sense Hiph 1.: «lead», «bring»   sense Hiph 2.: «lead away»
      … 4 more senses with a tag
  BDB (unabridged) — AMBIGUOUS (3)
    BDB2162  הָלַךְ  [BIBLICAL HEBREW; numbers in the record's column: H1980 H3212]
      bold in the head (grammar, stems): verb
      main gloss: «go, come, walk»
      point Qal: (opens with no italic run)   4 refs
      point 1.: (opens with no italic run)   sub-points: a. «go, proceed, move, walk»; b. «depart, go away:»; c. «come»; d. «a.»
      point ** [remarks]: «go»   60 refs
      italic runs by kind: main_gloss 1, other_language 1, unclassed 65, grammar_word 6, opening 5, verse_wording 6, rendering_of_hebrew 12, outline_letter 7   (the record holds 4 paragraphs; the first is shown)
    BDB4419  לְךָ  [BIBLICAL HEBREW; numbers in the record's column: H1980]   main gloss: (the head carries none)
    BDB4423  לְכָה  [BIBLICAL HEBREW; numbers in the record's column: H1980]   main gloss: (the head carries none)
  UBS dictionary — EXACT: by the number alone
    001824000000000  הלך  codes on the entry: H1980 A1981 A1946 H3212  (1 base forms)
      base form 001824001000000  verb
        sense 001824001001000  «to move», «to go», «to walk», «to flow»  — = process by which liquids or other inanimate objects move from one place to another  [36 verses, first 001002014]
        sense 001824001002000  «to go», «to come»  — = action by which humans, deities, or animals move forward, …  [1078 verses, first 001003014]
        sense 001824001003000  «to walk about», «to wander», «to roam»  — …  [50 verses, first 001003008]
        … 16 more
  UHAL — ABSENT: file not on hand

══ H5704 ══
  STEP: stands on 1261 words (1261 parts; the root of 1261)
  STEP's TBESH — EXACT: H5704  עַד  ad  H:Prep  gloss «till»  first column H5704
  Strong's (Open Scriptures) — EXACT: by the number alone
    H5704  עַד (ad)  prep, heb
      derivation: properly, the same as 5703 (used as a preposition, adverb or conjunction; especially with a preposition);
      meaning: as far (or long, or much) as, whether of space (even unto) or time (during, while, until) or degree (equally with)   [tagged: as far | long | much | as | even unto | during | while | until | equally with]
      his list of renderings (19): against | and | as | at | before | by (that) | even (to) | for(-asmuch as) | (hither-) to | how long [the file lost the sign; Wikisource writes +] | into | as long (much) as | (so) that | till | toward | until | when | while | (  as) yet [a sign lost inside; Wikisource writes (+ as) yet]
  Strong's (Wikisource) — EXACT: by the number alone
    H5704  עַד (ad)
      the list opens at «:» (19): against | and | as | at | before | by (that) | even (to) | for(-asmuch as) | (hither-)to | + how long | into | as long (much) as | (so) that | till | toward | until | when | while | (+ as) yet
      spelled forms: 4 (בעד, בעדי, עד, עדי)  in 1128 verses listed
  Lexical Index — EXACT: by the number alone
    jbf  עַד  R  «as far as»  → bdb p.aq.ad, strong 5704, twot 1565c  etym sub
  BDB (Open Scriptures) — EXACT: by the number alone
    p.aq.ad  III. עַד  [entry]  prep prep conj  status base
      before any sense: «as far as», «even to», «up to», «until», «while»
      sense II. 1.: «until»
      sense II. 2.: «While»
      sense II. 3.: «to the point that», «so that even»
  BDB (unabridged) — AMBIGUOUS (3)
    BDB5808  III. עַד  [BIBLICAL HEBREW; numbers in the record's column: H5704]
      bold in the head (grammar, stems): preposition
      main gloss: «as far as, even to, up to, until, while»
      point I. preposition 1.: «space»   sub-points: a. «with the goal a»
      point 2.: «time:»   sub-points: a. «(a) even to, until»
      point 3.: «degree»   15 refs
      point II. conjunction 1.: «until»
      … 8 more
      italic runs by kind: main_gloss 1, other_language 2, unclassed 56, opening 12, rendering_of_hebrew 21, tagged_gloss 3, verse_wording 2, outline_letter 5
    BDB6199  עַתָּ֫ה  [BIBLICAL HEBREW; numbers in the record's column: H6258 H2088 H2009 H5704 H3588]
      bold in the head (grammar, stems): adverb
      main gloss: «now»
    BDB9752  עַד  [BIBLICAL ARAMAIC; numbers in the record's column: H5705 H5704]
      bold in the head (grammar, stems): preposition and conjunction
      main gloss: «even to, until»
      point 1.: (opens with no italic run)   sub-points: a. «even to»; b. «up to»; c. «until»
  UBS dictionary — EXACT: by the number alone
    005244000000000  עַד  codes on the entry: H5703 H5704 A5705 H5706  (3 base forms)
      base form 005244001000000  prep: «to», «as far as» [389 verses]; «until», «up to» [420]; «until» [343]; … 16 more
      base form 005244002000000  noun m: «forever», «everlasting», «for all times» [45 verses]
      base form 005244003000000  noun m: «prey», «spoil» [2 verses]
  UHAL — ABSENT: file not on hand

══ H3651A ══  (22 words) where it differs from H3651C:
  STEP's TBESH — EXACT: H3651A  כֵּן  ken  H:Adv  gloss «right»  first column H3651a  relation: a Meaning of H3651C
  Lexical Index — EXACT: by the number and the Open Scriptures letter
    fud  כֵּן  A  «right»  → bdb k.aw.ab, strong 3651, aug a, twot 964a  etym sub
  BDB (Open Scriptures) — EXACT: by the number and the Open Scriptures letter
    k.aw.ab  I. כֵּן  [entry]  adj  status base
      before any sense: «right», «veritable», «honest»
      sense 1.: «right»   sense 2.: «veritable», «true»   sense 3.: «honest»

══ H3651B ══  (10 words) where it differs:
  STEP's TBESH — EXACT: H3651B  [כִּי עַל] כֵּן  [ki al] ken  H:Adv  gloss «as»  first column H3651b  relation: a Meaning of H3588A
  Lexical Index — EXACT: fri  כִּי עַל כֵּן  D  «forasmuch as»  → bdb k.bg.ac, strong 3651, aug b
  BDB (Open Scriptures) — EXACT: k.bg.ac  כִּי עַל כֵּן  [entry]  status base;  before any sense: «forasmuch as»

══ H3651C ══
  STEP: stands on 739 words (739 parts; the root of 739)
  STEP's TBESH — EXACT: H3651C  כֵּן  ken  H:Conj  gloss «so»  first column H3651c
  Strong's (Open Scriptures) — EXACT: by the number alone
    H3651  כֵּן (kane)  adv, heb
      derivation: from 3559;
      meaning: properly, set upright; hence (figuratively as adjective) just; but usually (as adverb or conjunction) rightly or so (in various applications to manner, time and relation; often with other particles)   [tagged: set upright | just | rightly | so]
      his list of renderings (20): after that (this, -ward, -wards) [the file lost the sign; Wikisource writes +] | as... as | (for-) asmuch as yet [the file lost the sign; Wikisource writes +] | be (for which) cause [the file lost the sign; Wikisource writes +] | following [the file lost the sign;…
  Strong's (Wikisource) — EXACT: by the number alone
    H3651  כֵּן (kane)
      the list opens at «:» (20): + after that (this, -ward, -wards) | as... as | + (for-)asmuch as yet | + be (for which) cause | + following | howbeit | in (the) like (manner, -wise) | X the more | right | (even) so | state | straightway | such (thing) | surely | + there (where)-fore | this | thu…
      spelled forms: 2 (כן, כנים)  in 737 verses listed
  Lexical Index — EXACT: by the number and the Open Scriptures letter
    fug  כֵּן  D  «so»  → bdb k.by.aa, strong 3651, aug c, twot 964b  etym main
  BDB (Open Scriptures) — EXACT: by the number and the Open Scriptures letter
    k.by.aa  I. כֵּן  [a ROOT entry]  adv  status base
      before any sense: «so»
  BDB (unabridged) — AMBIGUOUS (5)
    BDB3945  I. כֵּן  [BIBLICAL HEBREW; numbers in the record's column: H3651 H3653 H3654]
      bold in the head (grammar, stems): adjective | 2
      main gloss: «right, veritable, honest»
      point 1.: «right»   14 refs   point 2.: «veritable, true»   4 refs   point 3.: «honest»   5 refs
    BDB3996  כִּי עַל כֵּן  [BIBLICAL HEBREW; numbers in the record's column: H3588 H5921 H3651]
      main gloss: (the head carries none)
    BDB4076  I. כֵּן  [BIBLICAL HEBREW; numbers in the record's column: H3651]
      bold in the head (grammar, stems): adverb
      main gloss: «so»
      point 1. a.: (opens with no italic run)   sub-points: b. ; c. «so»   25 refs
      point 2.: (opens with no italic run)   sub-points: a. ; b. ; c. ; d.
      point 3.: (opens with no italic run)   sub-points: a. «after so»; b. «in such circumstances»; c. ; d. «according to such conditions, that being so, therefore»; e.
    BDB4077  II. כֵּן  [BIBLICAL HEBREW; numbers: H3651 H3653 H3654]  main gloss: (none)
    BDB9613  כֵּן  [BIBLICAL ARAMAIC; numbers: H3651 H3652]  main gloss: «thus, as follows»
  UBS dictionary — EXACT: by the number alone
    003347000000000  כֵּן  codes on the entry: H3651 A3652 H3653 H3654  (4 base forms)
      base form 003347001000000  adv
        sense 003347001001000  «thus», «in this manner», «in this way», «so»  — = a referent pointing to the way in which a certain event or series of events is performed  [561 verses, first 001001007]
      base form 003347002000000  adj
        sense 003347002001000  «pedestal», «base»  [9 verses]; «stability» [2]; «right», «honest» [5]; … 4 more
      base form 003347003000000  adv
        sense 003347003001000  «enough»  [1 verses, first 007021014]
      base form 003347004000000  noun m
        sense 003347004001000  «mosquito»  — = a small flying insect that makes a characteristic whining noise as it flies; found arou…  [5 verses, first 002008012]
  UHAL — ABSENT: file not on hand

F. WHAT THE FILES DO NOT TELL

- Strong's print form of H1961's item: both digital editions close the bracket twice; which bracket is the slip is not in either file.
- Which UBS base form or sense a Strong's code belongs to; whose letters the UBS code letters are.
- Which unabridged BDB record a number means, where it stands on several; and no id of the other BDB file.
- For 4 tags, which Open Scriptures BDB entry STEP means. For STEP's prefix tags (H9001 …): the Lexical Index has 8 entries that carry a letter where the number stands (strong="b": Open Scriptures' own prefix codes) with BDB ids, but no file says which STEP number is which code, so BDB's prefix entries are reached by no tag.
- One TBESH line whose first column has another number than its lettered number (H7156H with first column H7178); the bridge follows what the column says.
- Whether an unclassed italic run of the unabridged BDB (25,889) is a gloss, a remark or a title; whether a def of the Open Scriptures BDB in an opening bracket is the word's own meaning. The facts to decide are stated on each; nothing is decided.
- The full Wikisource edition and the full UHAL: not on this machine.
- 20 Wikisource entries write no sign where the list opens; they are held whole.

G. SIZES AND PATHS

Made, 20 files, 17.07 MB, under S/s15/reader/data/place-answers-v1/ (PIN.json sha256 58b5f81d…b37a):
- entries/: wikisource_strongs_explicit_forms.json.gz 1,846,237 bytes; openscriptures_strongs 1,225,165; stepbible_tbesh_gloss 375,769; openscriptures_bdb_1906 1,496,371; openscriptures_lexical_index 658,424; unabridged_bdb_1906 6,250,565 (32 MB unpacked); ubs_sdbh_hebrew_v0_9_2 2,813,210; unfoldingword_uhal 32,728
- bridges/: step-tag-to-entry.json.gz 259,226; step-tag-to-<key>.json.gz for the eight keys (838 to 104,675: the counts, every ambiguous tag with its entries' facts, the absent tags); verse-to-sense-openscriptures_bdb_1906 24,713; verse-to-sense-unabridged_bdb_1906 865,491; verse-to-sense-ubs_sdbh_hebrew_v0_9_2 1,049,110
- PIN.json 40 KB: my part only (sources, counts, bridge counts, the made files). Builder P's part is to be joined under the same keys.

Tools, 2,806 lines, no Hebrew letters in them, under S/s15/reader/tools/: build-place-answers-entries-v1.mjs (the one command); check-place-answers-entries-v1.mjs; say-place-answers-tag-v1.mjs; say-place-answers-counts-v1.mjs; place-answers-entries-lib-v1.mjs; place-answers-entries-strongs-v1.mjs; place-answers-entries-openscriptures-v1.mjs; place-answers-entries-unabridged-bdb-v1.mjs; place-answers-entries-tables-v1.mjs; place-answers-bridges-v1.mjs.

Work folder S/s44w/ (47 MB): sources-entries.json (every source file's path, provider, revision; the command's one argument); dl-ubs-0.9.4/ and dl-ubs-0.9.2/; x-store-dict/dictionary-store-v1/records/M7.jsonl; build-1…5.log, check-3…5.log; plant.mjs and plant-*.log; prove-faults.mjs; hand.mjs; say-tags.txt; macula-probe*.mjs; the probe scripts. Other inputs are read where they stood: S/s38w/dl-step-latest, S/w39/out/C2/dl-os, dl-ubdb, x-dict, x-front/fetch (the H1 page), S/s15/reader/data/zones.

For a newer file of a source: change its path and revision in sources-entries.json and run the command; the v0.9.2 UBS entries, for instance, come from the same command with ubs.json pointed at dl-ubs-0.9.2.