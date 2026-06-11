# Agent 6 Route Answer Publication Boundary Docket

Generated: 2026-05-31T14:40:41-04:00

## Purpose

This Agent 6 autonomous QA pass checks a narrower control boundary than general HUD behavior:

- whether public route-answer cards can carry third-party or share-alike source authority,
- whether public HUD labels remain present and non-misleading,
- whether future translation mode could mistakenly promote route-answer authority into publishable translation text.

No implementation changes were made.

## Evidence Reviewed

- `data/definitions/hud-route-store-sample.json`
- `data/translation-memory/translation-decision-contract.json`
- `data/translation-memory/attribution-manifest.json`
- `tanakh/genesis/index.html`
- `orot/index.html`
- `jewish-thought/abarbanel-on-guide-for-the-perplexed/index.html`
- `gra/yahel-ohr-on-zohar/index.html`
- `.codex-tmp/agent6-translation-license-profile-audit.json`
- `.codex-tmp/agent6-source-license-label-audit.md`

## Acceptance Call

Public HUD source attribution is present.

Public HUD publication-safety labeling is not present.

Future publication remains blocked unless Agent 5 proves that route-answer authority cannot flow directly into translation output without translation-memory license gates.

## Findings

### Blocker: route-answer authority still exists on CC BY-SA/GFDL cards

Owning lanes: Agent 2 and Agent 5

Evidence:

- `data/definitions/hud-route-store-sample.json` contains 193 sample cards and 6 answer-eligible cards.
- At least 5 sampled answer-eligible cards are sourced only from `kaikki` with license `CC BY-SA 4.0 / GFDL`.
- Representative answer-eligible cards include:
  - `דְּבָרִים` -> `def-kaikki-lemma-ffa0cfc9e083af0d`
  - `בראשית` -> `def-kaikki-lemma-052c60e4c3f4243b`
  - `בראשית` -> `def-kaikki-lemma-1bc390b3d186c3e1`
  - `ראשית` -> `def-kaikki-lemma-e4f94cd5131316a8`
  - `ראשית` -> `def-kaikki-lemma-3205dd299f7cabfc`
- The sampled `דְּבָרִים` answer card is explicitly `answer_eligible: true`, `answer_role: "answer"`, with only one source row: Kaikki `CC BY-SA 4.0 / GFDL`.

Control interpretation:

- This is acceptable only if route answers are treated as public workbench/HUD authority with visible source/license labels, not as future publishable translation text.
- This is a release blocker for publication because the route layer itself does not carry the translation-memory `direct_translation_use_ok` gate.

Acceptance condition:

- Agent 5 must prove future translation mode cannot ingest route-answer cards directly.
- The only direct publication path may come from accepted translation-memory rows that satisfy `decision_status=accepted` and `license_profile.direct_translation_use_ok=true`.
- If Agent 5 wants route answers to be publishable seeds, Agent 2 must add an explicit publication gate field that excludes `workbench_ok_publication_review` and equivalent share-alike/copyleft rows.

### Warning: public HUD labels source and license, but not publication-review status

Owning lanes: Agent 4 and Agent 5

Evidence:

- In `tanakh/genesis/index.html` and `orot/index.html`, `appendSourceFootnotes()` renders public HUD footnotes as:
  - linked `source_name` when URL exists,
  - `source_id`,
  - `displayLicense(row)`.
- The public HUD code does not expose:
  - `publication_class`
  - `direct_translation_use_ok`
  - `workbench_ok_publication_review`
  - `share_alike_required`
  - `copyleft_review_required`
  - `attribution_required`

Control interpretation:

- For public HUD display, this is acceptable as a warning rather than a blocker because the user asked for source/license/citation truth, not a publication workflow UI.
- For downstream governance, the absence of a publication-review marker means a reader-facing answer can look final even when it is not publishable.

Acceptance condition:

- Agent 5 should decide whether public HUD needs a visible `workbench evidence` / `not publication-cleared` label for answer cards whose sources are not direct-use safe.
- If not exposed in UI, the boundary must at least remain explicit in release documentation and future renderer controls.

### Warning: public source pages still display ambiguous `PD` labels

Owning lane: Agent 1

Evidence:

- `jewish-thought/abarbanel-on-guide-for-the-perplexed/index.html`, `gra/yahel-ohr-on-zohar/index.html`, and `other/shem-tov-on-guide-for-the-perplexed/index.html` each display `License: PD`.
- `.codex-tmp/agent6-source-license-label-audit.md` reports 1,406 unrecognized source-unit labels, all `PD`.

Control interpretation:

- Public attribution is present, but the label is not precise enough for a defensible provenance/control story.

Acceptance condition:

- Normalize `PD` to a project-approved explicit label such as `Public Domain` or `Public Domain Mark`.
- Preserve edition/source basis and source URL.

### Accepted With Boundary: route HUD source footnotes are present and not hidden

Owning lane: Agent 4

Evidence:

- `appendSourceRefs()` attaches source indices to card heads/renderings.
- `appendSourceFootnotes()` renders a visible `Sources and licenses (n)` disclosure block in Genesis, Orot, and sampled public pages.
- Footnotes include source name, source id, and license, with a clickable source URL when available.

Control interpretation:

- This satisfies the narrow HUD truthfulness requirement better than a HUD that shows unlabeled evidence.
- It does not convert route answers into publication-safe text.

Acceptance condition:

- Keep the source/license footnote block on all public HUD pages.
- Do not compress these rows into unlabeled badges or remove source URLs.

### Accepted With Condition: translation-memory publication gate remains coherent

Owning lane: Agent 5

Evidence:

- `data/translation-memory/translation-decision-contract.json` says only `decision_status=accepted`, `license_safe=true`, and `license_profile.direct_translation_use_ok=true` rows may be rendered directly by future translation mode.
- `.codex-tmp/agent6-translation-license-profile-audit.json` reports:
  - 40 rows total
  - 21 `publication_ok`
  - 16 `publication_ok_with_attribution`
  - 3 `workbench_ok_publication_review`
  - `accepted_blocked: []`

Control interpretation:

- The translation-memory control model is internally coherent.
- The unresolved risk is not translation memory itself; it is a future shortcut from route answers to translation output.

Acceptance condition:

- Agent 5 must maintain the rule that route answers are evidence inputs, not publication outputs, unless they are copied into validated translation-memory rows.

## Relay For Agent 5

Tell Agent 2:

- Route answer authority currently includes Kaikki CC BY-SA/GFDL cards.
- That is acceptable only as public HUD/workbench authority, not as publication authority.

Tell Agent 4:

- Public HUD footnotes are doing their job on source/license disclosure.
- Do not remove them while simplifying the panel.

Tell Agent 5:

- The current publication blocker is architectural, not cosmetic: route-answer authority and translation-publication authority are still distinct systems, and they must stay distinct.
- If any future renderer reads route answers directly, Agent 6 blocks publication until direct-use-safe gating is proven.

Tell Agent 1:

- `PD` shorthand remains a provenance warning across public source pages and source-unit files.
