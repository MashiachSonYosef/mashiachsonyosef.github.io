# Agent 2 / Spark-2 Orot Missed Dictionary Reader-Hint Pipeline Contract

Date: 2026-06-04
Owner lane: Agent 2 / definition-lemma-reader-hint pipeline builder
Mode: BROAD_CORPUS_EXPANSION with OROT_PROTOTYPE_HARDENING first
Source order: `reports/oracle9-weekly-goal-mode-lexicon-expansion-order-2026-06-04.md`

## Status

`pipeline_runnable: true`

This contract defines the reusable Spark-2 runnable pipeline shape for Orot missed safe-dictionary reader-hint candidates. Agent 2 has supplied the named builder and validator scripts.

## Target

Produce a non-public reader-hint candidate packet for Orot missed safe-dictionary rows already identified by Oracle 9 / Agent 10 / Agent 2 evidence.

The first target subset is the missed safe dictionary lane for Orot. It must prefer previously identified safe/missed dictionaries before any broad discovery and must keep candidate rows non-authoritative.

## Inputs

- `reports/oracle9-weekly-goal-mode-lexicon-expansion-order-2026-06-04.md`
- `reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json`
- `data/public-hud/orot/reader-hints.json`
- `data/build/orot/reader-hint-placeholder-candidates.json`
- `reports/agent10-orot-license-safe-coverage-repair-add-candidates-2026-06-03.json`
- `reports/agent10-orot-next-missed-dictionary-placeholder-candidates-2026-06-03.json`
- `reports/agent10-orot-next-missed-dictionary-cleared-append-2026-06-03.json`
- `reports/agent6-orot-next-missed-dictionary-placeholder-candidates-verdict-2026-06-03.md`
- `reports/oracle9-owner-pulse-2026-06-03-0410Z.md`
- `reports/oracle9-owner-pulse-2026-06-03-1039Z.md`

## Command / Script

Required future builder:

```powershell
node scripts/build_agent2_orot_missed_dictionary_reader_hint_candidates.mjs --limit=50 --output=reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json --report=reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.md
```

Required future validator:

```powershell
node scripts/validate_agent2_orot_missed_dictionary_reader_hint_candidates.mjs reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json
```

Current blocker:

- None for script authorship.
- If the current run emits zero rows, that is a bounded closure result: all deterministic candidates from this input set are already public, packaged, or prior-candidate-consumed.

Reference-only existing Agent 10 scripts are not an Agent 2/Spark-2 runnable contract:

- `scripts/build_agent10_orot_next_missed_dictionary_placeholder_candidates.mjs`
- `scripts/validate_agent10_orot_next_missed_dictionary_placeholder_candidates.mjs`

## Output Schema

Top-level packet fields:

- `schema_version`: contract schema version.
- `artifact_type`: `agent2_orot_missed_dictionary_reader_hint_candidates`.
- `generated_at`: ISO timestamp.
- `generator`: Agent 2 script name and version.
- `boundary`: non-public, non-authoritative reader-hint candidate evidence only.
- `inputs`: exact input paths and content fingerprints where available.
- `selection`: deterministic subset constraints, including limit and missed-dictionary criteria.
- `summary`: row counts, occurrence counts, and counts by license/status bucket.
- `source_license_counts`: counts by `commercial_clean_candidate`, `noncommercial_educational_candidate`, `metadata_link_only`, `blocked`, and `unmatched`.
- `rows`: candidate rows.
- `outputs_now`: all public, answer, route, runtime, source, lexical, and token-index emissions must be zero.
- `what_must_not_be_accepted`: explicit non-acceptance claims.

Required row fields:

- `token_id`
- `headword`
- `occurrence_count`
- `work`
- `source_family`
- `source_ref`
- `license`
- `license_status`
- `candidate_label`
- `candidate_text_status`
- `selected_edge`
- `competing_edges`
- `evidence_paths`
- `answer_eligible`
- `promote_to_answer`
- `approved_for_public_emit`
- `public_hud_rows_emitted`
- `route_jsonl_rows_emitted`
- `route_shards_written`
- `blocker_to_answer_or_public_emit`

## Deterministic Transform Rule

Include only rows where all of the following are true:

