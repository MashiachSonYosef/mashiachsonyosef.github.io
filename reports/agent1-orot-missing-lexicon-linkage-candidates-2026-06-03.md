# Agent 1 Orot Missing Lexicon Linkage Candidates

Generated: 2026-06-03T23:59:24.982Z

## Boundary

- Evidence-only candidate buckets for Orot rows missing `lexicon_entry_id`.
- No token-index, lexical payload, source row, or public HUD mutation was emitted.
- This packet does not claim source custody, source/provenance acceptance, Definition authority, usage-as-definition authority, accepted text, QA acceptance, public/runtime acceptance, or publication readiness.

## Summary

- Input lineage report: `reports/agent2-orot-pilot-lineage-candidates-2026-06-03.json`
- Missing linkage rows: 13
- Missing linkage occurrences: 129
- Mutation rows emitted: 0
- Source rows emitted: 0
- Lexicon entry ids assigned: 0

## Buckets

- no_current_stem_source_candidate_found: 3 rows / 71 occurrences
- project_preferred_function_word_stem_candidate_exists: 3 rows / 23 occurrences
- single_stem_candidate_found_current_pipeline: 6 rows / 32 occurrences
- multi_stem_no_project_preferred_candidate: 1 rows / 3 occurrences

## Candidate Rows

- agent2-orot-gap-tok-bf10df974281: כ״א; occurrences=67; bucket=no_current_stem_source_candidate_found; prefix_class=kaf_prefix; stem=״א; edges=none
- agent2-orot-gap-tok-17ba65351831: ממה; occurrences=18; bucket=project_preferred_function_word_stem_candidate_exists; prefix_class=mem_prefix; stem=מה; edges=def-kaikki-lemma-5388bfc3ab008d81:מה; def-kaikki-lemma-65c05b58585b4f8c:מה; def-layer-ba6e5ad2e99aa94e:מה
- agent2-orot-gap-tok-6b169f83d239: לתן; occurrences=15; bucket=single_stem_candidate_found_current_pipeline; prefix_class=lamed_prefix; stem=תנ; edges=def-kaikki-lemma-1ea9751bcfb2fae2:תן
- agent2-orot-gap-tok-f4684f98dd3c: הגס; occurrences=7; bucket=single_stem_candidate_found_current_pipeline; prefix_class=article_h_prefix; stem=גס; edges=def-kaikki-lemma-f80a58de4db8f68f:גס
- agent2-orot-gap-tok-21ae8291f6e3: הקו; occurrences=4; bucket=single_stem_candidate_found_current_pipeline; prefix_class=article_h_prefix; stem=קו; edges=def-kaikki-lemma-f537a65176796248:קו
- agent2-orot-gap-tok-061fb7148fbc: לזו; occurrences=3; bucket=project_preferred_function_word_stem_candidate_exists; prefix_class=lamed_prefix; stem=זו; edges=def-kaikki-lemma-42ae174c51faf313:זו; def-kaikki-lemma-9226ccb965e2ef1b:זו; def-kaikki-lemma-adca1ebecf5e4976:זו; def-layer-1d4979141a60733b:זו
- agent2-orot-gap-tok-12f1b38c8e82: וחד; occurrences=3; bucket=multi_stem_no_project_preferred_candidate; prefix_class=vav_prefix; stem=חד; edges=def-kaikki-lemma-05aff548b4083369:חד; def-kaikki-lemma-d3f90f220fbc6d14:חד; def-kaikki-lemma-d4efb8bca6290000:חד
- agent2-orot-gap-tok-4a2aa0e83513: ב״ה; occurrences=2; bucket=no_current_stem_source_candidate_found; prefix_class=bet_prefix; stem=״ה; edges=none
- agent2-orot-gap-tok-4c95bb88fb43: שזה; occurrences=2; bucket=project_preferred_function_word_stem_candidate_exists; prefix_class=shin_relative_prefix; stem=זה; edges=def-kaikki-lemma-c5924798c090f139:זה; def-kaikki-lemma-caf6473f67dfb3b2:זה; def-layer-249c2867db674e76:זה
- agent2-orot-gap-tok-7079eb2eb5bb: ו׳; occurrences=2; bucket=no_current_stem_source_candidate_found; prefix_class=vav_prefix; stem=׳; edges=none
- agent2-orot-gap-tok-e634000d8416: כג; occurrences=2; bucket=single_stem_candidate_found_current_pipeline; prefix_class=kaf_prefix; stem=ג; edges=def-kaikki-lemma-1f08c7b44f786e77:ג
- agent2-orot-gap-tok-e7e3dabf0cb3: העב; occurrences=2; bucket=single_stem_candidate_found_current_pipeline; prefix_class=article_h_prefix; stem=עב; edges=def-kaikki-lemma-c922a479b44752c9:עב
- agent2-orot-gap-tok-f87dd75a1506: והו; occurrences=2; bucket=single_stem_candidate_found_current_pipeline; prefix_class=vav_plus_article; stem=ו; edges=def-kaikki-lemma-52a254dcb9506128:ו

## Next Pipeline Route

- Smallest safe unblock: Agent 1/source-owner review of candidate buckets; no direct mutation from this packet.
- Exact non-pipeline blocker: No approved source/linkage rule exists here for assigning missing lexicon_entry_id values.
- If a linkage rule is approved:
  - apply the approved upstream token-index/linkage rule outside this packet
  - rerun write_lexical_payloads.mjs for Orot
  - rerun build_orot_agent2_pilot_lineage_candidates.mjs
  - rerun build_orot_agent2_prefix_stem_counterpart_candidates.mjs

## What Must Not Be Accepted

- Source custody.
- Source/provenance acceptance.
- Definition authority.
- Usage-as-definition authority.
- Accepted translation text.
- QA acceptance.
- Validated public/runtime acceptance.
- Publication readiness.
- Any lexicon_entry_id mutation.
