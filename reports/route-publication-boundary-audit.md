# Route Publication Boundary Audit

Generated: 2026-06-01T07:36:21.592Z

## Boundary

- `answer_eligible` means the route card can be considered for the HUD answer slot.
- `answer_eligible` is not accepted translation-output readiness.
- Publication readiness must come from a later renderer/translation gate, not from this route lookup.

## Counts

- Shards scanned: 7990
- Manifest shard path checks: 7990
- Invalid manifest shard paths: 0
- Duplicate manifest shard paths: 0
- Duplicate manifest shard IDs: 0
- Shard identity checks: 7990
- Shard identity mismatches: 0
- Shard count fields checked: 31960
- Shard count field mismatches: 0
- Tokens scanned: 175216
- Cards scanned: 539661
- Card IDs checked: 539661
- Duplicate card IDs: 0
- Normalized lookup key checks: 539661
- Normalized lookup key mismatches: 0
- Route-card string fields checked: 5396610
- Invalid route-card string fields: 0
- Route score fields checked: 2158644
- Invalid route score fields: 0
- Route score formula checks: 539661
- Invalid route score formulas: 0
- Cards with source rows: 539661
- Cards missing source rows: 0
- Cards with duplicate source IDs: 0
- Answer-eligible cards: 18683
- Answer-eligible cards with source rows: 18683
- Answer-eligible cards with numeric answer score: 18683
- Answer-eligible cards missing numeric answer score: 0
- Cards with answer role: 18683
- Cards with answer role but not answer-eligible: 0
- Form-reference cards: 118176
- Invalid form-reference cards: 0
- Form-reference tag entries checked: 407922
- Invalid form-reference tag entries: 0
- Source rows checked: 832792
- Duplicate source IDs within route cards: 0
- Source-row string fields checked: 5829544
- Invalid source-row string fields: 0
- Source-row fields_used entries checked: 3185347
- Invalid source-row fields_used entries: 0
- Fields_used exclusion entries checked: 3185347
- Forbidden fields_used entries: 0
- Reference URL fields checked: 1665584
- Invalid reference URL fields: 0
- License URL compatibility checks: 832792
- Invalid license URL compatibility rows: 0
- HUD-unsafe source rows: 0
- Translation-output unsafe source rows flagged: 382775
- Translation-output unsafe cards flagged: 335103
- Answer-eligible translation-output unsafe source rows flagged: 21087
- Answer-eligible translation-output unsafe cards flagged: 17737
- Cards with publication-readiness fields: 0
- Issues: 0
- Warnings: 335103
- Manifest SHA-256: `558f99c398790c05c9e99593dd7552117f6b1b2936b4d0a7c4598a0dd75853a1`
- Validator SHA-256: `c0266fa7b97353465951dc37dd6ffe4f0517e74da9846fafe1f3a13eab2c7827`
- Fixture cases checked: 32
- Fixture bytes: 54244
- Fixture SHA-256: `837d31a718baea309ed89442cd7bd415040302b2d9484d03be861c5ee4650ba6`
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

## Answer-Eligible Unsafe Samples

Stored in reports/route-publication-boundary-audit.json with 25 capped sample card(s).

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

## Answer-Eligible Route Families

- wiktionary_definition: 14206
- openscriptures_definition: 3531
- wikidata_definition: 771
- project_lexical: 175

## Answer-Eligible Route Types

- lemma: 18683

## Answer-Eligible Display Sections

- lemma: 18683

## Answer-Eligible Match Types

- lemma: 18683

## Issues

None.

## Warning Contexts

Stored in reports/route-publication-boundary-audit.json with a capped sample of 25 warning context(s).
