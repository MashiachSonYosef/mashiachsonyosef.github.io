# Aggregates for REPORT.md: families, top families, the current set, nested copies, inner rounds, relays.
# Reads builds.tsv, builds-extra.tsv, nested-copies.tsv, the bucket listing and the md5 table (+ ETags).
import csv, collections, json, re
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
OUT = S + '/meta/census'
import importlib.util
spec = importlib.util.spec_from_file_location('census_units', OUT + '/scripts/census.py')

B = list(csv.DictReader(open(OUT + '/builds.tsv', encoding='utf-8'), delimiter='\t'))
E = {r['unit_prefix']: r for r in csv.DictReader(open(OUT + '/builds-extra.tsv', encoding='utf-8'), delimiter='\t')}
bu = {r['unit_prefix']: r for r in B}

# content per unit again (to aggregate by family and by status)
md5 = {}
for l in open(S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv', encoding='utf-8'):
    h, s, k = l.rstrip('\n').split('\t', 2); md5[k] = h
for f in ('corpus-lane-builds_moses-dictionary-store-v1_.tsv', 'corpus-lane-builds_moses-delete-ledger-v1_.tsv'):
    for l in open(OUT + '/etag/' + f, encoding='utf-8'):
        k, s, t, e = l.rstrip('\n').split('\t'); md5.setdefault(k, e)
# unit of a key: longest unit prefix that matches (units are prefixes, except the editions catch-all and root files)
prefixes = sorted([u for u in bu if not u.startswith('editions-built-v1/[')], key=len, reverse=True)
def unit_of(k):
    p = k.split('/')
    if len(p) == 1: return k
    if p[0] in ('corpus-lane-builds', 'moses-ledgers', 'corpus-staging'):
        return p[0] + '/(own files)' if len(p) == 2 else p[0] + '/' + p[1] + '/'
    if p[0] == 'editions-built-v1':
        return 'editions-built-v1/' + p[1] + '/' if p[1] in ('pby-wave', 'h1-canon', 'tanakh-editions') else 'editions-built-v1/[4,031 work folders]/'
    if p[0] == 'cold': return 'cold/' + p[1] if len(p) == 2 else 'cold/' + p[1] + '/'
    if p[0] in ('serving-lane', 'serving-lane-handoffs', 'retired'): return p[0] + '/' + p[1] + '/'
    if p[0] == 'mishkan': return 'mishkan/' + p[1] + '/' + p[2] + '/'
    return p[0] + '/'
size_of = {}; md5_units = collections.defaultdict(set); unit_md5 = collections.defaultdict(set)
rows = []
for l in open(S + '/clean/bucket-now2.tsv', encoding='utf-8'):
    k, s, t = l.rstrip('\n').split('\t'); s = int(s)
    u = unit_of(k); h = md5[k]
    size_of[h] = s; md5_units[h].add(u); unit_md5[u].add(h); rows.append((k, s, u, h))
assert set(unit_md5) == set(bu), 'unit sets differ'

fam = {u: r['family'] for u, r in bu.items()}
fam_units = collections.defaultdict(list)
for u in bu: fam_units[fam[u]].append(u)
md5_fams = collections.defaultdict(set)
for h, us in md5_units.items():
    for u in us: md5_fams[h].add(fam[u])
F = []
for f, us in fam_units.items():
    hs = set().union(*(unit_md5[u] for u in us))
    F.append({
        'family': f, 'units': len(us),
        'versions': ','.join(sorted((bu[u]['version'] or '-') for u in us)),
        'statuses': ','.join('%s:%d' % kv for kv in sorted(collections.Counter(bu[u]['status'] for u in us).items())),
        'roles': ','.join(sorted({bu[u]['role'] for u in us})),
        'keys': sum(int(bu[u]['keys']) for u in us),
        'bytes': sum(int(bu[u]['bytes']) for u in us),
        'distinct_bytes_within_family': sum(size_of[h] for h in hs),
        'bytes_unique_to_family': sum(size_of[h] for h in hs if len(md5_fams[h]) == 1),
        'first': min(bu[u]['first_modified'] for u in us), 'last': max(bu[u]['last_modified'] for u in us),
        'units_list': ' '.join(sorted(us)),
    })
F.sort(key=lambda x: -x['bytes'])
cols = ['family', 'units', 'versions', 'statuses', 'roles', 'keys', 'bytes', 'distinct_bytes_within_family', 'bytes_unique_to_family', 'first', 'last', 'units_list']
with open(OUT + '/families.tsv', 'w', encoding='utf-8') as f:
    f.write('\t'.join(cols) + '\n')
    for x in F: f.write('\t'.join(str(x[c]) for c in cols) + '\n')

def union_distinct(us):
    hs = set().union(*(unit_md5[u] for u in us)) if us else set()
    return sum(size_of[h] for h in hs), len(hs)
by_status = collections.defaultdict(list)
for u, r in bu.items(): by_status[r['status']].append(u)
cur = by_status['current']
cur_kind = collections.defaultdict(list)
for u in cur: cur_kind[bu[u]['evidence_for_status'].split(':')[0].split(' (')[0]].append(u)
# bytes reachable only from non-current units = what a "keep the current set" would leave unrepresented
cur_hs = set().union(*(unit_md5[u] for u in cur))
noncur_hs = set().union(*(unit_md5[u] for u in bu if bu[u]['status'] != 'current'))
res = {
    'units': len(bu), 'families': len(F),
    'units_by_status': {s: len(v) for s, v in by_status.items()},
    'bytes_by_status': {s: sum(int(bu[u]['bytes']) for u in v) for s, v in by_status.items()},
    'distinct_bytes_by_status_union': {s: union_distinct(v)[0] for s, v in by_status.items()},
    'units_by_role': dict(collections.Counter(r['role'] for r in B)),
    'bytes_by_role': {ro: sum(int(r['bytes']) for r in B if r['role'] == ro) for ro in {r['role'] for r in B}},
    'current_by_kind': {k: {'units': len(v), 'bytes': sum(int(bu[u]['bytes']) for u in v), 'distinct_bytes_union': union_distinct(v)[0], 'list': sorted(v)} for k, v in cur_kind.items()},
    'current_total_bytes': sum(int(bu[u]['bytes']) for u in cur),
    'current_distinct_bytes_union': union_distinct(cur)[0],
    'noncurrent_content_not_in_current_bytes': sum(size_of[h] for h in noncur_hs - cur_hs),
    'noncurrent_content_also_in_current_bytes': sum(size_of[h] for h in noncur_hs & cur_hs),
    'bucket_distinct_bytes': sum(size_of.values()), 'bucket_distinct_objects': len(size_of),
    'families_with_more_than_one_unit': sum(1 for x in F if x['units'] > 1),
}
# families: top 20 by bytes and by unique bytes
res['top20_families_by_bytes'] = [(x['family'], x['units'], x['bytes'], x['distinct_bytes_within_family'], x['bytes_unique_to_family'], x['statuses']) for x in F[:20]]
res['top20_families_by_unique'] = [(x['family'], x['units'], x['bytes'], x['distinct_bytes_within_family'], x['bytes_unique_to_family'], x['statuses']) for x in sorted(F, key=lambda x: -x['bytes_unique_to_family'])[:20]]
# nested copies
N = list(csv.DictReader(open(OUT + '/nested-copies.tsv', encoding='utf-8'), delimiter='\t'))
res['nested'] = {
    'keys': len(N), 'bytes': sum(int(r['bytes']) for r in N),
    'by_verdict': {v: sum(int(r['bytes']) for r in N if r['verdict'] == v) for v in {r['verdict'] for r in N}},
    'holders_top': collections.Counter({r['holder_unit']: 0 for r in N}),
}
hb = collections.Counter(); tb = collections.Counter(); pairs = set()
for r in N: hb[r['holder_unit']] += int(r['bytes']); tb[r['named_build']] += int(r['bytes']); pairs.add((r['holder_unit'], r['named_build']))
res['nested']['holders_top'] = hb.most_common(12); res['nested']['named_top'] = tb.most_common(12)
res['nested']['holder_units'] = len(hb); res['nested']['pairs'] = len(pairs)
# zone bytes: copy zones (gate/mirror/shadow/sandbox) and other inner roles, bucket-wide
ROLE_COLS = [c for c in next(iter(E.values())).keys() if c.startswith('bytes_in:')]
res['inner_role_bytes'] = {c[9:]: sum(int(E[u][c]) for u in E) for c in ROLE_COLS}
# inner rounds inside build folders (level-3 directories with round-like names)
RND = re.compile(r'^(build|ship|verify|strand|gate|candidate|v\d|stage|mend|run|attempt|round|seat|lens)', re.I)
rounds = collections.defaultdict(set)
for k, s, u, h in rows:
    p = k.split('/')
    if p[0] in ('corpus-lane-builds', 'moses-ledgers') and len(p) > 3 and RND.match(p[2]): rounds[u].add(p[2])
res['inner_round_dirs'] = sum(len(v) for v in rounds.values())
res['inner_round_dirs_by_kind'] = dict(collections.Counter(re.match(RND, d).group(1).lower() if not re.match(r'^v\d', d) else 'v<N>' for v in rounds.values() for d in v))
# relays: distinct relay numbers and keys
rel = set(); relkeys = 0
for k, s, u, h in rows:
    m = re.search(r'FOR-ELIJAH-v(\d+(?:\.\d+)*)', k.rsplit('/', 1)[-1])
    if m: rel.add(m.group(1)); relkeys += 1
res['relay_numbers_distinct'] = len(rel); res['relay_keys'] = relkeys
res['relay_numbers_major'] = len({r.split('.')[0] for r in rel})
json.dump(res, open(OUT + '/report-numbers.json', 'w'), indent=1, default=list)
def gb(x): return '%.3f' % (x / 1e9)
print('units', res['units'], 'families', res['families'], 'multi-unit families', res['families_with_more_than_one_unit'])
print('by status', res['units_by_status'], {k: gb(v) for k, v in res['bytes_by_status'].items()}, {k: gb(v) for k, v in res['distinct_bytes_by_status_union'].items()})
print('current', gb(res['current_total_bytes']), 'distinct', gb(res['current_distinct_bytes_union']))
for k, v in res['current_by_kind'].items(): print('  ', k, v['units'], gb(v['bytes']), gb(v['distinct_bytes_union']))
print('noncurrent not in current', gb(res['noncurrent_content_not_in_current_bytes']), 'noncurrent also in current', gb(res['noncurrent_content_also_in_current_bytes']))
print('bucket distinct', gb(res['bucket_distinct_bytes']), res['bucket_distinct_objects'])
print('nested', res['nested']['keys'], gb(res['nested']['bytes']), {k: gb(v) for k, v in res['nested']['by_verdict'].items()}, 'holders', res['nested']['holder_units'], 'pairs', res['nested']['pairs'])
print('inner roles', {k: gb(v) for k, v in res['inner_role_bytes'].items()})
print('rounds', res['inner_round_dirs'], res['inner_round_dirs_by_kind'])
print('relays', res['relay_numbers_distinct'], res['relay_numbers_major'], res['relay_keys'])
print('roles', res['units_by_role'])
print({k: gb(v) for k, v in res['bytes_by_role'].items()})
print('TOP BYTES'); [print('  %-40s %2d %8s %8s %8s %s' % (a, b, gb(c), gb(d), gb(e), f)) for a, b, c, d, e, f in res['top20_families_by_bytes']]
print('TOP UNIQUE'); [print('  %-40s %2d %8s %8s %8s %s' % (a, b, gb(c), gb(d), gb(e), f)) for a, b, c, d, e, f in res['top20_families_by_unique']]

# set arithmetic by status: content held by one status group and no other
grp = {s: set().union(*(unit_md5[u] for u in v)) for s, v in by_status.items()}
only = {}
for s, hs in grp.items():
    others = set().union(*(grp[t] for t in grp if t != s))
    only[s] = sum(size_of[h] for h in hs - others)
print('content held only by units of one status (distinct bytes):', {s: gb(v) for s, v in only.items()})
sup_in_cur = sum(size_of[h] for h in grp['superseded'] & grp['current'])
print('superseded content also inside current units:', gb(sup_in_cur))
res['content_only_in_status'] = only; res['superseded_content_also_in_current'] = sup_in_cur
json.dump(res, open(OUT + '/report-numbers.json', 'w'), indent=1, default=list)
