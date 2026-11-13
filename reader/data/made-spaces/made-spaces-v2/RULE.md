# RULE — the spaces our build made in the unabridged BDB and the Wikisource Strong's (made spaces v2)

13 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone. It extends made spaces v1 (relay v168) to the two sources the serving lane asked for next (its letter of 13 November, "the made spaces are closed on the page", item 1). Everything in v1's rule about what a made space is, when it closes and when it is kept, and the shape of a list, stands except what is said here.

Amended once before the builder ran, after a count of the provider's file: the unabridged BDB is HTML that does not nest cleanly, and in it inline elements hold one another, so v1's test for a division is replaced for it (below); a point's letter repeats within a record, so a field's name carries the point's place; the two empty tags the opening step takes out read as tags; and check 1 covers the Wikisource Strong's too.

## The two steps

**The unabridged BDB** (`unabridged-BDB-Hebrew-lexicon.csv`, source key `unabridged_bdb_1906`, M46). The catalog builder turns a record into routes in `definition-poc/scripts/lib/unabridged_bdb_routes.mjs`. A route comes from one of three fields of the record's main part (after its first `</div>`):

- a **highlighted word**: the inside of a `<highlightword>…</highlightword>`;
- a **point's highlight**: the inside of a `<highlight>…</highlight>` that stands in a numbered point (`<div class="point">` that opens with `<b>N.</b>` or `<b>a.</b>`) before the point's first `<ref`;
- a **point's opening**: the point's text before its first `<ref`, with the opening number taken off, when no highlight of the point gives a route.

The step (`bdbHtmlText`): the provider's mis-decoded characters repaired, entities decoded, **every tag replaced by one space**, every run of whitespace made one space, both ends trimmed; then a run of spaces, commas, semicolons, colons and dashes taken off each end. A point's opening has one step more, before those: **whole elements taken out with their words** (`bdbheb`, `bdbarc`, `lookup`, `transliteration`, `entry`), each replaced by one space. The same step also replaces the empty `placeholder` and `checkingNeeded` tags by a space; that reads exactly as taking any tag out, so they count here as tags.

**OURS** is what the step makes of a field. **THEIRS** is the same step with one change: every tag is replaced by nothing. The whole elements a point's opening takes out are taken out in THEIRS too, each by one space, so OURS and THEIRS differ only where a tag stood.

**The Wikisource Strong's** (the `SRCEXP-0037-H*-strongs.wikitext.txt` files, `wikisource_strongs_explicit_forms`, M14). The step (`wikisourceDisplayText`) reads a link as its text, replaces **every template and every tag by one space**, takes the bold and italic quotes out with nothing, and makes every run of whitespace one space. The field is an entry's definition, the text after its bold headword in `{{ltr|1=…}}`. THEIRS replaces templates and tags by nothing. A served row of the source holds the full definition in field 2 and a piece of it in field 1; a field 1 is read as a part of its rows' field 2, as v1 reads a part.

## A made space, closes or kept

As v1: a made space is a space of OURS that THEIRS does not hold, found both by the walk of OURS against THEIRS and by reading the gap; the builder stops if the two disagree. The gap is classed the first way that holds:

- **kept: empty element**: a self-closed tag, or a tag of a kind the provider's file never closes (`br` and `hr` in the unabridged BDB; the builder's own count);
- **kept: division**: a tag of a kind HTML itself draws as a block or a line break (`div`, `p`, `h1` to `h6`, `hr`, `br`, the list and table kinds, `blockquote`, `pre`, and the other block kinds of HTML). Every other kind, the provider's own (`bdbheb`, `lookup`, `grk`, `highlight` and the rest) among them, runs inline, as HTML draws a kind it does not know. v1's test, a kind that holds another element somewhere in the file, does not carry over: in this file `b` holds `sup` and `lookup` holds `bdbheb`, inline in one another. The builder records that count beside the rule, for the reader;
- **kept: end then start**: an end tag then a start tag;
- else **closes**.

A template of the Wikisource Strong's runs inline.

## A word taken out (the unabridged BDB's openings only)

Where a point's opening took a whole element out, OURS holds a space for it, and THEIRS holds the same space: the space is not made by a tag, and it is not a made space. It marks words of the provider's that the served text does not hold («often named with , and then»: BDB wrote the Hebrew word after "with"). Closing it would join what stood on its two sides as if the provider had written them together, so it never closes. Every such place in a served text is listed apart, in `unabridged_bdb_1906.words-taken-out-v2.jsonl`: one line per distinct served text, with `text`, `at` (one place per element taken out, in the provider's order, counted from 0 in UTF-16 units of `text`: the space that stands for it, or where no space is left for it, the place it was taken from, which is 0 at the start and the text's length at the end), `words` (each element's own words, read by the step with nothing put in for its tags), `kinds` (each element's name), `from` and the row counts as in a list. Two elements side by side share one space, so a place can stand twice in `at`.

One text can come from several fields, and where words were taken out of it can differ between them: the opening «a Levite» lost a Hebrew word at its start in one record and nothing in another, and in «Levites, a.» one record wrote a Hebrew word after the comma where another did not, so the same space is the provider's own in one field and stands for a word taken out in the other. No such space is a made space in any field (the builder stops if two fields that give one text differ in a made place or its class), so the print step closes none of them, whichever field the text came from. The line's `at`, `words` and `kinds` are the first field's (in the order of `from`) that took any, named in `taken_from` when it is not the first of `from`; `fields_that_took_none` counts the fields that took no word out of the text, and `other_words` gives, for up to five fields that took others, their own `from`, `at`, `words` and `kinds`, with `other_fields_took_other_words` their count. Where the receipt sorts a space as the provider's own or as standing for a word taken out, a space any field took a word out at counts as the second. (This paragraph was added after the builder's first two runs stopped on those two texts, before any list was written.)

## The served text, and the trace

As v1: a served text is field 1 or field 2 of a row of the served route store (and slot 1 or 2 of a row of the served span store) whose m_id is the source's; it is traced when it equals OURS of a field. The unabridged BDB's rows serve the route in both fields.

## The lists

`unabridged_bdb_1906.made-spaces-v2.jsonl` in v1's line shape. `from` names the record and the field: `BDB<n>:highlightword<k>`, `BDB<n>:point<p>:<marker>:highlight<k>` or `BDB<n>:point<p>:<marker>:opening`, where `<p>` is the point's place among the record's points that open with a number or a letter, `<marker>` is its opening as printed (`1.`, `a.`), and `<k>` the field's place among its kind; for the Wikisource Strong's, `H<n>:definition`. A source with no made space in any served text has no list; the receipt says so with its counts.

## Checks the builder makes, each a hard stop

1. its own reading of the unabridged BDB's routes gives back, for every record, the routes the catalog builder's own function gives (texts, kinds and order), and its OURS of every field is the catalog builder's `bdbHtmlText`; its own reading of the Wikisource Strong's gives back, for every entry, the full definition and the route the catalog builder's own function gives;
2. for every field the walk and the gap reading find the same made places;
3. for every line, `text` with the characters at `closes` and `kept` taken out equals THEIRS of the field;
4. every place in `closes`, `kept` and `at` is a space of `text`, or for `at` a place inside it or at its end;
5. the provider files are the bytes their acquisition manifests list (the unabridged BDB's file read out of the zip the manifest lists), and the catalog builder's code is named by its sha256.

## The second count

`verify-made-spaces-v2.mjs` reads each field one character at a time, as v1's verifier does, with its own reading of entities and its own list of HTML's block kinds, and must agree with every line of the lists; every served text it finds a made space or a word taken out in must be listed, and nothing else.
