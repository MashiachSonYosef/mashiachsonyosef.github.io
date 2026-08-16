# The Tabernacle · synthesis lane · the pipeline

Run `./build.sh` and every published byte is rebuilt from sealed inputs. Run it
twice and the outputs are byte-identical. Nothing here edits a zone after it is
written, and nothing reaches for text the corpus lane has not sealed.

Recorded 2026-08-15. Component layer and the deep catalog added 2026-08-16.

## Why this exists

The Orot zone could not be rebuilt. It was produced by running four patch
scripts in sequence over the same file — `patch-orot-gloss`, `patch-bins`,
`patch-orot-envelope`, `patch-bins-v3`, `patch-orot-titles`, `patch-nodenums` —
each mutating the output of the last. That file was an heirloom, not an output.
A gloss rule lived in a page rather than in a script, so it could not be
reviewed or diffed. A mirror of the sealed corpus was assembled by hand: copy a
file, run, see what breaks, copy another.

Every one of those is now a script with its rule declared at the top of it.

## The stages

| # | Script | In | Out |
|---|---|---|---|
| 0 | `tools/plan-mirror.mjs` | the chain's shard indexes | the exact file list the resident reader needs |
| 1 | `tools/mishkan-serve-v1.mjs` | a C0 range, the sealed mirror | one NDJSON row per occurrence, oracle-checked |
| 2 | `tools/build-route-store.mjs` | the sealed definition packages | 256 gzip shards, keyed by exact K |
| 2b | `tools/regloss-zone.mjs` | a zone + a store | the same zone re-projected onto the store |
| 3 | `tools/extract-y-nodes.mjs` | the Y navigation ledger | a work's title words, verbatim |
| 3b | `tools/span-slice-v1.mjs` | the COMPspan template | each form's component list, for the forms one book contains |
| 4 | `tools/build-zone.mjs` | 1 + 2 + 3 + 3b + the identity bridge | `<book>.bin` |
| 5 | `tools/build-commentary-zone.mjs` | two serves + the bridge | `<book>-commentary.bin` |
| 6 | `tools/verify-zone.mjs` | the built site | pass/fail against the rendered DOM |

Rules that used to be implicit now live in one file each, quoted from the
authority that governs them:

- `tools/k-normalization-v1.mjs` — exact K, `definition-poc/FRAME.md` rule 7.
- `tools/gloss-store-v1.mjs` — which reading is printed under a word,
  `synthesis-default-gloss-rule-v2-antiquity-primacy-1940-lastuary` at sense
  level, as attested 2026-08-10.
- `tools/span-slice-v1.mjs` — how a form divides, read from
  `w-to-compspan-template-v6` and never invented here.

## The maqaf

Genesis shipped with the wrong key rule. The builder stripped the maqaf before
looking a word up, which fuses two written words into one and asks the catalog
about a form nobody wrote. FRAME rule 7 says the opposite: K removes niqqud,
cantillation, bidi controls, sof pasuq and paseq, and *preserves* Hebrew
letters, abbreviation punctuation, and boundary maqaf.

131 word instances across 65 distinct forms were affected. What the page showed:

| written | fused key | printed |
|---|---|---|
| אֶל־קַיִן "to Cain" | אלקין | a hydrocarbon with a triple bond between two carbon atoms |
| אֶל־גְּבִרְתָּהּ "to her mistress" | אלגברתך | algebra |
| כִּי־אִם | כיאם | khayyam |
| עַל־עֵין | עלעין | rib |
| בֹּא־נָא | באנא | nose |

On 1 Kings the same rule would have printed **crowley** under קִרְאוּ־לִי.

Keying correctly fixed the poison and left 1,828 occurrences of 1 Kings bare,
because `אל־קין` is not a key the catalog holds. That was the state as of
2026-08-15, and it was incomplete rather than wrong: the W inventory records
the pieces either side of a maqaf as **separate W**, so the reader was asking
about a form the ledger never claimed existed.

The rule now is the ledger's own: **the block on the page is the occurrence,
and what is clickable inside it is whatever the ledger says the occurrence
contains.** An occurrence written with a maqaf prints as one word, holds two W,
and each of them opens on its own. Nothing is glued, nothing is folded, and no
new identity is minted — the two W were already in the inventory under their
own keys.

The regions are cut from the printed surface rather than rebuilt from the key,
so a region is always a substring of what the page shows, and the builder
refuses if the pieces do not rejoin to the exact K. An edge maqaf — `לחם־`,
seven occurrences in this work — yields one W and a maqaf that belongs to the
next occurrence; it prints, and it does not open, because it is not a W.

Measured on 1 Kings: 4,297 distinct whole-surface forms, of which 3,085 (71.8%)
have a component system in the ledger. Reading the same text as W: 3,494 forms,
of which 3,486 (99.8%) do. The eight that do not are listed under *Open* below.

## The component system

A W's COMPspan is its attested component list, and it is determinable without
any definition work at all — no L, no D, no M. Everything the card offers
follows from that list by arithmetic:

