# Keys and bytes by compressed / media type over the whole bucket listing (L0), plus distinct bytes (L1).
import json, collections
M = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/overlap'
G = {'gz': ['gz', 'tgz'], 'xz': ['xz'], 'zip': ['zip'], 'zst': ['zst'], 'br': ['br'], 'bz2': ['bz2'], '7z': ['7z'],
     'parquet': ['parquet'], 'image': ['jpg', 'jpeg', 'png', 'gif', 'webp', 'tif', 'tiff', 'jp2', 'bmp', 'svg'],
     'pdf': ['pdf'], 'font': ['woff', 'woff2', 'ttf', 'otf'], 'sqlite/db': ['db', 'sqlite', 'sqlite3']}
inv = {e: g for g, es in G.items() for e in es}
rows = collections.defaultdict(lambda: [0, 0, 0, 0])
for l in open(M + '/tables/10-extensions.tsv', encoding='utf-8').read().splitlines()[1:]:
    e, k, b, d, db, _, _ = l.split('\t')
    last = e.split('.')[-1]
    g = inv.get(last, 'other (uncompressed)')
    r = rows[g]; r[0] += int(k); r[1] += int(b); r[2] += int(d); r[3] += int(db)
out = {g: {'keys': r[0], 'L0_bytes': r[1], 'distinct': r[2], 'L1_bytes': r[3]} for g, r in rows.items()}
json.dump(out, open(M + '/tables/13-compressed.json', 'w'), indent=1)
for g, r in sorted(rows.items(), key=lambda x: -x[1][1]):
    print('%-22s keys %7d  L0 %7.3f GB  distinct %7d  L1 %7.3f GB' % (g, r[0], r[1] / 1e9, r[2], r[3] / 1e9))
