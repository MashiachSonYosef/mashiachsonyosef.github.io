# Builder V7: the ninth cut. unfoldingWord's lexicon and Hebrew Wikisource's Strong's, whole (sandbox S/s14; nothing ships)

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`
`N` = `/home/user/mashiachsonyosef.github.io/wip/2026-11-27/fresh-build`

Read first:
1. `N/FRAME.md`: the one rule. A reading stands at a word only where a source puts it there by its own address, or by a bridge a source declares; nothing is matched by bare letters.
2. `N/README.md`, from the top to the end. The cuts so far, the proofs, the house rules.
3. `N/V/hand-back-cut-8.md`: the last data cut and its proofs.

## Why

The fresh build reads eight dictionaries. Two of them were not on hand whole, because their hosts are refused from this machine:
- **unfoldingWord's lexicon (UHAL):** only 151 entry files, from the corpus lane's record file M7.jsonl.
- **Hebrew Wikisource's Strong's:** 6,178 of 8,674 entries, from M14.jsonl and one fetched page.

The card therefore draws no unfoldingWord row under 292,871 words, and says so.

The corpus lane (Moses, relay v223, 27 November) has now put both on its store whole, as received.

**unfoldingWord:**
- the repository zip: `v2/sources/received/uhal/en_uhal-master.zip`, 4,427,005 bytes, sha256 `6b018322cac96c621d453526b7ead67b845fc2d19fc517a68c8babc56c8ddd01`;
- its revision: the commit its host writes in the zip's own comment, `0a2b9bf1e43fc37130e331504b43c69f8c16563c`;
- 8,235 entry files, H0001 to H8674. The zip is whole by its own list, `content/index.md`.

**Hebrew Wikisource's Strong's:**
- nine pages: `v2/sources/received/strongs/SRCEXP-0037-H0-strongs.wikitext.txt.gz` to `…-H8-…`;
- 8,674 entries, each number 1 to 8,674 once;
- each unpacks to its page's received sha256 as listed in `v2/ledgers/all/elijah-asks-2026-11-27/sources-v1/sources-received-files-v1.tsv.gz`;
- no revision is recorded.

The lane's own account is in the letter `v2/letters/moses-elijah-asks-2026-11-27/FOR-ELIJAH-v223.md`, section FB1. A copy is at `S/v223-in/`.

## What you make

In `S/s14` (a git worktree at live main ea6e1ad08e; the fresh build is untracked there):

1. **Fetch from the store, read only.**
   - Use `S/r2.mjs`: `NODE_USE_ENV_PROXY=1 node S/r2.mjs get <dir> <key…>`, with credentials from the environment, never printed.
   - Put each download in its own new directory under `S/s49w/received/`.
   - Check every sha256 against the values above and the lane's tsv. Refuse on any mismatch.
   - Run nothing from inside a download. Python that reads them runs with `-I`.
   - **Never use `S/r2-put.mjs`, never write to the store, never upload anything.**
2. **The fetch script and the pins.**
   - `fetch-place-answers-sources-v1.sh` takes the two as received files from the corpus lane's store, by key and sha256, beside the 17 it fetches from their public hosts.
   - `sources.json` and the pins say so in plain words: the public host of each, why it is not fetched from there (refused from this machine), the store key, the sha256, unfoldingWord's commit, and «no revision recorded» for Wikisource.
   - The three files the fetch could not get before are now got this way. Say which.
3. **Read each source by its own structure, from its own files.**
   - **unfoldingWord:** read the zip's own entry files (Markdown), not the lane's record file.
   - **Strong's (Wikisource):** read the nine pages' wikitext, not the record file.
   - For each, hold every string byte for byte to its file, with each entry's own id, the way the other six dictionaries are read (`place-answers-entries-*-v1.mjs`).
   - Say what structure each file gives: headword, gloss or meaning, senses, references, and anything the card should know.
   - Retire the readers of M7.jsonl and M14.jsonl only once the whole files hold. Say which counts move.
4. **The bridges.**
   - STEP's tag to each source's entry, exact, several or absent, by the source's own number, as for the others. Say how UHAL names a lettered tag (H0518B), if it does.
   - Count the words whose unfoldingWord row was «not on hand» before and is drawn now.
5. **Do not change the card or the page's projection.**
   - Builder H2 is changing the card and maybe the projection in `S/s16` at the same time. **Do not change `place-answers-page-v1.mjs`, `project-place-answers-page-v1.mjs`, `check-place-answers-page-v1.mjs` or `place.html`.**
   - If the page files must change for the new rows to reach the card, write the change as one patch file under `S/s49w/` and say why. The lead reconciles.
   - The card's sentence «Only part of this lexicon is on hand here…» will be wrong after this cut. Say what it should become, but do not change it.

## Prove it

1. `reader/tools/make-place-answers-v1.sh S/s45w/fetched` (with the received files added the way you choose) ends «everything holds». The comparison tool exits 0 with the same 141 known differences.
2. **The entries checks.** Hold the counts: UHAL 8,235 entries; Wikisource 8,674. Every string is byte for byte to its file.
3. **Read by hand.** Read 30 entries of each against the raw file: the first, the last, a lettered tag, an Aramaic entry, an entry the old record file lacked, and others. Write each down.
4. **The bridge counts**, before and after, for both sources.
5. **The eight tree checks**, each alone: check-no-import-side-effects-v1, check-ledger-declared-v1, check-nothing-hand-typed-v1, check-nothing-hard-wired-v1, check-sidecars-all-named-v1, check-build-derived-v1, check-scope-derived-v1, check-k-maqaf-preserved-v2.
6. **The trial page** `reader/place.html` in S/s14 on Ruth 3 and Genesis 1. The unfoldingWord rows draw where the bridge holds, with no page errors. Take two pictures at 412 wide, scale 2, in `S/s49w/shots/`.

## House rules

- No Hebrew in tool string literals; American English; source texts never respelled.
- Downloads in their own new directories; `python3 -I`; run nothing from a download.
- One browser at a time.
- Disk is tight (about 3.3 GB free), so keep logs small.
- No commit, push or ship.
- If a write, a fetch or a command is refused, do not route around it: say so.

## Hand back

Your final message, whole (you cannot write report files; the lead saves it):
- what each file's own structure gives;
- the readers and the bridges;
- each proof with its counts;
- the words newly drawn;
- what the card's sentence should become;
- the patch file, if any;
- what still reads badly or is unclear;
- the paths of everything.
