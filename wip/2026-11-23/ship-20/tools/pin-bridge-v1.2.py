#!/usr/bin/env python3
# Ship 20 (23 November 2026): the spelling bridge's pin takes bridge v1.2 (relay v220) in place of v1.1 as the list the
# tool lays from. v1.2's four files are copied into data/spelling-bridge/bridge-v1.2/, only as the bytes the letter of
# relay v220 names (each figure below is the letter's, held here to the file read); v1.1's and v1's stay pinned as what
# v1.2 extends. The class of places held for STEP's «}+» tag has no reason left: v1.2 gives each such piece the number
# STEP names, and its 42 places fall to the holds of call 4 they stand under (40 places call 4 holds as they rest, STEP's
# words written with « | »; 2 where STEP's own reading stands), recounted by the tool and the check. The pin is changed by
# exact replacements, each old text found once; over a pin that carries them already it says so and writes nothing.
# Usage: pin-bridge-v1.2.py <reader dir> <v220's bridge-v1.2 folder>
import hashlib, os, shutil, sys

R, SRC = sys.argv[1:3]
HOME = os.path.join(R, "data", "spelling-bridge")
PIN = os.path.join(HOME, "PIN.json")
# the letter's figures (FOR-ELIJAH-v220.md, bridge-v1.2/)
FILES = {
    "RULE.md": (13696, "f0ccd566bf9ce9b311ccceed87785e4b0a8e0c6fbbe1b4e10f9036597e0399dd"),
    "receipt-v1.2.json": (105892, "e2c15ed6aa7749d663d132ffb3880054d9ecdca67be2592c4b91e66c2b5eafa3"),
    "bridge-places-v1.2.jsonl": (2234102, "873c4df5ff14bb5ac2cc055d206dc3fdf49adc55405c8ecda53e9564a77d97aa"),
    "changes-v1.2.jsonl": (23385, "e74cd12858bec068c9b9e5f59e01cca691c273e3e3cf716a73559dd6fbd51f59"),
}
os.makedirs(os.path.join(HOME, "bridge-v1.2"), exist_ok=True)
copied = kept = 0
for name, (size, sha) in FILES.items():
    dst = os.path.join(HOME, "bridge-v1.2", name)
    src = dst if os.path.exists(dst) else os.path.join(SRC, name)
    b = open(src, "rb").read()
    if len(b) != size or hashlib.sha256(b).hexdigest() != sha: sys.exit(f"REFUSED · {src} is not the bytes the letter of relay v220 names ({size} bytes, {sha})")
    if src == dst: kept += 1
    else: shutil.copyfile(src, dst); copied += 1
lines = {n: open(os.path.join(HOME, "bridge-v1.2", n), "rb").read().count(b"\n") for n in ("bridge-places-v1.2.jsonl", "changes-v1.2.jsonl")}

def f(name, with_lines=False):
    size, sha = FILES[name]
    return '{"file": "%s", "bytes": %d, "sha256": "%s"%s}' % (name, size, sha, ', "lines": %d' % lines[name] if with_lines else "")

