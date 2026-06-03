# Agent 2 Orot Sefaria Lexicon Hit Audit

Generated: 2026-06-03T11:55:52.338Z

## Boundary

- Evidence-only Sefaria lexicon hit audit for Orot top gap rows.
- The audit stores metadata only: lexicon names, headwords, refs, IDs, response hashes, and parent lexicon details.
- It does not store definition content or notes text, and it emits zero answer rows, route JSONL rows, public HUD rows, accepted glosses, or translation output.
- Hits are not answers. They are candidate source-discovery evidence pending transform, morphology, disambiguation, and license/custody gates.

## Summary

- Status: zero_emission_sefaria_hit_audit
- Audited rows / occurrences: 500 / 8427
- Rows with any Sefaria hit: 314 (62.8%)
- Occurrences covered by any hit: 6006 (71.3%)
- Rows with refs: 242
- Rows with source_url metadata: 222
- Lexicon families seen: 5
- Answer rows emitted: 0
- Public HUD rows emitted: 0
- Route JSONL rows emitted: 0
- Issues: 0
- Warnings: 0

## Lexicon Families

| Lexicon | Row Hits | Occurrence Hits | Entry Hits | Rows With Refs | Rows With Source URL | Sources | Versions |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Jastrow Dictionary | 210 | 4474 | 552 | 207 | 135 | Jastrow Dictionary | London, Luzac, 1903 |
| Klein Dictionary | 214 | 4444 | 558 | 211 | 140 | Klein Dictionary | Carta Jerusalem; 1st edition, 1987 |
| BDB Augmented Strong | 222 | 4435 | 527 | 152 | 222 | Open Scriptures on GitHub |  |
| BDB Dictionary | 221 | 4418 | 646 | 151 | 221 | BDB Dictionary | A Hebrew and English lexicon of the Old Testament, by Francis Brown. With the co-operation of S. R. Driver and Charles A. Briggs. Oxford, 1906 |
| BDB Aramaic Dictionary | 69 | 2048 | 94 | 54 | 69 | BDB Dictionary | A Hebrew and English lexicon of the Old Testament, by Francis Brown. With the co-operation of S. R. Driver and Charles A. Briggs. Oxford, 1906 |

## Top Hit Rows

