# check-block-in-table-v1: its wait for the concordance row gave up after 8 seconds in silence, and the check then
# judged the row that was not there as a wrong row (14 November 2026, the first run after a restart of the machine:
# «row 0 blocks, reads [], the line ["from","Tekoa"]», «the row NaN, the store 0»; the same check passed alone twice
# under the same load). The wait now runs to 20 seconds and says whether the row came, and B2 and B3 say "the row
# never came" where it did not, instead of a reading of nothing. Refused unless each text stands exactly once.
# python3 -I 96-the-block-check-says-when-the-row-never-came.py <check file>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:80]!r}, found {n}")
    s = s.replace(old, new)
one("""const settle = async (p) => { await p.waitForTimeout(700); await p.waitForFunction(() => { const tr = document.querySelector("#hud .dict-tab tbody tr.pick"); return !!tr; }, null, { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(500); };
""", """// the card and its concordance row given time to stand: true where the row came, false where it did not come in 20
// seconds (a machine just started reads its first shards slowly), so a row that is not there is said to be missing,
// never judged as a row that reads nothing
const settle = async (p) => {
  await p.waitForTimeout(700);
  const came = await p.waitForFunction(() => !!document.querySelector("#hud .dict-tab tbody tr.pick"), null, { timeout: 20000 }).then(() => true, () => false);
  await p.waitForTimeout(500);
  return came;
};
""")
one("""      await settle(p);
      r = await read(p);
      const piece = spanJoin(r.parts[j] || "").toLowerCase();""", """      const rowCame = await settle(p);
      r = await read(p);
      const piece = spanJoin(r.parts[j] || "").toLowerCase();""")
one("""      const wantHe = r.blocks.map((x) => x.t);
      const wantPieces = r.parts.map((x, k) => (k === j ? r.rowPill : x));
      if (JSON.stringify(r.rowHeParts) !== JSON.stringify(wantHe) || JSON.stringify(r.rowPieces) !== JSON.stringify(wantPieces))
        b2.push(`${tag}: row ${JSON.stringify(r.rowHeParts.length)} blocks, reads ${JSON.stringify(r.rowPieces)}, the line ${JSON.stringify(r.parts)}`);
      const want3 = await storeCount(r.blocks[j].L, r.rowPill);
      if (r.count !== want3) b3.push(`${tag} "${r.rowPill}": the row ${r.count}, the store ${want3}`);""", """      const wantHe = r.blocks.map((x) => x.t);
      const wantPieces = r.parts.map((x, k) => (k === j ? r.rowPill : x));
      if (!rowCame) { b2.push(`${tag}: the concordance row never came (20 s)`); b3.push(`${tag}: the concordance row never came, so no count was read`); }
      else {
        if (JSON.stringify(r.rowHeParts) !== JSON.stringify(wantHe) || JSON.stringify(r.rowPieces) !== JSON.stringify(wantPieces))
          b2.push(`${tag}: row ${JSON.stringify(r.rowHeParts.length)} blocks, reads ${JSON.stringify(r.rowPieces)}, the line ${JSON.stringify(r.parts)}`);
        const want3 = await storeCount(r.blocks[j].L, r.rowPill);
        if (r.count !== want3) b3.push(`${tag} "${r.rowPill}": the row ${r.count}, the store ${want3}`);
      }""")
open(p, "w", encoding="utf-8").write(s)
print("check-block-in-table-v1.mjs: 3 edits")
