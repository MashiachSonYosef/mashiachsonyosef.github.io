# build-wordmark-v1 · the site's name drawn as its mark, from the face's own outlines
#
# RULE: wordmark-rule-v2-the-name-is-the-mark-woven-of-the-dyes-and-the-metals-with-a-flame-and-a-hailstone-for-its-dots
# LEDGER: -
# no frame letter. This reads the subset face beside the site (fonts/, SIL OFL
# 1.1) and the name the site answers under (CNAME), and writes one drawing of
# the name, mark/<name>-woven-v1.svg: the door's (the owner: "just our 1 logo
# on the homepage alone"), shown small wherever a page points home. Nothing in
# the reader's data is read or written. A name that is not fire, and, hail and
# a dot is not drawn: it stands as text, whole, as the pages already print it.
#
# The owner, 2026-10-03, choosing among six drawn concepts: "lets do this one
# with the 2 stylized i dots" (the woven one, with the flame and the hailstone
# of another). So each letter is filled with fine threads (Exodus 39:3, the
# threads cut from beaten gold), the dot of fire's i is a flame with a gold
# heart, and the dot of hail's i is a hailstone.
#
# WOVEN OF THE TABERNACLE'S DYES AND METALS (the owner, 15 November 2026; their
# words in order are in wip/2026-11-15/the-palette/THE-OWNERS-WORDS-2026-11-15.md,
# 13 to 18). Each choice is data below (the threads, WORDS, WEAVE, ANGLE, P,
# DOT_FILL), and so set the builder writes the drawing the owner chose,
# wip/2026-11-15/the-palette/pictures/woven-x60-21.svg (sha256 ddc83012...f4e7),
# byte for byte:
#
#   - fire and the flame in shani, hail and the hailstone in tekhelet, each
#     woven with itself, each dye lit along its middle by its dim, the pairs
#     the page paints
#   - "i still prefer the pale/real gold, not the orangey one": the gold is
#     the real gold, its body the swatch's pale gold and its edge the same
#     gold made darker, the gold of the Masoretic signs. The flame's heart is
#     that gold woven with itself; the orange gold (#93661a, #a06c10) is gone
#   - "i kind of like none": no color hands off into and. Until now fire's red
#     turned into its a and hail's blue out of its d ("maybe the and as less
#     aggressively red/blue trailing into it"); the a and the d are drawn like
#     the n
#   - "what if we did gold/bronze woven on and, and purple and silver woven on
#     .com": and is the gold crossed with bronze, the card's bronze; .com is
#     argaman crossed with silver, the silver of the blobs
#   - "2 but i'd probably weave it tighter": the dot of .com is woven with
#     .com (the second of two drawings; the first kept the dot solid bronze),
#     and the weave steps 21 font units from thread to thread, not 42
#   - "maybe weave it 4 ways" ... "like X pattern", then "x steep tighter still
#     looks cool": a plain weave, warp and weft crossing, each thread over one
#     and under the next, the over thread darkened toward its ends where it
#     dips under; steep, both ways at the slant the threads have run at since
#     2026-10-03, 60 degrees from level (the square crossing, at 45, was the
#     other drawing)
#
# What stands of 2026-10-10 ("my main point is uniform coloring between logo
# and site"): every thread's edge is a value the page paints, and the dyes'
# lights are the page's dims. What does not: "no shade is mixed" held the name
# to the page's pairs alone; the metals' lights (the pale gold #d3af37, the
# bronze's #9a7656, the silver's #b4b8bd) are the name's own, as the owner saw
# them drawn.
#
# At the door's 26rem a step of 21 is 1.2 pixels (1.1 on a 412-pixel phone);
# on the home button it falls under half a pixel, and each two-metal word
# reads as one shade (the owner's notes: and a deeper gold, .com a lighter
# purple). The steep crossing is not square: its threads meet at 60 degrees,
# so across its width a thread is 21 x sin 60 = 18.2 units.
#
# Run: python3 tools/build-wordmark-v1.py   (from reader/; needs fontTools, and
# brotli for the woff2)
import math, os, re, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
FONT = os.path.join(ROOT, 'fonts', 'outfit-wordmark-600.woff2')
OUT = os.path.join(ROOT, 'mark')
CNAME = os.path.join(ROOT, 'CNAME')

