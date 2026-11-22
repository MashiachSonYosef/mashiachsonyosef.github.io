# Ship 16, patch 9: a list's pin may hold back single lines (held_lines, each its source, key, words and why), matched
# to exactly one line of the list. The derivation names each not landed, of its own kind ("held_by_its_line") and with
# its why, and lands nothing of it; check-landings G5 accepts that kind only where the pin names that exact line with
# that reason. The re-admission's record counts, per source, the lines its list's pin holds back so (the tool and R1
# tie the count to the pin, R4 holds that no such line stands as a row); the source record says how many of a BY_ROW
# witness's admitted lines stand as no served row, and why, and L2 and L4 read it. The document says so too.
# Applied after patches 16-01 to 16-08. Usage: patch-16-09-held-lines.py <reader>
import io, sys
R = sys.argv[1]
s = ""
def swap(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new)

# ---- tools/derive-landings-v1.mjs ---------------------------------------------------------------------------------
p = R + "/tools/derive-landings-v1.mjs"; s = io.open(p, encoding="utf-8").read()
swap("""//     of is refused: it names what it does not hold;
""", """//     of is refused: it names what it does not hold;
//   - and it may name single LINES it holds back (`held_lines`, each its source, key and words and why: 22 November
//     2026, two of v210's rows that read wrongly at the Targum's places, where the page is bare today). Each must be
//     exactly one line of the list, by its source, key and words, and not of a source the pin holds back whole. It is
//     proved as every line is and written to the list of lines not landed with its own kind, "held_by_its_line",
//     and the pin's reason; nothing of it lands, and it takes no rank and no hole;
""")
swap("""// no reason in words, or of which the list holds no line; a list whose turn it is not (the
""", """// no reason in words, or of which the list holds no line; a line it holds back that is not exactly one line of the
// list, or names no reason; a list whose turn it is not (the
""")
swap("""const heldBySource = {};
""", """const heldBySource = {};
// the single lines the pin's list holds back, each matched to exactly one line of the list (its index -> why)
const LINE_KIND = "held_by_its_line";
const HELD_LINES = new Map();
if (L.held_lines !== undefined) {
  if (!Array.isArray(L.held_lines) || !L.held_lines.length) refuse(`the pin's list "${ID}" names held_lines, and they are not a list of the lines it holds back`);
  L.held_lines.forEach((h, j) => {
    if (!h || typeof h.m !== "string" || typeof h.key !== "string" || !h.key || typeof h.route !== "string" || !h.route || typeof h.why !== "string" || !h.why.trim()) refuse(`the pin's list "${ID}" holds back a line (${j + 1}) and does not name its source, key, words and why`);
    if (HELD.has(h.m)) refuse(`the pin's list "${ID}" holds back a line of ${h.m}, a source it holds back whole`);
    const at = [];
    lines.forEach((e, i) => { if (e && e.m === h.m && e.key === h.key && e.route === h.route) at.push(i); });
    if (at.length !== 1) refuse(`the pin's list "${ID}" holds back a line of ${h.m} (\\u00ab${h.route}\\u00bb), and ${at.length} lines of the list are it: a line held back is one line`);
    if (HELD_LINES.has(at[0])) refuse(`the pin's list "${ID}" holds back line ${at[0] + 1} twice`);
    HELD_LINES.set(at[0], h.why);
  });
}
const heldByLine = {};
""")
swap("""    heldBySource[e.m] = (heldBySource[e.m] || 0) + 1;
    return;
  }
""", """    heldBySource[e.m] = (heldBySource[e.m] || 0) + 1;
    return;
  }
  if (HELD_LINES.has(i)) {
    // held by its line: proved as a landing, and not landed; it takes no rank and no hole
    notLanded.push({ m: e.m, key: e.key, rank: e.rank, route: e.route, definition: e.definition, from: from(i), kind: LINE_KIND,
      not_landed_because: HELD_LINES.get(i), held_by: "the pin's list holds this line back (held_lines): it does not land" });
    heldByLine[e.m] = (heldByLine[e.m] || 0) + 1;
    return;
  }
""")
swap("""...(HELD.size ? { held_with_their_source: heldBySource } : {}),
""", """...(HELD.size ? { held_with_their_source: heldBySource } : {}), ...(HELD_LINES.size ? { held_by_their_line: heldByLine } : {}),
""")
swap("""(${HELD.size ? `${n(notLanded.filter((x) => x.kind !== HELD_KIND).length)} their own source prints under their key, ${n(notLanded.filter((x) => x.kind === HELD_KIND).length)} held with their source` : "their own source prints their words under their key"})`);
""", """(${HELD.size || HELD_LINES.size ? `${n(notLanded.filter((x) => x.kind !== HELD_KIND && x.kind !== LINE_KIND).length)} their own source prints under their key, ${n(notLanded.filter((x) => x.kind === HELD_KIND).length)} held with their source, ${n(notLanded.filter((x) => x.kind === LINE_KIND).length)} held by their line` : "their own source prints their words under their key"})`);
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)

# ---- tools/check-landings-v1.mjs ----------------------------------------------------------------------------------
p = R + "/tools/check-landings-v1.mjs"; s = io.open(p, encoding="utf-8").read()
swap("""//       of a held source lands
""", """//       of a held source lands. Or it is held by its line (22 November 2026: the pin's list may hold back single
//       lines, held_lines, each its source, key, words and why): it stands only where the pin's list names that
//       very line with that very reason, each line the pin so names is exactly one line of the list and is named
//       not landed once, so, and no row of it lands
""")
swap("""  let lines = 0, held = 0;
  const heldBy = {};
""", """  let lines = 0, held = 0, heldLines = 0;
  const heldBy = {}, byLine = {};
""")
swap("""    const heldHere = {};
    for (const [i, x] of (got.notLanded || []).entries()) {
""", """    const heldHere = {};
    const hl = Array.isArray(l.held_lines) ? l.held_lines : [];
    const sameLine = (h, x) => !!h && !!x && h.m === x.m && h.key === x.key && h.route === x.route;
    const lineHeld = new Map();   // a held line of the pin (its index) -> times it is named not landed, held by its line
    for (const [i, x] of (got.notLanded || []).entries()) {
""")
swap("""      if (holds(x.m)) { faults.push(`${where}: the pin's list holds ${x.m} back, and the line is named not landed for another cause`); continue; }
""", """      if (x.kind === "held_by_its_line") {
        const at = hl.map((h, j) => (sameLine(h, x) ? j : -1)).filter((j) => j >= 0);
        if (at.length !== 1) { faults.push(`${where} is held by its line, and the pin's list ${at.length ? "holds that line back more than once" : "holds no such line back"}`); continue; }
        if (typeof hl[at[0]].why !== "string" || !hl[at[0]].why.trim() || x.not_landed_because !== hl[at[0]].why) { faults.push(`${where} is held by its line for another reason than the pin's list gives`); continue; }
        lineHeld.set(at[0], (lineHeld.get(at[0]) || 0) + 1); byLine[x.m] = (byLine[x.m] || 0) + 1; heldLines += 1;
        continue;
      }
      if (holds(x.m)) { faults.push(`${where}: the pin's list holds ${x.m} back, and the line is named not landed for another cause`); continue; }
""")
swap("""    for (const x of got.landed || []) if (holds(x.m)) faults.push(`${l.id}: a row of ${x.m} lands, and the pin's list holds that source back`);
  }
""", """    for (const x of got.landed || []) if (holds(x.m)) faults.push(`${l.id}: a row of ${x.m} lands, and the pin's list holds that source back`);
    if (l.held_lines !== undefined && (!Array.isArray(l.held_lines) || !l.held_lines.length)) faults.push(`${l.id}: the pin's held_lines are not a list of lines`);
    hl.forEach((h, j) => {
      if (!h || typeof h.m !== "string" || typeof h.key !== "string" || typeof h.route !== "string" || typeof h.why !== "string" || !h.why.trim()) { faults.push(`${l.id}: held line ${j + 1} of the pin does not name its source, key, words and why`); return; }
      if (holds(h.m)) faults.push(`${l.id}: held line ${j + 1} of the pin is of ${h.m}, a source it holds back whole`);
      const listed = (got.lane || []).filter((e) => sameLine(h, e)).length;
      if (listed !== 1) faults.push(`${l.id}: held line ${j + 1} of the pin is ${listed} lines of the list, not one`);
      if ((lineHeld.get(j) || 0) !== 1) faults.push(`${l.id}: held line ${j + 1} of the pin is named not landed, held by its line, ${lineHeld.get(j) || 0} times`);
      if ((got.landed || []).some((x) => sameLine(h, x))) faults.push(`${l.id}: held line ${j + 1} of the pin lands all the same`);
    });
  }
""")
swap("""stands there now; or it is held with its source, where the pin's list holds that source back with that reason, every line of it so named and none landed", faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : lines ? [lines - held ? `${nf(lines - held)} lines, each printed by its own source` : "", held ? `${nf(held)} held with their source (${Object.entries(heldBy).map(([m, k]) => `${m} ${nf(k)}`).join(", ")}), each as its pin's list holds it` : ""].filter(Boolean)""", """stands there now; or it is held with its source, where the pin's list holds that source back with that reason, every line of it so named and none landed; or it is held by its line, where the pin's list names that exact line with that reason", faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : lines ? [lines - held - heldLines ? `${nf(lines - held - heldLines)} lines, each printed by its own source` : "", held ? `${nf(held)} held with their source (${Object.entries(heldBy).map(([m, k]) => `${m} ${nf(k)}`).join(", ")}), each as its pin's list holds it` : "", heldLines ? `${nf(heldLines)} held by their line (${Object.entries(byLine).map(([m, k]) => `${m} ${nf(k)}`).join(", ")}), each as its pin's list names it` : ""].filter(Boolean)""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)

# ---- tools/readmit-sources-v1.mjs ---------------------------------------------------------------------------------
p = R + "/tools/readmit-sources-v1.mjs"; s = io.open(p, encoding="utf-8").read()
swap("""// the index. A source the pin holds back that the record does not, or the other way about, is refused.
""", """// the index. A source the pin holds back that the record does not, or the other way about, is refused.
//
// A LINE THE PIN HOLDS BACK IS A LISTED ROW NOT SERVED (22 November 2026). The list's pin may hold back single lines
// of a returning source (held_lines: two of the translation tables' rows that read wrongly at the Targum's places).
// The source still returns, for the rows the lane lists; its count of listed rows is the list's, and the record says
// how many of them its pin holds back by their line (held_by_their_line), which must be the pin's count for it.
""")
swap("""    if (!rec.lists.includes(s.list)) throw new Error(`${at} returns in ${s.list}, which is not a list of the record`);
""", """    if (!rec.lists.includes(s.list)) throw new Error(`${at} returns in ${s.list}, which is not a list of the record`);
    if (s.held_by_their_line !== undefined && (!Number.isInteger(s.held_by_their_line) || s.held_by_their_line < 0 || s.held_by_their_line >= s.rows_listed)) throw new Error(`${at}: the lines it says its pin holds back by their line are not a count below its listed rows`);
""")
swap("""  for (const [id, L] of pinList) for (const m of Object.keys(L.held_sources || {})) if (!HELD.has(m)) faults.push(`the pin's list ${id} holds back ${m}, and the record does not`);
""", """  for (const [id, L] of pinList) for (const m of Object.keys(L.held_sources || {})) if (!HELD.has(m)) faults.push(`the pin's list ${id} holds back ${m}, and the record does not`);
  // the lines the pin holds back by their line, source by source, are the record's count
  for (const s of rec.sources) {
    const byPin = (((pinList.get(s.list) || {}).held_lines) || []).filter((h) => h && h.m === s.m).length;
    if (byPin !== (s.held_by_their_line || 0)) faults.push(`${s.m}: the record says its pin holds back ${s.held_by_their_line || 0} of its lines by their line, and the pin's list ${s.list} holds back ${byPin}`);
  }
  for (const [id, L] of pinList) for (const h of L.held_lines || []) if (!h || !rec.sources.some((s) => s.m === h.m && s.list === id)) faults.push(`the pin's list ${id} holds back a line of ${h && h.m}, which is not a source the record returns in it`);
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)

