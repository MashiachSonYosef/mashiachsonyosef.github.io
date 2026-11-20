# Ship 10b scoping: the places the twelve's own data read as two or more words (v209 spans), against the span
# store's places and the ones that stand at rest under ship 10a's rule. Read-only; usage: python3 -I scope-spans.py <spans.jsonl> <span-places.jsonl> <span-store dir> <kinds dir>
import sys, json, os, collections
spans_p, places_p, store_dir = sys.argv[1:4]
spans = [json.loads(l) for l in open(spans_p, encoding="utf-8")]
by_class = collections.Counter((s["source"], s["class"]) for s in spans)
for k, n in sorted(by_class.items()): print("class", k, n)
def span_of(s):
    if not s.get("first_word") or not s.get("last_word"): return None
    a = s["first_word"].rsplit(":", 1); z = s["last_word"].rsplit(":", 1)
    if a[0] != z[0]: return None
    return (s["book"], a[0], int(a[1]), int(z[1]))
multi = collections.defaultdict(set)   # (book, ref, first, last) -> sources
for s in spans:
    sp = span_of(s)
    if sp and sp[3] > sp[2]: multi[sp].add(s["source"])
print("distinct multi-word spans (any source):", len(multi))
bysrc = collections.Counter()
for sp, srcs in multi.items():
    for x in srcs: bysrc[x] += 1
print("by source:", dict(bysrc))
print("by how many sources:", dict(collections.Counter(len(v) for v in multi.values())))
print("by length:", dict(collections.Counter(sp[3] - sp[2] + 1 for sp in multi)))
# the span store's places
store = {}
for f in sorted(os.listdir(store_dir)):
    if not f.endswith(".json"): continue
    d = json.load(open(os.path.join(store_dir, f), encoding="utf-8"))
    if "placesList" not in d: continue
    b = f[:-5]
    for pl in d["placesList"]:
        store[(b, pl["ref"], pl["first"], pl["last"])] = (pl, d["keys"].get(pl["key"], []))
print("span store places:", len(store))
both = set(multi) & set(store)
print("spans that are a span-store place exactly:", len(both), "· spans not in the span store:", len(set(multi) - set(store)), "· store places no source's span reads:", len(set(store) - set(multi)))
# overlap but not exact
def overlaps(a, b): return a[0] == b[0] and a[1] == b[1] and not (a[3] < b[2] or b[3] < a[2])
idx = collections.defaultdict(list)
for k in store: idx[(k[0], k[1])].append(k)
part = [sp for sp in set(multi) - set(store) if any(overlaps(sp, k) for k in idx.get((sp[0], sp[1]), []))]
print("  of the spans not in the store, overlapping a store place:", len(part))
ex = sorted(set(multi) - set(store))[:12]
for sp in ex: print("   e.g. not in store:", sp, sorted(multi[sp]))
json.dump({"multi": [[*k, sorted(v)] for k, v in sorted(multi.items())]}, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "multi-spans.json"), "w"))
