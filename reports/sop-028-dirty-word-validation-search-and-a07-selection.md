# SOP-028: Dirty-Word Validation Search And A07 Selection Gate

Status: draft executable pipeline.
Generated: 2026-06-06.
Owner intent: find dirty/TBD/mismatched Hebrew word rows, search existing repo evidence the way Agent 3 has been doing, select only validated word matches, and run the A07-style final approval gate inside this same pipeline.

Boundary: search, evidence, selection, and approval pipeline only. This SOP does not create Definition authority, source/license/legal acceptance, public/runtime acceptance, accepted gloss/text, or release approval.

## Purpose

When a work page has dirty words, `TBD` rows, lemma-default mistakes, stale route choices, or pre-HUD/HUD mismatches, the fix is not a manual guess and not a new renderer.

The fix is:

```text
inventory target words
search existing Agent 3-style occurrence/crossmatch evidence
class candidate match status
select only rows that pass the rule
run the A07 final validation/approval gate in this pipeline
render only after A07 approval or explicit owner instruction
```

## Roles

These are pipeline functions, not excuses to hand work away. A runner executing this SOP must perform each function or stop with the exact missing-capability blocker.

| pipeline function | owns | may output | may not output |
|---|---|---|---|
| Search runner | executes this SOP exactly | dirty-word inventory, search hits, candidate matrix | approval, accepted gloss, render authority |
| Agent 3-style search lane | occurrence/crossmatch/concordance evidence | evidence rows with refs, route ids, source/license pointers | answer selection, Definition authority, publication support |
| A06 evidence lane | validator and repo-cleaning evidence when dirty files are involved | evidence-ready packet, risk/classification table | approval |
| A07 approval gate | final QA, selection approval, changed-row approval, final validation approval | `A07_APPROVED`, `A07_APPROVED_WITH_WARNINGS`, `A07_BLOCKED` | blind cleanup, unvalidated evidence generation |
| Renderer/publisher | applies only approved selected rows | page/render artifact after approval | selecting words, approving source/license, widening scope |

## Dirty Word Definition

A dirty word is a specific token row that meets at least one condition:

| condition | example |
|---|---|
| unresolved pre-HUD row | gloss column is `TBD` |
| mismatched default | pre-HUD chooses lemma/letter/card that is not the intended word sense |
| missing HUD route | token opens no route or no evidence cards |
| stale selected row | selected gloss came from an older route file or stale registry/version |
| source/license uncertainty | candidate exists but source/license lane is not approved for visible pre-HUD |
| changed/flagged row | repo dirt touches the token, route, reader-hint, or generated page row |

Dirty status is row-scoped. Do not revalidate a whole work unless every row is changed or A07 explicitly orders a whole-work audit.

## Search Inputs

Required inputs for each run:

```text
work_id
target_scope
source_units_path
token_index_path
occurrence_path
current_page_path
route_lookup_manifest_path
candidate_sources
dirty_tree_scope
requested_output
stop_condition
```

Default Daniel input shape:

```text
work_id=daniel
source_units_path=data/sources/daniel.json
token_index_path=data/lexical/token-indexes/tanakh/daniel.json
occurrence_path=data/lexical/occurrences/daniel.json
current_page_path=tanakh/daniel/index.html
route_lookup_manifest_path=data/definitions/hud-route-lookup/manifest.json
candidate_sources=data/definitions data/public-lexical data/lexical reports/workbench-usage-* reports/agent3-*
```

## State Machine

