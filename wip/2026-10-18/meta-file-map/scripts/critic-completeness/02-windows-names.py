# Keys a Windows restore cannot write as-is: forbidden characters, reserved device names, segments ending in
# a dot or a space. Read-only over the local listing.
import json, re, sys
BAD = set('<>:"|?*\\')
RES = re.compile(r'^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$', re.I)
c = {'forbidden_char': [], 'reserved_name': [], 'ends_dot_or_space': []}
by = {k: 0 for k in c}
for line in open(sys.argv[1], encoding='utf-8'):
    k, sz = line.split('\t')[:2]
    segs = k.split('/')
    if any(ch in BAD or ord(ch) < 32 for ch in k): c['forbidden_char'].append(k); by['forbidden_char'] += int(sz)
    if any(RES.match(s) for s in segs): c['reserved_name'].append(k); by['reserved_name'] += int(sz)
    if any(s.endswith(('.', ' ')) for s in segs if s): c['ends_dot_or_space'].append(k); by['ends_dot_or_space'] += int(sz)
print(json.dumps({k: {'keys': len(v), 'bytes': by[k], 'examples': v[:3]} for k, v in c.items()}, indent=1, ensure_ascii=False))
