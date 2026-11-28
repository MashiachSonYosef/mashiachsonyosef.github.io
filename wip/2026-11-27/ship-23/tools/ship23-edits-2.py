# Ship 23, second edit (found by the round's switches step): the switches page says the word senses pill and the row
# of suggested sources stand on every book page, and refuses to publish when they are not drawn there. Since the
# place card stands at rest they belong to the card matched by spelling (zone.html CARD_ONLY), so the page says that,
# and refuses if either is drawn at rest. Usage: python3 -I ship23-edits-2.py <tree root>
import sys, pathlib
p = pathlib.Path(sys.argv[1]) / "reader/tools/build-toggle-design-v1.mjs"
s = p.read_text(encoding="utf-8")
def rep(old, new):
    global s
    assert s.count(old) == 1, old[:70]
    s = s.replace(old, new, 1)
rep('''    ["suggested", "on every book page"],
    ["senses", "on every book page, its pill in the row of pills"],
''', '')
rep('''  // WHAT A BOOK PAGE SERVES, SEEN THERE:''', '''  // THE OLDER CARD'S SWITCHES (28 November 2026). Since the place card stands at rest, the word senses pill and the
  // row of suggested sources belong to the card of readings matched by spelling (zone.html CARD_ONLY): a book page
  // draws them only with that switch on. They are said so, and the page is refused if either is drawn at rest.
  const OLDER = new Map([
    ["suggested", "on a book page with «readings matched by spelling» on"],
    ["senses", "on a book page with «readings matched by spelling» on, its pill in the row of pills"],
  ]);
  // WHAT A BOOK PAGE SERVES, SEEN THERE:''')
rep('''  const servedWrong = [...seenServed.filter((id) => !SERVED.has(id)).map((id) => `${id} is drawn on a book page and would be said drawn only with the switches`),''',
'''  const servedWrong = [...seenServed.filter((id) => !SERVED.has(id) && !OLDER.has(id)).map((id) => `${id} is drawn on a book page and would be said drawn only with the switches`),
    ...seenServed.filter((id) => OLDER.has(id)).map((id) => `${id} is drawn at rest and would be said ${OLDER.get(id)}`),''')
rep('''  const tryIt = (t) => `<p class="try">${SERVED.get(t.id) || "drawn only with the switches"}''',
    '''  const tryIt = (t) => `<p class="try">${SERVED.get(t.id) || OLDER.get(t.id) || "drawn only with the switches"}''')
p.write_text(s, encoding="utf-8")
print("edit applied")
