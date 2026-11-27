# Lay the places read by hand in one table: the source's markup, what the page draws on a first visit,
# what it draws with the scribes' marks shown, what a press shows, and the reading of it.
import json, csv, re, collections
targets=json.load(open('data/read-by-hand-targets.json'))
probed={(r['cls'],r['book'],r['ref'],r['e']):r for r in json.load(open('data/read-by-hand-page.json'))}
stepk={(r['book'],r['ref'],r['carrier']):r for r in csv.DictReader(open('data/kq-against-step.tsv'),delimiter='\t')}
clean=lambda s: re.sub(r'\s+',' ',str(s or '')).strip()
out=[]; tally=collections.Counter()
for t in targets:
    cls=t['cls']; key=(cls,t['book'],t['ref'],t.get('e')); p=probed.get(key)
    row=dict(cls=cls,book=t['book'],ref=t['ref'],word=t.get('word',''),entry=(t['e']+1) if t.get('e') is not None else '',hebrew=t.get('s',t.get('after_word','')),source=clean(t.get('raw',''))[:170])
    if cls.startswith("the edition's note"):
        row.update(rest='the word is drawn; nothing marks a note',on='the same',press='not pressed',verdict='ABSENT: the edition writes «'+clean(t['note'])+'» here; the restore lifts it out and no part of the zone, the page or the card carries it'); out.append(row); tally[(cls,'ABSENT')]+=1; continue
    if not p:
        row.update(rest='(not probed in the browser; drawn as the census of every entry records)',on='',press='not pressed',verdict='not read in the browser'); out.append(row); tally[(cls,'not probed')]+=1; continue
    rest=p['rest']; on=p['on']; pr=p['press']; ones=[pr['one']] if pr.get('one') else (pr.get('regions') or [])
    hidden=rest.get('display')=='none'
    lm='; '.join(f"letter «{x['text']}» drawn {x['cls'].split()[1].replace('lm-','')} at {x['size']} beside {x['word_size']}"+(f", raised {x['valign']}" if x['valign'] not in('baseline','') else '') for x in rest.get('lm',[]))
    after={'" "':'a space, then the next cell'}.get(rest.get('gapAfter'),'the next word in the same cell' if str(rest.get('gapAfter')).startswith('<wb') else 'the end of its cell')
    backs=[x[0] for x in rest.get('wr',[]) if 'backs-en' in x[1]]
    r_rest=('not drawn (display none)' if hidden else f"drawn «{rest.get('text')}»")+(f"; after it: {after}" if '־' in (rest.get('text') or '') and not hidden else '')+(f"; in a joined cell ({'sign cell' if 'apart' in rest['inJoin'] else 'span cell'})" if rest.get('inJoin') else '')+(f"; {lm}" if lm else '')+(f"; line «{clean(rest.get('line'))}» [{rest.get('credit')}]" if clean(rest.get('line')) else ('; no line' if not rest.get('mark') and not hidden else ''))+(f"; line marked on {backs}" if backs else '')+(f"; hover title «{rest.get('title')}»" if rest.get('title') else '')
    r_on=('still not drawn' if on.get('display')=='none' else 'drawn as a tile' if rest.get('mark') and hidden else 'the same')
    def one(o):
        s=' / '.join(o.get('roles') or [])
        k=' / '.join(x[:140] for x in (o.get('keys') or []))
        pl=', '.join((o.get('pills') or [])[:3])
        return (f"[on {o['on']}] " if 'on' in o else '')+(f"says: {s}" if s else 'no line about the mark')+(f" · {k}" if k else '')+(f" · first readings: {pl}" if pl else '')
    r_press=' || '.join(one(o) for o in ones) if ones else 'no card'
    roles=' '.join(' '.join(o.get('roles') or [])+' '+' '.join(o.get('keys') or []) for o in ones)
    v=''
    if cls=='legarmeh': v='FAULT: the edition writes a legarmeh here (the bar in <b>, kept with the word before it); the page names it a paseq standing between two words. Hidden until the marks switch is pressed.' if 'a paseq' in roles else 'check'
    elif cls=='paseq': v='as the mark asks once the switch is pressed; not drawn on a first visit (the owner\'s standing ruling)'
    elif cls=='paseq written inside a read form': v='the mark\'s own block is never drawn; the stroke is drawn inside the brackets of the read form when the marks are shown (all 16 such places, page census)'
    elif cls in('sof pasuq',): v='not drawn on a first visit (ruled); a tile once the switch is pressed; the card says what it is'
    elif cls.startswith('petuchah') or cls.startswith('setumah'): v='not drawn on a first visit (ruled); a tile once the switch is pressed; the card says what the mark asks (a new line; the same line) and the page itself draws neither'+('; this one stands inside a running verse, so at rest nothing shows the break' if 'inside' in cls else '')
    elif cls.startswith('song spacing'): v='drawn as the mark asks: a ruled space in the line; the card says what it is'
    elif cls=='inverted nun': v='drawn at rest in its own tile; the card says what it is and whether it opens or closes a pair, stands in a run, or stands alone: right at this place'
    elif cls=='empty verse': v='drawn at rest as the dash and a rule; the card says the edition prints a dash here (the dash is in the files the edition makes for its provider; the edition itself has no verse and no dash)'
    elif cls=='maqaf': v='the stroke is printed in place; '+('the word after it stands apart, after a space (the owner\'s ruling of 20 November 2026)' if not rest.get('inJoin') else 'the word after it is drawn in the same cell')+'; the card says it joins'
    elif cls=='gray maqaf (implicit)': v='FAULT: the edition draws this maqaf gray because it added it where the manuscripts write none; the page draws it as any maqaf, and the card says the source writes it «spaced out from the words on either side», which the source does not'
    elif cls.startswith('flagged implicit maqaf'): v='FAULT: this word\'s own maqaf is an ordinary one in the source; the card says of it what it says of a gray maqaf (the flag of the whole compound was copied to every piece)'
    elif cls.startswith('trivial ketiv/qere'): v='as the edition does: one pointed form, nothing set apart on the line; the card says the source marks it'
    elif cls.startswith('flagged trivial'): v='FAULT: the source does not mark this word; the card says «The source marks this word as a ketiv-qere of spelling» (the flag of the whole compound was copied to every piece)'
    elif cls in('ketiv and qere','ketiv and qere, the read form first'):
        v='both forms printed as the source prints them; the line is marked on the read form and the card says which is written and which is read'
    elif cls.startswith('ketiv and qere: one word'):
        kb=[x for x in rest.get('wr',[]) if 'backs-en' in x[1] and not x[0].startswith('[') and not re.search('[ְ-ּ]',x[0])]
        v=('FAULT: the English is STEP\'s reading of the read form; the page marks the written form as the half it reads and the card offers it as the written form\'s reading' if kb else 'both forms printed; the line is marked on the read words')
    elif cls.startswith('ketiv: written'):
        s=stepk.get((t['book'],t['ref'],t['s']),{})
        v=f"FAULT: a word the tradition does not read wears the line «{clean(rest.get('line'))}»; STEP reads nothing here and gives the written word as: {s.get('step_k','(see STEP row)')}; the card does not say the word is not read"
    elif cls.startswith('qere: read'): v='printed in its square brackets with a line; the card says «qere — read» and does not say that nothing is written here'
    elif cls in('large letter','small letter','suspended letter'): v='drawn as the mark asks, on the right letter; the card names the letter'
    elif cls=='dotted letters': v=('the dots are printed and the letters tinted; the card says «a dot above» where the source sets a dot above and a dot below each letter' if 'ׅ' in t['s'] else 'the dots are printed and the letters tinted; the card names the letters')
    elif cls in('meteg','rafe','two vowels on one letter (joiner)'): v='printed in place, character for character; the card says nothing of it'
    elif cls.startswith('our text spells'):
        ld=t.get('ld') or {}; LET=lambda s: ''.join(c for c in str(s) if 'א'<=c<='ת')
        v='ours, not the edition\'s: a hover title only'+('; the title says Leningrad differs and shows the same letters on both sides' if LET(ld.get('mam'))==LET(ld.get('other')) else '')
    row.update(rest=r_rest,on=r_on,press=r_press,verdict=v); out.append(row); tally[(cls,'FAULT' if v.startswith('FAULT') else 'read')]+=1
cols=['cls','book','ref','word','entry','hebrew','source','rest','on','press','verdict']
with open('read-by-hand.tsv','w') as f:
    f.write('class\tbook\tref\tword\tentry\thebrew\tthe_source_markup\tthe_page_on_a_first_visit\twith_the_marks_shown\ta_press_shows\treading\n')
    for r in out: f.write('\t'.join(clean(r.get(c,'')) for c in cols)+'\n')
byc=collections.defaultdict(collections.Counter)
for (c,k),v in tally.items(): byc[c][k]+=v
for c in sorted(byc): print(c, dict(byc[c]))
print(len(out))
