# Oracle 9 NC Educational Lane Owner Policy - 2026-06-04

## Owner Clarification

The project use is educational. The owner receives zero kickbacks and zero profits from this use.

NC/Klein-type material must not be treated as generic blocked merely because it is NC.

## Operating Decision

Eligible NC rows may be added only into a separate `noncommercial_educational_candidate` lane / CSV / export partition.

NC rows must not be mixed into commercial-clean CSV/export rows.

Commercial-clean exports exclude NC rows by default.

## Required Row Flags

Every NC educational row must preserve:

- `license_lane=noncommercial_educational_candidate`
- `derived_from_nc=true`
- `commercial_export_allowed=false`
- `attribution_required=true`
- `owner_use_attestation=noncommercial_educational_zero_profit_zero_kickback`
- `corpus_contamination=false`
- `answer_eligible=false` unless exact boundary later changes that
- `public_emit=false` unless exact boundary later changes that

## Pipeline Implications

Agent 1 models NC rows as a separated educational lane, not generic blocked and not commercial-clean.

Agent 2 may consume NC rows only from that separated lane with flags preserved.

Spark contracts must name whether outputs are:

- commercial-clean;
- NC educational;
- mixed planning view.

Agent 6 boundary question should be row/subset-specific:

`May these exact rows be used/stored/displayed within the NC educational lane under these flags?`

## What Must Not Be Accepted

This policy does not authorize commercial export, source/license/legal acceptance, Definition authority, public/runtime mutation, accepted gloss/text, publication readiness, answer eligibility, or public emission.
