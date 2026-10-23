# Sweeping this into a showing corpus

Written 2026-08-21, after two works were finished well and a third would still
have to be added by hand. This is a work order, not a survey: every open
question in it has been answered, and the steps are in the order they unblock
each other.

## What is already general, and must not be rebuilt

The reader is. `zone.html` names no work. It takes `?b=<slug>`, fetches
`data/zones/<slug>.bin` and `data/zones/<slug>-commentary.bin`, and draws
whatever those carry: the masthead from the zone's own title and byline, the
chapter nodes from its nodes, the component system from its span table, the
readings from the route store, the commentary from the sidecar. A work it has
never seen renders the moment its zone exists. The one Genesis-shaped thing
left in it is the default when no `?b=` is given.

The tools are, nearly. Every builder takes its inputs as flags —
`check-nothing-hard-wired-v1` asserts it over 26 of them — so none is pointed
at a particular book. `build-zone`, `build-commentary-zone`,
`build-commentary-sidecar`, `regloss-zone`, `respan-zone`, `extract-y-nodes`
and the whole check suite work on whatever they are handed.

The route store is. 140,532 keys and 774,277 routes, asked by K, indifferent to
which work asks. A new work costs it nothing.

The naming frame is, in principle. `titleRow()` draws a Hebrew title out of the
ledger's own tokens, with each token openable against the catalogue, and it is
already used at four levels: the work masthead, a part, a chapter node, and a
commentary work. That shape is right and generalizes. What has drifted is
covered in step 1.

## What is not general, measured

**`build.sh` names a work thirty-two times.** Three `serve` lines with c0
ranges, three `build-zone` blocks, two commentary blocks, a Y extraction, a
deploy loop over `genesis 1kings`, and a verify. Adding a work means editing
this file, `build-front-door-v1.mjs` and `check-clean-address-v1.mjs` by hand.
Three files per work, nine hundred and ninety-seven times.

**Everything those thirty-two literals say is already in the Y ledger.** The
WORK node of `y-genesis-navigation-v1.js` carries `content_work_id`,
`public_ref`, `label_hebrew`, `content_unit_prefix`, `content_unit_count`,
`content_c0_rows`, `content_first_c0_id`, `content_last_c0_id`, `b_id`,
`order_path`, `default_open_layers`, `hierarchy_basis`, `label_basis`, and
`attachment_y_node_id` with `attachment_grain` for a work that attaches to
another. The c0 range `build.sh` types is `content_first_c0_id` to
`content_last_c0_id`. The title it types is `label_hebrew`. The work id it
types is `content_work_id`. **`build.sh` is a hand copy of a record we already
hold.**

**The front door carries a typed list of two.** `BOOKS = [genesis, 1kings]`.
Which works are published is a decision and still has to be recorded — but in a
record a build reads, not in a source file.

**Two of the three published works have no Y ledger at all.** Only Genesis has
one. `check-frame-coverage-v1` has been red on exactly this since it was
written: `Y · on 1, off: I Kings, Targum Jonathan on I Kings`. Y is not one
layer among sixteen here. It is the input the whole sweep turns on, because it
is where a work's identity, extent, order, attachment and title live — and with
no ledger, I Kings' masthead prints *"none is recorded in the ledger"* where
its Hebrew name should be.

**The naming register drifts by level.** The work masthead says *commonly force
read as*; a commentary work says *commonly read as*, or *recorded as* when it
has no Hebrew. Worse than the wording: the work's English is a reading pulled
from the store for the title's own K and printed with the licence of the record
that carries it, and it says so when no record reads it that way — which is
correct. A commentary's English is whatever the pack happened to call it,
printed under a label that looks the same. Two different claims, one register.

**The English name of a work is typed.** `build.sh` passes `--title "I Kings"`
on the command line — five times across the three works and their commentary —
which is the same fault `--title-he` was, one row down. The Y ledger's WORK
node already carries `public_ref`.

**The folder is called `genesis-book-reader-v4`.** It is not Genesis's, it is
not a book reader, and there is no v1 through v3 worth the number. Every
deployed URL contains it.

## Decisions taken 2026-08-21

**The reader's folder is renamed**, with the old path left redirecting so
nothing already shared breaks.

**Addresses follow the work id.** `tanakh/i-kings` publishes at `/i-kings`,
`targum/targum-jonathan-on-i-kings` at its own last segment. No hand-chosen
slugs, no alias table, no exceptions for the two that predate the rule.

**Because naming is not the address's job.** A named thing carries two rows:

    book title                  מלכים א        openable, with its HUD
    commonly force read as      I Kings        a reading, with its licence

The first is the record's and is never composed here. Where the record holds no
Hebrew for a thing the row still stands, with its HUD slot, saying the record
holds none — so it fills itself the day one arrives rather than needing a
change. A title made of two words is two tokens with two keys, opened the same
way as any other Hebrew on the page; that already works.

