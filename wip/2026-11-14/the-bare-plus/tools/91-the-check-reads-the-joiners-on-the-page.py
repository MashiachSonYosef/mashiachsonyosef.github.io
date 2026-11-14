# check-sign-gap-joiner-v1: G2 tells the three shapes apart (a run's cell that is a gap and nothing else, a gap at an
# end of a line beside a piece that prints, a gap between two pieces that print), and G3 reads on the page itself the
# joiners no recording holds: a maqaf run laid in cells records each cell as its own line, so the joiners between the
# cells stand outside every line, and a line laid in its pieces records its text, not which separator shows. The
# works are chosen by their recordings, the tree is served by the check itself, and the lines are read at rest first.
# Each edit is refused unless its text stands exactly once.
# python3 -I 91-the-check-reads-the-joiners-on-the-page.py <check file>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def one(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"expected one of {old[:80]!r}, found {n}")
    s = s.replace(old, new)

one("""//   G2  the rule is met where it matters: lines that hold a gap stand in the recordings, among them lines whose
//       gap stands at an end and lines whose gap stands between two pieces that print
//
// The recordings are read off the page by the round (data/resting-lines), so this holds the page's drawing at
// every line of every work at rest. The words are found in the data, never named.
""", """//   G2  the rule is met where it matters: the recordings hold each shape a gap takes, a maqaf run's cell that is
//       a gap and nothing else, a gap at an end of a line beside a piece that prints, and a gap between two pieces
//       that print
//   G3  the joiners no recording holds, read on the page itself. A maqaf run laid in cells is recorded cell by
//       cell, and the joiners between its cells stand outside every line; a line laid in its pieces is recorded by
//       its text, which does not say which of its separators shows. So the works are opened as a first visit opens
//       them, on the tree this check serves itself, the shortest first among those whose recordings hold all three
//       shapes, until runs and laid lines with a gap have both been judged; once a work's lines are at rest, every
//       separator of every run and every laid line shows "+" exactly where a joiner stands between two pieces that
//       print, and shows nothing beside a gap, and every gap keeps its slot
//
// The recordings are read off the page by the round (data/resting-lines), so G1 holds the page's drawing at every
// line of every work at rest, and G3 the joiners between the pieces of the lines it lays. The words are found in
// the data, never named.
""")

one("""import { RESTING_DIR, readRecord } from "./resting-lines-v1.mjs";
""", """import { RESTING_DIR, readRecord, linesOnPage } from "./resting-lines-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
""")

one("""const g1 = { works: 0, lines: 0, withGap: 0, faults: [] };
const g2 = { atEnd: 0, between: 0 };
""", """const g1 = { works: 0, lines: 0, withGap: 0, faults: [] };
const g2 = { cell: 0, atEnd: 0, between: 0 };
const shapes = [];   // per work: its lines at rest, and how many of each shape its recording holds
""")

one("""  g1.works += 1;
  const work = f.slice(0, -".json.gz".length);
  for (const [label, lines] of rec.sections) for (const line of lines || []) {
    g1.lines += 1;
    const text = String(line[2] ?? "");
    if (!text.includes(GAP)) continue;
    g1.withGap += 1;
    const pieces = piecesOf(text);
    if (drawn(pieces) !== text && g1.faults.length < 40) g1.faults.push(`${work} ${label}: «${shown(text)}» draws «${shown(drawn(pieces))}»`);
    const at = pieces.map((x, i) => (isGap(x) ? i : -1)).filter((i) => i >= 0);
    if (at.some((i) => i === 0 || i === pieces.length - 1)) g2.atEnd += 1;
    if (at.some((i) => pieces.slice(0, i).some((y) => !isGap(y)) && pieces.slice(i + 1).some((y) => !isGap(y)))) g2.between += 1;
  }
}
""", """  g1.works += 1;
  const work = f.slice(0, -".json.gz".length);
  const mine = { work, lines: 0, cell: 0, atEnd: 0, between: 0 };
  for (const [label, lines] of rec.sections) for (const line of lines || []) {
    g1.lines += 1; mine.lines += 1;
    const text = String(line[2] ?? "");
    if (!text.includes(GAP)) continue;
    g1.withGap += 1;
    const pieces = piecesOf(text);
    if (drawn(pieces) !== text && g1.faults.length < 40) g1.faults.push(`${work} ${label}: «${shown(text)}» draws «${shown(drawn(pieces))}»`);
    if (pieces.every(isGap)) { mine.cell += 1; continue; }
    const at = pieces.map((x, i) => (isGap(x) ? i : -1)).filter((i) => i >= 0);
    if (at.some((i) => i === 0 || i === pieces.length - 1)) mine.atEnd += 1;
    if (at.some((i) => pieces.slice(0, i).some((y) => !isGap(y)) && pieces.slice(i + 1).some((y) => !isGap(y)))) mine.between += 1;
  }
  for (const k of ["cell", "atEnd", "between"]) g2[k] += mine[k];
  shapes.push(mine);
}
""")

