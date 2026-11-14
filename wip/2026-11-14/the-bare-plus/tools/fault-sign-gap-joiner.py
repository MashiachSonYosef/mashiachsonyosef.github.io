# Fault harness for check-sign-gap-joiner-v1: the check is run on a sound recording and on recordings broken on
# purpose, each in a tree of its own (the check's tools copied, so the check reads and serves that tree; the
# recordings written there; everything else linked to the reader as it stands), and must pass the sound one and fail
# every broken one on the line it names. G3 reads the page itself, which is the same in every tree; it is asked to
# fail only where the recordings no longer hold the shapes it chooses its works by. It changes nothing in the reader.
# python3 -I fault-sign-gap-joiner.py <reader dir after> <reader dir before> <work dir>
import gzip, json, os, re, shutil, subprocess, sys
NEW, OLD, WORK = sys.argv[1], sys.argv[2], sys.argv[3]
GAP = chr(0x200b); J = " + "
RD = os.path.join("data", "resting-lines")

def records(root):
    d = os.path.join(root, RD)
    for f in sorted(os.listdir(d)):
        if f.endswith(".json.gz"): yield f, json.loads(gzip.decompress(open(os.path.join(d, f), "rb").read()))

def between(t):  # a gap between two pieces that print, the joiner after it standing
    return re.search("[^" + GAP + "]" + GAP + "+" + re.escape(J) + "[^" + GAP + "]", t) is not None

def build(name, root, edit_text=None, keep_line=None):
    d = os.path.join(WORK, name)
    shutil.rmtree(d, ignore_errors=True)
    os.makedirs(os.path.join(d, RD))
    for entry in os.listdir(NEW):
        if entry not in ("tools", "data"): os.symlink(os.path.join(NEW, entry), os.path.join(d, entry))
    for entry in os.listdir(os.path.join(NEW, "data")):
        if entry != "resting-lines": os.symlink(os.path.join(NEW, "data", entry), os.path.join(d, "data", entry))
    shutil.copytree(os.path.join(NEW, "tools"), os.path.join(d, "tools"), symlinks=True)
    moved = 0
    for f, rec in records(root):
        for sec in rec["sections"]:
            lines = []
            for line in sec[1]:
                if keep_line and not keep_line(str(line[2])): moved += 1; continue
                if edit_text:
                    t2 = edit_text(str(line[2]))
                    if t2 != line[2]: moved += 1
                    line = [line[0], line[1], t2] + list(line[3:])
                lines.append(line)
            sec[1] = lines
        open(os.path.join(d, RD, f), "wb").write(gzip.compress(json.dumps(rec, ensure_ascii=False).encode("utf-8")))
    return d, moved

def run(d):
    p = subprocess.run(["node", "tools/check-sign-gap-joiner-v1.mjs"], cwd=d, capture_output=True, text=True)
    return p.returncode, [l for l in p.stdout.splitlines() if l.startswith(("  ok", "FAIL"))]

CASES = [
    ("f0-sound", NEW, None, None, {"G1": "ok", "G2": "ok", "G3": "ok"}, "the recordings as the changed page drew them"),
    ("f1-the-old-page", OLD, None, None, {"G1": "FAIL", "G3": "ok"}, "the recordings of the page before the change (a joiner beside the gap)"),
    ("f2-joiner-left-out", NEW, lambda t: re.sub("(?<=" + GAP + ")" + re.escape(J) + "(?=[^" + GAP + "])", "", t, count=1) if between(t) else t, None, {"G1": "FAIL"},
     "between two pieces that print, the joiner after the gap left out («and[gap]besides»)"),
    ("f3-joiner-on-both-sides", NEW, lambda t: re.sub("(?<=[^" + GAP + "])(" + GAP + "+)" + re.escape(J), J + r"\1" + J, t, count=1) if between(t) else t, None, {"G1": "FAIL"},
     "between two pieces that print, a joiner on both sides of the gap again («and + [gap] + besides»)"),
    ("f4-gap-dropped", NEW, lambda t: t.replace(GAP, ""), None, {"G1": "FAIL", "G2": "FAIL", "G3": "FAIL"}, "the gap dropped from every line (the joiner gone with it; G3 finds no work to open)"),
    ("f5-no-gap-between", NEW, None, lambda t: not between(t), {"G1": "ok", "G2": "FAIL", "G3": "FAIL"}, "the lines whose gap stands between two pieces that print taken out (G3 finds no work to open)"),
    ("f6-joiner-at-the-start-once", NEW, lambda t, s={"done": False}: (s.__setitem__("done", True) or (GAP + J + t[1:])) if (not s["done"] and t.startswith(GAP) and not t.startswith(GAP + GAP) and len(t) > 1) else t, None, {"G1": "FAIL"},
     "one line only, a joiner after a leading gap («[gap] + before»)"),
]
bad = 0
for name, root, edit, keep, want, says in CASES:
    d, moved = build(name, root, edit, keep)
    code, lines = run(d)
    got = {l.split()[1]: ("ok" if l.startswith("  ok") else "FAIL") for l in lines}
    good = all(got.get(k) == v for k, v in want.items()) and ((code == 0) == all(v == "ok" for v in want.values()))
    if not good: bad += 1
    print(f"{'  as meant' if good else 'NOT AS MEANT'}  {name}: {says} · {moved:,} lines moved · exit {code} · " + " · ".join(f"{k} {v}" for k, v in sorted(got.items())))
    for l in lines:
        if l.startswith("FAIL"): print("            " + l[:230].replace(GAP, "[gap]"))
    shutil.rmtree(d, ignore_errors=True)
print(f"\n{len(CASES) - bad} of {len(CASES)} as meant")
sys.exit(1 if bad else 0)
