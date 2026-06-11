# Agent 11 Definition Collision Packet: Outsider Status Cluster

Generated: 2026-06-02
Agent: Agent 11 / outside downstream manager and reception translator
Status: reception packet, not QA acceptance
Publication status: `blocked_no_render`

## Scope

Reception packet for a status/outsider cluster surfaced by Oracle 9 and verified by Agent 11 route checks:

- `ivri`, codepoints `05e2 05d1 05e8 05d9`
- `ger`, codepoints `05d2 05e8`
- `nochri`, codepoints `05e0 05db 05e8 05d9`
- `zar`, codepoints `05d6 05e8`

This packet does not assign people to categories. It does not produce a social/legal taxonomy. It only records that route evidence shows different status, relation, residence, foreignness, language, and ordinary-object senses that should not be flattened into one insult field.

## Input Artifacts

- `reports/oracle9-agent11-reception-surveillance-2026-06-02.md`
- `data/definitions/hud-route-lookup/shards/05e2-05d1-05e8.json`
- `data/definitions/hud-route-lookup/shards/05d2-05e8.json`
- `data/definitions/hud-route-lookup/shards/05e0-05db-05e8.json`
- `data/definitions/hud-route-lookup/shards/05d6-05e8.json`
- `reports/agent6-definition-integrity-gate-2026-06-01.md`
- `reports/definition-workbench-status-contract.md`

## Agent 6 Boundary

Carry forward the Agent 6 WARN boundary:

- `answer_eligible` means HUD answer-slot eligibility only.
- Route evidence is not accepted definition authority.
- Route evidence is not accepted translation text.
- Route evidence is not publication readiness.
- Route evidence is not unique semantic truth.
- Usage rows remain usage-only.
- Publication remains `blocked_no_render`.

## Route Evidence Snapshot

### `ivri`

- Shard: `05e2-05d1-05e8`
- Route count: 26
- Answer-slot cards: 2
- Answer cards:
  - `def-kaikki-lemma-8d51222ffc9ddad0`, `Hebrew (person)`
  - `def-kaikki-lemma-af8657d03f12ffa7`, `Hebrew`
- Route family: `wiktionary_definition`
- Source/license row observed: `kaikki`, `CC BY-SA 4.0 / GFDL`

Reception read: `ivri` is a person/language identity route, not the same kind of outsider-status word as `ger`, `nochri`, or `zar`.

### `ger`

- Shard: `05d2-05e8`
- Route count: 53
- Answer-slot cards: 4
- Answer cards:
  - `def-kaikki-lemma-321d4dc933cdb118`, `adventitious`
  - `def-kaikki-lemma-a2d47709c47b8b85`, `foreigner, stranger: one who sojourns in a foreign place; convert to Judaism, proselyte`
  - `def-kaikki-lemma-bb63f6d56082460b`, `to dwell, reside, live`
  - `def-kaikki-lemma-f810cc75569345fa`, `to assail`
- Route family: `wiktionary_definition`
- Source/license row observed: `kaikki`, `CC BY-SA 4.0 / GFDL`

Reception read: `ger` is highly layered: stranger/foreigner, sojourner, convert/proselyte, residence/dwelling, and unrelated verbal sense. It should not be flattened into a simple outsider label.

### `nochri`

- Shard: `05e0-05db-05e8`
- Route count: 30
- Answer-slot cards: 2
- Answer cards:
  - `def-kaikki-lemma-dbde663be02a6ab7`, `foreigner, alien; gentile, non-Jew`
  - `def-kaikki-lemma-dc8327a718162785`, `foreign, alien; gentile, non-Jewish`
- Route family: `wiktionary_definition`
- Source/license row observed: `kaikki`, `CC BY-SA 4.0 / GFDL`

Reception read: `nochri` is closer to foreign/alien/non-Jewish status language, but still route evidence only. Public wording must not use it to label people.

### `zar`

- Shard: `05d6-05e8`
- Route count: 48
- Answer-slot cards: 3
- Answer cards:
  - `def-kaikki-lemma-1f8d157d9b2091ae`, `wreath; bouquet`
  - `def-kaikki-lemma-7a157927a26ba2e1`, `alien, foreigner`
  - `def-kaikki-lemma-8048d3c8220eb571`, `foreign`
- Route family: `wiktionary_definition`
- Source/license row observed: `kaikki`, `CC BY-SA 4.0 / GFDL`

Reception read: `zar` is a warning against overreading. It has ordinary object senses and foreignness senses in the same route field. It cannot be used as a clean status category without disambiguation.

## Collision Read

This cluster shows that outsider/status language is not one word-field:

- `ivri` points toward Hebrew person/language identity.
- `ger` points toward sojourning, foreignness, conversion, dwelling, and other senses.
- `nochri` points toward foreign/alien/non-Jewish relation.
- `zar` points toward foreignness and also non-status ordinary senses.

The reception danger is treating all four as one insult taxonomy or as a clean identity map. Agent 11 should resist that collapse.

## Translation Ladder

### Inner Language

The outsider words are broken into different functions: crossing, dwelling, foreignness, language, strangerhood, conversion, and ordinary otherness. They are not one curse.

### Bridge Language

The route evidence shows several different relation-words, not one outsider category. Hebrew/person identity, sojourning, conversion, foreignness, alienness, and ordinary non-status senses must be separated before any public argument.

### Public Language

Do not flatten Hebrew outsider terms into one insult field. The evidence shows different words doing different work: language/person identity, sojourning, conversion, foreignness, and ordinary non-status meanings.

## Reception Danger

Likely misreads:

- "This is a taxonomy for labeling people." Counter: no, this is a reception packet about route evidence and word collapse.
- "All outsider terms mean the same thing." Counter: no, the route evidence separates person/language, sojourning, conversion, foreignness, and ordinary senses.
- "This proves a doctrine of outsiders." Counter: no, Agent 6 boundaries make this route evidence only.
- "This is public-ready wording." Counter: no, publication remains `blocked_no_render`.

## What Must Not Be Accepted

Do not accept this packet as:

- QA acceptance
- publication readiness
- public/runtime clearance
- accepted translation text
- reviewed lexical authority
- unique semantic truth
- social/legal identity assignment
- insult taxonomy
- source/provenance custody
- route publication support
- usage-as-definition authority

## Next Evidence Ask

Agent 2:

- Produce a comparison packet for `ivri`, `ger`, `nochri`, and `zar` with all answer-slot route ids, source/license rows, and multi-answer warnings.
- Separate person/language, sojourner/resident, convert/proselyte, foreign/alien, and ordinary-object senses.

Agent 6:

- If this cluster becomes product-facing, define the warning line that prevents it from becoming a public labeling taxonomy.

Oracle 9:

- Watch for public/live or owner-language usage that collapses these terms into one outsider/slur category.

