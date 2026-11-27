#!/usr/bin/env python3 -I
# Assemble pins.tsv: one row per file, from the measurements of this pass (the data files beside it).
import json, os, gzip, collections, csv, re
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
W=S+'/w39/out/B'; D=S+'/base/reader/data'
def tsv(name):
    with open(W+'/data/'+name,encoding='utf8') as f:
        rows=[l.rstrip('\n').split('\t') for l in f]
    h=rows[0]; return [dict(zip(h,r)) for r in rows[1:]]
out=[]
def add(subject, role, file, where, bytes_, rec, today, pinned_in, checked_by):
    out.append([subject, role, file, where, str(bytes_), rec, today, pinned_in, checked_by])
NR='not re-hashed'
kinds=json.load(open(D+'/dictionary-kinds-v1.json'))
fam_order=[f['id'] for f in kinds['families']]
key2fam={k:f['id'] for f in kinds['families'] for k in f['keys']}
bible=[f['id'] for f in kinds['families'] if f['kind']=='bible']

# ---------- the 39 books ----------
add('all 39 books','Sefaria\'s dump as its provider publishes it','dump_small.tar.gz','https://storage.googleapis.com/sefaria-mongo-backup/dump_small.tar.gz (the corpus lane\'s copy stands on its own disk; nothing of this name is on the store)',2430059192,'c3b2821ecaa28be8fa222f229386031807a5889aae45b8615866c5afcb77cadc',NR+' (2.4 GB; not on the store; the address is a backup the provider renews)','data/paseq-place/paseq-v1/receipt-v1.json inputs.edition.archive (a relay receipt of 13 November 2026); the restore receipts of 5 September name no hash','none')
add('all 39 books','Sefaria\'s text as the corpus lane received it','texts.bson (member ./dump/sefaria/texts.bson of the dump)','the corpus lane\'s disk: rebuild-c0-w/source-cache/sefaria/dump/sefaria/texts.bson; not on the store',3580067596,'433c5aca5e2018603ee25b72e433b2079a6c2e7bab26f97f12822903af973345',NR+' (3.6 GB; not on the store)','data/paseq-place/paseq-v1/receipt-v1.json inputs.edition; the restore tool reads this path and hashes nothing','none')
chain={r['book']:r for r in tsv('books-chain.tsv')}
coll={r['name'].replace('tanakh-',''):r for r in tsv('manifests-rehash.tsv') if r['group'].startswith('collected')}
rvc={r['book']:r for r in tsv('restore-vs-collected.tsv')}
bridges={r['zone']:r for r in tsv('bridges-made-again.tsv')}
man=tsv('manifests-rehash.tsv')
zs={r['name']:r for r in man if r['group']=='zone store bin'}
gate=json.load(open(D+'/serve-gate-receipt-v1.json'))
lat=collections.defaultdict(dict)
for r in tsv('lattice-rehash.tsv'): lat[r['book']][r['role']]=r
pinned_inputs=tsv('pinned-inputs-rehash.tsv')
dp_books={os.path.basename(r['file'])[:-len('.jsonl')]:r for r in pinned_inputs if r['group']=='default picks book file'}
cp=json.load(open(S+'/base/chapter-pages-receipt-v1.json'))
tree={}
for r in tsv('tree-hashes.tsv'): tree[r['path']]=r
for b in sorted(chain):
    c=chain[b]; z=json.load(gzip.open(f'{D}/zones/{b}.bin'))['emitted_from']
    add(b,'the same Sefaria edition as the edition collection holds it (another extraction of the same dump, 2 September 2026)',f'tanakh-{b}/edition-miqra-according-to-the-masorah.tokens.csv.gz','store: v2/sources/tanakh-editions-collect/collected/',coll[b]['bytes']+' tokens',coll[b]['sha256_recorded']+' (sha256 of the token stream, by the collection\'s own recipe)',coll[b]['sha256_today'],'the collection\'s own receipt, in a part on the store; nothing in the tree names it','none; this pass: the restore\'s words are these tokens letter for letter'+(' but for the footnotes the restore lifts' if rvc[b]['equal_letters_points_accents']!='True' else ''))
    add(b,'the corpus lane\'s restore of the book (the text the page lane was handed)',f'mam-{b}-restored-v5.csv.gz (the zone calls it {b}.csv.gz)','store: v2/ledgers/mam/mam-restore/',c['restore_gz_bytes'],c['restore_gz_sha256_zone'],c['restore_gz_sha256_today'],f'the zone itself: data/zones/{b}.bin emitted_from.walk.restore_oracle.restore_gz_sha256 (no pin file names it)','none re-hashes it; check-restore-serve-v1 L1 asks only that the zone names a 64-hex hash; tools/serve-from-restore-v5.mjs held the bytes to the receipt once, when the book was served')
    add(b,'the restore\'s receipt',f'mam-{b}-restored-v5.json','store: member of v2/ledgers/mam/mam-restore/TEXT-PART-v1.tar.gz',len(open(f'{W}/dl/restore-x/receipts/mam-{b}-restored-v5.json','rb').read()),c['receipt_sha256_part_index']+' (the part\'s own index)',c['receipt_sha256_today'],'the part\'s index on the store; the tree names the file (the zone: receipt) and not its hash','none')
    add(b,'the restore\'s surface (sha256 over the row surfaces, each followed by a line end)','(a hash of text, not a file)','recomputed from the store\'s rows, and again from the served zone\'s words rejoined at the maqaf','%s rows'%c['restore_rows'],c['surface_sha256_rights_record'],c['surface_sha256_from_store_rows']+' from the store\'s rows; '+c['surface_sha256_from_served_zone']+' from the served zone','data/mam-restore-v5-rights-v1.json works.tanakh/%s.restore_surface_sha256; the zone (walk.restore_oracle.surface_sha256, walk.pointer.sha256); the restore\'s receipt'%b,'none recomputes it: check-restore-serve-v1 L1 reads the zone\'s own flag surface_sha256_reproduced; no check reads restore_surface_sha256')
    br=bridges[b]
    add(b,'the identity bridge the serve wrote (named as not kept)',br['bridge_file'],'held by neither lane (data/pins-not-kept-v1.json); made again today from the served zone',' ',br['sha256_recorded_in_zone'],br['sha256_made_again_today']+' (made again, the same bytes)','the zone (walk.identity.bridge_sha256, identity_oracle.bridge_sha256); data/pins-not-kept-v1.json','none (no check reads data/pins-not-kept-v1.json)')
    zr=zs[b+'.bin']
    add(b,'the zone we serve',f'{b}.bin','tree: reader/data/zones/',zr['bytes'],gate['served_sha256'][b],zr['sha256_today'],'data/serve-gate-receipt-v1.json served_sha256; data/zone-store-v1.json pins','check-zone-store-v1 (every pin matches its bin); tools/build-front-door-v1.mjs refuses a zone that is not the bytes the gate judged; the resting lines name it in read_off.files')
    for side in ('lattice','volume','commentary'):
        k=f'{b}.{side}.bin'
        if k in zs: add(b,f'the {side} sidecar we serve',k,'tree: reader/data/zones/',zs[k]['bytes'],zs[k]['sha256_recorded'],zs[k]['sha256_today'],'data/zone-store-v1.json pins','check-zone-store-v1')
    rl=tree[f'reader/data/resting-lines/{b}.json.gz']
    rec=[h for h in re.findall(r'[0-9a-f]{64}',json.dumps(cp)) if h==rl['sha256']]
    add(b,'the line under every word, as recorded off the page',f'{b}.json.gz','tree: reader/data/resting-lines/',rl['bytes'],rl['sha256'] if rec else '(not found in the receipt)',rl['sha256'],'chapter-pages-receipt-v1.json (at the site root); the record names the sha256 of every file it was read off (read_off.files), all equal today','tools/build-front-door-v1.mjs refuses a recording read off another zone.html; check-chapter-pages-v3')
    src=z['toggles']['lattice']['source']
    for role in ('positions','routes','receipt'):
        e=src[role]; r=lat.get(b,{}).get(role)
        add(b,f'the corpus lane\'s lattice v12 ({role})',e['path'],'store: v2/corpus/lattice-v12/',e.get('bytes',''),e['sha256'],r['sha256_today'] if r else NR+' (7 of the 39 books were fetched; the folder is 329 MB)','the zone: emitted_from.toggles.lattice.source.'+role,'none hashes it (it stands off the tree); check-lattice-projection-v1 reads the zone\'s record')
    if b in dp_books:
        r=dp_books[b]; add(b,'the corpus lane\'s default picks for the book',r['file'],'store: '+os.path.dirname(r['store_key'])+'/',r['bytes_recorded'],r['sha256_recorded'],r['sha256_today'],'data/default-picks/default-picks-v1/receipt-v1.json outputs[], which data/default-picks/PIN.json holds the book files to','read only through tools/pinned-v1.mjs (a tool refuses other bytes); check-default-picks-v1')
