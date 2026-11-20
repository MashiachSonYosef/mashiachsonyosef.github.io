import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new)
rep('''//   C5  the word of a chain or a pair the card is not open on is the red at
//       the regular weight, beside the open word's bold
''', '''//   C5  the word of a chain or a pair the card is not open on is the red at
//       the regular weight, beside the open word's bold. Since 20 November
//       2026 a word of a chain opens its own card at rest (words-stand-
//       alone-rule-v1), so a chain's head is met on the first page asked
//       «as written» (?maqaf=maqaf), read once more for it
''')
rep('''for (const [k, url] of URLS.entries()) for (const dict of k === 0 ? ["off", "on"] : ["off"]) {
''', '''// the first page with the concordance off and on, and once more asked «as written», for the chains' heads (C5)
const LOADS = URLS.flatMap((url, k) => (k === 0 ? [[url, "off"], [url, "on"], [`${url}${url.includes("?") ? "&" : "?"}maqaf=maqaf`, "off"]] : [[url, "off"]]));
for (const [url, dict] of LOADS) {
''')
rep('''    const tag = `${url.split("b=")[1] || url} word ${i + 1}${dict === "on" ? " concordance" : ""}`;
''', '''    const tag = `${(url.split("b=")[1] || url).replace("&maqaf=maqaf", " as written")} word ${i + 1}${dict === "on" ? " concordance" : ""}`;
''')
open(p, 'w', encoding='utf-8').write(s)
print('ok', any(0x590 <= ord(c) <= 0x5ff for c in s))
