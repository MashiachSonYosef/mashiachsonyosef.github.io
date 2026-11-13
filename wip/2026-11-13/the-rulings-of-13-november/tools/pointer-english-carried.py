# The pure pointers (FORM_OF) whose entry's English the store does not serve, by the places they stand at: the
# pointer's own text, the English the corpus lane carries for the entry (not_served.english, or the first of several
# entries' english), and what the pill printed under the old map. So the owner's question (print the carried English
# or not) can be read on real cards. It reads; it changes nothing.
# python3 -I pointer-english-carried.py <old form-of-pills json> <zone-pills-v1.3.jsonl> [how many]
import json, sys

old = json.load(open(sys.argv[1], encoding="utf-8"))
lines = [json.loads(s) for s in open(sys.argv[2], encoding="utf-8").read().split("\n") if s.strip()]
many = int(sys.argv[3]) if len(sys.argv) > 3 else 30
rows = []
for l in lines:
    if l["class"] != "FORM_OF":
        continue
    fo = l["form_of"]
    if fo.get("resolved"):
        continue
    eng, road = None, None
    if fo.get("not_served") and fo["not_served"].get("english"):
        eng, road = fo["not_served"]["english"], "names its entry"
    else:
        first = (fo.get("several_branch") or {}).get("first_in_the_sources_order") or {}
        if first.get("resolved"):
            continue
        if first.get("english"):
            eng, road = first["english"], "first of %s" % fo.get("several")
    if not eng:
        continue
    before = None
    for e in old["keys"].get(l["key"]) or []:
        if e["m"] == l["m_id"] and e["t"] == l["text"] and e.get("resolved"):
            before = e["resolved"]["text"]
    rows.append((l.get("places") or 0, l["key"], l["m_id"], l["text"], road, eng, before))
rows.sort(key=lambda x: -x[0])
print(len(rows), "pure pointers carry an English the store does not serve;", sum(r[0] for r in rows), "places")
print("by road:", {k: sum(1 for r in rows if r[4].startswith(k)) for k in ("names its entry", "first of")})
for pl, key, m, text, road, eng, before in rows[:many]:
    print("%5d places · %s %s «%s» · %s" % (pl, key, m, text[:64], road))
    print("        the entry's English: «%s»   printed before: %s" % (eng[:70], ("«%s»" % before[:60]) if before else "(its own text)"))
