#!/usr/bin/env node
// LEDGER: O
// the named stream: which zone bin is published, and its bytes. This writes
// bins to data/zones, but only bytes the record already pins — it restores
// the shelf from this tree's own history and originates nothing.
// GUARDS: zone-store-rule-v1-the-door-keeps-the-seals-the-shelf-keeps-the-weight
//
// THE SHELF, BACK FROM THE TREE'S OWN HISTORY.
//
// The shelf stands beside the door (the store record's base is null), so the
// only copy of its weight is this machine's disk — and a cloud machine is
// reset. On 2026-09-23 a reset took 3,448 of 3,594 pinned bins, and none of
// them was on the store: a fresh fleet run cannot make them either, because
// each bin carries the date and the tool hashes of the run that made it.
// What CAN make them is the tree itself. The fleet bins were tracked in git
// until the commit that stopped tracking them, and the parent of that commit
// holds every one of them. Two things happened to them after that:
//
//   1. a license posture was renamed in the postures record (the American
//      spelling pass, 2026-09-10), and the bins were re-written with the new
//      name and recompressed at gzip level 9. That rename is READ here, not
//      typed: every posture whose name differs between the postures record
//      as it stood beside the blob and the record as it stands now is
//      renamed in the bin, and nothing else is touched.
//   2. the commentary sidecars were built from finished zones by
//      build-commentary-sidecar-v2. They are rebuilt the same way: the base
//      is the sidecar's own name, the works are the pairs the attachment
//      record says stand on that base, and the stamp is the date of the
//      commit that first pinned the sidecar in the store record.
//
// Nothing is written unless its byte count and sha256 equal its pin. A bin
// already exact on disk is left alone. A bin that cannot be made exact is
// named and not written; this exits nonzero while anything pinned is still
// missing, so an incomplete shelf never reads as a restored one.
//
// Run: node tools/restore-shelf-from-history-v1.mjs [--dry] [--jobs 4] [--r2-prefix serving-lane/shelf/zones/]
//        [--record data/zone-store-v1.json] [--zones data/zones]
//        [--postures data/license-postures-v1.json]
//        [--attachment data/work-attachment-v1.json]
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { gunzipSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry");
const JOBS = Math.max(1, Number(arg("jobs", "4")));
const RECORD = join(K3, arg("record", "data/zone-store-v1.json"));
const ZONES = join(K3, arg("zones", "data/zones"));
const POSTURES = join(K3, arg("postures", "data/license-postures-v1.json"));
const ATTACH = join(K3, arg("attachment", "data/work-attachment-v1.json"));
const SCRATCH = join(K3, "build", "restore-shelf-v1");

// core.quotepath off: most of the shelf is named in Hebrew, and git would
// otherwise hand those names back as octal escapes that match no pin
const git = (...a) => execFileSync("git", ["-c", "core.quotepath=false", ...a], { cwd: K3, encoding: "utf8", maxBuffer: 1 << 28 });
// pathspecs are read from the top of the tree, wherever this is run from
const top = (p) => `:(top)${p}`;
const TOP = git("rev-parse", "--show-toplevel").trim();
const inRepo = (p) => relative(TOP, p).split("\\").join("/");
const sha = (b) => createHash("sha256").update(b).digest("hex");
const pins = JSON.parse(readFileSync(RECORD, "utf8")).pins || {};
const exactOnDisk = (f) => {
  const p = join(ZONES, f);
  if (!existsSync(p)) return false;
  const b = readFileSync(p);
  return b.length === pins[f].bytes && sha(b) === pins[f].sha256;
};
// --- first, the serving lane's own backup on R2, when this machine has keys --
// Since the year repair (2026-09-24) every zone was re-projected over the
// landed store, so the bytes the pins name exist in no commit: the history
// route below reproduces the shelf as it stood BEFORE that, and refuses it.
// The shelf is backed up byte for byte at r2:<bucket>/serving-lane/shelf/
// zones/<name>; with R2 keys in the environment (R2_ACCESS_KEY_ID or
// AWS_ACCESS_KEY_ID, the secret likewise, R2_ENDPOINT, R2_BUCKET) each pin
// not already exact on disk is fetched from there and written only if exact.
// The keys are read, never printed. Without them this step is skipped and
// says so.
{
  const env = process.env;
  const KEY = env.R2_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID, SECRET = env.R2_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY;
  const ENDPOINT = env.R2_ENDPOINT, BUCKET = env.R2_BUCKET;
  const PREFIX = arg("r2-prefix", "serving-lane/shelf/zones/");
  const want = Object.keys(pins).filter((f) => !exactOnDisk(f)).sort();
  if (!want.length) { /* nothing to fetch */ }
  else if (!(KEY && SECRET && ENDPOINT && BUCKET)) console.log(`R2 backup: skipped — no R2 keys in this environment (${want.length} pins not on disk)`);
  else {
    const { createHmac } = await import("node:crypto");
    const host = new URL(ENDPOINT).host;
    const hmac = (k, s) => createHmac("sha256", k).update(s).digest();
    const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
    const get = async (key) => {
      const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const day = now.slice(0, 8);
      const path = `/${enc(BUCKET)}/${key.split("/").map(enc).join("/")}`;
      const headers = { host, "x-amz-content-sha256": "UNSIGNED-PAYLOAD", "x-amz-date": now };
      const signed = Object.keys(headers).sort();
      const canon = ["GET", path, "", ...signed.map((h) => `${h}:${headers[h]}`), "", signed.join(";"), "UNSIGNED-PAYLOAD"].join("\n");
      const scope = `${day}/auto/s3/aws4_request`;
      const toSign = ["AWS4-HMAC-SHA256", now, scope, sha(Buffer.from(canon))].join("\n");
      const kSign = hmac(hmac(hmac(hmac(`AWS4${SECRET}`, day), "auto"), "s3"), "aws4_request");
      const sig = createHmac("sha256", kSign).update(toSign).digest("hex");
      const res = await fetch(`https://${host}${path}`, { headers: { ...headers, Authorization: `AWS4-HMAC-SHA256 Credential=${KEY}/${scope}, SignedHeaders=${signed.join(";")}, Signature=${sig}` } });
      return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
    };
    let got = 0, absent = 0, wrong = 0;
    const q = [...want];
    await Promise.all(Array.from({ length: Math.max(4, JOBS * 2) }, async () => {
      while (q.length) {
        const f = q.shift();
        const b = await get(PREFIX + f).catch(() => null);
        if (!b) { absent += 1; continue; }
        if (b.length !== pins[f].bytes || sha(b) !== pins[f].sha256) { wrong += 1; continue; }
        got += 1; if (!DRY) writeFileSync(join(ZONES, f), b);
      }
    }));
    console.log(`R2 backup: ${got} restored exact${DRY ? " (DRY, nothing written)" : ""} · ${absent} not in the backup · ${wrong} in the backup but not their pin`);
  }
}
const missing = Object.keys(pins).filter((f) => !exactOnDisk(f)).sort();
const isSidecar = (f) => /\.[a-z]+\.bin$/.test(f);
const bins = missing.filter((f) => !isSidecar(f));
const sidecars = missing.filter((f) => /\.commentary\.bin$/.test(f));
const other = missing.filter((f) => isSidecar(f) && !/\.commentary\.bin$/.test(f));
console.log(`pinned ${Object.keys(pins).length} · exact on disk ${Object.keys(pins).length - missing.length} · to restore ${missing.length} (${bins.length} zones, ${sidecars.length} commentary${other.length ? `, ${other.length} other sidecars this tool does not make` : ""})`);
if (!missing.length) process.exit(0);

// --- the zones: the last tracked blob, with the record's renames replayed -----
// Which commit stopped tracking each bin, read off the log, newest first.
const zonesDir = inRepo(ZONES);
const lastDeletion = new Map();
{
  const log = git("log", "--diff-filter=D", "--format=@%H", "--name-only", "--", top(`${zonesDir}/`));
  let at = null;
  for (const line of log.split("\n")) {
    if (line.startsWith("@")) { at = line.slice(1); continue; }
    const f = line.trim().split("/").pop();
    if (f && at && !lastDeletion.has(f)) lastDeletion.set(f, at);
  }
}
// The renames between a commit's postures record and today's: posture id →
// old name → new name. Read per commit, since two bins may have left the tree
// at different times.
const postureNames = (text) => {
  const rec = JSON.parse(text);
  const out = new Map();
  for (const [id, p] of Object.entries(rec.postures || {})) if (p && typeof p.name === "string") out.set(id, p.name);
  return out;
};
const nowNames = postureNames(readFileSync(POSTURES, "utf8"));
const renameCache = new Map();
const renamesAt = (commit) => {
  if (renameCache.has(commit)) return renameCache.get(commit);
  let then = new Map();
  try { then = postureNames(git("show", `${commit}^:${inRepo(POSTURES)}`)); } catch { /* the record did not exist then: no renames */ }
  const r = [...then].filter(([id, name]) => nowNames.has(id) && nowNames.get(id) !== name).map(([id, name]) => [name, nowNames.get(id)]);
  renameCache.set(commit, r);
  return r;
};

const cat = spawn("git", ["cat-file", "--batch"], { cwd: K3 });
let buf = Buffer.alloc(0); const waiters = [];
const pump = () => {
  while (waiters.length) {
    const nl = buf.indexOf(10); if (nl < 0) return;
    const head = buf.subarray(0, nl).toString().split(" ");
    if (head[1] === "missing") { buf = buf.subarray(nl + 1); waiters.shift()(null); continue; }
    const n = Number(head[2]);
    if (buf.length < nl + 1 + n + 1) return;
    const data = Buffer.from(buf.subarray(nl + 1, nl + 1 + n)); buf = buf.subarray(nl + 1 + n + 1);
    waiters.shift()(data);
  }
};
cat.stdout.on("data", (d) => { buf = Buffer.concat([buf, d]); pump(); });
const blob = (spec) => new Promise((res) => { waiters.push(res); cat.stdin.write(spec + "\n"); });

const done = { raw: [], renamed: [], commentary: [] };
const refused = [];
for (const f of bins) {
  const commit = lastDeletion.get(f);
  if (!commit) { refused.push({ file: f, why: "this tree never tracked it" }); continue; }
  const b0 = await blob(`${commit}^:${zonesDir}/${f}`);
  if (!b0) { refused.push({ file: f, why: `not in ${commit.slice(0, 9)}^` }); continue; }
  let hit = null, how = null;
  if (b0.length === pins[f].bytes && sha(b0) === pins[f].sha256) { hit = b0; how = "raw"; }
  else {
    let text = gunzipSync(b0).toString("utf8");
    for (const [from, to] of renamesAt(commit)) text = text.split(from).join(to);
    const g = gzipSync(Buffer.from(text, "utf8"), { level: 9 });
    if (g.length === pins[f].bytes && sha(g) === pins[f].sha256) { hit = g; how = "renamed"; }
    else refused.push({ file: f, why: `from ${commit.slice(0, 9)}^ with ${renamesAt(commit).length} rename(s): ${g.length} bytes ${sha(g).slice(0, 12)} against the pin's ${pins[f].bytes} ${pins[f].sha256.slice(0, 12)}` });
  }
  if (hit) { done[how].push(f); if (!DRY) writeFileSync(join(ZONES, f), hit); }
}
cat.stdin.end();

// --- the commentary: rebuilt from the finished zones, as it was made ----------
const pairs = JSON.parse(readFileSync(ATTACH, "utf8")).pairs || [];
if (sidecars.length) mkdirSync(SCRATCH, { recursive: true });
const queue = [...sidecars];
const runOne = async () => {
  while (queue.length) {
    const f = queue.shift();
    const base = f.replace(/\.commentary\.bin$/, "");
    const works = pairs.filter((p) => p.U && p.U.target === base).map((p) => p.work).filter((w) => existsSync(join(ZONES, `${w}.bin`)));
    const firstPin = git("log", "--reverse", "--format=%ad", "--date=short", "-S", `"${f}"`, "--", top(inRepo(RECORD))).trim().split("\n")[0];
    if (!works.length || !firstPin || !existsSync(join(ZONES, `${base}.bin`)) || (DRY && !exactOnDisk(`${base}.bin`) && !bins.includes(`${base}.bin`))) {
      refused.push({ file: f, why: `base ${base}, ${works.length} work(s) on disk, first pinned ${firstPin || "never"}` }); continue;
    }
    const out = join(SCRATCH, f);
    await new Promise((res) => {
      const p = spawn("node", [join(HERE, "build-commentary-sidecar-v2.mjs"), "--base", base, ...works.flatMap((w) => ["--work", w]), "--stamp", firstPin, "--out", out], { cwd: K3, stdio: "ignore" });
      p.on("close", res);
    });
    const b = existsSync(out) ? readFileSync(out) : null;
    if (b && b.length === pins[f].bytes && sha(b) === pins[f].sha256) { done.commentary.push(f); if (!DRY) writeFileSync(join(ZONES, f), b); }
    else refused.push({ file: f, why: b ? `rebuilt ${b.length} bytes ${sha(b).slice(0, 12)} against the pin's ${pins[f].bytes} ${pins[f].sha256.slice(0, 12)} (stamp ${firstPin}, works ${works.join(", ")})` : "the sidecar builder wrote nothing" });
  }
};
await Promise.all(Array.from({ length: JOBS }, runOne));
if (existsSync(SCRATCH)) rmSync(SCRATCH, { recursive: true, force: true });

for (const f of other) refused.push({ file: f, why: "a sidecar kind this tool does not make" });
console.log(`restored: ${done.raw.length} zones exact as tracked · ${done.renamed.length} zones exact after the record's renames · ${done.commentary.length} commentary rebuilt exact${DRY ? " · DRY, nothing written" : ""}`);
for (const r of refused.slice(0, 20)) console.log(`  NOT RESTORED  ${r.file}  ·  ${r.why}`);
if (refused.length > 20) console.log(`  … and ${refused.length - 20} more`);
const still = Object.keys(pins).filter((f) => !exactOnDisk(f)).length;
console.log(still ? `${still} pinned bin(s) still not on this disk` : "every pinned bin is on this disk and exact");
process.exit(still && !DRY ? 1 : 0);
