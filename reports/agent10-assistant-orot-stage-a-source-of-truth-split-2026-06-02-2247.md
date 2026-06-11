# Agent 10 Assistant Orot Stage A Source-Of-Truth Split

Generated: 2026-06-02T22:47:17-04:00
Agent lane: Agent 10 assistant / auxiliary Orot fill support
Workspace: `C:\Users\owner\Documents\translations`

## Status

Evidence-ready support packet only.

This packet verifies that the Orot Stage A reader-hint proof exists on `origin/main` and in the deploy-copy, and that the live `reader-hints.json` matches that proof output by SHA-256. It also records the remaining operational blocker: the current local `HEAD` and working tree are behind the source-of-truth branch and do not contain the Orot public-HUD package or reader-hint generator.

This does not claim QA acceptance, source/provenance custody, source/provenance acceptance, source publication, source-file tracking approval, public/runtime acceptance, publication readiness, route publication support, Definition authority, product/data acceptance, usage-as-definition authority, translation output, accepted gloss, or accepted translation text.

## Inputs Checked

- `.codex-tmp/hud-deploy-live/scripts/build_public_hud_reader_hints.mjs`
- `.codex-tmp/hud-deploy-live/data/public-hud/orot/reader-hints.json`
- `.codex-tmp/hud-deploy-live/reports/agent10-orot-stage-a-reader-hints-proof-2026-06-03.json`
- `.codex-tmp/hud-deploy-live/reports/agent10-orot-stage-a-reader-hints-proof-2026-06-03.md`
- `origin/main:scripts/build_public_hud_reader_hints.mjs`
- `origin/main:data/public-hud/orot/reader-hints.json`
- `origin/main:reports/agent10-orot-stage-a-reader-hints-proof-2026-06-03.json`
- live `https://mashiachsonyosef.github.io/data/public-hud/orot/reader-hints.json?cb=agent10-assistant-verify-20260602-2244`

## Verified Alignment

Orot Stage A reader-hints payload:

- deploy-copy bytes: `6,049,122`
- deploy-copy SHA-256: `96df95b7f5db162e44a7bc8fafcfda0c137e82d1110c261154a7975219529a83`
- `origin/main` bytes: `6,049,122`
- `origin/main` SHA-256: `96df95b7f5db162e44a7bc8fafcfda0c137e82d1110c261154a7975219529a83`
- live HTTP status: `200`
- live bytes: `6,049,122`
- live SHA-256: `96df95b7f5db162e44a7bc8fafcfda0c137e82d1110c261154a7975219529a83`
- live `Last-Modified`: `Wed, 03 Jun 2026 02:21:27 GMT`

Interpretation: the deploy-copy, `origin/main`, and live Orot `reader-hints.json` are byte-identical for this checkpoint.

## Proof Artifact Check

Deploy-copy generator and proof:

- `.codex-tmp/hud-deploy-live/scripts/build_public_hud_reader_hints.mjs`: `25,384` bytes, SHA-256 `ec3de348675a56e866ba027818b055931b3f5f93d50d9d3eade350df914dbda6`
- `.codex-tmp/hud-deploy-live/reports/agent10-orot-stage-a-reader-hints-proof-2026-06-03.json`: `16,950` bytes, SHA-256 `6744db7348249ab8c698ee80fdc448e4f9e45255ea17f9b12c2ab4aa98b05737`
- `.codex-tmp/hud-deploy-live/reports/agent10-orot-stage-a-reader-hints-proof-2026-06-03.md`: `4,762` bytes, SHA-256 `0af8f2276550c1ef8024b3148436f155e325d03b2c460cb9acf9dcce5fd72ad7`

`origin/main` proof summary:

- `reports/agent10-orot-stage-a-reader-hints-proof-2026-06-03.json` bytes: `16,327`
- `reports/agent10-orot-stage-a-reader-hints-proof-2026-06-03.json` SHA-256: `a8ed8332b7eab8fa98932655b978a938a8a5dfee414aaa073e0047ae0d141ccd`
- recorded output SHA-256: `96df95b7f5db162e44a7bc8fafcfda0c137e82d1110c261154a7975219529a83`
- final hint count: `8,722`
- denylist output scan total: `0`
- skipped denied-token candidates: `13`
- existing hints with denied lexicon entry: `6`

