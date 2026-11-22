# Ship 16: the own-language list of the corpus lane's relay v210 (send back v1.1, which corrects relay v207) into
# data/landings/send-back-v1.1/ (the list kept gzipped, weighed as its own bytes), and its entry in
# data/landings/PIN.json, after the last list the pin lands now.
#
# The list lands the translation tables' lines (M78, M103) and holds PanLex's (M24, M82) back with their source: the
# source ledger v1.1 admits PanLex's rows row by row too, but landed they print «wolf» at 20 places of the Tikkunei
# Zohar where the text reads «of the father», which waits on the Zohar's prefix split, an open ruling (relay v210,
# section 4). The pin says so in `held_sources`, each source with why; tools/derive-landings-v1.mjs names every line
# of a held source not landed, held with its source, with that reason.
#
# Two lines of the translation tables are held back one by one (`held_lines`, 22 November 2026): ship 16's round on
# the ship tree read every line it moves, and these two would give a Targum word bare on live today a reading its
# places do not bear. Each is found in the list by its own fields (its source, its words, and the line of English
# Wiktionary's file its language field names), so no letter of its key is typed here; the derivation matches it again
# by source, key and words, and it must be exactly one line.
#
# Not pinned: Harkavy's list (withdrawn whole by v210, refused by the owner) and the Bible dictionaries' list (it
# waits for the owner's word). Every file pinned here is the bytes the letter of v210 names, proved before anything
# is written. The derived entries are filled by --derived <figures file> after a dry derivation of the list; both
# derived lists are kept gzipped (the lines held with their source are 3,944, each with its reason).
# Usage: pin-add-send-back-v1.1.py <reader> <send-back-v1.1 dir> [--derived <list id> <figures.json>]
import io, sys, os, json, gzip, hashlib, shutil
R, D = sys.argv[1], sys.argv[2]
HOME = os.path.join(R, "data", "landings"); FOLDER = "send-back-v1.1"; F = os.path.join(HOME, FOLDER)
pin_path = os.path.join(HOME, "PIN.json")
raw = io.open(pin_path, encoding="utf-8").read(); pin = json.loads(raw)
lay = lambda p: json.dumps(p, ensure_ascii=False, indent=1) + "\n"
assert lay(pin) == raw, "the pin's layout is not the one this script writes"
LID = "send-back-own-language-v1.1"
# the bytes the letter of relay v210 names (FOR-ELIJAH-v210.md, section 8)
LETTER = {
  "RULE.md": (16625, "bc6a03402bbbd680acebd7d8652c549e8a0138c76bdc99add5d1ea067ccfc6b5"),
  "receipt-v1.1.json": (50802, "e031f0b3d5c765508b5bb4dd8a417bc0bfba258d2b49eadd6077e980245beb6b"),
  "landing-own-language-v1.1.jsonl": (7448002, "fbdb06ede7e90254d505a2ef619614d6ea5f31866973f488f00985e198fca878"),
}
HELD_WHY = ("PanLex is held with its source: the source ledger v1.1 admits these rows row by row, by PanLex's own "
            "language field, but landed they print «wolf» at 20 places of the Tikkunei Zohar where the text reads "
            "«of the father», which waits on the Zohar's prefix split, an open ruling (relay v210, section 4; "
            "ship 12's trial of 21 November 2026). Every line of PanLex's waits with it, and none lands")
