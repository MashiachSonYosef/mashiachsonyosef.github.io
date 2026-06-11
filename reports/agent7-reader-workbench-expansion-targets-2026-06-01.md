# Agent 7 Reader Workbench Expansion Target Packet

Generated: 2026-06-01T03:02:13-04:00

Supersession note, 2026-06-01T04:21:16-04:00: this packet established the target set. The missing non-Genesis export/import evidence now exists in `reports/reader-workbench-expansion-evidence.md`, and `data/control/agent6_validation_queue.json` carries the bounded expansion request as `queued_ready_for_agent6_recheck`. Do not use the older "do not request Agent 6 expansion signoff yet" line as current state.

## CEO Call

Continue toward representative Reader Workbench expansion evidence, not broad rollout.

Agent 6 has passed the narrow `tanakh/genesis` hardening boundary only. The next useful move is a bounded target set with named pages, tracked source custody, route-HUD validation, and one non-Genesis export/import sample before any new Agent 6 expansion request.

## Target Contract

- Target file: `data/control/reader_workbench_expansion_targets.json`
- Validator: `scripts/validate_reader_workbench_expansion_targets.mjs`
- Included targets: 8
- Deferred targets: 5

Included lanes:

- `tanakh_base`
- `tanakh_poetry_base`
- `tanakh_prophets_base`
- `halakhah_commentary`
- `aramaic_targum`
- `zohar_commentary`
- `jewish_thought_commentary`
- `chasidut`

Known gap:

- `tanakh_commentary` is not included because `tanakh/rashi-on-genesis/index.html` currently lacks the Reader Workbench import control marker. Keep it as an Agent 4 rerender candidate, not expansion-ready evidence.

## Checks Run

```text
node --check scripts\validate_reader_workbench_expansion_targets.mjs
node scripts\validate_reader_workbench_expansion_targets.mjs
node scripts\validate_reader_workbench_runtime.mjs
node scripts\validate_route_hud_page.mjs --page tanakh\genesis\index.html --page tanakh\song-of-songs\index.html --page halakhah\yad-david-on-mishneh-torah-robbery-and-lost-property\index.html --page targum\targum-jonathan-on-genesis\index.html
node scripts\validate_route_hud_page.mjs --page gra\yahel-ohr-on-zohar\index.html --page other\shem-tov-on-guide-for-the-perplexed\index.html --page chasidut\sefat-emet\index.html --page tanakh\zephaniah\index.html
```

Observed target validator output:

```json
{
  "included_targets": 8,
  "lanes": [
    "aramaic_targum",
    "chasidut",
    "halakhah_commentary",
    "jewish_thought_commentary",
    "tanakh_base",
    "tanakh_poetry_base",
    "tanakh_prophets_base",
    "zohar_commentary"
  ],
  "deferred_targets": 5,
  "warnings": [
    "representative lane not present in included targets: tanakh_commentary"
  ]
}
```

## Next Agent 5 / Agent 4 Action

Agent 5 should route Agent 4 non-interruptingly:

```text
Agent 4, use data/control/reader_workbench_expansion_targets.json as the bounded Reader Workbench representative expansion target set. Do not broad-render. Confirm or produce evidence only for the included target pages. Run scripts/validate_reader_workbench_expansion_targets.mjs, scripts/validate_reader_workbench_runtime.mjs, and route HUD page validation on each included page. Provide one non-Genesis export/import sample proving source_name, source_id, source_url, license, and license_url survive. Keep evidence-only cards disabled/non-authoritative and preserve publication_status=not_a_translation. Deferred pages, especially tanakh/rashi-on-genesis and halakhah/abudarham, are rerender candidates only; do not count them as expansion-ready until the validator passes. This is not publication, not accepted translation text, and not broad rollout acceptance.
```

## Agent 6 Boundary

Historical boundary at packet creation: Agent 6 expansion signoff was not ready until the non-Genesis export/import sample existed.

Current state after supersession: the non-Genesis `song-of-songs` sample exists in `reports/reader-workbench-expansion-evidence.md`, and the bounded eight-page expansion request is queued for Agent 6 as `queued_ready_for_agent6_recheck`.

Publication remains `blocked_no_render`.
