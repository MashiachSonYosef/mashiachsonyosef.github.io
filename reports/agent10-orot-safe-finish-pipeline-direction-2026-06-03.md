# Agent 10 Orot Safe Finish Pipeline Direction - 2026-06-03

## Scope

Release-owner direction for finishing Orot safely using pipeline-generated data only.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, usage-as-definition authority, accepted text, or translation output.

## Current Live State

Live URL: `https://mashiachsonyosef.github.io/orot/`

Current public package:

- Reader hints: `39998` hinted occurrences in the live Stage A payload.
- Route HUD package: top-50 selected tokens.
- Public route keys: `62`.
- Shards: `53`.
- Cards: `2527`.
- Total route shard bytes: `6907604`.
- Max shard bytes: `349870`.
- Denylist scan total: `0`.
- Old-HUD marker scan total: `0`.

Latest live browser proof:

- Report: `reports/agent10-orot-stage-b-top50-live-browser-proof-2026-06-03.json`
- Status: `pass`.
- Packaged clicks tested: `4`.
- Route cards opened: `true`.
- Source/license rows present: `true`.
- Inline hints before click: `39980`.
- Inline hints after hard reload: `39980`.
- Old-path probes: `3` clean `Not Published` surfaces.
- Old-HUD marker hits: `0`.
- Poisoned-storage selected glosses: `0`.
- Runtime exceptions: `0`.
- Max live click time: `1085 ms`.

## Pipeline Inputs Collected

Agent 1 source/provenance sidecar:

- Report: `reports/agent1-orot-stage-c-source-unblock-plan-2026-06-03.md`.
- Direction: quarantine the four blocker rows now through the public export/package denylist.
- Do not try to clear them by plain lexical regeneration.
- Clearance requires a bounded pipeline rule change plus a new clearance validator.

Blocked rows kept denied:

- `lex-aph-h639`
- `lex-mashiach-h4899`
- `lex-ruach-h7307`
- `lex-yhwh-h3068`

Agent 2 route-data sidecar:

- Reports:
  - `reports/agent2-orot-stage-c-topn-feasibility-2026-06-03.json`
  - `reports/agent2-orot-stage-c-topn-feasibility-2026-06-03.md`
- Top-100 at default card cap is above the strict warning line.
- Top-250 at default card cap is blocked under the strict aggregate payload model.

Agent 4 runtime sidecar:

- Report: `reports/agent4-orot-stage-b-top50-proof-review-2026-06-03.md`.
- Decision: `sufficient_for_agent6_review_with_warnings`.
- The warnings around live proof, hard reload, old path probes, and inline hint counts were addressed by the strengthened live proof after that sidecar report.

## Cap Sweep Results

All rows below are dry-run only. They do not write public route package output.

| Package | Max cards/key | Public keys | Shards | Cards | Total bytes | Max shard | Denylist | Old HUD | Direction |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 100 | 30 | 126 | 101 | 3532 | 9559646 | 243127 | 0 | 0 | next safe candidate |
| 100 | 25 | 126 | 101 | 2975 | 7981871 | 220387 | 0 | 0 | smaller fallback |
| 250 | 25 | 342 | 252 | 7565 | 20264355 | 375596 | 0 | 0 | not next; needs review/design |
| 250 | 20 | 342 | 252 | 6164 | 16296901 | 299851 | 0 | 0 | not next; needs review/design |
| 250 | 15 | 342 | 252 | 6331 | 16750174 | 377062 | 0 | 0 | not next; preserve-existing effect makes this non-monotonic |

The non-monotonic top-250 cap-15 result is expected under the current builder because existing top-50 route keys are preserved with their already-published cards.

## Safe Finish Rule

Keep Orot moving by bounded promotion gates:

1. Keep top-50 live as the current validated-by-proof package.
2. Treat top-100 with `--max-cards-per-key 30` as the next package candidate.
3. Before publishing top-100 cap-30, generate the actual package, run the same local browser proof, then push only if denylist, old-HUD, payload, hard-refresh, old-path, poisoned-storage, and click proofs pass.
4. Do not publish top-250 until a payload-reduction design is chosen and proven.
5. Do not clear the four source blockers by regeneration. Keep them denied until Agent 1's pipeline clearance route exists.

## Exact Next Pipeline Command

Candidate next package dry-run or actual generation:

```powershell
node scripts\build_public_hud_route_package.mjs --work-id orot --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --top-n 100 --max-cards-per-key 30 --report reports\agent10-orot-stage-c-top100-cap30-route-package-proof-2026-06-03.json
```

Required proof after generation:

```powershell
node scripts\prove_orot_stage_b_browser_click.mjs --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --route-report reports\agent10-orot-stage-c-top100-cap30-route-package-proof-2026-06-03.json --report reports\agent10-orot-stage-c-top100-cap30-browser-proof-2026-06-03.json --screenshot reports\agent10-orot-stage-c-top100-cap30-browser-proof-2026-06-03.png
```

## Agent 8 Callback

Status: `top50_live_pass_top100_cap30_next_candidate`

Artifact path: `reports/agent10-orot-safe-finish-pipeline-direction-2026-06-03.md`

Selected next candidate: Orot top-100 route package with `--max-cards-per-key 30`.

Agent 1 needed: yes, completed source/provenance sidecar; outcome is quarantine now, clearance later.

Agent 2 needed: yes, completed top-N feasibility and cap sweep support.

Agent 4 needed: yes, completed review; later warnings addressed in strengthened Agent 10 live proof.

Agent 7/13 decision needed: not for current top-50 live state. Needed only if choosing to publish top-100 before Agent 6 disposition.

Next recommended executable route: generate and prove top-100 cap-30, or route current top-50 strengthened proof to Agent 6 for review.
