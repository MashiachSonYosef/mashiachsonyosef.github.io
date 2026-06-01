# Route Publication Boundary Audit

Generated: 2026-06-01T01:32:29.519Z

## Boundary

- `answer_eligible` means the route card can be considered for the HUD answer slot.
- `answer_eligible` is not accepted translation-output readiness.
- Publication readiness must come from a later renderer/translation gate, not from this route lookup.

## Counts

- Shards scanned: 7990
- Tokens scanned: 175216
- Cards scanned: 539661
- Answer-eligible cards: 18683
- Answer-eligible cards with source rows: 18683
- Source rows checked: 832792
- HUD-unsafe source rows: 0
- Translation-output unsafe source rows flagged: 382775
- Translation-output unsafe cards flagged: 335103
- Answer-eligible translation-output unsafe cards flagged: 17737
- Cards with publication-readiness fields: 0
- Issues: 0
- Warnings: 335103
- Fixture cases checked: 5
- Fixture bytes: 6195
- Fixture SHA-256: `8248a250aa5527d1522e91c93eb50d4e27732e0461f24f72f6658b07c403e450`

## Unsafe For Accepted Translation Output

These rows may still be valid HUD route evidence, but they are not automatically safe as accepted translation-output support without downstream attribution/license handling.

- CC BY-SA 4.0 / GFDL: 294549
- CC BY 4.0: 88226

## Answer-Eligible Unsafe For Accepted Translation Output

These are answer-slot candidates whose source rows remain HUD-safe but require downstream attribution/license handling before use as accepted translation-output support.

- CC BY-SA 4.0 / GFDL: 14206
- CC BY 4.0: 6881

## Route Families

- citable_paraphrase_evidence: 200000
- source_phrase_evidence: 200000
- wiktionary_definition: 135184
- openscriptures_definition: 3531
- wikidata_definition: 771
- project_lexical: 175

## Issues

None.

## Warning Contexts

Stored in reports/route-publication-boundary-audit.json with a capped sample of 25 warning context(s).
