# Every sha256 the chain pages and the reader's records state, held to the bytes of one git tree (a branch or a
# commit), read straight from git's objects: (1) the fingerprints on chain/index.html, book by book; (2) the files
# each chain book and each resting-lines record says it was read off; (3) the zone pins every chapter page carries.
# It reads; it changes nothing. python3 -I sha-audit.py <git dir> <tree-ish>
import gzip, hashlib, json, re, subprocess, sys, collections
G, REV = sys.argv[1], sys.argv[2]
def git(*a, inp=None):
    return subprocess.run(["git", "-C", G, *a], input=inp, capture_output=True, check=True).stdout
paths = {}
for line in git("ls-tree", "-r", REV).decode("utf-8").splitlines():
    meta, path = line.split("\t", 1)
    paths[path] = meta.split()[2]
def blob(path):
    return git("cat-file", "blob", paths[path]) if path in paths else None
def sha(path):
    b = blob(path); return hashlib.sha256(b).hexdigest() if b is not None else None
T = collections.Counter(); bad = []
# (1) the chain index's fingerprints, each under the book it follows
html = blob("chain/index.html").decode("utf-8")
book = None
for line in html.splitlines():
    m = re.search(r'href="([a-z0-9-]+)/"', line)
    if m: book = m.group(1)
    f = re.search(r'class="fp">([^ <]+) &nbsp;([0-9a-f]{64})<', line)
    if f and book:
        T["chain index fingerprints"] += 1
        got = sha(f"chain/{book}/{f.group(1)}")
        if got == f.group(2): T["  match"] += 1
        else: bad.append(f"chain index: {book}/{f.group(1)} says {f.group(2)[:12]}, the tree holds {str(got)[:12]}")
# (2) what each chain book and each resting-lines record says it was read off
def read_off_of(rec):
    ro = (rec or {}).get("read_off") or {}
    fs = ro.get("files") or {}
    return fs.items() if isinstance(fs, dict) else [(x.get("file") or x.get("path"), x.get("sha256")) for x in fs]
records = [p for p in paths if re.fullmatch(r"chain/[a-z0-9-]+/chain-v1\.json\.gz", p)] + [p for p in paths if re.fullmatch(r"reader/data/resting-lines/[a-z0-9-]+\.json\.gz", p)]
for p in sorted(records):
    rec = json.loads(gzip.decompress(blob(p)).decode("utf-8"))
    T["records read (chain books and resting lines)"] += 1
    for name, want in read_off_of(rec):
        if not name or not want: continue
        T["read-off files stated"] += 1
        want = want if isinstance(want, str) else (want.get("sha256") if isinstance(want, dict) else None)
        cands = [name, f"reader/{name}"]
        got = next((sha(c) for c in cands if c in paths), None)
        if got == want: T["  match"] += 1
        else: bad.append(f"{p}: read off {name} {str(want)[:12]}, the tree holds {str(got)[:12]}")
# (3) the zone pins on every chapter page: {"pins": {file: {"sha256", "bytes"}}}, files of reader/data/zones (base null)
import html as H
for p in sorted(paths):
    if not p.endswith(".html"): continue
    m = re.search(rb'<meta name="reader-zone-pins" content="([^"]*)"', blob(p))
    if not m: continue
    d = json.loads(H.unescape(m.group(1).decode("utf-8")))
    T["pages with zone pins"] += 1
    base = d.get("base") or "reader/data/zones/"
    for name, pin in (d.get("pins") or {}).items():
        T["zone pins stated"] += 1
        path = base.rstrip("/") + "/" + name
        b = blob(path)
        got = hashlib.sha256(b).hexdigest() if b is not None else None
        if got == pin.get("sha256") and (pin.get("bytes") is None or len(b) == pin["bytes"]): T["  match"] += 1
        else: bad.append(f"{p}: pin {name} {str(pin.get('sha256'))[:12]}, the tree holds {str(got)[:12]}")
for k, v in T.items(): print(f"{v:>8,}  {k}")
print(f"{len(bad):>8,}  that do not match")
for b in bad[:12]: print("   ", b)
