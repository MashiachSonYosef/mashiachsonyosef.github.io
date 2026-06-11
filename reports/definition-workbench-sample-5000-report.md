# Definition Workbench Sample Report

Generated: 2026-06-04T18:17:37.670Z

## Scope

- Sample contract only; not a full Definitions Workbench index.
- Publishes token counts and route/card IDs only, not source excerpts or definition text.
- `usage_link_count` is intentionally null until Agent 3 occurrence linkage is joined.

## Counts

- Rows: 5000
- Rows with route cards: 4856
- Rows without route cards: 144
- Multi-answer rows: 725
- Rows with complete source/license rows: 4856

## Status Counts

- conflicting: 725
- missing: 144
- proposed_only: 2706
- single_answer_source_complete: 1425

## Review Status Counts

- unreviewed_machine_sample: 5000

## Review Boundary

- `status` is machine route-shape status, not reviewed definition authority.
- `review_status=verified` is reserved for future reviewed lexical authority and is not emitted by this sample builder.
- Answer cards require `answer_eligible=true` and `answer_role=answer`; other route cards remain evidence-only counts.
- `multi_answer=true` rows remain `conflicting` warnings and are not collapsed into a hidden winner.

## Publication Boundary

- Boundary status: blocked_no_render
- Sample only: true
- Reader-facing: false
- UI assignment: false
- Publication claim: false
- Clears publication readiness: false
- Reviewed lexical authority: false
- Accepted translation output: false
- Source publication: false
- Public lookup artifact: false
- Does not clear: ui_assignment, reviewed_lexical_authority, accepted_translation, source_publication, public_lookup_publication, publication_readiness

## Top Sample Rows

- conflicting | ל | occurrences 777954 | answers 3 | cards 48 | conflicts 3
- conflicting | לא | occurrences 697105 | answers 3 | cards 48 | conflicts 3
- conflicting | כ | occurrences 636829 | answers 2 | cards 47 | conflicts 2
- single_answer_source_complete | א | occurrences 619651 | answers 1 | cards 46 | conflicts 1
- conflicting | על | occurrences 611912 | answers 3 | cards 50 | conflicts 3
- single_answer_source_complete | ה | occurrences 573187 | answers 1 | cards 46 | conflicts 1
- conflicting | ש | occurrences 565366 | answers 2 | cards 47 | conflicts 2
- conflicting | מ | occurrences 551477 | answers 3 | cards 48 | conflicts 3
- single_answer_source_complete | י | occurrences 517967 | answers 1 | cards 46 | conflicts 1
- conflicting | הוא | occurrences 496195 | answers 5 | cards 50 | conflicts 5
- single_answer_source_complete | ע | occurrences 490383 | answers 1 | cards 46 | conflicts 1
- conflicting | כי | occurrences 413758 | answers 6 | cards 51 | conflicts 6
- conflicting | זה | occurrences 390919 | answers 3 | cards 49 | conflicts 3
- conflicting | אמ | occurrences 372062 | answers 3 | cards 49 | conflicts 3
- conflicting | ב | occurrences 365187 | answers 2 | cards 47 | conflicts 2
- single_answer_source_complete | ד | occurrences 362296 | answers 1 | cards 46 | conflicts 1
- conflicting | ז | occurrences 361492 | answers 2 | cards 47 | conflicts 2
- conflicting | כל | occurrences 357667 | answers 2 | cards 47 | conflicts 2
- conflicting | שמ | occurrences 355939 | answers 5 | cards 50 | conflicts 5
- single_answer_source_complete | אלא | occurrences 339928 | answers 1 | cards 46 | conflicts 1
- single_answer_source_complete | לו | occurrences 339739 | answers 1 | cards 48 | conflicts 1
- single_answer_source_complete | ג | occurrences 335328 | answers 1 | cards 46 | conflicts 1
- conflicting | אבל | occurrences 306907 | answers 4 | cards 50 | conflicts 4
- single_answer_source_complete | ולא | occurrences 303590 | answers 1 | cards 46 | conflicts 1
- conflicting | אינ | occurrences 294484 | answers 3 | cards 49 | conflicts 3
- conflicting | של | occurrences 277064 | answers 2 | cards 48 | conflicts 2
- conflicting | את | occurrences 276281 | answers 5 | cards 51 | conflicts 5
- conflicting | פ | occurrences 258230 | answers 3 | cards 48 | conflicts 3
- conflicting | ר | occurrences 251938 | answers 3 | cards 48 | conflicts 3
- single_answer_source_complete | שלא | occurrences 244095 | answers 1 | cards 46 | conflicts 1

## Boundary

Definition Workbench sample only. It publishes no source excerpts, no definition text, no translation text, and no publication readiness.
