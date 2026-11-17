# How the site works, the page side (a one-page map)

Page lane (Elijah), 16 November 2026 AD, at `main` afea14aac6. The store side (ledgers, lattice, pins) is the corpus lane's half of this map, asked for in `FOR-MOSES-2026-11-16-the-plan-for-next-week.md`. Paths are under `reader/` unless they start with `wip/`.

## What a reader sees

- **The text:** the Hebrew words of a chapter, from the book's zone.
- **The line:** an English reading under each word, credited by a chip.
- **The card:** opened by pressing a word. It has pills (one per reading, grouped by the printed words), a record under the pressed pill (the source's definition, notes under it), and counts of what is held back and why.
- **The rail:** the switches (pointing, sources, kinds, word senses, signs, order).

## Where each comes from

- **The text: `data/zones/<book>.bin`.** Gzip JSON: sections, then words. Each word has its surface `s`, key `k` (letters), STEP's pieces `pg`, STEP's tag `tg`, MACULA's lemma `h`/`hp`, and name `np`. Built once from the corpus lane's sealed text. The round re-projects what a zone says about its words. Beside it: `<book>.lattice.bin`, the corpus lane's grades per card (tools/project-lattice-v12-v1.mjs).
- **The line at rest:** each default source's own pick at the place, STEP first, then the place's own reading, then the pointing's leader from the sidecar (`lineUnder`); a leader that is a pointer the lane's map resolves prints the resolution with the pointer beside it, as its pill does (pointer-line-rule-v1, ship 8). Its own reading there is TAHOT's pieces, then the second source's, then STEP's again (task 135). The picks are baked per book in `data/default-picks/` (tools/bake-default-picks-v1.mjs, from the corpus lane's picks ledger). A run of words reads word by word; the span store's joined line stands only where a word has no reading of its own. The plain list under a chapter is a recording of these lines read off the page (`data/resting-lines/`).
- **The card: `poolFor(surface)` in `zone.html`.**
  - It gathers the rows: the route store's rows under the key, plus the rows beside the store (span store, piece store, Jastrow, the Samaritan dictionaries).
  - It holds rows back in this order, each counted on the card:
    1. the source switches;
    2. the entry gate (STEP's tag at the place against each row's own entries, its facts `n`; where STEP gives the word no tag, the entries of MACULA's lemma, `te`, written by the projector, read by `placeTags`; entry-by-lemma-rule-v1, ship 8);
    3. the names gate;
    4. the pointing gate. It grades each row by its own headwords: `gradeRow`, pointing-grade v5. It acts only where some row points as the place does. A row pointed otherwise is withheld, and one with no pointing is held back. A row of the place's own entry, or giving the reading the reader ruled, stays.
    5. the piece class (one-letter pieces);
    6. the stems (binyan);
    7. the span grade (each span place's `held`);
    8. the kinds that rest shut;
    9. Jastrow's word senses.
  - Then it groups by the printed reading (one reading, one pill) and sorts (`sortPool`: the default picks, oldest first within a tier, Strong's sign last).
  - Notes stand under the record: BDB's sense openings, Strong's hedges (`data/strongs-hedges-v1/`), the provider's notes on its own file.
- **The store: `data/route-store/`.** An index plus 256 gzip shards; read through `tools/gloss-store-v1.mjs` (`openRouteStore`). A row holds:
  - [0] rank, [1] reading, [2] definition, [3] source (M id), [4] year;
  - [6] the source's headwords;
  - [7] a ledger's divisions, [8] print texts, [9] made-space closes (and a provider's note);
  - [10] facts: entries `n`, name, stems.

  Store tools change it, each once, with a receipt, and never in the round: ledger divisions, years, made spaces, own pointing, strikes, landings, row entries, name rows, sense openings.
- **The corpus lane's inputs:** pinned under `data/<name>/PIN.json` by size and sha256. Its letters and ours are in `wip/<date>/`.

## How a change reaches the site

1. **Code, and any store tool,** on a branch from `main`.
2. **The round:** `tools/round-v1.sh`. Its steps:
   - zones: re-project the lattice (needs the corpus lane's lattice, binyan, stems extension);
   - stamps; search;
   - defaults: the picks;
   - records: what the shelf is, judged and sealed;
   - lines: recorded from the page in a browser;
   - chain: the chain books, read off the page;
   - door: the front door and book pages; the engine `engine-<sha>.js` is cut from `zone.html`; the manifests.
3. **Proof:**
   - every resting line against live, each move explained;
   - the checks the change touches;
   - the suite: `tools/run-checks-v1.mjs`, 172 checks, each check's `GUARDS:` line naming the rules it holds; a check stopped for time under load runs again alone (ship 8);
   - the gate: `tools/check-same-product-v1.mjs`, live against new; S1 the lines, S2 the first cards.
4. **Ship:**
   - one commit on `main`; `gh-pages` follows `main` with the commit "gh-pages follows main";
   - wait for the Pages deployment and the live check;
   - then `check-nothing-unlanded-v1` and the sha audit.

The scripts of record are in `wip/2026-11-16/ship-7/tools/`.

## Where to find why

- Every rule has an id in a comment where it acts (`grep` its id in `zone.html` and the tools), with the owner's words and the date it rests on.
- `PIPELINE.md` names each step's tool and inputs.
- The notes in `wip/<date>/` hold the decisions, the measures, and each ship's record.
