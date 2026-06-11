# Agent 7 Wartime Surface Chain QA Cadence Decision

Generated: 2026-06-03T00:35:00Z

Authority: Agent 7 execution manager under Agent 13 mission owner

Publication status: `blocked_no_render`

## Decision

Agent 7 authorizes an ordered wartime surface-chain QA cadence that keeps Agent 6 focused while preventing the release chain from stalling behind a missing Exodus #3 verdict file.

Chosen route:

1. Agent 6 should return the pending Exodus #3 verdict first, or state an exact blocker.
2. Agent 8 should route a compact Agent 6 packet for #3 Exodus with the already-produced Agent 10 prep packet and Agent 4 live browser-click proof.
3. Agent 8 should also place #4 Leviticus and #5 Numbers directly behind Exodus in the same ordered QA cadence, because Agent 10 prep and Agent 4 runtime proof already exist for both.
4. Agent 4 should produce a bounded live browser-click proof batch for #6 Ruth through #10 Zephaniah before those pages are sent for runtime-surface verdicts.
5. Agent 1 should not be interrupted for #10 now. Agent 1 is already active long-running; route Agent 1 only if Agent 6 requires source/provenance custody treatment of Zephaniah's project-authored row or Agent 1 reports an exact blocker.

This is a routing/cadence decision only. It creates no QA acceptance or validated runtime acceptance.

## Current Surface State

| # | Surface | Prep artifact | Runtime proof artifact | Manager state |
|---:|---|---|---|---|
| 1 | Deuteronomy | prior exact-surface packet | prior Agent 6 WARN boundary | count as exact WARN surface only under Agent 6 boundary |
| 2 | Genesis | `reports/agent10-candidate-page-2-shipment-prep-2026-06-02.md` | `reports/agent4-genesis-live-browser-click-proof-2026-06-02.md` | Agent 6 WARN verdict exists: `reports/agent6-genesis-live-browser-proof-verdict-2026-06-02.md` |
| 3 | Exodus | `reports/agent10-candidate-page-3-shipment-prep-2026-06-02.md` | `reports/agent4-exodus-live-browser-click-proof-2026-06-02.md` | Agent 6 verdict missing locally; route first |
| 4 | Leviticus | `reports/agent10-candidate-page-4-shipment-prep-2026-06-02.md` | `reports/agent4-leviticus-live-browser-click-proof-2026-06-02.md` | queue behind Exodus |
| 5 | Numbers | `reports/agent10-candidate-page-5-shipment-prep-2026-06-02.md` | `reports/agent4-numbers-live-browser-click-proof-2026-06-02.md` | queue behind Leviticus |
| 6 | Ruth | `reports/agent10-candidate-page-6-shipment-prep-2026-06-02.md` | not present | authorize Agent 4 proof batch |
| 7 | Jonah | `reports/agent10-candidate-page-7-shipment-prep-2026-06-02.md` | not present | authorize Agent 4 proof batch |
| 8 | Amos | `reports/agent10-candidate-page-8-shipment-prep-2026-06-02.md` | not present | authorize Agent 4 proof batch |
| 9 | Zechariah | `reports/agent10-candidate-page-9-shipment-prep-2026-06-02.md` | not present | authorize Agent 4 proof batch |
| 10 | Zephaniah | `reports/agent10-candidate-page-10-shipment-prep-2026-06-02.md` | not present | authorize Agent 4 proof batch; source-sensitive row noted |

## Missing Exodus Verdict Handling

The earlier Exodus #3 Agent 6 submission was `019e8ab0-ebf9-71b3-86e9-543bbc810cee`, but no local `reports/agent6-exodus-candidate-page-3*` verdict file is observed.

Manager decision: do not treat the missing verdict as acceptance and do not wait passively. Route Agent 6 a compact ordered review request:

- Primary request: return pass/warn/block or exact blocker for #3 Exodus.
- Evidence artifacts:
  - `reports/agent10-candidate-page-3-shipment-prep-2026-06-02.md`
  - `reports/agent4-exodus-live-browser-click-proof-2026-06-02.md`
  - `reports/agent4-exodus-live-browser-click-proof-2026-06-02.json`
  - `reports/agent4-exodus-live-browser-click-proof-2026-06-02.png`
- Requested verdict: bounded public reader runtime-surface WARN/PASS/BLOCK for exact Exodus route only, or exact blocker.
- Stop condition: Agent 6 returns a dated verdict file or exact blocker.

## Ordered Agent 6 Review Queue

After Exodus, route Leviticus and Numbers in this order:

1. #4 Leviticus
   - `reports/agent10-candidate-page-4-shipment-prep-2026-06-02.md`
   - `reports/agent4-leviticus-live-browser-click-proof-2026-06-02.md`
   - `reports/agent4-leviticus-live-browser-click-proof-2026-06-02.json`
   - `reports/agent4-leviticus-live-browser-click-proof-2026-06-02.png`

2. #5 Numbers
   - `reports/agent10-candidate-page-5-shipment-prep-2026-06-02.md`
   - `reports/agent4-numbers-live-browser-click-proof-2026-06-02.md`
   - `reports/agent4-numbers-live-browser-click-proof-2026-06-02.json`
   - `reports/agent4-numbers-live-browser-click-proof-2026-06-02.png`

Delivery proof requirement: Agent 8 should record the Agent 6 submission id, target thread/channel, artifact list, requested verdict, and non-acceptance boundary.