Interpretation: the proof artifacts differ in byte hash between deploy-copy and `origin/main`, but both record the same public reader-hints output hash. The byte difference is report serialization/content drift, not reader-hints payload drift, based on the matching `output_sha256`.

## Reader Boundary Check

Parsed `reader-hints.json` top-level keys:

- `schema_version`
- `work_id`
- `generated_at`
- `hint_policy`
- `basis`
- `counts`
- `hints`

Reader-hint rows:

- row count: `8,722`
- rows missing `source_id`, `source_url`, `license`, or `license_url`: `0`
- rows not marked `candidate_status: candidate_not_authority`: `0`
- rows not marked `status: reader_hint_not_translation`: `0`

Machine-boundary warning:

- top-level `publication_status` is missing
- top-level `reader_surface_policy` is missing

Interpretation: row-level candidate/not-translation fields are present and clean in this checkpoint, but the top-level machine-checkable reader-surface boundary remains weaker than the preferred contract recorded in prior Agent 10 assistant preflight evidence.

## Local Split / Operational Blocker

Current local branch relation:

- `origin/main...HEAD` = `10 119`
- latest local commit: `28dfb9eec (HEAD -> main) Reject local HUD lookup authority overclaims`

Files present on `origin/main` but absent from local `HEAD` / working tree at this checkpoint:

- `scripts/build_public_hud_reader_hints.mjs`
- `data/public-hud/orot/manifest.json`
- `data/public-hud/orot/reader-hints.json`
- `reports/agent10-orot-stage-a-reader-hints-proof-2026-06-03.json`
- `reports/agent10-orot-stage-a-reader-hints-proof-2026-06-03.md`

Operational blocker:

- Agent 10 assistant cannot treat the current local working tree as the Orot Stage A source of truth until Agent 7/Agent 10 decides how to reconcile the `behind=10 ahead=119` split. Pulling, merging, staging, committing, or replacing the local tree was not performed.

## Commands Run

- `scripts\run_agent10_it_pulse_scheduled.cmd`
- `git rev-list --left-right --count origin/main...HEAD`
- `git log --oneline --decorate -1`
- `git diff --name-status HEAD..origin/main -- scripts/build_public_hud_reader_hints.mjs reports/agent10-orot-stage-a-reader-hints-proof-2026-06-03.json reports/agent10-orot-stage-a-reader-hints-proof-2026-06-03.md data/public-hud/orot/reader-hints.json data/public-hud/orot/manifest.json`
- `git show origin/main:data/public-hud/orot/reader-hints.json`
- `git show origin/main:reports/agent10-orot-stage-a-reader-hints-proof-2026-06-03.json`
- `Invoke-WebRequest -UseBasicParsing https://mashiachsonyosef.github.io/data/public-hud/orot/reader-hints.json?cb=agent10-assistant-verify-20260602-2244`

## Files Produced By This Assistant Checkpoint

- `reports/agent10-assistant-orot-stage-a-source-of-truth-split-2026-06-02-2247.md`

## Not Accepted

- QA acceptance
- source/provenance custody
- source/provenance acceptance
- source publication
- source-file tracking approval
- public/runtime acceptance
- publication readiness
- route publication support
- Definition authority
- product/data acceptance
- usage-as-definition authority
- translation output
- accepted gloss
- accepted translation text
- CDN/cache closure
- broad rollout

## Agent 8 Callback

- status: Agent 10 assistant verified Orot Stage A reader-hints payload alignment across deploy-copy, `origin/main`, and live URL; local source-of-truth split remains
- artifact: `reports/agent10-assistant-orot-stage-a-source-of-truth-split-2026-06-02-2247.md`
- blockers: current local `HEAD` / working tree lacks `scripts/build_public_hud_reader_hints.mjs`, `data/public-hud/orot/**`, and the `origin/main` Stage A proof artifacts; branch remains `behind=10 ahead=119`; top-level reader-boundary fields remain missing from the payload
- next action needed: Agent 7/Agent 10 decide whether and how to reconcile local branch drift before any local Orot Stage A handoff or further Stage B work; if proceeding, preserve non-acceptance boundaries and add/retain top-level `publication_status` and `reader_surface_policy`
- continue condition: continue Agent 10 auxiliary support only; do not accept source/provenance, QA, public/runtime, route-publication, Definition, product/data, usage-as-definition, translation, or publication claims
