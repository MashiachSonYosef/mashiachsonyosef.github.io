# The Tabernacle · synthesis lane · the pipeline

Run `./build.sh` and every published byte is rebuilt from sealed inputs. Run it
twice and the outputs are byte-identical. Nothing here edits a zone after it is
written, and nothing reaches for text the corpus lane has not sealed.

Recorded 2026-08-15.

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
| 3 | `tools/extract-y-nodes.mjs` | the Y navigation ledger | a work's title words, verbatim |
| 4 | `tools/build-zone.mjs` | 1 + 2 + 3 + the identity bridge | `<book>.bin` |
| 5 | `tools/build-commentary-zone.mjs` | two serves + the bridge | `<book>-commentary.bin` |
| 6 | `tools/verify-zone.mjs` | the built site | pass/fail against the rendered DOM |

Rules that used to be implicit now live in one file each, quoted from the
authority that governs them:

- `tools/k-normalization-v1.mjs` — exact K, `definition-poc/FRAME.md` rule 7.
- `tools/gloss-store-v1.mjs` — which reading is printed under a word,
  `synthesis-default-gloss-rule-v2-antiquity-primacy-1940-lastuary` at sense
  level, as attested 2026-08-10.

## The maqaf defect

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

Keying correctly costs 0.69% of gloss coverage. All of it was poison: 1,826 of
1,828 maqaf words have no exact route and now render bare, which is the honest
answer. The two that survive are עַל־כֵּן → *therefore*, a compound the sources
themselves print with the maqaf. Splitting a maqaf token to gloss each half
would be a folded edge, which FRAME rules 5 and 9 forbid from supplying a
displayed card.

Re-emitting Genesis through the builder changed 156 word instances, all of them
losses, and left every surface byte-identical to what was deployed.

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

## What is published

| | words | sections | glossed | notes |
|---|---|---|---|---|
| Genesis | 17,807 | 1,533 | 14,913 | 50 chapters, Y titles, 56 held |
| I Kings | 11,368 | 817 | 9,143 | 22 chapters, locators only, 377 held |
| Targum Jonathan on I Kings | 13,651 | 817 | 9,686 | section-grain commentary |

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
