# Agent 3 Collision Work/Category Source-Ref Repeat Locator

Generated: 2026-06-05T10:57:38.140Z

Status: evidence-ready; awaiting Agent 6. This is repeat-navigation evidence only and not Definition authority.

## Scope

This packet groups concrete occurrence locator rows by repeated source refs, local anchors, and phrase snippets. It helps QA distinguish same-ref repetition from repeated phrase snippets across works/categories without making semantic or definition claims.

## Counts

- Source locator rows: 96
- Source-ref buckets / repeated buckets / repeated rows / max repeat: 49/23/70/5
- Local-anchor buckets / repeated buckets / repeated rows: 49/23/70
- Phrase-context buckets / repeated buckets / repeated rows: 89/7/14
- Cross-work / cross-category repeated phrase-context buckets: 3/1
- Source URL / local anchor / snippet / license / version rows: 96/96/96/96/96
- Route-ID rows / distinct route IDs: 96/1
- Distinct works / categories / licenses: 24/8/2
- Reader-facing / route-payload / forbidden-authority hits: 0/0/0
- Source-text reads / broad target expansion / queue mutations / Agent 6 submissions: 0/0/0/0

## Repeated Source Ref Preview

| source_ref | occurrences | work_count | local_anchor_count | route ids |
|---|---:|---:|---:|---:|
| The Wars of the Lord, Sixth Treatise, Part Two 2:3 | 5 | 1 | 1 | 1 |
| Aderet Eliyahu, Genesis 1:1:2 | 4 | 1 | 1 | 1 |
| Shenei Luchot HaBerit, Shaar HaOtiyot, Kedushat HaAchilah, Maachalot Asurot 7:4 | 4 | 1 | 1 | 1 |
| Aderet Eliyahu, Genesis 1:1:9 | 3 | 1 | 1 | 1 |
| Beit Yosef, Yoreh De'ah 61:31:1 | 3 | 1 | 1 | 1 |
| Etz Yosef on Bereishit Rabbah 1:1:13 | 3 | 1 | 1 | 1 |
| Even Ha'azel on Mishneh Torah, Daily Offerings and Additional Offerings 7:6:1 | 3 | 1 | 1 | 1 |
| Even Ha'azel on Mishneh Torah, Daily Offerings and Additional Offerings 7:7:1 | 3 | 1 | 1 | 1 |
| Me'or Einayim, Additions:19 | 3 | 1 | 1 | 1 |
| Mikdash Melekh on Zohar 1:230b:2 | 3 | 1 | 1 | 1 |
| Moreh Nevukhei HaZeman, Gate 17; The Wisdom of the Pauper 4:5 | 3 | 1 | 1 | 1 |
| Ohev Yisrael, Terumah 2:2 | 3 | 1 | 1 | 1 |
| Ohr HaChammah on Zohar 1:11b:21 | 3 | 1 | 1 | 1 |
| Ohr HaChammah on Zohar 1:230b:14 | 3 | 1 | 1 | 1 |
| Otzar Midrashim, Maaseh Beraishit & Maaseh Merkavah, Seder Rabbah d'Beraishit d'Merkavah:3 | 3 | 1 | 1 | 1 |

## Repeated Snippet Preview

| phrase_context_snippet | occurrences | works | categories | anchors |
|---|---:|---:|---:|---:|
| אמרה כן מאיזה טעם אינו מביא משום שנאמר [ראשית] בכורי אדמתך ופי הגר א ז ל דר | 2 | 2 | 1 | 2 |
| אסור לקצור קודם הקרבה כיון דאכתי אפשר שיתקיים [ראשית] קצירכם אבל אם כבר הקריבו העומר לא שייך | 2 | 1 | 1 | 2 |
| הלא הוא אביך קנך וגו ואומר ה קנני [ראשית] דרכו משלי ח׳ כ״ב אבי שבשמים זכור כמה | 2 | 1 | 1 | 1 |
| העומר לא שייך לאסור קצירה לצורך הדיוט משום [ראשית] קצירכם ולכן הקרבת העומר מתיר אח כ ראיתי | 2 | 1 | 1 | 2 |
| מותר לקצור לצורך הדיוט קודם הקרבה דכבר נתקיים [ראשית] קצירכם אבל אם לא נקצר ביום אלא הקריבו | 2 | 1 | 1 | 2 |
| ספירות בלימה מדתן עשר שאין להם סוף עומק [ראשית] ועומק אחרית עומק טוב ועומק רע עומק רום | 2 | 2 | 2 | 2 |
| קֹדֶשׁ [רֵאשִׁית] עֲרֵימַת שְׁעָרִים קַצְוֵי אֶרֶץ זְרוּיִים כַּשְׂעוֹרִים רוּחַ מְנַשֶּׁבֶת | 2 | 2 | 1 | 2 |

## Checks

| check | status | detail |
|---|---|---|
| source_locator_rows_present | passed | rows 96 |
| source_ref_repeats_visible | passed | source buckets/repeat buckets/repeat rows/max 49/23/70/5 |
| local_anchor_repeats_visible | passed | anchor buckets/repeat buckets/repeat rows 49/23/70 |
| phrase_context_repeats_visible | passed | snippet buckets/repeat buckets/repeat rows 89/7/14 |
| cross_frame_snippet_repeats_visible | passed | cross-work/cross-category 3/1 |
| clickable_metadata_complete | passed | source/local/context/license/version 96/96/96/96/96 |
| route_ids_only_visible | passed | route rows/distinct 96/1 |
| observed_usage_labels_complete | passed | observed 96/96 |
| work_category_license_visibility | passed | work/category/license 24/8/2 |
| no_reader_payload_authority_hits | passed | reader/payload/forbidden 0/0/0 |
| no_source_broad_queue_side_effects | passed | source/broad/queue/submitted 0/0/0/0 |

## Agent 5/6 Queue Intake Summary

This repeat locator exposes 23 repeated source-ref buckets covering 70 observed-usage rows and 7 repeated phrase-context buckets covering 14 rows. It preserves source/local/provenance links and route IDs only, with no route payload copying or authority claim.

## Boundary

Agent 3 output remains observed usage/navigation evidence only. This repeat locator is not Definition authority, not reviewed lexical authority, not visible answer selection, not HUD or Definition Workbench UI acceptance, not public/runtime display, not route ranking, not semantic arbitration, not copied Agent 2 payloads, not broad corpus completion, not publication support/readiness, not source/provenance custody acceptance, and not accepted text.
