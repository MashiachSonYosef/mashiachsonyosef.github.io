# Agent 3 Orot Gap Mechanical Buckets - 2026-06-03

## Boundary

Agent 3 data/usage scout artifact only. This report clusters the Agent 2 Orot full queue by mechanical fields and token shape. It does not select meanings, does not emit accepted definitions, does not treat usage as definition authority, does not claim QA/publication acceptance, and does not write public deploy files.

Inputs read:

- `reports/agent10-team-release-operating-plan-2026-06-03.md`
- `reports/agent2-orot-full-answer-candidate-disambiguation-queue-2026-06-03.json`

Optional machine-readable companion:

- `reports/agent3-orot-gap-mechanical-buckets-2026-06-03.json`

## Queue Snapshot

Source queue totals:

| Measure | Rows | Occurrences |
| --- | ---: | ---: |
| Total Orot gap queue | 8,578 | 19,733 |
| Route cards without answer eligibility | 4,337 | 10,340 |
| Ambiguous answer candidates | 2,836 | 7,559 |
| No route cards | 1,405 | 1,834 |

Observed failure field split:

| Failure field | Rows | Occurrences |
| --- | ---: | ---: |
| `(none)` | 4,241 | 9,393 |
| `explicit_answer_eligible_false` | 2,896 | 6,440 |
| `section_not_answer_production` | 1,441 | 3,900 |

Candidate-count distribution by occurrence impact:

| Candidate count | Rows | Occurrences |
| ---: | ---: | ---: |
| 2 | 2,637 | 6,196 |
| 1 | 1,279 | 4,521 |
| 4 | 1,558 | 3,323 |
| 3 | 1,402 | 2,805 |
| 6 | 869 | 1,361 |
| 5 | 313 | 802 |

## Mechanical Buckets

| Bucket | Rows | Occurrences | Mechanical condition | Agent 2/10 use |
| --- | ---: | ---: | --- | --- |
| Single-candidate route/no-answer | 898 | 4,003 | `category=route_cards_without_answer_eligible`, `route_card_count>0`, `candidate_count=1`, `answer_eligible_count=0` | Best transform surface if source/license/citation and answer-role proof can be generated without choosing among candidates. |
| Multi-candidate route/no-answer | 3,439 | 6,337 | Same route/no-answer category, but `candidate_count>1` | Needs candidate-generation or disambiguation support before any answer-row transform. Do not auto-pick. |
| Ambiguous answer candidates | 2,836 | 7,559 | `category=ambiguous_answer_candidates` or multiple answer-eligible/ambiguity counters | Semantic decision lane. Keep as evidence/disambiguation; not a mechanical fill target. |
| No-route cards | 1,405 | 1,834 | `category=no_route_cards` or `route_card_count=0` | Route-row generation lane only, requiring source route construction before fill. |
| Section-not-answer-production | 1,441 | 3,900 | `dominant_failure_reason=section_not_answer_production` | Evidence/form-reference surface. Do not flip existing cards; only separate source-backed answer rows would be safe. |
| Explicit answer-eligible false | 2,896 | 6,440 | `dominant_failure_reason=explicit_answer_eligible_false` | Contract-repair/generation surface. Existing rows remain non-answer until a separate transform proves fields. |
| Empty lexicon entry id | 2,215 | 3,166 | missing `lexicon_entry_id` | Higher source/provenance risk. Keep excluded from first fill pilot unless Agent 1 clears source identity. |

Top single-candidate route/no-answer rows by occurrence:

| Queue id | Normalized | Occ. | Route cards | Failure | Shape bucket |
| --- | --- | ---: | ---: | --- | --- |
| `agent2-orot-gap-tok-20d2e105fd77` | בכל | 338 | 5 | `section_not_answer_production` | `bet_prefix` |
| `agent2-orot-gap-tok-2a86b3eaee9b` | וכל | 204 | 5 | `section_not_answer_production` | `vav_prefix` |
| `agent2-orot-gap-tok-1b76a9f88fc7` | לכל | 102 | 5 | `section_not_answer_production` | `lamed_prefix` |
| `agent2-orot-gap-tok-cf9427570b0a` | הכל | 97 | 46 | `explicit_answer_eligible_false` | `article_h_prefix` |
| `agent2-orot-gap-tok-42a5e912cd97` | ואת | 87 | 5 | `section_not_answer_production` | `vav_prefix` |
| `agent2-orot-gap-tok-e858e9fa8bb8` | בה | 82 | 46 | `explicit_answer_eligible_false` | `bet_plus_article` |
| `agent2-orot-gap-tok-bf10df974281` | כ״א | 67 | 5 | `section_not_answer_production` | `kaf_prefix` |
| `agent2-orot-gap-tok-1bfe6fea9d85` | שהמ | 64 | 47 | `explicit_answer_eligible_false` | `shin_relative_prefix` |
| `agent2-orot-gap-tok-b9470f18041a` | להמ | 62 | 47 | `explicit_answer_eligible_false` | `lamed_plus_article` |
| `agent2-orot-gap-tok-16b3c5cb6ffe` | מצד | 60 | 5 | `section_not_answer_production` | `mem_prefix` |