| Priority | Token | Surface | Normalized | Occurrences | Category | Hit Count | Lexicons | Rough Class |
| ---: | --- | --- | --- | ---: | --- | ---: | --- | --- |
| 1 | tok-20d2e105fd77 | בכל | בכל | 338 | route_cards_without_answer_eligible | 10 | BDB Aramaic Dictionary; BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | prefix_or_clitic_possible |
| 2 | tok-f7199bc62ed1 | האומה | האומה | 245 | ambiguous_answer_candidates | 1 | Jastrow Dictionary | prefix_or_clitic_possible |
| 3 | tok-2a86b3eaee9b | וכל | וכל | 204 | route_cards_without_answer_eligible | 12 | BDB Aramaic Dictionary; BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | prefix_or_clitic_possible |
| 5 | tok-6f3c380a7be9 | האדם | האדמ | 132 | ambiguous_answer_candidates | 15 | BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | prefix_or_clitic_possible |
| 6 | tok-bff9af2524d1 | שהיא | שהיא | 115 | ambiguous_answer_candidates | 3 | Jastrow Dictionary; Klein Dictionary | prefix_or_clitic_possible |
| 7 | tok-1b76a9f88fc7 | לכל | לכל | 102 | route_cards_without_answer_eligible | 11 | BDB Aramaic Dictionary; BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | headword_exact_after_mark_strip |
| 8 | tok-cf9427570b0a | הכל | הכל | 97 | route_cards_without_answer_eligible | 11 | BDB Aramaic Dictionary; BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | headword_exact_after_mark_strip |
| 9 | tok-dfcf4cc0af67 | הנשמה | הנשמה | 95 | ambiguous_answer_candidates | 9 | BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | headword_exact_after_mark_strip |
| 10 | tok-35bce35c1de4 | הקודש | הקודש | 89 | ambiguous_answer_candidates | 2 | Jastrow Dictionary | prefix_or_clitic_possible |
| 11 | tok-42a5e912cd97 | ואת | ואת | 87 | route_cards_without_answer_eligible | 23 | BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | prefix_or_clitic_possible |
| 13 | tok-e858e9fa8bb8 | בה | בה | 82 | route_cards_without_answer_eligible | 3 | BDB Augmented Strong; BDB Dictionary; Klein Dictionary | headword_exact_after_mark_strip |
| 16 | tok-1bfe6fea9d85 | שהם | שהמ | 64 | route_cards_without_answer_eligible | 14 | BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | headword_exact_after_mark_strip |
| 17 | tok-180d57091846 | הולך | הולכ | 63 | route_cards_without_answer_eligible | 3 | BDB Augmented Strong; BDB Dictionary; Klein Dictionary | lexicon_metadata_hit_needs_morphology_disambiguation |
| 18 | tok-3fc615d98aec | ידי | ידי | 63 | route_cards_without_answer_eligible | 11 | BDB Aramaic Dictionary; BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | headword_exact_after_mark_strip |
| 19 | tok-b9470f18041a | להם | להמ | 62 | route_cards_without_answer_eligible | 7 | BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | headword_exact_after_mark_strip |
| 20 | tok-16b3c5cb6ffe | מצד | מצד | 60 | route_cards_without_answer_eligible | 11 | BDB Aramaic Dictionary; BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | headword_exact_after_mark_strip |
| 22 | tok-c3803c6fde17 | חיי | חיי | 57 | route_cards_without_answer_eligible | 15 | BDB Aramaic Dictionary; BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary | headword_exact_after_mark_strip |
| 23 | tok-1282c4d855bc | שיש | שיש | 55 | route_cards_without_answer_eligible | 12 | BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | headword_exact_after_mark_strip |
| 24 | tok-e2d80b36f5bc | ועל | ועל | 55 | route_cards_without_answer_eligible | 20 | BDB Aramaic Dictionary; BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | prefix_or_clitic_possible |
| 25 | tok-12372a227ead | אלהי | אלהי | 52 | ambiguous_answer_candidates | 6 | BDB Aramaic Dictionary; BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | headword_exact_after_mark_strip |
| 26 | tok-7431485e6a2d | הפנימי | הפנימי | 48 | ambiguous_answer_candidates | 4 | BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | prefix_or_clitic_possible |
| 27 | tok-89757cf23d0a | ובכל | ובכל | 47 | route_cards_without_answer_eligible | 10 | BDB Aramaic Dictionary; BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | prefix_or_clitic_possible |
| 29 | tok-589103867952 | זאת | זאת | 46 | route_cards_without_answer_eligible | 4 | BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | headword_exact_after_mark_strip |
| 30 | tok-eb666901ae2d | הכלל | הכלל | 45 | ambiguous_answer_candidates | 7 | Jastrow Dictionary; Klein Dictionary | headword_exact_after_mark_strip |
| 31 | tok-3e2962a4fa72 | חייה | חייה | 44 | route_cards_without_answer_eligible | 12 | BDB Aramaic Dictionary; BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary | headword_exact_after_mark_strip |
| 32 | tok-cbcaf5b860b3 | לישראל | לישראל | 43 | ambiguous_answer_candidates | 7 | BDB Aramaic Dictionary; BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | prefix_or_clitic_possible |
| 33 | tok-2a3aa32e04a0 | מאד | מאד | 42 | route_cards_without_answer_eligible | 6 | BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | headword_exact_after_mark_strip |
| 34 | tok-cf451baa2149 | באור | באור | 40 | ambiguous_answer_candidates | 21 | BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | headword_exact_after_mark_strip |
| 35 | tok-158f1752a1df | דוקא | דוקא | 39 | route_cards_without_answer_eligible | 4 | Jastrow Dictionary; Klein Dictionary | headword_exact_after_mark_strip |
| 36 | tok-887435dda3ab | יוכל | יוכל | 38 | route_cards_without_answer_eligible | 4 | BDB Aramaic Dictionary; BDB Augmented Strong; BDB Dictionary | lexicon_metadata_hit_needs_morphology_disambiguation |
| 37 | tok-36d28ba0f9a5 | ואור | ואור | 37 | ambiguous_answer_candidates | 15 | BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | prefix_or_clitic_possible |
| 39 | tok-8ccbbb100a39 | ממנו | ממנו | 36 | route_cards_without_answer_eligible | 9 | BDB Aramaic Dictionary; BDB Augmented Strong; BDB Dictionary; Klein Dictionary | headword_exact_after_mark_strip |
| 40 | tok-f1522f221367 | הננו | הננו | 36 | route_cards_without_answer_eligible | 8 | BDB Aramaic Dictionary; BDB Augmented Strong; BDB Dictionary | lexicon_metadata_hit_needs_morphology_disambiguation |
| 41 | tok-60a27691865f | הדבר | הדבר | 35 | ambiguous_answer_candidates | 18 | BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | prefix_or_clitic_possible |
| 42 | tok-1a35c95f43fd | הגדולה | הגדולה | 34 | ambiguous_answer_candidates | 6 | BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary | prefix_or_clitic_possible |
| 43 | tok-dbb8e6989d3b | עצמו | עצמו | 34 | ambiguous_answer_candidates | 9 | BDB Augmented Strong; BDB Dictionary; Klein Dictionary | lexicon_metadata_hit_needs_morphology_disambiguation |
| 46 | tok-e1419d66ddac | פנימית | פנימית | 33 | route_cards_without_answer_eligible | 1 | Klein Dictionary | headword_exact_after_mark_strip |
| 47 | tok-09a1636a29b2 | הטבע | הטבע | 32 | ambiguous_answer_candidates | 1 | Klein Dictionary | lexicon_metadata_hit_needs_morphology_disambiguation |
| 49 | tok-7d224139cc6b | ואין | ואינ | 32 | ambiguous_answer_candidates | 17 | BDB Augmented Strong; BDB Dictionary; Jastrow Dictionary; Klein Dictionary | prefix_or_clitic_possible |
| 51 | tok-c32f24bde0ad | תוכל | תוכל | 32 | route_cards_without_answer_eligible | 4 | BDB Aramaic Dictionary; BDB Augmented Strong; BDB Dictionary | lexicon_metadata_hit_needs_morphology_disambiguation |

