# Corpus relay · 2026-10-03 · the run card

For the corpus lane, for the megacompspan ledger. This page says what the serving lane will draw for a run, and
what it needs delivered to draw it. It decides none of the open questions in `THE-RUN-LEDGER-BACKWARDS-v1.md`
section 7 or in `LEDGER-run-card-v1-candidate.md`. Those are the owner's.

## The owner's words

Today: *"moses is working on a megacompspan ledger. we missed some 4500+ spanned definitions. youll need to do
1 single hud whereever words happen to match across xyz span. A+...+V"*

From the record, as `LEDGER-run-card-v1-candidate.md` quotes it: *"if you had 20 words in a row which happened to
be defined by a single license as an exact bytematch it would go as a single hud megacompspan ... ABC…V / A+…+V
unless you happened to get another match like ABC then it would include ABC + D+…+V."*

The 4,500 is read here as the catalog's multi-word headwords (3,375 clean word sequences, 4,477 in any form, by
the want) against the 2 multi-word keys the served store kept of 124,935.

## What the page will draw

- **One card per run.** Pressing any word of a run opens one card for the whole run. The run is the longest
  stretch a license names at that place, as the candidate ledger's section 3 defines it.
- **Its rungs**, in the owner's terms: AMB is the normal maqafed form, AB is the weld, and A + B is the two words'
  solo definitions strung together by us, never a dictionary's reading. A maqaf run carries AMB, AB and A + B; a run
  with a space carries the run as named (A B), AB and A + B; and a longer run carries every way to cover its words
  with named runs and single words: the whole (ABC…V), every mix (ABC + D+…+V), and the words one by one (A+…+V). A rung no dictionary answers says so when
  pressed, as the maqaf run's rungs do today.
- **The words stay places.** Every count, every line and every word card is what it is now. The word-by-word rung
  is each word's own card, so nothing a word offers today goes missing.
- **Where it opens.** On the word pressed, word by word, because that is what the line under the words reads and a
  card opens on its line's reading (the owner, 2026-09-27). The whole run and every mix are one press away, and a
  mix is pressed by the reader, never chosen by the page. The line does not change in this step: it stays word by
  word until the owner rules that a run's reading may stand on the line.
- **Maqaf runs.** A named run that is exactly a maqaf chain is the card the chain already has, with the run's rows
  added to its whole rung. A run that holds a chain and more is one run card, and the chain's own rungs (as
  written, joined, the folds) stand inside it.
- **Overlaps** (axis O). Either way the owner rules: two cards (SEP), the word in both opening the longer one first,
  or one card over both (UNION).

## What the serving lane needs delivered

1. **The rows behind every named run**, in the route store's own row shape (the 7 slots of `route_row`: rank,
   route text, definition text, m id, year, piece, headwords), under the run's own key. Proposed key: the words'
   letters as the zone keys them (each word's `k`), joined by one space, so a run reads the same whatever gap the
   source printed; the source's own gap stays on the row (in its headwords slot or an eighth slot, as the Samaritan
   overlay carries its lanes). Shards by the store's rule (the first byte of sha256 of the key), gzip JSON. Either a
   new store version with these keys in it, or a store of its own beside the route store with its own index and
   manifest; the page can read either, and the lane picks.
2. **Per book, the cards**: each card's first and last place, the places of every named run inside it, and each
   named run's key. Please name the place axis: in `cards-v1.jsonl` Amos 1:4 בֶּן־ is A 59, and it is the 66th entry
   (index 65) of the zone's `sections[].words`, which also holds the verse-end ׃. The page will map whichever axis
   the ledger names. It will not guess one.
3. **Each open axis as positions, not one combination.** The owner wants toggles implemented and checked one at a
   time. If the cards come keyed by the grid axes (P, V, M, K, G, T, O), each axis can be a switch on the page, with
   its default the owner's ruling. If only the owner's chosen combination comes, that is the one the page draws.
4. **A count to check against**: cards, rungs and places in a card per book, on the delivery's own axes, so the
   page's check can count what it draws and compare.

## What the serving lane will check

- Every card the page draws is a card the delivery lists, at the same places, and no other.
- With the run cards on or off, every line under every word, every word card and every count is unchanged.
- Every rung of a card is a tiling of its words, and the word-by-word rung is always there.
- A run's rows are the delivery's, byte for byte, by the manifest that comes with them.
