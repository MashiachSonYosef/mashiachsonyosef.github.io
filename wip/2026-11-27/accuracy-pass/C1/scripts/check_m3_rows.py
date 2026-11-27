# Every served M3 row (MACULA, the english column) against macula-hebrew.tsv as received.
# Run: python3 -I check_m3_rows.py <macula-hebrew.tsv> <rows-M3.jsonl> <out dir>
import sys, os, json, re, collections, gzip, csv
src, rowsf, outdir = sys.argv[1:4]
letters = lambda s: ''.join(ch for ch in s if 'א' <= ch <= 'ת')
norm = lambda s: re.sub(r'\s+', ' ', s).strip()
exact = collections.defaultdict(list); normed = collections.defaultdict(list); eng_any = collections.defaultdict(int)
n = 0; cols = None; empty_eng = 0
info = {}
with open(src, encoding='utf-8', newline='') as f:
    for line in f:
        p = line.rstrip('\n').rstrip('\r').split('\t')
        if cols is None: cols = p; ix = {c: i for i, c in enumerate(cols)}; continue
        n += 1
        k = letters(p[ix['text']]); e = p[ix['english']]
        if not e: empty_eng += 1; continue
        key = (k, e)
        if len(exact[key]) < 3: exact[key].append(p[ix['xml:id']])
        nk = (k, norm(e))
        if len(normed[nk]) < 3: normed[nk].append(p[ix['xml:id']])
        eng_any[norm(e)] += 1
        if key not in info: info[key] = (p[ix['ref']], p[ix['strongnumberx']], p[ix['lemma']], p[ix['class']], p[ix['type']], p[ix['gloss']])
print('source rows', n, 'columns', len(cols), 'rows with an empty english column', empty_eng, 'distinct (letters, english)', len(exact))
C = collections.Counter(); ex = collections.defaultdict(list)
out = gzip.open(os.path.join(outdir, 'rows-differ-macula_hebrew_cherith_surface_english_2022.tsv.gz'), 'wt', encoding='utf-8')
out.write('class\tkey\tserved_text\tyear\theadwords\tfacts\tcuts\tprint_slot\tnote\n')
verd = open(os.path.join(outdir, 'data', 'm3-row-verdicts.jsonl'), 'w', encoding='utf-8')
served = set()
for l in open(rowsf, encoding='utf-8'):
    r = json.loads(l); k = r['k']; row = r['row']; text = row[1]; note = ''
    served.add((k, text))
    if (k, text) in exact: cls = 'E1 exact: the english column of a row whose text column has these letters'; ids = exact[(k, text)]
    elif (k, norm(text)) in normed: cls = 'E2 exact once runs of white space are closed and the ends trimmed'; ids = normed[(k, norm(text))]
    elif norm(text) in eng_any: cls = 'D1 the text is an english cell of MACULA, but of no row with these letters'; ids = []; note = str(eng_any[norm(text)]) + ' rows'
    else: cls = 'D2 the text is no english cell of MACULA'; ids = []
    C[cls] += 1; C['year ' + str(row[4]) + ' | ' + cls[:2]] += 1
    f = row[10] or {}
    if ids:
        i = info.get((k, text))
        if i:
            num = 'H' + re.sub(r'^0+', '', re.sub(r'[a-z]$', '', i[1])) if i[1] else None
            fn = set(f.get('n') or [])
            C['numbers: ' + ('row carries the number of its cited row' if num in fn else 'row carries no number' if not fn else 'row carries other numbers than its first cited row')] += 1
    verd.write(json.dumps(dict(k=k, text=text, cls=cls[:2], year=row[4], hw=row[6], cuts=row[7], pr=row[8], facts=f, ids=ids, info=info.get((k, text))), ensure_ascii=False) + '\n')
    if cls[0] == 'D':
        out.write('\t'.join([cls, k, text, str(row[4]), json.dumps(row[6], ensure_ascii=False), json.dumps(f, ensure_ascii=False), json.dumps(row[7]), json.dumps(row[8], ensure_ascii=False), note]) + '\n')
        if len(ex[cls]) < 60: ex[cls].append((k, text, row[4], row[6], f, note))
out.close(); verd.close()
for k2, v in sorted(C.items()): print(f'{v:>7}  {k2}')
for k2 in sorted(ex):
    print('==', k2)
    for e in ex[k2]: print('   ', json.dumps(e, ensure_ascii=False))
json.dump({'source_rows': n, 'distinct_pairs': len(exact)}, open(os.path.join(outdir, 'data', 'm3-source-counts.json'), 'w'))
# keep the distinct pairs for the fold count
with gzip.open(os.path.join(outdir, 'data', 'macula-pairs.tsv.gz'), 'wt', encoding='utf-8') as o:
    for (k, e), ids in exact.items(): o.write(k + '\t' + e + '\t' + ids[0] + '\n')
