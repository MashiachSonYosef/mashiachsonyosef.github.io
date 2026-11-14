# Size of a compact per-book defaults file in the shape the brief proposes, for all 39 books (measure only; the
# "pill" bit is a placeholder 1, since which served row prints a pick is the bake's to compute).
# places[n-1] over every zone entry (marks counted, as data/source-suggested keys them), null at a mark or a place
# with no pick; else [step, macula, ubs, bdb]:
#   step  [[kind, text, pill], ...]   (n is the index + 1)
#   macula text or 0
#   ubs   [[piece, text, pill], ...]  (numbered from 1 within each piece)
#   bdb   [[sense, text or 0, pill], ...]
# python3 -I compact_size.py <reader dir> <default-picks dir> <out dir>
import gzip, json, os, sys
R, L, OUT = sys.argv[1:4]
V1, V11 = os.path.join(L, "default-picks-v1"), os.path.join(L, "default-picks-v1.1")
mend = {}
for line in open(os.path.join(V11, "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
os.makedirs(OUT, exist_ok=True)
tot_raw = tot_gz = 0; rows = []
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    book = f[:-6]
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    led = {}
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l); led[d["p"]] = d
    places = []
    for sec in z["sections"]:
        n = 0
        for w in sec.get("words", []):
            if w.get("mark"): places.append(None); continue
            n += 1
            d = led.get(f"{sec['label']}:{n}")
            if not d: places.append(None); continue
            st = mend.get((book, d["p"]), d.get("step") or [])
            step = [[x[1], x[4] or 0, 1] for x in st]
            mac = d.get("macula"); mac = (mac[0] or 0) if mac else 0
            ubs = [[i, m[2], 1] for i, p in enumerate(d.get("ubs") or []) for m in p[2]]
            bdb = [[str(x[2]).split(":", 1)[-1].rstrip("."), x[5] or 0, 1] for x in (d.get("bdb") or [])]
            places.append([step, mac, ubs, bdb] if (step or mac or ubs or bdb) else None)
    body = {"book": book, "places": places}
    b = json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode()
    g = gzip.compress(b, 9)
    tot_raw += len(b); tot_gz += len(g); rows.append((book, len(b), len(g)))
for r in rows:
    if r[0] in ("genesis", "psalms", "ruth", "amos", "obadiah"): print(f"{r[0]:14s} raw {r[1]:>10,d}  gz {r[2]:>9,d}")
print(f"39 books       raw {tot_raw:>10,d}  gz {tot_gz:>9,d}")
