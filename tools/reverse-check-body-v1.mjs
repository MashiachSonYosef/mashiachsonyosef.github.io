#!/usr/bin/env node
// reverse-check-body-v1 — the disposal-time reverse checker (the owner's design).
//
// Walks the July manifest (the sealed truth), downloads the rebuilt body back
// OUT of R2 in bounded batches, re-hashes every shard against the manifest,
// and writes a disposal receipt only if 4,646/4,646 verify. Local disposition
// of the build copy is licensed by this receipt and nothing else.
//
// Usage: node reverse-check-body-v1.mjs
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
// Every path is named by whoever runs this. A path typed into a tool is one
// machine's truth and nobody else's, and a home directory carries a person's
// name — which belongs in no artifact of this project, ever.
const RC = arg("rclone", process.env.RCLONE || "rclone");
const CFG = arg("config", process.env.RCLONE_CONFIG || "");
const REMOTE = "r2:mishkan/body/c0-rebuilt-20260827/shards";
const MANIFEST = arg("manifest", process.env.BODY_MANIFEST || "");
const WORKDIR = arg("workdir", path.join(process.env.TMPDIR || process.env.TEMP || "/tmp", "reverse-check"));
const RECEIPT = arg("receipt", path.join(WORKDIR, "reverse-check-receipt.json"));
const BATCH = 200;

const rows = fs.readFileSync(MANIFEST, "utf8").trim().split(/\r?\n/);
const header = rows.shift().split(",");
const fi = header.indexOf("slice_file"), bi = header.indexOf("compressed_bytes"), si = header.indexOf("sha256");
const shards = rows.map((r) => { const c = r.split(","); return { file: c[fi], bytes: Number(c[bi]), sha256: c[si] }; });
console.log(`manifest shards: ${shards.length}`);

fs.rmSync(WORKDIR, { recursive: true, force: true });
fs.mkdirSync(WORKDIR, { recursive: true });

let ok = 0; const bad = [];
for (let i = 0; i < shards.length; i += BATCH) {
  const batch = shards.slice(i, i + BATCH);
  const listFile = path.join(WORKDIR, "batch.txt");
  fs.writeFileSync(listFile, batch.map((s) => s.file).join("\n") + "\n");
  execFileSync(RC, ["--config", CFG, "copy", REMOTE, WORKDIR, "--files-from", listFile, "--transfers", "8"], { stdio: "pipe" });
  for (const s of batch) {
    const p = path.join(WORKDIR, s.file);
    try {
      const b = fs.readFileSync(p);
      const h = crypto.createHash("sha256").update(b).digest("hex");
      if (b.length === s.bytes && h === s.sha256) ok++;
      else bad.push({ file: s.file, expected: s.sha256, got: h, bytes: b.length });
      fs.rmSync(p);
    } catch (e) {
      bad.push({ file: s.file, error: String(e.message ?? e) });
    }
  }
  console.log(`verified ${Math.min(i + BATCH, shards.length)}/${shards.length} (bad so far: ${bad.length})`);
}
fs.rmSync(WORKDIR, { recursive: true, force: true });

const receipt = {
  schema: "reverse-check-receipt-v1",
  design: "the owner's reverse checker: full download re-verification against the sealed July manifest at disposal time",
  remote: REMOTE,
  manifest_shards: shards.length,
  verified_ok: ok,
  failed: bad,
  verdict: bad.length === 0 && ok === shards.length ? "PASS_FULL_REVERSE_CHECK" : "FAIL",
  checked_at_utc: new Date().toISOString(),
};
fs.mkdirSync(path.dirname(RECEIPT), { recursive: true });
fs.writeFileSync(RECEIPT, JSON.stringify(receipt, null, 2) + "\n");
console.log(`verdict: ${receipt.verdict} (${ok}/${shards.length})`);
process.exit(receipt.verdict.startsWith("PASS") ? 0 : 1);
