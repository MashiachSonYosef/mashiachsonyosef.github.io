# Pick a deterministic stratified HEAD sample from the whole-bucket listing (local only).
# Strata: (top-level prefix [second level for corpus-lane-builds families is not used], extension) up to 3 each
# (oldest, middle, newest by last_modified); plus every multipart object; plus (top, month) up to 2 each;
# plus 10 zero-byte, 10 with spaces, 10 with Hebrew, 10 with '%', 10 '__q_v=' cache names.
# Run: python3 -I pick-head-sample.py  -> head-sample-keys.txt (JSON string per line) + head-sample-why.tsv
import json, re, collections
H = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/hazards'
rows = [json.loads(l) for l in open(H + '/bucket-etag.jsonl', encoding='utf-8')]
def top(k): return k.split('/', 1)[0] + ('/' if '/' in k else '')
def ext(k):
    b = k.rsplit('/', 1)[-1]
    m = re.search(r'(\.[A-Za-z0-9]{1,8}(\.(gz|xz|zst|bz2|br|zip))?)$', b)
    return m.group(1).lower() if m else '(none)'
pick = collections.OrderedDict()
def add(r, why):
    if r['k'] not in pick: pick[r['k']] = why
def spread(lst, n):
    lst = sorted(lst, key=lambda r: (r['lm'], r['k']))
    if len(lst) <= n: return lst
    return [lst[round(i * (len(lst) - 1) / (n - 1))] for i in range(n)]
for r in rows:
    if '-' in r['et']: add(r, 'multipart')
g = collections.defaultdict(list)
for r in rows: g[(top(r['k']), ext(r['k']))].append(r)
for key in sorted(g):
    for r in spread(g[key], 3): add(r, 'top+ext %s %s' % key)
m = collections.defaultdict(list)
for r in rows: m[(top(r['k']), r['lm'][:7])].append(r)
for key in sorted(m):
    for r in spread(m[key], 2): add(r, 'top+month %s %s' % key)
special = [('zero-byte', lambda r: r['s'] == 0), ('space', lambda r: ' ' in r['k']), ('hebrew', lambda r: re.search('[֐-׿]', r['k'])),
           ('percent', lambda r: '%' in r['k']), ('query-name', lambda r: '__q_' in r['k'])]
for name, f in special:
    for r in spread([r for r in rows if f(r)], 10): add(r, name)
with open(H + '/head-sample-keys.txt', 'w', encoding='utf-8') as f:
    for k in pick: f.write(json.dumps(k, ensure_ascii=False) + '\n')
with open(H + '/head-sample-why.tsv', 'w', encoding='utf-8') as f:
    for k, w in pick.items(): f.write('%s\t%s\n' % (k, w))
print(len(pick), 'keys;', collections.Counter(w.split(' ')[0] for w in pick.values()))
