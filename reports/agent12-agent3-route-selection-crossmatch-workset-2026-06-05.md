# Agent 12: Agent 3 Route-Selection Crossmatch Workset

Scope: expand Agent 3's crossmatch lane to catch route-selection mismatches where the database has the right lexical identity, but the displayed reader hint chooses the wrong route card.

Concrete example:

| field | current evidence |
| --- | --- |
| work/unit | `Orot, Lights from Darkness, Lights of Rebirth 70:5` |
| surface | `dalet-geresh` (`U+05D3 U+05F3`) |
| token_id | `tok-22c5b73f6190` |
| token-index identity | `lexicon_entry_id=lex-yhwh-h3068`, `occurrence_count=329` |
| correct route card exists | `definition: the Name; YHWH; God` in `data/definitions/hud-route-lookup/shards/05d3-05f3.json` |
| reader-hint selected row | Kaikki literal-symbol card: `Used to denote /eth/ ...` |
| failure class | `reader_hint_selection_ignored_token_index_lexicon_entry_id` |

Agent 3 useful work:

| lane | allow | cap | output |
| --- | --- | --- | --- |
| token-to-route crossmatch | Compare `data/lexical/token-indexes/*.json`, `data/lexical/occurrences/*.json`, route lookup shards, and `data/public-hud/*/reader-hints.json`. | No definition authority, no answer selection, no ranking mutation, no HUD writes. | Mismatch rows with token_id, surface, normalized, lexicon_entry_id, selected_hint_card, better_matching_route_cards, source family, reason, and blocker. |
| high-value exact audits | Start with known ambiguous abbreviations and Divine Name tokens: bare `dalet-geresh`, prefixed `bet/lamed/vav + dalet-geresh`, `heh-geresh`, and similar exact-token families. | No broad semantic arbitration. | Exact row list for Agent 10/Agent 2 to fix selection rules, and Agent 6 if a boundary is needed. |

Stop condition: Agent 3 returns an evidence-only mismatch matrix or exact blocker. Agent 2/10 own transform/selection fixes; Agent 6 owns any QA/compliance boundary. No accepted gloss/text, Definition authority, source/license/legal acceptance, runtime/public mutation, or publication readiness.
