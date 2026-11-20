# Ship 10b scoping: the 966 spans the twelve's own data read, against the span store's places as ship 10a lays them.
import sys, json, collections, os
here = os.path.dirname(os.path.abspath(__file__))
multi = {tuple(x[:4]): x[4] for x in json.load(open(os.path.join(here, "multi-spans.json")))["multi"]}
places = json.load(open(os.path.join(here, "places.json"), encoding="utf-8"))
P = {(p["book"], p["ref"], p["first"], p["last"]): p for p in places}
stand = {k for k, p in P.items() if p["stands"]}
print("spans the twelve read (v209):", len(multi), "· places:", len(P), "· standing at rest (10a):", len(stand))
print("standing and read as a span by a source:", len(stand & set(multi)))
print("standing, read as a span by no source's line:", len(stand - set(multi)))
print("read as a span by a source, a place set aside:", len((set(multi) & set(P)) - stand))
print("read as a span by a source, no place of the span store:", len(set(multi) - set(P)))
# standing but no source reads it as a span: by the line's source and key
c = collections.Counter(); keys = collections.Counter()
for k in stand - set(multi):
    c[P[k]["line_m"]] += 1; keys[(P[k]["key"], P[k]["line_text"])] += 1
print(" standing/no span, by line source:", dict(c))
for (k, t), n in keys.most_common(14): print("   ", n, k, "|", t)
# set aside but a source reads it
c = collections.Counter(); keys = collections.Counter()
for k in (set(multi) & set(P)) - stand:
    c[(P[k]["why"], tuple(sorted(multi[k])))] += 1; keys[P[k]["key"]] += 1
print(" set aside/read as span:", {str(k): v for k, v in c.most_common(12)})
for k, n in keys.most_common(12): print("   ", n, k)
# no place at all: by sources
c = collections.Counter(tuple(sorted(multi[k])) for k in set(multi) - set(P))
print(" no place:", {str(k): v for k, v in c.most_common()})
