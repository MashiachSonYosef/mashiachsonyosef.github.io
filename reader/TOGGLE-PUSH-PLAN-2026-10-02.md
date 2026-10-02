# the toggle push suite · runbook (2026-10-02)

written 2026-10-02 for a later session that has R2 credentials, this directory, and the instruction "run the suite". it is built only on what five read-only reports of this date cite and on lines opened in this tree the same day; where the tree does not say, the line says so and the question is listed in section 9. nothing here chooses: the driver proposes and prints, the owner rules.

the three files of the suite, all under `reader/`:

- `TOGGLE-PUSH-PLAN-2026-10-02.md` — this runbook
- `tools/push-toggles-v1.mjs` — the driver, rule `toggle-push-rule-v1-the-driver-proposes-and-prints-and-never-chooses`: the plan, the inventory, the fetch
- `data/toggle-queue-v1.json` — the queue, basis `TYPED_IN_THE_OPEN`: the one place a delivery is named before a receipt can name it; every entry says where its values were read

every command below is run from `reader/`, the directory this file is in. `<slug>` is a book's slug as `data/zones/<slug>.bin` spells it; `<stamp>` is the day's date, YYYY-MM-DD, given on every command and never read off the clock.

## 1 · what a toggle is here

a toggle is a ledger of Moses's, counted on R2, projected over a zone's own positions by a tool of this lane, re-glossed so the line can answer under the new keys, re-pinned on the shelf, drawn as a row of the rail, and ruled on by the owner — the six steps of `tools/TOGGLE-PIPELINE-v1.md` (the table at lines 9-16: 1 count, 2 project, 3 regloss, 4 shelf, 5 rail, 6 ruling).
the join is verse by verse, in order, proved by `form_key == k` at every position, or the whole verse is held and counted on the receipt, never patched around (lines 20-30).
a row whose layer is not on the zone is drawn dead with what it waits on, never dropped (line 15); a zone that changes without a new pin is refused by the reader, by design (line 14).
the ruling is recorded on the projection's receipt, at `emitted_from.toggles.<name>.rulings_owed`, and only then does the row go live (line 16); until then the suite stops in front of the owner.

## 2 · before the first command

- where: `cd reader` of the checkout; every path below is relative to it. this worktree stands at a detached HEAD equal to `origin/main` as of writing (commit 2bcfa4a6f); see section 9 before committing.
- the stamp: pass `--stamp <stamp>` to the driver and to every projector.
- credentials: the four variables `tools/restore-shelf-from-history-v1.mjs:85-86` reads — `R2_ACCESS_KEY_ID` or `AWS_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` or `AWS_SECRET_ACCESS_KEY`, `R2_ENDPOINT` (the full https url; the host is taken from it), `R2_BUCKET`. the sources write the bucket as `mishkan` (the `r2:mishkan/...` form at `tools/TOGGLE-PIPELINE-v1.md:11`); the driver reads it from `R2_BUCKET` and says so when the two names differ. the keys are read, never printed; the driver's first lines name which of the four are set. on the machine this was written on, `R2_ENDPOINT` was absent, so the inventory did not run here.
- the server, for the browser checks: `python3 -m http.server 8899 --directory .` in `reader/`, which is how `tools/run-all-checks.sh:74-77` starts one when the port does not answer.
- the browser: `tools/playwright-v1.mjs` finds playwright or the browser checks SKIP (exit 3) by name; a skipped check is counted apart and named, never as a pass (`tools/run-all-checks.sh:118-122`).
- the driver, three modes:
  - `node tools/push-toggles-v1.mjs --stamp <stamp>` — the plan: the queue against the shelf, per toggle: which zones carry it, which do not, what it needs, the commands in order, the stop line. needs no credentials.
  - `node tools/push-toggles-v1.mjs --inventory` — lists the prefixes the queue names and diffs the listing against the queue (section 3).
  - `node tools/push-toggles-v1.mjs --fetch <id>` — downloads one delivery into `build/ledgers/<id>/` and holds it to its `SHA256SUMS` (section 3).
  - what it never does: project, regloss, pin, edit `zone.html`, choose a default, mark a row live, record a ruling, write to R2. exit 0 unless the queue is malformed, the zone directory is missing, or a verification fails (exit 1); a usage error is exit 2.
