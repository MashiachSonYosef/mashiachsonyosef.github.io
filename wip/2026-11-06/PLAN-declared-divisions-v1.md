# The page side of the punctuation ledger: a plan (Elijah, 6 November 2026)

Not built yet. This is what I will build when Moses ships his first declaration under ask v1.1 (openscriptures_strongs), after I review it. Written down so the wiring is quick and so it outlives this container.

## What arrives

Per dictionary: `<source_key>.declaration.json` (shapes, each with `divides`, `precedence`, `lead_words`, `named_cases`, branches) and `<source_key>.classifier.mjs` (from classifier-template-v1: `classify(text)` returns `{ i, mark, shape }` for every mark; `SHAPE_IDS`). The declaration says which shape ids divide; the classifier says where they are.

## The review comes first

1. Run checker v1.1 on his classifier and on his recount.
2. Write a third classifier from his words alone and compare counts.
3. Try the eight probes in `../../2026-10-31/provider-declarations/pilot-2026-10-31/README.md`.
4. Read the classifier before running it at build time: it is another lane's code.

Nothing is wired until the owner rules the branches (the resting option never divides, so an unruled branch is safe to ship as resting).

## The wiring

1. **A build tool, `tools/apply-declared-divisions-v1.mjs`.** For every store row of the declaration's M ids it runs `classify(row[1])`, keeps the occurrences whose shape divides, and cuts the route text there. Every piece keeps its characters (rule 4); the printed reading trims whitespace and the dividing mark at its edge, and a lead word stays in its piece. Each piece becomes its own row: same rank, same year, same headwords `[6]`, the definition text `[2]` unchanged, and `[5]` (the cut flag) set to 2, meaning "a piece the provider's own declaration divides; never split again". The store keeps its shape (seven slots). The tool writes `data/declared-divisions-v1.json` (per dictionary: the declaration's and the classifier's sha256, rows cut, pieces written, shapes that cut) and recomputes `store_version` from the bytes, as `strike-source-v1` does.
2. **Every place that divides route text treats a row with `[5] === 2` as one reading,** as it already treats a no-derivatives row: zone.html (`poolFor`/pool builder, `pKey`, the own-text line, the cut note), `tools/gloss-store-v1.mjs` (`readingPool`), `tools/sense-split-v1.mjs` callers in `project-lattice-v12-v1`, `regloss-zone`, `gloss-m-v1`, `proper-name-v1`, `bake-search-index-v1`, `bake-witnessed-order-v1`, `build-front-door-v1`. One helper, shared, so the page and the tools cannot drift.
3. **The rebuild** after the store moves: re-gloss the 40 served zones, re-project the lattice sidecars (their leaders read the pool), re-bake the search index, re-pin (only the bins on disk; carry the shelf's pins), move the served hashes in the serve-gate receipt, build, checks, the same-product gate.

## Known consequences

- A lattice card joins a store row by fingerprint (text | source). A cut row no longer joins its card, so its grade comes from its own headwords `[6]` (every v2 row has them) and the "cites this verse" order loses it. Count both in the relay.
- The cut note on the card reads `[5] === 1`; a declared piece is not a store cut and shows no note.
- `sense-split-rule-v3` stays for every dictionary not yet declared.

## Checks to write with it

- Every row of a declared M carries `[5] === 2` or is whole; no declared piece is split again on the card.
- The pieces of a cut row rejoin, character for character, into its route text.
- The line and the card's first pill agree on a word whose lead comes from a declared dictionary.
