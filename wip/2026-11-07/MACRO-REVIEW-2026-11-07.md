# Macro review · 7 November 2026 · the page lane as it stands, with the weight

The owner, 7 November: lighter weight, "and that doesnt just mean frontend"; then a macro review, then the deletions, then the Tikkunei Zohar. This is the review's first full cut, measured on main 1df6558c (the landing round). Every figure names what it counts.

## 1. What is served, and what it weighs

The site tree is 435 MB; the git history about 420 MB packed. reader/data is 299 MB:

| folder | MB | what it serves | how it reaches a reader |
|---|---|---|---|
| piece-store | 122 | the piece witnesses on cards (PIECE:TAHOT, PIECE:MACULA) and the parts of a word nobody defines | one JSON per book, fetched where its index lists the book (Genesis 8.6 MB, Amos 0.8 MB) |
| dictionary-store | 64 | the record behind every reading, printed on the card | 256 shards, one fetched per card |
| zones | 54 | the 40 zones (21 MB), the 39 lattice sidecars (29 MB), the commentary zones (4 MB) | the zone and its sidecar per book (Genesis 1.06 + 1.47 MB; Isaiah 1.27 + 1.76 MB) |
| chain books | 22 | the per-book chain pages | by link |
| route-store | 16 | the store: 652,885 rows under 124,901 keys, 36 ledgers, 146 sources | index (129 KB) on load, shards per card |
| source-suggested | 12 | the BSB "source suggested" order (candidate_only) | one JSON per book (Genesis 762 KB) |
| search-index | 7 | search | on demand |
| row-strikes-v1.json | 5.5 | the record of every row a list took, whole | not fetched by the page |
| overlays | 5 | Jastrow and the Samaritan dictionaries, beside the store | shards per card |
| hud-toggles, hud-runs, run-cards | 6 | the run cards and the HUD switches | per book (Genesis 250 KB + 53 KB) |
| witnessed-orders-v2.7 | 3 | the corpus lane's shipped witnessed order, the bake's input | not fetched |
| ledgers-v1 | 3 | the 36 declarations and classifiers | not fetched |
| span-store | 2 | the spans | per book |
| the loose files | ~10 | receipts and records (serve-gate 1.0, derived ranges 0.9, corpus atlas 0.4) and the legacy y-genesis-navigation-v1.js (2.2, read by two tools only) | mostly not fetched; form-of-pills-v1.json (0.8 MB) and zone-store-v1.json (0.5 MB) are |

What one visit to Genesis downloads, before the server's compression: the page (zone.html 1.06 MB, the engine 0.86 MB + 0.18 MB CSS), the zone and its sidecar (2.5 MB), form-of-pills (0.8 MB), the BSB order (0.76 MB), the shelf's pins (0.53 MB, where the chapter page carries no meta), the HUD switches (0.25 MB), the store index (0.13 MB), and, for the cards, the piece store's book file (8.6 MB) and the span store's (0.09 MB). The piece store is the heaviest thing a reader can be handed and the heaviest thing on disk.

## 2. The data flow, as it is actually run

The store is the corpus lane's route store, served as this lane keeps it: 36 ledgers over every source (ledger-division-rule-v2: a row divides only where its ledger's shapes divide under the owner's answers), the row-strike record (every row a list struck, withheld, re-keyed, rejoined, re-headed, retexted, restored or landed, whole), the span store beside it, the overlays beside the cards, the piece store as witnesses on cards, the dictionary store as the records. The four sources with no ledger (Jastrow, the Samaritan five, the span store's own two) still run on the page's comma rule (chain A).

A ship, as it was run four times on 6 and 7 November:

1. the store moves (a list through strike-rows, a ledger through apply-ledger-divisions, the manifest re-emitted);
2. bake-witnessed-order and regloss-zone over the 39 served zones (the baked lines, the columns, the name leads, the alternates), then over the 21 commentary zones;
3. project-lattice over the 39 sidecars (the grades, the leaders under every order and under the pointing filter, with their carriers and alternates);
4. finish: the chain books, the search index, the pointing-grade recount, the re-pin, the c0 refusals and the serve-gate receipt, the front door and the chapter pages, the lane state, the ledger index, the pipeline manifest, the deploy root;
5. the 48 checks in two chains (about 40 minutes), the gate against the live build (18 chapter pages of 9 books: every line under every switch, the first cards), the ship (main, then gh-pages follows main), the Pages deployment, the live check.

**The first debt is that this pipeline is not in the repository.** build.sh is a one-pass build from the corpus (19 of the 116 non-check tools); 97 tools are called by no build stage, and the ship's own steps live in scratch scripts recreated by hand each round (regloss-bake, reproj, finish, finish2, after, gate, chainA, chainB). The pipeline manifest says so every run. A fresh clone cannot reproduce the served site from build.sh; it can only re-run what this session remembers. The fix is one script in tools/ that encodes the ship (store change, bake and regloss, project, finish, the chains, the gate), with its working folders under build/, so the manifest's "not called by any build stage" shrinks to the tools that are truly one-off.

