# Task 137: of the resting lines a pointer leads (live tree), how many the pointer map resolves to an English
# (data/form-of-pills-v1.json: per key, pointers with their text and, where resolved, the target's reading).
import json,gzip,glob,os,re,collections,sys
fo=json.load(open('data/form-of-pills-v1.json'))['keys']
pat=re.compile(r'^(defective spelling of|plene spelling of|feminine of|plural of|construct (state )?of|definite of|plural indefinite form of|alternative (form|spelling) of|form of|inflection of|masculine of|singular of|dual of|misspelling of|archaic form of|construct form of)', re.I)
norm=lambda t: re.sub(r'[.;,]+$','',str(t).strip()).lower()
tot=collections.Counter(); ex=[]
for f in sorted(glob.glob('data/resting-lines/*.json.gz')):
    book=os.path.basename(f)[:-8]; d=json.load(gzip.open(f))
    z=json.load(gzip.open(f'data/zones/{book}.bin')) if os.path.exists(f'data/zones/{book}.bin') else None
    words={str(s['label']): s.get('words',[]) for s in (z or {}).get('sections',[])}
    for label,units in d['sections']:
        for u in units:
            t=(u[2] or '').strip()
            if not pat.search(t): continue
            tot['lines']+=1; tot['work:'+('tikkunei-zohar' if book=='tikkunei-zohar' else 'bible')]+=1
            w=(words.get(str(label)) or [None]*(u[0]+1))[u[0]] if words.get(str(label)) and u[0] < len(words.get(str(label))) else None
            k=(w or {}).get('k')
            ps=[p for p in fo.get(k,[]) if norm(p.get('t'))==norm(t)] if k else []
            if ps and any(p.get('resolved') for p in ps):
                tot['resolved']+=1
                if len(ex)<6: ex.append(f"{book} {label} «{t[:50]}» -> «{next(p['resolved']['text'] for p in ps if p.get('resolved'))[:60]}»")
            elif ps: tot['in_map_unresolved']+=1
            else: tot['not_in_map']+=1
print(dict(tot)); print('\n'.join(ex))
