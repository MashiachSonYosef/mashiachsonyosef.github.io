# The row entries ledger's rows whose entries hold a given tag, counted by source, with the keys of the first few.
# python3 -I ledger-rows-with-a-tag.py <the row entries ledger> <tag> [<tag> ...]
import collections, json, sys
ledger, tags = sys.argv[1], sys.argv[2:]
norm = lambda t: "H" + t[1:].lstrip("0") if t.startswith("H") else t
want = {norm(t) for t in tags}
by = {t: collections.Counter() for t in want}
keys = {t: collections.defaultdict(list) for t in want}
for line in open(ledger, encoding="utf-8"):
    l = json.loads(line)
    for r in l["rows"]:
        for e in r[4]:
            tag = norm(e[0] if isinstance(e, list) else e)
            if tag in want:
                by[tag][r[1]] += 1
                if len(keys[tag][r[1]]) < 6: keys[tag][r[1]].append(l["k"])
for t in sorted(want):
    print(t, "·", ", ".join(f"{m}: {n} rows (under {' '.join(keys[t][m])}{' …' if n > 6 else ''})" for m, n in sorted(by[t].items())) or "no row of any source")
