# DESIGN files-first, step 04 (local only): bucket size after the store is filled, for three keep choices.
# Run: python3 -I 04-keep-sets.py
import json
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
D = S + '/meta/design-files-first'
exec(open(D + '/scripts/_units.py').read())
rows = [l.rstrip('\n').split('\t') for l in open(S + '/clean/bucket-now2.tsv', encoding='utf-8')]
st = {}
for i, l in enumerate(open(S + '/meta/census/builds.tsv', encoding='utf-8')):
    if i: f = l.split('\t'); st[f[0]] = f[4]
PUSH = ['moses-ledgers/toggle-builds-v1/', 'moses-ledgers/maqaf-reseal-v1/streams/', 'moses-ledgers/kq-reseal-v1/streams/',
        'moses-ledgers/frame/', 'moses-ledgers/lattice-v12/', 'moses-ledgers/v-ledger-v2/', 'moses-ledgers/toggle-ledgers-v1/',
        'corpus-lane-builds/moses-parse-source-and-declaration-v1/declaration-store-v7/',
        'corpus-lane-builds/moses-source-suggested-v1/v1.1/build/out/source-suggested-bsb/',
        'corpus-lane-builds/moses-megacompspan-toggles-v1/build/toggles-v1/']
served = [l.rstrip('\n').split('\t')[1] for i, l in enumerate(open(S + '/meta/census/served-payload.tsv', encoding='utf-8')) if i]
def door(k): return k == 'MOSES-LEDGER-INDEX.md' or k.startswith('serving-lane/') or any(k.startswith(p) for p in PUSH)
def srv(k): return any(k == p or (p.endswith('/') and k.startswith(p)) for p in served)
N = {}
for name, test in [('doors only', lambda k: door(k)),
                   ('doors + served payload', lambda k: door(k) or srv(k)),
                   ('doors + every current unit', lambda k: door(k) or st[unit_of(k)] == 'current')]:
    ks = [(k, int(s)) for k, s, t in rows if not k.startswith('cas/') and test(k)]
    N[name] = {'kept_real_keys': len(ks), 'kept_real_bytes': sum(s for _, s in ks)}
json.dump(N, open(D + '/out/04-keep-sets.json', 'w'), indent=1); print(json.dumps(N, indent=1))
