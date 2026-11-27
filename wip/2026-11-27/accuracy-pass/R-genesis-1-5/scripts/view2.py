#!/usr/bin/env python3
# Read-only: a tighter view of the cards opened deep, for reading by a person: one card per paragraph, the pills of the block
# the card opens on (a pill list already printed for the same block is not printed again), the pressed pill and where it stands.
import json, sys
CARDS, lo, hi = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
CUT = int(sys.argv[4]) if len(sys.argv) > 4 else 1300
SHORT = [("Strong's Hebrew Dictionary via Open Scriptures", 'StrOS'), ("Strong's Hebrew concordance", 'StrWS'), ('Unabridged Brown-Driver-Briggs', 'BDBu'),
         ('Brown-Driver-Briggs Hebrew Lexicon via Open Scriptures', 'BDBos'), ('MACULA', 'MAC'), ('Amalgamated Hebrew OT', 'TAHOT'), ('Brief Lexicon', 'TBESH'),
         ('Semantic Dictionary of Biblical Hebrew via HiperBiblia', 'SDBH'), ('UBS Dictionary', 'UBS'), ('Davidson', 'DAV'), ('Lexical Index', 'OSLI'),
         ('unfoldingWord', 'UHAL'), ('BiblicalTools', 'BT')]
def short(title):
    for k, s in SHORT:
        if k in title: return s
    return title[:25]
seen = {}
for l in open(CARDS):
    d = json.loads(l)
    if not (lo <= d['si'] <= hi) or not d['deep']: continue
    c = d['card']; pills = c['pills']
    i = next((k for k, p in enumerate(pills) if p[4]), None)
    blk = next((b[0] for b in d['blocks'] if b[1]), '?')
    place = '%s w%d' % (d['label'], d['wordNo'])
    print('\n#### %s %s «%s» | card names «%s» | blocks %s | entry %s | pressed «%s» at %s of %d {%s} | record: %s — %s' % (
        place, d['he'], (d['line'] or '').replace('​', '{gap}'), d['now'][1], ','.join(b[0] + ('*' if b[1] else '') for b in d['blocks']), (c['ds'] or {}).get('entry'),
        pills[i][0] if i is not None else None, i, len(pills), pills[i][1] if i is not None else '', (c['rec']['text'] or '')[:90], (c['rec']['att'] or '').split(' · ')[0][:48]))
    if d['roles'] and any(x and 'maqaf' not in x for x in d['roles']): print('   notes:', ' / '.join(x for x in d['roles'] if x))
    wh = (c['withheld'] or '')
    if wh: print('   held back:', wh[:230])
    key = (blk, tuple(p[0] for p in pills))
    if key in seen:
        print('   pills: same as', seen[key])
    else:
        seen[key] = place
        cur = None; out = []
        for t, by, g, title, pr in pills:
            s = short(title)
            if s != cur: out.append('  [' + s + '] '); cur = s
            else: out.append(' | ')
            out.append(('>>' if pr else '') + (t if len(t) <= 60 else t[:60] + '…') + ('<<' if pr else ''))
        txt = ''.join(out)
        print('   pills:' + (txt if len(txt) <= CUT else txt[:CUT] + ' …(cut)'))
    for o in d.get('others') or []:
        ps = o['card']['pills']; j = next((k for k, p in enumerate(ps) if p[4]), None)
        print('   other block %s: pressed «%s» at %s of %d; first pill «%s»' % (o['block'], ps[j][0] if j is not None else None, j, len(ps), ps[0][0] if ps else None))
