# .gz objects whose inflated content was (almost) entirely seen before in the same family: whole-file twins
# that L1 cannot see because their gz bytes differ. Threshold: new chunk bytes < 1% of inflated bytes.
import sys, json
M = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/overlap'
out = {}
for run in sys.argv[1:]:
    drv = {}
    for l in open(M + '/tables/%s/driver.tsv' % run, encoding='utf-8'):
        f = l.rstrip('\n').split('\t'); drv[f[1]] = f
    n = b = tn = tb = 0
    for l in open(M + '/tables/%s/ovl.files.tsv' % run, encoding='utf-8').read().splitlines()[1:]:
        f = l.split('\t'); k = f[0]
        if '//' in k or k not in drv or drv[k][4] != 'gz': continue
        raw = int(drv[k][2]); inner = int(f[2]); new = int(f[9])
        n += 1; b += raw
        if inner and new < 0.01 * inner: tn += 1; tb += raw
    out[run] = {'gz_files': n, 'gz_bytes': b, 'twin_files': tn, 'twin_bytes': tb}
    print('%-10s gz %5d files %7.3f GB; content-twins %5d files %7.3f GB (%.0f%% of gz bytes)' % (run, n, b / 1e9, tn, tb / 1e9, 100 * tb / b if b else 0))
json.dump(out, open(M + '/tables/41-gztwins.json', 'w'), indent=1)
