# Sitewide Lexical Build Report

Generated: 2026-05-18T23:41:24.526Z

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

- Total work-surface rows: 2624827
- Total sitewide unique surface forms: 688548
- Sitewide unique surface forms matched at least once: 83281
- Sitewide unique surface forms unmatched everywhere: 605267
- Total token occurrences: 15291257
- Matched before prefix/suffix parser: 606319
- Newly resolved by prefix/suffix parser: 96308
- Total matched after parser: 727394
- Percent matched: 27.7%
- Matched via Wikidata: 532242
- Enriched via OpenScriptures: 607336
- Unmatched: 1897433

## Newly Resolved Parsed Forms

- בשער -> in hair, with hair, by hair (wikidata + openscriptures) -- pardes-rimmonim
- כנגד -> as resistor, like resistor (wikidata + openscriptures) -- ohr-hachammah-on-zohar
- והענין -> and ado, and business, and travail (openscriptures) -- ohr-hachammah-on-zohar
- ודא -> and this, and one..another (openscriptures) -- ohr-hachammah-on-zohar
- ואלו -> and this/that, and demonstrative pronoun (wikidata + openscriptures) -- ohr-hachammah-on-zohar
- כנגד -> as resistor, like resistor (wikidata + openscriptures) -- shenei-luchot-haberit
- כאלו -> as this/that, like this/that, as demonstrative pronoun (wikidata + openscriptures) -- shenei-luchot-haberit
- בעלמא -> in forever, with forever, by forever (openscriptures) -- ohr-hachammah-on-zohar
- שאם -> that if, which if, who if (workspace) -- ohr-hachammah-on-zohar
- ואלו -> and this/that, and demonstrative pronoun (wikidata + openscriptures) -- shenei-luchot-haberit
- כנגד -> as resistor, like resistor (wikidata + openscriptures) -- otzar-midrashim
- וּכְתִיב -> and it is written (workspace) -- ein-yaakov
- ברזא -> in a mystery, with a mystery, by a mystery (openscriptures) -- ohr-hachammah-on-zohar
- והא -> and behold, and this (workspace) -- ohr-hachammah-on-zohar
- לרבות -> to rabbi, for rabbi, of rabbi (wikidata + openscriptures) -- chafetz-chaim-on-sifra
- מובא -> from abide, of abide, from apply (openscriptures) -- notes-and-corrections-on-midrash-lekach-tov
- הֲדָא -> the this, the one..another (openscriptures) -- zohar-chadash
- רבינו -> our Rabbi (workspace) -- notes-and-corrections-on-midrash-lekach-tov
- שאז -> that at that time, which at that time, who at that time (openscriptures) -- ohr-hachammah-on-zohar
- בלשון -> in tongue, Muscular organ in the mouth, with tongue, Muscular organ in the mouth, by tongue, Muscular organ in the mouth (wikidata + openscriptures) -- shenei-luchot-haberit

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
- אאבד -- shevet-musar
- אַאֲבוּהָ -- ein-yaakov
- אאבוהי -- yaarot-devash-i
- אאבוי -- ohr-hachammah-on-zohar
- אאבות -- shenei-luchot-haberit
- אאביד -- midrash-tanchuma-buber
- אאביו -- chafetz-chaim-on-sifra
- אאביו -- etz-yosef-on-kohelet-rabbah
- אאביי -- beur-hagra-on-shulchan-arukh-yoreh-deah
- אאביך -- ohr-hachammah-on-zohar
- אאבל -- beur-hagra-on-shulchan-arukh-orach-chayim
- אאבנט -- midrash-sekhel-tov
- אאברהם -- ohr-hachammah-on-zohar
- אאברהם -- shenei-luchot-haberit
- אאגרייהו -- midrash-sekhel-tov

## Top 50 Remaining Unmatched By Frequency

- 9864x וגומר -- ohr-hachammah-on-zohar
- 8149x וז״ש -- ohr-hachammah-on-zohar
- 5775x ה׳ -- ohr-hachammah-on-zohar
- 4314x ה׳ -- shenei-luchot-haberit
- 4253x א׳ -- ohr-hachammah-on-zohar
- 3738x הת״ת -- ohr-hachammah-on-zohar
- 3022x ת״ת -- ohr-hachammah-on-zohar
- 2547x ר -- notes-and-corrections-on-midrash-lekach-tov
- 2533x א׳ -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 2526x שנא׳ -- menorat-hamaor
- 2487x ג׳ -- ohr-hachammah-on-zohar
- 2467x אמ׳ -- menorat-hamaor
- 2433x ב׳ -- beur-hagra-on-shulchan-arukh-yoreh-deah
- 2208x נ״ב -- mikdash-melekh-on-zohar
- 2176x נק׳ -- ohr-hachammah-on-zohar
- 2151x המ׳ -- ohr-hachammah-on-zohar
- 2150x ה׳ -- menorat-hamaor
- 2147x כדפי׳ -- ohr-hachammah-on-zohar
- 2146x ולכך -- ohr-hachammah-on-zohar
- 2066x ואמר -- ohr-hachammah-on-zohar
- 1977x אינון -- ohr-hachammah-on-zohar
- 1965x וזהו -- shenei-luchot-haberit
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
- 1653x לשונו -- shenei-luchot-haberit
- 1642x איהו -- ohr-hachammah-on-zohar
- 1635x בפ׳ -- ohr-hachammah-on-zohar
- 1634x כתיב -- ohr-hachammah-on-zohar
- 1610x מַאי -- ein-yaakov
- 1586x הב״ה -- menorat-hamaor
- 1539x עכ״ל -- ohr-hachammah-on-zohar
- 1511x ב״ -- notes-and-corrections-on-midrash-lekach-tov
- 1491x ה׳ -- yaarot-devash-i
- 1458x יצחק -- ohr-hachammah-on-zohar
- 1397x ג׳ -- shenei-luchot-haberit
- 1397x רז״ל -- shenei-luchot-haberit

## Exact Orot Refs To Test

- Orot, Lights from Darkness, Land of Israel 1:1
- Orot, Lights from Darkness, War 1:1
- Orot, Lights from Darkness, Lights of Rebirth 70:5
