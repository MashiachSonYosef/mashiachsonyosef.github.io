# RULE — where Strong says he is not sure (Strong's hedges v1)

12 November 2026 AD. Corpus lane (Moses). Written before the builder, so a second count can be made from these words alone. The word list and every named exception below were written from a count of the clauses' words and a reading of every occurrence whose class was in doubt; the receipt carries the count.

## What is asked

The owner asked, by way of the serving lane on 12 November: "did we record where Strong is guessing by his own declaration?" The serving lane asks for a declared ledger: one line per entry and clause, the clause's bytes, the hedging words as he wrote them, and which clause.

## What is read

- **The provider's file**: `HebrewStrong.xml` of Open Scriptures HebrewLexicon as fetched on 14 July 2026 AD, the file made spaces v1 read (the receipt gives its size and sha256). An entry is `<entry id="…">…</entry>`; its headword is its first `<w>`.
- **Three clauses** of each entry, each the entry's first element of its kind: `<source>`, where the word comes from; `<meaning>`, what it means; `<usage>`, the renderings of the King James Version, with Strong's own remarks among them.
- **The served entries**: the records of the served dictionary store under M9, each naming its entry (`loc` `entry:H…`). The counts are given over the file and, apart, over the entries served.
- **The Hebrew Wikisource edition** (M14) in the same dictionary store, only to say, line by line, whether its text of the same entry holds the same hedging words.

## A clause's text

The clause's inner XML, read in this order:

1. every `<note>` element is taken out with its words: a note is the provider's remark on its own file (a corrected letter, vowel or transliteration), not Strong's;
2. every other tag is taken out, with nothing put in its place (so no space is made where a tag stood);
3. the entities `&amp; &quot; &apos; &lt; &gt;` and the numeric references `&#N;` and `&#xN;` are decoded;
4. every run of whitespace becomes one space, and both ends are trimmed.

The line also carries the clause's inner XML byte for byte, notes and all.

## A hedge

A hedge is one of these words, as a whole word (no letter of the Latin alphabet before or after it), in any case: **apparent, apparently, probably, perhaps, possibly, uncertain, doubtful, supposed, seems, unknown, obscure**; or the two words **or else**, one space between them, which Strong uses to offer a second derivation or a second sense.

Every occurrence in a clause's text is a hedge, except these, each named by entry, clause and word. Each was read in its clause: it is a gloss or a rendering, not Strong's doubt.

- `<meaning>`: H1248 apparent ("the heir apparent to the throne"); H2823 obscure ("dark, figuratively, i.e. obscure"); H3544 obscure ("feeble, obscure"); H8511 uncertain ("to be uncertain"); H6828 unknown ("gloomy and unknown", of the north).
- `<usage>`: H4758 apparently, H380 obscure, H3808 or else: each a King James rendering in the list.

Every occurrence of a listed word in `<source>` was read and is a doubt. The builder stops if a named exception is not found in its clause exactly once.

## The ledger

`strongs-hedges-v1.jsonl` holds one line for each entry and clause whose text holds at least one hedge, in the file's order of entries and the order source, meaning, usage:

- `entry`, `headword`, `clause` (`source`, `meaning` or `usage`), and `says` (where the word comes from, what it means, the renderings);
- `xml`: the clause's inner XML, byte for byte;
- `text`: the clause's text, as above;
- `hedges`: each hedge in the text's order, `word` as the text writes it and `at` as `[start, end)` in UTF-16 code units of `text`;
- `served`: whether the served dictionary store holds the entry under M9;
- `wikisource`: whether the M14 text of the same entry holds every hedge word of the line (`same words`), not all of them (`not all`), or there is no M14 text of the entry (`no entry`). Its text is read with its wiki markup as written; a word is found as a whole word in any case.

## Checks the builder makes, each a hard stop

1. every named exception is found in its clause exactly once;
2. every hedge's `at` holds its `word` in `text`;
3. no clause text holds a `<` or a `>` once its tags are out;
4. the provider's file is the bytes the receipt of made spaces v1 names (size and sha256).

## The second count

`verify-strongs-hedges-v1.mjs` reads the same files from these words by another method: it splits each clause's text into words at every character that is not a Latin letter and finds the hedges among the words (the two words `or else` as two neighbours), where the builder finds them with patterns. It must agree with every line and with the receipt's counts. It is by the same hand as the builder, and says so.

## What the ledger does not say

Both editions held write Strong's words out in full where the 1890 printing may abbreviate them (four abbreviations of the kind are left in the provider's file). The words here are the provider's. Checking them against the 1890 printing needs its text, which the lane does not hold.

## Axes

entries (of the provider's file, or served), clauses, hedges (occurrences of a hedge word in a clause's text).
