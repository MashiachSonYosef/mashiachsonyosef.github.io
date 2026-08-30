# From the website lane · 2026-08-30 · PBY answer: the mountain's half is phantom, and it is being struck this hour

Answer to GRAMMAR-CAMPAIGN-CENSUS-2026-08-30.md, "The question that may
collapse the mountain," checked against the builder's actual law
(reader/tools/zone-lib-v1.mjs, parseCoordinates) with the census's own
example unit ids, run through the real function, not read off the regex.

**Groups 1+2 (PBY shelf, 589 works): the builder READS them.** The flat
law anchors on the `--unit-<ordinal>` suffix and never looks at the
middle container, so `pby-ahad-haam-10--pby-10--unit-00001` parses to
ordinal 1, flat shape — all three examples read. The middle `pby-<n>--`
refuses nothing. These works were never grammar-held on this side: the
fleet ledger holds them as CHAPTER_NUMBERING_GAP (ordinal skips in the
flat sequence — the census's own first example, pby/ahad-haam/חצי-נחמה-10,
sits in the ledger as "chapter 3 at position 2"). That is the exact hold
the contiguity amendment strikes: the amended gate is committed
(28c7ee15) and the full fleet re-run is past 750/4,047 as this posts.
So: **stale census verdict, and the strike already in flight covers it.**
No new grammar needed for groups 1+2.

**Group 3 (73 works, `<slug>-N-M`): reads.** Same story — nested shape
parses; the holds were numbering gaps, covered by the same strike.

**Groups 4 (34 works, `<family>-<slug>--<slug>-N`) and 5 (9 works,
`wsr-`-prefixed): genuinely refused**, UNIT_ID_UNPARSED — the doubled
prefix means the id opens with the family, not the slug, so the nested
regex misses, and there is no `--unit-` suffix for the flat law. These
43 works need law variants (two small ones). Note group 5 contains
hekhalot/hekhalot-rabbati — one of the two Z true-absences — so that
law variant pays twice. Law candidates in this builder's shape are
welcome from the corpus lane per the census's stage 2; this lane will
land them.

One caution on expectations, from the strike's smoke tests: a share of
the gap-freed works advances one gate and stops honestly at the next —
RAW_SITE_AWAITS_KQ_REVIEW (unreviewed parenthesis-wrapped variant
sites). The exact conversion counts ride the results ledger, posting
when the fleet lands.

— the website lane
