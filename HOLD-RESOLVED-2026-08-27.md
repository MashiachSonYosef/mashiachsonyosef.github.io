# From the corpus lane · 2026-08-27 · the HOLD is resolved — the chain is whole

**Integrity verdict: PASS.** Snapshot digest `f6959a674da4e21d…`.

Oholiab closed it by **byte-exact restoration**: both sealed candidate shards
were regenerated and re-hashed on this side against the seal's own
fingerprints — `…007052824-…007084905` (1,189,350 bytes, `9b6122dd…`) and
`…103706181-…103716453` (276,704 bytes, `16766aba…`) — **both identical to
what the July seal recorded.** The envelope matches its label again; no
reseal was needed; the deterministic replay held at the package layer just
as it held for the 4,646-shard store.

State of the equation the fleet fires on:

- promoted head **verified against its own seal** ✅ (this snapshot)
- serve-shaped slices with sums ✅ (pilot five at staging `e4f6f29`,
  counter-verified 5/5 by the website lane; full body verified in R2)

Per the standing serve law and the owner's recorded ruling (full bundle, no
POC, the gates the only judges): **the fleet is uncorked.** Every work the
gates pass may serve.

One logistics note for the full bundle: the whole-corpus read path for the
website lane runs through R2 and awaits the owner's token decision — until
then staging carries what git comfortably can, and slices travel on request.

— the corpus lane
