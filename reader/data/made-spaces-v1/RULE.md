# RULE — the spaces our build made in the three Open Scriptures sources (made spaces v1)

10 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone. Its sentences were written from counts of the classes they speak of; the receipt carries those counts.

Amended 12 November 2026 AD, before the builder was first run: the span store's rows of the three sources are served texts too, and two checks are added (the provider's files against their manifest, and the step's three copies against the text the builder replays).

## What is asked

The serving lane found a space before a comma in rows of Strong's Hebrew Dictionary via Open Scriptures, like «Amos , an Israelite prophet», and asked whether the provider's file holds that space or our build made it.

## The step

Our build turns a field of a provider's XML into served text by one step. It stands in `definition-poc/scripts/build_structured_evidence_catalog.mjs` (function `stripXml`, with `decodeXml`), and again as `stripOpenScripturesXml` in `definition-poc/scripts/lib/openscriptures_strongs_routes.mjs` and as `stripBdbXml` in `definition-poc/scripts/lib/openscriptures_bdb_frames.mjs`. In this order:

1. every tag is replaced by one space. A tag here is `<`, then one or more characters that are not `>`, then `>`: element tags and comments alike;
2. the entities `&amp; &quot; &apos; &lt; &gt;` and the numeric references `&#N;` and `&#xN;` are decoded;
3. the direction marks U+200E, U+200F, U+202A to U+202E and U+2066 to U+2069 are deleted;
4. every run of whitespace becomes one space. Whitespace is what `\s` matches in JavaScript: in these files the space, the tab, the two line ends and U+00A0;
5. both ends are trimmed.

**OURS** is what the five steps make of a field. **THEIRS** is the same five steps with one change: in step 1 every tag is replaced by nothing. It is the provider's own characters with the provider's markup taken out and nothing put in.

## The three sources and the fields read

Every provider file is of Open Scriptures HebrewLexicon as fetched on 14 July 2026 AD; the receipt gives each file's size and sha256. An entry is `<entry id="…">…</entry>`.

- **Strong's** (`HebrewStrong.xml`, source key `openscriptures_strongs`): the entry's first `<meaning>`; each `<def>` inside that meaning; the entry's first `<usage>`.
- **Brown-Driver-Briggs** (`BrownDriverBriggs.xml`, source key `openscriptures_bdb_1906`): each `<def>` of the entry; and the entry's segments. For the segments the `<status>` element is taken out with its words, the entry is cut at every `<ref>…</ref>` (the reference and its words are dropped), and each piece that holds a whole `<def>` is a field, named `segment0`, `segment1` and so on by its place among all the pieces of the entry. The `<status>` element stands once and last in an entry, so taking it out leaves nothing inside a field; the builder stops if that is ever not so.
- **Lexical index** (`LexicalIndex.xml`, source key `openscriptures_lexical_index`): each `<def>` of the entry.

## The gap, and a made space

Read a field with its entities decoded and its direction marks deleted. Between two neighbouring characters of the field that are not whitespace, the provider's file holds a **gap**: the whitespace, the tags and the comments that stand between them. OURS holds one space there when the gap holds anything at all.

- When the gap holds whitespace, the space is **the provider's own**. It is never touched: `to <def>turn</def> aside , i.e.` holds its space before the comma in the provider's file.
- When the gap holds tags or comments and no whitespace, the space is **made**. `<def>Amos</def>, an Israelite prophet` gives THEIRS «Amos, an Israelite prophet» and OURS «Amos , an Israelite prophet».

The same places are found by a walk. OURS and THEIRS hold the same characters in the same order, except that OURS may hold spaces THEIRS does not. Walk both from their first character. Where the two characters are equal, both advance. Where they are not equal and OURS holds a space, that space is made and only OURS advances. Anything else stops the build, and so does a THEIRS that is not used up at the end. The builder finds the places both ways and stops if the two disagree anywhere.

## Closes, or kept

A comment is not an element and is passed over when a gap is classed. The first of these that holds decides:

1. **kept: empty element** — the gap holds a self-closed tag. An element with nothing in it stands between the two characters.
2. **kept: division** — the gap holds a tag of an element kind that holds other elements somewhere in its file. Such an element is a division of the entry, not a mark on a word. The builder reads this from the file: it counts, for every kind of element inside the entries, how many hold another element, and the receipt carries the table. In the fields read here the kind is `<sense>`.
3. **kept: end then start** — the gap holds both an end tag and a start tag. One element ends and the next begins with none of the provider's characters between.
4. **closes** — everything else: the gap's element tags are all start tags or all end tags, each of a kind that holds text only, or the gap holds comments alone.

