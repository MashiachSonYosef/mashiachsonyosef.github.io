# Ship 11b: tools/apply-row-entries-v1.mjs learns (1) the lines of rows struck BEFORE the pinned ledger was read
# (row entries v1.2 is read from the store as served, so the follower has no round to find them in; the twin clause
# reads them from the file the pin keeps), and (2) facts lists of further sources (pin.lists), named with --list.
import sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:90])
    t = t.replace(old, new)

# ---- the header: what the tool now reads ----
rep('''// Idempotent: a second run moves nothing and writes nothing. --dry prints''',
'''// THE ROWS STRUCK BEFORE THE LEDGER WAS READ (row entries v1.2, relay v197, 20 November 2026). A reissue read from
// the store as served holds a line for every served row and none for a row a round struck before it was read: the
// follower finds no round since, so it names no struck row. The lines of those rows are kept beside the ledger
// (pin.struck_lines: the replaced ledger's line of each, with the round that took it), and the twin clause above
// reads them as it reads a line whose row a round struck since. Found by recount over every such line.
//
// FACTS LISTS OF FURTHER SOURCES (pin.lists; relays v203 and v204, the entry ledgers). A source that names no entry
// of its own has no line in the ledger. The corpus lane joins such a source's rows to the Bible dictionaries'
// entries by the row's own pointed head form and kind of word, and sends the rows that meet one as a list: key,
// rank, m id, route text (and its sha16 where the list gives it), and the facts the row would carry. Each list is
// named on the command line (--list <file>, once for each list of the pin) and read only if it is the bytes its pin
// entry names. Of a list's facts only those its pin entry lands (facts) are written: the numbers (n), which the gate
// itself reads. STEP's letters and BDB's own entries are the two partings of ruling 6, which names the sources whose
// rows they read; on a joined row they are counted (facts_not_landed) and not written. A row of a list's source
// with no line carries nothing. A line is followed through the row-strikes record from the store its list was read
// at, as a line of the ledger is. Refused: a list that is not its pin's bytes, a pinned list not named, a line of a
// source its pin entry does not read or of a source the ledger reads, a line that finds no row no round took.
//
// Idempotent: a second run moves nothing and writes nothing. --dry prints''')
rep('''// Usage: node tools/apply-row-entries-v1.mjs --ledger <the ledger data/row-entries/PIN.json names> [--store data/route-store] [--on <moment>] [--dry]''',
'''// Usage: node tools/apply-row-entries-v1.mjs --ledger <the ledger data/row-entries/PIN.json names> [--list <a list the pin names>]... [--store data/route-store] [--on <moment>] [--dry]''')

rep('''const LEDGER = arg("ledger", null);
''', '''const LEDGER = arg("ledger", null);
const LISTS = process.argv.flatMap((a, i) => (a === "--list" && process.argv[i + 1] ? [process.argv[i + 1]] : []));
''')

# ---- the pin: struck lines and lists ----
rep('''let pin, lines, theirs;
try {''', '''let pin, lines, theirs, struckBefore = [];
const listBytes = new Map();   // sha256 -> the bytes of a file named with --list
for (const path of LISTS) { if (!existsSync(path)) refuse(`--list ${path} is not here`); const b = readFileSync(path); listBytes.set(sha256(b), b); }
try {''')
rep('''  lines = readPinnedLines(LEDGER, pin.ledger, pin.ledger.file);
} catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; }''',
'''  lines = readPinnedLines(LEDGER, pin.ledger, pin.ledger.file);
  if (pin.struck_lines) struckBefore = readPinnedLines(join(PINS, pin.folder, pin.struck_lines.file), pin.struck_lines, `${pin.folder}/${pin.struck_lines.file}`);
  for (const l of pin.lists || []) {
    if (!l.name || !l.folder || !l.rule || !l.receipt || !l.list || !Array.isArray(l.facts) || !l.facts.length || l.facts.some((f) => !["n", "t", "b"].includes(f)) || !l.sources || !l.read_at_store_version)
      throw new PinFault(`a list of the pin (${l.name || "unnamed"}) does not name its folder, rule, receipt, list, the facts it lands, its sources and the store it was read at`);
    readPinned(join(PINS, l.folder, l.rule.file), l.rule, `${l.folder}/${l.rule.file}`);
    const receipt = readPinned(join(PINS, l.folder, l.receipt.file), l.receipt, `${l.folder}/${l.receipt.file}`).toString("utf8");
    if (!receipt.includes(`"${l.read_at_store_version}"`)) throw new PinFault(`the receipt of the list "${l.name}" does not name ${l.read_at_store_version}, the store the pin says the list was read at`);
    const bytes = listBytes.get(l.list.sha256);
    if (!bytes) throw new PinFault(`the pin names the list ${l.list.file} (${l.name}, relay ${l.relay}) and no --list names those bytes: a run without it would take its entries off the rows`);
    if (bytes.length !== l.list.bytes) throw new PinFault(`${l.list.file} is ${bytes.length} bytes and its pin says ${l.list.bytes}`);
  }
  if (listBytes.size !== (pin.lists || []).length) throw new PinFault(`${listBytes.size} file(s) are named with --list and the pin names ${(pin.lists || []).length} list(s): a --list names bytes no list of the pin names, or one twice`);
} catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; }''')

