# chain-status — SHA256 chain state of the "999 footsteps" workspace

This branch (`claude/chain-status`) is written by a local uploader agent (Claude Code,
running on the owner's machine) so that cloud agents **without filesystem access** can see the
state of the workspace's additive chain head lineage and detect hash changes. It is an
orphan branch: it shares no history with the site branches and never touches the live site.

The workspace itself is read-only to the uploader; everything here is derived observation.

## What to fetch

Base: `https://raw.githubusercontent.com/mashiachsonyosef/mashiachsonyosef.github.io/refs/heads/claude/chain-status/`

| File | Purpose |
|---|---|
| `status/latest.json` | Full current snapshot (schema below). |
| `status/heartbeat.json` | Written on **every** scan even when nothing changed: `scanned_at_utc`, `state_digest`, `changed`, `integrity_verdict`. Distinguishes "no change" from "uploader not running". A crashed scan still publishes `integrity_verdict: "ERROR"` with a null digest and an `error` message — treat that as "scanner broke", distinct from a stale timestamp ("scanner never ran"). |
| `status/diff-latest.json` | Machine-readable diff of the most recent state change (`added` / `removed` / `changed`, keyed `pin:<path>`, `tree:<root>`, `watch:<path>`). |
| `status/history/<utc>.json` | One archived snapshot per observed state change. |
| `CHANGES.md` | Human-readable change log, newest first. |

**Cheapest change check:** fetch `status/heartbeat.json` and compare `state_digest` with
the one you last saw. Different digest ⇒ something changed ⇒ read `status/diff-latest.json`
for what, then `status/latest.json` for the full picture.

## Snapshot schema (`chain-status-snapshot-v2`)

- `state_digest` — SHA256 over the deterministic snapshot body (timestamps excluded).
  Equal digests ⇒ byte-identical observed state.
- `chain` — the live head pointer (`rebuild-c0-w/control/current-additive-chain-head-v0.json`)
  as `{path, bytes, sha256}` plus parsed `head_id`, `head_role`, `predecessor_id`,
  `pointer_generation`, `canonical_custody`, `chain_geometry`.
- `integrity.verdict` — `PASS` or `HOLD`. `HOLD` means something sealed/immutable no longer
  matches its recorded hash; details are in `pins[]` / `trees[]` with status `DRIFT` or `MISSING`.
- `pins[]` — every `{path, bytes, sha256}` binding recorded inside the head pointer,
  re-hashed on disk: `status` is `MATCH`, or an anomaly — `DRIFT`, `MISSING`, `NOT_A_FILE`,
  `ESCAPES_ROOT` (tampered pin path), `ERROR` (unreadable). Every non-`MATCH` is a hold:
  these are immutable bindings, so *any* departure counts.
- `trees[]` — recomputed typed-tree roots (the workspace's own `seal_common.mjs` algorithm,
  reimplemented read-only) for every chain package under `rebuild-c0-w/control/`
  (`additive-chain-head-*`, `current-additive-chain-head-v0*`, `independent-audits/*`).
  Where the pointer records an expected root, `status` is `MATCH`/`DRIFT`; otherwise `UNPINNED`.
  Fail-closed statuses also appear and count as holds: `UNVERIFIED` (an expected root that
  could not be computed at all — package missing, renamed, or no longer a plain directory)
  and `ERROR` (unreadable package, or a sealed path replaced by a symlink/junction, which
  the scanner refuses to hash through).
  On `DRIFT`, `drift_vs_seal` lists the exact `missing` / `extra` / `changed` files relative
  to the package's own target seal. Each tree also carries its full live file list.
- `watch[]` — live `{path, bytes, sha256}` of **mutable** control files (head pointer,
  protected-state paths, y-seals, retention checkpoints, website-dependency manifest).
  No verdict: these are expected to change; track them across snapshots via the diff.

## Standing observations (as of the 2026-08-24 baseline)

1. **Integrity HOLD**: the current head package
   `additive-chain-head-v4-w-safe-42355-candidate-v0` fails its recorded payload/package
   tree roots. Exactly two sealed candidate shards are missing from
   `payload/candidate-shards/` (the directory was emptied 2026-08-13):
   `…007052824-…007084905.csv.gz` and `…103706181-…103716453.csv.gz`.
   All 23 individually-pinned files still match, and predecessor v3 and the independent
   audit packages verify clean — so this is confined to the two shard files. The pointer's
   `chain_geometry.adopted_shards: 2` suggests deliberate adoption, but no retention receipt
   naming these shards was found. The HOLD stays visible here until the owner reseals or rules it.
2. **Chain currency**: the head pointer was last advanced 2026-07-28 while daily work
   continues elsewhere in the workspace — the chain lags the live work.

## Update discipline

Scans are run by the local uploader (`tools/scan-chain-v1.mjs`, committed on this branch so
you can audit exactly what produced the data). Not on a timer yet — check
`status/heartbeat.json` for the last scan time. Snapshots are append-only observations;
nothing on this branch mutates the workspace.
