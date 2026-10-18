# Prefix test for large .gz objects (too big to rebuild whole here): READ-ONLY ranged GET of the first PREFIX bytes,
# inflate that prefix, re-deflate it with Node's bundled zlib (via gzrepro.mjs), Python zlib and GNU gzip, and report
# how far each variant agrees with the original deflate body. A variant that agrees up to (almost) the end of the
# prefix is the deflater that made the file; the whole object must still be rebuilt and checked before any delete.
# Run: python3 -I 33-gzprefix.py PREFIX_BYTES   (keys: the largest of each header signature + named big ones)
import os, sys, subprocess, zlib, struct, json, collections
M = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/overlap'
CAT = M + '/scripts/r2cat.mjs'; NODEH = M + '/scripts/gzrepro.mjs'; DL = M + '/dl/gzp'; os.makedirs(DL, exist_ok=True)
PREFIX = int(sys.argv[1]) if len(sys.argv) > 1 else 8 << 20
env = dict(os.environ); env['NODE_NO_WARNINGS'] = '1'
rows = [l.rstrip('\n').split('\t') for l in open(M + '/tables/31-gzhead.tsv', encoding='utf-8')]
bysig = collections.defaultdict(list)
for k, fam, size, sig in rows: bysig[sig].append((int(size), k, fam))
pick = []
for sig, v in bysig.items():
    v.sort(reverse=True)
    pick += [(sig, k, fam, s) for s, k, fam in v[:4 if sig.startswith('FLG=0 MTIME=0 XFL=0 OS=10') else 3]]
extra = ['cold/editorial-999-strike-20260830-evidence.tar.gz',
         'corpus-lane-builds/moses-search-ledger-v1.8/strand-1-fix/gate/m17/moses-pointing-store-v1/grades/grades-v1.jsonl.gz',
         'corpus-lane-builds/moses-witnessed-order-v2.1/old-witness-table-v2.1.jsonl.gz',
         'moses-ia-wave-v1/collected/editions/kehillot-moshe-miqraot-gedolot-amsterdam-1724-images.tokens.csv.gz']
have = set(p[1] for p in pick)
for k in extra:
    if k not in have: pick.append(('named', k, '', 0))
out = []
for sig, key, fam, size in pick:
    e = dict(env); e['RANGE'] = 'bytes=0-%d' % (PREFIX - 1)
    raw = subprocess.run(['node', CAT, key], capture_output=True, env=e).stdout
    flg, mtime, xfl, osb = raw[3], struct.unpack('<I', raw[4:8])[0], raw[8], raw[9]; p = 10
    if flg & 4: p += 2 + struct.unpack('<H', raw[p:p + 2])[0]
    if flg & 8: p = raw.index(b'\x00', p) + 1
    if flg & 16: p = raw.index(b'\x00', p) + 1
    if flg & 2: p += 2
    body = raw[p:]
    d = zlib.decompressobj(-15); inner = d.decompress(body)
    whole = d.eof
    if whole:  # the object fits inside the prefix: cut the body at its real end
        body = body[:len(body) - len(d.unused_data)]
    open(DL + '/inner', 'wb').write(inner); open(DL + '/body', 'wb').write(body)
    r = subprocess.run(['node', NODEH, DL + '/inner', DL + '/body'], capture_output=True, env=env)
    jr = json.loads(r.stdout)
    fd = dict(jr['firstDiff'])
    for h in jr['hits']: fd[h] = len(body)
    for lv in range(1, 10):
        c = zlib.compressobj(lv, zlib.DEFLATED, -15, 8); o = c.compress(inner)
        n = 0
        while n < min(len(o), len(body)) and o[n] == body[n]: n += 1
        fd['py-L%d-m8' % lv] = n
    for lv in (1, 6, 9):
        g = subprocess.run(['gzip', '-c', '-n', '-%d' % lv, DL + '/inner'], capture_output=True).stdout[10:]
        n = 0
        while n < min(len(g), len(body)) and g[n] == body[n]: n += 1
        fd['gnu-%d' % lv] = n
    best = max(fd.items(), key=lambda x: x[1])
    rec = {'key': key, 'family': fam, 'sig': sig, 'object_size_in_sample': size, 'prefix_body_bytes': len(body),
           'whole_object_in_prefix': whole, 'flg': flg, 'mtime': mtime, 'xfl': xfl, 'os': osb,
           'best_variant': best[0], 'best_agree_bytes': best[1], 'best_agree_share': round(best[1] / max(len(body), 1), 4),
           'node_hits_whole': jr['hits'] if whole else None,
           'best_python_agree': max(v for k, v in fd.items() if k.startswith('py')),
           'best_gnu_agree': max(v for k, v in fd.items() if k.startswith('gnu'))}
    out.append(rec); print(json.dumps(rec), flush=True)
for x in ('inner', 'body'):
    try: os.remove(DL + '/' + x)
    except FileNotFoundError: pass
json.dump(out, open(M + '/tables/33-gzprefix.json', 'w'), indent=1)
