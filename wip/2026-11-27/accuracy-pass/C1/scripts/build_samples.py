# Builds the lists of places whose cards are read on the page: 60 for TAHOT's pieces, 60 for TAHOT's rows (M4),
# 60 for TBESH (M19), 60 for MACULA (M3 and its pieces), stratified by the mark classes, across the books.
# Run: python3 -I build_samples.py <out dir>
import sys, os, json, re, collections, random
W = sys.argv[1]
random.seed(39)
SI = json.load(open(os.path.join(W, 'data', 'section-index.json')))
numof = lambda t: (lambda m: 'H' + str(int(m.group(1))) if m else None)(re.match(r'^H0*(\d+)', str(t)))
A = []
core = collections.defaultdict(list)   # core piece key -> places
byref = {}
for l in open(os.path.join(W, 'data', 'aligned.jsonl'), encoding='utf-8'):
    a = json.loads(l); z = a['z']; A.append(a)
    pg = z.get('pg') or []
    cores = [p['k'] for p in pg if p['r'] == 'core']
    tg = z.get('tg')
    for t in a['t']: byref[t['ref']] = a
    if len(cores) == 1 and isinstance(tg, str):
        core[cores[0]].append((z['book'], z['label'], z['i'], tg, len(pg)))
def place(z, **kw):
    d = dict(book=z['book'], label=z['label'], si=SI[z['book']][z['label']], e=z['i']); d.update(kw); return d
def pick(cands, n, used_books, key=lambda c: c[0]['z']['book']):
    # spread over books: prefer books least used so far
    out = []
    random.shuffle(cands)
    while cands and len(out) < n:
        cands.sort(key=lambda c: used_books[key(c)])
        c = cands.pop(0); out.append(c); used_books[key(c)] += 1
    return out
# ---------- A: TAHOT pieces
ub = collections.Counter(); SA = []
strata = [
 ('plain one piece', 3, lambda t, z: '/' not in t['tr'] and not re.search(r'[\[\]<>?!¿:;-]', t['tr'])),
 ('two or three pieces at the slash', 4, lambda t, z: t['tr'].count('/') >= 2 and not re.search(r'[\[\]<>?!¿]', t['tr'])),
 ('a piece that is an angle-bracket sign alone, beside words', 4, lambda t, z: any(re.fullmatch(r'<[^>]*>', x.strip()) for x in t['tr'].split('/')) and '/' in t['tr'] and not all(re.fullmatch(r'<[^>]*>', x.strip()) for x in t['tr'].split('/'))),
 ('the whole word an angle-bracket sign, standing free', 2, lambda t, z: re.fullmatch(r'<[^>]*>', t['tr'].strip()) and not z.get('mq')),
 ('the whole word an angle-bracket sign, tied by maqaf', 2, lambda t, z: re.fullmatch(r'<[^>]*>', t['tr'].strip()) and z.get('mq')),
 ('angle-bracket words inside a piece', 4, lambda t, z: any(('<' in x and not re.fullmatch(r'\s*(<[^>]*>|\[[^\]]*\]|\s)+', x)) for x in t['tr'].split('/')) and '<obj' not in t['tr']),
 ('square-bracket words inside a piece', 3, lambda t, z: re.search(r'\[[a-z ]+\] \w', t['tr']) is not None and '<' not in t['tr']),
 ('a piece that is a square-bracket sign alone, beside words', 3, lambda t, z: any(re.fullmatch(r'\[[^\]]*\]', x.strip()) for x in t['tr'].split('/')) and '/' in t['tr']),
 ('a piece of two bracketed signs', 3, lambda t, z: any(re.fullmatch(r'\s*(<[^>]*>|\[[^\]]*\])(\s*(<[^>]*>|\[[^\]]*\]))+\s*', x) for x in t['tr'].split('/')) and '/' in t['tr']),
 ('the inverted question mark as a piece', 3, lambda t, z: '¿' in t['tr']),
 ('the exclamation mark as its own piece', 2, lambda t, z: re.search(r'/ !$', t['tr']) is not None),
 ('an exclamation or question mark on a word', 3, lambda t, z: re.search(r'\w[!?]', t['tr']) is not None and '¿' not in t['tr']),
 ('a cut name or number with the plus tag', 4, lambda t, z: '+' in t['ds'] and t['tr'].rstrip().endswith('-')),
 ('the tail of a cut name or number', 2, lambda t, z: re.match(r'^(<the>/ )?-\w', t['tr']) is not None or t['tr'] in ('teen', 'teen [cubits]')),
 ('the Aramaic ending, English in English order', 4, lambda t, z: 'H9010' in t['ds'] and re.match(r'^(and/ )?<the>/ ', t['tr']) is not None),
 ('the Aramaic ending, English in Hebrew order', 2, lambda t, z: 'H9010' in t['ds'] and re.search(r'/ (the|O)$', t['tr']) is not None),
 ('a gender label or a bracketed question mark', 2, lambda t, z: re.search(r'\[(masc|fem|\?)\]', t['tr']) is not None),
 ('a colon or a semicolon', 3, lambda t, z: ':' in t['tr'] or ';' in t['tr']),
 ('a bracket the source leaves open or unopened', 3, lambda t, z: t['tr'].count('[') != t['tr'].count(']') or t['tr'].count('<') != t['tr'].count('>')),
 ('a read form of two or three words', 4, lambda t, z: 'w' in z and '/ /' in t['tr'] or (t['tr'].count('//') > 0)),
 ('letters in brackets glued to a word', 3, lambda t, z: re.search(r'\w(\[[a-z]+\]|<s>)', t['tr']) is not None),
 ('the directional ending', 1, lambda t, z: re.search(r'/ -wards?$', t['tr']) is not None),
]
longest = sorted([a for a in A if len(a['t']) == 1 and (a['z'].get('line') or [0, 0, 0])[2] == 'PIECE:TAHOT'], key=lambda a: -len(a['t'][0]['tr']))[:40]
seen = set()
for name, n, pred in strata:
    c = [(a,) for a in A if len(a['t']) == 1 and (a['z'].get('line') or [0, 0, 0])[2] == 'PIECE:TAHOT' and pred(a['t'][0], a['z']) and (a['z']['book'], a['z']['label'], a['z']['i']) not in seen]
    for (a,) in pick(c, n, ub):
        seen.add((a['z']['book'], a['z']['label'], a['z']['i']))
        SA.append(place(a['z'], stratum=name, tahot_ref=a['t'][0]['ref'], tahot_hebrew=a['t'][0]['hebrew'], tahot_translation=a['t'][0]['tr'], tahot_tags=a['t'][0]['ds']))
