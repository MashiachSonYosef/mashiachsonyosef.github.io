# build-wordmark-v1 · the site's name drawn as its mark, from the face's own outlines
#
# RULE: wordmark-rule-v1-the-name-is-the-mark-woven-with-a-flame-and-a-hailstone-for-its-dots
# LEDGER: -
# no frame letter. This reads the subset face beside the site (fonts/, SIL OFL
# 1.1) and the name the site answers under (CNAME), and writes two drawings of
# the name, mark/<name>-woven-v1.svg (the door's; the owner: "just our 1 logo on
# the homepage alone"). Nothing in the
# reader's data is read or written. A name that is not fire, and, hail and a
# dot is not drawn: it stands as text, whole, as the pages already print it.
#
# The owner, 2026-10-03, choosing among six drawn concepts: "lets do this one
# with the 2 stylized i dots" (the woven one, with the flame and the hailstone
# of another), and on the dot of .com: "keep the normal transition we already
# had there because purple and blue blend nicely and it can be on just the .".
# So:
#
#   - fire in shani, and in gold, hail in tekhelet, .com in argaman, each
#     letter filled with fine diagonal threads (Exodus 39:3, the threads cut
#     from beaten gold), the colors handing off along a thread at the a of and
#     and at its d, so gold and blue never blend into green
#   - the dot of fire's i is a flame with a gold heart; the dot of hail's i is
#     a hailstone; the dot of .com turns from blue into purple, smoothly
#   - the threads are drawn for the size the woven mark is shown at, the
#     door's name at up to 26rem: 42 font units apart, two to three pixels
#   - mark(uid, False) draws the same mark without threads; nothing writes it
#     now, since the mark stands on the door alone and every other page prints
#     the name as text
#
# DYED IN THE SITE'S OWN PAIRS (the owner, 2026-10-10: "personally i dont see
# a gain from more than 2/2/2/2 and 3 linen", "id probably go regular and dim.
# i dont like our bold that much", "my main point is uniform coloring between
# logo and site", and "id just use the same gold as the borders and logo
# was"). Each word's threads are its color's regular and dim and nothing else,
# the very values the pages paint:
#
#   - fire and the flame: the red regular, its dim the light along each thread
#   - and and the flame's heart: the gold's dim as the body, the gold every
#     frame on the site wears at rest, and its regular as the thread's edge
#   - hail and the hailstone: the blue regular, its dim the light along each
#     thread and the hailstone's glint
#   - .com: the purple regular, its dim the light along each thread; its dot
#     still turns from the blue regular into the purple regular, smoothly
#
# No shade is mixed: the darker edges and the lighter middles this drew from
# each color by multiplying it down or mixing it toward a linen the site never
# paints are gone, and so are the name's own brighter gold of 2026-10-02 and
# the black and white threads that lay over the dot of .com. The hand-offs at
# the a and the d of and are kept, so gold and blue still never blend into
# green.
#
# Run: python3 tools/build-wordmark-v1.py   (from reader/; needs fontTools)
import math, os, re, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
FONT = os.path.join(ROOT, 'fonts', 'outfit-wordmark-600.woff2')
OUT = os.path.join(ROOT, 'mark')
CNAME = os.path.join(ROOT, 'CNAME')

# the site's own pairs (zone.html :root), a regular and a dim of each color
S = '#9d4355'; S_DIM = '#b76670'   # shani: --shani, --shani-dim
G = '#93661a'; G_DIM = '#a06c10'   # gold: --gold, --gold-dim
B = '#34649a'; B_DIM = '#7f8ba8'   # tekhelet: --tekhelet, --tekhelet-dim
U = '#561f86'; U_DIM = '#6c359e'   # argaman: --argaman, --argaman-dim
# each color's thread: its edge, its body, and the light along its middle.
# The gold's body is its dim, since the and is the gold the frames wear at
# rest, and its edge the regular; every other color's body and edge are its
# regular, with its dim for the light.
THREAD = {'S': (S, S, S_DIM), 'G': (G, G_DIM, G_DIM), 'B': (B, B, B_DIM), 'U': (U, U, U_DIM)}
TEXT = open(CNAME).read().split()[0] if os.path.exists(CNAME) else ''
PARTS = re.match(r'^(fire)(and)(hail)(\..+)$', TEXT)
if not PARTS:
    print(f'the name "{TEXT}" is not fire, and, hail and a dot: nothing is drawn, the pages print it whole')
    sys.exit(0)
