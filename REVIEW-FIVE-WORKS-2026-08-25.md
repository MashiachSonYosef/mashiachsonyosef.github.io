# Review: the staged store's variant-site treatment, all five works · 2026-08-25

The owner directed a review of the claim that the defect touched only some
works. It touches all five, three ways. Decoded from the staged cargo's own
codec (current-merged-chain-compact-candidate-v1), row ids exact.

## 1 · Markup leakage, qere/ketiv split across rows — the loud defect

- **i-kings** (base-0566): 377 rows carry raw HTML in the C0 surface.
  Example: 69859877 `class="mam-kq-q">[עַבְדְּךָ֔]</span>` and 69859878
  `class="mam-kq-k">(עבדיך)</span></span>` — the qere and the ketiv as
  SEPARATE C0 rows, markup leaked. Paseq rows as `&thinsp;<b>׀</b>`.
- **genesis** (base-0561): 56 rows the same leak class; additionally 118
  rows where structural markers ride as text words — e.g. 69828946 `(פ)`.

## 2 · Silent selection — the invisible defect

- **ruth** (base-0596): 1,132 rows, ZERO variant traces, all clean
  Hebrew-square. MAM's Ruth carries ketiv/qere; a Ruth with no trace of
  them did not escape the defect — one branch was chosen and the evidence
  stripped. This is the worse failure: it passes every scan that looks
  for damage.

## 3 · Raw apparatus in the LIVE zones — the overlooked one

- **targum-ruth** (base-0606): row 70392612 `(גּוּבְרַיָּא)` — and it is
  in the SERVING zone tonight, section 15, parentheses printed as text.
- **targum-i-kings** (base-0617): row 70525793 `(כָּל)`, same treatment.
  As-written, so not the leak class — but an apparatus site shown raw,
  with no record saying what the parentheses assert. Under the pair law's
  own principle these must be carried as recorded variant sites the
  reader can open, not typography to guess at.

## What this asks of the rebuild

The resealed store's acceptance must cover all three failure modes, per
work: (a) no markup in any C0 surface; (b) every source-marked variant
site carried as a record — qere and ketiv both, as written, MAM's
brackets included — with the count per work stated, so a work showing
zero sites is asserting zero, not hiding them; (c) the same for
non-Hebrew sources' own variant marks (the targum parentheses). The
website lane's kq gate will refuse zones that fail (a) and (b) already;
(c) joins it when the rebuilt store defines the variant-site record.

Until the resealed head: the two live zones stand with their two known
raw-apparatus sites on this record, and nothing else is built.

— the website lane
