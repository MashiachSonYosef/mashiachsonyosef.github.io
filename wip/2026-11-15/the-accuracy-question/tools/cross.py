# The outside reader's fourteen Genesis 1 verb cards: the 291 pills and calls of 12 November, set beside the same cards
# as served today (live main) and on the toggles tree. Pills are matched by card and text. Nothing is judged here:
# a pill the reader never saw is counted as new and listed.
import json, sys, csv, collections, re
tsv, old_json, live_json, tree_json = sys.argv[1:5]
norm = lambda s: re.sub(r'\s+', ' ', str(s)).strip()
calls = collections.defaultdict(dict)   # verse|form -> text -> call
order = []
for r in csv.DictReader(open(tsv, encoding='utf-8'), delimiter='\t'):
    key = (r['verse'], r['form'])
    if key not in order: order.append(key)
    calls[key][norm(r['text'])] = r["the reader's call"]
def cards(p):
    d = json.load(open(p, encoding='utf-8'))
    out = {}
    for c in d['cards']:
        pills = c.get('pills') or []
        out[(c['label'], c['s'])] = [norm(x.get('text') if isinstance(x, dict) else x) for x in pills]
    return out
old, live, tree = cards(old_json), cards(live_json), cards(tree_json)
print('cards', len(order), '| 12 Nov pills', sum(len(v) for v in calls.values()))
NAMES = {'R': 'right', 'S': 'another stem', 'W': 'another word', 'B': 'broken', 'M': 'bundled', 'U': 'unsure'}
def tally(build, name):
    tot = collections.Counter(); new = []; n = 0
    for key in order:
        ps = build.get(key)
        if ps is None: print(name, 'card missing', key); continue
        for t in ps:
            n += 1
            c = calls[key].get(t)
            if c is None: new.append((key[0], t)); tot['new'] += 1
            else: tot[c] += 1
    print(f'{name}: {n} pills ·', ' · '.join(f'{k} {v}' for k, v in sorted(tot.items(), key=lambda x: -x[1])))
    return n, tot, new
print('call letters in the dump:', collections.Counter(c for v in calls.values() for c in v.values()))
for name, b in (('12 Nov (the dump)', old), ('live today', live), ('toggles tree', tree)):
    n, tot, new = tally(b, name)
    if new:
        print('   new since 12 Nov:', '; '.join(f'{v} «{t}»' for v, t in new[:40]))
# what left, by call
for name, b in (('live today', live), ('toggles tree', tree)):
    gone = collections.Counter(); gl = []
    for key in order:
        have = set(b.get(key) or [])
        for t, c in calls[key].items():
            if t not in have: gone[c] += 1; gl.append((key[0], c, t))
    print(f'{name}: left the cards since 12 Nov:', dict(gone))
    print('   ', '; '.join(f'{v} [{c}] «{t}»' for v, c, t in gl[:60]))
