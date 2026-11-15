import re, sys
src, outdir = sys.argv[1], sys.argv[2]
t = open(src, encoding='utf-8').read()
BRONZE = '#7f6044'
# the dot of .com: solid bronze, no fade
t2 = re.sub(r'<linearGradient id="dw"[^>]*>.*?</linearGradient>', '', t, flags=re.S)
assert t2.count('fill="url(#dw)"') == 1
t2 = t2.replace('fill="url(#dw)"', f'fill="{BRONZE}"')
X = 'x="-788.8" width="4412.2"'
def rects(bands):
    # bands: list of (y0, y1, pattern) covering -6636..84 in 42-unit steps
    assert bands[0][0] == -6636 and bands[-1][1] == 84
    for (a0, a1, _), (b0, _, _) in zip(bands, bands[1:]): assert a1 == b0
    return ''.join(f'<rect {X.split(" ")[0]} y="{y0}" {X.split(" ")[1]} height="{y1 - y0}" fill="url(#{p})"/>' for y0, y1, p in bands if y1 > y0)
def a_turn(B):   # red where v >= B, one thread crossing each way at the edge (the builder's "tight" turn)
    if B is None: return rects([(-6636, 84, 'qwA')])
    return rects([(-6636, B - 42, 'qwA'), (B - 42, B, 'qwS'), (B, B + 42, 'qwA'), (B + 42, 84, 'qwS')])
def d_turn(B):   # blue where v < B, one thread crossing each way
    if B is None: return rects([(-6636, 84, 'qwA')])
    return rects([(-6636, B - 42, 'qwB'), (B - 42, B, 'qwA'), (B, B + 42, 'qwB'), (B + 42, 84, 'qwA')])
def setgroup(s, cid, inner):
    pat = re.compile(rf'(<g clip-path="url\(#{cid}\)"><g transform="rotate\(60\)">)(.*?)(</g></g>)', re.S)
    assert len(pat.findall(s)) == 1
    return pat.sub(lambda m: m.group(1) + inner + m.group(3), s)
# today's turn, reproduced, to prove the rewrite
today = setgroup(setgroup(t2, 'cwr1', a_turn(-1764)), 'cwr3', d_turn(-2688))
assert today == t2, 'the rewrite does not reproduce today'
V = {'today': (-1764, -2688), 'half': (-1638, -2898), 'sliver': (-1554, -3024), 'none': (None, None)}
for name, (ba, bd) in V.items():
    s = setgroup(setgroup(t2, 'cwr1', a_turn(ba)), 'cwr3', d_turn(bd))
    open(f'{outdir}/woven-{name}.svg', 'w', encoding='utf-8').write(s)
    # a close view: "re and h", by viewBox alone
    z = s.replace('viewBox="-14 -845 7102 879" width="710.2" height="87.9"', 'viewBox="1150 -845 2600 879" width="260" height="87.9"', 1)
    assert z != s
    open(f'{outdir}/close-{name}.svg', 'w', encoding='utf-8').write(z)
print('ok')
