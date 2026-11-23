#!/usr/bin/env python3
# Ship 20 (23 November 2026): the names gate's pin takes relay v213's list of name rows and relay v219's addition to the
# list of places and its list of the translation tables' name rows. Each file is copied into data/names/ under the
# folder the lane keeps it in, and only as the bytes the relay's letter names (each figure below is the letter's, typed
# from its list of files and held here to the file read). The pin is changed by exact replacements, each old text found
# once; over a pin that carries them already it says so and writes nothing.
# Usage: pin-names-20.py <reader dir> <v213's names-landed-v1 folder> <v219's places-at-bridge-v1 folder>
import hashlib, json, os, shutil, sys

R, V213, V219 = sys.argv[1:4]
HOME = os.path.join(R, "data", "names")
PIN = os.path.join(HOME, "PIN.json")

# the letters' figures: FOR-ELIJAH-v213.md (names-landed-v1/) and FOR-ELIJAH-v219.md (places-at-bridge-v1/)
FILES = {
    "names-landed-v1": (V213, {
        "RULE.md": (10931, "abe6dc8ffea453476b07dd761407f591893791dc82bacccdfe31a0fdf3e8537f"),
        "receipt-v1.json": (51081, "72a97546c5254a7a7b5b63f6eee076998a5665c6f68de6acb0b0ff2613e013d3"),
        "name-rows-landed-v1.jsonl": (4255, "d1a246c3b0de6388b2ddd6c31e8f531087752c3b67c07ea4a6189c9279a9eaaa"),
    }),
    "places-at-bridge-v1": (V219, {
        "RULE.md": (21127, "87fe763095e99470abad0cb938e2c5d0b46b781d459047f7b6991503da6c34aa"),
        "receipt-v1.json": (51666, "93fdb08dafd354e1936dc3fe821e107e445ee7262acc19e19557ccb546714f3c"),
        "places-v1.1-additions.jsonl": (5261, "7a389ecc7330f796f851a8a0798842dbe0de70911255503a0b4b66aa52101583"),
        "name-rows-tables-v1.jsonl": (1367, "aee9144291a1a6669b4628b07ee717e6f865ed641a3a0ce32fa420c8ee628330"),
    }),
}
M51 = (194805, "9b316e994360fc569a29bba169f05f0c9431608307e2b344a2543bd360f02e7d", 832)

def held(path, want):
    b = open(path, "rb").read()
    return len(b) == want[0] and hashlib.sha256(b).hexdigest() == want[1], b

def lines_of(b):
    return b.count(b"\n")

copied = kept = 0
for folder, (src, files) in FILES.items():
    os.makedirs(os.path.join(HOME, folder), exist_ok=True)
    for name, want in files.items():
        dst = os.path.join(HOME, folder, name)
        if os.path.exists(dst):
            ok, _ = held(dst, want)
            if not ok: sys.exit(f"REFUSED · data/names/{folder}/{name} is here and is not the bytes the letter names")
            kept += 1; continue
        ok, _ = held(os.path.join(src, name), want)
        if not ok: sys.exit(f"REFUSED · {os.path.join(src, name)} is not the bytes the letter names ({want[0]} bytes, {want[1]})")
        shutil.copyfile(os.path.join(src, name), dst); copied += 1

def entry(folder, name, with_lines=False):
    size, sha = FILES[folder][1][name]
    e = {"file": name, "bytes": size, "sha256": sha}
    if with_lines: e["lines"] = lines_of(open(os.path.join(HOME, folder, name), "rb").read())
    return e

