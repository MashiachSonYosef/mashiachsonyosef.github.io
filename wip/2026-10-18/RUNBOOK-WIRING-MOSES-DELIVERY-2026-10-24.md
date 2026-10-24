# Runbook: wiring Moses's delivery (the seven asks of 2026-10-23)

Written 2026-10-24 while the context was still whole, for a session that
will have little of it. The owner: "hes almost done lets wait until hes
entirely done and then as usual youll be pretty low tokens to pull it all
off." Follow it top to bottom; every step names its tool and its check.
The asks themselves are in PROMPT-FOR-MOSES-2026-10-23.md (same folder).

## 0. Where things are

- Ship worktree: `$S/ghp` on branch `piece-store-2026-10-17`, pushed with
  `git push origin piece-store-2026-10-17:main`. Site root is `$S/ghp`,
  the reader and its pipeline under `$S/ghp/reader`.
  `S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`
  (if the scratchpad is gone: clone main, the layout is the same).
- gh-pages worktree: `$S/gp`, detached at origin/gh-pages.
- Notes repo: this repository, branch `claude/awesome-hypatia-2pxz43`;
  the day log is wip/2026-10-15/STATUS-2026-10-16.md. The stop hook
  requires the notes committed and pushed.
- Live as of this writing: main 8221d612b, gh-pages edb8817fd.
- Servers for the browser checks (restart when dead; two-hour limit):
  `cd $S/ghp/reader && (npx --yes http-server . -p 8913 -s & npx --yes http-server . -p 8899 -s & cd $S/ghp && npx --yes http-server . -p 8912 -s & cd $S/gp && npx --yes http-server . -p 8914 -s & wait)`
  8913 = reader by address (`zone.html?b=<book>`), 8912 = the built root,
  8914 = the live build (gh-pages) for the same-product gate.
- Standing constraints: never print or commit `$S/r2.env`; scan every
  staged diff for `bcb5d122|eb0dc5bd|15319bb62e16|R2_SECRET|AKIA`; no
  typed Hebrew glyphs in zone.html or tools (the check line in step 7);
  no book named in a tool (check-scope-derived S1); American English;
  commit trailer only (Co-Authored-By + Claude-Session); every main push
  followed by "gh-pages follows main"; R2 read-only.

## 1. Receive

Moses hands over a relay page (FOR-ELIJAH-vNN.md) and build folders,
usually under `/mnt/user-data/uploads/...` or a path the relay names.
First, read the relay whole. For each ask below, the relay should name:
the build dir, the schema version, the counts, and the hash of the
index. Copy nothing by hand; every bake tool reads `--from <dir>`.

## 2. The asks, in the order to wire them

Wire 7 first (the owner: "just do tikkunei zohar then"), then 6, then the
store asks (1, 2, 4, 5), then 3 (a review, no code).

### Ask 7 · Tikkunei Zohar (and Delitzsch, if sent)

Source kept at `$S/intake/tz/tikkunei-zohar-vocalized.json` (Sefaria
export, "Public Domain", 295 dapim, 3,364 segments, 148,282 tokens;
counts and the punctuation question are in the prompt). The shelf serves
a work id by id from the corpus lane's sealed artifacts; the gate serves
no unsealed work. Expect from Moses: the staged workspace (compact
shards, binding seals, identity bridge) with the new work's id.

1. `node tools/check-workspace-staged-v1.mjs --workspace "<staged root>"`
   must pass (it reads data/workspace-manifest-v1.json).
2. `node tools/mishkan-serve-v1.mjs --workspace "<staged root>"` serves
   the shelf; confirm the new id appears in the serve-gate receipt
   (data/serve-gate-receipt-v1.json lists the served works; today 39).
3. Build its zone the way the 39 are built (build-zone.mjs; look at how
   `data/zones/<book>.bin` is produced in the pipeline manifest, step
   list `node tools/pipeline-manifest-v1.mjs --stamp <date>` prints the
   tools build.sh calls). Then the gate: `node tools/check-c0-refusals-v1.mjs --write`
   (C0 refusals are the frame's lines; the five punctuation-only tokens
   and the modern punctuation will need a line or a ruling: if it refuses,
   that is a finding for the owner, not something to force).
4. Re-pin: `node tools/emit-zone-store-v1.mjs`.
5. Checks that must stay green on a new work: check-zone-store,
   check-store-pinned, check-page-agrees-with-store, check-scope-derived,
   check-nothing-hand-typed, check-nothing-hard-wired, then the page
   suite in step 7 against `zone.html?b=<new id>`.
6. The door and the book page follow from the build (step 7); a work
   with no dictionary rows will open cards that say so (rule 0, absence).

### Ask 6 · The 88 shards 55..ac of route store 7d3e04a9d270

