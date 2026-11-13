# One word's record as the zone holds it, and its surface's entry in the lattice sidecar, printed whole.
# python3 -I a-words-record.py <zones dir> <book> <section label> <word number, marks not counted>
import gzip, json, sys
zones, book, label, n = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
zone = json.loads(gzip.open(f"{zones}/{book}.bin").read().decode("utf-8"))
side = json.loads(gzip.open(f"{zones}/{book}.lattice.bin").read().decode("utf-8"))
sec = next(s for s in zone["sections"] if str(s.get("label")) == label)
words = [w for w in sec["words"] if not w.get("mark")]
w = words[n - 1]
print(json.dumps(w, ensure_ascii=False))
g = (side.get("grades") or {}).get(w.get("s"))
print("sidecar grades for the surface:", json.dumps(g, ensure_ascii=False)[:1500])
print("sidecar keys:", sorted(side.keys()))
