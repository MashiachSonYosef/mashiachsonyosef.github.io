# Variant of 10-ingest-proto.py: same row-anchored chunks, but the pack order and chunk size are parameters.
# Usage: python3 -I 11-ingest-variants.py OUT list.tsv MASK MIN MAX ORDER(first|pos) XZPRESET
#   ORDER=first: chunks in the order first seen (version by version)
#   ORDER=pos:   chunks sorted by the line number where they start, so a changed chunk sits next to the
#                chunk it replaced in the older version (the compressor's window then sees both)
# Writes OUT/pack.xz, OUT/chunks.tsv, OUT/contents.jsonl, OUT/numbers.json. Reads only local files.
import sys, os, zlib, hashlib, json, struct, subprocess, time, lzma

OUT, LIST, MASK, MIN_CHUNK, MAX_CHUNK, ORDER, PRESET = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), sys.argv[6], sys.argv[7]
os.makedirs(OUT, exist_ok=True)

def header_len(b):
    flg = b[3]; i = 10
    if flg & 4: i += 2 + struct.unpack("<H", b[i:i+2])[0]
    if flg & 8: i = b.index(b"\x00", i) + 1
    if flg & 16: i = b.index(b"\x00", i) + 1
    if flg & 2: i += 2
    return i

rows = [l.rstrip("\n").split("\t") for l in open(LIST) if l.strip()]
seen = {}            # chunk sha256 -> temp id
new = []             # temp id -> (file_idx, start_line, bytes)
files = []
t0 = time.time()
for fi, (local, key, md5e, sizee, label) in enumerate(rows):
    stored = open(local, "rb").read()
    assert hashlib.md5(stored).hexdigest() == md5e
    hl = header_len(stored)
    d = zlib.decompressobj(-15); inner = d.decompress(stored[hl:]) + d.flush()
    seq = []; start = pos = 0; n = len(inner); line_no = 0; chunk_line = 0
    while pos < n:
        e = inner.find(b"\n", pos); e = n if e < 0 else e + 1
        lh = hashlib.sha256(inner[pos:e]).digest(); pos = e; line_no += 1
        size = pos - start
        if pos == n or (size >= MIN_CHUNK and (lh[0] & MASK) == 0) or size >= MAX_CHUNK:
            ch = inner[start:pos]; cs = hashlib.sha256(ch).digest()
            t = seen.get(cs)
            if t is None:
                t = len(new); seen[cs] = t; new.append((fi, chunk_line, ch))
            seq.append(t); start = pos; chunk_line = line_no
    files.append({"label": label, "key": key, "sha256": hashlib.sha256(stored).hexdigest(), "md5": md5e,
                  "bytes": len(stored), "inner_sha256": hashlib.sha256(inner).hexdigest(), "inner_bytes": n,
                  "header_hex": stored[:hl].hex(), "seq": seq})
    del inner, stored
    print(label, "chunks", len(seq), "distinct so far", len(new), round(time.time() - t0, 1), "s", flush=True)

order = sorted(range(len(new)), key=(lambda t: (new[t][1], new[t][0])) if ORDER == "pos" else (lambda t: (new[t][0], new[t][1])))
ordinal = [0] * len(new)
for o, t in enumerate(order): ordinal[t] = o
xz = subprocess.Popen(["xz", "-" + PRESET, "-T1", "-c"], stdin=subprocess.PIPE, stdout=open(os.path.join(OUT, "pack.xz"), "wb"))
off = 0
with open(os.path.join(OUT, "chunks.tsv"), "w") as f:
    for o, t in enumerate(order):
        ch = new[t][2]; xz.stdin.write(ch)
        f.write(f"{o}\t{off}\t{len(ch)}\t{hashlib.sha256(ch).hexdigest()}\n"); off += len(ch)
xz.stdin.close(); xz.wait()
recipes = []
with open(os.path.join(OUT, "contents.jsonl"), "w") as f:
    for r in files:
        ext = []
        for t in r["seq"]:
            o = ordinal[t]
            if ext and ext[-1][0] + ext[-1][1] == o: ext[-1][1] += 1
            else: ext.append([o, 1])
        rec = {"sha256": r["sha256"], "bytes": r["bytes"], "md5": r["md5"], "form": "gzip",
               "wrap": {"header_hex": r["header_hex"], "trailer": "derived"},
               "inner": {"sha256": r["inner_sha256"], "bytes": r["inner_bytes"], "pack": "pack.xz", "extents": ext}}
        f.write(json.dumps(rec, separators=(",", ":")) + "\n")
        recipes.append((r["label"], len(r["seq"]), len(ext)))
rec_bytes = os.path.getsize(os.path.join(OUT, "contents.jsonl"))
rec_xz = len(lzma.compress(open(os.path.join(OUT, "contents.jsonl"), "rb").read(), preset=6))
idx_xz = len(lzma.compress(open(os.path.join(OUT, "chunks.tsv"), "rb").read(), preset=6))
num = {"mask": MASK, "min": MIN_CHUNK, "max": MAX_CHUNK, "order": ORDER, "xz_preset": PRESET,
       "distinct_chunks": len(new), "pack_raw_bytes": off, "pack_xz_bytes": os.path.getsize(os.path.join(OUT, "pack.xz")),
       "recipes_bytes": rec_bytes, "recipes_xz_bytes": rec_xz, "chunk_index_xz_bytes": idx_xz,
       "per_file": [{"label": a, "chunks": b, "extents": c} for a, b, c in recipes], "seconds": round(time.time() - t0, 1)}
json.dump(num, open(os.path.join(OUT, "numbers.json"), "w"), indent=1)
print(json.dumps({k: v for k, v in num.items() if k != "per_file"}))
