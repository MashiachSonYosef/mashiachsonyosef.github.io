# Agent 12 To Agent 8 NC Educational Lane Cap Delta - 2026-06-04

## Verdict

`ALLOW_SEPARATED_NC_EDUCATIONAL_LANE_CAP_COMMERCIAL_MIXING`

Eligible NC rows should move into a separated educational lane, not generic blocked and not commercial-clean.

## Cap Posture

- Do not cap useful pipeline work that creates, checks, or validates a separate NC educational CSV/export partition.
- Do cap any work that mixes NC rows into commercial-clean export rows.
- Do cap any work that drops required NC flags.
- Commercial-clean exports exclude NC rows by default.

## Required NC Flags

Every NC row must preserve:

- `license_lane=noncommercial_educational_candidate`
- `derived_from_nc=true`
- `commercial_export_allowed=false`
- `attribution_required=true`
- `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`
- `corpus_contamination=false`
- `answer_eligible=false`
- `public_emit=false`

`answer_eligible=false` and `public_emit=false` remain false unless a later exact boundary changes them.

## Boundary

Agent 12 advisory cap posture only. No commercial export authorization, no source/license/legal acceptance beyond owner policy, no Definition authority, no public/runtime mutation, no answer acceptance, no accepted gloss/text, and no publication readiness.
