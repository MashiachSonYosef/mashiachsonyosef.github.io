import json,sys
m=sys.argv[1]; a=int(sys.argv[2]); b=int(sys.argv[3])
d=[x for x in json.load(open('cards-review.json')) if x['m']==m]
for i,x in enumerate(d):
    if i<a or i>=b: continue
    pill=repr(x['pill_at_rest']) if x['offered_at_rest'] else ('[NOT AT REST] signs printed: '+repr(x['pill_with_signs_printed']))
    cr=(x['credit'] or x['credit_signs'] or [''])
    print(f"#{i} [{x['class'][:44]}] {x['place']} {x['hebrew']} tag={x['step_tag']} pcs={x['pieces']}")
    print(f"   PILL {pill} by={x['by']} row={x['row_entry'].get('n') or x['row_entry'].get('b')} sign={(x['signs_note'] or '')[:12]!r} notes={str(x['notes'] or '')[:150]} held={(x['held'] or '')[:70]!r}")
    print(f"   CR: {cr[0][:150] if cr else ''} | rec: {str(x['record'])[:140]}")
    print(f"   SRC: {x['source_entry'][:400]}")
