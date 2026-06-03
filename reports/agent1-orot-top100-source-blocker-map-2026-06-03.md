# Agent 1 Orot Top 100 Source Blocker Map - 2026-06-03

Generated: 2026-06-03

Lane: Agent 1 source/provenance/license evidence only.

## Boundary

This artifact maps source-row blockers and source-row exclusions for Agent 3's recommended Orot no-arbitration pilot target:

`single_candidate_prefix_or_article_route_cards_without_answer_eligible_top100`

It does not claim source custody acceptance, source/provenance acceptance, source publication, QA acceptance, publication readiness, Definition authority, usage-as-definition authority, accepted text, or translation output. No public deploy files were edited by this artifact.

## Inputs Read

- reports/agent10-team-release-operating-plan-2026-06-03.md
- reports/agent2-orot-full-answer-candidate-disambiguation-queue-2026-06-03.json
- reports/agent3-orot-gap-mechanical-buckets-2026-06-03.md
- reports/agent3-orot-gap-mechanical-buckets-2026-06-03.json
- data/lexical/orot.manifest.json
- data/lexical/orot-chunks/*.json
- data/lexical/source-layers/*.json

## Pilot Inclusion Rule

- `category=route_cards_without_answer_eligible`
- `route_card_count>0`
- `candidate_count=1`
- `answer_eligible_count=0`
- normalized token starts with Agent 3's common prefix/article shape

Agent 3 impact basis:

| Scope | Rows | Occurrences |
|---|---:|---:|
| All matching rows | 155 | 2015 |
| Top-100 pilot | 100 | 1960 |

## Known Denied Source Rows Checked

- `curated|lex-aph-h639|source metadata incomplete`
- `curated|lex-mashiach-h4899|source metadata incomplete`
- `curated|lex-ruach-h7307|source metadata incomplete`
- `curated|lex-yhwh-h3068|source metadata incomplete`

## Method

For each Agent 3 pilot row, this map joined the pilot token to its current Orot lexical chunk entry and source-layer entry. A row is marked `SOURCE-CLEAN-CONSIDER` only when complete source metadata is attached in the Orot lexical chunk and none of the known denied rows or other `source metadata incomplete` rows are attached.

Complete source-row metadata means the attached row carries source name, family, id, URL, license, and license URL, with no `source metadata incomplete` marker. This is a source/license/citation metadata screen only. It is not semantic disambiguation, not route-answer approval, and not source custody acceptance.

Source family abbreviations: `os` OpenScriptures CC BY 4.0, `wd` Wikidata CC0, `ws` workspace/project rule, `wk` Wiktionary/Kaikki.

## Summary

- Pilot rows inspected: 100
- Pilot occurrence coverage: 1960
- Rows source-clean enough for Agent 2 pipeline transform consideration: 87
- Rows blocked by the four known denied incomplete curated rows: 0
- Rows blocked by other incomplete source metadata: 0
- Rows blocked by missing lexical source linkage: 13
- Rows needing attachment/regeneration proof: 0

Prefix/article source split:

| Prefix class | Rows | Occurrences | Source-clean | Source blocked |
|---|---:|---:|---:|---:|
| bet_prefix | 15 | 444 | 14 | 1 |
| vav_prefix | 21 | 492 | 19 | 2 |
| lamed_prefix | 9 | 153 | 7 | 2 |
| article_h_prefix | 16 | 219 | 13 | 3 |
| bet_plus_article | 3 | 94 | 3 | 0 |
| kaf_prefix | 7 | 114 | 5 | 2 |
| shin_relative_prefix | 15 | 188 | 14 | 1 |
| lamed_plus_article | 2 | 66 | 2 | 0 |
| mem_prefix | 8 | 151 | 7 | 1 |
| mem_plus_article | 2 | 32 | 2 | 0 |
| vav_plus_article | 2 | 7 | 1 | 1 |

## Source Blocker / Exclusion Result

No top-100 pilot row currently attaches any of the four known denied incomplete curated rows. The known-row exclusion map is therefore empty for this pilot.

The source blockers found are source-linkage blockers: the queue row has no `lexicon_entry_id`, so no source/license/citation row can be joined for Agent 2 transform consideration.

| pilot priority | token | surface | normalized | occurrences | prefix class | blocker | disposition |
|---:|---|---|---|---:|---|---|---|
| 7 | `tok-bf10df974281` | כ״א | כ״א | 67 | kaf_prefix | no `lexicon_entry_id` | SOURCE-LINKAGE-BLOCK |
| 25 | `tok-17ba65351831` | ממה | ממה | 18 | mem_prefix | no `lexicon_entry_id` | SOURCE-LINKAGE-BLOCK |
| 28 | `tok-6b169f83d239` | לתן | לתנ | 15 | lamed_prefix | no `lexicon_entry_id` | SOURCE-LINKAGE-BLOCK |
| 42 | `tok-f4684f98dd3c` | הגס | הגס | 7 | article_h_prefix | no `lexicon_entry_id` | SOURCE-LINKAGE-BLOCK |
| 54 | `tok-21ae8291f6e3` | הקו | הקו | 4 | article_h_prefix | no `lexicon_entry_id` | SOURCE-LINKAGE-BLOCK |
| 62 | `tok-061fb7148fbc` | לזו | לזו | 3 | lamed_prefix | no `lexicon_entry_id` | SOURCE-LINKAGE-BLOCK |
| 64 | `tok-12f1b38c8e82` | וחד | וחד | 3 | vav_prefix | no `lexicon_entry_id` | SOURCE-LINKAGE-BLOCK |
| 82 | `tok-4a2aa0e83513` | ב״ה | ב״ה | 2 | bet_prefix | no `lexicon_entry_id` | SOURCE-LINKAGE-BLOCK |
| 83 | `tok-4c95bb88fb43` | שזה | שזה | 2 | shin_relative_prefix | no `lexicon_entry_id` | SOURCE-LINKAGE-BLOCK |
| 87 | `tok-7079eb2eb5bb` | ו׳ | ו׳ | 2 | vav_prefix | no `lexicon_entry_id` | SOURCE-LINKAGE-BLOCK |
| 91 | `tok-e634000d8416` | כג | כג | 2 | kaf_prefix | no `lexicon_entry_id` | SOURCE-LINKAGE-BLOCK |
| 92 | `tok-e7e3dabf0cb3` | העב | העב | 2 | article_h_prefix | no `lexicon_entry_id` | SOURCE-LINKAGE-BLOCK |
| 97 | `tok-f87dd75a1506` | והו | והו | 2 | vav_plus_article | no `lexicon_entry_id` | SOURCE-LINKAGE-BLOCK |

## Top Source-Clean Rows For Agent 2 Consideration

These rows appear source-clean enough for Agent 2 pipeline-transform consideration, subject to Agent 2 answer-role/disambiguation rules and without accepting source custody. Listed source rows are samples from attached complete source rows.

| pilot priority | token | surface | occurrences | prefix class | source families | sample complete rows |
|---:|---|---|---:|---|---|---|
| 1 | `tok-20d2e105fd77` | בכל | 338 | bet_prefix | os:2 | `openscriptures|H3605|CC BY 4.0`<br>`openscriptures|H3606|CC BY 4.0` |
| 2 | `tok-2a86b3eaee9b` | וכל | 204 | vav_prefix | os:3 | `openscriptures|H3557|CC BY 4.0`<br>`openscriptures|H3605|CC BY 4.0`<br>`openscriptures|H3606|CC BY 4.0` |
| 3 | `tok-1b76a9f88fc7` | לכל | 102 | lamed_prefix | os:2 | `openscriptures|H3605|CC BY 4.0`<br>`openscriptures|H3606|CC BY 4.0` |
| 4 | `tok-cf9427570b0a` | הכל | 97 | article_h_prefix | os:1, wd:1 | `openscriptures|H3605|CC BY 4.0`<br>`wikidata|L208112|CC0` |
| 5 | `tok-42a5e912cd97` | ואת | 87 | vav_prefix | os:3 | `openscriptures|H853|CC BY 4.0`<br>`openscriptures|H854|CC BY 4.0`<br>`openscriptures|H859|CC BY 4.0` |
| 6 | `tok-e858e9fa8bb8` | בה | 82 | bet_plus_article | os:1 | `openscriptures|H5221|CC BY 4.0` |
| 8 | `tok-1bfe6fea9d85` | שהם | 64 | shin_relative_prefix | os:3 | `openscriptures|H1992|CC BY 4.0`<br>`openscriptures|H7718|CC BY 4.0`<br>`openscriptures|H7719|CC BY 4.0` |
| 9 | `tok-b9470f18041a` | להם | 62 | lamed_plus_article | os:1, wd:1 | `openscriptures|H3859|CC BY 4.0`<br>`wikidata|L491925|CC0` |
| 10 | `tok-16b3c5cb6ffe` | מצד | 60 | mem_prefix | os:3 | `openscriptures|H4679|CC BY 4.0`<br>`openscriptures|H6654|CC BY 4.0`<br>`openscriptures|H6655|CC BY 4.0` |
| 11 | `tok-1282c4d855bc` | שיש | 55 | shin_relative_prefix | os:2, wd:1 | `openscriptures|H3426|CC BY 4.0`<br>`openscriptures|H7893|CC BY 4.0`<br>`wikidata|L82211|CC0` |
| 12 | `tok-e2d80b36f5bc` | ועל | 55 | vav_prefix | os:3 | `openscriptures|H5764|CC BY 4.0`<br>`openscriptures|H5921|CC BY 4.0`<br>`openscriptures|H5922|CC BY 4.0` |
| 13 | `tok-2a3aa32e04a0` | מאד | 42 | mem_prefix | os:1, wd:1 | `openscriptures|H3966|CC BY 4.0`<br>`wikidata|L65986|CC0` |
| 14 | `tok-c3c61224118a` | הכח | 31 | article_h_prefix | os:1 | `openscriptures|H3581|CC BY 4.0` |
| 15 | `tok-75450021b421` | מהם | 29 | mem_plus_article | os:1, wd:2 | `openscriptures|H4480|CC BY 4.0`<br>`wikidata|L491944|CC0`<br>`wikidata|L492208|CC0` |
| 16 | `tok-28a4bc3f2af1` | ושל | 24 | vav_prefix | ws:1 | `workspace|grammar-particle:של|N/A - project lexical rule` |
| 17 | `tok-8fb44ba631ca` | בעת | 24 | bet_prefix | os:2, wd:1 | `openscriptures|H1204|CC BY 4.0`<br>`openscriptures|H6256|CC BY 4.0`<br>`wikidata|L76390|CC0` |
| 18 | `tok-017227aa7bde` | הנם | 23 | article_h_prefix | os:3, wd:1 | `openscriptures|H2005|CC BY 4.0`<br>`openscriptures|H2009|CC BY 4.0`<br>`openscriptures|H2011|CC BY 4.0`<br>`wikidata|L491913|CC0` |
| 19 | `tok-85aa4632a30e` | כשם | 23 | kaf_prefix | os:2 | `openscriptures|H8034|CC BY 4.0`<br>`openscriptures|H8036|CC BY 4.0` |
| 20 | `tok-eed4f84c09ac` | ואם | 22 | vav_prefix | os:2 | `openscriptures|H517|CC BY 4.0`<br>`openscriptures|H518|CC BY 4.0` |

## Full Pilot Map

| pilot priority | token | surface | normalized | occurrences | prefix class | lexicon entry | source disposition | complete source families |
|---:|---|---|---|---:|---|---|---|---|
| 1 | `tok-20d2e105fd77` | בכל | בכל | 338 | bet_prefix | `lex-6076abad07e6` | SOURCE-CLEAN-CONSIDER | os:2 |
| 2 | `tok-2a86b3eaee9b` | וכל | וכל | 204 | vav_prefix | `lex-a5b2db1cd218` | SOURCE-CLEAN-CONSIDER | os:3 |
| 3 | `tok-1b76a9f88fc7` | לכל | לכל | 102 | lamed_prefix | `lex-c45beedcfc7c` | SOURCE-CLEAN-CONSIDER | os:2 |
| 4 | `tok-cf9427570b0a` | הכל | הכל | 97 | article_h_prefix | `lex-5f8fb8a58b7e` | SOURCE-CLEAN-CONSIDER | os:1, wd:1 |
| 5 | `tok-42a5e912cd97` | ואת | ואת | 87 | vav_prefix | `lex-26bf33fe3383` | SOURCE-CLEAN-CONSIDER | os:3 |
| 6 | `tok-e858e9fa8bb8` | בה | בה | 82 | bet_plus_article | `lex-30a953890b8e` | SOURCE-CLEAN-CONSIDER | os:1 |
| 7 | `tok-bf10df974281` | כ״א | כ״א | 67 | kaf_prefix | `-` | SOURCE-LINKAGE-BLOCK | - |
| 8 | `tok-1bfe6fea9d85` | שהם | שהמ | 64 | shin_relative_prefix | `lex-8da0bf0130c8` | SOURCE-CLEAN-CONSIDER | os:3 |
| 9 | `tok-b9470f18041a` | להם | להמ | 62 | lamed_plus_article | `lex-a5c0d0d1caee` | SOURCE-CLEAN-CONSIDER | os:1, wd:1 |
| 10 | `tok-16b3c5cb6ffe` | מצד | מצד | 60 | mem_prefix | `lex-39d61a3b389b` | SOURCE-CLEAN-CONSIDER | os:3 |
| 11 | `tok-1282c4d855bc` | שיש | שיש | 55 | shin_relative_prefix | `lex-b91a04df61db` | SOURCE-CLEAN-CONSIDER | os:2, wd:1 |
| 12 | `tok-e2d80b36f5bc` | ועל | ועל | 55 | vav_prefix | `lex-c5fa08407aa0` | SOURCE-CLEAN-CONSIDER | os:3 |
| 13 | `tok-2a3aa32e04a0` | מאד | מאד | 42 | mem_prefix | `lex-a30b698327e6` | SOURCE-CLEAN-CONSIDER | os:1, wd:1 |
| 14 | `tok-c3c61224118a` | הכח | הכח | 31 | article_h_prefix | `lex-ec6b1f8a67fa` | SOURCE-CLEAN-CONSIDER | os:1 |
| 15 | `tok-75450021b421` | מהם | מהמ | 29 | mem_plus_article | `lex-7835090c1131` | SOURCE-CLEAN-CONSIDER | os:1, wd:2 |
| 16 | `tok-28a4bc3f2af1` | ושל | ושל | 24 | vav_prefix | `lex-expr-2b6526dbcaa3` | SOURCE-CLEAN-CONSIDER | ws:1 |
| 17 | `tok-8fb44ba631ca` | בעת | בעת | 24 | bet_prefix | `lex-5bf791587b1e` | SOURCE-CLEAN-CONSIDER | os:2, wd:1 |
| 18 | `tok-017227aa7bde` | הנם | הנמ | 23 | article_h_prefix | `lex-ac0edd795f82` | SOURCE-CLEAN-CONSIDER | os:3, wd:1 |
| 19 | `tok-85aa4632a30e` | כשם | כשמ | 23 | kaf_prefix | `lex-30bb8b8e1ae0` | SOURCE-CLEAN-CONSIDER | os:2 |
| 20 | `tok-eed4f84c09ac` | ואם | ואמ | 22 | vav_prefix | `lex-3521a7add2c2` | SOURCE-CLEAN-CONSIDER | os:2 |
| 21 | `tok-56693093a95f` | בשם | בשמ | 21 | bet_prefix | `lex-3f04ac1348a8` | SOURCE-CLEAN-CONSIDER | os:4, wd:2 |
| 22 | `tok-179ba589f9d3` | החי | החי | 20 | article_h_prefix | `lex-842c26e63e05` | SOURCE-CLEAN-CONSIDER | os:2 |
| 23 | `tok-b6381eea4bf5` | מיד | מיד | 20 | mem_prefix | `lex-26a7fb927feb` | SOURCE-CLEAN-CONSIDER | os:1, wd:1 |
| 24 | `tok-0c8d92179033` | ועם | ועמ | 19 | vav_prefix | `lex-b3d6dcc9aa89` | SOURCE-CLEAN-CONSIDER | os:4 |
| 25 | `tok-17ba65351831` | ממה | ממה | 18 | mem_prefix | `-` | SOURCE-LINKAGE-BLOCK | - |
| 26 | `tok-8aa62110c6b8` | בני | בני | 18 | bet_prefix | `lex-051ba6ec3537` | SOURCE-CLEAN-CONSIDER | os:9, wd:2 |
| 27 | `tok-cceb19874253` | לעם | לעמ | 16 | lamed_prefix | `lex-56303a476f2f` | SOURCE-CLEAN-CONSIDER | os:2 |
| 28 | `tok-6b169f83d239` | לתן | לתנ | 15 | lamed_prefix | `-` | SOURCE-LINKAGE-BLOCK | - |
| 29 | `tok-e2ce674d9f4b` | שעל | שעל | 15 | shin_relative_prefix | `lex-9b7163d4ad23` | SOURCE-CLEAN-CONSIDER | os:2, wd:1 |
| 30 | `tok-b857d40da544` | ואל | ואל | 14 | vav_prefix | `lex-209ee6fdb464` | SOURCE-CLEAN-CONSIDER | os:3 |
| 31 | `tok-e26cf1bf873c` | ומה | ומה | 13 | vav_prefix | `lex-af7f256a2f5d` | SOURCE-CLEAN-CONSIDER | os:2 |
| 32 | `tok-5bbcbcbeb49f` | כלו | כלו | 12 | kaf_prefix | `lex-1421b5316206` | SOURCE-CLEAN-CONSIDER | os:3, wd:1 |
| 33 | `tok-1e2d07d7405c` | שגם | שגמ | 11 | shin_relative_prefix | `lex-4bf66c92a097` | SOURCE-CLEAN-CONSIDER | os:1, wd:1 |
| 34 | `tok-e50370ece8ba` | הנן | הננ | 11 | article_h_prefix | `lex-937a1b7512c1` | SOURCE-CLEAN-CONSIDER | os:2, wd:1 |
| 35 | `tok-058802b6dd6a` | וקל | וקל | 10 | vav_prefix | `lex-9bc82c779860` | SOURCE-CLEAN-CONSIDER | os:2 |
| 36 | `tok-25908effa80c` | בהן | בהנ | 10 | bet_plus_article | `lex-e7a2c73c884c` | SOURCE-CLEAN-CONSIDER | os:3, wd:1 |
| 37 | `tok-0f93ec938211` | ביד | ביד | 9 | bet_prefix | `lex-4f147f532305` | SOURCE-CLEAN-CONSIDER | os:2 |
| 38 | `tok-059ef6aa7e88` | שאי | שאי | 8 | shin_relative_prefix | `lex-ea69208c79c9` | SOURCE-CLEAN-CONSIDER | os:2, wd:1 |
| 39 | `tok-e4705867db59` | שתי | שתי | 8 | shin_relative_prefix | `lex-1be36a6be7c6` | SOURCE-CLEAN-CONSIDER | os:5, wd:2 |
| 40 | `tok-8dc563525306` | בך | בכ | 7 | bet_prefix | `lex-kaikki-4b10e87b371c` | SOURCE-CLEAN-CONSIDER | wk:1 |
| 41 | `tok-c85c9a3ab541` | ועז | ועז | 7 | vav_prefix | `lex-f62b70f63509` | SOURCE-CLEAN-CONSIDER | os:2 |
| 42 | `tok-f4684f98dd3c` | הגס | הגס | 7 | article_h_prefix | `-` | SOURCE-LINKAGE-BLOCK | - |
| 43 | `tok-6424123b3666` | כחם | כחמ | 6 | kaf_prefix | `lex-271f479f1863` | SOURCE-CLEAN-CONSIDER | os:2 |
| 44 | `tok-c924ce174af9` | ושם | ושמ | 6 | vav_prefix | `lex-f3d6381d563b` | SOURCE-CLEAN-CONSIDER | os:4 |
| 45 | `tok-e884601a972a` | לך | לכ | 6 | lamed_prefix | `lex-c5ff9a11f46b` | SOURCE-CLEAN-CONSIDER | os:4 |
| 46 | `tok-eee95bf92b92` | הקץ | הקצ | 6 | article_h_prefix | `lex-fd130537bbb5` | SOURCE-CLEAN-CONSIDER | os:1, wd:1 |
| 47 | `tok-077ea88c123b` | בים | בימ | 5 | bet_prefix | `lex-2d307e9a8a51` | SOURCE-CLEAN-CONSIDER | os:1, wd:2 |
| 48 | `tok-1cd255ea2c77` | בזו | בזו | 5 | bet_prefix | `lex-c433cc535cf0` | SOURCE-CLEAN-CONSIDER | os:2 |
| 49 | `tok-2f07942f7f25` | והן | והנ | 5 | vav_plus_article | `lex-45734f4bf25e` | SOURCE-CLEAN-CONSIDER | os:2 |
| 50 | `tok-3712548da960` | שמא | שמא | 5 | shin_relative_prefix | `lex-07c849a09627` | SOURCE-CLEAN-CONSIDER | os:1, wd:1 |
| 51 | `tok-a423ca4bb155` | שבא | שבא | 5 | shin_relative_prefix | `lex-cc5768dee75e` | SOURCE-CLEAN-CONSIDER | os:2 |
| 52 | `tok-cfff31861004` | בם | במ | 5 | bet_prefix | `lex-kaikki-fcea204497bd` | SOURCE-CLEAN-CONSIDER | wk:1 |
| 53 | `tok-db3f3a359b3a` | וחי | וחי | 5 | vav_prefix | `lex-ed351ca0565d` | SOURCE-CLEAN-CONSIDER | os:3 |
| 54 | `tok-21ae8291f6e3` | הקו | הקו | 4 | article_h_prefix | `-` | SOURCE-LINKAGE-BLOCK | - |
| 55 | `tok-5056ce21a2bf` | ואף | ואפ | 4 | vav_prefix | `lex-b8570477949a` | SOURCE-CLEAN-CONSIDER | os:3 |
| 56 | `tok-5e7de8830e6d` | לכם | לכמ | 4 | lamed_prefix | `lex-17aaf1de026f` | SOURCE-CLEAN-CONSIDER | wd:1 |
| 57 | `tok-7eabdde16e13` | מני | מני | 4 | mem_prefix | `lex-08911a313582` | SOURCE-CLEAN-CONSIDER | os:6, wd:2 |
| 58 | `tok-864d83939686` | הנס | הנס | 4 | article_h_prefix | `lex-afd64744571b` | SOURCE-CLEAN-CONSIDER | os:2 |
| 59 | `tok-bdb561704f02` | להן | להנ | 4 | lamed_plus_article | `lex-c104e91052ca` | SOURCE-CLEAN-CONSIDER | os:3, wd:1 |
| 60 | `tok-cae0b3339893` | ההם | ההמ | 4 | article_h_prefix | `lex-6711cd9c1d0d` | SOURCE-CLEAN-CONSIDER | os:1, wd:2 |
| 61 | `tok-ffd7b74d7031` | ומי | ומי | 4 | vav_prefix | `lex-1dd528c963e5` | SOURCE-CLEAN-CONSIDER | os:2 |
| 62 | `tok-061fb7148fbc` | לזו | לזו | 3 | lamed_prefix | `-` | SOURCE-LINKAGE-BLOCK | - |
| 63 | `tok-126ff8890e18` | הדם | הדמ | 3 | article_h_prefix | `lex-7d04fe83a7ee` | SOURCE-CLEAN-CONSIDER | os:4 |
| 64 | `tok-12f1b38c8e82` | וחד | וחד | 3 | vav_prefix | `-` | SOURCE-LINKAGE-BLOCK | - |
| 65 | `tok-4385095993ec` | לאל | לאל | 3 | lamed_prefix | `lex-9bc7c3703e0b` | SOURCE-CLEAN-CONSIDER | os:3 |
| 66 | `tok-63af88c6b83b` | ורב | ורב | 3 | vav_prefix | `lex-0f9b0776b489` | SOURCE-CLEAN-CONSIDER | os:4 |
| 67 | `tok-6646beb3917b` | ונר | ונר | 3 | vav_prefix | `lex-e5e28621adb0` | SOURCE-CLEAN-CONSIDER | os:2 |
| 68 | `tok-6b2aadbed14e` | ברב | ברב | 3 | bet_prefix | `lex-80b9f3e56451` | SOURCE-CLEAN-CONSIDER | os:2 |
| 69 | `tok-7037e00afc71` | מעז | מעז | 3 | mem_prefix | `lex-a329cebdaebb` | SOURCE-CLEAN-CONSIDER | os:1, wd:1 |
| 70 | `tok-74486428ad56` | שאם | שאמ | 3 | shin_relative_prefix | `lex-function-word-42a0d3068dfe` | SOURCE-CLEAN-CONSIDER | ws:1 |
| 71 | `tok-8a4a6aa7f073` | שוא | שוא | 3 | shin_relative_prefix | `lex-259a53720584` | SOURCE-CLEAN-CONSIDER | os:4 |
| 72 | `tok-bb2527ed1403` | ורק | ורק | 3 | vav_prefix | `lex-ffd10d6e80a1` | SOURCE-CLEAN-CONSIDER | os:3 |
| 73 | `tok-cb6a8210d6a6` | שוה | שוה | 3 | shin_relative_prefix | `lex-958ba586f45e` | SOURCE-CLEAN-CONSIDER | os:3, wd:3 |
| 74 | `tok-d2d4113b4ff7` | מהן | מהנ | 3 | mem_plus_article | `lex-16079d39c7f1` | SOURCE-CLEAN-CONSIDER | os:1, wd:2 |
| 75 | `tok-07067152f382` | שאז | שאז | 2 | shin_relative_prefix | `lex-573d61f8e37f` | SOURCE-CLEAN-CONSIDER | os:1 |
| 76 | `tok-07fc98679315` | בהר | בהר | 2 | bet_plus_article | `lex-91c46f6caa5b` | SOURCE-CLEAN-CONSIDER | os:2 |
| 77 | `tok-0a3189fbf6e5` | כזו | כזו | 2 | kaf_prefix | `lex-e09f0ce6dd25` | SOURCE-CLEAN-CONSIDER | wd:1 |
| 78 | `tok-1aa3eacb92c7` | במת | במת | 2 | bet_prefix | `lex-847406929f43` | SOURCE-CLEAN-CONSIDER | os:2 |
| 79 | `tok-231f9e431e95` | מעץ | מעצ | 2 | mem_prefix | `lex-d47ff9d89be4` | SOURCE-CLEAN-CONSIDER | os:2 |
| 80 | `tok-2c8e52b220a7` | הרת | הרת | 2 | article_h_prefix | `lex-fbdd2cfb6178` | SOURCE-CLEAN-CONSIDER | os:1, wd:3 |
| 81 | `tok-458fb72a7b5b` | בדי | בדי | 2 | bet_prefix | `lex-58f7c7f139e5` | SOURCE-CLEAN-CONSIDER | os:3, wd:2 |
| 82 | `tok-4a2aa0e83513` | ב״ה | ב״ה | 2 | bet_prefix | `-` | SOURCE-LINKAGE-BLOCK | - |
| 83 | `tok-4c95bb88fb43` | שזה | שזה | 2 | shin_relative_prefix | `-` | SOURCE-LINKAGE-BLOCK | - |
| 84 | `tok-51895b2ca4cf` | כחן | כחנ | 2 | kaf_prefix | `lex-kaikki-6ce81cee85ff` | SOURCE-CLEAN-CONSIDER | wk:1 |
| 85 | `tok-698a7127ce41` | לשא | לשא | 2 | lamed_prefix | `lex-kaikki-7b573556c706` | SOURCE-CLEAN-CONSIDER | wk:1 |
| 86 | `tok-6cc553886590` | מפי | מפי | 2 | mem_prefix | `lex-30c08733faf8` | SOURCE-CLEAN-CONSIDER | os:2 |
| 87 | `tok-7079eb2eb5bb` | ו׳ | ו׳ | 2 | vav_prefix | `-` | SOURCE-LINKAGE-BLOCK | - |
| 88 | `tok-7da0e59043bf` | ומן | ומנ | 2 | vav_prefix | `lex-d4a79b8dc5fd` | SOURCE-CLEAN-CONSIDER | os:3 |
| 89 | `tok-b82cc17c94fa` | שכך | שככ | 2 | shin_relative_prefix | `lex-ae6aaf41643a` | SOURCE-CLEAN-CONSIDER | os:1, wd:3 |
| 90 | `tok-c00726f9c271` | הבו | הבו | 2 | article_h_prefix | `lex-e1851664b2ea` | SOURCE-CLEAN-CONSIDER | os:2 |
| 91 | `tok-e634000d8416` | כג | כג | 2 | kaf_prefix | `-` | SOURCE-LINKAGE-BLOCK | - |
| 92 | `tok-e7e3dabf0cb3` | העב | העב | 2 | article_h_prefix | `-` | SOURCE-LINKAGE-BLOCK | - |
| 93 | `tok-e9c34ff37da5` | שצד | שצד | 2 | shin_relative_prefix | `lex-3ec071aa9b58` | SOURCE-CLEAN-CONSIDER | os:3 |
| 94 | `tok-ea40fd6b22c2` | לכו | לכו | 2 | lamed_prefix | `lex-901cc25e3c8c` | SOURCE-CLEAN-CONSIDER | os:1, wd:1 |
| 95 | `tok-eff28302949b` | הרב | הרב | 2 | article_h_prefix | `lex-bc314187178f` | SOURCE-CLEAN-CONSIDER | os:4 |
| 96 | `tok-f4cb2f411626` | וצד | וצד | 2 | vav_prefix | `lex-3ec071aa9b58` | SOURCE-CLEAN-CONSIDER | os:3 |
| 97 | `tok-f87dd75a1506` | והו | והו | 2 | vav_plus_article | `-` | SOURCE-LINKAGE-BLOCK | - |
| 98 | `tok-fac5f6a375f1` | באי | באי | 2 | bet_prefix | `lex-d068e9843edb` | SOURCE-CLEAN-CONSIDER | os:1, wd:1 |
| 99 | `tok-02768e2d006e` | הקף | הקפ | 1 | article_h_prefix | `lex-bd983d889512` | SOURCE-CLEAN-CONSIDER | os:1, wd:3 |
| 100 | `tok-0890be8741ab` | בתי | בתי | 1 | bet_prefix | `lex-c7785267c5fa` | SOURCE-CLEAN-CONSIDER | os:3, wd:2 |

## Required Downstream Use Constraints

- Agent 2 may use `SOURCE-CLEAN-CONSIDER` rows only as source-row candidates for a bounded pipeline transform; Agent 2 still owns answer-route, answer-role, and disambiguation proof.
- Exclude or separately docket `SOURCE-LINKAGE-BLOCK` rows before any route-claim dry run.
- Do not flip evidence/form-reference cards into answers from this artifact.
- Do not treat complete source rows as source/provenance acceptance or as accepted text.

## Machine-Checkable Summary

```json
{
  "target": "single_candidate_prefix_or_article_route_cards_without_answer_eligible_top100",
  "pilot_rows": 100,
  "pilot_occurrences": 1960,
  "known_denied_rows_checked": [
    "curated|lex-aph-h639|source metadata incomplete",
    "curated|lex-mashiach-h4899|source metadata incomplete",
    "curated|lex-ruach-h7307|source metadata incomplete",
    "curated|lex-yhwh-h3068|source metadata incomplete"
  ],
  "known_denied_rows_attached_in_pilot": 0,
  "source_clean_enough_for_agent2_transform_consideration": 87,
  "source_linkage_missing_no_lexicon_entry_id": 13,
  "other_incomplete_source_metadata_rows_attached": 0,
  "attachment_or_regeneration_proof_needed": 0,
  "blocked_rows": [
    { "pilot_priority": 7, "token_id": "tok-bf10df974281", "surface": "כ״א", "occurrences": 67, "prefix_class": "kaf_prefix", "blocker": "no lexicon_entry_id" },
    { "pilot_priority": 25, "token_id": "tok-17ba65351831", "surface": "ממה", "occurrences": 18, "prefix_class": "mem_prefix", "blocker": "no lexicon_entry_id" },
    { "pilot_priority": 28, "token_id": "tok-6b169f83d239", "surface": "לתן", "occurrences": 15, "prefix_class": "lamed_prefix", "blocker": "no lexicon_entry_id" },
    { "pilot_priority": 42, "token_id": "tok-f4684f98dd3c", "surface": "הגס", "occurrences": 7, "prefix_class": "article_h_prefix", "blocker": "no lexicon_entry_id" },
    { "pilot_priority": 54, "token_id": "tok-21ae8291f6e3", "surface": "הקו", "occurrences": 4, "prefix_class": "article_h_prefix", "blocker": "no lexicon_entry_id" },
    { "pilot_priority": 62, "token_id": "tok-061fb7148fbc", "surface": "לזו", "occurrences": 3, "prefix_class": "lamed_prefix", "blocker": "no lexicon_entry_id" },
    { "pilot_priority": 64, "token_id": "tok-12f1b38c8e82", "surface": "וחד", "occurrences": 3, "prefix_class": "vav_prefix", "blocker": "no lexicon_entry_id" },
    { "pilot_priority": 82, "token_id": "tok-4a2aa0e83513", "surface": "ב״ה", "occurrences": 2, "prefix_class": "bet_prefix", "blocker": "no lexicon_entry_id" },
    { "pilot_priority": 83, "token_id": "tok-4c95bb88fb43", "surface": "שזה", "occurrences": 2, "prefix_class": "shin_relative_prefix", "blocker": "no lexicon_entry_id" },
    { "pilot_priority": 87, "token_id": "tok-7079eb2eb5bb", "surface": "ו׳", "occurrences": 2, "prefix_class": "vav_prefix", "blocker": "no lexicon_entry_id" },
    { "pilot_priority": 91, "token_id": "tok-e634000d8416", "surface": "כג", "occurrences": 2, "prefix_class": "kaf_prefix", "blocker": "no lexicon_entry_id" },
    { "pilot_priority": 92, "token_id": "tok-e7e3dabf0cb3", "surface": "העב", "occurrences": 2, "prefix_class": "article_h_prefix", "blocker": "no lexicon_entry_id" },
    { "pilot_priority": 97, "token_id": "tok-f87dd75a1506", "surface": "והו", "occurrences": 2, "prefix_class": "vav_plus_article", "blocker": "no lexicon_entry_id" }
  ]
}
```