- **n(n+1)/2 blocks** — every contiguous run of components.
- **2^(n-1) complete divisions** — every way of cutting the form so that each
  component is used exactly once and none is used twice.

Neither is stored. The zone ships the component list and the reader computes
the rest, which is why the whole layer costs 62 KB gzipped on 1 Kings.

The derivation was checked against the ledger rather than assumed: for the
6,193 forms these two books contain, `w-to-compcell-template-v6` holds 27,323
cell rows, and all 27,323 match the derived surface exactly, every form has
exactly n(n+1)/2 of them, and every maximal cell equals its own key.

The catalog is keyed by **cell surface**, not by whole word. That is the gain:
1 Kings' forms expand to 6,492 distinct cell surfaces, of which 5,748 carry
readings — so a reader can open ה inside והמלך and get what the sources attest
for ה, which was previously unreachable.

The card opens on the whole W, one block, first reading, because a complete
word is what a reader came for. Every finer division is one tap away and none
is hidden.

**On the boundaries.** 5,025 of the 6,193 forms carry
`formulaic_clitic_candidate_v1` boundaries, 84 carry
`stepbible_tahot_explicit_source_alignment_v1`, and 1,084 are single-component.
The formulaic pass over-splits: it offers `מקום` as `מ + קו + ם` and `הכהנים`
as `ה + כ + ה + ני + ם`. The card says where the boundaries came from and says
nothing else about them. That line is provenance on the cut, not a verdict on
any reading the cut makes reachable — a reading is removed by its licence and
by nothing else. Over-splitting is also the recoverable direction: the correct
coarser cut is still one of the complete divisions, and it is the one the card
opens on.

## Commentary

The Genesis sidecar was fetched from outside the corpus: no C0 identity, no
chain receipts, no route the corpus lane could check. 1 Kings takes the other
road. **Targum Jonathan on I Kings** is a work in the sealed chain, served
id-by-id by the same resident reader, verified against the same identity
bridge, and attached to the base text by the coordinates both works already
carry in their sealed unit ids: `i-kings-7-14` receives
`targum-jonathan-on-i-kings-7-14`.

817 of 817 sections carry it. Every commentary unit found its section and no
commentary unit was orphaned — the builder refuses to emit if either side is
short. It ships as words rather than as a paragraph, so the Targum's own text
is tappable and answers from the same catalog: 9,686 of its 13,651 words carry
a reading. Its licence is its own, computed from its own rows (Public Domain,
`LIC-PUBLIC-DOMAIN-PROVIDER-ASSERTED`), and nothing inherits from the base text.

## Titles

A title is corpus text, so its words need their own definition and source
records before this page prints one. Genesis has a promoted Y node and its
chapter titles are the ledger's words with the ledger's own keys. 1 Kings does
not: Y version 1 materializes Genesis only, and the 37-work Tanakh extension is
a validated candidate that has not been promoted. So 1 Kings carries English
locators — "Chapter 7 · 51 verses" — read out of the sealed unit id, and no
title in either language. No Hebrew numeral is invented to fill the gap.

Where the ledger marks a token as a NUMBER, it carries no lexical key. The
ledger is explicit about this: a `CHAPTER_NUMBER` token has an empty
`selected_gloss` and a pointer basis of
`REUSED_EXACT_NORMALIZED_W_C0_POINTER__NOT_A_NEW_C0_OCCURRENCE`. It reuses a
letter's identity to name a number. Handed to the catalog it would print *the*
under chapter א׳ — the catalog answering correctly about a word nobody wrote.

## The top-five gate

The route store used to ship only rows the definition package flags
`selected_visible_top5` — at most five routes per form. For the 6,490 surfaces
I Kings can open, that dropped **110,151 of 132,717 routes: 83% of the
catalog**. `נשא` carries 448 and a reader met 5.

Every one of the dropped rows was checked, and every one is licensed: 0 missing
route text, 0 missing definition text, 0 missing M, 0 with an M short of a
source key, label, licence posture or pointer. CC BY 4.0 (33,641), CC BY-SA
(14,307), public domain (35,491 across three postures), CC0, and the rest. The
earlier build's `refused: 0` was not evidence they were sound — the flag test
ran one line *above* the licence test, so those rows were never examined.

The flag is a ranking, not a licence. Nothing but a licence removes a reading,
so rule 2 now ships every route with a complete M record and lets
`semantic_route_rank` order them rather than gate them. **646,441 routes over
140,532 keys, 13.1 MB gzipped, largest shard 68 KB.** דוד goes from 5 readings
to 115, בא to 165, and Genesis's ב to 249.

Two consequences, both handled:

**The default reading moves.** Rule v3 orders antiquity first and the catalog's
own `semantic_route_rank` only third. With five routes that hardly showed; with
a hundred and thirty it decides everything, and `אב` reads *author* rather than
*father*. This is the open item below, and rule v3 has not been changed here.

