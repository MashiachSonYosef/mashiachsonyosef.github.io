# Ship 11c: the pin of the landings (data/landings/PIN.json), the lane's lists copied beside it. The derived lists'
# bytes are filled from a dry derivation (given as JSON on the command line, id -> the figures' files), or left empty.
import sys, json, hashlib, os, shutil
S, READER = sys.argv[1], sys.argv[2]
DER = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
HOME = os.path.join(READER, 'data', 'landings')
def ent(path, lines=False, **more):
    b = open(path, 'rb').read(); e = {'file': os.path.basename(path), 'bytes': len(b), 'sha256': hashlib.sha256(b).hexdigest()}
    if lines: e['lines'] = b.count(b'\n')
    e.update(more); return e
def keep(path, folder):
    os.makedirs(os.path.join(HOME, folder), exist_ok=True); shutil.copyfile(path, os.path.join(HOME, folder, os.path.basename(path)))
RULE = "landings-rule-v1-a-landing-list-lands-as-its-own-rule-reads-on-the-store-it-meets-each-line-at-the-rank-its-list-gives-or-after-the-last-row-of-its-key-and-a-line-its-own-source-already-prints-is-named-not-landed"
SRC = [
 ('whole-renderings-v1', 'v201', S+'/dl-v201-data/v2/ledgers/all/store-lists/whole-renderings-v1/', 'whole-renderings-v1.jsonl', 'r2:mishkan/v2/letters/moses-store-lists-v1/FOR-ELIJAH-v201.md', 'r2:mishkan/v2/ledgers/all/store-lists/whole-renderings-v1/',
  "Strong's two whole renderings whose halves are withheld (15 lines, Strong's concordance list): each lands at the rank its record's other renderings stand at, after them"),
 ('call5-returns-v1', 'v200', S+'/dl-v200-data/v2/ledgers/all/audit-calls/call5-returns-v1/', 'call5-returns-v1.jsonl', 'r2:mishkan/v2/letters/moses-audit-calls-v1/FOR-ELIJAH-v200.md', 'r2:mishkan/v2/ledgers/all/audit-calls/call5-returns-v1/',
  "call 5's rows whose words only another source held under the plain key, back under the plain key each with its own source (1,294 lines), and two of relay v188's three lines under a key with a maqaf, reissued under the plain key"),
 ('bridge-form-rows-v1', 'v202', S+'/dl-v202-data/v2/ledgers/all/spelling-bridge/bridge-v1/', 'form-rows-v1.jsonl', 'r2:mishkan/v2/letters/moses-spelling-bridge-v1/FOR-ELIJAH-v202.md', 'r2:mishkan/v2/ledgers/all/spelling-bridge/bridge-v1/',
  "STEP's own rows under our text's spelling, where STEP's spelling column writes the word as our text spells it (167 lines under 149 keys, for 220 places)"),
]
lists = []
for i, (lid, relay, d, f, letter, frm, what) in enumerate(SRC):
    for x in ('RULE.md', 'receipt-v1.json', f): keep(d + x, lid)
    der = {x['file'].split('/')[-1]: x for x in DER.get(lid, [])}
    def dent(name):
        x = der.get(name)
        return {'file': name, 'bytes': x['bytes'], 'sha256': x['sha256'], 'lines': x['lines'], 'by': 'tools/derive-landings-v1.mjs'} if x else {'file': name, 'bytes': 0, 'sha256': '', 'lines': 0, 'by': 'tools/derive-landings-v1.mjs'}
    lists.append({'id': lid, 'relay': relay, 'of': '20 November 2026', 'what': what, 'letter': letter, 'from': frm + ' (the private store)', 'folder': lid,
      'rule': ent(d + 'RULE.md'), 'receipt': ent(d + 'receipt-v1.json'), 'list': ent(d + f, lines=True), 'read_at_store_version': '54416ff5785b',
      'lands_after': SRC[i-1][0] if i else None,
      'derived': {'folder': 'derived', 'landed': dent('land-' + lid + '.jsonl'), 'not_landed': dent('not-landed-' + lid + '.jsonl')},
      'landed_by': {'tool': 'tools/strike-rows-v1.mjs', 'reason': f"the corpus lane's relay {relay} (20 November 2026): " + what}})
pin = {'schema_version': 'LANDINGS_PIN_V1', 'rule_id': RULE,
  'what': "the corpus lane's landing lists that need no ruling, each kept here byte for byte in its own folder with its rule and receipt; and, derived from each here on the store as it stands when its turn comes, the list the page lands and the list of its lines the page does not land (tools/derive-landings-v1.mjs). tools/strike-rows-v1.mjs lands each derived list, in this order; the facts a line names go onto its row at the landing, and the tools that lay the lane's facts leave them to it",
  'lists': lists}
os.makedirs(HOME, exist_ok=True)
open(os.path.join(HOME, 'PIN.json'), 'w', encoding='utf-8').write(json.dumps(pin, ensure_ascii=False, indent=1) + '\n')
print('landings pin written:', [(l['id'], l['list']['lines']) for l in lists])