## Prefix/Article Shape Surface

Per-row lookup relations are not exposed in the queue. The prefix/article buckets below are therefore shape-derived from `normalized` only, using common first-letter classes: `ה`, `ו`, `ב`, `ל`, `כ`, `מ`, `ש`, plus simple prefix+article pairs. These are mechanical locator buckets, not morphology approval.

Within route/no-answer rows with route cards and no answer-eligible rows:

| Prefix/article class | Rows | Occurrences |
| --- | ---: | ---: |
| `article_h_prefix` | 740 | 2,159 |
| `vav_prefix` | 613 | 1,254 |
| `mem_prefix` | 516 | 1,062 |
| `bet_prefix` | 301 | 913 |
| `shin_relative_prefix` | 295 | 597 |
| `lamed_prefix` | 180 | 426 |
| `kaf_prefix` | 73 | 258 |
| `vav_plus_article` | 151 | 238 |
| `lamed_plus_article` | 58 | 140 |
| `bet_plus_article` | 39 | 140 |
| `mem_plus_article` | 24 | 58 |
| `kaf_plus_article` | 2 | 2 |

Top repeated shape families by stripped one-step key:

| Stem key | Rows | Occurrences | Variants |
| --- | ---: | ---: | --- |
| כל | 5 | 742 | בכל, וכל, לכל, הכל, מהכל |
| מ | 3 | 96 | להמ, מהמ, במ |
| לאומית | 2 | 87 | הלאומית, והלאומית |
| על | 2 | 70 | ועל, שעל |
| ולכ | 2 | 69 | הולכ, והולכ |
| ״א | 2 | 68 | כ״א, ל״א |
| המ | 2 | 68 | שהמ, ההמ |
| צד | 3 | 64 | מצד, שצד, וצד |
| כללית | 2 | 61 | הכללית |
| בכל | 2 | 60 | ובכל, שבכל |

The `כל` family is the highest-impact purely mechanical article/prefix family found here: 5 rows / 742 occurrences. Four of those rows are single-candidate route/no-answer rows; one row is multi-candidate and should stay out of a no-arbitration pilot.

## Highest-ROI No-Arbitration Subset

Recommended target for Agent 2 dry-run transform:

`single_candidate_prefix_or_article_route_cards_without_answer_eligible_top100`

Mechanical inclusion rule:

- `category=route_cards_without_answer_eligible`
- `route_card_count>0`
- `candidate_count=1`
- `answer_eligible_count=0`
- normalized token starts with a common prefix/article shape

Impact:

| Scope | Rows | Occurrences |
| --- | ---: | ---: |
| All matching rows | 155 | 2,015 |
| Top-100 pilot | 100 | 1,960 |

Why this is the highest-ROI subset:

- It avoids the 2,836-row ambiguous lane entirely.
- It avoids no-route rows, so Agent 2 can test transform feasibility against existing route-card surfaces.
- It avoids multi-candidate selection, so no semantic arbitration is required.
- It targets prefix/article variants where a mechanical transform can require source/license/citation proof and new answer-role fields without mutating evidence or form-reference rows.
- It is small enough for Agent 12 top-N constraints and large enough to cover 1,960 occurrences in a top-100 pilot.

First 20 pilot rows are included in the JSON companion under `recommended_highest_roi_subset.subset`. The top examples are: בכל, וכל, לכל, הכל, ואת, בה, כ״א, שהמ, להמ, מצד, שיש, ועל, מאד, הכח, מהמ, ושל, בעת, הנמ, כשמ, ואמ.

## Exclusions For First Transform

Exclude from a no-arbitration fill pilot:

- `ambiguous_answer_candidates`: 2,836 rows / 7,559 occurrences. These require semantic decision or an existing contract that selects a candidate.
- `multi_candidate_route_no_answer`: 3,439 rows / 6,337 occurrences. These may be pipeline-addressable later, but not without a candidate-choice rule.
- `no_route_cards`: 1,405 rows / 1,834 occurrences. These need source-route generation before route-fill testing.
- missing `lexicon_entry_id`: 2,215 rows / 3,166 occurrences unless Agent 1 supplies a source identity clearance map.

## Downstream Contract

This report supports only planning and dry-run targeting. Any fill-producing Agent 2 transform still needs separate proof that new rows are source-backed, license/citation complete, boundary-safe, `answer_role=answer`, `answer_eligible=true`, and accepted only by the contract that owns that status. Existing evidence/form-reference rows must not be flipped in place.
