# DESIGN files-first, step 02 (local only): hash the downloaded example objects, check md5 against
# the md5 table / listing ETag, pull the stored headers from the HEAD replies, and compute the
# build digest of moses-bundled-by-century-v1. Run: python3 -I 02-hash-examples.py
import hashlib, json, os
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
D = S + '/meta/design-files-first'
md5t = {}
for l in open(S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv', encoding='utf-8'):
    h, s, k = l.rstrip('\n').split('\t', 2); md5t[k] = h
et = {}
for l in open(S + '/meta/hazards/bucket-etag.tsv', encoding='utf-8'):
    k, s, t, e, c = l.rstrip('\n').split('\t'); et[k] = (int(s), t, e)
heads = {}
for l in open(D + '/out/02-example-heads.jsonl', encoding='utf-8'):
    r = json.loads(l); heads[r['k']] = r['headers']
out = []
for k in open(D + '/out/02-example-keys.txt', encoding='utf-8').read().splitlines():
    b = open(os.path.join(D, 'dl', k), 'rb').read()
    m, sh = hashlib.md5(b).hexdigest(), hashlib.sha256(b).hexdigest()
    h = heads[k]
    rec = {'key': k, 'bytes': len(b), 'md5': m, 'sha256': sh, 'md5_table': md5t.get(k), 'etag': h.get('etag', '').strip('"'),
           'listing_size': et[k][0], 'last_modified': et[k][1],
           'content_type': h.get('content-type'), 'meta': {x[11:]: v for x, v in h.items() if x.startswith('x-amz-meta-')},
           'checksum': {x[15:]: v for x, v in h.items() if x.startswith('x-amz-checksum-')}}
    rec['md5_ok'] = (m == rec['etag']) and (rec['md5_table'] in (None, m)) and len(b) == rec['listing_size']
    out.append(rec)
json.dump(out, open(D + '/out/02-examples-hashed.json', 'w'), indent=1, ensure_ascii=False)
for r in out: print(r['md5_ok'], r['bytes'], r['sha256'], r['content_type'], json.dumps(r['meta']), json.dumps(r['checksum']), r['key'][-60:])
B = 'corpus-lane-builds/moses-bundled-by-century-v1/'
lines = sorted(f"{r['key'][len(B):]}\t{r['bytes']}\t{r['sha256']}\n" for r in out if r['key'].startswith(B))
dig = hashlib.sha256(''.join(lines).encode('utf-8')).hexdigest()
print('build digest', B, len(lines), sum(int(x.split('\t')[1]) for x in lines), dig)
json.dump({'build': B, 'lines': lines, 'build_digest': dig}, open(D + '/out/02-build-digest.json', 'w'), indent=1)
