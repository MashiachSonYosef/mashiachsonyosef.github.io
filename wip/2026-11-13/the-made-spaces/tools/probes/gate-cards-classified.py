# The gate's differing first cards, each classified: is the new list of pills the old list with spaces closed, and
# where two pills then print alike, with the later of them joined to the earlier? Printed per card: how many pills
# stood before and after, how many changed by spaces alone, how many joined another pill, and anything else.
# python3 -I gate-cards-classified.py <the gate's diff file>
import re, sys
text = open(sys.argv[1], encoding="utf8").read()
cards = re.split(r"^== ", text, flags=re.M)[1:]
T = {"cards": 0, "by spaces alone, pill for pill": 0, "by spaces alone, with pills joined": 0, "otherwise": 0, "pills closed": 0, "pills joined": 0}
nospace = lambda s: s.replace(" ", "")
for c in cards:
    head, *rest = c.split("\n")
    old = new = None
    for line in rest:
        if line.startswith("  old: "): old = line[7:].split(" | ")
        if line.startswith("  new: "): new = line[7:].split(" | ")
    T["cards"] += 1
    if old is None or new is None:
        T["otherwise"] += 1; print(f"{head}: not read"); continue
    closed = sum(1 for a, b in zip(old, new) if a != b and nospace(a) == nospace(b)) if len(old) == len(new) else None
    if len(old) == len(new) and all(nospace(a) == nospace(b) for a, b in zip(old, new)):
        T["by spaces alone, pill for pill"] += 1; T["pills closed"] += closed
        print(f"{head}: {len(old)} pills · {closed} closed · the same one pressed: {[x for x in old if x.startswith('*')] and nospace([x for x in old if x.startswith('*')][0]) == nospace([x for x in new if x.startswith('*')][0])}")
        continue
    # pills joined: the old list, spaces taken out, each text kept where it first stands, against the new list
    seen, kept = set(), []
    for a in old:
        k = nospace(a).lstrip("*").lower().rstrip(".")
        if k in seen: continue
        seen.add(k); kept.append(nospace(a))
    if [nospace(b).lstrip("*") for b in new] == [k.lstrip("*") for k in kept]:
        T["by spaces alone, with pills joined"] += 1; T["pills joined"] += len(old) - len(new)
        print(f"{head}: {len(old)} pills -> {len(new)} · {len(old) - len(new)} joined a pill that prints the same once closed")
    else:
        T["otherwise"] += 1
        only_old = [a for a in old if nospace(a).lstrip("*") not in {nospace(b).lstrip("*") for b in new}]
        only_new = [b for b in new if nospace(b).lstrip("*") not in {nospace(a).lstrip("*") for a in old}]
        print(f"{head}: {len(old)} pills -> {len(new)} · OTHERWISE · only before {only_old[:4]} · only after {only_new[:4]}")
for k, v in T.items(): print(f"{v:6d}  {k}")
