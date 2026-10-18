# Per-class L4 for runs made with ovl2 (exact per-file zlib bytes from a sync flush at each file end). No network.
# Run: python3 -I 42-analyze-v2.py run2 [run2 ...]   writes tables/42-<run>.json and prints a class table.
#  L4z_class     sum over files of the zlib-6 bytes of the chunks they added to the store + 8 B per extent
#  L4best        per file the smaller of: as stored (its own bytes), or its chunk cost above (+32 B gz recipe);
#                for a .tar.gz the stored option is the whole object, the other option the members' chunk costs plus
#                64 B per member for its tar header block (ESTIMATED compressed size of a 512 B header)
#  Lz_base       compression only, no chunk sharing: as stored for .gz/.tar.gz/media; for other files the file's own
#                chunk cost scaled up to its whole inflated size (ESTIMATED where the file shared chunks)
import sys, json, collections
M = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/overlap'
TEXT = {'jsonl', 'json', 'csv', 'tsv', 'txt', 'md', 'html', 'htm', 'xml', 'mjs', 'js', 'cjs', 'log', 'lsf', 'lsjson',
        'ps1', 'sh', 'svg', 'yaml', 'yml', 'py', 'r2head', 'ndjson', 'sha256', 'css'}
MEDIA = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'zip', 'xz', 'zst', 'br', 'bz2', '7z', 'woff', 'woff2', 'jp2', 'tif', 'tiff'}
def classify(key, comp):
    b = key.rsplit('/', 1)[-1].lower(); p = b.split('.')[1:]
    if comp == 'tar.gz': return 'tar.gz'
    if comp == 'gz': return 'gz-text' if len(p) >= 2 and p[-2] in TEXT else 'gz-other'
    e = p[-1] if p else ''
    return 'text' if e in TEXT else ('media' if e in MEDIA else 'binary')
G = 1e9
for run in sys.argv[1:]:
    D = M + '/tables/' + run
    drv = {}
    for l in open(D + '/driver.tsv', encoding='utf-8'):
        f = l.rstrip('\n').split('\t'); drv[f[1]] = f
    recs = collections.defaultdict(list)
    prev_l = prev_c = 0
    for l in open(D + '/ovl.files.tsv', encoding='utf-8').read().splitlines()[1:]:
        f = l.split('\t'); lz, cz = int(f[11]), int(f[12])
        recs[f[0].split('//')[0]].append({'kind': f[1], 'inner': int(f[2]), 'lnew': int(f[5]), 'lext': int(f[6]),
                                          'cnew': int(f[9]), 'cext': int(f[10]), 'lz': lz - prev_l, 'cz': cz - prev_c})
        prev_l, prev_c = lz, cz
    cls = collections.defaultdict(collections.Counter)
    for key, d in drv.items():
        if d[3] != 'md5-ok': continue
        raw = int(d[2]); comp = d[4]; c = classify(key, comp); rs = recs.get(key, [])
        inner = sum(r['inner'] for r in rs); cnew = sum(r['cnew'] for r in rs)
        chunk_cost = sum(r['cz'] + 8 * r['cext'] for r in rs)
        line_cost = sum((r['lz'] + 8 * r['lext']) if r['kind'] == 'T' else (r['cz'] + 8 * r['cext']) for r in rs)
        if comp == 'tar.gz':
            chunk_cost += 64 * len(rs); line_cost += 64 * len(rs)
        if comp == 'gz':
            chunk_cost += 32; line_cost += 32
        best = min(raw, chunk_cost, line_cost)
        if c in ('gz-text', 'gz-other', 'tar.gz', 'media'):
            base = raw
        else:
            base = (sum(r['cz'] for r in rs) * inner / cnew) if cnew else None
        k = cls[c]
        k['files'] += 1; k['L1'] += raw; k['inner'] += inner; k['L3'] += cnew + 8 * sum(r['cext'] for r in rs)
        k['L4z_chunk'] += chunk_cost; k['L4z_line'] += line_cost; k['L4best'] += best
        k['kept_as_stored_bytes'] += raw if best == raw else 0
        if base is None: k['base_unknown_inner'] += inner
        else: k['Lz_base'] += base
    # files whose content was entirely shared: price their baseline at the class's mean ratio
    for c, k in cls.items():
        if k['base_unknown_inner']:
            known_inner = k['inner'] - k['base_unknown_inner']
            ratio = k['Lz_base'] / known_inner if known_inner else 0.1
            k['Lz_base'] += k['base_unknown_inner'] * ratio
    tot = collections.Counter()
    for k in cls.values(): tot.update(k)
    json.dump({'by_class': {c: dict(k) for c, k in cls.items()}, 'total': dict(tot)}, open(M + '/tables/42-%s.json' % run, 'w'), indent=1)
    print('%s: L1 %.3f inner %.3f L3 %.3f L4z(chunk) %.3f L4best %.3f Lz_base %.3f GB  (kept as stored %.3f GB)' % (
        run, tot['L1'] / G, tot['inner'] / G, tot['L3'] / G, tot['L4z_chunk'] / G, tot['L4best'] / G, tot['Lz_base'] / G, tot['kept_as_stored_bytes'] / G))
    for c, k in sorted(cls.items(), key=lambda x: -x[1]['L1']):
        print('   %-8s files %6d L1 %7.3f inner %7.3f L3 %7.3f L4z %7.3f L4best %7.3f Lz_base %7.3f  L4best/L1 %.3f' % (
            c, k['files'], k['L1'] / G, k['inner'] / G, k['L3'] / G, k['L4z_chunk'] / G, k['L4best'] / G, k['Lz_base'] / G, k['L4best'] / k['L1'] if k['L1'] else 0))
