# Merge refs-raw.tsv (the text scan) and refs-special.tsv (expanded pins, keep rules, ledger mentions) into
# refs.tsv, de-duplicated, and write the numbers the report quotes to summary-numbers.json. Read-only on inputs.
import json, re, collections, importlib.util
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
R = S + '/meta/readers'
def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
rl = load('rlib', R + '/scripts/rlib.py')
B = rl.Bucket()
HDR = ['referencing_file', 'referenced_key_or_prefix', 'kind', 'hash_algo_if_pinned', 'holder', 'form', 'resolves_now', 'literal_resolves', 'scope', 'where', 'detail', 'pin_value']
rows = []
for fn, skip in (('refs-raw.tsv', 1), ('refs-special.tsv', 0)):
    with open(R + '/' + fn, encoding='utf-8') as f:
        for i, l in enumerate(f):
            if i < skip: continue
            p = l.rstrip('\n').split('\t')
            if len(p) != len(HDR): continue
            rows.append(p)
# (1) Moses pushes ten local build folders to moses-ledgers/<name without moses-> (r2-push-suite receipts:
#     "moses-toggle-builds-v1 -> moses-ledgers/toggle-builds-v1"). A mention of such a folder that does not
#     resolve under corpus-lane-builds/ is resolved again through that map.
PUSHMAP = {}
import glob
for f in glob.glob(R + '/dl/r2-push-suite/**/*.txt', recursive=True):
    for l in open(f, encoding='utf-8', errors='replace'):
        m = re.match(r'^\s*(moses-[A-Za-z0-9._-]+) -> (moses-ledgers/[A-Za-z0-9._/-]+) \|', l)
        if m: PUSHMAP[m.group(1)] = m.group(2)
npm = 0
for r in rows:
    if r[6] == 'absent' and r[1].startswith('corpus-lane-builds/'):
        p = r[1].split('/')
        if len(p) > 1 and p[1] in PUSHMAP:
            q = PUSHMAP[p[1]] + ('/' + '/'.join(p[2:]) if len(p) > 2 and p[2] else '')
            q = q.rstrip('/'); st = B.status(q)
            if st != 'absent':
                r[1] = q + ('/' if st == 'prefix' else ''); r[6] = st; r[5] = r[5] + '+pushmap'; npm += 1
                r[8] = 'outside-builds'
# (2) a recorded input that carries a hash is a hash pin (the record ties the path to bytes); tool-read stays for
#     code and tool configuration, and for recorded inputs without a hash
nre = 0
for r in rows:
    if r[2] == 'tool-read' and r[10].startswith('recorded input') and r[3] != 'none':
        r[2] = 'hash-pin'; nre += 1
# de-duplicate on the first six columns (one row per referencing file, target, kind, algo, holder, form)
seen = set(); out = []
for r in rows:
    k = tuple(r[:6])
    if k in seen: continue
    seen.add(k); out.append(r)
rows = out
with open(R + '/refs.tsv', 'w', encoding='utf-8') as f:
    f.write('\t'.join(HDR) + '\n')
    for r in rows: f.write('\t'.join(r) + '\n')

N = {}
def C(): return collections.Counter()
N['rows'] = len(rows)
N['referencing_files'] = len({r[0] for r in rows})
kh = collections.defaultdict(C)
for r in rows: kh[r[2]][r[4]] += 1
N['by_kind_holder'] = {k: dict(v) for k, v in kh.items()}
N['by_kind'] = dict(collections.Counter(r[2] for r in rows))
N['by_holder'] = dict(collections.Counter(r[4] for r in rows))
N['by_algo'] = dict(collections.Counter(r[3] for r in rows))
N['by_algo_holder'] = {a: dict(collections.Counter(r[4] for r in rows if r[3] == a)) for a in N['by_algo']}
N['by_form'] = dict(collections.Counter(r[5] for r in rows))
N['by_resolves'] = dict(collections.Counter(r[6] for r in rows))
N['by_resolves_holder'] = {h: dict(collections.Counter(r[6] for r in rows if r[4] == h)) for h in N['by_holder']}
N['literal_differs'] = sum(1 for r in rows if r[6] != r[7])
N['literal_absent_but_normalized_resolves'] = sum(1 for r in rows if r[7] == 'absent' and r[6] != 'absent')
N['by_scope_holder'] = {h: dict(collections.Counter(r[8] for r in rows if r[4] == h)) for h in N['by_holder']}
N['files_by_holder'] = {h: len({r[0] for r in rows if r[4] == h}) for h in N['by_holder']}