# shared records of the books
for name,role,pin,chk in [
 ('mam-restore-v5-rights-v1.json','the rights record and the credit of every book','each zone: emitted_from.walk.rights.record_sha256 (39 zones name today\'s bytes)','check-restore-serve-v1 L4 asks only that the zone\'s record_sha256 is 64 hex; nothing compares it with the record'),
 ('masorah-witnesses-v1.json','the witnesses each count is stamped beside','each zone: count_stamp.witnesses.sha256 (39 zones name today\'s bytes)','check-bookword-count-v1'),
 ('dictionary-kinds-v1.json','the record of the 29 families and what rests shut','each zone: emitted_from.rests_off.sha256 (39 zones name today\'s bytes); the resting lines','check-dictionary-kinds-v1'),
]:
    t=tree['reader/data/'+name]; add('all 39 books',role,name,'tree: reader/data/',t['bytes'],t['sha256'],t['sha256'],pin,chk)
add('all 39 books','the corpus lane\'s book cards the serve held its counts to','book-cards-v2.json','not found on the store under this name; not in the tree','','a41cf8939f72ef884b4d390f4a61b104a27c0a849d949893c2e654b9c6e7967d',NR+' (not found)','each zone: emitted_from.walk.restore_oracle.count.held_to.sha256','none')
add('all 39 books','the headword ledger (MACULA\'s lemma and TAHOT\'s root tag)','word-lemma-v1.csv.gz','store: v2/ledgers/all/toggle-builds/form-or-lemma-v2/',6180628,'a688051f3cf3477d155bd13e7e244e8482cb624c672982d78f7cef07cca27d39','a688051f3cf3477d155bd13e7e244e8482cb624c672982d78f7cef07cca27d39','each zone: emitted_from.toggles.headword.source.sha256','none hashes it (off the tree)')
add('all 39 books','the serve tool','serve-from-restore-v5.mjs','tree: reader/tools/',tree['reader/tools/serve-from-restore-v5.mjs']['bytes'],'81db5d14c12564b5d49c68d0b49a28a19c9ed268502fe849514f05f57d885d7f',tree['reader/tools/serve-from-restore-v5.mjs']['sha256'],'each zone: emitted_from.walk.module.sha256','none compares it')
# the other served zone and the fixtures; the not-kept list
nk=json.load(open(D+'/pins-not-kept-v1.json'))
for f in nk['files']:
    zn=f['pinned_by_zones'][0]
    if zn in chain: continue
    if f['name'].startswith('cleanroom-c0-ledger-map-rebuilt-active-000000000000000069828900'):
        add('fixture '+zn,'a C0 ledger map named as not kept',f['name'],'store: v2/corpus/pinned/c0-map-rebuild-c0-w/ (there since 21 November 2026)',850726,f['sha256'],'65106e0728ce8fcd57ebde4ce60f6bb3c2e31479c89f305122f10f88c4839c3d','data/pins-not-kept-v1.json (recorded 10 November as not kept); the fixture zone','none')
    else:
        add('fixture '+zn,('an ' if f['kind'][0] in 'aeiou' else 'a ')+f['kind']+' named as not kept',f['name'],'held by neither lane (data/pins-not-kept-v1.json)','',f['sha256'],NR+' (not found; not tried to make again: a fixture, outside the 39 books)','data/pins-not-kept-v1.json; the fixture zone','none')
