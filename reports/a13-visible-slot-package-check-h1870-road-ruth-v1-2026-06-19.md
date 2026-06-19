A13_VISIBLE_SLOT_PACKAGE_CHECK | candidate_id | h1870_road_ruth_v1 | status | passed

Changed surface: `data/public-hud/ruth/visible-display-slots.json`

The package adds one Ruth visible slot for `tok-8483c9261b56` with visible text `road`.

No A10 HUD internals, raw reader hints, route logic, shared JS/CSS, or static book page frame were changed. The Ruth page uses the existing visible-slot manifest config.

Rollback:
Remove the one H1870 slot, remove these A13 receipts, and restore the previous rollup totals.

Boundary:
Package check only. No source/license/legal/Definition/product/answer/accepted-text/publication/release acceptance.
