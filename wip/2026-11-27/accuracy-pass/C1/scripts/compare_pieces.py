# For every aligned place: the zone's pieces (pg), tag (tg) and resting line against TAHOT's own row.
# Run: python3 -I compare_pieces.py <aligned.jsonl> <out dir>
import sys, json, re, collections, gzip, os
src, outdir = sys.argv[1:3]
letters = lambda s: ''.join(ch for ch in s if '\u05d0' <= ch <= '\u05ea')
ZW = '\u200b'
def printed_form(t): 
    s = ' + '.join(x.strip() for x in t.split('/') if x.strip())
    return re.sub(r'\.$', '', s)
sign_only = lambda t: re.fullmatch(r'(<[^>]*>|\[[^\]]*\]|\u00bf|~|X|\u00d7|\+)', t.strip()) is not None
def join_drawn(p):
    out = ''
    for i, x in enumerate(p):
        gap = x.strip() == ZW
        out += (' + ' if i and not gap and any(y.strip() != ZW for y in p[:i]) else '') + x
    return out
def signs_off(text):
    p = text.split(' + ')
    return join_drawn(p if all(sign_only(x) for x in p) else [ZW if sign_only(x) else x for x in p])
C = collections.Counter(); ex = collections.defaultdict(list)
diff = gzip.open(os.path.join(outdir, 'pieces-differ-tahot.tsv.gz'), 'wt', encoding='utf-8')
diff.write('class\tbook\tverse\tentry\ttahot_ref\ttahot_type\tour_word\ttahot_hebrew\ttahot_translation\tour_pieces\ttahot_tags\tour_tag\tline_credit\tline_text\n')
linef = gzip.open(os.path.join(outdir, 'line-vs-tahot.tsv.gz'), 'wt', encoding='utf-8')
linef.write('class\tbook\tverse\tentry\ttahot_ref\tour_word\ttahot_translation\tline_credit\tline_text\texpected_signs_off\n')
def note(cls, z, t, extra=''):
    C[cls] += 1
    pg = z.get('pg'); line = z.get('line') or [None, None, None]
    row = [cls, z['book'], z['label'], str(z['i']), t['ref'] if t else '', t['type'] if t else '', z.get('s', ''), t['hebrew'] if t else '', t['tr'] if t else '',
           json.dumps([[p['k'], p['g'], p['s'], p['r']] for p in pg], ensure_ascii=False) if pg else '', t['ds'] if t else '', (z.get('tg') if isinstance(z.get('tg'), str) else json.dumps(z.get('tg'))) or '', str(line[2]), str(line[1])]
    diff.write('\t'.join(row) + '\n')
    if len(ex[cls]) < 6: ex[cls].append(row)
n = 0
for l in open(src, encoding='utf-8'):
    a = json.loads(l); z = a['z']; ts = a['t']; how = a['how']; n += 1
    C['how:' + how] += 1
    line = z.get('line')
    credit = line[2] if line else None
    C['line-credit:' + str(credit)] += 1
    pg = z.get('pg')
    if len(ts) != 1:
        note('A0 place not paired one to one with a TAHOT row (' + how + ')', z, ts[0] if ts else None); continue
    t = ts[0]
    hp = [x.split('\\')[0] for x in t['hebrew'].split('/')]; main_h = '/'.join(hp); ep = t['tr'].split('/'); tp = [x.split('\\')[0].strip() for x in t['ds'].split('/')]
    roots = [x for x in tp if x.startswith('{')]
    root = roots[0].strip('{}+') if roots else ''
    if not pg:
        note('B0 no pieces on the word', z, t)
    else:
        srcs = set(str(p['s']) for p in pg)
        if srcs != {'tahot'}:
            note('B1 pieces credited to ' + '+'.join(sorted(srcs)), z, t)
        else:
            C['pieces-tahot'] += 1
            got = '/'.join(str(p['g']) for p in pg)
            if got == t['tr']: C['P1 pieces joined at the slash equal the translation column byte for byte'] += 1
            else:
                gp = [str(p['g']).strip() for p in pg]; epx = [x.strip() for x in ep]
                if gp == epx: note('P2 same parts, spacing differs', z, t)
                elif [x for x in gp if x] == [x for x in epx if x]: note('P3 same parts once empty parts are dropped', z, t)
                elif len(gp) != len(epx): note('P4 number of parts differs', z, t)
                else: note('P5 a part reads otherwise', z, t)
            # letters
            if [p['k'] for p in pg] == [letters(x) for x in hp]: C['K1 piece letters equal the Hebrew column part by part'] += 1
            elif ''.join(p['k'] for p in pg) == letters(main_h): note('K2 same letters, cut otherwise', z, t)
            elif how in ('spelled-otherwise', 'other-verse-number-spelled-otherwise'): C['K3 letters differ where our text spells the word otherwise'] += 1
            else: note('K4 letters differ', z, t)
            # roles
            if len(pg) == len(tp) and roots:
                ri = tp.index(roots[0])
                want = ['prefix' if i < ri else 'core' if i == ri else 'suffix' for i in range(len(tp))]
                if [p['r'] for p in pg] == want: C['R1 roles follow the root in curly brackets'] += 1
                else: note('R2 a piece is graded otherwise than the root in curly brackets says', z, t)
            elif not roots: C['R0 tahot row names no root'] += 1
            else: C['R3 part count differs (roles not compared)'] += 1
    # tag
    tg = z.get('tg')
    if 'w' in z:
        tg = next((x.get('tg') for x in z['w'] if x.get('role') == 'QERE' and x.get('tg')), tg)
    if isinstance(tg, list): tg = '|'.join(str(x) for x in tg)
    if tg == root and root: C['T1 tag equals the root tag'] += 1
    elif not tg and not root: C['T0 neither names a tag'] += 1
    elif not tg: note('T2 word carries no tag; TAHOT names ' + ('one'), z, t)
    else: note('T3 tag differs from the root tag', z, t)
    # the resting line
    if line:
        want = signs_off(printed_form(t['tr']))
        if credit == 'PIECE:TAHOT':
            if line[1] == want: C['L1 line is the translation column as the page prints it (signs off)'] += 1
            else:
                cls = 'L2 line credited to TAHOT pieces differs from the translation column as printed'
                C[cls] += 1
                linef.write('\t'.join([cls, z['book'], z['label'], str(z['i']), t['ref'], z.get('s', ''), t['tr'], credit, line[1], want]) + '\n')
        else:
            cls = 'L3 line credited to ' + str(credit) + (' and equals the translation column as printed' if line[1] == want else ' and differs from the translation column')
            C[cls] += 1
            linef.write('\t'.join([cls, z['book'], z['label'], str(z['i']), t['ref'], z.get('s', ''), t['tr'], str(credit), line[1], want]) + '\n')
    else: C['L0 no line on this entry'] += 1
diff.close(); linef.close()
print('entries', n)
for k, v in sorted(C.items()): print(f'{v:>8}  {k}')
print()
for k in sorted(ex):
    print('==', k)
    for r in ex[k]: print('   ', ' | '.join(r[1:]))
json.dump(dict(C), open(os.path.join(outdir, 'pieces-counts.json'), 'w'), indent=1, ensure_ascii=False)
