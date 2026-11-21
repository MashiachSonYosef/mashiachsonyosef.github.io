# Ship 10b, patch 4: tools/check-default-picks-v1.mjs: the check's model of the page reads a source's unit from the
# book file's spans, as the page does (default-spans-rule-v1): a unit's words take its one line, a line filed beside
# its words is not that word's, a run takes the source where every word's first line is the source's, and a unit is
# drawn once in one run or rests apart.
import sys, io
p = sys.argv[1] + "/tools/check-default-picks-v1.mjs"
s = io.open(p, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)

rep('''//       2026: BDB's «Bethel · sense 1» under both words of Amos 3:14:10-11);
//       where they stand apart each keeps today's line
''', '''//       2026: BDB's «Bethel · sense 1» under both words of Amos 3:14:10-11);
//       where they stand apart each keeps today's line. A unit the book's
//       file gives from the source's own data (spans, default-spans-rule-v1:
//       the words its first pick's line reads) is that unit before these
//       marks are asked: its words take its one line, read where it is
//       filed, and a line filed beside the words it reads is not printed
//       where it is filed (tools/check-default-spans-v1.mjs holds the spans
//       themselves and reads every book)
''')

# the spans of a book, as the page reads them
rep('''const layerAt = (b, X, Y, p, bare = false) => {
  if (!p || p.mark) return null;
''', '''/** THE WORDS A SOURCE'S LINE READS (default-spans-rule-v1; zone.html dfltSpans, dfltSpanRead, dfltSpanWhole): per
 *  book and source, the units the book's file gives that are filed with a line of the source (lineAt: the first
 *  place it is filed where the source prints one, a pair not asked, as the page's lineOf), each place of a unit to
 *  its unit, and each place a unit's line is filed at that is none of its words. `whole`: no word of it a pair. */
const spansIn = new Map();
const spansOf = (b, X) => {
  if (!spansIn.has(b)) {
    const bf = bookRead(b), ps = slim(b).places, by = {};
    for (const src of ["macula", "ubs", "bdb"]) {
      const at = new Map(), beside = new Map(), units = [];
      for (const u of ((bf.spans || {})[src]) || []) {
        if (!Array.isArray(u) || !Array.isArray(u[0]) || !Array.isArray(u[1]) || u[0].length < 2) continue;
        const lineN = u[1].find((n) => ps[n - 1] && lineAt(bf, ps[n - 1], src, false, false) !== null) || null;
        if (!lineN) continue;
        const unit = { src, ns: u[0], filed: u[1], lineAt: lineN, whole: u[0].every((n) => ps[n - 1] && !ps[n - 1].mark && !ps[n - 1].kq) };
        units.push(unit);
        for (const n of unit.ns) at.set(n, unit);
        for (const n of unit.filed) if (!unit.ns.includes(n)) beside.set(n, unit);
      }
      by[src] = { at, beside, units };
    }
    spansIn.set(b, by);
  }
  return spansIn.get(b)[X] || { at: new Map(), beside: new Map(), units: [] };
};
const layerAt = (b, X, Y, p, bare = false) => {
  if (!p || p.mark) return null;
''')

rep('''  const t1 = of(X, lineAt(bf, p, X), "first");
  if (t1) return t1;
''', '''  // a word of a unit of X's takes the unit's one line, read where it is filed; a unit with a pair in it is not
  // read, and a line filed beside the words it reads is not this word's (zone.html defaultAtWord)
  const sp = spansOf(b, X), u = sp.at.get(p.n) || null;
  if (u && u.whole) { const t = of(X, lineAt(bf, slim(b).places[u.lineAt - 1], X, false, false), "first"); if (t) return Object.assign(t, { unit: u }); }
  const t1 = u || sp.beside.has(p.n) ? null : of(X, lineAt(bf, p, X), "first");
  if (t1) return t1;
''')

rep('''const wholeAcross = (b, X, Y, p, d) => {
  const across = d ? acrossOf(b, p) : null;
''', '''const wholeAcross = (b, X, Y, p, d) => {
  // a unit of the source's own data is read by it at every word (zone.html dfltAcross)
  if (d && d.unit) return d;
  const across = d ? acrossOf(b, p) : null;
''')

rep('''      const takes = X !== "step" && run.every((p) => p && !p.mark && !p.kq && lineAt(bookRead(b), p, X) !== null);
      if (takes) for (const p of run) m.set(p.e, [p.e, 1, drawn(lineAt(bookRead(b), p, X)), MOF(X)]);
''', '''      // X's own line at a word of the run, a unit's line where the word is one of a unit's (and then only where the
      // whole unit stands in this run: a unit with a word outside it stands apart, and its words rest)
      const firstOf = (p) => {
        const d = p && !p.mark && !p.kq ? layerAt(b, X, Y, p) : null;
        return d && d.layer === "first" && d.src === X && !(d.unit && !d.unit.ns.every((n) => run.some((q) => q && q.n === n))) ? d : null;
      };
      const takes = X !== "step" && run.every((p) => firstOf(p) !== null);
      if (takes) for (const p of run) m.set(p.e, [p.e, 1, firstOf(p).line, MOF(X)]);
''')

rep('''  const bf = bookRead(b);
  for (const g of unitGroupsOf(b)) {
    if (!g.length || g.some((p) => !p || p.i !== g[0].i)) continue;
    const ds = g.map((p) => wholeAcross(b, X, Y, p, layerAt(b, X, Y, p)));
    if (!ds[0] || ds[0].src === "step" || ds.some((d) => !d || d.src !== ds[0].src || d.layer !== ds[0].layer)) continue;
    const pick = (p) => JSON.stringify((bf.places[p.n - 1] || [])[SLOT[ds[0].src]]);
    if (g.some((p) => pick(p) !== pick(g[0]))) continue;
''', '''  const bf = bookRead(b);
  // the units the book's file gives from the source's own data come first (zone.html dfltUnitOf asks them first),
  // each marked as its unit; a group told by the older marks is no unit where a word of it is one of those
  const told = spansOf(b, X).units.filter((u) => u.whole).map((u) => Object.assign(u.ns.map((n) => slim(b).places[n - 1]), { unit: u }));
  for (const g of [...told, ...unitGroupsOf(b)]) {
    if (!g.length || g.some((p) => !p || p.i !== g[0].i)) continue;
    const ds = g.map((p) => wholeAcross(b, X, Y, p, layerAt(b, X, Y, p)));
    if (!ds[0] || ds[0].src === "step" || ds.some((d) => !d || d.src !== ds[0].src || d.layer !== ds[0].layer)) continue;
    if (g.unit ? ds.some((d) => d.unit !== g.unit) : ds.some((d) => d.unit)) continue;
    const pick = (p) => JSON.stringify((bf.places[p.n - 1] || [])[SLOT[ds[0].src]]);
    if (!g.unit && g.some((p) => pick(p) !== pick(g[0]))) continue;
''')
io.open(p, "w", encoding="utf-8").write(s)
print("patched", p)
