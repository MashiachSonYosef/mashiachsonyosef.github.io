# Fault harness for G3 of check-sign-gap-joiner-v1: the check is run against the page as built and against copies of
# the page broken on purpose, each served from a tree of its own (the page's own file changed, the check's tools
# copied so the check serves that tree, everything else linked to the reader as it stands). G1 and G2 read the
# recordings, which are the same in every tree, and must pass throughout; G3 must pass the sound page and fail each
# broken one. It changes nothing in the reader.
# python3 -I fault-sign-gap-joiner-page.py <reader dir> <work dir>
import os, re, shutil, subprocess, sys
R, WORK = sys.argv[1], sys.argv[2]
page = open(os.path.join(R, "zone.html"), encoding="utf-8").read()

def swap(old, new):
    def f(s):
        n = s.count(old)
        if n != 1: raise SystemExit(f"the fault's text stands {n} times: {old[:70]!r}")
        return s.replace(old, new)
    return f

RUN_SEP = 'sep.className = j ? "g-sep" : "g-sep at-gap"; sep.textContent = j ? "+" : "";'
LAID_SEP = 'sep.className = j ? "g-pp" : "g-pp at-gap"; sep.textContent = j ? " + " : "";'
CASES = [
    ("p0-sound", None, "ok", "the page as built"),
    ("p1-the-fit-counts-a-hidden-joiner", swap("if (c.getClientRects().length) tops.add(", "tops.add("), "FAIL",
     "the run's fit counts a joiner it does not draw (edit 92 undone): every run that holds a gap let down"),
    ("p2-a-runs-gap-cell-holds-no-slot", swap("  .wjoin > .g.parts .g-part.gap { min-width: 0.55em; }\n", ""), "FAIL",
     "a run's gap cell held to nothing (edit 94 undone)"),
    ("p3-a-run-draws-its-joiner-beside-a-gap", swap(RUN_SEP, 'sep.className = "g-sep"; sep.textContent = "+";'), "FAIL",
     "a run draws its joiner beside a gap, as before 14 November"),
    ("p4-a-laid-line-draws-its-joiner-beside-a-gap", swap(LAID_SEP, 'sep.className = "g-pp"; sep.textContent = " + ";'), "FAIL",
     "a line laid in its pieces draws its joiner beside a gap"),
    ("p5-a-run-leaves-out-every-joiner", swap(RUN_SEP, 'sep.className = "g-sep at-gap"; sep.textContent = "";'), "FAIL",
     "a run leaves out the joiner between two cells that print"),
]
bad = 0
for name, fault, want, says in CASES:
    d = os.path.join(WORK, name)
    shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    for entry in os.listdir(R):
        if entry in ("tools", "zone.html"): continue
        os.symlink(os.path.join(R, entry), os.path.join(d, entry))
    shutil.copytree(os.path.join(R, "tools"), os.path.join(d, "tools"), symlinks=True)
    open(os.path.join(d, "zone.html"), "w", encoding="utf-8").write(fault(page) if fault else page)
    p = subprocess.run(["node", "tools/check-sign-gap-joiner-v1.mjs"], cwd=d, capture_output=True, text=True, timeout=900)
    lines = [l for l in p.stdout.splitlines() if l.startswith(("  ok", "FAIL"))]
    got = {l.split()[1]: ("ok" if l.startswith("  ok") else "FAIL") for l in lines}
    good = got.get("G1") == "ok" and got.get("G2") == "ok" and got.get("G3") == want and ((p.returncode == 0) == (want == "ok"))
    if not good: bad += 1
    print(f"{'  as meant' if good else 'NOT AS MEANT'}  {name}: {says} · exit {p.returncode} · " + " · ".join(f"{k} {v}" for k, v in sorted(got.items())))
    for l in lines:
        if l.startswith("FAIL"): print("            " + l[:330])
    if not lines: print("            " + (p.stderr or p.stdout)[-400:])
    shutil.rmtree(d, ignore_errors=True)
print(f"\n{len(CASES) - bad} of {len(CASES)} as meant")
sys.exit(1 if bad else 0)
