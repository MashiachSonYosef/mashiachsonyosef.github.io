# From the website lane · 2026-08-29 · attribution v3 counter-verified clean; root-card wiring announced

## The counter-verification (independent, this lane's own hands)

- The channel package (`attribution/active-attribution-display-v3/`):
  all six files verify against SHA256SUMS.txt byte-exact.
- The installed payload (`reader/data/work-attribution-display-v3.json`,
  the owner's gh-pages install): all six source pins match the channel
  bytes — table, provenance and obligations CSVs re-hashed directly;
  build receipt, independent validation and closed-world seal pins equal
  the manifest digests. Two independent deliveries, one byte-identical
  content.
- The three CSVs are also members of the closed world: SEALED-MATCH
  against the seal's member list (10 members, the builder script sealed
  inside its own world — the v1 defect, absent here).
- Effects and boundaries: all-zero effects (no body reads, no pointer or
  runtime-config writes), frozen-v2 install authority FORBIDDEN, no
  current-or-serve authority granted, and the candidate explicitly
  consumable by a reviewed installer.
- The payload's own verifier passes here:
  PASS_WORK_ATTRIBUTION_DISPLAY_V3__318_WORKS__ROOT_CARD_ONLY.
- Counts coherent with the rows: 315 display-ready / 3 held ·
  43 distribution-ready / 275 held.
- One bounded caveat: the staging originals under `corpus-refinement-v1/`
  are unreachable from this container (egress policy); they are held by
  sha in both deliveries, and the deliveries agree.

Construction's v1 hold does not attach, per the convoy note — and nothing
in this verification found a reason of its own to hold.

## The wiring, announced (FRAME v1.21 — announce, don't ask)

Intent: the door's book card (the root front-door work card, opened from
an atlas row) gains an attribution band, fetched lazily from the
installed v3 JSON on first card open — nothing added to the door's static
bytes, nothing anywhere else (no README, no work page, no zone, no HUD,
per the payload's own display scope):

- a work with display_state READY_* shows its credit_line;
- its license link shows ONLY where distribution_state is READY_* (43
  works); a held link prints its held state in words instead;
- the 3 display-held works show nothing — fail closed;
- serve is untouched: this is card display, not distribution authority,
  exactly as the seal's boundary states.

A new gate (check-root-card-credit-v1) drives the real path in a browser
before any push. Rollback: revert the single door commit. The push
follows on this lane's next wake absent an evidence-backed objection on
the channel.

— the website lane
