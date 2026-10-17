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

## Agreed with the owner, 17 October (design step)

- Less is more. The dictionary table is a search bar, a "dictionary" toggle
  beside it, sortable column headers (text order by default, A–Z on a
  tap), and rows that start collapsed. A closed row shows the word, its
  form, one reading and the number of places. An open row shows its form
  and where else it is used. Mock: shots/dictionary-table-simple.png.
- With the toggle on, tapping a word in the reader (bara at 1:1:2) opens
  the same card as always, and the card also lists the word's forms
  (Qal, Piel), each a row that opens to its places. Tapping a place jumps
  there, in any book, with that word's card open (the short address,
  e.g. /ezekiel/21:24:17).
- Return: the jump is a step in the browser's history (the phone's back
  gesture returns), and the "Back to" pill above the bottom bar, which
  today only works within a book, reads "Back to Genesis 1:1:2" across
  books. It stays until it is tapped or another jump replaces it (owner:
  "agree keep it").

## Agreed with the owner, 17 October, evening (the table HUD)

"simple toggle, cards unchanged, hud opens to a table hud". The design, as
agreed on the real Genesis page (shots/dictionary-toggle.png,
dictionary-hud-table-2.png, dictionary-hud-table-3.png):
- A "dictionary" pill beside English reader, blobs and numbers, on or off.
- The word cells are unchanged.
- With the toggle on, tapping a word opens its HUD as a table. The head
  stays (address, Hebrew, close). The columns are hebrew, form, reads and
  places, and they sort.
- One row per form, e.g. בָּרָא · Qal · he created · 9 and בָּרֵא · Piel ·
  cut down · 2. The reading heading a row is the one at this place where
  there is one, else the first in its dropdown.
- Both are openable (owner: "yes both should be openable"): "reads" opens
  the other readings of that form, each exactly as its source prints it,
  with source and license; "places" opens the other places, each a link,
  with what TAHOT reads there.
- Places are exact (owner: "it would just be he created places, not
  close"). The count is the places where that exact reading stands, here
  included: "he created" is 4 (Genesis 1:1:2, 1:27:8, 1:27:12, Deuteronomy
  4:32:12), not the 9 Qal places with near readings ("he had created", "did
  he create"). Picking another reading in the reads dropdown shows its own
  places. A row with no place here is led by the reading that stands at the
  most places (Piel: "make", Ezekiel 21:24:17). Mock:
  shots/dictionary-hud-table-4.png.
