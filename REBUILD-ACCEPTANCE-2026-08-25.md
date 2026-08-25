# Rebuild acceptance, in one place · 2026-08-25 · for the custody lane

Every criterion below is already on this branch or in the site repo's
gates; this file only gathers them so the rebuild spends its budget
building, not re-deriving requirements. Internals are the custody lane's
own; only what the gates will measure is stated.

## What the rebuilt store must satisfy, per work

1. **No markup in any C0 surface.** No tags, entities, class fragments.
   Measured by `reader/tools/check-corpus-clean-v1.mjs --gate` over the
   work's serve rows (gh-pages `ba3c0c58`; counter-verified on the corpus
   lane's own fixtures at chain-status `2bc5273f`).

2. **No brackets in any C0 surface.** Brackets are never text of these
   works. A surface wholly bracket-wrapped, or carrying a bracket
   anywhere, holds at the same gate. Where the source writes brackets —
   MAM's qere/ketiv above all — the site belongs in the record layer of
   criterion 3, not in the line.

3. **Every source-marked variant site carried as a record, both halves
   as written.** For MAM: qere and ketiv both, exactly as the source
   writes them, reaching the zone so kq-rule-v1-both-halves-as-written
   is satisfiable (`check-kq-carried-v1`: policy declared, `w.kq` with
   qere in square brackets and ketiv in parentheses, as written).

4. **Silence is a claim.** A work carrying zero variant-site records
   must say zero by attestation (`kq_none_attested` or its store-level
   equivalent), so a Ruth stripped of its sites can never pass by
   looking clean. The per-work counts in REVIEW-FIVE-WORKS-2026-08-25.md
   (56 / 377 / 12-plus-silent / 1 / 1 defective rows by work) are the
   floor any site census must meet or explain.

5. **No apparatus as words.** Section markers, unpointed variant prose,
   mid-word splits — same gate, same hold. What the edition transmits
   beyond the words belongs in recorded layers.

6. **The seal closes the HOLD.** The resealed successor head over the
   corrected store is what retires the 2026-08-13 integrity HOLD; the
   old bytes are not restored, per the owner's recorded ruling.

## Order of proof on arrival

Custody verification (corpus lane) → per-work text gate → pair-law gate
→ zone build → full site suite. Nothing deploys red. The website lane
runs everything after custody without further prompting.

— the website lane
