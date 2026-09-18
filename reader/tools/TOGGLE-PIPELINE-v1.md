# The toggle pipeline · v1 (2026-09-11)

How a toggle gets from Moses's ledger to a live row on the rail. The first
one through — **look up by: the form / the headword** — is the worked
example; every file it touched is named so the next toggle can copy it.

## The parts

| step | who | where | what it produces |
|---|---|---|---|
| 1 count | Moses | `r2:mishkan/moses-ledgers/toggle-builds-v1/<toggle>/` | a ledger, one row per position (`book, ref, i, j, surface, form_key, …`) or per card (`primary_source`, `primary_licence`), plus blind recounts; `README-v1.md` at the root has one row per toggle with the ruling it still needs |
| 2 project | this lane | `tools/project-toggle-<name>-v1.mjs` | reads ONE zone + ONE ledger, joins on the zone's own positions, writes ANOTHER zone carrying the answer on each word and a receipt at `emitted_from.toggles.<name>`, typed under the single-pass exemption |
| 3 regloss | this lane | `tools/regloss-zone.mjs` | re-projects the route store over the zone's keys — which now include the toggle's keys — so the line can answer under them without a fetch |
| 4 shelf | this lane | `data/zones/<slug>.bin` → `emit-zone-store-v1`, `emit-zone-shipment-v1`, `emit-store-manifest-v1` | the zone re-pinned; a zone that changes without a new pin is REFUSED by the reader (by design) |
| 5 rail | this lane | `zone.html` · `TOGGLES` registry | one entry per toggle: `id, lab, why, positions, live(), waits, get, set, now` — the rail draws itself from it; a row whose layer is not on the zone is drawn dead with its `waits` |
| 6 ruling | owner | recorded on the projection receipt (`rulings_owed` → the ruling and its date) | the row goes live |

Then the door rebuild (`build-front-door-v1`), the sync, the guards, the deploy.

## The join, and the law it keeps

Per-word ledgers are matched **verse by verse, in order**: the n-th ON word of
a verse in the zone is the n-th row of that verse in the ledger, and the match
is **proved by the form key** — `form_key == k` at every position, or the whole
verse is held and counted in the receipt. Never patched around. A ketiv-qere
site is one position with two keys on the zone; it matches when the row's
form key is either.

Where two witnesses disagree (MACULA vs TAHOT on a headword), the word carries
nothing and the receipt counts it: the page does not pick between witnesses.

## The worked example · headword

- `tools/project-toggle-headword-v1.mjs` — the projection; writes `h` (headword key) and `hp` (pointed headword) on each word where the witnesses agree.
- `tools/regloss-zone.mjs` — one added line: `if (w.h) keys.add(w.h)`.
- `zone.html` — `lookup` state + `lookupKey(word, k, table)`; the line and `repaintGlossOrder` read under `lookupKey`; a one-form word opens its card under the headword key with `form_k` riding along, and the card says *looked up by its headword …*.
- Genesis: 1,533 of 1,533 verses proved; 19,893 of 20,612 words carry a headword; 11,053 reach an English the form lacks.

## The second one through · the lattice (v12, 2026-09-13)

The corpus lane's lattice grades every card of every position against the
word as the text points it, and since v12 carries the headword stack under
lemma-sort v3, each card's licence class, year, corpus and transliteration
flag, and the Leningrad difference per position. It is projected by
`tools/project-lattice-v12-v1.mjs` under
`lattice-projection-rule-v1-the-lattice-is-projected-over-a-zones-own-positions-and-never-replaces-the-store`:

- **the join** is the headword join, pair-aware: the n-th ON word of a verse
  is the n-th ON position (kind, not rule — an ink mark is not a word), and a
  position proves when any of its entries keys as one of the word's keys AND
  the verse's rows carry `j` distinct and ascending. **`j` is the position,
  not `i`** — the corpus lane's warning of 2026-09-13, and it is real: `i`
  repeats across the parts of a maqaf compound 2,951 times inside a verse in
  Genesis alone, so anything keyed on `i` merges the pieces of a joined word.
  This tool never keyed on `i`; it binds by file order, which is `j` order,
  and now proves that rather than assuming it. 39 books: 23,204 verses
  joined, none held, none absent.
- **on the word**: `hg` — the headword's first reading under lemma-sort v3,
  with `hm` (source, licence key, year), only where `h` is the lattice's
  lemma and the stack has cards in this book; `ld` — where Leningrad differs.
  Under *look up by: the headword* the line prints `hg` and the card opens on
  it, which retires the route-store-order defect on Genesis 1:1.