**The label never changes.** Calling the work `I Kings`, or `Genesis`, is a
forced read whichever way the evidence falls. The Hebrew of בראשית is *in
beginning*; that a catalogue also carries `Genesis` among its readings does not
make `Genesis` a translation of it, it makes it a convention somebody recorded.
So the row reads *commonly force read as* at every level, always, and what
varies is only what stands beside it: a record and its licence, or a plain line
saying nothing in the record reads it that way. The page currently does the
opposite — with no Hebrew at all it silently drops the word *force* and
explains nothing, softening the claim exactly where it is weakest. That is
backwards and is part of step 1.

**And the source for a work's name is bibliographic, not lexical.** Measured:
the definition catalogue answers for בראשית with 15 routes, `Genesis` among
them, which is why the Genesis masthead looks solved. It answers for מלכים א
with **0** — while answering for מלכים with 14 and for א with 75. The
catalogue answers for *words*, and a two-word title is not a word. So looking a
work's name up in the definition store is not a method; it is a coincidence
that holds for single-word titles and fails for מלכים א, שמואל א, דברי הימים א,
שיר השירים and most of what follows. The record that says a work is read as
`I Kings` is an index, and it has its own licence, and that is what belongs on
that row.

**Nothing here is a licence difference.** Genesis and I Kings are both
CC-BY-NC over their own rows; the Targum is Public Domain. Every one of them is
licensed and all three are printed. What differs is only whether we hold a
record naming the work in English — a question about coverage, not permission,
and it must never be reported as though a work were somehow less licensed than
its neighbour.

**Being findable is the search box's job, not a record's.** Typing `1 kings`,
`1-kings` or `i-kings` should reach `/i-kings`, and that is loose matching in a
search field. It is not a row, not a layer, and not something a work carries.

## The steps, in dependency order

**1 · One naming frame, at every level that names something.** The two rows
above, applied identically to a work, a part, a chapter, a commentary work and
a commentary section. One register — *commonly force read as* — and one honest
degradation when the catalogue does not read it that way, wherever it appears.
A commentary's English must be traced the same way the work's already is, or
labelled differently, because a pack's own name for itself is a different claim
from a licensed reading and must not print under the same words. And the English work name comes out of `public_ref`
or a catalogue reading, never off the command line — `--title` goes the way
`--title-he` went.

**2 · A work record, read rather than typed.** Iterate the Y ledgers in `data/`
and derive each work's build from its WORK node. Two things are left over
after that mapping: the byline and the coordinate labels (`chapter,verse`
against `section,paragraph`). The byline duplicates a
sentence the zone already carries in `license_receipts.attribution` and should
come from there. The coordinate labels are plain English for usability, allowed
to be ours, and belong in a per-work record rather than a build script.

**3 · A driver that loops.** `build.sh` becomes: for every Y ledger present,
serve its c0 range, build its zone, project its span and gloss layers, and
attach whatever the ledger says it attaches to. The three `serve` lines, three
`build-zone` blocks and two commentary blocks collapse into one pass. Nothing
in the tools changes; only the thing calling them.

**4 · The front door reads the same list.** `BOOKS` becomes the works that
built, in the ledgers' own `order_path`. The clean-address stubs are generated
from it. The splash page groups a base work with its commentary rather than
listing them flat — a commentary is part of the work and is also its own thing,
and it is not reachable without its base.

**5 · A search box that matches loosely.** `1 kings` reaches `/i-kings`. This
is the whole of "searchable by" and it lives in the front door.

**6 · Rename the folder and republish the two addresses.** Once, now, while
there are two works rather than two hundred, with redirects from the old paths.

**7 · A check that a work is complete.** There is a check for every layer being
symmetric across works, and none for one work being finished. The sweep needs
one: this work has a Y ledger, a W list, a span layer with a receipt, a licence
record, a title in all three rows at every level, and its commentary attached
by a declared shape — or it names exactly which of those it lacks. That check
is what makes "go" safe to say over nine hundred works.

## What only the corpus lane can supply

None of the above produces a single new work on its own. Each work needs, from
the sealed side:

- **its Y ledger** — without it there is no identity, no extent, no order, no
  attachment and no Hebrew title, and steps 1 and 2 have nothing to read;
- **its W list** — which entries of a section are W, with each one's surface,
  normalized key and `compspanTemplateId`, in the shape
  `genesis-1-1-full-hud-2026-07-19.js` already uses. `check-w-grain-v1` is red
  at 1 section proven against 3,983 unproven, and for the right reason: every
  COMPcell and COMPspan cover the reader draws is arithmetic over a W, and
  outside that one verse nothing here has shown the thing it is drawn on to be
  one;
- **its COMPspan template rows** — the sealed `w-to-compspan-template` slice.
  `check-sealed-layers-v1` is red on the Genesis commentary sidecar for want of
  it;
- **its licence record**, which the zone already reads and reports, and which
  is the only thing that may keep anything off the page.

Commentary comes two ways and only one of them scales. Where two sealed works
carry the same unit ids, the coordinate does the attaching and nothing is
guessed — that is `build-commentary-zone`, and it generalizes to every pair the
chain numbers alike. Where a commentary arrives without coordinates it needs a
pack and an attachment map per work, and the map is a suggestion, marked as
one. Genesis 1:1 is the whole of the second kind today: 612 segments against
one verse of 1,533.
