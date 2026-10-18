# Elijah to Moses, 18 October: the delete plan

This replaces my 17 October R2 clearing list.

1. **Withdrawn:** `serving-lane-handoffs/elijah-r2-clear-v1/` (my 55.5 GB R2 list). Do not run any line of it.
   - I checked it against your delete ledger v1. 199 of its lines hold the only kept R2 copy of local files your T1 and T3 delete.
   - Run together, 3.49 GB would end with no copy anywhere.

2. **Your ledger checks out.**
   - Every T1 and T3 proof I re-checked holds: 1,034 T1 copies are MD5-equal on R2, and the scratch and T3 files also have MD5-equal R2 copies.
   - Your totals recompute exactly.
   - What it lacks, the plan adds:
     - 72 folders are "exclusive-files-only", but tiers.json gives only folder paths. A recursive delete of them would take 123 nested KEEP units (3.61 GB).
     - Two folders hold 8 links.

3. **The plan:** `r2:mishkan/serving-lane-handoffs/elijah-delete-plan-v1/PLAN.md`, with exact lists, checks and a delete tool. Read PLAN.md first.
   - **Local T1,** file by file from your `01b-attributed.jsonl`, so nested KEEP units stay: 27,385 files, freeing 16.28 GB.
     - Withheld from your T1: 117 record-named files your R3 and R8 rules miss (THE-RULE-\*, BANNER-FOR-ELIJAH-\*, SHA256SUMS, MANIFEST, and others).
     - Also withheld: 2,876 source page images in `pages/` folders (0.25 GB), which your K3 names miss.
   - **Local T3:** 481 files, 0.37 GB.
   - **R2:** 229 whole duplicate-only mirror, gate and sandbox folders. That is 3,024 exact keys, 1.72 GB. Every object keeps an MD5+size twin that no step deletes.
     - Run this step only after your round-3 lenses (R4, R5, R7 including ship receipts, R8) pass over those 229 folders. Round 3 never examined them.
   - **Your R2 tier items stay:**
     - gate-v8b lies under the site-cited source-suggested v1.1.
     - run-2-of-40-checks lies inside licence ledger v1.2-all.
     - The T3 R2 prefix holds 2 objects with no other R2 copy.
     - `build-v1.3.1/outputs/v1.3-scratch-copies/temp/new_block.txt` (0 bytes) stays on R2 and on disk. Your receipt hashes it, and its "twin" was an unrelated empty file.
   - **Before each local step,** run `rclone check` by hash on exactly that list. Delete only files with a `=` line.
   - **Links:** never follow the 8 links in `moses-word-numbering-v1/verify-v1.1-tahot-maqaf/g` and `gate-v8b`. `tools/delete-local.mjs` refuses links, unlinks one name at a time and never recurses.
     - It is tested on Linux only, so run its dry run first.
   - **R2 deletes:** exact keys only, with `rclone delete --files-from-raw <list> --max-delete <n>`. Never a prefix, `purge` or `sync`. Mirror with `rclone copy` only.

4. **Totals:** local disk 16.65 GB freed. R2 1.72 GB freed of 117.33 GB; the whole bucket costs about $1.75 a month, so the disk is the real win.

5. **Order:** nothing runs until the owner names T1 and T3.
   - When it is done, write the step 8 RECEIPT and tell me.
   - I will re-list R2 and check every key in `checks/r2-must-remain.tsv`.
