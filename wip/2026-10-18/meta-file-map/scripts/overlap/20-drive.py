# Driver for one sample run: READ-ONLY GETs from R2 (via r2cat.mjs), decompress .gz / walk .tar.gz, feed ovl.
# Run (credentials loaded in the same shell, never printed):
#   set -a; . <scratchpad>/r2.env; set +a; python3 -I 20-drive.py RUN SELECTION.tsv [CONCURRENCY]
# SELECTION.tsv: family<TAB>key<TAB>size<TAB>md5<TAB>last_modified, in processing order.
# Writes tables/RUN/{ovl.*, driver.tsv, members.tsv, gzhead.tsv}; downloads go to dl/RUN/ and are deleted
# right after each file is processed. Files of 1 GB or more are streamed straight from the GET (never on disk).
import os, sys, subprocess, threading, hashlib, zlib, struct, tarfile, time, io

S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
M = S + '/meta/overlap'
CAT = M + '/scripts/r2cat.mjs'
OVL = os.environ.get('OVL_BIN', M + '/scripts/ovl')
run, sel = sys.argv[1], sys.argv[2]
conc = int(sys.argv[3]) if len(sys.argv) > 3 else 6
INFLIGHT = int(os.environ.get('INFLIGHT', str(2_500_000_000)))
STREAM_MIN = 1_000_000_000
TD = M + '/tables/' + run
DL = M + '/dl/' + run
os.makedirs(TD, exist_ok=True); os.makedirs(DL, exist_ok=True)

TEXT = {'jsonl', 'json', 'csv', 'tsv', 'txt', 'md', 'html', 'htm', 'xml', 'mjs', 'js', 'cjs', 'log', 'lsf', 'lsjson',
        'ps1', 'sh', 'svg', 'yaml', 'yml', 'py', 'r2head', 'ndjson', 'sha256', 'css'}

def ext_parts(name):
    b = name.rsplit('/', 1)[-1].lower()
    return b.split('.')[1:] if '.' in b else []

def kind_of(name):
    p = ext_parts(name)
    if not p: return 'B'
    e = p[-1]
    return 'T' if e in TEXT else 'B'

items = []
for l in open(sel, encoding='utf-8'):
    f, k, s, h, t = l.rstrip('\n').split('\t')
    items.append({'fam': f, 'key': k, 'size': int(s), 'md5': h, 'i': len(items)})

env = dict(os.environ); env['NODE_NO_WARNINGS'] = '1'
lock = threading.Condition()
state = {'inflight': 0, 'next': 0, 'running': 0}
done = {}

fm = subprocess.Popen(['node', M + '/scripts/fetchmany.mjs', DL, str(conc)], stdin=subprocess.PIPE, stdout=subprocess.PIPE, env=env, text=True)

def reader():
    for line in fm.stdout:
        i, st, n, code = line.rstrip('\n').split('\t')
        i = int(i); it = items[i]; path = DL + '/%06d.bin' % i
        ok = st == 'ok' and os.path.exists(path) and os.path.getsize(path) == it['size']
        if st == 'ok' and it['size'] == 0 and not os.path.exists(path):
            open(path, 'wb').close(); ok = True
        with lock:
            done[i] = (path if os.path.exists(path) else None, ok, code)
            state['running'] -= 1
            lock.notify_all()

def scheduler():
    while True:
        with lock:
            while state['next'] < len(items):
                it = items[state['next']]
                if it['size'] >= STREAM_MIN:
                    done[it['i']] = ('STREAM', True, '')
                    state['next'] += 1; lock.notify_all(); continue
                if state['running'] >= conc * 4 or (state['inflight'] + it['size'] > INFLIGHT and state['inflight'] > 0):
                    break
                state['running'] += 1; state['inflight'] += it['size']; state['next'] += 1
                fm.stdin.write('%d\t%s\n' % (it['i'], it['key'])); fm.stdin.flush()
            if state['next'] >= len(items):
                fm.stdin.close(); return
            lock.wait(1)

threading.Thread(target=reader, daemon=True).start()

ovl = subprocess.Popen([OVL, '--out', TD + '/ovl', '--xzcap', os.environ.get('XZCAP', str(256 << 20))] + os.environ.get('OVL_ARGS', '').split(), stdin=subprocess.PIPE)
po = ovl.stdin

def send_file(name, kind, chunks):
    nb = name.encode('utf-8')[:60000]
    po.write(b'F' + kind.encode() + struct.pack('<H', len(nb)) + nb)
    n = 0
    for c in chunks:
        if c:
            po.write(b'D' + struct.pack('<I', len(c)) + c); n += len(c)
    po.write(b'E')
    return n

class Tee(io.RawIOBase):
    """file-like over a raw byte source; computes md5 and counts raw bytes as they are read"""
    def __init__(self, f):
        self.f = f; self.h = hashlib.md5(); self.n = 0
    def readable(self): return True
    def readinto(self, b):
        d = self.f.read(len(b))
        if not d: return 0
        self.h.update(d); self.n += len(d); b[:len(d)] = d; return len(d)

