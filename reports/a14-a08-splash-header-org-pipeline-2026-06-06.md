# A14 -> A08 Splash/Header Organization Pipeline

Date: 2026-06-06
Owner request: push the new org for the splash/header without turning it into a broad website rewrite.
Owner correction: Daniel should become visible only after A10 renders/proves the actual Daniel page and A07 approves it.

## Verdict

Header/splash repair is small.

The current repo root already contains a large library directory structure in `index.html`, including Tanakh grouping, a Daniel link under Tanakh/Writings, and Orot under the Rav Kook/modern thought area. The pipeline should repair the public framing/header and deployment evidence, not rebuild the library.

Daniel is visibility-gated. If a Daniel link/card is present before A10 has rendered and proved the actual `tanakh/daniel/index.html` page and A07 has approved final validation, treat it as not release-ready and do not feature/promote it.

## Current Evidence To Inspect

| file | evidence | meaning |
| --- | --- | --- |
| `index.html` | `<h1>Hebrew Source Workbench</h1>` at current root | Root exists as a directory/workbench, but title/framing is not the desired public identity. |
| `index.html` | `.library-stack`, `data-library-card`, Tanakh groups, Daniel card, Orot card | The full directory structure is present and should be preserved. |
| `orot/index.html` | `Route HUD` and full Orot render surface | Orot remains the render-style target for future reader pages. |
| `tanakh/daniel/index.html` | Daniel page exists with Route HUD surface but remains dirty / not A07-approved in current evidence | Daniel is a rendered work candidate only after A10 actual-page proof and A07 approval. |
| owner report | deployed page shows `Lightweight public HUD surface` / `Only the replacement Route HUD surface is public...` | Public/deployed framing is wrong or stale and must be replaced by the real directory framing. |

## Required Route

| role | assignment |
| --- | --- |
| A08 | Coordinate this packet, timeouts, callback ledger, and owner-facing status. |
| A05 | Implement the bounded homepage/header repair after A08 packet delivery. |
| A06 | Produce evidence/validator output only if file classification or dirty-state proof is needed. |
| A07 | Approve final validation/release gate. Do not ask A06 for approval. |
| A10 | Consult only if the homepage generator/render pipeline is unclear. No churn. |

## Implementation Boundary

Allowed target:
- `index.html` only, unless A05 proves the deployed bad splash comes from another specific source file.

Preserve:
- Existing library cards and grouping.
- Search/filter behavior.
- Orot link under its correct corpus/source area.
- Daniel under Tanakh/Writings only after A10 actual-page render proof and A07 approval.
- Any featured/special Daniel treatment only after the same A10/A07 gate, and only if it does not move Daniel out of its corpus.
- Orot page and Daniel page render behavior.

Do not:
- Re-render all works.
- Touch lexical data.
- Touch Definition/source/license/legal/answer acceptance.
- Delete or reset files.
- Replace the directory with a one-work splash page.
- Route approval to A06.

## Header Copy Target

Use sparse public identity:

```text
Mashiach Son Yosef
Library
```

Acceptable compact subline:

```text
Primary source workspace with Route HUD reader surfaces.
```

Forbidden public framing:

```text
Lightweight public HUD surface
Only the replacement Route HUD surface is public in this deployment.
Older generated HUD pages remain local until they are swapped or cleared.
```

## Executable Pipeline

| step | trigger | action | output artifact | success condition | timeout | fallback | owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Confirm target | Owner says splash/header org is wrong | Inspect `index.html` and search exact deployed bad strings | A08 callback with target file and bad strings | Target is `index.html` or exact alternate source is named | 5 minutes | Mark `HEADER_SOURCE_UNCONFIRMED`; ask owner/A07 before edits | A08 |
| 2. Patch header only | Target confirmed | A05 changes title/H1/public subline only; preserve directory body | Patch/diff summary | Diff touches only header/framing lines unless proven necessary | 10 minutes | Stop and return diff blocker | A05 |
| 3. Static verify | Patch prepared | Check no forbidden splash strings, library cards still present, Orot/Daniel links still present | Validator output or command receipt | Forbidden strings absent; `data-library-card`, `orot/`, `tanakh/daniel/` still present | 5 minutes | Return exact failing selector/string | A05/A06 evidence |
| 4. Daniel visibility gate | Header patch includes or exposes Daniel | Verify A10 actual `tanakh/daniel/index.html` render proof and A07 approval | A10 proof artifact plus A07 approval receipt | Daniel is only visible/featured after proof + approval | 10 minutes | Hide/defer Daniel exposure and continue with non-Daniel splash org | A08/A10/A07 |
| 5. Browser verify | Static verify passed and Daniel gate resolved or deferred | Open root locally and inspect first viewport plus search/cards | Screenshot/brief receipt | Header reads as real library, directory visible, no lightweight overlay copy, no ungated Daniel promotion | 10 minutes | Return screenshot/blocker | A05 |
| 6. Approval gate | Evidence complete | Send compact packet to A07 | A07 approval or warning | A07 approves with warnings or blocks with exact correction | 10 minutes | Keep unreleased; do not publish | A07 |
| 7. Release decision | A07 approves and owner authorizes | Only then publish/deploy through existing release path | Release receipt | Live public page no longer shows forbidden splash copy | owner-defined | Stop; no release | Owner/A07 |

## A08 Callback Shape

```text
status | target file | proposed header diff | validator proof | browser proof | A07 status | next action | boundary
```

## Stop Condition

Stop after bounded homepage/header proof and A07 routing. Do not continue into corpus rendering, repo cleanup, lexical selection, or publication unless owner explicitly starts that next action.
