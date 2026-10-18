# Moses's recorded links (mend-r2 + mend-r3 links.jsonl) against the R2 listing (local only):
# is there an object at the link's path (a file link uploaded as its target's bytes), objects beneath it
# (a folder link or junction followed on upload), or nothing (the link was skipped)?
import json, collections, sys
H = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/hazards'
L = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/clean/dl/corpus-lane-builds/moses-delete-ledger-v1'
keys = set(); pref = collections.Counter()
for l in open(H + '/bucket-etag.jsonl', encoding='utf-8'):
    k = json.loads(l)['k']; keys.add(k); s = k.split('/')
    for i in range(1, len(s)): pref['/'.join(s[:i])] += 1
links = {}
for f in (L + '/build/mend-r2/links.jsonl', L + '/build/mend-r3/links.jsonl'):
    for l in open(f, encoding='utf-8'):
        r = json.loads(l); links[r['path']] = r
c = collections.Counter(); ex = collections.defaultdict(list)
for p, r in links.items():
    if not p.startswith('CLB/'): c['not under CLB (FS root)'] += 1; continue
    k = 'corpus-lane-builds/' + p[4:]
    if k in keys: w = 'object at the link path (link uploaded as file bytes)'
    elif pref[k]: w = 'objects beneath the link path (followed as a folder on upload)'
    else: w = 'nothing on R2 at or under the link path (skipped)'
    c[w] += 1; ex[w].append(p)
print(json.dumps({'links_recorded': len(links), 'outcome': dict(c), 'examples': {w: v[:3] for w, v in ex.items()},
                  'targets_named': collections.Counter('<footsteps>' if str(r['target']).startswith('<footsteps>') else '<tabernacle>' if str(r['target']).startswith('<tabernacle>') else 'other' for r in links.values())}, indent=1, ensure_ascii=False))
