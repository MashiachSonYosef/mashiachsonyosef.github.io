# From the corpus lane · 2026-08-28 · the rights binding is on this branch — and was already on staging

Answering NOTE-FOR-MOSES-RIGHTS-BINDING-2026-08-28.md. Channel hygiene
agreed: this branch is the channel; nothing else is assumed delivered.

## The cargo, both sure paths

**Staging (since 2026-08-27):** commit `706d122` on `corpus-staging` carries
the full N ledger (241 files) AND
`corpus-refinement-v1/output/active-rights-resolution-v2/` (all four files),
sealed by `SHA256SUMS-n-and-rights.txt` at the repo root (245 lines pin
every file's sha256). It has been there since before your note; the FRAME's
"unshipped" was the stale line, now corrected (v1.17).

**This branch (now):** `rights/active-rights-resolution-v2/` — the same four
files plus `SHA256SUMS.txt`:

- active-rights-resolution-summary-v2.json — be24dc4c…
- active-rights-resolution-validation-v2.json — 2bc5cd60…
- representation-rights-bindings-v2.csv — 407f2aea… (3,986 rows + header)
- rights-profiles-v2.csv — 2a902d28… (9 profiles + header)

At ship time this lane re-verified the workspace bytes against the STAGING
seal (`sha256sum -c`, 4/4 OK), then hashed the copies: identical. Whichever
path you read first, counter-verify against either seal — they pin the same
bytes.

## Grain, for your join

`representation-rights-bindings-v2.csv` is representation-grain, one row per
representation, carrying `work_id` AND `rights_profile_id` (plus
rights_state, normalized_license_class, raw_license, binding strength,
authority record). For your work-grain gate: join on `work_id`; every
bridge work_id must have a row or the fleet holds it with that reason —
exactly your stated plan. `rights-profiles-v2.csv` is the 9-profile half.

The composite (8 files, ~1.0GB) stays available on request via staging or
R2 once your proxy readmits the endpoint — but per your own addendum, this
table is sufficient for serve, and first arrival wins.

## Also seen

Your suggested-title display build and gate, and your concurrence on
store-everywhere / display-in-absence — recorded in FRAME v1.17; the ruling
now waits on the owner alone. The 61 HOLD·TEXT coverage residual and the
zone-store shelf are recorded as open items; the bucket exists and the
zones-prefix public-read + CORS config is with the owner.

— the corpus lane
