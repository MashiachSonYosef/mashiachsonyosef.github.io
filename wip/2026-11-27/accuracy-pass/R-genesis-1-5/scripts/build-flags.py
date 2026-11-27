#!/usr/bin/env python3
# Read-only on the tree: builds flags.tsv from what the page drew and the cards opened (cards-0-137.jsonl), one row per flag:
# place, word, line, credit, kind, why, cause, recurs. Prints the count of rows by cause.
import json, sys, re, collections
OUT = sys.argv[1]
ZW = '​'
cards = [json.loads(l) for l in open(OUT + '/cards-0-137.jsonl')]
rows = []
def add(d, kind, why, cause, recurs):
    rows.append(('%s w%d' % (d['label'], d['wordNo']), d['he'], (d['line'] or '').replace(ZW, '{gap}'), d['credit'] or '', kind, why, cause, recurs))
sign_only = re.compile(r'^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+)$')
C1 = 'STEP own bytes (TAHOT Gen.4.25#15 "God of", #16 "spring")'
C2 = 'zone.html 12858: under signs off a reading that is a sign is offered only where it is the reading the card opened on; a block of a word of several pieces opens on the first reading left'
C3 = 'zone.html sortPool 9592-9614: the place\'s own reading leads only where the block is the whole word; a block of a word of several pieces is sorted oldest first and STEP (no source year) falls last'
C4 = 'store rows of the UBS dictionary (M18) and the SDBH (M17) carry every Strong number of the lemma (facts n), so the entry gate (tools/entry-gate-v1.mjs, THIS ENTRY) keeps them at each of the lemma\'s words'
C5 = 'zone.html spanJoin 3802-3806: every "/" in a reading prints as " + " (STEP\'s piece divider), also in a source whose "/" is prose'
C6 = 'zone.html 13672-13678: under signs off a word of a maqaf run whose whole reading is a sign is drawn as a gap beside the other word'
C7 = 'zone.html signOnly 3687: the test knows one sign, not a run of two ("<in> <the>")'
C8 = 'the source\'s own bytes, cut at commas by the declared print steps'
C9 = 'rows of BDB unabridged (M46) that are not readings: words of another language, grammar labels, editorial phrases'
C10 = 'entry gate: a row of the word\'s own entry stands whatever its points, so STEP\'s row for another form of the word (with a suffix) stands on this form\'s card'
homonym_marks = {('את', 'mattock'): 'the mattock (H855) and "with" (H854) on the object marker', ('כן', 'mosquito'): 'gnat (H3654) and pedestal (H3653) on "so"', ('כן', 'pedestal'): 'gnat (H3654) and pedestal (H3653) on "so"',
                 ('שת', 'buttocks'): 'buttocks, foundation, six on the name Seth', ('חם', 'father-in-law'): 'father-in-law, hot on the name Ham', ('הבל', 'breeze'): 'breeze, futility on the name Abel',
                 ('קין', 'spearhead'): 'spearhead on the name Cain', ('עדן', 'delightful things'): 'delight on the name Eden', ('אף', 'nostrils'): 'nose on the particle "indeed"', ('אין', 'from where?'): '"from where?" (H370) on "there is not"',
                 ('חוה', 'settlement'): 'tent village on the name Eve', ('אדמה', 'Adamah'): 'the town Adamah on "ground"', ('נוד', 'wandering'): 'wandering on the name Nod', ('שהם', 'Shoham'): 'the man Shoham on "onyx"',
                 ('עזר', 'Ezer'): 'the man Ezer on "helper"', ('בד', 'linen'): 'linen, pole on "alone"', ('אנוש', 'human being'): 'human being on the name Enosh', ('שם', 'reputation'): 'the noun "name" on the name Shem'}
bdb_not_readings = {
 'אדם': ['Mensch'], 'אות': ['e.g'], 'אין': ['verbal'], 'אלהים': ['Plural intensive', 'the', 'true', 'Yahweh is'], 'אף': ['à fortiori, the more so'],
 'אשר': ['footstep', 'mark', 'place', 'ašru', 'demonstrative', 'seems preferable', 'dispensed with', 'following', 'that (belongs, belong', 'belonged) to', 'approximating in usage to', 'quod'],
 'את': ['de chez', 'persons'], 'בד': ['in a state of', 'à part'], 'בקר': ['Morgen, morgen'], 'גדול': ['grand jour', 'hoch am Tage'], 'גם': ['correlativum'],
 'הוא': ['she, used also', 'verb', 'follows', 'anticipates', 'is'], 'הן': ['sive ... sive, whether ... or'], 'חמש': ['ten'], 'יום': ['are combined'], 'ילד': ['less often'],
 'כי': ['burning', 'branding', 'dass', 'Rare otherwise', 'Of time', 'different', 'same', 'limiting'], 'כל': ['very anomalously'], 'כן': ['dicendi'], 'לא': ['verb', 'with not'],
 'מה': ['interrogative'], 'מי': ['various'], 'מן': ['and', 'is not always clearly defined)', 'Partitively', 'time', 'terminus a quo', 'c: ex in eximius, egregius', 'infin', 'causal', 'chiefly late', 'space', 'by the bowmen'],
 'מנחה': ['exilic or post-exilic'], 'מראה': ['a'], 'עד': ['time', 'degree', 'space', 'preposition', 'conjunction', 'without'], 'עוד': ['adverb', 'in the continuance of ..'],
 'על': ['inclining', 'motion', 'dative', 'similar in meaning, but less frequent', 'Compounds', 'with reference to persons'], 'רעה': ['pascere'], 'שבע': ['years'], 'שוב': ['and', 'do'],
 'שלש': ['or'], 'שם': ['note here'], 'שמנה': ['other numerals'], 'שמר': ['so perhaps also'], 'תאנה': ['ficus carica'], 'תחת': ['anstatt dass', 'compounds']}
