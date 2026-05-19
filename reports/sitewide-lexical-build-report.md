# Sitewide Lexical Build Report

Generated: 2026-05-19T17:13:33.588Z

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

- Total work-surface rows: 3002269
- Total sitewide unique surface forms: 735830
- Sitewide unique surface forms matched at least once: 86290
- Sitewide unique surface forms unmatched everywhere: 649540
- Total token occurrences: 18238565
- Matched before prefix/suffix parser: 690814
- Newly resolved by prefix/suffix parser: 114794
- Total matched after parser: 832467
- Percent matched: 27.7%
- Matched via Wikidata: 611773
- Enriched via OpenScriptures: 691529
- Unmatched: 2169802

## Newly Resolved Parsed Forms

- בשער -> in hair, with hair, by hair (wikidata + openscriptures) -- pardes-rimmonim
- כנגד -> as resistor, like resistor (wikidata + openscriptures) -- ohr-hachammah-on-zohar
- והענין -> and ado, and business, and travail (openscriptures) -- ohr-hachammah-on-zohar
- בשער -> in hair, with hair, by hair (wikidata + openscriptures) -- akeidat-yitzchak
- שאם -> that if, which if, who if (workspace) -- ohr-hashem
- הענינים -> the matter, issue, the business (kaikki) -- akeidat-yitzchak
- שאם -> that if, which if, who if (workspace) -- akeidat-yitzchak
- ודא -> and this, and one..another (openscriptures) -- ohr-hachammah-on-zohar
- ואלו -> and this/that, and demonstrative pronoun (wikidata + openscriptures) -- ohr-hachammah-on-zohar
- כנגד -> as resistor, like resistor (wikidata + openscriptures) -- shenei-luchot-haberit
- כאלו -> as this/that, like this/that, as demonstrative pronoun (wikidata + openscriptures) -- shenei-luchot-haberit
- בעלמא -> in forever, with forever, by forever (openscriptures) -- ohr-hachammah-on-zohar
- שאם -> that if, which if, who if (workspace) -- ohr-hachammah-on-zohar
- ואלו -> and this/that, and demonstrative pronoun (wikidata + openscriptures) -- shenei-luchot-haberit
- כנגד -> as resistor, like resistor (wikidata + openscriptures) -- otzar-midrashim
- שאם -> that if, which if, who if (workspace) -- the-wars-of-the-lord
- וּכְתִיב -> and it is written (workspace) -- ein-yaakov
- במאמר -> in article, with article, by article (wikidata + openscriptures) -- akeidat-yitzchak
- ברזא -> in a mystery, with a mystery, by a mystery (openscriptures) -- ohr-hachammah-on-zohar
- והא -> and behold, and this (workspace) -- ohr-hachammah-on-zohar

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
- א״כ -> if so, therefore (workspace) -- abarbanel-on-guide-for-the-perplexed
- א״כ -> if so, therefore (workspace) -- aderet-eliyahu
- א״כ -> if so, therefore (workspace) -- aggadat-bereshit
- א״כ -> if so, therefore (workspace) -- akeidat-yitzchak
- א״כ -> if so, therefore (workspace) -- avot-derabbi-natan
- א״כ -> if so, therefore (workspace) -- beit-elohim
- א״כ -> if so, therefore (workspace) -- beur-eser-sefirot
- א״כ -> if so, therefore (workspace) -- beur-hagra-on-jerusalem-talmud-bikkurim

## Sample Unmatched Words

- אֵ־ל -- ein-yaakov
- אאא -- otzar-midrashim
- אאבד -- avot-derabbi-natan
- אאבד -- ein-yaakov
- אאבד -- imrei-binah
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
- אאביר -- beit-elohim
- אאבל -- beur-hagra-on-shulchan-arukh-orach-chayim
- אאבנט -- midrash-sekhel-tov
- אאברהם -- ohr-hachammah-on-zohar

## Top 50 Remaining Unmatched By Frequency

- 9864x וגומר -- ohr-hachammah-on-zohar
- 8149x וז״ש -- ohr-hachammah-on-zohar
- 5775x ה׳ -- ohr-hachammah-on-zohar
- 5141x ה׳ -- akeidat-yitzchak
- 4314x ה׳ -- shenei-luchot-haberit
- 4253x א׳ -- ohr-hachammah-on-zohar
- 3972x בב״ת -- ohr-hashem
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
- 1694x ב״ת -- ohr-hashem
- 1673x מ׳ -- ohr-hachammah-on-zohar
- 1653x לשונו -- shenei-luchot-haberit
- 1652x גשם -- ohr-hashem
- 1642x איהו -- ohr-hachammah-on-zohar
- 1641x מבואר -- ohr-hashem
- 1635x בפ׳ -- ohr-hachammah-on-zohar
- 1634x כתיב -- ohr-hachammah-on-zohar
- 1623x ה׳ -- beit-elohim
- 1610x מַאי -- ein-yaakov
- 1586x הב״ה -- menorat-hamaor

## Exact Orot Refs To Test

- Orot, Lights from Darkness, Land of Israel 1:1
- Orot, Lights from Darkness, War 1:1
- Orot, Lights from Darkness, Lights of Rebirth 70:5
