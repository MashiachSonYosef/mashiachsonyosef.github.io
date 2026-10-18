# Do the hash pins verify today? (read-only)
#  - md5/etag pins on a key: compared with the md5 table already on disk (every one that has a table md5).
#  - sha256 pins on a key: a sample is downloaded (small objects, spread over builds and holders) into
#    meta/readers/dl-verify/ and hashed. Writes verify-sample.tsv and verify-numbers.json.
# Usage: python3 -I 06-verify-sample.py [N_PER_HOLDER] ; the GETs run through r2get.mjs in one shell with r2.env.
import sys, os, json, random, hashlib, subprocess, collections
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
R = S + '/meta/readers'
NPER = int(sys.argv[1]) if len(sys.argv) > 1 else 40
MD5 = S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv'
sizes = {}
for l in open(S + '/clean/bucket-now2.tsv', encoding='utf-8'):
    k, s, t = l.rstrip('\n').split('\t'); sizes[k] = int(s)
md5 = {}
for l in open(MD5, encoding='utf-8'):
    h, s, k = l.rstrip('\n').split('\t', 2); md5[k] = h
rows = []
with open(R + '/refs.tsv', encoding='utf-8') as f:
    hdr = f.readline().rstrip('\n').split('\t')
    for l in f:
        p = dict(zip(hdr, l.rstrip('\n').split('\t')))
        if p['hash_algo_if_pinned'] != 'none' and p['pin_value'] and p['resolves_now'] == 'key':
            if p['referencing_file'] == 'reader/data/zone-store-v1.json': p['holder'] = 'site-shelf'
            rows.append(p)
num = collections.Counter(); out = []
# md5 / etag
for p in rows:
    if p['hash_algo_if_pinned'] in ('md5', 'etag'):
        k = p['referenced_key_or_prefix']; h = md5.get(k)
        if h is None: num['md5_pins_no_table_md5'] += 1; continue
        ok = h == p['pin_value']
        num['md5_pins_checked'] += 1; num['md5_pins_equal'] += ok
        num['md5_pins_equal_' + p['holder']] += ok; num['md5_pins_checked_' + p['holder']] += 1
# sha256 sample
random.seed(20261018)
cand = collections.defaultdict(list)
for p in rows:
    if p['hash_algo_if_pinned'] != 'sha256': continue
    k = p['referenced_key_or_prefix']
    if sizes.get(k, 1 << 40) > 3_000_000: continue
    cand[p['holder']].append(p)
pick = []
for h, lst in cand.items():
    seen_pair = set(); random.shuffle(lst); n = 0
    by_build = collections.defaultdict(list)
    for p in lst: by_build[p['referenced_key_or_prefix'].split('/')[1] if '/' in p['referenced_key_or_prefix'] else ''].append(p)
    order = []
    while any(by_build.values()):
        for b in list(by_build):
            if by_build[b]: order.append(by_build[b].pop())
    for p in order:
        pr = (p['referenced_key_or_prefix'], p['pin_value'])
        if pr in seen_pair: continue
        seen_pair.add(pr); pick.append(p); n += 1
        if n >= NPER: break
keys = sorted({p['referenced_key_or_prefix'] for p in pick})
os.makedirs(R + '/dl-verify', exist_ok=True)
lst = R + '/dl-verify/keys.txt'
open(lst, 'w', encoding='utf-8').write('\n'.join(keys) + '\n')
cmd = 'set -a; . %s/r2.env; set +a; xargs -d "\\n" -n 20 -P 8 node %s/r2get.mjs %s/dl-verify/obj < %s > %s/dl-verify/get.log 2>&1' % (S, S, R, lst, R)
subprocess.run(['bash', '-c', cmd], check=False)
for p in pick:
    k = p['referenced_key_or_prefix']; f = R + '/dl-verify/obj/' + k
    if not os.path.exists(f): got = 'not-fetched'
    else:
        got = hashlib.sha256(open(f, 'rb').read()).hexdigest()
    ok = got == p['pin_value']
    num['sha256_sample'] += 1; num['sha256_sample_equal'] += ok
    num['sha256_sample_%s' % p['holder']] += 1; num['sha256_sample_equal_%s' % p['holder']] += ok
    out.append((p['holder'], p['referencing_file'], k, p['pin_value'], got, 'equal' if ok else 'differs'))
with open(R + '/verify-sample.tsv', 'w', encoding='utf-8') as f:
    f.write('holder\treferencing_file\tkey\tpinned_sha256\tsha256_now\tverdict\n')
    for r in out: f.write('\t'.join(r) + '\n')
json.dump(dict(num), open(R + '/verify-numbers.json', 'w'), indent=1)
print(json.dumps(dict(num), indent=1))
