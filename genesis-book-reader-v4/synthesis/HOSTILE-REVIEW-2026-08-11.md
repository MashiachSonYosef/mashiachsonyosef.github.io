# Hostile review — 2026-08-11

A deliberate attempt to break the project's own claims: correctness,
license honesty, rule discipline, and legibility. Every finding below was
verified against the shipped data or reproduced in a browser before being
written down. Findings are ranked by how much they matter, not by how
easy they were to find. Three were repaired during the review (marked
REPAIRED); the rest are recorded and await a decision, because silently
fixing taste-level problems is how hand picks sneak back into code.

## 0 · The reviewer's own miss — found the day after (SELF-CAUGHT, REPAIRED)

The review above blamed the corpus for של leading with "to pluck off".
That was half the story and the flattering half. The corpus **had already
resolved the form correctly** — `token_index.forms[].surface_renderings`
carries `["of", "belonging to"]` with
`surface_context_status: resolved_particle`. The shard generator read only
`lexicon.entries` and never opened the token index, so the corpus's own
answer was invisible to it and a form-matched homograph led instead.

That is a defect in the synthesis lane, not the K lane. Measured across
the 64 words, the ignored layer carried: של → "of" (had: "to pluck off"),
לעמו → "to the nation" (had: "a people (as a congregated unit)"),
וברצונו → "and delight" (was **held entirely**), הקב״ה → already right.

**Repaired** by shard rule v2 (contextual-resolution-first): where the
corpus resolves a form contextually, those renderings lead every
form-matched dictionary route and carry the corpus's own resolution note
as their basis. Result: 49 woken (was 48), 15 held (was 16), and three
defaults corrected. Rule declared in the generator header before the
output was accepted, per lane law.

The lesson worth keeping: a review that only audits its own output
against the inputs it already chose to read cannot find the inputs it
never read. Finding 9's blind-spot list now includes "fields of the
corpus the generator does not consume".

## 1 · Function-word shards lead with wrong-headed defaults (SERIOUS, partly repaired)

Receipts: of the 48 woken Rashi words, **25 display a default route whose
dictionary record the corpus itself marked `other_possible`, not
`likely_contextual`** — because the likely record carries no English
renderings, so a form-matched homograph leads. Worst cases: הם shows
"father" (69 routes, **none of which is "they"**), לנו shows "to stop
(usually over night)" (no "to us" anywhere), של shows "to pluck off" (no
"of"). The dictionaries linked simply never carry the plain
pronoun/particle sense for these surface forms.

**Amended diagnosis (same day):** the sources published these senses.
Strong's H1992 (הֵם = "they") is in the capture. Two mechanisms broke it:

1. *Suffix-substring matching.* The `הם` entry (lex-2a211473204c) links
   twelve content words — H1 אָב "father", H1000 בֵּיצָה "egg", H1004
   בַּיִת "house" — every one of them a lemma whose WLC surface forms
   include the 3mp possessive suffix ־הם ("their father", "their egg").
   All twelve carry `match_key: "המ"`. The matcher matched the pronoun
   against a suffix inside longer surface forms. H1992 itself is captured
   but linked to המה/ההם — and, by the same bug, into the בהמה "beast"
   family.
2. *Compounds with no headword.* לנו, להם, בה, לכם, מהם are preposition +
   pronominal suffix. No single Strong's entry exists for them, so the
   matcher returned its nearest form-match (לנו → לוּן "to lodge";
   בה → נָכָה "to strike"). The corpus schema already has the right
   mechanism for these — a `breakdown` field, populated for 679 entries
   corpus-wide with exactly the right shape — but not for these forms.

So: short-form linking fix plus breakdown coverage. The data exists; the
wiring is broken. Note also §0: for the forms the corpus *had* resolved,
the fault was this lane's, not the K lane's.

The hostile question: is a wrong-leading default worse than an honest
hold? The current rule says a licensed record presented plainly beats no
record; the reviewer's position is that for function words this trades
reader trust for coverage. Three lawful repairs exist, none applied yet:
(a) upstream: add the missing function-word senses to the project-authored
CC0 layer (the corpus's own של → "of" record exists but carries the
unmapped license string "N/A - project lexical rule" — one license line
upstream would wake it correctly); (b) a declared display rule v1.1 that
holds a word whose every route is `other_possible` **and** whose corpus
entry carries an unresolvable likely record — but note this would also
re-hold בראשית, whose "the first" default is other_possible and fine, so
the rule needs the second clause; (c) accept and record. Decision is
Kyle's lane.

## 2 · 28% of shard routes are comma-split fragments (SERIOUS, open)

Receipts: 184 of 652 selectable routes are fragments of upstream
comma-splitting — 80 with unbalanced parentheses ("the earth (at large",
"partitively a land )"), 43 truncated trailing-dot scraps ("law.",
"manner."), 36 bare adverbs ("properly", "specifically"), 17
symbol-leads ("× common"). These are real strings from the licensed
records, so presenting them is not invention — but a pill row where every
fourth pill is noise costs legibility, the project's stated value. The
repair is upstream (rejoin split renderings in the corpus build), not a
reader-side filter: a filter would be an undeclared editorial rule.

