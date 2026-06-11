# A10 -> A14 Repo Cleanup / Crossmatch Sidecar Packet - 2026-06-10

status: sidecar_support_ready_current_dirty_state_reduced_no_deletions
current_head: 2a22fbbaa
generated_at: 2026-06-11T01:05:43.210Z

## Current Dirty Counts
- dirty paths: 268
- tracked deletions: 0
- tracked data deletions: 0

## By Bucket
- lexical_generated_data: 182
- source_license_data: 29
- overlay_exports: 23
- definition_route_data: 19
- other_data: 4
- root_library_surface: 2
- other: 2
- reports_evidence: 2
- scripts_validators_builders: 2
- crossmatch_data: 1
- preview_support_surface: 1
- corpus_page: 1

## High-Risk A10 Reads
### data/lexical/crossmatches/daniel.json
- bucket: crossmatch_data
- A10 read: generated_at-only dirty diff; evidence/navigation only; no preHUD promotion authority
- validator: JSON parse passed
- proposed action: defer or stage only with generated_at-only cleanup decision from A14

### rav-kook/orot-ha-kodesh/index.html
- bucket: corpus_page
- A10 read: large diff but Route HUD validator passed; treat as generated reader page requiring A14 surface review before staging
- validator: node scripts/validate_route_hud_page.mjs --page rav-kook/orot-ha-kodesh/index.html passed
- proposed action: do not revert blindly; stage only if A14 confirms this is intended Orot HaKodesh surface state

### hud-preview/routes/app.js
- bucket: preview_support_surface
- A10 read: preview/support runtime changed; not true corpus page; keep separate from production render cleanup
- validator: node --check passed
- proposed action: separate preview-support packet or defer

### reports/dirty-repo-manifest-2026-06-10.md/json
- bucket: reports_evidence
- A10 read: committed baseline manifest says 988 dirty paths; current status is 268 dirty paths, no deletions
- validator: JSON parse inspected
- proposed action: use current delta packet to continue cleanup from reduced state

## Validators Run
- `git status --porcelain=v1` -> passed within 60000ms
- `git diff -- data/lexical/crossmatches/daniel.json` -> passed within 60000ms
- `node -e "JSON.parse(...)" for data/lexical/crossmatches/daniel.json` -> passed within 60000ms
- `node scripts/validate_route_hud_page.mjs --page rav-kook/orot-ha-kodesh/index.html` -> passed within 120000ms
- `node --check hud-preview/routes/app.js` -> passed within 60000ms
- `git diff --check -- high-risk A10 paths and dirty manifest` -> passed_with_crlf_warnings_only within 60000ms

## A10 Recommendations
- Use current reduced dirty state, not the older 988-row count, as the next cleanup working set.
- No tracked deletion and no data deletion are present in current status.
- Daniel crossmatch is evidence/navigation only and currently generated_at-only; do not let it authorize preHUD display.
- Keep Orot HaKodesh page diff separate as generated reader page/surface review; validator passes but that is not owner approval.
- Keep hud-preview changes separate from true corpus render work.
- Stage exact approved paths only; no git add -A, no reset --hard, no blind deletion.

## Boundary
- sidecar cleanup/crossmatch support only
- no source/license/legal/Definition/product/answer/accepted-text/public-runtime/release acceptance
- no staging/commit/push/deploy performed by A10
