# Can a .gz object be re-created byte for byte from its inflated content plus a small recipe?
# For a stratified sample of distinct .gz objects: READ-ONLY GET (r2cat.mjs), parse the gzip header (FLG, MTIME,
# XFL, OS, FNAME), inflate, then try to rebuild the raw deflate body with
#   python zlib (vanilla zlib 1.3) levels 1-9, memLevel 8 and 9;
#   Node 22 bundled zlib (Chromium fork 1.3.1-470d3a2) levels 1-9, memLevel 8/9, sync and streamed;
#   GNU gzip 1.12 -n -1..-9 (its own deflate, not zlib).
# A rebuild counts only when the whole object then equals the original: header bytes (rebuilt from the recorded
# fields) + body + trailer (CRC32, ISIZE recomputed). Run: python3 -I 32-gztest.py N_PER_SIGNATURE MAXBYTES
import os, sys, subprocess, zlib, struct, json, hashlib, collections, shutil

M = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/overlap'
CAT = M + '/scripts/r2cat.mjs'; NODEH = M + '/scripts/gzrepro.mjs'
DL = M + '/dl/gz'; os.makedirs(DL, exist_ok=True)
per_sig = int(sys.argv[1]) if len(sys.argv) > 1 else 12
maxb = int(sys.argv[2]) if len(sys.argv) > 2 else 40_000_000
env = dict(os.environ); env['NODE_NO_WARNINGS'] = '1'

# stratified pick from the header census: per signature up to per_sig files, spread over families, size <= maxb
rows = [l.rstrip('\n').split('\t') for l in open(M + '/tables/31-gzhead.tsv', encoding='utf-8')]
md5of = {}
for l in open(M + '/tables/31-gzhead-sample.tsv', encoding='utf-8'):
    h, s, fam, ext, k = l.rstrip('\n').split('\t'); md5of[k] = h
bysig = collections.defaultdict(list)
for k, fam, size, sig in rows:
    if int(size) <= maxb: bysig[sig].append((k, fam, int(size)))
pick = []
for sig, v in bysig.items():
    v.sort(key=lambda r: hashlib.md5(r[0].encode()).hexdigest())
    fams = collections.defaultdict(list)
    for r in v: fams[r[1]].append(r)
    order = []  # round robin over families
    while any(fams.values()):
        for f in list(fams):
            if fams[f]: order.append(fams[f].pop(0))
    want = per_sig * 3 if sig.startswith('FLG=0 MTIME=0 XFL=0 OS=10') else per_sig
    pick += [(sig,) + r for r in order[:want]]

def parse_header(b):
    flg = b[3]; mtime = struct.unpack('<I', b[4:8])[0]; xfl = b[8]; osb = b[9]; p = 10
    extra = fname = comment = None
    if flg & 4: xl = struct.unpack('<H', b[p:p + 2])[0]; extra = b[p + 2:p + 2 + xl]; p += 2 + xl
    if flg & 8: e = b.index(b'\x00', p); fname = b[p:e]; p = e + 1
    if flg & 16: e = b.index(b'\x00', p); comment = b[p:e]; p = e + 1
    if flg & 2: p += 2
    return dict(flg=flg, mtime=mtime, xfl=xfl, os=osb, fname=fname, extra=extra, comment=comment, hlen=p)

def split_members(raw):
    """return list of (header dict, body bytes, trailer bytes, inflated bytes)"""
    out = []; pos = 0
    while pos < len(raw):
        if raw[pos:pos + 2] != b'\x1f\x8b': return out, raw[pos:]
        h = parse_header(raw[pos:pos + 65536]); start = pos + h['hlen']
        d = zlib.decompressobj(-15); inner = d.decompress(raw[start:]); inner += d.flush()
        consumed = len(raw) - start - len(d.unused_data)
        body = raw[start:start + consumed]; trailer = raw[start + consumed:start + consumed + 8]
        out.append((h, body, trailer, inner)); pos = start + consumed + 8
    return out, b''

