# Extrapolate the sample's L2/L3/L4 to the whole bucket. No network.
# Run: python3 -I 50-extrapolate.py   (after 40-analyze.py, 42-analyze-v2.py, 45-classes.py, 46-class-sample.py, 55-union.sh)
#
# Method
#  1. The bucket's L1 (68.22 GB, each distinct content once) is split by content class (text, gz-text, binary,
#     tar.gz, media, gz-other) and by whether the content occurs in one of the ten sampled families (45-classes).
#  2. Sampled part = the runs' own measurements. iawave and editions were sampled by item / work folder, so their
#     figures are scaled by (family L1 / processed L1). Sharing between sampled families is applied with the union
#     of the runs' chunk tables (55-union.txt; it moves the totals by 0.3 %).
#  3. L4 per run and class. Runs made with ovl2 (staging2, compspan2, cold2, which replace staging, compspan, cold)
#     carry exact per-file zlib bytes: L4 = per file the smaller of "as stored" and "its new chunks, zlib-6, plus
#     recipe". The other runs are text and gz-text families: L4 = min(class L3 x the run's zlib ratio, as stored).
#     xz: the recompressed part times the run's xz/zlib ratio from its capped prefix, clamped to [0.45, 0.80].
#  4. Unsampled part: its L1 per class times the sample's class ratio (bytes-weighted mean; low and high = the
#     smallest and largest ratio among runs with >= 0.1 GB of that class). Binary and media in the unsampled part
#     were measured directly as incompressible (46-class-sample: gzip-6 0.99 of stored), so their L4 = their L3
#     ratio (chunk sharing only) capped at 1.0.
#  5. Lz_base = whole-file dedup plus compression of each file alone, no row/chunk sharing (ESTIMATED as above).
import json, collections
M = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/overlap'
G = 1e9
fam = json.load(open(M + '/tables/40-families.json'))
cls = json.load(open(M + '/tables/45-classes.json'))
sel = json.load(open(M + '/tables/15-selection.json'))
csample = json.load(open(M + '/tables/46-class-sample.json'))['summary']
union = {}
for l in open(M + '/tables/55-union.txt'):
    f = l.rstrip('\n').split('\t'); union[f[0]] = int(f[1])
u_cdc = union['union-cdc'] / union['sum-cdc']
V2 = {'staging': 'staging2', 'compspan': 'compspan2', 'cold': 'cold2'}
MAIN = ['licence', 'cold', 'witnessed', 'compspan', 'census', 'iawave', 'staging', 'runback', 'hud', 'editions']
LEVELS = ['L1', 'L2', 'L3', 'L4z', 'L4x', 'Lz_base']
STORED = ('gz-text', 'gz-other', 'tar.gz', 'media')

per = collections.defaultdict(dict)   # class -> run -> level -> bytes (scaled to the whole family)
for r in MAIN:
    f = fam[r]; s = sel[r]['L1_within_bytes'] / sel[r]['selected_bytes']
    rz = f['zlib_ratio_unique_cdc']; xr = min(max(f['xz_over_zlib_cdc'], 0.45), 0.80)
    v2 = json.load(open(M + '/tables/42-%s.json' % V2[r]))['by_class'] if r in V2 else None
    for c, k in f['by_class'].items():
        d = {'L1': k['L1'], 'L2': k['L2'], 'L3': k['L3']}
        if v2 and c in v2:
            w = v2[c]; kept = w['kept_as_stored_bytes']
            d['L4z'] = w['L4best']; d['L4x'] = kept + (w['L4best'] - kept) * xr; d['Lz_base'] = w['Lz_base']
        else:
            stored = k['L1'] if c in STORED else None
            base = stored if stored is not None else k['inner'] * rz
            rec_z = k['L3'] * rz
            d['L4z'] = min(rec_z, base) if c != 'media' else k['L1']
            d['L4x'] = min(rec_z * xr, stored if stored is not None else base * xr) if c != 'media' else k['L1']
            d['Lz_base'] = base
        per[c][r] = {lv: v * s for lv, v in d.items()}

