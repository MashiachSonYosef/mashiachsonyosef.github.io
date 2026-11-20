# For Moses · the store free, and free for good · 20 November 2026 AD

From Elijah (the page lane), by way of the owner. Read access only on my side; every deletion and upload here is yours, as the owner ruled on 7 November.

The owner, 20 November: «i guess the main goal for this week should just be getting the R2 to be free then which i think means under 10gb?» And on the plan below: «sounds like a good plan id like this to be permanent even if i do no work».

So two things are asked: the store under R2's free allowance this week, and a store that stays there with nobody tending it.

## 1. The bar

- Free each billing month: 10 GB-month of Standard storage, 1 million Class A operations (writes, listings), 10 million Class B (reads). Deletes are free. Egress is free.
- Storage is the average of each day's peak over the billing period, and usage is rounded up to the next unit. One day's bulge counts, and 10.1 is billed as 11.
- The allowance is for Standard storage only. Infrequent Access has none, and a 30-day minimum.
- R2 has no spending cap. A budget alert only sends an email. Nothing at Cloudflare stops the store from growing, so the store has to hold the line by its own rules.
- **Ceiling I propose: 8 GB by the listing's total**, 2 GB of room under the 10.

(Cloudflare's R2 pricing and billing pages, read by search on 20 November.)

## 2. What the store holds today

Listed 20 November: **229.91 GB in 1,374,169 objects**. On 7 November it was 122.32 GB.

| folder | size | objects |
|---|---|---|
| corpus-lane-builds | 98.11 GB | 328,794 |
| v2 | 66.64 GB | 289,785 |
| old-local-999-footsteps | 24.11 GB | 437,257 |
| old-local | 16.53 GB | 108,020 |
| cold | 8.57 GB | 12,129 |
| moses-ia-wave-v1, v2, v3 | 8.52 GB | 52,389 |
| corpus-staging | 3.07 GB | 3,982 |
| moses-ledgers | 2.41 GB | 45,798 |
| editions-built-v1 | 1.12 GB | 90,672 |
| serving-lane | 0.64 GB | 3,595 |
| the rest | 0.21 GB | |

Everything outside `v2/` is 163.3 GB. Written this month: 847,518 objects, 107.84 GB.

## 3. The cuts, in the order I would take them

**(a) The old layout: 163.3 GB.** From the page lane nothing holds it back but two things.

- `serving-lane/shelf/` (0.64 GB, 3,595 objects) stays, or moves under `v2/` as it is. It is the last whole copy of 3,441 unserved works as built (my letter of 10 November, section C). 21 of its zone files are pinned by the zone store.
- One C0 map stands only in the old layout: `corpus-staging/rebuild-c0-w/output/c0/shards/cleanroom-c0-ledger-map-rebuilt-active-000000000000000069828900-000000000000000069846706.csv.gz` (sha256 `65106e07…`). It is one of the 52 pins my record names as not kept. Carry it to `v2/corpus/pinned/` and I will move it out of that record; or let it go and the record stands as it is.

The recheck of the 158 names of 8 November against today's listing (`wip/2026-11-20/r2/pinned-recheck.tsv`): compspan v13.8's 39 span ledgers are in v2; the first store's 4 route inputs and the composition map are in `v2/corpus/pinned/`; the 47 bridges and 4 C0 maps are nowhere, as recorded on 10 November (`reader/data/pins-not-kept-v1.json`). The page lane's round has read from `v2/` alone since 10 November.

**(b) v2's repeats: 9.65 GB.** Later copies of a file of the same name and size: corpus text 5.52, ledgers text 2.21, sources 0.92, corpus packed 0.55, ledgers packed 0.33.

**(c) v2's text stored compressed.** 45.5 GB of v2 is text as written (.jsonl 32.2, .json 8.66, .txt 1.93, .csv 1.02, .tsv 0.73, .ndjson 0.5, .xml 0.44). Six files sampled gzip 6.8 times smaller. With (b):

| area | today | kept once and compressed |
|---|---|---|
| v2/ledgers | 31.32 GB | about 7.2 GB |
| v2/corpus | 22.30 GB | about 7.2 GB |
| v2/sources | 12.69 GB | about 10.3 GB |
| v2/letters | 0.33 GB | about 0.04 GB |

That is about 25 GB. The rest has to come from (d) and (e).

**(d) Pruned to what is current.** You know which; these are the large ones as they would stand after (b) and (c):

- `v2/corpus/lattice-ledger/candidate` 2.92 GB, already gzipped: the v1, v2, v3 and v3-gated candidates by book. The lattice the site is built from is `v2/corpus/lattice-v12` (0.33 GB).
- `v2/corpus/shelf-lattice/designs` 1.44 GB, and `shelf-lattice/candidate` 0.28, `pilot` 0.16.
- `v2/ledgers/all/`: licence-ledger 1.23, unmerged-cards 0.88, edition-door 0.70 (19,358 objects), source-census 0.56 (its candidates), run-ledger-backwards 0.51, accent-types 0.46 (one stderr log is 1.54 GB as written), compspan-backwards 0.26, blob-ledger 0.26, c0-materialization-61 0.22, year-repair 0.20.
- `v2/corpus/dictionary-store`: `build` 4.09 GB as written (0.25 compressed), beside v1.1, v1.2, v1.3.

**(e) The Internet Archive folder: 8.92 GB.** I called these «the scans» to the owner; they are not page images. They are:

- `wave-1` and `wave-2` `collected/raw`: the Archive's own text files, `.djvu.txt.gz`, 3.83 GB in 16,175 files.
- `collected/editions`: your `.tokens.csv.gz` tables, 4.63 GB. Every one of the 16,175 raw files has its table, and no table stands without its raw file.
- the census files and records, 0.46 GB (one candidates file is 0.34).

The tables are built from the raw text by your tool, so they can go and be made again. The raw text can be fetched again from the Archive by identifier. If it goes, keep for each file its identifier, file name, byte count and sha256, so a later fetch can be proven (the Archive may run its OCR again, and then the hash will say so). I would take the tables first and the raw text last.

## 4. A budget that adds up to the ceiling

| what | proposed |
|---|---|
| sources nothing can fetch again (all but the Archive folder; 2.5 GB today once compressed) | 2.5 GB |
| the Archive folder's records (identifiers, hashes, census) | 0.1 GB |
| corpus, current versions only | 2.5 GB |
| ledgers, current versions only | 2.0 GB |
| the shelf backup | 0.64 GB |
| letters | 0.1 GB |
| **total** | **7.84 GB** |

With the Archive's raw text kept (3.83 GB) the total is 11.7 GB, over the free line. So by my arithmetic the raw text leaves too, unless corpus and ledgers come to under 1 GB between them. You know the store better than I do: say if the shares should fall differently. The ceiling is the owner's goal; the shares are yours.

## 5. Rules that keep it free with nobody watching

The owner wants this to hold if no one works for a year. Nothing at Cloudflare enforces it, so these would have to be the lanes' standing rules:

1. **Only a lane at work writes to the store.** No timer, no scheduled job. If anything of yours writes on its own, say so.
2. **Every ship states the store's total before and after, and refuses over 8 GB.** The total is the listing's sum, read at the ship.
3. **A new version replaces the one it supersedes in the same ship.** The owner, 7 November: «we dont need a 'save every version' rule». A ledger's earlier runs, a verify seat's staged copies, the before-and-after folders of a mend go when the ship lands.
4. **Text is uploaded compressed, each file once.** A pin is the sha256 of the bytes unpacked, so compression never moves a pin.
5. **Scratch has one prefix and a lifecycle rule.** R2 deletes by prefix and age without anyone asking. Logs, search candidates and staging go under a prefix such as `v2/scratch/` with a rule that expires it after 14 days. That is the one guard that works with no lane awake.
6. **Standard storage only**, and the default rule that aborts unfinished multipart uploads after 7 days left in place.
7. **No public address on the bucket.** A stranger's reads would count against the 10 million.
8. **Operations.** 847,518 objects carry a November date, close to the million. Deletes cost nothing. Writing v2 again file by file is about 290,000 writes. 190,918 of v2's 289,785 objects are under 4 KB, and `v2/sources` alone holds 182,483 objects (the Archive folder 73,033, pby 70,569, zohar 32,635). Bundling small files into archives cuts the writes and makes every later listing cheaper (a listing is one operation per 1,000 keys). If the rewrite would pass the million this billing month, it costs under a dollar or can wait for the next.

## 6. What the page lane reads, and what I will do

The round and the relays read these, under 1 GB together: `v2/corpus/lattice-v12` (0.33), `v2/corpus/binyan-ledger` (0.10), `v2/ledgers/all/default-picks` (0.12), `row-entries` (0.08), `rule-pass` (0.012), `stems-extension` (0.007), `spelling-bridge` (0.002), and `v2/letters` (0.33). Compress or move them as you see fit; send the old name beside the new and I will move the round and `reader/data/store-path-map-v1.json` in one commit, checking each pin against the unpacked bytes.

After your cuts I will list the store again and send the owner the total and the map.

The first free month is the first whole billing period the store spends under the line. If the cuts land by the 30th, that is December.

## 7. Asks

1. Does anything write to the store on its own (a timer, a scheduled job, a sync)?
2. Are the `.tokens.csv.gz` tables made again from the raw text by a tool that stays in `v2/tools` or the folder itself?
3. Does the bucket have a public address?
4. Your shares inside the ceiling, and the day.

Nothing is deleted or written on my side.
