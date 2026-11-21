# Ship 12, patch 6: the landings' check holds a list of holes to its own rule: a line that names a rank names the
# hole its row left; the struck-ranks record holds that rank for that source under that key; the row stands at the
# hole, or, where another row stands at the hole now, after the last row and the last typed hole of its key.
import io, sys
p = sys.argv[1] + "/tools/check-landings-v1.mjs"; s = io.open(p, encoding="utf-8").read()
old = """//   G3  one round of the row-strikes record took each derived list whole"""
new = """//       In a list of holes (the pin: a_named_rank_is "the hole the strike left"; the corpus lane's v207) a line
//       that names a rank names the hole its row left when its source was struck: the struck-ranks record holds
//       that rank for that source under that key, and the row lands at it, or, where a row of another record
//       stands at the hole now, past every row and every typed hole its key had before the list landed
//   G3  one round of the row-strikes record took each derived list whole"""
assert s.count(old) == 1; s = s.replace(old, new)
old = """import { readFileSync, existsSync } from "node:fs";
"""
new = """import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
"""
assert s.count(old) == 1; s = s.replace(old, new)
old = """        if (e.rank !== null && e.rank !== x.rank) faults.push(`${where}: line ${n} names rank ${e.rank}, and the row lands at ${x.rank}`);
"""
new = """        if (l.a_named_rank_is === HOLE) {
          // a list of holes: the hole is this source's by the record of the strike; the row is at it, or the hole is another row's now
          if (e.rank !== null) {
            const holeKey = typeof e.from_key === "string" && e.from_key ? e.from_key : e.key;
            if (!(struckAt().get(holeKey) || new Set()).has(`${e.rank}\\u0001${e.m}`)) faults.push(`${where}: line ${n} names rank ${e.rank} as the hole its row left, and the struck-ranks record holds no such rank of ${e.m} under its key`);
            else if (e.rank === x.rank) { if (holeKey !== e.key) faults.push(`${where}: line ${n} was moved off the key of its hole and lands at the hole's rank all the same`); else atHole += 1; }
            else {
              const typed = [...(struckAt().get(e.key) || [])].map((y) => Number(y.split("\\u0001")[0]));
              const taker = (store.routesWhole(e.key) || []).some((row) => Number(row[0]) === e.rank && !(String(row[3]) === e.m && row[1] === e.route));
              if (holeKey === e.key && !taker) faults.push(`${where}: line ${n} names rank ${e.rank}, the row lands at ${x.rank}, and no other row stands at the hole`);
              else if (typed.some((t) => t >= x.rank)) faults.push(`${where}: line ${n} lands at ${x.rank}, which is not past the last typed hole of its key (${Math.max(...typed)})`);
              else holeTaken += 1;
            }
          } else noRank += 1;
        } else if (e.rank !== null && e.rank !== x.rank) faults.push(`${where}: line ${n} names rank ${e.rank}, and the row lands at ${x.rank}`);
"""
assert s.count(old) == 1; s = s.replace(old, new)
old = """// ---- G2: every line accounted for once"""
new = """// the ranks the struck-ranks record types, key by key, each with the source that stood there (read once, when a list of holes asks)
const HOLE = "the hole the strike left";
let struckRanks = null;
const struckAt = () => {
  if (struckRanks) return struckRanks;
  struckRanks = new Map();
  const sp = join(STORE, "struck-ranks-v1.json.gz");
  if (existsSync(sp)) for (const [k, v] of Object.entries(JSON.parse(gunzipSync(readFileSync(sp)).toString("utf8")).keys || {})) struckRanks.set(k, new Set(v.map((y) => `${y[0]}\\u0001${y[1]}`)));
  return struckRanks;
};
let atHole = 0, holeTaken = 0, noRank = 0;

// ---- G2: every line accounted for once"""
assert s.count(old) == 1; s = s.replace(old, new)
old = "· ${nf([...READ.values()].reduce((a, g) => a + g.notLanded.length, 0))} not landed`);"
assert s.count(old) == 1
s = s.replace(old, "· ${nf([...READ.values()].reduce((a, g) => a + g.notLanded.length, 0))} not landed${atHole + holeTaken + noRank ? ` · in the lists of holes: ${nf(atHole)} rows at the hole the strike left, ${nf(holeTaken)} whose hole another row holds now, ${nf(noRank)} with no rank named` : \"\"}`);")
io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p)
