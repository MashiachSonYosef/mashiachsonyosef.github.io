# Agent11 -> A14 Live Site Pipeline Design Input

Generated: 2026-06-07

Audience: A14 company/pipeline redesign.

Source lane: Agent 11 reception/product translator, now live homepage/public-site publisher after upstream gates.

Purpose: preserve the useful reception layer while turning A11 into an executable live-surface publisher that reduces repo chaos and produces visible pages only from approved publishing packets.

Boundary: design input only. No release claim, no approval, no source/license/legal/Definition/product/answer/accepted-text acceptance.

## Core Recommendation

A11 should not be a broad website editor and should not be another validator.

A11 should become the final bounded live-surface publisher:

`approved publishing packet -> homepage/public-site mutation plan -> bounded file mutation -> runtime/public-surface proof -> publication receipt or exact blocker`

The key change is that A11 should publish only visibility, framing, and reader-surface access. A11 must not create source evidence, convert definitions, render broad corpus pages, approve validation, or decide source/legal status. If the packet is missing or ambiguous, A11 returns a blocker instead of improvising.

This lets weaker models run the same lane because the hard decisions are encoded in the packet schema.

## A11 Pipeline

### 1. Publishing Packet Intake

Required input packet fields:

| field | requirement |
| --- | --- |
| `pipeline_id` | Stable ID, for example `a11_live_site_publish`. |
| `target_surface` | `homepage`, `public_directory`, or `source_page_link`. |
| `source_page_path` | Exact page path to surface, such as `tanakh/daniel/index.html`. |
| `visibility_action` | `add`, `keep`, `hide`, `demote`, or `no_change`. |
| `page_render_proof` | A05/A10 render proof path showing the page exists and is not merely planned. |
| `validator_proof` | A04 proof path for the changed input or exact validator blocker. |
| `approval_gate` | A07 approval gate path/status for final validation/release visibility. |
| `authority_boundary` | Exact statement of what the surface may claim and what remains TBD/evidence-only. |
| `tbd_policy` | Whether `TBD` is hidden, quiet placeholder, or separator; never definition text. |
| `copy_contract` | Exact title/subline/card text to show or exact instruction to preserve existing copy. |
| `orot_policy` | `omit_homepage_until_owner_reopens`, unless an explicit owner/A07 packet says otherwise. |
| `dirty_repo_scope` | Exact files A11 may touch and classification of existing dirt in those files. |
| `proof_commands` | Exact commands A11 must run after mutation. |
| `rollback_note` | How to reverse the bounded surface mutation if proof fails. |
| `stop_condition` | Exact point where A11 stops. |

If any required field is missing, A11 emits:

`A11_PUBLISH_BLOCKER | packet | missing_field | exact owner | required fix | stop condition`

### 2. Permission Gate

A11 may publish only when all are true:

- page render proof exists;
- A04 validator/prereq proof exists or its exact blocker is resolved;
- A07 approval gate is present for live visibility;
- packet says the exact surface is allowed under current boundary;
- dirty repo scope is bounded to the files A11 will touch;
- Orot is not added/promoted unless the owner explicitly reopens it;
- `TBD` remains a display separator or quiet placeholder, not a definition.

If any condition fails, the output is a blocker, not a partial page.

### 3. Mutation Plan

A11 mutates the public surface only.

Allowed mutation classes:

- homepage/header/public-directory copy;
- add or remove one approved link/card;
- mark a page visible, hidden, or demoted according to the packet;
- remove stale public framing such as `Lightweight public HUD surface`;
- preserve library structure unless the packet says otherwise.

Forbidden mutation classes:

- broad corpus render/churn;
- source text generation;
- definition/reader-hint conversion;
- route-shard generation;
- source/license/legal interpretation;
- approval/validation substitution;
- dirty repo cleanup outside the allowed surface files.

### 4. First Live Surface Rule

The homepage should be a clean library surface, not a proof dump.

Recommended first rule:

`Show source/work pages only after actual render proof plus A07 visibility approval; show definitions only as TBD/quiet placeholders unless a separate approved definition packet authorizes stronger text.`

Daniel example:

`Daniel may become visible as an ordinary source/work page only when the publishing packet carries A10/A05 render proof, A04 proof, and A07 approval. That visibility does not imply accepted definitions, answer text, source/license/legal acceptance, or publication of the pre-HUD definition layer.`

Orot example:

`Orot is preserved as work already done, but omitted from homepage promotion until the owner explicitly reopens it through a packet. Omission means no deletion and no loss of artifacts.`

### 5. Runtime Proof

A11 should run only public-surface proof, not broad QA.

Minimum proof output:

| check | proof |
| --- | --- |
| `target_file_changed_only` | Changed files match packet scope. |
| `homepage_parses` | Static HTML parser or project validator passes. |
| `approved_link_present_or_absent` | Link/card state matches packet action. |
| `stale_public_copy_absent` | No `Lightweight public HUD surface` or equivalent stale deployment copy. |
| `tbd_boundary_preserved` | No `TBD` converted into definition/answer text. |
| `orot_policy_preserved` | Orot omitted/promoted according to explicit packet only. |
| `dirty_scope_reported` | Any touched dirty file is classified as intended output or blocker. |

### 6. Publication Receipt

Every A11 run should end with one receipt:

`receipt_id | packet | touched files | action | proof commands | proof result | live-surface status | owner line | blockers | stop condition`

Receipt statuses:

- `published_visible_surface`
- `published_hidden_or_demoted_surface`
- `no_change_surface_already_correct`
- `blocked_missing_packet_field`
- `blocked_missing_a07_gate`
- `blocked_missing_render_proof`
- `blocked_dirty_scope`
- `blocked_orot_reopen_missing`
- `blocked_tbd_boundary_violation`
- `blocked_runtime_proof_failed`

### 7. A11 Owner Line Template

Use this owner line after every run:

`A11 changed only the live surface requested by the packet: [action]. Page visibility is [visible/hidden/no change]. Definitions remain [TBD/evidence-only/not touched]. A07 approval dependency is [path/status]. Remaining blocker is [none/exact blocker].`

Never say:

- release-ready;
- source/license accepted;
- definition accepted;
- answer accepted;
- public runtime accepted;
- QA accepted;
- product approved.

### 8. Dirty Repo Rule

A11 cannot solve the whole dirty repo.

A11 can reduce chaos by refusing to add new ambiguous dirt:

`A11 may touch only packet-listed files. Every touched file must be classified as intended live-surface output or exact blocker. If the target file is already dirty, the packet must say whether A11 is allowed to layer on top of it.`

This keeps A11 useful without turning it into IT or broad cleanup.

## Interface With Other Roles

| role | A11 dependency |
| --- | --- |
| A05 | Renders broad corpus pages and page files. A11 only surfaces approved pages. |
| A06 | Converts evidence/definition packets. A11 does not convert `TBD`. |
| A07 | Owns final approval/release/public visibility gates. |
| A10 | Supplies package/release strategy and approved publishing packets. |
| A04 | Supplies validator/prereq/runtime proof for changed inputs. |
| A14 | Defines the pipeline schema and public-surface architecture. |

## A11 Ask To A14

Define one canonical publishing packet schema and one canonical receipt schema.

Do not let A11 publish from chat context, agent lore, raw reports, or "seems approved" language. The publisher lane should be boring: exact packet in, bounded surface out, receipt or blocker.

That is how A11 helps the company move from random valuable work to usable visible output without corrupting authority boundaries.
