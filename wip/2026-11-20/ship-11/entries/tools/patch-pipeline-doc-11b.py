# Ship 11b: PIPELINE.md says the entries now come from row entries v1.2, its kept struck lines, and the lists.
import sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
def rep(old, new):
    global t
    assert t.count(old) == 1, (t.count(old), old[:60])
    t = t.replace(old, new)
rep('''> (`tools/apply-row-entries-v1.mjs`, from the corpus lane's row entries
> ledger, which stays on the lane's store and is named in
> `data/row-entries/` by its size and sha256) and whether''',
'''> (`tools/apply-row-entries-v1.mjs`, from the corpus lane's row entries
> ledger, which stays on the lane's store and is named in
> `data/row-entries/` by its size and sha256; since 20 November 2026 the
> ledger is v1.2, relay v197, read from the store as served, with the lines
> of the rows struck before it was read kept beside it for the twin of a
> struck row; and from the facts lists the pin names under `lists`, the
> entry ledgers of relays v203 and v204, which give a row of a source that
> names no entry the numbers of the Bible dictionaries' entries its own
> pointed head form meets: the numbers land, and STEP's letters and BDB's
> entries from a list are counted and not written, as the pin says) and whether''')
open(p, 'w', encoding='utf-8').write(t)
print('PIPELINE.md patched for the entries')
