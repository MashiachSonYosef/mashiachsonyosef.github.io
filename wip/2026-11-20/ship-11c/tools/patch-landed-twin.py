# Ship 11c: a row landed back under the key a struck row's words stand under is that struck row's twin.
# tools/apply-row-entries-v1.mjs gives it what the struck row's line alone said (as it gives a twin that has a line),
# counts it, and records the pair; tools/check-entry-gate-v1.mjs holds such a row to its landing's facts and what
# the index says it was given. Usage: python3 patch-landed-twin.py <apply-row-entries-v1.mjs> <check-entry-gate-v1.mjs>
import sys
tool, check = sys.argv[1], sys.argv[2]
t = open(tool, encoding="utf-8").read()
def rep(old, new, count=1):
    global t
    assert t.count(old) == count, (t.count(old), old[:90])
    t = t.replace(old, new)

# ---- the tool ----
rep("""const given = [];   // each pair: the struck row, its twin, what the twin was given
let struckWithATwin = 0;
""", """const given = [];   // each pair: the struck row, its twin, what the twin was given
let struckWithATwin = 0;
// the struck rows no line of the ledger answers under their twin key: a round may have landed their words back there
// since the ledger was read (the corpus lane's returns, relay v200); the walk meets such a row and gives it the same
const twinsAwaited = new Map();   // the twin key, source and words -> those struck rows' lines
let landedTwins = new Map();      // a struck row's line -> the ranks of the rows landed since that are its twins
let givenAtLanding = [];          // each pair, as above, whose twin is a row landed since
""")
rep("""  if (!ids.length) continue;   // no row of its own source carries its words there: the strike took the source's credit with it
  struckWithATwin += 1;
  const gains = ids.flatMap(""", """  if (!ids.length) {   // no line of its own source carries its words there: the strike took the source's credit with it, unless a round landed it back since
    const id = `${t.key}\\u0001${t.from[2]}\\u0001${t.from[3]}`;
    (twinsAwaited.get(id) || twinsAwaited.set(id, []).get(id)).push(t);
    continue;
  }
  struckWithATwin += 1;
  const gains = ids.flatMap(""")
rep("""  touched = []; noLine = []; unlistedWithFacts = []; landedRows = []; storeRows = 0; linesMet = 0;
""", """  touched = []; noLine = []; unlistedWithFacts = []; landedRows = []; storeRows = 0; linesMet = 0;
  landedTwins = new Map(); givenAtLanding = [];
""")
rep("""            want = Array.isArray(then.row) ? mineOf(then.row) : null;
            if (want) t.rows_landed_since_carrying_their_landings_facts""", """            want = Array.isArray(then.row) ? mineOf(then.row) : null;
            // landed back under the key a struck row's words stand under, it is that row's twin: its landing's
            // entries first, then those of the struck row's line that it lacks
            for (const s of twinsAwaited.get(`${k}\\u0001${m}\\u0001${sha}`) || []) {
              (landedTwins.get(s) || landedTwins.set(s, []).get(s)).push(row[0]);
              const gain = lacks(want, s.facts);
              if (!gain) continue;
              want = withGiven(want, gain);
              givenAtLanding.push({ from: s.from, to: [k, row[0], m, sha], gave: gain, struck_by: s.by.list, landed_since: true });
            }
            if (want) t.rows_landed_since_carrying_their_landings_facts""")
rep("""following(() => walk(false));
""", """following(() => walk(false));
for (const [s, ranks] of landedTwins) if (ranks.length > 1 && givenAtLanding.some((g) => g.from === s.from)) refuse(`the line of the row of ${s.from[2]} at rank ${s.from[1]} (${s.from[3]}), struck by ${s.by.list}, gives entries to its twin, and ${ranks.length} rows of ${s.from[2]} landed since carry its words under the key they stand under: which takes them is not decided`);
const twinsCounted = () => struckWithATwin + landedTwins.size, givenAll = () => [...given, ...givenAtLanding];
""")
rep("""  struck_rows_with_a_twin_of_their_own_source: struckWithATwin, entries_given_to_a_twin: given };""",
    """  struck_rows_with_a_twin_of_their_own_source: twinsCounted(), entries_given_to_a_twin: givenAll() };""")
rep("""for (const g of given) console.log(`  given: the row of ${g.from[2]} at rank ${g.from[1]} (${g.from[3]}), struck by ${g.struck_by}, gives ${JSON.stringify(g.gave)} to its twin at rank ${g.to[1]} under the key its words still stand under`);""",
    """for (const g of givenAll()) console.log(`  given: the row of ${g.from[2]} at rank ${g.from[1]} (${g.from[3]}), struck by ${g.struck_by}, gives ${JSON.stringify(g.gave)} to its twin at rank ${g.to[1]} under the key its words ${g.landed_since ? "were landed back under" : "still stand under"}`);""")
rep("""  struck_rows_with_a_twin_of_their_own_source: struckWithATwin, entries_given_to_a_twin: given.length,""",
    """  struck_rows_with_a_twin_of_their_own_source: twinsCounted(), entries_given_to_a_twin: givenAll().length,""")
open(tool, "w", encoding="utf-8").write(t)

# ---- the check ----
t = open(check, encoding="utf-8").read()
rep("""        const named = JSON.stringify(Array.isArray(then.row) ? mineOf(factsOf(then.row)) : null);
        if (got.some((g) => g !== named)) { wrong += 1; if (faults.length < 6) faults.push(`${k} ${id}: a row landed since carries ${got[0]} and its landing named ${named}`); }""",
"""        // what its landing named, then what the index says a struck row's line gave it as that row's twin
        let named = Array.isArray(then.row) ? mineOf(factsOf(then.row)) : null;
        for (const p of givenSaid) {
          if (!Array.isArray(p.to) || p.to[0] !== k || p.to[1] !== Number(rank) || String(p.to[2]) !== m || p.to[3] !== sha) continue;
          const out = {};
          for (const key of FACTS) { const all = [...((named || {})[key] || []), ...((p.gave || {})[key] || [])]; if (all.length) out[key] = all; }
          named = out; twinsGiven += 1;
        }
        named = JSON.stringify(named);
        if (got.some((g) => g !== named)) { wrong += 1; if (faults.length < 6) faults.push(`${k} ${id}: a row landed since carries ${got[0]}, and its landing and its struck row's line name ${named}`); }""")
open(check, "w", encoding="utf-8").write(t)
print("patched: a landed return is its struck row's twin")
