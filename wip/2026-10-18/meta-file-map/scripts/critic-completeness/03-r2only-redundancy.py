# Of the content with no proved copy off R2 (not on Moses's CLB disk by hash, not in the site's git), how much
# has 2 or more R2 keys today, in 2 or more top-level prefixes? After the map retires the copies, such content
# would sit in exactly one cas/ object (plus any door or archive key that stays). Read-only, local files.
import collections, json, sys
S = sys.argv[1]
O = S + '/meta/copies/out'
md5 = {}
for line in open(S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv'):
    m, sz, k = line.rstrip('\n').split('\t', 2); md5[k] = (m, int(sz))
local = set()
for line in open(O + '/local-known-md5.tsv'):
    m, sz = line.split(); local.add((m, int(sz)))
git = set()
for line in open(O + '/git-blob-md5.tsv'):
    sha, sz, m = line.split(); git.add((m, int(sz)))
fate = {}
for line in open(S + '/meta/design-readers-first/out/keys.tsv', encoding='utf-8'):
    pass
keys_of = collections.defaultdict(list)
for k, c in md5.items(): keys_of[c].append(k)
r2only = {c: ks for c, ks in keys_of.items() if c not in local and c not in git}
tot = sum(c[1] for c in r2only)
multi = {c: ks for c, ks in r2only.items() if len(ks) >= 2}
multi_top = {c: ks for c, ks in multi.items() if len({k.split('/')[0] for k in ks}) >= 2}
by_top = collections.Counter()
for c, ks in multi.items():
    for t in {k.split('/')[0] for k in ks}: by_top[t] += c[1]
print(json.dumps(dict(
    r2_only_contents=len(r2only), r2_only_bytes=tot,
    with_2plus_r2_keys_contents=len(multi), with_2plus_r2_keys_bytes=sum(c[1] for c in multi),
    with_keys_in_2plus_top_prefixes_contents=len(multi_top), with_keys_in_2plus_top_prefixes_bytes=sum(c[1] for c in multi_top),
    bytes_by_top_prefix_holding_such_content=by_top.most_common(12)), indent=1))
