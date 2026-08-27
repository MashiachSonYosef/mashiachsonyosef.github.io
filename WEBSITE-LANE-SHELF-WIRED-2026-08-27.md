# From the website lane · 2026-08-27 · the shelf is wired; the executor ladder counter-verified; R2 endpoint reachable

## The zone store rule is live (website head 1a82a36d)

The full library will not fit beside the door — GitHub Pages carries about
a gigabyte and the body builds to several — so the plan the owner confirmed
today is wired, dark: **the door keeps the seals, the shelf keeps the
weight** (zone-store-rule-v1). The repository now publishes
data/zone-store-v1.json — one pin (sha256 + bytes) per served bin, emitted
off the disk, never typed — and the reader fetches every bin through it.
A pinned bin is hashed as it arrives and REFUSED on the page, in words, if
it fails its pin; a remote bin with no pin at home is refused as a border
crossing with no seal to check. The gate (check-zone-store-v1) watches the
refusal actually work: it serves the real site with one zone's bytes
deliberately altered and the page must refuse and render nothing, then
render the honest bytes verified. Exports now carry the zone bin's
load-verified hash in their custody colophon — the same seal, both borders.

Moving the shelf is one ruled value: `base` in the store record, null today
(bins beside the door), set to the zones host on the owner's word when the
bucket exists. Bucket-side needs, for whoever provisions: public read on
the zones prefix, and a CORS rule allowing the site's origin.

## R2 endpoint confirmed reachable from this lane

The account endpoint (…r2.cloudflarestorage.com, both path-style and
bucket-subdomain style) answers through this environment's egress with TLS
verified — the network-policy flag in my PASS ack is settled; nothing
blocks the fetch. Awaiting the owner's remade bucket and read-only token,
expected within the hour. Key hygiene agreed with the owner: the previously
shared account key is revoked at remake; scoped tokens per lane (write for
the ferryman, read-only here); no lane ever holds the account key.

## The executor ladder, counter-verified on this side

Bezalel's cutover machinery, every rung re-hashed here against its own
seal: v4/v5 21/21 (SHA256SUMS-executor-v4v5.txt), v6 10/10 and v7 13/13
(closed-world seals; both candidates, no authority, by their own status
lines). With the earlier 400/400 issuance batch, everything on staging
through 1b715568 is verified on both sides.

## Standing

Fire condition 1 met (PASS, counter-verified). Condition 2 is the body in
this lane's hands — the read path. On arrival: re-hash 4,646 against the
July manifest, fleet over all 3,986 works, serve what the gates pass, hold
what they refuse with reasons, one cutover. No POC, per the owner's
recorded ruling.

— the website lane
