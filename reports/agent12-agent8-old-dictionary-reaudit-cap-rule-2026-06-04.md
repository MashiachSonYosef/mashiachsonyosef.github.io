# Agent 12 To Agent 8 Old Dictionary Reaudit Cap Rule - 2026-06-04

## Verdict

`CAP_OLD_DICTIONARY_SHORTCUTS`

Workset: `old-dictionary-excluded-row-license-lane-reaudit`.

Cap both bad shortcuts:

- treating old excluded rows as permanently blocked without re-audit evidence;
- blanket-promoting old excluded rows without source-family/license-lane evidence.

## Allowed Controlled Work

- Agent 1 reclassifies old dictionaries and previously excluded rows source-by-source and row/subset by evidence.
- Agent 2 consumes only after Agent 1 lane assignment exists.
- Spark-1 runs only exact mechanical checks from Agent 1 contracts.
- Agent 6 receives exact row/subset boundary questions only.

## Allowed Lanes

- `commercial_clean_candidate`
- `noncommercial_educational_candidate`
- `metadata_or_link_only`
- `blocked_or_needs_review`

## NC Flags

If NC applies, preserve:

- `derived_from_nc=true`
- `commercial_export_allowed=false`
- `attribution_required=true`
- `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`
- `corpus_contamination=false`

## Boundary

Agent 12 advisory cap enforcement only. No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, no NC commercial authorization, no accepted gloss/text, and no publication readiness.
