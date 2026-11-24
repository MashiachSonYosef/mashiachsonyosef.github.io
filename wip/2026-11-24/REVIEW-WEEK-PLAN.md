# The review week: five reviews before the site stands on its own

Page lane, 24 November 2026. The owner, that day: «so next week we should basically just run reviews … lets assume we only have 1 week left together … i think we are at a point where the 39 books are being served faithfully and translated at least 5+ ways». No new features; each review ends in findings, each finding is proven on the live page before it is mended, mends go out as ships with the usual gate, and data mends go to the corpus lane.

## Where each stands today (read from the live tree, main 8c53c71284)

- **Sources served: 29 families** (`data/dictionary-kinds-v1.json`). **12 open at rest**, the Bible dictionaries (the owner, 19 November: «12 it is»): Strong's (1890), BDB (Open Scriptures), BDB (unabridged), STEP's TAHOT, STEP's TBESH, MACULA Hebrew, the UBS Dictionary, the SDBH, Davidson, the Open Scriptures Lexical Index, UHAL, the BiblicalTools Living Lexicon. **17 shut at rest, a press away:** 9 word lists and knowledge bases, the 2 Wiktionaries' own entries, Jastrow and Kethoneth Yoseph, English Wiktionary's Aramaic entries, Classical Hebrew Words, English Wikipedia's opening sentences, the Samaritan overlay. Open question for the owner: a press away, or off the site.
- **To settle first:** Davidson is filed among the 12, while my notes of 22 November (relay v217) say Davidson at rest waits on the owner. One of the two is stale.
- **The 39 books' hashes:** each book's source surface has a sha256 (`restore_surface_sha256` in `data/mam-restore-v5-rights-v1.json`: the corpus lane's extraction of Sefaria's Miqra according to the Masorah), and each served zone has one (`served_sha256` in `data/serve-gate-receipt-v1.json`). Not yet known: whether a check re-hashes them on every build, and whether the source hash reaches back to the bytes as first received. `data/pins-not-kept-v1.json` names 53 hashes of pins not kept: review 1 starts there.

## The five reviews

1. **Every source pinned.** One table, all 39 books and all 29 sources: the file as received, its sha256, where the repository pins it, the bytes hashed again today, and which check holds it on every build. Every gap named.
2. **The chain pages.** Each book's chain page against its cards, link by link (as the outside reader's audit of Obadiah did, task 87).
3. **The 12 dictionaries.** For each: entries sampled across its range, the card's text against the source's own bytes; its credit, license and year; its ledger's divisions and print steps applied as declared.
4. **The oddities of the 39 books.** Every class of mark in the text, counted in the source and on the page, then read by hand: maqaf, ketiv and qere, paseq, sof pasuq, petucha and setuma, large, small and hanging letters, the inverted nun, the Leningrad variants. And every place a word is cut into pieces: each cut must be one a dictionary or STEP marks, never one of ours.
5. **The oddities of the dictionaries.** For each source and each mark (arrows, commas, semicolons, slashes both ways, angle brackets, square brackets, parentheses, commas inside parentheses, and any other the rows hold): its count in the raw rows, the rule the corpus lane declared for it (the punctuation ledgers v102 to v142 and their reissues), and the printed card against the source. A mark with no declared rule is a finding; a printed card that differs from the source is a finding.

## How

- Order: 1 (the footing, quick), then 4 and 5 (the largest), then 2 and 3.
- Fresh reviewers do the reading, given the files and the question, not my conclusions; I confirm each finding on the live page.
- At the end, one report for the owner: per review, what was checked, what was found, what was mended.