# THE THREADS, each (kind, edge, light). A dye is lit along its middle: its
# edge and body its regular, its light its dim, the very pairs the page paints
# (zone.html :root). A metal is beaten flat: its edge the darker, its body the
# lighter, across its middle.
SHANI = ('dye', '#a52035', '#be6367')       # --shani, --shani-dim
TEKHELET = ('dye', '#23558a', '#768ea2')    # --tekhelet, --tekhelet-dim
ARGAMAN = ('dye', '#642460', '#753c6d')     # --argaman, --argaman-dim
GOLD = ('metal', '#967c26', '#d3af37')      # the Masoretic signs' gold; the swatch's pale gold
BRONZE = ('metal', '#7f6044', '#9a7656')    # the card's bronze; its light
SILVER = ('metal', '#6e7378', '#b4b8bd')    # --silver, the blobs' line; its light
# each part's warp and weft, by the letter its pattern is named with; a part
# of one color is that color woven with itself
WORDS = {'S': (SHANI, SHANI),           # fire, and the flame
         'G': (GOLD, GOLD),             # the flame's heart
         'B': (TEKHELET, TEKHELET),     # hail, and the hailstone
         'A': (GOLD, BRONZE),           # and
         'U': (ARGAMAN, SILVER)}        # .com, and its dot
# THE WEAVE (the owner, 15 November: "x steep tighter still looks cool")
WEAVE = 'x'         # 'x': warp and weft crossing; 'one': side by side, one way
ANGLE = 60          # the threads' slant from level; the X also takes 45, square
P = 21              # the weave's step in font units, thread to thread (42 until 15 November)
DOT_FILL = 'woven'  # the dot of .com: 'woven' with .com, or one color, solid
DEPTH = .26         # an over thread darkens toward its two ends: black at this opacity
# the X's tile, as drawn for the owner at each slant: its columns run one way
# and its rows the other (steep: both at 60 degrees from level; square: 45)
CROSS = {60: 'matrix(0.5 -0.8660254 0.5 0.8660254 0 0)', 45: 'rotate(45)'}
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

def grad(id, thread, across):
    """a thread's cross-section: across x for a thread running along y, across y for one running along x"""
    kind, edge, light = thread
    xy = 'x1="0" y1="0" x2="1" y2="0"' if across == 'x' else 'x1="0" y1="0" x2="0" y2="1"'
    stops = ((('0', edge), ('.22', edge), ('.46', light), ('.78', edge), ('1', edge)) if kind == 'dye'
             else (('0', edge), ('.22', light), ('.78', light), ('1', edge)))
    return f'<linearGradient id="{id}" {xy}>' + ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops) + '</linearGradient>'

def shade(id, along):
    """an over thread's two ends, darkened where it dips under the next; it holds no color, so every part shares it"""
    xy = 'x1="0" y1="0" x2="1" y2="0"' if along == 'x' else 'x1="0" y1="0" x2="0" y2="1"'
    return (f'<linearGradient id="{id}" {xy}><stop offset="0" stop-color="#000" stop-opacity="{DEPTH}"/><stop offset=".3" stop-color="#000" stop-opacity="0"/>'
            f'<stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="{DEPTH}"/></linearGradient>')

def threads(id, warp, weft, weave, angle, p):
    """one part's pattern: its two threads side by side one way, or crossing"""
    if weave == 'one':
        # side by side at the slant, the warp's thread and the weft's in turn
        pat = f'<pattern id="{id}" patternUnits="userSpaceOnUse" width="400" height="{p if warp == weft else 2 * p}" patternTransform="rotate({angle})">'
        if warp == weft:
            return grad(f'{id}w', warp, 'y') + pat + f'<rect width="400" height="{p}" fill="url(#{id}w)"/></pattern>'
        return (grad(f'{id}w', warp, 'y') + grad(f'{id}f', weft, 'y') + pat
                + f'<rect y="0" width="400" height="{p}" fill="url(#{id}w)"/><rect y="{p}" width="400" height="{p}" fill="url(#{id}f)"/></pattern>')
    # a plain weave: the warp runs down the tile's columns and the weft along
    # its rows, each over one and under the next, so the tile is two by two,
    # the warp over at the first and the last cell, the weft at the other two
    def cell(x, y, over):
        return (f'<rect x="{x}" y="{y}" width="{p}" height="{p}" fill="url(#{id}{over})"/>'
                f'<rect x="{x}" y="{y}" width="{p}" height="{p}" fill="url(#{"xsv" if over == "w" else "xsh"})"/>')
    return (grad(f'{id}w', warp, 'x') + grad(f'{id}f', weft, 'y')
            + f'<pattern id="{id}" patternUnits="userSpaceOnUse" width="{2 * p}" height="{2 * p}" patternTransform="{CROSS[angle]}">'
            + cell(0, 0, 'w') + cell(p, 0, 'f') + cell(0, p, 'f') + cell(p, p, 'w') + '</pattern>')

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

