# The row entries ledger, source by source: how many rows name an entry with no letter after its digits, and how many
# with each letter. It shows whether a source's lettered entries are spread over the letters or miss some.
# python3 -I ledger-letters-by-source.py <the row entries ledger> <m id> [<m id> ...]
import collections, json, re, sys
ledger, ms = sys.argv[1], set(sys.argv[2:])
by = {m: collections.Counter() for m in ms}
rows = collections.Counter()
for line in open(ledger, encoding="utf-8"):
    for r in json.loads(line)["rows"]:
        if r[1] not in ms: continue
        rows[r[1]] += 1
        seen = set()
        for e in r[4]:
            tag = e[0] if isinstance(e, list) else e
            x = re.match(r"^[HA]?0*(\d+)([A-Za-z]?)$", str(tag))
            if not x: seen.add("(not a number)"); continue
            if int(x.group(1)) >= 9000: continue   # STEP's prefixes and suffixes
            seen.add(x.group(2) or "(no letter)")
        for s in seen: by[r[1]][s] += 1
for m in sorted(ms):
    print(f"{m}: {rows[m]:,} rows · rows naming an entry " + " · ".join(f"{k}: {n:,}" for k, n in sorted(by[m].items(), key=lambda kv: (len(kv[0]) > 1, kv[0]))))
