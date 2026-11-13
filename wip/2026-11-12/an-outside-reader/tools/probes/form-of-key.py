# The form-of map's entries for the keys named, in full. python3 -I form-of-key.py <reader dir> <key> [key...]
import json, os, sys
d = json.load(open(os.path.join(sys.argv[1], "data/form-of-pills-v1.json"), encoding="utf8"))
for k in sys.argv[2:]:
    print(k)
    for e in d["keys"].get(k, []): print("   ", json.dumps(e, ensure_ascii=False)[:520])
print(json.dumps({x: d[x] for x in d if x not in ("keys", "counts")}, ensure_ascii=False)[:1500])
