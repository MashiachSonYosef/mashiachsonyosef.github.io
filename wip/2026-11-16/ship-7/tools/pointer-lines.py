import json,gzip,sys,re,glob,os,collections
pat=re.compile(r'^(defective spelling of|plene spelling of|feminine of|plural of|construct (state )?of|definite of|plural indefinite form of|alternative (form|spelling) of|form of|inflection of|masculine of|singular of|dual of|misspelling of|obsolete|archaic form of|construct form of)', re.I)
for tree in sys.argv[1:]:
    c=collections.Counter(); n=0; ex=[]
    for f in sorted(glob.glob(os.path.join(tree,'data/resting-lines/*.json.gz'))):
        d=json.load(gzip.open(f))
        for label,units in d['sections']:
            for u in units:
                t=u[2] or ''
                if pat.search(t.strip()):
                    n+=1; c[(u[3], pat.search(t.strip()).group(1).lower())]+=1
                    if len(ex)<8: ex.append(f"{os.path.basename(f)[:-8]} {label} «{t}» {u[3]}")
    print(tree.split('/')[-2], 'pointer-led lines', n); print(' ', c.most_common(10)); print(' ', ex)
