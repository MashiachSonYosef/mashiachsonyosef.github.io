import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
old = '''      : surface && surface !== openKey && openPlaceWord ? { pointed: null, verse: null, tags: coreTagsAt(openPlaceWord, surface), name: openName } : NO_WORD));
'''
new = old + '''  // for a check to ask instead of a copy of it: what the open card asks a form as (check-words-stand-alone-v1 A4)
  window.__askedWord = (surface) => { const W = askedWord(surface); return { pointed: W.pointed, verse: W.verse, tags: W.tags ? [...W.tags] : null, name: W.name }; };
'''
assert s.count(old) == 1
s = s.replace(old, new)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
