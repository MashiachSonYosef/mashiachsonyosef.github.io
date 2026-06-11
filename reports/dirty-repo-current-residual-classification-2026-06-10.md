# Dirty Repo Current Residual Classification - 2026-06-10

Status: `stable_residuals_classified`
Baseline head: `f5d4fc327`

## Stabilization

- Agent 10 IT loop PID `23212` was confirmed as `scripts/start_agent10_it_pulse_loop.ps1 -IntervalMinutes 60 -RunImmediately`.
- Stop marker was written by `scripts/stop_agent10_it_pulse_loop.ps1`.
- The loop was sleeping and would not observe the marker until the next interval, so cleanup stopped that exact process.
- `.gitignore` now ignores `reports/*.stop` alongside `reports/*.pid`.

## Stage Candidates

| path | bucket | evidence |
| --- | --- | --- |
| `.gitignore` | runtime cleanup guard | ignores local `.stop` sentinels |
| `scripts/run_agent10_it_pulse_scheduled.cmd` | monitoring helper | reviewed as bounded Agent 10 pulse runner |
| `scripts/validate_agent7_governance_control.mjs` | control validator | BOM removed; `node --check` passed |
| `reports/agent10-it-change-ledger-2026-06-10.md` | monitoring evidence | records 21:23 pulse |
| `reports/agent10-it-loop-heartbeat.md` | monitoring evidence | updated to stopped state |
| `reports/agent10-scheduled-task-last.md` | monitoring evidence | records last 21:23 pulse output |
| `reports/agent10-it-pulse-2026-06-10-2123.md` | monitoring evidence | pulse output |
| `reports/agent10-agent7-it-actionable-findings-2026-06-10-2123.md` | monitoring evidence | Agent 7 actionable memo |
| `reports/agent6-validation-queue-health.md` | validator health evidence | Agent 6 queue health refreshed |
| `reports/agent7-governance-control-health.md` | validator health evidence | Agent 7 governance failure refreshed |
| `reports/a09-new-library-nc-import-goal-state-2026-06-10.md` | support/governance evidence | A09 active goal state, not finished |

## Residual Blockers Left Unstaged

| path(s) | bucket | blocker / decision |
| --- | --- | --- |
| `data/lexical/crossmatches/daniel.json` | crossmatch data | generated_at-only diff; no preHUD/ranker eligibility change; defer rather than stage timestamp-only churn |
| `data/sources/a-new-israeli-commentary-on-pirkei-avot.json`, `data/sources/amudei-yerushalayim-on-jerusalem-talmud-nedarim.json`, `data/sources/bepardes-hachasidut-vehakabbalah.json`, `data/sources/ohr-penimi-on-talmud-eser-hasefirot.json`, `data/sources/shuvi-shuvi-hashulamit.json` | source import data | data-only guard passed, but no rendered page, lexical occurrence file, or lexical manifest exists |
| `data/overlays/a-new-israeli-commentary-on-pirkei-avot.json`, `data/overlays/amudei-yerushalayim-on-jerusalem-talmud-nedarim.json`, `data/overlays/bepardes-hachasidut-vehakabbalah.json`, `data/overlays/ohr-penimi-on-talmud-eser-hasefirot.json`, `data/overlays/shuvi-shuvi-hashulamit.json` | overlay import shells | JSON parses but overlays are empty shells; do not imply render/package completion |
| `reports/agent10-a14-cleanup-residual-dirt-packet-2026-06-10.md`, `reports/agent10-a14-cleanup-residual-dirt-packet-2026-06-10.json` | sidecar cleanup evidence | superseded by this current residual classification after two more source pairs appeared; left unstaged as historical sidecar evidence |
| `reports/agent10-live-public-old-hud-guard-2026-06-04-post-orot-reader-hint-candidate-patch.json`, `reports/agent11-reader-workbench-reception-proof-2026-06-03.json` | mislabeled report JSON | files contain Markdown beginning with `#`; JSON parse fails; do not stage as `.json` |
| `tanakh/daniel/poc-1-1.html` | Daniel support POC | Route HUD page validator fails exact canonical-page markers; do not stage as canonical Daniel page |

## Validator Results

| command | timeout | result |
| --- | ---: | --- |
| `git check-ignore -v reports/agent10-it-loop.stop reports/agent10-it-loop.pid` | `30000ms` | passed |
| `node --check scripts/validate_agent7_governance_control.mjs` | `60000ms` | passed after BOM removal |
| `node scripts/validate_agent7_governance_control.mjs` | `60000ms` | failed with 7 issues / 1 warning in control data |
| source import data-only guard over five new source/overlay pairs | `60000ms` | passed |
| `node scripts/validate_sources.mjs` | `120000ms` | process_timeout |
| `node scripts/validate_route_hud_page.mjs --page tanakh/daniel/index.html --page tanakh/daniel/poc-1-1.html` | `120000ms` | failed only on Daniel POC |
| JSON parse check over two mislabeled report `.json` files | `30000ms` | failed as expected |

process_timeout: `node scripts/validate_sources.mjs` | `120000ms` | no final validation output before timeout | next safe action: require source/import owner to run a scoped import/render/export package or full validator with enough time before staging those source pairs.

## Boundary

Cleanup classification and monitoring evidence only. No deletion, no broad revert, no QA/source/license/legal/Definition/product/answer/accepted-text acceptance, no publication/release/public-runtime acceptance.
