# The notes above the pills («here MACULA / UBS / BDB reads …»): every distinct (word, line, pick) once, to read by hand.
# Read only. Usage: python3 -I picks.py <out dir> <macula|ubs|bdb>
import sys, os, json, glob, re, collections
OUT, src = sys.argv[1], sys.argv[2]
rows = []
for f in sorted(glob.glob(os.path.join(OUT, "cards-ch*.jsonl"))):
    for ln in open(f):
        rows.append(json.loads(ln))
cnt = {}
seen = collections.OrderedDict()
total = 0
for r in rows:
    cnt[r["verse"]] = cnt.get(r["verse"], 0) + 1
    r["wv"] = cnt[r["verse"]]
    for cls, t in r.get("notes") or []:
        if not cls.startswith("r-dflt"): continue
        m = re.match(r"here (\w+) reads ?(.*?)( (CC BY(-SA)? 4\.0|Public Domain))?$", t)
        if not m or m.group(1).lower() != src: continue
        total += 1
        key = (re.sub(r"[֑-ֽ֯]", "", r["s"]), r.get("credit") or "", m.group(2))
        if key not in seen: seen[key] = [f"{r['verse']} w{r['wv']}", 0]
        seen[key][1] += 1
print(f"{src}: {total} notes on {len(rows)} cards, {len(seen)} distinct")
with open(os.path.join(OUT, f"picks-{src}.tsv"), "w") as f:
    f.write("first_place\tcount\thebrew\tline\tpick\n")
    for (s, line, pick), (place, n) in seen.items():
        f.write(f"{place}\t{n}\t{s}\t{line}\t{pick}\n")
        print(f"{place} {s} «{line}» → {pick}" + (f"  ×{n}" if n > 1 else ""))
