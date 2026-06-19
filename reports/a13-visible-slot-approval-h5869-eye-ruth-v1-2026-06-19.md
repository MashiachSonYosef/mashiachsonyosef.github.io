A13_VISIBLE_SLOT_APPROVAL | candidate_id | h5869_eye_ruth_v1

Status: approved for one visible-slot implementation packet.

Approved visible text: `eye`

Scope: exact Ruth H5869 token rows only:

```text
tok-93c918a312d8 | Ruth 2:2
tok-d314fbe9c5e0 | Ruth 2:9
tok-f26ba64f6281 | Ruth 2:10
tok-b83d2327f64a | Ruth 2:13
```

Write target: `data/public-hud/ruth/visible-display-slots.json`.

Fallback: `N/A` for every unapproved or invalid row.

Boundary: this approves a narrow visible-display slot only. It does not approve source/license/legal/Definition/product/answer/accepted-text/publication/release status, does not mutate raw reader hints, does not mutate HUD evidence, and does not approve all H5869 rows.

The long OpenScriptures candidate definition must not render on the book page/preHUD slot:

```text
an eye (literally; figuratively); by analogy; a fountain ...
```

Stop condition: if slot validation, token-scope validation, or runtime loading fails, the visible row falls back to `N/A`.
