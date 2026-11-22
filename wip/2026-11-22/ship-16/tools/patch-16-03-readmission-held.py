# Ship 16, patch 3: the re-admission knows a source its record holds back. Relay v210's own-language list carries
# PanLex's lines beside the translation tables'; the record names PanLex under `held` (its list, its count of lines,
# why) and the list's pin holds it back with the same reason (held_sources). tools/readmit-sources-v1.mjs counts and
# proves such lines and returns nothing of their source; tools/check-readmission-v1.mjs holds the same in R1. And
# the comment over the lattice's door says which source came back (ship 12's named PanLex). Applied on ship 12's
# copies of the two tools and after ship 12's patch 5. Usage: patch-16-03-readmission-held.py <reader>
import io, sys
R = sys.argv[1]
s = ""
def swap(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new)

# ---- tools/readmit-sources-v1.mjs ---------------------------------------------------------------------------------
p = R + "/tools/readmit-sources-v1.mjs"; s = io.open(p, encoding="utf-8").read()
swap("""// A SOURCE THAT RETURNS FOR ITS LISTED ROWS ALONE IS NOT ADMITTED WHOLE. PanLex returns 3,956 of the 14,008 rows the
// strike took; 10,052 name Yiddish, Ladino and other languages in their own field and stay out. Only the landings
""", """// A SOURCE THAT RETURNS FOR ITS LISTED ROWS ALONE IS NOT ADMITTED WHOLE. Of the rows the strike took of English
// Wiktionary's translation tables, 126 return (relay v210); the rest name Yiddish, Ladino and other languages in their
// own field, or a modern Neo-Aramaic or Classical Syriac, and stay out. Only the landings
""")
swap("""// must ask `readmitted.returns` before it takes one: tools/project-lattice-v12-v1.mjs does.
""", """// must ask `readmitted.returns` before it takes one: tools/project-lattice-v12-v1.mjs does.
//
// A SOURCE THE RECORD HOLDS BACK STAYS STRUCK (22 November 2026, the corpus lane's relay v210, which corrects v207).
// The own-language list of v210 carries PanLex's lines beside the translation tables', and PanLex waits on a ruling
// (the Zohar's prefix split). The record names such a source under `held`, with its list, its count of lines and
// why, and the list's pin holds it back with the same reason (held_sources). Its lines are counted and proved here
// as the lines of a returning source are, none of them lands, its id stays among the struck, and it has no entry in
// the index. A source the pin holds back that the record does not, or the other way about, is refused.
""")
swap("""  for (const m of rec.stay_struck) if (seen.has(m)) throw new Error(`${path}: ${m} returns and stays struck at once`);
  return rec;
};
""", """  for (const m of rec.stay_struck) if (seen.has(m)) throw new Error(`${path}: ${m} returns and stays struck at once`);
  if (rec.held !== undefined) {
    const h = rec.held && rec.held.sources;
    if (!h || typeof h !== "object" || Array.isArray(h) || !Object.keys(h).length) throw new Error(`${path} names sources it holds back and does not list them`);
    for (const [m, x] of Object.entries(h)) {
      const at = `${path}: ${m}, held back,`;
      if (!/^M[1-9]\\d*$/u.test(m) || seen.has(m)) throw new Error(`${at} is not a source id, or returns and is held back at once`);
      if (!x || typeof x.why !== "string" || !x.why.trim() || !rec.lists.includes(x.list) || !Number.isInteger(x.rows_listed) || x.rows_listed < 1) throw new Error(`${at} does not say why, in which list of the record, and how many of its lines`);
      if (!rec.stay_struck.includes(m)) throw new Error(`${at} is not among the sources that stay struck`);
    }
  }
  return rec;
};

/** The sources the record holds back (its `held`), as a Map of id -> { why, list, rows_listed }; empty where it holds none. */
export const heldOf = (rec) => new Map(Object.entries((rec && rec.held && rec.held.sources) || {}));
""")
swap("""  const counted = new Map(), keyed = new Map(), listOf = new Map();
  for (const id of rec.lists) {
    const L = (pin.lists || []).find((l) => l.id === id);
    if (!L) refuse(`the landings' pin names no list "${id}"`);
""", """  const counted = new Map(), keyed = new Map(), listOf = new Map();
  const HELD = heldOf(rec), heldCounted = new Map(), heldIn = new Map(), pinList = new Map();
  for (const id of rec.lists) {
    const L = (pin.lists || []).find((l) => l.id === id);
    if (!L) refuse(`the landings' pin names no list "${id}"`);
    pinList.set(id, L);
""")
swap("""    for (const e of lines) {
      counted.set(e.m, (counted.get(e.m) || 0) + 1);
""", """    for (const e of lines) {
      if (HELD.has(e.m)) { heldCounted.set(e.m, (heldCounted.get(e.m) || 0) + 1); if (heldIn.has(e.m) && heldIn.get(e.m) !== id) refuse(`${e.m} is held back and has lines in two lists (${heldIn.get(e.m)}, ${id})`); heldIn.set(e.m, id); continue; }
      counted.set(e.m, (counted.get(e.m) || 0) + 1);
""")
swap("""  for (const m of counted.keys()) if (!rec.sources.some((s) => s.m === m)) faults.push(`${m} has lines in the lists and is not a source of the record`);
""", """  for (const m of counted.keys()) if (!rec.sources.some((s) => s.m === m)) faults.push(`${m} has lines in the lists and is not a source of the record`);
  // a source held back: its lines counted in the list the record names, and that list's pin holding it back with the record's reason
  for (const [m, x] of HELD) {
    if ((heldCounted.get(m) || 0) !== x.rows_listed) faults.push(`${m}: the record holds back ${x.rows_listed} listed rows and the lists hold ${heldCounted.get(m) || 0}`);
    if (heldIn.get(m) !== x.list) faults.push(`${m}: the record says it is held back in ${x.list} and its lines are in ${heldIn.get(m)}`);
    if ((((pinList.get(x.list) || {}).held_sources) || {})[m] !== x.why) faults.push(`${m}: the pin's list ${x.list} does not hold it back with the record's reason`);
  }
  for (const [id, L] of pinList) for (const m of Object.keys(L.held_sources || {})) if (!HELD.has(m)) faults.push(`the pin's list ${id} holds back ${m}, and the record does not`);
""")
swap("""  const figures = { relay: rec.relay, sources: rec.sources.length, rows_listed: rec.sources.reduce((a, s) => a + s.rows_listed, 0), whole: rec.sources.filter((s) => s.returns === RETURNS_WHOLE).length,
""", """  const figures = { relay: rec.relay, sources: rec.sources.length, rows_listed: rec.sources.reduce((a, s) => a + s.rows_listed, 0), ...(HELD.size ? { held_back: Object.fromEntries([...HELD].map(([m, x]) => [m, x.rows_listed])) } : {}), whole: rec.sources.filter((s) => s.returns === RETURNS_WHOLE).length,
""")
swap("""· ${n(figures.rows_listed)} rows listed · ${rest.length} sources stay struck`);
""", """· ${n(figures.rows_listed)} rows listed${HELD.size ? ` · ${HELD.size} held back with their source (${[...HELD].map(([m, x]) => `${m} ${n(x.rows_listed)} lines`).join(", ")})` : ""} · ${rest.length} sources stay struck`);
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)

# ---- tools/check-readmission-v1.mjs -------------------------------------------------------------------------------
p = R + "/tools/check-readmission-v1.mjs"; s = io.open(p, encoding="utf-8").read()
swap("""//       of lines, under the record's key, in the list the record says; a source the record holds for the owner's
//       word is none of them
""", """//       of lines, under the record's key, in the list the record says; a source the record holds for the owner's
//       word is none of them. A source the record holds back (`held`, 22 November 2026: relay v210's own-language
//       list carries PanLex's lines beside the translation tables') has exactly its count of lines in the list it
//       names, that list's pin holds it back with the record's reason, and it stays struck
""")
swap("""import { readReadmission, entryOf, READMISSION_RECORD, READMISSION_RULE_ID } from "./readmit-sources-v1.mjs";
""", """import { readReadmission, entryOf, heldOf, READMISSION_RECORD, READMISSION_RULE_ID } from "./readmit-sources-v1.mjs";
""")
swap("""const heldIds = new Set(Object.values((rec.held_for_the_owners_word || {}).sources || {}).flatMap((w) => w.m || []));
""", """const heldIds = new Set(Object.values((rec.held_for_the_owners_word || {}).sources || {}).flatMap((w) => w.m || []));
const heldBack = heldOf(rec);   // the sources the record holds back in its own lists, each with why
for (const m of heldBack.keys()) heldIds.add(m);
""")
swap("""  const counted = new Map(), keyed = new Map(), listOf = new Map();
  for (const id of rec.lists) {
    const L = pin.lists.find((l) => l.id === id);
    if (!L) { faults.push(`the landings' pin names no list ${id}`); continue; }
""", """  const counted = new Map(), keyed = new Map(), listOf = new Map();
  const heldCounted = new Map(), heldIn = new Map(), pinList = new Map();
  for (const id of rec.lists) {
    const L = pin.lists.find((l) => l.id === id);
    if (!L) { faults.push(`the landings' pin names no list ${id}`); continue; }
    pinList.set(id, L);
""")
swap("""      for (const e of readPinnedLines(join(LAND, L.folder, L.list.file), L.list, `${L.folder}/${L.list.file}`)) {
        counted.set(e.m, (counted.get(e.m) || 0) + 1);
""", """      for (const e of readPinnedLines(join(LAND, L.folder, L.list.file), L.list, `${L.folder}/${L.list.file}`)) {
        if (heldBack.has(e.m)) { heldCounted.set(e.m, (heldCounted.get(e.m) || 0) + 1); if (heldIn.has(e.m) && heldIn.get(e.m) !== id) faults.push(`${e.m} is held back and has lines in two lists`); heldIn.set(e.m, id); continue; }
        counted.set(e.m, (counted.get(e.m) || 0) + 1);
""")
swap("""  for (const m of heldIds) if (!rec.stay_struck.includes(m)) faults.push(`${m} is held for the owner's word and is not among the sources that stay struck`);
""", """  for (const m of heldIds) if (!rec.stay_struck.includes(m)) faults.push(`${m} is held for the owner's word and is not among the sources that stay struck`);
  for (const [m, x] of heldBack) {
    if ((heldCounted.get(m) || 0) !== x.rows_listed) faults.push(`${m}: the record holds back ${x.rows_listed} listed rows and the lists hold ${heldCounted.get(m) || 0}`);
    if (heldIn.get(m) !== x.list) faults.push(`${m}: the record says it is held back in ${x.list} and its lines are in ${heldIn.get(m)}`);
    if ((((pinList.get(x.list) || {}).held_sources) || {})[m] !== x.why) faults.push(`${m}: the pin's list ${x.list} does not hold it back with the record's reason`);
  }
  for (const [id, L] of pinList) for (const m of Object.keys(L.held_sources || {})) if (!heldBack.has(m)) faults.push(`the pin's list ${id} holds back ${m}, and the record does not`);
""")
swap("""  check("R1  the record is the rule's and whole; its lists are the landings' pin's, each its pinned bytes; the sources the lists name are exactly the record's, each with its count, key and list; a source held for the owner's word is none of them",
""", """  check("R1  the record is the rule's and whole; its lists are the landings' pin's, each its pinned bytes; the sources the lists name are exactly the record's, each with its count, key and list; a source held for the owner's word is none of them; a source the record holds back has its count of lines in its list, held back there by the pin with the record's reason",
""")
swap("""· ${heldIds.size} held for the owner's word`);
""", """· ${heldIds.size - heldBack.size} held for the owner's word${heldBack.size ? ` · ${heldBack.size} held back with their source (${[...heldBack].map(([m, x]) => `${m} ${nf(x.rows_listed)} lines`).join(", ")}), each as the pin's list holds it` : ""}`);
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)

# ---- tools/project-lattice-v12-v1.mjs: the comment over the door says who came back -------------------------------
p = R + "/tools/project-lattice-v12-v1.mjs"; s = io.open(p, encoding="utf-8").read()
swap("""// 2026). PanLex and English Wiktionary's translation tables came back for the rows whose own language field names
// Hebrew or Aramaic; their other rows stay out (PanLex: 10,052 of 14,008). The lattice is the corpus lane's own
""", """// 2026). A source can come back for the rows whose own language field names Hebrew or Aramaic, its other rows left
// out (English Wiktionary's translation tables, 22 November 2026: the rows the source ledger v1.1 admits). The
// lattice is the corpus lane's own
""")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)
