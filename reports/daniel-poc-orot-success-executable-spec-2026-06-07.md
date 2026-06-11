# Daniel POC Orot-Success Executable Spec

Generated: 2026-06-07

Purpose: cement the Orot-success process for Daniel without changing the company, HUD, page system, or Orot. This is a process/spec artifact only.

Owner correction: the Daniel POC must be A10's Orot page/HUD system moved around, not A14's independent/full-book-page mockup or shell.

Boundary: no repo staging, no publication, no release, no Orot mutation, no accepted definition, no accepted gloss, no answer text, no source/license/legal acceptance, no broad corpus render, and no dirty-tree cleanup action.

## Operating Rule

Daniel must run through the existing A10/Orot reader and Route HUD system.

The visual source of truth is A10's Orot page contract, especially:

- `orot/index.html`
- `assets/js/reader-workbench.js`
- `assets/css/reader-workbench.css`
- `data/lexical/occurrences/orot.json`
- `data/lexical/orot.manifest.json`
- `data/public-hud/orot/reader-hints.json`
- `data/definitions/hud-route-lookup/manifest.json`

Daniel may use Daniel-specific data paths, but its page/HUD behavior must conform to A10/Orot. The current A14-generated Daniel full-book-page style is not accepted as visual proof for this POC.

The only approved product deltas for Daniel/Ezekiel POCs are:

- organize the splash page plainly;
- render the actual Daniel page, not a reports preview;
- preserve the A10/Orot page and Route HUD behavior as the visual contract;
- show the full passage at the top of each section;
- place each Hebrew word on its own row;
- put the Hebrew word on the left;
- put the full wrapped selected pre-HUD value or quiet `TBD` beside it;
- keep click behavior opening the canonical A10/Orot Route HUD.

Any other visual, HUD, data, validation, routing, or publication change is drift and must stop.

Explicitly rejected as visual proof:

- the current A14 full-book-page Daniel proof screenshot;
- any Daniel page shell that looks like A14's independent mockup rather than A10's Orot page contract moved around;
- any proof that validates only counts while missing A10/Orot visual conformance.

## Current Daniel Proof State

Authoritative current report:

- `reports/daniel-reader-pipeline-page-report.json`

Current facts:

- `work_id`: `daniel`
- `source_units`: `357`
- `source_chapters`: `12`
- `token_rows`: `5456`
- `occurrence_total_reported`: `5456`
- `selected_prehud_rows`: `0`
- `tbd_fallback_rows`: `5456`
- `prehud_row_mode`: `one_token_per_row`
- `render_runtime`: `shared_reader_workbench`
- scoped Daniel public route lookup: `0` shards, `0` selected cards
- same-form Daniel crossmatch index: `data/lexical/crossmatches/daniel.json`

Meaning: Daniel is currently data/validator-ready as a fail-closed source page with every unresolved token staying at `TBD`. This does not approve any definition and does not prove the owner-corrected A10/Orot visual conformance.

## Canonical Files

Target page:

- `tanakh/daniel/index.html`

A10/Orot visual contract anchors:

- `orot/index.html`
- `reports/agent10-a14-orot-hud-implementation-handoff-2026-06-07.md`

Shared A10/Orot reader assets:

- `assets/css/reader-workbench.css`
- `assets/js/reader-workbench.js`

Daniel build/validation:

- `scripts/build_daniel_reader_pipeline_page.mjs`
- `scripts/validate_hebrew_workbench_public_surface.mjs`
- `reports/daniel-reader-pipeline-page-report.json`

Daniel data inputs:

- `data/sources/daniel.json`
- `data/lexical/daniel.manifest.json`
- `data/lexical/occurrences/daniel.json`
- `data/lexical/crossmatches/daniel.json`
- `data/definitions/hud-route-lookup-daniel/manifest.json`

Process inputs already produced:

- `reports/agent10-daniel-book-page-poc-spec-handoff-to-a05-2026-06-07.md`
- `reports/agent5-a06-ready-daniel-poc-packet-2026-06-07.md`

These inputs remain useful for counts, commands, data paths, and role routing. They do not prove final visual conformance until A10 returns an Orot-page-contract Daniel proof.

## Role Contract

| lane | role in this spec | stop condition |
|---|---|---|
| A10 | Prove and preserve the canonical Orot page/HUD/render contract on Daniel, with only the approved word-row movement. | Return URL/proof or exact browser blocker; do not replace pipeline. |
| A05 | Package A10's contract into exact A01-A04/A06 work only when a concrete blocker exists. | Return A06-ready or A01-A04-ready packet, or `no_concrete_blocker_named`. |
| A01 | Source/import/source-lane facts only if A05 names a concrete missing source blocker. | Return source/lane packet or exact blocker. |
| A02 | Definition/reader-hint candidate facts only if A05 names a concrete transform blocker. | Return candidate packet or exact blocker; no answer acceptance. |
| A03 | Linkage/crossmatch/navigation facts only if A05 names a concrete linkage blocker. | Return linkage packet or exact blocker; no route ranking mutation. |
| A04 | Changed-artifact checks only if A05 names a concrete changed input. | Return changed-input validation or exact blocker. |
| A06 | Clean, check, and tag concrete Daniel rows/files for display eligibility or `TBD`. | Return row/tag evidence packet or exact missing-field blocker. |
| A07 | Implement/gate final live state after A10/A05/A06 evidence is packeted and owner visual approval exists. | Return approved/warn/block gate packet. |
| A11 | Publish only from an approved packet. | Return publish receipt or exact blocker. |
| A14 | Preserve the spec, detect drift, and route exact packets; no bypass authority. | Return exact correction, packet, or blocker. |

