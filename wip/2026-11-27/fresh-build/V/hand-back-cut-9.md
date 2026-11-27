Cut 9 hand-back (builder V7, page lane, sandbox S/s14). Both dictionaries are now read whole from the corpus lane's store, by their own files, and every proof holds. Nothing was committed or pushed, nothing was written to the store, no credential was printed, and no command was refused. I did not change the four page files (their md5 matches the hashes I took at the start) and I did not touch S/s16.

S = /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad

## First, the finding the lead must decide on

unfoldingWord files one entry per Strong's number and writes no letter. All of STEP's lettered tags for a number reach that one file. Each file says which BDB entry it is, in its own «BDB Reference» line, and at 745 lettered tags (35,398 words) that is a different BDB entry from the one STEP's letter reaches through the Lexical Index:
- H6213A «to make, do» (1,751 words) reaches UHAL H6213, BDB p.fz.aa, «press; squeeze».
- H0834A «which» (4,953) reaches מֵאֲשֶׁר «from; than; that which».
- H1121A «son» (3,054) reaches בְּנוֹ «his son» (a proper name).
- H5892B «city» (1,085) reaches «excitement».
- H0518A «if» (714) reaches כִּי אם־ «that if; for if».

Where the two agree: 10,102 tags (238,679 words), 3,222 of them lettered. Every unlettered tag agrees.

I read 30 of the 745 by hand (every 25th by words). All 30 confirm the measure:
- 16 have a plainly different meaning, e.g. «garment»→«treachery», «bag»→«harp», «portion»→«flattery», «to repeat»→«change», «bundle»→«pebble», «despair»→«test».
- 4 are another person or place of the same name.
- 10 are a sibling form or the Aramaic/Hebrew twin of a name.

As the brief asked, the bridge stays by number, so those 745 tags are «N, exact». As it stands, the card and H2's new pills would show «press», «squeeze» under «made» (picture 03). I recorded the comparison as measured, not applied, and wrote the parting as a patch, not applied (below). My recommendation is to take it before the pills ship.

## 1. The fetch (read-only client S/r2.mjs)

Each download went into its own new folder under S/s49w/received/.
- **The zip:** en_uhal-master.zip, 4,427,005 bytes, sha256 6b018322…ddd01, the brief's value. The lane's tsv agrees (its manifest_status is NOT_RECORDED).
- **The nine pages:** each .gz unpacks to the received sha256 the tsv lists. All 9 AGREE, 1,590,763 bytes stored.
- **The ledger tsv** itself: sha256 58c52db6….
- Nothing mismatched.

**`fetch-place-answers-sources-v1.sh` and the fetch plan:**
- The plan has a new line kind, `store`: path, the pinned sha256 and bytes, the store key, the stored object's sha256 and bytes, its packing (none or gzip), the public host, and why it is not fetched there.
- The script reads the store only through a read-only client the environment names (`PLACE_ANSWERS_STORE_READER="node …/r2.mjs"`, called as `get <dir> <key>`). It holds the object to its sha256, unpacks a gzip page, and holds the result to the pin.
- Without a client, it takes the store object or the received file from a folder given as the second argument, by name and sha256. With neither, it lists what is wanted and exits 4.

All three paths were proven:
- **From nothing:** 27 files, each the pinned bytes, in 18 s.
- **From the folder given:** the same 27 sha256.
- **With neither:** 17 files and «10 are wanted», exit 4.

**The three files that could not be got before** were M7.jsonl, M14.jsonl and M14-he-wikisource-strongs-H1.wikitext.txt. None is needed now. Their content comes from the zip and the nine pages, and page H1 is byte-identical to the old H1 file (16b4a3aa…).

**sources.json and the pins** say, for each source: the public host (git.door43.org; he.wikisource.org), that the host refuses this machine, the store key, the object's sha256 and bytes, the commit for unfoldingWord (0a2b9bf1… «the commit the host writes in the zip's own comment»), and for Wikisource «no revision recorded: the pages carry no oldid or revision…». The builder refuses a zip whose comment is not the map's revision.

## 2. What each file's own structure gives

