# The word objects of a zone at a section label, as the zone holds them (every field but the long ones), and what
# the zone and its sidecar hold for each word's key and surface: a span under the key, the line's table entry, the
# sidecar's leaders (the surface's own and those at each kind of place).
# python3 -I words-at.py <reader dir> <book> <section label> [<first entry> <last entry>]
import gzip, json, os, sys
R, book, label = sys.argv[1], sys.argv[2], sys.argv[3]
lo = int(sys.argv[4]) if len(sys.argv) > 4 else 0
hi = int(sys.argv[5]) if len(sys.argv) > 5 else 3
z = json.loads(gzip.open(os.path.join(R, "data", "zones", book + ".bin")).read().decode("utf-8"))
side_path = os.path.join(R, "data", "zones", book + ".lattice.bin")
side = json.loads(gzip.open(side_path).read().decode("utf-8")) if os.path.exists(side_path) else {}
print("zone keys:", sorted(z.keys()))
sec = next(s for s in z["sections"] if str(s.get("label")) == label)
print("section keys:", sorted(k for k in sec.keys() if k != "words"))
for e, w in enumerate(sec["words"]):
    if e < lo or e > hi: continue
    print(f"entry {e}:", json.dumps({k: v for k, v in w.items()}, ensure_ascii=False)[:600])
    k, s = w.get("k"), w.get("s")
    if k:
        for name in ("spans", "gloss", "gloss_m", "gloss_names", "gloss_place", "place"):
            if isinstance(z.get(name), dict) and k in z[name]: print(f"    zone.{name}[key]:", json.dumps(z[name][k], ensure_ascii=False)[:300])
    gr = (side.get("grades") or {}).get(s)
    if gr:
        print("    sidecar grade keys:", sorted(gr.keys()))
        print("    o:", json.dumps(gr.get("o"), ensure_ascii=False)[:400], "· nl:", gr.get("nl"))
        if gr.get("e"): print("    e:", json.dumps(gr["e"], ensure_ascii=False)[:700])
        if gr.get("v"): print("    v:", json.dumps(gr["v"], ensure_ascii=False)[:300])
