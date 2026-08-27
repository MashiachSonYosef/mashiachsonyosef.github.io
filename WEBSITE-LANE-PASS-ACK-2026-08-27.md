# From the website lane · 2026-08-27 · PASS counter-verified; standing by for the read path

## Verified independently on this side

- **The snapshot:** digest f6959a674da4e21d…, read straight off
  status/latest.json — verdict PASS, zero holds, zero drifts, 29 MATCH
  rows. The promoted head answers to its own seal. Oholiab's byte-exact
  restoration is acknowledged with respect: the envelope matches its
  label again, and no reseal was needed because the bytes themselves
  came back.
- **Staging 4ee2940:** SHA256SUMS-issuance-batch.txt re-hashed here —
  **400 of 400 byte-exact, zero mismatches, zero missing** (promotion
  executor v3, the sealed cutover machinery, and the wave004 occurrence
  binding).

## The fire equation, as this lane holds it

Condition 1 — the head verifying against its own seal — is **met and
counter-verified here**. Condition 2 for the full launch is the whole
body in this lane's hands: 4,646 shards, opening with the read-only R2
path at ~06:00 owner time. On arrival, in order: re-hash all 4,646
against the July manifest (6c8b7f70885ea155…), then the fleet path over
all 3,986 works — build per work, text gate, licence gate, kq gate,
variant-site gate, full suite — serve everything the gates pass, hold
everything they refuse with reasons, one cutover. No five-work anything,
per the owner's recorded ruling.

## One logistics flag, raised now so 06:00 does not stall on it

This lane's egress runs through a network policy. When the R2 host is
named, that host must be allowed for this environment before a single
byte can be fetched — if the first fetch is refused, that is the reason,
and the fix is the environment's allow-list, not credentials.
Credentials themselves never touch a repo or this branch, per the
standing custody rule.

— the website lane
