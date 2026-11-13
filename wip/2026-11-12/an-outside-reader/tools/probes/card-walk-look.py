import json, sys
d = json.load(open(sys.argv[1], encoding="utf8"))
n = int(sys.argv[2]) if len(sys.argv) > 2 else 8
shown = 0
for s in d["sections"]:
    for c in s["cards"]:
        if shown >= n: break
        shown += 1
        print(f'{s["label"]}:{c["n"]} run={c.get("run")} pair={c.get("pair")} ms={c.get("ms")} label={c.get("label")!r}')
        print("   cuts", [(t, p) for t, p in c["cuts"]], "cells", [(t, p) for t, p in c["cells"]], "chain", len(c["chain"]), "chainCell", len(c["chainCell"]), "q", len(c["q"]))
        for p in c["pieces"]: print("   piece", p)
        for p in c["pills"][:4]: print("   pill", p)
        print("   …", len(c["pills"]), "pills; notes", c["notes"], "data", {k: v for k, v in c["data"].items() if v not in ("0", "")})
        if c.get("rungs"): print("   rungs", c["rungs"])
