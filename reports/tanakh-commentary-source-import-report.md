# Tanakh Commentary Source Import Report

Generated: 2026-05-15

## Summary

- Works imported: 10
- Source units imported: 12653
- Source lane: classic Tanakh commentary
- Source system: Sefaria API
- Accepted license: Public Domain only
- English translations imported: no
- New dictionary/definition sources imported: no
- Importer fix included: commentary refs with verse-level `next` links now traverse through the full commentary stream instead of importing only first-verse stubs.
- Largest lexical chunk: `data/lexical/ibn-ezra-on-zechariah-chunks/ibn-ezra-on-zechariah-001.json` (1624344 bytes)

## Imported Works

| Work | Units | License | Version/source | Lexical coverage | Page |
| --- | ---: | --- | --- | ---: | --- |
| Rashi on Genesis | 2017 | Public Domain | Pentateuch with Rashi's commentary by M. Rosenbaum and A.M. Silbermann, 1929-1934 / https://www.nli.org.il/he/books/NNL_ALEPH001969084 | 4994/14570 (34.3%) | tanakh/rashi-on-genesis/index.html |
| Rashi on Leviticus | 1332 | Public Domain | Pentateuch with Rashi's commentary by M. Rosenbaum and A.M. Silbermann, 1929-1934; On Your Way / https://www.nli.org.il/he/books/NNL_ALEPH001969084; http://mobile.tora.ws/ | 3359/9523 (35.3%) | tanakh/rashi-on-leviticus/index.html |
| Rashi on Numbers | 1292 | Public Domain | Pentateuch with Rashi's commentary by M. Rosenbaum and A.M. Silbermann -- corrected vocalization / https://www.nli.org.il/he/books/NNL_ALEPH001969084 | 3769/10778 (35.0%) | tanakh/rashi-on-numbers/index.html |
| Rashi on Deuteronomy | 1369 | Public Domain | Pentateuch with Rashi's commentary by M. Rosenbaum and A.M. Silbermann, 1929-1934; On Your Way / https://www.nli.org.il/he/books/NNL_ALEPH001969084; http://mobile.tora.ws/ | 3788/10519 (36.0%) | tanakh/rashi-on-deuteronomy/index.html |
| Ibn Ezra on Genesis | 1315 | Public Domain | Piotrkow, 1907-1911; On Your Way / https://www.nli.org.il/he/books/NNL_ALEPH990020973480205171/NLI; http://mobile.tora.ws/ | 2981/8896 (33.5%) | tanakh/ibn-ezra-on-genesis/index.html |
| Ibn Ezra on Exodus | 1652 | Public Domain | Piotrkow, 1907-1911 / https://www.nli.org.il/he/books/NNL_ALEPH990020973480205171/NLI | 3965/13374 (29.6%) | tanakh/ibn-ezra-on-exodus/index.html |
| Ibn Ezra on Leviticus | 1023 | Public Domain | On Your Way / http://mobile.tora.ws/ | 2144/5811 (36.9%) | tanakh/ibn-ezra-on-leviticus/index.html |
| Ibn Ezra on Numbers | 1107 | Public Domain | On Your Way / http://mobile.tora.ws/ | 2051/5377 (38.1%) | tanakh/ibn-ezra-on-numbers/index.html |
| Ibn Ezra on Deuteronomy | 1201 | Public Domain | On Your Way / http://mobile.tora.ws/ | 2377/6269 (37.9%) | tanakh/ibn-ezra-on-deuteronomy/index.html |
| Ibn Ezra on Zechariah | 345 | Public Domain | Ibn Ezra on Zecharia -- Daat / http://www.daat.ac.il/he-il/tanach/parshanut_hamikra/full-text/eben-ezra/zecharya | 1216/2593 (46.9%) | tanakh/ibn-ezra-on-zechariah/index.html |

## Skipped / Blocked

- Rashi on Exodus: skipped because the probed Hebrew version metadata reported `unknown` license.
- Rashi on Zechariah: skipped because the probed Hebrew version metadata reported `unknown` license.
- No CC-BY-NC or all-rights-reserved commentary versions were imported in this batch.

## Notes

- All imported units preserve unit-level version title, source URL, license, and Sefaria source URL metadata.
- Lexical HUD data was generated through the existing separated source layers only.
- No commentary-specific vocabulary table was authored in this pass; unresolved commentary vocabulary remains unresolved.
- Some imported works use more than one Public Domain Hebrew version across units; this is preserved at unit level rather than flattened.
- One Sefaria Ibn Ezra on Genesis payload labeled as Hebrew was skipped because it contained no Hebrew letters.