- **in the sidecar** `<slug>.lattice.bin`, fetched the first time an order
  needs it: per key the cards' fingerprints (`fnv1a("text|source")`, the same
  function in the tool and in zone.html) in lattice order with transliteration
  flags; per pointed surface the tier of each card (`m` vowel match · `n`
  normalized · `x` mismatch), which cards cite this verse, and the first card
  under each lattice order so the LINE moves, not only the card.
- **the store stays the store**: a lattice card the store does not hold is
  never shown; a store row the lattice did not grade sorts after the graded
  ones and is never dropped. `check-lattice-projection-v1` L5 prints the join
  rate.
- **the rail**: *reads first* gains masoretic, cites here, vowels differ
  (lattice) and outside the era (corpus record, explicit non-era only);
  *license* is live as a SORT (class read off each posture key: 0 PD/cc0 ·
  1 BY · 2 BY-SA · 3 NC · 4 other); *names* as sound puts transliterations
  first; *edition* marks Leningrad differences with a dotted gold rule. The
  comparator chain in `sortPool` is license preference → names → the chosen
  order → oldest first; every position is a re-order of one pool.
- **not projected**: `pieces` (joined words) until the welded-form ruling.
- **guards**: `check-lattice-projection-v1` (the files), `check-lattice-orders-v1` (the page).

## The third one through · the pointing (2026-09-17)

The one toggle that is a statement of the project's, not a convenience. The
owner's words: *"the masoretics can't negate the hebrew, and strong defining
each voweled version must apply to the otherly voweled versions"* — and, on
the same day, that the marks *should be removeable*, inside the card only.
Three positions, on the rail as **the pointing**:

