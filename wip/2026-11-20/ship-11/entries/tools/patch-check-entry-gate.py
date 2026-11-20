# Ship 11b: tools/check-entry-gate-v1.mjs follows the tool: the lines of rows struck before the ledger was read
# (pin.struck_lines) stand for the struck rows in the twin laws; the list of moves may carry an eighth column; a
# source a list of the pin reads may carry the facts its entry lands and no other; E16 holds the lists.
import sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:90])
    t = t.replace(old, new)

rep('''// The words are found in the data, never named.
//
// Run: node tools/check-entry-gate-v1.mjs [--ledger <the pinned ledger>] [--ledger-was <the ledger it replaces>] [--lattice <dir>]''',
'''//   E16 the facts lists of further sources (pin.lists; the entry ledgers of
//       relays v203 and v204): each list's rule and receipt are the bytes
//       its pin entry names, its receipt names the store the pin says it was
//       read at, and its sources are the store's; a row of a list's source
//       carries none but the facts its entry lands (E2); the index's record
//       of each list is the pin's and a recount's. With a list here (kept
//       in this tree, or named: --list <file>, or ROW_ENTRIES_LISTS, paths
//       parted by ":"): each line that gives a landed fact names one row of
//       the store, which carries exactly that, and no other row of the
//       list's sources carries an entry. Without a list that half is said
//       and not judged
//
// THE ROWS STRUCK BEFORE THE LEDGER WAS READ (row entries v1.2, relay v197).
// A ledger read from the store as served holds no line for a row a round
// struck before it was read, and the follower finds no round since. The pin
// keeps those rows' lines (struck_lines: the replaced ledger's line of each,
// with the round that took it), and the laws of a struck row's twin (under
// E3, and in E4 and E5) read them as they read a row a round struck since.
// The words are found in the data, never named.
//
// Run: node tools/check-entry-gate-v1.mjs [--ledger <the pinned ledger>] [--ledger-was <the ledger it replaces>] [--list <a list the pin names>]... [--lattice <dir>]''')

rep('''const LEDGER_WAS = arg("ledger-was", process.env.ROW_ENTRIES_LEDGER_WAS || null);''',
'''const LEDGER_WAS = arg("ledger-was", process.env.ROW_ENTRIES_LEDGER_WAS || null);
const LISTS = [...process.argv.flatMap((a, i) => (a === "--list" && process.argv[i + 1] ? [process.argv[i + 1]] : [])), ...String(process.env.ROW_ENTRIES_LISTS || "").split(":").filter(Boolean)];''')

# ---- E1: the struck lines and the lists' pinned bytes ----
rep('''let theirs = null;
const FACT_OF = new Map();   // m id -> the fact a parting reads on its rows
{''', '''let theirs = null;
const FACT_OF = new Map();   // m id -> the fact a parting reads on its rows
let STRUCK_BEFORE = [];      // the lines of the rows a round struck before the ledger was read (pin.struck_lines)
const LIST_M = new Map();    // m id -> the pin entry of the list that reads it
const listFaults = [];       // E16: what the lists' pinned bytes and sources do not hold
{''')
rep('''    if (!(pin.partings || []).length) faults.push("the pin names no parting");
  }''', '''    if (!(pin.partings || []).length) faults.push("the pin names no parting");
    if (pin.struck_lines) try { STRUCK_BEFORE = readPinnedLines(join(PINS, pin.folder, pin.struck_lines.file), pin.struck_lines, `${pin.folder}/${pin.struck_lines.file}`); } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
    for (const l of pin.lists || []) {
      const said = `the list "${l.name}" (relay ${l.relay})`;
      if (!l.folder || !l.rule || !l.receipt || !l.list || !l.sources || !l.read_at_store_version || !Array.isArray(l.facts) || !l.facts.length || l.facts.some((f) => !["n", "t", "b"].includes(f))) { listFaults.push(`${said} does not name its folder, rule, receipt, list, the facts it lands, its sources and the store it was read at`); continue; }
      try {
        readPinned(join(PINS, l.folder, l.rule.file), l.rule, `${l.folder}/${l.rule.file}`);
        const receipt = readPinned(join(PINS, l.folder, l.receipt.file), l.receipt, `${l.folder}/${l.receipt.file}`).toString("utf8");
        if (!receipt.includes(`"${l.read_at_store_version}"`)) listFaults.push(`the receipt of ${said} does not name ${l.read_at_store_version}, the store the pin says it was read at`);
        if (!receipt.includes(l.list.sha256)) listFaults.push(`the receipt of ${said} does not name the list the pin names`);
      } catch (e) { if (e instanceof PinFault) listFaults.push(e.message); else throw e; }
      for (const [m, key] of Object.entries(l.sources)) {
        if (((index.m_sources || {})[m] || {}).key !== key) listFaults.push(`${said} reads ${m} as ${key}, and the store holds ${((index.m_sources || {})[m] || {}).key || "no source"} there`);
        if (LIST_M.has(m)) listFaults.push(`${m} stands under two lists`);
        LIST_M.set(m, l);
      }
    }
  }''')

