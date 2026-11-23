#!/usr/bin/env python3
"""Ship 19, patch 03: the entry gate's check lets BDB's own entries stand on a row whose list lands them, and reads a
fact from the list beside another.

check-entry-gate-v1 E2 held BDB's own entries (b) to the rows of the second parting's source (BDB via Open
Scriptures), as it held STEP's letters to TAHOT's and TBESH's rows until ship 15. With relay v218 both entry lists land
b, each joined by the row's own pointed head form, so a row of a source whose list of the pin lands b may carry them;
every other law on b (a list of distinct entries) stands, and a row of a source no parting reads and no list lands b
on still may not carry them.

E16 learns the list beside another (facts_from): its pinned bytes, receipt and store are held as the list's own are,
the index's record of the list names it as the pin does, and, with the lists on this machine, each line of the list
beside must name the same row as the list's line at the same place, the facts each row carries being read from the
two as the pin entry says. Where the list beside is not on this machine, the second half is said and not judged.
23 November 2026.

Usage: python3 patch-19-03-entry-gate-b-on-a-list.py <reader dir>
"""
import sys
from pathlib import Path

R = Path(sys.argv[1])
p = R / "tools" / "check-entry-gate-v1.mjs"
t = p.read_text(encoding="utf-8")
MARK = "BDB's entries on a row of a source neither the parting reads nor a list of the pin lands them on"
if MARK in t:
    print("stands already:", p)
    sys.exit(0)

