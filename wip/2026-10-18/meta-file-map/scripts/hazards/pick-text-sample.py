# Stratified sample of uncompressed text objects (top-level prefix x extension, up to 12 each) for a 4 KiB ranged read (local only).
import json, re, collections, random
H = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/hazards'
g = collections.defaultdict(list)
for l in open(H + '/bucket-etag.jsonl', encoding='utf-8'):
    r = json.loads(l)
    m = re.search(r'\.(jsonl|json|csv|tsv|txt|md|mjs|py|log)$', r['k'])
    if m and r['s'] > 0: g[(r['k'].split('/')[0], m.group(1))].append(r['k'])
rnd = random.Random(1018); pick = []
for key in sorted(g): pick += rnd.sample(sorted(g[key]), min(12, len(g[key])))
open(H + '/text-sample-keys.txt', 'w', encoding='utf-8').write(''.join(json.dumps(k, ensure_ascii=False) + '\n' for k in pick))
print(len(pick), 'keys from', len(g), 'strata')
