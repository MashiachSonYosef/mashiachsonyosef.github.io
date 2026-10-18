# Select small text "doc" objects on R2 by name (RECEIPT, RULE, README, FOR-ELIJAH, FOR-MOSES, LEDGER, INDEX,
# MANIFEST, handoff, relay), .md/.json/.txt; dedupe by (md5,size) so each distinct body is downloaded once.
# Read-only: reads the bucket listing and the md5 table already on disk; writes the selection under meta/readers/.
import re, sys, json, collections, importlib.util
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
OUT = S + '/meta/readers'
spec = importlib.util.spec_from_file_location('lib', S + '/clean/review/r2dupes/lib.py'); lib = importlib.util.module_from_spec(spec); spec.loader.exec_module(lib)
MD5 = S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv'
NAME = re.compile(r'(RECEIPT|RULE|README|FOR-ELIJAH|FOR-MOSES|LEDGER|INDEX|MANIFEST|handoff|relay)', re.I)
EXT = re.compile(r'\.(md|json|txt)$', re.I)
# per-book data files and source catalogs carry text, not references: skipped
SKIP = re.compile(r'(\.spans-ledger-v|^sef-api-index|^sefaria-index)', re.I)
CAP = int(sys.argv[1]) if len(sys.argv) > 1 else 5_000_000
md5 = {}
for l in open(MD5, encoding='utf-8'):
    h, s, k = l.rstrip('\n').split('\t', 2); md5[k] = h
rows = []
for l in open(S + '/clean/bucket-now2.tsv', encoding='utf-8'):
    k, s, t = l.rstrip('\n').split('\t'); s = int(s)
    b = k.rsplit('/', 1)[-1]
    if NAME.search(b) and EXT.search(b) and not SKIP.search(b):
        rows.append((k, s, t, md5.get(k, ''), lib.zone_root(k) or '', lib.fragile_reason(k) or ''))
c = collections.Counter(); by = collections.Counter()
groups = collections.defaultdict(list)
for k, s, t, h, z, fr in rows:
    groups[(h or 'nomd5:' + k, s)].append((k, z, fr))
sel = []
for (h, s), ks in groups.items():
    # representative: a key not in a copy zone / fragile place, shortest path; else the shortest
    ks.sort(key=lambda x: (bool(x[2]), len(x[0]), x[0]))
    sel.append((ks[0][0], s, h, len(ks)))
big = [x for x in sel if x[1] > CAP]
small = [x for x in sel if x[1] <= CAP]
with open(OUT + '/docs-all.tsv', 'w', encoding='utf-8') as f:
    for r in rows: f.write('\t'.join(map(str, r)) + '\n')
with open(OUT + '/docs-selected.tsv', 'w', encoding='utf-8') as f:
    for r in sorted(small): f.write('\t'.join(map(str, r)) + '\n')
with open(OUT + '/docs-too-big.tsv', 'w', encoding='utf-8') as f:
    for r in sorted(big): f.write('\t'.join(map(str, r)) + '\n')
print(json.dumps({'doc_keys': len(rows), 'doc_bytes': sum(r[1] for r in rows),
  'doc_keys_in_copy_places': sum(1 for r in rows if r[5]),
  'distinct_bodies': len(sel), 'selected': len(small), 'selected_bytes': sum(x[1] for x in small),
  'too_big': len(big), 'too_big_bytes': sum(x[1] for x in big), 'cap_bytes': CAP,
  'no_md5_keys': sum(1 for r in rows if not r[3])}, indent=1))
