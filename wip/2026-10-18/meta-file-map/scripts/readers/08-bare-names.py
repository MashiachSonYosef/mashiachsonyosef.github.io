# Bare-name references: the site cites Moses's relays, rules and receipts by file name only
# ("relay": "FOR-ELIJAH-v64.2.md"). Such a name finds its object only through a name lookup. For every bare
# name the site (HEAD of ghp) cites that is the basename of some R2 key, count how many keys carry it and how many
# distinct bodies (md5) those keys hold. Read-only. Writes bare-names.tsv and bare-names-numbers.json.
import re, json, subprocess, collections
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
R = S + '/meta/readers'; GHP = S + '/ghp'
MD5 = S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv'
md5 = {}
for l in open(MD5, encoding='utf-8'):
    h, s, k = l.rstrip('\n').split('\t', 2); md5[k] = h
byname = collections.defaultdict(list)
for l in open(S + '/clean/bucket-now2.tsv', encoding='utf-8'):
    k = l.split('\t', 1)[0]; byname[k.rsplit('/', 1)[-1]].append(k)
NAME = re.compile(r'(?<![A-Za-z0-9_./-])((?:FOR-ELIJAH|FOR-MOSES|RULE|RECEIPT|THE-[A-Z0-9-]+|README|MANIFEST|LATTICE)[A-Za-z0-9._-]*\.(?:md|json|txt|jsonl))(?![A-Za-z0-9_/-])')
paths = subprocess.run(['git', '-C', GHP, '-c', 'core.quotepath=false', 'ls-files'], capture_output=True, text=True).stdout.split('\n')
paths = [p for p in paths if re.search(r'\.(json|md|mjs|js|html|txt|tsv|sh)$', p)]
cites = collections.defaultdict(set)
for p in paths:
    try: t = subprocess.run(['git', '-C', GHP, 'show', 'HEAD:' + p], capture_output=True).stdout.decode('utf-8', 'replace')
    except Exception: continue
    for m in NAME.finditer(t):
        n = m.group(1)
        if n in byname: cites[n].add(p)
rows = []; num = collections.Counter()
for n, files in sorted(cites.items()):
    ks = byname[n]; bodies = {md5.get(k, 'nomd5:' + k) for k in ks}
    rows.append((n, len(files), len(ks), len(bodies), ' '.join(sorted(files)[:5]), ' '.join(sorted(ks)[:3])))
    num['bare_names'] += 1
    num['bare_names_one_key'] += len(ks) == 1
    num['bare_names_many_keys_one_body'] += len(ks) > 1 and len(bodies) == 1
    num['bare_names_many_bodies'] += len(bodies) > 1
    num['citing_files'] += 0
num['citing_files'] = len({f for fs in cites.values() for f in fs})
with open(R + '/bare-names.tsv', 'w', encoding='utf-8') as f:
    f.write('name\tsite_files_citing\tr2_keys_with_this_basename\tdistinct_bodies\tsome_citing_files\tsome_keys\n')
    for r in rows: f.write('\t'.join(map(str, r)) + '\n')
json.dump(dict(num), open(R + '/bare-names-numbers.json', 'w'), indent=1)
print(json.dumps(dict(num), indent=1))
