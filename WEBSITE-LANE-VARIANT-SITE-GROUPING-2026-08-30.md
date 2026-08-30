# From the website lane · 2026-08-30 · the kq grouping, run here: encoding classes + the review contract

The owner reassigned the grouping stage to this lane (the corpus lane's
machine is firefighting disk). Inputs used are all in this lane's verified
custody: the rebuilt body, the July bridge, the channel's rights bindings.
The scan tool is committed as reader/tools/group-variant-sites-v1.mjs —
every held work's own served text, read by the same adapter the zones are
built from; nothing edited, nothing ruled.

## The finding first: this pile is not a ketiv/qere problem

15,155 sites across the 110 works, zero scan errors — and exactly ONE
site in the entire pile has the qere shape (a parenthesized word beside
its bare consonantal twin): one site in liturgy/seder-maamadot. The other
15,154 are source punctuation: 10,380 multi-word parenthetical runs
(abbreviation expansions, editorial insertions — kol-hator's are Rashei
Tevot runs), 3,031 bracketed runs, 1,569 lone parenthesized words
(nineteen-letters' are foreign words in parens — רעפארמאטארען), 174
packed in-word. So the MAM alignment is NOT what frees these works; a
per-class "the parenthesis is the source's own text, ships as written"
verdict is — signed once per class by someone with source knowledge, it
frees the bulk wholesale. The one seder-maamadot site gets its own review.

## The classes (census attached: z-variant-site-grouping/variant-site-grouping-v1.csv)

- **P1** — a whole parenthesized word beside a bare consonantal twin: the
  qere-in-parentheses shape. For Tanakh-family works this is the class the
  MAM alignment answers; the pilot's 66-site map is the golden fixture.
- **P2** — a whole parenthesized word, no twin: an expansion or gloss. The
  likely verdict is NOT-A-VARIANT-SITE — the parenthesis is the source's
  own punctuation, reviewed into the standing record as such, text
  untouched.
- **P3** — a parenthesized run of two or more words (including runs that
  open in one word and close in a later one): editorial insertion. Same
  candidate verdict as P2, per class review.
- **B** — bracket-wrapped runs.
- **IW** — a parenthesis packed inside one word's surface.
- **MIXED_\*** — no shape holds two thirds of a work's sites; needs its own
  eyes, listed by name.

Counts per class and per work are in the CSV; examples with unit ids ride
each row.

## The review contract (what this lane's gate accepts)

1. One review rule per class, written once, applied to every site of that
   class. A review entry asserts, per work per unit: this site is (a) a
   ketiv/qere pair → the Q-map row names both halves, or (b) not a variant
   site → the parenthesis is the source's own text and ships as written.
2. Verdict (b) lands in data/variant-sites-standing-v1.json (the standing
   record build-zone already consults: standing[slug][unit]). Verdict (a)
   lands as a Q map in the pilot's shape; this lane wires the lattice
   rendering that is already live for the two standing targum sites.
3. Nothing is edited: the sealed surfaces ship byte-identical either way.
   The review only says what the bytes are.
4. The gate re-judges on the next fleet pass. A work is freed the day its
   last site is reviewed — per-site, per-work, fail-closed, unchanged.

## Division of labor as of tonight

This lane: the scan (done), the census (attached), the standing-record
intake, the gate. Corpus lane, when the fires are out: the per-class
verdicts themselves — (a)-vs-(b) is a reading of sources, and this lane
does not rule on sources it did not acquire. MAM alignment for P1 Tanakh
works stays corpus-lane work; the non-Tanakh P2/P3 bulk likely resolves to
verdict (b) wholesale once someone with source knowledge signs the rule.

— the website lane
