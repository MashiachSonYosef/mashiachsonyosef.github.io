# Agent10 -> A14 Orot HUD Implementation Handoff

Generated: 2026-06-07

Purpose: give A14 the actual Orot/Route HUD contract to copy into Daniel and later corpus pages without inventing a new HUD.

Boundary: implementation guidance only. No QA/source/license/legal/Definition/product/answer/accepted-text acceptance, no public/runtime mutation, no release action, no publication readiness.

## Source Of Truth Files

| area | file |
|---|---|
| shared HUD runtime | `assets/js/reader-workbench.js` |
| shared HUD styling | `assets/css/reader-workbench.css` |
| current Orot page contract | `orot/index.html` |
| Orot lexical occurrence roster | `data/lexical/occurrences/orot.json` |
| Orot lexical chunks manifest | `data/lexical/orot.manifest.json` |
| route lookup manifest | `data/definitions/hud-route-lookup/manifest.json` |
| Orot pre-HUD reader hints | `data/public-hud/orot/reader-hints.json` |
| Daniel scoped route lookup manifest | `data/definitions/hud-route-lookup-daniel/manifest.json` |

Do not fork the HUD behavior into a private Daniel-only runtime unless there is an exact blocker in the shared runtime.

## Page Skeleton

The page needs this exact shape:

1. Normal corpus/work page content.
2. Clickable Hebrew tokens or pre-HUD rows, each tied to a token/occurrence id.
3. One shared Route HUD dialog:

```html
<section class="lexical-hud" data-lexical-hud hidden role="dialog" aria-labelledby="route-hud-title" tabindex="-1">
  <div class="hud-head">
    <h2 id="route-hud-title">Route HUD</h2>
    <button class="hud-close" type="button" data-hud-close aria-label="Close route HUD">Close</button>
  </div>
  <div class="route-hud-panel" data-route-hud-panel id="route-hud-panel" aria-live="polite">
    <p class="placeholder">Click a Hebrew form to load route cards.</p>
  </div>
</section>
```

4. One `data-lexical-config` payload naming lexical occurrence/chunk files and route lookup manifest. Daniel already has the right direction:

```json
{
  "manifest_url": "../../data/lexical/daniel.manifest.json",
  "occurrence_url": "../../data/lexical/occurrences/daniel.json",
  "hebrew_crossmatch_url": "../../data/lexical/crossmatches/daniel.json",
  "hud_route_lookup_manifest_url": "../../data/definitions/hud-route-lookup-daniel/manifest.json",
  "hud_validated_only": true,
  "hud_hide_unvalidated_routes": true,
  "hud_allow_lemma_only": false,
  "hud_show_empty_source_licenses": true,
  "reader_layout_mode": "prehud_rows"
}
```

## Pre-HUD Rows

Owner-facing layout:

`Hebrew token | full wrapped selected definition/gloss or quiet TBD | match percent`

Rules:

- The occurrence/token roster drives rows. Every Hebrew token gets one row.
- The Hebrew token links to the popout Route HUD.
- Pre-HUD may show a full wrapped gloss only when the current route/default-selection layer marks a candidate selectable.
- Lemma cards are HUD evidence only by default. Lemma must not auto-fill pre-HUD.
- If no selectable route exists, pre-HUD shows `TBD` as display integrity only.
- `TBD` must be visually quiet: small/muted/corner-status behavior, not a big answer cell that overtakes the work.
- No truncation, no line clamp, no forced shortening for an actual selected route definition.

Suggested row shape:

```html
<div class="prehud-row" data-hud-row data-token-index-id="..." data-selectable="false">
  <div class="prehud-word" lang="he" dir="rtl">
    <button type="button" data-token-index-id="...">...</button>
  </div>
  <div class="prehud-gloss" data-gloss-placeholder="true">
    <span data-gloss-text>TBD</span>
    <a href="#route-hud-panel" aria-label="Open source evidence"><sup>source</sup></a>
  </div>
  <div class="prehud-match" data-match-text>TBD</div>
</div>
```

