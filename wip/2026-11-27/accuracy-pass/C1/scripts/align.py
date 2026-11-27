# Aligns every zone word of the 39 books with TAHOT's row for the same place.
# Pass 1: within the Hebrew verse, by letters. Pass 2: what pass 1 left, in book order, by letters.
# Run: python3 -I align.py <zone-words.jsonl> <tahot-rows.jsonl> <out aligned.jsonl>
import sys, json, re, collections, difflib
zw, tr, out = sys.argv[1:4]
B = dict(zip(['genesis','exodus','leviticus','numbers','deuteronomy','joshua','judges','ruth','i-samuel','ii-samuel','i-kings','ii-kings','i-chronicles','ii-chronicles','ezra','nehemiah','esther','job','psalms','proverbs','ecclesiastes','song-of-songs','isaiah','jeremiah','lamentations','ezekiel','daniel','hosea','joel','amos','obadiah','jonah','micah','nahum','habakkuk','zephaniah','haggai','zechariah','malachi'],
             ['Gen','Exo','Lev','Num','Deu','Jos','Jdg','Rut','1Sa','2Sa','1Ki','2Ki','1Ch','2Ch','Ezr','Neh','Est','Job','Psa','Pro','Ecc','Sng','Isa','Jer','Lam','Ezk','Dan','Hos','Jol','Amo','Oba','Jon','Mic','Nam','Hab','Zep','Hag','Zec','Mal']))
letters = lambda s: ''.join(ch for ch in s if 'א' <= ch <= 'ת')
sim = lambda a, b: difflib.SequenceMatcher(None, a, b, autojunk=False).ratio()
Tb = collections.defaultdict(list)
for l in open(tr, encoding='utf-8'):
    r = json.loads(l)
    if r['heb']:
        m = re.match(r'^(\d+)\.(\d+)$', r['heb']); lab = f"{int(m.group(1))}:{int(m.group(2))}"
    else: lab = f"{r['ch']}:{r['vs']}"
    r['lab'] = lab; r['L'] = letters(''.join(x.split('\\')[0] for x in r['hebrew'].split('/')))
    Tb[r['book']].append(r)
Zb = collections.defaultdict(list)
for l in open(zw, encoding='utf-8'):
    r = json.loads(l); Zb[B[r['book']]].append(r)
def zl(r):
    if 'w' in r:
        q = [x.get('k', '') for x in r['w'] if x.get('role') == 'QERE'] or [x.get('k', '') for x in r['w']]
        return ''.join(letters(x) for x in q)
    return letters(r.get('k', ''))
stats = collections.Counter(); leftT = []
def block(zi, tj, za, ta, ts, pairs, used, tagp):
    # pairs a block of zone indexes with a block of TAHOT indexes where that can be done; returns nothing
    if not zi or not tj: return
    if len(tj) > len(zi):
        tj2 = [j for j in tj if ts[j]['type'] != 'X']
        if len(tj2) == len(zi): tj = tj2
    if len(zi) == len(tj):
        for a, b in zip(zi, tj):
            if sim(za[a], ta[b]) >= 0.5 or (len(za[a]) <= 2 and len(ta[b]) <= 2):
                pairs[a] = ([b], tagp + 'spelled-otherwise'); used.add(b)
        return
    zcat = ''.join(za[a] for a in zi); tcat = ''.join(ta[b] for b in tj)
    if len(zi) == 1 and sim(zcat, tcat) >= 0.7:
        pairs[zi[0]] = (tj, tagp + ('one-entry-many-rows' if zcat == tcat else 'one-entry-many-rows-spelled-otherwise')); used.update(tj)
    elif len(tj) == 1 and sim(zcat, tcat) >= 0.7:
        for a in zi: pairs[a] = (tj, tagp + ('many-entries-one-row' if zcat == tcat else 'many-entries-one-row-spelled-otherwise'))
        used.update(tj)
with open(out, 'w', encoding='utf-8') as o:
    for code in Zb:
        zs = Zb[code]; ts = Tb[code]
        za = [zl(r) for r in zs]; ta = [t['L'] for t in ts]
        pairs = {}; used = set()
        zv = collections.defaultdict(list); tv = collections.defaultdict(list)
        for i, r in enumerate(zs): zv[r['label']].append(i)
        for j, t in enumerate(ts):
            if t['type'] not in ('X', 'R'): tv[t['lab']].append(j)
        for lab, zi in zv.items():
            tj = tv.get(lab, [])
            sm = difflib.SequenceMatcher(None, [za[i] for i in zi], [ta[j] for j in tj], autojunk=False)
            for tag, i1, i2, j1, j2 in sm.get_opcodes():
                if tag == 'equal':
                    for d in range(i2 - i1): pairs[zi[i1 + d]] = ([tj[j1 + d]], 'equal'); used.add(tj[j1 + d])
                elif tag == 'replace': block(zi[i1:i2], tj[j1:j2], za, ta, ts, pairs, used, '')
        # pass 1b: a chapter that pass 1 left words in is aligned again whole (the verses are numbered otherwise there)
        zc = collections.defaultdict(list); tc = collections.defaultdict(list)
        for i, r in enumerate(zs): zc[r['label'].split(':')[0]].append(i)
        for j, t in enumerate(ts):
            if t['type'] not in ('X', 'R'): tc[t['lab'].split(':')[0]].append(j)
        for ch, zi in zc.items():
            tj = tc.get(ch, [])
            if all(i in pairs for i in zi) and all((j in used or ts[j]['type'] == 'X') for j in tj): continue
            for i in zi: pairs.pop(i, None)
            for j in tj: used.discard(j)
            sm = difflib.SequenceMatcher(None, [za[i] for i in zi], [ta[j] for j in tj], autojunk=False)
            for tag, i1, i2, j1, j2 in sm.get_opcodes():
                if tag == 'equal':
                    for d in range(i2 - i1):
                        a, b = zi[i1 + d], tj[j1 + d]
                        pairs[a] = ([b], 'equal' if zs[a]['label'] == ts[b]['lab'] else 'equal-other-verse-number'); used.add(b)
                elif tag == 'replace': block(zi[i1:i2], tj[j1:j2], za, ta, ts, pairs, used, 'chapter-')
        # pass 2: the leftovers of the book, in order
        zi = [i for i in range(len(zs)) if i not in pairs]; tj = [j for j in range(len(ts)) if j not in used]
        if zi and tj:
            sm = difflib.SequenceMatcher(None, [za[i] for i in zi], [ta[j] for j in tj], autojunk=False)
            for tag, i1, i2, j1, j2 in sm.get_opcodes():
                if tag == 'equal':
                    for d in range(i2 - i1): pairs[zi[i1 + d]] = ([tj[j1 + d]], 'equal-other-verse-number'); used.add(tj[j1 + d])
                elif tag == 'replace': block(zi[i1:i2], tj[j1:j2], za, ta, ts, pairs, used, 'other-verse-number-')
        for j, t in enumerate(ts):
            if j not in used: leftT.append(t)
        for i, r in enumerate(zs):
            tjx, how = pairs.get(i, ([], 'no-tahot-row'))
            stats[how] += 1
            o.write(json.dumps(dict(z=r, how=how, t=[ts[j] for j in tjx]), ensure_ascii=False) + '\n')
print('stats', dict(stats))
print('tahot rows no zone entry took:', len(leftT), collections.Counter(t['type'] for t in leftT))
for t in leftT:
    if t['type'] != 'X': print('  ', t['ref'], t['hebrew'], '|', t['tr'])
