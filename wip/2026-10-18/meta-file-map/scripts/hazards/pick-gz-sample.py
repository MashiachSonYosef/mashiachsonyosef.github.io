# Pick a stratified sample of compressed-looking objects for a 512-byte ranged read of their headers (local only).
# Strata: (top-level prefix, extension) up to 6 each; plus 150 random (corpus-lane-builds family, extension) strata, 1 each;
# plus up to 40 '.bin' objects. Output: gz-sample-keys.txt
import json, re, collections, random
H = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/hazards'
rows = [json.loads(l) for l in open(H + '/bucket-etag.jsonl', encoding='utf-8')]
def ext(k):
    b = k.rsplit('/', 1)[-1]; m = re.search(r'(\.[A-Za-z0-9]{1,8}(\.(gz|xz|zst|bz2|br|zip))?)$', b)
    return m.group(1).lower() if m else '(none)'
g = collections.defaultdict(list); f2 = collections.defaultdict(list); binr = []
for r in rows:
    if r['s'] < 20: continue
    e = ext(r['k'])
    if re.search(r'\.(gz|zst|xz|bz2|zip|tgz)$', e):
        g[(r['k'].split('/')[0], e)].append(r)
        if r['k'].startswith('corpus-lane-builds/'): f2[('/'.join(r['k'].split('/')[:2]), e)].append(r)
    elif e == '.bin': binr.append(r)
rnd = random.Random(20261018); pick = []
for key in sorted(g):
    lst = sorted(g[key], key=lambda r: r['k']); pick += rnd.sample(lst, min(6, len(lst)))
seen = {r['k'] for r in pick}
for key in rnd.sample(sorted(f2), min(150, len(f2))):
    lst = [r for r in sorted(f2[key], key=lambda r: r['k']) if r['k'] not in seen]
    if lst: pick.append(rnd.choice(lst))
pick += rnd.sample(sorted(binr, key=lambda r: r['k']), min(40, len(binr)))
with open(H + '/gz-sample-keys.txt', 'w', encoding='utf-8') as f:
    for r in pick: f.write(json.dumps(r['k'], ensure_ascii=False) + '\n')
print(len(pick), 'keys from', len(g), 'strata +', min(40, len(binr)), '.bin')
