# Helper F: the text's own marks, in the source and on the page

**Question.** Is every mark of the Hebrew text of the 39 books that the source carries also on our page, in the right place, drawn as the mark asks; and is every division of a word on our page one the text or a dictionary makes, not one we made?

**The marks:** maqaf; ketiv and qere (every kind: written-not-read, read-not-written, one word for two, two for one); paseq and legarmeh; sof pasuq; petucha and setuma and the other section breaks; large, small, suspended and otherwise unusual letters; the inverted nun; the dots over letters (puncta extraordinaria); meteg; the Leningrad variants the edition notes; the edition's own editorial marks and brackets; and anything else `data/masoretic-marks-v1.json`, `data/apparatus-baseline-v1.json`, `data/masorah-witnesses-v1.json` and the zones' `mark` and `ld` fields carry.

1. **The source.** Find the text as received and as the corpus lane restored it: `data/mam-restore-v5-rights-v1.json` names each book's restore surface; the surfaces and the restore receipts are on the store under `v2/corpus/`. Fetch them for all 39 books if they fit your download limit, else for 12 books across the three divisions. Find the edition's own account of its marks (Miqra according to the Masorah: its documentation is named in that record) and quote what each mark means.
2. **Count every mark** in the surface, in our zone (`data/zones/<book>.bin`), and on the page as drawn (a browser, for a sample of chapters): per book, per mark. Every book where the three counts differ is a finding; give the places.
3. **Each class read by hand:** 30 places per class across books: the source's mark, what our page draws, what a press shows. Does the reader see what the mark means (for a ketiv and qere: both forms, which is read, and the reading of the one read)?
4. **Divisions.** Every place where our page divides a text word into more than one cell or card, or joins text words into one (maqaf runs, ketiv/qere pairs, spans, the spelling bridge): count them by kind and say, for each kind, whose division it is: the text's own mark, STEP's, a dictionary's, or ours alone. Ours-alone is a finding.
5. **The checks that already guard this** (`tools/check-*maqaf*`, `check-kq-*`, `check-paseq*`, `check-masor*`, `check-apparatus*`, `check-nothing-welded-v1`, and others you find): what each proves, and what no check proves.

Output: `findings.md`, `marks-by-book.tsv`, `divisions.tsv`, `read-by-hand.tsv`.
