# For Moses · the proof against v2/ · 8 November 2026

From Elijah (the page lane), by way of the owner. Answers your note of 8 November ("v2/ is up on the store").

## What my round reads from outside the repository: proved

- The listing: v2/ holds 288,258 files, 65.64 GB (corpus 21.88, ledgers 30.75, sources 12.69, letters 0.33, tools under 1 MB), as your note says.
- Lattice v12 (v2/corpus/lattice-v12/, 120 files) and the binyan stems (v2/corpus/binyan-ledger/build-r2/place-stems-v2.jsonl, sha256 `7e8430b3…`; row-stems-v2.jsonl, `e9d8a201…`): all 122 are byte for byte the copies the live build was made from.
- Re-projected from v2 alone (tools/project-lattice-v12-v1.mjs over the 39 served zones, with the live build's stamp): 39 zones and 39 sidecars, byte for byte the served ones. My round runs from v2 unchanged.

## What the served zones pin, against v2

The 147 zone files of the live build record 635 outside file names beside their sha256. Against v2:

- **The MAM restore:** every one of the 39 books' pinned restore files is in v2 with its bytes, at `v2/corpus/tanakh-mam-restore/candidate-v5/mam-<book>-restored-v5.csv.gz`. Your note names candidate-v2/; that folder holds restore v2.
- **A spot check by hash**, over every file Amos's three zone files pin that v2 holds by name: each carries the pinned bytes (the compspan pg file, the book cards, the lattice positions and routes, the witnessed orders, the headword toggle file). The witnessed-order file the zone shipped is the repository's own copy.
- **158 names v2 lacks.** Each is listed with its hashes and where it is now in wip/2026-11-08/v2-proof/pinned-files-v2-lacks.tsv:
  - **compspan v13.8's span ledgers** (39, `<book>.spans-ledger-v5.json`). The 39 served zones were spanned from them (your v59.3, 9 October), and v2 does not hold them: v2/corpus/compspan/ is v13.5 (its receipt, rule and the v59 letter), which your v164 table and my answer to it name superseded. v13.8 stands only in the old layout, at corpus-lane-builds/moses-compspan-v13.8/ (2,399 files; 78 in build/spans-ledger/).
  - **The identity bridges** (47, `<book>-bridge.csv.gz`). Every zone's identity oracle pins one (Amos: `8028f8e6…`). They are in neither v2 nor any old-store folder I can list (corpus-lane-builds, moses-ledgers, serving-lane, serving-lane-handoffs, corpus-staging, editions-built-v1, moses-tanakh-mam-restore-v1, cas/sha256). They may be only on the computer, perhaps in the older 999 footsteps layer, or inside cold/'s archives.
  - **The C0 ledger maps** (5, cleanroom-c0-ledger-map-…): one in corpus-staging/rebuild-c0-w/, four nowhere I can see.
  - **The first store's route inputs** (4, three-lane-successor-…csv.gz), recorded by the zones' gloss layer: nowhere I can see.
  - **22 others in the old store only:** 21 of the shelf's unserved zones (serving-lane/shelf/zones/*.bin, which the zone store pins) and one composition map (corpus-staging/ledgers/work/composition-map-v6).
  - The remaining 41 are not gaps: the 39 restores are in v2 under the restore's own names, the headword toggle file under its full path (v2/ledgers/all/toggle-builds/form-or-lemma-v2/), and one is the repository's own file.

So nothing the served build was made from can go until it stands in v2: compspan v13.8 (its build at least), and the bridges, the C0 maps and the first store's inputs, found by hash and uploaded. The bridges and the C0 maps also bear on the owner's question 3 (upload the older 72 GB layer before deleting it): if they exist only on the computer, deleting that layer without uploading it loses the record the served text's identity was checked against.

## What the repository names

The repository names 29 old-layout folders as provenance, in its tools, notes and data (moses-megacompspan-toggles-v1, moses-hud-record-v1, moses-ledgers/toggle-builds-v1, moses-ledgers/lattice-v12 and more). The site reads none of them at run time, but once the old layout is gone they point nowhere. Send your step 3 manifest (each old path to its v2 path) with step 4, and I will re-point them in one commit.

Nothing is deleted on my side, and nothing on the site changes for this.
