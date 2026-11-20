# Ship 11b, a measure before the landing: what STEP's letters (t) on English Wiktionary's rows would part beyond
# the numbers (n). For every number, the letters STEP's own rows carry in the store (TAHOT M4, TBESH M19); a list row
# whose t is fewer than its numbers' letters would be withheld at a place tagged with one of the others.
import sys, json, gzip, glob, collections, csv
store, lst = sys.argv[1], sys.argv[2]
letters = collections.defaultdict(set)
rows = 0
for p in sorted(glob.glob(store + '/shards/*.bin')):
    body = json.loads(gzip.open(p).read().decode('utf-8'))
    for k, lst_rows in body.items():
        for r in lst_rows:
            rows += 1
            if str(r[3]) not in ('M4', 'M19'): continue
            f = r[10] if len(r) > 10 and isinstance(r[10], dict) else None
            for t in (f or {}).get('t', []):
                num = 'H' + ''.join(c for c in t[1:] if c.isdigit())
                letters[num].add(t)
print('store rows', rows, 'numbers with a lettered tag on STEP rows', len(letters))
with_t = narrower = same = unknown = 0
by_m = collections.Counter(); ex = []
with open(lst, encoding='utf-8', newline='') as fh:
    rd = csv.reader(fh, delimiter='\t', quoting=csv.QUOTE_NONE)
    head = next(rd)
    for c in rd:
        f = json.loads(c[head.index('facts_under_entry_ledger')])
        if 't' not in f: continue
        with_t += 1
        allof = set()
        for n in f.get('n', []): allof |= letters.get(n, set())
        mine = set(f['t'])
        if not (mine <= allof): unknown += 1
        if allof - mine:
            narrower += 1; by_m[c[2]] += 1
            if len(ex) < 12: ex.append((c[0], c[1], c[2], c[4][:50], sorted(mine), sorted(allof - mine)))
        else: same += 1
print('list rows with t', with_t, '| t is every letter STEP rows carry for its numbers', same, '| fewer (t would part)', narrower, dict(by_m), '| a letter no STEP row carries', unknown)
for e in ex: print(' ', e)
