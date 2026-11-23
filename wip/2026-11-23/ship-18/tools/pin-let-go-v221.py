# Ship 18 (23 November 2026): the two lines of the own-language list v1.1 that the landings' pin held by their line
# (M78 «necromancy» and «zaatar», ship 16) are let go by the corpus lane's relay v221: both rows are right as English
# Wiktionary's own words, and at the Targum's places where the text's word is another word written alike the lane's
# resting call holds the row at the place (data/held-places/PIN.json), not the line.
#
# What this writes in data/landings/PIN.json, and nothing else:
#   - on each of the two held lines of the list v1.1, `let_go`: the relay, the day, the letter, the list of the pin it
#     lands in, and why in words. The line stays held in the list v1.1 as that list landed (its derived lists and the
#     row-strikes round that took them are history and do not move), and its check still holds it so;
#   - a list after it, `send-back-own-language-v1.1-let-go-v221`, which re-reads the same list (re_reads: its rule,
#     receipt and list are the same entries, the bytes v210's letter names) and is derived again on the store as it
#     stands after the list v1.1 landed: the two lines let go land, every line that landed before is named printed by
#     its own source, and PanLex's lines are held with their source with the same reason as before.
# The lines are found by their source and words (no letter of a key is typed here) and must be exactly the two held
# lines. The derived entries are filled by --derived <figures file> after a dry derivation. Run again over a pin that
# carries all of it, it writes nothing.
# Usage: pin-let-go-v221.py <reader> [--derived <figures.json>]
import io, json, os, sys

R = sys.argv[1]
pin_path = os.path.join(R, "data", "landings", "PIN.json")
raw = io.open(pin_path, encoding="utf-8").read()
pin = json.loads(raw)
lay = lambda p: json.dumps(p, ensure_ascii=False, indent=1) + "\n"
assert lay(pin) == raw, "the pin's layout is not the one this script writes"
SRC = "send-back-own-language-v1.1"
LID = "send-back-own-language-v1.1-let-go-v221"
LETTER = "r2:mishkan/v2/letters/moses-send-back-v1/FOR-ELIJAH-v221.md"
WHY = {
    "necromancy": ("Let go by the corpus lane's relay v221 (22 November 2026): read again at English Wiktionary, Wiktionary's own "
                   "Aramaic entries and Jastrow, the row is right as its source's own word: line 38,968 holds the item as the line "
                   "says (lang «Jewish Babylonian Aramaic», code arc, sense «divination involving the dead»), and Jastrow's third "
                   "word of these letters is «dragging out of the grave by necromancy», cited in the Talmud and never in the "
                   "Targum. Nothing is struck. At the Targum's places the text's word is another word written alike (our "
                   "commentaries read «leader»), and the lane's resting call holds the row at each of them, at rest "
                   "(data/held-places/PIN.json); so the row lands, and stands at no place our commentaries print"),
    "zaatar": ("Let go by the corpus lane's relay v221 (22 November 2026): read again at English Wiktionary, Wiktionary's own "
               "Aramaic entries and Jastrow, the row is right as its source's own word: line 222,759 holds the item as the line "
               "says (lang «Aramaic», code arc, sense «herb»), and Jastrow's entry with the row's own points is «marva, a "
               "medicinal plant». Nothing is struck. At its two places in the Targum, Targum Jonathan on Isaiah 28:20 and on "
               "Nahum 3:14, Jastrow cites the very verse under another word written alike («power, dominion; tyranny»), "
               "and the lane's resting call holds the row at each of them, at rest (data/held-places/PIN.json); so the row "
               "lands, and stands at no place our commentaries print"),
}
LET_GO_SAYS = ("the two lines the list v1.1 held by their line, let go by relay v221: the list re-read on the store as it stands "
               "after the list v1.1 landed, so the two land, every line that landed before is printed by its own source, "
               "and PanLex's lines are held with their source as before")

