#!/usr/bin/env python3
# Read-only: counts, over the lines at rest of all 39 books, the patterns this reader flagged in Genesis 1 to 5.
import gzip, json, sys, os, re, glob
R = sys.argv[1]
ZW = '​'
tot = {'words': 0, 'gap_only': 0, 'has_gap': 0, 'the_in_suffix': 0, 'two_signs_piece': 0, 'bang': 0, 'spring': 0}
per = {}
samples = {k: [] for k in tot}
for p in sorted(glob.glob(R + '/data/resting-lines/*.json.gz')):
    book = os.path.basename(p)[:-8]
    if book == 'tikkunei-zohar': continue   # not one of the 39 books
    d = json.load(gzip.open(p))
    c = dict.fromkeys(tot, 0)
    for lab, rows in d['sections']:
        m = re.match(r'\d+', lab); ch = int(m.group(0)) if m else 0
        for row in rows:
            e, span, text, credit = row[:4]
            c['words'] += 1
            in15 = book == 'genesis' and ch <= 5
            def hit(k):
                c[k] += 1
                if in15: c.setdefault(k + '_gen1_5', 0); c[k + '_gen1_5'] += 1
                if len(samples[k]) < 6: samples[k].append('%s %s e%d %r' % (book, lab, e, text))
            if text.replace(ZW, '').strip() == '': hit('gap_only')
            if ZW in text: hit('has_gap')
            if re.search(r'<the> \+ (it|him|her|them|you|me|us|himself|themselves|yourself|yourselves|myself|ourselves|herself|itself)\b', text): hit('the_in_suffix')
            if any(re.fullmatch(r'\s*<[^>]*>\s+<[^>]*>\s*', pc) for pc in text.split(' + ')): hit('two_signs_piece')
            if re.search(r'\+ !$', text): hit('bang')
            if re.search(r'(^|\+ )spring( of)?$', text.strip()) or text.strip() in ('spring', 'spring of'): hit('spring')
    per[book] = c
    for k, v in c.items():
        tot[k] = tot.get(k, 0) + v
print(json.dumps(tot, indent=1))
print(json.dumps(per['genesis'], indent=1))
for k, v in samples.items():
    print(k, v)
json.dump({'total': tot, 'per_book': per}, open(sys.argv[2] + '/line-pattern-counts.json', 'w'), indent=1)
