# Ship 11b: the pin of row entries v1.2 with its struck lines, its moves list and the two entry ledgers' lists.
# Copies the small kept files into reader/data/row-entries and writes PIN.json there. Every hash is computed from
# the fetched bytes and held to the one its relay's letter names (given below, first 16 hex).
import sys, json, hashlib, os, shutil
S = sys.argv[1]; READER = sys.argv[2]
PINS = os.path.join(READER, 'data', 'row-entries')
A = S + '/dl-v197-data/v2/ledgers/all/row-entries/row-entries-v1.2/'
W = S + '/dl-v203-data/v2/ledgers/all/entry-ledger/wiktionary-v1/'
C = S + '/dl-v204-data/v2/ledgers/all/entry-ledger/classical-and-hebrew-wiktionary-v1/'
LETTER = { A+'RULE.md': '1f082ea0f433d29d', A+'receipt-v1.2.json': 'a73efcfed2697953', A+'row-entries-v1.2.jsonl': 'd13879e80cd45db5', A+'struck-lines-v1.2.jsonl': '8d942ddc872b183b',
  A+'facts-slot-v1.2.tsv': 'aadaf40123b97ef5', W+'RULE.md': 'e0437682a41d7702', W+'receipt-v1.json': 'b68dd8cbef618f9b', W+'facts-slot-wiktionary-v1.tsv': '4cb9e9ce6b30331e',
  W+'facts-slot-root-branch-wiktionary-v1.tsv': 'de076813f00b37a9', W+'pos-agreement-v1.json': '3306d52720c49210', C+'RULE.md': '2fe910a3de701422', C+'receipt-v1.json': 'ae14f47b5fa7710d',
  C+'facts-slot-v1.tsv': '5bc044bad2003f46', C+'facts-slot-held-v1.tsv': 'cee591d80bc603f5', C+'pos-tables-v1.json': 'eacff1e8531defe3' }
def ent(path, lines=False, header=False, **more):
    b = open(path, 'rb').read(); sha = hashlib.sha256(b).hexdigest()
    assert sha.startswith(LETTER[path]), (path, sha)
    e = {'file': os.path.basename(path), 'bytes': len(b), 'sha256': sha}
    if lines: e['lines'] = b.count(b'\n') - (1 if header else 0)
    e.update(more); return e
def keep(path, folder):
    os.makedirs(os.path.join(PINS, folder), exist_ok=True); shutil.copyfile(path, os.path.join(PINS, folder, os.path.basename(path)))
