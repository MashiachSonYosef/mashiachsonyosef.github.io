# Ship 16, patch 1: a list's pin may hold sources back. tools/derive-landings-v1.mjs names every line of a source the
# pin's list holds back (held_sources, each with why) not landed, of its own kind and with the pin's reason, and lands
# nothing of it. Applied on ship 12's copy of the derivation (main with the holes clause).
# Usage: patch-16-01-derive-landings-held.py <reader>
import io, sys
p = sys.argv[1] + "/tools/derive-landings-v1.mjs"; s = io.open(p, encoding="utf-8").read()
def swap(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new)

swap("""//     lists takes a hole a later line names;
""", """//     lists takes a hole a later line names;
//   - a list's pin may name sources it HOLDS BACK (`held_sources`, each source with why, in words: 22 November 2026,
//     the corpus lane's v210, whose own-language list carries PanLex's rows beside the translation tables' while
//     PanLex waits on a ruling). A line of such a source is proved as a landing with the fields a landing reads, as
//     every line is, and is then written to the list of lines not landed with its own kind, "held_with_its_source",
//     and the pin's reason for its source. Nothing of it lands, and it takes no rank and no hole. Whether the store
//     admits its source is not asked, since it does not land. A pin that holds back a source the list holds no line
//     of is refused: it names what it does not hold;
""")
swap("""// REFUSED, in words and with nothing written: a pinned file that is not its bytes; a list whose turn it is not (the
""", """// REFUSED, in words and with nothing written: a pinned file that is not its bytes; a source the pin holds back with
// no reason in words, or of which the list holds no line; a list whose turn it is not (the
""")
swap("""} catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; }
""", """} catch (e) { if (e instanceof PinFault) refuse(e.message); throw e; }
// the sources the pin's list holds back, each with why: every line of such a source is named not landed, held with it
const HELD_KIND = "held_with_its_source";
const HELD = new Map();
if (L.held_sources !== undefined) {
  const h = L.held_sources;
  if (!h || typeof h !== "object" || Array.isArray(h) || !Object.keys(h).length) refuse(`the pin's list "${ID}" names held_sources, and they are not a source id for each source it holds back with why`);
  for (const [m, why] of Object.entries(h)) {
    if (!/^M[1-9]\\d*$/u.test(m) || typeof why !== "string" || !why.trim()) refuse(`the pin's list "${ID}" holds back "${m}" and does not say why in words`);
    if (!lines.some((e) => e && e.m === m)) refuse(`the pin's list "${ID}" holds back ${m}, and the list holds no line of it`);
    HELD.set(m, why);
  }
}
const heldBySource = {};
""")
swap("""    || (e.cut !== undefined && e.cut !== null && e.cut !== 1)) refuse(`${where} does not name what a landing reads: its source, key, route, definition, headwords, year, a rank or none, and a cut that is 1 or nothing`);
""", """    || (e.cut !== undefined && e.cut !== null && e.cut !== 1)) refuse(`${where} does not name what a landing reads: its source, key, route, definition, headwords, year, a rank or none, and a cut that is 1 or nothing`);
  if (HELD.has(e.m)) {
    // held with its source: proved as a landing, and not landed; it takes no rank and no hole
    notLanded.push({ m: e.m, key: e.key, rank: e.rank, route: e.route, definition: e.definition, from: from(i), kind: HELD_KIND,
      not_landed_because: HELD.get(e.m), held_by: "the pin's list holds this source back (held_sources): no line of it lands" });
    heldBySource[e.m] = (heldBySource[e.m] || 0) + 1;
    return;
  }
""")
swap("""  with_facts: landed.filter((x) => x.facts).length, by_kind: byKind, by_source: bySource,
""", """  with_facts: landed.filter((x) => x.facts).length, by_kind: byKind, by_source: bySource, ...(HELD.size ? { held_with_their_source: heldBySource } : {}),
""")
swap("""· ${n(notLanded.length)} not landed (their own source prints their words under their key)`);
""", """· ${n(notLanded.length)} not landed (${HELD.size ? `${n(notLanded.filter((x) => x.kind !== HELD_KIND).length)} their own source prints under their key, ${n(notLanded.filter((x) => x.kind === HELD_KIND).length)} held with their source` : "their own source prints their words under their key"})`);
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)
