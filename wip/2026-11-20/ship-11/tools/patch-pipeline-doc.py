# Ship 11a: PIPELINE.md says what the names pin now holds and that UBS's collocation rows follow the names.
import sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
def rep(old, new):
    global t
    assert t.count(old) == 1, (t.count(old), old[:60])
    t = t.replace(old, new)
rep('''> it as a name (`tools/apply-name-rows-v1.mjs`, from the lists kept in
> `data/names/`). The round's projection''',
'''> it as a name (`tools/apply-name-rows-v1.mjs`, from the lists kept in
> `data/names/`: since 20 November 2026 the list of name rows is names
> v2's, relay v198, every dictionary that marks a name read by its own
> mark, and the list of name places is still names v1's; the pin gives each
> its own folder, rule and receipt). The round's projection''')
rep('''> pill into the reading its resolution prints). Call 4:''',
'''> pill into the reading its resolution prints). The category holds no
> name row, so a new list of name rows is followed by the category derived
> and laid again, before the round (names v2: three rows relay v188 landed
> were marked names and left it, 2,646 rows on 762 keys);
> `tools/check-dictionary-kinds-v1.mjs` K6 refuses a store where a row
> carries its collocations beside a name. Call 4:''')
open(p, 'w', encoding='utf-8').write(t)
print('PIPELINE.md patched')
