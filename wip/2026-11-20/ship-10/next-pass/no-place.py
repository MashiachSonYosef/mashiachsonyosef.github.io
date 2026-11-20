# Ship 10b scoping: the spans the twelve read that the span store has no place for: what the text writes there
# (a stroke or a space between the words) and what STEP's pieces read at each word. python3 -I no-place.py <zones dir>
import sys, json, gzip, os, collections
here = os.path.dirname(os.path.abspath(__file__))
zones = sys.argv[1]
multi = {tuple(x[:4]): x[4] for x in json.load(open(os.path.join(here, "multi-spans.json")))["multi"]}
places = json.load(open(os.path.join(here, "places.json"), encoding="utf-8"))
P = {(p["book"], p["ref"], p["first"], p["last"]) for p in places}
miss = sorted(set(multi) - P)
cache = {}
def words(book, ref):
    if book not in cache:
        z = json.loads(gzip.open(os.path.join(zones, book + ".bin")).read().decode("utf-8"))
        cache[book] = {str(s.get("label")): [w for w in s.get("words", []) if w and not w.get("mark")] for s in z.get("sections", [])}
    return cache[book].get(ref)
MAQAF = chr(0x5be)
joined = collections.Counter(); names = collections.Counter(); out = []
for (book, ref, a, z) in miss:
    ws = words(book, ref)
    if not ws or z > len(ws): joined["?"] += 1; continue
    mine = ws[a - 1:z]
    j = all(MAQAF in (w.get("s") or "")[-3:] or (w.get("presentation_join") or {}).get("join_next_without_separator") for w in mine[:-1])
    joined["stroke" if j else "space"] += 1
    he = " ".join(w.get("s") or "" for w in mine)
    en = " | ".join("/".join(str((p or {}).get("g") or "") for p in (w.get("pg") or [])) for w in mine)
    names[(" ".join(w.get("k") or "" for w in mine), en)] += 1
    out.append([book, ref, a, z, sorted(multi[(book, ref, a, z)]), "stroke" if j else "space", he, en])
print("spans with no place:", len(miss), dict(joined))
print("distinct (letters, STEP's pieces):", len(names))
for (k, en), n in names.most_common(40): print("  ", n, k, "|", en)
json.dump(out, open(os.path.join(here, "no-place.json"), "w"), ensure_ascii=False)
