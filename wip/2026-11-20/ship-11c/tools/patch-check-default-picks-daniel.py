# check-default-picks-v1: the page model brought up to the page at four places the check first met when its third
# work became Daniel (ship 11c). Each is the page's own rule, and each failed on live too with Daniel named.
#   1. a source's own words are drawn trimmed after the closing stop is dropped («there is, are. . .»)
#   2. a pick with no words says so before its note (zone.html dfltMore: never a bare note)
#   3. a word of a unit held apart keeps the line it rests on, and that is STEP's own words where today's line is
#      bare (zone.html dfltHeldLine, ship 10)
#   4. beside a place of STEP's own words, a word the maqaf joins to it whose own reading is a sign alone is drawn as
#      the hidden sign's gap (the check's node law D5 holds the records to it; the page model now does too)
# Usage: python3 patch-check-default-picks-daniel.py <tools/check-default-picks-v1.mjs>
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new)

rep("""// the text the page draws for a source's own words: whole (the source words of spanJoin), a closing stop dropped
const drawn = (t) => String(t).trim().replace(/\\.$/u, "");""",
"""// the text the page draws for a source's own words: whole (the source words of spanJoin), a closing stop dropped,
// and read off the page with no space left at its end (BDB's «there is, are. . .»)
const drawn = (t) => String(t).trim().replace(/\\.$/u, "").trim();""")

rep("""  const one = (k, w, note) => ` · ${k}${w ? ` «${w}»` : ""}${note ? ` (${note})` : w ? "" : " (no words given)"}`;""",
"""  // a pick with no words says so before its note, never a bare note (zone.html dfltMore; the review of 14 November 2026)
  const one = (k, w, note) => ` · ${k}${w ? ` «${w}»` : " (no words given)"}${note ? ` (${note})` : ""}`;""")

rep("""/** Every line of a work under X with its second Y, from today's lines (`base`, the page read with no default layer):""",
"""/** BESIDE STEP'S WORDS, THE HIDDEN SIGN'S GAP, in the model as on the page: where the model draws STEP's own words at
 *  a place under STEP's credit, each word a maqaf joins to that place whose own reading is a sign alone, drawn as its
 *  sign in the model, is drawn as the hidden sign's gap under the credit it had (the run's parts under the signs
 *  switch at rest; judgeGaps holds the records to the same). Daniel 1:16: the object marker beside «delicaci[es] +
 *  their». */
const besideSteps = (b, model) => {
  const ps = slim(b).places, own = STEP_WORDS.get(b);
  for (const [n, t] of own) {
    const p = ps[n - 1], u = p && model[p.i] ? model[p.i].get(p.e) : null;
    if (!u || u[1] !== 1 || u[3] !== MOF("step") || u[2] !== drawnStep(t)) continue;
    const chain = [];
    for (let j = p.n - 2; j >= 0 && ps[j].i === p.i && ps[j].jn; j -= 1) chain.push(ps[j]);
    for (let j = p.n - 1; j + 1 < ps.length && ps[j].jn && ps[j + 1].i === p.i; j += 1) chain.push(ps[j + 1]);
    for (const q of chain) {
      if (q.mark || q.kq || q.signAlone === null) continue;
      const v = model[q.i].get(q.e);
      if (v && v[1] === 1 && !blank(v[2]) && signOnly(v[2])) model[q.i].set(q.e, [v[0], 1, SIGN_GAP, v[3]]);
    }
  }
  return model;
};
/** Every line of a work under X with its second Y, from today's lines (`base`, the page read with no default layer):""")

rep("""const modelOf = (b, X, Y, base) => sectionsOf(b).map((sec, i) => {""",
"""const modelOf = (b, X, Y, base) => besideSteps(b, sectionsOf(b).map((sec, i) => {""")
rep("""    if (d) m.set(e, [e, 1, d.line, d.m]);
  }
  return m;
});""", """    if (d) m.set(e, [e, 1, d.line, d.m]);
  }
  return m;
}));""")

rep("""    const rest = new Map((base.sections[g[0].i] || { units: [] }).units.filter((u) => u[1] === 1).map((u) => [u[0], u]));
    for (const e of es) if (single(e)) { if (rest.has(e)) m.set(e, rest.get(e)); else m.delete(e); }
  }
  return model;
};""", """    const rest = new Map((base.sections[g[0].i] || { units: [] }).units.filter((u) => u[1] === 1).map((u) => [u[0], u]));
    // the line a word rests on is today's, and STEP's own words where today's line is bare (zone.html dfltHeldLine,
    // ship 10: Daniel 1:8, the first word of the king's food, stood blank under MACULA, UBS and BDB)
    for (const p of g) {
      const e = p.e;
      if (!single(e)) continue;
      const r = rest.get(e) || null, t = !r || blank(r[2]) ? STEP_WORDS.get(b).get(p.n) || null : null;
      if (t) m.set(e, [e, 1, drawnStep(t), MOF("step")]);
      else if (r) m.set(e, r);
      else m.delete(e);
    }
  }
  return besideSteps(b, model);
};""")

rep("""//   D5  at rest every line is today's, byte for byte, except exactly at the""",
"""//   (The page model: a word of a unit held apart rests on STEP's own words where today's line is bare, and a sign
//   alone beside STEP's own words is the hidden sign's gap, as the page draws both; first met at Daniel, 21 November
//   2026, when the landings of ship 11c made Daniel the smallest work with a fill on a bare word.)
//   D5  at rest every line is today's, byte for byte, except exactly at the""")
open(p, "w", encoding="utf-8").write(s)
print("patched", p)
