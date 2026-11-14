# Examples: lines that are nothing but gaps, and lines with two gaps side by side, before and after.
# python3 -I gap-examples-two.py <reader dir before> <reader dir after>
import gzip, json, os, sys, collections
A, B = sys.argv[1], sys.argv[2]; GAP = chr(0x200b)
def rec(root, f): return json.loads(gzip.decompress(open(os.path.join(root, "data", "resting-lines", f), "rb").read()))
only = collections.Counter(); two = []; eg_only = []
for f in sorted(os.listdir(os.path.join(B, "data", "resting-lines"))):
    if not f.endswith(".json.gz"): continue
    a, b = rec(A, f), rec(B, f)
    sa = {s[0]: s[1] for s in a["sections"]}
    for label, lines in b["sections"]:
        for i, line in enumerate(lines):
            t = str(line[2])
            if GAP not in t: continue
            if t.strip(GAP) == "":
                only[(len(t), line[1])] += 1
                if len(eg_only) < 6: eg_only.append(f"{f[:-8]} {label} first={line[0]} n={line[1]} credited={line[3]!r} text={t.replace(GAP,'[gap]')!r}")
            if GAP * 2 in t and len(two) < 40:
                old = sa.get(label, [])[i][2] if i < len(sa.get(label, [])) else None
                two.append(f"{f[:-8]} {label}: {str(old).replace(GAP,'[gap]')!r} -> {t.replace(GAP,'[gap]')!r}")
print("nothing but gaps, by (length of text, words under the line):", dict(only.most_common(8)))
for e in eg_only: print("  ", e)
print("two gaps side by side:")
for e in two[:40]: print("  ", e)
