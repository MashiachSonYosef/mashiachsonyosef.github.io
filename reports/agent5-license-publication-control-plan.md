# Agent 5 License Publication Control Plan

Generated: 2026-05-31T12:21:43-04:00

## Control Problem

`license_safe=true` is too coarse for future translation output.

It is acceptable as a workbench-display gate, but future publication needs to distinguish:

- project-authored or CC0-style evidence,
- attribution-required evidence,
- share-alike/copyleft evidence,
- unknown or restricted evidence.

The risk is not current workbench display. The risk is a future translation renderer treating all license-safe evidence as directly publishable English text.

## Research Basis

Sources checked:

- Creative Commons CC BY 4.0 deed: https://creativecommons.org/licenses/by/4.0/deed.en
- Creative Commons CC BY 4.0 legal code: https://creativecommons.org/licenses/by/4.0/legalcode.en
- Creative Commons CC BY-SA 4.0 deed: https://creativecommons.org/licenses/by-sa/4.0/deed.en
- Creative Commons CC BY-SA 4.0 legal code: https://creativecommons.org/licenses/by-sa/4.0/legalcode.en
- Creative Commons CC0 1.0 legal code: https://creativecommons.org/publicdomain/zero/1.0/legalcode.en
- Wikidata licensing: https://www.wikidata.org/wiki/Wikidata:Licensing

Relevant external rules:

- CC BY permits adaptation and sharing, including commercial use, but requires attribution, license link, and change indication.
- CC BY-SA also permits adaptation, but adds a same-license/compatible-license requirement for adapted material.
- CC0 is intended to place material as fully as possible into the public domain.
- Wikidata structured data in main/property/lexeme namespaces is CC0, while text in other namespaces is CC BY-SA.

## Local Finding

Current translation-memory sample rows are not license-homogeneous:

- `publication_ok`: 21 rows.
- `publication_ok_with_attribution`: 16 rows.
- `workbench_ok_publication_review`: 3 rows.

License counts:

- `CC BY 4.0`: 16.
- `CC0`: 14.
- `project-authored / CC0`: 9.
- `N/A - project lexical rule`: 3.
- `CC BY-SA 4.0 / GFDL`: 3.

Interpretation:

- The 3 CC BY-SA/GFDL rows are fine for workbench evidence.
- They should not silently become accepted publication text unless the project makes an explicit output-license decision.
- CC BY rows are usable only if attribution is preserved.
- CC0/project-authored rows are the least encumbered publication candidates.

## Control Changes Made

- Added `license_profile` to translation decision rows.
- Required `license_profile` in `data/translation-memory/translation-decision-contract.json`.
- Updated `scripts/build_translation_memory_from_options.mjs` to classify each row as:
  - `publication_ok`
  - `publication_ok_with_attribution`
  - `workbench_ok_publication_review`
  - `blocked_until_license_review`
- Updated `scripts/validate_translation_memory.mjs` to validate license profile shape and block accepted rows when `direct_translation_use_ok` is false.
- Added `scripts/audit_translation_memory_license_profiles.mjs`.
- Generated `reports/agent5-translation-license-profile-audit.md`.
- Updated `scripts/validate_agent5_control_readiness.mjs` to summarize license profile counts.
- Added `scripts/export_translation_memory_attribution_manifest.mjs`.
- Generated `data/translation-memory/attribution-manifest.json`.
- Generated `reports/agent5-translation-attribution-manifest-report.md`.

## Agent Coordination

Agent 2:

- Route cards can keep CC BY-SA/GFDL evidence, but answer-eligible does not mean publication-ready.
- Preserve source/license rows and route IDs so future translation decisions can choose safer sources when possible.

Agent 3:

- Usage evidence can include attribution/share-alike sources if labeled.
- Do not promote usage text into accepted translation text without a decision row and license profile.

Agent 4:

- HUD can show license-rich evidence densely.
- Future translation mode must not show `workbench_ok_publication_review` rows as accepted translation renderings without an explicit license decision.

Agent 5:

- Keep `license_safe` as a workbench gate.
- Treat `license_profile.direct_translation_use_ok` as the future publication gate.

## Release Gate

Translation publication mode should require:

- `decision_status=accepted`.
- `license_safe=true`.
- `license_profile.direct_translation_use_ok=true`.
- matching source rows in `data/translation-memory/attribution-manifest.json`.
- attribution bundle present when `license_profile.attribution_required=true`.
- no `workbench_ok_publication_review` rows unless the whole output-license strategy intentionally supports them.

This is not legal advice. It is an engineering control layer that prevents known license classes from collapsing into a single unsafe boolean.
