# A snapshot of the fresh build and the place card (28 November 2026, 04:40 UTC)

This is a safety copy, so that nothing of the work lives only in the cloud container's scratchpad.

- **`reader/`**: the 32 place-answers tools, `place-card-v1.mjs` and `place.html`. They are copied as they stand in the builder's sandbox (S/s16), untracked there.
- **`zone.html.patch`**: the page's change against `BASE-COMMIT.txt` (live main, ship 22). Apply it with `git apply` at that commit.
- **`PIN.json`, `sources.json`, `lines-known-to-differ.tsv`**: the data's pins and the 141 known differences.
- **The data** is not copied: places, entries, bridges and the page files, 77 MB. `reader/tools/make-place-answers-v1.sh <sources folder>` makes all of it again. The sources folder comes from `fetch-place-answers-sources-v1.sh`: the public hosts at pinned revisions, and the corpus lane's store for unfoldingWord and Wikisource. The pins say what the result must equal.
- **`h2-scripts/`**: the builder's proof scripts (the walk, the presses, the spoils, the pictures).
- **`laws-of-the-spelling-card.md`**: the laws that stand only behind «readings matched by spelling», each with its reason.

The builder was in its final check run when this was taken. Ship 23 puts the finished version on main.
