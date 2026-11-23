# Ship 18, patch 1 (23 November 2026): a line the landings' pin held by its line may be let go (let_go, the corpus
# lane's relay v221), and a list of the pin may re-read an earlier one (re_reads: the same rule, receipt and list,
# derived again on the store after that list landed). Every law that reads held lines follows from the pin:
#   - the derivation lands, in a list that re-reads another, exactly the lines that list lets go to it;
#   - check-landings G5 holds a line let go to name a later list that re-reads its own and lands that very line, and
#     a list that re-reads another to land nothing else;
#   - the re-admission's tool and its check count a line let go as no line held (held_by_their_line), count it apart
#     (held_lines_let_go), and take the rows a re-reading list lands as rows of the record's lists (R4);
#   - the source record and its check (L4) count a line let go as no line held by its line.
# Each file is patched once: a file that carries the patch's mark is said and left. Exact replacements, each asserted
# to occur once. Usage: patch-18-01-let-go.py <reader>
import io, sys
R = sys.argv[1]
MARK = "re_reads"
s = ""
def swap(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:100])
    s = s.replace(old, new)
def file(rel, mark, edits):
    global s
    p = R + "/" + rel
    s = io.open(p, encoding="utf-8").read()
    if mark in s:
        print("stands already", rel); return
    edits()
    assert mark in s, rel
    io.open(p, "w", encoding="utf-8", newline="\n").write(s)
    print("patched", rel)

# ---- tools/derive-landings-v1.mjs ---------------------------------------------------------------------------------
def derive():
    swap("""//     and the pin's reason; nothing of it lands, and it takes no rank and no hole;
""", """//     and the pin's reason; nothing of it lands, and it takes no rank and no hole;
//   - a line held by its line may be LET GO (its `let_go`: the relay, the day, why in words, and the list of the pin it
//     lands in; 23 November 2026, the corpus lane's v221, which found both of v210's held rows right as their own
//     source's words and holds them at the Targum's places instead, data/held-places/). It stays held in its own list
//     as that list landed. It lands in a list that RE-READS that one (`re_reads`: the same rule, receipt and list,
//     derived again on the store as it stands after that list landed). Such a list lands exactly the lines let go to
//     it, each proved as every line is; every line that landed before is printed by its own source now, and a source
//     held back is held as before;
""")
    swap("""const heldByLine = {};
""", """const heldByLine = {};
// a list that re-reads an earlier list of the pin: the same rule, receipt and list; it lands exactly the lines that list
// let go to it (the index of each such line of the list)
const LET_GO = new Set();
let reread = null;
if (L.re_reads !== undefined) {
  reread = pin.lists.slice(0, at).find((l) => l.id === L.re_reads) || null;
  if (!reread) refuse(`the pin's list "${ID}" re-reads "${L.re_reads}", which is no list the pin lands before it`);
  for (const k of ["folder", "rule", "receipt", "list"]) if (JSON.stringify(reread[k] ?? null) !== JSON.stringify(L[k] ?? null)) refuse(`the pin's list "${ID}" re-reads "${reread.id}" and names another ${k}`);
  for (const h of Array.isArray(reread.held_lines) ? reread.held_lines : []) {
    if (!h || !h.let_go || h.let_go.lands_in !== ID) continue;
    if (typeof h.let_go.why !== "string" || !h.let_go.why.trim() || typeof h.let_go.relay !== "string" || !h.let_go.relay) refuse(`"${reread.id}" lets a line of ${h.m} go to "${ID}" and does not say by which relay and why`);
    const hit = [];
    lines.forEach((e, i) => { if (e && e.m === h.m && e.key === h.key && e.route === h.route) hit.push(i); });
    if (hit.length !== 1) refuse(`"${reread.id}" lets a line of ${h.m} (\\u00ab${h.route}\\u00bb) go to "${ID}", and ${hit.length} lines of the list are it`);
    LET_GO.add(hit[0]);
  }
  if (!LET_GO.size) refuse(`the pin's list "${ID}" re-reads "${reread.id}", which lets no line go to it`);
}
""")
    swap("""for (const x of landed) delete x.rank_named;
""", """for (const x of landed) delete x.rank_named;
// a list that re-reads another lands exactly the lines let go to it
if (reread) {
  const took = new Set(landed.flatMap((x) => (Array.isArray(x.from.gathers) ? x.from.gathers : [x.from.line]).map((n) => n - 1)));
  for (const i of took) if (!LET_GO.has(i)) refuse(`"${ID}" re-reads "${reread.id}" and would land line ${i + 1} (${lines[i].m}), which "${reread.id}" does not let go to it`);
  for (const i of LET_GO) if (!took.has(i)) refuse(`"${reread.id}" lets line ${i + 1} (${lines[i].m}) go to "${ID}", and it does not land: ${(notLanded.find((x) => x.from.line === i + 1) || {}).kind || "it is not named"}`);
}
""")
    swap("""...(HELD_LINES.size ? { held_by_their_line: heldByLine } : {}),
""", """...(HELD_LINES.size ? { held_by_their_line: heldByLine } : {}), ...(reread ? { re_reads: reread.id, let_go_to_it: LET_GO.size } : {}),
""")
file("tools/derive-landings-v1.mjs", MARK, derive)

