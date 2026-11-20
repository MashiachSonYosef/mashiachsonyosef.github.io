# Ship 11: check-same-product-v1 (the gate) learns the entry gate over a new ledger, as an expectation
# (--expect data/row-entries-receipt-v1.json): a row whose entries the pinned ledger moves (the pin's list of moves)
# may come onto a card where it is now of the place's own entry, and may leave a line or a card where it is now of
# another. Asked of the new build's store, zone and pin, never named.
import sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:90])
    t = t.replace(old, new)

rep('''// SHIP 5'S LANDINGS (the design of ships 5 and 6, section 8; the lead's calls''',
'''// THE ENTRY GATE OVER A NEW LEDGER (entry-gate-rule-v1; ship 11 of 20 November
// 2026, row entries v1.2). With --expect data/row-entries-receipt-v1.json (the
// receipt of the tool that lays the entries, told by its rule_id): the rows
// whose entries the pinned ledger moves are the lines of the pin's list of
// moves (data/row-entries/PIN.json, moves), and what they alone change is
// owed. On S2, a card may gain a pill that such a row carries under the
// word's keys where the row is now of the place's own entry (it stands
// whatever its points), and may lose a pill every carrying row of which is
// such a row, now of another entry than the place's. On S1, a line that
// differs, on the same word, is owed where every row that carried its old
// reading, of each source its old chip names, is such a row, now of another
// entry. A row's verdict is the gate's own (tools/entry-gate-v1.mjs), asked
// with the new build's facts at the new zone's tags for the word.
// SHIP 5'S LANDINGS (the design of ships 5 and 6, section 8; the lead's calls''')
rep('''import { placeTags } from "./entry-gate-v1.mjs";''', '''import { ENTRY_GATE_RULE_ID, placeTags, placeEntry, bdbEntriesAt, entryVerdict } from "./entry-gate-v1.mjs";
import { readPinned } from "./pinned-v1.mjs";''')
rep('''let EXPECT = "", KINDS = null, AUDIT = null, FORM_OF = null, NAMES = null;''', '''let EXPECT = "", KINDS = null, AUDIT = null, FORM_OF = null, NAMES = null, ENTRIES = null;''')
rep('''  else refuse(`--expect ${path}: its rule_id ${JSON.stringify(rec.rule_id || null)} is not an expectation this check knows (${DEFAULT_PICKS_RULE}…, ${DICTIONARY_KINDS_RULE_ID}, ${AUDIT_CALLS_RULE}, ${FORM_OF_RULE}, ${NAMES_GATE_RULE_ID})`);''',
'''  else if (rec.rule_id === ENTRY_GATE_RULE_ID) {
    if (ENTRIES) refuse(`--expect names two receipts of ${ENTRY_GATE_RULE_ID}`);
    if (!Array.isArray(rec.runs) || !rec.runs.length) refuse(`--expect ${path}: the receipt under ${ENTRY_GATE_RULE_ID} records no run`);
    // the rows the pinned ledger moves: the pin's list of moves, each line a key, a rank, a source and the row's words
    const pinDir = join(dirname(path), "row-entries");
    let pin = null;
    try { pin = JSON.parse(readFileSync(join(pinDir, "PIN.json"), "utf8")); } catch (e) { refuse(`--expect ${path}: the pin of the row entries beside it is not read (${e.message})`); }
    if (!pin.moves) refuse(`--expect ${path}: the pin of the row entries names no list of the rows its ledger moves`);
    const moved = new Map();
    try {
      const body = readPinned(join(pinDir, pin.folder, pin.moves.file), pin.moves, `${pin.folder}/${pin.moves.file}`).toString("utf8").split("\\n").slice(1).filter(Boolean);
      for (const line of body) { const c = line.split("\\t"); (moved.get(c[0]) || moved.set(c[0], new Set()).get(c[0])).add(`${c[2]}\\u0001${c[3]}`); }
    } catch (e) { if (e instanceof PinFault) refuse(`--expect ${path}: ${e.message}`); throw e; }
    ENTRIES = { rec, path, moved, list: pin.moves.file };
  }
  else refuse(`--expect ${path}: its rule_id ${JSON.stringify(rec.rule_id || null)} is not an expectation this check knows (${DEFAULT_PICKS_RULE}…, ${DICTIONARY_KINDS_RULE_ID}, ${AUDIT_CALLS_RULE}, ${FORM_OF_RULE}, ${NAMES_GATE_RULE_ID}, ${ENTRY_GATE_RULE_ID})`);''')
