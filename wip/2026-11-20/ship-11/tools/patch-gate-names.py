# Ship 11: check-same-product-v1 (the gate) learns the names gate over a new list of name rows, as an expectation
# (--expect data/name-rows-receipt-v1.json): a line or a card's pill that every carrying row of is a name row in the
# new build's store, at a place that is not a name, is owed gone; the card says it holds back more by name.
import sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:90])
    t = t.replace(old, new)

rep('''// SHIP 5'S LANDINGS (the design of ships 5 and 6, section 8; the lead's calls''',
'''// THE NAMES GATE OVER A NEW LIST OF NAME ROWS (names-gate-rule-v1; ship 11 of
// 20 November 2026, names v2). With --expect data/name-rows-receipt-v1.json
// (the receipt of the tool that lays the name mark, told by its rule_id):
// at a place the new build's zone does not mark a name, a row its source
// gives as a name is withheld, so what such rows alone carried is owed gone.
// On S1, a line that differs, on the same word, is owed where every row
// that carried its old reading under the word's keys, of each source its old
// chip names, is a name row in the new build's store. On S2, a card may
// lose a pill every carrier of which is so (or rests shut, where the kinds
// record is given too), and says it holds back more by name than the old
// card did (data-name-withheld); its pressed pill may move where its word's
// line moved so. Asked of the new build's store and zone, never named.
// SHIP 5'S LANDINGS (the design of ships 5 and 6, section 8; the lead's calls''')
rep('''import { readingKey, openRouteStore } from "./gloss-store-v1.mjs";''',
    '''import { readingKey, openRouteStore, factsOf } from "./gloss-store-v1.mjs";
import { NAMES_GATE_RULE_ID } from "./names-gate-v1.mjs";''')
rep('''let EXPECT = "", KINDS = null, AUDIT = null, FORM_OF = null;''', '''let EXPECT = "", KINDS = null, AUDIT = null, FORM_OF = null, NAMES = null;''')
rep('''  else refuse(`--expect ${path}: its rule_id ${JSON.stringify(rec.rule_id || null)} is not an expectation this check knows (${DEFAULT_PICKS_RULE}…, ${DICTIONARY_KINDS_RULE_ID}, ${AUDIT_CALLS_RULE}, ${FORM_OF_RULE})`);''',
'''  else if (rec.rule_id === NAMES_GATE_RULE_ID) {
    if (NAMES) refuse(`--expect names two receipts of ${NAMES_GATE_RULE_ID}`);
    if (!Array.isArray(rec.runs) || !rec.runs.length) refuse(`--expect ${path}: the receipt under ${NAMES_GATE_RULE_ID} records no run`);
    NAMES = { rec, path };
  }
  else refuse(`--expect ${path}: its rule_id ${JSON.stringify(rec.rule_id || null)} is not an expectation this check knows (${DEFAULT_PICKS_RULE}…, ${DICTIONARY_KINDS_RULE_ID}, ${AUDIT_CALLS_RULE}, ${FORM_OF_RULE}, ${NAMES_GATE_RULE_ID})`);''')
# the helper, beside stoodShut
rep('''const fetchGz = async (u) => {''',
'''// THE NAMES GATE (--expect the name rows' receipt): whether every row that carries a reading under the keys, of each
// source named, is a name row in the new build's store (and at least one source is named and carries it)
const nameRowsAlone = (keys, text, ids) => {
  if (typeof text !== "string" || !text || !Array.isArray(ids) || !ids.length) return false;
  const [whole] = storesOf();
  const rows = keys.flatMap((kk) => whole.carriersOf(whole.routesFor(kk) || [], text));
  return ids.map(String).every((id) => { const of = rows.filter((row) => String(row[3]) === id); return of.length > 0 && of.every((row) => !!(factsOf(row) || {}).name); });
};
const fetchGz = async (u) => {''')
# the card's own count of what it holds back by name
rep('''          held: box ? Number(box.dataset.kindWithheld || 0) : 0, at: sec ?''', '''          held: box ? Number(box.dataset.kindWithheld || 0) : 0, nameHeld: box ? Number(box.dataset.nameWithheld || 0) : 0, at: sec ?''')
rep('''    const none = { said: [], by: [], ptr: [], ptrBy: [], place: "", cell: "", held: 0, at: null };''', '''    const none = { said: [], by: [], ptr: [], ptrBy: [], place: "", cell: "", held: 0, nameHeld: 0, at: null };''')
# S1's class
rep('''        if (differs) { s1.push(`${at} ${x[0]}: "${x[1]}" [${x[2]}] → "${y[1]}" [${y[2]}]`); if (s1.length > 400) break; }
      }''', '''        // THE NAMES GATE over a new list of name rows: the old reading was carried by name rows alone, at a place that
        // is not a name
        if (NAMES && differs && x[0] === y[0]) {
          const w = wordAt(z, k, i);
          if (w && !w.mark && !w.np && nameRowsAlone(keysOfWord(w, true), x[1], idsOf(x[3]))) {
            namesMoved += 1;
            if (name === "default") namesLines.add(`${z} ${ch} ${k} #${i + 1}`);
            if (DIFF) diffLines.push(`names: ${z} ${ch} ${name} ${k} #${i + 1} ${x[0]}: "${x[1]}" [${x[2]} · ${x[3]}] → "${y[1]}" [${y[2]} · ${y[3]}]`);
            continue;
          }
        }
        if (differs) { s1.push(`${at} ${x[0]}: "${x[1]}" [${x[2]}] → "${y[1]}" [${y[2]}]`); if (s1.length > 400) break; }
      }''')