**UHAL (the zip):**
- The zip has 8,244 members, every CRC and size held. There are 8,235 entry files, `en_uhal/content/H####.md`, never lettered.
- `content/index.md` lists exactly those 8,235, so the zip is whole by its own list. The 439 numbers it leaves out are numbers the lexicon has no entry for.
- Every file follows `entry_template.md`:
  - `# headword`.
  - The status comment `S2="NeedsEdits"`, on all 8,235.
  - `## Word data`: Strongs (always equal to the file name), TWOT (5,844 with a value), BDB Reference linking an Open Scriptures BDB id. Three files label it «Lexical Entry» / «Root Lexeme» instead: H0215, H0216, H3974.
  - BDB Root (3,774). Part of Speech, usually in the paragraph under its line. Instances in Scripture: «TBS» in 8,232 files; a count in the 3 edited files.
  - `## Etymology`.
  - `## Senses`: 14,421 senses, 3 of them titled with a stem (H0215). Each has Definition, Glosses, Explanation and Citations parts.
- Definition and Explanation are empty everywhere.
- Glosses stand in 10,596 senses across 6,196 files, parted by «;». 2,039 files have no gloss at all, e.g. H8674, and H3068 YHWH.
- Citations are Markdown links (3,529):
  - 3,518 are read as verses from the target.
  - 79 write the book code «Neh» in capitals; it is read in lower case and marked.
  - 9 have a target that is no address (6 empty, «Ezra.814», «Ezra,6,15», «Job.37:23»); each is held as written and read as no verse.
  - 2 are New Testament (luk, mat).
- 680 files are in BDB's Aramaic part (BDB id «x…»). UHAL itself declares no language.
- The source's own title is «Unlocked Hebrew and Aramaic Lexicon» (manifest.yaml, README). The card and pins say «unfoldingWord Hebrew and Aramaic Lexicon»; I did not change it.

**Wikisource (the nine pages):**
- Each page opens with the edition's book template, held as the page's head: author, book, previous and next page.
- Then come 999 / 1,000 ×7 / 675 entries: 8,674 entries, numbers 1 to 8,674 each once, read from the page bytes.
- Each entry is `==N==`, then `{{ltr|1=` with the bolded headword and pronunciation, a colon, and Strong's definition with his list after the opener; then form lines «forms - [[book ch, v]] ; …».
- 8,640 entries have form lines; 34 have none.
- 263,246 verse links, all read.
- 22 entries have no list opener.
- The old record file's 5,806 entries are each a run of the pages.

## 3. The readers, retired and replaced

- `buildUhalFromZip` (in place-answers-entries-tables-v1) and the zip reader `zipMembers` (in the lib) replace `buildUhalFromRecords`. The view keeps everything it had and adds `status`, `instances_in_scripture`, `other_fields` (every other bulleted line with a value, under its own label), and citations as every link with its target.
- `buildWikisource({pages})` reads the pages only; the record branch is gone. It adds the page heads, `whole`, `numbers_missing_below_the_last`, `entries_with_no_form_line` and `last_number`.
- Each reader states whether its source is whole by its own list. The bridge says H («not on hand») only for a source read in part; otherwise «0».
- The check reads the zip and the pages again with its own code and re-derives the whole flags.

Counts that move:

| Count | Before | After |
|---|---|---|
| UHAL entries | 151 | 8,235 |
| UHAL senses | 444 | 14,421 |
| UHAL senses with a gloss | 384 | 10,596 |
| UHAL glosses | 793 | 19,627 |
| UHAL citations | 57 | 3,529 |
| UHAL strings held | 1,152 | 103,740 |
| Wikisource entries | 6,178 | 8,674 |
| Wikisource renderings | 17,722 | 20,301 |
| Wikisource renderings signed × | 828 | 837 |
| Wikisource renderings signed + | 490 | 494 |
| Wikisource form lines | 6,163 | 8,640 |
| Wikisource forms | 20,775 | 23,613 |
| Wikisource verses | 242,791 | 263,246 |
| Wikisource links | 5,129 | 7,949 |
| Wikisource entries with no list opener | 20 | 22 |
| Wikisource strings | 298,950 | 332,740 (332,749 held by the check, with the 9 page heads) |
| Open Scriptures Strong's: Wikisource writes the lost + | 447 | 451 |
| Open Scriptures Strong's: no Wikisource entry on hand | 4 | 0 |
| Open Scriptures Strong's: Wikisource writes a sign there | 32 | 33 |

## 4. The bridges (tags; words)

| Source | Before | After |
|---|---|---|
| UHAL | N 146 tags (6,503 words) · H 11,341 (293,086) · P 49 | N 10,851 (274,086) · 0 636 (25,503) · P 49 |
| Wikisource | N 7,941 (277,101) · H 3,546 (22,488) · P 49 | N 11,487 (299,589) · P 49 |

