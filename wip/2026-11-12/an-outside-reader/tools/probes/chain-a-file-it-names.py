# One small data file a chain file says its cards were read off: the first it names under data/ that is plain JSON
# and not an index. Printed as a path from the reader's folder.
# python3 -I chain-a-file-it-names.py <chain-v1.json.gz>
import gzip, json, sys
d = json.loads(gzip.open(sys.argv[1]).read())
names = sorted(f for f in d["read_off"]["files"] if f.startswith("data/") and f.endswith(".json") and f.count("/") == 1)
assert names, "the file names no plain JSON file under data/"
print(names[0])
