# Sitewide Lexical Build Report

Generated: 2026-06-11T12:15:41.663Z

## Boundary

- Generated lexical/ranker/render evidence only.
- Added rows are project-authored abbreviation expansions; no new external dictionary text imported.
- No source/license/legal/Definition/product/answer/accepted-text/public-runtime/release acceptance.
- Route/HUD evidence remains inspectable; preHUD display remains governed by the canonical display gate.

## Scope

- Work scope: Targeted imported Hebrew works: beit-yosef, peri-megadim-on-orach-chayim, tzafnat-paneach-on-mishneh-torah-heave-offerings, arukh-hashulchan, divrei-yirmiyahu-on-mishneh-torah-sabbath
- Hebrew source text changed: no
- Translation overlays changed: no
- Sources used: existing local lexical cache generated from separated source layers: Wikidata Lexemes, OpenScriptures morphHB/HebrewLexicon, project-authored rows, and any already-imported Kaikki/Wiktionary rows present in the local source layers
- Sources not newly imported by this build: external web dictionaries, copyrighted translations
- Kaikki/Wiktionary note: sampled rows labeled `(kaikki)` come from the separated local Kaikki/Wiktionary layer and retain CC BY-SA 4.0 / GFDL metadata; this build step does not fetch new Kaikki data
- New parser: conservative prefix/suffix parser; accepts only when the remaining base is already present in the approved local lexical layer
- Count source: generated HUD token index, which is the page-render source of truth
- Payload: lexical details are externalized through data/lexical/<work-id>.manifest.json and data/lexical/<work-id>-chunks/

## Counts

- Total work-surface rows: 350992
- Total sitewide unique surface forms: 206833
- Sitewide unique surface forms matched at least once: 20155
- Sitewide unique surface forms unmatched everywhere: 186678
- Total token occurrences: 7578196
- Matched before prefix/suffix parser: 26896
- Newly resolved by prefix/suffix parser: 21419
- Total matched after parser: 49763
- Percent matched: 14.2%
- Matched via Wikidata: 37963
- Enriched via OpenScriptures: 40386
- Unmatched: 301229

## Newly Resolved Parsed Forms

- שאם -> that if, which if, who if (workspace) -- beit-yosef
- וזהו -> and that is, this is, it is, and right, that's it (kaikki) -- arukh-hashulchan
- בסעיף -> in clift, with clift, by clift (wikidata + openscriptures) -- arukh-hashulchan
- בסימן -> in sign, with sign, by sign (wikidata) -- arukh-hashulchan
- בשבת -> in figurative, with figurative, by figurative (wikidata + openscriptures) -- arukh-hashulchan
- בסימן -> in sign, with sign, by sign (wikidata) -- beit-yosef
- מאי -> from where? hence how?, of where? hence how?, from how (openscriptures) -- beit-yosef
- והא -> and behold, and this (workspace) -- beit-yosef
- בשבת -> in figurative, with figurative, by figurative (wikidata + openscriptures) -- beit-yosef
- משנה -> from year, of year, from sleep (wikidata + openscriptures) -- beit-yosef
- ליתן -> to make, for make, of make (openscriptures) -- arukh-hashulchan
- כדברי -> as thing, like thing, as entity (wikidata + openscriptures) -- beit-yosef
- ואמר -> and saying, speach, and answer, and appoint (wikidata + openscriptures) -- beit-yosef
- בשבת -> in figurative, with figurative, by figurative (wikidata + openscriptures) -- peri-megadim-on-orach-chayim
- לשלם -> to complete, intact, for complete, intact, of complete, intact (wikidata + openscriptures) -- arukh-hashulchan
- מגן -> from garden, of garden (openscriptures) -- arukh-hashulchan
- שמעון -> that an abode, which an abode, who an abode (openscriptures + wikidata) -- beit-yosef
- בעלמא -> in forever, with forever, by forever (openscriptures) -- arukh-hashulchan
- ורבינו -> our size, our age, our number (openscriptures + wikidata) -- beit-yosef
- שמעון -> that an abode, which an abode, who an abode (openscriptures + wikidata) -- arukh-hashulchan

## Sample Matched Words With Refs To Test

