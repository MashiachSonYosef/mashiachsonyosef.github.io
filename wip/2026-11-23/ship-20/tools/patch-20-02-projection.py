#!/usr/bin/env python3
# Ship 20 (23 November 2026): the projection reads the name places as laid with relay v219's addition, and its receipts name the addition and the lists of rows
# A patch of exact replacements on tools/project-lattice-v12-v1.mjs: each old text occurs once and its new text not at all, and is replaced; a
# replacement whose new text stands once and whose old text is gone is said and passed, so over a file that carries the
# patch it writes nothing. Anything else is refused and nothing is written.
# Usage: python3 -I <this> <reader dir>
import os, sys
P = os.path.join(sys.argv[1], 'tools/project-lattice-v12-v1.mjs')
PAIRS = [
    ('import { leadersKey, PLACE_IS_A_NAME } from "./place-leaders-v1.mjs";\nimport { readPinnedLines } from "./pinned-v1.mjs";\nimport { RECORD_FILE } from "./row-strikes-follow-v1.mjs";\n',
     'import { leadersKey, PLACE_IS_A_NAME } from "./place-leaders-v1.mjs";\nimport { PinFault } from "./pinned-v1.mjs";\nimport { namePlaces } from "./name-lists-v1.mjs";\nimport { RECORD_FILE } from "./row-strikes-follow-v1.mjs";\n'),
    ('// bytes. Every word\'s mark is cleared first, so a place an earlier list named\n// and this one does not carries none.\nconst namesDir = arg("--names", join(zonePath.replace(/data\\/zones\\/.*$/u, ""), "data", "names"));\n',
     '// bytes. Every word\'s mark is cleared first, so a place an earlier list named\n// and this one does not carries none. Since ship 20 (23 November 2026) the\n// list read is names v1\'s with the corpus lane\'s addition laid on it (relay\n// v219: Ezekiel 27:6 word 11 added, TAHOT a witness at 6 more places), as\n// tools/name-lists-v1.mjs lays it, and the receipt names both files.\nconst namesDir = arg("--names", join(zonePath.replace(/data\\/zones\\/.*$/u, ""), "data", "names"));\n'),
    ("  // relay v198: «the places stay v1's»), else in the pin's\n  const placesFolder = pin.place_names.folder || pin.folder;\n  for (const l of readPinnedLines(join(namesDir, placesFolder, pin.place_names.file), pin.place_names, `${placesFolder}/${pin.place_names.file}`)) {\n    if (l.book !== slug) continue;\n",
     "  // relay v198: «the places stay v1's»), else in the pin's\n  let laidPlaces;\n  try { laidPlaces = namePlaces(namesDir, pin); } catch (e) { if (e instanceof PinFault) { console.error(`the list of name places: ${e.message}`); process.exit(1); } throw e; }\n  for (const l of laidPlaces.laid) {\n    if (l.book !== slug) continue;\n"),
    ('  stats.name_places_with_no_word = stats.name_places_listed - stats.name_places_marked;\n  namesSaid = { rule: NAMES_GATE_RULE_ID, relay: pin.place_names.relay || pin.relay, place_names: { file: pin.place_names.file, sha256: pin.place_names.sha256, lines: pin.place_names.lines },\n    listed_for_this_book: stats.name_places_listed, marked: stats.name_places_marked, with_no_word: stats.name_places_with_no_word };\n',
     '  stats.name_places_with_no_word = stats.name_places_listed - stats.name_places_marked;\n  const added = laidPlaces.addition;\n  namesSaid = { rule: NAMES_GATE_RULE_ID, relay: pin.place_names.relay || pin.relay, place_names: { file: pin.place_names.file, sha256: pin.place_names.sha256, lines: pin.place_names.lines },\n    ...(added ? { additions: { relay: added.relay, file: added.file, sha256: added.sha256, lines: added.lines, places_listed: laidPlaces.laid.length } } : {}),\n    listed_for_this_book: stats.name_places_listed, marked: stats.name_places_marked, with_no_word: stats.name_places_with_no_word };\n'),
    ('  entry: { rule: ENTRY_GATE_RULE_ID, by_lemma: ENTRY_BY_LEMMA_RULE_ID, row_entries: store.index.row_entries ? { relay: store.index.row_entries.relay, ledger_sha256: store.index.row_entries.ledger.sha256, ...(store.index.row_entries.lists ? { lists: store.index.row_entries.lists.map((l) => ({ relay: l.relay, list_sha256: l.list.sha256 })) } : {}) } : null },\n  names: namesSaid ? { rule: NAMES_GATE_RULE_ID, relay: namesSaid.relay, place_names_sha256: namesSaid.place_names.sha256, name_rows: store.index.name_rows ? { relay: store.index.name_rows.relay, list_sha256: store.index.name_rows.name_rows.sha256 } : null } : null,\n  // rule 6: the record the leaders were baked at rest under; absent where the book does not rest shut\n',
     '  entry: { rule: ENTRY_GATE_RULE_ID, by_lemma: ENTRY_BY_LEMMA_RULE_ID, row_entries: store.index.row_entries ? { relay: store.index.row_entries.relay, ledger_sha256: store.index.row_entries.ledger.sha256, ...(store.index.row_entries.lists ? { lists: store.index.row_entries.lists.map((l) => ({ relay: l.relay, list_sha256: l.list.sha256 })) } : {}) } : null },\n  names: namesSaid ? { rule: NAMES_GATE_RULE_ID, relay: namesSaid.relay, place_names_sha256: namesSaid.place_names.sha256, ...(namesSaid.additions ? { place_additions_sha256: namesSaid.additions.sha256 } : {}),\n    name_rows: store.index.name_rows ? { relay: store.index.name_rows.relay, list_sha256: store.index.name_rows.name_rows.sha256, ...(Array.isArray(store.index.name_rows.more_lists) ? { more: store.index.name_rows.more_lists.map((x) => ({ relay: x.relay, list_sha256: x.name_rows.sha256 })) } : {}) } : null } : null,\n  // rule 6: the record the leaders were baked at rest under; absent where the book does not rest shut\n'),
]
s = open(P, encoding="utf-8").read()
todo = stood = 0
for o, n in PAIRS:
    if s.count(o) == 1 and s.count(n) == 0: todo += 1
    elif s.count(o) == 0 and s.count(n) == 1: stood += 1
    else: sys.exit(f"REFUSED · tools/project-lattice-v12-v1.mjs: a replacement's old text occurs {s.count(o)} times and its new text {s.count(n)}; nothing written ({o[:70]!r})")
if not todo:
    print(f"stands already · tools/project-lattice-v12-v1.mjs ({stood} of {len(PAIRS)} replacements carried)"); sys.exit(0)
for o, n in PAIRS:
    if s.count(o) == 1 and s.count(n) == 0: s = s.replace(o, n)
open(P, "w", encoding="utf-8").write(s)
print(f"patched · tools/project-lattice-v12-v1.mjs ({todo} of {len(PAIRS)} replacements made{f', {stood} carried already' if stood else ''})")