LETTERS = "r2:mishkan/v2/letters/moses-names-gate-v1/"
additions = {
    "what": "the corpus lane's addition to names v1's list of places (relay v219, section 1). Names v1 read TAHOT on the lines word numbering v1 tied to each place, and at 7 places of the spelling bridge that numbering tied none, so names v1 never read TAHOT there; numbering v1.1 finds the line, and TAHOT's own grammar there marks a name. 1 place is ADDED, Ezekiel 27:6 word 11 («Kittim»), which neither witness named, put in between the two lines of names v1 its `beside` names; at 6 places names v1 lists by MACULA alone, TAHOT is WITNESS_ADDED and the place takes the `by` the addition gives. Laid on names v1's list wherever the list is read (tools/name-lists-v1.mjs); names v1's file is not rewritten. Laid with relay v213's marks, as the lane's call says, so that no row is held back at a place it was landed for (ship 20, 23 November 2026)",
    "relay": "v219",
    "of": "22 November 2026",
    "letter": LETTERS + "FOR-ELIJAH-v219.md",
    "from": "r2:mishkan/v2/ledgers/all/names/places-at-bridge-v1/ (the private store)",
    "folder": "places-at-bridge-v1",
    **entry("places-at-bridge-v1", "places-v1.1-additions.jsonl", True),
    "rule": entry("places-at-bridge-v1", "RULE.md"),
    "receipt": entry("places-at-bridge-v1", "receipt-v1.json"),
}
more = [
    {
        "what": "the rows relays v200, v201 and v202 landed whose every entry its own source marks a name, read by names v2's rule unchanged (relay v213): 22 rows, v200's 18 and v202's 4, every one TAHOT's (M4), a name by TAHOT's own grammar on the line its record names. Laid with names v2's by tools/apply-name-rows-v1.mjs. Held from ship 15 until the place list's question was answered (relay v219), so that the line at Ezekiel 27:6 word 11 moves once: laid with the addition to the places (ship 20, 23 November 2026)",
        "relay": "v213",
        "of": "21 November 2026",
        "letter": LETTERS + "FOR-ELIJAH-v213.md",
        "from": "r2:mishkan/v2/ledgers/all/names/names-landed-v1/ (the private store)",
        "folder": "names-landed-v1",
        "rule": entry("names-landed-v1", "RULE.md"),
        "receipt": entry("names-landed-v1", "receipt-v1.json"),
        "name_rows": entry("names-landed-v1", "name-rows-landed-v1.jsonl", True),
        "join": {"by": ["k", "rank", "m", "sha"], "followed": True, "why": "each line names its row as names v2's lines do, at the rank it was served at in the store the lane's receipt names (inputs.route_store.store_version), and is followed from there through the row-strikes record"},
        "not_kept_here": "the relay's other lists stay on the lane's store (r2:mishkan/v2/ledgers/all/names/names-landed-v1/): the common-word rows (1,446), the other rows (2), the rows with no rule yet (22,259; 8.3 MB), the two empty lists, the answer, the builder and the second count. Nothing on a card reads them, and the receipt kept here names each by its sha256",
    },
    {
        "what": "the translation tables' rows (M78, M103) whose English entry's own part of speech is a name, read by a reader of their own (relay v219, section 5): 6 rows of the 126 table lines relay v210 keeps («Tigris», «Lebanon», «Lord» twice, «Christ», «April»), whose lines ships 16 and 18 landed. Laid with names v2's by tools/apply-name-rows-v1.mjs (ship 20, 23 November 2026)",
        "relay": "v219",
        "of": "22 November 2026",
        "letter": LETTERS + "FOR-ELIJAH-v219.md",
        "from": "r2:mishkan/v2/ledgers/all/names/places-at-bridge-v1/ (the private store)",
        "folder": "places-at-bridge-v1",
        "rule": entry("places-at-bridge-v1", "RULE.md"),
        "receipt": entry("places-at-bridge-v1", "receipt-v1.json"),
        "name_rows": entry("places-at-bridge-v1", "name-rows-tables-v1.jsonl", True),
        "join": {"by": ["k", "m", "sha"], "followed": False, "why": "the letter: «lay `name: 1` on each row they name, joined by `k`, `m` and `sha` (the route's)». The lane read no served store for these lines, so a line names no rank to follow: its row is found by key, m id and sha16 in the store as it stands, exactly one row, or nothing is written"},
        "not_laid": {"file": "name-rows-m51-v1.jsonl", "bytes": M51[0], "sha256": M51[1], "lines": M51[2], "why": "STEP's expanded Strong (M51), 832 rows: their lines are lines of relay v207's Bible dictionaries list, which have not landed and are held for the owner's word (relay v219, section 6). When they land, their rows are laid the same way. Kept on the lane's store and not here"},
        "not_kept_here": "the relay's other files stay on the lane's store (r2:mishkan/v2/ledgers/all/names/places-at-bridge-v1/): the bridge places read (1,173 lines), M51's two lists, the tables' common-word rows (120), the empty lists, the answer, the builder, the second count and the checker's recount. Nothing on a card reads them, and the receipt kept here names each by its sha256",
    },
]

def block(obj, depth):
    pad = " " * depth
    return json.dumps(obj, indent=1, ensure_ascii=False).replace("\n", "\n" + pad)

text = open(PIN, encoding="utf-8").read()
OLD_WHAT = '"what": "the corpus lane\'s two lists for the names gate, each kept here byte for byte in the folder the lane keeps it in.'
NEW_WHAT = '"what": "the corpus lane\'s lists for the names gate, each kept here byte for byte in the folder the lane keeps it in. Since ship 20 (23 November 2026) the rows of relay v213 (the rows relays v200, v201 and v202 landed) and of relay v219 (the translation tables\' rows) are marked beside names v2\'s (more_name_rows), and the list of places is names v1\'s with relay v219\'s addition laid on it (place_names.additions).'
OLD_PLACES_END = '''   "sha256": "ad6f6b8978aacf5b8f6fc09c7ea06d52b4bde4fd5342b90490438bfa74ea0f85"
  }
 },
 "superseded": {'''
NEW_PLACES_END = '''   "sha256": "ad6f6b8978aacf5b8f6fc09c7ea06d52b4bde4fd5342b90490438bfa74ea0f85"
  },
  "additions": ''' + block(additions, 2) + '''
 },
 "superseded": {'''
OLD_NOTE = ''' "note": "every sha256 here is the one the relay's letter names for the file, and the bytes taken hash to it"
}'''
NEW_NOTE = ''' "more_name_rows": ''' + block(more, 1) + ''',
 "note": "every sha256 here is the one the relay's letter names for the file, and the bytes taken hash to it"
}'''
pairs = [(OLD_WHAT, NEW_WHAT), (OLD_PLACES_END, NEW_PLACES_END), (OLD_NOTE, NEW_NOTE)]
if all(text.count(n) == 1 for o, n in pairs):
    print(f"the names pin: stands already · files {copied} copied, {kept} here already"); sys.exit(0)
for o, n in pairs:
    if text.count(o) != 1 or text.count(n) != 0: sys.exit(f"REFUSED · the names pin does not hold exactly once, and not changed: {o[:80]!r}")
    text = text.replace(o, n)
pin = json.loads(text)
if json.dumps(pin, indent=1, ensure_ascii=False) + "\n" != text: sys.exit("REFUSED · the pin as changed is not in the pin's own layout")
open(PIN, "w", encoding="utf-8").write(text)
print(f"the names pin: written · files {copied} copied, {kept} here already · more_name_rows {[(e['relay'], e['name_rows']['lines']) for e in more]} · place_names.additions {additions['lines']} lines")
