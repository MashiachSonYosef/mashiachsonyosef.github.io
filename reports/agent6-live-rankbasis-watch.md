# Agent 6 Live Rank-Basis Watch

Date: 2026-06-01
Agent: 6 (independent QA/compliance authority)
Scope: live follow-up after Agent 4 was re-prompted on rank-basis migration

## Verdict

Do not prompt a new lane.

Keep Agent 4 on the current public-HUD blocker. Agent 4 is actively migrating pages, but the gate is still blocked.

Agent 1 remains unchanged on the Kaikki provenance-report contradiction unless he has not acknowledged the prompt.

## Current HUD Watch

Latest direct sweep:

- Current HUD pages: `1267`
- Pages with `article.dataset.rankBasis`: `61`
- Pages missing `article.dataset.rankBasis`: `1206`
- Pages still containing `Rank details`: `1204`
- Pages still containing `Clicked Hebrew form`: `0`

Observed movement during Agent 6 checks:

- Rank-basis pages increased from `10` to `21` to `32` to `39` to `61`.
- Stale old-HUD `Clicked Hebrew form` stayed at `0`.
- Route lookup remained passing.

Interpretation:

- Agent 4 is making real progress.
- The stale old-HUD family appears materially cleared.
- The remaining blocker is the rank-basis migration across the bulk of current HUD pages.

## Representative Validation

Passing:

- `tanakh\genesis\index.html`
- `halakhah\urim-vetumim-urim\index.html`
- `halakhah\meirat-einayim-on-shulchan-arukh-choshen-mishpat\index.html`

Failing:

- `tanakh\exodus\index.html`
- `other\beer-hagolah\index.html`
- `jewish-thought\kuzari\index.html`
- `midrash\yefeh-toar-on-bereshit-rabbah\index.html`
- `targum\targum-jonathan-on-genesis\index.html`
- `mishnah\mishnah-berakhot\index.html`

Failure pattern:

- missing required marker `article.dataset.rankBasis`
- contains stale marker `Rank details`

## Other Gates

Publication:

- Still `blocked_no_render`
- Rendered rows: `0`
- Accepted decision rows: `0`

Agent 1 provenance:

- Lexical build reports: `59`
- Kaikki contradiction reports: `26`
- No current evidence of correction yet.

Route/runtime support:

- `node scripts\validate_public_hud_route_lookup.mjs --skip-release-stamp`: passed

## Acceptance Condition

Agent 4 clears the current HUD blocker only when all are true:

- `0` current HUD pages missing `article.dataset.rankBasis`
- `0` current HUD pages containing `Rank details`
- `0` current HUD pages containing stale old-HUD markers such as `Clicked Hebrew form`
- Route lookup still passes
- Representative pages across all public source-work directories pass `scripts\validate_route_hud_page.mjs`

## Current Prompt Decision

No new prompt needed yet if Agent 4 is still running.

If Agent 4 stalls, send:

`Agent 4, Agent 6 is watching live progress. Rank-basis migration is moving but still blocked: latest sweep shows 61 of 1267 current HUD pages have article.dataset.rankBasis; 1206 still miss it and 1204 still contain Rank details. Clicked Hebrew form stale markers are now 0, so do not broaden back to old-HUD cleanup. Continue the rank-basis migration across all current HUD pages, then prove 0 missing article.dataset.rankBasis, 0 Rank details, route lookup passing, and representative validator passes across tanakh, halakhah, other, jewish-thought, midrash, targum, mishnah, and at least one commentary-heavy page.`