- The UHAL «0» tags fall on 399 numbers the lexicon's own list lacks: H5921A «upon» 5,764 words, H5971A 1,762, H7200G 1,198, H0376G 1,049, H5973A, H1980G, H3820A, H0784, H0113, H0085.
- UHAL names no lettered tag. H0518A, B, H, I and J all reach H0518 by the number.
- The measurement is written in `bridges/step-tag-to-unfoldingword_uhal.json.gz` (`measured_not_applied`, per tag) and in the pin (`uhal_bdb_reference_measured_not_applied`). The check recounts it.

## 5. Words newly drawn (H2's own reckoning)

My count reproduces H2's 292,871 words with a row not on hand. After:
- **Rows:** of the 293,140 rows that were H, 267,615 are now drawn and 25,525 say «no entry».
- **Words:** 267,409 newly draw an unfoldingWord row (267,404 had none before), and 25,449 draw none.
- **Rows of another BDB entry:** 35,404 words draw a row whose file names another BDB entry than the tag's.

In the page files, the UHAL entries beside the tags go from 135 to 8,168, and the tag files grow from 4,955,026 to 5,776,086 bytes.

The chapter files grew by 214,311 bytes, but that is not from this cut. S/s14's place-answers-page-v1.mjs and check-place-answers-page-v1.mjs were changed at 15:42, before I began, which looks like H2's «[words, kind]» change; the cut-8 data predates it, and my rebuild picked it up.

## 6. Proofs

