# Agent 11 Definition Collision Packet: Peoplehood Forms

Generated: 2026-06-02
Agent: Agent 11 / outside downstream manager and reception translator
Status: reception packet, not QA acceptance
Publication status: `blocked_no_render`

## Scope

Follow-up reception packet for related peoplehood and name-claim terms after the initial `goy` / `yehudi` / `yisrael` packet.

This packet focuses on two things:

- peoplehood senses in available route evidence
- access risk where final-letter Hebrew forms and non-final normalized route keys differ

This is route-evidence interpretation only. It does not decide final meaning and does not claim UI/runtime lookup behavior.

## Input Artifacts

- `data/definitions/hud-route-lookup/shards/05d2-05d5-05d9.json`
- `data/definitions/hud-route-lookup/shards/05d9-05d4-05d5.json`
- `data/definitions/hud-route-lookup/shards/05e2-05de.json`
- `data/definitions/hud-route-lookup/shards/05e2-05de-05d9.json`
- `data/definitions/hud-route-lookup/shards/05e6-05d9-05d5.json`
- `data/definitions/hud-route-lookup/shards/05d1-05e8-05d9.json`
- `data/definitions/hud-route-lookup/shards/05de-05e9-05d9.json`
- `reports/agent6-definition-integrity-gate-2026-06-01.md`
- `reports/definition-workbench-status-contract.md`
- `reports/agent11-definition-collision-packet-name-triad-2026-06-02.md`

## Agent 6 Boundary

Carry forward the Agent 6 WARN boundary:

- `answer_eligible` means HUD answer-slot eligibility only.
- Route evidence is not accepted definition authority.
- Route evidence is not accepted translation text.
- Route evidence is not publication readiness.
- Multi-answer rows remain warnings.
- Publication remains `blocked_no_render`.

## Route Evidence Snapshot

### `goyim`

Checked forms:

- final-mem form codepoints: `05d2 05d5 05d9 05dd`
- plene final-mem form codepoints: `05d2 05d5 05d9 05d9 05dd`
- nearby non-final normalized form codepoints: `05d2 05d5 05d9 05de`

Observed:

- final-mem exact lookups had 0 exact route rows in shard `05d2-05d5-05d9`
- nearby non-final normalized form had 47 route rows and 1 answer-slot card
- answer card: `def-layer-b66d09f6279ee6d1`
- route family: `openscriptures_definition`
- source/license row observed: `wikidata`, `CC0`
- definition text in route card: `goy, non-Jew; goy`

Reception read: this is an access and normalization risk. Public language should not assume the reader can reach the plural form cleanly until Agent 2/4/6 clarify final-letter normalization in runtime lookup.

### `yehudim`

Checked forms:

- final-mem form codepoints: `05d9 05d4 05d5 05d3 05d9 05dd`
- nearby non-final normalized form codepoints: `05d9 05d4 05d5 05d3 05d9 05de`

Observed:

- final-mem exact lookup had 0 exact route rows in shard `05d9-05d4-05d5`
- nearby non-final normalized form had 4 route rows but 0 answer-slot cards
- singular `yehudi` remains the stronger current route-evidence anchor

Reception read: Agent 11 should not build public claims on `yehudim` route evidence yet. Use `yehudi` as the current evidenced collision and ask Agent 2 for plural-form coverage if needed.

### `am`

Checked forms:

- final-mem form codepoints: `05e2 05dd`
- nearby non-final normalized form codepoints: `05e2 05de`

Observed:

- final-mem exact shard `05e2-05dd` was not present
- nearby non-final normalized shard `05e2-05de` exists
- nearby non-final normalized form had 49 route rows and 3 answer-slot cards
- answer cards included:
  - `def-layer-1359db68389bb379`, `project_lexical`, `with`, `workspace`, `project-authored / CC0`
  - `def-kaikki-lemma-730d7892b9f6d06e`, `wiktionary_definition`, togetherness/with senses, `kaikki`, `CC BY-SA 4.0 / GFDL`
  - `def-kaikki-lemma-7475d0be8f5b0e98`, `wiktionary_definition`, `A nation, a people.`, `kaikki`, `CC BY-SA 4.0 / GFDL`

Reception read: `am` is a direct peoplehood collision but also a high-risk ambiguity. It carries `with` and `nation/people` senses in the same normalized form. Public wording should say the route evidence shows a collision, not that a route winner has been selected.

### `amim`

Checked forms:

- final-mem form codepoints: `05e2 05de 05d9 05dd`
- nearby non-final normalized form codepoints: `05e2 05de 05d9 05de`

Observed:

- final-mem exact lookup had 0 exact route rows in shard `05e2-05de-05d9`
- nearby non-final normalized form had 48 route rows and 1 answer-slot card
- answer card: `def-layer-715c7cf47fd0a4d2`
- route family: `openscriptures_definition`
- source/license row observed: `openscriptures`, `CC BY 4.0`
- definition text in route card: `a people (as a congregated unit); specifically; a tribe (as those of Israel); hence (collectively) troops; attendants; figuratively; a flock; folk`

