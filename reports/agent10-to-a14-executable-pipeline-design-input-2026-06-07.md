# Agent10 -> A14 Executable Pipeline Design Input

Generated: 2026-06-07

Audience: A14 redesign / company pipeline architecture.

Purpose: preserve the useful parts of the current Hebrew Workbench agent system while reshaping it into executable specifications that produce real rendered pages, reduce randomness, and let less capable models run the same outputs without improvising.

Boundary: design input only. No repo mutation beyond this report, no approval, no publication/release, no source/license/legal/Definition/product/answer/accepted-text acceptance.

## Core Opinion

The company should stop thinking in pharma-SOP terms and move to executable pipeline specs.

SOP language has been producing governance churn: agents write status, ask other agents for authority, preserve caveats, and then stall. The Hebrew Workbench needs a production pipeline model:

1. Every useful lane has an executable contract.
2. Every contract has exact inputs, commands, outputs, validators, stop conditions, and mutation boundaries.
3. Every agent either produces a page/artifact, validates a page/artifact, or returns a named blocker that another pipeline can consume.
4. No agent should need to infer the company structure from lore.
5. The repo must be clean enough that any dirty file is either an intended output, an explicit blocker, or removed from the active lane.

The goal is not "more agents." The goal is fewer undefined handoffs.

## Design Target

The company should be able to run a book/work from source text to checkable full-page render like this:

`source package -> occurrence roster -> lexical/linkage evidence -> route HUD cards -> pre-HUD rows -> actual corpus page -> validator proof -> approval/release gate`

Every stage should be runnable from a spec file by a less capable model.

If a stage cannot run, the output should be a blocker with this shape:

`pipeline_id | input file | command attempted | timeout | missing field/path/schema | exact next owner | stop condition`

No prose-only blockers.

## Required Runes

These terms should be defined once and reused everywhere.

| rune | definition |
|---|---|
| `source_page_visibility` | A source/work page may be visible as corpus text even if definitions remain TBD/unaccepted. |
| `prehud_definition_layer` | The row-level gloss/match layer above the HUD. It displays selectable route/default output only, otherwise quiet TBD. |
| `route_hud` | The popout/dialog evidence surface using current route cards, strict matches, lemma/reference evidence, crossmatches, and source/license details. |
| `occurrence_roster` | The token/occurrence list that drives row counts. This is the 1:1 render contract. |
| `route_card` | Evidence card loaded from route lookup outputs. It is not accepted text by default. |
| `selectable_card` | A card that passes explicit selection gates such as `answer_eligible=true`, allowed answer role, route rendering present, and non-usage-evidence. |
| `evidence_only_card` | A visible HUD card that cannot fill pre-HUD or accepted text. |
| `quiet_tbd` | Display-integrity placeholder only. It must not behave like a definition, accepted gloss, answer, or failure banner. |
| `source_lane` | `commercial_clean_candidate`, `noncommercial_educational_candidate`, `metadata_or_link_only`, or `blocked_or_needs_review`. |
| `boundary_packet` | Exact row/subset packet asking A06/A07/A6-type review only for the next authority-sensitive move. |
| `approval_gate` | A07-owned final approval/release gate. Evidence validators do not equal approval. |
| `dirty_output` | A modified/untracked file created by a pipeline. It must be classified as intended output, evidence-only artifact, stale byproduct, or blocker. |

## Role Redesign

### A14: Product / Render Architect

A14 should own the render contract and UX convergence:

- canonical full-page render target;
- page templates;
- header/library/corpus organization;
- Orot-style HUD design inheritance;
- pre-HUD row behavior;
- actual browser/page proof expectations;
- rendered page readiness checklist.

A14 should not invent evidence rules. A14 consumes pipeline outputs.

### A10: Release / Package Director

A10 should own package truth and release relevance:

- consume A1-A4 outputs;
- decide whether an artifact is page-relevant, boundary-relevant, or blocker-only;
- assemble exact boundary packets;
- prevent overclaims;
- maintain zero-public/output/answer/Definition counters unless a gate clears them;
- produce release state matrices.

A10 should not do low-value mechanics unless a pipeline is blocked and the next output is release-critical.

### A1: Source / License Lane Owner

A1 owns source-family classification and source/lane evidence:

- source family;
- license lane;
- required source/license fields;
- NC separation;
- citation/url blockers;
- source custody.

No A2 transform should be release-usable without A1 lane evidence.

### A2: Transform / Candidate Package Owner

A2 owns converting lane-cleared evidence into transform/readiness matrices:

- candidate package rows;
- proposed text fields only when allowed;
- no-text/null transform rules when not allowed;
- row counts and occurrence counts;
- readiness matrix validators.

A2 must preserve source lanes and not fill from lemma/evidence-only cards.

### A3: Linkage / Dedupe / Navigation Owner

