# What each printed reading looks like, by machine: every reading of every served row of the four sources.
import json,re,collections,sys
SRC={'M9':'openscriptures_strongs','M14':'wikisource_strongs_explicit_forms','M5':'openscriptures_bdb_1906','M46':'unabridged_bdb_1906'}
CONN=r'(also|hence|or|and|but|i\.e\.|e\.g\.|especially|specifically|figuratively|by implication|by extension|by analogy|generally|usually|properly|concretely|abstractly|causatively|transitively|intransitively|reflexively|collectively|literally|subjectively|objectively|then|thus|whence|thence|likewise|as|with|of|in|from|for|to wit|namely|viz)\b'
GRAM=set('perfect imperfect infinitive imperative participle adverb adverbial verbal literal figurative figuratively absolute construct plural singular masculine feminine suffix noun verb adjective preposition conjunction interjection qal niphal piel pual hiphil hophal hithpael passive active dual collective substantive intransitive transitive'.split())
def bal(t):
    st=[]
    for ch in t:
        if ch in '([': st.append(ch)
        elif ch in ')]':
            if st and ((st[-1]=='(' and ch==')') or (st[-1]=='[' and ch==']')): st.pop()
            else: return False
    return not st
allstats={}
for m,key in SRC.items():
    c=collections.Counter(); ex=collections.defaultdict(list); lens=[]
    longest=[]
    for line in open(f'rows-{m}.jsonl'):
        r=json.loads(line)
        for rd in r['readings']:
            c['readings']+=1; L=len(rd); lens.append(L)
            longest.append((L,r['k'],rd))
            def hit(name):
                c[name]+=1
                if len(ex[name])<400: ex[name].append((r['k'],rd,r['route'] if r['route']!=rd else ''))
            if not bal(rd): hit('brackets do not balance in the reading')
            if not bal(rd) and bal(r['route']): hit('the cut left a bracket open (the row balances, the reading does not)')
            if re.match(CONN,rd) and (r['cuts'] or r['cut']): hit('a cut piece opens with a connector or label word')
            if re.match(r'(also|hence|or|and|but|i\.e\.|then|thus|whence|likewise)\b',rd): hit('opens with also/hence/or/and/but/i.e./then/thus')
            if rd.lower().strip(' .!?') in GRAM: hit('the whole reading is a grammar word')
            if re.search(r'\b(of|the|a|an|to|or|and|with|in|by|for|=|as)$',rd.strip()): hit('ends on a small word (dangling)')
            if re.search(r'\b(Compare|Comp\.|See|see also|compare|cf\.|q\.v\.|id\.|ib\.)',rd): hit('holds a cross-reference word (See/Compare/cf./q.v./id.)')
            if re.search(r'\bi\.e\.|\be\.g\.|\betc\.|\bviz\.|\bfig\.|\blit\.|\bprob\.|\bperh\.|\besp\.|\bspec\.',rd): hit('holds an abbreviation (i.e., e.g., etc., fig., lit., prob.)')
            if re.match(r'^(X|×|\+) ',rd) or re.match(r'^\(\s*(X|×|\+)\s*\)',rd): hit("opens with Strong's sign (X, ×, +): sorted last, not offered while signs rest off")
            if re.search(r'\[[^\]]*\]',rd): hit('holds a square-bracket group: counted a source sign by the page, not offered while signs rest off')
            if re.search(r'<[^>]*>|¿| ~ ',rd): hit('holds another of the page\'s sign patterns (< >, ¿, ~)')
            if '/' in rd: hit('holds a slash: the page prints it as « + »')
            if re.search(r'\(-|-\)|\w\(-\w|\(\w+-\)',rd): hit("holds Strong's condensed form (a bracketed word-end or word-start with a hyphen)")
            if re.search(r'\([^()]*\)',rd) : hit('holds a round-bracket group')
            if re.search(r'[֐-׿]',rd): hit('holds Hebrew letters')
            if re.search(r'\d',rd): hit('holds a digit')
            if re.search(r'^\d+\.|^\(?[a-z]\)\s|^[a-z]\.\s',rd): hit('opens with a sense number or letter')
            if rd.endswith('.'): hit('ends with a full stop (not drawn on the pill)')
            if rd.endswith(','): hit('ends with a comma')
            if rd.endswith(';') or rd.endswith(':'): hit('ends with ; or :')
            if L==1: hit('one character')
            if L<=2 and L>1: hit('two characters')
            if L>120: hit('longer than 120 characters')
            if L>60: c['longer than 60 characters']+=1
            if re.search(r'  ',rd): hit('holds a double space')
            if re.search(r' [,;.:)]',rd): hit('a space stands before , ; . : or )')
            if re.search(r'\( ',rd): hit('a space stands after (')
            if re.search(r'[a-z][A-Z]',rd): hit('a capital stands against a small letter (two words run together?)')
            if re.match(r'^[a-z]',rd) is None and re.match(r'^[A-Z(\["\'`]',rd) is None: hit('opens with something other than a letter or bracket')
    lens.sort()
    longest.sort(reverse=True)
    allstats[key]={'counts':dict(c),'median_len':lens[len(lens)//2],'p95_len':lens[int(len(lens)*.95)],'max_len':lens[-1],'longest':[(a,b,x[:300]) for a,b,x in longest[:15]]}
    json.dump({k:v for k,v in ex.items()},open(f'reading-examples-{key}.json','w'),ensure_ascii=False,indent=0)
    print('=====',key,'readings',c['readings'],'median len',lens[len(lens)//2],'p95',lens[int(len(lens)*.95)],'max',lens[-1])
    for k,v in sorted(c.items(),key=lambda x:-x[1]): print('  %6d  %s'%(v,k))
json.dump(allstats,open('reading-shape-stats.json','w'),ensure_ascii=False,indent=1)
