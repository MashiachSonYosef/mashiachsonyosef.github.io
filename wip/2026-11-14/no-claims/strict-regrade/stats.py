import json, sys, csv, random, math, collections
base = sys.argv[1]
R = [json.loads(l) for l in open(base + '/tally/finals.jsonl')]
DS = {(r['id'], int(r['n'])): r['dkind'] for r in csv.DictReader(open(base + '/tally/dsplit.tsv'), delimiter='\t')}
for r in R:
    r['dkind'] = DS.get((r['id'], r['n'])) if r['final'] == 'D' else None
    assert (r['final'] == 'D') == (r['dkind'] is not None), r
LV = 'ABCDE'
out = {}
def pct(x): return f"{100*x:.1f}%"

# ---------- agreement ----------
N = len(R)
agree = sum(r['first'] == r['second'] for r in R)
cm = collections.Counter((r['first'], r['second']) for r in R)
m1 = collections.Counter(r['first'] for r in R); m2 = collections.Counter(r['second'] for r in R)
po = agree / N; pe = sum(m1[l] * m2[l] for l in LV) / N**2
kappa = (po - pe) / (1 - pe)
# linear weighted kappa (ordinal)
idx = {l: i for i, l in enumerate(LV)}
def wk(pairs, w):
    n = len(pairs); a = collections.Counter(p[0] for p in pairs); b = collections.Counter(p[1] for p in pairs)
    o = sum(w(idx[x], idx[y]) for x, y in pairs) / n
    e = sum(a[x] * b[y] * w(idx[x], idx[y]) for x in LV for y in LV) / n**2
    return 1 - o / e
lin = wk([(r['first'], r['second']) for r in R], lambda i, j: abs(i - j) / 4)
# bootstrap kappa by word
words = sorted(set(r['id'] for r in R))
byw = collections.defaultdict(list)
for r in R: byw[r['id']].append(r)
random.seed(51)
def kap(rows):
    n = len(rows); a = collections.Counter(r['first'] for r in rows); b = collections.Counter(r['second'] for r in rows)
    po = sum(r['first'] == r['second'] for r in rows) / n; pe = sum(a[l] * b[l] for l in LV) / n**2
    return (po - pe) / (1 - pe)
B = 5000
ks = []; pos = []
for _ in range(B):
    rows = [x for w in random.choices(words, k=len(words)) for x in byw[w]]
    ks.append(kap(rows)); pos.append(sum(r['first'] == r['second'] for r in rows) / len(rows))
ks.sort(); pos.sort()
out['agreement'] = dict(n=N, agree=agree, po=po, po_ci=(pos[int(.025*B)], pos[int(.975*B)]), pe=pe, kappa=kappa,
                        kappa_ci=(ks[int(.025*B)], ks[int(.975*B)]), weighted_kappa_linear=lin)
per_batch = {}
for b in ['b1', 'b2', 'b3', 'b4']:
    rows = [r for r in R if r['batch'] == b]
    per_batch[b] = dict(n=len(rows), agree=sum(r['first'] == r['second'] for r in rows), kappa=kap(rows))
out['agreement_by_batch'] = per_batch
out['confusion'] = {f + s: cm[(f, s)] for f in LV for s in LV}
out['marg_first'] = dict(m1); out['marg_second'] = dict(m2)
# boundary agreement: do they agree on A vs not, A+B vs not, A+B+C vs not
def bnd(level, k): return idx[level] <= k
out['boundary_agree'] = {name: sum(bnd(r['first'], k) == bnd(r['second'], k) for r in R) for k, name in [(0, 'A|BCDE'), (1, 'AB|CDE'), (2, 'ABC|DE'), (3, 'ABCD|E')]}

# ---------- shares ----------
def shares(rows, weighted=False, key='final'):
    tot = sum((r['weight'] if weighted else 1) for r in rows)
    c = collections.Counter()
    for r in rows: c[r[key]] += (r['weight'] if weighted else 1)
    s = {l: c[l] / tot for l in LV}
    s['A+B'] = s['A'] + s['B']; s['A+B+C'] = s['A+B'] + s['C']; s['A+B+C+D'] = s['A+B+C'] + s['D']
    dl = sum((r['weight'] if weighted else 1) for r in rows if r['dkind'] == 'letters') / tot
    s['D_letters'] = dl; s['D_none'] = s['D'] - dl
    s['fresh_right_or_possible'] = s['A+B+C'] + dl
    return s, tot
KEYS = ['A', 'B', 'C', 'D', 'E', 'A+B', 'A+B+C', 'A+B+C+D', 'D_letters', 'D_none', 'fresh_right_or_possible']
def boot(rows, weighted, B=10000, seed=7):
    ws = sorted(set(r['id'] for r in rows)); g = collections.defaultdict(list)
    for r in rows: g[r['id']].append(r)
    rnd = random.Random(seed); acc = {k: [] for k in KEYS}
    for _ in range(B):
        rr = [x for w in rnd.choices(ws, k=len(ws)) for x in g[w]]
        s, _t = shares(rr, weighted)
        for k in KEYS: acc[k].append(s[k])
    ci = {}
    for k in KEYS:
        v = sorted(acc[k]); ci[k] = (v[int(.025*B)], v[int(.975*B) - 1])
    return ci
def wilson(p, n, z=1.96):
    d = 1 + z*z/n; c = (p + z*z/(2*n)) / d; h = z*math.sqrt(p*(1-p)/n + z*z/(4*n*n)) / d
    return (c - h, c + h)
