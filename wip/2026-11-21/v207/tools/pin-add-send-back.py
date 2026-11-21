# Ship 12: the two lists of the corpus lane's relay v207 that land now into data/landings/send-back-v1/ (each kept
# gzipped, weighed as its own bytes), and their entries in data/landings/PIN.json. The relay's third list, the Bible
# dictionaries (Davidson, the ETCBC, STEP's Expanded Strong tags), is held for the owner's word and is not pinned here. The derived entries are filled by --derived <figures
# file> after a dry derivation of that list. Usage: pin-add-send-back.py <reader> <send-back-v1 dir> [--derived id figures.json]
import io, sys, os, json, gzip, hashlib, shutil
R, D = sys.argv[1], sys.argv[2]
HOME = os.path.join(R, "data", "landings"); F = os.path.join(HOME, "send-back-v1")
pin_path = os.path.join(HOME, "PIN.json")
pin = json.load(io.open(pin_path, encoding="utf-8"))
def weigh(path):
    b = open(path, "rb").read(); return {"bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}, b
LISTS = [
  ("send-back-own-language-v1", "landing-own-language-v1.jsonl", "PanLex's rows and English Wiktionary's translation tables' rows whose own language field names Hebrew or Aramaic (4,090 lines: PanLex 3,956, the translation tables 134), each back under its key"),
  ("send-back-harkavy-v1", "landing-harkavy-v1.jsonl", "Harkavy's rows, each a word of his Hebrew column with his English column (376 lines), struck because a cache folder's name held «yiddish»"),
]
if "--derived" in sys.argv:
    i = sys.argv.index("--derived"); lid, fig = sys.argv[i + 1], json.load(io.open(sys.argv[i + 2], encoding="utf-8"))
    L = next(l for l in pin["lists"] if l["id"] == lid)
    for slot, f in zip(["landed", "not_landed"], fig["files"]):
        e = L["derived"][slot]
        assert f["file"] == "derived/" + e["file"], (f["file"], e["file"])
        e.update({"bytes": f["bytes"], "sha256": f["sha256"], "lines": f["lines"]})
    io.open(pin_path, "w", encoding="utf-8", newline="\n").write(json.dumps(pin, ensure_ascii=False, indent=1) + "\n")
    print("pinned the derived lists of", lid); sys.exit(0)
os.makedirs(F, exist_ok=True)
small = {}
for f in ["RULE.md", "receipt-v1.json", "held-v1.jsonl"]:
    shutil.copyfile(os.path.join(D, f), os.path.join(F, f)); small[f], _ = weigh(os.path.join(F, f))
prev = pin["lists"][-1]["id"]
assert prev == "bridge-form-rows-v1", prev
for lid, f, what in LISTS:
    w, b = weigh(os.path.join(D, f))
    with open(os.path.join(F, f + ".gz"), "wb") as out:
        out.write(gzip.compress(b, 9, mtime=0))
    assert gzip.decompress(open(os.path.join(F, f + ".gz"), "rb").read()) == b
    lines = b.count(b"\n")
    short = lid
    pin["lists"].append({
      "id": lid, "relay": "v207", "of": "20 November 2026", "what": what,
      "letter": "r2:mishkan/v2/letters/moses-send-back-v1/FOR-ELIJAH-v207.md",
      "from": "r2:mishkan/v2/ledgers/all/send-back/send-back-v1/ (the private store)",
      "folder": "send-back-v1",
      "rule": {"file": "RULE.md", **small["RULE.md"]},
      "receipt": {"file": "receipt-v1.json", **small["receipt-v1.json"]},
      "list": {"file": f + ".gz", "stored": "gzip", **w, "lines": lines},
      "a_named_rank_is": "the hole the strike left",
      "read_at_store_version": "54416ff5785b", "lands_after": prev,
      "derived": {"folder": "derived",
        "landed": {"file": f"land-{short}.jsonl.gz", "stored": "gzip", "bytes": None, "sha256": None, "lines": None, "by": "tools/derive-landings-v1.mjs"},
        "not_landed": {"file": f"not-landed-{short}.jsonl", "bytes": None, "sha256": None, "lines": None, "by": "tools/derive-landings-v1.mjs"}},
      "landed_by": {"tool": "tools/strike-rows-v1.mjs", "reason": f"the corpus lane's relay v207 (20 November 2026): {what.split(' (')[0]}"},
    })
    prev = lid
    print(lid, w, lines, "lines · kept gzipped:", os.path.getsize(os.path.join(F, f + ".gz")), "bytes")
io.open(pin_path, "w", encoding="utf-8", newline="\n").write(json.dumps(pin, ensure_ascii=False, indent=1) + "\n")
print("pin written:", len(pin["lists"]), "lists")
