#!/usr/bin/env python3
"""Ship 19, patch 01: the entry lists v1.1 (relay v218) land, and with them BDB's own entries (b), for the first time.

Relay v203's list (English Wiktionary) and relay v204's (Classical Hebrew Words and Hebrew Wiktionary) gave their rows
the numbers (n), STEP's letters (t) and BDB's own entries (b) of the Bible dictionaries' entries their own pointed head
form meets. Ship 11 landed n. Ship 15 landed t on English Wiktionary's rows from relay v211's list, which is v203's
with t widened by TBESH's own columns. b was held: on a row that also carries a number it puts BDB's entry into what
the gate gathers at a place, and from there BDB's own rows that carry b and no number are withheld where they name
another entry, so it changes what BDB's rows do at rest. I asked the corpus lane to count that (ask B of 20 November).
Relay v212 counted it on the reading this page reads (a place asks its word's own key, and the gate gathers from every
row of that key) and settled two classes; relay v218 reissues both lists with those answers: «forget» (n.fr.aa) off 27
lines, the 231 lines under the keys that spell the preposition «to» with an ending land as given with l.aa.ab (BDB's own
parting of the joined letter), 102 lines take H4480 and one line H7945. It holds nothing back.

So b lands on every line that gives it (62,284 of 63,453), with the changed n:
  - Classical Hebrew Words and Hebrew Wiktionary: v218's list in place of v204's, landing n and b. v204's entry is kept
    whole under `amends`, and its list stays in its folder.
  - English Wiktionary: v218's list in place of v211's for n and b. v218 reissues v203's lines with t as v203 gave it,
    and the t that ship 15 landed is v211's, so t is still read from v211's list, named under `facts_from`. The two
    name the same 54,261 rows line for line and differ only where each relay says (proved before this ship by
    compare-entry-lists-v1.py; the entries tool and the entry gate's check hold the two to the same rows on every run).
    v203's entry stays under `amends`, as ship 15 left it: both reissues are of its list.
Every file named is the bytes v218's letter names (v211's as ship 15 pinned them). 23 November 2026.

Usage: python3 patch-19-01-entries-pin-lists-v1.1.py <reader dir> <the v218 folder (lists-v1.1)> <the letter of v218 as read>
"""
import hashlib
import json
import shutil
import sys
from pathlib import Path

READER, V218, LETTER = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
pin_path = READER / "data" / "row-entries" / "PIN.json"
pin = json.loads(pin_path.read_text(encoding="utf-8"))


