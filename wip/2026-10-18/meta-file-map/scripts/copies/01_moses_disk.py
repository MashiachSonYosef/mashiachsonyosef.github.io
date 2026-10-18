# 01_moses_disk.py - Moses's disk (CLB and FS) against R2, by content where proofs exist.
# Read only. Inputs are Moses's delete ledger v1 files (downloaded earlier) and the bucket listings.
# Run: python3 -I 01_moses_disk.py
import json, os, collections, re, glob, sys

S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
L = S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1'
B = L + '/build'
OUT = S + '/meta/copies/out'
os.makedirs(OUT, exist_ok=True)

def jl(p):
    with open(p, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                yield json.loads(line)

# ---------- R2 tables ----------
md5 = {}            # key -> (md5, size)   17 Oct snapshot
for line in open(L + '/verify-proof-r3/out/02-r2-md5.tsv', encoding='utf-8'):
    m, sz, k = line.rstrip('\n').split('\t', 2)
    md5[k] = (m, int(sz))
bucket = {}         # key -> size          18 Oct listing
for line in open(S + '/clean/bucket-now2.tsv', encoding='utf-8'):
    k, sz, lm = line.rstrip('\n').split('\t')
    bucket[k] = int(sz)

# ---------- local units ----------
units = {}
for u in jl(B + '/out/units-local.jsonl'):
    units[u['item']] = u
jobs = json.load(open(B + '/out/sweep-jobs.json'))['jobs']
job_by_src = {j['src']: j for j in jobs}

def unit_of(path):
    p = path
    while True:
        if p in units:
            return p
        if '/' not in p:
            return None
        p = p.rsplit('/', 1)[0]

# ---------- rclone check lines ----------
per_unit = collections.defaultdict(lambda: collections.Counter())
local_md5 = {}      # md5 -> size, content proved present on Moses's disk
eq_keys = set()
line_counts = collections.Counter()
no_size = 0
for j in jobs:
    f = B + '/proofs/check/' + j['job'] + '.combined.txt'
    if not os.path.exists(f):
        line_counts['missing_combined_file'] += 1
        continue
    for line in open(f, encoding='utf-8'):
        line = line.rstrip('\n')
        if not line:
            continue
        st, rel = line[0], line[2:]
        line_counts[st] += 1
        path = j['src'] + '/' + rel
        un = unit_of(path) or ('?' + j['src'])
        c = per_unit[un]
        c[st + '_files'] += 1
        if st == '=':
            key = j['dst'] + '/' + rel
            if key in md5:
                m, sz = md5[key]
                c['=_bytes'] += sz
                local_md5[m] = sz
                eq_keys.add(key)
            elif key in bucket:
                c['=_bytes'] += bucket[key]
            else:
                no_size += 1

# ---------- scratch units: per-file proofs ----------
files = {r['path']: r for r in jl(B + '/proofs/scratch/files.jsonl')}
scr = collections.defaultdict(lambda: collections.Counter())
for r in jl(B + '/proofs/scratch/matches.jsonl'):
    f = files.get(r['path'])
    sz = f['size'] if f else 0
    un = f['unit'] if f else unit_of(r['path'])
    k = r['how'] + ':' + r['outcome']
    scr[un][k + '_files'] += 1
    scr[un][k + '_bytes'] += sz
    if f and f.get('md5'):
        if r['outcome'] == 'ON_R2':
            local_md5[f['md5']] = sz
        else:
            local_md5.setdefault(f['md5'], sz)

# ---------- per build table ----------
ledger = {r['item']: r for r in jl(B + '/ledger/delete-ledger-v1.jsonl')}
build_rows = collections.OrderedDict()
tot = collections.Counter()
shipment = {}
for line in open(L + '/inventory-r2/out/shipment-to-local.tsv', encoding='utf-8').read().splitlines()[1:]:
    c = line.split('\t')
    b = c[1].rstrip('/').split('/')[-1]
    shipment[b] = dict(r2_group=c[0], r2_bytes=int(c[2]), same_path_same_size_bytes=int(c[8]), local_bytes=int(c[4]))

def r2_sum(prefix):
    n = b = 0
    for k, sz in bucket.items():
        if k.startswith(prefix):
            n += 1; b += sz
    return n, b

# index bucket by first two segments for speed
by2 = collections.defaultdict(lambda: [0, 0])
for k, sz in bucket.items():
    parts = k.split('/')
    if len(parts) >= 3 and parts[0] == 'corpus-lane-builds':
        p = parts[0] + '/' + parts[1] + '/'
    elif len(parts) >= 2:
        p = parts[0] + '/' + parts[1] + '/' if parts[0] == 'moses-ledgers' else parts[0] + '/'
    else:
        p = parts[0]
    by2[p][0] += 1; by2[p][1] += sz

for item, u in units.items():
    if u['where'] != 'local-CLB':
        continue
    b = u.get('build_folder') or '(root files)'
    row = build_rows.setdefault(b, collections.Counter())
    bytes_ = u['bytes'] or 0
    row['local_bytes'] += bytes_
    row['local_files'] += u['files'] or 0
    row['hardlinked_bytes'] += u.get('hardlinked_bytes') or 0
    if not u.get('measured', True):
        row['unmeasured_units'] += 1
        tot['unmeasured_units'] += 1
        continue
    if u.get('scratch_unit'):
        s = scr.get(item, collections.Counter())
        row['scratch_bytes'] += bytes_
        row['scratch_on_r2_hash_bytes'] += s['hash:ON_R2_bytes']
        row['scratch_on_r2_identity_bytes'] += s['identity:ON_R2_bytes']
        row['scratch_none_bytes'] += s['hash:NONE_bytes']
        row['scratch_none_files'] += s['hash:NONE_files']
        row['scratch_repro_local_bytes'] += s['identity:REPRODUCED_LOCALLY_bytes']
        continue
    src = 'CLB/' + b
    if src in job_by_src:
        c = per_unit.get(item, collections.Counter())
        row['swept_bytes'] += bytes_
        row['eq_bytes'] += c['=_bytes']
        row['eq_files'] += c['=_files']
        row['plus_files'] += c['+_files']
        row['star_files'] += c['*_files']
        row['swept_not_eq_bytes'] += max(0, bytes_ - c['=_bytes'])
        row['swept_eq_overcount_bytes'] += max(0, c['=_bytes'] - bytes_)
    else:
        row['unswept_bytes'] += bytes_

# R2 side per build
for b, row in build_rows.items():
    n, s = by2.get('corpus-lane-builds/' + b + '/', [0, 0])
    row['r2_clb_objects'] = n; row['r2_clb_bytes'] = s
    stem = b[len('moses-'):] if b.startswith('moses-') else b
    n, s = by2.get('moses-ledgers/' + stem + '/', [0, 0])
    row['r2_ledgers_objects'] = n; row['r2_ledgers_bytes'] = s
    n, s = by2.get(b + '/', [0, 0])
    row['r2_toplevel_objects'] = n; row['r2_toplevel_bytes'] = s
    if b in shipment:
        row['unswept_same_path_same_size_bytes'] = shipment[b]['same_path_same_size_bytes']

cols = ['local_bytes', 'local_files', 'hardlinked_bytes', 'eq_bytes', 'eq_files', 'plus_files', 'star_files',
        'swept_not_eq_bytes', 'scratch_bytes', 'scratch_on_r2_hash_bytes', 'scratch_on_r2_identity_bytes',
        'scratch_none_bytes', 'scratch_none_files', 'scratch_repro_local_bytes', 'unswept_bytes',
        'unswept_same_path_same_size_bytes', 'unmeasured_units', 'r2_clb_objects', 'r2_clb_bytes',
        'r2_ledgers_objects', 'r2_ledgers_bytes', 'r2_toplevel_objects', 'r2_toplevel_bytes']
with open(OUT + '/clb-by-build.tsv', 'w', encoding='utf-8') as f:
    f.write('build\t' + '\t'.join(c + ('' if c.endswith('s') else '') for c in cols) + '\n')
    for b, row in sorted(build_rows.items(), key=lambda x: -x[1]['local_bytes']):
        f.write(b + '\t' + '\t'.join(str(row[c]) for c in cols) + '\n')
        for c in cols:
            tot[c] += row[c]

# ---------- FS ----------
fs_items = [u for u in units.values() if u['where'] == 'local-FS']
fs_job = per_unit  # FS/corpus-lane-builds only
fs_c = collections.Counter()
for item, c in per_unit.items():
    if item.startswith('FS/') or item.startswith('?FS/'):
        fs_c.update(c)

# ---------- hard links ----------
inv_tot = json.load(open(L + '/inventory-local/out/totals.json'))

# ---------- R2 distinct content vs local-known hashes ----------
dist = {}
for k, (m, sz) in md5.items():
    dist.setdefault(m, [sz, 0, 0, k])
    dist[m][1] += 1
    dist[m][2] += sz
r2_distinct_bytes = sum(v[0] for v in dist.values())
r2_known_local = sum(v[0] for m, v in dist.items() if m in local_md5)
r2_known_local_n = sum(1 for m in dist if m in local_md5)
# by top-level prefix: distinct content not known locally (attributed to first key of the md5 group)
not_local_by_top = collections.Counter()
not_local_by_top_n = collections.Counter()
for m, v in dist.items():
    if m in local_md5:
        continue
    top = v[3].split('/')[0]
    not_local_by_top[top] += v[0]
    not_local_by_top_n[top] += 1

# first key of md5 group is arbitrary; also do "every copy of the content lies under this top-level prefix"
only_under = collections.Counter()
tops_of = collections.defaultdict(set)
for k, (m, sz) in md5.items():
    tops_of[m].add(k.split('/')[0])
for m, v in dist.items():
    if m in local_md5:
        continue
    t = tops_of[m]
    only_under[next(iter(t)) if len(t) == 1 else '(several prefixes)'] += v[0]

res = dict(
    axis='bytes [bytes]; files [files]; objects [objects]',
    rclone_check_lines=dict(line_counts), eq_lines_without_r2_size=no_size,
    clb_totals_from_inventory=inv_tot['by_root']['CLB'],
    fs_totals_from_inventory=inv_tot['by_root']['FS'],
    clb_table_totals=dict(tot),
    fs_corpus_lane_builds_check=dict(fs_c),
    scratch_outcomes={k: sum(v[k] for v in scr.values()) for k in set().union(*[set(v) for v in scr.values()])},
    local_known_md5_distinct=len(local_md5), local_known_md5_bytes=sum(local_md5.values()),
    r2_md5_keys=len(md5), r2_md5_bytes=sum(v[1] for v in md5.values()),
    r2_distinct_md5=len(dist), r2_distinct_bytes=r2_distinct_bytes,
    r2_distinct_known_on_moses_disk=r2_known_local_n, r2_distinct_known_on_moses_disk_bytes=r2_known_local,
    r2_distinct_not_known_on_moses_disk_bytes=r2_distinct_bytes - r2_known_local,
    r2_distinct_not_known_local_by_sole_top_prefix=dict(only_under.most_common()),
)
json.dump(res, open(OUT + '/01-moses-disk.json', 'w'), indent=1)
with open(OUT + '/local-known-md5.tsv', 'w') as f:
    for m, sz in local_md5.items():
        f.write('%s\t%d\n' % (m, sz))
print(json.dumps(res, indent=1))