PAIRS = [
    # the law's words
    ("""//       parting's sources, or of a source whose list of the pin lands t
//       (relay v211: English Wiktionary's, its letters read from TBESH's own
//       columns, 22 November 2026); b a list of entries, on a row of the second
//       parting's only; opens an entry and the point of the numbered sense
""", """//       parting's sources, or of a source whose list of the pin lands t
//       (relay v211: English Wiktionary's, its letters read from TBESH's own
//       columns, 22 November 2026); b a list of entries, on a row of the second
//       parting's source, or of a source whose list of the pin lands b (relay
//       v218: both entry lists, BDB's own entries joined by the row's own
//       pointed head form, 23 November 2026); opens an entry and the point of the numbered sense
"""),
    ("""//       its pin entry names, its receipt names the store the pin says it was
//       read at, and its sources are the store's; a row of a list's source
""", """//       its pin entry names, its receipt names the store the pin says it was
//       read at, and its sources are the store's; a list beside it, from
//       which the pin entry reads a fact (facts_from: English Wiktionary's t
//       from relay v211's list beside relay v218's, since ship 19, 23 November
//       2026), is held the same way and was read at the same store, and with
//       both here each of its lines names the row the list's line at the same
//       place names, the row carrying that fact as the list beside gives it;
//       a row of a list's source
"""),
    # E2
    ("""        if (Array.isArray(f.b) && FACT_OF.get(m) !== "b") faults.push(`${where}: BDB's entries on a row of a source the parting does not read`);""",
     """        if (Array.isArray(f.b) && FACT_OF.get(m) !== "b" && !(((LIST_M.get(m) || {}).facts) || []).includes("b")) faults.push(`${where}: BDB's entries on a row of a source neither the parting reads nor a list of the pin lands them on`);"""),
    # E1's list half: a list beside is pinned bytes, read at the same store, of as many lines
    ("""        if (!receipt.includes(l.list.sha256)) listFaults.push(`the receipt of ${said} does not name the list the pin names`);
      } catch (e) { if (e instanceof PinFault) listFaults.push(e.message); else throw e; }
""", """        if (!receipt.includes(l.list.sha256)) listFaults.push(`the receipt of ${said} does not name the list the pin names`);
      } catch (e) { if (e instanceof PinFault) listFaults.push(e.message); else throw e; }
      // a fact read from a list beside this one (facts_from; ship 19, 23 November 2026)
      for (const [f, o] of Object.entries(l.facts_from || {})) {
        const besideSaid = `the list beside ${said} for ${f} (relay ${(o || {}).relay})`;
        if (!l.facts.includes(f) || !o || !o.relay || !o.folder || !o.rule || !o.receipt || !o.list || o.read_at_store_version !== l.read_at_store_version || o.list.lines !== l.list.lines) { listFaults.push(`${besideSaid} does not name its relay, folder, rule, receipt and list, or was read at another store, or holds another count of lines, or ${f} is not a fact the entry lands`); continue; }
        try {
          readPinned(join(PINS, o.folder, o.rule.file), o.rule, `${o.folder}/${o.rule.file}`);
          const theirReceipt = readPinned(join(PINS, o.folder, o.receipt.file), o.receipt, `${o.folder}/${o.receipt.file}`).toString("utf8");
          if (!theirReceipt.includes(`"${o.read_at_store_version}"`)) listFaults.push(`the receipt of ${besideSaid} does not name ${o.read_at_store_version}, the store the pin says it was read at`);
          if (!theirReceipt.includes(o.list.sha256)) listFaults.push(`the receipt of ${besideSaid} does not name the list the pin names`);
        } catch (e) { if (e instanceof PinFault) listFaults.push(e.message); else throw e; }
      }
"""),
    # E16: the index's record names the list beside as the pin does
    ("""|| !same(s.facts_landed, l.facts) || !same(s.sources, l.sources) ||""",
     """|| !same(s.facts_landed, l.facts) || !same(s.facts_from || null, besideOf(l)) || !same(s.sources, l.sources) ||"""),
    ("""  const told = [];
  for (const [i, l] of pin.lists.entries()) {
""", """  const told = [];
  // the index's record of the lists beside a list, as the entries tool writes it from the pin
  const besideOf = (l) => (l.facts_from ? Object.fromEntries(Object.entries(l.facts_from).map(([f, o]) => [f, { relay: o.relay, list: { file: o.list.file, bytes: o.list.bytes, sha256: o.list.sha256, lines: o.list.lines, kept: o.list.kept }, read_at_store_version: o.read_at_store_version }])) : null);
  const besideWords = (l) => (l.facts_from ? ` (${Object.entries(l.facts_from).map(([f, o]) => `${f} from relay ${o.relay}'s list beside it`).join(", ")})` : "");
  for (const [i, l] of pin.lists.entries()) {
"""),
    ("""rows of ${Object.keys(l.sources).length} source(s) carry ${l.facts.join(", ")}`);""",
     """rows of ${Object.keys(l.sources).length} source(s) carry ${l.facts.join(", ")}${besideWords(l)}`);"""),
    # E16's second half: the lists beside, line for line
    ("""  for (const l of pin.lists) {
    const inTree = join(PINS, l.folder, l.list.file);
    const bytes = named.get(l.list.sha256) || (existsSync(inTree) && sha256(readFileSync(inTree)) === l.list.sha256 ? readFileSync(inTree) : null);
    if (!bytes) { console.log(`  --  E16's second half was not judged here for "${l.name}": its list (${l.list.file}) is not on this machine (--list <file>, or ROW_ENTRIES_LISTS)`); continue; }
""", """  // a list's bytes: named, or kept in this tree in the folder its pin entry gives
  const bytesOf = (folder, x) => { const inTree = join(PINS, folder, x.file); return named.get(x.sha256) || (existsSync(inTree) && sha256(readFileSync(inTree)) === x.sha256 ? readFileSync(inTree) : null); };
  for (const l of pin.lists) {
    const bytes = bytesOf(l.folder, l.list);
    if (!bytes) { console.log(`  --  E16's second half was not judged here for "${l.name}": its list (${l.list.file}) is not on this machine (--list <file>, or ROW_ENTRIES_LISTS)`); continue; }
    // the lists beside it (facts_from), each the bytes its pin names
    const beside = Object.entries(l.facts_from || {}).map(([f, o]) => ({ f, o, bytes: bytesOf(o.folder, o.list) }));
    if (beside.some((x) => !x.bytes)) { console.log(`  --  E16's second half was not judged here for "${l.name}": the list beside it for ${beside.filter((x) => !x.bytes).map((x) => `${x.f} (${x.o.list.file})`).join(", ")} is not on this machine (--list <file>, or ROW_ENTRIES_LISTS)`); continue; }
"""),
    ("""      const followL = openFollower({ data: dirname(STORE), index, readAt: l.read_at_store_version });
      const othersOf = (f) => { const o = { ...(f || {}) }; for (const k of ["n", "t", "b"]) delete o[k]; return o; };
""", """      const followL = openFollower({ data: dirname(STORE), index, readAt: l.read_at_store_version });
      const othersOf = (f) => { const o = { ...(f || {}) }; for (const k of ["n", "t", "b"]) delete o[k]; return o; };
      const besideLines = beside.map((x) => {
        if (x.bytes.length !== x.o.list.bytes) throw new PinFault(`${x.o.list.file} is ${x.bytes.length} bytes and its pin says ${x.o.list.bytes}`);
        const besideText = x.bytes.toString("utf8");
        if (!besideText.endsWith("\\n")) throw new PinFault(`${x.o.list.file} does not end in a line end`);
        const [h2, ...b2] = besideText.slice(0, -1).split("\\n");
        const c2 = h2.split("\\t");
        const y = { ...x, body: b2, cols: c2, iS: c2.indexOf("sha16"), iT: c2.indexOf("route_text"), iN: c2.indexOf("facts_now"), iF: c2.findIndex((c) => /^facts_under_/u.test(c)) };
        if (c2[0] !== "key" || c2[1] !== "rank" || c2[2] !== "m_id" || y.iT < 0 || y.iN < 0 || y.iF < 0) throw new PinFault(`${x.o.list.file} opens with another header: ${c2.join(" | ")}`);
        if (b2.length !== body.length) throw new PinFault(`${x.o.list.file} holds ${b2.length} lines and ${l.list.file}, beside which it stands, ${body.length}`);
        return y;
      });
"""),
    ("""        if (!same(othersOf(was), othersOf(under))) faults2.push(`${where}: changes a fact the tool does not write`);
        const facts = {};
        for (const key of ["n", "t", "b"]) if (l.facts.includes(key) && Array.isArray(under[key]) && under[key].length) facts[key] = under[key];
""", """        if (!same(othersOf(was), othersOf(under))) faults2.push(`${where}: changes a fact the tool does not write`);
        // a fact read from the list beside: its line at the same place names the same row, or nothing is read
        const fromBeside = {};
        let elsewhere = false;
        for (const y of besideLines) {
          const d = y.body[i].split("\\t");
          if (d.length !== y.cols.length || d[0] !== c[0] || d[1] !== c[1] || d[2] !== c[2] || d[y.iT] !== c[iT] || (y.iS >= 0 && iS >= 0 && d[y.iS] !== c[iS])) { elsewhere = true; if (faults2.length < 6) faults2.push(`${y.o.list.file} line ${i + 2} names another row than ${where}`); continue; }
          const u2 = JSON.parse(d[y.iF]);
          if (!same(othersOf(JSON.parse(d[y.iN])), othersOf(u2))) faults2.push(`${y.o.list.file} line ${i + 2}: changes a fact the tool does not write`);
          fromBeside[y.f] = u2;
        }
        if (elsewhere) continue;
        const facts = {};
        for (const key of ["n", "t", "b"]) { const from = key in fromBeside ? fromBeside[key] : under; if (l.facts.includes(key) && Array.isArray(from[key]) && from[key].length) facts[key] = from[key]; }
"""),
    ("""`${nf(lines)} lines of ${l.list.file} · ${nf(give)} give ${l.facts.join(", ")}, each met""",
     """`${nf(lines)} lines of ${l.list.file}${beside.map((x) => ` and of ${x.o.list.file} beside it, line for line the same rows`).join("")} · ${nf(give)} give ${l.facts.join(", ")}${besideWords(l)}, each met"""),
]
for old, new in PAIRS:
    assert t.count(old) == 1, (t.count(old), old[:100])
    t = t.replace(old, new)
assert MARK in t
p.write_text(t, encoding="utf-8")
print("patched", p)
