# Scan the site (main, HEAD of the ghp checkout), the notes branch (files that differ from the site), and the
# R2 doc bodies downloaded into meta/readers/dl/ for references to R2 keys or prefixes. Read-only on every source;
# writes only meta/readers/refs-raw.tsv and meta/readers/scan-numbers.json.
import os, re, sys, json, gzip, subprocess, collections, importlib.util
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
R = S + '/meta/readers'
GHP = S + '/ghp'
NOTES = '/home/user/mashiachsonyosef.github.io'
def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
rl = load('rlib', R + '/scripts/rlib.py')
lib = load('lib', S + '/clean/review/r2dupes/lib.py')
B = rl.Bucket(); X = rl.Extractor(B)

LIVE_R2_TOOLS = {'reader/tools/push-toggles-v1.mjs', 'reader/tools/restore-shelf-from-history-v1.mjs'}
QUEUE = 'reader/data/toggle-queue-v1.json'
TEXT_EXT = re.compile(r'\.(md|txt|json|jsonl|mjs|js|cjs|py|sh|html|htm|css|tsv|csv|xml|yml|yaml|toml|gz|bin|ndjson|log)$', re.I)

rows = []
stats = collections.Counter()
PRE = re.compile('|'.join(re.escape(t + '/') for t in B.tops) + r'|moses-[A-Za-z0-9]|r2:|MOSES-LEDGER-INDEX|r2\.dev|cloudflarestorage')

def build_of(key):
    p = key.split('/')
    return p[1] if p[0] == 'corpus-lane-builds' and len(p) > 2 else None

def r2_holder(key):
    base = key.rsplit('/', 1)[-1]
    if lib.fragile_reason(key): return 'nested-build'
    if key.startswith('serving-lane-handoffs/') or re.search(r'(FOR-ELIJAH|FOR-MOSES|relay|handoff)', base, re.I): return 'relay'
    if re.search(r'receipt', base, re.I) or key.startswith('r2-push-suite/') or key == 'serving-lane/shelf/MANIFEST-shelf.json': return 'receipt'
    return 'moses-ledger'

def scope_of(holder_key, target):
    tb = build_of(target + '/x') if target.startswith('corpus-lane-builds/') else None
    if holder_key is None:
        return 'builds' if target.startswith('corpus-lane-builds/') else 'outside-builds'
    hb = build_of(holder_key)
    if tb is None: return 'outside-builds'
    if hb is None: return 'builds'
    return 'same-build' if hb == tb else 'cross-build'

def emit(src, holder, holder_key, n, lit, form, kind, algo, where, detail):
    st = B.status(n)
    lst = B.status(lit) if lit != n else st
    ref = n + '/' if st == 'prefix' else n
    a, _, pin = algo.partition('=')
    rows.append((src, ref, kind, a, holder, form, st, lst, scope_of(holder_key, n), str(where), detail, pin))

def kind_for(holder, src, is_code, readish, algo):
    if holder == 'site' and src in LIVE_R2_TOOLS: return 'tool-read'
    if holder in ('site', 'notes') and is_code: return 'tool-read'
    if readish: return 'tool-read'
    if algo != 'none': return 'hash-pin'
    return 'provenance-cite'

def detail_for(holder, src, is_code, readish):
    if holder in ('site',) and src in LIVE_R2_TOOLS: return 'live R2 read (SigV4 GET/List in the tool)'
    if holder in ('site', 'notes') and is_code: return 'tool reads a local copy of this path (--from/--ledger/--in dir) and stamps it'
    if readish: return 'recorded input (a tool read this path)'
    return ''

def refs_of(s, bases):
    """every reference in a string: list of (normalized, literal, form)"""
    out = []
    for tok in X.tokens(s):
        got = X.refs_in_token(tok)
        out += got
        if not got and bases and '/' in tok:
            r = X.rel_in_token(tok, bases)
            if r: out.append((r[0], r[0], 'relative'))
    return out

