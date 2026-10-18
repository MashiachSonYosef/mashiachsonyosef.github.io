# Collect what the live site's data files pin (file names, bytes, sha256, R2 paths, build names) and match
# them to bucket keys by basename + size.  Read-only over the ghp checkout; writes only into the census folder.
import json, gzip, os, re, collections, sys
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
GHP = S + '/ghp/reader/data'
OUT = S + '/meta/census'
BOOKS = [os.path.basename(f)[:-5] for f in os.listdir(GHP + '/hud-runs') if f.endswith('.json')]
FILE_RE = re.compile(r'([A-Za-z0-9._+-]+\.(?:jsonl\.gz|json\.gz|csv\.gz|tsv\.gz|jsonl|json|csv|tsv|bin|md|txt|gz|xz|zst))$')
pins = []  # (source_file, json_path, basename, bytes|None, sha256|None, full_string)
build_mentions = collections.Counter()
paths = collections.Counter()
BUILD_RE = re.compile(r'(?:corpus-lane-builds/|moses-ledgers/)?(moses-[a-z0-9-]+?-v[0-9]+(?:\.[0-9]+)*|[a-z0-9-]+-v[0-9]+(?:\.[0-9]+)*)(?=/|$|[^a-z0-9.])')
def walk(v, path, src):
    if isinstance(v, dict):
        b = v.get('bytes') if isinstance(v.get('bytes'), int) else None
        h = None
        for hk in ('sha256', 'record_sha256', 'order_sha256', 'restore_gz_sha256', 'bridge_sha256'):
            if isinstance(v.get(hk), str) and re.fullmatch(r'[0-9a-f]{64}', v[hk]): h = v[hk]; break
        for k, x in v.items():
            if isinstance(x, str):
                m = FILE_RE.search(x.strip())
                if m and k in ('file', 'record', 'ledger', 'order_file', 'm_file', 'restore', 'path', 'build', 'from', 'source', 'bridge', 'receipt'):
                    pins.append((src, path + '.' + k, m.group(1), b, h, x[:300]))
                for mm in re.finditer(r'(corpus-lane-builds/[^\s"\'`,;)]+|moses-ledgers/[^\s"\'`,;)]+)', x):
                    paths[mm.group(1).rstrip('.')] += 1
                for mm in re.finditer(r'\bmoses-[a-z0-9-]+-v[0-9]+(?:\.[0-9]+)*\b', x):
                    build_mentions[mm.group(0)] += 1
            else:
                walk(x, path + '.' + k, src)
    elif isinstance(v, list):
        for i, x in enumerate(v[:5000]):
            walk(x, path + '[]', src)
files = []
for root, ds, fs in os.walk(GHP):
    if '/zones' in root: continue
    for f in fs:
        if f.endswith('.json'): files.append(os.path.join(root, f))
for f in files:
    try: d = json.load(open(f, encoding='utf-8'))
    except Exception: continue
    walk(d, '', os.path.relpath(f, GHP))
for b in BOOKS:
    for suf in ('.bin',):
        p = GHP + '/zones/' + b + suf
        if os.path.exists(p):
            d = json.loads(gzip.decompress(open(p, 'rb').read()))
            d = {k: d[k] for k in ('emitted_from', 'piece_gloss', 'route', 'work_receipts', 'span_rules', 'count_stamp') if k in d}
            walk(d, '', 'zones/' + b + suf)
json.dump({'pins': pins, 'build_mentions': build_mentions, 'r2_paths': paths}, open(OUT + '/_site-pins.json', 'w'), ensure_ascii=False, indent=0)
print('pins', len(pins), 'distinct basenames', len({p[2] for p in pins}))
print('build mentions', build_mentions.most_common())
print('r2 paths', len(paths))
for p, c in paths.most_common(60): print(c, p)