# the letters of each part, by position in the name
A0 = len(PARTS.group(1)); H0 = A0 + len(PARTS.group(2)); T0 = H0 + len(PARTS.group(3))
FIRE = list(range(0, A0)); AND = list(range(A0, H0)); HAIL = list(range(H0, T0)); DOT = T0; TLD = list(range(T0 + 1, len(TEXT)))
I_FIRE = TEXT.index('i'); I_HAIL = H0 + PARTS.group(3).index('i')
KERN = {('r', 'e'): -31, ('.', 'c'): -14, ('c', 'o'): -11}
TRACK = -10
EXTRA = {0: 18}   # room after the f for the flame
ANGLE = 60

def fmt(v): return ('%.1f' % v).rstrip('0').rstrip('.')

F = TTFont(FONT); GS = F.getGlyphSet(); CM = F.getBestCmap(); HM = F['hmtx']

def layout():
    out = []; x = 0
    for i, ch in enumerate(TEXT):
        out.append((ch, x))
        x += HM[CM[ord(ch)]][0] + TRACK + EXTRA.get(i, 0)
        if i + 1 < len(TEXT): x += KERN.get((ch, TEXT[i + 1]), 0)
    return out
L = layout()

def gpath(i):
    ch, x = L[i]
    pen = SVGPathPen(GS, ntos=fmt)
    GS[CM[ord(ch)]].draw(TransformPen(pen, (1, 0, 0, -1, x, 0)))
    d = pen.getCommands()
    if ch == 'i':
        # the stem only: its own dot is drawn as a flame or a hailstone. The
        # stem is the contour that reaches the baseline (y-down: the largest y)
        parts = re.findall(r'M[^M]*', d)
        def lowest(p): return max(float(v) for v in re.findall(r'-?\d+(?:\.\d+)?', p)[1::2])
        d = max(parts, key=lowest)
    return d

def gl(idxs): return ''.join(gpath(i) for i in idxs)

# where a color hands to the next, on a thread: x at a reference height, as
# placed in the concept (before the room after the f), shifted with the glyph
X0 = {AND[0]: 1866, AND[-1]: 2946}
def turn_x(i):
    base = 0; x = 0
    for k, ch in enumerate(TEXT):
        if k == i: break
        x += HM[CM[ord(ch)]][0] + TRACK
        if k + 1 < len(TEXT): x += KERN.get((ch, TEXT[k + 1]), 0)
    return X0[i] + (L[i][1] - x)

def thread(id, n, angle, P):
    e, c, h = THREAD[n]
    return (f'<linearGradient id="{id}l" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset="0" stop-color="{e}"/><stop offset=".22" stop-color="{c}"/><stop offset=".46" stop-color="{h}"/>'
            f'<stop offset=".78" stop-color="{c}"/><stop offset="1" stop-color="{e}"/></linearGradient>'
            f'<pattern id="{id}" patternUnits="userSpaceOnUse" width="400" height="{P}" patternTransform="rotate({angle})">'
            f'<rect width="400" height="{P}" fill="url(#{id}l)"/></pattern>')

# the flame and its heart, y-up, base at (0,0) (concept 5)
FLAME = [('M', (0, 0)), ('C', (-44, 0), (-74, 32), (-74, 80)), ('C', (-74, 132), (-40, 168), (-20, 206)),
         ('C', (-6, 232), (4, 262), (2, 300)), ('C', (26, 270), (40, 246), (46, 216)), ('C', (54, 228), (58, 240), (60, 256)),
         ('C', (72, 226), (76, 188), (76, 150)), ('C', (76, 112), (74, 96), (72, 80)), ('C', (68, 30), (42, 0), (0, 0)), ('Z',)]
