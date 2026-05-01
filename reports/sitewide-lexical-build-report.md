# Sitewide Lexical Build Report

Generated: 2026-05-01T10:57:15.319Z

## Scope

- Work scope: all imported Hebrew works
- Hebrew source text changed: no
- Translation overlays changed: no
- Sources used: existing local lexical cache generated from Wikidata Lexemes first; OpenScriptures morphHB + HebrewLexicon as fallback/enrichment
- Sources not used: Kaikki, Wiktionary, copyrighted translations
- New parser: conservative prefix/suffix parser; accepts only when the remaining base is already present in the approved local lexical layer
- Count source: generated HUD token index, which is the page-render source of truth
- Payload: lexical details are externalized through data/lexical/<work-id>.manifest.json and data/lexical/<work-id>-chunks/

## Counts

- Total work-surface rows: 243663
- Total sitewide unique surface forms: 100759
- Sitewide unique surface forms matched at least once: 18555
- Sitewide unique surface forms unmatched everywhere: 82204
- Total token occurrences: 1337888
- Matched before prefix/suffix parser: 73921
- Newly resolved by prefix/suffix parser: 8498
- Total matched after parser: 84178
- Percent matched: 34.5%
- Matched via Wikidata: 64432
- Enriched via OpenScriptures: 63935
- Unmatched: 159485

## Newly Resolved Parsed Forms

- ודוקא -> and unexpectedly, and just to spite, and in fact, actually (kaikki) -- beur-hagra-on-shulchan-arukh-yoreh-deah
- כנגד -> as resistor, like resistor (wikidata + openscriptures) -- shaar-maamarei-rashbi
- והא -> and behold, and this (workspace) -- beur-hagra-on-shulchan-arukh-yoreh-deah
- והענין -> and ado, and business, and travail (openscriptures) -- shaar-hapesukim
- כנגד -> as resistor, like resistor (wikidata + openscriptures) -- shaar-hapesukim
- והענין -> and ado, and business, and travail (openscriptures) -- shaar-maamarei-rashbi
- כדברי -> as thing, like thing, as entity (wikidata + openscriptures) -- beur-hagra-on-shulchan-arukh-yoreh-deah
- כנגד -> as resistor, like resistor (wikidata + openscriptures) -- shaar-hakavanot
- הכח -> the vigor, the means (openscriptures) -- midbar-shur
- ואלו -> and this/that, and demonstrative pronoun (wikidata + openscriptures) -- shaar-maamarei-rashbi
- ודלא -> and that not, and which does not, and without (workspace) -- beur-hagra-on-shulchan-arukh-yoreh-deah
- מהא -> from behold, of behold, from this (workspace) -- beur-hagra-on-shulchan-arukh-yoreh-deah
- כלא -> as not, like not, as no (workspace) -- beur-hagra-on-sifra-detzniuta
- לחוץ -> to exterior, for exterior, of exterior (wikidata + openscriptures) -- shaar-maamarei-rashbi
- ולמטה -> and to bed, and for bed, and of bed (wikidata + openscriptures) -- shaar-hapesukim
- כנגד -> as resistor, like resistor (wikidata + openscriptures) -- shaar-hamitzvot
- האלו -> the this/that, the demonstrative pronoun (wikidata + openscriptures) -- shaar-maamarei-rashbi
- ואלו -> and this/that, and demonstrative pronoun (wikidata + openscriptures) -- shaar-hagilgulim
- המלכים -> the king (wikidata + openscriptures) -- shaar-maamarei-rashbi
- הכי -> the because, the for, the that (workspace) -- shaar-maamarei-rashbi

## Sample Matched Words With Refs To Test

- א״א -> Arikh Anpin (workspace) -- beur-hagra-on-sifra-detzniuta
- א״א -> Arikh Anpin (workspace) -- hagra-on-sefer-yetzirah-gra-version
- א״א -> Arikh Anpin (workspace) -- pri-etz-chaim
- א״א -> Arikh Anpin (workspace) -- shaar-hagilgulim
- א״א -> Arikh Anpin (workspace) -- shaar-hahakdamot
- א״א -> Arikh Anpin (workspace) -- shaar-hakavanot
- א״א -> Arikh Anpin (workspace) -- shaar-hamitzvot
- א״א -> Arikh Anpin (workspace) -- shaar-hapesukim
- א״א -> Arikh Anpin (workspace) -- shaar-maamarei-rashbi
- א״א -> Arikh Anpin (workspace) -- shaar-maamarei-razal
- א״א -> Arikh Anpin (workspace) -- yahel-ohr-on-zohar
- א״כ -> if so, therefore (workspace) -- aderet-eliyahu
- א״כ -> if so, therefore (workspace) -- beur-hagra-on-jerusalem-talmud-bikkurim
- א״כ -> if so, therefore (workspace) -- beur-hagra-on-jerusalem-talmud-challah
- א״כ -> if so, therefore (workspace) -- beur-hagra-on-shulchan-arukh-choshen-mishpat
- א״כ -> if so, therefore (workspace) -- beur-hagra-on-shulchan-arukh-even-haezer
- א״כ -> if so, therefore (workspace) -- beur-hagra-on-shulchan-arukh-orach-chayim
- א״כ -> if so, therefore (workspace) -- beur-hagra-on-shulchan-arukh-yoreh-deah
- א״כ -> if so, therefore (workspace) -- hagra-on-sefer-yetzirah-gra-version
- א״כ -> if so, therefore (workspace) -- midbar-shur

