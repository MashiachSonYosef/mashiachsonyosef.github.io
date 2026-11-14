# check-sign-gap-joiner-v1, G3: a joiner the page does not draw must move nothing it does draw. A run's line is let
# down to fit its column (fitRunLine); on 14 November 2026 the hidden joiner beside a gap was counted there as a
# second row and every run that holds a gap was drawn at four fifths of its size, which no reading of the separators
# shows. So each opened work's runs are fitted again by the page's own redraw (__drawAllTies) with the hidden joiners
# in place and again with them taken out of the page, and every run must come out the same size both times.
# Each edit is refused unless its text stands exactly once.
# python3 -I 93-the-check-holds-a-runs-size-to-what-it-draws.py <check file>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:80]!r}, found {n}")
    s = s.replace(old, new)

one("""//       separator of every run and every laid line shows "+" exactly where a joiner stands between two pieces that
//       print, and shows nothing beside a gap, and every gap keeps its slot
""", """//       separator of every run and every laid line shows "+" exactly where a joiner stands between two pieces that
//       print, and shows nothing beside a gap; every gap keeps its slot; and a joiner the page does not draw moves
//       nothing it draws: each run is fitted to its column again by the page's own redraw with the hidden joiners in
//       place and with them taken out, and comes out the same size both times (on 14 November 2026 a hidden joiner
//       was counted as a second row of its run, and every run that holds a gap was drawn at four fifths of its size)
""")

one("""const g3 = { opened: [], runs: 0, runsWithGap: 0, laid: 0, laidWithGap: 0, separators: 0, gapsWithoutSlot: 0, faults: [], notOff: [] };
""", """const g3 = { opened: [], runs: 0, runsWithGap: 0, laid: 0, laidWithGap: 0, separators: 0, gapsWithoutSlot: 0, faults: [], notOff: [], refitted: 0, noRedraw: [] };
/** IN THE PAGE. Every run's line, where it stands and the size it is drawn at. */
const runSizes = () => [...document.querySelectorAll(".he-text .wjoin > .g.parts")].map((g) => { const sec = g.closest("section.seg"); return [(sec && sec.querySelector(".vnum") || {}).textContent || "?", getComputedStyle(g).fontSize]; });
""")

one("""      g3.opened.push(work);
      if (got.signs !== "off") g3.notOff.push(`${work}: ${got.signs}`);
""", """      g3.opened.push(work);
      if (got.signs !== "off") g3.notOff.push(`${work}: ${got.signs}`);
      // every run fitted again by the page's own redraw, with the joiners it does not draw and without them
      if (await p.evaluate(() => typeof window.__drawAllTies !== "function")) g3.noRedraw.push(work);
      else {
        const fitted = async () => {
          await p.evaluate(() => { window.__tieMs = null; window.__drawAllTies(); });
          await p.waitForFunction(() => !!window.__tieMs, null, { timeout: 30000 });
          return p.evaluate(runSizes);
        };
        const withThem = await fitted();
        await p.evaluate(() => { for (const x of document.querySelectorAll(".he-text .g-sep.at-gap, .he-text .g-pp.at-gap")) x.remove(); });
        const without = await fitted();
        g3.refitted += withThem.length;
        withThem.forEach(([label, size], i) => {
          const other = without[i] ? without[i][1] : "gone";
          if (size !== other && g3.faults.length < 12) g3.faults.push(`${work} ${label}: a run drawn at ${size} with the joiners the page hides and at ${other} without them`);
        });
      }
""")

one("""check("G3  on the page, each separator between the pieces of a run or a laid line shows only between two pieces that print, and every gap keeps its slot",
  g3.opened.length > 0 && !g3.notOff.length && g3.runsWithGap > 0 && g3.laidWithGap > 0 && !g3.faults.length && !g3.gapsWithoutSlot,
  g3.notOff.length ? `the signs switch was not off: ${first(g3.notOff)}`
""", """check("G3  on the page, each separator between the pieces of a run or a laid line shows only between two pieces that print, every gap keeps its slot, and a hidden joiner moves nothing drawn",
  g3.opened.length > 0 && !g3.notOff.length && !g3.noRedraw.length && g3.runsWithGap > 0 && g3.laidWithGap > 0 && g3.refitted > 0 && !g3.faults.length && !g3.gapsWithoutSlot,
  g3.notOff.length ? `the signs switch was not off: ${first(g3.notOff)}`
    : g3.noRedraw.length ? `the page offers no __drawAllTies to fit its runs again: ${first(g3.noRedraw)}`
""")

one("""    : `${g3.opened.join(", ")} · ${nf(g3.runs)} runs, ${nf(g3.runsWithGap)} with a gap · ${nf(g3.laid)} laid lines, ${nf(g3.laidWithGap)} with a gap · ${nf(g3.separators)} separators · ${nf(g3.gapsWithoutSlot)} gaps without their slot`);
""", """    : `${g3.opened.join(", ")} · ${nf(g3.runs)} runs, ${nf(g3.runsWithGap)} with a gap · ${nf(g3.laid)} laid lines, ${nf(g3.laidWithGap)} with a gap · ${nf(g3.separators)} separators · ${nf(g3.gapsWithoutSlot)} gaps without their slot · ${nf(g3.refitted)} runs fitted again, each the same size without the hidden joiners`);
""")
open(p, "w", encoding="utf-8").write(s)
print("check-sign-gap-joiner-v1.mjs: 5 edits")
