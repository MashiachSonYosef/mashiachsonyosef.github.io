# Ship 12, patch 3: the kinds record files the 35 returning sources' keys. Davidson's seventeen other printings of
# his review join his family; PanLex's two tables and the translation tables' one key join theirs; the ETCBC's
# glosses, STEP's Expanded Strong tags and Harkavy are new families; and the two new Bible dictionaries rest shut
# until the owner adds them to the twelve. Usage: patch-03-kinds.py <reader>
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
add("davidson", keys["davidson"]); add("panlex", keys["panlex"]); add("english-wiktionary-translation-tables", keys["translation-tables"])
at = [f["id"] for f in rec["families"]].index("davidson") + 1
new = [
 {"id": "etcbc", "family": "The ETCBC's glosses of the Biblia Hebraica Stuttgartensia Amstelodamensis", "kind": "bible", "shape": "bible-dictionary", "shelf": "store",
  "keys": keys["etcbc"],
  "says": "Its own gloss file's name for its dataset, as the corpus lane's relay v207 quotes it on each of its lines: «@datasetName=Biblia Hebraica Stuttgartensia Amstelodamensis». The label «ETCBC Biblia Hebraica Stuttgartensia Amstelodamensis context-free lexeme gloss» is this project's.",
  "where": f"{LIST2}, the why of each line of the source etcbc_bhsa_2021; {RE}, the source M8 (says, own_words).",
  "files": {LIST2: LIST2, RE: RE},
  "own_words": ["@datasetName=Biblia Hebraica Stuttgartensia Amstelodamensis"]},
 {"id": "step-expanded-strong", "family": "STEP's Expanded Strong tags (a column of its TAHOT file)", "kind": "bible", "shape": "bible-dictionary", "shelf": "store",
  "keys": keys["step-expanded-strong"],
  "says": "Its own file's title and its own column, as the corpus lane's relay v207 quotes them on each of its lines: «Translators Amalgamated Hebrew OT tagged with disambiguated Strongs extended for BDB», the column «Expanded Strong tags». The label «STEP Bible TAHOT source-explicit Expanded Strong lexical definition frame» is this project's.",
  "where": f"{LIST2}, the why of each line of the source stepbible_tahot_expanded_strong; {RE}, the source M51 (says, own_words).",
  "files": {LIST2: LIST2, RE: RE},
  "own_words": ["Translators Amalgamated Hebrew OT tagged with disambiguated Strongs extended for BDB", "Expanded Strong tags"]},
 {"id": "harkavy", "family": "Harkavy's dictionary of 1925 (its Hebrew column with its English)", "kind": "other", "shape": "other", "shelf": "store",
  "keys": keys["harkavy"],
  "says": "No title page is quoted in any record read. The corpus lane's relay v207 says what the book prints, a Yiddish word, its English and its Hebrew, and gives each row as a word of the Hebrew column with the English column, as the page image was read. The labels («Harkavy 1925 source-image-reviewed exact Hebrew-English dictionary equivalents») are this project's.",
  "where": f"{LIST3}, the columns of each line (hebrew_column, english_column); {RE}, the twelve sources of the work harkavy.",
  "files": {LIST3: LIST3, RE: RE},
  "own_words": [], "silent": "No title page is quoted in any record read"},
]
rec["families"][at:at] = new[:2]
rec["families"].insert([f["id"] for f in rec["families"]].index("kethoneth-yoseph") + 1, new[2])
rec["rests_off"].append({
 "id": "bible-dictionaries-not-yet-among-the-twelve",
 "say": "from Bible dictionaries not yet added to the twelve",
 "families": ["etcbc", "step-expanded-strong"],
 "ruling": "the owner, 19 November 2026: «ok so 12 it is lets go with that for now», and of adding more, «slowly add». The lead, 21 November 2026: the ETCBC's glosses and STEP's Expanded Strong tags came back to the store that day (the corpus lane's relay v207), each a Bible dictionary by its own title, and neither is one of the twelve; each rests shut on every card and line of the thirty-nine books, a press away, until the owner adds it"})
rec["version"] = "2026-11-21a"
io.open(p, "w", encoding="utf-8", newline="\n").write(lay(rec))
print("kinds:", len(rec["families"]), "families ·", len(rec["rests_off"]), "resting entries · davidson", len(fam["davidson"]["keys"]), "keys · panlex", len(fam["panlex"]["keys"]), "· translation tables", len(fam["english-wiktionary-translation-tables"]["keys"]))
