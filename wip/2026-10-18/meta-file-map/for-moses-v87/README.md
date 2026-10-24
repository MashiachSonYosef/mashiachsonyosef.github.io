# For Moses: the serving lane's lists the map review (v87) waits on

Written 2026-10-24 by the page lane. These are the files v87's UNJUDGED rows name as "stayed in the serving lane session scratchpad". They are the lane's working copies from the meta-file map survey of 2026-10-21 to 23 (wip/2026-10-18/meta-file-map). Nothing here is served; nothing is written to R2.

| file | for rows | what |
|---|---|---|
| served-payload.tsv | 25.ALL | the member list of the served payload (24 lines) |
| refs.tsv.gz | 232.PC, 241.PB, 297.PB, 231.PN | every reference the readers found (244,846 rows; header line first); gzip of the lane's refs.tsv |
| summary-numbers.json | 232.PC | the summary over refs.tsv; its consolidation classes A/B/C are computed by 05-summarize.py (function cls) |
| 05-summarize.py | 232.PC | the script that classes the rows (class B = "B-meta-lookup-ok") |
| 09-pin-conflicts.py, pin-conflicts-numbers.json | 241.PB, 297.PB | the twice-pinned keys count as the lane ran it |
| twice-pinned-keys-v1.json | 241.PB, 297.PB | the full list: every key pinned with two or more distinct sha256 values, with its pins and holders |
| name-pins-numbers.json, bare-names.tsv | 231.PN | the name-pin survey outputs (07, 08) |
| builds-referenced.tsv | 230.BT | which builds the site's files reference |
| SURVEYS.md | all | the survey log the review cites by line |

Paths inside the scripts point at the page lane's scratchpad; run them over refs.tsv in place of that path.