- the baseline, measured 2026-10-02: 39 zones on disk, all 39 served, every one carrying the headword, lattice, sources, witnessed-order and piece-gloss layers and a lattice and a volume sidecar; `data/zone-store-v1.json` pins 3,594 bins of which 3,448 are absent since the reset of 2026-09-23 (`tools/restore-shelf-from-history-v1.mjs:10-14`); `base` is null (the shelf beside the door). `tools/check-sidecars-all-named-v1.mjs` S4 is red today ("the receipt counts 3480 on the shelf and the shelf holds 39"); `tools/check-ledger-declared-v1.mjs`, `tools/check-nothing-hard-wired-v1.mjs`, `tools/check-no-import-side-effects-v1.mjs`, `tools/check-nothing-hand-typed-v1.mjs` and `tools/check-docs-name-what-is-here-v1.mjs` are green with the three files in place.
- the manifest: `PIPELINE-MANIFEST.md` was read on 2026-09-28 with 111 rules; the driver declares a 112th, unguarded like the three it already prints, so `tools/check-manifest-prints-unguarded-v1.mjs` L5 reads STALE until the manifest is regenerated (section 7, step 5).

## 3 · the inventory

    node tools/push-toggles-v1.mjs --inventory

what it does: a signed `GET /<bucket>/?list-type=2&prefix=<prefix>` — ListObjectsV2, paged by continuation token — signed exactly as the GET in `tools/restore-shelf-from-history-v1.mjs:92-109`: SigV4, region `auto`, service `s3`, path-style, `x-amz-content-sha256: UNSIGNED-PAYLOAD`, with a canonical query string added. no tool in the tree listed a prefix before this, and the tree references no R2 command line (no `aws`, `rclone` or `wrangler` anywhere), so the list call is the driver's own and is the minimal one. it lists `moses-ledgers/` (`r2.ledgers_root` in the queue, or `--prefix <p>`) and every queue prefix not under it (today: `moses-parse-source-and-declaration-v1/declaration-store-v7/`).

what it prints, per delivery folder: object count, size, and a verdict — the queue entries it belongs to, with status; "not a toggle" for the prefixes the queue lists under `known_prefixes_that_are_not_toggles` (the reseal streams, the frame); or UNKNOWN. an unknown folder under `moses-ledgers/toggle-builds-v1/` is a toggle Moses counted that this lane has not projected: section 4.7. it also says whether `moses-ledgers/toggle-builds-v1/README-v1.md` is there (one row per toggle with the ruling it still needs, `tools/TOGGLE-PIPELINE-v1.md:11`), which known prefixes hold nothing, and — for the entries whose prefix is `unknown` (the witnessed order, the joined runs, the piece gloss) and for `qere-ketiv-v1.json` — where in the listing their file names turn up, if anywhere.

what a delivery folder looks like, as the sources describe the ones that have landed:

- a per-position ledger: one gzipped CSV with a header row, one row per position — `book, ref, i, j, surface, form_key, ...` (`tools/TOGGLE-PIPELINE-v1.md:11`); the headword's is `word-lemma-v1.csv.gz`, split on bare commas (`tools/project-toggle-headword-v1.mjs:72-83`)
- the lattice: three files per book, `positions-<slug>-v12.jsonl.gz`, `routes-<slug>-v12.jsonl.gz`, and the lane's receipt `lattice-<slug>-v12.json` carrying both files' sha256 (`tools/project-lattice-v12-v1.mjs:100-113`)
- V: three count tables, the reverse index, `SHA256SUMS.txt`, `V-SERVING-CONTRACT-v2.md`, `v-ledger-v2.json` — 61 objects (`data/v-ledger-posture-v1.json:9-15`)
- the declarations: a `fix/` directory with `MANIFEST-declarations-v6.json` pinning the files, the contract, the vocabulary and three jsonl files (`tools/project-declarations-v1.mjs:104-108`, `:238-245`)

how a delivery is verified:

