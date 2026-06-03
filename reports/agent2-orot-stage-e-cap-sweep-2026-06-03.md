# Agent 2 Orot Stage E Cap Sweep - 2026-06-03

## Scope

Pipeline-only feasibility sweep for expanding Orot Route HUD data beyond the live top-250 package.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, usage-as-definition authority, accepted text, or translation output.

## Gate

All candidates were generated with:

```powershell
node scripts\build_public_hud_route_package.mjs --work-id orot --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --replace-existing --dry-run
```

The active safety preference was:

- Keep denied source entries quarantined.
- Keep old-HUD marker output scan total at `0`.
- Prefer candidates below `52428800` total shard bytes and below `2097152` max shard bytes.
- Preserve all currently live top-250 route keys before deployment selection.

## Sweep Results

| Candidate | Selected tokens | Lookup candidates | Public keys | Shards | Cards | Total bytes | Max shard bytes | Truncated keys | Denylist hits | Old-HUD hits |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| top-500 cap-20 | 500 | 802 | 654 | 447 | 11352 | 30278278 | 313071 | 696 | 0 | 0 |
| top-500 cap-25 | 500 | 802 | 654 | 447 | 13878 | 37469723 | 396191 | 671 | 0 | 0 |
| top-1000 cap-15 | 1000 | 1627 | 1233 | 775 | 15567 | 40997689 | 303180 | 1396 | 0 | 0 |
| top-1000 cap-20 | 1000 | 1627 | 1233 | 775 | 19989 | 53633477 | 412416 | 1320 | 0 | 0 |
| top-1500 cap-10 | 1500 | 2485 | 1838 | 1055 | 15538 | 40038349 | 241502 | 2183 | 0 | 0 |
| top-1500 cap-15 | 1500 | 2485 | 1838 | 1055 | 21968 | 58583775 | 331272 | 2029 | 0 | 0 |
| top-2000 cap-10 | 2000 | 3408 | 2463 | 1331 | 20038 | 51592132 | 266943 | 2840 | 0 | 0 |
| top-3000 cap-5 | 3000 | 5279 | 3655 | 1779 | 15488 | 36091064 | 139902 | 4636 | 0 | 0 |
| top-5000 cap-3 | 5000 | 9373 | 5935 | 2470 | 15426 | 32330359 | 100854 | 7895 | 0 | 0 |
| top-5000 cap-5 | 5000 | 9373 | 5935 | 2470 | 23363 | 54130461 | 168640 | 7172 | 0 | 0 |
| top-10000 cap-2 | 8716 | 16348 | 9490 | 3182 | 17038 | 32848430 | 103147 | 14075 | 0 | 0 |
| top-10000 cap-3 | 8716 | 16348 | 9490 | 3182 | 23496 | 49245496 | 150072 | 12960 | 0 | 0 |

Machine reports:

- `reports/agent2-orot-stage-e-cap-sweep-top500-cap20-dry-run-2026-06-03.json`
- `reports/agent2-orot-stage-e-cap-sweep-top500-cap25-dry-run-2026-06-03.json`
- `reports/agent2-orot-stage-e-cap-sweep-top1000-cap15-dry-run-2026-06-03.json`
- `reports/agent2-orot-stage-e-cap-sweep-top1000-cap20-dry-run-2026-06-03.json`
- `reports/agent2-orot-stage-e-cap-sweep-top1500-cap10-dry-run-2026-06-03.json`
- `reports/agent2-orot-stage-e-cap-sweep-top1500-cap15-dry-run-2026-06-03.json`
- `reports/agent2-orot-stage-e-cap-sweep-top2000-cap10-dry-run-2026-06-03.json`
- `reports/agent2-orot-stage-e-cap-sweep-top3000-cap5-dry-run-2026-06-03.json`
- `reports/agent2-orot-stage-e-cap-sweep-top5000-cap3-dry-run-2026-06-03.json`
- `reports/agent2-orot-stage-e-cap-sweep-top5000-cap5-dry-run-2026-06-03.json`
- `reports/agent2-orot-stage-e-cap-sweep-top10000-cap2-dry-run-2026-06-03.json`
- `reports/agent2-orot-stage-e-cap-sweep-top10000-cap3-dry-run-2026-06-03.json`

## Recommendation

Recommended candidate: top-10000 cap-3.

Reason:

- It selects `8716` tokens, which equals all currently pipeline-selectable non-denied Orot hint tokens.
- The build report skips `6` denied source-blocked token IDs, so `8716 + 6 = 8722`, matching the Stage A hinted token count.
- It publishes `9490` route keys and `23496` route cards.
- It stays below `52428800` total shard bytes with `49245496`.
- It stays below `2097152` max shard bytes with `150072`.
- It has denylist output scan total `0`.
- It has old-HUD marker output scan total `0`.

Rejected or deferred candidates:

- top-1000 cap-20, top-1500 cap-15, top-2000 cap-10, and top-5000 cap-5 crossed the `52428800` total-byte preference.
- top-10000 cap-2 was safe but provided fewer cards per key than cap-3 with no coverage gain.

## Agent 8 Callback

Status: `cap_sweep_complete_candidate_selected`

Artifact path: `reports/agent2-orot-stage-e-cap-sweep-2026-06-03.md`

Selected candidate: Orot top-10000 cap-3.

Agent 1 needed: no new wake; denied source entries remain quarantined.

Agent 2 needed: completed by this sweep packet.

Agent 4 needed: after Agent 10 deploys or requests independent live browser proof.

Agent 7/13 decision needed: no hard decision needed for the bounded top-10000 cap-3 deploy candidate.

Next recommended executable route: Agent 10 package proof, deploy, live browser proof, then Agent 6/4 review if acceptance is needed.
