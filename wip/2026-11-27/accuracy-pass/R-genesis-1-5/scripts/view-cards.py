#!/usr/bin/env python3
# Read-only: prints the cards opened deep (every tenth word and the doubted words) in a form a person can read:
# the word, the line, the blocks, each pill with its source in short, the pressed pill marked, the record shown.
import json, sys, re
CARDS = sys.argv[1]
lo, hi = (int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv) > 3 else (0, 10 ** 9)
only_deep = (sys.argv[4] != 'all') if len(sys.argv) > 4 else True
SHORT = [("Strong's Hebrew Dictionary via Open Scriptures", 'StrOS'), ("Strong's Hebrew concordance", 'StrWS'), ('Unabridged Brown-Driver-Briggs', 'BDBu'),
         ('Brown-Driver-Briggs Hebrew Lexicon via Open Scriptures', 'BDBos'), ('MACULA', 'MAC'), ('Amalgamated Hebrew OT', 'TAHOT'), ('Brief Lexicon', 'TBESH'),
         ('Semantic Dictionary of Biblical Hebrew via HiperBiblia', 'SDBH'), ('UBS Dictionary', 'UBS'), ('Davidson', 'DAV'), ('Lexical Index', 'OSLI'),
         ('unfoldingWord', 'UHAL'), ('BiblicalTools', 'BT')]
def short(title):
    for k, s in SHORT:
        if k in title: return s
    return title[:25]
def pills_str(pills, cut=70):
    out = []
    for t, by, grade, title, pressed in pills:
        tt = t if len(t) <= cut else t[:cut] + '…'
        out.append(('>>' if pressed else '') + tt + ' {' + short(title) + (',' + grade if grade else '') + (' +' + str(len(by.split()) - 1) if len(by.split()) > 1 else '') + '}' + ('<<' if pressed else ''))
    return ' | '.join(out)
for l in open(CARDS):
    d = json.loads(l)
    if not (lo <= d['si'] <= hi): continue
    if only_deep and not d['deep']: continue
    c = d['card']
    print('\n#### %s w%d  %s   line «%s»  [%s]  card names «%s»' % (d['label'], d['wordNo'], d['he'], (d['line'] or '').replace('​', '{gap}'), d['credit'], d['now'][1]))
    if d['roles']: print('   notes:', ' / '.join(x for x in d['roles'] if x))
    print('   blocks:', ' , '.join(b[0] + ('*' if b[1] else '') for b in d['blocks']), '  |', c['label'], '|', (c['withheld'] or ''), '|', (c['signsOff'] or ''))
    if c['ds']: print('   entry', c['ds'].get('entry'), 'rows', c['ds'].get('rows'), 'withheld: entry', c['ds'].get('entryWithheld'), 'pointing', c['ds'].get('withheld'), 'unpointed', c['ds'].get('unpointedWithheld'), 'name', c['ds'].get('nameWithheld'), 'stem', c['ds'].get('stemWithheld'), 'kind', c['ds'].get('kindWithheld'))
    print('   pills(%d): %s' % (len(c['pills']), pills_str(c['pills'])))
    r = c['rec']
    print('   record: %s  —  %s' % ((r['text'] or '')[:160], (r['att'] or '')[:110]))
    if r['notes']: print('   sense notes:', r['notes'][:200])
    if c['prov']: print('   prov:', c['prov'])
    for o in d.get('others') or []:
        oc = o['card']
        print('   -- block %s: %s | pills(%d): %s' % (o['block'], oc['label'], len(oc['pills']), pills_str(oc['pills'], 50)[:900]))
        if oc['rec']['att']: print('      record: %s — %s' % ((oc['rec']['text'] or '')[:100], oc['rec']['att'][:90]))