1. **The one command.** It holds three times: on S/s49w/sources-cut9 (S/s45w/fetched's 17 files linked, untouched, plus the received files) in 233 s, and twice on the folder fetched from nothing in 227 s and 232 s, the last with the tools as they stand. Each run ends «everything holds», with identical pins:
   - joined pin 5f07914a…
   - entries 94d80b80…
   - page d5ef75ff…
   - places unchanged, 641953e2…
   - map 9950bf1a…

   The comparison tool exits 0 with exactly the 141 known differences.
2. **The entries check** holds UHAL at 8,235 and Wikisource at 8,674, every string held byte for byte. Eight spoiled copies each fail, each by its own test, with the spoiled file pinned again so that only the content test can catch it:
   - a changed gloss;
   - a dropped UHAL entry;
   - a citation target read as a verse;
   - the bridge saying «0» where the entry exists;
   - the bridge saying «H» though the lexicon is whole;
   - a Wikisource entry read from a shifted byte;
   - a dropped Wikisource entry;
   - a measured count off by one.
3. **Read by hand, all as the raw file.**
   - UHAL:
     - H0001 (first)
     - H8674 (last, no gloss)
     - H0518 (lettered; the file is כִּי אם־)
     - H6213 (press; squeeze)
     - H0834 (מֵאֲשֶׁר)
     - H1121 (בְּנוֹ «his son»)
     - Aramaic: H0426, H0560, H1934
     - H0043 (one of the old 151; a bare «22» is read from its target as 1 Ch 6:22)
     - H0215, H0216, H3974 (the 3 edited files: Lexical Entry label, Instances 43/120/19, the stem titles, other fields)
     - H0003 (its part of speech keeps a trailing blank)
     - H0006 (glosses repeated as written; «v. 28» read as Num 17:28)
     - H0114 (Neh)
     - H1977 (empty target)
     - H0472, H4027 (New Testament)
     - H2072, H7689 (malformed targets)
     - H0853
     - H3068 (5 senses, no gloss; the «Ex 3:12-15» range stands in the link text only)
     - H0413, H3605, H0559, H1961 (32 senses), H0430, H1254 («create» and «cut down» in one file), H5892 («excitement»)
   - Wikisource:
     - H1 (first)
     - H8674 (last)
     - H518 (the edition writes אּם with a point on the aleph; kept)
     - H6213, H834
     - Aramaic: H426, H560
     - page edges: H999, H1000, H1999, H2000, H8000
     - entries the old files lacked: H3478, H7725, H3063, H4872, H3389, H702
     - H853, H3068, H1961 («beacon»; the unbalanced item held whole), H430, H1254, H7200
     - no list opener: H33, H7893
     - no form line: H25, H7741
     - H1818 (unbalanced)
     - H6
4. **The bridge counts** are in section 4.
5. **The eight tree checks**, each run alone, exit 0 with 0 FAIL, run again after the last tool change.
6. **The trial page**, run only after the other builder's browser had closed:
   - Genesis 1: 434 words, no page errors; 427 unfoldingWord rows, 398 with an entry and 29 saying «no entry».
   - Ruth 3: 258 words, no page errors; 249 rows, 234 with an entry and 15 saying «no entry».
   - Pictures at 412 wide, scale 2, in S/s49w/shots/:
     - 01-genesis-1-1-word-2-created-uhal.png
     - 02-ruth-3-9-word-9-skirt-uhal.png
     - 03-genesis-1-7-word-1-made-uhal-press-squeeze.png (the fault)
     - 04-ruth-3-13-word-6-if-uhal-ki-im.png (the fault)

## What the card's sentence should become

The sentence is in S/s16's place-card-v1.mjs:638, place.html:615 and zone.html:4633. Suggested: «© unfoldingWord (CC BY-SA 4.0). The whole lexicon is read here, from its repository at commit 0a2b9bf1: one entry under each Strong's number its own list names, with no letter, each marked by unfoldingWord as needing edits. Under a number it has no entry for, the card says so.»

If the patch is taken, add: «Where that entry is, by its own reference to Brown-Driver-Briggs, another word of the number than the one STEP's letter names, the card says so and does not show it.»

H2's `if (how === "H") continue` for UHAL becomes a branch that is never taken.

## The patch file (not applied)

`S/s49w/patch-uhal-another-bdb-entry.diff`. It is not needed for the new rows to reach the card; that works with no page change. It is the parting, for the lead's decision:
- **The bridge:** a new code W, «absent: the source files one entry under this number, and that entry says itself (its own BDB reference) that it is another word…».
- **The check:** W is tested.
- **place.html:** one ABSENT sentence for W.

Tested on a scratch copy: W stands on 745 tags (35,398 words), N on 10,106 tags (238,688), the entries check holds, and a wrong W fails it. H2's card would need the same ABSENT sentence.

## What still reads badly or is unclear

- The 745 parted tags, above. This is the main one.
- 2,039 UHAL files have no gloss, and some much-read numbers have none: YHWH (H3068G, 6,526 words), many names. The card prints «(no gloss)».
- UHAL's glosses repeat inside a sense («perish; die; perish…»), and the card's first line shows the repeats. Every entry says NeedsEdits.
- 399 of STEP's numbers have no UHAL entry, among them «upon», «people», «see», «man», «with», «go», «heart», «fire».
- 22 Wikisource entries have no list opener. 10 of them write «; -- » with a blank after the dashes (e.g. H33 «; -- Abiezrite»), which the opener pattern misses; their definitions are held whole. This matters little, since Wikisource is only the witness for Strong's signs.
- The work's title: the source says «Unlocked Hebrew and Aramaic Lexicon», while our files say «unfoldingWord Hebrew and Aramaic Lexicon». This is a decision for the lead under the house rule on titles.

## Paths

- **Tools changed in S/s14/reader/tools** (the diff against the start is S/s49w/cut9-tools.diff):
  - build-place-answers-entries-v1.mjs
  - check-place-answers-entries-v1.mjs
  - place-answers-bridges-v1.mjs
  - place-answers-entries-lib-v1.mjs
  - place-answers-entries-strongs-v1.mjs
  - place-answers-entries-tables-v1.mjs
  - say-place-answers-fetch-plan-v1.mjs
  - fetch-place-answers-sources-v1.sh
- **Data:** S/s14/reader/data/place-answers-v1/ (with the new sources.json).
- **The sources folder fetched from nothing:** S/s49w/received/fetched-cut9/. The raw store objects are in S/s49w/received/{uhal-zip,wikisource-pages,ledger-tsv}/. The first assembled folder is S/s49w/sources-cut9/.
- **The state before:** S/s49w/before/ (pins, bridges, entries, the tools, the md5 of the four page files).
- **Logs in S/s49w/:**
  - cut9-make-{1,2,3}.log
  - cut9-lines-compare.log
  - cut9-fetch{,-given,-neither}.log
  - cut9-check-entries.log
  - cut9-spoil-entries-*.log
  - cut9-tree-*.log
  - cut9-words-drawn.log
  - patch-test-*.log
- **Hand readings:** S/s49w/hand-uhal-{1,2}.txt, hand-ws-{1,2}.txt, uhal-other-bdb-hand-30.txt.
- **The patch:** S/s49w/patch-uhal-another-bdb-entry.diff.
- **Pictures:** S/s49w/shots/.
- **Scripts:** S/s49w/scripts/ (survey, count, hand-read, measure, spoil, trial-page, make-map).