def scan_text(src, text, holder, holder_key, bases):
    # A hash on a line is attached only when the line names exactly one path (a table row, a sums line);
    # a line naming several paths and one hash cannot say which path the hash belongs to.
    is_code = bool(re.search(r'\.(mjs|js|cjs|py|sh)$', src))
    seen = set()
    for ln, line in enumerate(text.split('\n'), 1):
        if len(line) > 2_000_000: line = line[:2_000_000]
        got = refs_of(line, bases)
        sm = rl.SUMLINE.match(line.strip())
        if sm and bases and '/' not in sm.group(2):
            p = bases[0] + '/' + sm.group(2).strip()
            if B.status(p) == 'key': got.append((p, p, 'relative'))
        if not got: continue
        distinct = {g[0] for g in got}
        algo = rl.hash_on_line(line) if len(distinct) == 1 else 'none'
        readish = bool(rl.READ_WORDS.search(line))
        for n, lit, form in got:
            k = kind_for(holder, src, is_code, readish, algo)
            key = (n, form, k, algo)
            if key in seen: continue
            seen.add(key)
            emit(src, holder, holder_key, n, lit, form, k, algo, ln, detail_for(holder, src, is_code, readish))

HEXKEY = re.compile(r'(sha256|sha-256|sha|hash|digest|checksum|md5|etag)', re.I)
GENERIC_HASH_KEYS = {'sha256', 'sha', 'hash', 'digest', 'checksum', 'md5', 'etag', 'sha256_hex', 'sha256hex', 'hash_sha256', 'content_sha256', 'bytes_sha256', 'file_sha256', 'object_sha256', 'body_sha256', 'raw_sha256', 'gz_sha256'}
def hexval(k, v):
    if not isinstance(v, str): return None
    if rl.HEX64.fullmatch(v): return 'sha256=' + v
    if rl.HEX32.fullmatch(v): return ('etag=' if 'etag' in str(k).lower() else 'md5=') + v
    return None
def pathlike(v):
    return isinstance(v, str) and '/' in v and len(v) < 2000 and not re.search(r'\s', v.strip()) and '://' not in v

def scan_json(src, obj, holder, holder_key, bases, root_where=''):
    # A hash field pairs with a path field of the same object only by name (path + "_sha256", "sha256_" + path,
    # path + "Sha256", ...), or, when the object holds exactly one path-like value, through a generic hash key
    # ("sha256", "hash", "md5", ...). A key that is itself a path pairs with a hash value or a hash-bearing object.
    seen = set()
    is_code = False
    def strings(s, path, algo):
        readish = any(rl.READ_KEYS.search(str(p)) for p in path if isinstance(p, str)) or bool(rl.READ_WORDS.search(s))
        got = refs_of(s, bases)
        if not got: return
        if algo == 'none' and len({g[0] for g in got}) == 1: algo = rl.hash_on_line(s) if rl.SUMLINE.match(s.strip()) else 'none'
        live = src == QUEUE and holder == 'site' and any(p in ('r2_prefix', 'objects', 'ledgers_root', 'toggle_builds_root', 'key', 'prefix', 'readme_at_toggle_builds_root') for p in path if isinstance(p, str))
        if live: readish = True
        for n, lit, form in got:
            k = kind_for(holder, src, is_code, readish, algo)
            key = (n, form, k, algo)
            if key in seen: continue
            seen.add(key)
            emit(src, holder, holder_key, n, lit, form, k, algo, root_where + '/'.join(str(p) for p in path)[:200],
                 'live R2 read: push-toggles-v1.mjs lists/fetches this queue field' if live else detail_for(holder, src, is_code, readish))
    def pair(o, k, npath):
        hx = {kk: hexval(kk, vv) for kk, vv in o.items() if hexval(kk, vv)}
        if not hx: return 'none'
        kl = str(k)
        for cand in (kl + '_sha256', kl + 'Sha256', kl + '_sha', kl + '_hash', kl + '_md5', kl + '_etag', 'sha256_' + kl,
                     re.sub(r'(path|file|key|name|at)$', 'sha256', kl), re.sub(r'(_path|_file|_key|_name|_at)$', '_sha256', kl)):
            if cand != kl and cand in hx: return hx[cand]
        if npath == 1:
            for kk in hx:
                if kk.lower() in GENERIC_HASH_KEYS: return hx[kk]
        return 'none'
    def walk(o, path):
        if isinstance(o, dict):
            npath = sum(1 for v in o.values() if pathlike(v))
            for k, v in o.items():
                if isinstance(k, str) and ('/' in k or k.startswith('moses-') or k in B.rootfiles):
                    ka = hexval(k, v) or ('none' if not isinstance(v, dict) else next((hexval(kk, vv) for kk, vv in v.items() if hexval(kk, vv) and kk.lower() in GENERIC_HASH_KEYS), None) or 'none')
                    strings(k, path + [k], ka)
                if isinstance(v, str): strings(v, path + [k], pair(o, k, npath) if pathlike(v) else 'none')
                else: walk(v, path + [k])
        elif isinstance(o, list):
            for i, v in enumerate(o):
                if isinstance(v, str): strings(v, path + [i], 'none')
                else: walk(v, path + [i])
    walk(obj, [])

