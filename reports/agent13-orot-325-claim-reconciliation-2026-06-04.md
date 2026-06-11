# Agent 13 Orot 325-Row Claim Reconciliation

Date: 2026-06-04
Status: product/outcome reconciliation note only; 325 route closed after Spark-2 independent verification

## Finding

The `325`-row Orot package claim is not current package truth.

## Exact 325 Claim Path

- Claim artifact: `reports/spark5-plus-orot-continuation-2026-06-04f.md`
- Claim: `data/build/orot/reader-hint-placeholder-candidates.json` had `counts.placeholder_rows: 325` and `counts.placeholder_occurrences: 6110`
- Claimed support path: `reports/agent10-orot-next-missed-dictionary-cleared-append-2026-06-03.json`

## Pre-Append Supporting Artifact State

At the time of the 325-route reconciliation, `reports/agent10-orot-next-missed-dictionary-cleared-append-2026-06-03.json` reported:

- `rows_appended`: `50`
- `occurrences_appended`: `1193`
- `package_rows_after`: `113`
- `package_occurrences_after`: `4239`
- `commercial_clean_rows_after`: `83`
- `commercial_clean_occurrences_after`: `3851`
- `noncommercial_educational_rows_after`: `17`
- `display_integrity_rows_after`: `13`

At the time of the 325-route reconciliation, `data/build/orot/reader-hint-placeholder-candidates.json` reported:

- `placeholder_rows`: `113`
- `placeholder_occurrences`: `4239`
- `commercial_clean_rows`: `83`
- `commercial_clean_occurrences`: `3851`
- `noncommercial_educational_rows`: `17`
- `noncommercial_educational_occurrences`: `259`
- `display_integrity_tbd_rows`: `13`
- `display_integrity_tbd_occurrences`: `129`

Validator passed:

```powershell
node scripts/validate_agent10_orot_non_public_reader_hint_placeholder_package.mjs data/build/orot/reader-hint-placeholder-candidates.json
```

## Decision

The 325 route remains closed as stale/mismatched.

Treat the `325` claim as stale/mismatched. Spark-2 independent verification found no distinct source artifact plus validated package produced by existing scripts.

## Post-Append Current Anchor

After `reports/agent6-orot-14-row-nonpublic-add-candidate-verdict-2026-06-04.md` and `reports/agent10-orot-14-row-post-append-proof-2026-06-04.md/json`, Agent 13 UFM uses the current validated package basis:

- `127` rows / `4389` occurrences
- `97` commercial-clean rows / `4001` occurrences
- `17` noncommercial educational rows / `259` occurrences
- `13` display-integrity `TBD` rows / `129` occurrences

## UFM Impact

Agent 13 UFM is locked to the `127`-row / `4389`-occurrence basis until Agent 6 or Agent 1 returns another changed Orot authority boundary. No UFM package mutation, public/runtime mutation, route-shard edit, answer eligibility, accepted definition, accepted gloss, translation, or publication claim is allowed from this reconciliation note.

## Agent 8 Callback

Spark-2 returned independent mechanical verification: no distinct validated `325`-row package exists in current filesystem state. Keep UFM on the current `127`-row package basis.

## Not Accepted

No QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, or accepted text.
