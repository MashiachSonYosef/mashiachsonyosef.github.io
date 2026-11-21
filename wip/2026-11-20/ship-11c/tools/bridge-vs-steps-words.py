# The bridge's places (v202: where our text spells a word otherwise than the Leningrad text STEP follows) against the
# default picks' step_words (STEP's own words: the stands of call 4, and the fills) and the resting line, on a tree.
# Usage: python3 -I bridge-vs-steps-words.py <reader dir> <bridge-places-v1.jsonl>
import json, gzip, sys, collections
R, BR = sys.argv[1], sys.argv[2]
idx = json.load(open(R + "/data/default-picks/index.json"))
def gz(p): return json.loads(gzip.decompress(open(p, "rb").read()).decode("utf-8"))
bridge = collections.defaultdict(list)
for l in open(BR, encoding="utf-8"):
    r = json.loads(l); bridge[r["book"]].append(r)
tot = collections.Counter(); by = collections.Counter(); rows = []
for book, b in idx["books"].items():
    zone = gz(f"{R}/data/zones/{book}.bin"); lines = gz(f"{R}/data/resting-lines/{book}.json.gz")
    at = {}; n = 0; byref = collections.defaultdict(list)
    for sec in zone.get("sections") or []:
        k = 0
        for e, w in enumerate(sec.get("words") or []):
            n += 1; at[n] = (str(sec.get("label")), e, w)
            if w.get("k") or w.get("w"): k += 1; byref[(str(sec.get("label")), k)].append(n)
    unit = {}
    for label, units in lines.get("sections") or []:
        for x in units or []:
            for j in range(max(1, x[1])): unit[(str(label), x[0] + j)] = x
    sw = {r[0]: r for r in b.get("step_words") or []}
    seen = set()
    for r in bridge.get(book, []):
        c, v, wn = r["place"].rsplit(":", 2)[-3:] if r["place"].count(":") == 2 else (None, None, None)
        ns = byref.get((f"{c}:{v}", int(wn)), [])
        if len(ns) != 1: tot["bridge_place_not_found"] += 1; continue
        n = ns[0]; label, e, w = at[n]; seen.add(n)
        keys = [w.get("k")] + [h.get("k") for h in (w.get("w") or [])]
        if r["key_ours"] not in keys: tot["bridge_place_key_differs"] += 1
        s = sw.get(n); x = unit.get((label, e))
        pieces = " + ".join(p["english_tahot"] for p in (r.get("pieces") or []) if p.get("english_tahot")) if r.get("pieces") else None
        cls_sw = "no_step_words" if not s else ("stands" if len(s) > 2 and s[2] == 1 else "fill")
        line = x[2] if x and x[2] else ""
        printed = s[1].replace("/ ", " + ").replace("/", " + ") if s else None
        rel = "-" if not s else ("line_is_steps_words" if line == printed else "line_bare" if not line else ("another_row_of_steps" if str(x[3]) == "M4" else "another_sources_row"))
        tot[f"bridge:{cls_sw}"] += 1; by[(r["class"], r.get("use") or "no pieces", cls_sw, rel)] += 1
        if cls_sw == "no_step_words" and r.get("pieces"): rows.append((book, label, e, r["key_ours"], r["class"], pieces, line, x[3] if x else None))
    for n, s in sw.items():
        if n not in seen: tot["step_words_not_a_bridge_place:" + ("stands" if len(s) > 2 and s[2] == 1 else "fill")] += 1
print(dict(tot))
for k, v in sorted(by.items(), key=lambda kv: -kv[1]): print(f"  {v:5d}  {k}")
print("bridge places with pieces and no step_words:", len(rows))
same = sum(1 for r in rows if r[5] == r[6]); print("  of them the line is the pieces' words joined:", same)
for r in rows[:25]: print("  ", r)
