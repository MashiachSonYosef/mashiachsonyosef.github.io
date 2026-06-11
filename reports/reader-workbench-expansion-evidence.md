# Reader Workbench Expansion Evidence

## 2026-06-01 Bounded Representative Target Set

- Scope: representative Reader Workbench evidence for the eight included targets in `data/control/reader_workbench_expansion_targets.json`.
- Status: evidence packet ready for Agent 6 review queue.
- Boundary: local-only Guided Gloss Assembly, `publication_status=not_a_translation`.
- Not claimed: publication readiness, accepted translation text, broad rollout, or acceptance of deferred pages.
- Render activity: no broad render or sitewide migration was run for this packet.

## Included Targets

- `tanakh/genesis/index.html`
- `tanakh/song-of-songs/index.html`
- `halakhah/yad-david-on-mishneh-torah-robbery-and-lost-property/index.html`
- `targum/targum-jonathan-on-genesis/index.html`
- `gra/yahel-ohr-on-zohar/index.html`
- `other/shem-tov-on-guide-for-the-perplexed/index.html`
- `chasidut/sefat-emet/index.html`
- `tanakh/zephaniah/index.html`

## Evidence

- `node --check scripts\validate_reader_workbench_expansion_targets.mjs` passed.
- `node scripts\validate_reader_workbench_expansion_targets.mjs` passed: 8 included targets, 5 deferred targets, 1 warning for missing included `tanakh_commentary` lane.
- `node --check scripts\validate_reader_workbench_expansion_sample.mjs` passed.
- `node scripts\validate_reader_workbench_expansion_sample.mjs` passed using non-Genesis target `song-of-songs`.
- `node scripts\validate_reader_workbench_runtime.mjs` passed.
- `node scripts\validate_reader_workbench_boundary.mjs` passed with 21 checks.
- `node scripts\validate_route_hud_page.mjs` passed for all 8 included pages.

## Non-Genesis Export / Import Sample

- Target: `tanakh/song-of-songs/index.html`.
- Source: `data/sources/song-of-songs.json`.
- Import count: 1.
- Export selection count: 1.
- Reimport count: 1.
- Preserved source fields: `source_name`, `source_id`, `source_url`, `license`, `license_url`.
- Preserved authority fields: `answer_eligible=true`, `answer_role=answer`, `publication_status=not_a_translation`.

## Known Risks

- Browser click proof is not included; this is static/runtime-source and VM import/export evidence.
- `tanakh_commentary` remains deferred because the selected commentary page lacks complete Reader Workbench controls.
- Deferred targets remain unaccepted.
- Publication remains `blocked_no_render`.
