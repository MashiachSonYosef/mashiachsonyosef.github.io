# Distinct contents over the whole bucket, with each multipart object's md5 taken from the streamed rehash (local only).
import json
H = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/hazards'
mp = {r['k']: r['md5'] for r in json.load(open(H + '/multipart-verify.json'))['rows']}
d = {}; n = 0; B = 0; pl = set()
for l in open(H + '/bucket-etag.jsonl', encoding='utf-8'):
    r = json.loads(l); n += 1; B += r['s']
    d[(mp.get(r['k'], r['et']), r['s'])] = r['s']
    if '-' not in r['et']: pl.add(r['et'])
out = {'keys': n, 'bytes': B, 'distinct_contents_md5_size': len(d), 'distinct_bytes': sum(d.values()), 'repeated_bytes': B - sum(d.values()),
       'multipart_contents_also_stored_as_single_put_objects': len(set(mp.values()) & pl)}
json.dump(out, open(H + '/distinct-numbers.json', 'w'), indent=1); print(json.dumps(out, indent=1))
