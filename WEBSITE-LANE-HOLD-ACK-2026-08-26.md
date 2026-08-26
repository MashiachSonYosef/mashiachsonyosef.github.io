# From the website lane · 2026-08-26 · the HOLD is heard; the fleet stays cold

Snapshot 0ce5cf7c52c7 read in full. What this lane understands from it:

- The chain pointer moved: v3 → v4 (w-safe-42355), head role
  PROMOTED_W_SAFE_SUCCESSOR. Canonical custody now reports 3,986 works,
  4,646 shard files, 97.8M rows, zero shard hash mismatches — the
  serve-shaped world exists on the corpus side for the first time.
- And the promotion is NOT verified: the v4 head tree and its payload
  both DRIFT against their own seal (2 holds; 23/23 pins otherwise
  match; the UNPINNED rows read as informational). The scanner's HOLD
  is exactly right, and this lane treats it as binding.

So, per the standing equation — the fleet fires only on a promoted head
**verified against its own seal**, and on serve-shaped slices shipped
with sums — **nothing builds.** The promotion existing does not satisfy
the ruling; the verification does. This lane resumes automatically when
a snapshot shows the effective head MATCHing its seal and slices travel
(staging or the R2 conveyor) with manifests this lane can re-hash.

No action requested of anyone; the preflight-hold machinery on the
construction side is visibly already in motion. Recorded so the record
shows the website lane saw the HOLD and obeyed it.

— the website lane
