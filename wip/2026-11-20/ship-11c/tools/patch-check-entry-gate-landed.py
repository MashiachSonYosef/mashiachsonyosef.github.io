# Ship 11c: tools/check-entry-gate-v1.mjs follows the tool: a row landed since the ledger (or a list) was read
# carries the facts its landing named, and is counted by them.
import sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:90])
    t = t.replace(old, new)

rep('''// The words are found in the data, never named.
//
// Run: node tools/check-entry-gate-v1.mjs''',
'''// A ROW LANDED SINCE CARRIES WHAT ITS LANDING GAVE IT (ship 11c). A landing
// names the entries its own source gives the row, and the row-strikes
// record keeps them with the row. Such a row has no line in a ledger or a
// list read before it landed: E3 and E4 count it by the numbers its landing
// named, E5 holds it to exactly those facts, and E2 and E16 let a row of a
// list's source that was landed since carry them.
// The words are found in the data, never named.
//
// Run: node tools/check-entry-gate-v1.mjs''')
# the lists' followers, asked only where a row needs one
rep('''const listFaults = [];       // E16: what the lists' pinned bytes and sources do not hold''',
'''const listFaults = [];       // E16: what the lists' pinned bytes and sources do not hold
const listFollowers = new Map();   // a list's pin entry -> the follower from the store it was read at (null where it cannot be opened)
const listFollowOf = (l) => {
  if (!listFollowers.has(l)) { let f = null; try { f = openFollower({ data: dirname(STORE), index, readAt: l.read_at_store_version }); } catch (e) { if (!(e instanceof FollowFault)) throw e; } listFollowers.set(l, f); }
  return listFollowers.get(l);
};
// whether a round landed a row of a list's source since its list was read
const landedSinceItsList = (l, k, row) => { const f = listFollowOf(l); return !!f && f.thenOf([k, row[0], String(row[3]), sha16Of(row[1])]).state === "landed after"; };''')
rep('''        if (lm) for (const key of Object.keys(mineOf(f) || {})) if (!lm.facts.includes(key)) faults.push(`${where}: ${key} on a row of a source whose list (${lm.name}) does not land it`);''',
    '''        if (lm) { const beyond = Object.keys(mineOf(f) || {}).filter((key) => !lm.facts.includes(key)); if (beyond.length && !landedSinceItsList(lm, k, row)) faults.push(`${where}: ${beyond.join(", ")} on a row of a source whose list (${lm.name}) does not land it, and no round landed the row since`); }''')
# E3: the rows with no number, less the landed rows that carry none
rep('''    if (t.rows_with_no_number !== sum("none") - (t.store_rows_with_no_line || 0)) faults.push(`totals.rows_with_no_number says ${t.rows_with_no_number} and a recount gives ${sum("none") - (t.store_rows_with_no_line || 0)}`);''',
    '''    const landedWithNone = (t.store_rows_with_no_line || 0) - (t.rows_landed_since_with_a_number || 0);   // a row landed since carries what its landing named
    if (t.rows_with_no_number !== sum("none") - landedWithNone) faults.push(`totals.rows_with_no_number says ${t.rows_with_no_number} and a recount gives ${sum("none") - landedWithNone}`);''')
# E4: a landed row counted by the numbers its landing named
rep('''  for (const l of LANDED) { const a = of2(l.name[2]); a.rows += 1; a.none += 1; }''',
    '''  for (const l of LANDED) { const a = of2(l.name[2]); a.rows += 1; a[classOf(Array.isArray(l.row) ? numbersOf(l.row) : [])] += 1; }''')
rep('''plus the rows
  // landed since (they carry none)''', '''plus the rows
  // landed since (each by the numbers its landing named)''')
# E5: a landed row carries exactly what its landing named
rep('''      if (follow.thenOf([k, Number(rank), m, sha]).state === "landed after") landedSince += got.length;''',
    '''      const then = follow.thenOf([k, Number(rank), m, sha]);
      if (then.state === "landed after") {
        landedSince += got.length;
        const named = JSON.stringify(Array.isArray(then.row) ? mineOf(factsOf(then.row)) : null);
        if (got.some((g) => g !== named)) { wrong += 1; if (faults.length < 6) faults.push(`${k} ${id}: a row landed since carries ${got[0]} and its landing named ${named}`); }
      }''')
# E16: a list's recount, with the landed rows of its sources
rep('''    if (st.store_rows_of_its_sources !== lt.rows || st.rows_carrying_an_entry !== lt.entry || st.rows_with_several_numbers !== lt.several)''',
    '''    const landedWith = st.rows_landed_since_carrying_their_landings_facts || 0;   // rows of its sources landed since, carrying their landing's facts
    if (st.store_rows_of_its_sources !== lt.rows || st.rows_carrying_an_entry + landedWith !== lt.entry || (!landedWith && st.rows_with_several_numbers !== lt.several))''')
rep('''        if (carried > wanted) { extra += carried - wanted; if (faults2.length < 6) faults2.push(`${k} ${id}: a row of the list's sources carries an entry no line gives it`); }''',
    '''        if (carried > wanted) {
          const [rank, mm, sha] = id.split(" ");
          if (followL.thenOf([k, Number(rank), mm, sha]).state === "landed after") continue;   // a row landed since carries what its landing named
          extra += carried - wanted; if (faults2.length < 6) faults2.push(`${k} ${id}: a row of the list's sources carries an entry no line gives it`);
        }''')
open(p, 'w', encoding='utf-8').write(t)
print('check patched: a row landed since carries what its landing gave it')
