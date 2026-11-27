# Every served M19 row (STEP's TBESH, Gloss column) against the TBESH file's own bytes.
# Run: python3 -I check_m19_rows.py <dl-step dir> <rows-M19.jsonl> <out dir>
import sys, os, json, re, collections, gzip
src, rowsf, outdir = sys.argv[1:4]
letters = lambda s: ''.join(ch for ch in s if 'א' <= ch <= 'ת')
name = [x for x in os.listdir(src) if x.startswith('TBESH')][0]
lines = open(os.path.join(src, name), encoding='utf-8').read().split('\n')
ents = []
for ln, l in enumerate(lines, 1):
    p = l.rstrip('\r').split('\t')
    if len(p) >= 8 and re.match(r'^H\d{4}', p[0]):
        ents.append(dict(line=ln, e=p[0], d=p[1], u=p[2], heb=p[3], tl=p[4], morph=p[5], gloss=p[6], meaning=p[7]))
print('TBESH entry lines', len(ents))
json.dump(ents, open(os.path.join(outdir, 'data', 'tbesh-entries.json'), 'w', encoding='utf-8'), ensure_ascii=False)
norm = lambda s: re.sub(r'\s+', ' ', s).strip()
by = collections.defaultdict(list); bygloss = collections.defaultdict(list)
byn = collections.defaultdict(list)
for e in ents:
    # the Hebrew column may hold several spellings with a comma between them: each is a headword of the line
    for sp in e['heb'].split(','):
        by[(letters(sp), e['gloss'])].append(e)
        byn[(letters(sp), norm(e['gloss']))].append(e)
    bygloss[norm(e['gloss'])].append(e)
C = collections.Counter(); ex = collections.defaultdict(list)
out = gzip.open(os.path.join(outdir, 'rows-differ-stepbible_tbesh_gloss.tsv.gz'), 'wt', encoding='utf-8')
out.write('class\tkey\tserved_text\tyear\theadwords\tfacts\tcuts\tprint_slot\tnote\n')
verd = open(os.path.join(outdir, 'data', 'm19-row-verdicts.jsonl'), 'w', encoding='utf-8')
for l in open(rowsf, encoding='utf-8'):
    r = json.loads(l); k = r['k']; row = r['row']; text = row[1]; note = ''
    es = []
    if (k, text) in by: cls = 'E1 exact: the Gloss column of a line whose Hebrew column has these letters'; es = by[(k, text)]
    elif (k, norm(text)) in byn: cls = 'E2 exact once runs of white space are closed and the ends trimmed'; es = byn[(k, norm(text))]
    elif norm(text) in bygloss:
        cls = 'D1 the text is a Gloss of TBESH, but of no line with these letters'
        note = '; '.join(f"{e['e']} {e['d'].strip()} {e['heb']} (line {e['line']})" for e in bygloss[norm(text)][:4])
    else: cls = 'D2 the text is no Gloss of TBESH'
    C[cls] += 1; C['year ' + str(row[4]) + ' | ' + cls[:2]] += 1
    f = row[10] or {}
    # the entry numbers the row carries against the lines it came from
    if es:
        nums = set('H' + str(int(e['e'][1:5])) for e in es)
        dnums = set(re.sub(r'^H0*', 'H', e['d'].split('=')[0].strip()) for e in es)
        fn = set(f.get('n') or [])
        C['numbers: ' + ('the row carries exactly the eStrong numbers of its lines' if fn == nums else 'the row carries some of the eStrong numbers of its lines' if fn and fn <= nums else 'the row carries no number' if not fn else 'the row carries a number none of its lines has' if not (fn & nums) else 'the row carries its lines\' numbers and others')] += 1
        if fn and not (fn & nums) and len(ex['num']) < 30: ex['num'].append((k, text, sorted(fn), sorted(nums), [e['heb'] for e in es]))
    verd.write(json.dumps(dict(k=k, text=text, cls=cls[:2], year=row[4], hw=row[6], cuts=row[7], pr=row[8], facts=f, lines=[e['line'] for e in es][:6], d=[e['d'] for e in es][:6], morph=[e['morph'] for e in es][:6]), ensure_ascii=False) + '\n')
    if cls[0] == 'D':
        out.write('\t'.join([cls, k, text, str(row[4]), json.dumps(row[6], ensure_ascii=False), json.dumps(f, ensure_ascii=False), json.dumps(row[7]), json.dumps(row[8], ensure_ascii=False), note]) + '\n')
        if len(ex[cls]) < 60: ex[cls].append((k, text, row[4], row[6], f, note))
out.close(); verd.close()
for k2, v in sorted(C.items()): print(f'{v:>7}  {k2}')
for k2 in sorted(ex):
    print('==', k2)
    for e in ex[k2]: print('   ', json.dumps(e, ensure_ascii=False))
