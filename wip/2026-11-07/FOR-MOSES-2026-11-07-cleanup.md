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

## What stays

The sources (the raws, the collected scans, the source caches); every ledger's current build; every relay letter and receipt; what the site's repository names (site-cited-v1.json, 28 builds); moses-ledgers; serving-lane/shelf; cold/ until you say what it holds.

## Asked of you

1. A fresh local inventory, in the shape of 17 October's.
2. What the three ledgers' local-only bytes are, build by build.
3. Your lenses over the 51 older versions, and the lists that pass them.
4. The totals each move frees, for the owner's go; then the runs in the 18 October order: store copies verified first, then the local disk.
5. Your proposal for the one overlapped build, against the owner's figure of 30 to 40 GB.

Nothing on my side waits on it. The site's repository is 0.9 GB with its history and is not part of the weight.