# ---- the twins: struck rows from the kept lines too ----
rep('''const twinKeys = new Set([...twinsWanted.keys()].map((id) => id.split("\\u0001")[0]));
''', '')
rep('''// the pinned ledger, where it is on this machine (E5, E14)''',
'''// the rows a round struck before the ledger was read: the pin keeps the replaced ledger's line of each, which stands
// for the struck row (its facts are what that line gave it)
const struckBeforeOf = (x) => { const r = (x && x.row) || [], by = (x && x.taken) || {}; return { name: [x.k, r[0], String(r[1]), r[2]], state: by.action === "strike" ? "struck" : by.action, by: { list: by.list, kind: by.kind ?? null }, row: null, facts: wantOf(String(r[1]), r[4] || [], r[5] || []) }; };
for (const x of STRUCK_BEFORE) {
  const g = struckBeforeOf(x);
  const key = twinKeyOf(g.name, g);
  if (!key) continue;
  const pair = { g, rows: [] };
  twinOfStruck.set(g.name.join("\\u0001"), pair);
  const id = `${key}\\u0001${g.name[2]}\\u0001${g.name[3]}`;
  (twinsWanted.get(id) || twinsWanted.set(id, []).get(id)).push(pair);
}
const twinKeys = new Set([...twinsWanted.keys()].map((id) => id.split("\\u0001")[0]));
// the entries a struck row carried: the row's own where the record holds it, its kept line's otherwise
const struckFacts = (g) => (g.row ? mineOf(factsOf(g.row)) : g.facts) || {};
// the pinned ledger, where it is on this machine (E5, E14)''')
rep('''    const s = mineOf(factsOf(g.row)) || {};
    for (const row of rows) {''', '''    const s = struckFacts(g);
    for (const row of rows) {''')
rep('''    const s = mineOf(factsOf(pair.g.row)) || {}, now = mineOf(factsOf(twin)) || {};''', '''    const s = struckFacts(pair.g), now = mineOf(factsOf(twin)) || {};''')
rep('''    // a struck row's twin carries its own entries, then those of the struck row's line that it lacks
    for (const s of struckTwins)''', '''    for (const x of STRUCK_BEFORE) { const g = struckBeforeOf(x), key = twinKeyOf(g.name, g); if (key) struckTwins.push({ key, m: g.name[2], sha: g.name[3], facts: g.facts }); }
    // a struck row's twin carries its own entries, then those of the struck row's line that it lacks
    for (const s of struckTwins)''')

