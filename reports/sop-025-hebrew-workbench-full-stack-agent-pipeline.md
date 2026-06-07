# SOP-025: Hebrew Workbench Full Stack Agent Pipeline

Date: 2026-06-07

Status: draft for owner/A07 approval

Purpose: make every page pipeline repeatable without identity drift, fake authority, unvalidated definitions, or improvised website behavior.

## Fixed Rules

1. Orot is the render and HUD target unless owner changes the target in writing.
2. A new work starts as a full `TBD` page. `TBD` means no accepted definition and no selectable HUD definition.
3. Lemma rows, morphology, and crossmatches are evidence/reference only. They never fill the pre-HUD gloss by themselves.
4. A06 produces validation evidence and repo-cleaning evidence. A06 does not approve.
5. A07 is the approval, SOP, final validation, and release gate.
6. A11 publishes only after A07 approval.
7. A13 is the only CEO identity. A14 is comparison/firebreak/spec unless the owner explicitly assigns implementation.
8. No agent creates a new agent, replacement authority, fake A13, or name-only route. Broken protocols are repaired under existing IDs.

## Agent Role Table

| Agent | Role | Owns | Must Not Own | Required Output |
|---|---|---|---|---|
| A01 | Source custody/import lane | source provenance, source files, import receipts | approval, publication, accepted definitions | source custody packet |
| A02 | Text segmentation/token prep lane | units, tokens, occurrence manifests, tokenization defects | definition selection, approval, publication | token/occurrence prep packet |
| A03 | Crossmatch and candidate discovery lane | same-form refs, candidate source hits, occurrence evidence | acceptance, UI render decisions, publication | crossmatch/candidate packet |
| A04 | Changed-input gate lane | changed-input checks, prerequisite proof, no-render blockers | broad corpus approval, source acceptance | changed-input gate report |
| A05 | Work churn runner | queueing next works through the approved pipeline | approval, source acceptance, identity changes | work-run receipt |
| A06 | Evidence validator and repo-cleaning production | validators, dirty-row repair evidence, nondestructive cleanup packages | approval, release, `git add -A`, reset, blind deletion | evidence-ready validation/cleanup packet |
| A07 | Approval and final gate | SOP approval, QA approval, final validation, release approval | evidence production as a substitute for approval | approved/rejected gate receipt |
| A08 | Coordinator | distributing similar works, callback collection, status compression | spawning new agents, approval, source acceptance | coordination receipt |
| A09 | Restore/watchdog | thread health, on/off restore paths, stalled-agent recovery | new identities, fake A13, approval, publication | restore/health receipt |
| A10 | Render target and implementation owner | Orot parity, shared HUD/page renderer, route-package implementation | final approval, source acceptance | render package and parity report |
| A11 | Publisher | approved live-site publish/sync, deployment receipt | approval, definition validation | publish receipt |
| A12 | Limiter | timeout enforcement, scope limit, shortcut rejection, waste control | publication, final approval, accepted definitions | limiter verdict |
| A13 | CEO/mission authority | mission priority, identity authority, owner-level routing | worker validation, fake delegation through another ID | CEO decision packet |
| A14 | Firebreak/comparison/spec | target extraction, contradiction checks, pipeline drafting, proof-of-concept only when owner assigns | standing authority, approval, accepted text | spec/proof/contradiction packet |

## State Machine A: New Work Full TBD Render

| State | Trigger | Action | Output Artifact | Success Condition | Timeout | Fallback | Owner |
|---|---|---|---|---|---|---|---|
| TARGET_LOCK | Owner names a work or render target | Extract current Orot page/HUD behavior and the one permitted formatting change | target packet | A10/A14 can point to exact target files and forbidden changes | 20 min | ask A10 for parity review | A14 |
| SOURCE_READY | Target locked | Confirm source units, token manifest, occurrences, and crossmatch index exist | source/token packet | A01/A02 artifacts cover every unit and token | 30 min | mark `SOURCE_BLOCKED` | A01/A02 |
| FULL_TBD_RENDER | Source ready | Render the work with every token as `TBD`, one word per row if the target requires it | page + render report | page loads, token row count equals occurrences, no route cards are public | 30 min | mark `RENDER_BLOCKED` with exact file/error | A10 |
| VALIDATOR_RUN | Render exists | Run static validator and scoped browser proof | validator JSON/report + screenshot if visual | zero validator issues; browser opens one HUD from a real token | 15 min | mark `PROOF_BLOCKED` | A06 |
| APPROVAL_GATE | Proof exists | Review changed files, UI proof, and boundary claims | A07 gate receipt | A07 says approved or rejected with reasons | 20 min | remain unpublished | A07 |
| PUBLISH | A07 approved | Publish only approved files through the pages workflow/site publisher | publish receipt | live URL shows approved work and no unauthorized works | 20 min | mark `PUBLISH_BLOCKED`; do not improvise | A11 |

## State Machine B: Orot-Style Word Validation

