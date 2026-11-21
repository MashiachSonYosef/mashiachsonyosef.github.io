# Ship 10b, patch 3: zone.html: a run's card standing word by word says a unit's reading once, as the line under
# the run prints it (the card said «Bethel · sense 1 + Bethel · sense 1» on live at the units the page could tell).
import sys, io
p = sys.argv[1] + "/zone.html"
s = io.open(p, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)

rep(r'''    const coverText = () => (setWhole ? spanJoin(placeSet.text) : cover.map((c, i) => formOfText(c.surface, textOfCell(c.surface, i), bin === zone && openName === false && pointingNow(openPointed) === "only")).join(" + "));
''', r'''    // ONE UNIT A SOURCE READS AT EVERY WORD OF IT IS SAID ONCE (dfltUnitOf; default-spans-rule-v1). On a run's card
    // standing word by word, the cells of a unit, each reading the unit's line as the line under the run prints
    // it, are one reading: the line draws one part over them (refreshJoinGloss), and the card says it once. It
    // said the reading at every cell: BDB's «Bethel» twice at Amos 3:14:10-11 on live, where the line under the
    // run read it once. A cell the reader pressed a reading on is its own, and so is one whose words differ
    const saidOnce = (texts) => {
      if (!opts.run || bin !== zone || !opts.run.words || texts.length !== cover.length) return texts;
      const out = [];
      for (let i = 0; i < cover.length; i += 1) {
        out.push(texts[i]);
        const w = cover[i].from === cover[i].to && !picked.get(cover[i].surface) ? opts.run.words[cover[i].from] : null;
        const u = w ? dfltUnitOf(w) : null;
        if (!u || u[0] !== w || !defaultAt(w)) continue;
        let j = i + 1;
        while (j < cover.length && j - i < u.length && cover[j].from === cover[j].to && opts.run.words[cover[j].from] === u[j - i] && !picked.get(cover[j].surface) && texts[j] === texts[i]) j += 1;
        if (j - i === u.length) i = j - 1;
      }
      return out;
    };
    const coverText = () => (setWhole ? spanJoin(placeSet.text) : saidOnce(cover.map((c, i) => formOfText(c.surface, textOfCell(c.surface, i), bin === zone && openName === false && pointingNow(openPointed) === "only"))).join(" + "));
''')
rep(r'''paintNow(cover.map((c, i) => textOfCell(c.surface, i)).join(" + ")''', r'''paintNow(saidOnce(cover.map((c, i) => textOfCell(c.surface, i))).join(" + ")''', 3)
io.open(p, "w", encoding="utf-8").write(s)
print("patched", p)