Reception read: this is a strong peoplehood anchor if the normalization path is valid. It gives Agent 11 bridge language around people as a congregated unit, tribe, folk, and collective body, but not accepted translation authority.

### `tzion`

Checked forms:

- final-nun form codepoints: `05e6 05d9 05d5 05df`
- nearby non-final normalized form codepoints: `05e6 05d9 05d5 05e0`

Observed:

- final-nun exact lookup had 0 exact route rows in shard `05e6-05d9-05d5`
- nearby non-final normalized form had 49 route rows and 3 answer-slot cards
- answer cards included:
  - `def-kaikki-lemma-0743045a8c941bc7`, male given name
  - `def-kaikki-lemma-4f6d002305885c6d`, `Zion, Jerusalem`
  - `def-kaikki-lemma-af8a54d6c7196f7d`, landmark/note/mark/grade senses
- source/license row observed: `kaikki`, `CC BY-SA 4.0 / GFDL`

Reception read: `tzion` is not currently clean enough for a single public claim. It is a collision between sacred/place/name senses and ordinary mark/grade senses. Agent 11 should ask Agent 2 for route disambiguation before using it as a core public word.

### `berit`

Checked form codepoints: `05d1 05e8 05d9 05ea`

Observed:

- exact route rows: 47
- answer-slot cards: 1
- answer card: `def-kaikki-lemma-e6022a2ca78136c1`
- route family: `wiktionary_definition`
- source/license row observed: `kaikki`, `CC BY-SA 4.0 / GFDL`
- definition text in route card: `covenant, alliance; brit milah, bris, circumcision ritual`

Reception read: `berit` can support bridge language around covenant/alliance, with the caveat that the route card also carries circumcision-ritual sense. It is useful but not simple.

### `mashiach`

Checked form codepoints: `05de 05e9 05d9 05d7`

Observed:

- exact route rows: 48
- answer-slot cards: 3
- answer cards:
  - `def-kaikki-lemma-add3a83c180e1fe0`, `messiah`
  - `def-kaikki-lemma-e2a347ebd7ea7d14`, `anointed`
  - `def-layer-4527ccaeecf72e21`, `anointed; usually a consecrated person (as a king; priest; saint); specifically; the Messiah; Messiah.`
- source/license rows observed: `kaikki` / `CC BY-SA 4.0 / GFDL`, `openscriptures` / `CC BY 4.0`

Reception read: `mashiach` is already a collision between title, anointing, consecrated function, and expected person. Agent 11 can translate it as a function-word before making any person-claim.

## Collision Read

The peoplehood field has two simultaneous problems:

- semantic collision: words carry several live senses
- access collision: final-letter public forms and non-final normalized route keys may not line up in direct lookup

This matches the user's reception concern: people cannot read the words they need if the public surface cannot reliably expose the relevant layers.

## Translation Ladder

### Inner Language

The peoplehood words are not just meanings; they are access points. If `goy`, `am`, `amim`, `tzion`, `berit`, and `mashiach` cannot be read in their layers, the people cannot recognize themselves or the work.

### Bridge Language

The evidence shows a layered peoplehood vocabulary and a route-access question. Some terms have clear peoplehood senses in route cards, while some final-letter forms need normalization verification before they can be trusted in public-facing lookup or wording.

### Public Language

These words need to be readable before they can be argued over. `Goy`, `am`, `amim`, `Zion`, `covenant`, and `messiah` all carry more than one layer. The project should expose the layers and show the evidence without pretending the machine route has settled the meaning.

## Reception Danger

Likely misreads:

- "The lookup proves the doctrine." Counter: no, it only shows route evidence under Agent 6 WARN boundaries.
- "Missing exact final-letter forms mean the word is absent." Counter: no, nearby normalized forms exist; this is a route-normalization question.
- "Peoplehood language is a public translation output." Counter: no, this remains reception work, not accepted translation text.
- "A single answer card settles public meaning." Counter: no, answer-slot eligibility is not unique semantic truth.

## What Must Not Be Accepted

Do not accept this packet as:

- QA acceptance
- publication readiness
- public/runtime lookup proof
- final-letter normalization proof
- accepted translation text
- reviewed lexical authority
- unique semantic truth
- source/provenance custody
- route publication support
- usage-as-definition authority

## Next Evidence Ask

Agent 2:

- Confirm whether public/runtime lookup normalizes Hebrew final letters to non-final forms before shard lookup.
- If yes, provide a recountable route-normalization packet for the final-letter forms in this packet.
- If no, mark these as reception-critical lookup gaps.

Agent 4:

- If Agent 6 requests runtime proof later, test whether final-letter public forms resolve in the actual browser surface.

Agent 6:

- If the peoplehood packet becomes product-facing, issue a narrow docket stating whether this route-normalization packet may be used as a reception guide only.

Oracle 9:

- Watch for live/public pages where final-letter forms or old HUD surfaces make these words unreadable, stale, or misleading.

