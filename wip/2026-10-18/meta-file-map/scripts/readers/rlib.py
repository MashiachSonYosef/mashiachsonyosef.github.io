# Reference extraction for the "who reads R2 paths" survey (serving lane, read-only).
# Loaded by 03-scan.py via importlib from this exact path; run with python3 -I.
import re, json, gzip, bisect, posixpath

S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
BUCKET = S + '/clean/bucket-now2.tsv'

class Bucket:
    def __init__(self, path=BUCKET):
        self.keys = {}
        dirs = set()
        for l in open(path, encoding='utf-8'):
            k, s, t = l.rstrip('\n').split('\t')
            self.keys[k] = int(s)
            p = k.split('/')
            for i in range(1, len(p)):
                dirs.add('/'.join(p[:i]))
        self.dirs = dirs
        self.sorted = sorted(self.keys)
        self.tops = sorted({k.split('/')[0] for k in self.keys if '/' in k}, key=len, reverse=True)
        self.topset = set(self.tops)
        self.rootfiles = {k for k in self.keys if '/' not in k}
        self.builds = {d.split('/')[1] for d in dirs if d.startswith('corpus-lane-builds/') and d.count('/') == 1}

    def status(self, q):
        """q without a final '/': key | prefix | partial | absent"""
        if q in self.keys: return 'key'
        if q in self.dirs: return 'prefix'
        i = bisect.bisect_left(self.sorted, q)
        if q and i < len(self.sorted) and self.sorted[i].startswith(q): return 'partial'
        return 'absent'

    def bytes_under(self, q, st):
        if st == 'key': return self.keys[q]
        if st not in ('prefix', 'partial'): return 0
        p = q + '/' if st == 'prefix' else q
        i = bisect.bisect_left(self.sorted, p); n = 0
        while i < len(self.sorted) and self.sorted[i].startswith(p):
            n += self.keys[self.sorted[i]]; i += 1
        return n

HEX64 = re.compile(r'(?<![0-9a-fA-F])[0-9a-f]{64}(?![0-9a-fA-F])')
HEX32 = re.compile(r'(?<![0-9a-fA-F])[0-9a-f]{32}(?![0-9a-fA-F])')
SUMLINE = re.compile(r'^([0-9a-f]{64}|[0-9a-f]{32})\s[ *]?(\S.*)$')
GENERIC = {'cold', 'frame', 'retired', 'cas', 'disposition', 'mishkan', 'census'}
# token boundaries: Moses's RULE 5.1 / A1.1 delimiters, but '<', '>' and '*' are kept inside a token so a
# placeholder can cut the path back to its folder (as RULE 5.1 cuts at '<' or '*')
ALIAS = re.compile(r'\{(TAB|BUILDS|R2|CLB|TABERNACLE)\}/', re.I)
SPLIT = re.compile(r'''[\s"'`()\[\]{},;|=]+''')
ALLOWED_PREFIX = re.compile(
    r'^(?:<|r2:|r2://|r2:mishkan/|r2://mishkan/|mishkan/|r2:<bucket>/|<bucket>/|<tabernacle>/|CLB/|TAB/|BUILDS/|R2/|TABERNACLE/|builds:|BUILDS:|CLB:|(?:\./)?(?:\.\./)+|'
    r'.*Tabernacle/|https?://[^/]*(?:r2\.dev|r2\.cloudflarestorage\.com)/(?:mishkan/)?|s3://mishkan/|mishkan:)?$')
READ_WORDS = re.compile(r'(\bnode\s+\S+\.m?js\b|\brclone\s+(?:copy|copyto|sync|cat|lsjson|lsf|ls|check|md5sum|hashsum)\b|--(?:from|in|record|ledger|lattice|streams|zone|r2-prefix|prefix)\b|\breads? (?:from|off)\b|\binputs?\s*[:=]|\b(?:fetch|download|pull|copi|cop)(?:ed|s|y)? from\b|\bbuilt (?:over|from|on)\b|\btaken from\b|\bstands on\b)', re.I)
READ_KEYS = re.compile(r'(input|^in$|^reads?$|read_from|source_r2|from$|^from|consum|stands_on|upstream|depends|fetch|download|r2_prefix|ledgers_root|toggle_builds_root)', re.I)

