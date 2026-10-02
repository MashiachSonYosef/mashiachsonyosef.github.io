# Corpus relay · 2026-10-02 · one reading, one pill

For the corpus lane, for the R pill ledger. The owner's word: the bundling is
the serving lane's, and the corpus lane's ledgers should reflect it. So this
says exactly what the card does today, so a ledger can reproduce every pill
before it proposes a merge, and both lanes count the same population.

## The population

One card: the readings offered for one store key (the form's letters,
`k`), from the route store and, while their switches are on, the two
overlays under `data/overlays/jastrow/` and `data/overlays/samaritan/`.
Samaritan rows count only in the lanes its own index marks ruled.

## How a row becomes readings

The route text, slot 1, is cut the way `tools/sense-split-v1.mjs` cuts it:
senses on `;`, then readings on commas outside the provider's parentheses
(`sense-split-rule-v2`). A sense the cut marks damaged gives no reading.

## When two readings are one pill

Two readings are one pill when they print the same. The printed form is the
reading with its `/` pieces joined by ` + `, one closing period dropped, and
the whole lowercased. Nothing else is folded today: not a leading "the", not
a parenthetical, not a plural. So Cowley's "creation" and Kaikki's "the
creation (in religious sense)" are two pills, and Cowley's two entries
"creation" and "creation." are one.

## Store and overlay in one pill

- A reading only the store gives: its pill carries every store row that gives
  it, its year the oldest of theirs, its rank the lowest.
- A reading the store and an overlay both give: one pill. The overlay's rows
  join it after the store's rows and add nothing to its year or rank.
- A reading only an overlay gives: its own pill, after every store pill.

The pill is credited to its first carrier: oldest wording year first, undated
after, and a store row always before an overlay row whatever the years.

## How the pills are ordered

A pill sorts by its store rows only; an overlay's rows that joined it never
move it. Pills only an overlay gives come after every other pill, above the
licence preference. Rule `overlay-rule-v1`, guarded by
`tools/check-overlays-v1.mjs`.

## Measured, so a ledger can check itself

The first 30 cards of a book, both switches on against both off:

| book | readings an overlay adds | store readings an overlay also gives | store readings moved or re-credited |
|---|---:|---:|---:|
| Genesis | 474 | 42 | 0 |
| Daniel | 232 | 52 | 0 |

A ledger that reproduces these counts on the same 30 cards cuts and bundles
the way the card does. Any fold it proposes beyond the printed form is a new
lane, priced on its own, for the owner to switch on.

## Three things in the overlay data

- **A page reference read as a reading.** Cowley's entry for בראשית is
  "creation, p. 323 (Heb.), the book of Genesis.", and the comma cut makes
  "p. 323 (Heb.)" a pill.
- **Wiki markup in a reading.** Samaritan source MSAM5 (Wiktionary) prints
  "in the [[beginning]], [[at first]]" with its link brackets.
- **Latin definitions.** Uhlemann 1837 defines in Latin, as printed and not
  translated, so some pills read like "m. consiliarius". This follows the
  overlay's own rule; it is noted only because a reader will see it.
