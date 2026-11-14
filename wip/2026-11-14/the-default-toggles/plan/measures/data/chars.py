# Characters in the texts the line would print, per source: Hebrew letters or points, control characters, the
# replacement character, zero-width characters. Measures only. python3 -I chars.py <default-picks dir>
import json, os, re, sys, collections, unicodedata
L = sys.argv[1]; V1 = os.path.join(L, "default-picks-v1")
mend = {}
for line in open(os.path.join(L, "default-picks-v1.1", "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
HEB = re.compile(r"[֐-׿יִ-ﭏ]"); CTL = re.compile(r"[\u0000-\u001f\u007f-\u009f]"); ZW = re.compile(r"[​-‏ -‮⁠﻿]")
C = collections.Counter(); eg = collections.defaultdict(list)
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    b = f[:-6]
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l)
        st = mend.get((b, d["p"]), d.get("step") or [])
        texts = [("step", x[4]) for x in st if x[4]]
        m = d.get("macula")
        if m and m[0]: texts.append(("macula", m[0]))
        for pc in d.get("ubs") or []:
            for pk in pc[2]: texts.append(("ubs", pk[2]))
        for x in d.get("bdb") or []:
            if x[5]: texts.append(("bdb", x[5]))
        for s, t in texts:
            t = str(t)
            for k, rx in (("hebrew", HEB), ("control", CTL), ("zero-width", ZW)):
                if rx.search(t):
                    C[f"{s} {k}"] += 1
                    if len(eg[f"{s} {k}"]) < 3: eg[f"{s} {k}"].append(f"{b} {d['p']} {t[:80]!r}".encode("ascii", "backslashreplace").decode())
            if "�" in t: C[f"{s} replacement char"] += 1
            if t != t.strip(): C[f"{s} edge space"] += 1
            if "  " in t: C[f"{s} double space"] += 1
for k in sorted(C): print(f"{C[k]:8,d} {k}")
for k, v in eg.items():
    for x in v: print(k, "|", x)
