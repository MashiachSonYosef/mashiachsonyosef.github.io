# Parses the four TAHOT files (as received, read only) into one JSONL of word rows.
# Run: python3 -I parse_tahot.py <dl-step dir> <out jsonl>
import sys, os, re, json, collections
src, out = sys.argv[1], sys.argv[2]
files = ['TAHOT_Gen-Deu', 'TAHOT_Jos-Est', 'TAHOT_Job-Sng', 'TAHOT_Isa-Mal']
ref_re = re.compile(r'^([1-3]?[A-Za-z]{2,3})\.(\d+)\.(\d+)(?:\(([^)]*)\))?#(\d+)(?:\.(\d+))?=(.*)$')
n = 0; bad = []; cols = collections.Counter(); types = collections.Counter()
with open(out, 'w', encoding='utf-8') as o:
    for f in files:
        name = [x for x in os.listdir(src) if x.startswith(f)][0]
        for ln, line in enumerate(open(os.path.join(src, name), encoding='utf-8').read().split('\n'), 1):
            if not line or line[0] == '#' or '\t' not in line: continue
            p = line.rstrip('\r').split('\t')
            m = ref_re.match(p[0])
            if not m:
                if re.match(r'^[1-3]?[A-Z][a-z]{1,2}\.\d', p[0]): bad.append((name, ln, p[0]))
                continue
            cols[len(p)] += 1
            types[m.group(7)] += 1
            p += [''] * (12 - len(p))
            rec = dict(file=f, line=ln, ref=p[0], book=m.group(1), ch=int(m.group(2)), vs=int(m.group(3)), heb=m.group(4), w=int(m.group(5)), sub=m.group(6), type=m.group(7),
                       hebrew=p[1], translit=p[2], tr=p[3], ds=p[4], gram=p[5], mv=p[6], sv=p[7], root=p[8], alt=p[9], conj=p[10], exp=p[11])
            o.write(json.dumps(rec, ensure_ascii=False) + '\n'); n += 1
print('rows', n, 'cols', dict(cols), 'bad', bad[:20], len(bad))
print('types', types.most_common(60))
