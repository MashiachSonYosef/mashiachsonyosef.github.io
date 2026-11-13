# The row entries ledger's rows under given keys, for the sources asked: rank, hash, entries, numbers.
# python3 -I ledger-rows-of-a-key.py <the row entries ledger> <m ids, comma separated> <key> [<key> ...]
import json, sys
ledger, ms, keys = sys.argv[1], set(sys.argv[2].split(",")), set(sys.argv[3:])
for line in open(ledger, encoding="utf-8"):
    l = json.loads(line)
    if l["k"] not in keys: continue
    print(l["k"], "·", len(l["rows"]), "rows in the ledger")
    for r in l["rows"]:
        if r[1] in ms: print("   ", r[1], "rank", r[0], r[2], "entries", json.dumps(r[4], ensure_ascii=False)[:260], "numbers", r[5])
