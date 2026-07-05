# Genesis 1:1 Render Pointer Gap

Render repo lane only. This file is not an authority ledger and does not accept source, license, D, R, or M rows.

Pipeline:

```text
C0 -> W -> COMPspan -> L -> ((D + R) <- P) -> M
```

Current render state:

```text
בראשית = wired from validated Bereshit sidecar
ברא = pending importer card
אלהים = pending importer card
את = pending importer card
השמים = pending importer card
ואת = pending importer card
הארץ = pending importer card
```

Pending COMPspan candidate scaffold:

```text
ברא
- whole candidate: ברא

אלהים
- whole candidate: אלהים

את
- whole candidate: את

השמים
- whole candidate: השמים
- split candidate: ה־ + שמים

ואת
- whole candidate: ואת
- split candidate: ו־ + את

הארץ
- whole candidate: הארץ
- split candidate: ה־ + ארץ
```

Importer outputs needed for each pending token:

```text
c0OccurrenceId
visibleWId
acceptedCompSpanRows
defaultCompSpanId
lBundleRows
dBundleRows
rRouteRows
pExactRouteSetProof
mSourceLicenseRows
renderCardSidecarPointer
validationPointerAndStatus
```

Rules:

```text
Whole-word COMPspan slots are mechanical from W, but they still do not unlock a render card without importer output.
Split COMPspan rows are candidates only until validated.
D is immutable and may not be shortened or rewritten.
R selects exactly one member from D.
P groups exact R-member inventories only.
M attaches source/license only after the exact bucket is proved.
No English is derived from the Hebrew shape candidates.
```
