# RULE — Jastrow's bracketed word senses (jastrow word senses v1)

Written 14 November 2026 AD, before the builder. Corpus lane (Moses). Nothing served is changed by this strand: it lists rows and carries a legend; the page wires them.

## The owner's words, 13 November 2026 AD, in order

The lane had explained that some Jastrow entries open with a short note in square brackets, often the sense of the root, and that the served overlay serves each such note as a reading of its own. He answered:

> seems like the correct definition would be to strip the brackets and add their meaning. then maybe toggle it so it could be like "toggle on word senses" and the actual R pill showing something like "word sense, not definition: pointed out"

> and in the D+M card we would leave it bracketed if that makes sense

> with a legend maybe saying brackets mean sense, not definition

> legends can live extraDledger if youre following

The lane set the four points back to him: the definition pill (יָדִיד «chosen, beloved; chosen spot»); the word-sense pill, only under a "word senses" toggle, «word sense, not definition: pointed out»; the D+M card, Jastrow's own record, his entry as printed, brackets and all; the legend "brackets mean sense, not definition" in a ledger beside the definitions. It added that not every Jastrow bracket is a sense (בִּיָּא holds an aside about the Roman office of commissioner on highways), so senses and asides are counted before the legend is worded. He relayed that message to the serving lane and answered:

> ok i relayed your whole message to elijah sounds right, wherher the toggles on or off leave that to elijah. you just work on the backend

So: whether "word senses" rests on or off is the serving lane's. This strand gives the rows, their branches, and the legend.

## What is read

- **The rows.** Every row of the served Jastrow overlay (reader/data/overlays/jastrow/, read from fireandhail.com; its store_version is in the receipt). A row is [rank, route, def, m, year, cut flag, headwords, ...]: the route is what a pill prints; the def field is the definition text it was read from, tags removed; the headwords are the source's own pointed headword strings for the row.
- **The records.** Jastrow's entries as the lane holds them: the Sefaria dump's Jastrow lexicon, one entry to a line, with its headword, its id (rid) and its senses, each sense's definition written in HTML as Sefaria gives it.

## Terms

1. **A bracket** is, in the HTML of one sense's definition, a "[" and the first "]" after it. Its inside is what stands between them. A "[" with another "[" before its "]" is NESTED, and a "[" with no "]" after it in the same definition is UNCLOSED; both are counted and neither is used.
2. **A sense note** is a bracket whose inside, after any white space, opens with an italic element that holds no further tag. Its **words** are the text inside that first italic element. It is PLAIN when nothing else stands in the inside but white space and at most one comma, semicolon or full stop: `[<i>pointed out</i>,]`. It is WITH_MORE when more follows, a comparison, a reference or a remark: `[<i>dark</i>, cmp. קֹדֵר]`. In a note WITH_MORE, any later italic element is not the note's words.
3. **Any other bracket is an aside**: its inside opens with roman text, as the remark under בִּיָּא does, or an opinion, a dialect, a later usage: `[Oth. opin. <i>cedar-fruits; millet</i>.]`.
4. **Where a bracket stands:** FIRST when no `<i>` stands before it in the same sense's definition; LATER otherwise.
5. **A wording** of a record is the text of an italic element of a sense's definition that stands outside every bracket.
6. **Text compared** (a route, a sense note's words, a wording): in a sense note's words and a wording, the entities `&amp;` `&lt;` `&gt;` `&quot;` `&#39;` `&nbsp;` are first read as the characters they stand for; then, in all three, every run of white space is made one space and the text trimmed at both ends; nothing else is changed. Two texts are the same when they are then equal byte for byte.
7. **A record's bare headword** is its headword with, at its end, a space and a Roman numeral (I to X) or a space and superscript figures removed, and any asterisk removed. A row's **records** are the entries whose bare headword equals one of the row's headword strings byte for byte.

## The branches, each row in exactly one

- **WORD_SENSE.** This is the owner's ruling: the row prints only under "word senses", as «word sense, not definition: » followed by its route. A row is one when it is found one of three ways, and the way is carried:
  - PLAIN_NOTE: the row has records; its route is the same as the words of a PLAIN sense note of one of them; it is not the same as any wording of any of them.
  - NOTE_WITH_MORE: the same, for the words of a sense note WITH_MORE.
  - ITS_DEF_FIELD: the row has no record, and its def field holds a "[" and the first "]" after it whose whole inside, once a last comma, semicolon or full stop is taken off and the text compared, is the same as its route. A bracket that holds nothing but the row's own words is a sense note by its shape, though without the record its italics cannot be seen.
- **NOTE_WORDS_ALSO_A_WORDING.** The route is the same as a sense note's words, PLAIN or WITH_MORE, and also the same as a wording outside the brackets in one of the records, so the same words stand in Jastrow as a definition too. The row stays a reading. Listed.
- **ASIDE_WORDING.** The row has records, and its route is the same as an italic element inside an aside, or a later italic element inside a note WITH_MORE, and it is no sense note's words and no wording. The ruling speaks of senses; these are opinions, comparisons, other dialects, later usages. The row stays as served, listed, and how it prints is put to the owner.
- **NOT_A_BRACKET.** Every other row. Counted, not listed.

*Amended openly on 14 November 2026 AD, before any run was shipped:* a first run read a sense note as PLAIN only, and put a note WITH_MORE among the asides (מרד «[running away, running against, cmp. מַעַל,]» is one); and it left the rows with no record whose def field brackets their own words in a branch of their own. Both are now WORD_SENSE, each with the way it was found.

## The D+M card and the legend

The D+M card shows the def field of a row as served. Where Jastrow had brackets, it has them: `[pointed out,] chosen, beloved; chosen spot.` Nothing is changed in it.

The legend lives in its own file beside the definitions, `legends-v1.json`. It holds the owner's wording, "brackets mean sense, not definition", the sources it is for, and the counts that show where it holds. Every row whose def field holds a "[" is matched to a sense of its records: the first sense, in the record's own order, whose definition, with its tags removed, its entities read as in term 6 and the text compared, begins with the def field, the text compared. (A def field is the opening of a sense's definition, as far as the store's cut took it.) The brackets the card shows are that sense's first brackets, as many as the def field holds "[". The card shows ONLY_SENSE_NOTES when all of them are sense notes and SOME_ASIDE when one is not; it is NOT_MATCHED when the row has no record or no sense of its records begins so. The legend's wording holds on the first and not on the second; both are counted, and the second is listed, so the owner sees where his wording would mislead. The wording stays his.

## What the trial reads from this

The coverage trial's line B took Jastrow's first row under a word. How many of those lines were WORD_SENSE rows is counted from this strand's list, by key and route, and reported.

## Checks, each a hard stop

1. The rows read are the overlay's own count of rows, and every row stands in exactly one branch.
2. Every WORD_SENSE row found by a note is the words of a sense note of one of its records and of no wording of any of them; every one found by its def field has no record.
3. A second count by another road agrees. It starts from the records, not the rows: for every sense note of every record, it finds the rows whose headword strings hold that record's bare headword and whose route is the note's words; the rows it so reaches, less those whose route is also a wording of one of their records, are exactly the WORD_SENSE rows found by a note.
4. No path of this machine and no name of its owner stands in any file written.
