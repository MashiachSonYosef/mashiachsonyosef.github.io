# The week on the foundation: the thirty-nine books and the twelve dictionaries, and nothing else

Page lane, 25 November 2026. The owner: «lets plan next week again focus on the idea of having enough to do to spend all your tokens FINE TUNING the 39/12». This replaces `wip/2026-11-24/REVIEW-WEEK-PLAN.md` (its five reviews are passes 2, 5, 6 and 7 here) and follows `wip/2026-11-24/THE-PRINCIPLE.md`.

## The standard

The owner, 25 November 2026: «the consonants were just positioning once, a hebrew word is just positioning, a book of hebrew words is just positioning, Strongs definitions are just positioning, the point isnt about degrees of upgrade or comparing each bit of work done to the existing work … i think it all culminates in ultra convenience (english, internet, free, zero effort put in needed, etc)». So every pass, and the reading loop above all, judges by one question: where does a reader have to stop and work? A reading to unlearn, a card that buries its answer, frames that tangle, a page slow to appear: each is a finding.

## Where the foundation stands (measured 25 November on main 3476e24ebf, ship 21, live check 89)

- 305,417 words in the thirty-nine books; **none bare** at rest.
- The line at rest is STEP's own at **305,293 words**: TAHOT's pieces 304,494, TAHOT's rows 799. **124 words** are led by another of the twelve: MACULA's pieces 53, Strong's 57 (Open Scriptures 50, the Wikisource form lists 7), TBESH 6, the SDBH 4, MACULA's rows 2, the Lexical Index 2.
- So the line is nearly done, and **the week's work is the cards**: which of the twelve's rows stand under each word, on which division, in which printed form.

## Out of scope all week

The seventeen sources shut at rest, the Tikkunei Zohar, the commentaries, new features, design.

## The passes, in order (each ends in ships; wherever the budget ends, what shipped is whole)

1. **Footing.** Rebuild the workspace from `wip/2026-11-24/ship-harness/`; tag main as the baseline. One table of sha256 for the 39 books and the 12 dictionaries, every file hashed again, each tied to the check that holds it; gaps named (start from `data/pins-not-kept-v1.json`).
2. **The 124 words.** Every word whose line at rest is not STEP's, read on the page, all of them. Each sorted: STEP gives no reading there (the other source rightly leads), or a rule of ours put it ahead of STEP (back to STEP).
3. **The departures list (the largest pass).** By machine, all 305,417 words: STEP's division and tags against what the card offers. Every rule of ours counted two ways, the places it settled a real conflict between sources and the places it acted with nothing to decide: the joining dagesh, one-letter pieces graded as prefix or suffix, the pointing grade, the entry gate, the names gate, the stems, the maqaf pair's options (the owner's example), runs and spans, the held places. The owner rules each group; each group is mended as one ship, with a check so it stays mended.
4. **Homonyms.** Every place a row of the twelve stands on a card while its entry is not the one STEP's tag names there, counted by dictionary and by cause.
5. **Each of the twelve as it serves itself** (twelve units, one per dictionary). Every served row against the source's own bytes through its declared print steps, all rows, by machine. Every mark counted with the rule declared for it: arrows, commas, semicolons, slashes both ways, angle brackets, square brackets, parentheses, commas inside parentheses. A sample of printed pills read by hand. Credit, license, year.
6. **The text's own marks.** Counted in the source and on the page, all 39 books: maqaf, ketiv and qere, paseq, sof pasuq, petucha and setuma, large and small letters, the inverted nun; a sample of each read by hand.
7. **The chain pages** of the twelve minor prophets, link by link against their cards.
8. **Leftovers already listed that touch the 39/12:** tasks 61, 154, 156, 157, 58, 112.
9. **The reading loop (takes whatever budget is left).** Fresh readers read the 929 chapters on the page in canonical order, Genesis first: the line under every verse and the cards behind it, flagging what reads wrong. Each finding is proven on the live page, traced to its cause, and mended by rule, never by hand. Progress is kept in a ledger file so the next session resumes at the next chapter.
   - *Noted by the owner, 25 November, low priority («my screenshot just shows blobs crossing over each other. not a huge deal»):* in the English reader a word of three pieces (Isaiah 25:9, «and + he will save + us») crosses its three frames in a strip 12px tall, so their edges run together. It follows three standing rulings (the English keeps its order, 10 October; every outline stays over every fill where frames cross, 10 October; no room between the English and its Hebrew, 16 and 18 October). Nothing changes now. If it is taken up: where frames cross, one thin line from each English piece to its Hebrew in place of the wide ribbon, which needs no height.
10. **Close.** The whole suite, one report (per pass: what was checked, found, mended), and a release tag.

## How the budget is spent

- Machine first: passes 1 to 6 count every word and every row, which costs little per finding and misses nothing. Hand reading second, where a machine cannot judge.
- Fresh readers do the reading (one per dictionary, one per book); I prove each finding on the live page before anything is mended.
- A ship's round, gate and suite take about three hours of machine time, so mends are batched: one or two ships a day.

## What the owner is asked

- Before the week: is Davidson one of the twelve (he is filed so; relay v217 says his place at rest is the owner's); and where two of the twelve truly conflict, who leads (today: STEP, then MACULA, the UBS dictionary, BDB).
- During it: a ruling per group of departures. My recommendation is stated with each and goes ahead unless the owner objects.
