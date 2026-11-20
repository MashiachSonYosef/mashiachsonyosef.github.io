# Ship 11c: the made spaces' second road counts a row a later list landed. Until now a row of a listed source landed
# since the store the receipt read, by another list than the receipt's own landing, shut the road. The corpus lane's
# returns (relay v200) land eight of BDB's rows call 5 struck back under their plain keys: each is in the row-strikes
# record whole, so its texts gain it, as a struck row's texts lose it.
# Usage: python3 patch-second-road-back.py <reader/tools dir>
import sys, os
d = sys.argv[1]
def patch(name, pairs):
    p = os.path.join(d, name)
    s = open(p, encoding="utf-8").read()
    for old, new in pairs:
        assert s.count(old) == 1, (name, s.count(old), old[:80])
        s = s.replace(old, new)
    open(p, "w", encoding="utf-8").write(s)

patch("made-spaces-second-road-v1.mjs", [
("""// A line's counts on this store are its stated counts less those rows and
// lines whose route text (field 1) or definition text (field 2) is its text.
""", """//   - the rows of the source that a round landed since by another list than
//     the receipt's own landing (the corpus lane's returns, relay v200: rows
//     call 5 struck under a key that ends in a maqaf, back under their plain
//     keys): each is in the record whole, text and all, and its texts gain it.
//
// A line's counts on this store are its stated counts less those rows and
// lines whose route text (field 1) or definition text (field 2) is its text,
// and with the rows landed since whose text it is.
"""),
("""// restored or rejoined a row of the source, or landed one that is not the
// landing's. A retext since that folded a row into another is a row taken,
""", """// restored or rejoined a row of the source, or landed one the record does
// not keep whole. A retext since that folded a row into another is a row taken,
"""),
("""//    | { open: true, base, landing, rounds, gone, notLanded, retexted }
""", """//    | { open: true, base, landing, rounds, gone, notLanded, retexted, back }
"""),
("""//        retexted   m id -> the rows that stay with other words, { key, rank, route, definition (the old texts), to_text, list }
""", """//        retexted   m id -> the rows that stay with other words, { key, rank, route, definition (the old texts), to_text, list }
//        back       m id -> the rows another list landed since, { key, rank, route, definition, list }
"""),
("""  const gone = new Map(), retexted = new Map();
""", """  const gone = new Map(), retexted = new Map(), back = new Map();
"""),
("""    if (x.action === "land") { if (r !== landedBy[0]) return shut(`${where} was landed since ${base} by another list than relay ${landing.relay}'s, a row the store the receipt read never held`); continue; }
""", """    if (x.action === "land") {
      // the receipt's own landing is in its counts already; a row another list landed since is a row more
      if (r === landedBy[0] || x.already_held) continue;
      if (!Array.isArray(x.row)) return shut(`${where} was landed since ${base} by another list than relay ${landing.relay}'s, and the record does not keep the row whole`);
      (back.get(m) || back.set(m, []).get(m)).push({ key: x.key, rank: x.rank, route: String(x.row[1] ?? ""), definition: String(x.row[2] ?? ""), list });
      continue;
    }
"""),
("""gone, notLanded, retexted };
};
""", """gone, notLanded, retexted, back };
};
"""),
("""/** How many fewer rows serve `text` on this store than its line states: as the route text, as the definition text. */
export const fallOf = (road, m, text) => {
  const off = [...(road.gone.get(String(m)) || []), ...(road.notLanded.get(String(m)) || []), ...((road.retexted && road.retexted.get(String(m))) || [])];
  return [off.filter((x) => x.route === text).length, off.filter((x) => x.definition === text).length];
};""", """/** How many fewer rows serve `text` on this store than its line states: as the route text, as the definition text
 *  (the rows gone, the lines not landed and the rows retexted, less the rows another list landed since). */
export const fallOf = (road, m, text) => {
  const off = [...(road.gone.get(String(m)) || []), ...(road.notLanded.get(String(m)) || []), ...((road.retexted && road.retexted.get(String(m))) || [])];
  const on = (road.back && road.back.get(String(m))) || [];
  return [off.filter((x) => x.route === text).length - on.filter((x) => x.route === text).length, off.filter((x) => x.definition === text).length - on.filter((x) => x.definition === text).length];
};"""),
])

patch("apply-made-spaces-v1.mjs", [
("""    const less = { rows: off.length, route: lost.filter((x) => closesOf(L, x.route)).length, definition: lost.filter((x) => closesOf(L, x.definition)).length, either: lost.filter((x) => closesOf(L, x.route) || closesOf(L, x.definition)).length };
""", """    // and with the rows another list landed since (the corpus lane's returns, relay v200), each a row more
    const on = (second.back && second.back.get(m)) || [];
    const less = { rows: off.length - on.length, route: lost.filter((x) => closesOf(L, x.route)).length - on.filter((x) => closesOf(L, x.route)).length, definition: lost.filter((x) => closesOf(L, x.definition)).length - on.filter((x) => closesOf(L, x.definition)).length,
      either: lost.filter((x) => closesOf(L, x.route) || closesOf(L, x.definition)).length - on.filter((x) => closesOf(L, x.route) || closesOf(L, x.definition)).length };
"""),
("""...(re.length ? { rows_retexted_since: re.length } : {}), lines_whose_row_counts_are_the_receipts_less_those: held,""",
 """...(re.length ? { rows_retexted_since: re.length } : {}), ...(on.length ? { rows_landed_since_by_another_list: on.length } : {}), lines_whose_row_counts_are_the_receipts_less_those: held,"""),
])

patch("check-made-spaces-v1.mjs", [
("""    const lost = [...off, ...moved];
    const routeOf = (x)""", """    const lost = [...off, ...moved];
    // and the rows another list landed since (the corpus lane's returns, relay v200): each a row more, its texts gain it
    const on = (second.back && second.back.get(m)) || [];
    const routeOf = (x)"""),
("""    const less = { route: lost.filter((x) => lineOf(L, x.route)).length, definition: lost.filter((x) => lineOf(L, x.definition)).length, either: lost.filter((x) => lineOf(L, x.route) || lineOf(L, x.definition)).length,
      stillRoute: lost.filter((x) => comma.test(routeOf(x))).length, stillRecord: lost.filter((x) => x.definition && comma.test(recordOf(x))).length };
""", """    const net = (test) => lost.filter(test).length - on.filter(test).length;
    const less = { route: net((x) => lineOf(L, x.route)), definition: net((x) => lineOf(L, x.definition)), either: net((x) => lineOf(L, x.route) || lineOf(L, x.definition)),
      stillRoute: net((x) => comma.test(routeOf(x))), stillRecord: net((x) => x.definition && comma.test(recordOf(x))) };
"""),
("""    if (c.rows !== stated.rows - off.length) faults.push(`${m}: ${nf(c.rows)} rows here, ${nf(stated.rows - off.length)} by the second road (the receipt's ${nf(stated.rows)} less ${off.length})`);
""", """    if (c.rows !== stated.rows - off.length + on.length) faults.push(`${m}: ${nf(c.rows)} rows here, ${nf(stated.rows - off.length + on.length)} by the second road (the receipt's ${nf(stated.rows)} less ${off.length}${on.length ? `, and ${on.length} landed since` : ""})`);
"""),
("""${moved.length ? `, ${moved.length} rows retexted since off their old texts` : ""}; ${nf(heldLines)} of""",
 """${moved.length ? `, ${moved.length} rows retexted since off their old texts` : ""}${on.length ? `, and ${on.length} rows another list landed since` : ""}; ${nf(heldLines)} of"""),
])
print("the second road counts a row a later list landed")
