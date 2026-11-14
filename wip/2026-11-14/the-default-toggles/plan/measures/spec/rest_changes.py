# Under STEP lit at rest, the single words (not in a joined run) whose line would change from today's resting line:
# STEP's pick 1, drawn as TAHOT's line is drawn (signs as a gap, brackets kept as the words have them), against
# today's text; folded loosely (case, spaces, "+", brackets, a closing stop, sign tokens). Also counts UBS picks
# whose words are a placeholder ("NO DATA YET"). Measures only.
# python3 -I rest_changes.py <reader dir> <default-picks dir> <out json>
import gzip, json, os, re, sys, collections
R, L, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
V1, V11 = os.path.join(L, "default-picks-v1"), os.path.join(L, "default-picks-v1.1")
mend = {}
for line in open(os.path.join(V11, "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
SIGNTOK = re.compile(r"<[^>]*>|¿|~|×|\.\s*\.\s*\.|vvv")
def fold(t):
    s = str(t).replace("​", "")
    s = SIGNTOK.sub(" ", s).replace("[", "").replace("]", "").replace("/", " ").replace("+", " ")
    s = " ".join(s.split()).lower()
    return s[:-1].strip() if s.endswith(".") else s
C = collections.Counter(); eg = collections.defaultdict(list); credits = collections.Counter()
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    book = f[:-6]
    rec = json.loads(gzip.open(os.path.join(R, "data", "resting-lines", f"{book}.json.gz")).read())
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    led = {}
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l); led[d["p"]] = d
    for si, (label, units) in enumerate(rec["sections"]):
        words = z["sections"][si].get("words", []); num = {}; n = 0
        for i, w in enumerate(words):
            if not w.get("mark"): n += 1; num[i] = n
        for first, count, text, credit in units:
            wsn = [num[i] for i in range(first, first + count) if i in num]
            for wn in wsn:
                d = led.get(f"{label}:{wn}")
                if not d: continue
                for p in (d.get("ubs") or []):
                    for pk in p[2]:
                        if str(pk[2]).strip().upper() == "NO DATA YET": C["ubs pick NO DATA YET"] += 1
                if len(wsn) > 1: continue
                st = mend.get((book, d["p"]), d.get("step") or [])
                if not st or not st[0][4]: continue
                a, b = fold(st[0][4]), fold(text)
                if a == b: continue
                C["single words that change"] += 1
                k = credit if credit in ("PIECE:TAHOT", "PIECE:MACULA") else "a dictionary row"
                credits[k] += 1
                if len(eg[k]) < 25: eg[k].append(f"{book} {label}:{wn} today «{text}» ({credit}) STEP «{st[0][4]}» ({st[0][1]})")
json.dump({"counts": dict(C), "by today's credit": dict(credits), "examples": eg}, open(OUT, "w"), indent=1, ensure_ascii=False)
print(dict(C), dict(credits))