# ---- the list of moves: an eighth column ----
rep('''    if (cols.length !== 7 || !same(cols.slice(0, 5), ["key", "rank", "m_id", "route_text", "facts_now"]) || !/^facts_under_/u.test(cols[5]) || cols[6] !== "what_changes") throw new PinFault''',
    '''    if ((cols.length !== 7 && !(cols.length === 8 && cols[7] === "the_row")) || !same(cols.slice(0, 5), ["key", "rank", "m_id", "route_text", "facts_now"]) || !/^facts_under_/u.test(cols[5]) || cols[6] !== "what_changes") throw new PinFault''')
rep('''      if (c.length !== 7) throw new PinFault(`${pin.moves.file} line ${i + 2} holds ${c.length} fields`);''',
    '''      if (c.length !== cols.length) throw new PinFault(`${pin.moves.file} line ${i + 2} holds ${c.length} fields`);''')
rep('''  if (!wasPin) console.log("  --  E14's second half was not judged: the pin names no ledger it replaces");''',
    '''  if (!wasPin) console.log(pin.supersedes ? "  --  E14's second half is not asked of this pin: its ledger is the superseded one's rule read again on the store as served, so the two name different rows, and its list of moves is held against the store (above)" : "  --  E14's second half was not judged: the pin names no ledger it replaces");''')

# ---- E2: a row of a list's source ----
rep('''const byKeyId = new Map();   // for E5: key, then "rank m sha16" -> the facts the store's rows carry, as JSON''',
'''const byKeyId = new Map();   // for E5: key, then "rank m sha16" -> the facts the store's rows carry, as JSON
const listTally = new Map([...new Set(LIST_M.values())].map((l) => [l, { rows: 0, entry: 0, several: 0 }]));   // E16's recount, list by list
const listRows = new Map();  // for E16: key, then "rank m sha16" -> the facts each row of a list's source carries, as JSON''')
rep('''        if (mineOf(f) && !READ.has(m)) faults.push(`${where}: an entry on a row of a source the ledger does not read`);
      }''', '''        const lm = LIST_M.get(m);
        if (mineOf(f) && !READ.has(m) && !lm) faults.push(`${where}: an entry on a row of a source neither the ledger nor a list of the pin reads`);
        if (lm) for (const key of Object.keys(mineOf(f) || {})) if (!lm.facts.includes(key)) faults.push(`${where}: ${key} on a row of a source whose list (${lm.name}) does not land it`);
      }
      // a row of a list's source: what it carries is its list's, counted list by list (E16); where the ledger reads the
      // source too (it names no entry of its own, and the ledger's lines give it none) the ledger's part of the row is nothing
      const lm = LIST_M.get(m);
      if (lm) {
        const lt = listTally.get(lm), mine = mineOf(f);
        lt.rows += 1;
        if (mine) { lt.entry += 1; if ((mine.n || []).length > 1) lt.several += 1; }
        const id = `${row[0]} ${m} ${sha16Of(row[1])}`;
        const held = listRows.get(k) || listRows.set(k, new Map()).get(k);
        (held.get(id) || held.set(id, []).get(id)).push(JSON.stringify(mine));
      }''')
rep('''      const t = of(m); t.rows += 1;
      const mine = mineOf(f);
      if (mine) t.slot += 1;''', '''      const t = of(m); t.rows += 1;
      const mine = lm ? null : mineOf(f);
      if (mine) t.slot += 1;''')

