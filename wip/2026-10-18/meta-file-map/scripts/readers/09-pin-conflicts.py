# Same path, different bytes: how many R2 keys are pinned with two or more different sha256 values across all
# records (a key rewritten in place, or a record pinning a local version R2 never held)? Read-only; prints JSON.
import json, collections
R = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/readers'
pins = collections.defaultdict(set); holders = collections.defaultdict(set)
with open(R + '/refs.tsv', encoding='utf-8') as f:
    hdr = f.readline().rstrip('\n').split('\t')
    for l in f:
        p = dict(zip(hdr, l.rstrip('\n').split('\t')))
        if p['hash_algo_if_pinned'] == 'sha256' and p['pin_value'] and p['resolves_now'] == 'key':
            if p['referencing_file'] == 'reader/data/zone-store-v1.json': continue
            pins[p['referenced_key_or_prefix']].add(p['pin_value']); holders[p['referenced_key_or_prefix']].add(p['holder'])
multi = {k: v for k, v in pins.items() if len(v) > 1}
by_ext = collections.Counter(k.rsplit('.', 1)[-1] if '.' in k.rsplit('/', 1)[-1] else '(none)' for k in multi)
out = {'keys_pinned_by_sha256': len(pins), 'keys_with_2plus_distinct_pins': len(multi),
       'share': round(len(multi) / max(1, len(pins)), 4), 'by_extension': dict(by_ext.most_common(12)),
       'examples': sorted(multi)[:12]}
json.dump(out, open(R + '/pin-conflicts-numbers.json', 'w'), indent=1); print(json.dumps(out, indent=1))
