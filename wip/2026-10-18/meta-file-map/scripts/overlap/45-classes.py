# Split the bucket's L1 (each distinct content once) by content class and by sampled / not sampled, for the
# extrapolation. Inputs: tables/10-distinct.tsv (md5 table contents, attributed to their earliest key),
# tables/12-etag-nomd5-prefixes.tsv + 10-no-md5-keys.tsv (the 5,636 newer keys, by ETag). No network.
# Also: the share of the bucket's distinct bytes that occur at least once inside each sampled family (content-based
# coverage, independent of which family a content is attributed to).
import json, collections, sys
M = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/overlap'
S = M.rsplit('/meta/', 1)[0]
TEXT = {'jsonl', 'json', 'csv', 'tsv', 'txt', 'md', 'html', 'htm', 'xml', 'mjs', 'js', 'cjs', 'log', 'lsf', 'lsjson',
        'ps1', 'sh', 'svg', 'yaml', 'yml', 'py', 'r2head', 'ndjson', 'sha256', 'css'}
MEDIA = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'zip', 'xz', 'zst', 'br', 'bz2', '7z', 'woff', 'woff2', 'jp2', 'tif', 'tiff'}
def classify(key):
    b = key.rsplit('/', 1)[-1].lower(); p = b.split('.')[1:]
    if p[-2:] == ['tar', 'gz'] or p[-1:] == ['tgz']: return 'tar.gz'
    if p and p[-1] == 'gz':
        return 'gz-text' if len(p) >= 2 and p[-2] in TEXT else 'gz-other'
    e = p[-1] if p else ''
    if e in TEXT: return 'text'
    if e in MEDIA: return 'media'
    return 'binary'
PREFS = {
    'licence': ['corpus-lane-builds/moses-licence-ledger-v1/'], 'cold': ['cold/'],
    'witnessed': ['corpus-lane-builds/moses-witnessed-order-v'], 'compspan': ['corpus-lane-builds/moses-compspan-v13'],
    'census': ['corpus-lane-builds/moses-source-census-v'], 'iawave': ['moses-ia-wave-v'], 'staging': ['corpus-staging/'],
    'runback': ['corpus-lane-builds/moses-run-ledger-backwards-v'], 'hud': ['corpus-lane-builds/moses-hud-record-v'],
    'editions': ['editions-built-v1/'],
}
sampled = sys.argv[1].split(',') if len(sys.argv) > 1 else list(PREFS)
def run_of(k):
    for r in sampled:
        if any(k.startswith(p) for p in PREFS[r]): return r
    return None
# content -> set of runs it occurs in (any key)
occ = collections.defaultdict(set)
for l in open(S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv', encoding='utf-8'):
    h, s, k = l.rstrip('\n').split('\t', 2); r = run_of(k)
    if r: occ[(h, int(s))].add(r)
cls = collections.defaultdict(lambda: collections.Counter())
cover = collections.Counter(); total = 0
for l in open(M + '/tables/10-distinct.tsv', encoding='utf-8'):
    h, s, fam, ext, k = l.rstrip('\n').split('\t'); s = int(s); total += s
    c = classify(k); r = run_of(k)
    where = 'sampled' if (h, s) in occ else 'not-sampled'
    cls[c][where] += s; cls[c][where + '_n'] += 1
    for x in occ.get((h, s), ()): cover[x] += s
    if (h, s) in occ: cover['any'] += s
# the newer keys without an md5 in the table: new distinct contents by ETag (all under dictionary-store / delete-ledger)
et = {}
for l in open(M + '/tables/12-etag-nomd5-prefixes.tsv', encoding='utf-8'):
    k, s, t, e = l.rstrip('\n').split('\t'); et[k] = (e, int(s))
known = set((h, s) for (h, s) in occ) | set()
seen = set()
md5known = set()
for l in open(M + '/tables/10-distinct.tsv', encoding='utf-8'):
    h, s = l.split('\t', 2)[:2]; md5known.add((h, int(s)))
for l in open(M + '/tables/10-no-md5-keys.tsv', encoding='utf-8'):
    k, s, t = l.rstrip('\n').split('\t'); e, s2 = et[k]; c = (e, int(s))
    if c in md5known or c in seen: continue
    seen.add(c); total += c[1]; cls[classify(k)]['not-sampled'] += c[1]; cls[classify(k)]['not-sampled_n'] += 1
res = {'L1_total_bytes': total, 'classes': {c: dict(v) for c, v in cls.items()},
       'content_coverage_bytes': dict(cover), 'content_coverage_share_any': cover['any'] / total}
json.dump(res, open(M + '/tables/45-classes.json', 'w'), indent=1)
G = 1e9
print('L1 total %.3f GB' % (total / G))
for c, v in sorted(cls.items(), key=lambda x: -(x[1]['sampled'] + x[1]['not-sampled'])):
    print('%-9s sampled %7.3f GB (%6d)  not-sampled %7.3f GB (%6d)' % (c, v['sampled'] / G, v['sampled_n'], v['not-sampled'] / G, v['not-sampled_n']))
for r, b in sorted(cover.items(), key=lambda x: -x[1]): print('  coverage %-10s %7.3f GB  %.1f%%' % (r, b / G, 100 * b / total))