HEART = [('M', (0, 0)), ('C', (-26, 0), (-40, 19), (-40, 46)), ('C', (-40, 82), (-14, 108), (-6, 162)),
         ('C', (10, 132), (40, 104), (40, 56)), ('C', (40, 22), (24, 0), (0, 0)), ('Z',)]

def place(cmds, s, dx, by):
    """y-up local shape -> this drawing's y-down coordinates"""
    out = []
    for c in cmds:
        if c[0] == 'Z': out.append('Z')
        else: out.append(c[0] + ' '.join(fmt(dx + p[0] * s) + ' ' + fmt(-(by + p[1] * s)) for p in c[1:]))
    return ''.join(out)

def circle(cx, cy, r):
    """y-down"""
    k = 0.5523 * r
    return (f'M{fmt(cx)} {fmt(cy - r)}C{fmt(cx + k)} {fmt(cy - r)} {fmt(cx + r)} {fmt(cy - k)} {fmt(cx + r)} {fmt(cy)}'
            f'C{fmt(cx + r)} {fmt(cy + k)} {fmt(cx + k)} {fmt(cy + r)} {fmt(cx)} {fmt(cy + r)}'
            f'C{fmt(cx - k)} {fmt(cy + r)} {fmt(cx - r)} {fmt(cy + k)} {fmt(cx - r)} {fmt(cy)}'
            f'C{fmt(cx - r)} {fmt(cy - k)} {fmt(cx - k)} {fmt(cy - r)} {fmt(cx)} {fmt(cy - r)}Z')

FLAME_S, FLAME_BASE = 0.95, 536
HAIL_R, HAIL_Y = 78, 636
STEM_MID = 124   # the i's stem, from its left side bearing