old = json.load(open(os.path.join(PINS, 'PIN.json'), encoding='utf-8'))
index = json.load(open(os.path.join(READER, 'data', 'route-store', 'index.json'), encoding='utf-8'))
src = lambda ms: {m: index['m_sources'][m]['key'] for m in ms}
r204 = json.load(open(C+'receipt-v1.json', encoding='utf-8'))['scope']
m204 = r204['classical_hebrew_words'] + [m for ms in r204['hebrew_wiktionary'].values() for m in ms]
assert len(m204) == r204['m_ids'] == 76
m203 = ['M11', 'M13', 'M25', 'M50', 'M60', 'M69', 'M72', 'M177']
for f in ('RULE.md', 'receipt-v1.2.json', 'struck-lines-v1.2.jsonl', 'facts-slot-v1.2.tsv'): keep(A+f, 'row-entries-v1.2')
for f in ('RULE.md', 'receipt-v1.json', 'pos-agreement-v1.json'): keep(W+f, 'entry-ledger-wiktionary-v1')
for f in ('RULE.md', 'receipt-v1.json', 'pos-tables-v1.json', 'facts-slot-v1.tsv'): keep(C+f, 'entry-ledger-classical-and-hebrew-wiktionary-v1')
NOT_LANDED = "STEP's letters (t) and BDB's own entries (b) are the two partings of ruling 6 of 13 November 2026, which names the sources whose rows each reads (TAHOT's and TBESH's; BDB's via Open Scriptures). On a row joined to an entry by its pointed head form they are counted and not written until the partings are ruled wider"
pin = {
 'schema_version': 'ROW_ENTRIES_PIN_V1',
 'what': "the corpus lane's row entries ledger: for each row of the fifteen sources that name their entries, the entry it belongs to as its own source says it, and the Strong's numbers of that entry; and, under lists, the facts lists of further sources, whose rows the corpus lane joins to the Bible dictionaries' entries by each row's own pointed head form and kind of word. Each rule and receipt is kept here byte for byte; the ledger itself is 25 MB and the larger list 9 MB, and they are kept on the corpus lane's store, named on the command line and read only if they are the bytes named here",
 'relay': 'v197', 'of': '20 November 2026',
 'letter': 'r2:mishkan/v2/letters/moses-row-entries-v1/FOR-ELIJAH-v197.md',
 'from': 'r2:mishkan/v2/ledgers/all/row-entries/row-entries-v1.2/ (the private store)',
 'folder': 'row-entries-v1.2',
 'rule': ent(A+'RULE.md'), 'receipt': ent(A+'receipt-v1.2.json'),
 'ledger': ent(A+'row-entries-v1.2.jsonl', lines=True, kept='r2:mishkan/v2/ledgers/all/row-entries/row-entries-v1.2/row-entries-v1.2.jsonl (the private store); not in this tree'),
 'struck_lines': ent(A+'struck-lines-v1.2.jsonl', lines=True, what="the lines of the rows a round struck before this ledger was read (it is read from the store as served, and holds a line for every served row and no other): the replaced ledger's line of each, with the round that took its row. tools/apply-row-entries-v1.mjs reads them for the twin of a struck row"),
 'moves': ent(A+'facts-slot-v1.2.tsv', lines=True, header=True, what="the rows whose facts this ledger gives otherwise than the store carried them as served when it was read: a header, then one line per row (key, rank, m_id, route_text, facts_now, facts_under_v1.2, what_changes, the_row). tools/check-entry-gate-v1.mjs (E14) holds the store to it"),
 'supersedes': {'relay': old['relay'], 'of': old['of'], 'folder': old['folder'], 'ledger': old['ledger'],
   'note': "this ledger is the superseded one's rule read again on the store as served, not a second reading of the same store: the two name different rows (4,664 struck, 45 re-keyed, 740 retexted and 3,039 landed between them), so the list of moves is held against the store and not against the superseded ledger"},
 'partings': old['partings'],
 'lists': [
  {'name': 'English Wiktionary', 'relay': 'v203', 'of': '20 November 2026', 'letter': 'r2:mishkan/v2/letters/moses-entry-ledger-v1/FOR-ELIJAH-v203.md',
   'from': 'r2:mishkan/v2/ledgers/all/entry-ledger/wiktionary-v1/ (the private store)', 'folder': 'entry-ledger-wiktionary-v1',
   'rule': ent(W+'RULE.md'), 'receipt': ent(W+'receipt-v1.json'), 'kinds_table': ent(W+'pos-agreement-v1.json'),
   'list': ent(W+'facts-slot-wiktionary-v1.tsv', lines=True, header=True, kept='r2:mishkan/v2/ledgers/all/entry-ledger/wiktionary-v1/facts-slot-wiktionary-v1.tsv (the private store); not in this tree'),
   'read_at_store_version': '54416ff5785b', 'facts': ['n'], 'facts_not_landed': NOT_LANDED, 'sources': src(m203),
   'held': [dict(ent(W+'facts-slot-root-branch-wiktionary-v1.tsv', lines=True, header=True), why="the root road is a branch, off at rest (the corpus lane's call, relay v203 section 6: a root is not a word); it lands only if the owner turns the branch on", kept='r2:mishkan/v2/ledgers/all/entry-ledger/wiktionary-v1/ (the private store); not in this tree')]},
  {'name': 'Classical Hebrew Words and Hebrew Wiktionary', 'relay': 'v204', 'of': '20 November 2026', 'letter': 'r2:mishkan/v2/letters/moses-entry-ledger-v1/FOR-ELIJAH-v204.md',
   'from': 'r2:mishkan/v2/ledgers/all/entry-ledger/classical-and-hebrew-wiktionary-v1/ (the private store)', 'folder': 'entry-ledger-classical-and-hebrew-wiktionary-v1',
   'rule': ent(C+'RULE.md'), 'receipt': ent(C+'receipt-v1.json'), 'kinds_table': ent(C+'pos-tables-v1.json'),
   'list': ent(C+'facts-slot-v1.tsv', lines=True, header=True, kept='reader/data/row-entries/entry-ledger-classical-and-hebrew-wiktionary-v1/facts-slot-v1.tsv (in this tree)'),
   'read_at_store_version': '54416ff5785b', 'facts': ['n'], 'facts_not_landed': NOT_LANDED, 'sources': src(m204),
   'held': [dict(ent(C+'facts-slot-held-v1.tsv', lines=True, header=True), why="held by the corpus lane (relay v204 section 4): the source holds more words of that spelling and kind than the lexical index holds entries, so the word may be one the index does not list; one ruling lands them or leaves them", kept='r2:mishkan/v2/ledgers/all/entry-ledger/classical-and-hebrew-wiktionary-v1/ (the private store); not in this tree')]},
 ],
 'note': "every sha256 here is the one the relay's letter names for the file. Row entries v1.2 (relay v197) is v1.1's rule read on the store as served on 20 November 2026 (store 54416ff5785b): 380,633 rows of the fifteen sources, each at the key and rank where it stands. Against the store as served its list of moves gives 2,843 rows other facts: 2,829 rows relay v188 landed, which carried none, and 14 rows call 5 re-keyed.",
}
open(os.path.join(PINS, 'PIN.json'), 'w', encoding='utf-8').write(json.dumps(pin, ensure_ascii=False, indent=1) + '\n')
print('pin written:', pin['ledger']['lines'], 'ledger lines;', pin['struck_lines']['lines'], 'struck;', pin['moves']['lines'], 'moves;', [(l['relay'], l['list']['lines'], len(l['sources'])) for l in pin['lists']])
