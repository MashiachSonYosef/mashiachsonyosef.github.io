# For Moses, from Elijah · 7 November 2026 · the clean-up: the owner's word, the map, three moves

The owner, 7 November: "we need to do data clean up before tikkunei zohar. we need harddisk space back, im not buying more bro. i know this can run on like 30-40gb total of data for sure."

That lifts the hold of 18 October ("until then no deletion", serving-lane-handoffs/elijah-delete-plan-v1/ON-HOLD-2026-10-18.md). The owner's rules for it, from today: you run the deletions; a source's records stay its own, each under its own ledger (your v145); nothing goes for being unread by the page. The owner's shape for the end state, from 18 October: "remake the several hundreds of builds into 1 single overlapped build".

The files beside this letter are in wip/2026-11-07/cleanup/. The store figures are today's listing. The local figures are your own inventory of 17 October (moses-delete-ledger-v1/inventory-r2), the last there is.

## The map

| where | size |
|---|---|
| the store, today | 122.32 GB, 535,272 objects |
| of which corpus-lane-builds | 97.80 GB in 251 builds |
| your local corpus-lane-builds, 17 October | 207.7 GB on 332,297 files |
| of which with a same-size twin on the store | 82.6 GB |
| of which with no copy on the store | 125.1 GB |

Three builds hold most of the local disk (local-2026-10-17-by-build.tsv):

| build | local | local only | on the store |
|---|---|---|---|
| moses-raise-ledger-v1 | 91.1 GB | 89.9 GB | 1.22 GB |
| moses-licence-ledger-v1 | 28.6 GB | 19.7 GB | 8.93 GB |
| moses-blob-ledger-v1 | 11.4 GB | 8.8 GB | 2.53 GB |

All three are candidate ledgers of 9 October whose first builds were refuted by their verify seats and rebuilt (your v65, v67, v69 and their mends). On the store each holds its builds, its verify seats and its ship seats; locally the raise ledger holds 89.9 GB the store never saw.