def mark(uid, weave=WEAVE, angle=ANGLE, p=P, dot=DOT_FILL):
    assert weave in ('one', 'x') and (weave == 'one' or angle in CROSS), (weave, angle)
    # each part in its own threads, and no color handing off into the next:
    # the a and the d of and keep the pieces the old turn cut them into, each
    # now drawn like the n, so the drawing is the approved one path for path
    regions = [(FIRE, 'S'), ([AND[0]], 'A'), (AND[1:-1], 'A'), ([AND[-1]], 'A'), (HAIL, 'B'), (TLD, 'U')]
    ink0 = 10; ink1 = L[-1][1] + HM[CM[ord(TEXT[-1])]][0] - 6
    flame_top = FLAME_BASE + 300 * FLAME_S
    pad = 24
    vx0 = ink0 - pad; vx1 = ink1 + pad; vy0 = -math.ceil(flame_top) - pad; vy1 = 10 + pad
    vw = vx1 - vx0; vh = vy1 - vy0
    defs = [shade('xsv', 'y') + shade('xsh', 'x')] if weave == 'x' else []
    defs += [threads(f'p{uid}{n}', warp, weft, weave, angle, p) for n, (warp, weft) in WORDS.items()]
    def fill(n): return f'url(#p{uid}{n})'
    body = [f'<path d="{gl(idxs)}" fill="{fill(n)}"/>' for idxs, n in regions]
    # the dot of .com: woven with .com, or one color, solid
    body.append(f'<path d="{gpath(DOT)}" fill="{fill("U") if dot == "woven" else dot}"/>')
    # fire's i: a flame with a gold heart
    fx = L[I_FIRE][1] + STEM_MID
    body.append(f'<path d="{place(FLAME, FLAME_S, fx, FLAME_BASE)}" fill="{fill("S")}"/>')
    body.append(f'<path d="{place(HEART, FLAME_S, fx + 2 * FLAME_S, FLAME_BASE + 16 * FLAME_S)}" fill="{fill("G")}"/>')
    # hail's i: a hailstone, with its glint, the blue's dim
    hxc = L[I_HAIL][1] + STEM_MID
    body.append(f'<path d="{circle(hxc, -HAIL_Y, HAIL_R)}" fill="{fill("B")}"/>')
    gx, gy = hxc - HAIL_R * 0.36, -HAIL_Y - HAIL_R * 0.36
    body.append(f'<ellipse cx="{fmt(gx)}" cy="{fmt(gy)}" rx="{fmt(HAIL_R * 0.30)}" ry="{fmt(HAIL_R * 0.15)}" '
                f'transform="rotate(-45 {fmt(gx)} {fmt(gy)})" fill="{TEKHELET[2]}"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{fmt(vx0)} {fmt(vy0)} {fmt(vw)} {fmt(vh)}" '
            f'width="{fmt(vw / 10)}" height="{fmt(vh / 10)}" role="img" aria-label="{TEXT}">'
            f'<title>{TEXT}</title><defs>{"".join(defs)}</defs>{"".join(body)}</svg>\n'), (vx0, vy0, vw, vh)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    name = f'{TEXT}-woven-v1.svg'
    svg, box = mark('w')
    open(os.path.join(OUT, name), 'w').write(svg)
    print(f'mark/{name} · {len(svg):,} bytes · viewBox {" ".join(fmt(v) for v in box)} (font units; 1000 to the em, baseline at 0)'
          f' · woven {WEAVE} at {ANGLE} degrees, {P} units apart')
