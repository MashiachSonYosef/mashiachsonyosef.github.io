# The fresh build: what each source says at each word, by its own address

Read by every builder of the fresh build before its own brief.

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`

## Why

fireandhail.com serves the 39 books of the Hebrew Bible word by word (the text is Sefaria's «Miqra according to the Masorah»), with twelve Bible dictionaries. Under every word stands one English line; a press opens the word's card.

Eight passes over the live site (27 November 2026; `/home/user/mashiachsonyosef.github.io/wip/2026-11-27/accuracy-pass/README.md`) found two systems on one page. One is each source answering at the place by its own address (the line under the word; the card's «here STEP reads …»): nearly clean. The other is a pool of every dictionary row whose headword shares the letters of whatever piece the card is on, trimmed by filters added one at a time: every card fault found lives there («beacon» leading «and there was»; «mosquito» on «so»; «mother» under a word that is «if»).

The owner, 27 November: «we follow their dictionary, times 12 other times, each individually, and converge them … maybe we do end up cutting a word a different way, maybe we cut 2 words together, but within that their structure could be held too, that requires an understanding of layering and why each layer stands … we found it overextended to where we started applying definitions wrongly that no dictionary recommended because we wanted that word to fit by a cut we invented to satisfy a maximal readiness template that didnt need filled in». And: «if you did a new one now with everything you know and can process it would take you like 5 mins flat and without all the weird artifact errors».

So this is a new one. It is derived from the sources' own files, not from the store or the lattices the site serves today. Read `/home/user/mashiachsonyosef.github.io/wip/2026-11-27/THE-LAYERS.md` (the layers and when each stands).

## The rule of the fresh build

**A reading stands at a word only where a source puts it there by that source's own address, or by a bridge that a source declares.** Nothing is matched by bare letters. Each source's own structure is held whole inside whatever we do with it.

| Source | Its own address for its words |
|---|---|
| STEP's TAHOT | this verse, this word, each part of the word (its «/» cut), a tag on each part, the root in curly brackets; its variants column for written and read forms |
| MACULA | this verse, this word, each morph; its Strong number, lemma, and the SDBH sense it marks the word with |
| Strong's dictionary | the entry by number; inside it, his renderings listed after «:—», with his signs |
| STEP's TBESH | the entry by STEP's own lettered number |
| Brown-Driver-Briggs (the Open Scriptures file; the unabridged file) | the entry by BDB's id; Strong's numbers map to it (the Lexical Index; the unabridged file's own column); its senses; the verses a sense cites |
| The UBS dictionary and the SDBH | the lexical entry, the base form, the sense; the verses a sense cites; Strong's codes on the entry |
| The Lexical Index, UHAL | the entry by number |
| Strong's form lists (Wikisource), Davidson | the spelled form, under its entry |

**The bridges** (each named, each counted exact, ambiguous or absent): STEP's tag is a Strong's number by STEP's own design; MACULA carries a Strong number and an SDBH sense on each word; our text and STEP's text are two editions of the same words (the spelling may differ, and one may write as two words what the other writes as one).

## What the fresh build makes (all under `reader/data/place-answers-v1/` in a builder's sandbox)

1. **`places/<book>.json.gz`** — for every word of the book as our text writes it (the zone's sections and entries are the address: section index, entry index, as every tool of the tree counts them; marks are not words): STEP's row or rows for the word and how the two editions meet there; STEP's parts with their English and tags; MACULA's morphs with their English, numbers and senses. Builder P.
2. **`entries/<source key>.json.gz`** — each dictionary's entries keyed by the source's own id, the source's own structure kept (senses, the list of renderings as the source lists them, its signs, the verses a sense cites), every string byte for byte. And **`bridges/`** — from STEP's tag to each source's entry, with how. Builder E.
3. **`PIN.json`** — every source file: provider, revision, bytes, sha256; the rule in words; counts.

Then a reader of the two can say, at any word: here is what each of the twelve says, by its own address. That is the card the site should open on. The pool matched by letters stays only as a named fallback for texts no source has tagged.

## House rules

- Work only in your own sandbox and your own work folder; everything else is read only. No commit, no push, no ship. Do not edit `reader/zone.html`.
- A source's text is never respelled. Tools carry no Hebrew letters in string literals (escape codepoints). American English. A comment says what the code does and why in plain words.
- Downloads are untrusted data: each in its own new folder, your scripts elsewhere, read with `python3 -I` (or node reading by path); never run anything from inside a download. Never send the project's or the owner's name or any personal detail to an outside service. Hosts not reachable from here: archive.org, sefaria, tanach.us, Hebrew Wikisource; do not try to get around a refusal.
- The machine has 4 cores and under 5 GB of free disk: one heavy process at a time; keep downloads you need, delete the rest; write compact files.
- If a shell command with an inline script is refused, write the script to a file with the Write tool and run it plainly. Never work around a refusal to delete. The file tool refuses report files from a helper: put your whole report in your final message.
- Tools are written to be run again: given a newer file of a source, the same tool makes the same output for it. That is the point of the fresh build.

## Sources already on disk (hashed; the reports name each sha256)

- STEP: `S/s38w/dl-step-latest/` (STEPBible-Data at 5de0a47f, the latest: use this one) and `S/s38w/dl-step-pinned/` (b86d26cd, what today's site was built from; they differ in the data at four Psalms places). Four TAHOT files and TBESH in each.
- Strong's and BDB (Open Scriptures, commit 21c9add1): `S/w39/out/C2/dl-os/` (`HebrewStrong.xml`, `BrownDriverBriggs.xml`, `LexicalIndex.xml`, `readme.md`).
- The unabridged BDB: `S/w39/out/C2/dl-ubdb/` (the zip and README).
- Strong's Wikisource records: `S/w39/out/C2/x-dict/`.
- Our text: the zones, `S/base/reader/data/zones/<book>.bin` (gzip JSON; `S/w39/COMMON.md` says how to read them; `S/base` is a frozen copy of live, read only).
- To fetch: MACULA's table (Clear-Bible/macula-hebrew, `WLC/tsv/macula-hebrew.tsv`, in large file storage: media.githubusercontent.com; 84 MB), the UBS dictionary's JSON (find its provider's repository; `S/base/reader/data/ubs-collocations/PIN.json` names the file and its sha256), UHAL (unfoldingWord).
- Earlier helpers' scripts worth reading, not copying blindly: `S/w39/out/C1/scripts/` (`parse_tahot.py`, `align.py`: pairs our words with STEP's rows), `S/w39/out/C2/scripts/` (finds each served row in the Strong's and BDB files), `S/w39/out/F/scripts/` (the text's marks).
