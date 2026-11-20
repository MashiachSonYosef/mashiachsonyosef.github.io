# Ship 11b, the second half of the patch to tools/apply-row-entries-v1.mjs: what the run says, refuses and records
# of the struck lines kept beside the ledger and of the lists.
import sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:90])
    t = t.replace(old, new)

rep('''const followed = { ...followedRecord(follow, { left: goneLines, rekeyed: rekeyedLines, retexted: retextedLines, landed: landedRows }),
  struck_rows_with_a_twin_of_their_own_source: struckWithATwin, entries_given_to_a_twin: given };
const moved = sum("rows_moved"), shardsRewritten = touched.length;''',
'''const followed = { ...followedRecord(follow, { left: goneLines, rekeyed: rekeyedLines, retexted: retextedLines, landed: landedRows }),
  ...(pin.struck_lines ? { lines_of_rows_struck_before_the_ledger_was_read: { file: `${HOME}/${pin.folder}/${pin.struck_lines.file}`, sha256: pin.struck_lines.sha256, lines: struckBefore.length, by_list: struckBeforeBy } } : {}),
  struck_rows_with_a_twin_of_their_own_source: struckWithATwin, entries_given_to_a_twin: given };
// what each list gave, as the walk found it, and what of it the record does not explain
const count = (o) => Object.values(o || {}).reduce((a, c) => a + c, 0);
const lists = listRuns.map((run) => {
  const l = run.l, lt = listTally.get(l), gone = {};
  for (const g of run.gone) gone[g.by.list] = (gone[g.by.list] || 0) + 1;
  return { name: l.name, relay: l.relay, letter: l.letter, from: l.from, rule: `${HOME}/${l.folder}/${l.rule.file}`, receipt: `${HOME}/${l.folder}/${l.receipt.file}`,
    list: { file: l.list.file, bytes: l.list.bytes, sha256: l.list.sha256, lines: l.list.lines, kept: l.list.kept }, read_at_store_version: l.read_at_store_version,
    facts_landed: l.facts, sources: l.sources,
    totals: { sources: Object.keys(l.sources).length, lines: run.lines, lines_whose_row_was_struck_or_withheld_since: gone, store_rows_of_its_sources: lt.store_rows_of_its_sources,
      rows_carrying_an_entry: lt.rows_carrying_an_entry, rows_with_several_numbers: lt.rows_with_several_numbers, rows_of_its_sources_with_no_line: lt.store_rows_of_its_sources - lt.lines_met,
      lines_whose_facts_are_not_landed: run.lines - run.gone.length - lt.rows_carrying_an_entry, facts_not_landed: run.facts_not_landed } };
});
const listLinesWithNoRow = listRuns.map((run) => run.lines - run.gone.length - listTally.get(run.l).lines_met);
const listMoved = [...listTally.values()].reduce((a, lt) => a + lt.rows_moved, 0);
const moved = sum("rows_moved") + listMoved, shardsRewritten = touched.length;''')

