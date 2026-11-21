# Ship 12, patch 4: the ledgers' manifest says why each returning source has no ledger: the corpus lane has declared
# none for it, and each of its rows prints whole, as its landing line gives it. Usage: patch-04-ledgers-excluded.py <reader>
import io, sys, json, os
R = sys.argv[1]; p = os.path.join(R, "data", "ledgers-v1", "manifest.json")
raw = io.open(p, encoding="utf-8").read(); m = json.loads(raw)
assert json.dumps(m, ensure_ascii=False, indent=1) + "\n" == raw
re = json.load(io.open(os.path.join(R, "data", "readmission-v1.json"), encoding="utf-8"))
WHY = ("returned to the store on 21 November 2026 by the corpus lane's relay v207 (data/readmission-v1.json): the lane has declared no ledger of its punctuation, "
       "so each of its rows is one reading as its landing line gives it, whole, until a ledger lands")
ex = dict(m.get("excluded") or {})
for s in re["sources"]:
    k = s["entry"]["key"]
    assert k not in m["ledgers"], k
    ex[k] = WHY
m["excluded"] = dict(sorted(ex.items()))
io.open(p, "w", encoding="utf-8", newline="\n").write(json.dumps(m, ensure_ascii=False, indent=1) + "\n")
print("excluded with why:", len(m["excluded"]), "source keys")
