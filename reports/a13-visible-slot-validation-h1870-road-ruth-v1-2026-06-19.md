A13_VISIBLE_SLOT_VALIDATION | candidate_id | h1870_road_ruth_v1 | status | passed

Commands passed:
- `node scripts\validate_visible_display_slot_manifest.mjs --input=data\public-hud\ruth\visible-display-slots.json`
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts\render_site.ps1 -WorkIds ruth -SkipLexicalPayloadFiles -SkipOverlayExports`
- `node scripts\validate_route_hud_page.mjs --page tanakh\ruth\index.html`
- targeted token/page config check

Validated:
- Ruth visible-slot manifest now has 5 approved rows.
- Exactly one H1870 row is visible.
- `tok-8483c9261b56` displays `road`.
- The long H1870 reader-hint text remains evidence only.
- The Ruth page still points at the visible-slot manifest through the existing page config.

Boundary:
Validation only. No source/license/legal/Definition/product/answer/accepted-text/publication/release acceptance.
