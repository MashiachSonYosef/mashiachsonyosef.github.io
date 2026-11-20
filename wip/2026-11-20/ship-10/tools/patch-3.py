import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new)

# the word says whether its whole line is a sign
rep('''    return { wb, regionEls, markEls, joined, glossParts: parts, strokeEl,
      kqStand: word.kq && regions && regions.length > 1 ? { regions, parts, table, word } : null };
''', '''    return { wb, regionEls, markEls, joined, glossParts: parts, strokeEl,
      // the word's whole line is a sign and nothing else (appendWord: such a word stays beside the word its stroke joins it to)
      signAlone: !word.kq && !!line && String(line).split(" + ").every((x) => signOnly(x)),
      kqStand: word.kq && regions && regions.length > 1 ? { regions, parts, table, word } : null };
''')

# a hidden sign keeps its place beside the word its stroke joins it to
rep('''    const maqafOn = maqafJoin !== "pieces" || !HUD_TOGGLES_IX;
    const joinNext = (pjNext && maqafOn) || !!(link && link.next);
    const joinPrev = (pjPrev && maqafOn) || !!(link && link.prev);
''', '''    const maqafOn = maqafJoin !== "pieces" || !HUD_TOGGLES_IX;
    // A HIDDEN SIGN KEEPS ITS PLACE BESIDE THE WORD ITS STROKE JOINS IT TO
    // (words-stand-alone-rule-v1). With the signs off, a word whose whole
    // line is a sign (the object marker's «<obj.>») is not drawn beside a
    // word that carries the reading, and keeps its place as a gap (the
    // owner, 2026-10-16: «rather than leave stuff out»); and no word is left
    // with nothing under it (the owner, 2026-10-03, of the fourth word of
    // Genesis loading blank). Alone in a cell such a word could keep only
    // one of the two. So where a stroke joins it to the next word it stays
    // in that word's cell, drawn as it was: one breath, one row, the gap in
    // the sign's place. The cell has no key of its own, so it is no run and
    // has no card: each of its words opens its own card. (Laid as the
    // section is built, by the signs switch as it then stands.)
    const signNext = !maqafOn && pjNext && signsPref === "off" && !!(built && built.signAlone);
    const signPrev = !maqafOn && pjPrev && !!host.__signNext;
    host.__signNext = signNext;
    const joinNext = (pjNext && maqafOn) || signNext || !!(link && link.next);
    const joinPrev = (pjPrev && maqafOn) || signPrev || !!(link && link.prev);
''')
open(p, 'w', encoding='utf-8').write(s)
print('ok')
