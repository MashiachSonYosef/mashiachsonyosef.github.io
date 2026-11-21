#!/usr/bin/env python3
# Ship 11d: the gate (check-same-product-v1) learns the spelling bridge's expectation, and the pin carries its rule_id.
# Usage: patch-gate-bridge.py <reader dir>. Checks first; a second run is a no-op.
import sys, io
R = sys.argv[1]
def patch(path, pairs):
    t = io.open(path, encoding="utf-8", newline="").read()
    if all(new in t for old, new in pairs) and all(old not in t or old in new for old, new in pairs): print("already patched:", path); return
    for old, new in pairs:
        if t.count(old) != 1: sys.exit("REFUSED: %s holds %d of %r" % (path, t.count(old), old[:80]))
    for old, new in pairs: t = t.replace(old, new)
    io.open(path, "w", encoding="utf-8", newline="").write(t); print("patched:", path)

RULE = "spelling-bridge-rule-v1-where-our-text-spells-a-word-otherwise-and-step-names-our-spelling-the-place-reads-steps-own-words-for-it-cut-on-our-letters"
patch(R + "/data/spelling-bridge/PIN.json", [(
 ' "schema_version": "SPELLING_BRIDGE_PIN_V1",\n "what":',
 ' "schema_version": "SPELLING_BRIDGE_PIN_V1",\n "rule_id": "%s",\n "what":' % RULE)])
patch(R + "/tools/spelling-bridge-v1.mjs", [(
 '  if (pin.schema_version !== "SPELLING_BRIDGE_PIN_V1") throw new PinFault(`${pinPath}: schema ${pin.schema_version}, not SPELLING_BRIDGE_PIN_V1`);\n',
 '  if (pin.schema_version !== "SPELLING_BRIDGE_PIN_V1") throw new PinFault(`${pinPath}: schema ${pin.schema_version}, not SPELLING_BRIDGE_PIN_V1`);\n  if (pin.rule_id !== SPELLING_BRIDGE_RULE_ID) throw new PinFault(`${pinPath}: its rule_id is not ${SPELLING_BRIDGE_RULE_ID}`);\n')])