| state | trigger | action | output artifact | success condition | timeout | fallback | owner |
|---|---|---|---|---|---|---|
| `INTAKE` | owner/A07 requests dirty-word search, or render is blocked by `TBD`/mismatch | record work id, exact row scope, source paths, dirty-tree scope, and requested output | intake row in search packet | scope is row/work bounded and not whole-repo vague | 10 minutes | return `BLOCKED_MISSING_SCOPE` | search runner |
| `DIRTY_WORD_INVENTORY` | intake complete | enumerate token rows from token index/page/reader hints; mark `TBD`, mismatch, stale, route-missing, changed/flagged | `dirty_words` table/json | each target row has token id, surface, normalized key, source ref, current display state | 20 minutes per work | if page/token index mismatch, block exact file pair | search runner |
| `NORMALIZE_KEYS` | dirty words exist | compute exact surface, mark-stripped normalized key, maqaf/prefix variants, and known aliases | key matrix | every target has at least exact and normalized search keys | 10 minutes | mark row `NO_SEARCH_KEY` | search runner |
| `AGENT3_STYLE_SEARCH` | keys exist | search existing occurrence/crossmatch/concordance/route evidence for each key | candidate hit matrix | hits cite artifact path, row/id, source/license, match type, score if present | 30 minutes per batch | rows with no hit remain `TBD_NO_VALID_MATCH` | search runner |
| `CLASSIFY_MATCH` | candidate hits exist | classify candidate as `preHUD_selectable`, `HUD_evidence_only`, `lemma_only`, `license_blocked`, `ambiguous`, or `no_hit` | classified matrix | every candidate has one class and reason | 20 minutes | ambiguous defaults to `HUD_evidence_only` or `TBD` | search runner |
| `A06_EVIDENCE_CHECK` | repo dirt or source/license risk touches candidate | run bounded validators and dirty-path classification for affected rows only | A06-style evidence section | dirty paths and candidate rows are classified; no approval claimed | 30 minutes | mark `A06_EVIDENCE_BLOCKER` | evidence function |
| `A07_SELECTION_PACKET` | classified matrix complete | assemble exact changed-row approval packet inside the run | A07 selection section | packet includes target rows, proposed selected gloss, match percent, evidence, license/source, validators, rollback, stop condition | 20 minutes | return `A07_PACKET_INCOMPLETE` | approval gate input function |
| `A07_DECISION` | A07 selection section is complete | approve, warn-approve, or block each exact changed row by the A07 gate criteria below | A07 verdict section | each row has final disposition and boundary | 30 minutes | no row is selected without A07 disposition | A07 gate function |
| `SELECTION_WRITE` | A07 approves exact rows | write only approved selected rows to the approved selection/hint layer | changed selection artifact | only A07-approved rows changed; unapproved rows remain `TBD` | 15 minutes | revert exact selection artifact change | renderer |
| `RENDER_VALIDATE` | selection artifact changed | run render and validators for same work | render report and validator output | row count unchanged; selected rows display full gloss and match percent; HUD still exposes source/license evidence | 20 minutes | block render, keep previous page | renderer |
| `FINAL_A07_REVIEW` | render validators pass | run final A07 gate over changed-row/render proof | final validation section | A07 gate approves final changed-row render or blocks exact issue | 20 minutes | do not publish | A07 gate function |

## A07 Gate Criteria

The A07 gate is executable logic inside this SOP. It is not a chat handoff.

For each proposed row, issue exactly one disposition:

| disposition | required condition |
|---|---|
| `A07_APPROVED` | exact token/normalized match, source/license lane allowed, non-ambiguous gloss, match percent or approved score present, validators pass, rollback path present |
| `A07_APPROVED_WITH_WARNINGS` | row is usable but has a stated non-blocking warning, such as selected route depends on existing HUD evidence display while pre-HUD remains narrow |
| `A07_BLOCKED` | missing evidence, lemma-only, ambiguous, license/source blocked, validator failure, dirty-tree risk unresolved, or row/page count mismatch |

The A07 gate must block the row rather than defer if evidence is incomplete. The runner can later be an agent, script, or human reviewer, but the criteria stay the same.

## Search Method

For every dirty word, search in this order:

| order | search target | required evidence |
|---|---|---|
| 1 | existing selected reader hints / public lexical rows for the same work | exact token id or exact normalized key, match percent, source/license pointer |
| 2 | HUD route lookup data | route id/card id, source/license, score/match percent, answer role/status |
| 3 | Agent 3 occurrence/crossmatch/concordance artifacts | occurrence refs, local work anchor, source/license/version, usage-only boundary |
| 4 | old-dictionary/source-family evidence packets | license lane, relation class, row/subset boundary, no NC/public conflict |
| 5 | broader repo fixed-string search | artifact path, row id, exact key, no acceptance claim |

