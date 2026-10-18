# Name pins (Moses's chain-of-custody names, RULE A5.4 R8 as ported in r2dupes lib.coc_name) over the bucket listing:
# how many objects and bytes are kept by their name alone, and where. Read-only; prints JSON.
import json, collections, importlib.util
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
spec = importlib.util.spec_from_file_location('lib', S + '/clean/review/r2dupes/lib.py'); lib = importlib.util.module_from_spec(spec); spec.loader.exec_module(lib)
c = collections.Counter(); b = collections.Counter(); top = collections.Counter(); copies = collections.Counter()
for l in open(S + '/clean/bucket-now2.tsv', encoding='utf-8'):
    k, s, t = l.rstrip('\n').split('\t'); s = int(s)
    r = lib.coc_name(k.rsplit('/', 1)[-1])
    if not r: continue
    c[r] += 1; b[r] += s; top[k.split('/')[0]] += 1
    if lib.fragile_reason(k): copies['in copy places'] += 1
out = {'coc_named_objects_by_rule': dict(c), 'coc_named_bytes_by_rule': dict(b), 'coc_named_objects': sum(c.values()),
       'coc_named_bytes': sum(b.values()), 'by_top': dict(top), 'in_copy_places': copies['in copy places']}
json.dump(out, open(S + '/meta/readers/name-pins-numbers.json', 'w'), indent=1); print(json.dumps(out, indent=1))
