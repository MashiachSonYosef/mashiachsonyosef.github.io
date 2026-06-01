# Route Publication Boundary Audit

Generated: 2026-06-01T05:22:08.543Z

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
- Answer-eligible translation-output unsafe source rows flagged: 21087
- Answer-eligible translation-output unsafe cards flagged: 17737
- Cards with publication-readiness fields: 0
- Issues: 0
- Warnings: 335103
- Manifest SHA-256: `558f99c398790c05c9e99593dd7552117f6b1b2936b4d0a7c4598a0dd75853a1`
- Validator SHA-256: `a2829d2ffcabeedcd207de77b4950cb7212397bc6ecb26e0f44bc01df9f9f813`
- Fixture cases checked: 12
- Fixture bytes: 17686
- Fixture SHA-256: `a557ac10e5bde145dc03122e9c7a4979e26b7bef4a26a559360b6ecc59a90de7`
- HUD contract: `data/definitions/hud-route-contract.json`
- Allowed display sections: answer, audit, biblical_paraphrase_evidence, citable_paraphrase_evidence, lemma, morphology, phrase_evidence, source_license, strict_aramaic, strict_hebrew, subphrase_evidence

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

## Display Sections

- citable_paraphrase_evidence: 200000
- phrase_evidence: 200000
- strict_hebrew: 118176
- lemma: 21485

## Answer Roles

- evidence: 402802
- form_reference: 118176
- answer: 18683

## Issues

None.

## Warning Contexts

Stored in reports/route-publication-boundary-audit.json with a capped sample of 25 warning context(s).
