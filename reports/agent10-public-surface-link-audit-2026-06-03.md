# Agent 10 Public Surface Link Audit - 2026-06-03

## Scope

Bounded Agent 10 audit of the current lightweight public surface after the About / License header fix.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Pages Checked

Current lightweight Pages artifact surfaces:

- `/`
- `/about/`
- `/404.html`
- `/orot/`
- `/tanakh/genesis/`
- `/tanakh/exodus/`
- `/tanakh/leviticus/`
- `/tanakh/numbers/`
- `/tanakh/deuteronomy/`
- `/tanakh/ruth/`
- `/tanakh/jonah/`
- `/tanakh/amos/`
- `/tanakh/zechariah/`
- `/tanakh/zephaniah/`

## Local Link Audit

Local deploy worktree checked:

- Page count: `14`
- Local links/assets/fragments checked: `27929`
- Broken local links/assets/fragments: `0`

Per-page local check counts:

- `index.html`: `11`
- `about/index.html`: `2`
- `404.html`: `1`
- `orot/index.html`: `2048`
- `tanakh/genesis/index.html`: `6191`
- `tanakh/exodus/index.html`: `4889`
- `tanakh/leviticus/index.html`: `3472`
- `tanakh/numbers/index.html`: `5197`
- `tanakh/deuteronomy/index.html`: `3867`
- `tanakh/ruth/index.html`: `353`
- `tanakh/jonah/index.html`: `205`
- `tanakh/amos/index.html`: `602`
- `tanakh/zechariah/index.html`: `867`
- `tanakh/zephaniah/index.html`: `224`

## Live Status Pass

Cache-busted live fetches after deployment:

- URLs checked: `14`
- Bad status or old-marker result count: `0`
- Last modified returned by current public pages: `Wed, 03 Jun 2026 04:36:41 GMT`

Live titles/statuses:

- `/`: `200`, `Mashiach Son Yosef Library`
- `/about/`: `200`, `About / License - Mashiach Son Yosef Library`
- `/404.html`: `200`, `Not Published`
- `/orot/`: `200`, `Orot`
- `/tanakh/genesis/`: `200`, `Genesis`
- `/tanakh/exodus/`: `200`, `Exodus`
- `/tanakh/leviticus/`: `200`, `Leviticus`
- `/tanakh/numbers/`: `200`, `Numbers`
- `/tanakh/deuteronomy/`: `200`, `Deuteronomy`
- `/tanakh/ruth/`: `200`, `Ruth`
- `/tanakh/jonah/`: `200`, `Jonah`
- `/tanakh/amos/`: `200`, `Amos`
- `/tanakh/zechariah/`: `200`, `Zechariah`
- `/tanakh/zephaniah/`: `200`, `Zephaniah`

Old-marker hits on each live page: `0`.

## Remaining Limits

- This is a release-owner link/status audit, not QA acceptance.
- The audit checks finite current public pages only; it does not claim broad corpus coverage.
- It checks static local link resolution and live top-level page status, not every live linked fragment over HTTP.

## Agent 8 Callback

Status: `current_public_surface_link_audit_passed`

Artifact path: `reports/agent10-public-surface-link-audit-2026-06-03.md`

Selected issue: current public surface header/link integrity after About / License fix.

Agent 1 needed: no.

Agent 2 needed: no.

Agent 4 needed: no.

Agent 6 needed: only for acceptance claims.

Agent 7/13 decision needed: no hard blocker.

Next recommended executable route: continue data/package growth work or run independent QA review if Agent 6 cadence requests it.
