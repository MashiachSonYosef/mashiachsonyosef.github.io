# Agent 10 Malachi Pre-HUD Reader-Hint Fix Addendum

Status: `FIXED_LOCAL_PREVIEW_READY_FOR_A14_REVIEW`

Issue:
- Malachi HUD populated from `data/definitions/hud-route-lookup/manifest.json`.
- Malachi pre-HUD did not populate because `tanakh/malachi/index.html` had no `reader_hint_url`.

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

Generated counts:

| work | token occurrences | unique hint rows | runtime hydrated occurrence rows |
| --- | ---: | ---: | ---: |
| esther | 2654 | 1831 | not browser-counted in this addendum |
| ezra | 3538 | 2240 | not browser-counted in this addendum |
| nehemiah | 4822 | 3376 | not browser-counted in this addendum |
| obadiah | 249 | 214 | not browser-counted in this addendum |
| malachi | 789 | 634 | 733 |

Validator/static proof:
- `node scripts/build_reader_hints_from_route_lookup.mjs --works=esther,ezra,nehemiah,obadiah,malachi --report=reports/reader-hints-from-route-lookup-batch2-2026-06-07.md` passed.
- `node scripts/validate_reader_hints_from_route_lookup.mjs --works=esther,ezra,nehemiah,obadiah,malachi` passed.
- `node --check scripts/build_reader_hints_from_route_lookup.mjs; node --check scripts/validate_reader_hints_from_route_lookup.mjs` passed.
- `node scripts/validate_route_hud_page.mjs` passed for Esther, Ezra, Nehemiah, Obadiah, and Malachi.
- `git diff --check` passed for the scoped files, with CRLF replacement warnings only on the five HTML pages.

Browser proof:
- URL: `http://127.0.0.1:8801/tanakh/malachi/`
- Rows: `789`
- Pre-HUD populated rows after hydration: `733`
- Remaining TBD rows: `56`
- Passage jump links: `789`
- `tok-*` visible leak: `false`
- HUD click proof: clicked `tok-5f91d47feb59`; Route HUD opened; source/license evidence visible; scroll lock active.

Boundary:
- Reader convenience candidate hints only.
- Not translation output.
- Not accepted gloss/text.
- Not Definition authority.
- Not answer acceptance.
- Not source/license/legal acceptance.
- No Orot mutation.
- No deploy/release/publication claim.
