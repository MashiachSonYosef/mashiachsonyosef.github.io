# Line endings, BOM and NUL bytes in the first 4 KiB of the sampled text objects (local only).
import json, os, collections, re
H = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/hazards'
c = collections.Counter(); by = collections.defaultdict(collections.Counter)
for l in open(H + '/text-sample-keys.txt', encoding='utf-8'):
    k = json.loads(l); b = open(os.path.join(H, 'dl/texthead', k), 'rb').read()
    e = k.rsplit('.', 1)[-1]
    crlf = b.count(b'\r\n'); lf = b.count(b'\n') - crlf
    kind = 'CRLF' if crlf and not lf else 'mixed' if crlf and lf else 'LF' if lf else 'no newline in first 4 KiB'
    c[kind] += 1; by[e][kind] += 1
    if b.startswith(b'\xef\xbb\xbf'): c['UTF-8 BOM'] += 1; by[e]['BOM'] += 1
    if b'\x00' in b: c['NUL byte'] += 1
    try: b.decode('utf-8')
    except UnicodeDecodeError as x:
        if x.start < len(b) - 4: c['not UTF-8'] += 1
out = {'sampled': sum(v for k, v in c.items() if k in ('CRLF', 'LF', 'mixed', 'no newline in first 4 KiB')), 'counts': dict(c), 'by_ext': {e: dict(v) for e, v in sorted(by.items())}}
json.dump(out, open(H + '/text-head-summary.json', 'w', encoding='utf-8'), indent=1); print(json.dumps(out, indent=1))