# ---- tools/check-readmission-v1.mjs -------------------------------------------------------------------------------
p = R + "/tools/check-readmission-v1.mjs"; s = io.open(p, encoding="utf-8").read()
swap("""//       names, that list's pin holds it back with the record's reason, and it stays struck
""", """//       names, that list's pin holds it back with the record's reason, and it stays struck. A line the pin holds
//       back by itself (held_lines, 22 November 2026) is a listed row of its source not served: the record counts
//       them for the source (held_by_their_line), and that is the pin's count (R1); none stands as a row (R4)
""")
swap("""const heldBack = heldOf(rec);   // the sources the record holds back in its own lists, each with why
""", """const heldBack = heldOf(rec);   // the sources the record holds back in its own lists, each with why
// the single lines the landings' pin holds back in the record's lists (held_lines), each of its source
const landingsPin = existsSync(join(K3, "data", "landings", "PIN.json")) ? JSON.parse(readFileSync(join(K3, "data", "landings", "PIN.json"), "utf8")) : { lists: [] };
const heldLinesOf = (m) => (landingsPin.lists || []).filter((l) => rec.lists.includes(l.id)).flatMap((l) => (Array.isArray(l.held_lines) ? l.held_lines : []).filter((h) => h && h.m === m));
""")
swap("""  for (const [id, L] of pinList) for (const m of Object.keys(L.held_sources || {})) if (!heldBack.has(m)) faults.push(`the pin's list ${id} holds back ${m}, and the record does not`);
""", """  for (const [id, L] of pinList) for (const m of Object.keys(L.held_sources || {})) if (!heldBack.has(m)) faults.push(`the pin's list ${id} holds back ${m}, and the record does not`);
  for (const s of rec.sources) if (heldLinesOf(s.m).length !== (s.held_by_their_line || 0)) faults.push(`${s.m}: the record says its pin holds back ${s.held_by_their_line || 0} of its lines by their line, and the pin holds back ${heldLinesOf(s.m).length}`);
  for (const [id, L] of pinList) for (const h of L.held_lines || []) if (!h || !back.has(h.m)) faults.push(`the pin's list ${id} holds back a line of ${h && h.m}, which is not a source the record returns`);
""")
swap("""  const seen = new Map(); const perM = {}; let rowsOfOut = 0;
""", """  const seen = new Map(); const perM = {}; let rowsOfOut = 0;
  const heldLineIds = new Set(rec.sources.flatMap((s) => heldLinesOf(s.m).map((h) => `${h.m}\\u0001${h.key}\\u0001${h.route}`)));
""")
swap("""      const id = `${k}\\u0001${r[1]}`;
""", """      const id = `${k}\\u0001${r[1]}`;
      if (heldLineIds.has(`${m}\\u0001${id}`)) faults.push(`${m}: a line its pin holds back by itself stands as a row («${String(r[1]).slice(0, 40)}»)`);
""")
swap("""(${alone.map((s) => `${s.m} ${nf(perM[s.m] || 0)}`).join(", ")}) and no other""", """(${alone.map((s) => `${s.m} ${nf(perM[s.m] || 0)}${s.held_by_their_line ? ` of ${nf(s.rows_listed)} listed: ${s.held_by_their_line} held by their line, named and not served` : ""}`).join(", ")}) and no other""")
swap("""  check("R4  every row the store holds of a returning source is a row a landing of the record's lists made, and every such landed line stands as a row; a source that stays struck or is held for the owner's word carries none",
""", """  check("R4  every row the store holds of a returning source is a row a landing of the record's lists made, and every such landed line stands as a row; a source that stays struck or is held for the owner's word carries none, and no line the pin holds back by itself stands as a row",
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)

# ---- tools/emit-source-corpus-v1.mjs ------------------------------------------------------------------------------
p = R + "/tools/emit-source-corpus-v1.mjs"; s = io.open(p, encoding="utf-8").read()
swap("""// lines name none carries {}. The page shelves by it (shelfCorpusOf).
""", """// lines name none carries {}. The page shelves by it (shelfCorpusOf).
//
// AN ADMITTED LINE MAY STAND AS NO SERVED ROW (22 November 2026). The ledger
// names the rows it admits; the landings' pin may hold some of them back, a
// whole source (held_sources) or single lines (held_lines). A named row not
// served is no fault: the record says, for each BY_ROW witness, how many of its
// admitted lines stand as no served row, and of those how many its landing
// pin holds back by their line or with their source (admitted_lines_not_served).
""")
swap("""  const got = { entry: a, kept_here: kept, stored: L.list.stored || null, bytes: L.list.bytes, lines: L.list.lines, named: new Set(lines.map((e) => [e.m, e.key, e.route].join(SEP))), countsAs: countsAsOf(lines) };
""", """  const got = { entry: a, kept_here: kept, stored: L.list.stored || null, bytes: L.list.bytes, lines: L.list.lines, named: new Set(lines.map((e) => [e.m, e.key, e.route].join(SEP))), countsAs: countsAsOf(lines),
    idsOf: (m) => lines.filter((e) => e.m === m).map((e) => [e.m, e.key, e.route].join(SEP)),
    heldLineIds: new Set((Array.isArray(L.held_lines) ? L.held_lines : []).filter((h) => h).map((h) => [h.m, h.key, h.route].join(SEP))),
    heldSources: new Set(Object.keys(L.held_sources || {})) };
""")
swap("""const notNamed = new Map();   // m -> rows of a BY_ROW label that its admitted_rows does not name
""", """const notNamed = new Map();   // m -> rows of a BY_ROW label that its admitted_rows does not name
const servedNamed = new Map();   // m -> the named rows of a BY_ROW label that stand served (m, key and words)
""")
swap("""    if (byRowLabelOf.has(m) && !admittedRowsOf(byRowLabelOf.get(m)).named.has([m, k, r[1]].join(SEP))) notNamed.set(m, (notNamed.get(m) || 0) + 1);
""", """    if (byRowLabelOf.has(m)) {
      const id = [m, k, r[1]].join(SEP);
      if (!admittedRowsOf(byRowLabelOf.get(m)).named.has(id)) notNamed.set(m, (notNamed.get(m) || 0) + 1);
      else (servedNamed.get(m) || servedNamed.set(m, new Set()).get(m)).add(id);
    }
""")
swap("""    witnesses[m].rows_count_as = a.countsAs.get(m) || {};
""", """    witnesses[m].rows_count_as = a.countsAs.get(m) || {};
    const unserved = a.idsOf(m).filter((id) => !(servedNamed.get(m) || new Set()).has(id));
    const byLine = unserved.filter((id) => a.heldLineIds.has(id)).length, bySource = a.heldSources.has(m) ? unserved.length - byLine : 0;
    witnesses[m].admitted_lines_not_served = { lines: unserved.length, held_by_their_line: byLine, held_with_their_source: bySource, other: unserved.length - byLine - bySource };
""")
swap("""; its lines count as ${JSON.stringify(w.rows_count_as)}`);
""", """; its lines count as ${JSON.stringify(w.rows_count_as)}; admitted lines not served ${JSON.stringify(w.admitted_lines_not_served)}`);
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)

