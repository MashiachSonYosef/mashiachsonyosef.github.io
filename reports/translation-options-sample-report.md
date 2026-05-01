# Translation Options Sample Report

This is a scaffold for future human translation choices. It is not a translation layer and is not rendered on the public work pages.

## Summary

- Units processed: 2
- Tokens processed: 40
- Safe option count: 71
- Tokens with safe options: 25
- Caution-only tokens: 10
- Unresolved tokens: 5
- Caution option count: 84
- Output JSON: `data/translation-options/orot-sample.json`

## Licenses Represented

- kaikki: CC BY-SA 4.0 / GFDL
- openscriptures: CC BY 4.0
- wikidata: CC0
- workspace: N/A - project lexical rule
- workspace: project-authored / CC0

## Units

- Orot, Lights from Darkness, Land of Israel 1:1: 36 tokens; 22 with safe options, 9 caution-only, 5 unresolved
- Orot, Lights from Darkness, Lights of Rebirth 70:5: 4 tokens; 3 with safe options, 1 caution-only, 0 unresolved

## Tokens Excluded From safe_options

| Surface | Normalized | Status | Available Options |
| --- | --- | --- | --- |
| אֶמְצָעִי | אמצעי | caution-only | central/middle; middle; means |
| הַהִתְאַגְּדוּת | ההתאגדות | unresolved | N/A |
| הַכְּלָלִית | הכללית | unresolved | N/A |
| הֶחָמְרִי | החמרי | caution-only | a male ass (from its dun red ); (he) ass. |
| אֲפִלּוּ | אפלו | caution-only | even (emphasizing comparison or extreme example) |
| הָרוּחָנִי | הרוחני | unresolved | N/A |
| חֲטִיבָה | חטיבה | caution-only | division, department, bureau; brigade |
| עַצְמוּתִית | עצמותית | unresolved | N/A |
| קְשׁוּרָה | קשורה | unresolved | N/A |
| בְּקֶשֶׁר | בקשר | caution-only | knot; to tie; physically ( gird |
| חַיִּים | חיימ | caution-only | alive, living; real-time, unedited (as in live broadcast); to be alive |
| חֲבוּקָה | חבוקה | caution-only | hug (affectionate embrace) |
| בִּסְגֻלוֹת | בסגלות | caution-only | dotted with a segol |
| פְּנִימִיּוֹת | פנימיות | caution-only | interior; (with-) in(-ner; -ward). |
| רוח | רוח | caution-only | wind; wind; breath |

## Specific Checks

- עִם / עם has safe grammar option "with": yes
- אוֹ / או has safe grammar option "or": yes
- הֶחָמְרִי donkey/ass noise appears in safe_options: no
