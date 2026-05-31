# Morphology Review Quality Audit

Generated from the local morphology-review citable evidence JSONL.

## Scope

- Input: .local-cache/definition-routes/source-citable-morphology-review-evidence.jsonl
- This report inspects proposed prefix/suffix morphology routes only.
- It does not promote morphology rows to accepted status.
- Sample rows identify evidence IDs and source refs only; full definitions remain in the local cache for review.

## Counts

- Rows read: 200000
- Morphology rows: 37080
- Proposed morphology rows: 37080
- Risk-flagged morphology rows: 13502
- Clean morphology rows: 23578
- Distinct morphology focus tokens: 9047

## Candidate Statuses

- proposed: 37080

## Risk Flags

- stacked_prefixes: 7307
- short_base_with_suffix: 3475
- fragmentary_base_gloss: 2763
- long_combined_definition: 1922
- object_marker_base_with_prefix: 948
- proper_name_like_base: 758
- duplicate_prefix: 630

## Source Licenses

- CC BY 4.0: 70919
- project-authored / CC0: 61360
- Public Domain: 37080
- CC0: 32351

## Top Works

- akeidat-yitzchak: 19669
- abudarham: 11563
- ahavat-chesed: 3570
- aggadat-bereshit: 1816
- aderet-eliyahu: 462

## Sample Risk Rows

