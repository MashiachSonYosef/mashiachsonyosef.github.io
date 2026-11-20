# Ship 11b: the projector's sidecar names the facts lists the store's entries came from, beside the ledger, so a zone
# projected before a list landed is known stale (check-entry-gate-v1 E7 holds each sidecar to the pin's lists).
import sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
old = '''row_entries: store.index.row_entries ? { relay: store.index.row_entries.relay, ledger_sha256: store.index.row_entries.ledger.sha256 } : null },'''
assert t.count(old) == 1, t.count(old)
t = t.replace(old, '''row_entries: store.index.row_entries ? { relay: store.index.row_entries.relay, ledger_sha256: store.index.row_entries.ledger.sha256, ...(store.index.row_entries.lists ? { lists: store.index.row_entries.lists.map((l) => ({ relay: l.relay, list_sha256: l.list.sha256 })) } : {}) } : null },''')
open(p, 'w', encoding='utf-8').write(t)
print('projector patched')