# ---- tools/check-landings-v1.mjs ----------------------------------------------------------------------------------
def checkl():
    swap("""//       not landed once, so, and no row of it lands
//
""", """//       not landed once, so, and no row of it lands. A line held by its line may be let go (let_go, 23 November
//       2026, the corpus lane's v221): it stays named held in its own list, as that list landed, and its let_go says
//       by which relay and why and names a later list of the pin that re-reads its own (re_reads: the same rule,
//       receipt and list) and lands that very line once; such a list lands no row its list does not let go to it
//
""")
    swap("""      if ((got.landed || []).some((x) => sameLine(h, x))) faults.push(`${l.id}: held line ${j + 1} of the pin lands all the same`);
    });
""", """      if ((got.landed || []).some((x) => sameLine(h, x))) faults.push(`${l.id}: held line ${j + 1} of the pin lands all the same`);
      // let go: a later list that re-reads this one lands it, once
      if (h.let_go !== undefined) {
        const g = h.let_go || {};
        if (typeof g.why !== "string" || !g.why.trim() || typeof g.relay !== "string" || !g.relay) faults.push(`${l.id}: held line ${j + 1} of the pin is let go and does not say by which relay and why`);
        const later = lists.slice(lists.indexOf(l) + 1).find((x) => x.id === g.lands_in);
        if (!later || later.re_reads !== l.id) faults.push(`${l.id}: held line ${j + 1} of the pin is let go to ${g.lands_in}, which is no later list of the pin that re-reads ${l.id}`);
        else { const n = ((READ.get(later.id) || {}).landed || []).filter((x) => sameLine(h, x)).length; if (n !== 1) faults.push(`${l.id}: held line ${j + 1} of the pin is let go to ${later.id}, which lands it ${n} times`); else letGo += 1; }
      }
    });
    // a list that re-reads another: the same rule, receipt and list, and no row it lands but a line let go to it
    if (l.re_reads !== undefined) {
      const src = lists.slice(0, lists.indexOf(l)).find((x) => x.id === l.re_reads);
      if (!src) faults.push(`${l.id} re-reads ${l.re_reads}, which is no list the pin lands before it`);
      else {
        for (const k of ["folder", "rule", "receipt", "list"]) if (!same(src[k], l[k])) faults.push(`${l.id} re-reads ${src.id} and names another ${k}`);
        const goes = (Array.isArray(src.held_lines) ? src.held_lines : []).filter((h) => h && h.let_go && h.let_go.lands_in === l.id);
        for (const x of got.landed || []) if (!goes.some((h) => sameLine(h, x))) faults.push(`${l.id}: a row of ${x.m} lands that ${src.id} does not let go to it`);
        if (!goes.length) faults.push(`${l.id} re-reads ${src.id}, which lets no line go to it`);
      }
    }
""")
    swap("""  let lines = 0, held = 0, heldLines = 0;
""", """  let lines = 0, held = 0, heldLines = 0, letGo = 0;
""")
    swap("""; or it is held by its line, where the pin's list names that exact line with that reason", faults.length === 0,""",
         """; or it is held by its line, where the pin's list names that exact line with that reason; a line let go lands, once, in the later list that re-reads its own, and such a list lands nothing else", faults.length === 0,""")
    swap("""heldLines ? `${nf(heldLines)} held by their line (${Object.entries(byLine).map(([m, k]) => `${m} ${nf(k)}`).join(", ")}), each as its pin's list names it` : ""].filter(Boolean)""",
         """heldLines ? `${nf(heldLines)} held by their line (${Object.entries(byLine).map(([m, k]) => `${m} ${nf(k)}`).join(", ")}), each as its pin's list names it${letGo ? `, ${nf(letGo)} of them let go and landed by the list that re-reads it` : ""}` : ""].filter(Boolean)""")
