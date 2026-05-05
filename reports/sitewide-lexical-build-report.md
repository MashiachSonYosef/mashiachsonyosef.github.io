# Sitewide Lexical Build Report

Generated: 2026-05-05T16:21:03.736Z

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

- Total work-surface rows: 389429
- Total sitewide unique surface forms: 190476
- Sitewide unique surface forms matched at least once: 38779
- Sitewide unique surface forms unmatched everywhere: 151697
- Total token occurrences: 2080589
- Matched before prefix/suffix parser: 110936
- Newly resolved by prefix/suffix parser: 14250
- Total matched after parser: 128039
- Percent matched: 32.9%
- Matched via Wikidata: 96327
- Enriched via OpenScriptures: 102992
- Unmatched: 261390

## Newly Resolved Parsed Forms

- ודוקא -> and in fact, actually (kaikki) -- beur-hagra-on-shulchan-arukh-yoreh-deah
- כנגד -> as resistor, like resistor (wikidata + openscriptures) -- shaar-maamarei-rashbi
- והא -> and behold, and this (workspace) -- beur-hagra-on-shulchan-arukh-yoreh-deah
- וְלָמָּה -> and to what, and for what, and of what (workspace) -- midrash-tanchuma
- לדוד -> to uncle, for uncle, of uncle (wikidata + openscriptures) -- midrash-tehillim
- והענין -> and ado, and business, and travail (openscriptures) -- shaar-hapesukim
- כנגד -> as resistor, like resistor (wikidata + openscriptures) -- shaar-hapesukim
- כְּנֶגֶד -> as resistor, like resistor (wikidata + openscriptures) -- midrash-tanchuma
- לאו -> to or, for or, of or (workspace) -- beur-hagra-on-shulchan-arukh-yoreh-deah
- והענין -> and ado, and business, and travail (openscriptures) -- shaar-maamarei-rashbi
- רִבּוֹנוֹ -> our rabbi (wikidata + openscriptures) -- midrash-tanchuma
- כדברי -> as thing, like thing, as entity (wikidata + openscriptures) -- beur-hagra-on-shulchan-arukh-yoreh-deah
- כנגד -> as resistor, like resistor (wikidata + openscriptures) -- shaar-hakavanot
- הכח -> the vigor, the means (openscriptures) -- midbar-shur
- ולמה -> and to what, and for what, and of what (workspace) -- midrash-tehillim
- לָאו -> to or, for or, of or (workspace) -- midrash-tanchuma
- ואלו -> and this/that, and demonstrative pronoun (wikidata + openscriptures) -- shaar-maamarei-rashbi
- ודלא -> and that not, and which does not, and without (workspace) -- beur-hagra-on-shulchan-arukh-yoreh-deah
- מהא -> from behold, of behold, from this (workspace) -- beur-hagra-on-shulchan-arukh-yoreh-deah
- והלא -> and the not, and the no (workspace) -- sifrei-devarim

## Sample Matched Words With Refs To Test

- א״א -> Arikh Anpin (workspace) -- beur-hagra-on-sifra-detzniuta
- א״א -> Arikh Anpin (workspace) -- hagra-on-sefer-yetzirah-gra-version
- א״א -> impossible, it is not possible (workspace) -- orot
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

## Sample Unmatched Words

- אאביי -- beur-hagra-on-shulchan-arukh-yoreh-deah
- אאבל -- beur-hagra-on-shulchan-arukh-orach-chayim
- אאילן -- beur-hagra-on-shulchan-arukh-yoreh-deah
- אאין -- beur-hagra-on-shulchan-arukh-orach-chayim
- אאיסור -- beur-hagra-on-shulchan-arukh-yoreh-deah
- אאל -- shaar-hakavanot
- אֵאֶלֵלֵהֵהֵיֵּיֵםַםַ -- shaar-ruach-hakodesh
- אאם -- sifrei-bamidbar
- אאסור -- beur-hagra-on-shulchan-arukh-yoreh-deah
- אֶאֱסֹף -- midrash-tanchuma
- אָאֹר -- midrash-tanchuma
- אאריך -- pesikta-derav-kahana
- אאריך -- shaar-hakavanot
- אאריך -- shaar-maamarei-rashbi
- אַאֲרִיךְ -- midrash-tanchuma
- אארס -- beur-hagra-on-shulchan-arukh-yoreh-deah
- אארעא -- beur-hagra-on-shulchan-arukh-yoreh-deah
- אארעא -- midrash-tehillim
- אַאַרְעָא -- eikhah-rabbah
- אאשה -- beur-hagra-on-shulchan-arukh-even-haezer

## Top 50 Remaining Unmatched By Frequency

- 2533x א׳ -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 2433x ב׳ -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 1768x ה׳ -- midrash-tanchuma
- 1514x רַבִּי -- midrash-tanchuma
- 1377x ה׳ -- midrash-tehillim
- 1007x ליקוט -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 828x רבי -- midrash-tehillim
- 805x כְּתִיב -- midrash-tanchuma
- 743x אסור -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 710x ב׳ -- beur-hagra-on-shulchan-arukh-orach-chayim
- 706x א׳ -- beur-hagra-on-shulchan-arukh-orach-chayim
- 689x הרא״ש -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 673x כוכבים -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 655x וכ״כ -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 652x ע״ב -- shaar-maamarei-rashbi
- 603x ס״א -- beur-hagra-on-shulchan-arukh-orach-chayim
- 600x ה׳ -- shaar-hapesukim
- 596x א׳ -- pesikta-derav-kahana
- 577x השי״ת -- midbar-shur
- 575x דף -- beur-hagra-on-sifra-detzniuta
- 531x רבי -- sifrei-devarim
- 530x ה׳ -- sifrei-devarim
- 529x כ״א -- midbar-shur
- 517x ישעיה -- midrash-tanchuma
- 511x בגימטריא -- shaar-hapesukim
- 504x וז״ש -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 471x בחינת -- shaar-maamarei-rashbi
- 460x ע״א -- shaar-maamarei-rashbi
- 449x יב -- midrash-tanchuma
- 447x י״י -- pesikta-derav-kahana
- 437x כתב -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 433x משמע -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 429x אמ׳ -- pesikta-derav-kahana
- 412x א״ר -- pesikta-derav-kahana
- 412x כנודע -- shaar-hapesukim
- 407x ת״ל -- sifrei-bamidbar
- 406x וזהו -- shaar-maamarei-rashbi
- 395x וז״ש -- beur-hagra-on-sifra-detzniuta
- 393x כידוע -- beur-hagra-on-sifra-detzniuta
- 384x ואמר -- beur-hagra-on-sifra-detzniuta
- 375x בירושלמי -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 372x ישעיה -- midrash-tehillim
- 368x רַבִּי -- eikhah-rabbah
- 367x הי׳ -- midbar-shur
- 365x לְכָךְ -- midrash-tanchuma
- 363x בהג״ה -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 352x וג׳ -- pesikta-derav-kahana
- 350x לכך -- midrash-tehillim
- 350x ע״א -- beur-hagra-on-sifra-detzniuta
- 341x ה׳ -- beur-hagra-on-sifra-detzniuta

## Exact Orot Refs To Test

- Orot, Lights from Darkness, Land of Israel 1:1
- Orot, Lights from Darkness, War 1:1
- Orot, Lights from Darkness, Lights of Rebirth 70:5
