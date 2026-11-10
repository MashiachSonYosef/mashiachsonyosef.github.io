# The round's scripts, kept (10 November 2026)

These lived only in the session's scratch folder. They are the page lane's working round as it is run, saved here so the next session does not rebuild it from memory. Every path inside them is the scratch folder of the session that wrote them (`S=/tmp/claude-0/.../scratchpad`): re-point `S` before running anything.

## The layout they assume

- `$S/pt`: a checkout of `main`, the build tree. `$S/old`: a second worktree at the commit the live site serves, for the gate.
- Four local servers: 8912 serves `$S/pt` (the site as built, e.g. `/genesis/1/`), 8899 serves `$S/pt/reader` (the bare reader, `zone.html?b=<work>`), 8914 serves `$S/old`, 8915 serves `$S/old/reader`. Start each with `setsid nohup timeout 43200 python3 -m http.server <port> --bind 127.0.0.1` from its folder; a server started inside a background task dies with the task unless it has its own session.
- `$S/v26/proj/zones`, `$S/v26/proj/sidecars`: the re-projected zones and sidecars a store change produces (`pipeline.sh`). A page-only round leaves them as they are and starts at `finish.sh`.

## The round

1. `pipeline.sh` (a store change only): regloss every served zone and commentary zone (`regloss-bake.sh`, `regloss-comm.sh`), re-project the sidecars (`reproj.sh`), then `finish.sh`.
2. `finish.sh`: install the projected zones, rebuild the chain books and the search index, re-pin the store, the C0 refusals, the count's receipt (written again from the zones' stamps every round), the serve gate's receipt, the store manifest, the front door (which writes `engine-<hash>.js` and `.css` from `zone.html` and every reader page), the lane state, the ledger index, the pipeline manifest, and copy `deploy-root` to the site root. Never edit `zone.html` while it runs.
3. `chainA.sh` (27 checks: the store, the readings, the pointing, and the count's receipt), `chainB.sh` (28 checks: the page, its colors and licenses, and the tree's own records), `gate.sh` (`check-same-product-v1`: the build against the live tree, line by line and first card by first card), `chainC.sh` (28 drawing checks and the numbering check in both readers on three books). `after.sh` runs A, B and the gate after restarting the servers.
4. `ship.sh`: reads the commit message from `$S/v26/commit.txt`, refuses if `origin/main` moved, commits and pushes `main`, then builds the `gh-pages` merge ("gh-pages follows main", keeping that branch's own README) and pushes it.
5. `poll.sh <gh-pages sha> <main sha>` waits for the Pages deployment and the live check; `poll2.sh <run id> <main sha>` does the same after a re-run. A re-run publishes without the event that starts the live check, so the live check is then dispatched by hand (workflow `live-check.yml`, ref `main`).

## The reds that are the environment's, not the build's

- `check-zone-store-v1`: shelf pins for zones this checkout does not serve.
- `check-frame-coverage-v1` (V).
- `check-hoh-in-card-v1` and `check-kq-presentation-v1` skip: no zone here carries a Hebrew-on-Hebrew sidecar, and the presentation candidate bundle is not in the checkout.

## What is not in any chain

`reader/tools/run-all-checks.sh` runs every check (167 of them) against a panel of zones chosen by shape. Chains A, B and C are 82 of them. Four checks outside the chains had gone stale without anyone seeing it (corrected on 10 November: `check-usable-card-v1`, `check-ruled-mark-v1`, `check-names-pill-v1`, `check-dictionary-toggle-v1`), which is the cost of running a part and calling it the round. The count's receipt had gone stale the same way (a work served on 8 November and not in it until the 10th); `check-bookword-count-v1` now holds the receipt to the stamps and is in chain A.

## measure/ and pick/

- `measure/numroom.mjs <url> <mode> [width] [css] [crop prefix]`: photographs the page with the card numbers drawn and again with their ink unseen, and measures each number's nearest gold and nearest letter. `sweep.sh` runs it over eight works, both readers, two widths. `classmap.mjs`, `zoom.mjs`, `elshot.mjs`, `shot.mjs` are its helpers for looking at one place closely.
- `pick/pick.mjs <url> <out dir> [ids]`: draws the page under each palette variant sent to the owner (linen L1 to L4, bronze B1 to B3, gold G1 to G4, the marks M1 and M2); `sheet.cjs`, `sheet-marks.cjs`, `close.mjs` and `sheet2.cjs` lay the shots out as the sheets that were sent. The variant the owner picks is implemented from the values in `pick.mjs`.

## A witness record that changes

The count stamp is in the zone's own bytes, with the hash of the witness record it was stamped from. When `reader/data/masorah-witnesses-v1.json` is emitted again (`reader/tools/emit-masorah-witnesses-v1.mjs --cards <book-cards-v2.json> --reconcile <RECONCILE-v1.md> --counters <the folder holding the three Leningrad counters>`; the inputs are the corpus lane's, under `v2/ledgers/all/torah-count-gate/` and `v2/ledgers/all/wlc-count/agents/` on the shared store), every stamped zone is stamped again before `finish.sh`: `for f in $S/v26/proj/zones/*.bin; do node tools/restamp-zone-v1.mjs --zone $f --stamp <date>; done`. The projected copies are the ones to restamp, since `finish.sh` installs them over `data/zones`.
