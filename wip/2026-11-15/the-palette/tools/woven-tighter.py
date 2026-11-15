# Option 2 (the dot woven with .com) with the threads closer together.
# P is the distance between threads in font units (42 today: two to three pixels at the door's size).
import re, sys
src, outdir = sys.argv[1], sys.argv[2]
t = open(src, encoding='utf-8').read()
i0, i1 = t.index('<defs>'), t.index('</defs>')
defs = t[i0:i1]
assert defs.count('height="42"') and defs.count('height="84"') and defs.count('y="42"')
def tight(P, s):
    # through placeholders, so 2P = 42 (P = 21) is not replaced a second time
    s = s.replace('height="84"', 'height="@2P@"').replace('height="42"', 'height="@P@"').replace('y="42"', 'y="@P@"')
    return s.replace('@2P@', str(2 * P)).replace('@P@', str(P))
VB = 'viewBox="-14 -845 7102 879" width="710.2" height="87.9"'
cuts = (('and', 'viewBox="1150 -845 2600 879" width="260" height="87.9"'), ('com', 'viewBox="4890 -845 2198 879" width="219.8" height="87.9"'))
def write(name, s):
    for ref in set(re.findall(r'url\(#([^)]+)\)', s)): assert f'id="{ref}"' in s, ref
    open(f'{outdir}/woven-{name}.svg', 'w', encoding='utf-8').write(s)
    for cut, vb in cuts: open(f'{outdir}/close-{cut}-{name}.svg', 'w', encoding='utf-8').write(s.replace(VB, vb, 1))
write('p42', t)
for P in (28, 21):
    write(f'p{P}', t[:i0] + tight(P, defs) + t[i1:])
# only the dot tighter: its own pattern, the rest as drawn
m = re.search(r'<pattern id="pwU"[^>]*>.*?</pattern>', t, re.S)
dotpat = tight(21, m.group(0)).replace('id="pwU"', 'id="pwUd"', 1)
s = t.replace(m.group(0), m.group(0) + dotpat, 1)
ends = [mm.start() for mm in re.finditer(r'fill="url\(#pwU\)"', s)]
assert len(ends) == 2  # the letters of com, then the dot
s = s[:ends[1]] + 'fill="url(#pwUd)"' + s[ends[1] + len('fill="url(#pwU)"'):]
write('dot21', s)
print('ok')
