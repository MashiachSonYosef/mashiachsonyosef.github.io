# The row entries ledger, one source: the numbers under which the source's served rows name an entry lettered H or
# later and none lettered G, with the letters served under each. Where a source letters one number G, H, I and the
# store serves its H and I and not its G, a gate that asks by letter leaves the source with no row at a G place.
# python3 -I ledger-numbers-missing-their-first-letter.py <the row entries ledger> <m id> [how many to list]
import collections, json, re, sys
ledger, m = sys.argv[1], sys.argv[2]
top = int(sys.argv[3]) if len(sys.argv) > 3 else 20
letters = collections.defaultdict(set)
for line in open(ledger, encoding="utf-8"):
    for r in json.loads(line)["rows"]:
        if r[1] != m: continue
        for e in r[4]:
            x = re.match(r"^[HA]?0*(\d+)([A-Za-z]?)$", str(e[0] if isinstance(e, list) else e))
            if x and int(x.group(1)) < 9000: letters[int(x.group(1))].add(x.group(2))
lettered = {n: s for n, s in letters.items() if any(s)}
late = {n: s for n, s in lettered.items() if any(c >= "H" for c in s if c)}
no_g = {n: s for n, s in late.items() if "G" not in s}
print(f"{m}: {len(letters):,} numbers named by its served rows · {len(lettered):,} with a letter · {len(late):,} with a letter H or later · of those, {len(no_g):,} with no served row lettered G")
print("the first, by number:", " · ".join(f"H{n} ({' '.join(sorted(c for c in s if c))}{', and unlettered' if '' in s else ''})" for n, s in sorted(no_g.items())[:top]))