for k,r in zs.items():
    b=k.split('.')[0]
    if b in chain: continue
    add(b,'a served bin outside the 39 books',k,'tree: reader/data/zones/',r['bytes'],r['sha256_recorded'],r['sha256_today'],'data/zone-store-v1.json pins','check-zone-store-v1')

# ---------- the 29 families ----------
rows_by={r['family']:r for r in tsv('rows-by-family.tsv')}
prov=tsv('provider-rehash.tsv')
nm=json.load(open(D+'/names/names-v2/receipt-v2.json'))['inputs']['sources']
ms2=json.load(open(D+'/made-spaces/made-spaces-v2/receipt-v2.json'))['inputs']
RECN='data/names/names-v2/receipt-v2.json inputs.sources.%s (a relay receipt kept byte for byte; data/names/PIN.json pins the receipt)'
NOCHK='none: the file is in neither the tree nor the store, so no check can hash it'
famsrc=collections.defaultdict(list)
def src(fam,file,where,by,rec,today,pin,chk=NOCHK): famsrc[fam].append((file,where,by,rec,today,pin,chk))
pf={'strongs (Open Scriptures edition, M9)':'strongs','bdb-open-scriptures (M5)':'bdb-open-scriptures','lexical-index (M33)':'lexical-index','tbesh (M19)':'tbesh','tahot (M4)':'tahot','bdb-unabridged (M46)':'bdb-unabridged'}
for r in prov:
    src(pf[r['family']],r['file'],'the provider, at the commit the store\'s source record names: '+r['fetched_from_the_provider_at']+' (the corpus lane\'s copy stands on its own disk)',r['bytes_recorded'],r['sha256_recorded'],r['sha256_today']+' (fetched from the provider today)',r['recorded_in'],'none in the tree; this pass fetched the provider\'s file and hashed it')
