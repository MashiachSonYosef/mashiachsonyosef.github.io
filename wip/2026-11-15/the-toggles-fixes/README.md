# The default sources: what the third review found, and the fixes (15 November 2026)

The independent review of the default toggles' third fix round (workflow toggles-review-3: page, data and merge lenses, a skeptic per lens) ran beside the ship and finished at 09:30 UTC, after the toggles went live (main 46bbbf7d50). Its completeness critic did not run: it was refused with «You've hit your Fable limit · resets Nov 19, 8pm (UTC). Switch to another model to continue.» The findings and the skeptics' verdicts: `REVIEW-3-FINDINGS.json`.

## What the skeptics confirmed

- **Blocking.** A reader's ruling is painted over by the default source when the ruled word's card is opened under another default than the one it was ruled under, at every word whose place has a set of several pieces (about half of all words). An old fault of the live page behind the rail's fold; the four source pills put it on the main row.
- **Should fix.** Under MACULA and UBS the fill leaves one half of TAHOT's two-word readings standing alone («Bethlehem» «-lehem»); a ruled made pill is withheld from the export elsewhere; a pointer withheld by the names gate is counted as «given as a name by its source» though its source gives it as a form of another word (the site's inference said as the source's word); the page's readiness signal never turns true at rest, so two checks wait out 30 s per load; the gate's S1 reads only the first sections of each sampled chapter; the receipt's «made 65» where the card makes STEP's pill at 232 places; the integration notes' «41 the same» (pills only), «the gate owes the 232» (it samples 8 of them) and the reset timings (no ruling was made in any run).
- **Nits.** The card waits for the form-of map before drawing; the kept credit's chip title follows a ruling where it is false; the pressed pill after a ruled made pill and a switch; three sentences against the lead's rule (the reset pill's title among them); a source's other picks painted in the page's purple; the Menu mirror's missing attributes; wording in the bake and the check; the pin's missing letters; the fault harness's three gaps; the round's order of the defaults and the lines.

## The fixes

Workflow `toggles-fixes-after-review-3` (w2xyc151l, wf_5f503e37-d57) in scratch `pt`, branch `toggles-fixes` from main 46bbbf7d50: a page builder and a tools builder at once, then an independent review, then the fixes. Merged with the kinds' branch for the next ship (both edit zone.html; each keeps its changes local and lists its ranges).

The integration notes of 15 November (`../../2026-11-14/the-default-toggles/fix-round-3/integration/INTEGRATION-2026-11-15.md`) say three things the merge lens showed not to follow; a correction is appended to them.

## The completeness critic (re-run on Opus, 10:50 UTC)

`CRITIC-2026-11-15.json`. None of the 25 confirmed findings is wrong in substance. New, most serious first (each probed on the shipped site):

1. **N1, wrong data.** With the concordance on, the table says «0 locations» for the line's own reading wherever that reading is a row the page made for a default source: all 232 STEP-words places at rest, and about half the lines under MACULA or UBS. No check opens the concordance under a source.
2. **N2, doubled words.** Where a source files one two-word unit at each of the two words, the line prints the unit under both («Bethel · sense 1» twice at Amos 3:14 under BDB; «with food» twice at Daniel 1:8 under MACULA). One rule fixes it with finding 2: a unit the source reads at both words prints once, as a joined run does.
3. **N3, a freeze.** A source press repaints every built line in one task: about 10 to 12 s on Psalms fully built, against 0.15 s with the first sections only.
4. **N4, a jump.** The first card of a visit is rebuilt when the book file lands; its pills move about 200 px on a desktop and focus falls to the body; a click aimed at a pill can rule another.
5. **N5, records.** The landing plan's figures for ship 3 and ship 5's call 4 were stale: corrected in both copies the same morning (ship 5's owed set counts 3 new lines for call 4, not 178).
6. Nits: N6 (/toggles/ calls the source pills «drawn only with the switches»; a photograph under the bottom bar), N7 (a kept source's book file is fetched after the zone, not beside it), N8 (MACULA's title says «press again to go back to STEP» when STEP is switched off), N9 («TAHOT at this place» beside «here STEP reads» on one card).

Process points taken: the checks' wait is fixed by its condition (do not wait at rest), not by a longer suite timeout; the all-lines comparison of the resting lines becomes a step of the round; the next ship, which moves resting lines (the kinds), bakes the defaults after its lines step and owes the lines where STEP's words newly print.

These go to a second round of the toggles fixes, in the same tree, once the first round returns.
