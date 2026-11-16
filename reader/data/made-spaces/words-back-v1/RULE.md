# RULE — the unabridged BDB's openings with their words back (words back v1)

14 November 2026 AD. Corpus lane (Moses). A seat of the lane wrote this rule and its three scripts on 14 November, a second seat tried to refute them, and the lane adopted both here with the second seat's corrections marked. Nothing served is changed: this is a retext list for the serving lane to land.

## The owner's word

The serving lane put to the owner, on 13 November, "the 921 openings that lost words" (relay v178, section 3): whether the openings of BDB's numbered senses, which print as notes under ruling 4, should print the words the catalog took out of them. The owner answered every open call on 14 November: «just go with your recommendations its fine». The answer to this one, as the serving lane set it down (`OWNER-ANSWERS-2026-11-14.md`, call 11): give the words back. "The rows' texts are your bytes, so the words go back on your side: a reissue of those rows, or a retext list keyed as v174 keys them, under the made-spaces records' care."

## What the list is

`words-back-final-v1.jsonl`: one line per row of relay v174's list of openings (`../../moses-pieces-not-readings-v1/pieces-v1/numbered-sense-openings-v1.jsonl`) whose OWN opening lost words. Each line is keyed as v174 keys the row: `key`, `rank`, `route` (the served text, byte for byte), `entries`. Its other fields: `field` (as v178 names fields, `BDB<n>:point<p>:<marker>:opening`); `status`; `words_back` (the opening with BDB's taken-out words in their places); `closes` (the places in `words_back`, UTF-16 units from 0, whose space closes at print); `prints` (`words_back` with the characters at `closes` taken out: the note as it should print); `route_closes` (v178's closes in the served route, as slot 9 holds them today); `words_back_provider_order` (only where it differs: every run of Hebrew pieces in the provider file's order); `pieces` (each piece put back, its kind, its characters, its place); `hebrew_runs` (only where two or more Hebrew pieces stand side by side: each run's three orders, which the witness holds, and how it was settled); `notes`.

`in-921-lost-none-v1.jsonl`: the rows v178 counted among the openings that lost words whose own opening lost nothing. v178 counted by text: a row was counted when its text was a line of the words-taken-out list. A text is shared by rows of different records and points, and reading each row from its own record and point shows that some of those rows' openings lost nothing. They already read as BDB wrote them and take no retext. **v178's count is the lane's error, and this list corrects it.**

`words-back-v1.jsonl`: the step before, every row in the provider's order, with each run's three orders.

## How the text with the words back is made

The catalog's step (`definition-poc/scripts/lib/unabridged_bdb_routes.mjs`, `pointLeadRoute`) reads a numbered point's opening: the point's HTML with its number taken off, cut at its first `<ref`; each element of the kinds bdbheb, bdbarc, lookup, transliteration and entry taken out whole and put as one space; the empty placeholder and checkingNeeded tags put as one space; then the text step (the provider's mis-decoding repaired, entities read, every tag one space, each run of whitespace one space); then a run of spaces, commas, semicolons, colons, dashes and hyphens taken off each end.

The words-back text is the same step with one change: each piece the step took out is put back as its own characters, its own tags read as nothing and its own whitespace kept. So every character and tag outside the pieces is as in the served text; the space between a piece and its neighbour is the source's own; the end trim takes off only characters outside the pieces; a piece's characters go through the catalog's repair only where the repair puts no replacement character in, and otherwise stand as the provider file has them.

Where a tag stands between a piece and its neighbour with no whitespace, the tag's space is a made space by v178's classes, of the class that closes. Where the served text had trimmed off a stretch that the words now hold inside, a made space in it comes back too.

The rule reads a piece's own tags as nothing, not as v178's tags: read as v178's tags, two pieces side by side would be v178's class "end then start" and keep a space, and BDB's mark of abbreviation would stand apart from its letters ("ק ׳"). *Corrected by the second seat:* the receipt's `seam_sides.joined_to_another_piece` counts sides, so each touching pair counts twice; v178's class would keep a space at half that many places.

## The order of BDB's Hebrew where several pieces stand side by side