When selectable route evidence exists:

- `data-selectable="true"`
- pre-HUD gloss is the selected route rendering, not a manual text string
- match cell uses the route/reader-hint numeric evidence
- source superscript points into the HUD source/license area

For mostly-TBD books like Daniel right now, keep the page checkable but keep TBD quiet. The row should say, in effect: "this token is wired; no selectable gloss yet." It should not make the absence of a gloss look like the product.

## Match Percent

Orot reader hints normalize match evidence from these fields, in order:

- `match_percent`
- candidate counterpart `match_percent`
- `confidence_percent`
- candidate counterpart `confidence_percent`
- `adjusted_score`
- candidate counterpart `adjusted_score`
- `raw_score`
- candidate counterpart `raw_score`

If none of those fields exist, display `TBD` or hide the match chip quietly. Do not invent a percent from lemma evidence.

Route card metadata also exposes score basis in the HUD with `routeScoreBasis(card)`: raw score, handicap, adjusted score, lookup relation penalty, and source ref. That belongs in the HUD evidence, not necessarily in the pre-HUD row.

## HUD Section Order

Use the shared section titles and rank order from `assets/js/reader-workbench.js`:

1. Definition
2. Strict Hebrew matches
3. Strict Aramaic matches
4. Word-part breakdown
5. Lemma matches
6. Subphrase evidence
7. Biblical definition/paraphrase matches
8. Citable definition/paraphrase matches
9. Usage evidence
10. Licensed phrase uses

If there is no selected validated definition, render the Definition card as a placeholder:

`No validated definition for this token yet.`

Strict Hebrew and Strict Aramaic should exist as recognizable placeholders when empty:

- `Strict Hebrew matches not found for this token.`
- `Strict Aramaic matches not found for this token.`

Lemma should be compact. If there are no lemma rows, omit it. If there are lemma rows, show them as morphology/reference evidence only. Do not let a large "no match" lemma box eat the HUD.

## Selector Contract

The selector pattern is:

- route card -> `reader-gloss-card`
- button -> `reader-gloss-choice`
- selectable card -> button text `Use this gloss`
- non-selectable evidence -> disabled button text `Evidence only`

The shared gate is `canSaveGlossSelection(card)`. A card can be selected only when all of this is true:

- `answer_eligible === true`
- `answer_role` allows definition/answer use
- card is not usage evidence
- card has a route rendering

The broader best-card display uses `selectRouteAnswer(cards)` and prefers exact answer-eligible cards, then sorted route-card score/rank. That is still a display/selector gate, not Definition authority by itself.

Do not manually insert `God`, `YHWH`, `the Name`, or any other replacement card for `ד׳`. If the matcher currently selects a wrong card, leave it visible as current matcher state until the matcher/data actually changes.

## Source And License Contract

Required public source row fields in the shared HUD:

- `source_name`
- `source_id`
- `source_url`
- `license`
- `license_url`

`sourceRowHasPublicFields(row)` requires all of them and rejects `N/A` licenses. `appendSourceDetails(parent, rows, config)` renders the card-level source summary plus an open details block:

`Sources and licenses (N)`

If no source/license rows are available, use the placeholder:

`No licensed definition source selected yet.`

A14 must not weaken this to a generic source label. The point of the HUD is that source/license evidence remains inspectable next to every route card.

## Crossmatching

There are two different things:

1. Route lookup treatments: `lookupCandidateTreatments(lookupCandidates)` shows non-exact lookup relations such as prefix/suffix/maqaf/plural treatment. These are route-card mechanics.
2. Work-local form crossmatch: `appendCrossmatchHudSection(panel, crossmatch)` shows same Hebrew form occurrences for navigation/reference.

Neither one is an accepted definition. Crossmatches should help the owner see why a token matched or where else it appears, not create gloss text.

Use shared treatment language:

- `Matched by plural-form treatment: also try ...`
- `Matched by plural suffix treatment: base candidate ...`
- `Matched by possessive suffix treatment: base candidate ...`
- `Matched by suffix-stripped treatment: base candidate ...`
- `Matched by prefix treatment: base candidate ...`
- `Matched by maqaf component: ...`