for e in ms2['wikisource_strongs']['files']:
    src('strongs',e['file']+' (the Hebrew Wikisource edition, M14)','the corpus lane\'s disk (source cache, wikisource-strongs-2026-07-12); fetched from '+e['source'],e['bytes'],e['sha256'],NR+' (he.wikisource.org is not reachable from this session, and the record names no revision of the page)','data/made-spaces/made-spaces-v2/receipt-v2.json inputs.wikisource_strongs.files[]')
src('macula','macula-hebrew.tsv','the corpus lane\'s disk (source cache, macula-hebrew-2026-07-15); the tree records no public address or commit for it',nm['macula']['bytes'],nm['macula']['sha256'],NR+' (not on the store; no address recorded here)',RECN%'macula'+'; data/default-picks/spans-v1/receipt-v1.json inputs[4]')
src('ubs-dictionary','UBSHebrewDic-v0.9.2-en.JSON','named by its pin at r2:mishkan/old-local-999-footsteps/ledgers/work/ldmprs/source-cache/ubs-sdbh-hebrew-2026-07-15/, a folder that holds 0 objects on the store today',nm['ubs']['bytes'],nm['ubs']['sha256'],NR+' (the address its pin names is gone)','data/ubs-collocations/PIN.json dictionary (a pin of its own); '+RECN%'ubs','none can reach it; tools/derive-ubs-collocations-v1.mjs reads it through tools/pinned-v1.mjs when a copy is given on its command line')
src('ubs-dictionary','ubs-sdbh-hebrew-definition-routes-v1.csv.gz (the catalog\'s route file for the UBS dictionary)','named by its pin at the same folder, gone from the store',2513081,'3567c700e4dfcf5832bcd0766ffa423f015ca361e273a8196700f838012aa875',NR+' (the address its pin names is gone)','data/ubs-collocations/PIN.json routes','as the line above')
src('sdbh-hiperbiblia','hiperbiblia-sdbh.json','the corpus lane\'s disk (source cache, hiperbiblia-sdbh-2026-07-12); read from a web page (hiperbiblia.com), not a file its provider publishes',nm['hiperbiblia']['bytes'],nm['hiperbiblia']['sha256'],NR+' (not on the store)',RECN%'hiperbiblia')
src('davidson','(page images read by hand; the store\'s source record points at a manifest on the corpus lane\'s disk)','the corpus lane\'s disk (source cache, davidson-2026-07-12)','','no sha256 of any file of this source is recorded in the tree',NR,'none','none')
src('uhal','en_uhal (80 files, hashed as a set)','the corpus lane\'s disk (source cache, unfoldingword-uhal-2026-07-12)','80 files',nm['uhal']['sha256_of_the_set']+' (sha256 of the set; the recipe is not in the tree)',NR+' (not on the store; the set\'s recipe is not recorded here)',RECN%'uhal')
src('biblicaltools','biblicaltools-2026-07-12-hebrew-word-of-day.json','the corpus lane\'s disk (source cache); read from a web site, not a file its provider publishes',nm['biblicaltools']['bytes'],nm['biblicaltools']['sha256'],NR+' (not on the store)',RECN%'biblicaltools')
other={'classical-hebrew-words':('chw','classical-hebrew-words.json'),'english-wiktionary-hebrew-entries':('kaikki_hebrew','kaikki.org-dictionary-Hebrew.jsonl'),'english-wiktionary-translation-tables':('kaikki_translation_tables','hebrew-translation-rows.jsonl (Kaikki\'s table; no hash of DBnary\'s file was found)'),'english-wiktionary-aramaic-entries':('kaikki_aramaic','kaikki.org-dictionary-Aramaic-words.jsonl'),'hebrew-wiktionary':('hewiktionary','hewiktionary-latest-pages-articles.xml'),'omegawiki':('omegawiki','omegawiki-lexical-20230530.sql.gz')}
for fam,(k,fn) in other.items():
    src(fam,fn,'the corpus lane\'s disk (source cache)',nm[k]['bytes'],nm[k]['sha256'],NR+' (not on the store)',RECN%k)
