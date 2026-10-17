# The dictionary branch, with bara as the example (17 October)

Screenshots: shots/bara-card-today.png (the card today), and
shots/bara-dictionary-mock-1.png to -3.png (a mock of the dictionary page).
Every record and place in the mock is real, read from the served stores
(route store, Jastrow and Samaritan overlays, zones, piece store). The sense
grouping is the one thing done by hand. In the real page the dictionary
store's own fields set it.

## What the data says about ברא

- **Places.** The letters ברא stand at 20 places in the Tanakh, plus 8
  more inside longer words (ו+ברא, ברא+ם, ברא+ה, ברא+ך, ברא+נו). The 134
  is the number of readings, not places: 75 in the base store, 55 Jastrow,
  4 Samaritan, from 20 sources. BDB's own entry opens "53": its count of
  the lemma in every form (ויברא, נברא, ...), which a key made of letters
  cannot see.
- **Pointings.** Five: בָּרָא (11 places), בָרָא (5), בָּרֵא (2), בְּרֹא (1),
  בְּרָא (1). The pointing does not separate the senses. בָּרָא is "he
  created" in Genesis and the Aramaic "the field" in Daniel. בָרָא is
  "create" in Isaiah, "he ate" at II Samuel 12:17, and "field" in Daniel.
- **Senses at places**, by what TAHOT reads at each place:
  - create: 9 places, plus 7 inside longer words
  - field: 8 places, all in Daniel
  - cut down / cut out: 2 places (Ezekiel 21:24), plus 1 inside (Ezekiel 23:47)
  - eat: 1 place (II Samuel 12:17)
  - "be fat", "son", the rabbinic senses and two unplaced readings stand
    at **no** place with these letters: 45 of the 134 readings.
- **One record carries several senses.** BDB (OS)'s one entry gives Qal
  "create", Niphal "be created" and Piel "cut down, cut out". Strong's
  H1254 gives create, cut down and feed in one entry. So the stem belongs
  on each reading, not on the record.
- **Two years.** A row's year is the wording's earliest year, not the
  source's edition. ConceptNet's "create (v)" sorts as 1890, but its edition
  is 2019.

## The table, proposed

Records: one row per entry as printed, byte for byte, under its hash id.

| column | bara example | from |
|---|---|---|
| id | sha256 of the fields as received | computed |
| source (M) | BDB (OS), CC BY 4.0 | M record |
| headword | בָּרָא | source, verbatim |
| gap | NONE | source |
| lemma id | BDB entry; Strong's H1254; STEP H1254A; MACULA lemma | source (asked of Moses) |
| language | Hebrew / Aramaic / "Chaldee" as printed | source (asked) |
| R | shape · create · fashion · be created · cut down · cut out | source |
| stem, per R | Qal · Qal · Qal · Niph. · Pi. · Pi. | source (asked) |
| D | the entry as printed | source |
| year | edition year, and the wording's year apart | M record and wording rule |
| cites | the verses the entry itself names | source (not yet asked) |

Claims, ours, CC0: places by letters (today) and places by lemma id (once
the piece store carries TAHOT's and MACULA's lemma per piece). Cross-references
are kept as record-to-record edges.

## For the owner to decide

1. Senses that stand at no place with these letters (here 45 readings):
   fold them under one line on the card, ranked last. Recommended.
2. Group by each source's own lemma id, labeled with the source's stem
   word, never by a grouping of ours. Recommended.
3. All places for the lemma (BDB's 53, not just the 20 that match by
   letters): ask Moses to carry TAHOT's and MACULA's lemma per piece in the
   piece store. Recommended.
4. Explain the stem (what Qal or Piel is) by citing a public domain grammar
   as a record, e.g. Gesenius' Hebrew Grammar (1910). Never in our own words.
5. Show both years, and sort by one of them. Which one: the owner's call.
