# Critic: would a set of "raw" texts (the defaults' own words, printed as given) collide with a served row's text or a
# zone gloss that carries a "/" and today prints through spanJoin? Measures only.
# python3 -I raw_collide.py <reader dir> <default-picks dir>
import gzip, json, os, sys, collections
R, L = sys.argv[1:3]; V1 = os.path.join(L, "default-picks-v1")
raw = set(); C = collections.Counter()
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l)
        m = d.get("macula")
        if m and m[0] and "/" in m[0]: raw.add(m[0])
        for piece in d.get("ubs") or []:
            for p in piece[2]:
                if p[2] and "/" in p[2]: raw.add(p[2])
        for b in d.get("bdb") or []:
            if b[5] and "/" in b[5]: raw.add(b[5])
C["raw texts with a slash"] = len(raw)
d = os.path.join(R, "data", "route-store", "shards")
hit = collections.Counter(); ex = []
for f in sorted(os.listdir(d)):
    x = json.loads(gzip.open(os.path.join(d, f)).read())
    for k, rows in x.items():
        for r in rows:
            t = str(r[1])
            if "/" in t and t in raw:
                hit[r[3]] += 1
                if len(ex) < 6: ex.append((r[3], t[:60]))
zh = 0
for b in ["genesis", "psalms", "isaiah", "daniel", "ruth"]:
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{b}.bin")).read())
    for v in (z.get("gloss") or {}).values():
        if isinstance(v, str) and "/" in v and v in raw: zh += 1
print(dict(C), "store rows equal to a raw slash text:", dict(hit), "zone gloss values equal (5 books):", zh)
for e in ex: print(json.dumps(e, ensure_ascii=True))
