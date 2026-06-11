# Agent 10 Malachi Pre-HUD Reader-Hint Fix Addendum

Status: `FIXED_LOCAL_PREVIEW_READY_FOR_A14_REVIEW_SUPERSEDES_PRIOR_PACKETS`

Supersedes:
- Prior A14 submission `019ea20b-4dca-7b40-96fd-085e81a636b9`.
- Prior A14 submission `019ea221-d10c-75e0-ad06-4d1892b8df0e`.
- Reason: the prior packets fixed missing Malachi `reader_hint_url`, but the route-hint builder still allowed usage-only/form-reference evidence into pre-HUD. This addendum preserves usage-only and form-reference cards as HUD-only evidence and keeps pre-HUD fail-closed.

Issues handled:
- Malachi HUD populated from `data/definitions/hud-route-lookup/manifest.json`, but pre-HUD did not populate because `tanakh/malachi/index.html` had no `reader_hint_url`.
- Malachi pre-HUD then showed repeated `observed usage only`; route usage evidence now stays HUD-only/TBD and cannot populate pre-HUD.
- Malachi pre-HUD showed `form of היווה` for `דְבַר־יְהֹוָ֖ה`; form-reference cards now stay HUD-only/TBD unless a real selected gloss is stored through the HUD.
- Each pre-HUD row now has a compact meta row: `Section top` left, `%match` right.

Pipeline fix:
- Added bounded route-lookup reader-hint builder:
  - `scripts/build_reader_hints_from_route_lookup.mjs`
- Added bounded route-lookup reader-hint validator:
  - `scripts/validate_reader_hints_from_route_lookup.mjs`
- Generated lexical reader-hint candidate artifacts:
  - `data/lexical/reader-hints/esther.json`
  - `data/lexical/reader-hints/ezra.json`
  - `data/lexical/reader-hints/nehemiah.json`
  - `data/lexical/reader-hints/obadiah.json`
  - `data/lexical/reader-hints/malachi.json`
- Wired the five affected second-batch pages to their reader-hint artifacts:
  - `tanakh/esther/index.html`
  - `tanakh/ezra/index.html`
  - `tanakh/nehemiah/index.html`
  - `tanakh/obadiah/index.html`
  - `tanakh/malachi/index.html`
- Added shared pre-HUD section-return affordance:
  - `assets/js/reader-workbench.js`
  - `assets/css/reader-workbench.css`

Generated counts after usage-only exclusion:

| work | token occurrences | unique hint rows | usage-only pre-HUD rows |
| --- | ---: | ---: | ---: |
| esther | 2654 | 946 | 0 |
| ezra | 3538 | 1089 | 0 |
| nehemiah | 4822 | 1802 | 0 |
| obadiah | 249 | 111 | 0 |
| malachi | 789 | 344 | 0 |

Malachi browser/render proof:
- URL: `http://127.0.0.1:8801/tanakh/malachi/?prehud-clean=5`
- Headless Chrome DOM artifact: `%TEMP%/codex-malachi-dom-proof-v2.html`
- Rows: `789`
- Pre-HUD populated rows after hydration: `396`
- Remaining TBD rows: `393`
- Pre-HUD usage-only/form-reference gloss rows: `0`
- Section-top return links: `789`
- First section-top href: `#malachi-1-1`
- `דְבַר־יְהֹוָ֖ה` pre-HUD: `TBD`, not `form of היווה`.

Orot issue-3 judgment:
- The remembered low-score card was found: `הֶחָמְרִי` / `חמר`, `56%`, `Someone who leads a donkey or donkeys.`
- Data class: real HUD route card, but `route_type=lemma` / suffix-stripped candidate.
- Release-owner judgment: keep it HUD-inspectable but do not promote it to pre-HUD by default. In Orot context this is likely a false-positive route for material/physical language, so pre-HUD should remain stricter than HUD.

Validator/static proof:
- `node scripts/build_reader_hints_from_route_lookup.mjs --works=esther,ezra,nehemiah,obadiah,malachi --report=reports/reader-hints-from-route-lookup-batch2-2026-06-07.md` passed.
- `node scripts/validate_reader_hints_from_route_lookup.mjs --works=esther,ezra,nehemiah,obadiah,malachi` passed.
- `node --check assets/js/reader-workbench.js; node --check scripts/build_reader_hints_from_route_lookup.mjs; node --check scripts/validate_reader_hints_from_route_lookup.mjs` passed.
- `node scripts/validate_route_hud_page.mjs` passed for Orot, Ruth, and Malachi.
- `git diff --check` passed for scoped files, with CRLF replacement warnings only.

Timeout report:
- `process_timeout | command=chrome --headless --dump-dom malachi | timeout=30000ms | partial_output_or_artifact=none | next_safe_action=reran with explicit Start-Process wait/kill wrapper and produced %TEMP%/codex-malachi-dom-proof.html`

Boundary:
- Reader convenience candidate hints only.
- Usage-only evidence remains HUD-only/TBD in pre-HUD.
- Form-reference evidence remains HUD-only/TBD in pre-HUD.
- Ambiguous close competing route choices remain TBD unless selected through the HUD.
- Not translation output.
- Not accepted gloss/text.
- Not Definition authority.
- Not answer acceptance.
- Not source/license/legal acceptance.
- No deploy/release/publication claim.

A14 next action:
- Treat this packet as the current A10 handoff for the Malachi pre-HUD fix and shared section-return control.
- Stage only if owner/A14 visual review agrees.
