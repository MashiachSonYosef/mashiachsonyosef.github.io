#!/usr/bin/env python3
# Read-only: over every card cards.mjs opened (the block the card opens on), and the other blocks of the cards opened deep:
#  - where the pressed pill stands among the pills (first, or how far down), by the number of blocks of the word;
#  - pills whose text is broken or is not a reading on its face: brackets unpaired, an empty bracket, trailing dots,
#    letters that are not Latin, one pill per (text, source) with the number of cards it stands on.
# Writes pressed-position.tsv, odd-pills.tsv, prefix-blocks.tsv and prints the counts.
import json, sys, re, collections, statistics
CARDS, OUT = sys.argv[1], sys.argv[2]
SHORT = [("Strong's Hebrew Dictionary via Open Scriptures", 'Strong (Open Scriptures)'), ("Strong's Hebrew concordance", 'Strong (Wikisource)'), ('Unabridged Brown-Driver-Briggs', 'BDB unabridged'),
         ('Brown-Driver-Briggs Hebrew Lexicon via Open Scriptures', 'BDB (Open Scriptures)'), ('MACULA', 'MACULA'), ('Amalgamated Hebrew OT', 'TAHOT'), ('Brief Lexicon', 'TBESH'),
         ('Semantic Dictionary of Biblical Hebrew via HiperBiblia', 'SDBH'), ('UBS Dictionary', 'UBS'), ('Davidson', 'Davidson'), ('Lexical Index', 'Lexical Index'),
         ('unfoldingWord', 'UHAL'), ('BiblicalTools', 'BiblicalTools')]
def short(title):
    for k, s in SHORT:
        if k in title: return s
    return title[:30]
def odd(t):
    why = []
    if t.count('(') != t.count(')'): why.append('round brackets unpaired')
    if t.count('[') != t.count(']'): why.append('square brackets unpaired')
    if re.search(r'\(\s*\)', t): why.append('empty bracket')
    if re.search(r'\.\.\s*$', t): why.append('ends in dots')
    if re.search(r'[֐-׿]', t): why.append('Hebrew letters in an English reading')
    if re.search(r'[^\x00-\x7f]', re.sub(r'[֐-׿×’‘“”…—–►◄≈°éèêëàáâäöüïîçñ]', '', t)): why.append('letters outside plain Latin')
    if not re.search(r'[A-Za-z]', t): why.append('no letters')
    if re.match(r'^[,;:.)\]]', t.strip()): why.append('opens with a closing mark')
    return why
cards = [json.loads(l) for l in open(CARDS)]
pos_rows = []; by_blocks = collections.defaultdict(list)
oddc = collections.Counter(); odd_first = {}; odd_why = {}
src_pills = collections.Counter()
for d in cards:
    pills = d['card']['pills']
    i = next((k for k, p in enumerate(pills) if p[4]), None)
    nb = len(d['blocks'])
    pos_rows.append((d['label'], d['wordNo'], d['he'], nb, i if i is not None else '', len(pills), pills[0][0] if pills else '', pills[i][0] if i is not None else ''))
    if i is not None: by_blocks['one block' if nb == 1 else 'more than one block'].append(i)
    for t, by, grade, title, pressed in pills:
        src_pills[short(title)] += 1
        w = odd(t)
        if w:
            k = (t, short(title)); oddc[k] += 1; odd_first.setdefault(k, '%s w%d %s' % (d['label'], d['wordNo'], d['he'])); odd_why[k] = '; '.join(w)
with open(OUT + '/pressed-position.tsv', 'w') as f:
    f.write('place\tword_no\thebrew\tblocks\tpressed_index_from_0\tpills\tfirst_pill\tpressed_pill\n')
    for r in pos_rows: f.write('\t'.join(str(x) for x in r) + '\n')
for k, v in by_blocks.items():
    v2 = sorted(v)
    print(k, 'cards', len(v), 'pressed is first', sum(1 for x in v if x == 0), 'pressed at 10 or lower', sum(1 for x in v if x >= 10), 'at 20 or lower', sum(1 for x in v if x >= 20), 'median index', v2[len(v2) // 2], 'max', v2[-1])
with open(OUT + '/odd-pills.tsv', 'w') as f:
    f.write('pill\tsource\twhy\tcards_in_genesis_1_5\tfirst_place\n')
    for k, v in oddc.most_common():
        f.write('%s\t%s\t%s\t%d\t%s\n' % (k[0].replace('\t', ' '), k[1], odd_why[k], v, odd_first[k]))
print('odd pills (distinct text+source):', len(oddc), 'card-appearances:', sum(oddc.values()))
bysrc = collections.Counter();
for (t, s), v in oddc.items(): bysrc[s] += 1
print('distinct odd pills by source:', dict(bysrc))
print('pills by source (card-appearances):', dict(src_pills))
# the other blocks of the deep cards: where the pressed pill of a prefix or suffix block stands
pb = collections.defaultdict(list)
for d in cards:
    for o in d.get('others') or []:
        ps = o['card']['pills']
        i = next((k for k, p in enumerate(ps) if p[4]), None)
        pb[o['block']].append((i, len(ps), ps[0][0] if ps else '', ps[i][0] if i is not None else '', '%s w%d' % (d['label'], d['wordNo'])))
with open(OUT + '/prefix-blocks.tsv', 'w') as f:
    f.write('block\tplace\tpressed_index_from_0\tpills\tfirst_pill\tpressed_pill\n')
    for b, rows in sorted(pb.items(), key=lambda kv: -len(kv[1])):
        for i, n, first, pr, where in rows: f.write('%s\t%s\t%s\t%d\t%s\t%s\n' % (b, where, '' if i is None else i, n, first, pr))
for b, rows in sorted(pb.items(), key=lambda kv: -len(kv[1]))[:14]:
    c = collections.Counter((r[3], r[0], r[1], r[2]) for r in rows)
    print('block', b, 'opened', len(rows), '->', [('pressed %r at %s of %d, first pill %r' % k, v) for k, v in c.most_common(4)])
