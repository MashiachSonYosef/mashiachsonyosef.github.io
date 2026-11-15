# The woven name with no hand-off into «and», «and» woven of gold and bronze,
# «.com» of purple and silver (the owner, 15 November). Reads woven-none.svg.
import re, sys
src, outdir = sys.argv[1], sys.argv[2]
t = open(src, encoding='utf-8').read()
GOLD = ('#a48829', '#d3af37')      # edge, body: the real gold, its edge the same gold darker
BRONZE = ('#7f6044', '#9a7656')    # the page's bronze (the card's outline), its light along the thread
SILVER = ('#7c8187', '#b4b8bd')    # the page's silver (the blobs' outline), its light along the thread
PURPLE = ('#642460', '#753c6d')    # argaman regular and dim, as today
def metal(id_, edge, body):        # the gold thread's shape: edge, body across the middle, edge
    return (f'<linearGradient id="{id_}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{edge}"/>'
            f'<stop offset=".22" stop-color="{body}"/><stop offset=".78" stop-color="{body}"/><stop offset="1" stop-color="{edge}"/></linearGradient>')
def dye(id_, reg, dim):            # a dyed thread's shape, as fire, hail and .com have it: lit along its middle
    return (f'<linearGradient id="{id_}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{reg}"/><stop offset=".22" stop-color="{reg}"/>'
            f'<stop offset=".46" stop-color="{dim}"/><stop offset=".78" stop-color="{reg}"/><stop offset="1" stop-color="{reg}"/></linearGradient>')
def two(id_, g1, g2):              # two threads, 42 units each, side by side
    return (f'<pattern id="{id_}" patternUnits="userSpaceOnUse" width="400" height="84" patternTransform="rotate(60)">'
            f'<rect y="0" width="400" height="42" fill="url(#{g1})"/><rect y="42" width="400" height="42" fill="url(#{g2})"/></pattern>')
# 1. the a and the d drawn like the n: their clip paths become filled paths
for cid in ('cwr1', 'cwr3'):
    d = re.search(rf'<clipPath id="{cid}"><path d="([^"]+)"/></clipPath>', t).group(1)
    t = re.sub(rf'<clipPath id="{cid}">.*?</clipPath>', '', t, count=1, flags=re.S)
    g = re.compile(rf'<g clip-path="url\(#{cid}\)"><g transform="rotate\(60\)">.*?</g></g>', re.S)
    assert len(g.findall(t)) == 1
    t = g.sub(f'<path d="{d}" fill="url(#pwA)"/>', t)
# 2. the turn's unrotated patterns are no longer used: drop them and their gradients
for n in ('S', 'G', 'B', 'U', 'A'):
    t = re.sub(rf'<pattern id="qw{n}"[^>]*>.*?</pattern>', '', t, flags=re.S)
    t = re.sub(rf'<linearGradient id="qw{n}[^"]*"[^>]*>.*?</linearGradient>', '', t, flags=re.S)
assert 'qw' not in t and 'cwr' not in t
# 3. «and»: gold and bronze
t = re.sub(r'<linearGradient id="pwAA[^"]*"[^>]*>.*?</linearGradient>', '', t, flags=re.S)
t = re.sub(r'<pattern id="pwA"[^>]*>.*?</pattern>', metal('pwAg', *GOLD) + metal('pwAb', *BRONZE) + two('pwA', 'pwAg', 'pwAb'), t, count=1, flags=re.S)
# 4. «.com»: purple and silver
t = re.sub(r'<linearGradient id="pwUl"[^>]*>.*?</linearGradient>', '', t, count=1, flags=re.S)
t = re.sub(r'<pattern id="pwU"[^>]*>.*?</pattern>', dye('pwUp', *PURPLE) + metal('pwUs', *SILVER) + two('pwU', 'pwUp', 'pwUs'), t, count=1, flags=re.S)
assert t.count('fill="url(#pwA)"') == 3 and t.count('fill="url(#pwU)"') == 1 and t.count('fill="#7f6044"') == 1
for ref in set(re.findall(r'url\(#([^)]+)\)', t)):
    assert f'id="{ref}"' in t, ref
for id_ in re.findall(r' id="([^"]+)"', t):
    assert f'#{id_})' in t, f'unused {id_}'
V = {'bronze-dot': t, 'woven-dot': t.replace('fill="#7f6044"', 'fill="url(#pwU)"', 1)}
VB = 'viewBox="-14 -845 7102 879" width="710.2" height="87.9"'
for name, s in V.items():
    open(f'{outdir}/woven-{name}.svg', 'w', encoding='utf-8').write(s)
    for cut, vb in (('and', 'viewBox="1150 -845 2600 879" width="260" height="87.9"'), ('com', 'viewBox="4890 -845 2198 879" width="219.8" height="87.9"')):
        assert VB in s
        open(f'{outdir}/close-{cut}-{name}.svg', 'w', encoding='utf-8').write(s.replace(VB, vb, 1))
print('ok', len(t))
