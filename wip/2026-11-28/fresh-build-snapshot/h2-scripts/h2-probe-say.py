# Scratch (builder H2): print h2-probe.mjs's output short, one line per state read
import sys, json
txt = sys.stdin.read(); dec = json.JSONDecoder(); i = 0
while i < len(txt):
    j = txt.find('{', i)
    if j < 0: break
    try: o, k = dec.raw_decode(txt, j)
    except Exception: i = j + 1; continue
    i = k
    if 'job' not in o: continue
    print('##', json.dumps(o['job'])[:200])
    if o.get('evalBefore') is not None: print('  eval', json.dumps(o['evalBefore'], ensure_ascii=False)[:700])
    for key in ('open', 'cell', 'pressed'):
        if key in o:
            x = o[key]
            print(' ', key, '| line', x['line'], '| first', x['first'], '| pressed', x['pressed'], '| n', x['n'], '| cells', x['cells'])
            for f in ('att', 'say', 'roles', 'notes'):
                if x.get(f): print('     ', f, x[f])
    if o.get('errors'): print('  errors', o['errors'])
