# Ship 16, patch 2: check-landings-v1's G5 knows a second kind of line not landed, held with its source, and accepts
# it only where the pin's list holds that source back with that very reason; every line of a held source must be so
# named, and no row of it may land. The first kind is held exactly as before. Applied after ship 12's patch 6.
# Usage: patch-16-02-check-landings-held.py <reader>
import io, sys
p = sys.argv[1] + "/tools/check-landings-v1.mjs"; s = io.open(p, encoding="utf-8").read()
def swap(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new)

swap("""//   G5  each line not landed names the rows of its own source that print its words under its key, and such a
//       row stands there now
""", """//   G5  each line not landed names the rows of its own source that print its words under its key, and such a
//       row stands there now. Or it is held with its source (22 November 2026, the corpus lane's v210: a list's pin
//       may hold sources back, held_sources, each with why): such a line stands only where the pin's list holds
//       that source back with that very reason, every line of a held source in the list is so named, and no row
//       of a held source lands
""")
swap("""// ---- G5: each line not landed is printed by its own source -----------------------------------------------------------
{
  const faults = [];
  let lines = 0;
  for (const l of lists) for (const [i, x] of ((READ.get(l.id) || {}).notLanded || []).entries()) {
    lines += 1;
    const where = `${l.id}, line not landed ${i + 1} (${x.m})`;
    if (x.kind !== "printed_under_its_key_by_its_own_source" || !Array.isArray(x.printed_by) || !x.printed_by.length) { faults.push(`${where} does not name the rows that print its words`); continue; }
    const own = (store.routesWhole(x.key) || []).filter((row) => String(row[3]) === x.m && (row[1] === x.route || spaced(row[1]) === spaced(x.route)));
    if (!own.length) faults.push(`${where}: no row of its own source prints its words under its key now`);
  }
  check("G5  each line not landed names the rows of its own source that print its words under its key, and such a row stands there now", faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : lines ? `${nf(lines)} lines, each printed by its own source` : "no line of the pin's lists is held back: every line lands");
}
""", """// ---- G5: each line not landed is printed by its own source, or held with its source ---------------------------------
// A line held with its source is not landed for its source's sake, not its own, so it names no row that prints it:
// what holds it back is the pin's list, which must hold that source back with the reason the line gives.
{
  const faults = [];
  let lines = 0, held = 0;
  const heldBy = {};
  for (const l of lists) {
    const got = READ.get(l.id) || {};
    const hs = (l.held_sources && typeof l.held_sources === "object" && !Array.isArray(l.held_sources)) ? l.held_sources : {};
    const holds = (m) => Object.prototype.hasOwnProperty.call(hs, m) && typeof hs[m] === "string" && hs[m].trim() !== "";
    const heldHere = {};
    for (const [i, x] of (got.notLanded || []).entries()) {
      lines += 1;
      const where = `${l.id}, line not landed ${i + 1} (${x.m})`;
      if (x.kind === "held_with_its_source") {
        if (!holds(x.m)) { faults.push(`${where} is held with its source, and the pin's list holds no source ${x.m} back`); continue; }
        if (x.not_landed_because !== hs[x.m]) { faults.push(`${where} is held with its source for another reason than the pin's list gives`); continue; }
        heldHere[x.m] = (heldHere[x.m] || 0) + 1; heldBy[x.m] = (heldBy[x.m] || 0) + 1; held += 1;
        continue;
      }
      if (holds(x.m)) { faults.push(`${where}: the pin's list holds ${x.m} back, and the line is named not landed for another cause`); continue; }
      if (x.kind !== "printed_under_its_key_by_its_own_source" || !Array.isArray(x.printed_by) || !x.printed_by.length) { faults.push(`${where} does not name the rows that print its words`); continue; }
      const own = (store.routesWhole(x.key) || []).filter((row) => String(row[3]) === x.m && (row[1] === x.route || spaced(row[1]) === spaced(x.route)));
      if (!own.length) faults.push(`${where}: no row of its own source prints its words under its key now`);
    }
    for (const m of Object.keys(hs)) {
      if (!holds(m)) { faults.push(`${l.id}: the pin's list holds back ${m} and does not say why in words`); continue; }
      const listed = (got.lane || []).filter((e) => e && e.m === m).length;
      if (!listed) faults.push(`${l.id}: the pin's list holds back ${m}, and the list holds no line of it`);
      else if ((heldHere[m] || 0) !== listed) faults.push(`${l.id}: ${nf(listed)} lines of ${m} are in the list and ${nf(heldHere[m] || 0)} are named held with their source`);
    }
    for (const x of got.landed || []) if (holds(x.m)) faults.push(`${l.id}: a row of ${x.m} lands, and the pin's list holds that source back`);
  }
  check("G5  each line not landed names the rows of its own source that print its words under its key, and such a row stands there now; or it is held with its source, where the pin's list holds that source back with that reason, every line of it so named and none landed", faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : lines ? [lines - held ? `${nf(lines - held)} lines, each printed by its own source` : "", held ? `${nf(held)} held with their source (${Object.entries(heldBy).map(([m, k]) => `${m} ${nf(k)}`).join(", ")}), each as its pin's list holds it` : ""].filter(Boolean).join(" · ") : "no line of the pin's lists is held back: every line lands");
}
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)