def scan_file(src, text, holder, holder_key=None, bases=None):
    stats['files_' + holder] += 1
    stats['bytes_' + holder] += len(text)
    if not bases and not PRE.search(text):
        stats['files_prefiltered_out_' + holder] += 1; return
    low = src.lower()
    n0 = len(rows)
    done = False
    if low.endswith(('.json', '.json.gz', '.bin')) or (text[:1] in '{[' and not low.endswith(('.md', '.txt', '.html', '.mjs', '.js'))):
        try:
            obj = json.loads(text); scan_json(src, obj, holder, holder_key, bases); done = True
        except Exception: pass
    if not done and low.endswith(('.jsonl', '.jsonl.gz', '.ndjson')):
        ok = True
        for i, l in enumerate(text.split('\n'), 1):
            if not l.strip(): continue
            try: scan_json(src, json.loads(l), holder, holder_key, bases, root_where='L%d:' % i)
            except Exception: ok = False; break
        done = ok
    if not done: scan_text(src, text, holder, holder_key, bases)
    if len(rows) > n0: stats['files_with_refs_' + holder] += 1

def git_blobs(repo, paths):
    """yield (path, bytes) for HEAD blobs"""
    p = subprocess.Popen(['git', '-C', repo, 'cat-file', '--batch'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    for path in paths:
        p.stdin.write(('HEAD:' + path + '\n').encode()); p.stdin.flush()
        hdr = p.stdout.readline().decode()
        if hdr.endswith('missing\n'): continue
        size = int(hdr.split()[2]); data = p.stdout.read(size); p.stdout.read(1)
        yield path, data
    p.stdin.close(); p.wait()

def blob_text(data):
    if data[:2] == b'\x1f\x8b':
        try: data = gzip.decompress(data)
        except Exception: return None
    if b'\x00' in data[:65536]: return None
    return data.decode('utf-8', errors='replace')

# ---- 1. the site: every tracked file at HEAD (= origin/main) ----
site_paths = subprocess.run(['git', '-C', GHP, '-c', 'core.quotepath=false', 'ls-files'], capture_output=True, text=True).stdout.split('\n')
site_paths = [x for x in site_paths if x and TEXT_EXT.search(x)]
for path, data in git_blobs(GHP, site_paths):
    t = blob_text(data)
    if t is None: stats['site_binary_skipped'] += 1; continue
    scan_file(path, t, 'site')
# ---- 2. the notes branch: files that are not byte-identical to the site's file at the same path ----
notes_paths = [l.rstrip('\n') for l in open(R + '/notes-only.txt', encoding='utf-8') if l.strip()]
notes_paths = [x for x in notes_paths if TEXT_EXT.search(x)]
for path, data in git_blobs(NOTES, notes_paths):
    t = blob_text(data)
    if t is None: stats['notes_binary_skipped'] += 1; continue
    scan_file(path, t, 'notes')
# ---- 3. the R2 doc bodies (one per distinct (md5,size)) ----
copies = {}
for l in open(R + '/docs-selected.tsv', encoding='utf-8'):
    k, s, h, n = l.rstrip('\n').split('\t'); copies[k] = int(n)
for k in sorted(copies):
    f = R + '/dl/' + k
    if not os.path.exists(f): stats['r2_doc_missing_local'] += 1; continue
    t = rl.read_text(f)
    if t is None: stats['r2_doc_binary'] += 1; continue
    folder = k.rsplit('/', 1)[0] if '/' in k else ''
    b = build_of(k)
    bases = [folder] if folder else []
    if b:
        bases += ['corpus-lane-builds/' + b, 'corpus-lane-builds/' + b + '/build']
    elif '/' in k:
        bases.append(k.split('/')[0])
    scan_file(k, t, r2_holder(k), k, bases)

with open(R + '/refs-raw.tsv', 'w', encoding='utf-8') as f:
    f.write('referencing_file\treferenced_key_or_prefix\tkind\thash_algo_if_pinned\tholder\tform\tresolves_now\tliteral_resolves\tscope\twhere\tdetail\tpin_value\n')
    for r in rows: f.write('\t'.join(x.replace('\t', ' ').replace('\n', ' ') for x in r) + '\n')
stats['rows'] = len(rows)
json.dump(dict(stats), open(R + '/scan-numbers.json', 'w'), indent=1)
print(json.dumps(dict(stats), indent=1))
