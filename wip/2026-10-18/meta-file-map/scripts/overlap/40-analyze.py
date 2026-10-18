# Per-run (family) sizing at L1..L4 from the ovl outputs and the driver records. No network.
# Run: python3 -I 40-analyze.py run1 run2 ...      writes tables/40-families.tsv and tables/40-families.json
#
# Definitions (all bytes):
#  L1      sum of stored sizes of the family's distinct (md5,size) files (what the selection fetched)
#  inner   the same files after inflating .gz (and walking .tar.gz members)
#  L2      text files: unique lines (inflated) + 8 bytes per recipe extent; other files: whole, as stored (L1 bytes)
#  L3      every file: unique content-defined chunks (inflated) + 8 bytes per recipe extent
#  L4      the store compressed: zlib level 6 measured over the whole unique stream; xz preset 6 measured over the
#          first XZCAP bytes and scaled by the xz/zlib ratio on that same prefix (ESTIMATED beyond the prefix).
#          L4_line = zlib(unique lines) + other files as stored + line recipes; L4_cdc = zlib(unique chunks) + chunk
#          recipes; L4 = the smaller (the store may pick per family).
import sys, json, collections

M = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/overlap'
EXT_BYTES = 8

def classify(key, comp):
    b = key.rsplit('/', 1)[-1].lower()
    p = b.split('.')[1:]
    if comp == 'tar.gz': return 'tar.gz'
    TEXT = {'jsonl', 'json', 'csv', 'tsv', 'txt', 'md', 'html', 'htm', 'xml', 'mjs', 'js', 'cjs', 'log', 'lsf', 'lsjson',
            'ps1', 'sh', 'svg', 'yaml', 'yml', 'py', 'r2head', 'ndjson', 'sha256', 'css'}
    MEDIA = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'zip', 'xz', 'zst', 'br', 'bz2', '7z', 'woff', 'woff2', 'jp2', 'tif', 'tiff'}
    if comp == 'gz':
        inner = p[-2] if len(p) >= 2 else ''
        return 'gz-text' if inner in TEXT else 'gz-other'
    e = p[-1] if p else ''
    if e in TEXT: return 'text'
    if e in MEDIA: return 'media'
    return 'binary'