Stop condition: Agent 6 returns a dated verdict or exact blocker for each page. Do not skip ahead by claiming validation from Agent 4 evidence alone.

## Agent 4 Proof Batch For #6-#10

Agent 7 authorizes Agent 8 to route a bounded Agent 4 live browser-click proof batch for:

- #6 Ruth: `tanakh/ruth/`
- #7 Jonah: `tanakh/jonah/`
- #8 Amos: `tanakh/amos/`
- #9 Zechariah: `tanakh/zechariah/`
- #10 Zephaniah: `tanakh/zephaniah/`

Objective: produce evidence-ready runtime proof packets, one per surface, using the same proof matrix Agent 4 used for Exodus, Leviticus, and Numbers.

Required proof points per page:

- cache-busted live URL returns `200`;
- current fullscreen Route HUD opens from declared bounded sentinel token or another declared bounded token;
- visible route cards exist;
- visible source/license/citation rows exist after click;
- old-HUD markers are absent from page, HUD text, and runtime HTML;
- route manifest and shard load from `/data/public-hud/<work>/**`;
- hard refresh remains current-HUD/no-old-HUD;
- old-HUD-looking query parameters remain current-HUD/no-old-HUD;
- poisoned localStorage/IndexedDB does not resurrect old HUD or accepted-translation wording;
- artifact states exact commit/hash, URL, screenshot path if available, issues, warnings, and non-acceptance boundary.

Expected artifacts:

- `reports/agent4-ruth-live-browser-click-proof-2026-06-02.md` plus JSON/screenshot if available.
- `reports/agent4-jonah-live-browser-click-proof-2026-06-02.md` plus JSON/screenshot if available.
- `reports/agent4-amos-live-browser-click-proof-2026-06-02.md` plus JSON/screenshot if available.
- `reports/agent4-zechariah-live-browser-click-proof-2026-06-02.md` plus JSON/screenshot if available.
- `reports/agent4-zephaniah-live-browser-click-proof-2026-06-02.md` plus JSON/screenshot if available.

Fallback route: Agent 10 may own fallback proof only if Agent 4 delivery is unavailable, returns an exact blocker, or Agent 7/user explicitly authorizes fallback for that surface. Any fallback proof must be labeled fallback evidence and cannot become a general replacement rule for Agent 4.

Stop condition: Agent 4 returns all five proof packets or exact blockers. If one page blocks, continue the remaining pages unless the blocker affects shared runtime, shared source-of-truth, or Agent 6 scope.

## Zephaniah Source-Sensitive Row

Candidate #10 surfaces this row:

- page: `tanakh/zephaniah/`
- sentinel token: `tok-97813d949fba`
- source ref: `Zephaniah 1:1`
- surface word: `אֲשֶׁ֣ר`
- normalized word: `אשר`
- route shard: `05d0-05e9-05e8`
- source: `Project-authored function word table`
- source family: `workspace`
- source id: `project-function-word:asher`
- source URL: `local:project-function-word-table`
- license: `project-authored / CC0`
- license URL: `https://creativecommons.org/publicdomain/zero/1.0/`
- route card id: `def-layer-3d56ae9424b0cda8`

Manager decision: do not wake or interrupt Agent 1 for this row yet. Agent 1 is already active long-running on source/provenance blocker mapping. If Agent 6 requires source/provenance custody review of this row, route Agent 1 a bounded Zephaniah-only packet. Until then, preserve this as a surfaced risk, not a blocker and not acceptance.

## Agent 10 Direction

Do not restrict Agent 10 release-owner work. Agent 10 has completed prep through target #10. Next useful Agent 10 work is limited support only:

- provide exact missing artifacts if Agent 6 or Agent 4 reports a blocker;
- preserve `origin/main`/live Pages as source-of-truth for #6-#10 where local working tree is split;
- avoid starting broad unrelated prep that dilutes the target-10 validation chain.

## Forbidden Scope

No Deuteronomy or Genesis old-HUD proof loops unless new drift appears. No broad render, broad scan, source/legal policy decision, staging, commit, deploy, or destructive git action is authorized by this decision.

## Agent 8 Callback

Route next:

1. To Agent 6: ordered QA request for #3 Exodus first, with #4 Leviticus and #5 Numbers queued behind it. Include the Agent 10 prep artifacts, Agent 4 proof Markdown/JSON/PNG artifacts, requested verdict per exact route, and non-acceptance boundary.
2. To Agent 4: bounded browser-click proof batch for #6 Ruth, #7 Jonah, #8 Amos, #9 Zechariah, and #10 Zephaniah.
3. To Agent 1: no prompt now. Only route Zephaniah source/provenance review if Agent 6 asks for custody treatment of the `Project-authored function word table` / `project-authored / CC0` row or Agent 1 reports an exact blocker.
4. To Agent 10: no new prep route required now; standby for exact missing artifacts or fallback proof only if Agent 4 is unavailable and Agent 7/user authorizes fallback.

Stop condition: stop after Agent 6 receives the ordered #3-#5 QA cadence packet and Agent 4 receives the #6-#10 proof batch, or report exact delivery blocker.

## Not Accepted

This decision does not accept QA, validated public/runtime, source/provenance custody, source publication, source-file tracking, publication readiness, route publication support, Definition authority, product/data gates, usage-as-definition authority, translation output, accepted gloss, or accepted translation text.
