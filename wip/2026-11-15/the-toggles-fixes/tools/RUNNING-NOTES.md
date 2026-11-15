# The tools part of the toggles fixes: running notes (15 November 2026)

Tree: scratch pt, branch toggles-fixes from main 46bbbf7d50. The tools part edits no zone.html. Scratch: v73/tools
(logs in v73/tools/logs, the fault server and copies in v73/tools).

## 1. The gate's S1 reads every sampled chapter whole (commit 3757d0b30d)

check-same-product-v1.mjs, read() and the comparison's `common` only (the other team adds a second --expect to the
same file). Each chapter page builds every section of its own chapter (the page's __materialise; else scrolling each
waiting section into view, tried with __materialise taken away: 7 built at arrival, 27 of 27 after 3 steps), reads
those sections until two readings agree, and says a section of the chapter one build did not build.

- Fault: Amos 5:27:5 «he says» made «he says (moved)» in a scratch copy of amos.bin, served on 8961 with its pin moved
  (serve-fault.mjs). HEAD's S1, --old 8914 --new 8961 --every 38 --expect: green, 5,160 lines on 4 pages, 148 s.
  This S1: red at amos 5 s85 #5 (the default, the English reader, BDB), 5,585 lines, 160 s.
- The tree (--new 8922): green, 5,585 lines on 4 pages, 160 s.

## 2. The default picks' receipt and its check (commit 05f65ef014)

- picks_printed: STEP's cells counted where its words print (232), made counted against the store under the keys
  the card asks (the card makes a row of the source's own words where no row of that source prints it): STEP 232
  (made 232), UBS's STEP 2, BDB's STEP 104. check-default-picks D20 holds it: red on HEAD's receipt, green on the new.
- The sentences: a place where STEP's line rests bare counts in no fill of STEP's or by STEP; the other sources' has
  and fills count it as anywhere else (the index's own counts: Psalms ubs.macula etc.).
- The model of STEP's words carries the sign rule (gloss-store-v1 signsOff, under the page's names). D5's node line
  is a law over records read with the defaults laid: red with the old packing at 38 places, green with the sign rule.
- The harness: H13 (node, D3), H11 (D12) and H12 (D13) on w1's cards.
- The pin names the letters of v180, v180.1 and v195 (store path and sha256; copies in scratch dl-v184, dl-v195).
  D1 (d) holds it: red on HEAD's pin, green after.
- The round bakes the defaults again after its lines step (--receipt-only): the receipt is of the records the lines
  step read. One rule (the bake) run twice; the pass refuses where the records read anew would move the index.

A NOTE ON A SHARED FILE. check-default-picks-v1.mjs is edited by both parts in the same tree. My first commit took the
page part's uncommitted hunks of it (acrossOf, wholeAcross, beginsHalf/endsHalf, the D7 header words, moreWant's «STEP
reads this word as two»); I amended it to carry my hunks only (05f65ef014), and those hunks stand in the working tree,
uncommitted, for the page part to commit as its own.

## 3. The two checks' wait ends when the page says it is ready (with the page part)

The contract, read off the page part's working tree (its note 5, and zone.html's dfltSay): window.__default.ready is
true at once where the line rests on STEP or no source is in force (another order on the reads switch), and under
MACULA, UBS or BDB once that source's book file is here; failed where it could not be fetched. The checks keep their
predicate (!d || d.ready || d.failed) and make a page that does not say so in 30 s a fault, not a wait run out:
check-card-opens-on-the-line-v1 (C1 says «the page did not say in 30 s ...»), check-ruled-equals-first-paint-v1
(an E0 line, said only when it fails).

Probe (v73/tools/ready-at-rest.mjs, logs/ready-at-rest.log): live 8914 Amos at rest «NOT ready in 30 s»
({on: step, ready: false}); the tree 8921 «ready after 20 ms», with UBS kept 25 ms, under oldest first 23 ms.

## The fault harness, run whole (--self-test --ledger, 115 s, logs/check-selftest.full.log)

H1 to H13 each as they should: H11 «the line of the pieces naming STEP at the 2 place(s) of ii-samuel whose pieces are
MACULA's alone: D12 finds 2» (16:23:8, 18:20:18), H12 «STEP's picks 2..n dropped from its own line at the 3 place(s) of
ii-samuel D13 samples so: D13 finds 3» (1:11:3 ...), H13 «an index whose has.step counts the 6 place(s) of psalms where
STEP's line rests bare: D3 finds 1». The one FAIL of that run is D20 on the tree's receipt, which is HEAD's (STEP 1,015
made 65): the round's bake writes the receipt D20 holds (green on it, logs/check-node.after.new-receipt.log).

## 3, continued: the timings (commit ec22497676, after the page part's 4c7edc00f3)

- check-card-opens-on-the-line-v1 on Amos: HEAD's check on the live page (8914) green in 1,522 s (the waits run out
  at rest); this check on the tree's page (8921, ready at rest) green in 309 s, 23 settings, 230 cards.
- check-ruled-equals-first-paint-v1 on Amos: on the live page red, «E0 the Hebrew reader» and «E0 the English reader»
  (the page never says ready at rest), 156 s; on the tree's page green, 95 s.
- Not changed (not in this part's brief): the same wait with `.catch(() => {})` stands in check-default-picks-v1
  (ready(), 60 s), check-line-follows-card-v1, check-reset-pill-v1, check-same-product-v1 (after a source is pressed)
  and check-word-senses-v1; with the page's new readiness they end at once at rest.

## What the lead must run

- The round with --default-picks (its defaults step, and its lines step, which now bakes the receipt again): the
  tree's data/default-picks-receipt-v1.json is HEAD's, and D20 is red on it until the bake writes the new one
  (green on it: logs/check-node.after.new-receipt.log; that receipt is kept at logs/default-picks-receipt-v1.new.json).
  Without a whole round: node tools/bake-default-picks-v1.mjs --ledger <dir> --receipt-only.
- check-default-picks-v1 --ledger <dir> (page laws too) and --self-test after the merge.
- The gate on its default sample once, to time S1's whole chapters (two books: 148 s before, 160 s after).
- The merge with the kinds' branch: check-same-product-v1.mjs here changes read() (the chapter built and read whole,
  readLines/lines) and the comparison's `common` and `unread` (the loop over STATES); the header's S1 lines 5-8.
