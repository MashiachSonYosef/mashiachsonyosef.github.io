## Fifth cut: the declared language (written by the lead from builder V's logs; the builder stopped at a usage limit before its report)

Builder V finished the work and every check before it stopped: the one command on the fetched folder (190 s, everything holds), the page check (G1 to G11 pass), the comparison tool (the 141 listed differences, exit 0), a spoiled copy that fails G8, and the eight tree checks (all pass). Logs and its scripts: `cut5/`.

**Rule as built:** STEP's brief lexicon says in its morph column whether a number's word is Hebrew or Aramaic (H: or A:; a name says neither). Each record of the unabridged BDB says its own language. Where both say, a record of the other language is not said to cite this word, and stands behind the button under «In the dictionaries», with a sentence saying why.

**Counts (from the page pin):**

| Unabridged BDB under a number of several records | Numbers before | Numbers after | Words before | Words after |
|---|---|---|---|---|
| parted to one record | 1,416 | 1,773 | 75,545 | 136,681 |
| still several | 1,483 | 1,126 | 107,826 | 46,690 |
| none | 55 | 55 | 1,936 | 1,936 |

- «Here» lines withheld for the other language: 78 (59 under a number of one record, 19 under several), on 70 words.
- Numbers whose only record is of the other language: 23 (792 words).
- Hand reading, 30 newly parted numbers (`cut5/cut5-hand-reading.txt`): all 30 keep the Hebrew record and set the Aramaic one behind, rightly.

**What the lead found in the logs, which the rule as built gets wrong:**

- **STEP's lexicon is wrong about one number's language, and STEP's own word rows say otherwise.** H0426 «god» (95 words, all in Daniel and Ezra): the lexicon's morph column says Hebrew (H:N-M), but every one of STEP's 95 word rows says Aramaic (the grammar column opens with A, e.g. Dan 2:20 «ANcbsd»). The only record, BDB9300, is Aramaic and is the right one. Under the rule as built it is set aside at those 95 words. The builder's own measure (`cut5/cut5-where.log`) found three such numbers (H0426, H7121H, H3201) on 100 word parts.
- **The closer address is the row at the word.** Each of STEP's word rows says its language in its grammar column (H 226,925 rows, A 4,827). Only 13 numbers have rows of both languages, mostly suffixes with no dictionary entry. A sixth cut reads the word's language from its own row.
- **17 numbers of «to lift» (H5375G to X) reach only the Aramaic record** in the unabridged file. The Hebrew record of «to lift» is not reached by its own Strong's number. This is a gap in the file's numbers, not in the language rule; the rule rightly says the one record is Aramaic.

**The page:** the sentences the page would print are in `cut5/cut5-page-proposed.log` and the code in `cut5/cut5-page-proposed.mjs`. They will change wording once the language is read from the row («STEP's row at this word says Aramaic»).
