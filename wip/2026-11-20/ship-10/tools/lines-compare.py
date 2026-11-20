import json, sys
a = json.load(open(sys.argv[1])); b = json.load(open(sys.argv[2]))
la = dict((l, r) for l, r in a['lines']); lb = dict((l, r) for l, r in b['lines'])
same = diff = 0; ex = []
ja = jb = 0
for lab in la:
    ra = [x for x in la[lab] if not x.startswith('J:')]; rb = [x for x in lb.get(lab, []) if not x.startswith('J:')]
    ja += sum(1 for x in la[lab] if x.startswith('J:')); jb += sum(1 for x in lb.get(lab, []) if x.startswith('J:'))
    if ra == rb: same += 1
    else:
        diff += 1
        if len(ex) < 12:
            import itertools
            d = [(x, y) for x, y in itertools.zip_longest(ra, rb) if x != y][:3]
            ex.append((lab, len(ra), len(rb), d))
print('sections', len(la), 'same word rows', same, 'differ', diff, 'J rows', ja, jb)
for e in ex: print(e)
