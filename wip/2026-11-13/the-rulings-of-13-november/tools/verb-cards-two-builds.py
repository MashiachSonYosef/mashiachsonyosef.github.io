# The outside reader's fourteen verb cards of Genesis 1, on two builds, pill by pill, beside the reader's call on
# each pill (R right, S same entry another stem, W another word, B a broken piece, M one pill bundling stems,
# U unsure). The calls are the reader's, made on the page of 12 November; nothing here re-judges them. A pill is
# found in the reader's table by its card (verse and form) and its text, letter case aside; a pill the reader did
# not see (the card has changed since) is counted as not in the review.
# It prints, card by card, the pills the second build no longer prints with the reader's call on each and the
# sources that stood behind it, and at the end: the pills gone by call, and what each build's cards hold by call.
# python3 -I verb-cards-two-builds.py <verb-cards-cross.tsv> <cards dump of the build before .json> <cards dump of the build after .json>
import collections, csv, json, sys

table, before, after = sys.argv[1], sys.argv[2], sys.argv[3]
NAMES = {"R": "right", "S": "the same entry, another stem", "W": "another word", "B": "a broken piece", "M": "one pill bundling stems", "U": "unsure", "-": "not in the review"}
calls = {}
on_the_day = collections.Counter()
for r in csv.DictReader(open(table, encoding="utf8"), delimiter="\t"):
    calls[(r["verse"], r["form"], r["text"].strip().lower())] = r["the reader's call"]
    on_the_day[(r["verse"], r["form"])] += 1


def cards(path):
    out = collections.OrderedDict()
    for c in json.load(open(path, encoding="utf8"))["cards"]:
        out[(c["label"], c["s"])] = c
    return out


A, B = cards(before), cards(after)
gone_by, held_a, held_b, came = collections.Counter(), collections.Counter(), collections.Counter(), 0
for key, a in A.items():
    b = B.get(key)
    if b is None:
        print(f"{key[0]} {key[1]}: not on the second build's dump"); continue
    call = lambda p: calls.get((key[0], key[1], p["text"].strip().lower()), "-")
    ta = collections.OrderedDict((p["text"].strip().lower(), p) for p in a["pills"])
    tb = collections.OrderedDict((p["text"].strip().lower(), p) for p in b["pills"])
    for p in a["pills"]: held_a[call(p)] += 1
    for p in b["pills"]: held_b[call(p)] += 1
    gone = [p for t, p in ta.items() if t not in tb]
    new = [p for t, p in tb.items() if t not in ta]
    came += len(new)
    stems = "+".join(b.get("placeStems") or []) or "not said"
    said = {k: v for k, v in (b.get("data") or {}).items() if "ithheld" in k and v not in ("0", "")}
    print(f"{key[0]} {key[1]} (the place's stem: {stems}) · {on_the_day[key]} pills on the reader's day · {len(a['pills'])} before · {len(b['pills'])} after · the card says {said}")
    for p in gone:
        c = call(p); gone_by[c] += 1
        print(f"    gone  {c}  «{p['text'][:60]}» · behind it: {p.get('by') or '?'}")
    for p in new:
        print(f"    come  {call(p)}  «{p['text'][:60]}» · behind it: {p.get('by') or '?'}")
order = ["R", "S", "W", "B", "M", "U", "-"]
print("")
print(f"pills gone on the second build: {sum(gone_by.values())} · pills come: {came}")
for c in order:
    if gone_by[c]: print(f"   {gone_by[c]:4d}  {c} · {NAMES[c]}")
print("")
print("what the fourteen cards hold, by the reader's call:      before   after")
for c in order:
    if held_a[c] or held_b[c]: print(f"   {c} · {NAMES[c]:34s} {held_a[c]:8d} {held_b[c]:7d}")
print(f"   {'all':38s} {sum(held_a.values()):8d} {sum(held_b.values()):7d}")
