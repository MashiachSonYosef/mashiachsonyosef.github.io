# The gate's differing first cards, each pill accounted for. A pill of the new card that the old card did not
# print is one of: an old pill with spaces closed (a made space); two or more old pills joined by "; " (a pair the
# ledger divided and now leaves whole); or something else, which is printed. An old pill the new card does not
# print is one of: closed, a part of a joined pill, or something else, which is printed.
# python3 -I gate-cards-ship-a.py <the gate's diff file>
import re, sys
text = open(sys.argv[1], encoding="utf8").read()
cards = re.split(r"^== ", text, flags=re.M)[1:]
nospace = lambda s: s.replace(" ", "")
bare = lambda s: s[1:] if s.startswith("*") else s
T = {"cards": 0, "pills closed": 0, "pills joined into one": 0, "parts joined": 0, "new pills not accounted for": 0, "old pills not accounted for": 0, "the pressed pill moved": 0}
for c in cards:
    head, *rest = c.split("\n")
    old = new = None
    for line in rest:
        if line.startswith("  old: "): old = line[7:].split(" | ")
        if line.startswith("  new: "): new = line[7:].split(" | ")
    T["cards"] += 1
    if old is None or new is None:
        print(f"{head}: not read"); continue
    pressed_old = [bare(x) for x in old if x.startswith("*")]
    pressed_new = [bare(x) for x in new if x.startswith("*")]
    o, n = [bare(x) for x in old], [bare(x) for x in new]
    gone = [x for x in o if x not in n]
    came = [x for x in n if x not in o]
    used = set()
    notes = []
    closed = joined = 0
    for x in came:
        same = [g for g in gone if g not in used and nospace(g) == nospace(x)]
        if same:
            used.add(same[0]); closed += 1; notes.append(f"    closed: «{same[0][:70]}» -> «{x[:70]}»"); continue
        # two or more old pills, in the old card's order, joined by "; "
        parts = [g for g in gone if g not in used and g in x]
        parts.sort(key=lambda g: x.find(g))
        if len(parts) >= 2 and "; ".join(parts) == x:
            for g in parts: used.add(g)
            joined += 1; T["parts joined"] += len(parts)
            notes.append(f"    whole again: {' + '.join('«' + g[:44] + '»' for g in parts)}"); continue
        T["new pills not accounted for"] += 1
        notes.append(f"    NEW, not accounted for: «{x[:160]}»")
    for g in gone:
        if g not in used:
            T["old pills not accounted for"] += 1
            notes.append(f"    OLD, not accounted for: «{g[:160]}»")
    if pressed_old != pressed_new and nospace("".join(pressed_old)) != nospace("".join(pressed_new)):
        T["the pressed pill moved"] += 1
        notes.append(f"    the pressed pill: «{''.join(pressed_old)[:60]}» -> «{''.join(pressed_new)[:60]}»")
    T["pills closed"] += closed; T["pills joined into one"] += joined
    print(f"{head}: {len(old)} pills -> {len(new)} · {closed} closed · {joined} whole again")
    for line in notes: print(line)
print()
for k, v in T.items(): print(f"{v:7}  {k}")