src('wikidata-lexemes','(2 files, hashed as a set)','the corpus lane\'s disk (source cache)','2 files',nm['wikidata']['sha256_of_the_set']+' (sha256 of the set)',NR,RECN%'wikidata')
src('hebrew-wordnet','(8 files, hashed as a set)','the corpus lane\'s disk (source cache)','8 files',nm['wordnet']['sha256_of_the_set']+' (sha256 of the set)',NR,RECN%'wordnet')
_j=json.load(open(D+'/word-senses/jastrow-word-senses-v2/word-senses-receipt-v2.json'))['inputs']['records']
src('jastrow','jastrow-dictionary-entries.jsonl (an extract of Sefaria\'s dump)','the corpus lane\'s disk (source cache, sefaria-dump-2026-07-14)',_j['bytes'],_j['sha256'],NR+' (not on the store)','data/word-senses/jastrow-word-senses-v2/word-senses-receipt-v2.json inputs.records')
for fam in ('kethoneth-yoseph','panlex','conceptnet','muse','hebrew-wikipedia-titles','lexibank','english-wikipedia-openings','samaritan'):
    src(fam,'(no file of this source as received was found named with a sha256 in the tree)','the corpus lane\'s disk','','none found',NR,'none found by this pass (every JSON record under reader/data was searched for a 64-hex value beside a file of this source)','none')
ledg=collections.defaultdict(list)
for r in man:
    if r['group'].startswith('ledger '): ledg[r['name']].append(r)