G = R + "/tools/check-same-product-v1.mjs"
patch(G, [
 # the header
 ('// with the new build\'s facts at the new zone\'s tags for the word.\n// SHIP 5\'S LANDINGS',
  '// with the new build\'s facts at the new zone\'s tags for the word.\n'
  '// THE SPELLING BRIDGE (spelling-bridge-rule-v1; ship 11d of 21 November 2026).\n'
  '// With --expect data/spelling-bridge/PIN.json (the pin of the corpus lane\'s\n'
  '// list, told by its rule_id): at a place the pin lays, found on the new\n'
  '// build\'s zone as the tool that lays it finds it, a line that differs, on the\n'
  '// same word, is owed where the new line is the place\'s own pieces as the page\n'
  '// draws them with the signs at rest, credited to the pieces\' source. Under a\n'
  '// switch where the place\'s reading does not lead the line is the old line,\n'
  '// and nothing is owed. No place is named here: the pin and the zone say them.\n'
  '// SHIP 5\'S LANDINGS'),
 ('[--expect <data/form-of-pills-v1.json>]\n', '[--expect <data/form-of-pills-v1.json>] [--expect <data/spelling-bridge/PIN.json>]\n'),
 # imports
 ('import { readingKey, openRouteStore, factsOf } from "./gloss-store-v1.mjs";\n',
  'import { readingKey, openRouteStore, factsOf, printedForm } from "./gloss-store-v1.mjs";\nimport { SPELLING_BRIDGE_RULE_ID, PIECE_SOURCE, readBridge, laidOf, findBridgePlace } from "./spelling-bridge-v1.mjs";\n'),
 ('let EXPECT = "", KINDS = null, AUDIT = null, FORM_OF = null, NAMES = null, ENTRIES = null;\n',
  'let EXPECT = "", KINDS = null, AUDIT = null, FORM_OF = null, NAMES = null, ENTRIES = null, BRIDGE = null;\n'),
 ('  else refuse(`--expect ${path}: its rule_id ${JSON.stringify(rec.rule_id || null)} is not an expectation this check knows (${DEFAULT_PICKS_RULE}…, ${DICTIONARY_KINDS_RULE_ID}, ${AUDIT_CALLS_RULE}, ${FORM_OF_RULE}, ${NAMES_GATE_RULE_ID}, ${ENTRY_GATE_RULE_ID})`);\n',
  '  else if (rec.rule_id === SPELLING_BRIDGE_RULE_ID) {\n'
  '    if (BRIDGE) refuse(`--expect names two pins of ${SPELLING_BRIDGE_RULE_ID}`);\n'
  '    // the places the pin lays, read as the tool that lays them reads them; a list that does not hold is refused, never half read\n'
  '    let laid = null;\n'
  '    try { const got = laidOf(readBridge(path)); if (got.faults.length) refuse(`--expect ${path}: ${got.faults[0]}`); laid = got.laid; } catch (e) { if (e instanceof PinFault) refuse(`--expect ${path}: ${e.message}`); throw e; }\n'
  '    BRIDGE = { rec, path, laid, byBook: new Map(), credit: `PIECE:${PIECE_SOURCE.toUpperCase()}` };\n'
  '  }\n'
  '  else refuse(`--expect ${path}: its rule_id ${JSON.stringify(rec.rule_id || null)} is not an expectation this check knows (${DEFAULT_PICKS_RULE}…, ${DICTIONARY_KINDS_RULE_ID}, ${AUDIT_CALLS_RULE}, ${FORM_OF_RULE}, ${NAMES_GATE_RULE_ID}, ${ENTRY_GATE_RULE_ID}, ${SPELLING_BRIDGE_RULE_ID})`);\n'),
 # the places of a book, on the new build's zone
 ('const wordAt = (z, secId, i) => {',
  '// THE SPELLING BRIDGE\'S PLACES IN A BOOK (--expect its pin): section and entry -> the place\'s pieces as the page draws\n'
  '// them with the signs at rest. Each laid place is found on the new build\'s zone as the tool finds it; one that is not\n'
  '// found is no place here, and check-spelling-bridge-v1 B2 says so\n'
  'const bridgeIn = (z) => {\n'
  '  if (!BRIDGE) return null;\n'
  '  if (!BRIDGE.byBook.has(z)) {\n'
  '    const m = new Map(), zone = newOf(z).zone;\n'
  '    for (const place of BRIDGE.laid) {\n'
  '      if (place.book !== z || !zone) continue;\n'
  '      const found = findBridgePlace(zone, place);\n'
  '      if (!found.fault) m.set(`s${found.si}\\u0001${found.at}`, signsOff(printedForm(place.pieces.map((x) => String(x.g).trim()).join("/"))));\n'
  '    }\n'
  '    BRIDGE.byBook.set(z, m);\n'
  '  }\n'
  '  return BRIDGE.byBook.get(z);\n'
  '};\n'
  'let bridgeMoved = 0;\n'
  'const bridgeLines = new Set();   // the default lines the bridge\'s pieces moved, by word, for S2\'s pressed pill\n'
  'const wordAt = (z, secId, i) => {'),
 # the clause, first among the owed classes
 ('        // a fill at rest the batch makes on purpose: the new line is the second\'s words under its chip, whatever the old one was\n',
  '        // THE SPELLING BRIDGE: at a place the pin lays, a line that differs is the place\'s own pieces under their chip\n'
  '        const bridged = BRIDGE ? (bridgeIn(z) || new Map()).get(`${k}\\u0001${i}`) : undefined;\n'
  '        if (bridged !== undefined && x[0] === y[0] && (x[1] !== y[1] || x[2] !== y[2] || x[3] !== y[3])) {\n'
  '          if (y[1] === bridged && y[3] === BRIDGE.credit) {\n'
  '            bridgeMoved += 1;\n'
  '            if (name === "default") bridgeLines.add(`${z} ${ch} ${k} #${i + 1}`);\n'
  '            if (DIFF) diffLines.push(`bridge: ${z} ${ch} ${name} ${k} #${i + 1} ${x[0]}: "${x[1]}" [${x[2]} · ${x[3]}] → "${y[1]}" [${y[2]} · ${y[3]}]`);\n'
  '            continue;\n'
  '          }\n'
  '          expected.push(`${at}: "${y[1]}" [${y[3]}], the place\'s own pieces owed at a place the spelling bridge lays "${bridged}" [${BRIDGE.credit}]`);\n'
  '          continue;\n'
  '        }\n'
  '        // a fill at rest the batch makes on purpose: the new line is the second\'s words under its chip, whatever the old one was\n'),
])

# the summary of S1, and S2's pressed pill where the bridge moved the word's line
patch(G, [
 ('${ENTRIES ? ", and the lines carried by rows the new ledger moves to another entry than the place\'s, each moved off them" : ""}`, !failed.length && pages.length > 0 && !s1.length && !expected.length,',
  '${ENTRIES ? ", and the lines carried by rows the new ledger moves to another entry than the place\'s, each moved off them" : ""}${BRIDGE ? ", and at a place the spelling bridge lays, the place\'s own pieces" : ""}`, !failed.length && pages.length > 0 && !s1.length && !expected.length,'),
 ('${ENTRIES ? ` · ${entriesMoved} line(s) the entry gate moved over ${ENTRIES.list}, each as owed` : ""}${s1.length ?',
  '${ENTRIES ? ` · ${entriesMoved} line(s) the entry gate moved over ${ENTRIES.list}, each as owed` : ""}${BRIDGE ? ` · ${bridgeMoved} line(s) at a place the spelling bridge lays, each the place\'s own pieces` : ""}${!EXPECT && expected.length ? ` · ${expected.length} not as owed: ${expected.slice(0, 3).join("; ")}` : ""}${s1.length ?'),
 ('(!!C.at && entryLines.has(word)) || entryLost > 0;', '(!!C.at && entryLines.has(word)) || entryLost > 0 || (!!C.at && bridgeLines.has(word));'),
])
