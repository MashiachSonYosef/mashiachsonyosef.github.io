# The data part before the container restart (15 November, about 01:45 UTC)

The agent that held this part was stopped mid-work by a container restart. These are its own running notes, in order, as it wrote them. Its edits are in the tree as it left them; nothing was reverted.

- 23:49:58 I'll start by reading the review, plan, owner's questions, and no-claims note.

- 23:50:12 Now let me look at the tree's state and the files I own.

- 00:10:40 Now I have the full picture. Let me start with (b), the PIN entry.

- 00:12:27 Now the bake. First the header comment: the counting rule, the record reading, refusals and counts.

- 00:13:07 Now the code: helpers, row texts, and the per-book record reading.

- 00:13:26 Now the per-book setup: the zone's bytes, the record, and per-place memory for the later tallies.

- 00:14:29 Now the counting rule itself, the rests-bare places, and what prints each source's pills.

- 00:16:36 Now a dry run of the bake.

- 00:18:36 The dry run matches the plan's run measures exactly (2,177 run lines; MACULA 1,681, UBS 1,377, BDB 278). Now the real re-bake.

- 00:20:18 The index moved exactly at the 15 places (8 books). Now the check. First let me look at what the D12/D13 samples will find in the data.

- 00:20:29 Now the check: the counting rule with the record, D3's mirror, D5's own count, and D12/D13's samples.

- 00:22:42 Now run the check's node laws with the ledger.

- 00:23:36 While the harness runs, the reset-pill check's R1.

- 00:24:18 The page part is evidently editing zone.html in parallel (line numbers moved), so I'll build fault copies by string replacement on a snapshot, never by line number. First the unfaulted run.

- 00:24:53 The unfaulted run passes, with the kept second judged (MACULA as BDB's second). Now the two fault copies.

- 00:26:05 Both faults now turn R1 red: F2 at "the second still kept: NOT PRESSABLE", F1 at "the note OPEN" after reset. Checking on the fault harness run.

- 00:30:02 The page part changed zone.html again (now 1e6c347a…). Let me confirm the note rules I mirrored still stand before re-running.

- 00:30:08 The note rules are unchanged (only a card label moved). Re-running the fault harness.

- 00:30:13 Meanwhile, (h) round-v1.sh.

- 00:30:26 Now a way to exercise S1 for real. Let me see how the page finds its book on a chapter page.

- 00:32:02 H6 is still red; let me read the page's full note sentences to see what differs.

- 00:32:20 The page part has changed the STEP sentence again since my snapshot. Reading the current code.

- 00:32:57 H8 is green now. H6 still differs even for MACULA; let me compute the check's model sentence directly to see the difference.

- 00:33:19 The model now matches the page's current text for all four notes; the page was evidently mid-edit during that run. Re-running the harness, recording zone.html's sha before and after.

- 00:38:17 H6's message counts the faulted notes (4 of 4); "red without the fault" means at least one unfaulted note differs, likely STEP's again: zone.html moved to 6da0d35f during the run. Checking.

- 00:38:34 The page part has already reacted to the re-baked index (its comment cites Psalms 44:15:6). Mirroring this latest sentence and re-running.

- 00:43:11 The fault harness is all as it should (H1–H10) at zone.html 6da0d35f, stable through the run. Now the full page laws (to exercise the new D12/D13 samples and D6/D15) in the background.

- 00:43:15 Meanwhile, lint the changed tools against the baseline.

- 00:43:28 Lint: 0 findings before and after for all four .mjs files, and round-v1.sh passes `bash -n`. Now the Hebrew-character and spelling sweep over my added lines.

- 00:43:39 No Hebrew characters and no British forms in any added line or file. Checking on the full run.

- 00:43:48 Four cores already under load, so I'll hold the S1 harness until the full run finishes. Meanwhile, the receipt's new sections as written:

- 00:43:57 While waiting, a scan for other tools that read the index's counts, so the has.step change surprises nothing else.

- 00:54:29 The full run is on its page laws (w1 ii-samuel, w2 obadiah, w3 nahum). While it runs, a review of my bake diff for coherence.

- 00:54:46 One robustness gap in my S1 reader: it should use a run's line only where that line is drawn (as resting-lines-v1 checks), else the word's own. Fixing.

- 01:00:48 The full check passes every law (D0–D19) in 17 min at zone.html 6da0d35f. D12 now opens both MACULA-piece places of w1. Let me confirm D13's own-line sample reached them too.

- 01:01:15 Now the S1 harness run (5 books, chapters 1 and one chosen chapter each, against live main), then the full check again, in one background job.

- 01:17:33 Now I'll make the step_leaves and totals descriptions true under the line-as-it-rests count.