**A shared store desynchronises every zone.** A zone bakes one reading per key
so the page paints without fetching 256 shards, while the card computes from
the store live. Move one and not the other and the printed word disagrees with
the pressed pill — 55.6% of Genesis's words, 53.6% of Orot's. So every zone was
re-emitted or re-projected: Genesis and I Kings rebuilt from their serves,
Orot — which came through the acquisition route and cannot be re-served here —
re-projected by `regloss-zone.mjs`, which recomputes only the gloss layer and
copies everything else through untouched.

## Cache, and why a shard is addressed by its store

Deploying a moved store is not enough. A reader whose browser holds yesterday's
shard keeps being answered from it while the page prints today's reading, and
the two disagree on screen exactly as if the zone had never been rebuilt.

So the index now carries a `store_version` derived from its input hashes, its
rule id and its route count, and every shard URL carries that version. The
index itself is the one file that must never be stale, and it is fetched with
`cache: "no-cache"` — a conditional request that costs a 304 when nothing has
moved. Everything downstream is then addressed by which store it belongs to
rather than by name alone.

## What is published

| | occurrences | W | sections | reading | notes |
|---|---|---|---|---|---|
| Genesis | 17,807 | 20,691 | 1,533 | 17,729 | 50 chapters, Y titles, 56 held, no component layer |
| I Kings | 11,368 | 12,883 | 817 | 10,969 | 22 chapters, locators only, 377 held |
| Targum Jonathan on I Kings | 13,651 | 13,651 | 817 | 9,686 | section-grain commentary |
| Orot | 59,759 | 59,759 | 416 | 45,957 | acquisition route, 6 declared drifted units, re-projected |

Genesis gained 2,816 reading words from the maqaf rule alone — it had the same
defect I Kings did, and 2,835 of its occurrences hold more than one W.

I Kings gained 1,826 reading words against 2026-08-15 — the maqaf occurrences,
which were bare and are now two words each. The component layer adds no words
to that count; it adds 2,300-odd sub-word surfaces the reader can open, which
the count of glossed *words* cannot show.

Component layer, I Kings: 3,424 distinct forms, widths 1×460, 2×1,422, 3×1,123,
4×317, 5×102 — 16,164 blocks and 11,964 complete divisions, all derived.
Targum Jonathan: 3,239 forms, and its distinct forms carrying a reading go from
1,804 to 3,284 once the catalog is asked per block.

Every unit verified against the bridge on count, C0 range and ordinals:
1,533/1,533 and 817/817, no drift. Sealed-CLI oracle: 24/24 field-exact on each
serve.

## Open, and not decided here

1. **`כְּיָמִים` prints "chemical."** Not a fusion — that is the exact written
   form, and the rule chose it. Within the post-1940 tier the rule orders by
   year, so a 2024 Wiktionary route outranks a 2026 STEP route the catalog
   itself ranks first ("like days"). Between two modern sources two years
   apart, the year is a coin toss that overrides the catalog's own judgement.
   The rule is as attested and has not been changed.
2. **Genesis still carries its fetched commentary sidecar.** It was not built
   from the corpus and was never authorized. It has been left exactly as
   deployed rather than removed on my own initiative.
3. **Orot is untouched.** Its gap is A-0017 in the acquisition ledger, and the
   slice that closes it is `hewikisource`. The federation slice sealed
   2026-08-13 does not include it.
4. **Eight W of 1 Kings have no component system, and six of them are a C0
   defect.** Three carry a MAM section marker fused to the next word
   (`<span class="mam-spi-samekh">{ס}</span>&nbsp;…יְהוֹשָׁפָט` at 4:3, and the
   same at 4:5 and 4:6) and three carry ketiv markup (`(מירכותי)` 6:16,
   `(שושק)` 14:25, `(ובשגיב)` 16:34). Source HTML is inside the occurrence
   surface and was tokenized on whitespace with it. 377 occurrences of this
   book — 3.3% — carry markup this way; the chain's own script rule catches
   every one of them as `SCRIPT-UNRESOLVED-V1` and the page holds them dark, so
   nothing false is printed, but the underlying C0 is wrong and this page
   cannot fix it. The W inventory is clean: it carries no markup key at all.
   The two genuine absences are `וַיּוֹרִדֻהוּ` (1:53) and `כַּצִּדֹנִים` (5:20).
5. **Rule v3 orders antiquity before the catalog's own rank.** On the deep
   catalog this decides the default reading, and often badly: `אב` prints
   *author*, `אביך` prints *filled or abounding with fog or mist*. The
   catalog's `semantic_route_rank` is only the third tiebreak, after tier and
   year. Rule v3 is attested 2026-08-10 and has not been rewritten here; every
   reading is one tap away regardless, but the reading that prints without a
   tap is chosen by a rule that was calibrated against five routes and now
   arbitrates a hundred and thirty.
6. **Genesis has no component layer.** Retrofitting a published book changes
   what every word on it offers, so `build.sh` builds Genesis without `--spans`
   deliberately. The page reads a zone with no component layer as whole forms
   only and says so in its own receipts; that path is verified.
