# _front-keys.txt (which front page to read per build) and, after the ranged reads, _front-banners.tsv (banner words found
# in the first 900 characters).  Run: python3 -I front_pages.py keys > ../_front-keys.txt ; python3 -I front_pages.py banners > ../_front-banners.tsv
import os, re, sys, collections
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
if sys.argv[1] == 'keys':
    by = collections.defaultdict(list)
    for l in open(S + '/clean/bucket-now2.tsv', encoding='utf-8'):
        k, s, t = l.rstrip('\n').split('\t'); p = k.split('/')
        if p[0] in ('corpus-lane-builds', 'moses-ledgers', 'corpus-staging') and len(p) == 3: u = p[0] + '/' + p[1]
        elif p[0] not in ('corpus-lane-builds', 'moses-ledgers', 'editions-built-v1', 'corpus-staging') and len(p) == 2: u = p[0]
        else: continue
        if re.search(r'\.(md|txt)$', p[-1]) and not p[-1].startswith(('FOR-ELIJAH', 'SHA256SUMS')): by[u].append(k)
    def score(k):
        f = k.rsplit('/', 1)[-1]
        if f.startswith('THE-'): return 0
        if f.startswith('README'): return 1
        if re.match(r'(LATTICE|BANNER|SUPERSEDED|WHERE|DID|WHICH|DEFECTS|NOTE)', f): return 2
        if f.startswith('RULE'): return 5
        return 3
    for u, ks in by.items():
        ks.sort(key=lambda k: (score(k), len(k)))
        for k in ks[:2]: print(k)
else:
    root = S + '/meta/census/dl/fronts'
    for dp, ds, fs in os.walk(root):
        for f in fs:
            p = os.path.join(dp, f); rel = os.path.relpath(p, root)
            head = ' '.join(open(p, 'rb').read().decode('utf-8', 'replace').split())[:900]
            flags = [w for w in ('SUPERSEDED', 'RELABELLED', 'RELABELED', 'WITHDRAWN', 'NOT READY', 'HELD', 'READY', 'STOPPED', 'REVERSED', 'candidate_only', 'current_effect: NONE', 'served', 'DO NOT') if w in head]
            print(rel + '\t' + ','.join(flags) + '\t' + head[:420].replace('\t', ' '))
