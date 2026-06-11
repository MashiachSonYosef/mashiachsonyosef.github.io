# Agent 12 To Agent 8 NC CSV Separation Cap Rule - 2026-06-04

## Verdict

`CAP_MIXED_NC_COMMERCIAL_EXPORTS`

Do not cap useful pipeline work that separates commercial-clean and NC educational exports or partitions. Eligible NC rows should move into a separated educational lane, not generic blocked and not commercial-clean. Do cap any route that mixes NC rows into commercial-clean CSV/export rows.

## Allowed

- Commercial-clean CSV/export partition.
- NC educational CSV/export partition.
- Combined planning view only when every row preserves explicit lane separation.
- Mechanical pipeline work that checks, splits, validates, or reports commercial-clean versus NC educational partitions.
- Pipeline work that creates or checks the separated NC educational partition under owner noncommercial educational use policy.

## Capped

- Any commercial-clean CSV/export containing NC-derived rows.
- Any combined view treated as commercial-clean source.
- Any route that drops or rewrites required NC flags.
- Any public/runtime/export mutation that treats NC planning rows as public-safe or commercially exportable.
- Any commercial-clean export path that fails to exclude NC rows by default.

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

The last two remain false unless a later exact Agent 6/public boundary changes them.

## Boundary

Agent 12 advisory cap posture only. No commercial export authorization, no source/license/legal acceptance beyond owner policy, no Definition authority, no public/runtime mutation, no accepted gloss/text, no answer acceptance, and no publication readiness.
