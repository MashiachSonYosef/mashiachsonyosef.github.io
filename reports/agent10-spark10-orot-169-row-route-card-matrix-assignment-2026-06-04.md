# Agent 10 Spark-10 Orot 169-Row Route-Card Matrix Assignment

Status: `spark10_assignment_ready`

Queue item id: `spark10-orot-169-row-local-route-card-dedupe-source-route-matrix`

## Objective

Mechanically produce the release/package mechanics matrix for the `local_route_card_dedupe_review` bucket from the current Orot no-hit inventory packet.

This supports Orot corpus expansion after the Agent6-cleared `205` commercial-clean subset append. It does not create public/runtime/output/answer/definition/accepted-text behavior.

## Exact Inputs

- `reports/agent10-orot-186-row-nohit-inventory-packet-2026-06-04.json`
- `data/build/orot/reader-hint-placeholder-candidates.json`
- `reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json`
- `reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.json`

## Exact Commands

Run only:

```powershell
node scripts/build_agent10_orot_169_route_card_matrix.mjs
node scripts/validate_agent10_orot_non_public_reader_hint_placeholder_package.mjs data/build/orot/reader-hint-placeholder-candidates.json
node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync('reports/spark10-orot-169-row-local-route-card-dedupe-source-route-matrix-2026-06-04.json','utf8')); const issues=[]; const e=(c,m)=>{if(!c)issues.push(m)}; e(j.summary.rows===169,'rows'); e(j.summary.occurrences===2148,'occurrences'); e(j.summary.public_hud_rows_emitted===0,'public_hud'); e(j.summary.route_jsonl_rows_emitted===0,'route_jsonl'); e(j.summary.answer_rows_emitted===0,'answers'); if(issues.length){console.error(issues.join('\n')); process.exit(1)} console.log('169 route-card matrix assertions passed')"
git diff --check -- scripts/build_agent10_orot_169_route_card_matrix.mjs reports/spark10-orot-169-row-local-route-card-dedupe-source-route-matrix-2026-06-04.json reports/spark10-orot-169-row-local-route-card-dedupe-source-route-matrix-2026-06-04.md
```

## Expected Output

- `reports/spark10-orot-169-row-local-route-card-dedupe-source-route-matrix-2026-06-04.json`
- `reports/spark10-orot-169-row-local-route-card-dedupe-source-route-matrix-2026-06-04.md`

Required JSON shape:

- `schema_version`
- `artifact_type`
- `generated_at`
- `source_packet`
- `package_anchor`
- `summary`
- `rows`
- `zero_counts`
- `stop_condition`
- `highest_permissible_claim`
- `what_must_not_be_accepted`

Each row must preserve:

- `token_id`
- `surface`
- `normalized`
- `occurrences`
- `current_route_card_count`
- `current_candidate_count`
- `current_ambiguity_count`
- `current_dominant_failure_reason`
- `source_route_needed`
- `recommended_next_owner`
- `mutation_allowed_here=false`
- `public_emit_allowed_here=false`
- `answer_eligible_now=false`
- `definition_text_stored_now=false`

## Stop Condition

Stop after the 169-row matrix and validator/assertion/diff results, or exact `missing_pipeline_blocker` naming the missing input/command/output/schema.

## Forbidden Claims

No QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, accepted text, or public reader output.

## Agent 8 Callback

Status: Spark-10 is usable. Agent 10 is assigning Spark-10 the current release/package mechanics task for the 169-row local-route-card matrix instead of absorbing all mechanical work.

If Spark-10 does not return the expected artifacts, record exact blocker: `spark10_route_card_matrix_return_missing`.
