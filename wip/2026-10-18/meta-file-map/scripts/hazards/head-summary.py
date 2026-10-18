# Summarize the HEAD sample: which metadata headers occur, their values by prefix/extension (local only).
# Run: python3 -I head-summary.py -> head-summary.json, head-sample-table.tsv
import json, re, collections, datetime
H = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/hazards'
lst = {}
for l in open(H + '/bucket-etag.jsonl', encoding='utf-8'):
    r = json.loads(l); lst[r['k']] = r
why = dict(l.rstrip('\n').split('\t', 1) for l in open(H + '/head-sample-why.tsv', encoding='utf-8'))
rows = [json.loads(l) for l in open(H + '/head-sample.jsonl', encoding='utf-8')]
TRANSPORT = {'cf-ray', 'connection', 'date', 'server', 'accept-ranges', 'content-length', 'etag', 'last-modified', 'vary', 'alt-svc', 'nel', 'report-to', 'cf-cache-status', 'transfer-encoding'}
def top(k): return k.split('/', 1)[0] + '/'
def ext(k):
    b = k.rsplit('/', 1)[-1]
    m = re.search(r'(\.[A-Za-z0-9]{1,8}(\.(gz|xz|zst|bz2|br|zip))?)$', b)
    return m.group(1).lower() if m else '(none)'
hdr = collections.Counter(); vals = collections.defaultdict(collections.Counter)
ct_by_ext = collections.defaultdict(collections.Counter); meta_by_top = collections.defaultdict(collections.Counter)
mt_vs_lm = []; mismatch = []; md5chk = []; table = []
for r in rows:
    h = r['headers']; k = r['k']; L = lst[k]
    for name, v in h.items():
        if name in TRANSPORT: continue
        hdr[name] += 1
        if name.startswith('x-amz-checksum'): vals[name]['(present)'] += 1
        elif name == 'x-amz-meta-mtime': vals[name]['(present)'] += 1
        else: vals[name][v] += 1
    ct_by_ext[ext(k)][h.get('content-type', '(none)')] += 1
    meta_by_top[top(k)][' '.join(sorted(n for n in h if n.startswith('x-amz-meta-'))) or '(no x-amz-meta-*)'] += 1
    if int(h.get('content-length', -1)) != L['s']: mismatch.append((k, 'content-length', h.get('content-length'), L['s']))
    if h.get('etag', '').strip('"') != L['et']: mismatch.append((k, 'etag', h.get('etag'), L['et']))
    if 'x-amz-meta-mtime' in h:
        mt = datetime.datetime.fromtimestamp(float(h['x-amz-meta-mtime']), datetime.timezone.utc)
        lm = datetime.datetime.fromisoformat(L['lm'].replace('Z', '+00:00'))
        mt_vs_lm.append((lm - mt).total_seconds())
    if 'x-amz-meta-md5chksum' in h:
        import base64
        md5chk.append((k, base64.b64decode(h['x-amz-meta-md5chksum']).hex(), L['et']))
    table.append((k, L['s'], L['et'], h.get('content-type', ''), h.get('content-encoding', ''), h.get('cache-control', ''), h.get('content-disposition', ''),
                  h.get('content-language', ''), h.get('expires', ''), ';'.join('%s=%s' % (n, h[n]) for n in sorted(h) if n.startswith('x-amz-meta-')),
                  ';'.join(n for n in sorted(h) if n.startswith('x-amz-checksum')), why.get(k, '')))
with open(H + '/head-sample-table.tsv', 'w', encoding='utf-8') as f:
    f.write('key\tsize\tetag\tcontent_type\tcontent_encoding\tcache_control\tcontent_disposition\tcontent_language\texpires\tx_amz_meta\tchecksums\twhy_sampled\n')
    for t in table: f.write('\t'.join(str(x) for x in t) + '\n')
mt_vs_lm.sort()
def q(p): return mt_vs_lm[int(p * (len(mt_vs_lm) - 1))] if mt_vs_lm else None
out = {'sampled': len(rows), 'status': dict(collections.Counter(r['status'] for r in rows)),
       'tops_covered': len({top(r['k']) for r in rows}), 'exts_covered': len({ext(r['k']) for r in rows}),
       'non_transport_headers_seen (count of sampled objects)': dict(hdr.most_common()),
       'values': {n: dict(c.most_common(12)) for n, c in vals.items()},
       'content_type_by_ext': {e: dict(c) for e, c in sorted(ct_by_ext.items())},
       'x_amz_meta_sets_by_top': {t: dict(c) for t, c in sorted(meta_by_top.items())},
       'head_vs_listing_mismatch': mismatch[:20], 'head_vs_listing_mismatch_count': len(mismatch),
       'last_modified_minus_meta_mtime_seconds': {'n': len(mt_vs_lm), 'min': q(0), 'p10': q(.1), 'median': q(.5), 'p90': q(.9), 'max': q(1),
                                                 'negative (mtime after upload)': sum(1 for x in mt_vs_lm if x < 0)},
       'md5chksum_vs_etag': {'n': len(md5chk), 'examples': md5chk[:5]}}
json.dump(out, open(H + '/head-summary.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(out, ensure_ascii=False, indent=1)[:9000])