for f in kinds['families']:
    fid=f['id']; tag=fid+(' (one of the twelve)' if f['kind']=='bible' else ' (off by default)')
    rb=rows_by.get(fid)
    add(tag,'rows served today, by source record','(a count, not a file)','tree: reader/data/route-store/shards/' if f.get('shelf')=='store' else 'tree: reader/data/overlays/',(rb['rows_served']+' rows') if rb else '','','', rb['source_records'] if rb else '', 'the shards are held by check-store-pinned-v1' if f.get('shelf')=='store' else 'check-overlays-v1')
    for (file,where,by,rec,today,pin,chk) in famsrc.get(fid,[]):
        add(tag,'the source as received',file,where,by,rec,today,pin,chk)
    for key in f['keys']:
        for r in ledg.get(key,[]):
            add(tag,'the corpus lane\'s ledger for the source ('+r['group'].replace('ledger ','')+')',os.path.basename(r['where']),'tree: '+os.path.dirname(r['where'])+'/',r['bytes'],r['sha256_recorded'],r['sha256_today'],'data/ledgers-v1/manifest.json; data/route-store/index.json ledgers.sources; data/ledger-divisions-receipt-v1.json','check-ledger-divisions-v1 D2 (each ledger\'s files are the bytes the index and the manifest pin)')
famkeys={k for f in kinds['families'] for k in f['keys']}
for key,rs in ledg.items():
    if key in famkeys: continue
    for r in rs:
        add(key+' (a ledger of a source no family of the record serves)','the corpus lane\'s ledger for the source ('+r['group'].replace('ledger ','')+')',os.path.basename(r['where']),'tree: '+os.path.dirname(r['where'])+'/',r['bytes'],r['sha256_recorded'],r['sha256_today'],'data/ledgers-v1/manifest.json','check-ledger-divisions-v1 D2')
# ---------- what every family rides on ----------
ix=json.load(open(D+'/route-store/index.json'))
sizes={'three-lane-successor-lprms-compcell-l-distinct-r-breadth-v1-k-r-routes.csv.gz':21435714,'three-lane-successor-lprms-rdm-compact-successor-v1-d-identities.csv.gz':8212265,'three-lane-successor-lprms-rdm-compact-successor-v1-m-identities.csv.gz':4936,'three-lane-successor-lprms-rdm-compact-successor-v1-r-identities.csv.gz':4665855}
for i in ix['inputs']:
    add('all 27 families of the store','one of the four inputs the first store was built from',i['file'],'store: v2/corpus/pinned/route-store-inputs-of-the-first-store/',sizes[i['file']],i['sha256'],i['sha256']+' (fetched from the store and hashed)','data/route-store/index.json inputs; each zone: emitted_from.gloss_layer.store_inputs','none hashes them (off the tree); no tool of the tree builds today\'s store from them (tools/build-route-store.mjs writes the first store\'s shape)')
add('all 27 families of the store','the hash the store index calls declarations_sha256','(unknown: no tool of the tree reads or writes the field)','no file of the tree holds these bytes; tools/declarations-v1.json hashes otherwise today','','d235ed2a6d9761d6538b7f28fbf9d9cdcb05327e157684b6e67c33de37a97e62','b6e20e1dbcf7ba3acfd36bd9efe41305ed302f83d479827cdddb10ea3de643e8 is tools/declarations-v1.json today (suspected to be the file meant; not verified)','data/route-store/index.json declarations_sha256','none')
for r in man:
    if r['group']=='route store file':
        add('all 27 families of the store','a file of the served store ('+('a shard' if r['name'].startswith('shards/') else 'beside the shards')+')',r['name'],'tree: reader/data/route-store/',r['bytes'],r['sha256_recorded'],r['sha256_today'],'data/route-store/store-manifest-v1.json','check-store-pinned-v1 (every pinned file is exactly its pin, and nothing serves beside the pins)')
for r in tsv('dictionary-store-shards-vs-store.tsv'):
    add('the dictionary store (whole entries of the dictionaries)','a served shard',r['shard'],'tree: reader/data/dictionary-store/shards/ ; the corpus lane\'s own: store v2/corpus/dictionary-store/v1.3/build/dictionary-store-v1.3/serve/shards/',r['bytes'],'no sha256 of it is recorded in the tree',r['sha256_tree_today']+(' (the same bytes as the store\'s object today)' if r['verdict']=='MATCH' else ' (NOT the store\'s bytes)'),'none','none re-hashes it; tools/bake-dictionary-store-v1.mjs held it to the lane\'s list when it was copied')
