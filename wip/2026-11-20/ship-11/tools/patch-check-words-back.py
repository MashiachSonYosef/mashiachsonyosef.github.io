# Ship 11: check-words-back-v1 W2 follows the facts' own writers. A fact of slot 10 may differ from the row the
# words-back round took only where the tool that writes that fact has run since the round (names v2 marks 259 of
# the unabridged BDB's retexted rows a name). Usage: python3 patch-check-words-back.py <tools/check-words-back-v1.mjs>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def swap(old, new, n=1):
    global s
    assert s.count(old) == n, (s.count(old), old[:70])
    s = s.replace(old, new)

swap("""//       9 as the list gives it (its closes on both halves, or none), slots
//       0, 3 to 6 and 10 byte for byte the row the round took, and it prints
//       (as the note of the sense it opens) the list's printed text
""", """//       9 as the list gives it (its closes on both halves, or none), slots
//       0 and 3 to 6 byte for byte the row the round took, slot 10 its facts
//       as the round took them but for a fact whose own writer has run since
//       the round (FACTS_WRITTEN_BY names the writer, the store's index the
//       day it last ran: names v2 of 20 November marks 259 of these rows a
//       name; that fact is its writer's check's to judge), and it prints (as
//       the note of the sense it opens) the list's printed text
""")
swap('import { routePrinted, CLOSES_SLOT, FACTS_SLOT } from "./gloss-store-v1.mjs";',
     'import { routePrinted, factsOf, CLOSES_SLOT, FACTS_WRITTEN_BY } from "./gloss-store-v1.mjs";')
swap("""  let met = 0, closed = 0;
  if (!R) faults.push(""", """  let met = 0, closed = 0;
  // a fact its own writer has laid again since the round is that writer's to answer for, and its check's to judge
  const writtenSince = (fact) => { const by = FACTS_WRITTEN_BY[fact], at = by && index[by] ? index[by].applied_on : null; return !!R && !!at && String(at) > String(R.ran_at); };
  const since = {};
  if (!R) faults.push(""")
swap("""    for (const s of [0, 3, 4, 5, 6, FACTS_SLOT]) if (!same(row[s] ?? null, old[s] ?? null)) faults.push(`${where}: slot ${s} is not the row the round took (${JSON.stringify(row[s] ?? null).slice(0, 40)} for ${JSON.stringify(old[s] ?? null).slice(0, 40)})`);
""", """    for (const s of [0, 3, 4, 5, 6]) if (!same(row[s] ?? null, old[s] ?? null)) faults.push(`${where}: slot ${s} is not the row the round took (${JSON.stringify(row[s] ?? null).slice(0, 40)} for ${JSON.stringify(old[s] ?? null).slice(0, 40)})`);
    const has = factsOf(row) || {}, had = factsOf(old) || {};
    for (const fact of new Set([...Object.keys(has), ...Object.keys(had)])) {
      if (same(has[fact], had[fact])) continue;
      if (writtenSince(fact)) { since[fact] = (since[fact] || 0) + 1; continue; }
      faults.push(`${where}: its fact ${fact} is not the row the round took (${JSON.stringify(has[fact] ?? null).slice(0, 40)} for ${JSON.stringify(had[fact] ?? null).slice(0, 40)}), and no run of its writer since the round accounts for it`);
    }
""")
swap("""slot 9 as the list gives it, slots 0, 3 to 6 and 10 the row the round took, and it prints the list's printed text",
    !!R && faults.length === 0 && met === RETEXT.length && met > 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(met)} rows · ${nf(closed)} carry closes`);""",
"""slot 9 as the list gives it, slots 0 and 3 to 6 the row the round took, its facts the round's but for a fact its own writer has laid since, and it prints the list's printed text",
    !!R && faults.length === 0 && met === RETEXT.length && met > 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(met)} rows · ${nf(closed)} carry closes · ${Object.keys(since).length ? Object.keys(since).sort().map((f) => `${nf(since[f])} carry another ${f} than the round took, laid since by ${FACTS_WRITTEN_BY[f]}`).join(" · ") : "every fact as the round took it"}`);""")
open(p, "w", encoding="utf-8").write(s)
print("patched", p)
