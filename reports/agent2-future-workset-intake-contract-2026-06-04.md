# Agent 2 Future Workset Intake Contract - 2026-06-04

## Status

Future Agent 2 workset intake gate is ready. Any new definition/lemma/reader-hint workset should pass this gate before Agent 2 or Spark-1 treats it as runnable.

## Validator

- Validator: `scripts/validate_agent2_future_workset_intake_packet.mjs`
- Fixture: `data/definitions/agent2-future-workset-intake-fixture.json`
- Command: `node scripts/validate_agent2_future_workset_intake_packet.mjs data/definitions/agent2-future-workset-intake-fixture.json`

## Required Shape

- `workset_id`
- `target_work_or_subset`
- `input_artifacts`
- `command_or_expected_script`
- `output_path`
- `output_schema`
- `validator_or_gate`
- `counts.rows`
- `counts.occurrences`
- `source_lane_fields`
- `agent6_boundary_question`
- `stop_condition`
- `zero_boundary`

## Source Lane Fields

- `source_family`
- `source_name`
- `license_label`
- `license_lane`
- `source_url_or_citation`
- `agent6_boundary_required`

## Boundary

No Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, publication readiness, source/license acceptance, QA acceptance, or NC commercial authorization is claimed.
