import json,sys
m=sys.argv[1]; a=int(sys.argv[2]); b=int(sys.argv[3]); L=int(sys.argv[4]) if len(sys.argv)>4 else 230
d=[x for x in json.load(open('cards-review.json')) if x['m']==m]
for i,x in enumerate(d):
    if i<a or i>=b: continue
    pill=repr(x['pill_at_rest']) if x['offered_at_rest'] else ('[NOT AT REST] printed: '+repr(x['pill_with_signs_printed']))
    print(f"#{i} [{x['class'][:30]}] {x['place']} {x['hebrew']} {x['step_tag']} pcs={x['pieces']} | PILL {pill[:150]} by={x['by']} row={x['row_entry'].get('n') or x['row_entry'].get('b')}")
    print(f"     SRC: {x['source_entry'][:L]}")
