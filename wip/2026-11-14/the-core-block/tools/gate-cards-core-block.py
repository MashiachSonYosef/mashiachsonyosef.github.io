# The gate's differing cards, each accounted for by core-block-rule-v1 or not: a card is moved by the rule alone
# where the old card was one pill, pressed, the source's set (pieces joined by " + "), and the new card stands on a
# block with the line's own piece for it pressed (or, where the block offers none of the line's pieces, its first
# pill), the set nowhere among its pills. Lines are counted apart. It
# reads the gate's diff file; it changes nothing. python3 -I gate-cards-core-block.py <gate diff file>
import collections, sys
T = collections.Counter(); other = []
cards = []
cur = None
for raw in open(sys.argv[1], encoding="utf-8"):
    line = raw.rstrip("\n")
    if line.startswith("== "): cur = {"at": line[3:]}; cards.append(cur); continue
    if line.startswith("line: "): T["lines that differ"] += 1; cur = None; continue
    if cur is not None and line.startswith("  old: "): cur["old"] = [x for x in line[7:].split(" | ") if x]
    if cur is not None and line.startswith("  new: "): cur["new"] = [x for x in line[7:].split(" | ") if x]
for c in cards:
    T["cards that differ"] += 1
    old, new = c.get("old", []), c.get("new", [])
    pressed = [x[1:] for x in new if x.startswith("*")]
    if len(old) == 1 and old[0].startswith("*") and " + " in old[0]:
        pieces = [p.strip().lower() for p in old[0][1:].split(" + ")]
        news = [x.lstrip("*") for x in new]
        if old[0][1:] not in news and len(pressed) == 1 and pressed[0].strip().lower() in pieces and len(new) >= 1:
            T["  moved by the core-block rule alone (one pill, the set, became the core block's readings)"] += 1
            T["    the line's own piece pressed"] += 1
            continue
        offered = [x for x in news if x.strip().lower() in pieces]
        if old[0][1:] not in news and len(pressed) == 1 and not offered and new and new[0].startswith("*"):
            T["  moved by the core-block rule alone (one pill, the set, became the core block's readings)"] += 1
            T["    the block offers none of the line's pieces, so its first pill is pressed"] += 1
            continue
    T["  moved otherwise"] += 1
    if len(other) < 10: other.append(f"{c['at']}: {' | '.join(old)[:90]} -> {' | '.join(new)[:90]}")
for k, v in T.items(): print(f"{v:>8,}  {k}")
for o in other: print("   otherwise:", o)