- citable-para-9860383ae84b03da | וישכן | abudarham | Abudarham, Introduction:2 | main word + ending | base=ויש/ויש | risks=fragmentary_base_gloss
- citable-para-923c624dc11e9253 | בבית | abudarham | Abudarham, Introduction:2 | prefix + prefix + main word | base=יַת/ית | risks=stacked_prefixes,duplicate_prefix,object_marker_base_with_prefix
- citable-para-e7450fb6b8608b11 | לשמו | abudarham | Abudarham, Introduction:2 | main word + ending | base=לשם/לשמ | risks=proper_name_like_base
- citable-para-50209168ed1fe016 | ובימים | abudarham | Abudarham, Introduction:4 | prefix + main word + ending | base=בימי/בימי | risks=long_combined_definition
- citable-para-4175f89c2fe66b91 | להגידה | abudarham | Abudarham, Introduction:6 | main word + ending | base=להגיד/להגיד | risks=long_combined_definition
- citable-para-0b4a4c05c7af2faf | בלבי | abudarham | Abudarham, Introduction:6 | main word + ending | base=בלב/בלב | risks=long_combined_definition
- citable-para-d955c00422e46575 | וירושלמי | abudarham | Abudarham, Introduction:6 | prefix + main word | base=ירושלמי/ירושלמי | risks=proper_name_like_base
- citable-para-ffe7b334c263d236 | ממצדיקי | abudarham | Abudarham, Introduction:6 | prefix + prefix + main word | base=צדיקי/צדיקי | risks=stacked_prefixes,duplicate_prefix
- citable-para-73673d5e356ecd29 | וממגלה | abudarham | Abudarham, Introduction:6 | prefix + prefix + main word + ending | base=מגל/מגל | risks=stacked_prefixes
- citable-para-a0c6ad9b8f6f040e | והשער | abudarham | Abudarham, Introduction:7 | prefix + prefix + main word | base=שער/שער | risks=stacked_prefixes
- citable-para-6e870e22d01f9f70 | והשער | abudarham | Abudarham, Introduction:7 | prefix + prefix + main word | base=שער/שער | risks=stacked_prefixes
- citable-para-3b1b822e0d9e937b | שוכבין | abudarham | Abudarham, First Gate; Laws of Kriat Shema:2 | prefix + prefix + prefix + main word | base=בין/בינ | risks=stacked_prefixes
- citable-para-017d9afca86c4337 | וזהו | abudarham | Abudarham, First Gate; Laws of Kriat Shema:2 | main word + ending | base=וזה/וזה | risks=fragmentary_base_gloss
- citable-para-d1ef789d93e29ee3 | וזהו | abudarham | Abudarham, First Gate; Laws of Kriat Shema:2 | main word + ending | base=וזה/וזה | risks=fragmentary_base_gloss
- citable-para-eb85e06d93f7224c | ובלילה | abudarham | Abudarham, First Gate; Laws of Kriat Shema:2 | prefix + prefix + main word | base=לילה/לילה | risks=stacked_prefixes
- citable-para-9b03a644fe11de32 | ובברכות | abudarham | Abudarham, First Gate; Laws of Kriat Shema:3 | prefix + prefix + main word | base=ברכות/ברכות | risks=stacked_prefixes
- citable-para-9d72c4f773cb77c3 | אומ | abudarham | Abudarham, First Gate; Laws of Kriat Shema:3 | main word + ending | base=או/או | risks=short_base_with_suffix
- citable-para-f3bf4cdba0f14537 | לויאמר | abudarham | Abudarham, First Gate; Laws of Kriat Shema:3 | prefix + prefix + main word | base=יאמר/יאמר | risks=stacked_prefixes
- citable-para-4aed8774aa0924cf | וויאמר | abudarham | Abudarham, First Gate; Laws of Kriat Shema:3 | prefix + prefix + main word | base=יאמר/יאמר | risks=stacked_prefixes,duplicate_prefix
- citable-para-81ffe715c71a15f7 | ולמדתם | abudarham | Abudarham, First Gate; Laws of Kriat Shema:3 | prefix + prefix + main word | base=מדתם/מדתמ | risks=stacked_prefixes
- citable-para-83db8613fca3c625 | שמזכי | abudarham | Abudarham, First Gate; Laws of Kriat Shema:3 | prefix + prefix + main word + ending | base=זך/זכ | risks=stacked_prefixes,short_base_with_suffix
- citable-para-879ddd1292cbf129 | לויאמר | abudarham | Abudarham, First Gate; Laws of Kriat Shema:3 | prefix + prefix + main word | base=יאמר/יאמר | risks=stacked_prefixes
- citable-para-81215609e9252600 | בשכבנו | abudarham | Abudarham, First Gate; Laws of Kriat Shema:5 | prefix + prefix + prefix + main word | base=בנו/בנו | risks=stacked_prefixes
- citable-para-267fb4390b17d3f8 | להודיענו | abudarham | Abudarham, First Gate; Laws of Kriat Shema:5 | main word + ending | base=להודיע/להודיע | risks=fragmentary_base_gloss,long_combined_definition
- citable-para-0f8b9afeea1e18cc | והוא | abudarham | Abudarham, First Gate; Laws of Kriat Shema:5 | prefix + main word | base=הוא/הוא | risks=fragmentary_base_gloss
- citable-para-ad347f3e52f64ff7 | מלבם | abudarham | Abudarham, First Gate; Laws of Kriat Shema:5 | main word + ending | base=מלב/מלב | risks=long_combined_definition
- citable-para-0df4c9d748ce9e54 | ולאחריה | abudarham | Abudarham, First Gate; Laws of Kriat Shema:5 | prefix + prefix + main word | base=אחריה/אחריה | risks=stacked_prefixes
- citable-para-8d84ebcd84fed826 | ובלילה | abudarham | Abudarham, First Gate; Laws of Kriat Shema:5 | prefix + prefix + main word | base=לילה/לילה | risks=stacked_prefixes
- citable-para-54a2bd6354bc7984 | שלאחריה | abudarham | Abudarham, First Gate; Laws of Kriat Shema:5 | prefix + prefix + main word | base=אחריה/אחריה | risks=stacked_prefixes
- citable-para-5ff5af77b0f23ccf | שלאחריה | abudarham | Abudarham, First Gate; Laws of Kriat Shema:5 | prefix + prefix + main word | base=אחריה/אחריה | risks=stacked_prefixes
- citable-para-d40f1985c3ee0745 | בירושלמי | abudarham | Abudarham, First Gate; Laws of Kriat Shema:5 | prefix + main word | base=ירושלמי/ירושלמי | risks=proper_name_like_base
- citable-para-6a93ab4ed1908eee | ומאימתי | abudarham | Abudarham, First Gate; Laws of Kriat Shema:6 | prefix + prefix + main word | base=אימתי/אימתי | risks=stacked_prefixes
- citable-para-8538833de668203e | שהכהנים | abudarham | Abudarham, First Gate; Laws of Kriat Shema:6 | prefix + prefix + main word | base=כהנים/כהנימ | risks=stacked_prefixes
- citable-para-7d9bbb953f88d2d6 | בבית | abudarham | Abudarham, First Gate; Laws of Kriat Shema:7 | prefix + prefix + main word | base=יַת/ית | risks=stacked_prefixes,duplicate_prefix,object_marker_base_with_prefix
- citable-para-d0d6e3cb78734850 | בבית | abudarham | Abudarham, First Gate; Laws of Kriat Shema:7 | prefix + prefix + main word | base=יַת/ית | risks=stacked_prefixes,duplicate_prefix,object_marker_base_with_prefix
- citable-para-242ac9ad2dfaf5c2 | והכי | abudarham | Abudarham, First Gate; Laws of Kriat Shema:7 | prefix + prefix + main word | base=כי/כי | risks=stacked_prefixes
- citable-para-342e04dd710f5dcb | בבית | abudarham | Abudarham, First Gate; Laws of Kriat Shema:7 | prefix + prefix + main word | base=יַת/ית | risks=stacked_prefixes,duplicate_prefix,object_marker_base_with_prefix
- citable-para-9a4313e6ef14b84a | ובבית | abudarham | Abudarham, First Gate; Laws of Kriat Shema:8 | prefix + prefix + prefix + main word | base=יַת/ית | risks=stacked_prefixes,duplicate_prefix,object_marker_base_with_prefix
- citable-para-743bdb36454086c5 | ובברכותיה | abudarham | Abudarham, First Gate; Laws of Kriat Shema:8 | prefix + prefix + main word + ending | base=ברכות/ברכות | risks=stacked_prefixes
- citable-para-cd4c5a7b51533467 | דאמ | abudarham | Abudarham, First Gate; Laws of Kriat Shema:8 | main word + ending | base=דא/דא | risks=short_base_with_suffix
