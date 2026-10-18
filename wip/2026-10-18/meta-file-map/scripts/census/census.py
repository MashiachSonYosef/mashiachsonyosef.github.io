# THE CENSUS OF BUILDS (serving lane, read-only).
# Reads the bucket listing, the md5 table (plus ETags listed for the 5,636 keys the table lacks),
# the corpus lane's relay inventory, and the census's own status table; writes builds.tsv and the
# side tables beside it.  Never touches R2.  Run: python3 -I census.py
import collections, json, os, re, sys

S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
OUT = S + '/meta/census'
BUCKET = S + '/clean/bucket-now2.tsv'
MD5 = S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv'
ETAGS = [OUT + '/etag/corpus-lane-builds_moses-dictionary-store-v1_.tsv',
         OUT + '/etag/corpus-lane-builds_moses-delete-ledger-v1_.tsv']
RELAYS = OUT + '/_relay-status.tsv'          # from the corpus lane's inventory-local/out/build-folders.jsonl
STATUS = OUT + '/status-table.tsv'           # hand-written: unit_prefix -> status, role, evidence

# ---------------------------------------------------------------- load
rows = []
for l in open(BUCKET, encoding='utf-8'):
    k, s, t = l.rstrip('\n').split('\t')
    rows.append((k, int(s), t))
md5 = {}
for l in open(MD5, encoding='utf-8'):
    h, s, k = l.rstrip('\n').split('\t', 2)
    md5[k] = h
etag_filled = 0
for f in ETAGS:
    for l in open(f, encoding='utf-8'):
        k, s, t, e = l.rstrip('\n').split('\t')
        if k not in md5 and re.fullmatch(r'[0-9a-f]{32}', e):
            md5[k] = e; etag_filled += 1
missing = [k for k, s, t in rows if k not in md5]
assert not missing, ('keys with no content hash', len(missing), missing[:3])

# ---------------------------------------------------------------- units
EDB_SUBS = {'pby-wave', 'h1-canon', 'tanakh-editions'}
def unit_of(k):
    p = k.split('/')
    if len(p) == 1: return k                                   # a root file is its own unit
    top = p[0]
    if top in ('corpus-lane-builds', 'moses-ledgers', 'corpus-staging'):
        return top + '/(own files)' if len(p) == 2 else top + '/' + p[1] + '/'
    if top == 'editions-built-v1':
        return 'editions-built-v1/' + p[1] + '/' if p[1] in EDB_SUBS else 'editions-built-v1/[4,031 work folders]/'
    if top == 'cold':
        return 'cold/' + p[1] if len(p) == 2 else 'cold/' + p[1] + '/'
    if top in ('serving-lane', 'serving-lane-handoffs', 'retired'):
        return top + '/' + p[1] + '/'
    if top == 'mishkan':
        return 'mishkan/' + p[1] + '/' + p[2] + '/'
    return top + '/'

def leaf(u):
    x = u.rstrip('/').split('/')[-1]
    return x

VER_RE = re.compile(r'^(.*?)-v(\d+(?:\.\d+)*)(-[a-z][a-z0-9-]*)?$')
DATE_RE = re.compile(r'^(.*?)-(\d{8}|\d{4}-\d{2}-\d{2})$')
DATE_SUFFIX_RE = re.compile(r'^(.*?)-(\d{8})(-[a-z][a-z0-9-]*)$')
def fam_ver(u):
    if u.startswith('editions-built-v1/'): return 'editions-built', '1'
    n = leaf(u)
    if n.startswith('('): n = u.split('/')[0] + '-own-files'
    m = re.match(r'^(.*?)\.(tar\.gz|md|json|txt)$', n)
    if m: n = m.group(1).lower()            # a file unit: family from the file name, lowercase, no extension
    m = DATE_SUFFIX_RE.match(n)
    if m: return m.group(1) + m.group(3), m.group(2)
    m = VER_RE.match(n)
    if m: return m.group(1), m.group(2) + (m.group(3) or '')
    m = DATE_RE.match(n)
    if m: return m.group(1), m.group(2)
    return n, ''