V12 = ''' "v1_2": {
   "relay": "v220",
   "of": "22 November 2026",
   "letter": "r2:mishkan/v2/letters/moses-spelling-bridge-v1/FOR-ELIJAH-v220.md",
   "from": "r2:mishkan/v2/ledgers/all/spelling-bridge/bridge-v1.2/ (the private store)",
   "folder": "bridge-v1.2",
   "extends": "bridge-v1.1",
   "what": "v1.1's lines in v1.1's order, read as STEP's key reads its tag column: «{H…}+» is the word's own tag, in braces, and the same tag also covers the next Hebrew word. v1 took one brace off each end, so 43 pieces at 43 places carried a tag like «H4648G}+» and were not read as the word's own. v1.2 gives each the number STEP names, reads the roles again at 7 places (13 pieces) and the main tags at the 43 (with their glosses, and the store's counts at 2): 147 fields, each named in changes-v1.2.jsonl with v1.1's value and v1.2's. On every piece three fields more, right after its tag: the tag as TAHOT writes it, whether it covers the next Hebrew word, and that word. Read only where each line, its three added fields taken off and its changes set back, is v1.1's line. Ship 20 (23 November 2026) lays from it in place of v1.1: no laid place moves, and the 42 places of new pieces held for the «}+» tag fall to the holds of call 4 they stand under",
   "rule": ''' + f("RULE.md") + ''',
   "receipt": ''' + f("receipt-v1.2.json") + ''',
   "places": ''' + f("bridge-places-v1.2.jsonl", True) + ''',
   "changes": ''' + f("changes-v1.2.jsonl", True) + ''',
   "not_kept": [
    {"file": "ANSWER-v1.2.md", "bytes": 17074, "sha256": "ed33fd35da22c9e03bf1fe226e222438bb21f5cfc9764d806597981eaa8287f3"},
    {"file": "build-bridge-v1.2.mjs", "bytes": 59636, "sha256": "33f85ddc674678e3ae7b24af65ec2e62129e3c6e2997d84e63dbf0e18f3e7f5a"},
    {"file": "verify-bridge-v1.2.mjs", "bytes": 25002, "sha256": "b880edc24404e2ec634b96aee40e659a9706545f21ecf20abd79e2e02e5f1c89"},
    {"file": "verify-receipt-v1.2.json", "bytes": 1753, "sha256": "b5e0f608cbcfd4a211f1f1650c694e2f69b62a6e6c37a121e7bee84b7be85499"},
    {"file": "two-runs-v1.txt", "bytes": 950, "sha256": "895286ef72183a5d94aec08cbd44bd615598fc42d419c446c446a0339dfab1fe"},
    {"file": "verify-r1/recount-r1.mjs", "bytes": 33990, "sha256": "45d2c6b242d7a38dc48fc902c08c5fc2225912ad4b4a59221ff0a0790d2709e8"},
    {"file": "verify-r1/recount-r1.json", "bytes": 49573, "sha256": "d717ba8d3a9984c7c61c171e6049afd21ec68f1a336757a2c0918ff50baa4b1a"},
    {"file": "verify-r1/two-runs-r1.txt", "bytes": 1583, "sha256": "736ff15ac5e85cf7a44a6ceb046685108dba9800dad430e5a5d9b68729b516b4"}
   ],
   "why_not_kept": "as for v1 and v1.1: the lane's folder also holds its answer, its builder, its second count with that count's receipt and two runs, and its checker's recount; no tool reads them, and each is named here by the bytes and sha256 the relay's letter gives. The same relay's count of the same fault in lattice v12 and the zones served (lattice-plus-tags-v1/) finds no served reading wrong and lands nothing"
 },
'''
pairs = [
    # v1.2 beside v1.1
    (''' },
 "held_with_call_4": {''', ''' },
''' + V12 + ''' "held_with_call_4": {'''),
    # the «}+» class has no reason left: its two kinds go, and its places are counted under the holds they stand under
    ('''  {"class": "SAME_LETTERS", "use": "NEW_PIECES", "held": "a_piece_whose_tag_is_not_plain", "places": 40, "why": "a piece's tag is STEP's «{…}+», one tag going on over the next Hebrew word, which v1 cut to «…}+»: the piece is not read as the word's own, and at some places the roles move (relay v214, section 5). Bridge v1.2 (relay v218) mends it, and until then the place is not read around the fault"},
''', ''),
    ('''  {"class": "THROUGH_ONE_LETTER", "use": "NEW_PIECES", "held": "a_piece_whose_tag_is_not_plain", "places": 2, "why": "a piece's tag is STEP's «{…}+», one tag going on over the next Hebrew word, which v1 cut to «…}+»: the piece is not read as the word's own, and at some places the roles move (relay v214, section 5). Bridge v1.2 (relay v218) mends it, and until then the place is not read around the fault"},
''', ''),
    ('''"held": "a_place_call_4_holds", "places": 6, "why": "call 4 of relay v189 writes STEP's words here with « | »,''',
     '''"held": "a_place_call_4_holds", "places": 46, "why": "call 4 of relay v189 writes STEP's words here with « | »,'''),
    ('''so that when the lane answers call 4 the same rule lets them in"},''',
     '''so that when the lane answers call 4 the same rule lets them in. 40 of the 46 were held for STEP's «}+» tag until bridge v1.2 (relay v220, ship 20, 23 November 2026) gave each piece the number STEP names; each is a place call 4 holds too"},'''),
    ('''"held": "a_place_where_steps_reading_stands", "places": 724, "why": "call 4 of relay v189 makes''',
     '''"held": "a_place_where_steps_reading_stands", "places": 726, "why": "call 4 of relay v189 makes'''),
    ('''while its landing lands the action named (held_with_call_4.stands_action)"},''',
     '''while its landing lands the action named (held_with_call_4.stands_action). 2 of the 726 (Numbers 33:35 word 4, Numbers 33:36 word 2) were held for STEP's «}+» tag until bridge v1.2 (relay v220, ship 20, 23 November 2026)"},'''),
    ('''v1.1 (relay v214), v1's lines with each piece's part of STEP's column as STEP writes it, with its rule and its receipt.''',
     '''v1.1 (relay v214), v1's lines with each piece's part of STEP's column as STEP writes it, with its rule and its receipt; and v1.2 (relay v220), v1.1's lines with STEP's «{…}+» tags read as STEP's key says, with its rule, its receipt and its list of changes, the list laid since ship 20 (23 November 2026).'''),
    ('''"note": "every sha256 here is the one the relay's letter names for the file (v202's for bridge-v1, v214's for bridge-v1.1), and the lane's receipts name the lists by the same; v1.1's receipt also names v1's files it was built from, by the same.''',
     '''"note": "every sha256 here is the one the relay's letter names for the file (v202's for bridge-v1, v214's for bridge-v1.1, v220's for bridge-v1.2), and the lane's receipts name the lists by the same; v1.1's receipt also names v1's files it was built from, and v1.2's v1.1's, by the same.'''),
]
text = open(PIN, encoding="utf-8").read()
stands = [o for o, n in pairs if n and text.count(n) == 1]
if len(stands) == len([1 for o, n in pairs if n]) and all(text.count(o) == 0 for o, n in pairs if not n):
    print(f"the spelling bridge's pin: stands already · files {copied} copied, {kept} here already"); sys.exit(0)
for o, n in pairs:
    if text.count(o) != 1 or (n and text.count(n) != 0): sys.exit(f"REFUSED · the spelling bridge's pin does not hold exactly once, and not changed: {o[:90]!r}")
    text = text.replace(o, n)
import json
json.loads(text)
open(PIN, "w", encoding="utf-8").write(text)
print(f"the spelling bridge's pin: written · v1.2 (relay v220) beside v1.1 · files {copied} copied, {kept} here already · not laid: the «}}+» kinds gone, call 4's holds 46, STEP's reading stands 726")
