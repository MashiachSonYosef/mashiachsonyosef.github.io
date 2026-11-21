# The owner's question of 21 November: «if we only included definitions for words cut by the step default i wonder how
# far up accuracy would go». Measured on the fourteen Genesis 1 verb cards the outside reader graded on 12 November,
# under four readings of «only STEP's»; nothing is graded anew, a pill the reader never saw is counted apart.
# python3 -I step-cut-filters.py <graded tsv> <live cards dump> <ledger dir default-picks-v1>
import json, csv, sys, re, os, collections
tsv, dump, ledger = sys.argv[1:4]
norm = lambda s: re.sub(r"\s+", " ", str(s)).strip()
STOP = set("to be a an the of in with for as by on at or and it he she they we you i will shall was were is are has have had that which who whom this these his her its their not from into out up self one".split())
def stem(w):
    w = w.lower()
    for suf in ("ing", "ed", "es", "s"):
        if len(w) > len(suf) + 3 and w.endswith(suf): w = w[: -len(suf)]; break
    return w[:-1] if len(w) > 4 and w.endswith("e") else w
def stems(t): return {stem(x) for x in re.findall(r"[A-Za-z]+", str(t)) if x.lower() not in STOP}
# STEP's own words for each entry, over the 39 books: TAHOT's words at every place it tags the entry, and TBESH's gloss
by_entry = collections.defaultdict(set); at_place = {}
for f in sorted(os.listdir(ledger)):
    if not f.endswith(".jsonl"): continue
    book = f[:-6]
    for line in open(os.path.join(ledger, f), encoding="utf-8"):
        d = json.loads(line)
        if not isinstance(d, dict) or "p" not in d: continue
        for p in d.get("step") or []:
            if p[1] == "r":
                by_entry[p[2]] |= stems(p[4]) | stems(p[3])
        if book == "genesis": at_place[d["p"]] = d
calls = {}; who = {}
for r in csv.DictReader(open(tsv, encoding="utf-8"), delimiter="\t"):
    calls[(r["verse"], r["form"], norm(r["text"]))] = r["the reader's call"]; who[(r["verse"], r["form"], norm(r["text"]))] = r["sources behind it"]
dd = json.load(open(dump, encoding="utf-8"))
rows = []   # each pill now live: card, text, carriers, the reader's call or None, and what each reading of the question keeps
for c in dd["cards"]:
    d = at_place[c["ask"]]
    step = [p for p in (d.get("step") or []) if p[1] == "r"]
    entry = step[0][2] if step else None
    picks = set()
    for p in d.get("step") or []: picks |= {norm(p[3]).lower(), norm(p[4]).lower()}
    if d.get("macula"): picks.add(norm(d["macula"][0]).lower())
    for pc in d.get("ubs") or []:
        for x in pc[2]: picks |= {norm(y).lower() for y in str(x[2]).split(" / ")}
    for b in d.get("bdb") or []: picks |= {norm(y).lower() for y in str(b[5] or "").split(", ")}
    S_ = by_entry.get(entry, set())
    for x in c["pills"]:
        t = norm(x["text"]); by = set(str(x.get("by") or "").split()); st = stems(t)
        rows.append({"card": c["ask"], "text": t, "by": by, "call": calls.get((c["label"], c["s"], t)), "entry": entry,
            "live": True, "steps_own": bool(by & {"M4", "M19", "PIECE:TAHOT"}), "a_default_pick": t.lower().rstrip(".") in picks,
            "step_all": bool(st) and st <= S_, "step_any": bool(st & S_)})
def say(name, keep):
    k = [r for r in rows if keep(r)]
    g = [r for r in k if r["call"]]; right = sum(1 for r in g if r["call"] == "R")
    lost = sum(1 for r in rows if r["call"] == "R" and not keep(r))
    print(f"{name:66s} {len(k):4d} pills · graded {len(g):3d}: right {right:3d}, not right {len(g) - right:3d} = {100 * right / max(1, len(g)):5.1f}% · never graded {len(k) - len(g):2d} · right pills dropped {lost}")
print("the fourteen cards as live now (main 9017d8f9c6), by the reader's calls of 12 November")
say("as live now", lambda r: True)
say("only pills STEP itself carries (TAHOT, TBESH)", lambda r: r["steps_own"])
say("only a default source's own pick at the place (STEP, MACULA, UBS, BDB)", lambda r: r["a_default_pick"] or r["steps_own"])
say("any dictionary, where STEP renders the place's entry so (every word)", lambda r: r["step_all"] or r["steps_own"])
say("any dictionary, where STEP renders the place's entry so (some word)", lambda r: r["step_any"] or r["steps_own"])
print()
print("what the last-but-one reading drops and keeps among the pills called not right or right:")
for r in rows:
    if r["call"] and (r["step_all"] or r["steps_own"]) and r["call"] != "R": print("   KEPT, called", r["call"], "|", r["card"], "|", r["text"][:50], "|", " ".join(sorted(r["by"])))
for r in rows:
    if r["call"] == "R" and not (r["step_all"] or r["steps_own"]): print("   DROPPED, called right |", r["card"], "|", r["text"][:60], "|", " ".join(sorted(r["by"])))
