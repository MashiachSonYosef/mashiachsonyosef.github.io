# The toggle pipeline · v1 (2026-09-11)

How a toggle gets from Moses's ledger to a live row on the rail. The first
one through — **look up by: the form / the headword** — is the worked
example; every file it touched is named so the next toggle can copy it.

## The parts

| step | who | where | what it produces |
|---|---|---|---|
| 1 count | Moses | `r2:mishkan/moses-ledgers/toggle-builds-v1/<toggle>/` | a ledger, one row per position (`book, ref, i, j, surface, form_key, …`) or per card (`primary_source`, `primary_licence`), plus blind recounts; `README-v1.md` at the root has one row per toggle with the ruling it still needs |
| 2 project | this lane | `tools/project-toggle-<name>-v1.mjs` | reads ONE zone + ONE ledger, joins on the zone's own positions, writes ANOTHER zone carrying the answer on each word and a receipt at `emitted_from.toggles.<name>`, typed under the single-pass exemption |
| 3 regloss | this lane | `tools/regloss-zone.mjs` | re-projects the route store over the zone's keys — which now include the toggle's keys — so the line can answer under them without a fetch |
| 4 shelf | this lane | `data/zones/<slug>.bin` → `emit-zone-store-v1`, `emit-zone-shipment-v1`, `emit-store-manifest-v1` | the zone re-pinned; a zone that changes without a new pin is REFUSED by the reader (by design) |
| 5 rail | this lane | `zone.html` · `TOGGLES` registry | one entry per toggle: `id, lab, why, positions, live(), waits, get, set, now` — the rail draws itself from it; a row whose layer is not on the zone is drawn dead with its `waits` |
| 6 ruling | owner | recorded on the projection receipt (`rulings_owed` → the ruling and its date) | the row goes live |

Then the door rebuild (`build-front-door-v1`), the sync, the guards, the deploy.

## The join, and the law it keeps

Per-word ledgers are matched **verse by verse, in order**: the n-th ON word of
a verse in the zone is the n-th row of that verse in the ledger, and the match
is **proved by the form key** — `form_key == k` at every position, or the whole
verse is held and counted in the receipt. Never patched around. A ketiv-qere
site is one position with two keys on the zone; it matches when the row's
form key is either.

Where two witnesses disagree (MACULA vs TAHOT on a headword), the word carries
nothing and the receipt counts it: the page does not pick between witnesses.

## The worked example · headword

- `tools/project-toggle-headword-v1.mjs` — the projection; writes `h` (headword key) and `hp` (pointed headword) on each word where the witnesses agree.
- `tools/regloss-zone.mjs` — one added line: `if (w.h) keys.add(w.h)`.
- `zone.html` — `lookup` state + `lookupKey(word, k, table)`; the line and `repaintGlossOrder` read under `lookupKey`; a one-form word opens its card under the headword key with `form_k` riding along, and the card says *looked up by its headword …*.
- Genesis: 1,533 of 1,533 verses proved; 19,893 of 20,612 words carry a headword; 11,053 reach an English the form lacks.

## The second one through · the lattice (v12, 2026-09-13)

The corpus lane's lattice grades every card of every position against the
word as the text points it, and since v12 carries the headword stack under
lemma-sort v3, each card's licence class, year, corpus and transliteration
flag, and the Leningrad difference per position. It is projected by
`tools/project-lattice-v12-v1.mjs` under
`lattice-projection-rule-v1-the-lattice-is-projected-over-a-zones-own-positions-and-never-replaces-the-store`:

- **the join** is the headword join, pair-aware: the n-th ON word of a verse
  is the n-th ON position (kind, not rule — an ink mark is not a word), and a
  position proves when any of its entries keys as one of the word's keys AND
  the verse's rows carry `j` distinct and ascending. **`j` is the position,
  not `i`** — the corpus lane's warning of 2026-09-13, and it is real: `i`
  repeats across the parts of a maqaf compound 2,951 times inside a verse in
  Genesis alone, so anything keyed on `i` merges the pieces of a joined word.
  This tool never keyed on `i`; it binds by file order, which is `j` order,
  and now proves that rather than assuming it. 39 books: 23,204 verses
  joined, none held, none absent.
- **on the word**: `hg` — the headword's first reading under lemma-sort v3,
  with `hm` (source, licence key, year), only where `h` is the lattice's
  lemma and the stack has cards in this book; `ld` — where Leningrad differs.
  Under *look up by: the headword* the line prints `hg` and the card opens on
  it, which retires the route-store-order defect on Genesis 1:1.
- **in the sidecar** `<slug>.lattice.bin`, fetched the first time an order
  needs it: per key the cards' fingerprints (`fnv1a("text|source")`, the same
  function in the tool and in zone.html) in lattice order with transliteration
  flags; per pointed surface the tier of each card (`m` vowel match · `n`
  normalized · `x` mismatch), which cards cite this verse, and the first card
  under each lattice order so the LINE moves, not only the card.
- **the store stays the store**: a lattice card the store does not hold is
  never shown; a store row the lattice did not grade sorts after the graded
  ones and is never dropped. `check-lattice-projection-v1` L5 prints the join
  rate.
- **the rail**: *reads first* gains masoretic, cites here, vowels differ
  (lattice) and outside the era (corpus record, explicit non-era only);
  *license* is live as a SORT (class read off each posture key: 0 PD/cc0 ·
  1 BY · 2 BY-SA · 3 NC · 4 other); *names* as sound puts transliterations
  first; *edition* marks Leningrad differences with a dotted gold rule. The
  comparator chain in `sortPool` is license preference → names → the chosen
  order → oldest first; every position is a re-order of one pool.
- **not projected**: `pieces` (joined words) until the welded-form ruling.
- **guards**: `check-lattice-projection-v1` (the files), `check-lattice-orders-v1` (the page).

## What is live, and what is left (2026-09-13)

Live: **reads first** (all seven positions), **pairs**, **look up by**,
**license**, **names**, **edition**. One row is not:

1. **joined words** — `maqaf-v1.json` + `maqaf-compounds-v1.jsonl.gz`, and the
   lattice's own `pieces`, which v12 carries and this lane does not project.
   A RULING FIRST, and it is the owner's: suppress WELDED where nothing
   matches the vowels (1,041 of 1,311)? The rail says so on its own face.

Two rulings stand behind live rows and are still owed:

- **pairs** — `qere-ketiv-v1.json` has what to show at the 298 qere-only /
  21 ketiv-only sites; the row runs on the default until the owner rules.
- **license** — the Jastrow-not-served ruling must sit ABOVE the license sort,
  or a public-domain-first sort re-serves him (58,093 ties). The sort is live;
  that ruling is not written.

## What a new projection tool must do

Copy `project-toggle-headword-v1.mjs` or `project-lattice-v12-v1.mjs`. Keep:
the verse-by-verse join proved by `form_key` — and, where the ledger carries
`i` and `j`, **prove `j` distinct and ascending and never key on `i`**, which
repeats across the parts of a maqaf compound (42,627 times over the 39 books); the receipt at `emitted_from.toggles.<name>` with `rule`, `source`
(path, bytes, sha256, ledger path on R2, witnesses, `candidate_only`), `join`,
`projected_on`, `projected_by`, `counts`, `what_the_word_carries`,
`rulings_owed`; the typed exemption merge (`post_build.wrote` gains
`toggles.<name>`). Then add the `TOGGLES` entry with `live()` reading that
receipt, run the chain, and put the row in front of the owner before wiring
anything the ruling could change.
