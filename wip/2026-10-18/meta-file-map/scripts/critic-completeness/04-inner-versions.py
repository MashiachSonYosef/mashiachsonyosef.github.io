# Units (census rule: corpus-lane-builds/<b>/) whose second-level folders carry their own version numbers, such as
# build-v1.4/, v1.1/, ship-v1.2.1/. Each such unit holds several builds under one build record. Read-only, local listing.
import collections, json, re, sys
VER = re.compile(r'(?:^|[-_])v(\d+(?:\.\d+)+)$|^v(\d+(?:\.\d+)*)$')
inner = collections.defaultdict(lambda: collections.defaultdict(lambda: [0, 0]))
for line in open(sys.argv[1], encoding='utf-8'):
    k, sz = line.split('\t')[:2]
    p = k.split('/')
    if p[0] != 'corpus-lane-builds' or len(p) < 4: continue
    m = VER.search(p[2])
    if not m: continue
    own = re.search(r'-v(\d+(?:\.\d+)*)$', p[1])
    v = m.group(1) or m.group(2)
    if own and v == own.group(1): continue          # the unit's own version, not an inner one
    inner[p[1]][v][0] += 1; inner[p[1]][v][1] += int(sz)
multi = {b: d for b, d in inner.items() if len(d) >= 1}
rows = sorted(((b, sorted(d), sum(x[0] for x in d.values()), sum(x[1] for x in d.values())) for b, d in multi.items()), key=lambda r: -r[3])
print(json.dumps(dict(units_with_inner_versions=len(rows), inner_versions=sum(len(r[1]) for r in rows),
                      keys=sum(r[2] for r in rows), bytes=sum(r[3] for r in rows),
                      largest=[dict(unit=r[0], versions=r[1][:8], keys=r[2], bytes=r[3]) for r in rows[:10]]), indent=1))