def gz_header(first):
    if len(first) < 10 or first[:2] != b'\x1f\x8b': return None
    flg, mtime, xfl, osb = first[3], struct.unpack('<I', first[4:8])[0], first[8], first[9]
    fname = ''
    if flg & 8:
        p = 10
        if flg & 4: p += 2 + struct.unpack('<H', first[10:12])[0]
        e = first.find(b'\x00', p)
        fname = first[p:e].decode('latin-1') if e > 0 else '?'
    return flg, mtime, xfl, osb, fname

def gunzip_chunks(src, info):
    """yield decompressed blocks from a raw stream; handles multi-member gzip"""
    d = zlib.decompressobj(31); members = 1; out = 0
    while True:
        raw = src.read(1 << 20)
        if not raw: break
        while raw:
            o = d.decompress(raw)
            out += len(o); yield o
            if d.eof:
                raw = d.unused_data
                if raw:
                    members += 1; d = zlib.decompressobj(31)
                else:
                    break
            else:
                raw = b''
    info['inner'] = out; info['members'] = members

drv = open(TD + '/driver.tsv', 'a', encoding='utf-8')
mem = open(TD + '/members.tsv', 'a', encoding='utf-8')
gzh = open(TD + '/gzhead.tsv', 'a', encoding='utf-8')
threading.Thread(target=scheduler, daemon=True).start()
t0 = time.time(); raw_total = 0; fed_total = 0
for it in items:
    with lock:
        while it['i'] not in done: lock.wait(1)
        path, ok, err = done.pop(it['i'])
    key = it['key']; parts = ext_parts(key)
    stream_proc = None
    if path == 'STREAM':
        stream_proc = subprocess.Popen(['node', CAT, key], stdout=subprocess.PIPE, env=env)
        rawf = stream_proc.stdout
    else:
        if not ok:
            drv.write('%s\t%s\t%d\tFETCH-FAIL\t\t\t\t%s\n' % (it['fam'], key, it['size'], str(err).replace('\n', ' ')))
            if path and os.path.exists(path): os.remove(path)
            with lock: state['inflight'] -= it['size']; lock.notify_all()
            continue
        rawf = open(path, 'rb', buffering=0)
    src = Tee(rawf)
    info = {}
    comp = 'none'
    if parts[-2:] == ['tar', 'gz'] or parts[-1:] == ['tgz']:
        comp = 'tar.gz'
        tf = tarfile.open(fileobj=io.BufferedReader(src, 1 << 20), mode='r|gz')
        nmem = 0; inner = 0
        for m in tf:
            if not m.isfile(): continue
            f = tf.extractfile(m); mh = hashlib.md5()
            def gen():
                while True:
                    b = f.read(1 << 20)
                    if not b: break
                    mh.update(b); yield b
            n = send_file(key + '//' + m.name, kind_of(m.name), gen())
            mem.write('%s\t%s\t%d\t%s\n' % (key, m.name, n, mh.hexdigest())); nmem += 1; inner += n
        info['inner'] = inner; info['members'] = nmem
        # drain any trailing bytes so the md5 covers the whole object
        while src.read(1 << 20): pass
    elif parts and parts[-1] == 'gz':
        comp = 'gz'
        bsrc = io.BufferedReader(src, 1 << 20)
        hd = gz_header(bsrc.peek(4096)[:4096])
        if hd: gzh.write('%s\t%s\t%d\t%d\t%d\t%d\t%d\t%s\n' % (it['fam'], key, it['size'], hd[0], hd[1], hd[2], hd[3], hd[4]))
        inner_name = key[:-3]
        try:
            n = send_file(key, kind_of(inner_name), gunzip_chunks(bsrc, info))
        except zlib.error as e:
            info['inner'] = -1; info['err'] = str(e)
            po.write(b'E')
    else:
        def gen():
            while True:
                b = src.read(1 << 20)
                if not b: break
                yield b
        n = send_file(key, kind_of(key), gen())
        info['inner'] = n
    rawf.close()
    if stream_proc: stream_proc.wait()
    md5ok = (src.h.hexdigest() == it['md5'] and src.n == it['size'])
    raw_total += src.n; fed_total += max(info.get('inner', 0), 0)
    drv.write('%s\t%s\t%d\t%s\t%s\t%d\t%s\t%s\n' % (it['fam'], key, src.n, 'md5-ok' if md5ok else 'MD5-MISMATCH', comp,
                                                    info.get('inner', 0), info.get('members', ''), info.get('err', '')))
    drv.flush(); mem.flush(); gzh.flush()
    if path != 'STREAM':
        os.remove(path)
        with lock: state['inflight'] -= it['size']; lock.notify_all()
    if it['i'] % 200 == 0:
        el = time.time() - t0
        print('%s %d/%d raw %.2f GB fed %.2f GB %.0f s (%.1f MB/s raw)' % (run, it['i'], len(items), raw_total / 1e9, fed_total / 1e9, el, raw_total / 1e6 / max(el, 1)), flush=True)
po.write(b'Q'); po.close(); ovl.wait()
drv.close(); mem.close(); gzh.close()
print('%s done: %d files raw %.3f GB fed %.3f GB in %.0f s' % (run, len(items), raw_total / 1e9, fed_total / 1e9, time.time() - t0), flush=True)
