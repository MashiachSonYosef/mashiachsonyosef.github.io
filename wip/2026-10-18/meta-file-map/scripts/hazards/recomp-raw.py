# Body-only recompression test (local only): split each gzip object into header | deflate body | trailer,
# re-deflate the decompressed bytes with raw deflate (no header) at levels 1-9, memLevel 8/9, and compare the body.
# A match means: header bytes (recorded) + recomputed body + CRC32/ISIZE trailer rebuilds the object exactly.
# Python's zlib here; Node's bundled zlib is tried by recomp-raw.mjs. Usage: python3 -I recomp-raw.py ROOT KEYS.txt OUT.jsonl
import sys, json, zlib, os, struct
ROOT, KEYS, OUT = sys.argv[1:4]
def split(b):
    flg = b[3]; p = 10
    if flg & 4: p += 2 + struct.unpack('<H', b[10:12])[0]
    if flg & 8: p = b.index(b'\0', p) + 1
    if flg & 16: p = b.index(b'\0', p) + 1
    if flg & 2: p += 2
    d = zlib.decompressobj(-15); raw = d.decompress(b[p:]); body_len = len(b) - p - len(d.unused_data)
    return p, raw, b[p:p + body_len], d.unused_data
with open(OUT, 'w', encoding='utf-8') as out:
    for l in open(KEYS, encoding='utf-8'):
        k = json.loads(l); b = open(os.path.join(ROOT, k), 'rb').read()
        hl, raw, body, rest = split(b); hit = None
        for mem in (8, 9):
            for level in range(1, 10):
                c = zlib.compressobj(level, zlib.DEFLATED, -15, mem)
                if c.compress(raw) + c.flush() == body: hit = {'level': level, 'memLevel': mem}; break
            if hit: break
        out.write(json.dumps({'k': k, 'header_len': hl, 'members_after_first_bytes': len(rest) - 8, 'python_raw': hit}, ensure_ascii=False) + '\n')
