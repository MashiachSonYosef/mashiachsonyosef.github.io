# Agent 1 Old Dictionary Source-Family Overlap Matrix - 2026-06-05

production lane | direct active goal | recallable state/proof artifact | exact blocker | stop condition | correction owner

Hebrew import/source/license/custody/source-lane evidence | source-family overlap matrix for old-dictionary reaudit | `reports/agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.json`; validator `scripts/validate_agent1_old_dictionary_source_family_overlap_matrix.mjs` -> `reports/agent1-old-dictionary-source-family-overlap-matrix-validation-result-2026-06-05.json` | commercial-clean overlap with NC/blocked families still requires Agent 6 source-family selection boundary | Stop before Agent 6 delivery, Agent 2 transform, candidate text, source/license/legal acceptance, Definition/runtime/publication/product/answer acceptance, queue mutation, render mutation, staging, or release action. | current Agent 1 `019e975d-dc9f-7020-a7c8-885d083a837e`; old Agent 1 archived/do-not-use

target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition

`old-dictionary-excluded-row-license-lane-reaudit source-family overlap matrix` | `reports/agent2-orot-sefaria-public-domain-candidate-preview-2026-06-04.json`; `reports/agent1-old-dictionary-source-family-membership-manifest-2026-06-05.json`; `reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json` | 10 pairwise intersections; 13 exact combinations; exact combinations cover 500 rows / 8427 occurrences; commercial-internal pair rows 252; commercial+NC pair rows 362; commercial+blocked pair rows 425; NC+blocked pair rows 140 | `commercial_clean_candidate`; `noncommercial_educational_candidate`; `metadata_or_link_only`; `blocked_or_needs_review` | overlap rows require Agent 6 source-family selection boundary; Klein remains NC; BDB Augmented Strong remains blocked/review; no-source-family-hit rows lack source evidence | Agent 2 blocked until exact lane evidence plus Agent 6 boundary; Agent 6 future boundary owner; Agent 10 package assembly only | Stop before Agent 6 delivery, Agent 2 transform, candidate text, source/license/legal acceptance, Definition/runtime/publication/product/answer acceptance, queue mutation, render mutation, staging, or release action.

## Pairwise Intersections

| pair | lanes | rows | occurrences | token_ids_sha256 |
| --- | --- | ---: | ---: | --- |
| Jastrow Dictionary + BDB Dictionary | commercial_clean_candidate | 134 | 3145 | `8314fed7e1ee0e7f349c77ea7220610f091165243d01b8c24de940e08f71166d` |
| Jastrow Dictionary + BDB Aramaic Dictionary | commercial_clean_candidate | 49 | 1632 | `619c748579409ba75454e111481ab3861b63aab155b3be12e5485a261d763518` |
| Jastrow Dictionary + Klein Dictionary | commercial_clean_candidate, noncommercial_educational_candidate | 176 | 3718 | `fdbc75aa120a5f10ebaf32f9198f9f0f5a585805bcd27e3cc4365bcb25a108ca` |
| Jastrow Dictionary + BDB Augmented Strong | commercial_clean_candidate, blocked_or_needs_review | 135 | 3162 | `6c9c0f05919f0e3ded6ae8f55c5872f12cb01618c688b499ef62debacda1c3a2` |
| BDB Dictionary + BDB Aramaic Dictionary | commercial_clean_candidate | 69 | 2048 | `4e4e82029d8e825c8b7d6adf6c25b24ced795753c781b476bb9f261c86201c26` |
| BDB Dictionary + Klein Dictionary | commercial_clean_candidate, noncommercial_educational_candidate | 139 | 3350 | `e02e38199bb485a0c36940b1a32acad3d64f684650e6f6aaa965edf1a3670b15` |
| BDB Dictionary + BDB Augmented Strong | commercial_clean_candidate, blocked_or_needs_review | 221 | 4418 | `ae686072738dc027e7298c687ca49bf3473788745b4f158de02c53167d2677fe` |
| BDB Aramaic Dictionary + Klein Dictionary | commercial_clean_candidate, noncommercial_educational_candidate | 47 | 1632 | `a803ecffc3c2cffcd9bb3e47f2c7daec993b3e2663122ae1364fe33edb70b2df` |
| BDB Aramaic Dictionary + BDB Augmented Strong | commercial_clean_candidate, blocked_or_needs_review | 69 | 2048 | `4e4e82029d8e825c8b7d6adf6c25b24ced795753c781b476bb9f261c86201c26` |
| Klein Dictionary + BDB Augmented Strong | noncommercial_educational_candidate, blocked_or_needs_review | 140 | 3367 | `fe48a061341ff92f19931ed961b0b45196a3366a9322c87766f287c310b2c888` |