class Extractor:
    def __init__(self, bucket):
        self.b = bucket
        alt = '|'.join(re.escape(t) for t in bucket.tops)
        self.seg = re.compile(r'(?:^|(?<=/))(' + alt + r'|moses-[A-Za-z0-9][A-Za-z0-9._-]*|MOSES-LEDGER-INDEX\.md)(?=/|$|[<>*])')

    def norm(self, path):
        """path starting at a top name or a moses-* name -> (normalized, literal) both without final '/'"""
        p = path
        lit = p
        if p.startswith('mishkan/'):
            rest = p[8:]
            f = rest.split('/')[0]
            if f in self.b.topset or rest in self.b.rootfiles or f.startswith('moses-'): p = rest
        f = p.split('/')[0]
        if f.startswith('moses-') and f not in self.b.topset and p not in self.b.rootfiles:
            p = 'corpus-lane-builds/' + p
        return p.rstrip('/'), lit.rstrip('/')

    def cut(self, rest):
        """cut a path at a placeholder/glob back to its folder; strip line refs and trailing punctuation"""
        cutp = False
        m = re.search(r'[<>*{$…#?]', rest)
        if m:
            rest = rest[:m.start()]; cutp = True
            if '/' in rest: rest = rest[:rest.rfind('/') + 1]
        rest = re.sub(r':\d+(?:-\d+)?$', '', rest)
        rest = re.sub(r'[.:,/)\]]+$', '', rest)
        return rest, cutp

    def tokens(self, text, backslash=True):
        if backslash: text = text.replace('\\\\', '/').replace('\\', '/')
        # Moses's placeholders for his roots: {TAB}/ and {BUILDS}/ (the corpus-lane-builds folder), {R2}/ (the bucket)
        text = ALIAS.sub(lambda m: m.group(1).upper() + '/', text)
        for tok in SPLIT.split(text):
            if not tok: continue
            yield tok

    def refs_in_token(self, tok):
        """absolute refs in one token: list of (normalized, literal, form)"""
        out = []
        m = self.seg.search(tok)
        if not m: return out
        prefix = tok[:m.start()]
        name = m.group(1)
        if not ALLOWED_PREFIX.match(prefix):
            return out  # a nested path inside a copy, or a local path: not a root mention (RULE A1.1)
        rest, cutp = self.cut(tok[m.start():])
        if not rest: return out
        if '/' not in rest:
            # bare name: a build folder, a top folder or the root index
            if rest in self.b.rootfiles: out.append((rest, rest, 'abs-key'))
            elif rest.startswith('moses-') and rest in self.b.builds: out.append(('corpus-lane-builds/' + rest, rest, 'bare-build'))
            elif rest in self.b.topset and rest not in GENERIC and (prefix or tok.endswith('/')): out.append((rest, rest, 'bare-top'))
            return out
        n, lit = self.norm(rest)
        if name in GENERIC:
            st = self.b.status(n)
            if st == 'absent': return out  # 'frame/...', 'cold/...' etc. count only when the bucket has them
        form = 'moses-mention' if (name.startswith('moses-') and name not in self.b.topset) else 'abs-key'
        if cutp: form += '+placeholder'
        out.append((n, lit, form))
        return out

    def rel_in_token(self, tok, bases):
        """Moses's R7 relative token, resolved against bases; returns normalized key/prefix or None"""
        t = tok
        while t.startswith('./'): t = t[2:]
        t = re.split(r'[#?]', t, 1)[0]
        t, cutp = self.cut(t)
        if '/' not in t or t.startswith(('/', '~')) or re.match(r'^[A-Za-z]:', t) or '://' in t: return None
        low = t.lower()
        if low.startswith(('r2:', 'mishkan/', 'corpus-lane-builds/', 'moses-')): return None
        segs = t.split('/')
        if any(s == '' or s == '...' for s in segs): return None
        for base in bases:
            p = posixpath.normpath(base + '/' + t)
            if p.startswith('..') or p.startswith('/'): continue
            st = self.b.status(p)
            if st in ('key', 'prefix'): return p, st
        return None

def hash_on_line(line):
    m64 = HEX64.search(line)
    if m64: return 'sha256=' + m64.group(0)
    m32 = HEX32.search(line)
    if m32: return ('etag=' if 'etag' in line.lower() else 'md5=') + m32.group(0)
    return 'none'

def read_text(path, cap=300_000_000):
    """bytes -> str; gunzip .gz/.bin when gzip; None for binaries"""
    with open(path, 'rb') as f: b = f.read(cap + 1)
    if b[:2] == b'\x1f\x8b':
        try: b = gzip.decompress(b)
        except Exception: return None
    if b'\x00' in b[:65536]: return None
    return b.decode('utf-8', errors='replace')
