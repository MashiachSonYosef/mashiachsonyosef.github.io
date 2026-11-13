# The rows the route store and each overlay hold for one consonantal key, as stored: for seeing whose year and whose
# words stand behind a reading. python3 -I rows-of-key.py <reader dir> <book> <section index> <word number> [text filter]
import gzip, hashlib, json, os, sys
reader, book, sec, n = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
want = sys.argv[5].lower() if len(sys.argv) > 5 else None
zone = json.loads(gzip.open(os.path.join(reader, "data/zones", book + ".bin")).read())
words = [w for w in zone["sections"][sec]["words"] if not w.get("mark")]
w = words[n - 1]
k = w.get("k") or ""
print("the word", w.get("s"), "key", k)
h = hashlib.sha256(k.encode("utf8")).hexdigest()[:2]
def rows(d):
    p = os.path.join(reader, d, "shards", h + ".bin")
    if not os.path.exists(p): return []
    return json.loads(gzip.open(p).read()).get(k) or []
for d in ["data/route-store"] + [os.path.join("data/overlays", o) for o in sorted(os.listdir(os.path.join(reader, "data/overlays")))]:
    rs = rows(d)
    print(d, len(rs), "rows")
    for r in rs:
        t = json.dumps(r, ensure_ascii=False)
        if want and want not in t.lower(): continue
        print("   ", t[:260])
