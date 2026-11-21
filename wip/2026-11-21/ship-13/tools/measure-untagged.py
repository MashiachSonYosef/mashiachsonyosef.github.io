# Ship 13: the corpus lane's list of untagged places (relay v208, its third list) beside what the zones carry.
# The list lands nothing: this lane's projection writes the entries of MACULA's lemma itself (te). This counts where the two agree.
# python3 -I measure-untagged.py <the list> <zones dir>
import sys, json, gzip, collections, os
lines = [json.loads(l) for l in open(sys.argv[1], encoding="utf-8")]
zones = {}
def zone(b):
    if b not in zones:
        z = json.loads(gzip.open(os.path.join(sys.argv[2], b + ".bin")).read().decode("utf-8"))
        zones[b] = {str(s["label"]): s for s in z["sections"]}
    return zones[b]
c = collections.Counter(); ex = collections.defaultdict(list)
for l in lines:
    sec = zone(l["book"]).get(l["ref"])
    if not sec: c["no such verse on the zone"] += 1; continue
    hits = [w for w in sec.get("words", []) if not w.get("mark") and w.get("s") == l["surface"]]
    if not hits: c["no word of the verse carries the surface"] += 1; ex["nosurface"].append((l["book"], l["ref"], l["surface"])); continue
    w = hits[0]
    te = w.get("te"); te = [] if te is None else (te if isinstance(te, list) else [te])
    tg = w.get("tg")
    theirs = l.get("te") or []
    if w.get("kq") or w.get("w"): kind = "a place written one way and read another (the zone asks each half)"
    elif tg: kind = "the zone carries a tag (tg) there"
    elif sorted(te) == sorted(theirs): kind = "the same entries" if te else "none on either side"
    else:
        kind = "entries differ"
        if len(ex[kind]) < 12: ex[kind].append((l["book"], l["ref"], l["surface"], l.get("lemma"), "list", theirs, "zone", te, l.get("te_why_none")))
    c[kind] += 1
    if kind == "the zone carries a tag (tg) there" and len(ex[kind]) < 6: ex[kind].append((l["book"], l["ref"], l["surface"], tg, "pieces", l.get("pieces")))
print(len(lines), "lines"); 
for k, v in c.most_common(): print("  %5d  %s" % (v, k))
for k, v in ex.items():
    for e in v: print("   ", k, "|", json.dumps(e, ensure_ascii=False)[:260])