- The token is already in Orot missed safe-dictionary evidence from Oracle 9 / Agent 10 / Agent 2 lineage.
- Source family and license flags are already present or can be inherited from Agent 1-reviewed family rules.
- Candidate text can be represented as non-authoritative reader-hint candidate text without manual semantic arbitration.
- Existing selected and competing edges remain preserved.
- `answer_eligible=false`, `promote_to_answer=false`, and `approved_for_public_emit=false`.

Exclude or block rows where any of the following are true:

- The row requires a new manual definition or semantic judgment.
- The row requires Kaikki/Wiktionary stored or displayed candidate text.
- The row is metadata-link-only.
- The row lacks source family or license status.
- The row would require public HUD, route JSONL, route shard, runtime, source, lexical payload, or token-index mutation.

## License Flags

Allowed package buckets:

- `commercial_clean_candidate`: public-domain or otherwise commercial-clean dictionary rows, including BDB, BDB Aramaic, Jastrow, or equivalent `PUBLIC_DOMAIN_OBSERVED` evidence.
- `noncommercial_educational_candidate`: NC educational rows, such as Klein / CC BY-NC lineage, only if labeled as NC, non-public, and not eligible for commercial/public export.
- `metadata_link_only`: rows that may preserve evidence references but cannot store or display candidate text.
- `blocked`: rows blocked by missing source, missing license, unsafe license, ambiguity, or transform boundary.
- `unmatched`: missed rows with no usable dictionary linkage in the current inputs.

Commercial export must remain false for NC rows. NC rows must not be collapsed into generic blocked rows if the correct row-scoped status is `noncommercial_educational_candidate`.

## Validator / Gate

Required validator behavior:

- Assert exact schema fields.
- Assert all answer/public/route/runtime/source/token-index mutation counters are false or zero.
- Assert all labels remain candidate labels and never `definition`, `accepted gloss`, `translation`, `answer`, `verified`, or `top match`.
- Assert selected and competing evidence are preserved where present.
- Assert all rows have source family and license status or are explicitly blocked.
- Assert no Kaikki/Wiktionary text is stored or displayed.
- Assert no metadata-only row is promoted into candidate text.
- Assert counts by license/status bucket and occurrence total.

Required gate command after the builder exists:

```powershell
node scripts/validate_agent2_orot_missed_dictionary_reader_hint_candidates.mjs reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.json
```

If the validator is missing in a future restored environment, Spark-2 must return:

`missing_pipeline_blocker: missing_agent2_owned_validator`

## Package Owner

- Contract owner: Agent 2.
- Mechanical runner: Spark-2, after the Agent2-owned builder and validator exist.
- Source/license row-family blocker owner: Agent 1, only if a row lacks family/status evidence.
- Boundary reviewer: Agent 6, after a concrete packet exists.
- Release consumer: Agent 10 first, then Agent 6 if Agent 10 routes the packet for boundary review.

## Agent 6 Boundary Question

Can the exact generated row/subset packet be treated as non-public reader-hint candidate evidence only, with zero answer eligibility, zero accepted gloss/text, zero Definition authority, zero public HUD output, zero route JSONL/shard writes, and preserved row-scoped source/license labels?

Agent 2 must not answer this boundary question.

## Stop Condition

Spark-2 may run because both Agent2-owned scripts exist:

- `scripts/build_agent2_orot_missed_dictionary_reader_hint_candidates.mjs`
- `scripts/validate_agent2_orot_missed_dictionary_reader_hint_candidates.mjs`

After the scripts exist, Spark-2 stops after producing one candidate artifact plus validator result, or after recording the exact missing input/output/schema blocker.

## Weekly Priority Linkage

This is priority 1 from Oracle 9 weekly goal mode. Later contracts remain blocked behind named worksets and should not be invented here:

- Deuteronomy reader-hint candidate pipeline.
- Larger Definition Workbench expansion pipeline beyond the 500-row sample.
- Unmatched/no-hint coverage pipeline by work/book.

## Non-Acceptance Boundary

This contract does not accept QA, source/provenance, license, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, or accepted text.

No public reader output, route shard edit, public/runtime mutation, source payload mutation, lexical payload mutation, or token-index mutation is authorized.
