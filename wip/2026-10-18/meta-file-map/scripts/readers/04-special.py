# Rows the text scan cannot see by itself, written to meta/readers/refs-special.tsv:
#  (a) restore-shelf-from-history-v1.mjs reads serving-lane/shelf/zones/<name> for every pin of
#      reader/data/zone-store-v1.json (held to sha256 + bytes); expanded one row per pin, with whether the
#      object on R2 holds that pin today (per serving-lane/shelf/MANIFEST-shelf.json, spot-checked by sha256);
#  (b) Moses's delete ledger v1 keep rules on the R2 side (K3-PREFIX, K4, K5, R1, R7 ...): one row per kept
#      R2 unit whose reason is a reference (a mention or a channel other lanes read);
#  (c) the 'moses-mention' pins of the earlier r2dupes review (lib.mention_pins): the first example per
#      mention path that Moses's ledger kept, with its source text.
# Read-only on every input.
import json, re, collections, importlib.util
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
R = S + '/meta/readers'
def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
rl = load('rlib', R + '/scripts/rlib.py')
lib = load('lib', S + '/clean/review/r2dupes/lib.py')
B = rl.Bucket()
L = S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/build'
rows = []; num = collections.Counter()
def st(q): return B.status(q.rstrip('/'))
def row(src, ref, kind, algo, holder, form, scope, where, detail, pin=''):
    s = st(ref)
    r = ref.rstrip('/') + ('/' if s == 'prefix' else '')
    rows.append((src, r, kind, algo, holder, form, s, s, scope, where, detail, pin))

# (a) the shelf
z = json.load(open(S + '/ghp/reader/data/zone-store-v1.json', encoding='utf-8'))['pins']
man = json.load(open(R + '/dl/serving-lane/shelf/MANIFEST-shelf.json', encoding='utf-8'))['pins']
for name in sorted(z):
    k = 'serving-lane/shelf/zones/' + name
    held = name in man and man[name]['sha256'] == z[name]['sha256'] and man[name]['bytes'] == z[name]['bytes']
    num['shelf_pins'] += 1; num['shelf_pins_held_by_backup'] += held
    num['shelf_bytes'] += z[name]['bytes']
    row('reader/data/zone-store-v1.json', k, 'tool-read', 'sha256', 'site', 'expanded-pin', 'outside-builds', 'pins.' + name,
        'restore-shelf-from-history-v1.mjs GETs PREFIX+name and writes it only if bytes+sha256 equal the pin; backup holds this pin: %s' % ('yes' if held else 'no (stale backup of 2026-09-24..28)'), z[name]['sha256'])

# (b) delete ledger keep rules (R2 side)
for l in open(L + '/ledger/keep.jsonl', encoding='utf-8'):
    r = json.loads(l)
    if r['where'] != 'r2': continue
    why = str(r['why']); item = r['item']
    m = re.match(r'^(?:round \d+ )?(K3-PREFIX|K4b?|K5b?|R\d)\b', why) or re.search(r'\b(R7|R4|K4b|K5b|K3b|R1|R3|R6|R8)\b', why)
    rule = m.group(1) if m else None
    if not rule: num['keep_r2_other'] += 1; num['keep_r2_other_bytes'] += r['bytes']; continue
    if rule in ('K3b', 'R2', 'R3', 'R6', 'R8'): num['keep_r2_not_a_reference'] += 1; num['keep_r2_not_a_reference_bytes'] += r['bytes']; continue
    num['keep_r2_' + rule] += 1; num['keep_r2_%s_bytes' % rule] += r['bytes']
    src = 'corpus-lane-builds/moses-delete-ledger-v1/build/ledger/keep.jsonl'
    first = re.search(r'first: (CLB/\S+) -> (\S+?)\)?$', why)
    ref = item if item not in ('(root)', 'corpus-lane-builds/(own files)') else ('MOSES-LEDGER-INDEX.md' if item == '(root)' else 'corpus-lane-builds/')
    if rule == 'K3-PREFIX':
        row('corpus-lane-builds/moses-delete-ledger-v1/build/RULE.md', ref, 'provenance-cite', 'none', 'moses-ledger', 'keep-rule',
            'outside-builds' if not ref.startswith('corpus-lane-builds/') else 'builds', 'RULE 5 K3', 'keep rule K3-PREFIX: ' + why[:160])
    else:
        row(src, ref, 'provenance-cite', 'none', 'moses-ledger', 'keep-rule', 'builds', rule,
            'keep rule %s (%s bytes): %s' % (rule, r['bytes'], (first.group(1) + ' -> ' + first.group(2)) if first else why[:200]))

# (c) moses-mention pins of the r2dupes review
mp = lib.mention_pins()
for ref, src in sorted(mp.items()):
    s = str(src or '')
    key = 'corpus-lane-builds/' + s[4:] if s.startswith('CLB/') else s
    base = key.rsplit('/', 1)[-1]
    holder = 'relay' if re.search(r'(FOR-ELIJAH|FOR-MOSES|relay)', base, re.I) else ('receipt' if re.search('receipt', base, re.I) else 'moses-ledger')
    hb = key.split('/')[1] if key.startswith('corpus-lane-builds/') else None
    tb = ref.split('/')[1] if ref.startswith('corpus-lane-builds/') and ref.count('/') >= 1 else None
    scope = 'same-build' if hb and hb == tb else ('cross-build' if hb and tb else 'builds')
    num['moses_mention_pins'] += 1
    row(key, ref, 'provenance-cite', 'none', holder, 'ledger-mention', scope, 'delete ledger K4/K5/R4/R7 first example', 'moses-mention pin (r2dupes lib.mention_pins)')

# (d) the dormant runtime road: zone-store base (null today). When the owner moves the shelf, zone.html and
#     pull-zones-from-store-v1.mjs fetch <base>/<name>.<sha12>.bin over HTTPS and refuse any body whose sha256 is not
#     the pin; move-shelf-v1.sh writes the base. Not an R2 key today; recorded so the runtime class is not forgotten.
for src, how in (('reader/zone.html', 'binUrl(): fetch(<base>/<name>.<sha12>.bin), hashed on arrival, refused on mismatch'),
                 ('reader/tools/pull-zones-from-store-v1.mjs', 'fetch(<base>/<name>.<sha12>.bin), byte count + sha256 held to the pin'),
                 ('reader/tools/move-shelf-v1.sh', 'writes the base into the store record, then checks every pin over the page\'s own wire')):
    rows.append((src, '<zone-store base>/<name>.<sha12>.bin', 'runtime-fetch', 'sha256', 'site', 'dormant', 'not-an-r2-key', 'not-an-r2-key',
                 'outside-builds', 'reader/data/zone-store-v1.json base = null', 'dormant: ' + how, ''))
    num['dormant_runtime_rows'] += 1

with open(R + '/refs-special.tsv', 'w', encoding='utf-8') as f:
    for r in rows: f.write('\t'.join(str(x).replace('\t', ' ') for x in r) + '\n')
json.dump(dict(num), open(R + '/special-numbers.json', 'w'), indent=1)
print(json.dumps(dict(num), indent=1))
