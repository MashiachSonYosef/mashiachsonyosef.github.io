# The woven name woven both ways, an X: warp and weft cross, each passing over
# one and under the next (plain weave), the over thread shaded where it dips
# under. One-color words weave their color with itself; «and» crosses gold
# with bronze; «.com» and its dot cross purple with silver (the owner, 15 November).
# python3 -I weave.py <woven-woven-dot.svg> <out dir>
import re, sys
src, outdir = sys.argv[1], sys.argv[2]
t = open(src, encoding='utf-8').read()
GOLD, BRONZE, SILVER = ('metal', '#a48829', '#d3af37'), ('metal', '#7f6044', '#9a7656'), ('metal', '#7c8187', '#b4b8bd')
SCARLET, BLUE, PURPLE = ('dye', '#a52035', '#be6367'), ('dye', '#23558a', '#768ea2'), ('dye', '#642460', '#753c6d')
WORDS = {'pwS': (SCARLET, SCARLET), 'pwG': (GOLD, GOLD), 'pwB': (BLUE, BLUE), 'pwA': (GOLD, BRONZE), 'pwU': (PURPLE, SILVER)}
def grad(id_, thread, across):
    kind, a, b = thread
    xy = 'x1="0" y1="0" x2="1" y2="0"' if across == 'x' else 'x1="0" y1="0" x2="0" y2="1"'
    stops = ([(0, a), ('.22', a), ('.46', b), ('.78', a), (1, a)] if kind == 'dye' else [(0, a), ('.22', b), ('.78', b), (1, a)])
    return f'<linearGradient id="{id_}" {xy}>' + ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops) + '</linearGradient>'
def shade(id_, along, depth):  # dark at both ends of an over-thread, where it dips under
    xy = 'x1="0" y1="0" x2="1" y2="0"' if along == 'x' else 'x1="0" y1="0" x2="0" y2="1"'
    return (f'<linearGradient id="{id_}" {xy}><stop offset="0" stop-color="#000" stop-opacity="{depth}"/><stop offset=".3" stop-color="#000" stop-opacity="0"/>'
            f'<stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="{depth}"/></linearGradient>')
def weave(id_, warp, weft, P, xf):
    # the tile: warp runs along y (two threads, columns), weft along x (two threads, rows);
    # (col 0, row 0) and (col 1, row 1) show the warp over, the other two the weft over
    g = grad(f'{id_}w', warp, 'x') + grad(f'{id_}f', weft, 'y')
    cell = lambda x, y, over: (f'<rect x="{x}" y="{y}" width="{P}" height="{P}" fill="url(#{id_}{over})"/>'
                               f'<rect x="{x}" y="{y}" width="{P}" height="{P}" fill="url(#{"xsv" if over == "w" else "xsh"})"/>')
    return g + (f'<pattern id="{id_}" patternUnits="userSpaceOnUse" width="{2 * P}" height="{2 * P}" patternTransform="{xf}">'
                + cell(0, 0, 'w') + cell(P, 0, 'f') + cell(0, P, 'f') + cell(P, P, 'w') + '</pattern>')
XF = {'x60': 'matrix(0.5 -0.8660254 0.5 0.8660254 0 0)', 'x45': 'rotate(45)'}
VB = 'viewBox="-14 -845 7102 879" width="710.2" height="87.9"'
cuts = (('and', 'viewBox="1150 -845 2600 879" width="260" height="87.9"'), ('com', 'viewBox="4890 -845 2198 879" width="219.8" height="87.9"'))
i0, i1 = t.index('<defs>') + len('<defs>'), t.index('</defs>')
for name, xf, P, depth in (('x60-28', XF['x60'], 28, .26), ('x45-28', XF['x45'], 28, .26), ('x45-21', XF['x45'], 21, .26), ('x60-21', XF['x60'], 21, .26)):
    defs = shade('xsv', 'y', depth) + shade('xsh', 'x', depth) + ''.join(weave(k, *v, P, xf) for k, v in WORDS.items())
    s = t[:i0] + defs + t[i1:]
    for ref in set(re.findall(r'url\(#([^)]+)\)', s)): assert f'id="{ref}"' in s, (name, ref)
    assert s.count('fill="url(#pwU)"') == 2 and 'fill="#7f6044"' not in s
    open(f'{outdir}/woven-{name}.svg', 'w', encoding='utf-8').write(s)
    for cut, vb in cuts: open(f'{outdir}/close-{cut}-{name}.svg', 'w', encoding='utf-8').write(s.replace(VB, vb, 1))
print('ok')