In the provider file the order of Hebrew pieces standing side by side is often not BDB's reading order: it holds BDB's «ק׳ יוֹם אֵידָם» as «יוֺם אֵידָם ׳ק». The characters of each piece are right; only the order of whole pieces is in question. Each run carries three orders of its pieces: the provider's; mirrored (read backwards, piece by piece); groups read backwards inside (each group of touching pieces read backwards, the groups in the provider's order). The orders often give the same text.

The witness is Sefaria's own digitization of BDB (`sefaria-dump-2026-07-14/bdb-dictionary-entries.jsonl` and `bdb-aramaic-dictionary-entries.jsonl`). An order is witnessed when Sefaria's text holds it as whole words, points, accents and the maqaf set aside for the match only. A run is settled when exactly one of its distinct orders is witnessed. *Corrected by the second seat:* the match is made anywhere in Sefaria's BDB, not only in the same entry; held to the same entry (an entry whose headword has the provider record's letters), all settled orders but one are found there, and many settled runs are a lone letter or two with its mark, where the witness shows only that the mark follows its letter.

`words_back` uses the settled order. A row with any unsettled run is held, and its `words_back` keeps the provider's order.

## The statuses

- `done`: byte for byte with the provider's file; no run of Hebrew pieces to order.
- `done_hebrew_order_settled_by_the_witness`: as done, with every run in the order the witness settles. **These wait for the owner's word** on putting whole Hebrew pieces in BDB's printed order (the characters stay the provider's; only the order of whole pieces changes).
- `held_hebrew_order_unsettled`: a run no witness settles. Held as now, a note with gaps.
- `held_damaged_in_the_provider_file`: the provider's Hebrew holds a stray control character (U+0098) with a vowel moved off its letter. Held for the owner's word.

"Done" means byte for byte with the provider's file, in BDB's order where pieces stand side by side. It does not mean every word reads as the printed BDB: some pieces are the provider's own slips inside one element (two words run together), which no reordering mends. Rows whose words hold U+05BF (rafe) where BDB prints a maqaf keep the provider's character and carry a note.

## How v178's closes compose

v178's made spaces fall inside some of these rows' texts, the same rows and places the store's slot 9 holds. The words-back text keeps every one of them, moved only by the words put in before it, and adds its own (beside a piece put back where a tag joins it, and in a stretch the served text had trimmed). `closes` gives them all at their new places. When the page retexts a row, it replaces both texts of the row (in every row of this list the store's definition text is the route text) and replaces slot 9 by `closes`, for both halves. v178's words-taken-out list, keyed by text, still applies to the rows not retexted. **The retext goes by `key` and `rank`, never by text**: the same text takes different words back in different rows.

## Proof by a second road

- `build-words-back-v1.mjs` (road 1) replays the catalog's step with the catalog's own functions, imported read-only, holds every one of v174's rows to them, rebuilds the served text byte for byte, checks every row against the store copy, and holds every line of v178's two lists that names the row's field. *Corrected by the second seat:* v178's list agrees with every field it names, counted in the receipt as the fields it names and agrees with, plus one it names only by its first field (`of_those_agreeing_with_its_first_field`); the fields it does not name are the rest (`of_those_differing_from_it`); and it differs from road 1 only where its own repair put a replacement character in.
- `verify-words-back-v1.mjs` (road 2) loads no catalog code and reads the provider's HTML with its own scanner, a character at a time, with its own repair, entity reading, element cutting, tag reading, end trim, closes and runs. It must agree on every line of all three lists.
- `settle-hebrew-order-v1.mjs` reads the witness, writes the final list, and checks that every settled text is a reordering of the provider-order text's own characters.
- `check-page-store-v1.mjs` reads the page's served route store, read-only, and checks that v174's rows still stand at their key and rank with their text.

## Inputs, pinned by road 1

v174's list, v178's two lists, the provider file (the file v178 holds to its zip and manifest), and the catalog's reader, each by sha256 in `receipt-road1-v1.json`; the witness files by sha256 in `settle-receipt-v1.json`.

usage, in order: `node build-words-back-v1.mjs <999 footsteps folder> <the Tabernacle folder> <route store copy>`; `node settle-hebrew-order-v1.mjs <999 footsteps folder> <the Tabernacle folder>`; `node verify-words-back-v1.mjs <999 footsteps folder> <the Tabernacle folder>`; `node check-page-store-v1.mjs <999 footsteps folder> <the Tabernacle folder>`.
