#!/usr/bin/env python3
"""Ship 10b, patch 07: law U8 of check-rulings-under-sources-v1 learns the units.

U8 held that a reading across two words, the hyphen at the end of the first only, which a source reads in part (a line
at one word and none at the other), keeps the line as it rests at both words. Under the spans rule of this ship a
source's line filed at one word may read both by the source's own data (UBS's Bath-Rabbim, Pahath-Moab): that is no
reading in part, and the page now prints it once over both words. The law's choice of pairs did not know, and went red
at Song of Songs 7:5:9-10 under UBS.

The mend: a pair the source's own unit reads whole (the spans the book's default picks carry, the unit filed with a
line) owes one line over both words, beginning with the unit's line, or both words as they rest where the page holds
the unit back; every other pair owes what it did. The work read for a source is the first holding a pair read in part,
so the law's first subject is always read.

Usage: python3 patch-07-rulings-u8-knows-units.py <reader dir>
"""
import sys
from pathlib import Path

path = Path(sys.argv[1]) / "tools" / "check-rulings-under-sources-v1.mjs"
src = path.read_text(encoding="utf-8")


def rep(old, new):
    global src
    assert src.count(old) == 1, (src.count(old), old[:90])
    src = src.replace(old, new)


# 1. the law as the header states it
rep("""//       not the other, both words keep the line as it rests (the same review:
//       held only where both hyphens stood, «Baal-Hamon» «Hamon» under UBS)
""", """//       not the other, both words keep the line as it rests (the same review:
//       held only where both hyphens stood, «Baal-Hamon» «Hamon» under UBS);
//       where the source's line, filed at one word, reads both by the source's
//       own data (the units the book's default picks carry, relay v209: UBS's
//       «Pahath-Moab»), that is no reading in part: one line stands over both
//       words, or both rest as they do where the page holds the unit back
""")

# 2. the pairs, each said to be read in part or read whole by the source's own unit
rep("""// U8: per source, TAHOT's readings across two words with the hyphen at the end of the first only, read in part
const endOnly = {};   // source -> { b, pairs: [[the first word's address, the second's]] }
""", """// U8: per source, TAHOT's readings across two words with the hyphen at the end of the first only, the source holding a
// line at one word and not the other: read in part, or read whole where a unit of the source's own (the spans the
// book's default picks carry), filed with a line, holds both words. The work is the first holding one read in part
const endOnly = {};   // source -> { b, pairs: [[the first word's address, the second's]], whole: the first word's address -> the unit's line }
""")
rep("""    const ps = placesOf(z), pairs = [];
    for (let i = 0; i + 1 < ps.length; i += 1) {
      if (ps[i].label !== ps[i + 1].label || !/-$/u.test(text(ps[i].w)) || /^-/u.test(text(ps[i + 1].w))) continue;
      if ((!ps[i].w.kq && !!lineAt(bf, ps[i].n, src)) !== (!ps[i + 1].w.kq && !!lineAt(bf, ps[i + 1].n, src))) pairs.push([ps[i].at, ps[i + 1].at]);
    }
    if (pairs.length) { endOnly[src] = { b, pairs }; break; }
""", """    const units = ((bf.spans || {})[src] || []).map((u) => ({ ns: new Set(u[0]), filed: u[1] || [] }));
    const kqAt = new Map(placesOf(z).map((q) => [q.n, !!q.w.kq]));
    const ps = placesOf(z), pairs = [], whole = new Map();
    for (let i = 0; i + 1 < ps.length; i += 1) {
      if (ps[i].label !== ps[i + 1].label || !/-$/u.test(text(ps[i].w)) || /^-/u.test(text(ps[i + 1].w))) continue;
      if ((!ps[i].w.kq && !!lineAt(bf, ps[i].n, src)) === (!ps[i + 1].w.kq && !!lineAt(bf, ps[i + 1].n, src))) continue;
      pairs.push([ps[i].at, ps[i + 1].at]);
      const u = units.find((x) => x.ns.has(ps[i].n) && x.ns.has(ps[i + 1].n));
      const line = u ? u.filed.filter((f) => !kqAt.get(f)).map((f) => lineAt(bf, f, src)).find(Boolean) || null : null;
      if (line) whole.set(ps[i].at, line);
    }
    if (pairs.length > whole.size) { endOnly[src] = { b, pairs, whole }; break; }
""")

