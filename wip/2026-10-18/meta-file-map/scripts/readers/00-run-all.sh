#!/bin/bash
# Run order for the "who reads R2 paths" survey (read-only on R2; writes only under meta/readers/).
# 02 and 06 load r2.env inside their own shell and never print it.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; R=$S/meta/readers/scripts
cd /tmp || exit 1
python3 -I $R/01-select-docs.py 10000000   # pick the doc bodies (name filter, one per (md5,size))
bash $R/02-download.sh                      # GET them into meta/readers/dl/
python3 -I $R/03-scan.py                    # site HEAD, notes diff, R2 docs -> refs-raw.tsv
python3 -I $R/04-special.py                 # shelf pins, keep rules, mention pins, dormant road -> refs-special.tsv
python3 -I $R/05-summarize.py               # merge -> refs.tsv, summary-numbers.json, builds-referenced.tsv
python3 -I $R/06-verify-sample.py 40        # hash a sample of pinned objects -> verify-sample.tsv
python3 -I $R/07-name-pins.py               # chain-of-custody names on R2
python3 -I $R/08-bare-names.py              # bare relay/rule names the site cites
python3 -I $R/09-pin-conflicts.py           # keys pinned with 2+ different sha256
python3 -I $R/10-extra.py                   # Moses recorded inputs, mention overlap, classes by area
