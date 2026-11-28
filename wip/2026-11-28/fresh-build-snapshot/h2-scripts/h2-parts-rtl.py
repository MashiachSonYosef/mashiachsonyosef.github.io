# Scratch (builder H2), run once on tools/place-card-v1.mjs: a row of a word's parts under «At this word» (STEP's
# parts, MACULA's morphs) reads right to left, the part the record puts first furthest right, by the live reader's own
# law (parts-direction-rule-v1, tools/check-parts-read-right-to-left-v1.mjs). Each part keeps its Hebrew and then its
# English, left to right inside it; the parts and their joiners run right to left; the document order is unchanged.
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def once(old, new):
    global s
    assert s.count(old) == 1, old[:70]
    s = s.replace(old, new)
once('''  const joinPlus = (nodes) => { const out = []; nodes.forEach((n, i) => { if (i) out.push(el("span", "plus", "+")); out.push(n); }); return out; };''',
'''  const joinPlus = (nodes) => { const out = []; nodes.forEach((n, i) => { if (i) out.push(el("span", "plus", "+")); out.push(n); }); return out; };
  /** A row of a word's parts, in the record's order: the parts run right to left, as Hebrew does, so the part the
   *  record puts first stands furthest right (the live reader's law, parts-direction-rule-v1); each part reads its
   *  Hebrew and then its English, left to right inside it. */
  const partsLine = (parts) => { const p = el("p", "line parts", ...joinPlus(parts.map((x) => { x.classList.add("part"); return x; }))); p.dir = "rtl"; return p; };''')
once('''      row.append(el("p", "line", ...joinPlus(t.p.map((p) => el("span", "", he(p[3]), " ", p[0] === null ? el("span", "gap", "(no English given)") : rd(p[0].trim()))))));''',
'''      row.append(partsLine(t.p.map((p) => el("span", "", he(p[3]), " ", p[0] === null ? el("span", "gap", "(no English given)") : rd(p[0].trim())))));''')
once('''      row.append(el("p", "line", ...joinPlus(t.other.map((p) => el("span", "", he(p[0]), " ", p[1] === null ? "" : rd(p[1].trim()))))), el("p", "sub",''',
'''      row.append(partsLine(t.other.map((p) => el("span", "", he(p[0]), " ", p[1] === null ? "" : rd(p[1].trim())))), el("p", "sub",''')
once('''      row.append(el("p", "line", ...joinPlus(m.map((x) => el("span", "", he(x[2]), " ", rd(x[1]), x[0] && dotted(x) !== x[1] ? el("small", "ctx", ` ${dotted(x)}`) : "")))));''',
'''      row.append(partsLine(m.map((x) => el("span", "", he(x[2]), " ", rd(x[1]), x[0] && dotted(x) !== x[1] ? el("small", "ctx", ` ${dotted(x)}`) : ""))));''')
once('''    [".row .line .he", "font-size: 1.2rem;"],''', '''    [".row .line .he", "font-size: 1.2rem;"],
    [".row .line.parts", "direction: rtl; text-align: left;"],
    [".row .line.parts > .part", "direction: ltr; unicode-bidi: isolate;"],''')
open(p, "w", encoding="utf-8").write(s)
print("parts run right to left")
