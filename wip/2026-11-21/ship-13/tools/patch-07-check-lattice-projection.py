# Ship 13: tools/check-lattice-projection-v1.mjs L4c reads the cards that name a verse as the projection does: the
# lattice delta's list for a listed entry, the lattice's own for every other.
import sys
p = sys.argv[1] + "/tools/check-lattice-projection-v1.mjs"
t = open(p, encoding="utf-8").read()
def sub(a, b, n=1):
    global t
    if t.count(a) != n: sys.exit("patch-07: expected %d of: %s (found %d)" % (n, a[:100], t.count(a)))
    t = t.replace(a, b)
sub("""//       every graded word place reads exactly the cards that name its own
//       verse. Without the lattice that half says it was not judged.""",
    """//       every graded word place reads exactly the cards that name its own
//       verse. Without the lattice that half says it was not judged. Where
//       the sidecar says it was read with the corpus lane's delta over the
//       lattice (lattice-delta-rule-v1, relay v208), the cards that name a
//       listed entry's verse are the delta's list, read from the lists
//       where this machine holds them (--lattice-delta <dir>, or
//       LATTICE_DELTA_DIR); a book whose sidecar says the delta is not
//       judged without them, and that is said.""")
sub("""import { isSidecar } from "./zones-on-disk-v1.mjs";
""", """import { isSidecar } from "./zones-on-disk-v1.mjs";
import { PinFault } from "./pinned-v1.mjs";
import { LATTICE_DELTA_HOME, readLatticeDelta } from "./lattice-delta-v1.mjs";
""")
sub("""const LATTICE = arg("lattice", process.env.LATTICE_DIR || null);
""", """const LATTICE = arg("lattice", process.env.LATTICE_DIR || null);
// the lists of the delta over it, where this machine holds them: L4c reads a listed entry's names from them
const LATTICE_DELTA = arg("lattice-delta", process.env.LATTICE_DELTA_DIR || null);
const NO_LINES = new Map();
let booksNotReadForTheDelta = 0;
""")
sub("""  if (LATTICE && existsSync(join(LATTICE, `positions-${slug}-v12.jsonl.gz`))) {
    booksRead += 1;
    let wrong = 0;
    const rl = createInterface({ input: createReadStream(join(LATTICE, `positions-${slug}-v12.jsonl.gz`)).pipe(createGunzip()), crlfDelay: Infinity });
    for await (const line of rl) {
      if (!line) continue;
      const p = JSON.parse(line);
      if (p.c0 !== "ON") continue;
      for (const m of p.megacompspan || []) {
        const gr = grades[m.surface], rg = m.route_grades, r = routes[m.key];
        if (!gr || !rg || !r) continue;
        placesRead += 1;
        const theirs = (rg.names_this_verse || []).filter((ix) => ix < r.f.length);""",
    """  // a sidecar read with the delta names a listed entry's cards from the delta's list: read here too, or the book is not judged
  let deltaNames = null, deltaUnread = false;
  if (s.delta && ((s.delta.lists || {}).names_this_verse || {}).lands) {
    if (!LATTICE_DELTA || !existsSync(LATTICE_DELTA)) deltaUnread = true;
    else { try { deltaNames = readLatticeDelta(join(K3, LATTICE_DELTA_HOME, "PIN.json"), LATTICE_DELTA, slug).names; } catch (e) { if (!(e instanceof PinFault)) throw e; note(l4c, `${slug}: ${e.message}`); deltaUnread = true; } }
  }
  if (deltaUnread && LATTICE && existsSync(join(LATTICE, `positions-${slug}-v12.jsonl.gz`))) booksNotReadForTheDelta += 1;
  if (!deltaUnread && LATTICE && existsSync(join(LATTICE, `positions-${slug}-v12.jsonl.gz`))) {
    booksRead += 1;
    let wrong = 0;
    const rl = createInterface({ input: createReadStream(join(LATTICE, `positions-${slug}-v12.jsonl.gz`)).pipe(createGunzip()), crlfDelay: Infinity });
    for await (const line of rl) {
      if (!line) continue;
      const p = JSON.parse(line);
      if (p.c0 !== "ON") continue;
      for (const [ei, m] of (p.megacompspan || []).entries()) {
        const gr = grades[m.surface], rg = m.route_grades, r = routes[m.key];
        if (!gr || !rg || !r) continue;
        placesRead += 1;
        const listed = deltaNames ? (deltaNames.get(p.j) || NO_LINES).get(ei) || null : null;
        const theirs = ((listed ? listed.names_this_verse : rg.names_this_verse) || []).filter((ix) => ix < r.f.length);""")
sub("""if (!booksRead) console.log(`  --  L4c's second half was not judged here: the corpus lane's lattice is not on this machine (--lattice <dir> or LATTICE_DIR), so no word place was read against the lattice's own list for its verse`);""",
    """if (booksNotReadForTheDelta) console.log(`  --  L4c's second half was not judged for ${booksNotReadForTheDelta} book(s) whose sidecar was read with the lattice delta: its lists are not on this machine (--lattice-delta <dir> or LATTICE_DELTA_DIR)`);
else if (!booksRead) console.log(`  --  L4c's second half was not judged here: the corpus lane's lattice is not on this machine (--lattice <dir> or LATTICE_DIR), so no word place was read against the lattice's own list for its verse`);""")
open(p, "w", encoding="utf-8").write(t)
print("patch-07 ok")