units = collections.OrderedDict()
key_unit = {}
for k, s, t in rows:
    u = unit_of(k); key_unit[k] = u
    d = units.get(u)
    if d is None:
        d = units[u] = {'keys': 0, 'bytes': 0, 'first': t, 'last': t, 'md5': {}}
    d['keys'] += 1; d['bytes'] += s
    if t < d['first']: d['first'] = t
    if t > d['last']: d['last'] = t
    d['md5'][md5[k]] = s

# family names: a moses-ledgers/ (or top-level) name without "moses-" joins the moses- family of the same name
fam = {}; ver = {}
for u in units:
    f, v = fam_ver(u); fam[u] = f; ver[u] = v
allfams = set(fam.values())
for u in units:
    if not fam[u].startswith('moses-') and ('moses-' + fam[u]) in allfams:
        fam[u] = 'moses-' + fam[u]

# ---------------------------------------------------------------- content across units
md5_units = collections.defaultdict(set)
md5_size = {}
for u, d in units.items():
    for h, s in d['md5'].items():
        md5_units[h].add(u); md5_size[h] = s
for u, d in units.items():
    d['distinct'] = sum(d['md5'].values())
    d['unique'] = sum(s for h, s in d['md5'].items() if len(md5_units[h]) == 1)
    d['distinct_n'] = len(d['md5'])

# ---------------------------------------------------------------- nested copies and part roles
BUILD_NAMES = {leaf(u) for u in units if re.search(r'-v\d', leaf(u)) and not u.startswith('editions-built-v1/')}
TOP_BUILDS = {u.rstrip('/') for u in units if '/' not in u.rstrip('/') and re.search(r'-v\d', u)}
key_md5 = md5
all_keys = set(key_unit)

def originals(name, rest):
    c = []
    for pre in ('corpus-lane-builds/', 'moses-ledgers/', ''):
        c.append(pre + name + '/' + rest)
    return c

COPYZONE = re.compile(r'^(gate.*|.*-gate|mirror.*|shadow.*|sandbox.*|m\d+|root|tab|lane)$', re.I)
def key_role(inner):
    """role of a key by the directory segments inside its unit, first match in priority order"""
    dirs = [x.lower() for x in inner[:-1]]
    for x in dirs:
        if COPYZONE.match(x): return 'copy-zone (gate/mirror/shadow/sandbox)'
    for x in dirs:
        if x in ('stage', 'staging') or x.startswith('stage-'): return 'stage'
    for x in dirs:
        if x in ('scratch', 'tmp', 'temp', 'work', 'attempt-1', 'runs-replaced') or x.startswith('run-') or x.startswith('run1') or x.startswith('attempt'): return 'scratch/run'
    for x in dirs:
        if x.startswith('verify') or x.startswith('check') or x.startswith('lens') or x.startswith('seat') or x.startswith('review') or x.startswith('recheck') or x.startswith('proof'): return 'verify'
    for x in dirs:
        if x in ('raw', 'collected', 'downloads', 'scans', 'djvu-xml', 'fetch', 'pages', 'images', 'source', 'sources') or 'cache' in x or x.startswith('find-') or x.startswith('enum-') or x.startswith('intake'): return 'raw/source'
    for x in dirs:
        if x.startswith('candidate'): return 'candidate'
    for x in dirs:
        if x.startswith('strand'): return 'strand'
    return 'deliverable/other'

nested = collections.defaultdict(lambda: collections.Counter())      # unit -> counter of bytes by target
nested_keys = collections.Counter()
nested_eq = collections.Counter(); nested_elsewhere = collections.Counter(); nested_only = collections.Counter()
role_bytes = collections.defaultdict(collections.Counter)
nested_rows = []
non_nested_md5 = set()
first_pass = []
for k, s, t in rows:
    u = key_unit[k]; p = k.split('/')
    inner = p[2:] if p[0] in ('corpus-lane-builds', 'moses-ledgers', 'corpus-staging') and len(p) > 2 else p[1:]
    if u.startswith('editions-built-v1/[') : inner = p[1:]
    own = leaf(u)
    target = None; tidx = None
    for i, seg in enumerate(inner[:-1]):
        if seg in BUILD_NAMES and seg != own:
            target = seg; tidx = i; break
    marker = ('/root/tab/lane/' in '/' + '/'.join(inner)) or ('The Tabernacle' in inner) or ('corpus-lane-builds' in inner[:-1])
    if target is None and marker:
        target = '(marker without a build name)'
    if target:
        first_pass.append((k, s, u, target, tidx, inner))
        role_bytes[u]['nested copy of another build'] += s
    else:
        non_nested_md5.add(key_md5[k])
        role_bytes[u][key_role(inner)] += s
