# Writes cards-<source key>.tsv from the cards read on the page (data/cards-all.json, cards-fold.json, cards-test*.json).
# Run: python3 -I write_cards.py <out dir>
import sys, os, json, re, collections
W = sys.argv[1]; ZW = '​'
d = [x for x in json.load(open(os.path.join(W, 'data', 'cards-all.json'))) if 'pageerror' not in x]
fold = [x for x in json.load(open(os.path.join(W, 'data', 'cards-fold.json'))) if 'pageerror' not in x]
def pf(t): return re.sub(r'\.$', '', ' + '.join(x.strip() for x in t.split('/') if x.strip()))
so = lambda t: re.fullmatch(r'(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+)', t.strip()) is not None
def jd(p):
    out = ''
    for i, x in enumerate(p):
        gap = x.strip() == ZW
        out += (' + ' if i and not gap and any(y.strip() != ZW for y in p[:i]) else '') + x
    return out
def signs_off(text):
    p = text.split(' + ')
    return jd(p if all(so(x) for x in p) else [ZW if so(x) else x for x in p])
vis = lambda s: (s or '').replace(ZW, '␣')   # the hidden sign's gap shown as an open box
hdr = ['sample', 'book', 'place (chapter:verse:word)', 'word', 'class', 'source entry', 'as printed on the page', 'who the page names', 'judgment', 'note']
SIGN = [re.compile(r'^(X|×|\+) '), re.compile(r'¿'), re.compile(r'<[^>]*>'), re.compile(r'\[[^\]]*\]'), re.compile(r' ~ ')]
has_sign = lambda t: any(x.search(t) for x in SIGN)
def roles_of(x): return re.sub(r' · \d+ from word lists.*$', '', ' | '.join(x.get('roles', [])))
# ---------- STEP's TAHOT: the pieces and the rows
rows = []; J = collections.Counter()
for x in d:
    if x['sample'] != 'tahot-pieces': continue
    tr = x.get('tahot_translation'); line = x.get('line') or ''; now = re.sub(r'^reading · (STEP at this place|at every place this form stands)', '', x.get('now') or '')
    st = x['stratum']
    if tr is None:
        j = 'unreadable' if re.search(r'bracket', st) else 'belongs to another word part' if 'Aramaic' in st else 'changed the sense'
        note = {'unreadable': "the source's own slip printed as written", 'belongs to another word part': 'TAHOT writes the article first in English and last in Hebrew; the root letters carry «<the>» and the ending carries the noun', 'changed the sense': "the source's square brackets are taken off at a read form of several words"}[j]
        src = '(see pieces-differ-tahot.tsv.gz)'
    else:
        want = signs_off(pf(tr)); src = f"{x.get('tahot_ref')} | {x.get('tahot_hebrew')} | {tr} | {x.get('tahot_tags')}"
        if line != want:
            j = 'changed the sense'; note = f"the source's brackets are taken off: the page prints «{vis(line)}» where the column printed by the page's own rule is «{vis(want)}»"
        elif 'Aramaic ending, English in English order' in st:
            j = 'belongs to another word part'; note = 'the line reads rightly; on the card the root letters carry «<the>» and the ending א carries the noun, because TAHOT writes this English against its own order'
        elif tr.count('[') != tr.count(']') or tr.count('<') != tr.count('>') or 'ofK' in tr:
            j = 'unreadable'; note = "the source's own slip printed as written"
        elif line.replace(ZW, '') == '':
            j = 'says what the source says'; note = 'the line is empty: the word is a sign alone tied by maqaf, and the page hides it at rest'
        else:
            j = 'says what the source says'; note = ''
            if ZW in line: note = 'a sign-only piece is hidden at rest (the gap is kept)'
            if re.search(r'two bracketed signs', st): note = 'a piece of two bracketed signs is printed, where a piece of one bracketed sign is hidden'
            if 'exclamation mark as its own piece' in st: note = 'the emphatic ending prints as «+ !»'
            if 'cut name' in st or 'tail of a cut' in st: note = 'half of a name or number; the card joins the two words where it opens on the pair'
    J[j] += 1
    rows.append(['pieces (PIECE:TAHOT)', x['book'], (x.get('head') or '').replace(' ◂', ''), x.get('word', ''), st, src, vis(line) + ' || card: ' + now, (x.get('credit') or '').split(' | ')[0], j, note])