## How Orot Finds Words

Orot does not scan the visible Hebrew and guess meanings ad hoc.

The current path is:

1. Hebrew source text is tokenized with the Hebrew token regex.
2. Tokens are assigned `token_index_id` values from the lexical occurrence/token roster.
3. Lexical rows are loaded through the work manifest and chunk files.
4. Route cards are loaded through `hud_route_lookup_manifest_url`.
5. Reader hints are loaded through `reader_hints_url`.
6. Pre-HUD rows display only the selected/approved reader-hint or route/default-selection display.
7. HUD cards show all relevant route evidence, strict matches, morphology/lemma evidence, crossmatches, and sources/licenses.

For Orot, the concrete data anchors are:

- `data/lexical/occurrences/orot.json`: `total_occurrences` currently visible in the file header as `59806`
- `data/lexical/orot.manifest.json`: chunked lexical payload manifest
- `data/definitions/hud-route-lookup/manifest.json`: route lookup manifest
- `data/public-hud/orot/reader-hints.json`: reader-hint payload with `hint_policy=reader_hint_not_translation_not_definition_authority`

For Daniel, use the same pattern with Daniel-specific paths. Do not let a standalone report preview become the primary render target.

## Validation / Okay-To-Bring-In Rule

"Okay to bring in" currently means "okay to display as bounded HUD evidence or planning/display layer," not accepted definition authority.

Use these gates:

- route/card payload exists in the route lookup manifest or scoped work manifest
- source rows have required public source/license fields
- `answer_eligible=true` and `answer_role` passes only for enabled selector use
- `hud_validated_only=true` and `hud_hide_unvalidated_routes=true` when a book is still being hardened
- `hud_allow_lemma_only=false` so lemma evidence cannot become pre-HUD gloss text
- source/license lane remains explicit
- Agent 6/A07 boundaries remain separate from UI mechanics

If a row is not cleared for text, show `TBD` quietly or keep the card as disabled `Evidence only`.

## A14 Do / Do Not

Do:

- reuse shared `assets/js/reader-workbench.js`
- reuse shared `assets/css/reader-workbench.css`
- wire Daniel actual page, not only `reports/` preview
- keep every token checkable
- keep source/license details open and inspectable
- show strict Hebrew and strict Aramaic placeholders
- keep lemma compact and evidence-only
- make pre-HUD definitions wrap fully when selectable

Do not:

- alter Orot to make Daniel work
- invent manual definitions
- promote lemma rows into pre-HUD glosses
- hide source/license evidence
- treat `TBD` as a definition
- treat route-card display as acceptance
- claim QA/source/license/legal/Definition/product/answer/accepted-text acceptance
- mutate public/runtime/release state from this handoff alone

## Process Timeouts During This Handoff

| process_timeout | command | timeout | partial_output_or_artifact | next_safe_action |
|---|---|---:|---|---|
| true | combined `Get-Content` range read over `assets/js/reader-workbench.js` | 10000 ms | returned section titles, source details, selector, strict placeholders before timeout | used narrower `Select-String` anchors |
| true | combined `Select-String` over Orot/Daniel/preview pages | 10000 ms | returned lexical config, pre-HUD formatter, TBD, strict sections before timeout | used direct metadata reads |
| true | Orot formatter block read around lines 10051-10145 | 10000 ms | returned match-percent normalization and reader-hint normalization before timeout | used partial output; no retry loop |

## Stop Condition

A14 should stop when the actual Daniel page has:

- token-to-row or token-to-click target 1:1 proof
- Route HUD opens from each Hebrew token
- pre-HUD gloss is full/wrapped only for selectable current route/default selection
- all other rows show quiet `TBD`
- strict Hebrew and strict Aramaic placeholders present
- lemma compact/evidence-only
- crossmatches match shared HUD behavior
- source/license details inspectable
- no public/release/Definition/answer acceptance claims
