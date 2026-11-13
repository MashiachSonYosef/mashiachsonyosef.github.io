# Two links of one list of pills swapped by hand in a chain file: the seventh and the eighth, past the six the
# book's page prints, in a list that cards print in the one state named and no card prints in the other. The file
# stays whole: every fingerprint it prints is still carried, its counts are the same, its page is the same.
# python3 -I chain-swap-two-links.py <chain-v1.json.gz> <rest|lifted>
import gzip, json, sys
p, state = sys.argv[1], sys.argv[2]
other = "lifted" if state == "rest" else "rest"
d = json.loads(gzip.open(p).read())
used = {"rest": {}, "lifted": {}}
for s in d["sections"]:
    n = 0
    for c in s["cells"]:
        if "mark" in c: continue
        n += 1
        for st in ("rest", "lifted"):
            if c[st]["pool"] is not None: used[st].setdefault(c[st]["pool"], []).append(f'{s["label"]}:{n}')
pick = next((i for i in sorted(used[state]) if i not in used[other] and len(d["pools"][i]) >= 8 and d["pools"][i][6] != d["pools"][i][7]), None)
assert pick is not None, "no list of eight pills or more stands in that state alone"
pool = d["pools"][pick]
pool[6], pool[7] = pool[7], pool[6]
assert len({json.dumps(x) for x in d["pools"]}) == len(d["pools"]), "the swap made one list the same as another"
open(p, "wb").write(gzip.compress(json.dumps(d, ensure_ascii=False, separators=(",", ":")).encode("utf8"), 9, mtime=0))
print(f'list {pick}, printed {"at rest" if state == "rest" else "lifted"} by the card of {", ".join(used[state][pick][:3])}: its seventh and eighth links changed places')
