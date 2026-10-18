# Account for the 5,636 keys without an md5 in the 17 Oct table: use their R2 ETags (a plain md5 for single-part
# uploads; "md5-N" for multipart) from a fresh read-only listing, and see how many are copies of known content.
import json, collections
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
M = S + '/meta/overlap'
nm = {}
for l in open(M + '/tables/10-no-md5-keys.tsv', encoding='utf-8'):
    k, s, t = l.rstrip('\n').split('\t'); nm[k] = int(s)
known = set()
for l in open(S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv', encoding='utf-8'):
    h, s, k = l.rstrip('\n').split('\t', 2); known.add((h, int(s)))
et = {}
for l in open(M + '/tables/12-etag-nomd5-prefixes.tsv', encoding='utf-8'):
    k, s, t, e = l.rstrip('\n').split('\t'); et[k] = (e, int(s))
r = collections.Counter(); b = collections.Counter(); seen = set()
for k, s in nm.items():
    if k not in et: r['gone_from_listing'] += 1; b['gone_from_listing'] += s; continue
    e, s2 = et[k]
    if '-' in e: r['multipart_etag'] += 1; b['multipart_etag'] += s; continue
    c = (e, s)
    if c in known: r['copy_of_md5_table_content'] += 1; b['copy_of_md5_table_content'] += s
    elif c in seen: r['copy_within_no_md5_set'] += 1; b['copy_within_no_md5_set'] += s
    else: r['new_distinct'] += 1; b['new_distinct'] += s; seen.add(c)
out = {k: {'keys': r[k], 'bytes': b[k]} for k in r}
out['listed_now_under_the_two_prefixes'] = len(et)
json.dump(out, open(M + '/tables/12-nomd5.json', 'w'), indent=1); print(json.dumps(out, indent=1))
