# Agent 10 Mobile Header Overflow Proof - 2026-06-03

Status: local public-artifact proof passed.

Highest permissible claim: Agent 10 produced a bounded local browser proof for a CSS-only public static artifact cleanup. This is not QA acceptance, publication readiness, source/provenance acceptance, Definition authority, route publication support, or accepted translation text.

## Scope

Worktree: `.codex-tmp/hud-deploy-live`

Static public files changed:

- `index.html`
- `orot/index.html`
- `tanakh/genesis/index.html`
- `tanakh/exodus/index.html`
- `tanakh/leviticus/index.html`
- `tanakh/numbers/index.html`
- `tanakh/deuteronomy/index.html`
- `tanakh/ruth/index.html`
- `tanakh/jonah/index.html`
- `tanakh/amos/index.html`
- `tanakh/zechariah/index.html`
- `tanakh/zephaniah/index.html`

Change type: CSS-only containment and wrapping guards for the public root page and currently public reader surfaces.

No HUD data, source text, route shards, runtime JavaScript, generated semantic data, licensing metadata, or publication policy was changed in this packet.

## Local Browser Proof

Browser: Google Chrome headless via DevTools Protocol.

Viewport: `390x844` mobile emulation.

Measured condition: `documentElement.scrollWidth == documentElement.clientWidth` and no body element had a bounding box outside the viewport by more than 1 px.

| Page | Path | Client Width | Scroll Width | Overflow X | Offenders |
|---|---:|---:|---:|---:|---:|
| root | `index.html` | 390 | 390 | 0 | 0 |
| Orot | `orot/index.html` | 390 | 390 | 0 | 0 |
| Genesis | `tanakh/genesis/index.html` | 390 | 390 | 0 | 0 |
| Exodus | `tanakh/exodus/index.html` | 390 | 390 | 0 | 0 |
| Leviticus | `tanakh/leviticus/index.html` | 390 | 390 | 0 | 0 |
| Numbers | `tanakh/numbers/index.html` | 390 | 390 | 0 | 0 |
| Deuteronomy | `tanakh/deuteronomy/index.html` | 390 | 390 | 0 | 0 |
| Ruth | `tanakh/ruth/index.html` | 390 | 390 | 0 | 0 |
| Jonah | `tanakh/jonah/index.html` | 390 | 390 | 0 | 0 |
| Amos | `tanakh/amos/index.html` | 390 | 390 | 0 | 0 |
| Zechariah | `tanakh/zechariah/index.html` | 390 | 390 | 0 | 0 |
| Zephaniah | `tanakh/zephaniah/index.html` | 390 | 390 | 0 | 0 |

Representative measured bounds:

- Root `.shell`: left 10, right 380, width 370.
- Root `.notice`: left 29, right 361, width 332.
- Orot `.hero-notes`: left 29, right 361, width 332.
- Orot `.hero-summary span`: left 29, right 361, width 332.
- Genesis `.hero-notes`: left 29, right 361, width 332.
- Genesis `.hero-summary span`: left 29, right 361, width 332.

## Old HUD Guard

Bounded scan command target set:

`index.html`, `orot/index.html`, and all currently public `tanakh/*/index.html` files in this packet.

Marker expression:

`Clicked Hebrew form|Best actual hit|data-hud-renderings|data-hud-breakdown|Potential options|No lexical entry yet\.|lexical-fields`

Result: zero hits.

## Notes

This packet intentionally fixes the visible mobile/header clipping risk in the public deployment artifact. It does not attempt the durable generator-side breadcrumb/header refactor because the active lightweight Pages workflow copies static HTML files directly and the source worktree has unrelated dirty edits.

Recommended next route after deploy proof: make the same header containment behavior durable in the page generator once the source-lane owner or Agent 7 authorizes touching `scripts/render_site.ps1`.

## Agent 8 Callback

Status: `mobile_header_overflow_local_proof_passed`.

Artifact path: `reports/agent10-mobile-header-overflow-proof-2026-06-03.md`.

Selected page or blocker: no blocker; this is a bounded public static artifact cleanup across the current lightweight deploy page set.

Agent 1/2/4 needed: no.

Agent 7/13 decision needed: no for this CSS-only public artifact packet. A separate generator-durability route may need owner/manager authorization because it touches source-side render code.

Next recommended executable route: commit and deploy the static-page containment patch, then run a bounded live root/Orot/Genesis mobile-layout and old-HUD marker pass.
