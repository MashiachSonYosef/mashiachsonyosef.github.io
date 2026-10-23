# Wiring review · 2026-08-22

One question started this — "why would the targums be at targum?" — and the
honest way to answer it is to answer it for every level at once: what does
each printed value on this site actually stand on, and where is anything
standing on me instead of on a record. This review walks every surface and
says so. The rule it enforces: **a gap is fixed by a record or a declared
rule, never by finding things one by one and filling them in.**

## The question itself: the targum family

The bridge is the corpus's own answer. Its `corpus_family` column records
`targum` for both works, inside a thirty-seven-work targum family:

    tanakh/genesis                     -> corpus_family: tanakh
    tanakh/i-kings                     -> corpus_family: tanakh
    tanakh/ruth                        -> corpus_family: tanakh
    targum/targum-jonathan-on-i-kings  -> corpus_family: targum
    targum/aramaic-targum-to-ruth      -> corpus_family: targum

The door derives a family from the first segment of the sealed work id, and
the bridge's family column agrees with that segment on every row. So the
grouping is Bezalel's ledger speaking, not this lane arranging. If targums
belong under tanakh, that is a re-family decision in the bridge — one
corpus-side change, and the door follows on its next build with zero edits
here. Until then the door shows what the ledger says.

One presentation nuance rides on top, and it is ours: a seated work is
counted where it is read — the Tanakh section says "5 books" because two
targum-family books sit inside its groups, each row saying what it is. The
alternative (count every work under its own id's family) is a one-rule
change if the owner prefers it.

## The wiring, level by level

Every fetch the reader makes: `zones/{book}.bin`, `zones/{book}-commentary.bin`,
`work-basis-v1.json`, `commentary-names-v1.json`, `y-nav-labels-v1.json`,
`route-store/index.json` + one shard per pressed word. What each level
prints, and what it is read from:

- **Words, coordinates, counts, rights** — the sealed serves. Each zone was
  built from `mishkan-serve-v1` output that walked the terminal shards
  through the full sealed-oracle authority chain, sampled back through the
  sealed CLI (24/24 field-exact per work), rights per occurrence from the
  rights catalog. The bin's receipts carry the bridge sha, module shas, and
  the licence basis. Nothing on a text surface is typed.
- **Readings, glosses, HUD** — the route store, built from four sealed
  inputs recorded by sha256 in its own index. Standing issue, already
  adjudicated: the shipped store predates the declaration's
  `closer_with_nothing_open` amendment, so ~133 Strong's rows ride whole
  where the declaration says they separate. The engine now matches the
  declaration (deployed); the store rebuild from the sealed inputs is the
  queued fix. Display-side nothing is patched — the monster shows until the
  store is rebuilt, because the alternative is this lane editing readings.
- **Work titles** — Hebrew from the work's Y fixture where one exists
  (Genesis); the open slot where none does. The force-read row's English is
  `title_en` from `work-records-v1.js`, typed and declared, dies with the
  Y ledger.
- **Chapter and section labels** — Genesis: the fixture's own
  `label_hebrew` per node (chapters ride in the bin; sections via the
  `y-nav-labels-v1.json` slice, every value copied from the fixture it
  cites). Other works: the quiet slot at chapter grain; coordinates stand
  alone at section grain until their fixtures land.
- **Commentary names** — the Y `COMMENTARY_WORK` node where recorded
  (Rashi, via `commentary-names-v1.json`, matched public_ref ↔ pack index);
  otherwise the pack's own recorded name; otherwise the open slot.
- **Commentary text and rights** — the I Kings and Ruth sidecars are built
  from sealed serves with per-entry rights (`PER_UNIT_SERVE_ROWS`; a row
  disagreement refuses the build). The Genesis pack is older and says so in
  the records file: "fetched from outside the corpus with no C0 identity" —
  its rebuild through the sealed chain is a standing corpus ask.
- **Family sections** — first segment of the work id (bridge concurs, above);
  Hebrew name an open slot until a family-names record exists.
- **Addresses, redirects** — derived (`published_as = slugOf(work_id)`,
  typed addresses refused at plan time; address-history rows generate the
  redirect stubs).
- **Basis, holds, slots lines** — `work-basis-v1.json`, emitted from the
  plan and hold ledgers found by shape; nothing on those lines is typed
  into a page.
- **Door counts** — sums read out of the zones at build time.

## Where I was fudging, named

The review's point. Each item, and the record that retires it:

1. **The descriptors were typed without a declaration.** Bylines (including
   canon-division words — I typed "Ketuvim" for Ruth and "Nevi'im" for
   I Kings with no record behind them), `family_en`, `coord_labels`, the
   licence-link pointer. Open in the records file, but nothing said they
   were typed or what kills them. **Fixed this review**: they now carry the
   same declaration law as the typed ranges — a Y node retires the
   structure claims, a family-names record retires `family_en`. The
   corpus-side ask is those records.
2. **The attachments carried a basis but no dies_when.** The typed pairs
   (I Kings ↔ its targum, Ruth ↔ its targum) are retired by
   `attachment_y_node_id` in the commentary work's fixture. **Declared this
   review.**
3. **Build-invocation strings** (`--title`, `--family`, `--stamp`) are typed
   at the command line and land in the bins' receipts. The Y node pattern
   proven on Rashi retires the names; the stamps are honest stamps.
4. **Legacy surfaces are still public** from the pre-rule era:
   `/genesis-1-1.html`, `/data/` (old HUD word files),
   `/hebrew-workbench/`, and in the reader directory
   `genesis-book-reader-v4.html/.js/.css` (the old reader), `dictionary.html`,
   `orot.html`, `build.sh`. None is wired to the sealed chain. They are the
   fudge era itself, reachable by URL. Proposal: retire them behind the
   same redirect pattern the renamed books use — the owner decides which,
   if any, stay as history.
5. **The Genesis commentary pack self-names** carry their source's own
   artifacts (an ASCII quote standing where a gershayim belongs). Reader-side
   the ledger now outnames it at the card head; the pack rebuild through the
   sealed chain (with the known footnote-word pollution at 4:13 and 9:29) is
   a standing corpus ask.
6. **genesis.bin's counts field** stands two words off its sections at c0
   grain — shown honestly in the receipts drawer, red in the checks by
   design, regeneration corpus-side.
7. **Small typed bounds in one check** (a words > 3 floor in the
   clean-address walk) — the section bound was already replaced by the
   bin's own count; the word floor is the same class and goes the same way.

## What retires what — the ledger list

- **Y fixtures for I Kings, Ruth, and both targums** retire: the typed c0
  ranges and unit counts, the typed titles, the typed attachments, every
  chapter and section slot, and the commentary self-names. One promotion
  covers items across four works.
- **A family-names record** (slug ↔ Hebrew name, per family) retires the
  family slots on the door and `family_en` in the descriptors — and if it
  carries canon divisions, the bylines' structure words too.
- **A bridge re-family**, only if the owner rules targums belong under
  tanakh — the door follows automatically.
- **Corpus regeneration** for the Genesis pack and genesis.bin receipts, as
  already listed in the runbook.

Nothing above gets filled in page-side while it waits. The slots are the
placeholder; the records are the fix.