for x in d:
    if x['sample'] != 'm4': continue
    t = x['row_text']; want = pf(t); pills = x.get('pills', [])
    hit = [p for p in pills if p[0] == want]
    f = x['row_facts']
    src = f"key {x['key']} | {t} | numbers {f.get('n')} letters {f.get('t')} | year slot {x['row_year']} | place tag {x.get('place_tag')}"
    if hit:
        j = 'says what the source says'; note = ''
        yr = hit[0][2].split(' · ')[0]
        if x['row_year'] != 'S_NO_SOURCE_YEAR': note = f"the pill's year is «{yr}» and the record says «wording {x['row_year']}»: not STEP's year"
        printed = hit[0][0]; who = hit[0][1] + ' | ' + hit[0][2]
    else:
        printed = '(no pill)'; who = ''
        if x.get('row_print') == []: j = 'says what the source says'; note = "no pill, by the owner's ruling on rows that render nothing a translator could print"
        elif has_sign(want): j = 'says what the source says'; note = "not offered at rest: the signs switch (off by default) withholds a reading that holds a bracket; the card says «" + (re.search(r"\d+ readings? carrying a source's own sign switched off", ' '.join(x.get('roles', []))) or re.search('', '')).group(0) + "»"
        else: j = 'not judged'; note = 'no pill of this text on the card: ' + roles_of(x)[:160]
    J[j] += 1
    rows.append(['rows (M4)', x['book'], (x.get('head') or '').replace(' ◂', ''), x.get('word', ''), x['stratum'], src, printed, who, j, note])
with open(os.path.join(W, 'cards-stepbible_tahot_aligned_translation.tsv'), 'w', encoding='utf-8') as o:
    o.write('\t'.join(hdr) + '\n')
    for r in rows: o.write('\t'.join(str(c).replace('\t', ' ').replace('\n', ' ') for c in r) + '\n')
print('TAHOT cards', len(rows), dict(J))
# ---------- TBESH
ents = json.load(open(os.path.join(W, 'data', 'tbesh-entries.json')))
letters = lambda s: ''.join(ch for ch in s if 'א' <= ch <= 'ת')
eb = collections.defaultdict(list)
for e in ents:
    for sp in e['heb'].split(','): eb[(letters(sp), re.sub(r'\s+', ' ', e['gloss']).strip())].append(e)
rows = []; J = collections.Counter()
for x in d:
    if x['sample'] != 'tbesh': continue
    t = x['row_text']; cuts = x.get('row_cuts') or []; pills = x.get('pills', [])
    pieces = []; a = 0
    for c in cuts: pieces.append(t[a:c].strip()); a = c + 1
    pieces.append(t[a:].strip())
    if x.get('row_print') is not None: pieces = x['row_print']
    es = eb.get((x['key'], t), [])
    src = '; '.join(f"line {e['line']}: {e['e']} | {e['d'].strip()} | {e['heb']} | {e['morph']} | Gloss «{e['gloss']}»" for e in es[:2]) + f" | year slot {x['row_year']} | place tag {x.get('place_tag')}"
    shown = []; whos = []
    for p in pieces:
        want = pf(p)
        hit = [q for q in pills if q[0] == want]
        shown.append(want if hit else f'(no pill «{want}»)')
        if hit: whos.append(hit[0][1] + ' | ' + hit[0][2].split(' · ')[0])
    note = ''; j = 'says what the source says'
    if x.get('row_print') == []: note = "no pill, by the owner's ruling (a label, or half of a place name)"
    elif not cuts and '/' in t and all('(no pill' not in s for s in shown): j = 'changed the sense'; note = "the source's slash stands between alternatives; the page prints it as the joiner « + », which is TAHOT's sign for parts of one Hebrew word"
    elif any('(no pill' in s for s in shown):
        if has_sign(t): note = "not offered at rest: the signs switch withholds a reading that holds a square bracket"
        elif (x['row_facts'] or {}).get('name') == 1 and 'given as a name' in roles_of(x): j = 'withheld from its own entry'; note = "TBESH's row for the very tag STEP gives this place is withheld as «given as a name by its source»: the place is not on the list of name places, though TBESH files the tag as a place name and the line reads the name"
        else: j = 'not judged'; note = 'no pill of this text on the card: ' + roles_of(x)[:170]
    elif cuts: note = "two pills, the head and the sense, as the owner ruled for the colon; the place's lettered tag chooses the sense row" if ':' in t else 'a pill for each side of the slash, as the owner ruled'
    if '`' in t and j == 'says what the source says': note = "the source's grave accents are printed; neither the source nor the ledger says what they are for"
    if x['row_year'] != 'S_NO_SOURCE_YEAR' and whos: note = (note + '; ' if note else '') + f"the pill's year is «{whos[0].split(' | ')[-1]}»: not TBESH's (the source states none)"
    J[j] += 1
    rows.append(['rows (M19)', x['book'], (x.get('head') or '').replace(' ◂', ''), x.get('word', ''), x['stratum'], src, ' | '.join(shown), ' || '.join(whos), j, note])