rep('''const fetchGz = async (u) => {''',
'''// THE ENTRY GATE OVER A NEW LEDGER (--expect the row entries' receipt): the rows that carry a reading under a word's
// keys, of the sources named, each with whether the pinned list of moves names it and the gate's verdict on it at the
// word's place, asked with the new build's facts
const entryRowsAt = (w, keys, text, ids) => {
  if (!ENTRIES || !w || typeof text !== "string" || !text || !Array.isArray(ids) || !ids.length) return [];
  const [whole] = storesOf();
  const place = placeEntry(placeTags(w));
  const out = [];
  for (const kk of keys) {
    const routes = whole.routesFor(kk) || [];
    const bdbHere = place ? bdbEntriesAt(place, routes.map((row) => factsOf(row))) : new Set();
    for (const row of whole.carriersOf(routes, text)) {
      if (!ids.map(String).includes(String(row[3]))) continue;
      out.push({ moved: (ENTRIES.moved.get(kk) || new Set()).has(`${row[3]}\\u0001${row[1]}`), verdict: place ? entryVerdict(factsOf(row), place, bdbHere) : "none" });
    }
  }
  return out;
};
const fetchGz = async (u) => {''')
# S1's class, before the names class
rep('''        // THE NAMES GATE over a new list of name rows: the old reading was carried by name rows alone, at a place that
        // is not a name''',
'''        // THE ENTRY GATE over a new ledger: every row that carried the old reading is a row the ledger moves, now of
        // another entry than the place's
        if (ENTRIES && differs && x[0] === y[0]) {
          const w = wordAt(z, k, i);
          const rows = w && !w.mark ? entryRowsAt(w, keysOfWord(w, true), x[1], idsOf(x[3])) : [];
          if (rows.length && rows.every((r) => r.moved && r.verdict === "other")) {
            entriesMoved += 1;
            if (name === "default") entryLines.add(`${z} ${ch} ${k} #${i + 1}`);
            if (DIFF) diffLines.push(`entries: ${z} ${ch} ${name} ${k} #${i + 1} ${x[0]}: "${x[1]}" [${x[2]} · ${x[3]}] → "${y[1]}" [${y[2]} · ${y[3]}]`);
            continue;
          }
        }
        // THE NAMES GATE over a new list of name rows: the old reading was carried by name rows alone, at a place that
        // is not a name''')
rep('''let namesMoved = 0, namesCards = 0, namesPillsLost = 0;''', '''let namesMoved = 0, namesCards = 0, namesPillsLost = 0;
let entriesMoved = 0, entryCards = 0, entryPillsGained = 0, entryPillsLost = 0;
const entryLines = new Set();   // the default lines the entry gate moved over the new ledger, by word, for S2's pressed pill''')
# S2's class
rep('''    // (g) and a pill a source that rests shut carried beside others may stand elsewhere in the order''',
'''    // (i) the entry gate over a new ledger: a lost pill every carrying row of which the ledger moves, each now of
    // another entry than the place's; and (below) a gained pill that such a row carries, now of the place's own entry
    let entryLost = 0;
    const wHere = ENTRIES && C.at ? wordAt(z, C.at[0], C.at[1]) : null;
    if (wHere && !wHere.mark) {
      const keys = keysOfWord(wHere);
      for (const o of olds) {
        if (newKeys.has(o.k) || !o.by.length) continue;
        const rows = entryRowsAt(wHere, keys, String(o.t).replace(/^\\*/u, ""), o.by);
        if (rows.length && rows.every((r) => r.moved && r.verdict === "other")) { o.entered = true; entryLost += 1; }
      }
      olds = olds.filter((o) => !o.entered);
    }
    const entryGain = (q) => !!wHere && !wHere.mark && entryRowsAt(wHere, keysOfWord(wHere), String(q.t).replace(/^\\*/u, ""), q.by).some((r) => r.moved && r.verdict === "this");
    // (g) and a pill a source that rests shut carried beside others may stand elsewhere in the order''')