def pinned(path):
    b = path.read_bytes()
    return {"file": path.name, "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}


# the bytes the letter of relay v218 names (its section 9), and the letter itself as read from the store
WANT = {
    "RULE.md": (21714, "8f337d8989c874e2d0d764a0ed83adff5b8fe4a2d5cd80f7aebd08c717c8c0f2"),
    "ANSWER-LISTS-v1.1.md": (17951, "0f0983f2c7804402230b638ab5145aaf0e8a6f6a094646bc9bb5c5650634b7b4"),
    "receipt-v1.1.json": (4848, "2d6daeeacfdae44ca38282e190a216bff37144651eef3b2a22cf44cf944e54d2"),
    "facts-slot-wiktionary-v1.1.tsv": (8925125, "b16c45ce865f2262976dd6edad22d7e3776fdb478ac9fc4a25b81e88bea669d7"),
    "facts-slot-v1.1.tsv": (965213, "c4c0c9d2bc917fc615296dbaed8ecad6d30209519dc53e5bd4cf78fc80f41eed"),
    "changes-v1.1.jsonl": (419996, "c592c888c829b4a27e74f6d8774fbc3834550e82cf3a27e24390f8a66955f9c4"),
}
for name, (size, sha) in WANT.items():
    b = (V218 / name).read_bytes()
    assert len(b) == size and hashlib.sha256(b).hexdigest() == sha, (name, "is not the bytes the letter of v218 names")
letter = LETTER.read_bytes()
assert letter.startswith("READY — FROM MOSES (corpus lane) — v218 —".encode("utf-8")), "the letter given is not relay v218's"

lists = pin["lists"]
wk = [i for i, l in enumerate(lists) if l.get("name") == "English Wiktionary"]
cw = [i for i, l in enumerate(lists) if l.get("name") == "Classical Hebrew Words and Hebrew Wiktionary"]
assert len(wk) == 1 and len(cw) == 1, (wk, cw)
old_w, old_c = lists[wk[0]], lists[cw[0]]
if old_w.get("relay") == "v218" and old_c.get("relay") == "v218":
    print("stands already:", pin_path, "names the entry lists v1.1 (relay v218)")
    sys.exit(0)
assert old_w["relay"] == "v211" and old_w["list"]["sha256"] == "a6e3271cbf7a328ae53d4ce38ea4459662d98c76c334a96f5bc4290684b2344e" and old_w["facts"] == ["n", "t"], "the English Wiktionary entry is not v211's as ship 15 landed it"
assert old_w["amends"]["relay"] == "v203" and old_w["amends"]["list"]["sha256"] == "4cb9e9ce6b30331e04eecbdd35ff945c302ceafa354f4a4b7deeecaef0cbd99e", "v203's entry is not under amends as ship 15 left it"
assert old_c["relay"] == "v204" and old_c["list"]["sha256"] == "5bc044bad2003f468592933fb5cf9c5f0ccbc54a608973ce4b466c351a6f1aeb" and old_c["facts"] == ["n"], "the other list's entry is not v204's as ship 11 landed it"

FOLDER = "entry-ledger-lists-v1.1"
home = READER / "data" / "row-entries" / FOLDER
home.mkdir(exist_ok=True)
for name in ("RULE.md", "receipt-v1.1.json", "ANSWER-LISTS-v1.1.md", "facts-slot-v1.1.tsv"):
    shutil.copyfile(V218 / name, home / name)


def lines_of(path):
    return path.read_bytes().decode("utf-8").count("\n") - 1


STORE = "r2:mishkan/v2/ledgers/all/entry-ledger/lists-v1.1/"
common = {
    "relay": "v218",
    "of": "22 November 2026",
    "letter": "r2:mishkan/v2/letters/moses-entry-ledger-v1/FOR-ELIJAH-v218.md",
    "letter_sha256": hashlib.sha256(letter).hexdigest(),
    "from": f"{STORE} (the private store)",
    "folder": FOLDER,
    "rule": pinned(home / "RULE.md"),
    "receipt": pinned(home / "receipt-v1.1.json"),
    "answer": pinned(home / "ANSWER-LISTS-v1.1.md"),
    "changes": {**pinned(V218 / "changes-v1.1.jsonl"), "lines": (V218 / "changes-v1.1.jsonl").read_bytes().count(b"\n"),
                "what": "each line either list changes from v1, with its ledger row and what the list now sets aside; read by the comparison made before this ship, not by the entries tool",
                "kept": f"{STORE}changes-v1.1.jsonl (the private store); not in this tree"},
}
WHY_B = ("BDB's own entries are the second parting of ruling 6 of 13 November 2026. On a row joined to an entry by its own "
         "pointed head form, b does two things at a place. With a number, it puts BDB's entry into what the gate gathers "
         "from the key's rows for the place's numbers, so BDB's own rows that carry b and no number and name another entry "
         "are withheld there. With no number, the row itself is withheld where the entries gathered hold none of its own. "
         "So b on a joined row changes what BDB's rows do at rest, and ship 11 held it until it was counted (ask B of 20 "
         "November). Relay v212 counted it on the reading this page reads (a place asks its word's own key, and the gate "
         "gathers from every row of that key, before the pointing and the kinds hold any back): 3,927 flips of BDB's own "
         "rows, left to withheld, at 2,215 places. It settled two classes, and relay v218 reissues both lists with them: "
         "«forget» (n.fr.aa) off 27 lines, where it went the wrong way; the 231 lines under the keys that spell the "
         "preposition «to» with an ending land as given with l.aa.ab, BDB's own parting of the joined letter; 102 lines "
         "take H4480 and one line H7945. It holds nothing back, so b lands on every line that gives it (23 November 2026)")
listed_w = pinned(V218 / "facts-slot-wiktionary-v1.1.tsv")
listed_c = pinned(home / "facts-slot-v1.1.tsv")
lines_w, lines_c = lines_of(V218 / "facts-slot-wiktionary-v1.1.tsv"), lines_of(home / "facts-slot-v1.1.tsv")
assert lines_w == old_w["list"]["lines"] == 54261 and lines_c == old_c["list"]["lines"] == 9192, (lines_w, lines_c)

new_w = {
    "name": old_w["name"],
    **common,
    "list": {**listed_w, "lines": lines_w, "kept": f"{STORE}facts-slot-wiktionary-v1.1.tsv (the private store); not in this tree"},
    "read_at_store_version": "88fec6d59737",
    "facts": ["n", "t", "b"],
    "facts_from": {
        "t": {
            "what": ("STEP's letters are read from relay v211's list, line for line beside this one: v218 reissues v203's "
                     "lines with t as v203 gave it, and the t ship 15 landed is v211's, widened by TBESH's own columns. "
                     "The two lists name the same 54,261 rows in the same order (key, rank, m id, sha16, route text); "
                     "v211's differs from v203's only in t and its three added columns, and v218's only in n and b, "
                     "with what_changes and class, on the 126 lines its changes name (proved line by line before this "
                     "ship, 23 November 2026). The entries tool and the entry gate's check refuse the two where a line "
                     "names another row"),
            "relay": old_w["relay"], "of": old_w["of"], "letter": old_w["letter"], "letter_sha256": old_w["letter_sha256"],
            "from": old_w["from"], "folder": old_w["folder"], "rule": old_w["rule"], "receipt": old_w["receipt"],
            "answer": old_w["answer"], "list": old_w["list"], "read_at_store_version": old_w["read_at_store_version"],
            "why_t_lands": old_w["why_t_lands"],
        },
    },
    "why_b_lands": WHY_B,
    "sources": old_w["sources"],
    "held": old_w["held"],
    "amends": old_w["amends"],
}
new_w["amends"] = {**old_w["amends"], "what": "relay v203's list, which v218's reissues line for line (n and b changed at 126 lines) and v211's carries line for line with t widened; its rule, receipt and kinds table stay in their folder"}

new_c = {
    "name": old_c["name"],
    **common,
    "list": {**listed_c, "lines": lines_c, "kept": f"reader/data/row-entries/{FOLDER}/facts-slot-v1.1.tsv (in this tree)"},
    "read_at_store_version": "88fec6d59737",
    "facts": ["n", "b"],
    "why_b_lands": WHY_B,
    "sources": old_c["sources"],
    "held": old_c["held"],
    "amends": {"what": "relay v204's list, which v218's reissues line for line (n and b changed at 4 lines); its rule, receipt, kinds table and list stay in their folder",
               **{k: old_c[k] for k in ("relay", "of", "letter", "from", "folder", "rule", "receipt", "kinds_table", "list", "read_at_store_version")}},
}
lists[wk[0]] = new_w
lists[cw[0]] = new_c
OLD_WHAT = "the ledger itself is 25 MB and the larger list 9 MB"
assert pin["what"].count(OLD_WHAT) == 1, "the pin's own words on the lists kept off this tree are not as ship 15 left them"
pin["what"] = pin["what"].replace(OLD_WHAT, "the ledger itself is 25 MB and English Wiktionary's two lists 9 and 10 MB")
pin_path.write_text(json.dumps(pin, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print("patched", pin_path, "· English Wiktionary: v218's list", listed_w["sha256"][:12], "lands n and b, v211's", old_w["list"]["sha256"][:12], "t ·",
      "Classical Hebrew Words and Hebrew Wiktionary: v218's list", listed_c["sha256"][:12], "lands n and b")
