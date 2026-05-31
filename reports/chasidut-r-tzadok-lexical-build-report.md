# Sitewide Lexical Build Report

Generated: 2026-05-31T13:07:52.412Z

## Scope

- Work scope: Targeted imported Hebrew works: divrei-chalomot, divrei-soferim, dover-tzedek, et-haochel, kometz-haminchah, likkutei-maamarim, machshavot-charutz, poked-akarim, resisei-layla, sichat-malakhei-hasharet, sichat-shedim, takanat-hashavin, yisrael-kedoshim
- Hebrew source text changed: no
- Translation overlays changed: no
- Sources used: existing local lexical cache generated from Wikidata Lexemes first; OpenScriptures morphHB + HebrewLexicon as fallback/enrichment
- Sources not used: Kaikki, Wiktionary, copyrighted translations
- New parser: conservative prefix/suffix parser; accepts only when the remaining base is already present in the approved local lexical layer
- Count source: generated HUD token index, which is the page-render source of truth
- Payload: lexical details are externalized through data/lexical/<work-id>.manifest.json and data/lexical/<work-id>-chunks/

## Counts

- Total work-surface rows: 134905
- Total sitewide unique surface forms: 56282
- Sitewide unique surface forms matched at least once: 12214
- Sitewide unique surface forms unmatched everywhere: 44068
- Total token occurrences: 706551
- Matched before prefix/suffix parser: 36293
- Newly resolved by prefix/suffix parser: 11875
- Total matched after parser: 49008
- Percent matched: 36.3%
- Matched via Wikidata: 38319
- Enriched via OpenScriptures: 39621
- Unmatched: 85897

## Newly Resolved Parsed Forms

- וזהו -> and that is, this is, it is, and right, that's it (kaikki) -- machshavot-charutz
- וזהו -> and that is, this is, it is, and right, that's it (kaikki) -- dover-tzedek
- וזהו -> and that is, this is, it is, and right, that's it (kaikki) -- resisei-layla
- וזהו -> and that is, this is, it is, and right, that's it (kaikki) -- likkutei-maamarim
- וזהו -> and that is, this is, it is, and right, that's it (kaikki) -- takanat-hashavin
- המלך -> the king, the inceptively, the causatively (wikidata + openscriptures) -- dover-tzedek
- כטעם -> as perceive, like perceive, as taste (wikidata + openscriptures) -- dover-tzedek
- וזהו -> and that is, this is, it is, and right, that's it (kaikki) -- yisrael-kedoshim
- שזהו -> that that is, this is, it is, which that is, this is, it is, who that is, this is, it is (kaikki) -- dover-tzedek
- מהשם -> from the often thither, of the often thither, from the thence (openscriptures) -- dover-tzedek
- המלך -> the king, the inceptively, the causatively (wikidata + openscriptures) -- likkutei-maamarim
- המלך -> the king, the inceptively, the causatively (wikidata + openscriptures) -- machshavot-charutz
- מהשם -> from the often thither, of the often thither, from the thence (openscriptures) -- resisei-layla
- מהשם -> from the often thither, of the often thither, from the thence (openscriptures) -- likkutei-maamarim
- שזהו -> that that is, this is, it is, which that is, this is, it is, who that is, this is, it is (kaikki) -- machshavot-charutz
- וזהו -> and that is, this is, it is, and right, that's it (kaikki) -- sichat-malakhei-hasharet
- וזהו -> and that is, this is, it is, and right, that's it (kaikki) -- divrei-soferim
- וזהו -> and that is, this is, it is, and right, that's it (kaikki) -- poked-akarim
- שזהו -> that that is, this is, it is, which that is, this is, it is, who that is, this is, it is (kaikki) -- likkutei-maamarim
- כענין -> as ado, like ado, as business (openscriptures) -- dover-tzedek

## Sample Matched Words With Refs To Test

