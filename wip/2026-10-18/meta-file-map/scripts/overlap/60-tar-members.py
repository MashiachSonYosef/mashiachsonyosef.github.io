# The 4.04 GB cold tarball: how many of its members are byte-identical to objects already in the bucket
# (md5,size match against the 17 Oct md5 table), and to which top folders. Reads tables/cold/members.tsv.
import json, collections
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
M = S + '/meta/overlap'
where = collections.defaultdict(set)
for l in open(S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv', encoding='utf-8'):
    h, s, k = l.rstrip('\n').split('\t', 2)
    if k.startswith('cold/editorial-999-strike'): continue
    top = k.split('/')[0] if not k.startswith('corpus-lane-builds/') else 'corpus-lane-builds/' + k.split('/')[1]
    where[(h, int(s))].add(top)
n = b = 0; hit_n = hit_b = 0; uniq = set(); dup_in_tar_b = 0; by = collections.Counter(); seen = set()
for l in open(M + '/tables/cold/members.tsv', encoding='utf-8'):
    key, name, size, h = l.rstrip('\n').split('\t'); size = int(size); n += 1; b += size
    c = (h, size)
    if c in seen: dup_in_tar_b += size; continue
    seen.add(c)
    if c in where:
        hit_n += 1; hit_b += size
        for t in where[c]: by[t] += size
out = {'members': n, 'member_bytes': b, 'distinct_member_bytes': b - dup_in_tar_b, 'repeat_bytes_inside_tar': dup_in_tar_b,
       'distinct_members_already_in_bucket': hit_n, 'their_bytes': hit_b, 'by_where_top10': by.most_common(10)}
json.dump(out, open(M + '/tables/60-tar-members.json', 'w'), indent=1); print(json.dumps(out, indent=1))
