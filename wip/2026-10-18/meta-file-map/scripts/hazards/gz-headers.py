# Read the first 512 bytes of each sampled object (dl/gzhead) and classify its container header (local only).
# Run: python3 -I gz-headers.py -> gz-header-summary.json, gz-headers.tsv
import json, os, struct, collections, datetime
H = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/hazards'
D = H + '/dl/gzhead'
keys = [json.loads(l) for l in open(H + '/gz-sample-keys.txt', encoding='utf-8')]
OS = {0: 'FAT/Windows', 3: 'Unix', 10: 'NTFS', 11: 'NTFS', 255: 'unknown', 7: 'Mac', 11: 'NTFS'}
rows = []; c = collections.Counter(); osc = collections.Counter(); mt = collections.Counter(); fname = collections.Counter(); xfl = collections.Counter()
by_ext = collections.defaultdict(collections.Counter); sizes = collections.Counter()
for k in keys:
    b = open(os.path.join(D, k), 'rb').read(); sizes[len(b) <= 512] += 1
    ext = k.rsplit('.', 2)[-2:] if k.count('.') else ['']
    ext = '.' + '.'.join(ext)
    if b[:2] == b'\x1f\x8b':
        flg = b[3]; mtime = struct.unpack('<I', b[4:8])[0]; x = b[8]; o = b[9]
        name = ''
        if flg & 4: xlen = struct.unpack('<H', b[10:12])[0]; p = 12 + xlen
        else: p = 10
        if flg & 8: e = b.index(b'\0', p); name = b[p:e].decode('latin-1')
        kind = 'gzip'
        c['gzip'] += 1; osc[OS.get(o, str(o))] += 1; mt['mtime=0' if mtime == 0 else 'mtime set'] += 1; fname['FNAME set' if flg & 8 else 'no FNAME'] += 1
        xfl[{0: '0 (default level)', 2: '2 (max compression, level 9)', 4: '4 (fastest, level 1)'}.get(x, str(x))] += 1
        by_ext[ext]['gzip os=%s mtime=%s fname=%s xfl=%d' % (OS.get(o, o), 'set' if mtime else '0', 'y' if flg & 8 else 'n', x)] += 1
        rows.append((k, kind, OS.get(o, o), datetime.datetime.fromtimestamp(mtime, datetime.timezone.utc).isoformat() if mtime else '0', x, flg, name))
    elif b[:4] == b'PK\x03\x04':
        c['zip'] += 1; by_ext[ext]['zip'] += 1; rows.append((k, 'zip', '', '', '', '', ''))
    elif b[:4] == b'\x28\xb5\x2f\xfd':
        c['zstd'] += 1; by_ext[ext]['zstd'] += 1; rows.append((k, 'zstd', '', '', '', '', ''))
    elif b[:6] == b'\xfd7zXZ\x00':
        c['xz'] += 1; by_ext[ext]['xz'] += 1; rows.append((k, 'xz', '', '', '', '', ''))
    else:
        kind = 'not compressed: ' + repr(b[:12])[:40]; c['other'] += 1; by_ext[ext]['other ' + repr(b[:6])] += 1; rows.append((k, 'other', '', '', '', '', repr(b[:16])))
with open(H + '/gz-headers.tsv', 'w', encoding='utf-8') as f:
    f.write('key\tkind\tgzip_os\tgzip_mtime_utc\tgzip_xfl\tgzip_flg\tgzip_fname\n')
    for r in rows: f.write('\t'.join(str(x) for x in r) + '\n')
out = {'sampled': len(keys), 'range_read_honored (<=512 bytes back)': sizes[True], 'kinds': dict(c), 'gzip_os_byte': dict(osc), 'gzip_mtime': dict(mt), 'gzip_fname': dict(fname), 'gzip_xfl': dict(xfl),
       'by_ext': {e: dict(v) for e, v in sorted(by_ext.items())}}
json.dump(out, open(H + '/gz-header-summary.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(out, ensure_ascii=False, indent=1))
