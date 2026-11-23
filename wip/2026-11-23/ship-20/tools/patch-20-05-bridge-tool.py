#!/usr/bin/env python3
# Ship 20 (23 November 2026): the spelling bridge's tool proves v1.2 against v1.1 and records v1.2 as the list laid
# A patch of exact replacements on tools/apply-spelling-bridge-v1.mjs: each old text occurs once and its new text not at all, and is replaced; a
# replacement whose new text stands once and whose old text is gone is said and passed, so over a file that carries the
# patch it writes nothing. Anything else is refused and nothing is written.
# Usage: python3 -I <this> <reader dir>
import os, sys
P = os.path.join(sys.argv[1], 'tools/apply-spelling-bridge-v1.mjs')
PAIRS = [
    ("// drawn.\n//\n// IT IS RUN BY THE ROUND, FIRST IN ITS ZONES STEP (tools/round-v1.sh), and\n// whenever the place's pieces are laid again. First, because two tools of\n",
     "// drawn.\n//\n// BRIDGE V1.2 (relay v220; ship 20, 23 November 2026). The list laid from is\n// v1.2, v1.1's lines with STEP's «{…}+» tags read as STEP's key says, and it is\n// proved first, as well, that each of its lines, its three added fields taken\n// off and the changes its list of changes names set back, is v1.1's line. No\n// laid place is among the 43 it mends, so no piece laid moves; each zone's\n// record names v1.2's list and the list it extends (v1.1), and is written again\n// where it named v1.1's.\n//\n// IT IS RUN BY THE ROUND, FIRST IN ITS ZONES STEP (tools/round-v1.sh), and\n// whenever the place's pieces are laid again. First, because two tools of\n"),
    ('import { typePostBuildWrite, writeZone } from "./zone-post-build-v1.mjs";\nimport {\n  SPELLING_BRIDGE_RULE_ID, SPELLING_BRIDGE_HOME, SPELLING_BRIDGE_TOOL, readBridge, receiptAgainst, v11Against, laidOf, findBridgePlace, carriedAt,\n} from "./spelling-bridge-v1.mjs";\n\n',
     'import { typePostBuildWrite, writeZone } from "./zone-post-build-v1.mjs";\nimport {\n  SPELLING_BRIDGE_RULE_ID, SPELLING_BRIDGE_HOME, SPELLING_BRIDGE_TOOL, readBridge, receiptAgainst, v11Against, v12Against, laidOf, findBridgePlace, carriedAt,\n} from "./spelling-bridge-v1.mjs";\n\n'),
    ('for (const f of receiptAgainst(bridge)) fault(f);\nfor (const f of v11Against(bridge)) fault(f);\nconst { laid, counts, faults: listFaults } = laidOf(bridge);\nfor (const f of listFaults) fault(f);\n',
     'for (const f of receiptAgainst(bridge)) fault(f);\nfor (const f of v11Against(bridge)) fault(f);\nfor (const f of v12Against(bridge)) fault(f);\nconst { laid, counts, faults: listFaults } = laidOf(bridge);\nfor (const f of listFaults) fault(f);\n'),
    ('  applied_by: SPELLING_BRIDGE_TOOL,\n  pin: `${SPELLING_BRIDGE_HOME}/PIN.json`,\n  relay: bridge.pin.v1_1.relay,\n  letter: bridge.pin.v1_1.letter,\n  list: { file: `${bridge.pin.v1_1.folder}/${bridge.pin.v1_1.places.file}`, sha256: bridge.pin.v1_1.places.sha256, lines: bridge.pin.v1_1.places.lines },\n  extends: { file: `${bridge.pin.folder}/${bridge.pin.places.file}`, sha256: bridge.pin.places.sha256, relay: bridge.pin.relay },\n  counts: { places_laid: here.length, pieces: here.reduce((s, h) => s + h.place.pieces.length, 0) },\n  here: here.map((h) => ({ ref: h.place.ref, section_word: h.found.at, word: h.place.n, reads: h.place.words })),\n',
     '  applied_by: SPELLING_BRIDGE_TOOL,\n  pin: `${SPELLING_BRIDGE_HOME}/PIN.json`,\n  relay: bridge.pin.v1_2.relay,\n  letter: bridge.pin.v1_2.letter,\n  list: { file: `${bridge.pin.v1_2.folder}/${bridge.pin.v1_2.places.file}`, sha256: bridge.pin.v1_2.places.sha256, lines: bridge.pin.v1_2.places.lines },\n  extends: { file: `${bridge.pin.v1_1.folder}/${bridge.pin.v1_1.places.file}`, sha256: bridge.pin.v1_1.places.sha256, relay: bridge.pin.v1_1.relay },\n  counts: { places_laid: here.length, pieces: here.reduce((s, h) => s + h.place.pieces.length, 0) },\n  here: here.map((h) => ({ ref: h.place.ref, section_word: h.found.at, word: h.place.n, reads: h.place.words })),\n'),
    ('    tool: SPELLING_BRIDGE_TOOL,\n    fields: ["emitted_from.spelling_bridge", "sections[].words[].pg"],\n    why: "the lattice the zone was projected from reads STEP under the Leningrad text\'s spelling and gives a place our text spells otherwise no pieces; the corpus lane\'s spelling bridge (relays v202 and v214) cuts STEP\'s pieces onto our letters, and STEP\'s own words for the place, as STEP writes them, give their words",\n    expires: "with this zone\'s projection from a lattice of the corpus lane\'s that gives these places pieces itself",\n    stamp: STAMP,\n',
     '    tool: SPELLING_BRIDGE_TOOL,\n    fields: ["emitted_from.spelling_bridge", "sections[].words[].pg"],\n    why: "the lattice the zone was projected from reads STEP under the Leningrad text\'s spelling and gives a place our text spells otherwise no pieces; the corpus lane\'s spelling bridge (relays v202, v214 and v220) cuts STEP\'s pieces onto our letters, and STEP\'s own words for the place, as STEP writes them, give their words",\n    expires: "with this zone\'s projection from a lattice of the corpus lane\'s that gives these places pieces itself",\n    stamp: STAMP,\n'),
]
s = open(P, encoding="utf-8").read()
todo = stood = 0
for o, n in PAIRS:
    if s.count(o) == 1 and s.count(n) == 0: todo += 1
    elif s.count(o) == 0 and s.count(n) == 1: stood += 1
    else: sys.exit(f"REFUSED · tools/apply-spelling-bridge-v1.mjs: a replacement's old text occurs {s.count(o)} times and its new text {s.count(n)}; nothing written ({o[:70]!r})")
if not todo:
    print(f"stands already · tools/apply-spelling-bridge-v1.mjs ({stood} of {len(PAIRS)} replacements carried)"); sys.exit(0)
for o, n in PAIRS:
    if s.count(o) == 1 and s.count(n) == 0: s = s.replace(o, n)
open(P, "w", encoding="utf-8").write(s)
print(f"patched · tools/apply-spelling-bridge-v1.mjs ({todo} of {len(PAIRS)} replacements made{f', {stood} carried already' if stood else ''})")
