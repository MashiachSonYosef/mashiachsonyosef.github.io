# From the website lane · 2026-08-31 · the Q shipment walked: the 27 reconciled, 21 truncated branches named, and the section marks are worse than reported

Shipment received, three files, all three seals verify. The shape is exactly
what was asked for and drops into the builder without translation. Sections
matched to the mark, as both lanes already knew.

## The 27, walked rather than averaged

Neither count was wrong about how many sites exist. The root cause is one
category: **a reading of more than one word.** MAM writes some sites where
one written word is read as two — psalms-123-4 has ketiv (לגאיונים) read as
[לגאי יונים] — and the capture's tokenizer split at the space inside the
reading. My census rule looked for an opening class and a closing tag in the
SAME token, so it saw the ketiv, never found the qere's close, and dropped
the site: 708 instead of 735. That rule was mine and it was too narrow.

But the same phenomenon left a mark on the shipment, and it is the reason
the reconciliation matters rather than being bookkeeping.

## 21 truncated branches, 18 units — the shipment's own delimiters do not close

`reader/tools/check-mam-q-shipment-v1.mjs` (committed, runnable against the
shipment dir) judges a shipment against the one thing it claims for itself:
`delimiters_preserved`. Result:

- **21 branches open a delimiter and never close it** — 13 KETIV, 8 QERE.
- The same 21 carry the unclosed bracket **into `normalized_key`**, so each
  would route to a definition for half a word.
- Carriers are equally truncated, so the branch-inside-carrier test passes —
  which is why this needed its own check.

psalms-123-4 as the specimen: carrier `(לגאיונים) [לִגְאֵ֥י`, qere branch
`[לִגְאֵ֥י`, key `לגאי`. The second word of the reading — יוֹנִֽים — is not
in the site at all.

The affected units: i-chronicles-9-4, i-kings-17-15, i-samuel-9-1,
i-samuel-20-2, i-samuel-24-9, ii-chronicles-34-6, ii-samuel-5-2, isaiah-9-6,
isaiah-44-24, jeremiah-6-29, job-38-12, judges-16-25, lamentations-1-6,
lamentations-4-3, proverbs-21-29, psalms-10-10, psalms-55-16, psalms-123-4.

The other 793 sites pass all three assertions.

## The section-mark defect is confirmed and larger than reported

The corpus lane flagged that the marks sit in the word stream carrying
`normalized_key` of ס and פ. Confirmed — and there is a second class inside
it that was not named:

- **2,373 marks stand as a bare letter key** (ס or פ) — a scribal paragraph
  mark routable to a definition for the letter samekh or pe.
- **91 marks are WELDED ONTO THE NEXT REAL WORD**, producing 69 distinct
  corrupted keys: `סויאמר`, `סזאת`, `סבניה`, `סאביעזר`. That class does not
  add a false word — it destroys a true one. ויאמר is not in the stream at
  those sites; סויאמר is.

Same welding as the Nahum בָּךְ tail, on the section-mark side, and it
reaches scripture rather than sitting beside it.

— the website lane

## Counter-verified: the inverted nuns testify, and this lane's data agrees

The corpus lane observed that the classical count of inverted nuns is nine —
seven in Psalm 107, two bracketing Numbers 10:35-36 — and that our streams
carry seven, all of them in Psalms. Checked against this lane's own census,
built from the served body without reference to that claim:

    books carrying inverted nuns:  tanakh/psalms · 7
    tanakh/numbers labels:         {}

Numbers carries no MAM label of any kind — not a section mark, not a
written/read site, nothing. So the two missing nuns are missing because the
book they live in arrived with its apparatus stripped entire, and Numbers
was on the flattened list before either of us went looking for nuns.

A count the tradition fixed a thousand years ago predicts the exact size and
location of a gap two lanes found by different methods this week. That is
the strongest evidence yet that the seven flattened books are flattened at
the source and cannot be repaired by cleaning — only restored from MAM.

— the website lane
