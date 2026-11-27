# Place-level check of the flags the zone hangs on words: kq_trivial, maqaf_implicit, letter_marks,
# against the provider's markup at the same characters. Reads only.
import json, sys, gzip, collections
sys.path.insert(0, sys.argv[1]+'/scripts')
from srcparse import chars
W=sys.argv[1]; ZONES=sys.argv[2]
books=[l.strip() for l in open(f'{W}/books39.txt')]
src={}
for line in open(f'{W}/data/source-verses.jsonl'):
    r=json.loads(line); src[(r['book'],r['ref'])]=r['raw']
out=[]; tally=collections.Counter()
strip=lambda s: ''.join(c for c in s if c not in '   \n\t▯׀')
for b in books:
    z=json.load(gzip.open(f'{ZONES}/{b}.bin'))
    for sec in z['sections']:
        ref=sec['label']; sc=chars(src[(b,ref)],keep_bar=False)
        stxt=''.join(c for c,_ in sc); pos=0
        ztxt=''.join(strip(w['s']) for w in sec['words'])
        assert stxt==ztxt,(b,ref)
        covered_triv=set(); covered_impl=set(); covered_lm=set()
        for wi,w in enumerate(sec['words']):
            t=strip(w['s']); rng=range(pos,pos+len(t)); pos+=len(t)
            if 'mark' in w: continue
            attrs=[sc[i][1] for i in rng]
            has=lambda name: any(name in a for a in attrs)
            # kq_trivial
            if w.get('kq_trivial'):
                tally['zone kq_trivial words']+=1
                if has('mam-kq-trivial'): 
                    tally['zone kq_trivial words on a marked word']+=1
                    # whole word wrapped?
                    letters=[i for i in rng if 'א'<=sc[i][0]<='ת']
                    if not all('mam-kq-trivial' in sc[i][1] for i in letters): tally['zone kq_trivial word only partly wrapped in source']+=1
                else:
                    tally['zone kq_trivial words NOT marked in source']+=1; out.append((b,ref,wi+1,'kq_trivial flag on a word the source does not mark',w['s'],''))
            elif has('mam-kq-trivial'):
                tally['source kq_trivial word with no zone flag']+=1; out.append((b,ref,wi+1,'source marks kq-trivial, zone has no flag',w['s'],''))
            # implicit maqaf
            impl_here=[i for i in rng if sc[i][0]=='־' and 'mam-implicit-maqaf' in sc[i][1]]
            if w.get('maqaf_implicit'):
                tally['zone maqaf_implicit words']+=1
                if impl_here: tally['zone maqaf_implicit words carrying the spaced maqaf']+=1
                else:
                    tally['zone maqaf_implicit words NOT carrying it']+=1; out.append((b,ref,wi+1,'maqaf_implicit flag on a word whose own maqaf the source does not mark',w['s'],''))
            elif impl_here:
                tally['source implicit maqaf with no zone flag']+=1; out.append((b,ref,wi+1,'source marks its maqaf implicit, zone has no flag',w['s'],''))
            # letter marks
            letters=[i for i in rng if 'א'<=sc[i][0]<='ת']
            want={}
            for li,i in enumerate(letters,1):
                a=sc[i][1]
                if 'big' in a: want.setdefault('LARGE',[]).append(li)
                if 'small' in a: want.setdefault('SMALL',[]).append(li)
                if 'sup' in a: want.setdefault('SUSPENDED',[]).append(li)
                # a dot belongs to the letter it follows (before the next letter)
                nxt=letters[li] if li<len(letters) else rng.stop
                if any(sc[j][0] in 'ׅׄ' for j in range(i+1,nxt)): want.setdefault('DOTTED',[]).append(li)
            got={lm['kind']:list(lm['letters']) for lm in w.get('letter_marks',[])}
            for k in set(want)|set(got):
                tally[f'letter mark {k}: words']+=1
                if want.get(k)==got.get(k): tally[f'letter mark {k}: same letters']+=1
                else:
                    tally[f'letter mark {k}: DIFFERENT letters']+=1; out.append((b,ref,wi+1,f'letter mark {k}: source letters {want.get(k)} zone letters {got.get(k)}',w['s'],''))
with open(f'{W}/data/flag-places.tsv','w') as f:
    f.write('book\tref\tword\tfinding\tzone_s\tnote\n')
    for r in out: f.write('\t'.join(str(x) for x in r)+'\n')
for k,v in sorted(tally.items()): print(v,k)
