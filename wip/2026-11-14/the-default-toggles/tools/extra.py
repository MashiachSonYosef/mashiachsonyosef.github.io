# Two follow-ups to defaults_lines.py over the 39 books: (1) at a word whose UBS first pick is a sign alone ("-"),
# what today's line draws; (2) how many of each default's lines would run past two and three rows of the line's box
# (.g max-width 11em at 0.66rem, taken here as about 20 characters a row). Measures only.
# python3 -I extra.py <reader dir> <default-picks dir>
import gzip, json, os, re, sys, collections
R, L = sys.argv[1], sys.argv[2]
V1, V11 = os.path.join(L, "default-picks-v1"), os.path.join(L, "default-picks-v1.1")
mend = {}
for line in open(os.path.join(V11, "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
SIGN = re.compile(r"^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+|-|—)$")
C = collections.Counter(); eg = collections.defaultdict(list)
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
            for i in range(first, first + count):
                if i not in num: continue
                d = led.get(f"{label}:{num[i]}")
                if not d: continue
                pcs = [p for p in (d.get("ubs") or []) if p[2]]
                if pcs and all(SIGN.match(str(p[2][0][2]).strip()) for p in pcs):
                    t = text.replace("​", "").strip()
                    C["ubs sign-only: today's line is a gap"] += int(t == "")
                    C["ubs sign-only: today's line has words"] += int(t != "")
                    if t and len(eg["ubs"]) < 4: eg["ubs"].append(f"{book} {label}:{num[i]} today «{t}» ubs «{pcs[0][2][0][2]}»")
                ubs = " + ".join(p[2][0][2] for p in pcs) if pcs and not all(SIGN.match(str(p[2][0][2]).strip()) for p in pcs) else ""
                b = d.get("bdb") or []; bdb = (b[0][5] or "") if b else ""
                mac = (d.get("macula") or [""])[0] or ""
                for X, t in (("ubs", ubs), ("bdb", bdb), ("macula", mac), ("today", text.replace("​", ""))):
                    if not t: continue
                    C[f"{X}: lines"] += 1
                    C[f"{X}: over 40 chars (3+ rows)"] += int(len(t) > 40)
                    C[f"{X}: over 60 chars (4+ rows)"] += int(len(t) > 60)
                    C[f"{X}: over 100 chars (6+ rows)"] += int(len(t) > 100)
                if b and not b[0][5] and len(eg["bdb-null"]) < 3: eg["bdb-null"].append(f"{book} {label}:{num[i]} {b[0][1]} {b[0][2]} slot3 «{str(b[0][3])[:90]}»")
                if len(bdb) > 150 and len(eg["bdb-long"]) < 2: eg["bdb-long"].append(f"{book} {label}:{num[i]} «{bdb[:200]}»")
for k in sorted(C): print(f"{C[k]:9,d}  {k}")
for k, v in eg.items():
    for x in v: print(k, "|", x)
