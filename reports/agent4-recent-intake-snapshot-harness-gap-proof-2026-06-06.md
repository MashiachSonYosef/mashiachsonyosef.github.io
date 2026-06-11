# Agent 4 Recent-Intake Snapshot Harness Gap Proof

Target: bounded recent-intake snapshot mechanics for the Agent 4 validator/prereq lane.

Changed input/artifact: `reports/agent4-changed-input-selection-continuation-2026-06-06.json`

Commands:

- `node scripts\validate_agent4_changed_input_candidate_selection.mjs --input=reports\agent4-changed-input-selection-continuation-2026-06-06.json` with timeout `60000`: passed.
- `node scripts\validate_agent4_validator_prereq_packet.mjs --input=reports\agent4-changed-input-selection-continuation-2026-06-06.json` with timeout `60000`: passed.
- `node scripts\build_agent4_recent_intake_snapshot.mjs --out=reports\agent4-recent-intake-snapshot-2026-06-06.json --limit=25 --roots=reports,data/control` with timeout `30000`: passed.
- `node scripts\validate_agent4_recent_intake_snapshot.mjs --input=reports\agent4-recent-intake-snapshot-2026-06-06.json` with timeout `60000`: passed.

Counts:

- Selector candidates: `0`
- Selector newer files: `25`
- Snapshot rows: `25`
- Snapshot candidate-like rows: `0`
- Snapshot roots: `reports`, `data/control`

Process timeout recorded:

- `Get-ChildItem reports -File | Sort-Object LastWriteTime -Descending | Select-Object -First 20 Name,LastWriteTime,Length` timed out at `30000` ms with partial table output and no durable artifact.

Harness gap closed:

- Added `scripts/build_agent4_recent_intake_snapshot.mjs`.
- Added `scripts/validate_agent4_recent_intake_snapshot.mjs`.
- The helper suppresses already-packaged upstream inputs so it does not create false changed-input churn.

Exact blockers:

- `changed_package_input_missing`: no fresh changed/candidate package input was selected after the latest Agent 4 anchor.
- `no_acceptance_from_harness_snapshot`: the bounded snapshot is intake mechanics only and does not validate package contents.

Handoff owner: Agent 10 or upstream package-producing agent for the next changed/candidate artifact; Agent 4 owns the validator/prereq packet once a changed input exists.

Stop condition: stop after validating the changed-input blocker, producing and validating the bounded recent-intake snapshot, and validating the JSON proof packet.

Non-acceptance boundary: no QA acceptance, public/runtime acceptance, source/provenance/license/legal acceptance, Definition authority, publication readiness, product/data acceptance, answer acceptance, accepted gloss/text, or release action is claimed.
