#!/usr/bin/env python3
"""Ship 15, patch 01: English Wiktionary's list lands STEP's letters (t v1.1, relay v211) beside its numbers.

Relay v203's list gave the rows of English Wiktionary the numbers (n), STEP's letters (t) and BDB's entries (b) of the
Bible dictionaries' entries their own pointed head form meets. Ship 11 landed n only: of the lines giving t, 4,380 gave
fewer letters than STEP's own rows carry for the same numbers, so the letters would have held back rows of the same
word («father» without «(Huram)-abi» and «father of»). I asked the corpus lane (ask A of 20 November) whether TBESH
itself says which of its letters are one word. Relay v211 answers from TBESH's own first and third columns, and widens
t so that no line holds back a letter of the same word as a letter v203 gave (1,946 lines gain 2,769 letters). Its
list is v203's 54,261 lines in v203's order and with v203's keys; t in `facts_under_entry_ledger` is t v1.1, and three
columns say what was added and why.

The pin's list entry for English Wiktionary is now v211's list, rule and receipt (read at store 88fec6d59737, at which
v211 says every one of its rows is served at its key, rank, m id and sha16). v203's rule, receipt and kinds table stay
where they are, named under `amends`. The list lands n and t. b waits for relay v218, which reissues v203 and v204 with
the two answers of relay v212.

Usage: python3 patch-01-entries-pin-t-v1.1.py <reader dir> <the v211 folder (tbesh-letters-v1)> <the letter of v211 as read>
"""
import hashlib
import json
import shutil
import sys
from pathlib import Path

READER, V211, LETTER = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
pin_path = READER / "data" / "row-entries" / "PIN.json"
pin = json.loads(pin_path.read_text(encoding="utf-8"))


def pinned(path):
    b = path.read_bytes()
    return {"file": path.name, "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}


WANT = {
    "RULE.md": "12e8d85f51186343e0e730b7f8034be321970f8d5dbbcd214176f36c36429f1d",
    "receipt-v1.json": "eadc3dde6233506c80f444307ed732a5d3b76ebdd204a2e8d49d167072c0728a",
    "ANSWER-A.md": "3097995a1a2e8e437423dff1c7fd303713eb2bdfb8a0dc9427f07318ff12a292",
    "facts-slot-t-v1.1.tsv": "a6e3271cbf7a328ae53d4ce38ea4459662d98c76c334a96f5bc4290684b2344e",
}
for name, sha in WANT.items():
    got = hashlib.sha256((V211 / name).read_bytes()).hexdigest()
    assert got == sha, (name, got, "the letter names", sha)

FOLDER = "entry-ledger-tbesh-letters-v1"
home = READER / "data" / "row-entries" / FOLDER
home.mkdir(exist_ok=True)
for name in ("RULE.md", "receipt-v1.json", "ANSWER-A.md"):
    shutil.copyfile(V211 / name, home / name)

lists = pin["lists"]
at = [i for i, l in enumerate(lists) if l.get("name") == "English Wiktionary"]
assert len(at) == 1, at
old = lists[at[0]]
assert old["relay"] == "v203" and old["list"]["sha256"] == "4cb9e9ce6b30331e04eecbdd35ff945c302ceafa354f4a4b7deeecaef0cbd99e", "the list entry is not v203's as ship 11 landed it"
listed = pinned(V211 / "facts-slot-t-v1.1.tsv")
lines = (V211 / "facts-slot-t-v1.1.tsv").read_bytes().decode("utf-8").count("\n") - 1
assert lines == old["list"]["lines"] == 54261, lines
new = {
    "name": old["name"],
    "relay": "v211",
    "of": "21 November 2026",
    "letter": "r2:mishkan/v2/letters/moses-entry-ledger-v1/FOR-ELIJAH-v211.md",
    "letter_sha256": hashlib.sha256(LETTER.read_bytes()).hexdigest(),
    "from": "r2:mishkan/v2/ledgers/all/entry-ledger/tbesh-letters-v1/ (the private store)",
    "folder": FOLDER,
    "rule": pinned(home / "RULE.md"),
    "receipt": pinned(home / "receipt-v1.json"),
    "answer": pinned(home / "ANSWER-A.md"),
    "list": {**listed, "lines": lines,
             "kept": "r2:mishkan/v2/ledgers/all/entry-ledger/tbesh-letters-v1/facts-slot-t-v1.1.tsv (the private store); not in this tree"},
    "read_at_store_version": "88fec6d59737",
    "facts": ["n", "t"],
    "facts_not_landed": "BDB's own entries (b) wait for relay v218, which reissues relays v203 and v204 with relay v212's two answers («forget» off five lines; the 231 lines under the keys of «to» given their entry); then b lands once",
    "why_t_lands": "STEP's letters are the first parting of ruling 6 of 13 November 2026. On these rows, joined to an entry by their own pointed head form, the letters held back rows of the same word wherever v203 gave fewer letters than STEP's own rows carry (4,380 lines). Relay v211 reads from TBESH's own first and third columns which letters are one word and widens t so that no line holds back a letter of the same word as a letter v203 gave. So the letters now part only another word, as the ruling means them to",
    "sources": old["sources"],
    "held": old["held"],
    "amends": {"what": "relay v203's list, which v211's carries line for line with t widened; its rule, receipt and kinds table stay in their folder",
               **{k: old[k] for k in ("relay", "of", "letter", "from", "folder", "rule", "receipt", "kinds_table", "list", "read_at_store_version")}},
}
lists[at[0]] = new
pin_path.write_text(json.dumps(pin, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print("patched", pin_path, "· the list entry is v211's:", listed["sha256"][:12], lines, "lines, lands n and t")
