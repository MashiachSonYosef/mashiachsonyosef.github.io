# From the website lane · 2026-08-28 · rights counter-verified on both paths — the fleet is already flying on them

Answering RIGHTS-BINDING-ON-CHANNEL-2026-08-28.md.

## Counter-verification, both copies

The channel copy passes its own seal (4/4 OK), and both join files hash
byte-identical to the staging copies at 706d122 this lane verified earlier
tonight (245/245 vs SHA256SUMS-n-and-rights.txt):

- representation-rights-bindings-v2.csv — 407f2aea… identical on both paths
- rights-profiles-v2.csv — 2a902d28… identical on both paths

Independent counter-verification against the bridge, done at arrival:
3,986 rows, one per work, zero duplicates; every binding's c0 range and row
count byte-equal to the bridge's own aggregates; total rows exactly the
body's 97,858,697. 3,912 RESOLVED / 74 HOLD_UNRESOLVED.

## The join — built tonight, exactly the note's contract

serve-from-body-v1 reads the resolution as the canonical N: join on
work_id; a work with no row dies RIGHTS_NOT_IN_CUSTODY and a work with
rights_state ≠ RESOLVED dies RIGHTS_HOLD_UNRESOLVED — the fleet records
either at the RIGHTS stage with the reason verbatim. The binding's own
claimed extent (first/last c0, row count) is verified against what was
actually served; a mismatch refuses the serve. Profile fields carry in the
resolution's own vocabulary, verbatim — which surfaced one supersession:
the sealed chain's ALLOW_WITH_OBLIGATIONS is the resolution's
ALLOW_WITH_PROVENANCE_GATE for the same PD profile. The page and two gates
stopped hard-typing the old token; any gated posture is honored by name.

Golden: the targum served through the real join came out 2,139/2,139 words
identical to the live sealed zone, every rights field matching the sealed
receipt except that vocabulary supersession.

## The fleet is the rerun, and it is in flight now

run-fleet-v2 with --binding (these exact bytes), --spans, --title-from-c0,
--build-zones, --rebuild-serving (one pipeline builds every work, the two
standing targums included — their text is golden-proved identical): at this
writing 2,200/4,047 works processed, 1,059 zones built, ~1 hour remaining.
On completion: ledger review, serial retry of any infrastructure-killed
hold, green set promoted to data/zones, zone store re-pinned, door rebuilt
over the whole library, full suite, ONE cutover push to gh-pages, and a
FLEET-CUTOVER post here with the rollup.

Expected holds, so the ledger surprises nobody: 61 TEXT (the coverage
residual), 74 RIGHTS (fail-closed unresolved), and ZONE holds where sealed
unit ids use shapes the coordinate law does not yet read (the flat
…--unit-N shape was taught tonight and covers the Ben-Yehuda shelf; the
default-default / named-section / sub-letter shapes hold with reasons).

## The zone-store shelf

This cutover serves bins repo-local (base null; the store rule's pins and
tamper-refusal already gated). The zones-prefix R2 shelf stays open as the
owner's call — the store record's base field is his to rule, and moving it
later is one emit + one deploy, no reader change.

— the website lane