- **keep** — today, exactly. Pointed head on the card; every reading of the
  letters; "reads first" orders them (its *masoretic* position is the corpus
  lane's vowel grade as a SORT, unchanged).
- **only this pointing** — a SELECTION, the first the page has made. Rows the
  lattice graded VOWEL_MISMATCH for this surface are withheld in `poolFor`
  before the pool exists; NORMALIZED rows (the source's headword is unpointed)
  and ungraded rows stay — silence is not contradiction, unknown is not a
  mismatch. The card says how many records it withheld and why. The line
  under the word moves to `o.l`, the sidecar's row-level lenient leader,
  baked by `project-lattice-v12-v1.mjs` with the same row filter, so the line
  and the first pill say one thing. Strict (`o.s`, VOWEL_MATCH only) is baked
  beside it for the sub-choice the corpus lane's contract names; not yet on
  the rail.
- **the letters only** — the head leads with the bare consonants, the pointed
  form faint beside them; every reading, oldest first, grade ignored; a
  lattice order in "reads first" falls back to oldest and the rail says so.

**What never moves: the Hebrew on the page.** Not a vowel, not a mark, not a
nun, not a ketiv or qere — the Masoretic text is the licensed text. The
toggle reaches the card and the English line, and nothing else.
`check-masorah-toggle-v1` M6 byte-compares the section's Hebrew across all
three positions.

Measured over the 39 books before the row was built, against the baked line
(oldest first, grade ignored — which is what the page prints today):
*only* (lenient) moves the printed line at **13.2%** of graded words and
bares **2.0%**; strict would move **61.5%** and bare **5.2%**, blacking out
the divine name at its Elohim-pointing (60 cards, 26 NORMALIZED, 0 matches).
The corpus lane's 44.3% (134,717 of 303,777 positions) is its grade-first
order against oldest-first — and since the page's baked line IS oldest-first
with no vowel tier, that number is what changes if the tier is turned ON as a
sort, not off. The corpus lane corrected its own note to say so.

**THE DEFAULT IS THE OWNER'S RULING AND IS NOT MADE.** The row ships at
*keep* because it is the one position that changes no English on the page.

The order law amended (zone.html, "THE ORDER TOGGLES"): an ORDER is never a
selection; two switches ARE selections by the owner's ruling of 2026-09-17 —
the pointing's *only* position and the source switches — and each says on
the card how many records it withheld.

## The fourth one through · the sources (2026-09-18)

The primary toggle the two lanes settled on: *"the source itself, each one
removeable, all the cards."* On the rail as **sources**, one chip per source
KEY (three Jastrow framings are one switch; three Kaikki Aramaic extractions
are one), each chip carrying the two numbers its switch costs on this book —
lines that **change** · lines that go **dark** — because those are different
harms and a reader deserves both.

- **the wire** is this lane's own, not the corpus lane's: `gloss-store-v1`'s
  `by` (every carrier of a reading, surviving the merge) and `omit` (rows
  withheld before the pool exists), from 2026-09-16.
- **on the key**, baked by `regloss-zone.mjs` into `gloss_m[k]` beside the
  chip's `lic/m/y`: `by` — every admitted source whose route divides to the
  printed reading; `alt` — the reading that leads when all of them are off,
  with its own M and its own carriers, found among the rows that SURVIVE the
  omit (a source carrying both leader and alternate must not be named as the
  alternate's witness while switched off). Absent when nothing survives.
- **on the zone**, `emitted_from.toggles.sources`: per ledger id its key,
  label, licence name, and on this book `leads / carries / changes / darkens`;
  counts; the branch's `waits`.
- **on the page**: `poolFor` withholds a switched-off source's rows before
  grouping, counted apart from the pointing's count; the card says *N of M
  records withheld by your source switches — k sources off*; every pill
  exposes its carriers (`data-by`); `lineUnder` follows the switch from the
  baked `by`/`alt` without a fetch, and a line whose every carrier is off and
  which has no alternate goes bare, the reader's own doing.
- **known limit, stated in the code**: the baked alternate answers one
  question — all carriers of THIS reading are off. Under the pointing filter
  and a source switch together, the line follows the source switch and the
  card, which composes every switch exactly, is the authority.
- **the branch** — each source's own declarations, toggleable one at a time
  under its switch — waits on the corpus lane's declarations ledger and is
  drawn as a sentence on the row until it lands.
- **guards**: `check-source-switch-v1` (the page, S1–S8), `check-carrier-survives-v1`
  (the store). Amos on first press: MACULA off moves "fourth" to OmegaWiki's
  reading with OmegaWiki on the chip; the shared line stands; 1 of 13
  records withheld and said so.

Measured on Genesis before the row was built: Strong's off **changes 3,320
lines, darkens 3**; STEP off **changes 737, darkens 2,762** — STEP is the
sole carrier at 2,762 keys. On amos, 70 sources carry a reading, 51 lead one;
across the shelf 82 carry on Genesis alone.

## The fifth one through · the pointing store (2026-09-18)

The wire the pointing toggle was waiting on, landed. The corpus lane's
pointing store (route store v2.2) is the served store with one slot added:
`[6]`, the source's own pointed headword strings for that (key, text,
source). Proved before it was served, twice: every one of 256 shards,
admission-filtered and folded (`delete [6]`, then `[5]` if null), is the v1
shard's bytes exactly (`land-pointing-store-v2-v1`, receipt under
`build/pointing-store-v2.2-served/`), and the corpus lane's shipment was
counter-verified from bytes (`verify-pointing-store-v1`, records under
`data/pointing-store-verify-*.json`). A reader that ignores `[6]` reads
exactly what it read before. Served since 2026-09-18 as `94bc125695bf`,
schema `ROUTE_STORE_V2`; the v1 it replaced was `f28629cb1f1a` and stands
under `build/route-store-v1-before-pointing/` (from git) so the landing
guard's fold stays a proof and not a tautology.

**The grade, computed from the row and never stored** —
`tools/pointing-grade-v1.mjs`, `pointing-grade-rule-v1`. The corpus lane's
own two lines (`vowelForm`, `isPointed`: U+034F dropped before NFKD,
cantillation and the non-vowel marks deleted, everything but vowel points,
shin/sin dots, dagesh and letters removed; pointed = a vowel point U+05B0–05BB
after NFKD), carried unchanged, and one rule on top:

    V = { vowelForm(h) : h in row[6], isPointed(h) }
    V empty              → n  NORMALIZED     the source is silent
    vowelForm(S) in V    → m  VOWEL_MATCH    ANY ONE matching headword is enough
    else                 → x  VOWEL_MISMATCH
    no [6]               → -  ungraded here  (a v1 row: the lattice card's grade stands)

S is the open word's own pointed surface. Per source, per row, not merged —
the lattice merged every source's headwords into one card and graded the
card; that mesh is what the toggle undoes, so a per-row grade does not
reproduce the lattice's and should not. Recounted on this side
(`emit-pointing-grade-recount-v1` → `data/pointing-grade-recount-v1.json`):
the two grades differ at **58,656 of 5,513,609** surface × row slots
(1.06%), **154,236 of 14,663,382** entry × row slots (1.05%); the crossing
is mostly the merged card saying *mismatch* where the row's own source is
*silent* (25,581) and the merged card saying *match* where this source's
headword is *other* (21,823). The corpus lane's 6.1% is on its own axis
(196 sources, every row) and is not this number; both are recorded.

**Where the grade now acts.** Three places, one function, two copies held
to the character by `check-pointing-grade-v1` P1:

- `zone.html` `poolFor` under *only* — a row graded x by its own headwords
  is withheld; a row without the slot falls to the lattice card's grade;
  `sortPool` — the *masoretic* and *vowels differ* tiers take the same grade;
  every pill carries `data-grade`.
- `project-lattice-v12-v1.mjs` — the baked leaders (`o.m`, `o.x`, `o.l`,
  `o.s`) rest on the same grade, so the line under the word and the card's
  first pill still say one thing. The lattice's own `g` strings are kept
  unchanged in the sidecar (they still serve *cites here* and the fallback).
  On Amos the swap moved the strict leader at 457 of 1,487 graded surfaces,
  lenient at 236, masoretic at 183, vowels-differ at 350.
- `check-pointing-grade-v1` — the two copies; the rule on fixtures (davar /
  dibber / bare, any-of, accents and U+034F never decide); every sidecar
  projected under the rule; the recount record against the store on disk,
  one book recounted to the unit; and the card pressed: no pill graded x
  survives *only*, and what the card says it withheld is what the check
  counts from the shard.

**What did not move.** The Hebrew on the page (`check-masorah-toggle-v1` M6,
still). The gloss tables (the folded rows are the v1 rows). The struck ranks
(the holes are the same holes; `emit-struck-ranks-v1` still names
`f28629cb1f1a` as the store it was cut against, which is true). The zones'
`gloss_layer.store_version` names `f28629cb1f1a`, which is the store they
were glossed from and which the served store folds to byte for byte.

**Still the owner's:** the default (ships at *keep*), strict or lenient
(strict `o.s` is baked, not on the rail), and the deploy.

## What is live, and what is left (2026-09-18)

Live: **reads first** (all seven positions), **the pointing** (three
positions, graded from the served pointing store row by row; default owed), **sources** (every source, each removable; the
branch owed to the corpus lane), **pairs**, **look up by**, **license**,
**names**, **edition**, and **the parts of a word nobody defines**. One row
is not:

1. **joined words** — `maqaf-v1.json` + `maqaf-compounds-v1.jsonl.gz`.
   A RULING FIRST, and it is the owner's: suppress WELDED where nothing
   matches the vowels (1,041 of 1,311)? The rail says so on its own face.

   This is NOT the same question as the parts band below it, and the two were
   confused once, which is why v12's `pieces` sat unprojected for a day.
   Joined words are about where one C0 ends and the next begins. Pieces are
   about what is inside one C0 — prefix, core, suffix. Nothing about the
   welded ruling touches them.

**The parts band**, live since 2026-09-13 (`project-lattice-v12-v1.mjs`,
`check-lattice-projection-v1` L8, `renderParts` in `zone.html`): where the
catalog answers a word neither under its form nor under its headword, the
card shows the word's own pieces, each with its role and with BOTH witnesses'
English — TAHOT's for this position, MACULA's for the headword — named and
licensed. **The LINE never changes**: a bare word stays bare, because a
definition composed here out of pieces would supply the displayed answer for
a key no source answered, which the folded-edge rule forbids and which the
frame's own ruling calls a finding, not an error. 96 words of the 39 books
carry 227 pieces; 92 of the 96 have both witnesses on every piece; the other
38 bare words the lattice has no pieces for carry nothing and are counted as
carrying nothing.

Two rulings stand behind live rows and are still owed:

- **pairs** — `qere-ketiv-v1.json` has what to show at the 298 qere-only /
  21 ketiv-only sites; the row runs on the default until the owner rules.
- **license** — the Jastrow-not-served ruling must sit ABOVE the license sort,
  or a public-domain-first sort re-serves him (58,093 ties). The sort is live;
  that ruling is not written.

## What a new projection tool must do

Copy `project-toggle-headword-v1.mjs` or `project-lattice-v12-v1.mjs`. Keep:
the verse-by-verse join proved by `form_key` — and, where the ledger carries
`i` and `j`, **prove `j` distinct and ascending and never key on `i`**, which
repeats across the parts of a maqaf compound (42,627 times over the 39 books); the receipt at `emitted_from.toggles.<name>` with `rule`, `source`
(path, bytes, sha256, ledger path on R2, witnesses, `candidate_only`), `join`,
`projected_on`, `projected_by`, `counts`, `what_the_word_carries`,
`rulings_owed`; the typed exemption merge (`post_build.wrote` gains
`toggles.<name>`). Then add the `TOGGLES` entry with `live()` reading that
receipt, run the chain, and put the row in front of the owner before wiring
anything the ruling could change.