for r in tsv('unpinned-data-files.tsv'):
    p=r['path']
    for grp,what in (('reader/data/piece-store/','the piece store (TAHOT\'s and MACULA\'s pieces at each place)'),('reader/data/source-suggested/','the source-suggested record'),('reader/data/hud-toggles/','the HUD toggles record'),('reader/data/run-cards/','the run cards record')):
        if p.startswith(grp) and not p.endswith('index.json'):
            add(what,'a served file with no pin',os.path.basename(p),'tree: '+grp,r['bytes'],'no sha256 of it is recorded in the tree',r['sha256_today'],'none','none re-hashes it')
for r in man:
    if r['group'].startswith('overlay '):
        add(('jastrow' if 'jastrow' in r['group'] else 'samaritan')+' (off by default)','a file of the overlay beside the store',r['name'],'tree: '+os.path.dirname(r['where'])+'/',r['bytes'],r['sha256_recorded'],r['sha256_today'],r['pinned_in'],'check-overlays-v1')
# ---------- the corpus lane's lists: pins ----------
r2c={r['record']:r for r in tsv('record-to-checks.tsv')}
def checks_for(pin):
    k=pin.replace('reader/','')
    if 'word-senses' in k: k='data/word-senses/*/PIN.json'
    r=r2c.get(k)
    if not r: return ''
    names=[x.rstrip('*') for x in r['names'].split('; ') if x.endswith('*')]
    return 'read only as the bytes the pin names (tools/pinned-v1.mjs); checks that hash: '+', '.join(n.replace('.mjs','') for n in names[:6])
for r in tsv('pin-entries-rehash.tsv'):
    if r['verdict']=='MATCH':
        add('the corpus lane\'s lists (relays)','a file kept byte for byte beside its pin',r['name'],'tree: '+os.path.dirname(r['tree_file'])+'/',r['bytes'],r['sha256'],r['sha256_today'],r['pin']+' '+r['json_path'],checks_for(r['pin']))
done=set()
for r in pinned_inputs:
    if r['group']=='default picks book file': continue
    add('the corpus lane\'s lists (relays)','a pinned list that stays on the store',r['file'],'store: '+os.path.dirname(r['store_key'])+'/',r['bytes_recorded'],r['sha256_recorded'],r['sha256_today']+' (fetched from the store and hashed)',r['pinned_in'],'none reaches the store; a tool reads its local copy only as the pinned bytes (tools/pinned-v1.mjs)')
    done.add(r['sha256_recorded'])
for r in tsv('pin-entries-rehash.tsv'):
    if r['verdict']=='NOT_IN_TREE' and r['name'] and 'letter' not in r['json_path'] and r['sha256'] not in done and 'not_kept' not in r['json_path'] and 'UBS' not in r['name'] and 'ubs-sdbh' not in r['name']:
        add('the corpus lane\'s lists (relays)','a pinned file that is not in the tree',r['name'],'the store or the corpus lane\'s disk (not fetched)',r['bytes'],r['sha256'],NR,r['pin']+' '+r['json_path'],'none reaches it')
hdr=['family_or_book','role_in_the_chain','file','where_it_stands','bytes','sha256_recorded','sha256_today','pinned_in','checked_by']
with open(W+'/pins.tsv','w',encoding='utf8') as f:
    f.write('\t'.join(hdr)+'\n')
    for r in out: f.write('\t'.join(str(x).replace('\t',' ').replace('\n',' ') for x in r)+'\n')
c=collections.Counter()
for r in out:
    t=r[6]
    if t.startswith(NR): c['not re-hashed']+=1
    elif t=='' : c['no hash column (a count)']+=1
    else: c['re-hashed or made again today']+=1
print(len(out), dict(c))
c2=collections.Counter(r[1] for r in out)
for k,v in c2.most_common(60): print(v,k)
