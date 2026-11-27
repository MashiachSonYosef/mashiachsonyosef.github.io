# Reads the 39 book zones and their resting lines (read only) and writes one JSONL of every entry.
# Run: python3 dump_zones.py <reader/data dir> <out jsonl>
import sys, json, gzip, os
data, out = sys.argv[1], sys.argv[2]
order = json.load(open(os.path.join(data, 'book-order-v1.json')))['files']
print(len(order), order)
n = 0; nw = 0
with open(out, 'w', encoding='utf-8') as o:
    for b in order:
        z = json.load(gzip.open(os.path.join(data, 'zones', b + '.bin')))
        rl = json.load(gzip.open(os.path.join(data, 'resting-lines', b + '.json.gz')))
        rls = {lab: rows for lab, rows in rl['sections']}
        j = 0
        for si, sec in enumerate(z['sections']):
            lines = {}
            for row in rls.get(sec['label'], []):
                lines[row[0]] = row
            for i, w in enumerate(sec.get('words', [])):
                n += 1
                if w.get('mark'): continue
                j += 1; nw += 1
                rec = dict(book=b, label=sec['label'], unit=sec.get('unit'), i=i, j=j)
                for f in ('s', 'k', 'pg', 'tg', 'w', 'kq', 'kq_trivial', 'ld', 'te', 'np', 'h', 'hp', 'hg', 'after_maqaf'):
                    if f in w: rec[f] = w[f]
                if 'presentation_join' in w and w['presentation_join'].get('join_next_without_separator'): rec['mq'] = 1
                if i in lines: rec['line'] = lines[i][1:]
                o.write(json.dumps(rec, ensure_ascii=False) + '\n')
print('entries', n, 'words', nw)