one("""check("G2  the rule is met where it matters: lines whose gap stands at an end, and lines whose gap stands between two pieces that print", g2.atEnd > 0 && g2.between > 0,
  `${nf(g2.atEnd)} with a gap at an end · ${nf(g2.between)} with a gap between two pieces that print`);
""", """check("G2  the rule is met where it matters: a run's cell that is a gap, a gap at an end of a line, a gap between two pieces that print", g2.cell > 0 && g2.atEnd > 0 && g2.between > 0,
  `${nf(g2.cell)} cells that are a gap · ${nf(g2.atEnd)} lines with a gap at an end beside a piece that prints · ${nf(g2.between)} with a gap between two pieces that print`);

// ---- G3: the joiners between the pieces the page lays, read on the page ----------------------------------------
/** IN THE PAGE. Every separator of every maqaf run laid in cells and of every line laid in its pieces, judged by the
 *  rule against the pieces beside it; and every gap, whether it keeps its slot. Handed to the browser whole. */
const joinersInPage = () => {
  const G = String.fromCharCode(0x200b);
  const showing = (el) => getComputedStyle(el).display !== "none";
  const r = { signs: window.__signs || null, runs: 0, runsWithGap: 0, laid: 0, laidWithGap: 0, separators: 0, gapsWithoutSlot: 0, faults: [] };
  const where = (el) => { const sec = el.closest("section.seg"); return (sec && sec.querySelector(".vnum") || {}).textContent || "?"; };
  const judge = (box, pieceClass, sepClass, joiner) => {
    const kids = [...box.children];
    const pieces = kids.filter((k) => k.classList.contains(pieceClass));
    const gap = pieces.map((k) => k.classList.contains("gap") || (k.textContent || "").trim() === G);
    let at = 0;
    for (const k of kids) {
      if (k.classList.contains(pieceClass)) { if (gap[at] && (!showing(k) || k.getBoundingClientRect().width <= 0)) r.gapsWithoutSlot += 1; at += 1; continue; }
      if (!k.classList.contains(sepClass)) continue;
      r.separators += 1;
      const stands = !gap[at] && gap.slice(0, at).some((g) => !g);
      const shows = showing(k) && (k.textContent || "") !== "";
      const right = stands ? shows && k.textContent === joiner : !shows;
      if (!right && r.faults.length < 6) r.faults.push(`${where(box)}: the separator before piece ${at + 1} ${stands ? "does not show" : "shows beside a gap"} («${pieces.map((x, j) => (gap[j] ? "[gap]" : x.textContent)).join(" | ")}»)`);
    }
    return gap.some(Boolean);
  };
  for (const g of document.querySelectorAll(".he-text .g.parts")) { r.runs += 1; if (judge(g, "g-part", "g-sep", "+")) r.runsWithGap += 1; }
  for (const row of document.querySelectorAll(".he-text .g > .g-pcs")) { r.laid += 1; if (judge(row, "g-pc", "g-pp", " + ")) r.laidWithGap += 1; }
  return r;
};
const g3 = { opened: [], runs: 0, runsWithGap: 0, laid: 0, laidWithGap: 0, separators: 0, gapsWithoutSlot: 0, faults: [], notOff: [] };
const candidates = shapes.filter((x) => x.cell > 0 && x.atEnd > 0 && x.between > 0).sort((a, b) => a.lines - b.lines || (a.work < b.work ? -1 : 1));
const tree = await serveTree(K3);
const browser = await (await loadPlaywright()).chromium.launch(launchOptions());
try {
  for (const { work } of candidates) {
    if (g3.opened.length >= 6 || (g3.opened.length >= 2 && g3.runsWithGap > 0 && g3.laidWithGap > 0)) break;
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
    try {
      const p = await ctx.newPage();
      await p.goto(`${tree.base}/zone.html?b=${work}`, { waitUntil: "networkidle", timeout: 120000 });
      await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      await linesOnPage(p);
      // the lines are at rest; the pieces are read until two readings agree
      let last = "", got = null;
      for (let i = 0; i < 20; i += 1) { got = await p.evaluate(joinersInPage); const now = JSON.stringify(got); if (now === last) break; last = now; await p.waitForTimeout(350); }
      g3.opened.push(work);
      if (got.signs !== "off") g3.notOff.push(`${work}: ${got.signs}`);
      for (const k of ["runs", "runsWithGap", "laid", "laidWithGap", "separators", "gapsWithoutSlot"]) g3[k] += got[k];
      for (const x of got.faults) if (g3.faults.length < 12) g3.faults.push(`${work} ${x}`);
    } finally { await ctx.close(); }
  }
} finally { await browser.close(); await tree.close(); }
check("G3  on the page, each separator between the pieces of a run or a laid line shows only between two pieces that print, and every gap keeps its slot",
  g3.opened.length > 0 && !g3.notOff.length && g3.runsWithGap > 0 && g3.laidWithGap > 0 && !g3.faults.length && !g3.gapsWithoutSlot,
  g3.notOff.length ? `the signs switch was not off: ${first(g3.notOff)}`
    : g3.faults.length ? `${g3.faults.length}${g3.faults.length >= 12 ? " or more" : ""} · ${first(g3.faults, 3).split(GAP).join("[gap]")}`
    : `${g3.opened.join(", ")} · ${nf(g3.runs)} runs, ${nf(g3.runsWithGap)} with a gap · ${nf(g3.laid)} laid lines, ${nf(g3.laidWithGap)} with a gap · ${nf(g3.separators)} separators · ${nf(g3.gapsWithoutSlot)} gaps without their slot`);
""")
open(p, "w", encoding="utf-8").write(s)
print("check-sign-gap-joiner-v1.mjs: 6 edits")