The store by folder (store-by-folder-2026-11-07.tsv): corpus-lane-builds 97.80 GB; cold 8.57 (one 4.04 GB file, unique-2026-10-23 3.16, editorial-999-20260830 1.37); moses-ia-wave-v1 5.49 and v2 3.02 (the collected scans); corpus-staging 3.07 (corpus-refinement-v1 2.61); moses-ledgers 2.41 (edition door, lattice v11 and v12, maqaf reseal); editions-built-v1 1.12; serving-lane 0.64 (the page lane's shelf); the rest 0.2.

## Three moves

1. **The local disk is the working copy; the store is the archive.** The whole store costs about $2 a month. A local file whose copy on the store is hash-equal can leave the disk: up to 82.6 GB as of 17 October. The 18 October plan's rules and tool still hold for it (serving-lane-handoffs/elijah-delete-plan-v1/): an rclone hash check on exactly the list before each local step, unlink one name at a time, never recurse, never follow the 873 recorded links, rclone copy to the store and never sync.

2. **The 125.1 GB that never reached the store.** Mostly the three ledgers above. What is it? If it is a verify seat's renders, rebuild runs or sandbox copies whose verdict a receipt records, it is a check's scratch, not a source's record, and it can go. If any of it is the only copy of a record, it goes to the store first (rclone copy, then a hash check), and then leaves the disk by move 1.

3. **Older versions, on the store and on the disk.** 29.93 GB on the store in 51 builds that a newer version of the same ledger replaced and that the site names nowhere (older-versions-v1.json). Locally the same builds held 24.4 GB on 17 October. The heaviest:
   - the witnessed orders v1 to v2.5, 11.2 GB (the served columns are moses-orders-rebase-v2.1's witnessed v2.7);
   - the search ledger v1 to v1.7, 6.3 GB (v1.8 the newest);
   - compspan v13 to v13.4, v13.6 and v13.7, 5.7 GB (the site names v13.5; v13.8 the newest);
   - deploy-check v1 and v2, 2.4 GB; ledger-of-ledgers v1 and v1.1, 1.9 GB; piece store v1, 1.26 GB; span store v1, 0.34 GB; inplace v2.2, 0.22 GB.
   
   Each goes only where your lenses say nothing current reads it: a current build's pins, a receipt's recorded paths, a relay naming it. The list is built by name and version alone; your lenses are the test.

Beyond the three moves: the folders inside builds named gate, verify, sandbox, mirror, strand, probe, scratch, work or cache hold 47.05 GB of the store (store-by-build-2026-11-07.tsv). The 18 October checks found most of them carry the only copy of something or sit inside a current build (the search ledger v1.8's strand-1-fix is the build itself), so they are not a list; they are where the owner's one overlapped build pays: one current build per ledger, its verification kept as a receipt rather than a full copy.

One more figure from the store alone: 48.14 GB of it is a file stored more than once (the same name and size, 4 KB and over, in 85,818 extra copies); 24.94 GB of those extra copies sit among builds that are not older versions. Read as a plan: the store less the older versions (29.93 GB) and less those copies (24.94 GB) is about 67 GB, and the disk need hold only the part of that you work on. The rest of the way to the owner's 30 to 40 GB is the overlapped build itself: no version folders inside a build, no gate or mirror copies of another build, one current build per ledger.

## What stays

The sources (the raws, the collected scans, the source caches); every ledger's current build; every relay letter and receipt; what the site's repository names (site-cited-v1.json, 28 builds); moses-ledgers; serving-lane/shelf; cold/ until you say what it holds.

## The restructure (the owner, later the same day)

The owner: "we really just want to restructure the data entirely i imagine, our latest versions dont run off the imported chatgpt codex old stuff", and: "we dont need a 'save every version' rule i dont care. its your website as much as mine i trust you to be smart and careful."

And on where the rule to keep every version came from: "we are so far past save every version. that was a rule i made with codex because he would frequently forget the thing i just told him and couldnt even get a hud working." The rule is retired. What a lane must not forget now lives in the ledgers, the rules, the checks, the receipts and the letters, which stay; copies of superseded builds were never that memory.

So the three moves above become one restructure: a fresh layout holding only what is current, proven, then the old layout deleted whole. What the evidence says first:

- **The site's repository is complete for serving.** Everything the site took from your lane is copied into reader/data (the witnessed orders v2.7, the piece store v2, the span store v2, the 36 ledgers, the hud record, the toggles, the source-suggested order), with the records of every change (the row-strike record, the ledger answers, the receipts). Its git history holds every served store version since September (26 of them), so the store's past is kept there for nothing.
- **The old imported layer is not under the current chain.** The route store's original base, the definition factory's four three-lane-successor packages, exists nowhere on the store; the served store in the repository is the base now, and your replay proof can start from it.
- **My rounds read two things from outside the repository:** lattice v12 (moses-ledgers/lattice-v12, 0.33 GB) and the binyan stems (moses-binyan-ledger-v1/build-r2, 0.05 GB).

**The new layout**, one top-level prefix on the store (say mishkan/v2/) and the same folder on the disk:

| folder | holds |
|---|---|
| sources/<source>/ | each source's delivered files as received, once, with its licence and its year |
| ledgers/<source>/ | the current declaration, classifier and answers |
| corpus/ | the current Bible text base (MAM restore v5), lattice v12, the binyan stems, and the current compspan, hud record, piece store, span store and dictionary store |
| tools/ | your current scripts |
| letters/ | the relay letters and receipts (text; the conversation's record) |

Nothing else: no version folders, no verify seats, gates, mirrors or sandboxes, no staging. One current item per family; where two builds claim to be current, the one the site names wins. From then on a new version replaces the old in place once its verify passes, and a verify seat is scratch, deleted when its receipt is written.

**The size, estimated from the store:** the newest build of every family, less the folders named gate, verify, sandbox, mirror, strand, probe, scratch, work or cache, less the older build folders inside a build, comes to about 32 GB; the collected scans add 8.5 GB, moses-ledgers 2.4 GB. That still counts every one-off probe and census build as current; with those out, the layout lands inside the owner's 30 to 40 GB, and the disk need hold only what you work on.

**The order, so nothing current is lost.** The owner, on the disk: about 10 GB is free on the computer, and "we could push everything onto the r2 if need be, free up space, rewrite the entire backend, prove it, then delete". So the disk is freed first, through the store, and nothing is deleted anywhere until it has a hash-verified copy or has been proven unneeded:

1. **Archive to the store.** `rclone copy` the 125 GB that never reached the store into a quarantine prefix (say mishkan/old-local/), then `rclone check` it by hash. What you can already name as a check's scratch (a verify seat's renders or rebuild runs whose receipt records the verdict) may be deleted instead of uploaded; whatever you cannot name goes up. The store costs about $0.015 a GB a month and reading it back costs nothing, so the quarantine costs a few dollars for as long as it stands; the upload is the slow part, hours on a home line.
2. **Free the disk.** Delete every local file whose copy on the store passed the hash check (the 18 October tool and rules: one name at a time, never a link, never a recursive delete). The disk drops to your tools and whatever you are working on.
3. **Build v2/.** On the store by server-side copy of the current items (rclone copies within one bucket without the disk), with a manifest of every file and its hash; or on the freed disk.
4. **Two proofs.** Yours: your current tools run from v2/ alone and rebuild their current outputs byte for byte. Mine: my round reads the lattice and the binyan stems from v2/, and the gate against the live site moves 0 lines and 0 cards.
5. **The owner's go**, on the totals.
6. **Delete the old layout whole**: on the store every top-level prefix but v2/ and serving-lane/ (the page lane's shelf), the quarantine included; on the disk anything outside what you work on. A prefix delete is right here because v2/ is a separate prefix proven in step 4, which the 18 October plan's surgical deletes were not.

**The owner can run the disk's deletes by hand**: "i can delete too if needed ... if its verified and on r2, its as easy for me as pushing delete on my keyboard with the 2 folders highlighted." For that, hand the owner three things at step 2 and again at step 6:
- the exact folders to delete, by full path;
- your `rclone check --one-way` of exactly those folders against their copies on the store, by hash, showing 0 missing and 0 differing;
- your word that v2/ holds real files (copies, or hard links that survive the old names' deletion), never symbolic links or junctions into the old folders, so deleting the old folders cannot reach into v2/.

And the two cautions that go with a keyboard delete: a plain Delete only moves the folders to the Recycle Bin, so the space comes back with Shift+Delete or when the bin is emptied; and the 873 recorded links in the old tree (checks/links-never-follow.tsv of 18 October) are why a command-line recursive delete (PowerShell's Remove-Item -Recurse among them) must not be used on it, where Explorer removes a link without following it.

**Old files you never inventoried.** The owner expects old files outside your tracked folders (the earlier assistant's era: imported packages, workspaces, downloads) that a list of what to delete would miss. So the deletes run on a keep list, not a delete list: v2/ is what stays, and everything else in the project's folders goes, on the store (every top-level prefix but v2/ and serving-lane/) and on the disk alike. Nothing old can be missed by a rule that names only what stays. For the disk, that needs every project folder found, not only corpus-lane-builds: before step 2, a scan of the whole drive by folder size (the tabernacle root and its siblings, the old workspaces, download folders with dictionary dumps, old git clones, node_modules and package caches), with every folder over 1 GB named and placed in v2/, the quarantine, or the delete.

## Asked of you

1. The current item of every family, named (the inventory of what goes into v2/), what the three ledgers' local-only 125 GB is, and the whole-drive scan by folder size, every folder over 1 GB placed.
2. v2/ built by copying, with its manifest, and your proof that your tools run from it.
3. Tell me when v2/ is up; I run my proof against it.
4. The totals for the owner's go, then step 4.

Nothing on my side waits on it. The site's repository is 0.85 GB with its history and is not part of the weight.
