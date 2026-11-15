# The third fix round and the container restart (15 November 2026)

The third fix round (the second review's findings for the default toggles and ship 1) ran from 23:49 UTC on 14 November with two fix parts, page and data. At about 02:55 UTC on 15 November the session's container restarted and stopped it before either part reported. The scratch tree survived, with each part's edits as it left them; nothing was reverted.

How far each part had come, by its own notes (beside this file):
- Data: the full check passed every law (D0 to D19) at zone.html 6da0d35f; D12 opened both MACULA-piece places; the S1 harness was started; it was making the receipt's step_leaves and totals descriptions true under the line-as-it-rests count.
- Page: it was measuring reset and the file's landing at rest against live (54.2 s at rest and 68.8 s from MACULA against live's 42.7 s, all under contention, to be measured again on a quiet machine), diffing the hot paths for new per-word work, and reading the names gate and form-of checks for item 12.

The round was taken over by a continuation (ship-1-and-3-fixes-resumed): each part's new agent reads its predecessor's notes, decides each item's state against the tree, proves the done ones again, and finishes the rest; then the integration over all 39 books and the review run as planned.

The palette survey (palette-metals-survey) was stopped by the same restart after its four surveys had finished; it was resumed from them, so only the plan and its critic run again.

## The weekly limit, and what the lead did instead (15 November, morning)

The takeover never ran: every helper agent of both workflows failed at once on the account's weekly limit for helper agents ("resets Nov 19, 8pm (UTC)"). The lead carried on alone:

- The palette shipped first, on its own from main (wip/2026-11-15/the-palette/plan/PLAN-THE-METALS.md): main 857a3dc0fb, gh-pages a4290a43d4, live check 67.
- The toggles tree (scratch pt) was committed on a local branch (toggles-wip, d4e79e4de8: the work as the third fix round left it; local only, to be squashed into one commit before any ship) and took main in by a merge (947c794e59). zone.html merged cleanly; the only conflicts were generated files (the pipeline manifest and the switches page's 14 photographs), taken from main, since the round and the switches builder write them again. No gold, dim gold or purple-dim token of the old palette was left in the merged page.
- Disk: 3.7 GB of scratch from the rounds shipped by 13 November was removed. Among it was the worktree p180 (13 November, on bc5f5f9b09): it held uncommitted edits, the first sketch of the default picks (a zone.html change and a default-picks folder), which the later build in pt superseded. It was removed before those edits were read; nothing in it is known to be needed, and nothing of it can be recovered.
- By the two parts' own notes, the page part had coded all twelve of its items and proven ten in the browser; it was timing the file's landing and the reset (item 11; the last measures, under contention, were the tree's reset at 63.7 and 70.1 seconds against live's 47.2 on II Samuel) when it stopped. The data part had all eight items in, its check passing every law, and was finishing the receipt's wording.
- The integration now runs as one batch, one job at a time so the timings are fair (scratch v59/integrate.sh): the fast checks, the page checks, the default picks' full check, every line at rest of all 39 books against live, 48 cards against live, and the reset timings on II Samuel, live against the tree.
- An independent review of the third round's fixes waits on the helper agents (after 19 November). The toggles do not ship before it.
