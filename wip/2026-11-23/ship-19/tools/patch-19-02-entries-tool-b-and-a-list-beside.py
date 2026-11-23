#!/usr/bin/env python3
"""Ship 19, patch 02: the entries tool lands BDB's own entries from a list, and reads a fact from a list beside another.

Relay v218 reissues the two entry lists, and BDB's own entries (b) land from them (patch 01 says why). The tool already
writes any fact a list's pin entry lands; its words said b from a list is counted and not written, and they now say
it lands. English Wiktionary's facts now come from two reissues of v203's list: n and b from v218's, t from v211's.
So a pin entry may name, under facts_from, another list for a fact: it is read only if it is the bytes named and was
read at the same store, and it must name the same rows line for line (key, rank, m id, sha16 where both give it,
route text), or the run is refused, since a fact read from a line of another row would be laid on the wrong row. The
index's record of each list names the list beside it, and the figures do. 23 November 2026.

Usage: python3 patch-19-02-entries-tool-b-and-a-list-beside.py <reader dir>
"""
import sys
from pathlib import Path

R = Path(sys.argv[1])
p = R / "tools" / "apply-row-entries-v1.mjs"
t = p.read_text(encoding="utf-8")
MARK = "A FACT READ FROM A LIST BESIDE ANOTHER"
if MARK in t:
    print("stands already:", p)
    sys.exit(0)

