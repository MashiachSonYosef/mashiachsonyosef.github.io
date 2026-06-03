# Agent 10 Orot Fill Expansion Plan - 2026-06-03

## Scope

Release-owner plan for filling in the live Orot flagship surface as far as existing pipeline tools can safely support.

This packet does not claim QA acceptance, validated runtime acceptance, source/provenance custody acceptance, publication readiness, Definition authority, usage-as-definition authority, translation output, or accepted translation text.

## Current Public Orot Fill

- Occurrence tokens: 59,806
- Unique token IDs: 17,307
- Public pre-click reader hints: 5,720 token IDs
- Public pre-click reader hint occurrences: 33,151
- Public pre-click unique-token coverage: 33.1%
- Public pre-click occurrence coverage: 55.4%
- Public click-time route coverage: 1 bounded sentinel token/shard
- Old HUD exposure target: 0

Conclusion: Orot is live and useful, but it is not complete. It is a bounded flagship surface with broad inline hints and only sentinel click-time HUD coverage.

## Pipeline Fill Findings

Existing current route data can already support more inline reader hints if the public hint builder uses the same bounded lookup-candidate behavior as the current HUD runtime.

- Exact current route answer coverage: 5,720 token IDs / 33,151 occurrences
- Lookup-candidate route answer coverage: 10,704 token IDs / 45,687 occurrences
- Immediate pipeline-only inline-hint gain available: 4,984 token IDs / 12,536 occurrences
- Remaining pipeline definition/route gaps: 6,603 token IDs / 14,119 occurrences

The immediate gain should be treated as reader hints only:

- candidate, not authority
- reader convenience, not accepted translation
- evidence pointer, not Definition acceptance

## Click-Time HUD Size Risk

Publishing every available Orot route shard directly is large:

- Exact-key filtered route shard estimate: 3,367 shards / 398.23 MiB
- Lookup-candidate filtered route shard estimate: 4,031 shards / 488.20 MiB

Conclusion: full click-time coverage should not be pushed blindly into the lightweight public artifact. Use a bounded top-N route-shard package first, then let Agent 4 gate runtime and payload behavior.

## Recommended Pipeline-Only Path

### Stage A - Expand Inline Reader Hints

Use existing current-HUD route data and lookup-candidate rules to regenerate `data/public-hud/orot/reader-hints.json`.

Target:

- increase public pre-click hints from 5,720 token IDs toward 10,704 token IDs
- increase visible hint occurrences from 33,151 toward 45,687
- do not hand-author any English text
- keep each hint marked as candidate/readability evidence, not accepted text

Required gates:

- route answer safety validation
- old-HUD marker scan
- browser proof for Orot root and Orot page
- poisoned query/localStorage proof remains current-HUD/no accepted-translation wording

### Stage B - Add Bounded Click-Time Route Shards

Do not publish the 398-488 MiB full package now. Instead, build a small top-N public route package for highest-frequency already-fillable Orot tokens.

Candidate top fillable tokens include high-frequency missing-public-hint IDs such as:

- `tok-f7199bc62ed1`
- `tok-6f3c380a7be9`
- `tok-bff9af2524d1`
- `tok-b495f46dc5c6`
- `tok-dfcf4cc0af67`
- `tok-35bce35c1de4`
- `tok-7e164a247efb`

Target:

- top 50 first if payload risk is unknown
- top 100 or top 250 only after Agent 4 confirms runtime behavior
- blank HUD/no route for non-packaged tokens remains acceptable

Required gates:

- route manifest loads only from `/data/public-hud/orot/**`
- route shard byte budget recorded
- visible route cards and source/license rows present for sampled top-N tokens
- old HUD absent from page, HUD text, runtime HTML, and old-path probes

### Stage C - Fill True Pipeline Gaps

The remaining 6,603 token IDs require upstream pipeline work, not manual glossary work.

Pipeline surfaces to use:

- `scripts/build_definition_routes.mjs`
- `scripts/build_definition_gap_queue.mjs`
- `scripts/build_hud_route_lookup.mjs`
- `scripts/validate_route_answer_safety.mjs`
- `scripts/validate_public_hud_route_lookup.mjs`
- `scripts/validate_public_hud_route_cards.mjs`
- `scripts/validate_public_hud_normalized_keys.mjs`

Agent 2 owns the definition-route diagnosis and gap queue. Agent 10 should only publish data after the pipeline emits validated route/hint artifacts.

### Stage D - Source Row Closure

Agent 1 should focus only on source/provenance/license evidence for rows that already appear in the pipeline output.

Known warning rows from the Orot flagship packet:

- `lex-aph-h639`
- `lex-mashiach-h4899`
- `lex-ruach-h7307`
- `lex-yhwh-h3068`

Agent 1 should not approve publication or definitions. Agent 1 should return source-row evidence, warning, or blocker.

## Agent 1 Work Order

Goal: support Orot fill by clearing or documenting source/provenance/license evidence for current-HUD rows used by Orot.

Tasks:

- inspect only pipeline-generated Orot public-HUD/source-row evidence
- investigate the four known incomplete lexical citation rows
- identify whether any row is a source/provenance/licensing blocker for expanding Orot hints or bounded top-N route shards
- produce `reports/agent1-orot-fill-source-row-evidence-2026-06-03.md` or exact blocker

Forbidden:

- no source custody acceptance
- no publication acceptance
- no Definition authority
- no manual text generation

## Agent 2 Work Order

Goal: increase Orot fill only through definition-route pipeline tools.

Tasks:

- confirm why lookup-candidate behavior can raise inline hints from 5,720 to about 10,704 token IDs
- produce the safest pipeline command path for Stage A reader-hint regeneration
- produce a top-N route-shard recommendation for Stage B
- use gap-queue/route builders to classify the 6,603 remaining token IDs
- produce `reports/agent2-orot-definition-fill-plan-2026-06-03.md` or exact blocker

Forbidden:

- no accepted glosses
- no manual definitions
- no usage-as-definition authority
- no broad corpus route rebuild unless it is the existing pipeline-required input and bounded by current tool behavior

## Agent 4 Work Order

Goal: gate runtime and payload risk for Orot fill expansion.

Tasks:

- define browser proof for Stage A expanded inline hints
- define browser proof for Stage B bounded top-N route shards
- set a payload/performance warning threshold for top 50 / top 100 / top 250 route shard packages
- verify hard refresh, poisoned query/localStorage, and old-path probes remain current-HUD/no-old-HUD
- produce `reports/agent4-orot-fill-runtime-gate-2026-06-03.md` or exact blocker

Forbidden:

- no QA acceptance
- no publication readiness
- no source/provenance acceptance
- no broad validation loop

## Agent 10 Recommendation

Proceed in this order:

1. Stage A: regenerate expanded Orot reader hints from existing current route data, using pipeline tools/rules only.
2. Stage A browser proof and old-HUD guard.
3. Stage B: build a bounded top-50 route shard package for highest-frequency fillable Orot tokens.
4. Agent 4 runtime gate.
5. Increase top-N only after runtime proof.
6. Route remaining true gaps to Agent 2 pipeline gap work.

Highest safe immediate claim: Orot can likely be expanded from 5,720 to about 10,704 hinted token IDs using existing pipeline data, without making semantic acceptance claims.

## Not Accepted

- QA acceptance
- Validated public/runtime acceptance
- Publication readiness
- Source/provenance custody acceptance
- Source publication
- Source-file tracking approval
- CDN/cache closure
- Broad rollout
- Product/data acceptance
- Route publication support
- Definition authority
- Usage-as-definition authority
- Translation output
- Accepted translation text
