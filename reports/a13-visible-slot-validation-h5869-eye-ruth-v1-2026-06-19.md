A13_VISIBLE_SLOT_VALIDATION | candidate_id | h5869_eye_ruth_v1

Result: passed.

Validated artifacts:

```text
data/public-hud/ruth/visible-display-slots.json
tanakh/ruth/index.html
scripts/render_site.ps1
reports/a13-visible-slot-approval-h5869-eye-ruth-v1-2026-06-19.json
reports/a13-visible-slot-package-check-h5869-eye-ruth-v1-2026-06-19.json
```

Commands/checks:

```text
node scripts\validate_visible_display_slot_manifest.mjs --input=data\public-hud\ruth\visible-display-slots.json
custom Node token-scope/page-config check
PowerShell parser check for scripts\render_site.ps1
custom Node runtime-contract marker check
```

Counts:

```text
slot_count: 4
approved_gloss_count: 4
approved_visible_text: eye
fallback: N/A
Ruth visible slot URL: ../../data/public-hud/ruth/visible-display-slots.json
```

Boundary: validation only for the Ruth visible-display slot manifest and page config. No source/license/legal/Definition/product/answer/accepted-text/publication/release acceptance.
