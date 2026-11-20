# Ship 11c: tools/apply-row-entries-v1.mjs leaves a landed row's entries to its landing. A row a round landed since
# the ledger (or a list) was read has no line; it carries the facts its own landing line named, as the row-strikes
# record keeps them with the row, and is counted so.
import sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:90])
    t = t.replace(old, new)

rep('''// Idempotent: a second run moves nothing and writes nothing. --dry prints''',
'''// A ROW LANDED SINCE CARRIES WHAT ITS LANDING GAVE IT (ship 11c, the corpus lane's v200, v201 and v202). A landing
// list names, for each row it lands, the entries its own source gives the row, and tools/strike-rows-v1.mjs writes
// them onto the row and into the row-strikes record. Such a row has no line in a ledger or a list read before it
// landed. It was given nothing here until now, which took its entries off again. It now carries exactly the facts
// its landing named (n, t, b), read from the record through the follower, and is counted
// (rows_landed_since_carrying_their_landings_facts); a row landed with none still carries none.
//
// Idempotent: a second run moves nothing and writes nothing. --dry prints''')
rep('''        const want = met ? list[at] : null;
        if (met) { taken.set(`${k}\\u0001${id}`, at + 1); linesMet += 1; }
        else {
          // a row with no line: one a round landed since the ledger was read, or one the record does not explain
          const then = follow.thenOf([k, row[0], m, sha]);
          if (then.state === "landed after") { landedRows.push(then); t.rows_landed_since_with_no_line = (t.rows_landed_since_with_no_line || 0) + 1; }
          else { if (noLine.length < 12) noLine.push(`${name} ${k} (${m}, rank ${row[0]}) «${String(row[1]).slice(0, 50)}»`); t.rows_with_no_line = (t.rows_with_no_line || 0) + 1; }
        }
        if (met) { if (want && want.n) { t.rows_with_a_number += 1; if (want.n.length > 1) t.rows_with_several_numbers += 1; } else t.rows_with_no_number += 1; }''',
'''        let want = met ? list[at] : null;
        if (met) { taken.set(`${k}\\u0001${id}`, at + 1); linesMet += 1; }
        else {
          // a row with no line: one a round landed since the ledger was read, or one the record does not explain
          const then = follow.thenOf([k, row[0], m, sha]);
          if (then.state === "landed after") {
            landedRows.push(then); t.rows_landed_since_with_no_line = (t.rows_landed_since_with_no_line || 0) + 1;
            // it carries what its landing gave it
            want = Array.isArray(then.row) ? mineOf(then.row) : null;
            if (want) t.rows_landed_since_carrying_their_landings_facts = (t.rows_landed_since_carrying_their_landings_facts || 0) + 1;
            if (want && want.n) t.rows_landed_since_with_a_number = (t.rows_landed_since_with_a_number || 0) + 1;
          }
          else { if (noLine.length < 12) noLine.push(`${name} ${k} (${m}, rank ${row[0]}) «${String(row[1]).slice(0, 50)}»`); t.rows_with_no_line = (t.rows_with_no_line || 0) + 1; }
        }
        if (want && want.n) { t.rows_with_a_number += 1; if (want.n.length > 1) t.rows_with_several_numbers += 1; } else if (met) t.rows_with_no_number += 1;''')
# a list's source: a row landed since the list was read
rep('''    const want = met ? list[at] : null;
    if (want) { lt.rows_carrying_an_entry += 1; if (want.n && want.n.length > 1) lt.rows_with_several_numbers += 1; }
    return { lt, want };''',
'''    let want = met ? list[at] : null;
    if (!met) {
      // no line: where a round landed the row since the list was read, it carries what its landing gave it
      const [rank, , sha] = id.split(" ");
      const then = listFollow.get(l).thenOf([k, Number(rank), m, sha]);
      if (then.state === "landed after") { lt.rows_landed_since_with_no_line = (lt.rows_landed_since_with_no_line || 0) + 1; want = Array.isArray(then.row) ? mineOf(then.row) : null; if (want) { lt.rows_landed_since_carrying_their_landings_facts = (lt.rows_landed_since_carrying_their_landings_facts || 0) + 1; return { lt, want, landed: true }; } }
    }
    if (want) { lt.rows_carrying_an_entry += 1; if (want.n && want.n.length > 1) lt.rows_with_several_numbers += 1; }
    return { lt, want };''')
rep('''  const followL = following(() => openFollower({ data: dirname(STORE), index, readAt: l.read_at_store_version }));''',
    '''  const followL = following(() => openFollower({ data: dirname(STORE), index, readAt: l.read_at_store_version }));
  listFollow.set(l, followL);''')
rep('''const listRuns = [];          // per list, in the pin's order: what it gave''', '''const listRuns = [];          // per list, in the pin's order: what it gave
const listFollow = new Map(); // a list's pin entry -> the follower from the store it was read at''')
# the ledger branch: a source read by both, the list's line or the landing's facts
rep('''        const give = got && got.want ? got.want : want;''', '''        const give = got && got.want && !got.landed ? got.want : want;''')
rep('''        if (got && got.want) got.lt.rows_moved += 1; else t.rows_moved += 1;''', '''        if (got && got.want && !got.landed) got.lt.rows_moved += 1; else t.rows_moved += 1;''')
# the totals
rep('''  store_rows_with_no_line: landedRows.length, ledger_rows_with_no_store_row: goneLines.length };''',
    '''  store_rows_with_no_line: landedRows.length, ledger_rows_with_no_store_row: goneLines.length,
  ...(sum("rows_landed_since_carrying_their_landings_facts") ? { rows_landed_since_carrying_their_landings_facts: sum("rows_landed_since_carrying_their_landings_facts"), rows_landed_since_with_a_number: sum("rows_landed_since_with_a_number") } : {}) };''')
rep('''      rows_carrying_an_entry: lt.rows_carrying_an_entry, rows_with_several_numbers: lt.rows_with_several_numbers, rows_of_its_sources_with_no_line: lt.store_rows_of_its_sources - lt.lines_met,''',
    '''      rows_carrying_an_entry: lt.rows_carrying_an_entry, rows_with_several_numbers: lt.rows_with_several_numbers, rows_of_its_sources_with_no_line: lt.store_rows_of_its_sources - lt.lines_met,
      ...(lt.rows_landed_since_with_no_line ? { rows_landed_since_with_no_line: lt.rows_landed_since_with_no_line, rows_landed_since_carrying_their_landings_facts: lt.rows_landed_since_carrying_their_landings_facts || 0 } : {}),''')
open(p, 'w', encoding='utf-8').write(t)
print('entries tool patched: a row landed since carries what its landing gave it')