out = {}
for run in sys.argv[1:]:
    D = M + '/tables/' + run
    drv = {}
    for l in open(D + '/driver.tsv', encoding='utf-8'):
        f = l.rstrip('\n').split('\t')
        drv[f[1]] = f
    tot = {}
    for l in open(D + '/ovl.totals.tsv', encoding='utf-8').read().splitlines()[1:]:
        f = l.split('\t'); tot[f[0]] = dict(zip(['files', 'units', 'bytes', 'nunits', 'nbytes', 'extents', 'zall', 'xin', 'xout', 'zcap', 'tab'], map(int, f[1:])))
    cls = collections.defaultdict(lambda: collections.Counter())
    L1 = inner = 0; bad = 0; text_inner = 0; other_l1 = 0
    line_new = line_ext = cdc_new = cdc_ext = 0
    per_file = {}
    for l in open(D + '/ovl.files.tsv', encoding='utf-8').read().splitlines()[1:]:
        f = l.split('\t'); name = f[0]
        key = name.split('//')[0]
        per_file.setdefault(key, []).append(f)
    for key, d in drv.items():
        if d[3] != 'md5-ok': bad += 1; continue
        raw = int(d[2]); comp = d[4]; c = classify(key, comp)
        recs = per_file.get(key, [])
        fi = sum(int(r[2]) for r in recs)
        is_text = any(r[1] == 'T' for r in recs) and comp != 'tar.gz'
        ln = sum(int(r[5]) for r in recs if r[1] == 'T'); le = sum(int(r[6]) for r in recs if r[1] == 'T')
        cn = sum(int(r[9]) for r in recs); ce = sum(int(r[10]) for r in recs)
        # L2 for a file: text members by lines; binary members whole (inflated). For a tar.gz, members are scored
        # one by one the same way; a non-text plain file is kept as stored.
        if comp == 'tar.gz':
            l2 = sum((int(r[5]) + EXT_BYTES * int(r[6])) if r[1] == 'T' else int(r[9]) + EXT_BYTES * int(r[10]) for r in recs)
            l2_other_stored = 0
        elif is_text:
            l2 = ln + EXT_BYTES * le; l2_other_stored = 0
        else:
            l2 = raw; l2_other_stored = raw
        l3 = cn + EXT_BYTES * ce
        k = cls[c]
        k['files'] += 1; k['L1'] += raw; k['inner'] += fi; k['L2'] += l2; k['L3'] += l3
        k['line_new'] += ln; k['line_ext'] += le; k['cdc_new'] += cn; k['cdc_ext'] += ce; k['other_stored'] += l2_other_stored
        L1 += raw; inner += fi
    agg = collections.Counter()
    for c, k in cls.items(): agg.update(k)
    zl, zc = tot['line'], tot['cdc']
    xr_line = zl['xout'] / zl['zcap'] if zl['zcap'] else 1.0
    xr_cdc = zc['xout'] / zc['zcap'] if zc['zcap'] else 1.0
    L4_line_z = zl['zall'] + agg['other_stored'] + EXT_BYTES * zl['extents']
    L4_cdc_z = zc['zall'] + EXT_BYTES * zc['extents']
    L4_line_x = zl['zall'] * xr_line + agg['other_stored'] + EXT_BYTES * zl['extents']
    L4_cdc_x = zc['zall'] * xr_cdc + EXT_BYTES * zc['extents']
    # compression-only baselines (ESTIMATED): no overlap beyond whole-file L1.
    #  Lz_base: .gz / .tar.gz / media kept as stored; plain text and binary compressed with zlib 6 at the ratio the
    #           family's unique chunk stream showed.  Lx_base: everything inflated and compressed with xz 6 at the
    #           ratio the family's capped xz prefix showed, without cross-file sharing.
    rz = zc['zall'] / zc['nbytes'] if zc['nbytes'] else 1.0
    rx = rz * xr_cdc
    stored_kept = sum(cls[c]['L1'] for c in ('gz-text', 'gz-other', 'tar.gz', 'media') if c in cls)
    plain_inner = sum(cls[c]['inner'] for c in ('text', 'binary') if c in cls)
    Lz_base = stored_kept + plain_inner * rz
    Lx_base = inner * rx
    r = {
        'Lz_base_est': Lz_base, 'Lx_base_est': Lx_base, 'zlib_ratio_unique_cdc': rz,
        'files': agg['files'], 'md5_mismatch_or_fail': bad, 'L1': L1, 'inner': inner,
        'L2': agg['L2'], 'L3': agg['L3'],
        'L4_line_zlib': L4_line_z, 'L4_cdc_zlib': L4_cdc_z, 'L4_line_xz_est': L4_line_x, 'L4_cdc_xz_est': L4_cdc_x,
        'L4_zlib': min(L4_line_z, L4_cdc_z), 'L4_xz_est': min(L4_line_x, L4_cdc_x),
        'line': zl, 'cdc': zc, 'xz_over_zlib_line': xr_line, 'xz_over_zlib_cdc': xr_cdc,
        'cdc_avg_chunk': zc['bytes'] / zc['units'] if zc['units'] else 0,
        'by_class': {c: dict(k) for c, k in cls.items()},
    }
    out[run] = r
json.dump(out, open(M + '/tables/40-families.json', 'w'), indent=1)
G = 1e9
with open(M + '/tables/40-families.tsv', 'w', encoding='utf-8') as w:
    w.write('run\tfiles\tL1_GB\tinner_GB\tL2_GB\tL3_GB\tL4_zlib_GB\tL4_xz_est_GB\tL4_line_zlib_GB\tL4_cdc_zlib_GB\tL2/L1\tL3/L1\tL4z/L1\tL4x/L1\tavg_chunk_KiB\tLz_base_est_GB\tLx_base_est_GB\toverlap_gain_zlib\toverlap_gain_xz\n')
    for run, r in out.items():
        w.write('%s\t%d\t%.3f\t%.3f\t%.3f\t%.3f\t%.3f\t%.3f\t%.3f\t%.3f\t%.3f\t%.3f\t%.3f\t%.3f\t%.1f\t%.3f\t%.3f\t%.2f\t%.2f\n' % (
            run, r['files'], r['L1'] / G, r['inner'] / G, r['L2'] / G, r['L3'] / G, r['L4_zlib'] / G, r['L4_xz_est'] / G,
            r['L4_line_zlib'] / G, r['L4_cdc_zlib'] / G, r['L2'] / r['L1'], r['L3'] / r['L1'], r['L4_zlib'] / r['L1'], r['L4_xz_est'] / r['L1'], r['cdc_avg_chunk'] / 1024,
            r['Lz_base_est'] / G, r['Lx_base_est'] / G, r['Lz_base_est'] / r['L4_zlib'], r['Lx_base_est'] / r['L4_xz_est']))
print(open(M + '/tables/40-families.tsv').read())
for run, r in out.items():
    print(run)
    for c, k in sorted(r['by_class'].items(), key=lambda x: -x[1]['L1']):
        print('   %-9s files %6d L1 %7.3f inner %7.3f L2 %7.3f L3 %7.3f' % (c, k['files'], k['L1'] / G, k['inner'] / G, k['L2'] / G, k['L3'] / G))