results = []
for sig, key, fam, size in pick:
    f = DL + '/obj.gz'
    with open(f, 'wb') as w: subprocess.run(['node', CAT, key], stdout=w, env=env, check=False)
    raw = open(f, 'rb').read()
    rec = {'key': key, 'family': fam, 'size': size, 'sig': sig, 'md5_ok': hashlib.md5(raw).hexdigest() == md5of.get(key)}
    try:
        mem, tail = split_members(raw)
    except Exception as e:
        rec['error'] = 'parse: %s' % e; results.append(rec); print(json.dumps(rec), flush=True); continue
    rec['members'] = len(mem); rec['trailing_bytes'] = len(tail)
    h, body, trailer, inner = mem[0]
    rec['inner'] = sum(len(m[3]) for m in mem)
    rec.update({'flg': h['flg'], 'mtime': h['mtime'], 'xfl': h['xfl'], 'os': h['os'], 'fname': (h['fname'] or b'').decode('latin-1')})
    py = []; node = []; gnu = []; first_diff = {}
    if len(mem) == 1 and not tail:
        for ml in (8, 9):
            for lv in range(1, 10):
                c = zlib.compressobj(lv, zlib.DEFLATED, -15, ml); off = 0; bad = -1
                for i in range(0, len(inner), 1 << 16):
                    o = c.compress(inner[i:i + (1 << 16)])
                    if o != body[off:off + len(o)]: bad = off; break
                    off += len(o)
                if bad < 0:
                    o = c.flush()
                    if o == body[off:] : py.append('py-L%d-m%d' % (lv, ml))
                    else: bad = off
                if bad >= 0: first_diff['py-L%d-m%d' % (lv, ml)] = bad
        open(DL + '/inner', 'wb').write(inner); open(DL + '/body', 'wb').write(body)
        r = subprocess.run(['node', NODEH, DL + '/inner', DL + '/body'], capture_output=True, env=env)
        try:
            jr = json.loads(r.stdout); node = jr['hits']; first_diff.update(jr['firstDiff'])
        except Exception: node = ['ERR ' + r.stderr.decode()[:200]]
        for lv in range(1, 10):
            g = subprocess.Popen(['gzip', '-c', '-n', '-%d' % lv, DL + '/inner'], stdout=subprocess.PIPE)
            head = g.stdout.read(10); off = 0; bad = -1; buf = b''
            while True:
                o = g.stdout.read(1 << 16)
                if not o: break
                buf += o
                # hold back the last 8 bytes (trailer) of the stream
                cmp, buf = buf[:-8], buf[-8:]
                if cmp != body[off:off + len(cmp)]: bad = off; break
                off += len(cmp)
            g.kill(); g.wait()
            if bad < 0 and off == len(body): gnu.append('gnu-gzip-%d' % lv)
            else: first_diff['gnu-%d' % lv] = bad if bad >= 0 else off
        # full-object rebuild check with the first matching body
        hit_body = body if (py or node or gnu) else None
        if hit_body is not None:
            hdr = raw[:h['hlen']]  # the recipe keeps the header bytes verbatim (10 bytes when FLG=0)
            rebuilt = hdr + hit_body + struct.pack('<II', zlib.crc32(inner) & 0xffffffff, len(inner) & 0xffffffff)
            rec['rebuilt_equal'] = rebuilt == raw
        else:
            rec['rebuilt_equal'] = False
    else:
        rec['rebuilt_equal'] = False; rec['note'] = 'multi-member or trailing bytes: not tried'
    rec['py'] = py; rec['node'] = node; rec['gnu'] = gnu
    rec['max_first_diff'] = max(first_diff.values()) if first_diff else None; rec['body_len'] = len(body) if len(mem) == 1 else None
    results.append(rec); print(json.dumps(rec), flush=True)
for x in ('obj.gz', 'inner', 'body'):
    try: os.remove(DL + '/' + x)
    except FileNotFoundError: pass
json.dump(results, open(M + '/tables/32-gztest.json', 'w'), indent=1)
n = len(results); ok = sum(1 for r in results if r.get('rebuilt_equal'))
print('tested', n, 'rebuilt byte for byte', ok)
bys = collections.defaultdict(lambda: [0, 0])
for r in results: bys[r['sig']][0] += 1; bys[r['sig']][1] += bool(r.get('rebuilt_equal'))
for s, v in bys.items(): print(' ', s, 'tested', v[0], 'rebuilt', v[1])
