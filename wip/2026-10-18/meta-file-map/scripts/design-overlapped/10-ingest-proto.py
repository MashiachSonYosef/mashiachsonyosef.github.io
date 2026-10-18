# Prototype of the overlapped store on one real slice (the old-witness tables).
# Read only: it reads downloaded copies of R2 objects and writes only under OUT.
# Usage: python3 -I 10-ingest-proto.py OUT list.tsv
#   list.tsv: local_path<TAB>r2_key<TAB>expected_md5<TAB>expected_size<TAB>label   (in version order)
# Writes OUT/pack-0001.raw.xz (distinct row-anchored chunks, first-seen order, xz -6),
#        OUT/chunks.tsv (ordinal, offset, length, sha256), OUT/contents.jsonl (one record per distinct content),
#        OUT/diffs.jsonl (row-level differences between successive versions), OUT/proto-numbers.json
import sys, os, gzip, zlib, hashlib, json, struct, subprocess, time

OUT, LIST = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
MASK = 31          # a chunk ends after a line whose sha256 first byte & MASK == 0  (about 1 line in 32)
MIN_CHUNK = 4096   # never end a chunk before 4 KiB
MAX_CHUNK = 65536  # always end a chunk at the first line end past 64 KiB

def parse_gzip_header(b):
    if b[:2] != b"\x1f\x8b" or b[2] != 8:
        return None
    flg = b[3]; i = 10
    if flg & 4:
        xlen = struct.unpack("<H", b[i:i+2])[0]; i += 2 + xlen
    if flg & 8:
        i = b.index(b"\x00", i) + 1
    if flg & 16:
        i = b.index(b"\x00", i) + 1
    if flg & 2:
        i += 2
    return {"header_hex": b[:i].hex(), "header_len": i, "flg": flg, "mtime": struct.unpack("<I", b[4:8])[0], "xfl": b[8], "os": b[9]}

rows = [l.rstrip("\n").split("\t") for l in open(LIST) if l.strip()]
chunk_index = {}      # sha256 hex -> ordinal
chunk_meta = []       # (offset, length, sha256)
pack_off = 0
xz = subprocess.Popen(["xz", "-6", "-T1", "-c"], stdin=subprocess.PIPE, stdout=open(os.path.join(OUT, "pack-0001.raw.xz"), "wb"))
z6 = zlib.compressobj(6); z6_bytes = 0
contents, numbers, line_sets = [], {"files": []}, []
t0 = time.time()
for local, key, md5e, sizee, label in rows:
    stored = open(local, "rb").read()
    md5 = hashlib.md5(stored).hexdigest(); sha = hashlib.sha256(stored).hexdigest()
    assert md5 == md5e and len(stored) == int(sizee), (key, md5, md5e)
    hdr = parse_gzip_header(stored)
    d = zlib.decompressobj(-15)
    inner = d.decompress(stored[hdr["header_len"]:]); inner += d.flush()
    trailer = d.unused_data
    crc, isize = struct.unpack("<II", trailer[:8])
    assert crc == (zlib.crc32(inner) & 0xffffffff) and isize == (len(inner) & 0xffffffff) and len(trailer) == 8
    inner_sha = hashlib.sha256(inner).hexdigest()
    # row-anchored content-defined chunks: cut only at line ends, the cut decided by the line's own hash
    recipe, extents = [], []
    start = pos = 0; n = len(inner); lines = []
    new_chunks = new_bytes = 0
    while pos < n:
        e = inner.find(b"\n", pos)
        e = n if e < 0 else e + 1
        line = inner[pos:e]; lh = hashlib.sha256(line).digest()
        lines.append(lh)
        pos = e
        size = pos - start
        if pos == n or (size >= MIN_CHUNK and (lh[0] & MASK) == 0) or size >= MAX_CHUNK:
            ch = inner[start:pos]; cs = hashlib.sha256(ch).hexdigest()
            o = chunk_index.get(cs)
            if o is None:
                o = len(chunk_meta); chunk_index[cs] = o; chunk_meta.append((pack_off, len(ch), cs))
                xz.stdin.write(ch); z6_bytes += len(z6.compress(ch)); pack_off += len(ch)
                new_chunks += 1; new_bytes += len(ch)
            if extents and extents[-1][0] + extents[-1][1] == o:
                extents[-1][1] += 1
            else:
                extents.append([o, 1])
            start = pos
    line_sets.append((label, key, lines))
    rec = {"sha256": sha, "bytes": len(stored), "md5": md5,
           "form": "gzip", "wrap": {"header_hex": hdr["header_hex"], "trailer": "derived (crc32 + isize of inner)",
                                     "deflater": "to be found by 20-rebuild-proto.mjs"},
           "inner": {"sha256": inner_sha, "bytes": len(inner), "lines": len(lines),
                     "chunks": sum(c for _, c in extents), "extents": extents}}
    contents.append(rec)
    numbers["files"].append({"label": label, "key": key, "stored_bytes": len(stored), "inner_bytes": len(inner), "lines": len(lines),
                             "chunks": rec["inner"]["chunks"], "new_chunks": new_chunks, "new_bytes": new_bytes, "extents": len(extents),
                             "gz_header": {k: hdr[k] for k in ("flg", "mtime", "xfl", "os")}})
    print(label, len(stored), len(inner), len(lines), "chunks", rec["inner"]["chunks"], "new", new_chunks, new_bytes, "extents", len(extents), round(time.time()-t0, 1), "s", flush=True)
xz.stdin.close(); xz.wait()
z6_bytes += len(z6.flush())
with open(os.path.join(OUT, "chunks.tsv"), "w") as f:
    for i, (o, l, s) in enumerate(chunk_meta):
        f.write(f"{i}\t{o}\t{l}\t{s}\n")
with open(os.path.join(OUT, "contents.jsonl"), "w") as f:
    for r in contents:
        f.write(json.dumps(r, separators=(",", ":")) + "\n")

# row-level differences between successive versions (by line hash multiset)
from collections import Counter
diffs = []
by_label = {l: (k, ls) for l, k, ls in line_sets}
pairs = [(a[0], b[0]) for a, b in zip(line_sets, line_sets[1:])]
for a, b in pairs:
    ka, la = by_label[a]; kb, lb = by_label[b]
    ca, cb = Counter(la), Counter(lb)
    removed = ca - cb; added = cb - ca
    diffs.append({"from": a, "to": b, "from_key": ka, "to_key": kb, "rows_from": len(la), "rows_to": len(lb),
                  "rows_removed": sum(removed.values()), "rows_added": sum(added.values()),
                  "removed_line_sha256": [h.hex() for h in list(removed)[:5]], "added_line_sha256": [h.hex() for h in list(added)[:5]]})
with open(os.path.join(OUT, "diffs.jsonl"), "w") as f:
    for d_ in diffs:
        f.write(json.dumps(d_) + "\n")
numbers.update({"distinct_chunks": len(chunk_meta), "pack_raw_bytes": pack_off,
                "pack_xz6_bytes": os.path.getsize(os.path.join(OUT, "pack-0001.raw.xz")), "pack_zlib6_bytes": z6_bytes,
                "chunk_rule": {"mask": MASK, "min": MIN_CHUNK, "max": MAX_CHUNK, "cut": "only at line ends"},
                "seconds": round(time.time()-t0, 1)})
json.dump(numbers, open(os.path.join(OUT, "proto-numbers.json"), "w"), indent=1)
print(json.dumps({k: v for k, v in numbers.items() if k != "files"}))