| State | Trigger | Action | Output Artifact | Success Condition | Timeout | Fallback | Owner |
|---|---|---|---|---|---|---|---|
| WORD_SELECTED | A work has `TBD` tokens | Select a token row and normalized form from the manifest | validation target row | exact token id, source ref, surface, normalized form | 5 min | choose next target row | A05/A06 |
| CANDIDATE_SEARCH | Target row selected | Search strict Hebrew, strict Aramaic, morphology, source definitions, and crossmatches | candidate packet | all candidate hits list source, license fields, relation, score basis | 20 min | leave token `TBD`; record no-hit reason | A03 |
| SOURCE_CUSTODY | Candidates found | Confirm source provenance and license fields | source custody packet | every candidate has `source_name`, `source_id`, `source_url`, `license`, `license_url` | 15 min | candidate cannot be promoted | A01 |
| VALIDATION_REVIEW | Source custody complete | Validate candidate against context and route rules | evidence-ready packet | A06 marks candidate clean or dirty with exact reason | 20 min | candidate remains HUD evidence only | A06 |
| APPROVAL | Evidence-ready packet exists | Approve/reject selected definition | A07 approval receipt | approved rows list selected card ids and match percent | 20 min | leave token `TBD` | A07 |
| PROMOTION | A07 approved | Promote only approved route cards and reader hints | route shard/reader hint package | pre-HUD fills only approved non-lemma definitions; HUD shows selector/source/license | 20 min | revert only the failed package, not unrelated work | A10 |
| LIVE_VERIFY | Promotion complete | Run validator and browser proof | proof report | live token shows selected gloss and match percent; HUD source/license opens | 15 min | mark `LIVE_VERIFY_BLOCKED` | A06/A11 |

## State Machine C: Repo Cleanup And Dirty Definition Repair

| State | Trigger | Action | Output Artifact | Success Condition | Timeout | Fallback | Owner |
|---|---|---|---|---|---|---|---|
| DIRTY_ROW_FOUND | Validator or owner flags a dirty word | Identify changed/flagged rows only | dirty-row list | no whole-corpus redo unless changed/flagged rows require it | 10 min | preserve blocker | A06 |
| REPAIR_SEARCH | Dirty row listed | Search existing validated rows and source candidates | repair candidate packet | exact replacement or exact no-match | 20 min | keep `TBD` | A03/A06 |
| CLEAN_PACKAGE | Repair candidate exists | Patch only the scoped data/render files | cleanup package | scoped diff excludes unrelated dirty repo files | 20 min | stop; do not stage broad changes | A06 |
| QA_GATE | Cleanup package exists | Approve or reject cleanup package | A07 QA receipt | A07 approves changed/flagged rows only | 20 min | package remains evidence-ready only | A07 |

## State Machine D: Identity And Communication Firebreak

| State | Trigger | Action | Output Artifact | Success Condition | Timeout | Fallback | Owner |
|---|---|---|---|---|---|---|---|
| SPOOF_OR_DRIFT | fake A13, fake agent, route stall, name-only authority, or unauthorized topology expansion | Freeze the affected operation and verify immutable ID | identity incident packet | sender has valid `agent_id`, endpoint, authority scope, registry version | 5 min | mark `IDENTITY_FREEZE` | A09/A14 |
| ROUTE_REPAIR | Valid ID but broken route | Repair existing endpoint; do not spawn replacement identity | route repair receipt | target receives direct compact packet or exact blocker is recorded | 10 min | escalate to A13/owner | A09/A08 |
| ACK_SYNC | Route repaired or identity changed | Broadcast roster/update and collect acknowledgments | ack ledger | all affected agents ack current IDs or are marked unreachable | 5 min per agent, one retry | remain frozen or owner-authorized degraded mode | A05/A09 |
| RESUME | Ack sync complete | Resume only the frozen operation | resume receipt | no new agents, no fake authority, no stale endpoint used | 5 min | keep operation frozen | A13/A07 as applicable |

## Required Page Validator Checks

Every new work validator must prove:

1. Work appears only in approved corpus buckets.
2. Source unit count and token row count match occurrence data.
3. Full `TBD` mode exposes zero public route shards/cards before validation.
4. The page uses the shared Reader Workbench CSS and JS.
5. The target layout is active: source passage above one-token rows when required.
6. The HUD opens from a real Hebrew token.
7. HUD shows Definition, strict Hebrew placeholder, strict Aramaic placeholder, lemma/reference if present, crossmatches, and source/license state.
8. Selectable gloss count is zero unless A07-approved non-lemma definition cards exist.
9. No lemma-only result fills the pre-HUD gloss.
10. Browser proof is required before claiming the page works.

## Daniel Proof Receipt

Current proof case: Daniel.

Artifacts:

- `tanakh/daniel/index.html`
- `assets/js/reader-workbench.js`
- `assets/css/reader-workbench.css`
- `scripts/build_daniel_reader_pipeline_page.mjs`
- `scripts/validate_hebrew_workbench_public_surface.mjs`
- `reports/daniel-reader-pipeline-page-report.json`
- `reports/daniel-1-1-hud-proof-2026-06-07.png`

Validator result:

- command: `node scripts/validate_hebrew_workbench_public_surface.mjs`
- result: `ok=true`
- corpus count: `10`
- Daniel source units: `357`
- Daniel token rows: `5456`
- Daniel TBD rows: `5456`
- selected pre-HUD rows: `0`
- public Daniel route shards/cards before validation: `0`

Browser proof:

- URL checked: `http://127.0.0.1:8787/tanakh/daniel/#daniel-1-1`
- Daniel 1:1 pre-HUD rows: `12`
- first row: Hebrew token + `TBD` gloss + `TBD` match
- source passage font smaller than row Hebrew
- first Hebrew token opens HUD
- HUD contains Definition, Strict Hebrew matches, Strict Aramaic matches, Same Hebrew form in Daniel, and Sources/licenses
- selectable glosses: `0`
- route cards: `0`

## Stop Conditions

Stop immediately and report an exact blocker if:

1. A page has visible definitions without A07-approved non-lemma route cards.
2. A HUD displays source/license claims without required source fields.
3. A render touches Orot while the task is Daniel or another work.
4. A06 is asked to approve instead of validate evidence.
5. A11 is asked to publish before A07 approval.
6. Any agent creates or routes through a new identity without owner/A13 approval.
7. Any cleanup requires `git add -A`, reset, blind deletion, or whole-corpus redo when only changed/flagged rows are implicated.
