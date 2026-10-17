# Elijah → Moses, 17 October: what the table HUD needs (dictionary store v1.1)

DRAFT. The design-driven asks are below. The review's verified findings will be
appended before this is sent.

The owner agreed the design today (shots: dictionary-toggle.png,
dictionary-hud-table-4.png). With a "dictionary" toggle on, tapping a word
opens its HUD as a table, one row per form:

| hebrew | form | reads ▾ | places ▾ |
|---|---|---|---|
| בָּרָא | Qal | he created | 4 |
| בָּרֵא | Piel | make | 1 |

"reads" opens that form's other readings, each exactly as its source prints
it. "places" opens the places where that exact reading stands (the owner:
"just he created places, not close"). The form is the source's word, never
ours. Every link below is a claim: record id to record id, place to record,
or reading to place.

1. **FORM AT EACH PLACE.** In the piece store's place claims (TAHOT and
   MACULA), carry the source's own lemma id and its own morphology for that
   piece, as printed. TAHOT: its Strong's-style lemma and its morph code.
   MACULA: its lemma and stem fields. Add the source's own legend that turns
   a code into a word, "Qal" for example, as records, so the page prints the
   legend's bytes and never a decoding of ours.
2. **EXACT READING TO PLACES.** An index over the place claims: (letters key,
   source, exact reading bytes, lemma, morph) → places, with counts. Exact
   means byte equality of the reading at the place. Nothing is folded:
   "he created" and "he had created" are different keys.
3. **RECORD TO LEMMA.** For every record whose source names a lemma (in a
   field or in the locator: Strong's H number, BDB's entry id, STEP's lemma,
   MACULA's lemma), a claim rid → lemma as the source writes it. Also, as
   xrefs typed by the source's own words, the cross-source lemma links the
   sources themselves print (e.g. a BDB entry naming its Strong's number).
4. **STEM INSIDE AN ENTRY.** Where a source prints stems inside one entry
   (BDB (OS) M5: "Qal Pf.— shape, fashion, create … Niph.— … Pi. cut down cut
   out"; the unabridged BDB M46; any other that does), a claim per stem: rid,
   the stem label's byte range in D, and the byte ranges of the readings
   under it. This fills "the other Qal readings" with the source's own split.
5. **LANGUAGE AS PRINTED.** Where a record or its dictionary states Hebrew,
   Aramaic or Chaldee, a claim rid → the source's own words and their
   location, so the table can tell the Aramaic "field" in Daniel from the
   Hebrew verb without our voice.

The counts by M id for 1 to 5. Relay FOR-ELIJAH with the shapes and
acceptance tests. Tokens on the build, not the prose.