Expect: the 88 shard files and their declared counts (430 rows; reader
visible: 430 M14 readings). Land them into data/route-store/shards/,
then `node tools/emit-store-manifest-v1.mjs` and
`node tools/check-store-continuity-v1.mjs`: C0 must turn green ("774,277
declared, 773,847 held" becomes equal) and C1/C2/C5 stay green; the
witness record data/store-before-strike-witness-v1.json's
`held_by_the_shards_beside_it` / `why_they_differ` get the ruling filled
(`ruled: "landed <date>"`). Then re-project the 39 zones (step 6 below),
because the 430 rows add readings.

### Ask 1 · Piece places (dictionary store v1.3)

`node tools/bake-dictionary-store-v1.mjs --from <build>/dictionary-store-v1.3 --relay FOR-ELIJAH-vNN.md --build <R2 prefix the relay names>`
Then check-dictionary-toggle, check-reading-language (L1-L3), the
concordance checks (grep tools for "concordance"). The page reads
data/dictionary-store/index.json's `store` string; if the schema name
changed, grep zone.html for the old one.

### Ask 2 · Hebrew defined by Hebrew, and ask 5 · the span record's own reading (span store v2.1)

`node tools/bake-span-store-v2.mjs --from <build>/span-store-v2.1 --relay FOR-ELIJAH-vNN.md`
(the v1.4 hold flags are documented in the tool's head; a v2.1 build
should need none). Then check-span-store (grep tools for "span-store"),
check-compspan-coverage, check-run-cards, check-hud-runs. Ask 5's own
reading becomes an R pill on the span's card: the card code that draws
`.b-read` pills for a run is in zone.html near "renderReadings"; the
rule for the pill is in the prompt (ask 5).

### Ask 4 · Pieces with no English (piece store v2.1)

`node tools/bake-piece-store-v1.mjs --from <build>/piece-store-v2.1 --relay FOR-ELIJAH-vNN.md`
Then check-piece-store (grep tools for "piece-store"), check-blanks-pill
(the no-blanks pill reads the pieces' signs), and the blank-pieces ruling
file BLANK-PIECES-FOR-RULING-2026-10-23.md: the owner ruled on 23 Oct
(STATUS, "The owner's answers to the ten", items 1 and 2): print the sign
the source prints under no blanks, no symbolic marks as standing
readings.

### Ask 3 · The meta-file map

A review, no code: read Moses's answer against
wip/2026-10-18/meta-file-map and write the agreement or the differences
in STATUS. R2 deletion stays ON HOLD until the owner names it.

## 3. After any zone-affecting change: re-project the 39

```
cd $S/ghp/reader
for b in $(ls data/span-store/*.json | xargs -n1 basename | sed 's/.json//'); do
  node tools/regloss-zone.mjs --zone data/zones/$b.bin --out /tmp/rg-$b.bin --stamp <date> && mv /tmp/rg-$b.bin data/zones/$b.bin
done
node tools/emit-zone-store-v1.mjs
node tools/check-c0-refusals-v1.mjs --write     # build-front-door refuses otherwise
```
Then the zone suite: orders-registered-together, witnessed-order,
zone-single-pass-receipts, store-pinned, zone-store, carrier-survives,
page-agrees-with-store, scope-derived, nothing-hand-typed,
nothing-hard-wired, proper-name, names-pill.

## 4. Build

```
cd $S/ghp/reader
node tools/build-front-door-v1.mjs --history data/none.json \
 && node tools/emit-lane-state-v1.mjs && node tools/emit-ledger-index-v1.mjs \
 && node tools/pipeline-manifest-v1.mjs --stamp <date> && cp -a deploy-root/. ..
node tools/build-toggle-design-v1.mjs      # only if a switch changed (photographs the rail; needs 8913)
```

## 5. Gate against the live build

`node tools/check-same-product-v1.mjs --old http://127.0.0.1:8914 --new http://127.0.0.1:8912`
S1 (lines and chips on 18 sampled pages under every switch) and S2 (the
first cards' pills) must be "all the same" except for what the delivery
changes on purpose; read every difference it prints and name it in the
notes.

## 6. The page suite, one browser at a time

Template `$S/hudcolor/suite8.sh` (set `-ge 1`, set OUT, set CHECKS).
Always: reading-rows (R1-R3), usable-card, kq-lead-follows-switch
(K1-K9), run-card-forms, card-opens-on-the-line, line-follows-card,
menu-switches, reset-pill, blanks-pill, names-pill, hud-toggles,
word-address, front-door-opens-title, selection, source-suggested,
page-fetches. check-kq-presentation skips here (no fixture bundle);
exit 3 is a skip, not a red.

## 7. Commit and ship

```
cd $S/ghp
git diff | grep "^+" | python3 -c "import sys; print(sum(1 for l in sys.stdin if any('֐'<=c<='׿' for c in l)), 'typed Hebrew lines')"   # must be 0
git diff | grep -E "bcb5d122|eb0dc5bd|15319bb62e16|R2_SECRET|AKIA"                                                                  # must print nothing
git add <source files>; git commit -F <message>        # source first, its own message
git add -A; git commit -F <build message>               # "Build: book pages, engine, lane state, ledger index and manifest ..."
git push origin piece-store-2026-10-17:main
cd $S/gp && git fetch -q origin main gh-pages && git checkout -q --detach origin/gh-pages \
 && git merge --no-edit -q -m "gh-pages follows main" origin/main && git push origin HEAD:gh-pages
```
Never commit zone-*-tmp.html or zone-geo-*.html. "push negotiation
failed; proceeding anyway" from git is harmless.

## 8. Verify live, then the notes

The GitHub workflow live-check.yml runs on page_build (about a minute
after the gh-pages push) and compares the manifest, the lane state, a
chapter page's pins and its bin's sha256, and the door, byte for byte;
read it with the GitHub actions tools (workflow `live-check.yml`,
`conclusion: success`). Then a STATUS section ("Live: main X (the change
Y), gh-pages Z", what came from Moses, counts, checks, what is open),
commit and push the notes.

## 9. What is open on the owner's side (do not decide these)

Bins' host for the other works; bin v2 schema version (with Moses);
an archive repository to shrink GitHub's size; chain pages for all 39
(after bin v2); whether the no-names switch comes back to the row
(parked on the rail and /toggles/ since 23 Oct); the "makes sense" and
other named toggles (placeholders on /toggles/ until the owner names
one); the three-row target for the readings on the smallest windows.
