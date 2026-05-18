# Sitewide Lexical Build Report

Generated: 2026-05-18T15:50:29.945Z

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

- Total work-surface rows: 2233386
- Total sitewide unique surface forms: 640184
- Sitewide unique surface forms matched at least once: 79892
- Sitewide unique surface forms unmatched everywhere: 560292
- Total token occurrences: 12371680
- Matched before prefix/suffix parser: 527130
- Newly resolved by prefix/suffix parser: 79274
- Total matched after parser: 629642
- Percent matched: 28.2%
- Matched via Wikidata: 459114
- Enriched via OpenScriptures: 526259
- Unmatched: 1603744

## Newly Resolved Parsed Forms

- בשער -> in hair, with hair, by hair (wikidata + openscriptures) -- pardes-rimmonim
- כנגד -> as resistor, like resistor (wikidata + openscriptures) -- ohr-hachammah-on-zohar
- והענין -> and ado, and business, and travail (openscriptures) -- ohr-hachammah-on-zohar
- ודא -> and this, and one..another (openscriptures) -- ohr-hachammah-on-zohar
- ואלו -> and this/that, and demonstrative pronoun (wikidata + openscriptures) -- ohr-hachammah-on-zohar
- בעלמא -> in forever, with forever, by forever (openscriptures) -- ohr-hachammah-on-zohar
- שאם -> that if, which if, who if (workspace) -- ohr-hachammah-on-zohar
- כנגד -> as resistor, like resistor (wikidata + openscriptures) -- otzar-midrashim
- וּכְתִיב -> and it is written (workspace) -- ein-yaakov
- ברזא -> in a mystery, with a mystery, by a mystery (openscriptures) -- ohr-hachammah-on-zohar
- והא -> and behold, and this (workspace) -- ohr-hachammah-on-zohar
- לרבות -> to rabbi, for rabbi, of rabbi (wikidata + openscriptures) -- chafetz-chaim-on-sifra
- מובא -> from abide, of abide, from apply (openscriptures) -- notes-and-corrections-on-midrash-lekach-tov
- הֲדָא -> the this, the one..another (openscriptures) -- zohar-chadash
- רבינו -> our Rabbi (workspace) -- notes-and-corrections-on-midrash-lekach-tov
- שאז -> that at that time, which at that time, who at that time (openscriptures) -- ohr-hachammah-on-zohar
- בְּרָזָא -> in a mystery, with a mystery, by a mystery (openscriptures) -- zohar-chadash
- וְדָא -> and this, and one..another (openscriptures) -- zohar-chadash
- וְהָא -> and behold, and this (workspace) -- ein-yaakov
- הברכות -> the blessing, the bracha (wikidata + openscriptures) -- ohr-hachammah-on-zohar

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
- א״כ -> if so, therefore (workspace) -- aggadat-bereshit
- א״כ -> if so, therefore (workspace) -- avot-derabbi-natan
- א״כ -> if so, therefore (workspace) -- beur-eser-sefirot
- א״כ -> if so, therefore (workspace) -- beur-hagra-on-jerusalem-talmud-bikkurim
- א״כ -> if so, therefore (workspace) -- beur-hagra-on-jerusalem-talmud-challah
- א״כ -> if so, therefore (workspace) -- beur-hagra-on-shulchan-arukh-choshen-mishpat
- א״כ -> if so, therefore (workspace) -- beur-hagra-on-shulchan-arukh-even-haezer

## Sample Unmatched Words

- אֵ־ל -- ein-yaakov
- אאא -- otzar-midrashim
- אאבד -- avot-derabbi-natan
- אאבד -- ein-yaakov
- אאבד -- raavad-on-sifra
- אַאֲבוּהָ -- ein-yaakov
- אאבוי -- ohr-hachammah-on-zohar
- אאביד -- midrash-tanchuma-buber
- אאביו -- chafetz-chaim-on-sifra
- אאביו -- etz-yosef-on-kohelet-rabbah
- אאביי -- beur-hagra-on-shulchan-arukh-yoreh-deah
- אאביך -- ohr-hachammah-on-zohar
- אאבל -- beur-hagra-on-shulchan-arukh-orach-chayim
- אאבנט -- midrash-sekhel-tov
- אאברהם -- ohr-hachammah-on-zohar
- אאגרייהו -- midrash-sekhel-tov
- אאגרייכון -- midrash-sekhel-tov
- אאדירך -- maggid-meisharim
- אאדם -- ohr-hachammah-on-zohar
- אאהבנו -- etz-yosef-on-bamidbar-rabbah

