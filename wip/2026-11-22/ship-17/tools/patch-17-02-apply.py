# Ship 17, patch 2 (22 November 2026): tools/apply-spelling-bridge-v1.mjs lays the places of bridge v1.1 the pin lays.
# It proves v1.1 against v1 before anything else, as it proves the pins and the receipts, and its record on a zone names
# v1.1's list and the list it extends. The rest is the one reading's (tools/spelling-bridge-v1.mjs).
# Each replacement's old text must occur once; a replacement whose new text stands already is passed.
# Usage: python3 -I patch-17-02-apply.py <reader dir>
import io, sys
p = sys.argv[1] + "/tools/apply-spelling-bridge-v1.mjs"; s = io.open(p, encoding="utf-8").read()
done = []
def swap(old, new):
    global s
    if s.count(new) == 1 and (old not in new or s.count(old) == 1): done.append("stands"); return
    assert s.count(old) == 1, (s.count(old), old[:90])
    s = s.replace(old, new); done.append("applied")

swap("""// IT IS RUN BY THE ROUND, FIRST IN ITS ZONES STEP (tools/round-v1.sh), and
""", """// BRIDGE V1.1 (relay v214; ship 17, 22 November 2026). The list read is v1.1,
// v1's lines with each piece's part as STEP writes it, brackets kept. The pin
// lays, beside the 206 places worded by their form rows, the other places of
// new pieces (THROUGH_ONE_LETTER, SAME_LETTERS), each piece worded by its part
// as written, its ends trimmed; it holds within their class the places whose
// pieces carry STEP's «}+» tag (bridge v1.2 mends them), the places that are
// pairs, and the places call 4 of relay v189 holds as they rest (STEP's words
// written with « | », until the corpus lane says how STEP reads them). Before
// anything is written it proves, as well, that each line of v1.1
// with its added fields taken off is v1's line, and that the marks off each
// laid piece's part give v1's English (tools/spelling-bridge-v1.mjs). Nothing
// laid at the 206 moves: each form row's part is the part as v1.1 writes it.
// At most new places STEP's reading already stands at rest (call 4 of relay
// v189, the default picks' index), and there the line at rest does not move:
// the card says the place's reading above its pills.
//
// IT IS RUN BY THE ROUND, FIRST IN ITS ZONES STEP (tools/round-v1.sh), and
""")

swap("""import {
  SPELLING_BRIDGE_RULE_ID, SPELLING_BRIDGE_HOME, SPELLING_BRIDGE_TOOL, readBridge, receiptAgainst, laidOf, findBridgePlace, carriedAt,
} from "./spelling-bridge-v1.mjs";
""", """import {
  SPELLING_BRIDGE_RULE_ID, SPELLING_BRIDGE_HOME, SPELLING_BRIDGE_TOOL, readBridge, receiptAgainst, v11Against, laidOf, findBridgePlace, carriedAt,
} from "./spelling-bridge-v1.mjs";
""")

swap("""for (const f of receiptAgainst(bridge)) fault(f);
const { laid, counts, faults: listFaults } = laidOf(bridge);
""", """for (const f of receiptAgainst(bridge)) fault(f);
for (const f of v11Against(bridge)) fault(f);
const { laid, counts, faults: listFaults } = laidOf(bridge);
""")

swap("""  relay: bridge.pin.relay,
  letter: bridge.pin.letter,
  list: { file: `${bridge.pin.folder}/${bridge.pin.places.file}`, sha256: bridge.pin.places.sha256, lines: bridge.pin.places.lines },
""", """  relay: bridge.pin.v1_1.relay,
  letter: bridge.pin.v1_1.letter,
  list: { file: `${bridge.pin.v1_1.folder}/${bridge.pin.v1_1.places.file}`, sha256: bridge.pin.v1_1.places.sha256, lines: bridge.pin.v1_1.places.lines },
  extends: { file: `${bridge.pin.folder}/${bridge.pin.places.file}`, sha256: bridge.pin.places.sha256, relay: bridge.pin.relay },
""")

swap("""    why: "the lattice the zone was projected from reads STEP under the Leningrad text's spelling and gives a place our text spells otherwise no pieces; the corpus lane's spelling bridge (relay v202) cuts STEP's pieces onto our letters, and STEP's own row for the place gives their words",
""", """    why: "the lattice the zone was projected from reads STEP under the Leningrad text's spelling and gives a place our text spells otherwise no pieces; the corpus lane's spelling bridge (relays v202 and v214) cuts STEP's pieces onto our letters, and STEP's own words for the place, as STEP writes them, give their words",
""")

swap("""  what: "each of these places is spelled otherwise in our text than in the Leningrad text STEP follows, and STEP's own spelling column names our spelling there. The word carries""", """  what: "each of these places is spelled otherwise in our text than in the Leningrad text STEP follows, and the corpus lane's list cuts STEP's pieces onto our letters there. The word carries""")

io.open(p, "w", encoding="utf-8", newline="\n").write(s)
print(f"{p}: {len(done)} replacements, {done.count('applied')} applied, {done.count('stands')} standing already")
