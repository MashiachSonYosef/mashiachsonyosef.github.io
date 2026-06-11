# Agent 5 Translation-Ready Data Contract

Generated: 2026-05-31

## Core Answer

To translate later without collecting additional data, the workbench must save not only evidence rows, but also translation-decision scaffolding now.

The future translation pass should be a filtering, ordering, and composition problem over existing artifacts. It should not require rediscovering lexical evidence, morphology, usage contexts, licenses, source refs, or ambiguity.

## Principle

Capture every piece of translation-relevant information during workbench mode, but label it so it does not pretend to be a translation yet.

The data model needs three separate concepts:

- Evidence: what sources, morphology, lexicons, and usage graphs say.
- Decision state: whether this token/phrase has an accepted rendering, competing renderings, or unresolved ambiguity.
- Rendering policy: how a future translation mode would convert the decision state into English prose.

## Minimum Fields Needed Now

For every token or phrase-level candidate, preserve:

- Stable source reference: work id, unit id, section ref, source URL, source version, license.
- Surface token: exact pointed form, consonantal normalized form, and unmodified display form.
- Token boundary: whole surface token id, maqaf grouping, and segmentation candidates.
- Morphology: prefix/base/suffix breakdown, part of speech, gender, number, state, stem, tense, person, pronominal suffix, and confidence where available.
- Route answers: accepted answer candidate, alternate candidates, evidence-only rows, answer eligibility, score, and reason for rejection or ambiguity.
- Usage evidence: observed source phrase, focus token marker, frame label, candidate status, score, cluster id, source/license rows.
- Translation hints: possible English renderings, literal gloss, idiomatic gloss, domain/frame label, and register note.
- Decision status: accepted, candidate, ambiguous, rejected, blocked, needs human review.
- Review provenance: reviewer/agent lane, timestamp, generator, validation script, and source artifacts.
- Non-translation flags: not_a_definition, observed_usage_only, imported_translation_forbidden, license_safe_for_translation_context.

## What Is Missing Or Weak Today

Current route cards are strong on:

- source rows and licenses,
- answer eligibility,
- route type/family,
- scores,
- definition/evidence split.

Current workbench rows are strong on:

- observed usage only,
- source/license rows,
- candidate status,
- focus token,
- usage note,
- anti-definition safeguards.

Weakness for future translation:

- No explicit translation-decision record per token/phrase.
- No accepted English rendering slot distinct from dictionary definition.
- No reason codes for why a candidate was accepted/rejected for translation.
- No phrase-level composition contract that says how word decisions combine into a sentence.
- No stable per-token occurrence id tied all the way from rendered page click to route lookup to future translation memory.

## Translation Memory Layer To Add

Add a future-facing artifact family, even if mostly empty at first:

`data/translation-memory/`

Recommended artifacts:

- `translation-decision-contract.json`
- `occurrence-decisions/<work-id>.jsonl`
- `phrase-decisions/<work-id>.jsonl`
- `translation-memory-index.json`
- `translation-release-stamp.json`

Required row shape:

```json
{
  "schema_version": 1,
  "artifact_type": "translation_decision",
  "decision_id": "",
  "work_id": "",
  "unit_id": "",
  "source_ref": "",
  "surface_token_id": "",
  "surface_text": "",
  "normalized": "",
  "scope": "token|phrase|clause|sentence",
  "decision_status": "accepted|candidate|ambiguous|rejected|blocked|needs_review",
  "english_rendering": "",
  "literal_gloss": "",
  "idiomatic_gloss": "",
  "route_card_ids": [],
  "usage_evidence_ids": [],
  "morphology_ids": [],
  "ambiguity_notes": "",
  "rejection_reason": "",
  "license_safe": true,
  "not_a_translation_yet": true,
  "source_rows": [],
  "created_by": "",
  "created_at": "",
  "validated_by": []
}
```

## How This Lets Translation Happen Later

Later translation mode can:

- Select accepted token/phrase decisions.
- Fall back to candidate decisions only if policy allows.
- Pull phrase/context evidence when word-level gloss is insufficient.
- Exclude `not_a_definition` and `observed_usage_only` from direct rendering while still using them as context.
- Generate draft English from stored renderings and phrase decisions.
- Show every translation choice with source/evidence provenance.

No new data needed, only a new renderer/composer and possibly human review over already-captured candidates.

## Control Requirements For Agents

Agent 2:

- Add route-card fields or sidecar mapping for `translation_hint`, `literal_gloss`, `idiomatic_gloss`, `decision_status`, and `rejection_reason`.
- Do not confuse dictionary definition with translation rendering.

Agent 3:

- Keep usage evidence as not-a-definition, but include stable IDs that can be cited by translation decisions later.
- Produce cluster/frame labels useful for translation choice, not just graph diagnostics.

Agent 4:

- Ensure rendered tokens have stable occurrence IDs that survive page rebuilds.
- HUD click should expose the occurrence ID, not just normalized lookup key.

Agent 5:

- Block any architecture that only preserves final visible HUD text.
- Require every future-facing row to preserve source/license and decision status.

## Product Rule

Workbench mode should collect translation memory before translation mode exists.

Every click should eventually answer:

- What is this exact surface token?
- What are its possible meanings?
- What evidence supports each?
- Which rendering would we choose later?
- Why is that choice safe, ambiguous, or blocked?

If those answers are stored now, translation mode can come months later without new evidence gathering.
