# The pills of the outside reader's fourteen verb cards that a row of the UBS dictionary, the SDBH or Jastrow stands
# behind (as the reader's table names the sources behind each pill on 12 November), by the reader's call, and where
# each stands on two builds: on the card or not. The corpus lane counted these 44 pills in its relay v173 and said
# what the stems extension would withhold of them; this sets that beside what the builds print.
# python3 -I verb-cards-of-three.py <verb-cards-cross.tsv> <cards dump of the build before .json> <cards dump of the build after .json>
import collections, csv, json, sys

table, before, after = sys.argv[1], sys.argv[2], sys.argv[3]
THREE = {"M17", "M18", "M12", "M39", "M49", "M65", "M75", "M106"}


def texts(path):
    out = {}
    for c in json.load(open(path, encoding="utf8"))["cards"]:
        out[(c["label"], c["s"])] = {p["text"].strip().lower() for p in c["pills"]}
    return out


A, B = texts(before), texts(after)
by = collections.defaultdict(collections.Counter)
listed = []
for r in csv.DictReader(open(table, encoding="utf8"), delimiter="\t"):
    srcs = set(r["sources behind it"].split())
    if not srcs & THREE: continue
    key, t = (r["verse"], r["form"]), r["text"].strip().lower()
    a, b = t in A.get(key, set()), t in B.get(key, set())
    state = "on both" if a and b else "gone on the second" if a and not b else "gone before the first" if not a and not b else "only on the second"
    by[r["the reader's call"]][state] += 1
    listed.append((r["the reader's call"], state, r["verse"], r["text"][:60], " ".join(sorted(srcs))))
for call in ["S", "R", "W", "U", "B", "M"]:
    if by[call]: print(f"{call}: {sum(by[call].values())} pills · " + " · ".join(f"{k} {v}" for k, v in sorted(by[call].items())))
print("")
for row in sorted(listed): print("  " + " · ".join(row))