for x in fold:
    g = x['press']; pills = x.get('pills', [])
    hit = [p for p in pills if p[0].lower() == g.lower()]
    src = f"{x['tbesh'][0][0]} | {x['tbesh'][0][1]} | {x['tbesh'][0][2]} | Gloss «{g}» | in the store these words stand under: {x['served_under']} | place tag {x.get('place_tag')}"
    if hit: j = 'says what the source says'; note = 'the pill stands, and TBESH is not among the sources the page names for it'; printed = hit[0][0]; who = hit[0][1] + ' | ' + hit[0][2].split(' · ')[0]
    else: j = 'not on the card'; note = "TBESH's gloss has no pill at rest: its words are filed only under a dictionary that rests shut"; printed = '(no pill)'; who = ''
    J[j] += 1
    rows.append(['glosses with no row under TBESH\'s name', x['book'], (x.get('head') or '').replace(' ◂', ''), x.get('word', ''), x['stratum'], src, printed, who, j, note])
with open(os.path.join(W, 'cards-stepbible_tbesh_gloss.tsv'), 'w', encoding='utf-8') as o:
    o.write('\t'.join(hdr) + '\n')
    for r in rows: o.write('\t'.join(str(c).replace('\t', ' ').replace('\n', ' ') for c in r) + '\n')
print('TBESH cards', len(rows), dict(J))
# ---------- MACULA
info = {}
for l in open(os.path.join(W, 'data', 'm3-row-verdicts.jsonl'), encoding='utf-8'):
    r = json.loads(l); info[(r['k'], r['text'])] = r
rows = []; J = collections.Counter()
for x in d:
    if x['sample'] != 'macula': continue
    pills = x.get('pills', [])
    if 'row_text' not in x:
        line = x.get('line') or ''
        src = f"TAHOT at the place: {x.get('tahot_ref')} «{x.get('tahot_translation')}»; MACULA at the place: " + '; '.join(h[:80] for h in x.get('here', []) if h.startswith('here MACULA'))
        j = 'says what the source says'; note = x['stratum']
        J[j] += 1
        rows.append(['the line (PIECE:MACULA)' if 'MACULA' in (x.get('credit') or '') else 'place', x['book'], (x.get('head') or '').replace(' ◂', ''), x.get('word', ''), x['stratum'], src, vis(line), (x.get('credit') or '').split(' | ')[0], j, note]); continue
    t = x['row_text']
    wants = x['row_print'] if x.get('row_print') is not None else [pf(t)]
    i = info.get((x['key'], t)) or {}
    src = f"key {x['key']} | english «{t}» | first row {(i.get('ids') or [''])[0]} at {(i.get('info') or [''])[0]}, number {(i.get('info') or ['', ''])[1]}, lemma {(i.get('info') or ['', '', ''])[2]}, gloss column «{(i.get('info') or [''] * 6)[5]}» | year slot {x['row_year']} | place tag {x.get('place_tag')}"
    hit = [p for p in pills for w in wants if p[0] == w]
    j = 'says what the source says'; note = ''
    if hit:
        printed = hit[0][0]; who = hit[0][1] + ' | ' + hit[0][2].split(' · ')[0]
        if '~' in t: note = 'the tilde is printed as the source writes it; no key of the source says what it is for'
        if x['row_year'] != '2022': note = f"the pill's year is «{who.split(' | ')[-1]}» and the record says «wording {x['row_year']}»: not MACULA's (its English is of 2022)"
        if t == '(happy)': j = 'belongs to another place'; note = "MACULA's English for the relative word at Psalm 10:6 alone, shown on the card of «just as» at Micah 3:3"
        if x.get('row_print') is not None: note = "the number in round brackets is left off the pill, by the owner's ruling"
    else:
        printed = '(no pill)'; who = ''
        if has_sign(t): note = "not offered at rest: the signs switch withholds a reading that holds « ~ »"
        else: j = 'not judged'; note = 'no pill of this text on the card: ' + roles_of(x)[:160]
    J[j] += 1
    rows.append(['rows (M3)', x['book'], (x.get('head') or '').replace(' ◂', ''), x.get('word', ''), x['stratum'], src, printed, who, j, note])
with open(os.path.join(W, 'cards-macula_hebrew_cherith_surface_english_2022.tsv'), 'w', encoding='utf-8') as o:
    o.write('\t'.join(hdr) + '\n')
    for r in rows: o.write('\t'.join(str(c).replace('\t', ' ').replace('\n', ' ') for c in r) + '\n')
print('MACULA cards', len(rows), dict(J))
