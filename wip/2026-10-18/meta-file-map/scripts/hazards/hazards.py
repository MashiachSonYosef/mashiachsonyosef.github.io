# Byte-for-byte rebuild hazards over the whole-bucket ETag listing (read-only; local files only).
# Run: python3 -I hazards.py   (writes hazard-numbers.json and hazard-*.tsv beside REPORT.md)
import json, re, os, unicodedata, collections

S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
H = S + '/meta/hazards'
LIST = H + '/bucket-etag.jsonl'
MD5 = S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv'
NOMD5 = S + '/clean/review/r2dupes/01-no-md5.tsv'
OLD = S + '/clean/bucket-now2.tsv'

rows = [json.loads(l) for l in open(LIST, encoding='utf-8')]
keys = [r['k'] for r in rows]
by = {r['k']: r for r in rows}
N = len(rows); B = sum(r['s'] for r in rows)
out = {'listing': {'file': LIST, 'keys': N, 'bytes': B}}

def top(k): return k.split('/', 1)[0] + ('/' if '/' in k else '')
def ext(k):
    b = k.rsplit('/', 1)[-1]
    m = re.search(r'(\.[A-Za-z0-9]{1,8}(\.(gz|xz|zst|bz2|br|zip))?)$', b)
    return m.group(1).lower() if m else '(none)'
def write_tsv(name, header, items):
    with open(H + '/' + name, 'w', encoding='utf-8') as f:
        f.write('\t'.join(header) + '\n')
        for it in items: f.write('\t'.join(str(x) for x in it) + '\n')

# ---- ETag forms -------------------------------------------------------------
forms = collections.Counter(); fbytes = collections.Counter(); parts = collections.Counter()
multi = []
for r in rows:
    e = r['et']
    if re.fullmatch(r'[0-9a-f]{32}', e): f = 'md5 (32 hex)'
    elif re.fullmatch(r'[0-9a-f]{32}-\d+', e): f = 'multipart (32 hex -N)'; multi.append(r); parts[int(e.split('-')[1])] += 1
    else: f = 'other: ' + e[:40]
    forms[f] += 1; fbytes[f] += r['s']
out['etag_forms'] = {f: {'keys': forms[f], 'bytes': fbytes[f]} for f in forms}
out['multipart'] = {'keys': len(multi), 'bytes': sum(r['s'] for r in multi),
                    'part_counts': dict(sorted(parts.items())),
                    'min_size': min((r['s'] for r in multi), default=None), 'max_size': max((r['s'] for r in multi), default=None),
                    'by_top': collections.Counter(top(r['k']) for r in multi).most_common(),
                    'by_ext': collections.Counter(ext(r['k']) for r in multi).most_common(20)}
write_tsv('hazard-multipart.tsv', ['key', 'size', 'last_modified', 'etag'], [(r['k'], r['s'], r['lm'], r['et']) for r in sorted(multi, key=lambda r: r['k'])])
sc = collections.Counter(r['sc'] for r in rows); out['storage_class'] = dict(sc)

# ---- md5 coverage: Moses's rclone list vs the ETags ------------------------------
md5 = {}
for l in open(MD5, encoding='utf-8'):
    l = l.rstrip('\n')
    if not l: continue
    h, s, k = l.split('\t', 2)
    md5[k] = (h, int(s))
nomd5_now = [r for r in rows if r['k'] not in md5]
gone = [k for k in md5 if k not in by]
agree = disagree_plain = disagree_multi = size_diff = 0; dis = []
for k, (h, s) in md5.items():
    r = by.get(k)
    if not r: continue
    if r['s'] != s: size_diff += 1; dis.append((k, 'size', s, r['s'], h, r['et'])); continue
    if r['et'] == h: agree += 1
    elif '-' in r['et']: disagree_multi += 1
    else: disagree_plain += 1; dis.append((k, 'md5', s, r['s'], h, r['et']))
write_tsv('hazard-md5-vs-etag-disagree.tsv', ['key', 'what', 'rclone_size', 'now_size', 'rclone_md5', 'etag_now'], dis)
nomd5_plain = [r for r in nomd5_now if re.fullmatch(r'[0-9a-f]{32}', r['et'])]
nomd5_multi = [r for r in nomd5_now if '-' in r['et']]
old_nomd5 = sum(1 for _ in open(NOMD5, encoding='utf-8'))
out['md5_coverage'] = {
    'rclone_md5_lines': len(md5), 'rclone_lines_whose_key_is_gone_now': len(gone),
    'keys_now_without_rclone_md5': len(nomd5_now), 'bytes_now_without_rclone_md5': sum(r['s'] for r in nomd5_now),
    'of_those_plain_md5_etag (md5 known from ETag)': len(nomd5_plain),
    'of_those_multipart_etag (no whole-object md5 anywhere in listings)': len(nomd5_multi), 'bytes_multipart_no_md5': sum(r['s'] for r in nomd5_multi),
    'earlier_01-no-md5.tsv_lines (incl. header if any)': old_nomd5,
    'same_size_and_etag_equals_rclone_md5': agree, 'same_size_plain_etag_differs_from_rclone_md5': disagree_plain,
    'same_size_multipart_etag (rclone md5 is uploader metadata, not R2-computed)': disagree_multi, 'size_changed_since_rclone_list': size_diff}