## 3. The rules and the checks

- **Rules:** 142 declared in the tools and the page, 129 named by a check, 13 unguarded: book-order-rule-v1, door-filing-rule-v1, form-of-pills-rule-v1, ledger-division-rule-v1 (superseded by v2), no-names-rule-v1, piece-gloss-rule-v1, route-delta-landing-rule-v1, row-strike-rule-v3 (superseded by v5), sense-split-rule-v2 (chain A; superseded by v3), toggle-design-rule-v1, toggle-push-rule-v1, toggle-queue-rule-v1, v-ledger-counter-verification-rule-v1. Three of the thirteen are old versions still quoted somewhere; the rest guard the door, the toggles' delivery and the piece gloss.
- **Checks:** 165 on disk, 32,229 lines. The round chains run 48 (the ones that move with the store and the page); run-all-checks.sh runs every check by glob, on request. 47 checks carry no GUARDS line, so the manifest cannot say what they witness (attachment-grain, blanks-pill, block-in-table, card-channels, card-numbering, catalog-case, choice-memory, contents-shut, corpus-clean, dictionary-toggle, door-find, door-license-in-card, drag-offscreen, form-of, hud-runs, levels, licence-carried, licence-names, live, mam-q-shipment, maqaf-lattice, menu-switches, names-pill, nothing-hand-typed, nothing-overlaps, page-agrees-with-its-record, page-fetches, piece-store, pill-whole, reading-language, reading-rows, reference-groups, reset-pill, root-card-credit, ruled-equals-first-paint, ruled-mark, ruled-split-fits, same-product, scope-derived, search, selection, span-store, underline-joins, word-address, work-attribution-display, workspace-staged, zone-word-arithmetic). Two checks are red in every run by the environment (zone-store's pins of the unserved shelf; frame-coverage V); they should say so themselves rather than be read around.
- **The page:** zone.html is 15,952 lines; the non-check tools 24,819. The page carries mirrors of tool functions (the generic split, the pointing grade, the span join); check-pointing-grade and check-sense-split hold the first two together by text, and nothing holds the third.

## 4. Chain A, the comma rule

Code only, about 300 lines plus the page's mirror; kept alive by the four sources with no ledger (Jastrow 115,918 rows, 56,248 divided by it; the Samaritan five 2,875, 2,575 divided; the span store's own two 696, 1 divided). Retired by one ruling (they print whole until their ledgers land) and one round: delete sense-split-v1 and the generic branch in the store reader and the page, retire check-sense-split and check-cut-readings and the "against the generic rule" counts, measure at the gate (the Jastrow and Samaritan pills join), ship. The owner's question of 7 November, answered in the session; the ruling is pending.

## 5. The deletion list, first cut

Tier 1, safe now, no reader-visible change (~10 MB on disk): the tool-only records out of the served tree (row-strikes-v1.json, the serve-gate receipt, the derived ranges, the corpus atlas, pointing-store-verify-v1 and -v2.2), the legacy y-genesis-navigation-v1.js and the two tools that read it, the six loose files no tool names (corpus-defect-manifest-2026-08-22.json, count-stamp-receipt-v1.json, pointing-store-verify-v2.2-v1.json, y-i-kings-commentary-y-holds-v8.csv; source-defaults-v1.json and source-short-names-v1.json are hand-kept by design and stay).

Tier 2, the owner's call, each a feature a reader can see, each taking its checks and its baked columns with it:

| feature | on disk | per visit (Genesis) | what goes with it |
|---|---|---|---|
| the piece store | 122 MB | 8.6 MB | the PIECE witnesses on cards, the parts of a bare word, check-piece-store, check-lattice-parts-in-card, bake-piece-store, project-piece-gloss |
| the BSB "source suggested" order | 12 MB | 0.76 MB | the order on the rail, check-source-suggested, project-source-suggested, the order's columns |
| the chain books | 22 MB | by link only | build-chain-book, check-chain-book |
| the HUD switches and run cards | 6 MB | 0.3 MB | check-hud-toggles, check-hud-runs, check-run-cards, their projectors |
| form-of-pills | 0.8 MB | 0.8 MB | the pointer resolution beside a form-of pill; check-form-of |

Tier 3, not now: rewriting the git history to shrink the clone (destructive; a backup and the owner's explicit word first).

Debt that is not deletion: the split-pills grouping (6,736 pills that differ by a closing stop); the one-step alternates under the source switches (the table's and the filter's); the 238 span-store texts and the five landing texts with no shape; OMW's nine; checker v1.2 and the print-from-declaration step (label_off for Kaikki B05, the 37 print fields); the 47 checks without a GUARDS line; the pipeline in scratch.

## 6. The order proposed

1. The owner's two rulings (the four sources print whole until their ledgers land; which of tier 2 goes).
2. The chain A round (one ship).
3. Tier 1 and the pipeline into the repository (one ship; the manifest proves the second).
4. Tier 2 as ruled, feature by feature, each its own ship with the gate reading what left.
5. The Tikkunei Zohar.
