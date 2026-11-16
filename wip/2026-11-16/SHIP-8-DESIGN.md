# Ship 8, the design (for the week of 17 November 2026 AD)

Page lane. Everything here is measured in `wip/2026-11-16/` (the-entry-measure, the-phone-measure, task-137-pointer-lines). The work items are page-lane changes that need no ruling; the owner's cards of the week (`OWNER-CARDS-WEEK-OF-2026-11-17.md`) ride in when answered.

1. **The entry where STEP gives no tag** (plan section 1, step 3). The place's entry falls back to MACULA's lemma, through the store's rows headed by it: 754 of 861 untagged places, including 1 Samuel 2:10. Change `tools/entry-gate-v1.mjs` (placeEntry with a fallback), the page's copy, the projector and check-entry-gate. Measure: resting lines moved (expect 1 Samuel 2:10's «unjust one» to give way), and rows kept and withheld.
2. **A pointer never leads a line, in the Bible books** (task 137, first half). The 4 lines print the map's resolved English, as the pointer's pill does. Elsewhere, the next reading that is not a pointer leads. Add a law to check-form-of-v1. The Tikkunei Zohar's 1,261 wait on card 3 and on the corpus lane's map.
3. **The phone (big picture 2):**
   - Fetch the lattice sidecar when the first section is drawn, not at load. The 1.6 MB comes off the time to the words; no resting line may move.
   - Split the piece store by chapter (`tools/bake-piece-store-v1.mjs`, the page's `pieceBookReady`): the first card fetches about 40 KB, not 2 MB.

   Measure again with `wip/2026-11-16/the-phone-measure/phone-measure.mjs`, over a local server that compresses as Pages does.
4. **The suite's time limit** (task 125). check-run-card-forms takes 39 s alone and gave no verdict in 1,500 s under the suite's load. Give the runner a per-check limit from each check's own declared time, or run the browser checks fewer at a time.
5. **The owner's cards, if answered:**
   - card 2, one reading per source at rest (about 3 readings on a typical card, 10 at the 90th percentile);
   - card 1, the promise, then the category table's first ruling.

Order: 1 and 2 are small and change readings; 3 changes no reading and is the most felt on a phone; 4 is process. One ship, through the round, the suite and the gate as in `ship-7/tools/`.
