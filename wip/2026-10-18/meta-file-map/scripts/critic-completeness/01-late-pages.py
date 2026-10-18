# For each corpus-lane-builds unit: keys whose Last-Modified is more than 6 hours after the unit's median
# Last-Modified (a rough sign of pages rewritten later, such as SUPERSEDED banners). Read-only, local listing.
import collections, datetime, json, statistics, sys
L = sys.argv[1]
u = collections.defaultdict(list)
for line in open(L, encoding='utf-8'):
    k, sz, lm = line.rstrip('\n').split('\t')[:3]
    p = k.split('/')
    if p[0] != 'corpus-lane-builds' or len(p) < 3: continue
    t = datetime.datetime.fromisoformat(lm.replace('Z', '+00:00')).timestamp()
    u[p[1]].append((t, k, int(sz)))
late_units = 0; late_keys = 0; late_named = 0; ex = []
for b, rows in u.items():
    med = statistics.median(t for t, _, _ in rows)
    late = [(t, k, s) for t, k, s in rows if t - med > 6 * 3600]
    if late:
        late_units += 1; late_keys += len(late)
        named = [k for _, k, _ in late if k.split('/')[-1].startswith(('THE-', 'FOR-ELIJAH', 'README'))]
        late_named += len(named)
        if named and len(ex) < 8: ex.append((b, len(late), named[:2]))
print(json.dumps(dict(units=len(u), units_with_late_keys=late_units, late_keys=late_keys, late_front_pages=late_named, examples=ex), indent=1, ensure_ascii=False))