rep('''    if (gained.some((q) => !gainOk(q))) faults.push(`it carries ${gained.filter((q) => !gainOk(q)).map((q) => `«${q.t}»`).join(", ")}, which the old card lacks`);''',
    '''    const byEntry = gained.filter((q) => !gainOk(q) && entryGain(q));
    if (gained.some((q) => !gainOk(q) && !byEntry.includes(q))) faults.push(`it carries ${gained.filter((q) => !gainOk(q) && !byEntry.includes(q)).map((q) => `«${q.t}»`).join(", ")}, which the old card lacks`);''')
rep('''    const lineMoved = signMoved || standsMoved || (!!C.at && kindsLines.has(word)) || (!!C.at && namesLines.has(word)) || nameLost > 0;''',
    '''    const lineMoved = signMoved || standsMoved || (!!C.at && kindsLines.has(word)) || (!!C.at && namesLines.has(word)) || nameLost > 0 || (!!C.at && entryLines.has(word)) || entryLost > 0;''')
rep('''    if (nameLost) { namesCards += 1;''', '''    if (entryLost || byEntry.length) { entryCards += 1; entryPillsLost += entryLost; entryPillsGained += byEntry.length; why.push(`entries: ${byEntry.length ? `gained ${byEntry.map((q) => `«${String(q.t).replace(/^\\*/u, "")}»`).join(", ")}, a row the ledger moves, now of the place's own entry` : ""}${byEntry.length && entryLost ? "; " : ""}${entryLost ? `lost ${entryLost} pill(s) of rows the ledger moves, now of another entry` : ""}`); if (DIFF) diffLines.push(`== ${z} ${ch} card ${i + 1} (${why[why.length - 1]})\\n  only old: ${A.said.filter((tt) => !C.said.includes(tt)).join(" | ")}\\n  only new: ${C.said.filter((tt) => !A.said.includes(tt)).join(" | ")}`); }
    if (nameLost) { namesCards += 1;''')
rep('''${NAMES ? ", and at a place that is not a name, the lines name rows alone carried, each moved off them" : ""}`, !failed.length && pages.length > 0 && !s1.length && !expected.length,''',
    '''${NAMES ? ", and at a place that is not a name, the lines name rows alone carried, each moved off them" : ""}${ENTRIES ? ", and the lines carried by rows the new ledger moves to another entry than the place's, each moved off them" : ""}`, !failed.length && pages.length > 0 && !s1.length && !expected.length,''')
rep('''${NAMES ? ` · ${namesMoved} line(s) the names gate moved, each as owed` : ""}''', '''${NAMES ? ` · ${namesMoved} line(s) the names gate moved, each as owed` : ""}${ENTRIES ? ` · ${entriesMoved} line(s) the entry gate moved over ${ENTRIES.list}, each as owed` : ""}''')
rep('''${NAMES ? ", and at a place that is not a name, the pills name rows alone carried, held back and counted" : ""}`, !failed.length && cardsCompared > 0 && !s2.length,''',
    '''${NAMES ? ", and at a place that is not a name, the pills name rows alone carried, held back and counted" : ""}${ENTRIES ? ", and the pills of rows the new ledger moves: gained where the row is now of the place's own entry, lost where it is now of another" : ""}`, !failed.length && cardsCompared > 0 && !s2.length,''')
rep('''${NAMES ? ` · ${namesCards} card(s) lost ${namesPillsLost} pill(s) name rows alone carried, each held back by name` : ""}''', '''${NAMES ? ` · ${namesCards} card(s) lost ${namesPillsLost} pill(s) name rows alone carried, each held back by name` : ""}${ENTRIES ? ` · ${entryCards} card(s) moved by rows the ledger moves: ${entryPillsGained} pill(s) gained, ${entryPillsLost} lost` : ""}''')
open(p, 'w', encoding='utf-8').write(t)
print('gate patched for the entries')
