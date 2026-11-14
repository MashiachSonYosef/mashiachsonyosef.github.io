# Today's one-word lines credited to TAHOT's pieces against STEP's pick 1, under a fold that also takes the brackets
# off a word ("[is] this?" = "is this?", "like <the>" = "like the"); and today's other one-word lines the same way.
# python3 -I fold2_check.py <reader dir> <default-picks dir>
import sys, json, gzip, os, re, collections
R, L = sys.argv[1], sys.argv[2]
GAP = "​"; SIGN = re.compile(r"^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+)$")
def fold(t):
    ps = [p.strip() for p in re.split(r" \+ |/|-", str(t).replace(GAP, " ")) if p.strip()]
    keep = [re.sub(r"[\[\]<>]", "", p) for p in ps if not SIGN.match(p)]
    s = " ".join(" ".join(keep).split()); return (s[:-1] if s.endswith(".") else s).lower()
V1 = os.path.join(L, "default-picks-v1"); mend = {}
for line in open(os.path.join(L, "default-picks-v1.1", "step-mend-v1.1.jsonl")):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
C = collections.Counter()
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    book = f[:-6]
    rec = json.loads(gzip.open(f"{R}/data/resting-lines/{book}.json.gz").read()); z = json.loads(gzip.open(f"{R}/data/zones/{book}.bin").read())
    led = {}
    for l in open(f"{V1}/{f}"): d = json.loads(l); led[d["p"]] = d
    for si, (label, units) in enumerate(rec["sections"]):
        words = z["sections"][si]["words"]; num = {}; n = 0
        for i, w in enumerate(words):
            if not w.get("mark"): n += 1; num[i] = n
        for u in units:
            if u[1] != 1 or u[0] not in num: continue
            d = led[f"{label}:{num[u[0]]}"]; st = mend.get((book, d["p"]), d["step"]); s = (st[0][4] or "") if st else ""
            if not s: continue
            k = "TAHOT" if u[3] == "PIECE:TAHOT" else "other"
            C[f"{k} one-word lines with a STEP pick"] += 1
            C[f"{k}: equal"] += int(fold(s) == fold(u[2]))
for k, v in sorted(C.items()): print(f"{v:9,d}  {k}")
