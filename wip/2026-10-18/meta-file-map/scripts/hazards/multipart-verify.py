# Compare the streamed hashes of every multipart object with: the listing ETag (recomputed with 5 MiB parts),
# rclone's md5 (Moses's 02-r2-md5.tsv), the x-amz-meta-md5chksum and x-amz-checksum-crc64nvme from HEAD (local only).
import json, base64, collections
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
H = S + '/meta/hazards'
L = {}
for l in open(H + '/bucket-etag.jsonl', encoding='utf-8'):
    r = json.loads(l)
    if '-' in r['et']: L[r['k']] = r
md5 = {}
for l in open(S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv', encoding='utf-8'):
    h, s, k = l.rstrip('\n').split('\t', 2)
    if k in L: md5[k] = h
head = {}
for l in open(H + '/head-sample.jsonl', encoding='utf-8'):
    r = json.loads(l)
    if r['k'] in L: head[r['k']] = r['headers']
c = collections.Counter(); rows = []
for l in open(H + '/stream-hash-multipart.jsonl', encoding='utf-8'):
    r = json.loads(l); k = r['k']; h = head.get(k, {})
    chk = {'bytes = listing size': r['bytes'] == L[k]['s'],
           'recomputed 5 MiB multipart ETag = listing ETag': r['multipart_etag_5MiB'] == L[k]['et'],
           'md5 = rclone md5 (02-r2-md5.tsv)': r['md5'] == md5.get(k),
           'md5 = x-amz-meta-md5chksum': 'x-amz-meta-md5chksum' in h and base64.b64decode(h['x-amz-meta-md5chksum']).hex() == r['md5'],
           'crc64nvme = x-amz-checksum-crc64nvme (full object)': h.get('x-amz-checksum-crc64nvme') == r['crc64nvme_b64']}
    for n, v in chk.items(): c[(n, v)] += 1
    rows.append({'k': k, 'bytes': r['bytes'], 'md5': r['md5'], 'sha256': r['sha256'], 'etag': L[k]['et'], **chk})
distinct = {}
for r in rows: distinct[r['sha256']] = r['bytes']
out = {'streamed': len(rows), 'of_multipart': len(L), 'checks': {f'{n}: {v}': m for (n, v), m in sorted(c.items())},
       'distinct_contents_by_sha256': len(distinct), 'distinct_bytes': sum(distinct.values()), 'all_bytes': sum(r['bytes'] for r in rows)}
json.dump({'summary': out, 'rows': rows}, open(H + '/multipart-verify.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(out, indent=1))