L = next(l for l in pin["lists"] if l["id"] == SRC)
if "--derived" in sys.argv:
    fig = json.load(io.open(sys.argv[sys.argv.index("--derived") + 1], encoding="utf-8"))
    N = next(l for l in pin["lists"] if l["id"] == LID)
    for slot, f in zip(["landed", "not_landed"], fig["files"]):
        e = N["derived"][slot]
        assert f["file"] == "derived/" + e["file"], (f["file"], e["file"])
        e.update({"bytes": f["bytes"], "sha256": f["sha256"], "lines": f["lines"]})
    out = lay(pin)
    if out != raw:
        io.open(pin_path, "w", encoding="utf-8", newline="\n").write(out)
        print("pinned the derived lists of", LID)
    else:
        print("the pin names these derived lists already")
    sys.exit(0)

held = L.get("held_lines") or []
assert len(held) == 2 and all(h["m"] == "M78" for h in held), "the list v1.1 does not hold the two lines of M78 by their line"
assert sorted(h["route"] for h in held) == sorted(WHY), [h["route"] for h in held]
for h in held:
    want = {"relay": "v221", "of": "22 November 2026", "letter": LETTER, "lands_in": LID, "why": WHY[h["route"]]}
    if h.get("let_go") not in (None, want):
        sys.exit(f"REFUSED -- the held line «{h['route']}» is let go already, otherwise")
    h["let_go"] = want
ids = [l["id"] for l in pin["lists"]]
if LID not in ids:
    assert ids[-1] == SRC, f"the list v1.1 is not the last the pin lands ({ids[-1]})"
    entry = {
        "id": LID,
        "relay": "v221",
        "of": "22 November 2026",
        "what": ("English Wiktionary's translation tables' two rows that the own-language list v1.1 held by their line "
                 "(M78 «necromancy» and «zaatar»), let go by relay v221: right as their source's own words, they land, and "
                 "the lane's resting call keeps each off the Targum's places where the text's word is another word "
                 "written alike (data/held-places/PIN.json)"),
        "letter": LETTER,
        "from": L["from"],
        "re_reads": SRC,
        "re_reads_says": LET_GO_SAYS,
        "folder": L["folder"],
        "rule": L["rule"],
        "receipt": L["receipt"],
        "list": L["list"],
        "a_named_rank_is": L["a_named_rank_is"],
        "held_sources": L["held_sources"],
        "read_at_store_version": L["read_at_store_version"],
        "read_at_store_version_is": L["read_at_store_version_is"],
        "lands_after": SRC,
        "derived": {"folder": "derived",
                    "landed": {"file": f"land-{LID}.jsonl", "bytes": 0, "sha256": "", "lines": 0, "by": "tools/derive-landings-v1.mjs"},
                    "not_landed": {"file": f"not-landed-{LID}.jsonl.gz", "stored": "gzip", "bytes": 0, "sha256": "", "lines": 0, "by": "tools/derive-landings-v1.mjs"}},
        "landed_by": {"tool": "tools/strike-rows-v1.mjs",
                      "reason": ("the corpus lane's relay v221 (22 November 2026): the two lines of the own-language list v1.1 "
                                 "held by their line, let go, right as English Wiktionary's own words; each is held at the "
                                 "Targum's places where the text's word is another word written alike")},
    }
    pin["lists"].append(entry)
pin["what"] = pin["what"] if "re_reads" in pin["what"] else pin["what"] + (
    "; a list may re-read an earlier list of the pin (re_reads, 23 November 2026, relay v221): the same list derived "
    "again on the store after that list landed, so the lines the earlier list held by their line and let go to it land")
out = lay(pin)
if out != raw:
    io.open(pin_path, "w", encoding="utf-8", newline="\n").write(out)
    print(f"the landings' pin: the two held lines of {SRC} let go to {LID}, which re-reads it")
else:
    print("the landings' pin lets the two lines go already: nothing to write")
