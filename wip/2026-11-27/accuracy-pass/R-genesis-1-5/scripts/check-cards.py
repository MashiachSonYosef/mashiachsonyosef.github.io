#!/usr/bin/env python3
# Read-only: reads what cards.mjs wrote and compares, word by word:
#  - the line the page drew with the line recorded in data/resting-lines (and the credit);
#  - the reading the card names («reading · STEP at this place») with the line;
#  - the pill pressed on the card with the piece of the line its block stands for; whether the pressed pill is the first.
# Writes card-checks.tsv and prints the counts.
import gzip, json, sys, re, collections
R, OUT, CARDS = sys.argv[1], sys.argv[2], sys.argv[3]
ZW = '​'
rl = json.load(gzip.open(R + '/data/resting-lines/genesis.json.gz'))
z = json.load(gzip.open(R + '/data/zones/genesis.bin'))
lines = {}
for (lab, rows), sec in zip(rl['sections'], z['sections']):
    by_e = {r[0]: r for r in rows}
    wn = 0
    for e, w in enumerate(sec['words']):
        if 'mark' in w: continue
        wn += 1
        lines[(lab, wn)] = (by_e.get(e), w)
sign_only = re.compile(r'^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+)$')
C = collections.Counter()
out = []
cards = [json.loads(l) for l in open(CARDS)]
for d in cards:
    C['words'] += 1
    key = (d['label'], d['wordNo'])
    row, w = lines.get(key, (None, None))
    flags = []
    if row is None:
        flags.append('no-data-row')
    else:
        if (d['line'] or '') != row[2]: flags.append('line-differs-from-data: page %r data %r' % (d['line'], row[2]))
        if d['credit'] != row[3]: flags.append('credit-differs: page %r data %r' % (d['credit'], row[3]))
    line = d['line'] or ''
    if line.replace(ZW, '').strip() == '': flags.append('nothing-drawn-under-word'); C['nothing_drawn'] += 1
    if not d['settled']: flags.append('card-not-settled'); C['not_settled'] += 1
    now = d['now'][1] or ''
    C['now_label:' + str(d['now'][0])] += 1
    # the reading the card names against the line drawn (the line may leave sign-only pieces undrawn)
    now_pcs = now.split(' + ')
    drawn = [p for p in now_pcs if not sign_only.match(p.strip())] if not all(sign_only.match(p.strip()) for p in now_pcs) else now_pcs
    line_pcs = [p for p in re.split(r' \+ |' + ZW, line) if p.strip()]
    if [p.strip() for p in drawn] != [p.strip() for p in line_pcs]: flags.append('card-names-other-reading-than-line: card %r line %r' % (now, line))
    blocks = d['blocks']
    pressed_i = [i for i, b in enumerate(blocks) if b[1]]
    pills = d['card']['pills']
    pressed = [p for p in pills if p[4]]
    C['pills_total'] += len(pills)
    if not pills: flags.append('no-pills'); C['no_pills'] += 1
    if len(pressed) != 1: flags.append('pressed-pills=%d' % len(pressed)); C['pressed_not_one'] += 1
    piece = None
    if len(blocks) == len(now_pcs) and len(pressed_i) == 1:
        piece = now_pcs[pressed_i[0]].strip()
    elif len(blocks) == 1:
        piece = now.strip()
    else:
        flags.append('blocks(%d)-do-not-match-pieces(%d)' % (len(blocks), len(now_pcs))); C['blocks_mismatch'] += 1
    if pressed and piece is not None:
        pt = pressed[0][0]
        if pt != piece:
            flags.append('pressed-pill %r is-not-the-piece %r' % (pt, piece)); C['pressed_not_piece'] += 1
            if sign_only.match(piece): C['pressed_not_piece_where_piece_is_a_sign'] += 1
        if pills and pills[0][0] != pt: flags.append('pressed-is-not-first-pill (first %r)' % pills[0][0]); C['pressed_not_first'] += 1
        by = pressed[0][1].split()
        C['pressed_by_step' if any(x in ('M4', 'PIECE:TAHOT') for x in by) else 'pressed_not_by_step'] += 1
        if not any(x in ('M4', 'PIECE:TAHOT') for x in by): flags.append('pressed-pill-not-credited-to-STEP: %s' % pressed[0][1])
        att = (d['card']['rec'].get('att') or '')
        C['record_shown_is:' + att.split(' · ')[0].split(' CC ')[0][:60]] += 1
    out.append((d['label'], d['wordNo'], d['he'], line.replace(ZW, '{gap}'), d['credit'] or '', now, ' / '.join(b[0] + ('*' if b[1] else '') for b in blocks), pressed[0][0] if pressed else '', pressed[0][1] if pressed else '', len(pills), d['ms'], ' ; '.join(flags)))
with open(OUT + '/card-checks.tsv', 'w') as f:
    f.write('place\tword_no\thebrew\tline_drawn\tcredit\tcard_names\tblocks\tpressed_pill\tpressed_by\tpills\tms\tflags\n')
    for r in out:
        f.write('\t'.join(str(x).replace('\t', ' ') for x in r) + '\n')
for k, v in sorted(C.items()):
    print(k, v)
ms = sorted(d['ms'] for d in cards)
print('card ms median', ms[len(ms) // 2], 'p95', ms[int(len(ms) * 0.95)], 'max', ms[-1])
