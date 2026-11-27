#!/usr/bin/env python3 -I
# STEP's files at two revisions, line by line: which lines differ, in which column, and whether the places our passes
# flagged are among them. Usage: diff-step.py <pinned dir> <latest dir> <out.tsv>
import sys, os, difflib, io
A, B, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
out = io.open(OUT, 'w', encoding='utf-8')
out.write('file\tkind\tref\tcolumn\tpinned\tlatest\n')
tot = {}
for name in sorted(os.listdir(A)):
    a = io.open(os.path.join(A, name), encoding='utf-8', errors='replace').read().split('\n')
    b = io.open(os.path.join(B, name), encoding='utf-8', errors='replace').read().split('\n')
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    n = dict(replace=0, delete=0, insert=0)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal':
            continue
        if tag == 'replace' and (i2 - i1) == (j2 - j1):
            for k in range(i2 - i1):
                x, y = a[i1 + k].split('\t'), b[j1 + k].split('\t')
                n['replace'] += 1
                cols = [c for c in range(max(len(x), len(y))) if (x[c] if c < len(x) else None) != (y[c] if c < len(y) else None)]
                for c in cols:
                    out.write('\t'.join([name[:12], 'changed', x[0][:40], str(c), (x[c] if c < len(x) else '')[:200], (y[c] if c < len(y) else '')[:200]]) + '\n')
        else:
            for k in range(i1, i2):
                n['delete'] += 1; out.write('\t'.join([name[:12], 'only pinned', a[k].split('\t')[0][:40], '', a[k][:240].replace('\t', ' | '), '']) + '\n')
            for k in range(j1, j2):
                n['insert'] += 1; out.write('\t'.join([name[:12], 'only latest', b[k].split('\t')[0][:40], '', '', b[k][:240].replace('\t', ' | ')]) + '\n')
    tot[name[:12]] = (len(a), len(b), n)
    print(name[:12], 'lines', len(a), len(b), n)
out.close()
