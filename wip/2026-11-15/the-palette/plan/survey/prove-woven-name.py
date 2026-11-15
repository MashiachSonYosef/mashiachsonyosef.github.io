# Prove the builder change where fontTools is not installed. The builder's
# drawing code runs as written; only the face is stubbed: each region's
# outline and the three positions the drawing reads (fire's i, hail's i, the
# ink's end) are taken from the live mark, which the live builder drew.
#   1. control: the live builder, so fed, redraws the live mark byte for byte
#      (the stub is faithful)
#   2. the proposed builder, at the settings of each X drawing the owner saw,
#      writes that drawing byte for byte
#   3. the one-way settings are written out for a rendered comparison
# python3 -I prove-woven-name.py <old tree> <pictures dir> <proposed builder> <out dir>
import hashlib, re, sys, types

old, pics, proposed, out = sys.argv[1:5]
LIVE_BUILDER = f'{old}/reader/tools/build-wordmark-v1.py'
live = open(f'{old}/mark/fireandhail.com-woven-v1.svg', encoding='utf-8').read()
TEXT = open(f'{old}/CNAME', encoding='utf-8').read().split()[0]
assert TEXT == 'fireandhail.com', TEXT

# the outlines, region by region, as the live builder drew them
body = live[live.index('</defs>'):]
paths = re.findall(r'<path d="([^"]+)" fill="([^"]+)"/>', body)
assert [f for _, f in paths] == ['url(#pwS)', 'url(#pwG)', 'url(#pwB)', 'url(#pwU)', 'url(#dw)', 'url(#pwS)', 'url(#pwG)', 'url(#pwB)'], [f for _, f in paths]
clip = dict(re.findall(r'<clipPath id="(cwr\d)"><path d="([^"]+)"/></clipPath>', live))
fire, n_, hail, com, dot = (d for d, _ in paths[:5])
REGION = {(0, 1, 2, 3): fire, (4,): clip['cwr1'], (5,): n_, (6,): clip['cwr3'], (7, 8, 9, 10): hail, (12, 13, 14): com}
DOT_D = dot
# the three positions: the flame's base point is fire's i + 124, the
# hailstone's top point hail's i + 124, and the viewBox's right edge the
# ink's end + 24 (the builder: ink1 = the last letter's origin + advance - 6)
fx = float(re.match(r'M(-?[\d.]+) ', paths[5][0]).group(1))
hx = float(re.match(r'M(-?[\d.]+) ', paths[7][0]).group(1))
vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', live).group(1).split()]
I_FIRE_X, I_HAIL_X, END = fx - 124, hx - 124, vb[0] + vb[2] - 24 + 6
KERN = {('r', 'e'): -31, ('.', 'c'): -14, ('c', 'o'): -11}; TRACK = -10; EXTRA = {0: 18}

def positions(adv):
    out = []; x = 0
    for i, ch in enumerate(TEXT):
        out.append(x)
        x += adv[ch] + TRACK + EXTRA.get(i, 0)
        if i + 1 < len(TEXT): x += KERN.get((ch, TEXT[i + 1]), 0)
    return out
# advances that put the three positions where the live mark has them (any
# others would do: nothing else in the drawing reads an advance)
ADV = {c: 300 for c in TEXT}
ADV['f'] = I_FIRE_X - TRACK - EXTRA[0]
ADV['h'] = 0; ADV['h'] = I_HAIL_X - positions(ADV)[9]
ADV['m'] = 0; ADV['m'] = END - positions(ADV)[14]
assert positions(ADV)[1] == I_FIRE_X and positions(ADV)[9] == I_HAIL_X and positions(ADV)[14] + ADV['m'] == END

class Face:
    def __init__(self, path): self.path = path
    def getGlyphSet(self): return {}
    def getBestCmap(self): return {ord(c): c for c in TEXT}
    def __getitem__(self, table):
        assert table == 'hmtx'
        return {c: (ADV[c], 0) for c in TEXT}
for name in ('fontTools', 'fontTools.ttLib', 'fontTools.pens', 'fontTools.pens.svgPathPen', 'fontTools.pens.transformPen'):
    sys.modules[name] = types.ModuleType(name)
sys.modules['fontTools.ttLib'].TTFont = Face
sys.modules['fontTools.pens.svgPathPen'].SVGPathPen = None
sys.modules['fontTools.pens.transformPen'].TransformPen = None

def load(path):
    ns = {'__name__': 'builder-under-proof', '__file__': LIVE_BUILDER}   # ROOT and CNAME resolve in the old tree, read only
    exec(compile(open(path, encoding='utf-8').read(), path, 'exec'), ns)
    assert [x for _, x in ns['L']] == positions(ADV)
    ns['gl'] = lambda idxs: REGION[tuple(idxs)]
    def gpath(i):
        assert i == ns['DOT'], i
        return DOT_D
    ns['gpath'] = gpath
    return ns

def same(name, got, want):
    sha = hashlib.sha256(got.encode()).hexdigest()
    if got == want:
        print(f'  ok  {name}: {len(got):,} bytes, sha256 {sha}')
        return True
    i = next((k for k, (a, b) in enumerate(zip(got, want)) if a != b), min(len(got), len(want)))
    print(f'FAIL  {name}: {len(got):,} vs {len(want):,} bytes, first difference at {i}:\n      got  {got[max(0, i - 60):i + 60]!r}\n      want {want[max(0, i - 60):i + 60]!r}')
    return False

bad = 0
print('1. control: the live builder redraws the live mark')
svg, _ = load(LIVE_BUILDER)['mark']('w', True)
bad += not same('mark/fireandhail.com-woven-v1.svg', svg, live)

print('2. the proposed builder writes each X drawing the owner saw')
new = load(proposed)
for fname, kw in (('woven-x60-21.svg', {}),
                  ('woven-x60-28.svg', dict(p=28)),
                  ('woven-x45-21.svg', dict(angle=45)),
                  ('woven-x45-28.svg', dict(angle=45, p=28))):
    svg, _ = new['mark']('w', **kw)
    bad += not same(f'{fname} {kw or "(the settings as written)"}', svg, open(f'{pics}/{fname}', encoding='utf-8').read())

print('3. the one-way settings, written for a rendered comparison')
for fname, kw in (('one-42-dot-woven.svg', dict(weave='one', p=42)),
                  ('one-42-dot-bronze.svg', dict(weave='one', p=42, dot='#7f6044'))):
    svg, _ = new['mark']('w', **kw)
    open(f'{out}/{fname}', 'w', encoding='utf-8').write(svg)
    print(f'      {fname}: {len(svg):,} bytes')
print('all byte comparisons hold' if not bad else f'{bad} FAILED')
sys.exit(1 if bad else 0)
