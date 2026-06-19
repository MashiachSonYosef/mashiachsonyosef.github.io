A13_VISIBLE_SLOT_VALIDATION | id | concrete_bank_mined_v1 | status | passed

Validated manifests:
- `data/public-hud/arukh-hashulchan/visible-display-slots.json`: 2 approved rows.
- `data/public-hud/a-new-israeli-commentary-on-pirkei-avot/visible-display-slots.json`: 1 approved row.

Approved rows:
- `H7272:tok-d188cf2ac26e:foot`
- `H1818:tok-1bc41caced30:blood`
- `H8451:tok-bdf3198892c7:Torah`

Rendered pages:
- `halakhah/arukh-hashulchan/index.html`
- `mishnah/a-new-israeli-commentary-on-pirkei-avot/index.html`

Checks:
- visible-slot manifest validator passed for both manifests.
- exact single-work renders passed for both work IDs.
- Route HUD page validator passed for both pages.
- rendered config includes `visible_display_slot_manifest_url` for both pages.

Boundary:
Validation only. No A10 HUD internals, no source/license/legal/Definition/product/answer/accepted-text/publication/release acceptance, and no project-authored definitions.
