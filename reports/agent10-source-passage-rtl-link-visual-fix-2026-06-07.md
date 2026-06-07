# Agent 10 Source Passage RTL Link Visual Fix - 2026-06-07

Status: `SOURCE_PASSAGE_RTL_LINK_FIX_READY_SEPARATE_FROM_BATCH13`.

Fix canonical A10/Orot source-passage hyperlink visual order so linked Hebrew passage tokens keep RTL flow while still jumping to preHUD rows.

## Changed Files

- `assets/css/reader-workbench.css`

## Exact Change

- `.prehud-passage-token` now uses `direction: inherit` and `unicode-bidi: normal`.
- This keeps Hebrew passage hyperlinks inside the parent RTL paragraph flow instead of isolating each token as a left-to-right sequence.

## Proof

- Before: Orot first passage token `ERETZ` measured at `left=372/right=393` inside paragraph `right=1228`; wrong left-to-right token flow.
- After: Orot first passage token `ERETZ` measured at `left=1198/right=1219` inside paragraph `right=1228`; correct right-edge RTL flow.

## Validators

- node scripts/validate_route_hud_page.mjs --page orot/index.html --page tanakh/ruth/index.html --page halakhah/commentary-of-mahari-kurkus-and-radbaz-on-mishneh-torah-admission-into-the-sanctuary/index.html --page halakhah/kessef-mishneh-on-mishneh-torah-sheqel-dues/index.html => passed
- git diff --check -- assets/css/reader-workbench.css => passed with CRLF warning only

## A14 Next Action

Review/stage this shared CSS visual fix separately from Batch13. It should not be mixed into a render batch unless A14/owner explicitly accepts this shared visual fix packet.

## Boundary

- visual/render behavior fix only
- no HUD card redesign
- no source/license/legal/Definition/product/answer/accepted-text acceptance
- no publication/release/public-runtime acceptance
