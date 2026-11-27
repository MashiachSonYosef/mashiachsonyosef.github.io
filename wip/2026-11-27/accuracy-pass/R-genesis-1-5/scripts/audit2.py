#!/usr/bin/env python3
# Read-only: further counts over the 1,815 cards.
#  a) the cards whose pressed pill is not STEP's reading for the block (the piece is a sign left undrawn);
#  b) pills that read as a whole word of several pieces ("x + y") on the card of one block;
#  c) the distinct pills of BDB unabridged, with the number of cards each stands on (to read by eye);
#  d) per chapter: verses, words, cards, deep cards.
import json, sys, re, collections
CARDS, OUT = sys.argv[1], sys.argv[2]
cards = [json.loads(l) for l in open(CARDS)]
sign_only = re.compile(r'^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+)$')
# a)
rows = []
for d in cards:
    now = (d['now'][1] or '').split(' + ')
    bi = next((i for i, b in enumerate(d['blocks']) if b[1]), None)
    pills = d['card']['pills']; pr = next((p for p in pills if p[4]), None)
    if bi is None or pr is None or len(now) != len(d['blocks']): continue
    if pr[0] != now[bi].strip():
        rows.append((d['label'], d['wordNo'], d['he'], (d['line'] or '').replace('​', '{gap}'), d['now'][1], d['blocks'][bi][0], now[bi].strip(), pr[0], pr[3]))
with open(OUT + '/pressed-not-steps-reading.tsv', 'w') as f:
    f.write('place\tword_no\thebrew\tline_drawn\tcard_names\tblock_open\tsteps_reading_for_the_block\tpill_pressed\tpill_source\n')
    for r in rows: f.write('\t'.join(str(x) for x in r) + '\n')
print('a) pressed pill is not STEP reading for the block:', len(rows), collections.Counter((r[5], r[6], r[7]) for r in rows).most_common())
# the same for the other blocks of the deep cards
orows = collections.Counter()
for d in cards:
    for o in d.get('others') or []:
        now = (o['now'][1] or '').split(' + ')
        bi = next((i for i, b in enumerate(o['blocks']) if b[1]), None)
        ps = o['card']['pills']; pr = next((p for p in ps if p[4]), None)
        if bi is None or pr is None or len(now) != len(o['blocks']): continue
        if pr[0] != now[bi].strip(): orows[(o['block'], now[bi].strip(), pr[0])] += 1
print('   other blocks pressed by hand (deep cards):', orows.most_common())
# b)
plus = collections.Counter(); plus_ex = {}
for d in cards:
    blk = next((b[0] for b in d['blocks'] if b[1]), None)
    for p in d['card']['pills']:
        if ' + ' in p[0] and not p[4]:
            k = (blk, p[0], p[3].split(' · ')[-1][:40]); plus[k] += 1; plus_ex.setdefault(k, '%s w%d %s «%s»' % (d['label'], d['wordNo'], d['he'], d['now'][1]))
with open(OUT + '/whole-word-pills-on-a-piece.tsv', 'w') as f:
    f.write('block\tpill\tsource\tcards\tfirst_place\n')
    for k, v in plus.most_common(): f.write('%s\t%s\t%s\t%d\t%s\n' % (k[0], k[1], k[2], v, plus_ex[k]))
print('b) pills reading "x + y" on one block: distinct', len(plus), 'card-appearances', sum(plus.values()), 'cards', len({(d['label'], d['wordNo']) for d in cards if any(' + ' in p[0] and not p[4] for p in d['card']['pills'])}))
for k, v in plus.most_common(12): print('   ', v, k, '|', plus_ex[k])
# c)
bd = collections.Counter(); bd_ex = {}
for d in cards:
    blk = next((b[0] for b in d['blocks'] if b[1]), None)
    for p in d['card']['pills']:
        if 'Unabridged' in p[3]:
            k = (blk, p[0]); bd[k] += 1; bd_ex.setdefault(k, '%s w%d' % (d['label'], d['wordNo']))
with open(OUT + '/bdb-unabridged-pills.tsv', 'w') as f:
    f.write('block\tpill\tcards\tfirst_place\n')
    for k, v in sorted(bd.items(), key=lambda kv: (kv[0][0], -kv[1])): f.write('%s\t%s\t%d\t%s\n' % (k[0], k[1], v, bd_ex[k]))
print('c) BDB unabridged: distinct (block, pill)', len(bd), 'card-appearances', sum(bd.values()), 'cards with one or more', len({(d['label'], d['wordNo']) for d in cards if any('Unabridged' in p[3] for p in d['card']['pills'])}))
# d)
per = collections.defaultdict(lambda: collections.Counter())
for d in cards:
    ch = d['label'].split(':')[0]
    per[ch]['words'] += 1; per[ch]['deep'] += 1 if d['deep'] else 0; per[ch]['verses_seen'] = len({x['label'] for x in cards if x['label'].split(':')[0] == ch})
for ch in sorted(per, key=int): print('d) chapter', ch, dict(per[ch]))