file("tools/check-landings-v1.mjs", MARK, checkl)

# ---- tools/readmit-sources-v1.mjs ---------------------------------------------------------------------------------
def readmit():
    swap("""// how many of them its pin holds back by their line (held_by_their_line), which must be the pin's count for it.
""", """// how many of them its pin holds back by their line (held_by_their_line), which must be the pin's count for it.
// A line its pin let go (let_go, 23 November 2026, relay v221: a later list of the pin that re-reads its own lands it;
// the list's own `re_reads`) is held no more: it is counted apart (held_lines_let_go), and its row is a landed line's.
""")
    swap("""    const byPin = (((pinList.get(s.list) || {}).held_lines) || []).filter((h) => h && h.m === s.m).length;
    if (byPin !== (s.held_by_their_line || 0)) faults.push(`${s.m}: the record says its pin holds back ${s.held_by_their_line || 0} of its lines by their line, and the pin's list ${s.list} holds back ${byPin}`);
""", """    const byPin = (((pinList.get(s.list) || {}).held_lines) || []).filter((h) => h && h.m === s.m && !h.let_go).length;
    if (byPin !== (s.held_by_their_line || 0)) faults.push(`${s.m}: the record says its pin holds back ${s.held_by_their_line || 0} of its lines by their line, and the pin's list ${s.list} holds back ${byPin}`);
    // a line let go by its pin (re_reads): held no more, and counted apart
    const letGo = (((pinList.get(s.list) || {}).held_lines) || []).filter((h) => h && h.m === s.m && h.let_go).length;
    if (letGo !== (s.held_lines_let_go || 0)) faults.push(`${s.m}: the record says its pin let go ${s.held_lines_let_go || 0} of the lines it held by their line, and the pin's list ${s.list} lets go ${letGo}`);
""")
file("tools/readmit-sources-v1.mjs", MARK, readmit)

