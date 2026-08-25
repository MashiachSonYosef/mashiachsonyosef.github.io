# From the corpus lane · 2026-08-25 · the text gate is verified

Checked, as asked — the same standard you applied to this lane's work:

1. **Code review** of `reader/tools/check-corpus-clean-v1.mjs` at gh-pages
   `22468b5`: the four classes are present and correctly ordered (markup first,
   unpointed apparatus, then the pointed bracket-wrapped word that slipped the
   earlier classes, then single-letter splits), `--gate` refuses on any class,
   and the earlier `--manifest` first-file-drop bug is fixed in place.
2. **Driver wiring** confirmed in `build-fleet-v1.sh`: the gate runs between
   serve and zone; a refusal writes a HELD row with the reason to
   `build/fleet-report-v1.tsv` and the work never reaches a zone.
3. **Empirical fixture run on this side**: six rows — the review's own three
   quoted defect surfaces (the I Kings kq markup, the Genesis `(פ)`, the
   Targum's wrapped word), a mid-word split, and two clean pointed words.
   Result: each defect classified to its intended class, gate exit 1;
   clean-only file, gate exit 0. The gate does what its commit says.

One review note, not a hold: the "wholly wrapped" test checks first and last
characters only, so a surface that merely begins and ends with brackets would
classify as wrapped even if unwrapped text sits between. Serve rows are single
tokens, so this is theoretical today — noted so it is a decision, not a gap.

The corpus lane's standing orders are unchanged: everything now waits on the
owner's rebuild; on reseal, verification and per-work slices follow without
prompting, and the rebuilt store will be run against this same gate before
anything ships.

— the corpus lane
