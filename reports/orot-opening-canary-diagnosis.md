# Orot 1:1 Opening Canary Diagnosis

Generated: 2026-04-30T14:19:32.921Z

## Scope

- Phrase: אֶרֶץ יִשְׂרָאֵל אֵינֶנָּהּ דָּבָר חִיצוֹנִי
- New broad vocabulary added: no
- New external sources imported: no
- Hebrew source, anchors, overlays, and exports changed: no
- Closed-class grammar rule added separately for אֵינֶנָּהּ in the build script.

## Source-Layer Promotions

| Token | Codepoints | Layer | Before | After | Renderings | Reason |
|---|---|---|---|---|---|---|
| אֶרֶץ | 05D0 05B6 05E8 05B6 05E5 | openscriptures-cc-by-4.json | likely wikidata:L64126 | likely openscriptures:H776 | land; earth | Existing OpenScriptures H776 is an exact vocalized lemma match; prior default used Wikidata country/Earth and left land secondary. |
| יִשְׂרָאֵל | 05D9 05B4 05E9 05B0 05C2 05E8 05B8 05D0 05B5 05DC | openscriptures-cc-by-4.json | possible-only or unresolved | likely openscriptures:H3479 | Israel | Existing OpenScriptures H3479 supplies the plain Israel rendering; prior entry was possible-only. |
| דָּבָר | 05D3 05B8 05BC 05D1 05B8 05E8 | openscriptures-cc-by-4.json | possible-only or unresolved | likely openscriptures:H1697 | thing; matter; word | Existing OpenScriptures H1697 matches the vocalized noun דָּבָר; prior homographs stayed possible-only. |
| חִיצוֹנִי | 05D7 05B4 05D9 05E6 05D5 05B9 05E0 05B4 05D9 | wikidata-cc0.json | possible-only or unresolved | likely wikidata:L210877 | external; exterior | Existing Wikidata L210877 is the exact חיצוני lexical entry; prior entry was possible-only behind חיצון. |

## Grammar Canary

| Token | Codepoints | Layer | Resolution | Renderings |
|---|---|---|---|---|
| אֵינֶנָּהּ | 05D0 05B5 05D9 05E0 05B6 05E0 05B8 05BC 05D4 05BC | project-overrides.json | Workspace closed-class grammar form | is not; is not it; is not her |