Search commands must be bounded and row-scoped. Example command shape:

```powershell
rg -n --fixed-strings "<normalized_key>" data/definitions data/public-lexical data/lexical reports -g "*.json" -g "*.csv" -g "*.md"
```

Do not use search output as selection. Search output becomes evidence only.

## Selection Rules

| candidate condition | pre-HUD action | HUD action |
|---|---|---|
| exact token/normalized match, source/license allowed, non-ambiguous gloss, A07 approved | show full gloss and match percent | keep full evidence and source/license visible |
| exact match but not A07 approved yet | `TBD` | show evidence if HUD route exists |
| lemma-only match | `TBD` | evidence only |
| prefix/clitic relation without signed rule | `TBD` | evidence only |
| NC / blocked license for public pre-HUD | `TBD` | show only if existing HUD boundary allows evidence display |
| conflicting candidate glosses | `TBD` | show candidates as evidence, not selected |
| no hit | `TBD` | show no-valid-match status |

Default:

```text
no_A07_row_approval = no_preHUD_selection
lemma_only = never_preHUD_selection
ambiguous = TBD
license_blocked = TBD
```

## A07 Selection Packet Fields

Each proposed selected row must include:

```text
work_id
token_id
source_ref
surface
normalized_key
current_preHUD_display
current_HUD_status
proposed_gloss
proposed_match_percent
candidate_class
evidence_artifacts
source_name
license
license_lane
route_id_or_card_id
validator_commands
validator_results
dirty_tree_scope
files_to_change
rollback_path
acceptance_boundary
stop_condition
```

## Required Validators

A valid implementation of this SOP must prove:

| validator | pass condition |
|---|---|
| inventory validator | dirty-word rows exist only in requested scope; every row has token id, source ref, surface, normalized key |
| search validator | each selected candidate cites an artifact path and row/card/route id |
| match validator | selected row is exact normalized/token match or has a separately signed relation rule |
| license validator | selected pre-HUD row is not NC/blocked/unlicensed for visible public use |
| lemma validator | lemma-only candidates are never selected into pre-HUD |
| A07 packet validator | every changed row has A07 disposition before selection write |
| render validator | row count is unchanged and only approved rows changed from `TBD` to gloss |
| HUD validator | selected word opens HUD and source/license evidence remains visible |
| scope validator | no whole-corpus revalidation unless A07/owner explicitly requested it |

## Forbidden Shortcuts

Do not:

```text
select from raw rg output
select lemma-only rows into pre-HUD
turn Agent 3 usage evidence into Definition authority
redo all validated words without changed/flagged-row trigger
modify route shards without an approved packet
write candidate text from NC/blocked sources into public pre-HUD
claim A06 evidence is approval
skip A07 row disposition
render first and ask owner to inspect rough work
use git add -A, reset --hard, blind cleanup, or broad report deletion
```

## Stop Conditions

Stop and report the exact blocker when:

| blocker | required output |
|---|---|
| no dirty-word scope | `BLOCKED_MISSING_SCOPE` |
| token index and page row count disagree | exact file pair and counts |
| no candidate hit | row remains `TBD_NO_VALID_MATCH` |
| only lemma/ambiguous evidence exists | row remains `TBD_HUD_EVIDENCE_ONLY` |
| license/source lane is blocked | row remains `TBD_LICENSE_BLOCKED` |
| A07 has not approved row | row remains `TBD_A07_PENDING` |
| validator fails | failed command, output, next safe action |

## Output Contract

Every run produces:

```text
reports/<work_id>-dirty-word-validation-search-<date>.json
reports/<work_id>-dirty-word-validation-search-<date>.md
```

If rows are proposed for selection, also produce A07-gated sections in the same run:

```text
reports/<work_id>-a07-selection-packet-<date>.json
reports/<work_id>-a07-selection-packet-<date>.md
```

No render, selection write, publication, or release may happen from search evidence alone. Render may proceed only after the A07 gate section in this SOP approves exact rows or the owner explicitly orders a separate override. The SOP produces the exact search, selection, A07 gate, and render-validation path that later workers can run without rediscovering the process.
