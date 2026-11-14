# zone.html: a hidden sign's gap takes no joiner of its own (sign-gap-joiner-rule-v1; the owner, 14 November 2026).
# The line's text is what it draws: signsOffLine joins a line's pieces with a joiner only between two pieces that
# print; pieceLine reads a gap back as its own piece whether a joiner stood beside it or not, and draws no joiner
# beside it; a maqaf run draws no joiner beside a cell that is a gap; the export asks its record by the line drawn.
# Each edit is refused unless its text stands exactly once.
# python3 -I 88-a-gap-takes-no-joiner.py <reader dir>
import os, sys
R = sys.argv[1]
path = os.path.join(R, "zone.html")
s = open(path, encoding="utf-8").read()

def one(old, new):
    global s
    n = s.count(old)
    if n != 1:
        sys.exit(f"expected one of {old[:80]!r}, found {n}")
    s = s.replace(old, new)

HELPERS = """  // A GAP TAKES NO JOINER OF ITS OWN (the owner, 14 November 2026, taking the
  // page lane's answer to the fresh readers' remark of relay v184 §5: keep the
  // gap, drop the "+" beside it), under
  // sign-gap-joiner-rule-v1-a-joiner-stands-between-two-pieces-that-print-and-never-beside-a-hidden-signs-gap.
  // A joiner stands between two pieces that print and nowhere else: under
  // signs off "and + <obj.>" draws "and" and its gap, "<the> + this" its gap
  // and "this", and "and + <the> + well-being" draws "and", its gap, " + " and
  // "well-being". The gap keeps its place, and where the line is laid in its
  // pieces its slot (2026-10-16: nothing left out); only the joiner beside it
  // goes. The line's text is what it draws, so a line that holds a gap is read
  // back into its pieces by the gap as well as by its joiners.
  const isGap = (x) => String(x ?? "").trim() === SIGN_GAP;
  const joinerBefore = (pieces, i) => i > 0 && !isGap(pieces[i]) && pieces.slice(0, i).some((x) => !isGap(x));
  const joinDrawn = (pieces) => pieces.map((x, i) => `${i && joinerBefore(pieces, i) ? " + " : ""}${x}`).join("");
  const piecesOfDrawn = (text) => {
    const out = [];
    for (const chunk of String(text).split(" + ")) {
      let a = 0, b = chunk.length, tail = 0;
      while (a < b && chunk[a] === SIGN_GAP) { out.push(SIGN_GAP); a += 1; }
      while (b > a && chunk[b - 1] === SIGN_GAP) { tail += 1; b -= 1; }
      if (b > a) out.push(chunk.slice(a, b));
      for (let t = 0; t < tail; t += 1) out.push(SIGN_GAP);
    }
    return out;
  };
"""

trim = "  const trimSigns = (pieces) => (pieces.every(signOnly) ? pieces : pieces.map((x) => (signOnly(x) ? SIGN_GAP : x)));\n"
one(trim, trim + HELPERS)

one('  const signsOffLine = (text) => (signsPref === "off" ? trimSigns(String(text).split(" + ")).join(" + ") : String(text));',
    '  const signsOffLine = (text) => (signsPref === "off" ? joinDrawn(trimSigns(String(text).split(" + "))) : String(text));')

one('      if (other) had.remove(); else had.replaceWith(document.createTextNode(words.join(" + ")));',
    '      if (other) had.remove(); else had.replaceWith(document.createTextNode(joinDrawn(words)));')

one('''    if (!tn || !tn.data.includes(" + ")) return null;
    const raw = tn.data.split(" + ");
''', '''    if (!tn) return null;
    // the pieces as the line holds them: a gap is its own piece, a joiner beside it or not
    const raw = piecesOfDrawn(tn.data);
    if (raw.length < 2) return null;
''')

one('      if (i) { const sep = document.createElement("span"); sep.className = "g-pp"; sep.textContent = " + "; row.append(sep); }',
    '      if (i) { const sep = document.createElement("span"); const j = joinerBefore(raw, i); sep.className = j ? "g-pp" : "g-pp at-gap"; sep.textContent = j ? " + " : ""; row.append(sep); }')

one('      if (i) { const sep = document.createElement("span"); sep.className = "g-sep"; sep.textContent = "+"; line.append(sep); }',
    '      if (i) { const sep = document.createElement("span"); const j = joinerBefore(parts.map((p) => p.t), i); sep.className = j ? "g-sep" : "g-sep at-gap"; sep.textContent = j ? "+" : ""; line.append(sep); }')

one('what your switches leave of it is not known yet" : text;',
    'what your switches leave of it is not known yet" : joinDrawn(piecesOfDrawn(text));')

one('        const asked = drawn && drawn.full && spanJoin(drawn.text) === shown ? spanJoin(at.text) : shown;',
    '        const asked = drawn && drawn.full && signsOffLine(spanJoin(drawn.text)) === shown ? spanJoin(at.text) : shown;')

css = "  .g-pc.gap, .g-part.gap { display: inline-block; min-width: 0.55em; }   /* a hidden sign's place */\n"
one(css, css + "  .g-pp.at-gap, .g-sep.at-gap { display: none; }   /* and no joiner beside it (2026-11-14) */\n")

open(path, "w", encoding="utf-8").write(s)
print("zone.html: 9 edits")