def area(ref):
    p = ref.split('/')
    if p[0] == 'corpus-lane-builds':
        return 'corpus-lane-builds/' + p[1] + '/' if len(p) > 1 and p[1] else 'corpus-lane-builds/'
    return p[0] + ('/' if len(p) > 1 else '')
tops = collections.defaultdict(lambda: [0, set(), set()])
for r in rows:
    t = r[1].split('/')[0] + ('/' if '/' in r[1] else '')
    tops[t][0] += 1; tops[t][1].add(r[1]); tops[t][2].add(r[0])
N['top_prefixes'] = {t: {'rows': v[0], 'distinct_targets': len(v[1]), 'referencing_files': len(v[2])} for t, v in sorted(tops.items(), key=lambda x: -x[1][0])}
allb = {'corpus-lane-builds/' + b + '/' for b in B.builds}
N['builds_on_r2'] = len(allb)
bbytes = collections.Counter()
for k, s in B.keys.items():
    if k.startswith('corpus-lane-builds/') and k.count('/') >= 2: bbytes[area(k)] += s
# who references each build from outside itself. Inventories (the delete ledger, the ledgers of ledgers, the root
# index) name every build by design, so they are counted apart.
INVENTORY = re.compile(r'^(corpus-lane-builds/(moses-delete-ledger-v1|moses-ledger-of-ledgers-v[0-9.]+)/|MOSES-LEDGER-INDEX\.md$)')
live = json.load(open(S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/build/mend-r3/live-builds.json', encoding='utf-8'))
current_relays = set()
for b, v in live['builds'].items():
    for c in v.get('current_relays') or []:
        current_relays.add('corpus-lane-builds/' + c['path'][4:] if c['path'].startswith('CLB/') else c['path'])
N['current_relays_listed_by_delete_ledger'] = len(current_relays)
refby = collections.defaultdict(set)
dangling_builds = set()
for r in rows:
    if not r[1].startswith('corpus-lane-builds/'): continue
    b = area(r[1])
    if b not in allb:
        dangling_builds.add(b); continue
    hb = area(r[0]) if r[0].startswith('corpus-lane-builds/') else None
    if hb == b: continue
    if INVENTORY.match(r[0]): cat = 'inventory'
    elif r[4] in ('site', 'notes'): cat = r[4]
    elif r[0] in current_relays: cat = 'current-relay'
    elif r[4] == 'nested-build': cat = 'nested-copy'
    elif r[4] == 'relay': cat = 'other-relay'
    else: cat = 'other-build-record'
    refby[b].add(cat)
N['builds_named_but_not_on_r2'] = len(dangling_builds - {'corpus-lane-builds/'})
cats = ['site', 'notes', 'current-relay', 'other-relay', 'other-build-record', 'nested-copy', 'inventory']
N['builds_referenced_by'] = {c: len([b for b in allb if c in refby[b]]) for c in cats}
N['builds_referenced_by_bytes'] = {c: sum(bbytes[b] for b in allb if c in refby[b]) for c in cats}
only_inv = [b for b in allb if refby[b] <= {'inventory'}]
cur = [b for b in allb if refby[b] & {'site', 'notes', 'current-relay'}]
N['builds_named_by_site_notes_or_current_relay'] = len(cur)
N['builds_named_by_site_notes_or_current_relay_bytes'] = sum(bbytes[b] for b in cur)
only_old = [b for b in allb if not (refby[b] & {'site', 'notes', 'current-relay'})]
N['builds_named_only_by_older_records'] = len(only_old)
N['builds_named_only_by_older_records_bytes'] = sum(bbytes[b] for b in only_old)
N['builds_bytes_total'] = sum(bbytes[b] for b in allb)
N['builds_named_only_by_inventories_or_nothing'] = len(only_inv)
N['builds_named_only_by_inventories_or_nothing_bytes'] = sum(bbytes[b] for b in only_inv)
N['builds_site_references'] = sorted(b for b in allb if 'site' in refby[b])
N['builds_site_references_bytes'] = sum(bbytes[b] for b in allb if 'site' in refby[b])
with open(R + '/builds-referenced.tsv', 'w', encoding='utf-8') as f:
    f.write('build\tbytes_on_r2\treferenced_from_outside_by\n')
    for b in sorted(allb): f.write('%s\t%d\t%s\n' % (b, bbytes[b], ','.join(c for c in cats if c in refby[b]) or '(nothing outside itself)'))

# per top/build: rows by kind for the site
site_rows = [r for r in rows if r[4] == 'site']
N['site_by_file_top'] = collections.Counter(r[0] for r in site_rows).most_common(40)
N['site_targets_by_area_kind'] = {a: dict(c) for a, c in sorted(((a, collections.Counter(r[2] + '/' + r[3] for r in site_rows if area(r[1]) == a)) for a in {area(r[1]) for r in site_rows}), key=lambda x: -sum(x[1].values()))}
# the three consolidation classes
def cls(r):
    ref, kind, algo, holder, detail = r[1], r[2], r[3], r[4], r[10]
    if kind == 'runtime-fetch' or detail.startswith('live R2') or detail.startswith('restore-shelf'):
        return 'A-must-stay-real-key'
    if r[5] == 'keep-rule' and not ref.startswith('corpus-lane-builds/'):
        return 'A-must-stay-real-key'
    if algo != 'none': return 'C-hash-pin-must-verify'
    return 'B-meta-lookup-ok'
cc = collections.defaultdict(C)
for r in rows: cc[cls(r)][r[4]] += 1
N['consolidation_class_by_holder'] = {k: dict(v) for k, v in sorted(cc.items())}
N['consolidation_class_in_builds'] = dict(collections.Counter(cls(r) for r in rows if r[1].startswith('corpus-lane-builds/')))
N['consolidation_class_outside_builds'] = dict(collections.Counter(cls(r) for r in rows if not r[1].startswith('corpus-lane-builds/')))
N['A_targets'] = sorted({(r[1] if not r[1].startswith('serving-lane/shelf/zones/') else 'serving-lane/shelf/zones/<3,594 pins>') for r in rows if cls(r) == 'A-must-stay-real-key'})
N['pins_by_algo_scope'] = {a: dict(collections.Counter(r[8] for r in rows if r[3] == a)) for a in N['by_algo'] if a != 'none'}
N['pins_absent_now'] = dict(collections.Counter(r[4] for r in rows if r[3] != 'none' and r[6] == 'absent'))
N['absent_by_holder_form'] = {h: dict(collections.Counter(r[5] for r in rows if r[4] == h and r[6] == 'absent')) for h in N['by_holder']}
N['tool_read_detail'] = dict(collections.Counter((r[4], r[10][:60]) for r in rows if r[2] == 'tool-read').most_common(30))
N['tool_read_detail'] = {' | '.join(k): v for k, v in N['tool_read_detail'].items()}
json.dump(N, open(R + '/summary-numbers.json', 'w'), indent=1, default=list)
N['pushmap_resolved'] = npm; N['recorded_inputs_with_hash_reclassed_hash_pin'] = nre; N['pushmap'] = PUSHMAP
N['distinct_targets_by_holder'] = {h: len({r[1] for r in rows if r[4] == h}) for h in N['by_holder']}
N['distinct_targets'] = len({r[1] for r in rows})
json.dump(N, open(R + '/summary-numbers.json', 'w'), indent=1, default=list)
print(json.dumps({k: N[k] for k in ('rows', 'referencing_files', 'distinct_targets', 'by_kind', 'by_holder', 'by_algo', 'by_resolves', 'consolidation_class_by_holder', 'builds_on_r2', 'builds_referenced_by', 'builds_named_by_site_notes_or_current_relay', 'builds_named_by_site_notes_or_current_relay_bytes', 'builds_named_only_by_older_records', 'builds_named_only_by_older_records_bytes', 'builds_bytes_total', 'pushmap_resolved', 'recorded_inputs_with_hash_reclassed_hash_pin')}, indent=1))
