import sys
root = sys.argv[1]
def patch(path, reps):
    p = root + '/' + path
    s = open(p, encoding='utf-8').read()
    for old, new in reps:
        assert s.count(old) == 1, (path, s.count(old), old[:90])
        s = s.replace(old, new)
    open(p, 'w', encoding='utf-8').write(s)
    print('patched', path)
patch('tools/check-run-cards-v1.mjs', [
('''await p.addInitScript(() => { try { localStorage.setItem("fh.runs", "own"); } catch { /* a device that remembers nothing still reads */ } });
''', '''// (the joined words as written too: since 20 November 2026 they rest as separate words, words-stand-alone-rule-v1,
// and a run's card over a chain is the reader's to ask for, as the license runs are)
await p.addInitScript(() => { try { localStorage.setItem("fh.runs", "own"); localStorage.setItem("fh.maqaf-join", "maqaf"); } catch { /* a device that remembers nothing still reads */ } });
'''),
])
patch('tools/check-run-card-forms-v1.mjs', [
('''await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh reader */ } });
''', '''// (a fresh reader who asked for the joined words as written: since 20 November 2026 they rest as separate words,
// words-stand-alone-rule-v1, and a chain's card with its forms is the reader's to ask for)
await p.addInitScript(() => { try { localStorage.clear(); localStorage.setItem("fh.maqaf-join", "maqaf"); } catch { /* fresh reader */ } });
'''),
])
