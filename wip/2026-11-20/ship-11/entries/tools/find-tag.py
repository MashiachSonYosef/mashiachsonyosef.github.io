# every row of STEP's two sources in a store whose lettered tags (t) hold one of the tags asked
import sys, json, gzip, glob
store, want = sys.argv[1], set(sys.argv[2:])
out = {}
for p in sorted(glob.glob(store + '/shards/*.bin')):
    for k, rows in json.loads(gzip.open(p).read().decode('utf-8')).items():
        for r in rows:
            if str(r[3]) not in ('M4', 'M19'): continue
            f = r[10] if len(r) > 10 and isinstance(r[10], dict) else {}
            hit = want & set((f or {}).get('t', []))
            for h in hit: out.setdefault(h, []).append((k, r[0], r[3], str(r[1])[:40], (r[6] or [''])[0] if len(r) > 6 and r[6] else ''))
for h in sorted(out):
    print(h, len(out[h]), 'rows;', 'M19:', [x for x in out[h] if x[2] == 'M19'][:3], '| M4:', [x for x in out[h] if x[2] == 'M4'][:4])
