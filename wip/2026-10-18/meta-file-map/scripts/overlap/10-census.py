# L0 / L1 census of the R2 bucket from the listing and the md5 table already on disk (no network).
# Run: python3 -I 10-census.py
# Writes tables/10-*.tsv and tables/10-numbers.json under meta/overlap/.
import json, re, os, collections

S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
O = S + '/meta/overlap/tables'
BUCKET = S + '/clean/bucket-now2.tsv'
MD5 = S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv'
GB = 1e9

VER = re.compile(r'-v\d+(?:\.\d+)*(?:-[A-Za-z0-9.-]+)?$')

def version_folder(k):
    s = k.split('/')
    if len(s) == 1:
        return '(root)'
    if s[0] == 'corpus-lane-builds':
        return 'corpus-lane-builds/' + s[1] + '/' if len(s) > 2 else 'corpus-lane-builds/(own files)'
    return s[0] + '/'

def family(vf):
    if vf.startswith('corpus-lane-builds/') and vf.endswith('/'):
        b = vf[len('corpus-lane-builds/'):-1]
        return 'clb:' + VER.sub('', b)
    if vf.endswith('/'):
        return VER.sub('', vf[:-1])
    return vf

def ext_of(k):
    base = k.rsplit('/', 1)[-1].lower()
    if '.' not in base:
        return '(none)'
    parts = base.split('.')
    e = parts[-1]
    if e in ('gz', 'xz', 'zst', 'br', 'bz2') and len(parts) > 2:
        return parts[-2] + '.' + e
    return e

bucket = {}
for l in open(BUCKET, encoding='utf-8'):
    k, s, t = l.rstrip('\n').split('\t')
    bucket[k] = (int(s), t)
md5 = {}
for l in open(MD5, encoding='utf-8'):
    h, s, k = l.rstrip('\n').split('\t', 2)
    md5[k] = (h, int(s))

nm = [k for k in bucket if k not in md5]
missing = [k for k in md5 if k not in bucket]
size_mismatch = [k for k in md5 if k in bucket and md5[k][1] != bucket[k][0]]

# global L1: each distinct (md5,size) once; attributed to the earliest-modified key (ties: smallest key)
first = {}
for k, (h, s) in md5.items():
    if k not in bucket:
        continue
    t = bucket[k][1]
    c = (h, s)
    cur = first.get(c)
    if cur is None or (t, k) < cur:
        first[c] = (t, k)

fam = collections.defaultdict(lambda: {'keys': 0, 'L0': 0, 'L1_within': 0, 'L1_global_attr': 0, 'versions': set(),
                                       'nomd5_keys': 0, 'nomd5_bytes': 0, 'distinct_within': 0})
within_seen = collections.defaultdict(set)
for k, (s, t) in bucket.items():
    vf = version_folder(k)
    f = family(vf)
    r = fam[f]
    r['keys'] += 1
    r['L0'] += s
    r['versions'].add(vf)
    if k in md5:
        c = md5[k]
        if c not in within_seen[f]:
            within_seen[f].add(c)
            r['L1_within'] += s
            r['distinct_within'] += 1
        if first[c][1] == k:
            r['L1_global_attr'] += s
    else:
        r['nomd5_keys'] += 1
        r['nomd5_bytes'] += s

L0 = sum(s for s, t in bucket.values())
L1g = sum(c[1] for c in first)
nomd5_b = sum(bucket[k][0] for k in nm)

rows = sorted(fam.items(), key=lambda x: -(x[1]['L1_global_attr'] + x[1]['nomd5_bytes']))
with open(O + '/10-families.tsv', 'w', encoding='utf-8') as w:
    w.write('family\tversions\tkeys\tL0_bytes\tL1_within_family_bytes\tL1_global_attributed_bytes\tno_md5_keys\tno_md5_bytes\tL0_GB\tL1_within_GB\tL1_global_GB_incl_no_md5\n')
    for f, r in rows:
        w.write('%s\t%d\t%d\t%d\t%d\t%d\t%d\t%d\t%.3f\t%.3f\t%.3f\n' % (
            f, len(r['versions']), r['keys'], r['L0'], r['L1_within'], r['L1_global_attr'], r['nomd5_keys'],
            r['nomd5_bytes'], r['L0'] / GB, r['L1_within'] / GB, (r['L1_global_attr'] + r['nomd5_bytes']) / GB))

# per extension
ext = collections.defaultdict(lambda: [0, 0, 0, 0])  # keys, L0 bytes, distinct, L1 bytes
seen = set()
for k, (s, t) in bucket.items():
    e = ext_of(k)
    ext[e][0] += 1
    ext[e][1] += s
    if k in md5:
        c = md5[k]
        if first[c][1] == k:
            ext[e][2] += 1
            ext[e][3] += s
    else:
        ext[e][2] += 1
        ext[e][3] += s
with open(O + '/10-extensions.tsv', 'w', encoding='utf-8') as w:
    w.write('ext\tkeys\tL0_bytes\tL1_distinct\tL1_bytes(no-md5 counted as distinct)\tL0_GB\tL1_GB\n')
    for e, v in sorted(ext.items(), key=lambda x: -x[1][1]):
        w.write('%s\t%d\t%d\t%d\t%d\t%.3f\t%.3f\n' % (e, v[0], v[1], v[2], v[3], v[1] / GB, v[3] / GB))

# global distinct list for later sampling: md5, size, first key, family, ext
with open(O + '/10-distinct.tsv', 'w', encoding='utf-8') as w:
    for (h, s), (t, k) in first.items():
        w.write('%s\t%d\t%s\t%s\t%s\n' % (h, s, family(version_folder(k)), ext_of(k), k))
with open(O + '/10-no-md5-keys.tsv', 'w', encoding='utf-8') as w:
    for k in sorted(nm):
        w.write('%s\t%d\t%s\n' % (k, bucket[k][0], bucket[k][1]))

num = {
    'bucket_keys': len(bucket), 'L0_bytes': L0, 'md5_keys': len(md5), 'md5_keys_missing_from_bucket': len(missing),
    'md5_size_mismatch': len(size_mismatch), 'no_md5_keys': len(nm), 'no_md5_bytes': nomd5_b,
    'distinct_md5_size': len(first), 'L1_global_bytes_md5_only': L1g,
    'L1_global_bytes_if_no_md5_all_distinct': L1g + nomd5_b,
    'families': len(fam),
}
json.dump(num, open(O + '/10-numbers.json', 'w'), indent=1)
print(json.dumps(num, indent=1))
for f, r in rows[:40]:
    print('%-50s v=%3d keys=%7d L0=%7.3f L1w=%7.3f L1g=%7.3f nomd5=%.3f' % (
        f, len(r['versions']), r['keys'], r['L0'] / GB, r['L1_within'] / GB, r['L1_global_attr'] / GB, r['nomd5_bytes'] / GB))
