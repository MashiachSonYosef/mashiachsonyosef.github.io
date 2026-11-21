import sys, json, gzip, collections, re
R, B = sys.argv[1], sys.argv[2]
def gz(p): return json.loads(gzip.decompress(open(p, "rb").read()).decode("utf-8"))
num = lambda t: "H" + str(int(re.sub(r"[^0-9]", "", t)))
T = collections.Counter(); odd = []; zones = {}
for l in open(B + "/bridge-places-v1.jsonl", encoding="utf-8"):
    r = json.loads(l)
    if not (r["class"] == "STEP_WRITES_OUR_SPELLING" and r["use"] == "NEW_PIECES"): continue
    z = zones.get(r["book"]) or zones.setdefault(r["book"], gz(f"{R}/data/zones/{r['book']}.bin"))
    sec = [s for s in z["sections"] if s.get("label") == r["ref"]][0]
    w = [x for x in sec["words"] if not x.get("mark")][int(r["place"].split(":")[2]) - 1]
    cores = [p["tag"] for p in r["pieces"] if p["role"] == "core" and p.get("tag")]
    T["cores:%d" % len(cores)] += 1
    if cores != r["main_tags"]: T["cores_are_not_the_main_tags"] += 1
    te = w.get("te"); te = [te] if isinstance(te, str) else (te or [])
    if not te: T["no te"] += 1; continue
    inn = all(num(c) in [num(t) for t in te] for c in cores)
    T["te holds every core's number" if inn else "te lacks a core's number"] += 1
    if not inn: odd.append((r["book"], r["place"], r["key_ours"], cores, te, [p["english_tahot"] for p in r["pieces"]]))
print(dict(T))
for o in odd[:40]: print("  ", o)
