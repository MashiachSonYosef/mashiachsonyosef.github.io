# What every pointer pill printed under the map the page serves today, and what it prints under the map baked from
# the corpus lane's reissue with the owner's rulings applied. A pill with a resolution prints
# "<the English> (<the relation> <the target as the source wrote it>)"; one without prints its own text. Each line of
# the lane's file is one reading of one key and source, with the number of places it stands at.
# Said: how many readings keep their English, take another, lose it (and why), gain one, or never had one, by class,
# with the places they stand at; the readings of the most places in each kind; and the readings of one key and
# source that print one text. It reads; it changes nothing.
# python3 -I pointer-pills-before-and-after.py <old form-of-pills json> <new form-of-pills json> <zone-pills-v1.3.jsonl> [how many to list]
import json, sys
from collections import Counter, defaultdict

old = json.load(open(sys.argv[1], encoding="utf-8"))
new = json.load(open(sys.argv[2], encoding="utf-8"))
lines = [json.loads(s) for s in open(sys.argv[3], encoding="utf-8").read().split("\n") if s.strip()]
many = int(sys.argv[4]) if len(sys.argv) > 4 else 8


def target(e):
    if not e.get("at"):
        return e["target"]
    b = e["t"].encode("utf-8")
    return b[e["at"][0]:e["at"][1]].decode("utf-8") or e["target"]


def says(m, key, text):
    for e in (m["keys"].get(key) or []):
        if e["m"] == text[0] and e["t"] == text[1]:
            if e.get("resolved"):
                return "%s (%s %s)" % (e["resolved"]["text"], e["relation"], target(e)), e
            return None, e
    return None, None


kinds = Counter()
places = Counter()
top = defaultdict(list)
alike_old = defaultdict(list)
alike_new = defaultdict(list)
for l in lines:
    if l["class"] not in ("FORM_OF", "MIXED"):
        continue
    a, ea = says(old, l["key"], (l["m_id"], l["text"]))
    b, eb = says(new, l["key"], (l["m_id"], l["text"]))
    fo = l["form_of"]
    if a and b:
        kind = "keeps its English" if a == b else "prints another English now"
    elif a and not b:
        why = "ruling 5: its own words" if l["class"] == "MIXED" else str(fo.get("resolved_why"))
        if l["class"] != "MIXED" and fo.get("several_branch"):
            why += " (first of several not served)"
        kind = "printed an English, prints its own text now · " + why
    elif b and not a:
        kind = "printed its own text, prints an English now"
    else:
        kind = "its own text before and now"
    kind = l["class"] + " · " + kind
    kinds[kind] += 1
    places[kind] += l.get("places") or 0
    top[kind].append((l.get("places") or 0, l["key"], l["m_id"], l["text"], a, b))
    alike_old[(l["key"], l["m_id"], a or l["text"])].append(l["text"])
    alike_new[(l["key"], l["m_id"], b or l["text"])].append(l["text"])

print("readings: %d" % sum(kinds.values()))
for k, c in sorted(kinds.items(), key=lambda x: -x[1]):
    print("%6d readings at %7d places  %s" % (c, places[k], k))
print()
for k, c in sorted(kinds.items(), key=lambda x: -x[1]):
    if "keeps its English" in k or "its own text before and now" in k:
        continue
    print("=====", k)
    for pl, key, m, text, a, b in sorted(top[k], key=lambda x: -x[0])[:many]:
        print("   %5d places · %s %s «%s»" % (pl, key, m, text[:70]))
        print("                 before: %s" % ((a or "(its own text)")[:110]))
        print("                 now:    %s" % ((b or "(its own text)")[:110]))
for name, d in (("before", alike_old), ("now", alike_new)):
    groups = [(k, v) for k, v in d.items() if len(v) > 1]
    print("readings of one key and source that print one text, %s: %d groups, %d readings" % (name, len(groups), sum(len(v) for _, v in groups)))