# multipart objects for which the rclone md5 exists = md5 came from x-amz-meta-md5chksum
out['multipart']['with_rclone_md5'] = sum(1 for r in multi if r['k'] in md5)
out['multipart']['without_rclone_md5'] = sum(1 for r in multi if r['k'] not in md5)

# ---- new keys since bucket-now2 (02:00 UTC) ----------------------------------------
old = {}
for l in open(OLD, encoding='utf-8'):
    k, s, t = l.rstrip('\n').split('\t'); old[k] = (int(s), t)
new = [r for r in rows if r['k'] not in old]; vanished = [k for k in old if k not in by]
changed = [r for r in rows if r['k'] in old and (old[r['k']][0] != r['s'] or old[r['k']][1] != r['lm'])]
out['since_bucket-now2'] = {'new_keys': len(new), 'new_bytes': sum(r['s'] for r in new), 'vanished_keys': len(vanished), 'rewritten_keys (size or last_modified differ)': len(changed),
                            'new_by_top': collections.Counter('/'.join(r['k'].split('/')[:2]) for r in new).most_common(10)}

# ---- zero-byte, trailing slash ------------------------------------------------------
zero = [r for r in rows if r['s'] == 0]
slash = [r for r in rows if r['k'].endswith('/')]
out['zero_byte'] = {'keys': len(zero), 'ending_in_slash': sum(1 for r in zero if r['k'].endswith('/')),
                    'distinct_etags': collections.Counter(r['et'] for r in zero).most_common(3),
                    'by_ext': collections.Counter(ext(r['k']) for r in zero).most_common(15),
                    'by_top': collections.Counter(top(r['k']) for r in zero).most_common(10)}
out['trailing_slash'] = {'keys': len(slash), 'bytes': sum(r['s'] for r in slash), 'examples': [r['k'] for r in slash[:10]]}
write_tsv('hazard-zero-byte.tsv', ['key', 'last_modified', 'etag'], [(r['k'], r['lm'], r['et']) for r in zero])

# ---- key spelling --------------------------------------------------------------------
def kb(k): return len(k.encode('utf-8'))
cats = collections.defaultdict(list)
WIN_BAD = set('<>:"|?*\\')
RESERVED = re.compile(r'^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$', re.I)
for k in keys:
    if ' ' in k: cats['space'].append(k)
    if any(ord(c) > 127 for c in k): cats['non_ascii'].append(k)
    if any(ord(c) < 32 or ord(c) == 127 for c in k): cats['control_char'].append(k)
    if kb(k) > 1000: cats['over_1000_bytes'].append(k)
    if kb(k) > 1024: cats['over_1024_bytes'].append(k)
    if any(c in WIN_BAD for c in k): cats['windows_forbidden_char <>:"|?*\\'].append(k)
    segs = k.split('/')
    if k.startswith('/'): cats['leading_slash'].append(k)
    if '//' in k: cats['double_slash (empty segment)'].append(k)
    if any(s in ('.', '..') for s in segs): cats['dot_or_dotdot_segment'].append(k)
    if any(s != s.rstrip(' .') and s not in ('.', '..') for s in segs if s): cats['segment_ends_in_space_or_dot (Windows strips)'].append(k)
    if any(s != s.lstrip(' ') for s in segs if s): cats['segment_starts_with_space'].append(k)
    if any(RESERVED.match(s) for s in segs): cats['windows_reserved_name'].append(k)
    if any(kb(s) > 255 for s in segs): cats['segment_over_255_bytes'].append(k)
    if unicodedata.normalize('NFC', k) != k: cats['not_NFC'].append(k)
    if unicodedata.normalize('NFD', k) != k and any(ord(c) > 127 for c in k): cats['changes_under_NFD (macOS HFS+ would respell)'].append(k)
    if ';' in k: cats['semicolon (breaks rclone lsf --separator ;)'].append(k)
    if '\t' in k: cats['tab'].append(k)
    if '%' in k: cats['percent'].append(k)
    if '+' in k: cats['plus'].append(k)
    if '#' in k: cats['hash_sign'].append(k)
    if '&' in k: cats['ampersand'].append(k)
    if any(c in k for c in '\'()[]{}!$,='): cats['other_punct \'()[]{}!$,='].append(k)
    if '\u200f' in k or '\u200e' in k or '\ufeff' in k or '\u00a0' in k: cats['invisible (RLM/LRM/BOM/NBSP)'].append(k)
    if 'C:/' in k or 'Users/Kyle' in k or 'Documents/' in k: cats['carries_a_local_path_fragment'].append(k)
