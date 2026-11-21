# Ship 12, patch 3: the kinds record files the keys of the sources that return now. PanLex's two tables and the
# translation tables' one key join their families (word lists: shut by kind); Harkavy is a new family, not filed
# under a kind (shut with every dictionary that is not a Bible dictionary). Usage: patch-03-kinds.py <reader>
import io, sys, json, os
R = sys.argv[1]; p = os.path.join(R, "data", "dictionary-kinds-v1.json")
raw = io.open(p, encoding="utf-8").read(); rec = json.loads(raw)
# the record is kept by hand in a layout of its own: a line for each member of a top-level object and for each element
# of a top-level list, compact; it is written back in that layout, proved first on the file as it stands
C = lambda x: json.dumps(x, ensure_ascii=False, separators=(",", ":"))
def lay(rec):
    out = ["{"]
    items = list(rec.items())
    for i, (k, v) in enumerate(items):
        end = "," if i < len(items) - 1 else ""
        if isinstance(v, dict):
            out.append(f" {json.dumps(k)}: {{")
            sub = list(v.items())
            for j, (a, b) in enumerate(sub):
                out.append(f"  {json.dumps(a)}: {C(b) if isinstance(b, (dict, list)) else json.dumps(b, ensure_ascii=False)}" + ("," if j < len(sub) - 1 else ""))
            out.append(" }" + end)
        elif isinstance(v, list):
            out.append(f" {json.dumps(k)}: [")
            for j, b in enumerate(v): out.append("  " + C(b) + ("," if j < len(v) - 1 else ""))
            out.append(" ]" + end)
        else: out.append(f" {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)}" + end)
    out.append("}")
    return "\n".join(out) + "\n"
assert lay(rec) == raw, "the record's layout is not the one this script writes"
re = json.load(io.open(os.path.join(R, "data", "readmission-v1.json"), encoding="utf-8"))
keys = {}
for s in re["sources"]:
    keys.setdefault(s["work"], [])
    if s["entry"]["key"] not in keys[s["work"]]: keys[s["work"]].append(s["entry"]["key"])
fam = {f["id"]: f for f in rec["families"]}
LIST2 = "data/landings/send-back-v1/landing-bible-dictionaries-v1.jsonl.gz"
LIST3 = "data/landings/send-back-v1/landing-harkavy-v1.jsonl.gz"
RE = "data/readmission-v1.json"
def add(fid, ks):
    f = fam[fid]
    for k in sorted(ks):
        assert k not in f["keys"], k
        f["keys"].append(k)
add("panlex", keys["panlex"]); add("english-wiktionary-translation-tables", keys["translation-tables"])
new = [None, None,
 {"id": "harkavy", "family": "Harkavy's dictionary of 1925 (its Hebrew column with its English)", "kind": "other", "shape": "other", "shelf": "store",
  "keys": keys["harkavy"],
  "says": "No title page is quoted in any record read. The corpus lane's relay v207 says what the book prints, a Yiddish word, its English and its Hebrew, and gives each row as a word of the Hebrew column with the English column, as the page image was read. The labels («Harkavy 1925 source-image-reviewed exact Hebrew-English dictionary equivalents») are this project's.",
  "where": f"{LIST3}, the columns of each line (hebrew_column, english_column); {RE}, the twelve sources of the work harkavy.",
  "files": {LIST3: LIST3, RE: RE},
  "own_words": [], "silent": "No title page is quoted in any record read"},
]
rec["families"].insert([f["id"] for f in rec["families"]].index("kethoneth-yoseph") + 1, new[2])
rec["version"] = "2026-11-21a"
io.open(p, "w", encoding="utf-8", newline="\n").write(lay(rec))
print("kinds:", len(rec["families"]), "families ·", len(rec["rests_off"]), "resting entries · panlex", len(fam["panlex"]["keys"]), "keys · translation tables", len(fam["english-wiktionary-translation-tables"]["keys"]), "· harkavy", len(new[2]["keys"]))
