# Extra tallies for the report, read off refs.tsv: (a) what Moses's records say his tools read (recorded inputs in
# R2-held docs) by target area; (b) overlap of the r2dupes 'moses-mention' pins with this scan; (c) the site and
# notes rows in full (small); (d) per top folder of target: rows by consolidation class. Read-only; prints JSON.
import json, collections
R = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/readers'
rows = []
with open(R + '/refs.tsv', encoding='utf-8') as f:
    hdr = f.readline().rstrip('\n').split('\t')
    for l in f: rows.append(dict(zip(hdr, l.rstrip('\n').split('\t'))))
def area(x):
    p = x.split('/')
    if p[0] == 'corpus-lane-builds' and len(p) > 1 and p[1]: return 'corpus-lane-builds/<build>/'
    return p[0] + ('/' if len(p) > 1 else '')
out = {}
r2held = [r for r in rows if r['holder'] in ('moses-ledger', 'receipt', 'relay', 'nested-build') and r['form'] not in ('keep-rule', 'ledger-mention')]
ri = [r for r in r2held if r['detail'].startswith('recorded input')]
out['moses_recorded_input_rows'] = len(ri)
out['moses_recorded_input_files'] = len({r['referencing_file'] for r in ri})
out['moses_recorded_input_by_area'] = dict(collections.Counter(area(r['referenced_key_or_prefix']) for r in ri).most_common(20))
out['moses_recorded_input_by_scope'] = dict(collections.Counter(r['scope'] for r in ri))
out['moses_recorded_input_hashed'] = sum(1 for r in ri if r['hash_algo_if_pinned'] != 'none')
# outside-builds targets named by Moses's records, by area
ob = [r for r in r2held if r['scope'] == 'outside-builds']
out['moses_outside_builds_rows_by_area'] = dict(collections.Counter(area(r['referenced_key_or_prefix']) for r in ob).most_common(20))
# (b) mention pins
mp = {r['referenced_key_or_prefix'].rstrip('/') for r in rows if r['form'] == 'ledger-mention'}
scanned = {r['referenced_key_or_prefix'].rstrip('/') for r in rows if r['form'] not in ('ledger-mention', 'keep-rule')}
out['mention_pins'] = len(mp)
out['mention_pins_also_found_by_scan'] = len(mp & scanned)
out['mention_pins_absent_on_r2'] = sum(1 for r in rows if r['form'] == 'ledger-mention' and r['resolves_now'] == 'absent')
# (d) class by area
def cls(r):
    if r['kind'] == 'runtime-fetch' or r['detail'].startswith('live R2') or r['detail'].startswith('restore-shelf'): return 'A'
    if r['form'] == 'keep-rule' and not r['referenced_key_or_prefix'].startswith('corpus-lane-builds/'): return 'A'
    if r['hash_algo_if_pinned'] != 'none': return 'C'
    return 'B'
ca = collections.defaultdict(collections.Counter)
for r in rows: ca[area(r['referenced_key_or_prefix'])][cls(r)] += 1
out['class_by_area'] = {a: dict(c) for a, c in sorted(ca.items(), key=lambda x: -sum(x[1].values()))}
# distinct targets in class C inside builds (paths whose bytes must verify) and their scope
cin = {r['referenced_key_or_prefix'] for r in rows if cls(r) == 'C' and r['referenced_key_or_prefix'].startswith('corpus-lane-builds/')}
out['C_distinct_keys_in_builds'] = len(cin)
cx = {r['referenced_key_or_prefix'] for r in rows if cls(r) == 'C' and r['scope'] == 'cross-build'}
out['C_distinct_keys_pinned_cross_build'] = len(cx)
bx = {r['referenced_key_or_prefix'] for r in rows if cls(r) == 'B' and r['referenced_key_or_prefix'].startswith('corpus-lane-builds/')}
out['B_distinct_targets_in_builds'] = len(bx)
# site and notes rows (not the shelf expansion)
sn = [r for r in rows if r['holder'] in ('site', 'notes') and r['form'] != 'expanded-pin']
with open(R + '/refs-site-notes.tsv', 'w', encoding='utf-8') as f:
    f.write('\t'.join(hdr) + '\n')
    for r in sn: f.write('\t'.join(r[h] for h in hdr) + '\n')
out['site_notes_rows_written'] = len(sn)
out['site_rows_by_kind_algo'] = dict(collections.Counter((r['kind'] + '/' + r['hash_algo_if_pinned']) for r in sn if r['holder'] == 'site'))
out['notes_rows_by_kind_algo'] = dict(collections.Counter((r['kind'] + '/' + r['hash_algo_if_pinned']) for r in sn if r['holder'] == 'notes'))
out['site_distinct_targets'] = len({r['referenced_key_or_prefix'] for r in sn if r['holder'] == 'site'})
out['site_referencing_files'] = len({r['referencing_file'] for r in sn if r['holder'] == 'site'})
out['notes_referencing_files'] = len({r['referencing_file'] for r in sn if r['holder'] == 'notes'})
out['site_targets_by_area'] = dict(collections.Counter(area(r['referenced_key_or_prefix']) for r in sn if r['holder'] == 'site'))
json.dump(out, open(R + '/extra-numbers.json', 'w'), indent=1); print(json.dumps(out, indent=1))