A3 owns how rows connect:

- route-card matching;
- duplicate keys;
- source-RID exact scope;
- crossmatches;
- navigation matrices;
- row-level contract packets when downstream rows are ambiguous.

A3 does not accept definitions; A3 makes the graph navigable and non-duplicative.

### A4: Validator / Runtime Prereq Owner

A4 owns changed-input validators and runtime proof prerequisites:

- only wakes on a changed package/input;
- runs exact validator/browser/page commands;
- returns proof or exact blocker;
- no public/runtime acceptance.

A4 should stop when no changed input exists.

### A5: State / Preservation / Routing

A5 should preserve pipeline state and unblock routing:

- current agent identities;
- current thread ids if used;
- control surfaces;
- dirty-output classification;
- handoff receipts;
- "what is the current blocker" snapshots.

A5 should reduce memory chaos, not add governance prose.

### A6: Evidence / Validator / Repo Cleaning Production

A6 should produce evidence and repo-cleaning classification:

- file generated by what pipeline;
- validator passed/failed;
- dirty file classification;
- evidence-ready dockets.

A6 is not final approval.

### A7: Approval / Release Gate

A7 owns:

- final validation approval;
- release/publication gates;
- activation of control-state or durable-law changes;
- approval/SOP/spec activation where required.

No one should ask A6 for approval.

## Executable Spec Format

Every pipeline should have a spec file, ideally JSON or YAML, in a predictable directory such as:

`data/pipelines/<pipeline_id>.json`

Required fields:

```json
{
  "pipeline_id": "daniel-full-page-render",
  "owner": "A14",
  "status": "runnable",
  "target": "tanakh/daniel/index.html",
  "inputs": [],
  "commands": [],
  "outputs": [],
  "validators": [],
  "timeouts_ms": {},
  "mutation_policy": {
    "allowed_paths": [],
    "forbidden_paths": [],
    "public_runtime_mutation": false,
    "route_shard_write": false,
    "definition_content_write": false
  },
  "counts_required": {},
  "boundary_triggers": [],
  "approval_triggers": [],
  "stop_condition": ""
}
```

If a model cannot answer from this spec, the spec is incomplete.

## Primary Pipelines

### 1. Source Page Render Pipeline

Goal: real corpus source page visible/checkable even if definitions are TBD.

Inputs:

- source text JSON;
- corpus metadata;
- page template;
- work slug.

Outputs:

- `tanakh/<book>/index.html` or equivalent;
- page report with unit count, token count, source path, generated path.

Validators:

- HTML parses;
- title/header/corpus nav exists;
- source units count matches input;
- no accidental accepted definitions;
- no public release claim.

This pipeline should not wait for Definition approval. It renders source pages.

### 2. Occurrence Roster Pipeline

Goal: exact token row contract.

Inputs:

- rendered/source text;
- tokenizer;
- work id.

Outputs:

- `data/lexical/occurrences/<work>.json`;
- count report.

Validators:

- total token count;
- every token has occurrence id/token index id;
- source unit references preserved;
- no definition text.

This is the contract that prevents fake preview shortcuts.

### 3. Route HUD Evidence Pipeline

Goal: make every token checkable in the HUD.

Inputs:

- occurrence roster;
- lexical manifest/chunks;
- route lookup manifest;
- crossmatch file if available;
- source/license rows.

Outputs:

- page with `data-lexical-hud`;
- route manifest scoped to work if needed;
- HUD proof report.

Validators:

- HUD opens;
- strict Hebrew placeholder exists;
- strict Aramaic placeholder exists;
- source/license details area exists;
- lemma section is compact/evidence-only;
- crossmatches render in shared pattern;
- no accepted gloss/text.

### 4. Pre-HUD Definition Layer Pipeline

Goal: row-level readable pre-HUD layer.

Inputs:

- occurrence roster;
- selectable route/default selection matrix;
- reader hints if cleared;
- source/license references.

Outputs:

- rows: Hebrew token | full wrapped gloss or quiet TBD | match percent/quiet TBD.

Rules:

- every token gets one row;
- full wrapped gloss only if selectable current route/default layer exists;
- lemma cards never auto-fill pre-HUD;
- if no selectable route, quiet `TBD`;
- source superscript opens/points to HUD source details;
- match percent comes from actual match/confidence/score fields only.

Validators:

- row count equals occurrence count;
- no truncation/line clamp;
- TBD is placeholder only;
- no fake definitions;
- no accepted text.

### 5. Source Lane Pipeline

Goal: stop dictionary/source chaos.

Inputs:

- source family evidence;
- dictionary/source rows;
- license evidence;
- prior excluded rows.

Outputs:

- row/subset lane map:
  - `commercial_clean_candidate`
  - `noncommercial_educational_candidate`
  - `metadata_or_link_only`
  - `blocked_or_needs_review`