## Sample Unmatched Words

- אאביי -- beur-hagra-on-shulchan-arukh-yoreh-deah
- אאבל -- beur-hagra-on-shulchan-arukh-orach-chayim
- אאילן -- beur-hagra-on-shulchan-arukh-yoreh-deah
- אאין -- beur-hagra-on-shulchan-arukh-orach-chayim
- אאיסור -- beur-hagra-on-shulchan-arukh-yoreh-deah
- אאל -- shaar-hakavanot
- אֵאֶלֵלֵהֵהֵיֵּיֵםַםַ -- shaar-ruach-hakodesh
- אאסור -- beur-hagra-on-shulchan-arukh-yoreh-deah
- אאריך -- shaar-hakavanot
- אאריך -- shaar-maamarei-rashbi
- אארס -- beur-hagra-on-shulchan-arukh-yoreh-deah
- אארעא -- beur-hagra-on-shulchan-arukh-yoreh-deah
- אאשה -- beur-hagra-on-shulchan-arukh-even-haezer
- אאשת -- beur-hagra-on-shulchan-arukh-yoreh-deah
- אבא -- aderet-eliyahu
- אבא -- beur-hagra-on-jerusalem-talmud-bikkurim
- אבא -- beur-hagra-on-jerusalem-talmud-challah
- אבא -- beur-hagra-on-shulchan-arukh-orach-chayim
- אבא -- beur-hagra-on-shulchan-arukh-yoreh-deah
- אבא -- beur-hagra-on-sifra-detzniuta

## Top 50 Remaining Unmatched By Frequency

- 2533x א׳ -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 2433x ב׳ -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 1007x ליקוט -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 743x אסור -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 710x ב׳ -- beur-hagra-on-shulchan-arukh-orach-chayim
- 706x א׳ -- beur-hagra-on-shulchan-arukh-orach-chayim
- 689x הרא״ש -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 673x כוכבים -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 655x וכ״כ -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 652x ע״ב -- shaar-maamarei-rashbi
- 603x ס״א -- beur-hagra-on-shulchan-arukh-orach-chayim
- 600x ה׳ -- shaar-hapesukim
- 577x השי״ת -- midbar-shur
- 575x דף -- beur-hagra-on-sifra-detzniuta
- 529x כ״א -- midbar-shur
- 511x בגימטריא -- shaar-hapesukim
- 504x וז״ש -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 471x בחינת -- shaar-maamarei-rashbi
- 460x ע״א -- shaar-maamarei-rashbi
- 437x כתב -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 433x משמע -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 427x באדרא -- beur-hagra-on-sifra-detzniuta
- 412x כנודע -- shaar-hapesukim
- 406x וזהו -- shaar-maamarei-rashbi
- 395x וז״ש -- beur-hagra-on-sifra-detzniuta
- 393x כידוע -- beur-hagra-on-sifra-detzniuta
- 384x ואמר -- beur-hagra-on-sifra-detzniuta
- 375x בירושלמי -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 367x הי׳ -- midbar-shur
- 363x בהג״ה -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 350x ע״א -- beur-hagra-on-sifra-detzniuta
- 341x ה׳ -- beur-hagra-on-sifra-detzniuta
- 336x א׳ -- pri-etz-chaim
- 336x ב׳ -- shaar-hapesukim
- 332x ב׳ -- pri-etz-chaim
- 331x ה׳ -- shaar-maamarei-rashbi
- 330x ע״ב -- beur-hagra-on-sifra-detzniuta
- 326x רבא -- beur-hagra-on-sifra-detzniuta
- 324x ג׳ -- shaar-hapesukim
- 320x כ׳ -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 313x בפ׳ -- shaar-maamarei-rashbi
- 310x ית׳ -- midbar-shur
- 300x ה׳ -- shaar-hakavanot
- 297x וזמ״ש -- shaar-maamarei-rashbi
- 290x ממ״ש -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 280x קצוות -- shaar-maamarei-rashbi
- 278x ה׳ -- pri-etz-chaim
- 275x שהן -- beur-hagra-on-sifra-detzniuta
- 259x בסי׳ -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 255x ד״ש -- shaar-maamarei-rashbi

## Exact Orot Refs To Test

- Orot, Lights from Darkness, Land of Israel 1:1
- Orot, Lights from Darkness, War 1:1
- Orot, Lights from Darkness, Lights of Rebirth 70:5
