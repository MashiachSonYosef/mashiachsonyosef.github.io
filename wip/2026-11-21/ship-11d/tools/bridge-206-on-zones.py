# The 206 places (STEP_WRITES_OUR_SPELLING, NEW_PIECES) on the zones of a tree: how each word stands.
import sys, json, gzip, collections
R, B = sys.argv[1], sys.argv[2]
def gz(p): return json.loads(gzip.decompress(open(p, "rb").read()).decode("utf-8"))
T = collections.Counter(); odd = []; zones = {}
for l in open(B + "/bridge-places-v1.jsonl", encoding="utf-8"):
    r = json.loads(l)
    if not (r["class"] == "STEP_WRITES_OUR_SPELLING" and r["use"] == "NEW_PIECES"): continue
    T["places"] += 1
    z = zones.get(r["book"]) or zones.setdefault(r["book"], gz(f"{R}/data/zones/{r['book']}.bin"))
    secs = [s for s in z["sections"] if s.get("label") == r["ref"]]
    if len(secs) != 1: T["verse_not_one"] += 1; continue
    words = secs[0].get("words") or []
    n = int(r["place"].split(":")[2])
    counted = [w for w in words if not w.get("mark")]
    hits = [i for i, w in enumerate(words) if w.get("s") == r["lattice_v12"]["surface"]]
    w = counted[n - 1] if n - 1 < len(counted) else None
    if w is None: T["no_such_word_number"] += 1; continue
    if w.get("s") != r["lattice_v12"]["surface"]: T["surface_differs_at_the_number"] += 1; odd.append((r["book"], r["place"], w.get("s"), r["lattice_v12"]["surface"], len(hits))); continue
    T["found_by_number_and_surface"] += 1
    if len(hits) != 1: T["surface_stands_%d_times_in_the_verse" % len(hits)] += 1
    T["plain" if (w.get("k") and not w.get("w")) else "pair_or_other"] += 1
    if w.get("kq"): T["kq"] += 1
    if w.get("kq_trivial"): T["kq_trivial"] += 1
    if w.get("k") != r["key_ours"]: T["key_differs"] += 1; odd.append((r["book"], r["place"], w.get("k"), r["key_ours"]))
    if "pg" in w: T["carries_pg_now"] += 1; odd.append((r["book"], r["place"], "pg", json.dumps(w["pg"], ensure_ascii=False)[:160]))
    T["tg" if "tg" in w else ("te" if "te" in w else "no_tag")] += 1
    if w.get("np"): T["np"] += 1
    if w.get("pc"): T["pc"] += 1
    if w.get("after_maqaf") or w.get("presentation_join"): T["joined_by_a_stroke"] += 1
    if w.get("s") != r["our_form"]: T["our_form_is_not_the_surface"] += 1
print(dict(T))
for o in odd[:20]: print("  ", o)
