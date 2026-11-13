# The cards of one book read at rest and read with every switch lifted (two dumps of card-walk.mjs), set side by
# side: is every resting pill a lifted pill of the same word, do the divisions and the open block agree, which
# pill is pressed, and does every title end in a label an index holds.
# python3 -I card-walk-two-states.py <reader dir> <rest dump> <lifted dump>
import json, os, sys, collections
reader, a, b = sys.argv[1], sys.argv[2], sys.argv[3]
labels = {}
def take(p):
    if not os.path.exists(p): return
    ix = json.load(open(p, encoding="utf8"))
    for i, m in (ix.get("m_sources") or {}).items(): labels.setdefault(i, m.get("label") or i)
take(os.path.join(reader, "data/route-store/index.json"))
for d in sorted(os.listdir(os.path.join(reader, "data/overlays"))): take(os.path.join(reader, "data/overlays", d, "index.json"))
take(os.path.join(reader, "data/span-store/index.json"))
known = sorted(set(labels.values()), key=len, reverse=True)
def label_of(title):
    for l in known:
        if title == l or title.endswith(" · " + l): return l
    return None
R = json.load(open(a, encoding="utf8")); L = json.load(open(b, encoding="utf8"))
T = collections.Counter(); eg = collections.defaultdict(list)
ids = collections.Counter()
for sr, sl in zip(R["sections"], L["sections"]):
    for cr, cl in zip(sr["cards"], sl["cards"]):
        at = f'{sr["label"]}:{cr["n"]}'
        T["words"] += 1
        if cr.get("fault") or cl.get("fault"): T["fault"] += 1; continue
        for c, nm in ((cr, "rest"), (cl, "lifted")):
            for p in c["pills"]:
                T[nm + " pills"] += 1
                lab = label_of(p[1])
                if not lab:
                    T[nm + " title with no known label"] += 1
                    if len(eg["nolabel"]) < 6: eg["nolabel"].append(f"{at} {p[0][:30]!r} {p[1]!r}")
                else:
                    y = p[1][: len(p[1]) - len(lab)].rstrip(" ·")
                    T[nm + " year says: " + ("digits" if y.isdigit() else "no source year" if y == "no source year" else "other")] += 1
                    if not (y.isdigit() or y == "no source year") and len(eg["year"]) < 6: eg["year"].append(f"{at} {p[1]!r}")
                for i in p[2].split():
                    ids[i] += 1
                    if i not in labels and not i.startswith("PIECE:"): T[nm + " by-id no index names"] += 1; eg["byid"].append(i) if len(eg["byid"]) < 10 else None
            on = [x for x, p in enumerate(c["pills"]) if p[5]]
            T[f"{nm} pressed pills: {len(on)}"] += 1
            if len(on) == 1 and on[0] != 0: T[nm + " pressed pill is not the first"] += 1
            texts = [p[0] for p in c["pills"]]
            if len(set(texts)) != len(texts): T[nm + " card prints one text on two pills"] += 1; eg["dup"].append(f"{at} {[t for t in texts if texts.count(t) > 1][:2]}") if len(eg["dup"]) < 6 else None
        for k in ("q", "chain", "chainCell", "cuts", "cells"):
            if cr[k] != cl[k]:
                T["band differs between the states: " + k] += 1
                if len(eg["band"]) < 6: eg["band"].append(f"{at} {k}: rest {cr[k]} lifted {cl[k]}")
        if cr["pieces"] != cl["pieces"]:
            T["here-lines differ between the states"] += 1
            if len(eg["pieces"]) < 4: eg["pieces"].append(f"{at}: rest {[p[1] for p in cr['pieces']]} lifted {[p[1] for p in cl['pieces']]}")
        lt = {p[0] for p in cl["pills"]}
        for p in cr["pills"]:
            if p[0] not in lt:
                T["resting pill that is no lifted pill"] += 1
                low = {x.lower() for x in lt}
                T["   of those, a lifted pill differs by capitals only" if p[0].lower() in low else "   of those, no lifted pill reads the same letters"] += 1
                if len(eg["notin"]) < 10: eg["notin"].append(f"{at} {p[0][:40]!r}")
        pr = [p[0] for p in cr["pills"] if p[5]]; pl = [p[0] for p in cl["pills"] if p[5]]
        if pr != pl:
            T["pressed pill differs between the states"] += 1
            if len(eg["pressed"]) < 8: eg["pressed"].append(f"{at} rest {pr} lifted {pl}")
        # order: the resting pills in the lifted order?
        order = [p[0] for p in cl["pills"] if p[0] in {q[0] for q in cr["pills"]}]
        if order != [p[0] for p in cr["pills"] if p[0] in lt]: T["resting pills stand in another order than the lifted"] += 1
for k in sorted(T): print(f"{T[k]:7d}  {k}")
for k, v in eg.items(): print(k, "::", " | ".join(v))
print("ids behind the pills:", dict(ids.most_common(40)))
