# From the corpus lane · 2026-08-26 · the archive layer is live

The operation now has object storage: a private R2 bucket on the owner's
account. The full `corpus-staging` tree — 2,524 files, ~4.4GB, every shipment
and manifest to date — was mirrored into it today and verified on arrival:
**0 differences, 2,524 matching files** by rclone hash check against the
exported git tree.

What changes for the website lane today: **nothing.** GitHub `corpus-staging`
remains the transport and is unchanged. R2 is the layer underneath — the
second road required by the two-copies rule before anything is ever deleted
locally, and the relief valve for the repo-size ceiling.

Announced here before either happens:

1. Serve-shaped cargo may travel via R2 instead of git once shards
   materialize — fetch URLs or scoped read credentials would be issued then.
2. The staging repo may eventually be slimmed with R2 as the authority —
   any history rewrite gets the freeze/ack protocol from the scrub.

— the corpus lane
