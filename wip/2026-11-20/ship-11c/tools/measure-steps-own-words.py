# For every place where STEP's own words may fill a bare line (the default picks index's step_words, the stands set
# apart): what the resting line reads there, on a tree. Usage: python3 measure.py <reader dir> [list]
import json, gzip, sys, os, collections
R = sys.argv[1]; LIST = len(sys.argv) > 2
idx = json.load(open(R + "/data/default-picks/index.json"))
def gz(p): return json.loads(gzip.decompress(open(p, "rb").read()).decode("utf-8"))
tot = collections.Counter(); rows = []
for book, b in idx["books"].items():
    try: zone = gz(f"{R}/data/zones/{book}.bin"); lines = gz(f"{R}/data/resting-lines/{book}.json.gz")
    except Exception as e: tot["book_not_read"] += 1; continue
    at = {}; n = 0
    for sec in zone.get("sections") or []:
        for e, w in enumerate(sec.get("words") or []):
            n += 1; at[n] = (str(sec.get("label")), e, w)
    unit = {}
    for label, units in lines.get("sections") or []:
        for x in units or []:
            for j in range(max(1, x[1])): unit[(str(label), x[0] + j)] = x
    for r in b.get("step_words") or []:
        n, words = r[0], r[1]; stands = len(r) > 2 and r[2] == 1
        label, e, w = at[n]; x = unit.get((label, e))
        printed = words.replace("/ ", " + ").replace("/", " + ")
        if stands: cls = "stands"
        elif not x or not x[2]: cls = "bare_on_record"
        elif x[2] == printed: cls = "the_line_is_the_pick"
        elif str(x[3]) == "M4": cls = "another_row_of_steps"
        else: cls = "another_sources_row"
        tot[cls] += 1
        if LIST and cls in ("another_row_of_steps", "another_sources_row"): rows.append((book, label, e, w.get("k"), words, x[2], x[3]))
print(dict(tot))
for r in rows: print("  ", r)
