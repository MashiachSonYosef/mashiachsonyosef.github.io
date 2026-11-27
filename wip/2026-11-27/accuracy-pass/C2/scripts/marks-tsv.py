# marks-<key>.tsv: every mark of each source, counted in the source's own raw readings and in the served rows, with the
# ledger's declared shapes, the source's own explanation where it gives one, and whether the printed pill honors it.
import json,unicodedata
raw=json.load(open('marks-source.json'))
FRONT="Strong, A Concise Dictionary of the Words in the Hebrew Bible (1890), front matter, read in the corpus lane's file fetch/M14-strongs-scan-first12pages.txt"
PLAN4='PLAN OF THE BOOK 4: «Then ensues a tracing of the etymology, radical meaning, and applied signification of the word, justly but tersely analyzed and expressed»'
PLAN6='PLAN OF THE BOOK 6: «Finally (after the punctuation-mark :—) are given all the different renderings of the word in the Authorized English Version, arranged in the alphabetical order of the leading terms, and conveniently condensed according to the explanations given below»'
SIGN_PLUS='SIGNS EMPLOYED: «+ (addition) denotes a rendering in the A. V. of one or more Heb. words in connection with the one under consideration»'
SIGN_X='SIGNS EMPLOYED: «× (multiplication) denotes a rendering in the A. V. that results from an idiom peculiar to the Heb.»'
SIGN_PAREN='SIGNS EMPLOYED: «( ) (parenthesis), in the renderings from the A. V., denotes a word or syllable sometimes given in connection with the principal word to which it is annexed»'
SIGN_BR='SIGNS EMPLOYED: «[ ] (bracket), in the rendering from the A.V., denotes the inclusion of an additional word in the Heb.»'
SIGN_IT='SIGNS EMPLOYED: «Italics, at the end of a rendering from the A. V., denote an explanation of the variations from the usual form»'
BDBKEY="Brown-Driver-Briggs (1906), list of abbreviations and signs, read in the corpus lane's file fetch/BDB-ia-hebrewenglishlex00browuoft_djvu.txt"
OSDOC="Open Scriptures, Hebrew Lexicon Documentation (HebrewLexicon.pdf at commit 21c9add)"
NOTES={
'openscriptures_strongs':{
 ',':(PLAN6+' (in the usage field); '+PLAN4+' (in the meaning field)',FRONT,'usage list: every comma between renderings divides (branches B01 and B02, the owner 7 November); meaning field: no comma divides','yes: one pill per rendering; the meaning stays one sentence',''),
 '.':('closes the list of renderings (the print ends every list with a full stop)',FRONT,'no shape divides but period.top_before_last_word (3); the page does not draw one closing stop on a pill','yes, but a stop inside the pill stays where a pointer follows it («portion. See also 5555»: 253 readings)','FINDING: the pointer after the stop rides on the last rendering'),
 '(':(SIGN_PAREN,FRONT,'25 shapes, none divides; 15 begin «unverified:» because the declaration says the source\'s key was not found','printed as written (the condensed form is not expanded): 6,214 readings hold a round group, 1,154 a word end or word start','FINDING: the declaration calls unverified what Strong\'s own key states; the condensing is declared and not carried out'),
 ')':('as (',FRONT,'as (','as (',''),
 ';':(PLAN4+' (the steps of the tracing stand between semicolons); in a usage list it parts groups of renderings',FRONT,'9 shapes divide in the meaning field (1,659 marks: before also, hence, by implication, figuratively, specifically and the like); semicolon.top_between_kjv_groups divides under B01','yes; each piece keeps its own label, so 1,494 pieces open with also / hence / or / by implication',''),
 '-':('inside a round bracket: the «syllable» of '+SIGN_PAREN,FRONT,'12 shapes, none divides; 6 «unverified:»','printed as written',''),
 '×':(SIGN_X,FRONT,'5 shapes, all «unverified:», and their words say the marked word is «not a plain rendering»; the comma beside it divides (B02), so the rendering prints alone with its sign; the page sorts it after every plain reading and does not offer it while the signs switch rests off','no at rest: Strong counts it among «all the different renderings»; 752 readings, 146,803 pill places not offered at rest','FINDING: declared meaning differs from Strong\'s own; hidden at rest by the signs switch (the owner\'s ruling of 3 October)'),
 '+':(SIGN_PLUS,FRONT,'3 shapes, all «unverified:»; treated as ×','the file writes 39; about 500 more stood in Strong\'s text and are a blank in the file (the Wikisource edition keeps them), so those renderings print plain','FINDING: the file lost the sign; 352 readings print plain at 158,412 pill places'),
 '[':(SIGN_BR+' (in a rendering); in a definition Strong brackets his own added words and numbers',FRONT,'7 shapes, none divides; 4 «unverified:»','no at rest: the page counts any [ ] group as a source sign (the pattern is STEP\'s) and does not offer the reading: 22 readings, 12,264 pill places','FINDING: a rule declared for another source fires here'),
 ']':('as [',FRONT,'as [','as [',''),
 ':':('between chapter and verse in a citation inside a bracket',FRONT,'1 shape (colon.in_paren_between_chapter_and_verse, 23), no cut','printed as written; the verse Strong names is not used to place the rendering (14 rows stand at other verses)','candidate: a binding the source gives and we hold unused'),
 "'":('quotation marks and the possessive',FRONT,'7 shapes, no cut','yes',''),
 '!':('ends an interjection',FRONT,'2 shapes, no cut','yes',''),
 '?':('ends a question word; once marks doubt',FRONT,'3 shapes, no cut','yes',''),
 '}':('a stray closing brace in the file (1)',OSDOC,'close_brace.never_opened','printed as written',''),
 '’':('possessive after s (1)',FRONT,'1 shape','yes',''),
},
'wikisource_strongs_explicit_forms':{
 ',':(PLAN6,FRONT,'the catalog cut the list at every comma outside round brackets before the ledger; in the served rows 23,225 of 23,226 commas stand inside brackets and none divides','yes: one pill per rendering; where the edition\'s brackets do not balance the cut is wrong («like)», «selves)»)','FINDING: fragments where the edition\'s brackets do not balance (187 readings)'),
 '(':(SIGN_PAREN+'; the edition also writes the print\'s square bracket as a round or doubled round bracket',FRONT,'18 shapes written from the print\'s key; none divides','printed as written, condensed: 36,266 readings hold a round group, 11,064 a word end or start; 180 readings are a bracket alone','the condensing is declared and not carried out'),
 ')':('as (',FRONT,'as (','as (',''),
 '-':('inside a bracket the «syllable» of the parenthesis; at the head of a text one or two hyphens are the edition\'s dash for the print\'s list sign :—',FRONT,'13 shapes, none divides; hyphen.opens_king_james_word (311): «the store left it on the first word of the list»','the list sign prints on the rendering («--castle», «-deliver», «-X abundantly»): 328 readings, 7,224 pill places','FINDING: the print\'s sign for «here the renderings begin» is printed as part of a rendering'),
 '+':(SIGN_PLUS,FRONT,'8 shapes written from the print; none divides; the page sorts a reading that opens with it after every plain one and does not offer it while the signs switch rests off; the sign alone in a bracket («(+) army») is offered','no at rest (see X)','FINDING: with X, 15,688 readings and 972,262 pill places not offered at rest; the bracketed form of the same sign is offered'),
 '.':('closes the list; a run of dots stands for words the Authorized Version supplies',FRONT,'18 shapes; period.between_two_renderings divides (B02, 12); period.before_note_after_rendering (103) keeps the note','a note on the whole entry rides on the last rendering («wrong. (Incl. feminine raaah; as adjective or noun.)»)','FINDING: 103 notes ride on a rendering'),
 ';':(PLAN4+'; where the edition writes ; -- it stands for the list sign',FRONT,'14 shapes; three divide by the owner\'s answers (B01 16, B03 99)','mostly yes; where the edition has no colon the catalog made pieces of Strong\'s sentence into rows (344 readings)','FINDING: pieces of Strong\'s own sentence print as readings'),
 ':':('the edition\'s colon stands for the print\'s list sign :— (5,992 in the definitions); in served rows it is the verse colon',FRONT,'2 shapes; the catalog took the rows from after it','yes; the verse Strong names is not used to place the rendering',''),
 '&':('none: the print has no such sign at these texts',FRONT,'1 shape, «unverified:»','printed as written («& presume», «lay & to (take a) pledge»)','the edition\'s own slip, served as it is'),
 '`':('ayin in the edition\'s transliteration (the print uses a reversed apostrophe)',FRONT,'1 shape','yes',''),
 "'":('possessive; aleph in a transliterated word',FRONT,'2 shapes','yes',''),
 '"':('around cited words',FRONT,'1 shape','yes',''),
 '?':('ends a question word',FRONT,'1 shape','yes',''),
 '!':('ends a cry',FRONT,'1 shape','yes',''),
},
'openscriptures_bdb_1906':{
 ',':('none in the source\'s documentation («they name no sign of punctuation»); the documentation says «Normally, each in a series of definitions will have a separate» def element',OSDOC,'8 shapes, all «unverified:»; B01 divides (273, the owner 6 November); B02 held whole (83)','yes',''),
 '-':('none stated',OSDOC,'5 shapes «unverified:»; hyphen.ends_a_half_word (12)','half words print as pills («-tender», «knob-»): 19 readings','FINDING with the one-letter pills'),
 '!':('none stated',OSDOC,'1 shape','yes',''),
 '?':('none stated',OSDOC,'2 shapes; B03 keeps the sign','yes',''),
 '(':('BDB: none for a round bracket; in the file a def tag often stands against or inside one',OSDOC,'3 shapes','13 rows keep the bracket; where the tag stops at the bracket the pill is a part of BDB\'s word («set» for (sun)set; «s» for merchant(s))','FINDING'),
 ')':('as (',OSDOC,'as (','as (',''),
 '.':('ends a shortened word (Isr., mts.)',BDBKEY,'4 shapes; B04 leaves a closing stop off (1)','yes',''),
 '’':('possessive; a quote',OSDOC,'3 shapes','yes',''),
 "'":('possessive',OSDOC,'2 shapes','yes',''),
 '‛':('ayin in a transliterated name',OSDOC,'1 shape','yes',''),
 '…':('a gap in a phrase',OSDOC,'1 shape','yes',''),
 '&':('BDB writes & for and',BDBKEY,'2 shapes; B03 divides one','yes',''),
 ';':('none stated',OSDOC,'1 shape; B03 divides (1)','yes',''),
 '׳':('BDB: «sign of abbreviation (in Hebrew words)»',BDBKEY,'1 shape, written from the print\'s list','yes',''),
},
'unabridged_bdb_1906':{
 ',':('none stated by the provider (its README names tags, not signs)','README.md at commit 6e8326c','25 shapes; B01, B02, B04, B05 and B06 divide (4,803 commas, the owner 6 November)','mostly yes; a label at the head stays with the first piece («late, guard»)',''),
 '.':('ends a shortened word or an outline letter',BDBKEY,'7 shapes; B03 keeps a stop with the part before it','yes; an outline letter alone prints as a pill («a»)','FINDING with the grammar words'),
 ':':('none stated',BDBKEY,'6 shapes; colon.marked_between_two_renderings divides (3)','a grammar word after a colon stays on the piece («answered: Imperfect»)',''),
 ';':('none stated',BDBKEY,'6 shapes; two divide (20)','yes',''),
 '(':('none stated for a round bracket',BDBKEY,'10 shapes, 2 «unverified:»','printed as written; a bracket alone can be a pill («(dig)»)',''),
 ')':('as (',BDBKEY,'as (','as (',''),
 '=':('BDB: «= equivalent, equals.»',BDBKEY,'2 shapes (equals.restates), no cut','printed as written («make strong = bold»)',''),
 '-':('none stated',BDBKEY,'5 shapes','yes',''),
 "'":('possessive; marks a quoted word',BDBKEY,'5 shapes','yes',''),
 '—':('opens a note',BDBKEY,'1 shape «unverified:»','yes (in notes)',''),
 '&':('BDB writes & for and',BDBKEY,'1 shape','yes',''),
 '?':('marks doubt; ends a question word',BDBKEY,'4 shapes; B03 keeps the sign','yes',''),
 '|':('BDB: «|| parallel, of words (synonymous or contrasted); also of passages»',BDBKEY,'1 shape «unverified:» though the print\'s list states it','printed as written (in notes)','the declaration calls unverified what BDB\'s list states'),
 '+':('BDB: «+ plus, denotes often that other passages, etc., might be cited»',BDBKEY,'2 shapes','in notes only; no reading opens with it, so the page\'s Strong sign rule does not reach it',''),
 '!':('a cry',BDBKEY,'2 shapes; B03 keeps the sign','yes',''),
 '[':('BDB: «[ ] indicates that the form, etc., enclosed, is not actually found, or that the Hebrew offers no positive proof»',BDBKEY,'2 shapes','one pill row holds a [ ] group and is not offered at rest (the page\'s pattern for STEP)',''),
 ']':('as [',BDBKEY,'as [','as [',''),
 '§':('paragraph of a cited grammar',BDBKEY,'1 shape','in notes',''),
 '√':('BDB: «√ root or stem»',BDBKEY,'1 shape «unverified:» though the print\'s list states it','in notes',''),
 '†':('BDB: «† prefixed, or added, or both, indicates All passages cited»; in the file it also stands in transliterations',BDBKEY,'1 shape','in a transliteration',''),
 '/':('none',BDBKEY,'1 shape','in notes: the page would print it as « + »',''),
},
}
EXTRA={
'openscriptures_strongs':[
 ('(two or more blanks where a rendering opens)','the trace of a lost + in the file',487,'—','none: the catalog made every run of blanks one blank','no declared rule','FINDING: a mark with no declared rule'),
 ('See / Compare with a number','Strong\'s pointer to another entry; the file tags the number as a link (<w src>)',273,'253 readings','the ledger: «a pointer at the end of a text stays in the last piece»','the pointer prints on the last rendering with a bare number','FINDING'),
 ('i.e.','Strong\'s abbreviation (ABBREVIATIONS EMPLOYED: i.e. = id est, that is)',1519,'1,529 readings','period.top_in_ie and the like: no cut','yes',''),
 ('italics','SIGNS EMPLOYED: Italics, at the end of a rendering',0,'0','none','the file keeps no italics; Strong\'s explanations print as plain bracketed words («(from the margin)»)','lost before us'),
 ('<def> tag','the file\'s own mark of a gloss inside a meaning',14154,'7,962 rows','the store cut each tagged gloss as a row; 3 tags took in a closing bracket','yes but for those 3',''),
],
'wikisource_strongs_explicit_forms':[
 ('X standing alone','the edition\'s letter for the print\'s ×: '+SIGN_X,884,'11,874 routes (the ledger\'s count)','none: the ledger says «it gives no shape to the capital X ... because a letter is no mark under the ask»','the page\'s own pattern (X and a space at the head) sorts it last and does not offer it at rest','FINDING: a mark with no declared rule'),
 ('-- or - at the head','the edition\'s dash for the print\'s list sign :—',103,'328 readings','hyphen.opens_king_james_word','prints on the rendering','FINDING'),
 ('[[link]]','the edition\'s link to another entry; its text is the Hebrew headword',4698,'157 readings hold Hebrew letters','the catalog reads a link as its text','yes',''),
 ('italics','SIGNS EMPLOYED: Italics, at the end of a rendering',0,'0','none','the edition\'s wikitext holds no italic quotes in 5,806 entries','lost before us'),
 ('form list and verse list','the edition\'s own binding: each entry lists its forms and 240,109 verses',240109,'—','none','the forms are the row keys; the verses are not used','see the binding section'),
],
'openscriptures_bdb_1906':[
 ('<def> tag','«The <def> element contains a definition, as distinguished in BDB either by bold face or by italics»',21343,'15,455 rows','every row is one whole def element','the tag merges BDB\'s bold (a meaning) and italics (the wording of a cited phrase, a related word\'s meaning) and breaks at brackets','FINDING'),
 ('<sense n>, <stem>, <asp>','BDB\'s own outline of an entry',12267,'—','the stems are used (the corpus lane\'s binyan files); sense numbers are not','partly',''),
 ('<ref r>','«The <ref> element contains a Scripture reference»',3952,'1,454 rows are followed by one','none','not used: a phrase\'s wording stands at every place of the entry','FINDING'),
 ('entry type="root"','«type distinguishes an entry (the default) from a root»',2595,'871 rows carry no number','the entry gate\'s parting for BDB\'s own entries','a root\'s related-word meanings stand on words spelled the same where no numbered BDB row is left under the key','FINDING'),
],
'unabridged_bdb_1906':[
 ('<highlight> (italics)','the provider\'s README: «highlight { font-style: italic; }»',49601,'2,573 pill rows','the catalog takes every highlight of a numbered point before its first reference as a route','BDB\'s italics also set grammar words, foreign words, book titles and contrasted words; all become pills','FINDING'),
 ('<highlightword>','the entry\'s main gloss',7830,'4,315 pill rows','a route','yes',''),
 ('<ref ref=…>','the provider\'s README: «original scripture references parsed»',165681,'—','none','not used: 127 verse wordings stand at 27,276 pill places away from their verse and 66 at it','FINDING'),
 ('<b>N.</b> point','BDB\'s numbered senses',9194,'2,008 notes','a sense opening prints as a note, not a pill (the owner\'s ruling 4 of 13 November)','yes',''),
 ('abbreviations written out','the provider expands BDB\'s abbreviations into words (Perfect, Imperfect, noun masculine, compare)',0,'—','none','the words then stand in italics like glosses and become pills',''),
],
}
served={k:json.load(open(f'marks-served-{k}.json')) for k in raw}
for key in raw:
    sv={m['mark']:m for m in served[key]['marks']}
    rw=raw[key]['marks']
    allm=sorted(set(sv)|set(rw),key=lambda ch:-(sv.get(ch,{}).get('served',0)+rw.get(ch,0)))
    with open(f'marks-{key}.tsv','w') as f:
        f.write('mark\tunicode_name\tin_the_source_raw_readings\tin_served_rows\tof_those_inside_round_brackets\tinside_square_brackets\tcut_at_this_mark\tshapes_the_ledger_declares\ttop_shapes\tthe_sources_own_explanation\twhere_it_is_stated\tdeclared_rule\tdoes_the_printed_pill_honor_it\tfinding\n')
        for ch in allm:
            m=sv.get(ch,{})
            name=unicodedata.name(ch,'?')
            if ('HEBREW' in name) and ch!='׳':
                note=('a Hebrew point or accent inside a cited Hebrew word','the text itself','a shape per point (no cut)' if m.get('shapes') else ('no shape: the rows that hold it were given their Hebrew back after the ledger was declared (relay v187); they print as notes' if key=='unabridged_bdb_1906' else 'no shape'),'yes','FINDING: marks with no declared rule (650 note rows)' if key=='unabridged_bdb_1906' and not m.get('shapes') else '')
            else:
                note=NOTES[key].get(ch,('none found','','','',''))
            shapes=m.get('shapes',[])
            f.write('\t'.join(str(x) for x in [ch,name,rw.get(ch,0),m.get('served',0),m.get('in_round',0),m.get('in_square',0),m.get('cut_at',0),len(shapes),'; '.join(f'{a}:{b}' for a,b in shapes[:3]),note[0],note[1],note[2],note[3],note[4]])+'\n')
        for e in EXTRA[key]:
            f.write('\t'.join(str(x) for x in [e[0],'(not a single character)',e[2],e[3],'','','','', '',e[1],'',e[4],e[5],e[6]])+'\n')
    print(key,len(allm)+len(EXTRA[key]),'lines')
