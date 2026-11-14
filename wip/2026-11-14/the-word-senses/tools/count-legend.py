# How many served Jastrow rows' record cards could carry the owner's legend now: the def field holds exactly one "[",
# the corpus lane lists a WORD_SENSE row with the same key, source and def field, and no row with that key, source and
# def field is on its aside list. python3 -I count-legend.py <reader dir>
import json, gzip, os, sys
from collections import Counter
R = sys.argv[1]
F = os.path.join(R, "data/word-senses/jastrow-word-senses-v1")
rows = [json.loads(l) for l in open(os.path.join(F, "word-senses-v1.jsonl"), encoding="utf-8")]
aside = [json.loads(l) for l in open(os.path.join(F, "cards-with-an-aside-v1.jsonl"), encoding="utf-8")]
sense_defs = {(r["k"], r["m"], r["def"]) for r in rows if r["branch"] == "WORD_SENSE"}
aside_defs = {(a["k"], a["m"], a["def"]) for a in aside}
D = os.path.join(R, "data/overlays/jastrow/shards")
c = Counter(); ex = []
for f in sorted(os.listdir(D)):
    shard = json.loads(gzip.decompress(open(os.path.join(D, f), "rb").read()))
    for k, rs in shard.items():
        for r in rs:
            d = r[2] if len(r) > 2 else ""
            if not isinstance(d, str) or "[" not in d: continue
            c["rows with a bracket"] += 1
            key = (k, r[3], d)
            if key in aside_defs: c["aside card"] += 1; continue
            if d.count("[") != 1: c["more than one bracket"] += 1; continue
            if key in sense_defs:
                c["legend holds"] += 1
                if len(ex) < 4: ex.append((r[1], d[:90]))
            else: c["one bracket, no word sense listed"] += 1
print(dict(c)); [print("  ", e) for e in ex]
