# Daniel Lemma-Only Display Guard - 2026-06-10

Status: fixed scoped display-gate repair.

## Scope

This packet repairs the shared reader runtime so Daniel cannot show a preHUD gloss from lemma-only, morphology/form-reference, usage-only, phrase-evidence, stale local, or imported local-study evidence.

No Daniel page text was edited. No theological replacement was injected. Crossmatch and lemma evidence remain HUD-inspectable evidence only.

## Files Changed

- `assets/js/reader-workbench.js`
- `reports/agent14-daniel-lemma-only-display-guard-2026-06-10.md`
- `reports/agent14-daniel-lemma-only-display-guard-2026-06-10.json`

## Issue Found

Daniel is configured fail-closed with zero route cards in `data/definitions/hud-route-lookup-daniel/manifest.json`. Fresh preHUD rows should therefore remain quiet `TBD`.

The risky path was not the Daniel page itself. It was the shared runtime's saved/imported local selection path and answer selection path. A stale or imported selection could carry answer-like fields without proving current preHUD display eligibility, and evidence-only route families needed an explicit preHUD gate.

## Repair

- Added a shared evidence-only route-family guard for lemma, morphology/form-reference, usage-only, and phrase-evidence routes.
- Added `isPrehudDisplayEligibleCard()` and routed HUD answer selection and saved-gloss choices through it.
- Required stored/imported selections to carry `display_eligible: true` and `prehud_allowed: true`.
- Rejected stored/imported selections whose route labels are evidence-only or whose selected text matches unsafe preHUD display language.
- New saved selections record selected route section/type/family, lookup relation, match family, and display eligibility fields.

## Proof

Static validators:

- `node --check assets/js/reader-workbench.js` passed.
- `node scripts/validate_route_hud_page.mjs --page tanakh/daniel/index.html --page orot/index.html --page tanakh/ruth/index.html` passed.
- Inline display-gate static guard passed 8 checks.

Browser proof at `http://127.0.0.1:8801/tanakh/daniel/?daniel-display-guard=20260610b`:

- preHUD rows: 5456
- lexical tokens: 5456
- TBD gloss rows: 5456
- TBD match cells: 5456
- populated preHUD rows: 0
- `God` / `YHWH` / `Name` preHUD rows: 0
- enabled gloss buttons: 0
- Definition placeholder visible: true
- Same Hebrew form crossmatch section visible: true

## Decision

`A3 found it` remains evidence/navigation only. For Daniel, lemma-only or crossmatch evidence remains HUD-inspectable but cannot fill preHUD. PreHUD stays `TBD` unless a current safe selectable route-backed card passes the preHUD display gate.

## Boundary

No definition authority. No accepted gloss/text. No source/license/legal acceptance. No publication/release/public-runtime acceptance. This is Daniel render/display-gate repair evidence only.
