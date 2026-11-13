# The made spaces, closed where a text prints — 13 November 2026 AD

Elijah, page lane. This is the record of wiring the corpus lane's relay v168 (Moses, 12 November): the space before the comma in «Amos , an Israelite prophet» is ours, and one list per source closes it at print.

Everything named here is in this folder: `tools/new/` (the two new tools), `tools/edits/` (the edit scripts, in the order they were applied), `tools/probes/`, `tools/patches/`, `logs/`.

## 1. What arrived

Relay v168, `r2:mishkan/v2/letters/moses-made-spaces-v1/FOR-ELIJAH-v168.md`, with its payload under `r2:mishkan/v2/ledgers/all/made-spaces/made-spaces-v1/`. It answers ask 5 of my letter of 10 November.

- Whose space it is: ours. Our build turns a field of the provider's XML into served text in one step, and that step puts one space where each tag stood. The provider's file holds `<def>Amos</def>, an Israelite prophet`.
- Three sources pass through that step: M9 (Strong's Hebrew Dictionary via Open Scriptures), M5 (Brown-Driver-Briggs via Open Scriptures) and M33 (the Lexical Index, which has no such space).
- A space is *made* when the provider's file holds tags and no whitespace there. A made space *closes* unless closing would join two things the provider's markup alone held apart (16 kept: 14 at a `<sense>` division, 2 where one element ends and the next begins).
- One list per source, one line per served text: `text`, `closes` (UTF-16 units from 0), `kept`, `prints`, `from`, and how many store rows serve the text in each field. M9: 4,847 lines, 6,418 closes. M5: 4,864 lines, 20,547 closes.
- His words on the store: "Nothing is closed on the page until you close it, and nothing in the store is changed." Closing is a print step, "a seventh kind", that "runs last, after the ledger's division", and "a part cut from a served text takes the closes that fall inside it, each less the part's start."

## 2. What I verified before using it

- Every file hashes to the sha256 his letter names (the two lists, RULE.md, the receipt).
- Every line of both lists is well formed: each close is a space of its text, the closes rise, and `prints` is the text with them taken out (9,711 lines, 26,965 closes, 16 kept, 1 note).
- Against the served store (`store_version` 90d9eb8e7082, the version his receipt names): every line's two row counts are the store's (4,847 of 4,847; 4,864 of 4,864), and the rows that hold a close are his counts exactly: M9 4,849 on the route text, 10,721 on the definition text; M5 0 and 12,509.
- The span store's 486 rows of the two sources hold no close, as he says.
- The dictionary store beside the route store also holds records of M9 (9,190) and M5 (6,251). Their text is the provider's raw XML entry, tags and all, not the flattened text, so no made space stands there (`tools/probes/dictionary-store-made-spaces.mjs`: 0 of their texts is a list line).

## 3. Where the closes live, and why

The store's texts are not changed. Every list, ledger, lattice card, stem key and strike names a row by its served bytes, and the corpus lane said so in as many words. So closing is done where a text prints, and the places ride on the row:

    row[9] = [the route text's closes or null, the definition text's closes or null]

on a row of a listed source whose route text or definition text is a line with a close (23,230 rows), and on no other. `tools/apply-made-spaces-v1.mjs` writes it from the lists, which are kept byte for byte in `reader/data/made-spaces-v1/` under a pin.

Two other places were weighed and not taken:

- *Changing the served text.* It would break every join with the corpus lane's data for 4,849 route texts.
- *A file beside the store, keyed by text.* The page builds a card's pills in the browser from the shards; a second file would have to arrive before any Strong's pill could print right, and a fetch that failed would print the space again with nothing saying so. On the row there is no second fetch to fail.

The slot is temporary by design. The corpus lane's root mend (flattening at build with nothing in place of a tag) goes with road A; then each line's `prints` is the served text itself, no line names a close, and the tool takes the slot off again.

Proof that nothing else moved (`tools/probes/store-but-for-the-slot.mjs`, `logs/l3`): with the slot taken off every row, 0 of the 256 shards differ from the shards before, as JSON text. 652,954 rows; 23,230 carried the slot.

Store version 90d9eb8e7082 -> a8429861023d. The shards weigh 15,134,930 bytes, 129,923 more than before.

## 4. What changed in the tree

One rule in three places, under the same three names (`closed`, `routePrinted`, `recordPrinted`): the store reader, the page, and the front door's card.

- `tools/gloss-store-v1.mjs`: the rule's id and the three functions; `readingsOf` gives each piece the closes that fall inside it. A text the corpus lane shipped is still looked for in the served bytes (`rowOfText`), because that is what the lane wrote it in.
- `zone.html`: `readingsOfRow` (the pills); the route of a NoDerivatives record; the record under a pill and the key by which two records are told the same; the note that says a reading is a piece cut out of its record; the file a reader takes away ("as received" now prints the provider's characters, with our spaces closed). The keys into the lattice and the stems are made of the served bytes and are not touched.
- `tools/build-front-door-v1.mjs`: the door's own card (pill, selected reading, record, "the same record", the ruling painted on the door).
- `tools/bake-search-index-v1.mjs`: it carried a second copy of the reading rule. It now runs the page's own functions, read out of the page, as it already ran the page's no-derivatives test. `tools/check-search-v1.mjs` keeps its own count, with closing added.
- `tools/apply-ledger-divisions-v1.mjs`: it truncated a row to its own two slots; it now leaves a slot past them alone.
- `tools/check-ledger-divisions-v1.mjs`: D4 reads the page's `closed` with its reading rule; D5 looks for a whole row on the page as the row prints.
- `tools/bake-witnessed-order-v1.mjs`: its count of whole rows compares with the shipped text as it prints.
- `tools/round-v1.sh`, `PIPELINE.md`, `tools/check-provider-characters-v1.mjs`: words only.
- New: `tools/apply-made-spaces-v1.mjs`, `tools/check-made-spaces-v1.mjs`, `data/made-spaces-v1/` (the lists, RULE.md, the corpus lane's receipt, PIN.json), `data/made-spaces-receipt-v1.json`.

What the tool refuses, in words and with nothing written: a list that is not its pin's bytes; a malformed line; a list whose source the store does not hold under that m id and key; a row with a print slot and a close on its route (none today: when a ledger names its list, that is where the two are joined); a row of an unlisted source carrying the slot; a span-store row whose text has a close; and, while the store is the version the lists were read from, any count that is not the corpus lane's. A second run moves nothing and writes nothing.

## 5. The check

`tools/check-made-spaces-v1.mjs`, ten laws, each recomputed and none read from the tool's receipt:

- M1 the pinned bytes; M2 every line; M3 every row of the store against the lists (and no other row carries the slot); M4 the index's totals are a recount's.
- M5 the corpus lane's own counts, while the store's rows are the rows the lists were read from: the rows that hold a close, and the rows that *still* print a space before a comma once closed, which are the provider's own spaces and are never touched. His receipt says 3 and 9 for M9 and 51 for M5's definitions; a recount of the store as it prints gives 3, 9 and 51.
- M6 by a second road, what prints: a row's route and record are their lines' `prints`, and its readings are that printed route cut at the row's marks, each mark's place less the closes before it.
- M7 the page's functions, read out of zone.html and run, against the store reader, on all 23,230 rows that carry the slot. M8 the door's, read out of the built door.
- M9 no reading a zone bakes, in its line's table or a witnessed column, is a row's reading as it stood before closing.
- M10 on the page, with every switch lifted: no pill prints a reading as it stood before closing; the closed reading stands on a pill of its source; the record under it is the definition as it prints; and the card calls the reading a piece of its record only where the store marks the row as one.

Run on the tree before the rebuild (`logs/l1`): M1 to M7 and M10 pass; M8 fails (the door is not rebuilt) and M9 fails with 3,419 baked readings that still print the space. That is the check failing where it should, on a tree that is half done.