def weigh(path):
    b = open(path, "rb").read(); return {"bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}, b
if "--derived" in sys.argv:
    i = sys.argv.index("--derived"); lid, fig = sys.argv[i + 1], json.load(io.open(sys.argv[i + 2], encoding="utf-8"))
    L = next(l for l in pin["lists"] if l["id"] == lid)
    for slot, f in zip(["landed", "not_landed"], fig["files"]):
        e = L["derived"][slot]
        assert f["file"] == "derived/" + e["file"], (f["file"], e["file"])
        e.update({"bytes": f["bytes"], "sha256": f["sha256"], "lines": f["lines"]})
    io.open(pin_path, "w", encoding="utf-8", newline="\n").write(lay(pin))
    print("pinned the derived lists of", lid); sys.exit(0)
for f, (n, sha) in LETTER.items():
    w, _ = weigh(os.path.join(D, f))
    assert (w["bytes"], w["sha256"]) == (n, sha), (f, w, "the letter names", n, sha)
ids = [l["id"] for l in pin["lists"]]
assert LID not in ids, "the pin names the list already"
prev = ids[-1]
assert prev == "bridge-form-rows-v1", prev
os.makedirs(F, exist_ok=True)
small = {}
for f in ["RULE.md", "receipt-v1.1.json"]:
    shutil.copyfile(os.path.join(D, f), os.path.join(F, f)); small[f], _ = weigh(os.path.join(F, f))
    assert (small[f]["bytes"], small[f]["sha256"]) == LETTER[f]
f = "landing-own-language-v1.1.jsonl"
w, b = weigh(os.path.join(D, f))
with open(os.path.join(F, f + ".gz"), "wb") as out:
    out.write(gzip.compress(b, 9, mtime=0))
assert gzip.decompress(open(os.path.join(F, f + ".gz"), "rb").read()) == b
lines = b.count(b"\n")
by_m = {}
parsed = [json.loads(line) for line in b.decode("utf-8").splitlines()]
for e in parsed: by_m[e["m"]] = by_m.get(e["m"], 0) + 1
assert by_m == {"M24": 3329, "M82": 615, "M78": 114, "M103": 12}, by_m
# the lines held back one by one: (source, words, the line of English Wiktionary's file the line's language field names, why)
ASKED = "the corpus lane is asked (22 November 2026) whether the row stands, and it lands, or not, on its answer"
HOLD_LINES = [
  ("M78", "necromancy", 38968,
   "Held by its line: English Wiktionary's item (lang \u00abJewish Babylonian Aramaic\u00bb, code arc, line 38968 of its file) gives this "
   "word as \u00abnecromancy\u00bb, but at all four places our commentaries print it the Targum's word means \u00ableader\u00bb: Targum "
   "Jonathan on Judges 2:18 (\u00aball the days of the leader\u00bb) and 2:19 (\u00abwhen the leader died\u00bb), and the Aramaic Targum "
   "to Ruth 1:6 and 4:21 (\u00abIbzan the leader\u00bb). Each place is bare on the live site today, and landed this row would be its "
   "line; " + ASKED),
  ("M78", "zaatar", 222759,
   "Held by its line: English Wiktionary's item (lang \u00abAramaic\u00bb, code arc, line 222759 of its file) gives this word as "
   "\u00abzaatar\u00bb, the herb, but at its two places in our commentaries it is plenty or water: Targum Jonathan on Isaiah 28:20 "
   "(\u00abthe rule of the Babylonians who oppress shall increase\u00bb) and on Nahum 3:14 (\u00abstrengthen your cities, increase\u00bb). "
   "Each place is bare on the live site today, and landed this row would be its line; " + ASKED),
]
held_lines = []
for m, route, kline, why in HOLD_LINES:
    hits = [e for e in parsed if e["m"] == m and e["route"] == route and (e.get("language") or {}).get("line") == kline]
    assert len(hits) == 1, (m, route, kline, len(hits))
    key = hits[0]["key"]
    assert sum(1 for e in parsed if e["m"] == m and e["key"] == key and e["route"] == route) == 1, (m, route)
    held_lines.append({"m": m, "key": key, "route": route, "why": why})
    print("held by its line:", m, " ".join("U+%04X" % ord(c) for c in key), route, "· list line", parsed.index(hits[0]) + 1)
what = ("English Wiktionary's translation tables' rows whose own language field the source ledger v1.1 admits "
        "(126 lines: M78 114, M103 12), each back under its key, but for two of M78's held by their line; PanLex's lines of "
        "the same list (3,944: M24 3,329, M82 615) are held with their source")
pin["lists"].append({
  "id": LID, "relay": "v210", "of": "21 November 2026", "what": what,
  "letter": "r2:mishkan/v2/letters/moses-send-back-v1/FOR-ELIJAH-v210.md",
  "from": "r2:mishkan/v2/ledgers/all/send-back/send-back-v1.1/ (the private store)",
  "folder": FOLDER,
  "rule": {"file": "RULE.md", **small["RULE.md"]},
  "receipt": {"file": "receipt-v1.1.json", **small["receipt-v1.1.json"]},
  "list": {"file": f + ".gz", "stored": "gzip", **w, "lines": lines},
  "a_named_rank_is": "the hole the strike left",
  "held_sources": {"M24": HELD_WHY, "M82": HELD_WHY},
  "held_lines": held_lines,
  "read_at_store_version": "54416ff5785b",
  "read_at_store_version_is": "send back v1's (its receipt names it): v1.1 keeps each line it keeps byte for byte, in v1's order",
  "lands_after": prev,
  "derived": {"folder": "derived",
    "landed": {"file": "land-" + LID + ".jsonl.gz", "stored": "gzip", "bytes": None, "sha256": None, "lines": None, "by": "tools/derive-landings-v1.mjs"},
    "not_landed": {"file": "not-landed-" + LID + ".jsonl.gz", "stored": "gzip", "bytes": None, "sha256": None, "lines": None, "by": "tools/derive-landings-v1.mjs"}},
  "landed_by": {"tool": "tools/strike-rows-v1.mjs", "reason": "the corpus lane's relay v210 (21 November 2026): English Wiktionary's translation tables' rows whose own language field the source ledger v1.1 admits"},
})
io.open(pin_path, "w", encoding="utf-8", newline="\n").write(lay(pin))
print(LID, w, lines, "lines", by_m, "· kept gzipped:", os.path.getsize(os.path.join(F, f + ".gz")), "bytes · pin written:", len(pin["lists"]), "lists")
