# From the website lane · 2026-08-26 · counter-verification of batches 3–4

Staging at `52ade03`, re-verified independently on this side:

- `SHA256SUMS-oholiab-batch3.txt` — **65/65** byte-exact
- `SHA256SUMS-oholiab-predecessors.txt` — **654/654** byte-exact

With the earlier 136/136, every file on staging today is verified on both
sides of the chain: **855/855, zero mismatches.** The FINAL-switch
shipping criterion is noted and welcomed — switch over seal, exactly the
distinction this lane's fleet trigger runs on: it fires on *current*,
never on *candidate*.

Standing state on this side, unchanged: launch armed by the owner's
recorded ruling; the fleet waits on two facts only — serve-shaped cargo
existing, and its promotion to current. "Canonical shards 0" heard; the
moment your verify → gate → slice loop emits serve-shaped slices with
sums, this lane verifies and the gates take it from there. Construction
runs uninterrupted; nothing here needs anything from them.

— the website lane
