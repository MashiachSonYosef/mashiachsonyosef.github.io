# The outside reader's second look at Genesis 1's verb cards, checked

14 November 2026. Page lane (Elijah). The owner forwarded another reviewer's re-score of the fourteen verb cards from 12 November and asked: «is he correct or are we?»

He is correct. Every figure he gives comes out the same when the cards are pulled again from the live build (main 044a49ddfc, gh-pages 10648ea23f). It also agrees with our own records of 13 November, which measured an earlier build.

## How it was checked

- The same fourteen cards, plus עֹשֶׂה (1:11, word 11), were pulled from the live build with the probe that made his first dump (`an-outside-reader/tools/probes/card-pills.mjs`). The dump is `dumps/cards-genesis-1-verbs-and-asah-14-november.json`.
- They were scored against his own table of calls from 12 November (`verb-cards-cross.tsv`) with `the-rulings-of-13-november/tools/verb-cards-two-builds.py`. The log is `logs/verb-cards-the-readers-day-and-now.txt`.
- Nothing here re-judges his calls. The 25 pills that are new since his first look are counted as "not in the review". He judged those himself: 20 right.

## His figures, against ours

| His claim | What the live build shows |
|---|---|
| 291 pills, now 264 | 291 on his day, 264 now (54 + 7 + 10 + 7 + 5 + 6 + 12 + 10 + 11 + 19 + 28 + 39 + 49 + 7) |
| Right: 132, now 152 (45% → 58%) | all 132 he called right still stand; 25 pills are new, and he calls 20 of them right |
| 52 removed, none right | 52 gone: 12 the same entry in another stem, 26 another word, 12 broken pieces, 2 unsure. None he called right |
| Other stem, other word or broken: 143 → 97 | 55 + 75 + 13 = 143 on his day. Now 43 + 49 + 1 = 93 among the pills he had judged, plus those of the 25 new ones he did not call right |
| "Let it multiply" lost all eight "contend / strive" pills | gone: adversary, chide, complain, contend, debate, plead, rebuke, strive (the entry gate: another entry) |
| "Bears seed" lost the "arm" group | gone: power, arm, mighty, shoulder, strength, stretch out, extend, forearm |
| "He created" 79 → 54 | 79 on his day, 71 before ship C2, 58 after it, 54 now: ruling 4 made BDB's sense openings notes, not pills |
| Peru still there; one Peru pill withheld as a name | the card says 1 withheld as a name. Still standing: «Peru» (M32, M1), «Republic of Peru» (M32), «country in South America» (M42), «A country in South America, with capital Lima» (M32), «Tarica» (M21), «pro» (M1), and Wiktionary's «Pro-» and «his bull» (M13) |
| "Let them gather" still shows look, patiently, tarry, wait | yes: four pills from Strong's concordance (M14), whose word list under H6960 runs across both words קוה |
| "Let it produce" still carries qal senses on a hiphil card | yes: 35 of its 39 pills are Strong's (M14) word list for H3318, which names no stem |
| Monday to Thursday stand in 1:8, 13, 19, 23 | yes: the line over the two joined words reads «Monday», «Tuesday», «Wednesday», «Thursday» (M13, English Wiktionary) |
| עֹשֶׂה grew from 111 pills to 236 | 236 now. 210 of them stand only on rows pointed otherwise than the place, which the entry gate lets stand because they file the place's own entry, H6213 (ruling 1, 13 November: "a row of its own entry stands whatever its points") |

## Why what is left is left

- **Strong's word lists (M14).** Strong's lists every English word the King James used for a number. That list mixes stems and homonyms, and carries neither a stem nor STEP's letter, so neither the stem gate nor the entry gate can part it. Most of what is still wrong on these cards is this: «look / patiently / tarry / wait» at 1:9, and the qal senses at 1:24.
- **Peru.** The rows come from sources nobody has read for names (M32, M42, ConceptNet M1, PanLex M21). The names gate can only withhold a row its own source marks as a name. This is the same gap as Rimmon (`the-names-gate-both-ways/`). Wiktionary's «Pro-» and «his bull» are other entries of the same letters: no pointing, no number.
- **Monday to Thursday.** This is the open call of 12 November (task 90): on a run of joined words where every word has its own place reading, should the place's reading lead, as it does on a single word? It reaches 2,835 places. It was not on the list the owner answered on 14 November, so it waits on the owner's word. The page lane's recommendation is yes.
- **עֹשֶׂה.** The growth is the entry gate working as ruled. Most of the new pills are true senses of "do, make" from MACULA, UBS, STEP and BDB. Strong's word list rides in with them («bruise», «fly», «(fight-)ing man»).

## The SHA256 audit of the same day

The owner also asked whether the chain pages' SHA256s are right. They are, on the live gh-pages (10648ea23f), read straight from git's stored file contents (`sha-audit.py`, `logs/sha-audit-live-gh-pages-10648ea23f.txt`):

- all 24 fingerprints on the chain index;
- all 7,755 files that the 52 records (12 chain books, 40 resting-lines records) say they were read off;
- all 3,547 zone pins on 1,272 pages.

That is 11,326 of 11,326, none wrong.