for a in pick([(x,) for x in longest], 60 - len(SA), ub):
    a = a[0]; SA.append(place(a['z'], stratum='the longest translation columns', tahot_ref=a['t'][0]['ref'], tahot_hebrew=a['t'][0]['hebrew'], tahot_translation=a['t'][0]['tr'], tahot_tags=a['t'][0]['ds']))
json.dump(SA, open(os.path.join(W, 'data', 'places-tahot-pieces.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('A', len(SA), collections.Counter(p['stratum'] for p in SA), len(set(p['book'] for p in SA)), 'books')
# helper: a place for a row (key, numbers, lettered tags)
def find_place(k, n, t, ub, prefer_ref=None):
    c = core.get(k, [])
    ok = [x for x in c if numof(x[3]) in (n or []) and (not t or re.sub(r'^H0*', 'H', x[3]) in t or not re.search(r'[A-Za-z]$', x[3]))]
    if not ok: return None
    random.shuffle(ok); ok.sort(key=lambda x: ub[x[0]])
    x = ok[0]; ub[x[0]] += 1
    return dict(book=x[0], label=x[1], si=SI[x[0]][x[1]], e=x[2], place_tag=x[3])
def rows_of(m):
    return [json.loads(l) for l in open(os.path.join(W, 'data', f'rows-{m}.jsonl'), encoding='utf-8')]
def sample_rows(m, strata, total, fname, extra=None):
    rows = rows_of(m); ub = collections.Counter(); S = []; seenk = set()
    for name, n, pred in strata:
        c = [r for r in rows if pred(r['row'][1], r) and (r['k'], r['row'][1]) not in seenk]
        random.shuffle(c); got = 0
        for r in c:
            if got >= n: break
            f = r['row'][10] or {}
            p = find_place(r['k'], f.get('n'), f.get('t'), ub)
            if not p: continue
            seenk.add((r['k'], r['row'][1])); got += 1
            p.update(stratum=name, key=r['k'], row_text=r['row'][1], row_year=r['row'][4], row_facts=f, row_cuts=r['row'][7], row_print=r['row'][8], press=None)
            S.append(p)
        if got < n: print('   short:', name, got, 'of', n)
    if extra: S.extend(extra)
    json.dump(S[:total + 20], open(os.path.join(W, 'data', fname), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(m, len(S), collections.Counter(p['stratum'] for p in S), len(set(p['book'] for p in S)), 'books')
    return S
has = lambda pat: (lambda t, r: re.search(pat, t) is not None)
# ---------- B: M4 rows
sample_rows('M4', [
 ('plain', 5, lambda t, r: not re.search(r'[^A-Za-z ]', t) and r['row'][4] == 'S_NO_SOURCE_YEAR'),
 ('square-bracket words', 7, lambda t, r: re.search(r'\[[a-z ]+\]', t) is not None and '<' not in t and '/' not in t),
 ('letters in square brackets glued to a word', 4, has(r'\w\[[a-z]+\]')),
 ('angle-bracket words inside', 5, lambda t, r: '<' in t and '/' not in t and not re.search(r'\w<', t)),
 ('a plural ending in angle brackets', 4, has(r'\w<s>')),
 ('a question mark', 4, has(r'\?')),
 ('an exclamation mark', 3, has(r'!')),
 ('a hyphen inside', 4, has(r'\w-\w')),
 ('an apostrophe', 3, has(r"'")),
 ('a colon or semicolon', 2, has(r'[:;]')),
 ('a gender label', 2, has(r'\[(masc|fem)\]')),
 ('a row carrying a year that is not STEP\'s', 6, lambda t, r: r['row'][4] != 'S_NO_SOURCE_YEAR'),
 ('a row its source gives as a name', 4, lambda t, r: (r['row'][10] or {}).get('name') == 1 and r['row'][8] is None),
 ('the longest rows', 4, lambda t, r: len(t) >= 34 and '/' not in t),
 ('a row that prints no pill by the owner\'s ruling', 3, lambda t, r: r['row'][8] == []),
], 60, 'places-m4-rows.json')
# ---------- C: TBESH
sample_rows('M19', [
 ('colon: head and sense (divides)', 14, lambda t, r: ': ' in t and r['row'][7]),
 ('colon rows the ledger keeps whole', 4, lambda t, r: ': ' in t and not r['row'][7]),
 ('slash between readings (divides)', 7, lambda t, r: '/' in t and ':' not in t and r['row'][7]),
 ('slash the ledger keeps whole', 3, lambda t, r: '/' in t and ':' not in t and not r['row'][7]),
 ('round brackets around a part of a name', 7, lambda t, r: '(' in t and ':' not in t and (r['row'][10] or {}).get('name') == 1),
 ('round brackets, not a name', 4, lambda t, r: '(' in t and (r['row'][10] or {}).get('name') != 1),
 ('grave accents', 3, has(r'`')),
 ('square brackets', 3, has(r'\[')),
 ('exclamation or question mark', 3, has(r'[!?]')),
 ('apostrophe', 2, has(r"'")),
 ('hyphen inside a word', 3, lambda t, r: re.search(r'\w-\w', t) is not None and '(' not in t),
 ('a row carrying a year that is not TBESH\'s', 4, lambda t, r: r['row'][4] != 'S_NO_SOURCE_YEAR'),
 ('plain', 6, lambda t, r: not re.search(r'[^A-Za-z ]', t) and r['row'][4] == 'S_NO_SOURCE_YEAR'),
 ('a row that prints no pill by the owner\'s ruling', 2, lambda t, r: r['row'][8] == []),
], 60, 'places-tbesh.json')
# ---------- D: MACULA rows and pieces
mp = []
c = [(a,) for a in A if (a['z'].get('line') or [0, 0, 0])[2] in ('PIECE:MACULA', 'M3')]
ubm = collections.Counter()
for (a,) in pick(c, 10, ubm):
    t = a['t'][0] if a['t'] else {}
    mp.append(place(a['z'], stratum='the line is MACULA\'s at this place', tahot_ref=t.get('ref'), tahot_translation=t.get('tr'), tahot_hebrew=t.get('hebrew')))
sample_rows('M3', [
 ('tilde in a phrase', 10, lambda t, r: ' ~ ' in t),
 ('tilde glued to a word', 4, lambda t, r: re.search(r'~\w|\w~', t) is not None),
 ('curly apostrophe', 5, has(r'’')),
 ('hyphen', 5, has(r'-')),
 ('round brackets', 5, has(r'\(')),
 ('exclamation mark', 3, has(r'!')),
 ('question mark', 3, has(r'\?')),
 ('slash or full stop', 2, has(r'[/.]')),
 ('run-together words', 3, lambda t, r: re.search(r'\b(to|at|in|no|a|the)[a-z]{4,}\b', t) is not None and re.search(r'\b(toanger|atall|nolonger|tofall|todie|togo|tocome|tobe)\b', t) is not None),
 ('a row carrying a year that is not MACULA\'s', 4, lambda t, r: r['row'][4] != '2022'),
 ('a row its source gives as a name', 3, lambda t, r: (r['row'][10] or {}).get('name') == 1),
 ('plain', 5, lambda t, r: not re.search(r'[^A-Za-z ]', t) and r['row'][4] == '2022'),
 ('a row that prints a part or no pill by the owner\'s ruling', 3, lambda t, r: r['row'][8] is not None or r['row'][7]),
], 50, 'places-macula.json', extra=mp)
