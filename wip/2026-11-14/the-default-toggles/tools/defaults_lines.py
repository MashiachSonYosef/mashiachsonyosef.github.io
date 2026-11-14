# Each default's line over the 39 books, word by word, against today's resting line (data/resting-lines records).
# A default X stands at a word where X's first pick gives a line text; elsewhere today's line stands. Measures only.
# python3 -I defaults_lines.py <reader dir> <default-picks dir (holds v1 and v1.1)> <out json>
import gzip, json, os, re, sys, collections, statistics
R, L, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
V1, V11 = os.path.join(L, "default-picks-v1"), os.path.join(L, "default-picks-v1.1")
mend = {}
for line in open(os.path.join(V11, "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
SIGN = re.compile(r"^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+|-|—|\.\s*\.\s*\.|vvv)$")
def step_text(words):
    if not words: return ""
    xs = [x.strip() for x in str(words).split("/") if x.strip()]
    if not all(SIGN.match(x) for x in xs): xs = [x for x in xs if not SIGN.match(x)]
    s = " + ".join(xs); return s[:-1] if s.endswith(".") else s
def fold(t):
    s = " ".join(str(t).replace("​", "").split()); s = s.replace(" + ", " ").replace("+", " ")
    s = " ".join(s.split()); return (s[:-1] if s.endswith(".") else s).lower()
def picks(d, book):
    out = {}
    st = mend.get((book, d["p"]), d.get("step") or [])
    out["step"] = step_text(st[0][4]) if st else ""
    out["step_n"] = len(st)
    mac = d.get("macula")
    out["macula"] = (mac[0] or "") if mac else ""
    pcs = [p for p in (d.get("ubs") or []) if p[2]]
    out["ubs"] = " + ".join(p[2][0][2] for p in pcs if p[2][0][2]) if pcs else ""
    out["ubs_sign_only"] = bool(pcs) and all(SIGN.match(str(p[2][0][2]).strip()) for p in pcs)
    out["ubs_n"] = max([len(p[2]) for p in pcs], default=0)
    out["ubs_pieces"] = len(pcs)
    b = d.get("bdb") or []
    out["bdb"] = (b[0][5] or "") if b else ""
    out["bdb_any"] = bool(b)
    out["bdb_n"] = len(b)
    out["bdb_slot3_len"] = len(b[0][3] or "") if b else 0
    return out
T = collections.Counter(); per_book = {}; lens = collections.defaultdict(list); runs = collections.Counter()
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    book = f[:-6]
    rec = json.loads(gzip.open(os.path.join(R, "data", "resting-lines", f"{book}.json.gz")).read())
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    led = {}
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l); led[d["p"]] = d
    B = collections.Counter()
    for si, (label, units) in enumerate(rec["sections"]):
        words = z["sections"][si].get("words", []); num = {}; n = 0
        for i, w in enumerate(words):
            if not w.get("mark"): n += 1; num[i] = n
        for first, count, text, credit in units:
            ws = [num[i] for i in range(first, first + count) if i in num]
            run = len(ws) > 1
            for w in ws:
                d = led.get(f"{label}:{w}")
                if not d: B["word not in ledger"] += 1; continue
                pk = picks(d, book)
                B["words"] += 1
                B[f"today credit {credit if credit in ('PIECE:TAHOT','M4','PIECE:MACULA') else 'other'}"] += 1
                if run: B["today: run line"] += 1
                if not text.replace("​", "").strip(): B["today: gap or bare"] += 1
                lens["today"].append(len(text.replace("​", "")))
                for X in ("step", "macula", "ubs", "bdb"):
                    t = pk[X]
                    if X == "ubs" and pk["ubs_sign_only"]: t = ""
                    if t:
                        B[f"{X}: has a line"] += 1
                        lens[X].append(len(t))
                        same = fold(t) == fold(text)
                        B[f"{X}: same as today"] += int(same)
                        if run: B[f"{X}: at a run word"] += 1
                    else:
                        B[f"{X}: today's line stands"] += 1
                if pk["step_n"] > 1: B["step: several picks"] += 1
                if pk["ubs_n"] > 1: B["ubs: several picks in a piece"] += 1
                if pk["ubs_pieces"] > 1: B["ubs: picks on several pieces"] += 1
                if pk["bdb_n"] > 1: B["bdb: several picks"] += 1
                if pk["bdb_any"] and not pk["bdb"]: B["bdb: pick but no entry words"] += 1
                if pk["ubs_sign_only"]: B["ubs: first pick a sign only"] += 1
                if " / " in pk["bdb"]: B["bdb: entry words joined by /"] += 1
                if " / " in pk["ubs"]: B["ubs: glosses joined by /"] += 1
    per_book[book] = dict(B); T.update(B)
def q(xs, p): xs = sorted(xs); return xs[min(len(xs) - 1, int(p * len(xs)))]
summary = {"total": dict(sorted(T.items())), "lengths": {k: {"median": statistics.median(v), "p90": q(v, .9), "p99": q(v, .99), "max": max(v), "over_40": sum(1 for x in v if x > 40)} for k, v in lens.items()},
           "per_book": per_book}
json.dump(summary, open(OUT, "w"), indent=1)
W_ = T["words"]
for k, v in sorted(T.items()): print(f"{v:9,d}  {100*v/W_:6.2f}%  {k}")
for k, v in summary["lengths"].items(): print(k, v)
