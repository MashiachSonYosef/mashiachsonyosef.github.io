# Ship 13: tools/check-entry-gate-v1.mjs reads a lost tag as the lattice piece's own (E7, with the lattice on the machine).
import sys
p = sys.argv[1] + "/tools/check-entry-gate-v1.mjs"
t = open(p, encoding="utf-8").read()
def sub(a, b, n=1):
    global t
    if t.count(a) != n: sys.exit("patch-08: expected %d of: %s (found %d)" % (n, a[:100], t.count(a)))
    t = t.replace(a, b)
sub("""//       position, and its pieces spell the tagged form. Without the
//       lattice that half is said and not judged""",
    """//       position, and its pieces spell the tagged form (a piece the
//       read words' pin lists as having lost its tag is read with the tag
//       the list sets, as the projection reads it: relay v192.1). Without
//       the lattice that half is said and not judged""")
sub("""import { plainWord, openGatedCard } from "./gated-card-v1.mjs";
""", """import { plainWord, openGatedCard } from "./gated-card-v1.mjs";
import { READ_WORDS_HOME, readReadWords, lostTagsOf } from "./read-words-v1.mjs";
""")
sub("""  // the lattice's own positions, by verse, where it is here
  let byRef = null;""",
    """  // the tags the read words' pin lists as lost from a lattice piece of this book, by position
  const lostAt = new Map(lostTags.filter((l) => l.book === z).map((l) => [l.lattice.j, l]));
  // the lattice's own positions, by verse, where it is here
  let byRef = null;""")
sub("""          const cores = p ? (p.pieces || []).filter((x) => x && x.role === "core" && x.tag).map((x) => String(x.tag)) : null;
          const spelled = p ? (p.pieces || []).map((x) => (x && x.consonants) || "").join("") : null;
          e7.lattice += 1;""",
    """          const lost = p ? lostAt.get(p.j) || null : null;
          const pieces = p ? (p.pieces || []).map((x, ix) => (lost && ix === lost.index && x && !x.tag ? { ...x, tag: lost.tag } : x)) : null;
          const cores = p ? pieces.filter((x) => x && x.role === "core" && x.tag).map((x) => String(x.tag)) : null;
          const spelled = p ? pieces.map((x) => (x && x.consonants) || "").join("") : null;
          e7.lattice += 1; if (lost) e7.lostTags += 1;""")
open(p, "w", encoding="utf-8").write(t)
print("patch-08 ok")

# second part: the counters, the lost tags read once, and what the laws say of them
t = open(p, encoding="utf-8").read()
sub("""const e15 = { words: 0, carried: 0, faults: [] };
const e6 = { pairs: 0, rows: 0, faults: [] }, e7 = { tagged: 0, lists: 0, halves: 0, readWords: 0, faults: [], lattice: 0, latticeFaults: [], books: 0 }, e8""",
    """const e15 = { words: 0, carried: 0, faults: [] };
// the tags the read words' pin lists as lost from a lattice piece (relay v192.1): E7's lattice half reads them as the projection does
let lostTags = [];
if (existsSync(join(K3, READ_WORDS_HOME, "PIN.json"))) {
  try { const l = lostTagsOf(readReadWords(join(K3, READ_WORDS_HOME, "PIN.json"))); if (!l.faults.length) lostTags = l.tags; } catch (e) { if (!(e instanceof PinFault)) throw e; }
}
const e6 = { pairs: 0, rows: 0, faults: [] }, e7 = { tagged: 0, lists: 0, halves: 0, readWords: 0, faults: [], lattice: 0, lostTags: 0, latticeFaults: [], books: 0 }, e8""")
sub("""`${nf(e7.lattice)} tagged places read against the lattice in ${e7.books} of ${served.length} books`);""",
    """`${nf(e7.lattice)} tagged places read against the lattice in ${e7.books} of ${served.length} books${e7.lostTags ? ` (${e7.lostTags} of them by a tag the read words' pin lists as lost from its piece)` : ""}`);""")
open(p, "w", encoding="utf-8").write(t)
print("patch-08 second part ok")
