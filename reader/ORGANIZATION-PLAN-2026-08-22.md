# The organization page · plan · 2026-08-22

How the front door groups works when tons of them arrive, derived rather
than designed. Nothing here is built yet except what phase 0 names; this is
the plan for approval.

## What already holds

The door is a stack of compact mastheads: Hebrew title first (openable into
the word's own record, glossed by the oldest source), the force-read second
with its record's chip, counts and the open slots after. Works arrive from
the plan in the ledger's own order (`order_path`), commentaries seat with
their base by shared coordinates. None of that changes.

## Where grouping comes from — the derivation

Nobody types a taxonomy. Two sources exist, and they arrive in order:

**Phase 1 — the work id's own family.** Every work id already carries its
group as its first segment: `tanakh/genesis`, `targum/targum-jonathan-on-
i-kings`, `modern-thought/goral-lahashem-alkalai`, `halakhah/…`. The plan
derives `family = work_id.split("/")[0]` the same way it derives the address
from the last segment — the two ends of the same string, both already
recorded, neither typed. The door renders one group per family present:

- group header: the family's plain-english label (HANDS ALLOWED, a
  usability descriptor in `data/work-records-v1.js`, e.g. `tanakh` →
  "Tanakh"; no Hebrew typed — a family's Hebrew name arrives only when a
  ledger carries one, and shows the open slot until then, the same rule as
  every title)
- groups ordered by the earliest `order_path` inside them, works inside by
  their own order — the ledger's order, twice
- the collapsible group shell already exists in the door's CSS
  (`details.group`), built for this and waiting
- a group prints its own counts (works, sections, words, open slots) the
  way cards print theirs — counted at build time, never typed
- search stays flat across all groups, Hebrew and English both; a matching
  group opens itself

**Phase 2 — Y's own tree, when it grows one.** The Y ledger owns hierarchy.
Today its nodes are per-work (WORK/CHAPTER/SECTION); the corpus-level canon
(Tanakh → Nevi'im → Kings) exists only as byline text. The day the corpus
lane seals nodes above WORK grain, the door stops deriving groups from id
prefixes and inherits the ledger's tree outright — headers become ledger
nodes with Hebrew labels that open like any word, and phase 1's descriptor
labels die the way every typed value dies here: refused once the ledger
speaks. That refusal gets a check the day phase 2 lands.

## What the page must keep saying at scale

- every held work and every open slot stays visible inside its group — a
  group that hides its incompleteness is the door lying at a larger grain
- the two-row register never softens, at any grain: group, work, sub-work
- a group with one work looks like a card, not a ceremony
- the door carries no Hebrew beyond what ledgers and zones carry — the
  occurrence-counting guard extends to group headers when they gain Hebrew

## When to build phase 1

Not at three works. The trigger is the first build where the plan holds
works from more than two families, which is expected the week bulk adds
begin. The door builder change is contained: group derivation beside the
existing seating logic, the `details.group` shell it already styles, and
check-clean-address extended to assert group membership equals id-prefix
and group order equals ledger order.