ratio = {}
for c, runs in per.items():
    tot = {lv: sum(d[lv] for d in runs.values()) for lv in LEVELS}
    big = [d for d in runs.values() if d['L1'] >= 0.1 * G] or list(runs.values())
    ratio[c] = {lv: {'mean': tot[lv] / tot['L1'] if tot['L1'] else 1.0,
                     'low': min(d[lv] / d['L1'] for d in big if d['L1']), 'high': max(d[lv] / d['L1'] for d in big if d['L1'])} for lv in LEVELS}
for c in cls['classes']:
    ratio.setdefault(c, {lv: {'mean': 1.0, 'low': 1.0, 'high': 1.0} for lv in LEVELS})
# unsampled binary and media: measured incompressible; only chunk sharing can help them
for c in ('binary', 'media'):
    g = csample[c]['gz6_over_stored']; x = csample[c]['xz6_over_stored']
    for e in ('mean', 'low', 'high'):
        l3 = min(ratio[c]['L3'][e], 1.0)
        ratio[c]['L4z'][e] = min(1.0, l3 * g) if e != 'high' else 1.0
        ratio[c]['L4x'][e] = min(1.0, l3 * x) if e != 'high' else 1.0
        ratio[c]['Lz_base'][e] = min(1.0, g) if e != 'high' else 1.0
for e in ('mean', 'low', 'high'):  # the unsampled tar.gz (0.10 GB) and gz-other: as stored at the high end
    for c in ('tar.gz', 'gz-other'):
        for lv in ('L4z', 'L4x', 'Lz_base'):
            ratio[c][lv]['high'] = max(ratio[c][lv]['high'], 1.0)
            ratio[c][lv][e] = min(ratio[c][lv][e], 1.0)

sampled_sum = {lv: sum(per[c][r][lv] for c in per for r in per[c]) for lv in LEVELS}
sampled = {'L1': sum(v.get('sampled', 0) for v in cls['classes'].values())}
for lv in LEVELS[1:]: sampled[lv] = sampled_sum[lv] * u_cdc
uns = {lv: {e: 0.0 for e in ('mean', 'low', 'high')} for lv in LEVELS}
for c, v in cls['classes'].items():
    for lv in LEVELS:
        for e in ('mean', 'low', 'high'):
            uns[lv][e] += v.get('not-sampled', 0) * ratio[c][lv][e]
total = {lv: {e: sampled[lv] + uns[lv][e] for e in ('mean', 'low', 'high')} for lv in LEVELS}
res = {'union_factor_cdc': u_cdc, 'per_run_class': {c: v for c, v in per.items()}, 'class_ratios': ratio,
       'sampled_sum': sampled_sum, 'sampled': sampled, 'unsampled': uns, 'total': total, 'L1_total': cls['L1_total_bytes'],
       'unsampled_L1_by_class': {c: v.get('not-sampled', 0) for c, v in cls['classes'].items()},
       'sampled_L1_by_class': {c: v.get('sampled', 0) for c, v in cls['classes'].items()}}
json.dump(res, open(M + '/tables/50-extrapolate.json', 'w'), indent=1)
print('union factor %.4f; sampled L1 %.3f GB of %.3f GB' % (u_cdc, sampled['L1'] / G, cls['L1_total_bytes'] / G))
print('%-8s %10s %26s %26s' % ('level', 'sampled', 'unsampled mean (low-high)', 'TOTAL mean (low-high)'))
for lv in LEVELS:
    u = uns[lv]; t = total[lv]
    print('%-8s %7.2f GB %8.2f (%6.2f-%6.2f) GB %8.2f (%6.2f-%6.2f) GB' % (lv, sampled[lv] / G, u['mean'] / G, u['low'] / G, u['high'] / G, t['mean'] / G, t['low'] / G, t['high'] / G))
print('class ratios to L1 (mean, low-high):')
for c, v in ratio.items():
    print('  %-8s ' % c + '  '.join('%s %.3f (%.3f-%.3f)' % (lv, v[lv]['mean'], v[lv]['low'], v[lv]['high']) for lv in LEVELS[1:]))
print('per run (scaled) GB:')
for r in MAIN:
    t = {lv: sum(per[c][r][lv] for c in per if r in per[c]) for lv in LEVELS}
    print('  %-10s ' % r + '  '.join('%s %.3f' % (lv, t[lv] / G) for lv in LEVELS))