def table(rows, weighted, B=10000):
    s, tot = shares(rows, weighted); ci = boot(rows, weighted, B)
    return dict(n_pills=len(rows), n_words=len(set(r['id'] for r in rows)), weight_total=tot,
                share={k: s[k] for k in KEYS}, ci={k: ci[k] for k in KEYS},
                wilson={k: wilson(s[k], len(rows)) for k in KEYS} if not weighted else None)
out['overall_unweighted'] = table(R, False)
out['overall_weighted'] = table(R, True)
out['counts'] = dict(collections.Counter(r['final'] for r in R))
out['counts_weighted'] = {l: sum(r['weight'] for r in R if r['final'] == l) for l in LV}
packs = ['cards-verbs', 'cards-nouns-and-describing-words', 'cards-names-and-small-words']
out['by_pack_unweighted'] = {p: table([r for r in R if r['pack'] == p], False, 4000) for p in packs}
out['by_pack_weighted'] = {p: table([r for r in R if r['pack'] == p], True, 4000) for p in packs}
srcs = collections.Counter(r['first_source'] for r in R)
out['by_source'] = {}
for sc, n in srcs.most_common():
    rows = [r for r in R if r['first_source'] == sc]
    t = table(rows, False, 3000); tw = shares(rows, True)[0]
    out['by_source'][sc] = dict(name=rows[0]['first_source_name'], n=n, n_words=t['n_words'],
                                counts={l: sum(r['final'] == l for r in rows) for l in LV},
                                share=t['share'], ci=t['ci'], share_weighted=tw)
# per-card mean (each card counts once) and multi-pill cards only
def card_means(rows):
    g = collections.defaultdict(list)
    for r in rows: g[r['id']].append(r)
    m = {k: 0.0 for k in KEYS}
    for w, rr in g.items():
        s, _ = shares(rr, False)
        for k in KEYS: m[k] += s[k] / len(g)
    return m, len(g)
out['per_card_mean_all'] = card_means(R)
multi = [r for r in R if r['pills_on_card'] > 1]
out['multi_pill_cards_unweighted'] = table(multi, False, 4000)
out['multi_pill_cards_weighted'] = table(multi, True, 4000)
out['per_card_mean_multi'] = card_means(multi)
# verbs: per-card means and pooled; excluding pill 1
verbs = [r for r in R if r['pack'] == 'cards-verbs']
out['verbs_card_mean'] = card_means(verbs)
out['verbs_multi_card_mean'] = card_means([r for r in verbs if r['pills_on_card'] > 1])
out['excl_line_pill_unweighted'] = shares([r for r in R if not r['sources'].startswith('S1,S2') and r['n'] != 1], False)[0]
out['excl_line_pill_weighted'] = shares([r for r in R if r['n'] != 1], True)[0]
# sensitivity: judge 1 alone, judge 2 alone, stricter-of-two, lenient-of-two
sens = {}
for name, f in [('first_judge', lambda r: r['first']), ('second_judge', lambda r: r['second']),
                ('lenient_of_two', lambda r: min(r['first'], r['second'])), ('strict_of_two', lambda r: max(r['first'], r['second']))]:
    for r in R: r['_alt'] = f(r)
    su = shares(R, False, '_alt')[0]; sw = shares(R, True, '_alt')[0]
    sens[name] = dict(unweighted={k: su[k] for k in ['A', 'A+B', 'A+B+C', 'A+B+C+D']}, weighted={k: sw[k] for k in ['A', 'A+B', 'A+B+C', 'A+B+C+D']})
out['sensitivity'] = sens
# per word table
pw = []
for w in sorted(set(r['id'] for r in R), key=lambda x: (x[:2], x)):
    rr = [r for r in R if r['id'] == w]; c = collections.Counter(r['final'] for r in rr)
    pw.append(dict(id=w, batch=rr[0]['batch'], ref=f"{rr[0]['book']} {rr[0]['ref']}", grammar=rr[0]['step_grammar'], on_card=rr[0]['pills_on_card'],
                   sampled=rr[0]['pills_sampled'], counts={l: c[l] for l in LV}, line=rr[0]['final'] if rr[0]['n'] == 1 else None,
                   disagreements=sum(r['first'] != r['second'] for r in rr)))
out['per_word'] = pw
out['sample'] = dict(words=len(set(r['id'] for r in R)), pills_on_cards=sum(x['on_card'] for x in pw), pills_sampled=len(R),
                     single_pill_words=sum(x['on_card'] == 1 for x in pw), capped_words=sum(x['on_card'] > x['sampled'] for x in pw),
                     words_by_pack=dict(collections.Counter(r['pack'] for r in R if r['n'] == 1)))
json.dump(out, open(base + '/tally/stats.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps({k: out[k] for k in ['agreement', 'agreement_by_batch', 'boundary_agree', 'counts', 'sample']}, indent=1))
for k in ['overall_unweighted', 'overall_weighted', 'multi_pill_cards_unweighted', 'multi_pill_cards_weighted']:
    t = out[k]; print('\n' + k, t['n_pills'], t['n_words'])
    for kk in KEYS: print(f"  {kk:<24} {pct(t['share'][kk]):>7}  [{pct(t['ci'][kk][0])}, {pct(t['ci'][kk][1])}]" + (f"  wilson [{pct(t['wilson'][kk][0])}, {pct(t['wilson'][kk][1])}]" if t['wilson'] else ''))
