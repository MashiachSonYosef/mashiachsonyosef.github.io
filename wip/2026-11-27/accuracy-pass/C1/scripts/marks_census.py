# Counts every non-letter, non-digit, non-space character in each source's own readings and in our served rows.
# Run: python3 -I marks_census.py <out dir>
import sys, os, json, re, collections, gzip, unicodedata
outdir = sys.argv[1]
def census(texts):
    occ = collections.Counter(); cells = collections.Counter(); ex = {}
    n = 0
    for t in texts:
        n += 1
        seen = set()
        for ch in t:
            if ch.isalnum() or ch == ' ': continue
            occ[ch] += 1
            if ch not in seen: seen.add(ch); cells[ch] += 1
            if ch not in ex or (len(ex[ch]) < 3 and t not in ex[ch]): ex.setdefault(ch, []).append(t) if len(ex.get(ch, [])) < 3 else None
    return n, occ, cells, ex
res = {}
# TAHOT
tr = []; 
for l in open(os.path.join(outdir, 'data', 'tahot-rows.jsonl'), encoding='utf-8'): tr.append(json.loads(l)['tr'])
res['tahot_source'] = census(tr)
m4 = [json.loads(l)['row'][1] for l in open(os.path.join(outdir, 'data', 'rows-M4.jsonl'), encoding='utf-8')]
res['tahot_served_rows'] = census(m4)
pieces = []; lines = []
for l in open(os.path.join(outdir, 'data', 'zone-words.jsonl'), encoding='utf-8'):
    z = json.loads(l)
    pg = z.get('pg')
    if pg and all(p.get('s') == 'tahot' for p in pg): pieces.append('/'.join(str(p['g']) for p in pg))
    ln = z.get('line')
    if ln and ln[2] == 'PIECE:TAHOT': lines.append(ln[1])
res['tahot_pieces_on_words'] = census(pieces)
res['tahot_lines_at_rest'] = census(lines)
# TBESH
ents = json.load(open(os.path.join(outdir, 'data', 'tbesh-entries.json')))
res['tbesh_source'] = census([e['gloss'] for e in ents])
res['tbesh_served_rows'] = census([json.loads(l)['row'][1] for l in open(os.path.join(outdir, 'data', 'rows-M19.jsonl'), encoding='utf-8')])
# MACULA
mac = [l.rstrip('\n').split('\t')[1] for l in gzip.open(os.path.join(outdir, 'data', 'macula-pairs.tsv.gz'), 'rt', encoding='utf-8')]
res['macula_source_distinct_pairs'] = census(mac)
res['macula_served_rows'] = census([json.loads(l)['row'][1] for l in open(os.path.join(outdir, 'data', 'rows-M3.jsonl'), encoding='utf-8')])
out = {}
for name, (n, occ, cells, ex) in res.items():
    print('==', name, 'texts', n)
    out[name] = {'texts': n, 'marks': {}}
    for ch, v in occ.most_common():
        nm = unicodedata.name(ch, '?')
        print(f'   {ch!r:>8} U+{ord(ch):04X} {nm[:34]:<34} occurrences {v:>7}  texts {cells[ch]:>7}   e.g. {ex[ch][:3]}')
        out[name]['marks'][ch] = {'name': nm, 'occurrences': v, 'texts': cells[ch], 'examples': ex[ch][:3]}
json.dump(out, open(os.path.join(outdir, 'data', 'marks-census.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
