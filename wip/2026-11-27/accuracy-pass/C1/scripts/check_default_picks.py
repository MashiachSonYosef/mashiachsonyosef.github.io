# The picks the card prints as «here STEP reads», «here MACULA reads» (data/default-picks/<book>.bin) against the sources at each place.
# Run: python3 -I check_default_picks.py <reader/data> <out dir>
import sys, os, json, gzip, re, collections, difflib
data, W = sys.argv[1:3]
letters = lambda s: ''.join(ch for ch in s if 'א' <= ch <= 'ת')
codes = dict(zip(['genesis','exodus','leviticus','numbers','deuteronomy','joshua','judges','ruth','i-samuel','ii-samuel','i-kings','ii-kings','i-chronicles','ii-chronicles','ezra','nehemiah','esther','job','psalms','proverbs','ecclesiastes','song-of-songs','isaiah','jeremiah','lamentations','ezekiel','daniel','hosea','joel','amos','obadiah','jonah','micah','nahum','habakkuk','zephaniah','haggai','zechariah','malachi'],
 ['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL']))
# MACULA words: book -> verse -> [ (letters, english joined by space, [morph english]) ]
M = collections.defaultdict(lambda: collections.defaultdict(list))
cols = None; cur = None
for l in open(os.path.join(W, 'dl-macula', 'macula-hebrew.tsv'), encoding='utf-8'):
    p = l.rstrip('\n').split('\t')
    if cols is None: cols = p; ix = {c: i for i, c in enumerate(cols)}; continue
    b, rest = p[ix['ref']].split(' '); cv, w = rest.split('!')
    key = (b, cv, w)
    if key != cur: M[b][cv].append([p[ix['text']], [p[ix['english']]]]); cur = key
    else: M[b][cv][-1][0] += p[ix['text']]; M[b][cv][-1][1].append(p[ix['english']])
picks = {}
OFF = json.load(open(os.path.join(W, 'data', 'section-entry-offset.json')))
C = collections.Counter(); ex = collections.defaultdict(list)
out = gzip.open(os.path.join(W, 'default-picks-vs-sources.tsv.gz'), 'wt', encoding='utf-8')
out.write('class\tbook\tverse\tentry\tour_word\tcard_says\tsource_says\n')
byverse = collections.defaultdict(list)
for l in open(os.path.join(W, 'data', 'aligned.jsonl'), encoding='utf-8'):
    a = json.loads(l); z = a['z']
    if z['book'] not in picks: picks[z['book']] = json.load(gzip.open(os.path.join(data, 'default-picks', z['book'] + '.bin')))['places']
    pk = picks[z['book']][OFF[z['book']][z['label']] + z['i']]
    # STEP's reading pick against TAHOT at the place
    st = pk[0] if pk else 0
    r = [x[1] for x in (st or []) if x[0] == 0]
    if len(a['t']) == 1:
        t = a['t'][0]
        want = re.sub(r'\s+', ' ', t['tr']).strip()
        if r and re.sub(r'\s+', ' ', r[0]).strip() == want: C['STEP reading pick = the translation column at the place'] += 1
        elif not r: C['STEP reading pick: none on the place'] += 1
        else:
            C['STEP reading pick differs from the translation column at the place'] += 1
            out.write('\t'.join(['STEP pick differs', z['book'], z['label'], str(z['i']), z.get('s', ''), ' | '.join(r), t['tr']]) + '\n')
            if len(ex['step']) < 12: ex['step'].append((z['book'], z['label'], z['i'], z.get('s'), r, t['tr']))
    byverse[(z['book'], z['label'])].append((z, pk))
for (book, lab), zs in byverse.items():
    ms = M[codes[book]].get(lab, [])
    za = [letters(z.get('k') or ''.join(x.get('k', '') for x in z.get('w', []) if x.get('role') == 'QERE') or '') for z, _ in zs]
    ma = [letters(m[0]) for m in ms]
    sm = difflib.SequenceMatcher(None, za, ma, autojunk=False)
    pair = {}
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal':
            for d in range(i2 - i1): pair[i1 + d] = j1 + d
        elif tag == 'replace' and (i2 - i1) == (j2 - j1):
            for d in range(i2 - i1): pair[i1 + d] = j1 + d
    for i, (z, pk) in enumerate(zs):
        mp = pk[1] if pk and len(pk) > 1 else 0
        if i not in pair:
            C['MACULA: place not paired with a MACULA word' + (' (card prints a MACULA pick)' if mp else '')] += 1; continue
        eng = ' '.join(x for x in ms[pair[i]][1] if x)
        got = mp if isinstance(mp, str) else (mp[0] if isinstance(mp, list) and mp else '')
        norm = lambda s: re.sub(r'\s+', ' ', s).strip()
        if not got and not eng: C['MACULA: neither gives English here'] += 1
        elif norm(got) == norm(eng): C['MACULA pick = its english cells at the word, joined by a space'] += 1
        elif not got: C['MACULA gives English here, the card prints no MACULA pick'] += 1
        else:
            C['MACULA pick differs from its english cells at the word'] += 1
            out.write('\t'.join(['MACULA pick differs', z['book'], z['label'], str(z['i']), z.get('s', ''), got, eng]) + '\n')
            if len(ex['macula']) < 15: ex['macula'].append((z['book'], z['label'], z['i'], z.get('s'), got, eng))
out.close()
for k, v in sorted(C.items(), key=lambda x: -x[1]): print(f'{v:>7}  {k}')
for k in ex:
    print('==', k)
    for e in ex[k]: print('   ', e)