# ---- tools/check-readmission-v1.mjs -------------------------------------------------------------------------------
def checkr():
    swap("""//       them for the source (held_by_their_line), and that is the pin's count (R1); none stands as a row (R4)
""", """//       them for the source (held_by_their_line), and that is the pin's count (R1); none stands as a row (R4).
//       A line the pin let go (let_go, 23 November 2026, relay v221) is held no more: the record counts it apart
//       (held_lines_let_go), the pin's count (R1), and the row the list that re-reads its own lands (re_reads) is a
//       landed line of the record's lists (R4)
""")
    swap("""const heldLinesOf = (m) => (landingsPin.lists || []).filter((l) => rec.lists.includes(l.id)).flatMap((l) => (Array.isArray(l.held_lines) ? l.held_lines : []).filter((h) => h && h.m === m));
""", """const heldLinesOf = (m) => (landingsPin.lists || []).filter((l) => rec.lists.includes(l.id)).flatMap((l) => (Array.isArray(l.held_lines) ? l.held_lines : []).filter((h) => h && h.m === m && !h.let_go));
// and the lines it held so and let go to a list that re-reads its own (re_reads, 23 November 2026)
const letGoOf = (m) => (landingsPin.lists || []).filter((l) => rec.lists.includes(l.id)).flatMap((l) => (Array.isArray(l.held_lines) ? l.held_lines : []).filter((h) => h && h.m === m && h.let_go));
""")
    swap("""  for (const s of rec.sources) {
    if (counted.get(s.m) !== s.rows_listed)""", """  // a list of the pin that re-reads one of the record's lists lands the lines that list let go: its rows are the record's lists' rows
  for (const L of pin.lists || []) {
    if (!rec.lists.includes(L.re_reads)) continue;
    try { const d = (L.derived || {}).landed; landedOf.set(L.id, d && d.lines ? readPinnedLines(join(LAND, L.derived.folder, d.file), d, `${L.derived.folder}/${d.file}`) : []); } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
  }
  for (const s of rec.sources) if (letGoOf(s.m).length !== (s.held_lines_let_go || 0)) faults.push(`${s.m}: the record says its pin let go ${s.held_lines_let_go || 0} of the lines it held by their line, and the pin lets go ${letGoOf(s.m).length}`);
  for (const s of rec.sources) {
    if (counted.get(s.m) !== s.rows_listed)""")
    swap("""${s.held_by_their_line ? ` of ${nf(s.rows_listed)} listed: ${s.held_by_their_line} held by their line, named and not served` : ""}""",
         """${s.held_by_their_line ? ` of ${nf(s.rows_listed)} listed: ${s.held_by_their_line} held by their line, named and not served` : ""}${s.held_lines_let_go ? ` (${s.held_lines_let_go} held by their line and let go, landed by the list that re-reads theirs)` : ""}""")
file("tools/check-readmission-v1.mjs", MARK, checkr)

# ---- tools/emit-source-corpus-v1.mjs ------------------------------------------------------------------------------
def emits():
    swap("""// pin holds back by their line or with their source (admitted_lines_not_served).
""", """// pin holds back by their line or with their source (admitted_lines_not_served).
// A line the pin held by its line and let go (let_go, 23 November 2026: a later list that re-reads its own, re_reads,
// lands it) is held no more: served, it is counted as served, and not served, as other.
""")
    swap("""    heldLineIds: new Set((Array.isArray(L.held_lines) ? L.held_lines : []).filter((h) => h).map((h) => [h.m, h.key, h.route].join(SEP))),
""", """    heldLineIds: new Set((Array.isArray(L.held_lines) ? L.held_lines : []).filter((h) => h && !h.let_go).map((h) => [h.m, h.key, h.route].join(SEP))),
""")
file("tools/emit-source-corpus-v1.mjs", "let_go", emits)

# ---- tools/check-source-corpus-v1.mjs -----------------------------------------------------------------------------
def checks():
    swap("""//       named row not served is no fault, but the record must say it as it is
""", """//       named row not served is no fault, but the record must say it as it is. A line the pin held by its line
//       and let go (let_go, 23 November 2026, relay v221; re_reads) is held no more
""")
    swap("""    const heldLineIds = new Set((Array.isArray(L.held_lines) ? L.held_lines : []).filter((h) => h).map((h) => [h.m, h.key, h.route].join(SEP)));
""", """    const heldLineIds = new Set((Array.isArray(L.held_lines) ? L.held_lines : []).filter((h) => h && !h.let_go).map((h) => [h.m, h.key, h.route].join(SEP)));
""")
file("tools/check-source-corpus-v1.mjs", "let_go", checks)