## Top 50 Remaining Unmatched By Frequency

- 9864x וגומר -- ohr-hachammah-on-zohar
- 8149x וז״ש -- ohr-hachammah-on-zohar
- 5775x ה׳ -- ohr-hachammah-on-zohar
- 4253x א׳ -- ohr-hachammah-on-zohar
- 3738x הת״ת -- ohr-hachammah-on-zohar
- 3022x ת״ת -- ohr-hachammah-on-zohar
- 2547x ר -- notes-and-corrections-on-midrash-lekach-tov
- 2533x א׳ -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 2487x ג׳ -- ohr-hachammah-on-zohar
- 2433x ב׳ -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 2208x נ״ב -- mikdash-melekh-on-zohar
- 2176x נק׳ -- ohr-hachammah-on-zohar
- 2151x המ׳ -- ohr-hachammah-on-zohar
- 2147x כדפי׳ -- ohr-hachammah-on-zohar
- 2146x ולכך -- ohr-hachammah-on-zohar
- 2066x ואמר -- ohr-hachammah-on-zohar
- 1977x אינון -- ohr-hachammah-on-zohar
- 1962x וזהו -- ohr-hachammah-on-zohar
- 1957x דף -- ohr-hachammah-on-zohar
- 1918x זלה״ה -- ohr-hachammah-on-zohar
- 1913x בגין -- ohr-hachammah-on-zohar
- 1877x לעיל -- ohr-hachammah-on-zohar
- 1863x ב׳ -- ohr-hachammah-on-zohar
- 1852x זעיר -- mikdash-melekh-on-zohar
- 1805x ו׳ -- ohr-hachammah-on-zohar
- 1794x ואמר -- ketem-paz-on-zohar
- 1791x הנק׳ -- ohr-hachammah-on-zohar
- 1790x וז״ש -- mikdash-melekh-on-zohar
- 1764x ה׳ -- mikdash-melekh-on-zohar
- 1749x דזעיר -- mikdash-melekh-on-zohar
- 1728x עילאה -- ohr-hachammah-on-zohar
- 1702x הי׳ -- ohr-hachammah-on-zohar
- 1673x מ׳ -- ohr-hachammah-on-zohar
- 1642x איהו -- ohr-hachammah-on-zohar
- 1635x בפ׳ -- ohr-hachammah-on-zohar
- 1634x כתיב -- ohr-hachammah-on-zohar
- 1610x מַאי -- ein-yaakov
- 1539x עכ״ל -- ohr-hachammah-on-zohar
- 1511x ב״ -- notes-and-corrections-on-midrash-lekach-tov
- 1458x יצחק -- ohr-hachammah-on-zohar
- 1391x הכי -- ohr-hachammah-on-zohar
- 1378x ה״ג -- ohr-hachammah-on-zohar
- 1364x ז׳ -- ohr-hachammah-on-zohar
- 1334x הייחוד -- ohr-hachammah-on-zohar
- 1330x לכך -- ohr-hachammah-on-zohar
- 1319x כנודע -- ohr-hachammah-on-zohar
- 1318x ע״ -- notes-and-corrections-on-midrash-lekach-tov
- 1276x כד -- ohr-hachammah-on-zohar
- 1214x קב״ה -- ohr-hachammah-on-zohar
- 1201x דף -- pardes-rimmonim

## Exact Orot Refs To Test

- Orot, Lights from Darkness, Land of Israel 1:1
- Orot, Lights from Darkness, War 1:1
- Orot, Lights from Darkness, Lights of Rebirth 70:5
