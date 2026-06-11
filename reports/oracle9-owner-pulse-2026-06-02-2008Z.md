# Oracle 9 Owner Pulse - 2026-06-02 20:08Z

Status: outside-owner surveillance memo only.
Authority: no QA acceptance, no publication clearance, no routing authority, no SOP authority, no legal authority, no product/data gate acceptance, and no accepted translation text.

## Current State

Plain English first: the website is no longer simply the old stale HUD artifact. A lightweight public Route HUD surface is live now, but the control system still blocks publication and only accepts narrow warned evidence for specific surfaces.

- Public root is live as a lightweight Route HUD entry page. Evidence: [live root](https://mashiachsonyosef.github.io/) returned HTTP `200`, `Last-Modified: Tue, 02 Jun 2026 16:35:43 GMT`, title `Mashiach Son Yosef Library`, `10` work cards, and the notice `Only the replacement Route HUD surface is public in this deployment. Older generated HUD pages remain local until they are swapped or cleared.`
- The old HUD preview is not publicly exposed in the checked live paths. Evidence: [live HUD preview](https://mashiachsonyosef.github.io/hud-preview/) returned HTTP `404`; [live HUD routes](https://mashiachsonyosef.github.io/hud-preview/routes/) returned HTTP `404`.
- Deuteronomy is live with current Route HUD markers and bounded public-HUD data, but only inside Agent 6's exact WARN boundary. Evidence: [live Deuteronomy](https://mashiachsonyosef.github.io/tanakh/deuteronomy/) returned HTTP `200`, contains `Route HUD`, `lexical-hud`, `Source`, `License`, and no `HUD Sampler`; `reports/agent6-current-deuteronomy-fullscreen-runtime-verdict-2026-06-02.md` says `WARN-ACCEPTED for exact live Deuteronomy fullscreen current-HUD runtime only`.
- Genesis is also live with current Route HUD markers and public-HUD data, but Agent 6 withheld clean runtime acceptance. Evidence: [live Genesis](https://mashiachsonyosef.github.io/tanakh/genesis/) returned HTTP `200`, contains `Route HUD`, `lexical-hud`, `Source`, `License`, and no `HUD Sampler`; `reports/agent6-genesis-candidate-page-2-verdict-2026-06-02.md` says `WARN-ACCEPTED for Genesis candidate page #2 shipment-prep evidence only` and `BLOCKED for clean validated public reader surface #2 runtime acceptance until independent live browser-click proof`.
- Publication remains globally blocked. Evidence: `reports/agent6-validation-queue-health.md` reports `Publication global status: blocked_no_render`, status `passed`, `36` queue items, `0` issues, and `0` warnings.
- The local repo is not deploy-clean. Evidence from this pulse: branch `main`, local HEAD `9064d9a47a74ad2ab14bb20a77e007e574f5db7d`, `origin/main` `62c64fb303e13ef84e22d6cbf56e2a2c85c04499`, divergence `8 behind / 115 ahead`, and `2408` dirty paths.

## Methodology

- Probed `18` public URLs with cache-busting and `Cache-Control: no-cache`: root, HUD preview, HUD routes, Deuteronomy, Genesis, shared JS/CSS, Deuteronomy public-HUD data, Genesis public-HUD data, and three old dependency paths.
- Checked live markers for `Route HUD`, `lexical-hud`, `Source`, `License`, `HUD Sampler`, `answer_eligible`, `candidate_not_authority`, and `not_translation`.
- Checked local branch, HEAD, `origin/main`, ahead/behind count, dirty-path count, and sampled dirty paths.
- Read current control reports: `reports/agent6-validation-queue-health.md`, `reports/agent7-governance-control-health.md`, `reports/agent5-control-notes.md`, `reports/agent10-it-pulse-2026-06-02-1534.md`, `reports/agent6-current-deuteronomy-fullscreen-runtime-verdict-2026-06-02.md`, and `reports/agent6-genesis-candidate-page-2-verdict-2026-06-02.md`.
- Compared against prior Oracle owner pulse: `reports/oracle9-owner-pulse-2026-06-02.md`.
- Checked `origin/main:_config.yml` and `origin/main:index.html` with `git show`.

## Scope/Sections Reviewed

- Public pages: [root](https://mashiachsonyosef.github.io/), [HUD preview](https://mashiachsonyosef.github.io/hud-preview/), [HUD routes](https://mashiachsonyosef.github.io/hud-preview/routes/), [Deuteronomy](https://mashiachsonyosef.github.io/tanakh/deuteronomy/), [Genesis](https://mashiachsonyosef.github.io/tanakh/genesis/).
- Public runtime assets: [reader-workbench.js](https://mashiachsonyosef.github.io/assets/js/reader-workbench.js), [reader-workbench.css](https://mashiachsonyosef.github.io/assets/css/reader-workbench.css).
- Current public data paths: [Deuteronomy manifest](https://mashiachsonyosef.github.io/data/public-hud/deuteronomy/manifest.json), [Deuteronomy occurrences](https://mashiachsonyosef.github.io/data/public-hud/deuteronomy/occurrences.json), [Deuteronomy reader hints](https://mashiachsonyosef.github.io/data/public-hud/deuteronomy/reader-hints.json), [Deuteronomy route manifest](https://mashiachsonyosef.github.io/data/public-hud/deuteronomy/route-lookup/manifest.json), [Genesis manifest](https://mashiachsonyosef.github.io/data/public-hud/genesis/manifest.json), [Genesis occurrences](https://mashiachsonyosef.github.io/data/public-hud/genesis/occurrences.json), [Genesis reader hints](https://mashiachsonyosef.github.io/data/public-hud/genesis/reader-hints.json), [Genesis route manifest](https://mashiachsonyosef.github.io/data/public-hud/genesis/route-lookup/manifest.json).
- Old dependency paths checked as negative controls: [old Deuteronomy manifest](https://mashiachsonyosef.github.io/data/lexical/deuteronomy.manifest.json), [old Deuteronomy occurrences](https://mashiachsonyosef.github.io/data/lexical/occurrences/deuteronomy.json), [old route lookup manifest](https://mashiachsonyosef.github.io/data/definitions/hud-route-lookup/manifest.json).
- Control/reports reviewed: `reports/agent6-validation-queue-health.md`, `reports/agent7-governance-control-health.md`, `reports/agent5-control-notes.md`, `reports/agent10-it-pulse-2026-06-02-1534.md`, `reports/agent7-surface-chain-manager-decision-2026-06-02.md`, `reports/agent6-current-deuteronomy-fullscreen-runtime-verdict-2026-06-02.md`, `reports/agent6-genesis-candidate-page-2-verdict-2026-06-02.md`.

## Material Changes Since Last Pulse

- The prior owner line `repo hidden, public artifact stale` is superseded for the checked main public surface. Evidence: prior `reports/oracle9-owner-pulse-2026-06-02.md` recorded May 30 live artifacts; this pulse recorded live `Last-Modified: Tue, 02 Jun 2026 16:35:43 GMT` for root, Deuteronomy, Genesis, JS, CSS, and public-HUD data.
- Old HUD preview exposure changed from live public concern to live 404 in the checked paths. Evidence: [HUD preview](https://mashiachsonyosef.github.io/hud-preview/) and [HUD routes](https://mashiachsonyosef.github.io/hud-preview/routes/) both returned HTTP `404`.
- Deuteronomy changed from delivery blocker wording to exact current-HUD WARN wording. Evidence: `reports/agent6-current-deuteronomy-fullscreen-runtime-verdict-2026-06-02.md` and `reports/agent5-control-notes.md`.
- Genesis changed from nonpublic/deferred language to live candidate surface language, but not clean runtime acceptance. Evidence: [Genesis](https://mashiachsonyosef.github.io/tanakh/genesis/) returned HTTP `200`; `reports/agent6-genesis-candidate-page-2-verdict-2026-06-02.md` withholds clean validated public reader surface #2 runtime acceptance.
- Queue size increased from `20` in the prior Oracle pulse to `36` in the current Agent 6 queue health report. Evidence: `reports/oracle9-owner-pulse-2026-06-02.md` and `reports/agent6-validation-queue-health.md`.
- Local repo drift increased from `1 behind / 67 ahead` and `2190` dirty paths in the prior Oracle pulse to `8 behind / 115 ahead` and `2408` dirty paths now. Evidence: `reports/oracle9-owner-pulse-2026-06-02.md` and this pulse's `git rev-list --left-right --count origin/main...HEAD` plus `git status --short | Measure-Object`.

## Evidence Links

| material claim | evidence |
|---|---|
| Public root is current lightweight Route HUD, not old HUD preview. | [root](https://mashiachsonyosef.github.io/) HTTP `200`, `Last-Modified: Tue, 02 Jun 2026 16:35:43 GMT`; `origin/main:index.html` contains `Lightweight public HUD surface` and the replacement Route HUD notice. |
| Root advertises 10 work cards. | [root](https://mashiachsonyosef.github.io/) live HTML count: Genesis, Exodus, Leviticus, Numbers, Deuteronomy, Ruth, Jonah, Amos, Zechariah, Zephaniah. |
| HUD preview is not public in checked paths. | [hud-preview](https://mashiachsonyosef.github.io/hud-preview/) HTTP `404`; [hud-preview/routes](https://mashiachsonyosef.github.io/hud-preview/routes/) HTTP `404`. |
| Deuteronomy exact live surface is warned, not cleanly accepted. | [Deuteronomy](https://mashiachsonyosef.github.io/tanakh/deuteronomy/) HTTP `200`; `reports/agent6-current-deuteronomy-fullscreen-runtime-verdict-2026-06-02.md`. |
| Genesis is live but still lacks clean Agent 6 runtime acceptance. | [Genesis](https://mashiachsonyosef.github.io/tanakh/genesis/) HTTP `200`; `reports/agent6-genesis-candidate-page-2-verdict-2026-06-02.md`. |
| Public data moved to `data/public-hud`. | Eight checked public-HUD URLs returned HTTP `200`; `origin/main:_config.yml` excludes `data/lexical` but not `data/public-hud`. |
| Old dependency paths remain absent. | [old lexical manifest](https://mashiachsonyosef.github.io/data/lexical/deuteronomy.manifest.json), [old occurrences](https://mashiachsonyosef.github.io/data/lexical/occurrences/deuteronomy.json), and [old route lookup](https://mashiachsonyosef.github.io/data/definitions/hud-route-lookup/manifest.json) returned HTTP `404`. |
| Publication remains blocked. | `reports/agent6-validation-queue-health.md`: `Publication global status: blocked_no_render`, `36` items, `0` issues, `0` warnings. |
| Governance sees this as bounded and warned. | `reports/agent7-governance-control-health.md`: status `passed`, `1` warning, Deuteronomy WARN boundary preserved, Genesis and `/hud-preview` separate blockers. |
| Local repo is not deploy-clean. | `git rev-list --left-right --count origin/main...HEAD` = `8 115`; `git status --short` count = `2408`. |

## Product/Fulfillment Read

The team is now partially fulfilling the public runtime order. The old read of "nothing is live except stale old HUD" is no longer true. The current product read is: a lightweight public Route HUD slice is live, but acceptance is narrow and uneven.

Numbers:

- `18` public URLs checked.
- `13` checked public URLs returned HTTP `200`: root, Deuteronomy, Genesis, JS, CSS, and `8` public-HUD data paths.
- `5` checked public URLs returned HTTP `404`: HUD preview, HUD routes, and `3` old dependency paths.
- `10` work cards are exposed from the live root.
- `2` work pages were directly probed this pulse: Deuteronomy and Genesis.
- `1` work page has Agent 6 exact current-HUD WARN acceptance: Deuteronomy.
- `1` work page is live but still blocked for clean runtime acceptance: Genesis.
- `36` Agent 6 validation queue items remain open or returned inside non-publication boundaries.
- `2408` local dirty paths mean direct local broad deploy is still unsafe.

## Risks/Blockers

- Public reception risk: the owner can now see a functioning public slice and mistake it for broad publication. Evidence: [root](https://mashiachsonyosef.github.io/) advertises `10` cards, but `reports/agent6-validation-queue-health.md` still says `blocked_no_render`.
- Acceptance drift risk: Deuteronomy is only `WARN-ACCEPTED for exact live Deuteronomy fullscreen current-HUD runtime only`; do not generalize it to Genesis, all 10 root cards, broad Reader Workbench acceptance, or publication readiness. Evidence: `reports/agent6-current-deuteronomy-fullscreen-runtime-verdict-2026-06-02.md`.
- Genesis proof gap: Genesis is publicly reachable, but Agent 6 explicitly blocked clean validated public reader surface #2 runtime acceptance until independent live browser-click proof. Evidence: `reports/agent6-genesis-candidate-page-2-verdict-2026-06-02.md`.
- CDN/versioning gap: Deuteronomy's exact WARN docket preserves a warning that runtime script URL is not visibly versioned/cache-busted, so clean CDN stale-bundle closure is not accepted. Evidence: `reports/agent6-current-deuteronomy-fullscreen-runtime-verdict-2026-06-02.md`.
- Queue/control drift risk: the repo is `8` commits behind `origin/main`, `115` ahead, and has `2408` dirty paths; public truth, local truth, and control truth are not one clean deploy state. Evidence: this pulse's git commands and `reports/agent10-it-pulse-2026-06-02-1534.md`.
- Legacy-reference risk: any report or prompt still pointing readers to `data/lexical` or `data/definitions/hud-route-lookup` as live public dependencies is stale for this public surface. Evidence: three old dependency URLs returned HTTP `404`; eight `data/public-hud` URLs returned HTTP `200`.

## Plain-English Translation

This is better than this morning, but more dangerous to describe casually.

The website is not just old anymore. A smaller Route HUD version is live. Deuteronomy has a real current-HUD warning acceptance. Genesis is visible, but not yet cleanly accepted. The old HUD preview is hidden in the checked public paths.

The main problem changed from "the public site is stale" to "the public site now looks real enough that people may overstate what has been accepted."

Owner-readable line:

`Public site now serves a lightweight Route HUD slice; Deuteronomy is exact-surface WARN accepted, Genesis is live but awaiting independent runtime proof, /hud-preview is 404, and publication remains blocked_no_render.`

## Suggestions To Agent 7

- Retire the standalone wording `repo hidden, public artifact stale` for the checked public root, Deuteronomy, and Genesis surfaces.
- Use a split status line: `public lightweight Route HUD slice live`; `Deuteronomy exact current-HUD WARN accepted`; `Genesis live candidate, clean runtime acceptance blocked pending Agent 6 browser proof`; `/hud-preview 404/nonpublic`; `publication blocked_no_render`.
- Ask Agent 10 or the validated-public-reader-surface chain to produce a compact evidence matrix for all `10` live root cards before claiming the root card set is product-supported.
- Do not wake Agent 6 just for status. If Agent 7 wants movement, the useful packet is a Genesis independent browser-click proof packet or CDN/versioning supplement, not another Deuteronomy old-HUD loop.
- Keep Agent 11 wording conservative: public reception should hear "bounded live slice" before hearing "site is live."

## Decision Needed From User

Decide whether the current lightweight public Route HUD slice is the intended public posture.

If yes, the next owner decision is whether Genesis should be pushed through independent runtime proof as page #2 and whether all `10` root cards should be validated in sequence.

If no, the next owner decision is whether to hide or narrow the root card set until the public surface has matching Agent 6-grade evidence.

This memo does not approve any route. It only says the public state changed and the owner-facing wording must change with it.
