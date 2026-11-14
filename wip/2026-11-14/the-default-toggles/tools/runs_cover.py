# Lines over more than one word at rest (span-store and whole-form run lines), 39 books: for each default, how many
# such lines it has a line pick at every word of, at some words only, or at none. Measures only.
# python3 -I runs_cover.py <reader dir> <default-picks dir>
import gzip, json, os, re, sys, collections
R, L = sys.argv[1], sys.argv[2]; V1 = os.path.join(L, "default-picks-v1")
SIGN = re.compile(r"^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+|-|—)$")
def has(d, X):
    if X == "step": st = d.get("step") or []; return bool(st and st[0][4])
    if X == "macula": m = d.get("macula"); return bool(m and m[0])
    if X == "ubs": pcs = [p for p in (d.get("ubs") or []) if p[2]]; return bool(pcs) and not all(SIGN.match(str(p[2][0][2]).strip()) for p in pcs)
    b = d.get("bdb") or []; return bool(b and b[0][5])
C = collections.Counter(); lines = 0
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    b = f[:-6]
    rec = json.loads(gzip.open(os.path.join(R, "data", "resting-lines", f"{b}.json.gz")).read())
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{b}.bin")).read())
    led = {json.loads(l)["p"]: json.loads(l) for l in open(os.path.join(V1, f), encoding="utf-8")}
    for si, (label, units) in enumerate(rec["sections"]):
        words = z["sections"][si].get("words", []); num = {}; n = 0
        for i, w in enumerate(words):
            if not w.get("mark"): n += 1; num[i] = n
        for first, count, text, credit in units:
            ws = [num[i] for i in range(first, first + count) if i in num]
            if len(ws) < 2: continue
            lines += 1
            for X in ("step", "ubs", "macula", "bdb"):
                k = sum(has(led[f"{label}:{w}"], X) for w in ws)
                C[f"{X}: {'every word' if k == len(ws) else 'some words' if k else 'no word'}"] += 1
print("lines over more than one word", lines)
for k in sorted(C): print(f"{C[k]:7,d}  {k}")