1. `node tools/push-toggles-v1.mjs --fetch <id>` writes each object only when its length is the listing's `Size` (as the restore writes a bin only when it is its pin), then looks for `SHA256SUMS` or `SHA256SUMS.txt` at the delivery's root and holds every listed file to it — `sha256sum -c` done in node, the form `data/v-ledger-posture-v1.json:15` records for V. a mismatch, or a listed file that is missing, is REFUSED with exit 1, and nothing in that folder is a delivery.
2. a delivery with no sums file is printed UNVERIFIED by a sums file, with every object's sha256 measured; the verification is then the projector's own pin: the lattice projector refuses `LATTICE_SHA_MISMATCH` against its receipt (`tools/project-lattice-v12-v1.mjs:109-113`); the declarations projector re-hashes every pinned file against its manifest (`LEDGER_PIN_FAILED`, `LEDGER_BYTES`); the headword ledger's measured sha256 must equal `emitted_from.toggles.headword.source.sha256` on a zone that carries it, which the driver prints in plan mode (read off the zone, never typed).
3. the staging directory is `build/ledgers/<id>/`; `build/` is gitignored scratch (the tree's `.gitignore`, lines 3-8) and nothing of a delivery is copied into `data/`. `--fetch <id> --dry` lists what would land and writes nothing.

## 4 · the candidates, in the order to attempt them

each section: the rail row(s) it feeds; the prefix on R2; the projection tool and its command per zone; regloss and re-pin in order; the receipt to read and the `rulings_owed` it carries; the guards; the stop line. the queue carries the same facts, field for field, and the driver prints them with what it reads off the zones.

### 4.1 the declarations ledger (the sources branch)

- feeds: `sources` — the branch under each source's switch.
- prefix: `moses-parse-source-and-declaration-v1/declaration-store-v7/` (`tools/project-declarations-v1.mjs:241`); not under `moses-ledgers/`.
- status: served. landed 2026-09-19 as `data/route-store/source-declarations-v1.bin` (61,389 bytes), pinned by `data/route-store/store-manifest-v1.json`; 37 stems, 163 branches (`data/source-declarations-receipt-v1.json`). the panel reads it (the note "THE SOURCE'S OWN DECLARATIONS, on demand" in `zone.html`), and `tools/TOGGLE-PIPELINE-v1.md:247-257` records it as the sixth one through.
- what is left: nothing to fetch, nothing to project. two strings in the tree still say the ledger has not shipped: `branch.waits`, which `tools/regloss-zone.mjs:268` bakes onto every zone's `emitted_from.toggles.sources`, and the comment beside the source switches in `zone.html` ("waits on the corpus lane's declarations ledger and is drawn dead until it lands"); `tools/TOGGLE-PIPELINE-v1.md:163-165` says the same. all three are older than the landing.
- tool and command, for a re-projection from a new delivery only:

      node tools/push-toggles-v1.mjs --fetch declarations-branch
      node tools/project-declarations-v1.mjs --ledger build/ledgers/declarations-branch --store data/route-store --out data/route-store/source-declarations-v1.bin --receipt data/source-declarations-receipt-v1.json --stamp <stamp>
      node tools/emit-store-manifest-v1.mjs --store data/route-store

  pass `--out`: the tool's own default is `data/source-declarations-v1.bin` (`tools/project-declarations-v1.mjs:105`), not the landed path. pass `--stamp`: without it this one tool reads the clock (`:106`). no regloss and no zone re-pin: the sidecar sits beside the store, not on a zone; the store manifest is its pin.
- receipt: `data/source-declarations-receipt-v1.json` (no `rulings_owed`; `what_this_does_not_say` instead); on the zones, `emitted_from.toggles.sources.rulings_owed` says "none for the switch itself".
- guards, with the server up:

      node tools/check-declarations-branch-v1.mjs
      node tools/check-store-pinned-v1.mjs
      node tools/check-source-switch-v1.mjs

- stop: here. the branch stands on a landed, pinned sidecar. the stale `branch.waits` is a line of `tools/regloss-zone.mjs`; changing it means a regloss of all 39 zones and 39 re-pins. put that in the report as a proposal; do not run it.

### 4.2 the witnessed order ledgers

- feeds: `order/witnessed_same_place`, `order/witnessed_entry`, `order/witnessed_entry_and_lists` — three positions of reads first, live where the book carries the column.
- prefix: unknown. the sources name the lane and the build (`moses-orders-rebase-v2.1`, `orders-witnessed-v2.7`; `tools/bake-witnessed-order-v1.mjs:8`) and no `r2:` path. the inventory searches the listing for the six file names.
- status: served. baked 2026-09-25 on all 39 (`emitted_from.witnessed_order`, with each column's `order_sha256` and `m_sha256`); the owner selected the order on 2026-09-25 (`tools/bake-witnessed-order-v1.mjs:4`).
- delivery: six JSON files per book — `witnessed-<stem>-v2.7-<slug>.json` and `witnessed-<stem>-m-v2.7-<slug>.json`, stems `same-place`, `entry`, `entry-and-lists` (`tools/bake-witnessed-order-v1.mjs:35-39`).
- tool and command, only for a zone that does not carry the receipt (none today):

      node tools/push-toggles-v1.mjs --fetch <the prefix the inventory shows>
      node tools/bake-witnessed-order-v1.mjs --dir build/ledgers/<its last segment> --zone build/lattice/<slug>.bin --stamp <stamp>

  the bake is in place on `--zone`, after the lattice projection and BEFORE regloss on that zone: regloss keeps a witnessed column's credit as shipped only where `emitted_from.witnessed_order.columns` already names it (`tools/regloss-zone.mjs:187-192`). then regloss and re-pin as in section 6.
- receipt: `emitted_from.witnessed_order` — `rule, baked_on, baked_by, columns{... shipped, baked, cut_to_first_reading, refused}`; no `rulings_owed` field.
- guards, with the server up:

      node tools/check-witnessed-order-v1.mjs --zone <slug> --dir build/ledgers/<its last segment>

  W2 compares the baked column to the shipped files when `--dir` holds them; its default dir is `build/witnessed-v2.7` (`tools/check-witnessed-order-v1.mjs:41`), so pass `--dir`.
- stop: no ruling owed. the stop is the pin: do not re-bake a zone that carries the columns.

### 4.3 strict pointing

- feeds: `masorah/only` — the strict sub-choice of "only this pointing".
- prefix: `moses-ledgers/lattice-v12/`, the lattice's own delivery; nothing separate. the strict leader `o.s` (rows graded VOWEL_MATCH only) is baked beside the lenient `o.l` by `tools/project-lattice-v12-v1.mjs:324-325` into `<slug>.lattice.bin` (`first_under.s`, `grades[surface].o.s`) on all 39; the driver reads `first_under.s` off each sidecar and counts them.
- status: waiting — on the owner. "Strict (`o.s`, VOWEL_MATCH only) is baked beside it ... not yet on the rail" (`tools/TOGGLE-PIPELINE-v1.md:101-103`); "Still the owner's: the default (ships at keep), strict or lenient" (`:244-245`); "THE DEFAULT IS THE OWNER'S RULING AND IS NOT MADE" (`:124-125`; the note above `MASORAH_KEY` in `zone.html`).
- tool: none needed; nothing to fetch, nothing to project. what is missing is a position on the `masorah` row of `zone.html`'s `TOGGLES` and the ruling.
- receipt: no receipt field carries this ruling; `emitted_from.toggles.lattice.rulings_owed` names the welded-form and licence_class questions only.
- guard after a ruling: `node tools/check-masorah-toggle-v1.mjs` — M1 asserts exactly three positions; a fourth changes M1, which is the owner's wording to rule on.
- stop: before anything. the ruling — strict or lenient for "only", and whether the default stays at keep — is written as a dated record first.

### 4.4 the joined runs (the maqaf row)

- feeds: `maqaf` — `live: () => false` in `TOGGLES`, waiting on "the joined runs carried per book — the zones hold none today".
- prefix: unknown. `tools/TOGGLE-PIPELINE-v1.md:328` names `maqaf-v1.json` and `maqaf-compounds-v1.jsonl.gz` and no prefix; the inventory searches for both names.
- status: waiting — "A RULING FIRST, and it is the owner's: suppress WELDED where nothing matches the vowels (1,041 of 1,311)?" (`:328-330`). the lattice's `pieces` of joined words stay unprojected until it (`:80`; `tools/project-lattice-v12-v1.mjs:72-73`). this is not the parts band (`:332-336`), which is live.
- tool: none yet. after the ruling: a per-position projector by the generic recipe (section 4.7) carrying the joined runs per book, keyed on `j` and never on `i`, which repeats across the parts of a maqaf compound, 42,627 times over the 39 books (`:363-364`). the four forms a run can take are already enumerable from the store (`tools/weld-forms-v1.mjs:11-18`; `tools/regloss-zone.mjs` records them as `run_forms`), so what the row waits on is a carried layer and the ruling, not a store change.
- receipt: `emitted_from.toggles.lattice.rulings_owed` — "the welded-form ruling is still owed and is a separate question from these affix pieces: it governs the maqaf toggle, which nothing here touches" (`tools/project-lattice-v12-v1.mjs:418`).
- guards that hold what stands today, with the server up: `node tools/check-maqaf-pair-drawn-v1.mjs http://127.0.0.1:8899/zone.html?b=<slug>` (the run is two C0s, one card); `node tools/check-lattice-parts-in-card-v1.mjs`.
- stop: before anything. nothing is fetched, projected or wired until the ruling is a dated record.

### 4.5 the V word layer

- feeds: no rail row. V reaches the card's counts panel (the `v-volume-rule-v1` note in `zone.html`); the word layer would be a line on the card.
- prefix: `moses-ledgers/v-ledger-v2/` — the same 61-object delivery as the counts; the anchors are `v-reverse-index-v2.jsonl.gz` (`tools/verify-v-ledger-v2-v1.mjs:30-31`).
- status: waiting — on the owner and on the corpus lane. `data/v-ledger-posture-v1.json:64-71`: the owner owes whether clause 13 becomes the rule (strict or conservative, or RULE6: 21,564 / 21,686 / 21,657 word-anchored positions) and whether the word layer is ever served as a finding that names a work without opening it; the corpus lane owes the text of the fourteen word-anchoring works, of which this lane holds none. the counts layer shipped without waiting on either, and nothing served moves with the ruling (`:53`; `tools/project-v-volume-v1.mjs:34-42`).
- tool: none yet. every `<slug>.volume.bin` says `the_word_layer_is_not_carried`.
- receipt: `data/v-volume-receipt-v1.json` has no `rulings_owed`; the owed rulings are at `data/v-ledger-posture-v1.json` under `what_is_owed_and_by_whom`.
- guard that can run meanwhile: `node tools/verify-v-ledger-v2-v1.mjs --ledger build/ledgers/v-counts --lattice build/ledgers/lattice-v12` — the counter-verification of the anchors; SKIPs by name without both directories (`:49-53`).
- stop: before anything.

### 4.6 the Ben Yehuda pipeline

- feeds: no rail row; the card's Hebrew-on-Hebrew panel from a `<slug>.hoh.bin` sidecar.
- prefix: `moses-ledgers/ben-yehuda-v1/`, proposed and never delivered (`tools/BEN-YEHUDA-PIPELINE-v1.md:44`).
- status: proposed, and withdrawn 2026-09-13 by the owner's ruling `no-ben-yehuda-dictionary` (`data/serving-rulings-v1.json`): `data/ben-yehuda-posture-v1.json` declares no served volume and `delivery.delivered` false; `tools/build-hoh-sidecar-v1.mjs` is inert and has never written a sidecar. Project Ben-Yehuda, the text source, is a different thing and untouched.
- stop: do not attempt. if the inventory ever shows objects under the prefix, print them in the report and stop.

### 4.7 an unknown new `toggle-builds-v1/<toggle>/` folder — the generic recipe for a per-position ledger

- feeds: a new `TOGGLES` row, which is step 5 and an edit to `zone.html` the owner approves; nothing in the suite wires it.
- prefix: `moses-ledgers/toggle-builds-v1/<toggle>/` (`tools/TOGGLE-PIPELINE-v1.md:11`).
- the recipe, in order:
  1. `node tools/push-toggles-v1.mjs --inventory` — the folder prints UNKNOWN to the queue.
  2. `node tools/push-toggles-v1.mjs --fetch moses-ledgers/toggle-builds-v1/README-v1.md` — one object, landing at `build/ledgers/toggle-builds-v1/README-v1.md`; read the toggle's row: the ruling it still needs.
  3. `node tools/push-toggles-v1.mjs --fetch <toggle>` — a bare name resolves under `moses-ledgers/toggle-builds-v1/`; the delivery lands in `build/ledgers/<toggle>/` and is held to its sums as section 3 says.
  4. add an entry for it to `data/toggle-queue-v1.json`, typed in the open like the others: `feeds` (the row it will be), `r2_prefix`, `delivery_shape` (read off the file's header row), `projection_tool` ("none yet: ..." until step 5 is written), `status: candidate`, `waits_on` and `ruling_what` from the README row, `ruling_owed: true` until the row says otherwise, `carried_by: { kind: zone_field, path: emitted_from.toggles.<name> }`, and `cites`.
  5. write `tools/project-toggle-<name>-v1.mjs` by copying `tools/project-toggle-headword-v1.mjs` (per position, no sidecar) or `tools/project-lattice-v12-v1.mjs` (per position, with a sidecar), as `tools/TOGGLE-PIPELINE-v1.md:359-370` says: the verse-by-verse join proved by `form_key` at every position, a verse that does not prove held whole and counted; where the ledger carries `i` and `j`, prove `j` distinct and ascending and never key on `i`; the receipt at `emitted_from.toggles.<name>` with `rule, source (path, bytes, sha256, ledger path on R2, witnesses, candidate_only), join, projected_on, projected_by, counts, what_the_word_carries, rulings_owed`; the exemption merge so `emitted_from.post_build.wrote` gains `emitted_from.toggles` (the field the receipts check reads, `tools/check-toggle-projection-v1.mjs:64-65`). the house rules for a tool: a rule id of its own in a `// Synthesis lane · <name>-rule-v1-...` comment on line 2 (`tools/pipeline-manifest-v1.mjs:42` finds it), a `// LEDGER: -` line with its reason under it (`tools/check-ledger-declared-v1.mjs`), no Hebrew glyph in a string literal (`tools/check-nothing-hand-typed-v1.mjs`), no book name or work id typed, every input a flag (`tools/check-nothing-hard-wired-v1.mjs`).
  6. per zone:

         node tools/project-toggle-<name>-v1.mjs --zone data/zones/<slug>.bin --ledger build/ledgers/<toggle>/<file> --stamp <stamp> --out build/toggles/<slug>.bin
         node tools/regloss-zone.mjs --zone build/toggles/<slug>.bin --out data/zones/<slug>.bin --stamp <stamp>

     the projector reads a zone that already carries every served layer and copies it through; regloss re-projects the store over the zone's keys, now including the toggle's, and keeps the witnessed columns' credit as shipped.
  7. re-pin, the guards, the receipt, the stop — section 6. a check for the new layer, `tools/check-<name>-v1.mjs` copied from `tools/check-toggle-projection-v1.mjs` and naming the new rule in its `GUARDS:` line, is what makes the rule guarded; until it exists the manifest prints the rule UNGUARDED, which is the truth and not a failure.
- receipt: `emitted_from.toggles.<name>.rulings_owed`, as the projector writes it from the README row.
- stop: after the receipt prints its `rulings_owed` and before the `TOGGLES` entry: "put the row in front of the owner before wiring anything the ruling could change" (`tools/TOGGLE-PIPELINE-v1.md:368-370`). `data/toggle-wording-proposals-v1.json` is where proposed `lab`/`why` text waits for the owner; a proposal is not a row.

## 5 · the served layers, for a zone rebuilt after today

a projection is typed on the zone under the single-pass exemption and expires with the zone's rebuild (`emitted_from.post_build.expires` on every served zone); a rebuilt zone carries none of these until they are run again, in this order, each reading the previous one's output:

1. headword — `node tools/project-toggle-headword-v1.mjs --zone data/zones/<slug>.bin --ledger build/ledgers/headword/word-lemma-v1.csv.gz --stamp <stamp> --out build/toggles/<slug>.bin` (`--fetch headword` first; the receipt pins the ledger by bytes and sha256, and the measured sha256 must equal `emitted_from.toggles.headword.source.sha256`). guard: `node tools/check-toggle-projection-v1.mjs`.
2. lattice — `node tools/project-lattice-v12-v1.mjs --zone build/toggles/<slug>.bin --lattice build/ledgers/lattice-v12 --stamp <stamp> --out build/lattice/<slug>.bin --sidecar data/zones/<slug>.lattice.bin --store data/route-store` (`--fetch lattice-v12` first; needs the headword layer, since `hg` reads `w.h`). pass `--store`: its default is derived from a `--zone` path under `data/zones/` (`tools/project-lattice-v12-v1.mjs:116-117`), which this one is not; pass `--sidecar`: its default lands beside the input zone (`:99`). guards: `node tools/check-lattice-projection-v1.mjs`, `node tools/check-lattice-orders-v1.mjs`, `node tools/check-masorah-toggle-v1.mjs`, `node tools/check-pointing-grade-v1.mjs`, `node tools/check-lattice-parts-in-card-v1.mjs`.
3. witnessed order — section 4.2, in place on `build/lattice/<slug>.bin`, when the delivery is on disk; otherwise say so in the report and go on (the three positions stay dead on that book, with their reason).
4. regloss — `node tools/regloss-zone.mjs --zone build/lattice/<slug>.bin --out data/zones/<slug>.bin --stamp <stamp>`. writes `emitted_from.toggles.sources` (the source switches), the licence columns, `gloss_m`. guards: `node tools/check-source-switch-v1.mjs`, `node tools/check-carrier-survives-v1.mjs`.
5. piece gloss — `node tools/project-piece-gloss-v1.mjs --col build/ledgers/<its folder>/piece-gloss-v2.jsonl.gz --stamp <stamp> --zones data/zones` — in place on EVERY served zone at once (39 re-pins); there is no one-zone form. prefix unknown (section 9). the zones' receipt names the file `piece-gloss-v2.jsonl.gz`; the tool's run line says `piece-gloss-v1.jsonl.gz` (`tools/project-piece-gloss-v1.mjs:42`).
6. V counts — `node tools/project-v-volume-v1.mjs --ledger build/ledgers/v-counts --stamp <stamp> --zones data/zones --out data/zones --only <slug>` (`--fetch v-counts` first; `SHA256SUMS.txt` is in the delivery). without `--only` every served book's sidecar is rewritten; with it, the receipt `data/v-volume-receipt-v1.json` counts that book alone. guards: `node tools/check-v-volume-projection-v1.mjs`, `node tools/check-v-volume-in-card-v1.mjs`.
7. the source corpus — a record, not a zone, and only when a new delivery lands: `node tools/emit-source-corpus-v1.mjs --ledger build/ledgers/source-corpus/source-corpus-v1.json --stamp <stamp>` after `--fetch source-corpus` (prefix `moses-ledgers/toggle-ledgers-v1/`, not `toggle-builds-v1`; `tools/emit-source-corpus-v1.mjs:30,48`). guard: `node tools/check-source-corpus-v1.mjs --ledger build/ledgers/source-corpus/source-corpus-v1.json`.

then re-pin (section 6, step 4) — the zone and every sidecar it has.

## 6 · the per-toggle loop, as the driver prints it

    [ ] 1. fetch     node tools/push-toggles-v1.mjs --fetch <id>   → build/ledgers/<id>/, held to SHA256SUMS or every sha256 printed
    [ ] 2. project   the entry's own command, per zone; output under build/, never over data/zones/<slug>.bin (the two in-place tools excepted: bake-witnessed-order-v1, project-piece-gloss-v1)
    [ ] 3. regloss   node tools/regloss-zone.mjs --zone <the projected zone under build/> --out data/zones/<slug>.bin --stamp <stamp>
    [ ] 4. re-pin    node tools/emit-zone-store-v1.mjs ; node tools/emit-zone-shipment-v1.mjs ; node tools/emit-store-manifest-v1.mjs --store data/route-store
    [ ] 5. guards    the entry's checks, from reader/, with python3 -m http.server 8899 --directory . up
    [ ] 6. read      emitted_from.toggles.<name>.rulings_owed on one re-projected zone; print it into the report
    [ ] 7. stop      the TOGGLES entry (step 5 of the pipeline) and the ruling (step 6) are the owner's; propose the wording, write nothing

`tools/emit-zone-store-v1.mjs` carries the standing `base` forward (null: the shelf beside the door) and takes no flag here — `--base` is the owner's ruling to move the shelf and is not part of this suite. `tools/emit-zone-shipment-v1.mjs` writes `build/zone-shipment-v1/` for the ferryman and refuses `PINNED_BUT_ABSENT` while any pinned bin is missing from disk; with 3,448 absent today it will refuse — section 9.

## 7 · the deploy tail

after the last toggle's loop, once:

1. the gate: `node tools/check-c0-refusals-v1.mjs --write` — the door refuses a zone whose bytes are not the bytes the gate judged (`tools/build-front-door-v1.mjs:99-102`), so the receipt is re-written over the re-pinned shelf. section 9 says what the receipt forgets.
2. the door: `node tools/plan-build-v1.mjs --out build/build-plan-v1.json --tsv build/build-plan-v1.tsv`, then `node tools/build-front-door-v1.mjs --zones data/zones --out deploy-root --atlas data/corpus-atlas-v1.json --physical-handoff data/bezelal-front-door-counts-handoff-v1.json --count-bindings data/front-door-three-count-bindings-v1.json` (`build.sh:210-213`).
3. deploy-root to the root: no sync script exists in the tree; on 2026-10-02 all 985 files of `deploy-root/` are byte-identical to the files at the same paths under the repository root (`../`), which is the published door (`README.md` at the root: served from `main`). so: copy every file of `deploy-root/` onto the root at the same relative path — `cp -r deploy-root/. ..` — and nothing else; `deploy-root/` itself stays gitignored.
4. the engine stays where it is: `zone.html`, the engine files and `data/` serve from `reader/` beside the door; `build.sh:227` copies `zone.html` into `site/`, which is gitignored and not the published tree.
5. the manifest: `node tools/pipeline-manifest-v1.mjs --stamp <stamp>` writes `PIPELINE-MANIFEST.md` (`build.sh:237`; it needs `build/build-plan-v1.json`, step 2). the driver's rule appears in it, unguarded.
6. the lane state: `node tools/emit-lane-state-v1.mjs` (`build.sh:245`) — the summary `tools/check-lane-state-v1.mjs` re-derives; and the ledger index, `node tools/emit-ledger-index-v1.mjs`, since a new tool declares a `LEDGER:` line.
7. the full suite: `bash tools/run-all-checks.sh` from `reader/` — every `tools/check-*.mjs`, the no-URL ones once, the URL ones against the shape panel; it starts the server if 8899 does not answer and derives the plan first; its exit status is the fail count. a red suite deploys nothing (`SERVE-LAW-2026-08-25.md:49`). the known red and the known skips are in sections 2 and 9; anything else red is a stop.
8. commit: the re-pinned zones are tracked files (modified, so `git add` takes them despite `.gitignore`); a NEW sidecar is `git add -f reader/data/zones/<slug>.<kind>.bin` on purpose (`.gitignore:12-26`); then `data/zone-store-v1.json`, `data/serve-gate-receipt-v1.json`, `data/route-store/store-manifest-v1.json`, `data/lane-state-v1.json`, `data/ledger-index-v1.json`, `PIPELINE-MANIFEST.md`, the root pages, and the three files of this suite. one commit, a plain sentence for a subject as the log has them.
9. push to `main`: `git push origin HEAD:main` — `README.md` at the root says the site lives on `main`; `tools/check-nothing-unlanded-v1.mjs` compares the tree to `origin` `main` and fails while anything on disk is not on the branch. section 9 on the detached HEAD.

## 8 · what must never be done

- never patch a join by hand. a verse that does not prove is held whole and counted on the receipt (`tools/TOGGLE-PIPELINE-v1.md:20-30`); a held verse is a finding, not a fault.
- never re-pin a zone that did not change. the pins are read off the shelf, so a zone not rewritten keeps its pin; and never rewrite a zone for no reason — a re-bake of the witnessed order or a re-run of the piece gloss over zones that carry them is 39 re-pins nobody asked for.
- never touch the Hebrew. "no masoretic markings can be removed from the book page" (the note above `MASORAH_KEY` in `zone.html`); a projection writes beside the word, never in it, and the browser checks hold the section's bytes identical across positions.
- never choose a default. every row's default is the owner's ruling (`tools/TOGGLE-PIPELINE-v1.md:124-125`); the driver prints positions and picks none.
- never mark a row live, never record a ruling, never edit `zone.html` from the suite: a ruling is the owner's, written as a dated record.
- never write to R2: this lane holds a read token; write belongs to the ferryman (`tools/emit-zone-shipment-v1.mjs:14-16`).
- never copy a delivery into `data/`: it stays under `build/ledgers/`.
- never type what a record can say: the queue is the one place a fact is typed in the open, and it says so in its `basis`.

## 9 · open questions, for the running session

1. where on R2 the witnessed-order delivery (`orders-witnessed-v2.7`, six files per book) sits: no source names a prefix, so run `--inventory` and look for the file names it prints.
2. where `piece-gloss-v2.jsonl.gz` (or `-v1`) sits on R2, and which of the two names is the delivered one.
3. where `maqaf-v1.json`, `maqaf-compounds-v1.jsonl.gz` and `qere-ketiv-v1.json` sit on R2, and what their rows look like — nothing in the tree says.
4. whether `R2_BUCKET` for this lane's keys is the bucket the sources write as `mishkan`, or whether the Moses ledgers and the serving lane's backup (`serving-lane/shelf/zones/`) are two buckets; and `R2_ENDPOINT` must be set, which it was not on the machine this was written on.
5. whether `moses-ledgers/toggle-builds-v1/README-v1.md` exists under that exact name — nothing in the tree has read it; the inventory says.
6. whether `tools/check-c0-refusals-v1.mjs --write` over the 39-zone shelf should be run at all: the receipt would then count 39 on the shelf and forget the 2,182 refused and 1,259 not-yet-stamped verdicts of the 3,480-zone shelf, which turns `check-sidecars-all-named-v1` S4 green and the record smaller — restore the shelf first (`tools/restore-shelf-from-history-v1.mjs`, with keys) or accept that; the session's call to put to the owner.
7. whether `tools/emit-zone-shipment-v1.mjs` belongs in the loop while 3,448 pinned bins are absent (it refuses `PINNED_BUT_ABSENT`), or whether the shipment waits for the restored shelf; `tools/emit-zone-store-v1.mjs` and `tools/emit-store-manifest-v1.mjs` do not refuse.
8. whether the stale `branch.waits` string (`tools/regloss-zone.mjs:268`) and the comment in `zone.html` are corrected in this pass, which costs 39 re-pins — propose, do not do.
9. which branch this worktree commits on: it is a detached HEAD equal to `origin/main` at writing, and `main` is checked out in no listed worktree, so either `git switch main` first or `git push origin HEAD:main` from the detached commit.
10. whether the four toggles whose only open item is a ruling (strict pointing, the joined runs, the V word layer, the pairs default) go to the owner as one list or one at a time — the suite stops at each.
11. whether `emit-source-corpus-v1` needs a re-run at all: the record is stamped 2026-09-06 and nothing says a newer `source-corpus-v1.json` was delivered.

## 10 · what in this plan is read, and what is assumed

read: everything cited with a `file:line` above was opened in this tree on 2026-10-02, or is cited as one of the five reports cites it. assumed, and said so where it bears: (a) that a delivery with no `SHA256SUMS` is verified by the projector's own pin — true for the lattice, the declarations and the headword, unproven for an unknown folder; (b) that R2's ListObjectsV2 answers the same SigV4 signing the GET uses, which the first `--inventory` with all four variables set will prove or refuse; (c) that `moses-ledgers/toggle-builds-v1/README-v1.md` exists under that name; (d) that the listing's `Size` is the object's byte length, which the download is held to; (e) that copying `deploy-root/` onto the root is "the sync", from the byte-identity measured today and no script; (f) that the six witnessed files are delivered under one folder per build, as the bake tool's `--dir` expects; (g) that a toggle not named by any entry would arrive under `moses-ledgers/toggle-builds-v1/`, as the pipeline doc says, and not somewhere else.