rep('''for (const g of given) console.log(`  given: the row of ${g.from[2]} at rank ${g.from[1]} (${g.from[3]}), struck by ${g.struck_by}, gives ${JSON.stringify(g.gave)} to its twin at rank ${g.to[1]} under the key its words still stand under`);''',
'''for (const g of given) console.log(`  given: the row of ${g.from[2]} at rank ${g.from[1]} (${g.from[3]}), struck by ${g.struck_by}, gives ${JSON.stringify(g.gave)} to its twin at rank ${g.to[1]} under the key its words still stand under`);
if (pin.struck_lines) console.log(`  the lines of ${n(struckBefore.length)} rows struck before the ledger was read are kept beside it (${Object.entries(struckBeforeBy).map(([list, c]) => `${n(c)} by ${list}`).join(", ")}); the twins above are found among them`);
for (const [i, x] of lists.entries()) console.log(`  list · ${x.name} (relay ${x.relay}) · ${n(x.totals.lines)} lines of ${x.totals.sources} source(s), read from the store at ${x.read_at_store_version} · lands ${x.facts_landed.join(", ")} · ${n(x.totals.rows_carrying_an_entry)} rows carry an entry (${n(x.totals.rows_with_several_numbers)} several numbers) of ${n(x.totals.store_rows_of_its_sources)} rows of its sources · not landed: ${Object.entries(x.totals.facts_not_landed).map(([k, c]) => `${k} on ${n(c)} lines`).join(", ") || "nothing"}${x.totals.lines_whose_facts_are_not_landed ? ` (${n(x.totals.lines_whose_facts_are_not_landed)} lines give nothing that lands)` : ""}${count(x.totals.lines_whose_row_was_struck_or_withheld_since) ? ` · ${n(count(x.totals.lines_whose_row_was_struck_or_withheld_since))} lines name a row a round took since` : ""} · unexplained: ${n(listLinesWithNoRow[i])} lines with no row · ${n(listTally.get(listRuns[i].l).rows_moved)} rows move`);
if (listLinesWithNoRow.some(Boolean)) refuse(`${listLinesWithNoRow.reduce((a, c) => a + c, 0)} line(s) of the pin's lists find no row that no round struck, withheld or moved since their list was read. The record does not explain them, and nothing is guessed`);''')

rep('''  partings: (pin.partings || []).map((p) => ({ name: p.name, fact: p.fact, sources: p.sources })), totals, followed };''',
'''  partings: (pin.partings || []).map((p) => ({ name: p.name, fact: p.fact, sources: p.sources })), totals, followed, ...(lists.length ? { lists } : {}) };''')
rep('''const nothingToWrite = !moved && !!had && Object.keys(record).every((k) => same(had[k], record[k]));
// the run's figures, one line of JSON, for a script that holds a run to what was rehearsed
const count = (o) => Object.values(o || {}).reduce((a, c) => a + c, 0);''',
'''const nothingToWrite = !moved && !!had && Object.keys(record).every((k) => same(had[k], record[k])) && !("lists" in had && !lists.length);
// the run's figures, one line of JSON, for a script that holds a run to what was rehearsed''')
rep('''  struck_rows_with_a_twin_of_their_own_source: struckWithATwin, entries_given_to_a_twin: given.length, rows_moved: moved, shards_moved: touched.length, the_index_names_this_run: nothingToWrite })}`);''',
'''  struck_rows_with_a_twin_of_their_own_source: struckWithATwin, entries_given_to_a_twin: given.length,
  ...(pin.struck_lines ? { lines_of_rows_struck_before_the_ledger_was_read: struckBefore.length } : {}),
  ...(lists.length ? { lists: lists.map((x) => ({ relay: x.relay, list_sha256: x.list.sha256, lines: x.totals.lines, rows_carrying_an_entry: x.totals.rows_carrying_an_entry, facts_not_landed: x.totals.facts_not_landed })), list_rows_moved: listMoved } : {}),
  rows_moved: moved, shards_moved: touched.length, the_index_names_this_run: nothingToWrite })}`);''')
rep('''The texts are the served bytes, unchanged. At a place the gate reads these against the tag of the word's core piece";''',
'''The texts are the served bytes, unchanged. At a place the gate reads these against the tag of the word's core piece. A row of a further source named by a list of the pin (lists) carries n as its line gives it: the numbers of the Bible dictionaries' entries its own pointed head form and kind of word meet, joined by the corpus lane";''')
rep('''{ ran_at: on, store_version: { was, now }, followed, shards_rewritten: shardsRewritten, rows_moved: moved, totals, sources }] }, null, 1) + "\\n");''',
'''{ ran_at: on, store_version: { was, now }, followed, shards_rewritten: shardsRewritten, rows_moved: moved, totals, sources, ...(lists.length ? { lists } : {}) }] }, null, 1) + "\\n");''')
open(p, 'w', encoding='utf-8').write(t)
print('patched part 2')
