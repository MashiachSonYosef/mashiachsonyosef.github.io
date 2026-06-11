# Agent 11 Definition Collision Packet: Name Triad

Generated: 2026-06-02
Agent: Agent 11 / outside definition mixer and reception translator
Status: reception packet, not QA acceptance
Publication status: `blocked_no_render`

## Scope

Initial reception packet for three contested identity terms:

- `goy`, normalized codepoints `05d2 05d5 05d9`
- `yehudi`, normalized codepoints `05d9 05d4 05d5 05d3 05d9`
- `yisrael`, normalized codepoints `05d9 05e9 05e8 05d0 05dc`

This packet uses route evidence as contested-definition input only. It does not accept translation text or decide final meaning.

## Input Artifacts

- `data/definitions/hud-route-lookup/shards/05d2-05d5-05d9.json`
- `data/definitions/hud-route-lookup/shards/05d9-05d4-05d5.json`
- `data/definitions/hud-route-lookup/shards/05d9-05e9-05e8.json`
- `reports/agent6-definition-integrity-gate-2026-06-01.md`
- `reports/definition-workbench-status-contract.md`

## Agent 6 Boundary

Agent 6 returned WARN for definition integrity. The route data has no hard machine-contract blockers in the public lookup shards, but the boundary is strict:

- `answer_eligible` means HUD answer-slot eligibility only.
- It is not an accepted definition.
- It is not unique semantic truth.
- It is not publication-ready translation support.
- Multi-answer collisions remain warnings.
- Publication remains `blocked_no_render`.

The Definition Workbench status contract also says machine `single_answer_source_complete` is not reviewed lexical authority, and `verified` is reserved for future reviewed authority.

## Agent 2 Route Evidence Snapshot

### `goy`

- Shard: `05d2-05d5-05d9`
- Route count: 47
- Answer-slot cards: 1
- Answer card: `def-kaikki-lemma-74b29f1765d83f22`
- Route family: `wiktionary_definition`
- Source: Hebrew Wiktionary data via Kaikki/Wiktextract
- License: `CC BY-SA 4.0 / GFDL`
- Definition text in route card: `A nation.; A nation other than Israel.; gentile (a non-Jewish person), goy`

Reception read: the available answer-slot route already preserves `nation` before the outsider/person sense. That supports treating the public fight as a peoplehood/nationhood collision, not only a slur-cleanup problem.

### `yehudi`

- Shard: `05d9-05d4-05d5`
- Route count: 17
- Answer-slot cards: 3
- Answer cards:
  - `def-kaikki-lemma-08b3f14faaa7a6de`
  - `def-kaikki-lemma-5bcfaac4e4820af5`
  - `def-kaikki-lemma-7ad4ae71b9a28343`
- Route family: `wiktionary_definition`
- Source: Hebrew Wiktionary data via Kaikki/Wiktextract
- License: `CC BY-SA 4.0 / GFDL`
- Senses represented in answer cards: Jewish/Judaism relation, Jew/Jewish person, Judahite, male given name

Reception read: `yehudi` is already layered in route evidence. It cannot be received as only one modern ownership category without flattening tribe, people/person, religious relation, and name senses.

### `yisrael`

- Shard: `05d9-05e9-05e8`
- Route count: 48
- Answer-slot cards: 3
- Answer cards:
  - `def-kaikki-lemma-af5a43850fdee2dd`
  - `def-kaikki-lemma-c4c7b5635a483860`
  - `def-layer-8f350279cbd27165`
- Route families: `wiktionary_definition`, `openscriptures_definition`
- Sources: Hebrew Wiktionary data via Kaikki/Wiktextract, OpenScriptures HebrewLexicon
- Licenses: `CC BY-SA 4.0 / GFDL`, `CC BY 4.0`
- Senses represented in answer cards: modern country, Kingdom of Israel, Jacob, children of Israel, Jewish people, male given name, strict OpenScriptures rendering `Israel`

Reception read: `yisrael` is the strongest collision in this triad. The route evidence itself mixes state, kingdom, patriarch/person, children/people, and name. Public language must not let the modern state silently consume the whole word.

## Collision Read

The triad is not three isolated words. It is a reception field:

- `goy` carries nation/peoplehood and outsider/person senses.
- `yehudi` carries Jewish/Judaism, Jew/Jewish person, Judahite, and name senses.
- `yisrael` carries state, kingdom, Jacob/person, children/people, and name senses.

The public risk is semantic monopoly: one modern sense gets treated as the whole word, while older or adjacent senses become unreadable.

## Translation Ladder

### Inner Language

The names are contested jurisdiction. `Goy` is peoplehood before it is a slur. `Yehudi` is not a single gatekeeping switch. `Yisrael` cannot be collapsed into the modern state.

### Bridge Language

The route evidence shows these identity terms are layered, not flat. `Goy`, `yehudi`, and `yisrael` each carry multiple peoplehood, lineage, state, tribal, religious, and name senses. The project should expose those layers before arguing from them.

### Public Language

Words like Israel, Jew, and goy do not have one simple modern meaning. They carry layers: nation, people, tribe, kingdom, person, state, and name. Our first task is to make those layers readable again.

## Reception Danger

Likely misreads:

- "This is anti-Jewish." Counter: the packet critiques definition monopoly and word collapse, not people as a group.
- "This proves a new official definition." Counter: this is route evidence under Agent 6 WARN boundaries, not accepted translation or reviewed authority.
- "This is just branding." Counter: this is evidence-linked reception work around contested identity terms.
- "The public site proves the current project state." Counter: public/runtime state must be checked separately; stale public artifacts remain reception risks.

## What Must Not Be Accepted

Do not accept this packet as:

- QA acceptance
- publication readiness
- accepted translation text
- reviewed lexical authority
- unique semantic truth
- source/provenance custody
- route publication support
- usage-as-definition authority

## Next Evidence Ask

Agent 2:

- Provide route evidence for plural and related forms if available: `goyim`, `yehudim`, `am`, `amim`, `tzion`.
- Preserve route ids, source/license rows, answer roles, and multi-answer warnings.

Agent 6:

- If this packet becomes product-facing, issue a narrow reception/definition-boundary docket or explicitly say no docket is needed because the packet remains owner/internal.

Oracle 9:

- Send live public artifacts that currently expose old or flattened meanings, especially where public pages contradict Agent 6 boundaries or current repo state.

