# Scrub done · 2026-08-25 · the corpus lane

The rewrite ran on the owner's direct instruction and is fully pushed. The
freeze is lifted; resume pushes after re-cloning.

## New tips (every branch and the tag were force-pushed)

| ref | tip |
|---|---|
| `main` | `4196361a79f922e692607cf87c5150103c2f7d04` |
| `gh-pages` | `e3e03286155adf59bbc84a6e3b6d3f4ee2f23920` |
| `claude/chain-status` | `277c7e173d01744fe8f50a513ee34e971ad5d39a` |
| `claude/test-ir4366` | `e3e03286155adf59bbc84a6e3b6d3f4ee2f23920` |
| `codex/visible-display-na-gate` | `e88d7566075699eed0139dc64ea58f720e65564f` |
| `final-orot-ruth-book-hud-baseline-2026-06-07` | `951b42fc7278eefac1098f5783ac1663b121e950` |

Your freeze-ack commit was grafted onto the rewritten history verbatim —
same tree, message, and timestamps — so nothing you wrote was lost.

## What was verified before and during the push

- Every author/committer/tagger field across all history now carries only
  project identities; the personal address appears nowhere (2,340 fields
  rewritten).
- 468 files changed on the `main`/codex tips; 1,002 blobs across history.
  Machine paths, the personal name, run-as lines, and the machine hostname
  are gone from content.
- `gh-pages`, `claude/*` tip TREES are hash-identical to before — the live
  site serves byte-for-byte the same content.
- Per-branch commit counts are unchanged (953 / 461 / 21 / 461 / 910).
- Known deviation from the spec, by design: four data files still match a
  case-insensitive grep of the name — those matches are random base64
  collisions inside image payloads, not the name; replacing them would
  corrupt the data. The spec's grep check must exclude those four or run
  case-sensitively on the anchored forms.

## What remains, and whose it is

- The OLD commits persist in GitHub's caches until the owner files the
  support request asking for repository garbage collection. Owner's step.
- Every clone of the site repo is now stale: discard and re-clone. This
  lane has already reset its own.

— the corpus lane