for k, s, u, target, tidx, inner in first_pass:
    nested[u][target] += s; nested_keys[u] += 1
    h = key_md5[k]
    verdict = 'only copy'
    if tidx is not None:
        rest = '/'.join(inner[tidx + 1:])
        if any(o in all_keys and key_md5[o] == h for o in originals(target, rest)):
            verdict = 'equals the original key'
    if verdict == 'only copy' and h in non_nested_md5:
        verdict = 'content kept outside nested copies'
    if verdict == 'equals the original key': nested_eq[u] += s
    elif verdict == 'content kept outside nested copies': nested_elsewhere[u] += s
    else: nested_only[u] += s
    nested_rows.append((u, target, verdict, s, k))

# ---------------------------------------------------------------- relays (corpus lane inventory, 17 Oct)
def rkey(fn):
    m = re.search(r'FOR-ELIJAH-v(\d+(?:\.\d+)*)', fn)
    return tuple(int(x) for x in m.group(1).split('.')) if m else ()
relay_by_unit = collections.defaultdict(list)
for l in open(RELAYS, encoding='utf-8'):
    b, path, draft, tok, head, rtok, rhead = l.rstrip('\n').split('\t')
    seg = path.split('/')[2:]
    if len(seg) > 3: continue
    if any(COPYZONE.match(x) or x in ('kept', 'outputs', 'work', 'scratch') or x.startswith('run') for x in seg[:-1]): continue
    if not seg[-1].startswith('FOR-ELIJAH'): continue
    relay_by_unit['corpus-lane-builds/' + b + '/'].append((rkey(seg[-1]), '/'.join(seg), tok, head))
# relays present on R2 but newer than the inventory (dictionary store v78/v79): name only
for k, s, t in rows:
    u = key_unit[k]; p = k.split('/')
    if p[-1].startswith('FOR-ELIJAH') and u.startswith('corpus-lane-builds/') and len(p) <= 4:
        rel = '/'.join(p[2:])
        if not any(r[1] == rel for r in relay_by_unit[u]):
            if not any(COPYZONE.match(x) for x in p[2:-1]):
                relay_by_unit[u].append((rkey(p[-1]), rel, '(not in inventory)', ''))
def newest_relay(u):
    rs = [r for r in relay_by_unit.get(u, []) if r[0]]
    if not rs: return None
    rs.sort(key=lambda r: (r[0], r[1].count('/') == 0))
    return rs[-1]

# ---------------------------------------------------------------- versions within a family
def vtuple(v):
    m = re.match(r'(\d+(?:\.\d+)*)', v)
    return tuple(int(x) for x in m.group(1).split('.')) if m else ()
fam_units = collections.defaultdict(list)
for u in units: fam_units[fam[u]].append(u)
newer = {}
for f, us in fam_units.items():
    for u in us:
        vu = vtuple(ver[u])
        n = [x for x in us if vtuple(ver[x]) > vu and vu]
        newer[u] = sorted(n, key=lambda x: vtuple(ver[x]))

# ---------------------------------------------------------------- status table (hand-written, evidence named)
status = {}
if os.path.exists(STATUS):
    for l in open(STATUS, encoding='utf-8'):
        if l.startswith('#') or not l.strip(): continue
        u, st, role, ev = l.rstrip('\n').split('\t')
        status[u] = (st, role, ev)

