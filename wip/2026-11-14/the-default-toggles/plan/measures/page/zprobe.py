# Zone word shapes for one book: how many words carry several non-maqaf regions (kq or not), pg, marks. Measures only.
# python3 -I zprobe.py <reader dir> <book>
import gzip, json, os, sys, collections
R, b = sys.argv[1], sys.argv[2]
z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{b}.bin")).read())
C = collections.Counter(); eg = []
for sec in z["sections"]:
    for w in sec.get("words", []):
        if w.get("mark"): C["mark"] += 1; continue
        C["word"] += 1
        ws = w.get("w") or []
        atoms = [r for r in ws if "־" not in str(r.get("s") or r.get("k") or "")]
        if w.get("kq"): C["kq"] += 1
        if len(atoms) > 1 and not w.get("kq"):
            C["several atoms, not kq"] += 1
            if len(eg) < 3: eg.append((sec["label"], w.get("s"), [r.get("k") for r in ws]))
        if "־" in str(w.get("s") or ""): C["s holds a maqaf"] += 1
        if isinstance(w.get("pg"), list) and w["pg"]: C["has pg"] += 1
        if isinstance(w.get("pg"), list) and len(w["pg"]) > 1: C["pg > 1"] += 1
print(dict(C)); print(eg)
print("top keys", list(z.keys())[:40])