## Execution Chain

Use this chain for Daniel POC:

```text
A10 Orot-page-contract render proof
-> A05 exact work packet
-> A06 clean/check/tag only if concrete row/tag blocker exists
-> A07 implementation/live gate
-> A11 publish only from approved packet
```

Do not run A01-A04 by default. They are already satisfied for the current fail-closed Daniel POC unless A10 or A05 names an exact missing source, candidate, linkage, or changed-input blocker.

## Commands

Build or refresh Daniel only after A10 confirms the builder preserves the Orot page contract:

```powershell
node scripts/build_daniel_reader_pipeline_page.mjs
```

Validate Daniel public surface:

```powershell
node scripts/validate_hebrew_workbench_public_surface.mjs
```

Scoped patch hygiene:

```powershell
git diff --check -- tanakh/daniel/index.html assets/js/reader-workbench.js assets/css/reader-workbench.css scripts/build_daniel_reader_pipeline_page.mjs scripts/validate_hebrew_workbench_public_surface.mjs data/lexical/crossmatches/daniel.json data/definitions/hud-route-lookup-daniel/manifest.json reports/daniel-reader-pipeline-page-report.json
```

Required timeout discipline:

- build timeout: 120000 ms
- validator timeout: 120000 ms
- diff-check timeout: 30000 ms
- browser proof timeout: 60000 ms
- agent packet timeout: 5 minutes

If an expected packet does not return within 5 minutes:

```text
packet_timeout | expected_packet | target_agent | elapsed | latest_thread_status | next_safe_action | stop_condition
```

Then perform one checkback/readback and continue from the next safe action. Do not wait indefinitely.

## A06 Activation Rule

A06 is not active for Daniel until a concrete row/tag/translation-cleaning blocker exists.

Current A05 packet status:

```text
A06 needed: no
exact blocker: no_concrete_a06_row_tag_blocker_currently_named
```

Minimum A06 task fields:

- `work_id`
- `source_ref`
- `unit_id` or `anchor_id`
- `token_index_id`
- `surface_word`
- `normalized_word`
- `row_state`
- `tag_needed`
- `expected_tag_value`
- `source_evidence_path`
- `definition_route_state`
- `tbd_display_state`
- `blocker`
- exact output artifact
- validator/proof command
- stop condition

Allowed row states:

- `tbd_display_only`
- `needs_translation_cleaning`
- `needs_tagging`
- `needs_source_evidence`
- `blocked_missing_input`

Forbidden row states:

- `accepted_definition`
- `accepted_gloss`
- `answer_text`
- `source_license_accepted`
- `publication_ready`

## TBD Rule

Rendering a source page is not definition acceptance.

The hard gate is:

```text
TBD -> cleaned/tagged candidate -> pre-HUD display eligibility -> A07 gate -> live update
```

If a token lacks required source/lane/provenance, lexical candidate, route/card, score/match, or display eligibility tags, it renders as quiet `TBD`.

`TBD` means display integrity only. It is not content, a gloss, a definition, an answer, or a source/license decision.

## Browser Proof State

A10 served the actual Daniel target through a temporary local server:

- `http://127.0.0.1:8765/tanakh/daniel/`
- `http://localhost:8765/tanakh/daniel/`

Validator passed, but the in-app browser client blocked local HTTP routes with:

```text
browser_render_proof_blocked_by_client_for_local_http_route
```

Next safe action: use an owner-approved browser path or resolve the local browser-client block. Do not substitute a `reports/*.html` preview and do not fork the HUD.

A14 follow-up proof on `http://127.0.0.1:8796/tanakh/daniel/` showed the current A14/full-book-page visual style. That proof is invalid for final POC acceptance after the owner correction. It may remain only as evidence that the route can render; it is not evidence that Daniel matches A10's Orot page contract.

## Done Definition

Daniel POC is ready for owner visual approval when current evidence proves:

- actual target page is `tanakh/daniel/index.html`;
- A10/Orot page and Route HUD behavior is preserved;
- current visual proof is not the rejected A14 full-book-page shell;
- full passage appears at the top of each section;
- `5456` Hebrew tokens render as one-token-per-row pre-HUD rows;
- unresolved rows show quiet `TBD`;
- no selected pre-HUD definitions appear while route cards are unvalidated;
- source/license evidence remains inspectable in the HUD;
- strict Hebrew and strict Aramaic placeholders are preserved;
- same-form Daniel crossmatches remain evidence only;
- validator passes;
- browser/render proof is available or an exact browser-client blocker is recorded;
- A07 gate has not been bypassed;
- no Orot mutation occurred.

## Drift Stops

Stop immediately and return an exact blocker if any actor:

- replaces A10/Orot HUD behavior;
- creates a Daniel-only HUD fork;
- uses the A14 full-book-page Daniel style as final visual proof;
- uses a reports preview as the real page;
- fills pre-HUD from lemma-only or unvalidated cards;
- treats crossmatch evidence as a definition;
- routes A01-A04 without a concrete missing input blocker;
- asks A06 to run without row/tag fields;
- treats A06 evidence as A07 approval;
- publishes or stages without owner/A07 approval;
- touches Orot before the owner explicitly reopens it.