Validators:

- no "new dictionary = NC";
- no "old excluded = blocked";
- NC rows have required NC flags;
- commercial exports exclude NC rows;
- source citation/url present or exact blocker.

### 6. Transform Readiness Pipeline

Goal: make A2 output useful without overclaiming.

Inputs:

- source lane map;
- route/linkage evidence;
- row subset.

Outputs:

- transform/readiness matrix;
- proposed text fields only when allowed;
- no-text/null transform rule when blocked.

Validators:

- lane separation preserved;
- all text fields null when prerequisites missing;
- zero answer/public/Definition counters unless cleared;
- exact blockers by row/subset.

### 7. Boundary Packet Pipeline

Goal: exact review packets only when useful.

Inputs:

- transform/readiness matrix;
- source/lane evidence;
- validator receipts;
- row/subset counts.

Outputs:

- A06 evidence packet or A07 approval packet, depending on gate.

Rules:

- A06: evidence/validator/repo-cleaning.
- A07: approval/final validation/release gate.
- No broad "is this okay?" packets.
- Question must name exact row count, occurrence count, lane split, artifacts, requested permission, and forbidden claims.

### 8. Dirty Repo Classification Pipeline

Goal: no more dirty repo mystery.

Inputs:

- `git status --short`;
- pipeline spec registry;
- generated artifact manifests.

Outputs:

- dirty file classification:
  - intended pipeline output;
  - evidence-only report;
  - stale generated byproduct;
  - needs owner decision;
  - forbidden mutation.

Validators:

- no `git add -A`;
- no blind deletion;
- no reset hard;
- generated files map to pipeline ids;
- each dirty file has next owner and stop condition.

## Page Rendering Priority

The company needs visible progress. I would prioritize:

1. Daniel source page visibility and Orot-style HUD parity.
2. Daniel pre-HUD rows with quiet TBD if no selectable route exists.
3. One additional Tanakh page using the same Daniel/Orot contract.
4. Library/root/header recovery after the render contract is stable.
5. Only then broaden to more corpus groups.

This avoids "full site blast" failure while still producing real pages.

## Acceptance Boundaries

The pipeline should split these gates clearly:

| gate | owner | meaning |
|---|---|---|
| source page visible | A14/A4 proof, A10 package truth | page can render as source text with TBD/unaccepted definitions |
| HUD evidence visible | A14 render + A1/A3/A4 evidence | cards/source/license/crossmatches inspectable |
| pre-HUD gloss visible | A2/A10/A6/A7 depending on row | selectable/default route layer exists |
| Definition accepted | approval gate required | accepted definition/gloss/text |
| featured/release | A07 | final public/release gate |

This solves the Daniel confusion: source page visibility is not Definition acceptance.

## What To Stop Doing

- Stop giving every agent a broad "goal" without a pipeline spec.
- Stop accepting reports that do not contain exact next command/input/output.
- Stop waking validator lanes with no changed input.
- Stop asking A6 for approval.
- Stop treating dirty files as normal.
- Stop building reports previews as substitutes for actual pages.
- Stop letting lemma evidence fill pre-HUD.
- Stop treating `TBD` like a product failure; use it quietly as display integrity.
- Stop route/thread retries when the target is stale; preserve exact blocker and move on.

## What To Preserve

The current work is valuable. Preserve:

- Orot HUD design and behavior;
- source/license evidence discipline;
- NC lane separation;
- A07 approval route law;
- A06 evidence/validator role;
- Agent 10 release/package blocker matrices;
- Agent 1 source-lane mechanics;
- Agent 2 transform/readiness matrices;
- Agent 3 linkage/dedupe/crossmatch work;
- Agent 4 changed-input gate discipline;
- timeout reporting;
- zero-mutation counters.

But these need to become pipeline specs, not repeated prose customs.

## A14 Immediate Implementation Ask

Build one executable spec for Daniel:

`data/pipelines/daniel-orot-style-page-render.json`

It should produce or validate:

- `tanakh/daniel/index.html`;
- normal header/corpus placement;
- Orot-style Route HUD;
- strict Hebrew placeholder;
- strict Aramaic placeholder;
- compact lemma/reference section;
- source/license details;
- shared crossmatch pattern;
- pre-HUD rows driven by occurrence roster;
- quiet TBD for all non-selectable rows;
- no accepted text/publication claims.

If this spec is good, the next book should be able to run from the same spec with only `work_id`, paths, and corpus metadata changed.

## Stop Condition

A14 should stop the redesign packet when the company has:

1. role map;
2. pipeline spec schema;
3. Daniel executable render spec;
4. dirty repo classification spec;
5. approval/evidence boundary map;
6. first page validator set.

That is the point where less capable models can start producing repeatable value instead of more governance churn.
