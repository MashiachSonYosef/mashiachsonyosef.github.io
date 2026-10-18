# Census of gzip headers over a deterministic sample of distinct .gz objects (first 4 KiB read by ranged GET).
# Run: python3 -I 31-gzhead.py
import collections, struct, json
M = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/overlap'
meta = {}
for l in open(M + '/tables/31-gzhead-sample.tsv', encoding='utf-8'):
    h, s, fam, ext, k = l.rstrip('\n').split('\t'); meta[k] = (fam, ext, int(s))
c = collections.Counter(); byfam = collections.defaultdict(collections.Counter); bytes_by = collections.Counter(); out = []
for l in open(M + '/tables/31-gzhead-raw.tsv', encoding='utf-8'):
    k, st, hx = l.rstrip('\n').split('\t'); b = bytes.fromhex(hx)
    fam, ext, size = meta[k]
    if b[:2] != b'\x1f\x8b':
        sig = 'not-gzip:' + b[:4].hex(); out.append((k, fam, size, sig)); c[sig] += 1; bytes_by[sig] += size; continue
    cm, flg, mtime, xfl, osb = b[2], b[3], struct.unpack('<I', b[4:8])[0], b[8], b[9]
    fname = ''
    if flg & 8:
        p = 10 + (2 + struct.unpack('<H', b[10:12])[0] if flg & 4 else 0); e = b.find(b'\x00', p); fname = b[p:e].decode('latin-1')
    sig = 'FLG=%d MTIME=%s XFL=%d OS=%d%s' % (flg, '0' if mtime == 0 else 'set', xfl, osb, ' FNAME' if fname else '')
    out.append((k, fam, size, sig)); c[sig] += 1; bytes_by[sig] += size; byfam[sig][fam] += 1
with open(M + '/tables/31-gzhead.tsv', 'w', encoding='utf-8') as w:
    for r in out: w.write('%s\t%s\t%d\t%s\n' % r)
res = {'sampled': len(out), 'signatures': [{'sig': s, 'files': n, 'bytes': bytes_by[s], 'top_families': byfam[s].most_common(6)} for s, n in c.most_common()]}
json.dump(res, open(M + '/tables/31-gzhead.json', 'w'), indent=1)
for s in res['signatures']: print(s['files'], '%.3f GB' % (s['bytes'] / 1e9), s['sig'], s['top_families'][:4])