## Exact Combinations

| combination | lanes | rows | occurrences | token_ids_sha256 |
| --- | --- | ---: | ---: | --- |
| Jastrow Dictionary + BDB Dictionary + BDB Aramaic Dictionary + Klein Dictionary + BDB Augmented Strong | commercial_clean_candidate, noncommercial_educational_candidate, blocked_or_needs_review | 40 | 1464 | `40399918d05379c56f33fe1cac7be6d7911e0c4166fb6abc54b8fa5394fe396b` |
| BDB Dictionary + BDB Aramaic Dictionary + Klein Dictionary + BDB Augmented Strong | commercial_clean_candidate, noncommercial_educational_candidate, blocked_or_needs_review | 7 | 168 | `70011356afa78a4602c25a92d095d41f9e8abb1616e7c9425915bdfa928d69b6` |
| Jastrow Dictionary + BDB Dictionary + BDB Aramaic Dictionary + BDB Augmented Strong | commercial_clean_candidate, blocked_or_needs_review | 9 | 168 | `0ded77e80564ae0ef65e3262c1b9fe274b998dfb341702efa8cf1698ae68cb30` |
| Jastrow Dictionary + BDB Dictionary + Klein Dictionary + BDB Augmented Strong | commercial_clean_candidate, noncommercial_educational_candidate, blocked_or_needs_review | 78 | 1419 | `9e3d028270fd9f0689a59d44f0f2370b9d184c6a7468fd66677e6f9a1b47f902` |
| BDB Dictionary + BDB Aramaic Dictionary + BDB Augmented Strong | commercial_clean_candidate, blocked_or_needs_review | 13 | 248 | `e3ea0b02686b512b3aa12e3bcb1aa0d2684133698cbfc62927e971ce67649968` |
| BDB Dictionary + Klein Dictionary + BDB Augmented Strong | commercial_clean_candidate, noncommercial_educational_candidate, blocked_or_needs_review | 14 | 299 | `b1bf86e24d211967a015fea323b4696d6d21a01d5559f6ef26613636f9937f2c` |
| Jastrow Dictionary + BDB Dictionary + BDB Augmented Strong | commercial_clean_candidate, blocked_or_needs_review | 7 | 94 | `c1a3a7278106ce1d06d7c08469141651d22cd819934206b469233c0abda2439e` |
| Jastrow Dictionary + Klein Dictionary + BDB Augmented Strong | commercial_clean_candidate, noncommercial_educational_candidate, blocked_or_needs_review | 1 | 17 | `f483efa98c9a95124cb79848d25a7aa36b5f82ea5d47b462395ede12c3cb636d` |
| BDB Dictionary + BDB Augmented Strong | commercial_clean_candidate, blocked_or_needs_review | 53 | 558 | `661504bf0238ee29cbf8d967d6484b332fd4d2cf7ee18cc250c8121467f08a04` |
| Jastrow Dictionary + Klein Dictionary | commercial_clean_candidate, noncommercial_educational_candidate | 57 | 818 | `ccfbc390bdb69859b5b939daa427efe9d9a0508ea228dcab7078e83d620c9937` |
| Jastrow Dictionary | commercial_clean_candidate | 18 | 494 | `5d181f4f6cebe4a8231d3f74784ea2334b453bea500c2bf57ed78791902faf60` |
| Klein Dictionary | noncommercial_educational_candidate | 17 | 259 | `3d49e2b7dc8ea5d05deb98d90d40e01b3f4e0d036a5b231f6b4b0bfdbce2ef6b` |
| none | blocked_or_needs_review | 186 | 2421 | `fb0342c8f5fe554f9b1773941ef9a3b073943d3bd37cc56f41f08ab745814c71` |
