#!/usr/bin/env python3
"""Ship 14, patch 03: the gate knows a unit's one line may stand on both builds.

Ship 10b taught the gate that, under a source pressed, a word of a unit the source's own data gives is owed the
unit's one line, and it taught it as a move: the older build (ship 13) printed the words apart. Since ship 10b the
live build prints the unit's one line too. A word whose line is the same on both builds then fell through to the
older law (a reading across words the source does not read whole keeps the line as it rests) and was called not as
owed: 8 lines of the sample, at Amos 5 and Nehemiah 7 under UBS, with 0 lines differing between the builds.

The mend: where both builds print the same line at a word of such a unit, and the new build prints it at every word
of the unit under the source's credit, the line stands as owed and is counted.

Usage: python3 patch-03-gate-spans-stand-on-both-builds.py <reader dir>
"""
import sys
from pathlib import Path

path = Path(sys.argv[1]) / "tools" / "check-same-product-v1.mjs"
src = path.read_text(encoding="utf-8")


def rep(old, new):
    global src
    assert src.count(old) == 1, (src.count(old), old[:80])
    src = src.replace(old, new)


rep("const spanSeen = { one: 0, rests: 0 };", "const spanSeen = { one: 0, rests: 0, stands: 0 };")
rep("""        const spanRests = !!spans && spans.rests.has(nOf(i));
""", """        // AND WHERE BOTH BUILDS PRINT IT (ship 14, 22 November 2026): since ship 10b the older build reads the spans
        // too, so the unit's one line stands on both and nothing moves. The same line on both builds, at every word of
        // the unit in the new one, the source's: owed, as it stands. (Left to the law below, such a word was held to
        // the line as it rests, which neither build prints: 8 lines of the sample at the first gate of ship 14.)
        if (span && x[0] === y[0] && x[1] === y[1] && x[2] === y[2] && x[3] === y[3] && y[3] === M_OF.get(SRC_OF_STATE.get(name))
          && span.ns.every((w) => { const r = C[k][w - firstN(z, k) - 1] || null; return !!r && r[1] === y[1] && r[2] === y[2] && r[3] === y[3]; })) {
          spanSeen.stands += 1;
          continue;
        }
        const spanRests = !!spans && spans.rests.has(nOf(i));
""")
rep("${spanSeen.one} moved to the unit's one line and ${spanSeen.rests} to the line as it rests`);",
    "${spanSeen.one} moved to the unit's one line and ${spanSeen.rests} to the line as it rests, and ${spanSeen.stands} stand as the unit's one line on both builds`);")
path.write_text(src, encoding="utf-8")
print("patched", path)
