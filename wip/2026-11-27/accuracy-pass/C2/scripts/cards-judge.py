# The cards read on the page, each with the judgment made by hand (the index lists below were set while reading
# cards-review.json beside the source entries), written one file per source.
import json,collections
SRC={'M9':'openscriptures_strongs','M14':'wikisource_strongs_explicit_forms','M5':'openscriptures_bdb_1906','M46':'unabridged_bdb_1906'}
S='says what the source says'
J={
'M9':{
 'default':S,
 'not offered at rest (the signs switch rests off); with the signs printed it says what the source says':[12,13,14,20,29,30,39,49,62,66,67,68],
 'not offered at rest: the page counts a square bracket as a source sign (a pattern written for STEP); with the signs printed it says what the source says':[5,64,71,72,73],
 'not on the card: the card opens on STEP\'s pieces and the row is filed under the whole word\'s letters':[94],
 'says what the file says; a blank stands where Strong set his + (unreadable residue)':[2,3,4,54,63],
 'says what the file says; the pill carries a pointer to other entries by bare number':[9,10,51,65,83,88,89],
 'says what the file says; both a lost-sign blank and a pointer by number':[21],
 'says what the file says, with a stray closing mark (; or ,)':[6,15,70,92],
 'says what the file says; the file\'s own brackets do not balance':[23,24,93,95],
 'cut wrongly: the file\'s gloss tag took in a closing bracket':[25],
 'says what the source says, in Strong\'s condensed form (the reader expands it)':[0,7,11,19,27,28,37,45,1,38,48,53,59],
 'says what the source says; the piece leans on the sense before it (also / hence / by implication)':[22,57,74,78,80,81,82],
 'belongs to another entry by the source\'s own word (Strong: only Isaiah 15:4; the rest belong to 7489)':[76],
},
'M14':{
 'default':S,
 'not offered at rest (the signs switch rests off); with the signs printed it says what the source says':[0,5,6,12,18,19,20,31,32,51,52,54,71,84,86,94],
 'says what the source says; the sign stands alone in a bracket and the pill is offered at rest (the same sign written before the word is not)':[1,33,36,61,65],
 "cut wrongly: a piece of Strong's own sentence (derivation or definition), not a rendering":[13,25,26,40,53,57,66,75,81,87,88,97,98,99],
 'cut wrongly: a fragment with a stray closing bracket (the edition\'s brackets do not balance)':[14,22,82,100],
 'says what the edition says; its brackets do not balance (whole list)':[76,77],
 "cut wrongly: Strong's note on the entry rides on the last rendering":[10,15,34,59,67,69,78,80],
 'belongs to another place by the source\'s own word (Strong binds the rendering to one verse)':[29,48,58,41,64],
 'cut wrongly: two renderings glued (the edition lost a comma)':[3,8,9,83],
 "says what the edition says (its own &, which the print does not have)":[38,74,95,101],
 'cut wrongly: a bracket alone, whose word stands in another pill':[96],
 "says what the source says, in Strong's condensed form (the reader expands it)":[2,7,37,68,72,79,92,21,39,45,55,56,70,23,60],
},
'M5':{
 'default':S,
 'not on the card as it opens (the row is filed under a prefix piece or the whole word; the card opens on the core piece)':[11,15,16,23,28,32,36,37,46,47],
 'unreadable: one letter (a bracketed letter the file tags as a definition)':[1,18,19,75,80],
 'unreadable: half a word':[63,64,84],
 'changed the sense: the file\'s tag covers part of a word (BDB prints the whole)':[25,93,95],
 'says what the tag says; BDB prints it with a bracketed start (stone-, sandal-, dis-)':[8,9,90],
 'belongs to another word: a root\'s or related word\'s meaning on the card of a word spelled the same':[17,31,51,52,53,68,70],
 'belongs to another entry: a homonym under the same Strong\'s number':[38],
 'cut wrongly: a fragment of a name\'s meaning or of a phrase':[50,76,77,78,42,30,5,4],
 'belongs to another place: the wording of a verse BDB cites elsewhere':[24,60,12],
},
'M46':{
 'default':S,
 'not on the card as it opens':[4],
 'not a reading: a grammar word or an outline label':[8,18,19,20,27,21,24],
 'unreadable: one letter (an outline letter)':[12,70],
 'unreadable: not English (Latin, German, French, a transliteration)':[28,45,36,44,48,56,72,83],
 'unreadable: characters mis-decoded or a word broken in the provider\'s file':[37,49,52,91],
 'says what the file says, with a stray mis-decoded mark':[41],
 "not a reading: BDB's remark on other scholars":[81],
 'belongs to another place: a sense or wording BDB binds to another verse or another bearer of the name':[1,11,43],
 'changed the sense: BDB sets the word in italics as a contrast, or the provider mistyped it':[89,76],
 'cut wrongly: a fragment (a label kept, a bracket alone, half a phrase)':[58,80,68,77],
},
}
d=json.load(open('cards-review.json'))
tot={}
for m,key in SRC.items():
    rows=[x for x in d if x['m']==m]
    idx={}
    for name,lst in J[m].items():
        if name=='default': continue
        for i in lst:
            assert i not in idx,(m,i); idx[i]=name
    c=collections.Counter()
    with open(f'cards-{key}.tsv','w') as f:
        f.write('n\tclass_chosen_for\tbook_chapter_verse_word\thebrew\tstep_tag\tpieces\tpill_as_printed_at_rest\tpill_with_signs_printed\tcarried_by\tsource_entry_of_the_row\tsource_text\trecord_on_the_card\tcredit_license_year_on_the_card\tjudgment\n')
        for i,x in enumerate(rows):
            j=idx.get(i,J[m]['default']); c[j]+=1
            ent=x['row_entry']; e=','.join(ent.get('n') or [])+(' / '+','.join(ent.get('b')) if ent.get('b') else '')
            cr=(x['credit'] or x['credit_signs'] or [''])[0]
            f.write('\t'.join(str(z).replace('\t',' ').replace('\n',' ') for z in [i,x['class'],x['place'],x['hebrew'],x['step_tag'],x['pieces'],x['pill_at_rest'] if x['offered_at_rest'] else '(not offered)',x['pill_with_signs_printed'] or '',x['by'] or '',e,x['source_entry'][:500],(x['record'] or [''])[0][:300],cr,j])+'\n')
    tot[key]=dict(c)
    print('=====',key,len(rows))
    for k,v in sorted(c.items(),key=lambda t:-t[1]): print('  %3d %s'%(v,k))
json.dump(tot,open('cards-judgments.json','w'),ensure_ascii=False,indent=1)
