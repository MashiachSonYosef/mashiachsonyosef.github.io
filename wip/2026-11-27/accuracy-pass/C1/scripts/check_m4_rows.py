# Every served M4 row (STEP's TAHOT aligned rows) against TAHOT's own bytes.
# Run: python3 -I check_m4_rows.py <rows-M4.jsonl> <tahot-rows.jsonl> <aligned.jsonl> <out dir>
import sys, json, re, collections, gzip, os
rowsf, tahotf, alignedf, outdir = sys.argv[1:5]
letters = lambda s: ''.join(ch for ch in s if '\u05d0' <= ch <= '\u05ea')
whole = collections.defaultdict(list)    # (key, text) -> [(ref, tags)]
run = collections.defaultdict(list)
bykey_texts = collections.defaultdict(set)
alltext = collections.defaultdict(list)  # text -> refs (whole column)
allpart = collections.defaultdict(list)  # trimmed single part -> refs
nrows = 0
for l in open(tahotf, encoding='utf-8'):
    t = json.loads(l); nrows += 1
    hp = [x.split('\\')[0] for x in t['hebrew'].split('/')]; ep = t['tr'].split('/'); tp = [x.split('\\')[0].strip() for x in t['ds'].split('/')]
    hl = [letters(x) for x in hp]
    key = ''.join(hl)
    whole[(key, t['tr'])].append((t['ref'], t['ds']))
    alltext[t['tr']].append(t['ref'])
    if len(hp) == len(ep):
        for i in range(len(hp)):
            allpart[ep[i].strip()].append(t['ref'])
            for j in range(i, len(hp)):
                if i == 0 and j == len(hp) - 1: continue
                k2 = ''.join(hl[i:j + 1]); tx = '/'.join(ep[i:j + 1])
                tags = '/'.join(tp[i:j + 1]) if len(tp) == len(hp) else ''
                run[(k2, tx.strip())].append((t['ref'], tags, i, j, len(hp)))
ours = collections.defaultdict(list)     # (our key, text) -> refs, where our text spells the word otherwise
ours_run = collections.defaultdict(list)
for l in open(alignedf, encoding='utf-8'):
    a = json.loads(l); z = a['z']
    if len(a['t']) != 1: continue
    t = a['t'][0]
    zk = z.get('k') or ''.join(x.get('k', '') for x in z.get('w', []) if x.get('role') == 'QERE')
    if zk and letters(zk) != letters(''.join(x.split('\\')[0] for x in t['hebrew'].split('/'))):
        ours[(zk, t['tr'])].append(t['ref'])
        pg = z.get('pg') or []
        ep = t['tr'].split('/')
        if pg and len(pg) == len(ep):
            for i in range(len(pg)):
                for j in range(i, len(pg)):
                    ours_run[(''.join(p['k'] for p in pg[i:j + 1]), '/'.join(ep[i:j + 1]).strip())].append(t['ref'])
C = collections.Counter(); ex = collections.defaultdict(list)
out = gzip.open(os.path.join(outdir, 'rows-differ-stepbible_tahot_aligned_translation.tsv.gz'), 'wt', encoding='utf-8')
out.write('class\tkey\tserved_text\tyear\theadwords\tfacts\tprint_slot\tnote\n')
allrows = open(os.path.join(outdir, 'data', 'm4-row-verdicts.jsonl'), 'w', encoding='utf-8')
for l in open(rowsf, encoding='utf-8'):
    r = json.loads(l); k = r['k']; row = r['row']; text = row[1]
    note = ''
    if (k, text) in whole: cls = 'E1 exact: a whole translation column under the letters of its Hebrew column'; src = whole[(k, text)]
    elif (k, text) in run: cls = 'E2 exact: a run of word parts cut at the slash, under the letters of those parts'; src = run[(k, text)]
    elif (k, text) in ours: cls = 'E3 exact: a whole translation column, filed under our spelling of the word'; src = ours[(k, text)]
    elif (k, text) in ours_run: cls = 'E4 exact: a run of word parts, filed under our spelling of those parts'; src = ours_run[(k, text)]
    else:
        src = []
        if text in alltext:
            cls = 'D1 the text is a translation column of TAHOT, but of no row with these letters'
            note = 'e.g. ' + alltext[text][0] + ' (' + str(len(alltext[text])) + ' rows)'
        elif text.strip() in allpart:
            cls = 'D2 the text is one word part of TAHOT, but of no part with these letters'
            note = 'e.g. ' + allpart[text.strip()][0] + ' (' + str(len(allpart[text.strip()])) + ' parts)'
        else:
            cls = 'D3 the text is in no translation column of TAHOT'
    C[cls] += 1
    C['year ' + str(row[4]) + ' | ' + cls[:2]] += 1
    allrows.write(json.dumps(dict(k=k, text=text, cls=cls[:2], n=len(src), ex=src[0][0] if src else None, year=row[4], hw=row[6], facts=row[10], pr=row[8]), ensure_ascii=False) + '\n')
    if cls[0] == 'D':
        out.write('\t'.join([cls, k, text, str(row[4]), json.dumps(row[6], ensure_ascii=False), json.dumps(row[10], ensure_ascii=False), json.dumps(row[8], ensure_ascii=False), note]) + '\n')
        if len(ex[cls]) < 40: ex[cls].append((k, text, row[4], row[6], row[10], note))
out.close(); allrows.close()
print('tahot rows', nrows)
for k2, v in sorted(C.items()): print(f'{v:>7}  {k2}')
for k2 in sorted(ex):
    print('==', k2)
    for e in ex[k2]: print('   ', json.dumps(e, ensure_ascii=False))
json.dump(dict(C), open(os.path.join(outdir, 'data', 'm4-row-counts.json'), 'w'), indent=1, ensure_ascii=False)