maxk = max(keys, key=kb)
out['key_spelling'] = {c: {'keys': len(v), 'bytes': sum(by[k]['s'] for k in v), 'examples': v[:4]} for c, v in sorted(cats.items())}
out['key_length'] = {'max_bytes': kb(maxk), 'max_key': maxk, 'over_200': sum(1 for k in keys if kb(k) > 200), 'over_260_chars': sum(1 for k in keys if len(k) > 260)}
write_tsv('hazard-key-spelling.tsv', ['category', 'key', 'size'], [(c, k, by[k]['s']) for c, v in sorted(cats.items()) if c not in ('non_ascii', 'other_punct \'()[]{}!$,=', 'space', 'plus')
                                                                    for k in v] + [(c, k, by[k]['s']) for c in ('space',) for k in cats.get(c, [])[:2000]])

# ---- collisions ------------------------------------------------------------------------
def groups(f):
    g = collections.defaultdict(list)
    for k in keys: g[f(k)].append(k)
    return [v for v in g.values() if len(v) > 1]
case = groups(lambda k: k.casefold())
nfc = groups(lambda k: unicodedata.normalize('NFC', k))
both = groups(lambda k: unicodedata.normalize('NFC', k).casefold())
def same_bytes(v): return len({(by[k]['s'], by[k]['et']) for k in v}) == 1
out['collisions'] = {
    'case_only (full key equal ignoring case)': {'groups': len(case), 'keys': sum(len(v) for v in case), 'groups_where_all_copies_same_bytes': sum(1 for v in case if same_bytes(v)), 'examples': case[:6]},
    'unicode_normalization_only (NFC equal, bytes differ)': {'groups': len(nfc), 'keys': sum(len(v) for v in nfc), 'examples': nfc[:4]},
    'case_or_normalization (Mac/Windows default disks)': {'groups': len(both), 'keys': sum(len(v) for v in both)}}
write_tsv('hazard-case-collisions.tsv', ['group', 'key', 'size', 'etag'], [(i, k, by[k]['s'], by[k]['et']) for i, v in enumerate(both) for k in v])
# folder-level case splits: two spellings of one folder prefix (merge into one folder on a case-insensitive disk)
pref = collections.defaultdict(set)
for k in keys:
    segs = k.split('/')
    for i in range(1, len(segs)):
        p = '/'.join(segs[:i]); pref[p.casefold()].add(p)
split = {cf: sorted(v) for cf, v in pref.items() if len(v) > 1}
# keep only the shallowest split (a split at depth d implies splits below it)
shallow = {cf: v for cf, v in split.items() if not any(cf.startswith(o + '/') for o in split if o != cf)}
out['collisions']['folder_prefix_case_splits'] = {'prefixes': len(split), 'shallowest': len(shallow), 'examples': list(shallow.values())[:8]}
# file/folder: a key that is also a folder prefix of another key
ks = set(keys)
ff = sorted({p for k in keys for p in ('/'.join(k.split('/')[:i]) for i in range(1, k.count('/') + 1)) if p in ks})
ffcase = set()
cfkeys = collections.defaultdict(list)
for k in keys: cfkeys[k.casefold()].append(k)
for cf in pref:
    if cf in cfkeys and cf not in {p.casefold() for p in ff}: ffcase.add(cf)
ffset = set(ff); under = collections.Counter()
for k in keys:
    segs = k.split('/')
    for i in range(1, len(segs)):
        p = '/'.join(segs[:i])
        if p in ffset: under[p] += 1
out['collisions']['file_and_folder (key K and keys under K/)'] = {'keys': len(ff), 'bytes_of_those_keys': sum(by[k]['s'] for k in ff), 'keys_under_them': sum(under.values()), 'examples': ff[:10]}
out['collisions']['file_and_folder_case_insensitive_only'] = {'keys': len(ffcase), 'examples': sorted(ffcase)[:6]}
write_tsv('hazard-file-folder.tsv', ['key_that_is_also_a_folder', 'size', 'etag', 'children_under_it'],
          [(k, by[k]['s'], by[k]['et'], under[k]) for k in ff])

# ---- extensions & compression (re-compression hazard for any row-level sharing) ---------------
extc = collections.Counter(); extb = collections.Counter()
for r in rows: e = ext(r['k']); extc[e] += 1; extb[e] += r['s']
out['by_extension_top30'] = [(e, extc[e], extb[e]) for e, _ in extb.most_common(30)]
comp = {e: (extc[e], extb[e]) for e in extc if re.search(r'\.(gz|xz|zst|bz2|br|zip|7z|tgz)$', e)}
out['compressed'] = {'keys': sum(v[0] for v in comp.values()), 'bytes': sum(v[1] for v in comp.values()), 'by_ext': sorted(comp.items(), key=lambda x: -x[1][1])[:15]}
# ---- content sharing measured by ETag alone (plain md5 ETags) -------------------------------
dist = {}
for r in rows:
    if re.fullmatch(r'[0-9a-f]{32}', r['et']): dist[(r['et'], r['s'])] = r['s']
out['distinct_by_plain_etag'] = {'distinct_contents': len(dist), 'distinct_bytes': sum(dist.values()),
                                 'multipart_keys_not_deduped_here': len(multi), 'multipart_bytes': sum(r['s'] for r in multi)}
json.dump(out, open(H + '/hazard-numbers.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps({k: out[k] for k in ('listing', 'etag_forms', 'md5_coverage', 'since_bucket-now2', 'distinct_by_plain_etag')}, ensure_ascii=False, indent=1))
