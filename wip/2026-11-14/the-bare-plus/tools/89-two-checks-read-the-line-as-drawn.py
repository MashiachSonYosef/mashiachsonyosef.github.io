# Two checks read a line with a hidden sign's gap as the page draws it since 14 November 2026 (sign-gap-joiner-rule-v1):
# a joiner stands between two pieces that print, never beside a gap. check-line-reads-the-place-v1 builds its expected
# line by that rule; check-line-follows-card-v1 compares a line and a card with every run of joiners read as one.
# Backslashes are written as chr(92) so no escape is decoded on the way. Each edit stands exactly once or is refused.
# python3 -I 89-two-checks-read-the-line-as-drawn.py <reader dir>
import os, sys
R = sys.argv[1]
B = chr(92)

def edit(rel, pairs):
    path = os.path.join(R, rel)
    s = open(path, encoding="utf-8").read()
    for old, new in pairs:
        n = s.count(old)
        if n != 1:
            sys.exit(f"{rel}: expected one of {old[:90]!r}, found {n}")
        s = s.replace(old, new)
    open(path, "w", encoding="utf-8").write(s)
    print(f"{rel}: {len(pairs)} edit(s)")

# ---- check-line-reads-the-place-v1 ----
spanjoin = '  const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/' + B + '.$/, "");\n'
helper = '''  // a hidden sign's gap takes no joiner of its own (sign-gap-joiner-rule-v1-a-joiner-stands-between-two-pieces-that-print-and-never-beside-a-hidden-signs-gap,
  // the owner, 2026-11-14): the line as drawn joins two pieces that print, and the gap stands beside its neighbour
  const GAPC = String.fromCharCode(0x200b);
  const drawnJoin = (pieces) => {
    const xs = pieces.join("/").split("/").map((x) => x.trim()).filter(Boolean);
    const printed = (x) => x !== GAPC;
    const s = xs.map((x, i) => `${i && printed(x) && xs.slice(0, i).some(printed) ? " + " : ""}${x}`).join("");
    return s.endsWith(".") ? s.slice(0, -1) : s;
  };
'''
src = open(os.path.join(R, "tools", "check-line-reads-the-place-v1.mjs"), encoding="utf-8").read()
first = src.index(spanjoin)
edit("tools/check-line-reads-the-place-v1.mjs", [
    # the helper beside the first spanJoin only (the page reading); the second spanJoin stands in another evaluate
    (src[first - 200:first] + spanjoin, src[first - 200:first] + spanjoin + helper),
    ('place: spanJoin((plain.length ? plain : all).join("/")), base: baseAll ? spanJoin((basePlain.length ? basePlain : baseAll).join("/")) : null,',
     'place: drawnJoin(plain.length ? plain : all), base: baseAll ? drawnJoin(basePlain.length ? basePlain : baseAll) : null,'),
    ('      const drawn = (t) => (t && window.__signs === "off" ? trim(t.split(" + ")).join(" + ") : t);',
     '      const G = String.fromCharCode(0x200b);\n'
     '      const joinD = (xs) => xs.map((x, i) => `${i && x.trim() !== G && xs.slice(0, i).some((y) => y.trim() !== G) ? " + " : ""}${x}`).join("");   // no joiner beside a gap (2026-11-14)\n'
     '      const drawn = (t) => (t && window.__signs === "off" ? joinD(trim(t.split(" + "))) : t);'),
])

# ---- check-line-follows-card-v1 ----
old_same = ('  const same = (t) => String(t || "").replace(/<[^<>]*>/gu, "").replace(/' + B + 'u200b/gu, "").replace(/' + B + 's*' + B + '+' + B + 's*/gu, " + ").replace(/^' + B + 's*' + B + '+' + B + 's*/u, "").trim();')
new_same = ('  const same = (t) => String(t || "").replace(/<[^<>]*>/gu, "").replace(/' + B + 'u200b/gu, "").replace(/(' + B + 's*' + B + '+' + B + 's*)+/gu, " + ").replace(/^' + B + 's*' + B + '+' + B + 's*/u, "").replace(/' + B + 's*' + B + '+' + B + 's*$/u, "").trim();')
edit("tools/check-line-follows-card-v1.mjs", [
    ('  // the two are read with the sign and the gap set aside\n',
     '  // the two are read with the sign and the gap set aside, and since 2026-11-14 the gap\n'
     '  // takes no joiner of its own on the line (sign-gap-joiner-rule-v1), so a run of\n'
     '  // joiners reads as one and a joiner at either end as none\n'),
    (old_same, new_same),
])
