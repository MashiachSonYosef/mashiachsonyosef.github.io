# The page part before the container restart (15 November, about 01:45 UTC)

The agent that held this part was stopped mid-work by a container restart. These are its own running notes, in order, as it wrote them. Its edits are in the tree as it left them; nothing was reverted.

- 23:49:57 I'll start by reading the review, plan, owner questions, and no-claims note.

- 23:50:10 Now let me look at the tree state, servers, and the zone.html file.

- 23:50:19 Let me look at the review evidence and key functions in zone.html.

- 23:50:33 Let me map the key functions in zone.html.

- 23:53:02 Now the row painter and note (around 14960-15200).

- 23:54:36 Let me set up my probe folder with a shared library (adding a zone-file override so I can time the "before" page against the same data).

- 23:57:05 The first-card baseline reproduces the review (tree: one 21.3 s task; live: 343 ms largest). Now the reset baseline on II Samuel, in the background.

- 00:05:29 Let me check what the card shows today at a non-name place of סכות (Nehemiah 8:16:6) and a name place (Genesis 33:17:15).

- 00:08:56 Let me check, at the MACULA-piece places, whether MACULA's ledger pick 1 ever differs from the pieces' own text (to know what skipping its separate line would lose).

- 00:09:42 Now the book file's landing (item 1) and its comment.

- 00:09:58 Now `defaultAt` and `runTakesDefault` read the layer (item 4).

- 00:10:25 Now item 5: a made default row keeps its own credit. First the registry beside `DFLT_OWN`, then `dfltSays`, `readingOfRow` and `mOfPick`.

- 00:10:47 Now poolFor's made rows record their credit.

- 00:11:04 Now the two places a pick is recorded (the pill press and the witness press).

- 00:11:13 Item 2: the export asks a default line the way the line draws it.

- 00:11:23 Now the card: one computation of whose the pieces are (item 7), for the label and the tight tag.

- 00:11:41 Item 6: a press drops «· on the line» from the open card at once.

- 00:11:49 Items 3, 8 and 7 in the card's source lines: the filling claim waits for the file, a pick with no words says so, and the pieces' source gets one line.

- 00:12:07 The file mixes literal and escaped middle dots; I'll make the edits in smaller pieces.

- 00:13:40 The STEP-words places carry no complete pieces, so folding the pieces' source into one line is safe. Now the card's place line and the per-source lines.

- 00:14:20 Before writing the note texts, let me check what the index holds for STEP's leaves and fills in v1.2.

- 00:15:00 Let me check how the Menu mirrors the row's pills, so the new aria attributes behave there too.

- 00:15:19 Now the note's sentences and chooser.

- 00:16:50 I'll make the STEP layer's wording exact per book (some books have places whose pieces are MACULA's), and tighten the remaining sentences.

- 00:17:27 Now the rail row's why (item 9).

- 00:17:39 Item 11: reset sets the default sources first, then relays and repaints once.

- 00:18:27 Now the page side of item 12 (gate a pointer pill whose resolution carries the names mark). First, the lookup beside `formOfFor`.

- 00:18:38 Let me review the whole diff so far to make sure every change is mine and coherent.

- 00:18:53 A few comment touch-ups: the markRuled comment got escaped guillemets, and the `drawn` note on reopenForDefaults duplicates the existing one.

- 00:19:20 Now the bake (item 12): carry the names gate's mark on resolutions whose row its source marks a name. Let me check the pin helpers first.

- 00:19:25 Every served resolution names its key, rank and m. Now the bake edits.

- 00:20:01 Run the bake into my log folder first to inspect, then into the tree.

- 00:20:17 The marks match the store-facts count exactly (34). But the record is 32 KB smaller than before, which needs explaining. Let me compare the top-level parts.

- 00:20:24 The size difference was characters versus bytes (628,046 bytes on disk against 626,680 before). Now the real bake into the tree, twice to confirm it is stable.

- 00:20:30 Now lint the page against the baseline.

- 00:20:37 The script needs an absolute path (it changes directory); rerun.

- 00:20:48 Lint is at baseline (4/175/9/1 ORDER_RULE_ID/2). Let me confirm the use-before-define names are the same set as before, not a trade.

- 00:20:59 Now the tool lint, the way the brief says (copied under `v29/lint/tools/<dir>/`, linted from `v29/lint`).

- 00:21:31 Both versions of the tool lint clean. Before the browser probes, let me find test places for item 12's newly gated pointers.

- 00:21:50 Now the browser probes. First item 2, the export at the nine sign-gap places (plus Ruth 1:19:8 as the control), on the tree and on the page before the fix.

- 00:24:06 While the export probe runs, the probe for items 3 and 4 (a non-STEP first waiting for, or refused, its book file).

- 00:24:46 While that runs, the card probes for items 5, 6 and 8.

- 00:25:22 Item 5 holds at rest (chip stays M4 with STEP's own credit). Now the same press under MACULA, and the before-fix page for comparison.

- 00:26:29 Before the fix: I Samuel 18:7 exported «1 reading was not exported» and Ezra 4:12 three; now 0 and 2, with both words cited from STEP. Now the waiting/refused results (items 3 and 4).

- 00:27:38 Items 7 and 8 hold (one MACULA line at MACULA-piece places, at rest and under MACULA; BDB's empty picks read «· 1 (no words given) (sense 2)»). Item 6:

- 00:28:20 That stale label on reopen is not from this build. Let me confirm on live before deciding.

- 00:29:02 Now items 9 and 10: the titles, the notes, the chooser and the lit STEP's disclosure attributes, plus the rail row's why.

- 00:29:50 Items 9 and 10 hold. One number to double-check: Psalms shows STEP at «>99.9%», while the review quoted has.step = places for Psalms.

- 00:30:30 Now item 12 on the page: the pointer pills at non-name places (Genesis 32:29:11, 42:16:1) and at a name place (11:29:9), before and after.

- 00:31:45 While the timing runs, a static pass. The rail row's why feeds the /toggles/ page, which I don't own; let me see whether it carries the old text.

- 00:32:32 A checks part has already taught check-default-picks the new note wording. Let me read its expected-note function so the page and the check say exactly the same words.

- 00:34:15 The checks part already models D15 as «every line is the line as it rests», matching item 4. Let me check the reset timings' progress.

- 00:35:26 While the reset runs go, a few static checks: nothing else reads the removed `DFLT_TITLES.step`, and the new names are defined before use.

- 00:35:38 Let me look at what check-names-gate and check-form-of judge on the page, since item 12 touches both, to run them after the timings.

- 00:36:15 While the timings run, let me see how the two checks I want to run find their page.

- 00:37:04 While waiting, let me diff live's and the tree's hot paths (wordBlock, materialise, lineUnder) for anything per-word that is new.

- 00:37:52 Tree at rest: 54.2 s, tree from MACULA: 68.8 s, live: 42.7 s, all under contention from another part's self-test. I'll let the batch finish, then profile.