PAIRS = [
    ("""// entry names. Of a list's facts only those its pin entry lands (facts) are written: the numbers (n), which the gate
// itself reads, and, where the pin entry says so, STEP's letters (t: English Wiktionary's list since relay v211, whose
// letters TBESH's own columns tie so that none holds back a letter of the same word). STEP's letters and BDB's own
// entries are the two partings of ruling 6; a fact a list gives and its pin entry does not land is counted
// (facts_not_landed) and not written. A row of a list's source
""", """// entry names. Of a list's facts only those its pin entry lands (facts) are written: the numbers (n), which the gate
// itself reads, and, where the pin entry says so, STEP's letters (t: English Wiktionary's list since relay v211, whose
// letters TBESH's own columns tie so that none holds back a letter of the same word) and BDB's own entries (b: both
// lists since relay v218, 23 November 2026, which reissues them with the two answers of relay v212 after counting
// what b on a joined row does to BDB's own rows at a place). STEP's letters and BDB's own entries are the two
// partings of ruling 6; a fact a list gives and its pin entry does not land is counted (facts_not_landed) and not
// written.
//
// A FACT READ FROM A LIST BESIDE ANOTHER (facts_from; ship 19, 23 November 2026). English Wiktionary's list has two
// reissues of relay v203's: v211's widens t and v218's changes n and b, each keeping v203's lines, order and keys.
// The pin entry names v218's as its list and v211's under facts_from for t, so t is read from v211's line and n and b
// from v218's. The list beside is read only if it is the bytes its pin names (named with --list too) and was read at
// the same store, and each of its lines must name the same row as the list's line at the same place: key, rank, m id,
// sha16 where both give it, and route text. Otherwise the run is refused, since a fact read from another row's line
// would be laid on the wrong row. A fact a list gives that is read from the list beside instead is counted
// (facts_read_from_the_list_beside), not written from the list. A row of a list's source
"""),
    # the pin's lists: a list beside is pinned bytes, read at the same store, of as many lines
    ("""    if (bytes.length !== l.list.bytes) throw new PinFault(`${l.list.file} is ${bytes.length} bytes and its pin says ${l.list.bytes}`);
  }
  if (listBytes.size !== (pin.lists || []).length) throw new PinFault(`${listBytes.size} file(s) are named with --list and the pin names ${(pin.lists || []).length} list(s): a --list names bytes no list of the pin names, or one twice`);
""", """    if (bytes.length !== l.list.bytes) throw new PinFault(`${l.list.file} is ${bytes.length} bytes and its pin says ${l.list.bytes}`);
    for (const [f, o] of Object.entries(l.facts_from || {})) {
      if (!l.facts.includes(f) || !o || !o.relay || !o.folder || !o.rule || !o.receipt || !o.list || o.read_at_store_version !== l.read_at_store_version)
        throw new PinFault(`the list "${l.name}" reads ${f} from a list beside it that does not name its relay, folder, rule, receipt and list, or that was read at another store, or ${f} is not a fact the entry lands`);
      readPinned(join(PINS, o.folder, o.rule.file), o.rule, `${o.folder}/${o.rule.file}`);
      const theirReceipt = readPinned(join(PINS, o.folder, o.receipt.file), o.receipt, `${o.folder}/${o.receipt.file}`).toString("utf8");
      if (!theirReceipt.includes(`"${o.read_at_store_version}"`)) throw new PinFault(`the receipt of the list beside "${l.name}" (relay ${o.relay}) does not name ${o.read_at_store_version}`);
      const besideBytes = listBytes.get(o.list.sha256);
      if (!besideBytes) throw new PinFault(`the pin names the list ${o.list.file} (${l.name}'s ${f}, relay ${o.relay}) and no --list names those bytes: a run without it would take its ${f} off the rows`);
      if (besideBytes.length !== o.list.bytes) throw new PinFault(`${o.list.file} is ${besideBytes.length} bytes and its pin says ${o.list.bytes}`);
      if (o.list.lines !== l.list.lines) throw new PinFault(`${o.list.file} holds ${o.list.lines} lines and ${l.list.file}, beside which it stands, ${l.list.lines}: the two cannot name the same rows line for line`);
    }
  }
  const pinnedLists = new Set((pin.lists || []).flatMap((l) => [l.list.sha256, ...Object.values(l.facts_from || {}).map((o) => o.list.sha256)]));
  if (listBytes.size !== pinnedLists.size) throw new PinFault(`${listBytes.size} file(s) are named with --list and the pin names ${pinnedLists.size} list(s): a --list names bytes no list of the pin names, or one twice`);
"""),
    # reading a list: the lists beside it, line for line
    ("""  const run = { l, lines: body.length, gone: [], facts_not_landed: {}, by_m: {} };
  for (const [i, line] of body.entries()) {
    const c = line.split("\\t"), where = `${l.list.file} line ${i + 2}`;
    if (c.length !== cols.length) refuse(`${where} holds ${c.length} fields`);
    const m = c[2], rank = Number(c[1]);
    if (LIST_OF.get(m) !== l) refuse(`${where} names a row of ${m}, which its pin entry does not read`);
    if (!Number.isInteger(rank)) refuse(`${where}: its rank is not a number`);
    const sha = sha256(Buffer.from(c[iT], "utf8")).slice(0, 16);
    if (iS >= 0 && c[iS] !== sha) refuse(`${where}: its sha16 is not its route text's`);
    let under = null;
    try { under = JSON.parse(c[iF]); } catch { refuse(`${where}: its facts are not JSON`); }
    const facts = {};
    for (const key of MINE) {
      if (!(key in under)) continue;
      if (!Array.isArray(under[key]) || !under[key].length || under[key].some((y) => typeof y !== "string" || !y)) refuse(`${where}: ${key} is not a list of entries`);
      if (l.facts.includes(key)) facts[key] = under[key];
      else run.facts_not_landed[key] = (run.facts_not_landed[key] || 0) + 1;
    }
""", """  const run = { l, lines: body.length, gone: [], facts_not_landed: {}, facts_read_from_the_list_beside: {}, by_m: {} };
  // the lists beside this one (facts_from): each read whole, line for line beside it
  const beside = Object.entries(l.facts_from || {}).map(([f, o]) => {
    const besideText = listBytes.get(o.list.sha256).toString("utf8");
    if (!besideText.endsWith("\\n")) refuse(`${o.list.file} does not end in a line end`);
    const [h2, ...b2] = besideText.slice(0, -1).split("\\n");
    const c2 = h2.split("\\t");
    const x = { f, o, body: b2, cols: c2, iS: c2.indexOf("sha16"), iT: c2.indexOf("route_text"), iF: c2.findIndex((c) => /^facts_under_/u.test(c)) };
    if (c2[0] !== "key" || c2[1] !== "rank" || c2[2] !== "m_id" || x.iT < 0 || x.iF < 0) refuse(`${o.list.file} opens with another header: ${c2.join(" | ")}`);
    if (b2.length !== body.length) refuse(`${o.list.file} holds ${b2.length} lines and ${l.list.file}, beside which it stands, ${body.length}`);
    return x;
  });
  for (const [i, line] of body.entries()) {
    const c = line.split("\\t"), where = `${l.list.file} line ${i + 2}`;
    if (c.length !== cols.length) refuse(`${where} holds ${c.length} fields`);
    const m = c[2], rank = Number(c[1]);
    if (LIST_OF.get(m) !== l) refuse(`${where} names a row of ${m}, which its pin entry does not read`);
    if (!Number.isInteger(rank)) refuse(`${where}: its rank is not a number`);
    const sha = sha256(Buffer.from(c[iT], "utf8")).slice(0, 16);
    if (iS >= 0 && c[iS] !== sha) refuse(`${where}: its sha16 is not its route text's`);
    let under = null;
    try { under = JSON.parse(c[iF]); } catch { refuse(`${where}: its facts are not JSON`); }
    // a fact read from the list beside: its line at the same place must name the same row
    const fromBeside = {};
    for (const x of beside) {
      const d = x.body[i].split("\\t"), there = `${x.o.list.file} line ${i + 2}`;
      if (d.length !== x.cols.length) refuse(`${there} holds ${d.length} fields`);
      if (d[0] !== c[0] || d[1] !== c[1] || d[2] !== c[2] || d[x.iT] !== c[iT] || (x.iS >= 0 && iS >= 0 && d[x.iS] !== c[iS])) refuse(`${there} names another row than ${where}: a list beside another must name the same rows line for line, or its ${x.f} would be laid on the wrong row`);
      try { fromBeside[x.f] = JSON.parse(d[x.iF]); } catch { refuse(`${there}: its facts are not JSON`); }
    }
    const facts = {};
    for (const key of MINE) {
      const said = key in fromBeside ? fromBeside[key] : under;
      if (key in fromBeside && key in under) run.facts_read_from_the_list_beside[key] = (run.facts_read_from_the_list_beside[key] || 0) + 1;
      if (!(key in said)) continue;
      if (!Array.isArray(said[key]) || !said[key].length || said[key].some((y) => typeof y !== "string" || !y)) refuse(`${key in fromBeside ? `${l.facts_from[key].list.file} line ${i + 2}` : where}: ${key} is not a list of entries`);
      if (l.facts.includes(key)) facts[key] = said[key];
      else run.facts_not_landed[key] = (run.facts_not_landed[key] || 0) + 1;
    }
"""),
    # the index's record of each list names the list beside it
    ("""    list: { file: l.list.file, bytes: l.list.bytes, sha256: l.list.sha256, lines: l.list.lines, kept: l.list.kept }, read_at_store_version: l.read_at_store_version,
    facts_landed: l.facts, sources: l.sources,
""", """    list: { file: l.list.file, bytes: l.list.bytes, sha256: l.list.sha256, lines: l.list.lines, kept: l.list.kept }, read_at_store_version: l.read_at_store_version,
    facts_landed: l.facts, sources: l.sources,
    ...(l.facts_from ? { facts_from: Object.fromEntries(Object.entries(l.facts_from).map(([f, o]) => [f, { relay: o.relay, list: { file: o.list.file, bytes: o.list.bytes, sha256: o.list.sha256, lines: o.list.lines, kept: o.list.kept }, read_at_store_version: o.read_at_store_version }])) } : {}),
"""),
    ("""      lines_whose_facts_are_not_landed: run.lines - run.gone.length - lt.rows_carrying_an_entry, facts_not_landed: run.facts_not_landed } };
""", """      lines_whose_facts_are_not_landed: run.lines - run.gone.length - lt.rows_carrying_an_entry, facts_not_landed: run.facts_not_landed,
      ...(Object.keys(run.facts_read_from_the_list_beside).length ? { facts_read_from_the_list_beside: run.facts_read_from_the_list_beside } : {}) } };
"""),
    ("""· lands ${x.facts_landed.join(", ")} · ${n(x.totals.rows_carrying_an_entry)} rows carry""",
     """· lands ${x.facts_landed.join(", ")}${x.facts_from ? ` (${Object.entries(x.facts_from).map(([f, o]) => `${f} from the list beside it, relay ${o.relay}, read on ${n(x.totals.facts_read_from_the_list_beside ? x.totals.facts_read_from_the_list_beside[f] || 0 : 0)} lines in place of this list's`).join("; ")})` : ""} · ${n(x.totals.rows_carrying_an_entry)} rows carry"""),
    ("""lists: lists.map((x) => ({ relay: x.relay, list_sha256: x.list.sha256, lines: x.totals.lines,""",
     """lists: lists.map((x) => ({ relay: x.relay, list_sha256: x.list.sha256, ...(x.facts_from ? { facts_from: Object.fromEntries(Object.entries(x.facts_from).map(([f, o]) => [f, o.list.sha256])) } : {}), lines: x.totals.lines,"""),
    ("""A row of a further source named by a list of the pin (lists) carries n as its line gives it: the numbers of the Bible dictionaries' entries its own pointed head form and kind of word meet, joined by the corpus lane";""",
     """A row of a further source named by a list of the pin (lists) carries, as its line gives them, the facts its pin entry lands: n, the numbers of the Bible dictionaries' entries its own pointed head form and kind of word meet, joined by the corpus lane; t, STEP's letters of those entries; b, BDB's own entries among them. A fact may be read from a list beside the list, which names the same rows line for line (facts_from)";"""),
]
for old, new in PAIRS:
    assert t.count(old) == 1, (t.count(old), old[:100])
    t = t.replace(old, new)
assert MARK in t
p.write_text(t, encoding="utf-8")
print("patched", p)