n_multi = 0
for d in cards:
    line = d['line'] or ''
    now = (d['now'][1] or '').split(' + ')
    blocks = d['blocks']; bi = next((i for i, b in enumerate(blocks) if b[1]), None)
    blk = blocks[bi][0] if bi is not None else None
    pills = d['card']['pills']; pi = next((k for k, p in enumerate(pills) if p[4]), None)
    # the line
    if d['label'] == '4:25' and d['wordNo'] in (15, 16): add(d, 'line cut in the wrong place', 'STEP writes "God of" + "spring" for God + offspring', C1, '6 places in the 39 books (offspring-cut.tsv)')
    if line.replace(ZW, '').strip() == '': add(d, 'word with nothing drawn under it', 'the object marker joined by a maqaf is drawn as a gap; alone it prints <obj.> (3 places here)', C6, '6,593 words in the 39 books')
    if any(re.fullmatch(r'\s*<[^>]*>\s+<[^>]*>\s*', pc) for pc in line.split(' + ')): add(d, 'line that is only signs in one piece', 'two signs in one piece are drawn while one sign alone is left undrawn', C7, '205 words in the 39 books')
    # the card against the line
    if bi is not None and pi is not None and len(now) == len(blocks) and pills[pi][0] != now[bi].strip():
        add(d, 'card contradicts the line', 'STEP reads %s for the block %s; the card opens with «%s» pressed (%s)' % (now[bi].strip(), blk, pills[pi][0], pills[pi][3].split(' · ')[-1][:45]), C2, '4,066 words in the 39 books (hidden-core-pieces.tsv)')
    elif pi is not None and pi > 0 and len(blocks) > 1:
        n_multi += 1
        if pi >= 10: add(d, 'card buries the reading', 'the pressed reading «%s» stands %d of %d; the first pill is «%s»' % (pills[pi][0], pi + 1, len(pills), pills[0][0]), C3, 'the pressed pill is not first at 661 of the 866 words of several pieces here; 145,055 such words in the 39 books')
    # readings of another word
    texts = {p[0] for p in pills}
    for (b, mark), what in homonym_marks.items():
        ent = (d['card']['ds'] or {}).get('entry', '') or ''
        if blk == b and mark in texts and not (b == 'אנוש' and not ent.startswith('H583')) and not (b == 'שם' and not ent.startswith('H8035')):
            add(d, 'reading of another word on the card', what, C4, 'UBS 6,856 and SDBH 3,786 store rows name more than one number; 549 of the 1,815 cards here carry one or more such pills (upper bound)')
            break
    # the slash printed as a plus
    sl = [p[0] for p in pills if 'UBS' in p[3] and ' + ' in p[0]]
    if sl: add(d, 'reading printed otherwise than its source', 'UBS writes "/" (and/or, him/her, Canaan/Israel) and the pill prints " + ": «%s»' % sl[0][:80], C5, '259 UBS rows, 47 TBESH rows and 4 others in the store hold a slash between letters')
    # another form's reading with a suffix
    sf = [p[0] for p in pills if ('Amalgamated' in p[3]) and re.search(r' \+ (my|me|her|his|him|your|you|their|them|our|us)$', p[0]) and not p[4]]
    if sf: add(d, 'reading of another form on the card', 'STEP\'s reading of another form of the word stands as a pill: «%s»' % ' | '.join(sf[:3]), C10, '44 distinct pills on 120 cards here')
    # rows of BDB unabridged that are not readings
    nb = [p[0] for p in pills if 'Unabridged' in p[3] and p[0] in bdb_not_readings.get(blk, [])]
    if nb: add(d, 'pill that is not a reading', 'BDB unabridged: ' + ' | '.join(nb[:8]), C9, 'see bdb-unabridged-pills.tsv (483 distinct pills on 856 cards here)')
    # the source's own broken pieces
    br = [p[0] for p in pills if (p[0].count('(') != p[0].count(')') or re.search(r'\(\s+\)', p[0])) and ('Strong' in p[3])]
    if br: add(d, 'pill cut in the wrong place', 'Strong\'s: ' + ' | '.join(x[:40] for x in br[:5]), C8, 'store: 32 + 187 Strong\'s rows with a bracket unpaired, 6 with an empty bracket')
with open(OUT + '/flags.tsv', 'w') as f:
    f.write('place\tword\tline\tcredit\tkind\twhy\tcause\trecurs\n')
    for r in rows: f.write('\t'.join(str(x).replace('\t', ' ').replace('\n', ' ') for x in r) + '\n')
print('rows', len(rows), 'words flagged', len({r[0] for r in rows}))
for k, v in collections.Counter(r[4] for r in rows).most_common(): print(v, k)
print('multi-block cards with the pressed pill not first:', n_multi)
