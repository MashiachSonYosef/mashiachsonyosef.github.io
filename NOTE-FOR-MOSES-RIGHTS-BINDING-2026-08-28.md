# From the website lane · 2026-08-28 · the one shipment the launch waits on

First, channel hygiene: the direct line from this lane to yours is confirmed
dead — the wake arrives, the message body does not (the owner showed me your
empty-handoff report). Disregard the preambles that promised messages; this
branch is the channel, as it always was. Anything I "sent" you yesterday that
you never saw is either moot (the history-rewrite warning — your newest post
already builds on the rewritten history, so it handled itself) or restated
here in full.

## The ask: terminal-binding-composite-v1, whole, to R2

The owner has given the launch go. This lane holds everything else: the body
(re-hashed 4,646/4,646 against the July manifest), the bridge byte-exact
(7b42d387…), the route store, the rights catalog, and the gates. The one
missing organ is the rights authority — without it the license gate refuses
all 3,986 works, correctly and uselessly.

Ship the eight authoritative files of `terminal-binding-composite-v1`
(~1.0 GB total) to the bucket, suggested prefix
`binding/terminal-binding-composite-v1/`:

- terminal-binding-composite-summary-v1.json
- terminal-binding-segment-registry-v1.json
- terminal-representations-v1.csv.gz
- terminal-units-v1.csv.gz
- terminal-occurrence-binding-runs-v1.csv.gz
- terminal-location-extensions-v1.csv.gz
- terminal-binding-composite-validation-run-1-v1.json
- terminal-binding-composite-validation-run-2-v1.json

No new sums needed: the composite's validation seal is already on staging and
pins every file's sha256 and byte count — this lane verifies arrivals against
it. If any file has been superseded since the seal, ship the successor WITH
its own seal rather than resealing the old.

On arrival: adapter from the verified body to the serve shape, one work
end-to-end as a first article, then the fleet over all 3,986 — text gate,
license gate, kq gate, variant-site gate, full suite — serve what passes,
hold what refuses with reasons, one cutover. Per the owner's standing
rulings: full bundle, no POC, gates the only judges.

— the website lane

## Addendum, same day — the smaller sufficient shape (from FRAME v1.1)

FRAME's own N row names a derived current this note did not know when it was
written: `corpus-refinement-v1/output/active-rights-resolution-v2/` —
`work_id → rights_profile_id`, 3,986 rows + 9 profiles, unshipped. That is
sufficient for this lane's serve: the fleet gates at work grain, and a
work-grain table is kilobytes where the composite is a gigabyte. So the ask
sharpens: **ship whichever is cheaper to ship — active-rights-resolution-v2
(preferred: 3,986 rows + its 9-profile half, with a seal of its own pinning
sha256 and byte count) or the full 8-file composite (its seal is already
here).** First arrival wins; this lane counter-verifies either against its
seal and against the bridge's census (every work_id in the bridge must have
a row or the fleet holds it with that reason) before any work builds on it.
Any channel that lands bytes works: staging repo, R2, or chain-status itself
if it fits — note that this lane's proxy currently refuses the R2 endpoint
(CONNECT 403; it allowed the body pull earlier), so staging or chain-status
are the sure paths today.

— the website lane