# ---- tools/check-source-corpus-v1.mjs -----------------------------------------------------------------------------
p = R + "/tools/check-source-corpus-v1.mjs"; s = io.open(p, encoding="utf-8").read()
swap("""//       those lines count as, recounted here: a derived field, never typed
//       (22 November 2026)
""", """//       those lines count as, recounted here: a derived field, never typed
//       (22 November 2026). And it says how many of its admitted lines stand
//       as no served row, and of those how many the landings' pin holds back
//       by their line or with their source (admitted_lines_not_served): a
//       named row not served is no fault, but the record must say it as it is
""")
swap("""const byRowCounts = new Map();  // m -> what its own lines count as, each value with its count
""", """const byRowCounts = new Map();  // m -> what its own lines count as, each value with its count
const byRowIds = new Map();     // m -> its own lines (m, key and words), in the list's order
const landingsPin = existsSync(join(K3, "data", "landings", "PIN.json")) ? JSON.parse(readFileSync(join(K3, "data", "landings", "PIN.json"), "utf8")) : { lists: [] };
const pinListOf = (sha) => (landingsPin.lists || []).find((l) => l.list && l.list.sha256 === sha) || {};
""")
swap("""    byRowCounts.set(m, c);
""", """    byRowCounts.set(m, c);
    byRowIds.set(m, lines.filter((e) => e.m === m).map((e) => [e.m, e.key, e.route].join(SEP)));
""")
swap("""const byRowOff = new Map();   // m -> served rows of a BY_ROW witness that its admitted_rows does not name
""", """const byRowOff = new Map();   // m -> served rows of a BY_ROW witness that its admitted_rows does not name
const byRowServed = new Map();   // m -> the named rows of a BY_ROW witness that stand served
""")
swap("""    if (named instanceof Set && !named.has([String(r[3]), k, r[1]].join(SEP))) byRowOff.set(String(r[3]), (byRowOff.get(String(r[3])) || 0) + 1);
""", """    if (named instanceof Set && !named.has([String(r[3]), k, r[1]].join(SEP))) byRowOff.set(String(r[3]), (byRowOff.get(String(r[3])) || 0) + 1);
    else if (named instanceof Set) (byRowServed.get(String(r[3])) || byRowServed.set(String(r[3]), new Set()).get(String(r[3]))).add([String(r[3]), k, r[1]].join(SEP));
""")
swap("""${byRowCited.length ? ` · ${byRowCited.length} judged row by row (${byRowCited.map((m) => `${m} ${cited.get(m)}`).join(", ")} rows), every row of them named by its admitted_rows` : ""}`);
""", """${byRowCited.length ? ` · ${byRowCited.length} judged row by row (${byRowCited.map((m) => `${m} ${cited.get(m)} rows served of ${(byRowIds.get(String(m)) || []).length} named`).join(", ")}), every served row named by its admitted_rows; a named row not served is L4's to say` : ""}`);
""")
swap("""    if (w.rows_count_as === undefined || ordered(w.rows_count_as) !== ordered(got)) off.push(`${m}: the record says its lines count as ${JSON.stringify(w.rows_count_as)}, and they count as ${JSON.stringify(got)}`);
    else said.push(`${m} ${Object.entries(got).map(([v, n]) => `${v} ${n}`).join(", ") || "none"}`);
""", """    if (w.rows_count_as === undefined || ordered(w.rows_count_as) !== ordered(got)) { off.push(`${m}: the record says its lines count as ${JSON.stringify(w.rows_count_as)}, and they count as ${JSON.stringify(got)}`); continue; }
    // the admitted lines that stand as no served row, and why, recounted from the lines, the store and the landings' pin
    const L = pinListOf((w.admitted_rows || {}).sha256);
    const heldLineIds = new Set((Array.isArray(L.held_lines) ? L.held_lines : []).filter((h) => h).map((h) => [h.m, h.key, h.route].join(SEP)));
    const unserved = (byRowIds.get(m) || []).filter((id) => !(byRowServed.get(m) || new Set()).has(id));
    const byLine = unserved.filter((id) => heldLineIds.has(id)).length, bySource = Object.prototype.hasOwnProperty.call(L.held_sources || {}, m) ? unserved.length - byLine : 0;
    const want = { lines: unserved.length, held_by_their_line: byLine, held_with_their_source: bySource, other: unserved.length - byLine - bySource };
    if (ordered(w.admitted_lines_not_served) !== ordered(want)) { off.push(`${m}: the record says ${JSON.stringify(w.admitted_lines_not_served)} of its admitted lines stand as no served row, and a recount says ${JSON.stringify(want)}`); continue; }
    said.push(`${m} ${Object.entries(got).map(([v, n]) => `${v} ${n}`).join(", ") || "none"}; ${(byRowIds.get(m) || []).length - unserved.length} of ${(byRowIds.get(m) || []).length} admitted lines served${unserved.length ? `, ${unserved.length} not (${byLine} held by their line, ${bySource} with their source, ${want.other} other)` : ""}`);
""")
swap("""  check("L4  each witness judged row by row says what its admitted lines count as, and that is what they count as, recounted from the lines",
""", """  check("L4  each witness judged row by row says what its admitted lines count as, and how many stand as no served row and why, and both are so, recounted from the lines, the store and the landings' pin",
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)

# ---- PIPELINE.md --------------------------------------------------------------------------------------------------
p = R + "/PIPELINE.md"
s = io.open(p, encoding="utf-8").read()
swap("""> tables (M78, M103) return so, for the 126 rows the ledger v1.1 admits.
""", """> tables (M78, M103) return so, for the 126 rows the ledger v1.1 admits
> (124 land; two wait by their line, below).
""")
swap("""> so it stays struck. Harkavy's list (withdrawn by the lane, refused by the
""", """> so it stays struck. A pin may also hold back single lines (`held_lines`,
> each its source, key, words and why, matched to exactly one line of the
> list): two of the translation tables' rows that read wrongly at the
> Targum's places wait so for the corpus lane, each named not landed, held
> by its line, and counted in the record as a listed row not served.
> Harkavy's list (withdrawn by the lane, refused by the
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)