# 3. the reader of a drawn line may ask for the part printed over a word (a unit's one part over several words)
rep("""const drawnAt = (p, ats) => p.evaluate(({ ats, f }) => {""",
    """const drawnAt = (p, ats, over = false) => p.evaluate(({ ats, f, over }) => {""")
rep("""    const g = rg ? rg.querySelector(`:scope > .g-part[data-wi="${[...run.querySelectorAll(".wb")].indexOf(wb)}"]`) : wb.querySelector(":scope > .g");
    if (!g) return "";
    const chip = g.querySelector(".g-lic");
    return `${txt(g)} [${chip ? chip.dataset.line || "" : ""}]`;
  });
}, { ats, f: findWb.toString() });""", """    // the part over the word: its own (data-wi), or, asked with over, the part a unit prints over several words (data-wn)
    const wi = run ? [...run.querySelectorAll(".wb")].indexOf(wb) : -1;
    const g = rg ? (over ? [...rg.querySelectorAll(":scope > .g-part")].find((x) => Number(x.dataset.wi) <= wi && wi < Number(x.dataset.wi) + Number(x.dataset.wn || 1)) || null : rg.querySelector(`:scope > .g-part[data-wi="${wi}"]`)) : wb.querySelector(":scope > .g");
    if (!g) return "";
    const chip = g.querySelector(".g-lic");
    return `${txt(g)} [${chip ? chip.dataset.line || "" : ""}]`;
  });
}, { ats, f: findWb.toString(), over });""")

# 4. the judgement, by kind
rep("""        const got = await drawnAt(p, ats);
        await ctx.close();
        if (on !== src) { faults.push(`?default=${src} stood on ${on}`); continue; }
        let held = 0;
        for (const [x, y] of endOnly[src].pairs) {
          const i = ats.indexOf(x), j = ats.indexOf(y);
          if ([rest[i], rest[j], got[i], got[j]].includes("the run's one line")) continue;
          held += 1;
""", """        const got = await drawnAt(p, ats);
        const over = await drawnAt(p, ats, true);
        await ctx.close();
        if (on !== src) { faults.push(`?default=${src} stood on ${on}`); continue; }
        let held = 0, once = 0, rested = 0;
        for (const [x, y] of endOnly[src].pairs) {
          const i = ats.indexOf(x), j = ats.indexOf(y);
          if ([rest[i], rest[j], got[i], got[j]].includes("the run's one line")) continue;
          if (endOnly[src].whole.has(x)) {
            // the source's own unit reads both words: one line over both, the unit's, or both as they rest (the unit held back)
            const line = endOnly[src].whole.get(x);
            if (got[i] === rest[i] && got[j] === rest[j]) rested += 1;
            else if (over[i] && over[i] === over[j] && over[i].startsWith(`${line} [`)) once += 1;
            else faults.push(`${b} ${x}-${y.split(":")[2]} under ${src.toUpperCase()}, whose own unit reads both words as ${said(line, 40)}: ${said(over[i])} ${said(over[j])}, as it rests ${said(rest[i])} ${said(rest[j])}`);
            continue;
          }
          held += 1;
""")
rep("""        saw.push(`${src.toUpperCase()} ${b} ${held}`);
""", """        saw.push(`${src.toUpperCase()} ${b} ${held}${once || rested ? ` (and of the readings its own unit reads whole, ${once} under one line, ${rested} as they rest)` : ""}`);
""")
rep("""    check("U8  under MACULA, UBS and BDB, a reading across two words with the hyphen at the end of the first only, read in part by the source, keeps the line as it rests at both words", !faults.length,""",
    """    check("U8  under MACULA, UBS and BDB, a reading across two words with the hyphen at the end of the first only, read in part by the source, keeps the line as it rests at both words; one the source's own unit reads whole stands under one line", !faults.length,""")

path.write_text(src, encoding="utf-8")
print("patched", path)