def mark(uid, woven, P=42):
    # the a of and turns from shani to gold, its d from gold to tekhelet
    regions = [(FIRE, 'S'), ([AND[0]], ('turn', 'S', 'G')), (AND[1:-1], 'G'), ([AND[-1]], ('turn', 'G', 'B')), (HAIL, 'B'), (TLD, 'U')]
    th = math.radians(ANGLE); sn = math.sin(th); cs = math.cos(th)
    ink0 = 10; ink1 = L[-1][1] + HM[CM[ord(TEXT[-1])]][0] - 6
    flame_top = FLAME_BASE + 300 * FLAME_S
    pad = 24
    vx0 = ink0 - pad; vx1 = ink1 + pad; vy0 = -math.ceil(flame_top) - pad; vy1 = 10 + pad
    vw = vx1 - vx0; vh = vy1 - vy0
    defs = []; body = []
    if woven:
        for n in THREAD:
            defs.append(thread(f'p{uid}{n}', n, ANGLE, P))
            defs.append(thread(f'q{uid}{n}', n, 0, P))
    fill = (lambda n: f'url(#p{uid}{n})') if woven else (lambda n: THREAD[n][1])
    corners = [(vx0, vy0), (vx1, vy0), (vx0, vy1), (vx1, vy1)]
    vs = [-x * sn + y * cs for x, y in corners]; us = [x * cs + y * sn for x, y in corners]
    j0 = math.floor(min(vs) / P) - 1; j1 = math.ceil(max(vs) / P) + 1
    u0 = min(us) - 50; u1 = max(us) + 50
    for ri, (idxs, spec) in enumerate(regions):
        d = gl(idxs)
        if isinstance(spec, str):
            body.append(f'<path d="{d}" fill="{fill(spec)}"/>'); continue
        _, a, b = spec
        xt = turn_x(idxs[0]); yref = -246
        def xref(j): return (yref * cs - (j + 0.5) * P) / sn
        col = {j: (b if xref(j) >= xt else a) for j in range(j0, j1)}
        jb = max(j for j in range(j0, j1) if xref(j) >= xt)
        order = sorted(range(j0, j1), key=xref); k = order.index(jb)
        # one thread of the new color crosses over into the old (concept 4, "tight")
        col[order[k - 1]] = b; col[order[k]] = a
        defs.append(f'<clipPath id="c{uid}r{ri}"><path d="{d}"/></clipPath>')
        js = sorted(col); rects = []; start = js[0]; cur = col[js[0]]
        def emit(s_, e_, n):
            if woven: rects.append(f'<rect x="{fmt(u0)}" y="{fmt(s_ * P)}" width="{fmt(u1 - u0)}" height="{fmt((e_ - s_) * P)}" fill="url(#q{uid}{n})"/>')
            else: rects.append(f'<rect x="{fmt(u0)}" y="{fmt(s_ * P)}" width="{fmt(u1 - u0)}" height="{fmt((e_ - s_) * P + 0.6)}" fill="{THREAD[n][1]}"/>')
        for j in js[1:]:
            if col[j] != cur: emit(start, j, cur); start = j; cur = col[j]
        emit(start, js[-1] + 1, cur)
        body.append(f'<g clip-path="url(#c{uid}r{ri})"><g transform="rotate({ANGLE})">' + ''.join(rects) + '</g></g>')
    # the dot of .com, the blue regular turning into the purple regular
    # across it, smoothly, and nothing laid over it
    dot = gpath(DOT)
    nums = [float(v) for v in re.findall(r'-?\d+(?:\.\d+)?', dot)]
    dx0, dx1 = min(nums[0::2]), max(nums[0::2])
    defs.append(f'<linearGradient id="d{uid}" gradientUnits="userSpaceOnUse" x1="{fmt(dx0)}" y1="0" x2="{fmt(dx1)}" y2="0">'
                f'<stop offset="0" stop-color="{B}"/><stop offset="1" stop-color="{U}"/></linearGradient>')
    body.append(f'<path d="{dot}" fill="url(#d{uid})"/>')
    # fire's i: a flame with a gold heart
    fx = L[I_FIRE][1] + STEM_MID
    body.append(f'<path d="{place(FLAME, FLAME_S, fx, FLAME_BASE)}" fill="{fill("S")}"/>')
    body.append(f'<path d="{place(HEART, FLAME_S, fx + 2 * FLAME_S, FLAME_BASE + 16 * FLAME_S)}" fill="{fill("G")}"/>')
    # hail's i: a hailstone, with its glint, the blue's dim, where the threads are drawn
    hxc = L[I_HAIL][1] + STEM_MID
    body.append(f'<path d="{circle(hxc, -HAIL_Y, HAIL_R)}" fill="{fill("B")}"/>')
    if woven:
        gx, gy = hxc - HAIL_R * 0.36, -HAIL_Y - HAIL_R * 0.36
        body.append(f'<ellipse cx="{fmt(gx)}" cy="{fmt(gy)}" rx="{fmt(HAIL_R * 0.30)}" ry="{fmt(HAIL_R * 0.15)}" '
                    f'transform="rotate(-45 {fmt(gx)} {fmt(gy)})" fill="{B_DIM}"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{fmt(vx0)} {fmt(vy0)} {fmt(vw)} {fmt(vh)}" '
            f'width="{fmt(vw / 10)}" height="{fmt(vh / 10)}" role="img" aria-label="{TEXT}">'
            f'<title>{TEXT}</title><defs>{"".join(defs)}</defs>{"".join(body)}</svg>\n'), (vx0, vy0, vw, vh)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name, woven in ((f'{TEXT}-woven-v1.svg', True),):
        svg, box = mark('w' if woven else 'f', woven)
        open(os.path.join(OUT, name), 'w').write(svg)
        print(f'mark/{name} · {len(svg):,} bytes · viewBox {" ".join(fmt(v) for v in box)} (font units; 1000 to the em, baseline at 0)')
