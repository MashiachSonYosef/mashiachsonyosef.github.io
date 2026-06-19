A13_VISIBLE_SLOT_PACKAGE_CHECK | id | concrete_bank_mined_v1 | status | passed

Changed surfaces:
- `data/public-hud/arukh-hashulchan/visible-display-slots.json`
- `data/public-hud/a-new-israeli-commentary-on-pirkei-avot/visible-display-slots.json`

Expected render targets:
- `halakhah/arukh-hashulchan/index.html`
- `mishnah/a-new-israeli-commentary-on-pirkei-avot/index.html`

Validators:
- `node scripts\validate_visible_display_slot_manifest.mjs --input=data\public-hud\arukh-hashulchan\visible-display-slots.json`
- `node scripts\validate_visible_display_slot_manifest.mjs --input=data\public-hud\a-new-israeli-commentary-on-pirkei-avot\visible-display-slots.json`
- `& .\scripts\render_site.ps1 -WorkIds arukh-hashulchan -SkipLexicalPayloadFiles -SkipOverlayExports`
- `& .\scripts\render_site.ps1 -WorkIds a-new-israeli-commentary-on-pirkei-avot -SkipLexicalPayloadFiles -SkipOverlayExports`
- `node scripts\validate_route_hud_page.mjs --page halakhah\arukh-hashulchan\index.html`
- `node scripts\validate_route_hud_page.mjs --page mishnah\a-new-israeli-commentary-on-pirkei-avot\index.html`

Results:
- Arukh HaShulchan manifest passed: 2 approved rows.
- Pirkei Avot commentary manifest passed: 1 approved row.
- Both target pages rendered with exact single-work `render_site.ps1` calls.
- Both Route HUD page validators passed.
- Both rendered configs include `visible_display_slot_manifest_url`.

Boundary:
Visible-display-slot package only. No A10 HUD internals, no source/license/legal/Definition/product/answer/accepted-text/publication/release acceptance.