# ---- E16, after E14 ----
rep('''
const served = zonesServed().filter((z) => existsSync(join(ZONES, `${z}.lattice.bin`)));''',
'''
// ---- E16: the facts lists of further sources ---------------------------------------------------
if (!(pin.lists || []).length) console.log("  --  E16 was not judged: the pin names no list");
else {
  const faults = [...listFaults];
  const said = (rec && rec.lists) || [];
  if (said.length !== pin.lists.length) faults.push(`the index names ${said.length} list(s) and the pin ${pin.lists.length}`);
  const told = [];
  for (const [i, l] of pin.lists.entries()) {
    const s = said[i] || {}, lt = listTally.get(l) || { rows: 0, entry: 0, several: 0 }, st = s.totals || {};
    if (s.relay !== l.relay || !same(s.list, { file: l.list.file, bytes: l.list.bytes, sha256: l.list.sha256, lines: l.list.lines, kept: l.list.kept }) || !same(s.facts_landed, l.facts) || !same(s.sources, l.sources) || s.read_at_store_version !== l.read_at_store_version) faults.push(`the index's record of the list "${l.name}" is not the pin's`);
    if (st.store_rows_of_its_sources !== lt.rows || st.rows_carrying_an_entry !== lt.entry || st.rows_with_several_numbers !== lt.several) faults.push(`the index says ${st.rows_carrying_an_entry} of ${st.store_rows_of_its_sources} rows of the sources of "${l.name}" carry an entry (${st.rows_with_several_numbers} several numbers), and a recount gives ${lt.entry} of ${lt.rows} (${lt.several})`);
    told.push(`${l.name} (relay ${l.relay}): ${nf(lt.entry)} of ${nf(lt.rows)} rows of ${Object.keys(l.sources).length} source(s) carry ${l.facts.join(", ")}`);
  }
  check("E16 the facts lists of further sources: each list's rule and receipt are the bytes its pin entry names, its sources are the store's, and the index's record of each is the pin's and a recount's", faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : told.join(" · "));
  // each list that is here, line by line
  const named = new Map();   // sha256 -> bytes, of the files named with --list or ROW_ENTRIES_LISTS
  for (const path of LISTS) if (existsSync(path)) { const b = readFileSync(path); named.set(sha256(b), b); }
  for (const l of pin.lists) {
    const inTree = join(PINS, l.folder, l.list.file);
    const bytes = named.get(l.list.sha256) || (existsSync(inTree) && sha256(readFileSync(inTree)) === l.list.sha256 ? readFileSync(inTree) : null);
    if (!bytes) { console.log(`  --  E16's second half was not judged here for "${l.name}": its list (${l.list.file}) is not on this machine (--list <file>, or ROW_ENTRIES_LISTS)`); continue; }
    const faults2 = [];
    let lines = 0, give = 0, met = 0, gone = 0, wrong = 0, extra = 0;
    try {
      if (bytes.length !== l.list.bytes) throw new PinFault(`${l.list.file} is ${bytes.length} bytes and its pin says ${l.list.bytes}`);
      const text = bytes.toString("utf8");
      if (!text.endsWith("\\n")) throw new PinFault(`${l.list.file} does not end in a line end`);
      const [head, ...body] = text.slice(0, -1).split("\\n");
      const cols = head.split("\\t");
      const iS = cols.indexOf("sha16"), iT = cols.indexOf("route_text"), iN = cols.indexOf("facts_now"), iF = cols.findIndex((c) => /^facts_under_/u.test(c));
      if (cols[0] !== "key" || cols[1] !== "rank" || cols[2] !== "m_id" || iT < 0 || iN < 0 || iF < 0) throw new PinFault(`${l.list.file} opens with another header: ${cols.join(" | ")}`);
      if (body.length !== l.list.lines) throw new PinFault(`${l.list.file} holds ${body.length} lines and its pin says ${l.list.lines}`);
      const followL = openFollower({ data: dirname(STORE), index, readAt: l.read_at_store_version });
      const othersOf = (f) => { const o = { ...(f || {}) }; for (const k of ["n", "t", "b"]) delete o[k]; return o; };
      const want = new Map();   // key now, then "rank m sha16" -> the landed facts each line gives, as JSON
      for (const [i, line] of body.entries()) {
        const c = line.split("\\t"), where = `${l.list.file} line ${i + 2}`;
        lines += 1;
        if (c.length !== cols.length) { faults2.push(`${where} holds ${c.length} fields`); continue; }
        if (LIST_M.get(c[2]) !== l) { faults2.push(`${where} names a row of ${c[2]}, which its pin entry does not read`); continue; }
        if (iS >= 0 && c[iS] !== sha16Of(c[iT])) faults2.push(`${where}: its sha16 is not its route text's`);
        const was = JSON.parse(c[iN]), under = JSON.parse(c[iF]);
        if (!same(othersOf(was), othersOf(under))) faults2.push(`${where}: changes a fact the tool does not write`);
        const facts = {};
        for (const key of ["n", "t", "b"]) if (l.facts.includes(key) && Array.isArray(under[key]) && under[key].length) facts[key] = under[key];
        const went = followL.nowOf([c[0], Number(c[1]), c[2], sha16Of(c[iT])]);
        if (went.state === "struck" || went.state === "withheld") { gone += 1; continue; }
        if (!Object.keys(facts).length) continue;   // a line that gives nothing its entry lands
        give += 1;
        const at = want.get(went.name[0]) || want.set(went.name[0], new Map()).get(went.name[0]);
        const id = `${went.name[1]} ${c[2]} ${went.name[3]}`;
        (at.get(id) || at.set(id, []).get(id)).push(JSON.stringify(facts));
      }
      // every line's row carries what the line gives, and no other row of the list's sources carries an entry
      for (const [k, at] of want) for (const [id, list] of at) {
        const got = ((listRows.get(k) || new Map()).get(id) || []).filter((x) => x !== "null");
        if (same([...got].sort(), [...list].sort())) met += list.length;
        else { wrong += 1; if (faults2.length < 6) faults2.push(`${k} ${id}: the row carries ${got[0] || "nothing"} and its line gives ${list[0]}`); }
      }
      for (const [k, held] of listRows) for (const [id, got] of held) {
        if (LIST_M.get(id.split(" ")[1]) !== l) continue;
        const carried = got.filter((x) => x !== "null").length, wanted = ((want.get(k) || new Map()).get(id) || []).length;
        if (carried > wanted) { extra += carried - wanted; if (faults2.length < 6) faults2.push(`${k} ${id}: a row of the list's sources carries an entry no line gives it`); }
      }
    } catch (e) { if (e instanceof PinFault || e instanceof SyntaxError || e instanceof FollowFault) faults2.push(e.message); else throw e; }
    check(`    and the list "${l.name}", line by line: each line that gives a landed fact names a row of the store that carries exactly it, and no other row of its sources carries an entry`, faults2.length === 0 && lines > 0,
      faults2.length ? `${nf(faults2.length)}${wrong ? ` · ${nf(wrong)} rows carry other facts` : ""}${extra ? ` · ${nf(extra)} rows carry an entry no line gives` : ""} · ${first(faults2)}` : `${nf(lines)} lines of ${l.list.file} · ${nf(give)} give ${l.facts.join(", ")}, each met by a row carrying it (${nf(met)}) · ${nf(lines - give - gone)} give nothing that lands${gone ? ` · ${nf(gone)} name a row a round took since` : ""}`);
  }
}
listRows.clear();

const served = zonesServed().filter((z) => existsSync(join(ZONES, `${z}.lattice.bin`)));''')

# ---- E7: the sidecar names the lists too ----
rep('''!side.entry.row_entries || side.entry.row_entries.ledger_sha256 !== pin.ledger.sha256)) e7.faults.push(`${z}: its sidecar does not name the gate's rule and this ledger`);''',
    '''!side.entry.row_entries || side.entry.row_entries.ledger_sha256 !== pin.ledger.sha256 || !same(side.entry.row_entries.lists || [], (pin.lists || []).map((l) => ({ relay: l.relay, list_sha256: l.list.sha256 }))))) e7.faults.push(`${z}: its sidecar does not name the gate's rule, this ledger and the pin's lists`);''')
open(p, 'w', encoding='utf-8').write(t)
print('check patched')
