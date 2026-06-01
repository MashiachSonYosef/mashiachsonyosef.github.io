# HUD Route Release Gate

Generated: 2026-06-01T14:58:10.973Z
Status: pass_with_warnings
Release scope: public_lookup_integrity_passed_current_route_source_reconciliation_unproven
Release ID: hud-route-rc-2026-05-31T16-55-29-957Z

## Public Lookup

- Manifest: `data/definitions/hud-route-lookup/manifest.json`
- Cards: 539661
- Normalized tokens: 175216
- Shards: 7990
- Manifest shard path checks: 7990
- Invalid manifest shard paths: 0
- Duplicate manifest shard paths: 0
- Duplicate manifest shard IDs: 0
- Sample tokens checked: 6

## Route Publication Boundary

- Report: `reports/route-publication-boundary-audit.json`
- Generator: `scripts/validate_route_publication_boundary.mjs`
- Validator SHA-256: `c6c60f42c27b57098e1340e077ec80db1a4c933e674213464eb382a53af55781`
- Manifest SHA-256: `558f99c398790c05c9e99593dd7552117f6b1b2936b4d0a7c4598a0dd75853a1`
- HUD contract: `data/definitions/hud-route-contract.json`
- Allowed display sections: answer, audit, biblical_paraphrase_evidence, citable_paraphrase_evidence, lemma, morphology, phrase_evidence, source_license, strict_aramaic, strict_hebrew, subphrase_evidence
- Boundary issues: 0
- Boundary warnings: 335103
- Fixture: `data/definitions/route-publication-boundary-fixtures.json`
- Fixture cases: 35
- Fixture SHA-256: `6f7a6e19a22a347fce1f7538ce3573098732dd1989e5abd3d4c93612df7e4e80`
- Manifest shard path checks: 7990
- Invalid manifest shard paths: 0
- Duplicate manifest shard paths: 0
- Duplicate manifest shard IDs: 0
- Shard identity checks: 7990
- Shard identity mismatches: 0
- Shard count fields checked: 31960
- Shard count field mismatches: 0
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
- Source-row string fields checked: 5829544
- Duplicate source IDs within route cards: 0
- Invalid source-row string fields: 0
- Source-row fields_used entries checked: 3185347
- Invalid source-row fields_used entries: 0
- Fields_used exclusion entries checked: 3185347
- Forbidden fields_used entries: 0
- Source family checks: 832792
- Invalid source family values: 0
- Source-row notes checked: 832792
- Forbidden source-row notes: 0
- Reference URL fields checked: 1665584
- Invalid reference URL fields: 0
- Source URL compatibility checks: 832792
- Invalid source URL compatibility rows: 0
- License URL compatibility checks: 832792
- Invalid license URL compatibility rows: 0
- Answer-eligible cards with numeric answer score: 18683
- Answer-eligible cards missing numeric answer score: 0
- Cards with answer role: 18683
- Cards with answer role but not answer-eligible: 0
- Form-reference cards: 118176
- Invalid form-reference cards: 0
- Form-reference tag entries checked: 407922
- Invalid form-reference tag entries: 0
- Answer-eligible unsafe sample cards: 25
- Translation-output unsafe cards flagged: 335103
- Answer-eligible translation-output unsafe source rows flagged: 21087
- Answer-eligible translation-output unsafe cards flagged: 17737

## Route Input Freeze Drift

- Report: `reports/hud-route-input-freeze-drift.md`
- Status: drift
- Drift items: 2
- source-phrase-evidence.jsonl: current source differs from frozen release input
- source-citable-paraphrase-evidence.jsonl: current source differs from frozen release input

## Boundary

- Publication status: `blocked_no_render`
- Validates: hud_route_lookup_integrity, route_card_publication_boundary
- Does not clear: translation_output, source_publication, public_lexical_export_reuse, accepted_definition_authority
- Answer eligibility scope: hud_answer_slot_only_not_translation_or_publication_readiness
- Warning status blocks publication claim: true
- Current route sources reconciled: false
- This gate validates HUD route lookup integrity and the route-card/publication boundary only.
- It does not clear translation output, source publication, public lexical export reuse, or accepted definition authority.
- A warning status means current route-source reconciliation is not proven for the frozen public lookup release.
- Publication remains blocked_no_render.

## Issues

- None

## Warnings

- skipped live current route source drift hash check; using the drift report snapshot only
- route input freeze drift report shows current route inputs differ from the frozen release inputs
