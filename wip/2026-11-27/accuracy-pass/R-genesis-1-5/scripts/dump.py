#!/usr/bin/env python3
# Read-only: lists Genesis 1 to 5 verse by verse: entry index, the Hebrew word, STEP's tag, the pieces, the line at rest and its credit.
import gzip, json, sys
R = sys.argv[1]
out = sys.argv[2]
rl = json.load(gzip.open(R + '/data/resting-lines/genesis.json.gz'))
z = json.load(gzip.open(R + '/data/zones/genesis.bin'))
lines = {lab: {row[0]: row for row in rows} for lab, rows in rl['sections']}
n_words = 0
n_verses = 0
rows_tsv = []
with open(out + '/read.txt', 'w') as f:
    for si, sec in enumerate(z['sections']):
        lab = sec['label']
        ch = int(lab.split(':')[0])
        if ch > 5:
            break
        n_verses += 1
        f.write('\n== %s (section %d)\n' % (lab, si))
        f.write('   ' + ' '.join(w['s'] for w in sec['words']) + '\n')
        wn = 0
        for e, w in enumerate(sec['words']):
            if 'mark' in w:
                continue
            wn += 1
            n_words += 1
            row = lines.get(lab, {}).get(e)
            line = row[2] if row else '(NO LINE)'
            credit = row[3] if row else ''
            pg = ' | '.join('%s=%s[%s,%s]' % (p.get('k'), p.get('g'), p.get('s'), p.get('r')) for p in w.get('pg', []))
            extra = {k: v for k, v in w.items() if k not in ('s', 'k', 'h', 'hp', 'pg', 'tg', 'hg', 'hm')}
            f.write('%2d(e%d) %s\t%s\t[%s]\t%s\ttg=%s\t%s\t%s\n' % (wn, e, w['s'], repr(line)[1:-1], credit, pg, w.get('tg'), w.get('hg', ''), json.dumps(extra, ensure_ascii=False) if extra else ''))
            rows_tsv.append((lab, si, e, wn, w['s'], line, credit, w.get('tg', '')))
with open(out + '/lines-gen-1-5.tsv', 'w') as f:
    f.write('place\tsection\tentry\tword_no\thebrew\tline\tcredit\tstep_tag\n')
    for r in rows_tsv:
        f.write('\t'.join(str(x) for x in r) + '\n')
print('verses', n_verses, 'words', n_words)