## 3 · The antiquity ordering is inert for every commentary word (MODERATE, open)

The corpus records no source years, so all 652 routes sit in the lastuary
tier and rule v2 degenerates to corpus order. The pill order is therefore
honest but the attested rule does no work here. Latent until year
evidence exists in the corpus; recorded so nobody mistakes the current
order for an antiquity ranking.

## 4 · Chapter jumps silently appended phantom chapters (REPAIRED)

Reproduced: with the pane scrolled deep, pressing Next/Previous triggered
the smooth-animated reset to the top, which passed through the
near-bottom append zone and appended up to three extra chapters during
the animation (observed appended_through jumping 2→5). The audit still
passed because the count contract was consistent — the defect was
unrequested work, not a broken count. Repaired with a 900 ms append
suppression window around the jump reset; re-tested: jump lands with
stream_start === appended_through, PASS.

## 5 · The per-section copy control was a 20 px touch target (REPAIRED)

Measured at 420 px viewport: 85×20 px, ~11.5 px font — below any
reasonable touch minimum. Phones now get min-height 2.4 rem. Desktop
unchanged.

## 6 · The header stated a license union it could not stand behind (REPAIRED)

"CC BY-SA 4.0 + Public Domain" in the book bar was a deduped union across
sections — legible but imprecise by construction, and it read as a single
blanket claim. Per Kyle's call the header now states nothing; it is a
plain "Sources" door to the full records, and each section footer remains
the only license claim, scoped exactly.

## 7 · Lemma presentation has a small false-positive tail (MINOR, open)

The rule (gild text before the first period when ≤40 chars) was audited
against all 504 displayable witness texts: 143 marks, 99 distinct
prefixes. The bulk are true incipits, including the וכו׳ quotations
("בראשית ברא וכו'.") which are exactly the dibbur-hamatchil convention.
The tail: a handful of opening *clauses* get gilded — Siftei Chakhamim
1:1:10 "כלומר תחלת דיבורו." and 1:1:11 "ופירושו בראשית הכל.", and the
ibid-style "שם." (Birkat Asher 1:1:5–6). Presentation-only, text
untouched, but recorded: a smarter rule would need per-work conventions,
which is corpus work, not a reader heuristic.

## 8 · gh-pages root carries divergent stray copies (PROCESS DEBT, open)

A misplaced deploy earlier today left copies of the reader JS/CSS and the
64 shards at the repository root (`/genesis-book-reader-v4.js`,
`/data/nested-rashi-hud-words/`). The site serves the
`/genesis-book-reader-v4/` folder, so the strays are inert — but they are
now *behind* the live copies and will mislead anyone reading the repo.
GitHub's web UI has no directory delete, so cleanup is 60+ single-file
deletions or one scripted commit when write access exists outside this
sandbox. Until then: this note is the warning sign.

## 9 · Audit blind spots (MINOR, open)

The audit verifies counts and contracts it knows about; it does not (a)
checksum shard content against the generator's ledger (a corrupted or
stale shard file would render unchecked), (b) verify chapter-divider
placement in the continuous stream, or (c) cross-check the 48/16
woken/held split against `ledger-rashi-1-1-1-word-shards.json`. All are
cheap additions if the audit is to keep pace with the features it vouches
for.

## 10 · License-chain notes that survived attack (verified, no action)

- Rosenbaum–Silbermann Rashi: Genesis volume published 1929 → US public
  domain since 2025; Silbermann d. 1939 → life+70 cleared 2010. The
  Sefaria "Public Domain" label checks out **for Genesis**; later volumes
  (1930–1934) clear US copyright later — matters only when the project
  leaves Genesis.
- OpenScriptures records (102 of the 126 M records used) are CC BY 4.0
  with attribution given; weakness: the corpus's exact-entry pointer is
  the repository, not the entry — a K-lane citation gap, recorded.
- Wikidata records (17) are CC0; project-authored records (7) are CC0 by
  declaration. Kaikki (CC BY-SA/GFDL dual) is **unused** by the current
  shards — the dual-license handling is latent, not live.
- Wikisource Miqra CC BY-SA 4.0: verbatim presentation with per-section
  attribution and license link satisfies BY; no adaptation is claimed.

## Verified-and-fine (attacked, held up)

ברא's "create" is present and selectable behind the antiquity default
(510 distinct routes); no `innerHTML` sinks carry corpus strings (DOM is
built via textContent); external links carry `rel="noreferrer"`; the D
card's Hebrew is the dictionary's own vocalized lemma, not a stripped
form; the audit's stream contract counts the full appended range; the
word-run lemma marking is offset-bounded and never mutates text; held
words state their hold reason from data.

## Rerun the receipts

The counts above are reproducible: fragments/defaults from
`data/nested-rashi-hud-words/*.js` + the shard ledger; lemma prefixes
from `data/genesis-1-1-commentary-2026-07-17.js`; the append defect via
scroll-to-bottom → Next before the fix. Nothing in this review rests on
taste alone except where it says so.
