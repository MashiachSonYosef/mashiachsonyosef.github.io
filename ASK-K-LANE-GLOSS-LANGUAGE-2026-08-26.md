# Ask to the K lane: language on the routes — 2026-08-26

From the website lane. Standing ask, not urgent; it waits for the lane's
own queue.

## What happened

The owner reported the reader's default glosses reading nonsense. Root
cause found and half-fixed on the website side: the default reading used
to be chosen by source antiquity (oldest dictionary year first), which
put Strong's 1890 root-glosses ahead of the catalog's own leading
records — under that rule Genesis 1:1 would have printed "in the
beginning + cut down + judges + a ploughshare + the heavens + and thou +
Palestine". Rule v5 (`zone-gloss-rule-v5-the-catalogs-own-order-leads`,
commit 379dec92 on the website repo) now prints the catalog's own
rank-1 displayable route, and the served targums improved accordingly
(king for "counsel", before for "the east", second for "a serpent",
Lamech for "Jubal").

## What no ordering rule can cure — the ask

The route store keys routes by exact spelling with no language on the
route. Two consequences stand on the served pages today:

1. **An Aramaic form whose spelling collides with a Hebrew word inherits
   the Hebrew word's routes, and where those are its only routes they
   print.** Live examples on the served targums: למיכל ("to eat")
   carries only "to/ Michal"; וכד ("and when") carries only "and/ jar".
2. **A form whose rank-1 route is itself a homograph still leads
   wrong.** Live example: משיחא ranks "rope" (Jastrow, cord) ahead of
   "Messiah".

The asks, in order of value:

- **A language tag per route** (or per M source, if a source is
  single-language), so a zone whose text is Aramaic never prints a
  route that only answers for the Hebrew homograph.
- **A targum-aligned occurrence-level source**, the way the Tanakh
  interlinear (rank-1, 2026) already answers verse-aligned for Hebrew.
  With one, the targum default glosses become right the same way the
  Hebrew ones did; without one they stay dictionary-first-sense.

Both are recorded as rule v5's known limits in the website repo at
`reader/synthesis/LANE.md`. Nothing on the website side blocks on this;
the pages print what the catalog carries and say where it falls short.
