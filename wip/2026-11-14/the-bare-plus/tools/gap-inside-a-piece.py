# Lines at rest whose gap stands inside a stretch between joiners rather than at its edge (a gap the reading of the
# line by its joiners and edges would not see), and gaps that come in runs. It measures; it changes nothing.
# python3 -I gap-inside-a-piece.py <reader dir>
import gzip, json, os, sys, collections
R = sys.argv[1]; GAP = chr(0x200b); C = collections.Counter(); eg = []
d = os.path.join(R, "data", "resting-lines")
for f in sorted(os.listdir(d)):
    if not f.endswith(".json.gz"): continue
    rec = json.loads(gzip.decompress(open(os.path.join(d, f), "rb").read()))
    for label, lines in rec["sections"]:
        for line in lines:
            t = str(line[2])
            if GAP not in t: continue
            C["lines with a gap"] += 1
            for chunk in t.split(" + "):
                inner = chunk.strip(GAP)
                if GAP in inner:
                    C["a gap inside a stretch"] += 1
                    if len(eg) < 8: eg.append(f"{f[:-8]} {label}: {t.replace(GAP, '[gap]')}")
            if GAP * 2 in t: C["two gaps side by side"] += 1
            if t.strip(GAP) == "": C["nothing but gaps"] += 1
for k, v in C.items(): print(f"{v:>8,}  {k}")
for e in eg: print("  ", e)
