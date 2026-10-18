// Which pack codec: Node has no xz, so test Node's built-in brotli on the same packed chunks.
// Usage: node 21-codec-test.mjs STORE_DIR BLOCK_MiB   (reads STORE_DIR/pack.xz and chunks.tsv; writes nothing but a JSON line)
// Cuts the pack into independent blocks of about BLOCK_MiB at chunk boundaries (a reader then fetches one block by range),
// compresses every block with brotli quality 9 (window 2^24), and the first 8 blocks also with quality 11, and decompresses
// every block to check it. Prints sizes and speeds.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import zlib from "node:zlib";
const [dir, mib] = process.argv.slice(2);
const pack = execFileSync("xz", ["-dc", `${dir}/pack.xz`], { maxBuffer: 4 * 1024 ** 3 });
const lens = readFileSync(`${dir}/chunks.tsv`, "utf8").trim().split("\n").map((l) => +l.split("\t")[2]);
const target = +mib * 1024 * 1024, blocks = [];
let a = 0, cur = 0;
for (const n of lens) { cur += n; if (cur - a >= target) { blocks.push([a, cur]); a = cur; } }
if (cur > a) blocks.push([a, cur]);
const br = (buf, q) => zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: q, [zlib.constants.BROTLI_PARAM_LGWIN]: 24, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length } });
let q9 = 0, t = Date.now(), bad = 0, dt = 0;
for (const [x, y] of blocks) {
  const raw = pack.subarray(x, y), c = br(raw, 9); q9 += c.length;
  const t2 = Date.now(); const back = zlib.brotliDecompressSync(c); dt += Date.now() - t2;
  if (!back.equals(raw)) bad++;
}
const q9s = (Date.now() - t) / 1000;
let q11 = 0, q9first = 0, rawFirst = 0; t = Date.now();
for (const [x, y] of blocks.slice(0, 8)) { const raw = pack.subarray(x, y); rawFirst += raw.length; q11 += br(raw, 11).length; q9first += br(raw, 9).length; }
const q11s = (Date.now() - t) / 1000;
console.log(JSON.stringify({ raw_bytes: pack.length, blocks: blocks.length, block_mib: +mib, brotli_q9_bytes: q9, brotli_q9_seconds: q9s,
  brotli_decompress_seconds: dt / 1000, roundtrip_bad_blocks: bad, first8_raw: rawFirst, first8_q9: q9first, first8_q11: q11, first8_q9_plus_q11_seconds: q11s }));