## Transform Blockers

- A hit may not become `answer_eligible=true` until Agent 1/6 license and custody posture is clear for the lexicon family.
- A hit may not become `answer_eligible=true` until the pipeline proves exact or allowed morphology relation for the Orot token.
- A hit may not become `answer_eligible=true` until disambiguation rules select a candidate without manual semantic arbitration.
- This audit intentionally stores no answer text; an approved transform must define the exact answer text field and source citation field.

## Agent 8 Callback

- Status: zero-emission Sefaria lexicon hit audit produced for Agent 2/Agent 10 chain.
- Artifact path: reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.md
- Selected page or blocker: Orot flagship data-fill route; no public page mutation.
- Agent 1/6 needed: yes, for lexicon-family license/custody boundary before answer transform.
- Agent 2 needed: yes, for pipeline transform implementation only after signed gates.
- Agent 4 needed: no, because no public/runtime output changed.
- Agent 7/13 decision needed: only if mission policy changes allow storing/displaying unresolved lexicon text.
- Next recommended executable route: Agent 1/6 license-boundary review plus Agent 2 transform-spec review; still emit zero answer rows until cleared.

## Issues

- None

## Warnings

- None

## What Must Not Be Accepted

- QA acceptance
- Validated public/runtime acceptance
- Source custody
- Source/provenance acceptance
- Definition authority
- Usage-as-definition authority
- Translation output
- Accepted gloss
- Accepted translation text
- Public HUD mutation
- Route JSONL mutation
- Publication readiness