rep('''const owedCards = {''', '''let namesMoved = 0, namesCards = 0, namesPillsLost = 0;
const namesLines = new Set();   // the default lines the names gate moved, by word, for S2's pressed pill
const owedCards = {''')
# S2's class, after the kinds class
rep('''    // (g) and a pill a source that rests shut carried beside others may stand elsewhere in the order''',
'''    // (h) the names gate over a new list of name rows: at a place that is not a name, a lost pill every carrier of
    // which carried it in name rows alone (or rests shut, where the kinds record is given), one of them at least by
    // name; the card says it holds back more by name than the old card did
    let nameLost = 0;
    if (NAMES && C.at) {
      const w = wordAt(z, C.at[0], C.at[1]);
      if (w && !w.mark && !w.np) {
        const keys = keysOfWord(w), shutToo = KINDS && restsHere(z);
        for (const o of olds) {
          if (newKeys.has(o.k) || !o.by.length) continue;
          const text = String(o.t).replace(/^\\*/u, "");
          const byName = o.by.filter((id) => nameRowsAlone(keys, text, [id]));
          if (byName.length && o.by.every((id) => byName.includes(id) || (shutToo && (SHUT.has(id) || (FACT_IDS.has(id) && stoodShut(keys, text, [id], own)))))) { o.named = true; nameLost += 1; }
        }
        if (nameLost && !(C.nameHeld > A.nameHeld)) faults.push(`it lost ${nameLost} pill(s) name rows alone carried and says it holds back ${C.nameHeld} by name, as the old card said ${A.nameHeld}`);
        olds = olds.filter((o) => !o.named);
      }
    }
    // (g) and a pill a source that rests shut carried beside others may stand elsewhere in the order''')
rep('''    const lineMoved = signMoved || standsMoved || (!!C.at && kindsLines.has(word));''', '''    const lineMoved = signMoved || standsMoved || (!!C.at && kindsLines.has(word)) || (!!C.at && namesLines.has(word)) || nameLost > 0;''')
rep('''    if (shutLost) { kindsCards += 1; kindsPillsLost += shutLost; why.push(`kinds: ${shutLost} pill(s) of the dictionaries that rest shut, held back ${C.held}`); }''',
    '''    if (shutLost) { kindsCards += 1; kindsPillsLost += shutLost; why.push(`kinds: ${shutLost} pill(s) of the dictionaries that rest shut, held back ${C.held}`); }
    if (nameLost) { namesCards += 1; namesPillsLost += nameLost; why.push(`names: ${nameLost} pill(s) name rows alone carried, at a place that is no name; held back by name ${A.nameHeld} → ${C.nameHeld}`); }''')
# what S1 and S2 say
rep('''${RUNS ? ", and the words of a run whose every word reads its own at the place, each reading its own" : ""}`, !failed.length && pages.length > 0 && !s1.length && !expected.length,''',
    '''${RUNS ? ", and the words of a run whose every word reads its own at the place, each reading its own" : ""}${NAMES ? ", and at a place that is not a name, the lines name rows alone carried, each moved off them" : ""}`, !failed.length && pages.length > 0 && !s1.length && !expected.length,''')
rep('''${shipSaid.length ? ` · ${shipSaid.join(", ")}, each as owed` : ""}${kindsSaid}''', '''${shipSaid.length ? ` · ${shipSaid.join(", ")}, each as owed` : ""}${kindsSaid}${NAMES ? ` · ${namesMoved} line(s) the names gate moved, each as owed` : ""}''')
rep('''no pill gained, the same reading pressed" : ""}`, !failed.length && cardsCompared > 0 && !s2.length,''', '''no pill gained, the same reading pressed" : ""}${NAMES ? ", and at a place that is not a name, the pills name rows alone carried, held back and counted" : ""}`, !failed.length && cardsCompared > 0 && !s2.length,''')
rep('''each held back` : ""}${shipCards.length ?''', '''each held back` : ""}${NAMES ? ` · ${namesCards} card(s) lost ${namesPillsLost} pill(s) name rows alone carried, each held back by name` : ""}${shipCards.length ?''')
open(p, 'w', encoding='utf-8').write(t)
print('gate patched for names')