# ---- which sources the ledger's own lines give a fact ----
rep('''    const name = [x.k, rank, m, sha], facts = factsFor(m, entries, numbers);
    const went = following(() => follow.nowOf(name));''',
'''    const name = [x.k, rank, m, sha], facts = factsFor(m, entries, numbers);
    if (facts) GIVEN_BY_THE_LEDGER.add(m);
    const went = following(() => follow.nowOf(name));''')
rep('''const ledger = new Map();
const keysRead = new Set();''',
'''const ledger = new Map();
const GIVEN_BY_THE_LEDGER = new Set();   // the sources some line of the ledger gives a fact
const keysRead = new Set();''')

# ---- the struck lines kept beside the ledger join the twin lines ----
rep('''// A STRUCK ROW'S TWIN TAKES WHAT ITS LINE ALONE SAID: the same source's row of the same words under the key the
// struck row's words still stand under carries its own entries first, then those of the struck row's line it lacks''',
'''// the lines of the rows a round struck before the ledger was read (pin.struck_lines): each a line of the ledger this
// one replaces, with the round that took its row; a row struck as a twin gives what its line alone said, as above
const struckBeforeBy = {};
for (const [i, x] of struckBefore.entries()) {
  const r = x && x.row, by = x && x.taken;
  if (!x || typeof x.k !== "string" || !Array.isArray(r) || r.length !== 6 || !Array.isArray(r[4]) || !Array.isArray(r[5]) || !by || typeof by.list !== "string") refuse(`${pin.struck_lines.file} line ${i + 1} is not a key, the ledger's six slots and the round that took the row`);
  const [rank, m, sha, , entries, numbers] = r;
  if (!(index.m_sources || {})[m]) refuse(`${pin.struck_lines.file} line ${i + 1} names a row of ${m}, and the store holds no such source`);
  struckBeforeBy[by.list] = (struckBeforeBy[by.list] || 0) + 1;
  const name = [x.k, rank, m, sha];
  const twinKey = twinKeyOf(name, { state: by.action === "strike" ? "struck" : by.action, by: { kind: by.kind ?? null } });
  if (twinKey) twinLines.push({ from: name, key: twinKey, facts: factsFor(m, entries, numbers), by: { list: by.list } });
}
// A STRUCK ROW'S TWIN TAKES WHAT ITS LINE ALONE SAID: the same source's row of the same words under the key the
// struck row's words still stand under carries its own entries first, then those of the struck row's line it lacks''')

# ---- the lists, read after the twins ----
rep('''
// ---- every row of the store ----------------------------------------------------------------''',
'''
// ---- the facts lists of further sources (pin.lists) ---------------------------------------------
const LIST_OF = new Map();    // m id -> the pin entry of the list that reads it
const listed = new Map();     // key now -> "rank m sha16" -> [facts or null, ...], one per time a list names the row
const listRuns = [];          // per list, in the pin's order: what it gave
for (const l of pin.lists || []) {
  const text = listBytes.get(l.list.sha256).toString("utf8");
  if (!text.endsWith("\\n")) refuse(`${l.list.file} does not end in a line end`);
  const [head, ...body] = text.slice(0, -1).split("\\n");
  const cols = head.split("\\t");
  const iS = cols.indexOf("sha16"), iT = cols.indexOf("route_text"), iF = cols.findIndex((c) => /^facts_under_/u.test(c));
  if (cols[0] !== "key" || cols[1] !== "rank" || cols[2] !== "m_id" || iT < 0 || iF < 0) refuse(`${l.list.file} opens with another header: ${cols.join(" | ")}`);
  if (body.length !== l.list.lines) refuse(`${l.list.file} holds ${body.length} lines and its pin says ${l.list.lines}`);
  for (const [m, key] of Object.entries(l.sources)) {
    const mine = (index.m_sources || {})[m];
    if (!mine || mine.key !== key) refuse(`the pin's list "${l.name}" reads ${m} as ${key}, and the store holds ${mine ? mine.key : "no source"} under ${m}`);
    if (LIST_OF.has(m)) refuse(`two lists of the pin read ${m}`);
    LIST_OF.set(m, l);
  }
  const followL = following(() => openFollower({ data: dirname(STORE), index, readAt: l.read_at_store_version }));
  const run = { l, lines: body.length, gone: [], facts_not_landed: {}, by_m: {} };
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
    if (facts.n && facts.n.some((y) => !/^H[1-9]\\d*$/u.test(y))) refuse(`${where} carries a number that is not H and digits: ${JSON.stringify(facts.n)}`);
    const went = following(() => followL.nowOf([c[0], rank, m, sha]));
    if (went.state === "struck" || went.state === "withheld") { run.gone.push(went); continue; }
    const [k, rankNow, , shaNow] = went.name;
    const rows = listed.get(k) || listed.set(k, new Map()).get(k);
    const id = `${rankNow} ${m} ${shaNow}`;
    (rows.get(id) || rows.set(id, []).get(id)).push(Object.keys(facts).length ? facts : null);
  }
  listRuns.push(run);
}
const listTally = new Map((pin.lists || []).map((l) => [l, { store_rows_of_its_sources: 0, lines_met: 0, rows_carrying_an_entry: 0, rows_with_several_numbers: 0, rows_moved: 0 }]));
// A SOURCE THE LEDGER READS AND GIVES NOTHING MAY BE READ BY A LIST. The ledger holds a line for every row of a
// source that names no entry of its own (Classical Hebrew Words), each giving nothing; a list may give such a row
// the entry its head form meets. Where a line of the ledger gives a row of a list's source any fact, which of the
// two speaks is not decided, and the run is refused.
const READ_BY_BOTH = [...LIST_OF.keys()].filter((m) => SOURCES.has(m));
for (const m of READ_BY_BOTH) if (GIVEN_BY_THE_LEDGER.has(m)) refuse(`${m} is read by the pin's list "${LIST_OF.get(m).name}" and the ledger's own lines give its rows entries: which gives a row its entries is not decided`);

// ---- every row of the store ----------------------------------------------------------------''')