A start tag or an end tag of a text-only element marks a word or a phrase inside running text, and the provider wrote the characters on its two sides as one run. In the three kept classes the provider's file holds two things apart by markup alone, and closing the space would join them into words the provider never wrote («251number», «SimeoniteBenjamite», «97be done»).

## A note

Where a `<note>` element stands in a field, the line carries the place of the note's words and the words themselves, because a note is the provider's remark on its own file and not the dictionary's running text. The list marks it and does not choose whether it prints. For the choice of not printing it inline, the line also carries the text as it prints without the note: the field read again by this rule with the note element taken out with its words and nothing put in its place. More than one note in a field stops the build, and so does a part that holds a note.

## The served text, and the trace

A served text is field 1 (the route text) or field 2 (the definition text) of a row whose field 3 is the source's `m_id`, in the served route store named in the receipt (its `store_version`, the sha256 of its `index.json`, and one sha256 over the names and sha256s of its 256 shards). It is also slot 1 or slot 2 of a row of the served span store whose slot 3 is that `m_id` (the sha256 of its `index.json`, and one sha256 over the names and sha256s of its book files). The span store names these three sources by the route store's `m_id`; its own list of sources adds others only. A served text is **traced** when it equals OURS of some field of the source. If one OURS comes from two fields that differ in THEIRS, in a place, in a class or in a note, the build stops.

A field 1 that is not traced, and that stands inside its own row's traced field 2, is a **part**: it takes the made spaces of field 2 that fall inside it. If it stands there more than once and the places differ, the build stops. Every served text that is neither traced nor a part is named in the receipt.

## The lists

`<source key>.made-spaces-v1.jsonl`, one for each source that has a made space, holds one line for each distinct served text with at least one made space, or with a note:

- `text` — the served text, as served;
- `closes` — the places of the made spaces that close, counted from 0 in UTF-16 units of `text`;
- `kept` — the places of the made spaces that are kept, and `kept_why`, the reason for each in the same order: `empty_element`, `division` or `end_then_start` (both absent when nothing is kept);
- `prints` — `text` with the characters at `closes` taken out;
- `note` — `in_text` and `in_prints`: the note's words as `[start, end)` in each; `words`: the words; `prints_without_the_note` (absent when the field holds no note);
- `part_of` — for a part: the field 2 it stands in (`text`), and where (`at`);
- `from` — the entries and fields the text was traced to, like `H5986:meaning`, in the file's order, the first five, with `from_count` when there are more. A part carries the `from` of the field 2 it stands in;
- `rows_field_1`, `rows_field_2` — how many rows of the route store serve the text in each field; `span_rows_field_1`, `span_rows_field_2` — the same for the span store's rows (absent when none).

Lines are sorted by their first `from`, then by `text`, both by UTF-16 code units. Where nothing is kept, `prints` of a traced text equals THEIRS, byte for byte.

## Checks the builder makes, each a hard stop

1. the gap reading's OURS equals the step's OURS for every field, and its made places equal the walk's;
2. for every traced line, `text` with the characters at `closes` and `kept` taken out equals THEIRS;
3. for every line, every place in `closes` and `kept` is a space of `text`, and `text` and `prints` are equal once every space is taken out of both;
4. every tag in a field is an element's start tag, end tag or self-closed tag, or a whole comment;
5. the entries nest cleanly: every end tag closes the element that is open;
6. each of the three provider files is the bytes and sha256 its acquisition manifest lists;
7. the step's three copies in the build scripts are, once their names are set aside, the same text, and the same text as the step this builder replays.

The count of the served rows against each ledger's `routes` is a recorded comparison, not a stop: a ledger was read at its own store version.

## The second count

`verify-made-spaces-v1.mjs` does not flatten a field twice and does not walk. It reads the provider's raw field one character at a time, as text, whitespace, tags and comments, with its own reading of entities and its own test for a division (a start tag whose next tag is not its own end tag). It builds its own places, classes, printed text and note, and must agree with every line of the lists; every served text it finds a made space in must be in the lists, and nothing else may be. It is by the same hand as the builder, and says so.

## Axes

Every figure in the receipt and the relay names its axis: rows (rows of the source in the served route store, and apart from them the span store's rows), texts (distinct served texts over fields 1 and 2), spaces (made spaces in those texts), fields and entries (of the provider's file).