def auto_status(u):
    nr = newest_relay(u)
    if newer[u]:
        return 'superseded', 'newer version on R2: ' + ', '.join(leaf(x) for x in newer[u]) + (('; newest own relay ' + nr[1] + ' ' + nr[2]) if nr else '')
    if nr and nr[2] == 'SUPERSEDED':
        return 'superseded', 'newest own relay ' + nr[1] + ' first line SUPERSEDED: ' + nr[3][:120]
    if nr:
        return 'unknown', 'newest own relay ' + nr[1] + ' first line ' + nr[2] + '; not served, no newer version'
    return 'unknown', 'no relay, not named by the site, no newer version'

# ---------------------------------------------------------------- write
def iso(t): return t[:19] + 'Z'
out = []
for u, d in units.items():
    if u in status:
        st, role, ev = status[u]
    else:
        st, ev = auto_status(u); role = 'UNCLASSIFIED'
    out.append([u, fam[u], ver[u], role, st, d['keys'], d['bytes'], d['distinct'], d['unique'], iso(d['first']), iso(d['last']), ev])
out.sort(key=lambda r: (r[0].split('/')[0] != 'corpus-lane-builds', r[0]))
with open(OUT + '/builds.tsv', 'w', encoding='utf-8') as f:
    f.write('unit_prefix\tfamily\tversion\trole\tstatus\tkeys\tbytes\tdistinct_bytes_within_unit\tbytes_unique_to_unit\tfirst_modified\tlast_modified\tevidence_for_status\n')
    for r in out: f.write('\t'.join(map(str, r)) + '\n')

ROLES = ['deliverable/other', 'strand', 'candidate', 'verify', 'copy-zone (gate/mirror/shadow/sandbox)', 'stage', 'scratch/run', 'raw/source', 'nested copy of another build']
with open(OUT + '/builds-extra.tsv', 'w', encoding='utf-8') as f:
    f.write('unit_prefix\tdistinct_files_within_unit\tnested_copy_keys\tnested_copy_bytes\tnested_equal_to_original_bytes\tnested_content_kept_elsewhere_bytes\tnested_only_copy_bytes\tnested_targets\t' + '\t'.join('bytes_in:' + r for r in ROLES) + '\tnewest_own_relay\tnewer_versions_on_r2\n')
    for u, d in units.items():
        nr = newest_relay(u)
        tg = ';'.join('%s=%d' % (t, b) for t, b in nested[u].most_common(6))
        f.write('\t'.join(map(str, [u, d['distinct_n'], nested_keys[u], sum(nested[u].values()), nested_eq[u], nested_elsewhere[u], nested_only[u], tg] + [role_bytes[u][r] for r in ROLES] + [(nr[1] + ' ' + nr[2]) if nr else '', ','.join(leaf(x) for x in newer[u])])) + '\n')

with open(OUT + '/nested-copies.tsv', 'w', encoding='utf-8') as f:
    f.write('holder_unit\tnamed_build\tverdict\tbytes\tkey\n')
    for r in nested_rows: f.write('\t'.join(map(str, r)) + '\n')

# bucket-wide numbers
tot_b = sum(d['bytes'] for d in units.values()); tot_k = sum(d['keys'] for d in units.values())
distinct_all = sum(md5_size.values())
summary = {
    'keys': tot_k, 'bytes': tot_b, 'units': len(units), 'md5_from_etag_listing': etag_filled,
    'distinct_md5': len(md5_size), 'distinct_bytes_bucket': distinct_all,
    'nested_copy_keys': sum(nested_keys.values()), 'nested_copy_bytes': sum(sum(c.values()) for c in nested.values()),
    'nested_equal_to_original_bytes': sum(nested_eq.values()), 'nested_content_kept_elsewhere_bytes': sum(nested_elsewhere.values()),
    'nested_only_copy_bytes': sum(nested_only.values()),
    'role_bytes_bucket': {r: sum(role_bytes[u][r] for u in units) for r in ROLES},
    'units_unclassified': [r[0] for r in out if r[3] == 'UNCLASSIFIED'],
}
json.dump(summary, open(OUT + '/census-numbers.json', 'w'), indent=1)
print(json.dumps({k: v for k, v in summary.items() if k != 'units_unclassified'}, indent=1))
print('unclassified units:', len(summary['units_unclassified']))
