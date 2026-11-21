# v202: at each STEP_WRITES_OUR_SPELLING place, the form row for the place (landed or not landed) against the bridge's
# pieces: the row's words cut at "/" must be the pieces' English, the brackets aside.
# Usage: python3 -I bridge-pieces-as-written.py <bridge-v1 dir>
import sys, json, re, collections
B = sys.argv[1]
places = [json.loads(l) for l in open(B + '/bridge-places-v1.jsonl', encoding='utf-8')]
rows = [json.loads(l) for l in open(B + '/form-rows-v1.jsonl', encoding='utf-8')] + [json.loads(l) for l in open(B + '/form-rows-not-landed-v1.jsonl', encoding='utf-8')]
at = collections.defaultdict(list)
for r in rows:
    for p in r['places']: at[(p['book'], p['place'])].append(r)
bare = lambda t: re.sub(r'\s+', ' ', re.sub(r'[\[\]<>]', '', t)).strip()
T = collections.Counter(); bad = []; marks = collections.Counter()
for p in places:
    if p['class'] != 'STEP_WRITES_OUR_SPELLING': continue
    T['places'] += 1; T['use:' + str(p['use'])] += 1
    rs = at.get((p['book'], p['place']), [])
    if len(rs) != 1: T['rows_for_the_place:%d' % len(rs)] += 1; bad.append((p['book'], p['place'], 'rows', len(rs))); continue
    words = rs[0]['route']; parts = words.split('/'); pcs = p['pieces'] or []
    if len(parts) != len(pcs): T['count_differs'] += 1; bad.append((p['book'], p['place'], words, [x['english_tahot'] for x in pcs])); continue
    ok = all(bare(a) == bare(x['english_tahot']) for a, x in zip(parts, pcs))
    T['agree' if ok else 'words_differ'] += 1
    if not ok: bad.append((p['book'], p['place'], words, [x['english_tahot'] for x in pcs]))
    for a in parts:
        if '[' in a: marks['['] += 1
        if '<' in a: marks['<'] += 1
    if p['key_ours'] != rs[0]['key']: T['key_differs'] += 1
    if ''.join(x['consonants'] for x in pcs) != p['key_ours']: T['pieces_do_not_spell_the_key'] += 1
print(dict(T)); print('parts with a bracket', dict(marks))
for b in bad[:40]: print('  ', b)