- א״כ -> if so, therefore (workspace) -- arukh-hashulchan
- א״כ -> if so, therefore (workspace) -- beit-yosef
- א״כ -> if so, therefore (workspace) -- divrei-yirmiyahu-on-mishneh-torah-sabbath
- א״כ -> if so, therefore (workspace) -- peri-megadim-on-orach-chayim
- א״כ -> if so, therefore (workspace) -- tzafnat-paneach-on-mishneh-torah-heave-offerings
- א״ך -> if so, therefore (workspace) -- arukh-hashulchan
- א״צ -> need not, it is not necessary (workspace) -- arukh-hashulchan
- א״צ -> need not, it is not necessary (workspace) -- beit-yosef
- א״צ -> need not, it is not necessary (workspace) -- divrei-yirmiyahu-on-mishneh-torah-sabbath
- א״צ -> need not, it is not necessary (workspace) -- peri-megadim-on-orach-chayim
- א״צ -> need not, it is not necessary (workspace) -- tzafnat-paneach-on-mishneh-torah-heave-offerings
- אבודה -> lost (wikidata) -- arukh-hashulchan
- אבודה -> lost (wikidata) -- beit-yosef
- אבודה -> lost (wikidata) -- peri-megadim-on-orach-chayim
- אבודה -> lost (wikidata) -- tzafnat-paneach-on-mishneh-torah-heave-offerings
- אבוקה -> torch, stick with a flaming end used as a source of light, torch (wikidata) -- arukh-hashulchan
- אבוקה -> torch, stick with a flaming end used as a source of light, torch (wikidata) -- beit-yosef
- אבוקה -> torch, stick with a flaming end used as a source of light, torch (wikidata) -- peri-megadim-on-orach-chayim
- אבוקה" -> torch (wikidata) -- arukh-hashulchan
- אבות -> father, male parent, father, Av (wikidata + openscriptures) -- arukh-hashulchan

## Sample Unmatched Words

- אאב -- beit-yosef
- אאבא -- beit-yosef
- אאבוה -- beit-yosef
- אאבולי -- beit-yosef
- אאבוס -- beit-yosef
- אאבות -- arukh-hashulchan
- אאבות -- peri-megadim-on-orach-chayim
- אאביו -- arukh-hashulchan
- אאביו -- beit-yosef
- אאביי -- arukh-hashulchan
- אאביי -- beit-yosef
- אאביי -- peri-megadim-on-orach-chayim
- אאבלות -- arukh-hashulchan
- אאבן -- beit-yosef
- אאבעיא -- beit-yosef
- אאבר -- arukh-hashulchan
- אאבר -- beit-yosef
- אאבר -- peri-megadim-on-orach-chayim
- אאגריה -- beit-yosef
- אאגרייהו -- beit-yosef

## Top 50 Remaining Unmatched By Frequency

- 20950x כתב -- beit-yosef
- 12010x וכתב -- beit-yosef
- 10665x עכ״ל -- beit-yosef
- 10605x ומ״ש -- beit-yosef
- 10209x רבינו -- beit-yosef
- 7372x א׳ -- peri-megadim-on-orach-chayim
- 7324x כתב -- arukh-hashulchan
- 7192x עמ״א -- peri-megadim-on-orach-chayim
- 6412x אסור -- arukh-hashulchan
- 6236x אסור -- beit-yosef
- 5994x יע״ש -- peri-megadim-on-orach-chayim
- 5775x ב׳ -- peri-megadim-on-orach-chayim
- 5773x עיין -- arukh-hashulchan
- 5669x נמי -- beit-yosef
- 5604x דף -- tzafnat-paneach-on-mishneh-torah-heave-offerings
- 5448x שכתב -- beit-yosef
- 5307x משמע -- beit-yosef
- 5183x אסור -- peri-megadim-on-orach-chayim
- 4772x רבינו -- arukh-hashulchan
- 4349x חייב -- arukh-hashulchan
- 4234x עכ״ל -- arukh-hashulchan
- 4052x שכתב -- arukh-hashulchan
- 4031x לאו -- beit-yosef
- 3937x דאמר -- beit-yosef
- 3771x עט״ז -- peri-megadim-on-orach-chayim
- 3757x הכי -- beit-yosef
- 3747x חייב -- beit-yosef
- 3672x כגון -- arukh-hashulchan
- 3642x דאם -- arukh-hashulchan
- 3640x הרי״ף -- beit-yosef
- 3563x לשונו -- arukh-hashulchan
- 3311x ג׳ -- beit-yosef
- 3287x דכיון -- beit-yosef
- 3250x משמע -- peri-megadim-on-orach-chayim
- 3231x כגון -- beit-yosef
- 3087x כתבו -- beit-yosef
- 3030x בגמרא -- beit-yosef
- 3017x הרמ״א -- arukh-hashulchan
- 2998x כתב -- peri-megadim-on-orach-chayim
- 2886x הטור -- arukh-hashulchan
- 2856x יבואר -- peri-megadim-on-orach-chayim
- 2850x איסור -- arukh-hashulchan
- 2844x ע״ב -- tzafnat-paneach-on-mishneh-torah-heave-offerings
- 2763x דגם -- arukh-hashulchan
- 2703x ב׳ -- beit-yosef
- 2699x דכיון -- arukh-hashulchan
- 2650x ואי״ה -- peri-megadim-on-orach-chayim
- 2634x בפ׳ -- beit-yosef
- 2571x כתוב -- beit-yosef
- 2519x דכל -- arukh-hashulchan

## Sample Refs To Test
