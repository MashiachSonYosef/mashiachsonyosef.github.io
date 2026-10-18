# Same test with Python's zlib (the system zlib), levels 1-9, memLevel 8 and 9 (local only).
# Usage: python3 -I recomp-test.py ROOT KEYS.txt OUT.jsonl
import sys, json, zlib, gzip, hashlib, os
ROOT, KEYS, OUT = sys.argv[1:4]
with open(OUT, 'w', encoding='utf-8') as out:
    for l in open(KEYS, encoding='utf-8'):
        k = json.loads(l); orig = open(os.path.join(ROOT, k), 'rb').read(); raw = gzip.decompress(orig)
        hit = None
        if orig[3] == 0:
            for mem in (8, 9):
                for level in range(1, 10):
                    c = zlib.compressobj(level, zlib.DEFLATED, 31, mem); g = bytearray(c.compress(raw) + c.flush())
                    g[4:10] = orig[4:10]
                    if bytes(g) == orig: hit = {'level': level, 'memLevel': mem}; break
                if hit: break
        out.write(json.dumps({'k': k, 'python_zlib_rebuilt': hit}, ensure_ascii=False) + '\n')
print('python zlib', zlib.ZLIB_RUNTIME_VERSION, file=sys.stderr)