# ---- the walk: a row of a list's source ----
rep('''        if (!SOURCES.has(m)) { if (has) unlistedWithFacts.push(`${name} ${k} (${m}, rank ${row[0]})`); continue; }''',
'''        if (!SOURCES.has(m)) {
          // a row of a list's source: the facts its line gives, or nothing where it has no line
          const got = listLine(k, m, `${row[0]} ${m} ${sha256(Buffer.from(String(row[1] ?? ""), "utf8")).slice(0, 16)}`);
          if (!got) { if (has) unlistedWithFacts.push(`${name} ${k} (${m}, rank ${row[0]})`); continue; }
          if (same(has, got.want)) continue;
          got.lt.rows_moved += 1; moved += 1;
          if (write) setFacts(row, Object.fromEntries(MINE.map((key) => [key, got.want && key in got.want ? got.want[key] : null])));
          continue;
        }''')
rep('''        if (same(has, want)) continue;
        t.rows_moved += 1; moved += 1;
        if (write) setFacts(row, Object.fromEntries(MINE.map((key) => [key, want && key in want ? want[key] : null])));''',
'''        // a source the ledger reads and gives nothing may be read by a list of the pin: the row carries what its list line gives
        const got = listLine(k, m, id);
        const give = got && got.want ? got.want : want;
        if (same(has, give)) continue;
        if (got && got.want) got.lt.rows_moved += 1; else t.rows_moved += 1;
        moved += 1;
        if (write) setFacts(row, Object.fromEntries(MINE.map((key) => [key, give && key in give ? give[key] : null])));''')
rep('''  const taken = new Map();   // key, then the row's id -> how many of the ledger's lines for it are taken''',
'''  const taken = new Map();   // key, then the row's id -> how many of the ledger's lines for it are taken
  // what a list of the pin gives a row (its list's tally with it), or null where no list reads the row's source
  const listLine = (k, m, id) => {
    const l = LIST_OF.get(m);
    if (!l) return null;
    const lt = listTally.get(l); lt.store_rows_of_its_sources += 1;
    const list = (listed.get(k) || new Map()).get(id) || null;
    const key = `a list\\u0001${k}\\u0001${id}`, at = taken.get(key) || 0;
    const met = !!list && at < list.length;
    if (met) { taken.set(key, at + 1); lt.lines_met += 1; }
    const want = met ? list[at] : null;
    if (want) { lt.rows_carrying_an_entry += 1; if (want.n && want.n.length > 1) lt.rows_with_several_numbers += 1; }
    return { lt, want };
  };''')
rep('''  for (const t of Object.values(tally)) for (const k of Object.keys(t)) if (k !== "ledger_rows") t[k] = 0;''',
'''  for (const t of Object.values(tally)) for (const k of Object.keys(t)) if (k !== "ledger_rows") t[k] = 0;
  for (const lt of listTally.values()) for (const k of Object.keys(lt)) lt[k] = 0;''')

open(p, 'w', encoding='utf-8').write(t)
print('patched part 1')
