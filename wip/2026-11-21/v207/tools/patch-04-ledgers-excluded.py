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
# two of the returning sources have a ledger already, declared when their rows of the span store were (relays v160 and
# v159): a ledger is its source's, so their returning rows stand under it and are not excluded
UNDER = {"etcbc_bhsa_2021": "M8", "stepbible_tahot_expanded_strong": "M51"}
for s in re["sources"]:
    k = s["entry"]["key"]
    if k in m["ledgers"]: assert UNDER.get(k) == s["m"], k
    else: ex[k] = WHY
m["where_two_print_steps_meet"] = {"stepbible_tahot_expanded_strong": {"prints": "as written",
  "why": "two of its rows that returned on 21 November 2026 (M51) carry both the optional word of branch B02 and the King James form of branch B03, «(Mount )Sirion (KJV: Sion)» and «(Mount )Shepher (KJV: mount Shapher)». The declaration (relay v159) was read on rows that carry one or the other and names no step for the two together, so each such row is one reading as written, the resting option of both branches, until the lane says how the two steps compose"}}
m["excluded"] = dict(sorted(ex.items()))
io.open(p, "w", encoding="utf-8", newline="\n").write(json.dumps(m, ensure_ascii=False, indent=1) + "\n")
print("excluded with why:", len(m["excluded"]), "source keys")
