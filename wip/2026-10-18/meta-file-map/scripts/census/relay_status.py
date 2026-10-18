# _relay-status.tsv: every relay the corpus lane's own inventory lists (inventory-local/out/build-folders.jsonl,
# 17 Oct), with its first status line and its READY-or-not line.  Run: python3 -I relay_status.py > ../_relay-status.tsv
import json
D = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/clean/dl/corpus-lane-builds/moses-delete-ledger-v1'
for l in open(D + '/inventory-local/out/build-folders.jsonl', encoding='utf-8'):
    b = json.loads(l)
    for r in b['relays']:
        s = r.get('status_first_line') or {}; rn = r.get('ready_or_not') or {}
        print('\t'.join([b['build_folder'], r['path'], str(r.get('draft')), str(s.get('token')), (s.get('head') or '').replace('\t', ' ')[:200], str(rn.get('token')), (rn.get('head') or '').replace('\t', ' ')[:120]]))
