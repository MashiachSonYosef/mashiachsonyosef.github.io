# Strong's «+» in the two editions: the Open Scriptures usage field against the Wikisource definition of the same number.
import json,re,collections,html
m9=json.load(open('m9-entries.json')); m14=json.load(open('m14-entries.json'))
TAG=re.compile(r'<[^>]+>')
c=collections.Counter(); rowsout=[]
def usage_raw(e):
    return html.unescape(TAG.sub('',e['usage'] or ''))
def renderings(text):
    out=[];depth=0;cur=''
    for ch in text:
        if ch=='(':depth+=1
        elif ch==')':depth=max(0,depth-1)
        if ch in ',;' and depth==0: out.append(cur);cur=''
        else: cur+=ch
    out.append(cur); return out
for n,e in m9.items():
    u=usage_raw(e)
    c['M9 usage fields']+= 1 if e['usage'] is not None else 0
    c['M9 «+» written']+=u.count('+'); c['M9 «×» written']+=u.count('×')
    # the trace of a lost sign: two or more spaces where a rendering opens (after , ; ( or at the start)
    lost=len(re.findall(r'(?:^|[,;(])\s{2,}(?=\S)',u))+len(re.findall(r'^\s+(?=\S)',u)) - len(re.findall(r'^\s{2,}(?=\S)',u))
    lost_paren=len(re.findall(r'\(\s+\)',u))+len(re.findall(r'\(\s+(?=\S)',u))
    c['M9 places where a rendering opens after extra blank (trace of a lost sign)']+=lost
    c['M9 round brackets that open on a blank']+=lost_paren
    if n in m14:
        c['entries in both editions']+=1
        d=m14[n][0]['theirs']
        # the list part: after the last ': ' or ':--'
        k=max(d.rfind(': '),d.rfind(':--'))
        lst=d[k+1:] if k>=0 else d
        p14=lst.count('+'); x14=len(re.findall(r'(?<![A-Za-z])X(?![A-Za-z])',lst))
        c['M14 «+» in the list of those entries']+=p14; c['M14 «X» standing alone in the list of those entries']+=x14
        c['M9 «+» in those entries']+=u.count('+'); c['M9 «×» in those entries']+=u.count('×')
        if p14>u.count('+'):
            c['entries where Wikisource writes more «+» than Open Scriptures']+=1
            c['«+» that Wikisource writes and Open Scriptures does not']+=p14-u.count('+')
            if len(rowsout)<5000: rowsout.append((n,p14,u.count('+'),u[:200],lst[:200]))
print(json.dumps(c,indent=1,ensure_ascii=False))
with open('plus-lost-openscriptures_strongs.tsv','w') as f:
    f.write('entry\tplus_in_wikisource_list\tplus_in_open_scriptures_usage\topen_scriptures_usage\twikisource_list\n')
    for r in rowsout: f.write('\t'.join(str(x).replace('\t',' ') for x in r)+'\n')
# served M9 readings that are the residue
res=collections.Counter(); ex=[]
for line in open('rows-M9.jsonl'):
    r=json.loads(line)
    for rd in r['readings']:
        if re.search(r'\(\s+\)|\(\s+\S',rd): res['served readings holding a bracket that opens on a blank']+=1; ex.append((r['k'],rd))
print(res, ex[:12])