- א״כ -> if so, therefore (workspace) -- poked-akarim
- א״כ -> if so, therefore (workspace) -- sichat-malakhei-hasharet
- אבודה -> lost (wikidata) -- poked-akarim
- אבודה -> lost (wikidata) -- sichat-malakhei-hasharet
- אבות -> father, male parent, father, Av (wikidata + openscriptures) -- divrei-soferim
- אבות -> father, male parent, father, Av (wikidata + openscriptures) -- dover-tzedek
- אבות -> father, male parent, father, Av (wikidata + openscriptures) -- likkutei-maamarim
- אבות -> father, male parent, father, Av (wikidata + openscriptures) -- machshavot-charutz
- אבות -> father, male parent, father, Av (wikidata + openscriptures) -- poked-akarim
- אבות -> father, male parent, father, Av (wikidata + openscriptures) -- resisei-layla
- אבות -> father, male parent, father, Av (wikidata + openscriptures) -- sichat-malakhei-hasharet
- אבות -> father, male parent, father, Av (wikidata + openscriptures) -- sichat-shedim
- אבות -> father, male parent, father, Av (wikidata + openscriptures) -- takanat-hashavin
- אבות -> father, male parent, father, Av (wikidata + openscriptures) -- yisrael-kedoshim
- אבותיו -> father, in a literal and immediate, figurative and remote application (openscriptures) -- divrei-chalomot
- אבותיו -> father, in a literal and immediate, figurative and remote application (openscriptures) -- dover-tzedek
- אבותיו -> father, in a literal and immediate, figurative and remote application (openscriptures) -- likkutei-maamarim
- אבותיו -> father, in a literal and immediate, figurative and remote application (openscriptures) -- machshavot-charutz
- אבותיו -> father, in a literal and immediate, figurative and remote application (openscriptures) -- poked-akarim
- אבותיו -> father, in a literal and immediate, figurative and remote application (openscriptures) -- resisei-layla

## Sample Unmatched Words

- אאברהם -- poked-akarim
- אאדום -- resisei-layla
- אאוחז -- takanat-hashavin
- אאומד -- divrei-chalomot
- אאור -- takanat-hashavin
- אאותה -- takanat-hashavin
- אאותה -- yisrael-kedoshim
- אאותו -- divrei-soferim
- אאותו -- machshavot-charutz
- אאותם -- takanat-hashavin
- אאותן -- poked-akarim
- אאזהרת -- takanat-hashavin
- אאחאב -- takanat-hashavin
- אאחשורוש -- resisei-layla
- אאלו -- takanat-hashavin
- אאלפך -- likkutei-maamarim
- אאלפך -- machshavot-charutz
- אאמו -- takanat-hashavin
- אאמן -- likkutei-maamarim
- אאסתר -- resisei-layla

## Top 50 Remaining Unmatched By Frequency

- 1003x יתברך -- likkutei-maamarim
- 976x יתברך -- resisei-layla
- 862x שכתוב -- dover-tzedek
- 852x יתברך -- dover-tzedek
- 596x שאמרו -- takanat-hashavin
- 590x שכתוב -- likkutei-maamarim
- 535x שאמרו -- yisrael-kedoshim
- 492x יתברך -- machshavot-charutz
- 462x יתברך -- takanat-hashavin
- 441x ולכך -- dover-tzedek
- 434x הי׳ -- takanat-hashavin
- 429x שאמרו -- resisei-layla
- 428x שכתוב -- machshavot-charutz
- 320x ב׳ -- dover-tzedek
- 309x הי׳ -- poked-akarim
- 301x לעיל -- dover-tzedek
- 296x שאמרו -- dover-tzedek
- 295x ע״ה -- dover-tzedek
- 289x יתברך -- yisrael-kedoshim
- 267x ולכך -- likkutei-maamarim
- 266x רצה -- dover-tzedek
- 255x שכתבתי -- dover-tzedek
- 252x ה׳ -- resisei-layla
- 243x שאמרו -- likkutei-maamarim
- 242x א׳ -- dover-tzedek
- 241x ע״ב -- machshavot-charutz
- 239x חז״ל -- dover-tzedek
- 237x כידוע -- dover-tzedek
- 232x ע״ה -- resisei-layla
- 231x השי״ת -- sichat-malakhei-hasharet
- 226x ע״א -- machshavot-charutz
- 226x שאמרו -- machshavot-charutz
- 225x ע״ה -- takanat-hashavin
- 210x ע״ב -- dover-tzedek
- 207x ע״א -- dover-tzedek
- 207x שכתוב -- divrei-soferim
- 194x ב׳ -- sichat-malakhei-hasharet
- 189x עיין -- takanat-hashavin
- 178x דעל -- takanat-hashavin
- 166x א׳ -- machshavot-charutz
- 163x ב׳ -- likkutei-maamarim
- 158x ה׳ -- yisrael-kedoshim
- 157x שכתוב -- resisei-layla
- 155x יתברך -- divrei-soferim
- 151x פסוק -- likkutei-maamarim
- 150x כידוע -- likkutei-maamarim
- 147x ב׳ -- machshavot-charutz
- 143x שהי׳ -- takanat-hashavin
- 140x ולכך -- sichat-malakhei-hasharet
- 135x שאיתא -- sichat-malakhei-hasharet

## Sample Refs To Test
