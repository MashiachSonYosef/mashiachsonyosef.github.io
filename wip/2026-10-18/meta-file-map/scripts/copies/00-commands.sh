#!/bin/sh
# Commands used for the copies survey (18 Oct 2026). All read only. No R2 call was needed: every R2 fact
# comes from the bucket listing (clean/bucket-now2.tsv, 18 Oct) and the md5 table (02-r2-md5.tsv, 17 Oct).
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
G=$S/ghp
O=$S/meta/copies/out
N=/home/user/mashiachsonyosef.github.io

# (b) site repo: size, branches, every object in history with its size
git -C $G count-objects -vH
git -C $G rev-parse --git-dir --git-common-dir      # ghp is a worktree of $N/.git
git -C $G worktree list
du -sh $N/.git
cat $N/.git/shallow                                 # one shallow boundary commit
git -C $G branch -a
git -C $G for-each-ref --format='%(refname) %(objectname:short) %(committerdate:short)'
git -C $G rev-list --left-right --count gh-pages...origin/gh-pages
git -C $G rev-list --left-right --count origin/main...origin/gh-pages
git -C $G diff --stat origin/main origin/gh-pages
git -C $G rev-list --objects --all > $O/git-objects-all.txt
cut -d' ' -f1 $O/git-objects-all.txt | git -C $G cat-file --batch-check='%(objectname) %(objecttype) %(objectsize) %(objectsize:disk)' > $O/git-objects-sizes.txt

# (c) notes repo: same object store; what its branch holds; untracked or ignored files
git -C $N log --oneline -3
git -C $N ls-tree -r -l claude/awesome-hypatia-2pxz43 wip
(cd $N && git ls-files --others --exclude-standard; git ls-files --others --ignored --exclude-standard)

# analysis scripts, in order (python3 -I)
python3 -I $S/meta/copies/scripts/01_moses_disk.py          # CLB per build: rclone-check '=' bytes, scratch proofs, unswept builds; local-known hashes
python3 -I $S/meta/copies/scripts/02_scratch_reconcile.py   # scratch files without a kept R2 copy, by ledger class
python3 -I $S/meta/copies/scripts/03_scratch_none_anywhere.py  # ... do they have ANY R2 key with the same md5+size?
python3 -I $S/meta/copies/scripts/04_plus_lines.py          # rclone '+' and '*' lines: hard links, later uploads
python3 -I $S/meta/copies/scripts/05_git_blobs.py           # git history blobs: sizes, biggest, size candidates
python3 -I $S/meta/copies/scripts/06_git_md5.py             # md5 of every blob whose size equals some R2 object's size
python3 -I $S/meta/copies/scripts/07_git_vs_r2.py           # blobs and branch trees byte-equal to R2 objects
python3 -I $S/meta/copies/scripts/08_r2_second_copies.py    # per R2 prefix: distinct content with a second copy on Moses's disk or in git
python3 -I $S/meta/copies/scripts/09_reader_data_copies.py  # live reader/data files that are copies of build outputs
python3 -I $S/meta/copies/scripts/10_fs_and_mirrors.py      # 999 footsteps folders beside same-named R2 prefixes; stage mirrors
