// Try to re-create a raw deflate body from its inflated content with Node's bundled zlib.
// Args: inner_path body_path. Variants: levels 1-9 x memLevel 8,9 x strategy default/filtered, fed in 64 KiB
// writes; each variant stops at its first byte that differs from the body. Prints JSON {zlib, hits, firstDiff}.
import { readFileSync } from "node:fs";
import zlib from "node:zlib";
const inner = readFileSync(process.argv[2]), body = readFileSync(process.argv[3]);
function tryOne(opts) {
  return new Promise((res) => {
    const d = zlib.createDeflateRaw(opts); let off = 0, bad = -1, doneFlag = false;
    const finish = (v) => { if (!doneFlag) { doneFlag = true; res(v); } };
    d.on("data", (c) => {
      if (bad >= 0) return;
      const n = Math.min(c.length, body.length - off);
      for (let i = 0; i < c.length; i++) if (i >= n || c[i] !== body[off + i]) { bad = off + i; d.destroy(); finish(bad); return; }
      off += c.length;
    });
    d.on("end", () => finish(bad < 0 && off === body.length ? -1 : (bad < 0 ? off : bad)));
    d.on("close", () => finish(bad < 0 && off === body.length ? -1 : (bad < 0 ? off : bad)));
    d.on("error", () => finish(-2));
    (async () => {
      for (let i = 0; i < inner.length && bad < 0; i += 65536) {
        if (!d.write(inner.subarray(i, i + 65536))) await new Promise((r) => d.once("drain", r));
      }
      if (bad < 0) d.end();
    })();
  });
}
const hits = [], firstDiff = {};
for (const strategy of [zlib.constants.Z_DEFAULT_STRATEGY, zlib.constants.Z_FILTERED]) for (const memLevel of [8, 9]) for (let level = 1; level <= 9; level++) {
  const r = await tryOne({ level, memLevel, strategy });
  const name = `node-L${level}-m${memLevel}${strategy ? "-filtered" : ""}`;
  if (r === -1) hits.push(name); else firstDiff[name] = r;
}
console.log(JSON.stringify({ zlib: process.versions.zlib, hits, firstDiff }));
