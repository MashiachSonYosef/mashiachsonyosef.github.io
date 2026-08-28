#!/usr/bin/env node
// run-fleet-v2 — one pipeline, every work the bridge records, no exceptions.
//
// The owner's ruling, restated the day this file was written: there is no
// ready set anyone chooses. The pipeline runs over all of it; "the ready
// ones" is its output. A hand-picked subset — five works, two works, any
// works — is the proof-of-concept reflex wearing a new coat, and it is
// refused here structurally: this runner takes its work list from the
// identity bridge and nowhere else, so there is no place to put a choice.
//
// Per work, in order, first refusal wins and is recorded:
//   TEXT     the verified body's manifest covers the work's c0 range
//   RIGHTS   a rights record in custody covers the work (the binding
//            composite; absent, the work holds with exactly that sentence)
//   SERVE    tools/serve-from-body-v1.mjs — the adapter proven against the
//            served targum word-for-word
//   ZONE     tools/build-zone.mjs — same store, same rules as everything
//            already serving; its own refusals (coordinate gaps, status
//            surprises) hold the work with build-zone's reason verbatim
// A work whose zone already stands in data/zones is SERVING — not
// grandfathered: its zone is this same pipeline's sealed output and faces
// the full suite on every deploy.
//
// The ledger is the run's product either way: every work, its verdict, its
// stage, its reason — build/fleet-ledger-v2.json, with a rollup printed.
// GUARDS: fleet-rule-v1-a-work-builds-the-day-its-shards-arrive-and-not-a-day-sooner
//
// Run: node tools/run-fleet-v2.mjs --body /home/user/body
//        --bridge <csv.gz> [--binding <dir>] [--spans <csv.gz>]
//        [--build-zones]   (without it, works that would build are counted
//                           READY_TO_BUILD and no zone is emitted — the dry
//                           ledger; with it, zones land in build/fleet/)
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const has = (n) => process.argv.includes(`--${n}`);
const BODY = arg("body") || (() => { throw new Error("MISSING_ARG --body"); })();
const BRIDGE = arg("bridge") || (() => { throw new Error("MISSING_ARG --bridge"); })();
const BINDING = arg("binding", null);
const SPANS = arg("spans", null);

// ---- every work, from the bridge and nowhere else -------------------------
const bridgeText = gunzipSync(readFileSync(BRIDGE)).toString("utf8");
const bl = bridgeText.split("\n");
const bc = Object.fromEntries(bl[0].split(",").map((h, i) => [h.trim(), i]));
const works = new Map(); // work_id -> {units, min, max, family}
for (let i = 1; i < bl.length; i += 1) {
  if (!bl[i]) continue;
  const f = bl[i].split(",");
  const w = f[bc.work_id];
  let e = works.get(w);
  if (!e) { e = { units: 0, min: Infinity, max: -Infinity, family: f[bc.corpus_family] }; works.set(w, e); }
  e.units += 1;
  e.min = Math.min(e.min, Number(f[bc.min_c0_numeric_id]));
  e.max = Math.max(e.max, Number(f[bc.max_c0_numeric_id]));
}

// ---- what the body covers, from its manifest ------------------------------
const man = readFileSync(join(BODY, "c0-active-rebuild-partial-manifest.csv"), "utf8").trim().split("\n");
const mc = Object.fromEntries(man[0].split(",").map((h, i) => [h.trim(), i]));
const ranges = man.slice(1).map((l) => { const f = l.split(","); return [Number(f[mc.first_c0_numeric_id]), Number(f[mc.last_c0_numeric_id])]; })
  .sort((a, b) => a[0] - b[0]);
const covered = (lo, hi) => {
  // every id in [lo,hi] under some shard range, walked over the sorted list
  let at = lo;
  for (const [a, b] of ranges) {
    if (b < at) continue;
    if (a > at) return false;
    at = b + 1;
    if (at > hi) return true;
  }
  return at > hi;
};

// ---- what already serves, from the zones on disk --------------------------
const serving = new Map(); // work_id -> slug
for (const f of readdirSync(join(K3, "data", "zones")).filter((x) => x.endsWith(".bin") && !x.startsWith("fixture-") && !x.endsWith("-commentary.bin"))) {
  try {
    const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", f))).toString("utf8"));
    const m = String((z.work_receipts || {}).b_n || "").match(/work_id=([^\s·]+)/);
    if (m) serving.set(m[1], f.replace(/\.bin$/, ""));
  } catch { /* an unreadable bin is not a serving work */ }
}

// ---- the run --------------------------------------------------------------
mkdirSync(join(K3, "build", "fleet"), { recursive: true });
const ledger = [];
const tally = new Map();
const mark = (work, e, verdict, stage, reason) => {
  ledger.push({ work, family: e.family, units: e.units, c0_first: e.min, c0_last: e.max, verdict, stage, reason });
  tally.set(`${verdict} · ${reason || stage}`, (tally.get(`${verdict} · ${reason || stage}`) || 0) + 1);
};
const RIGHTS_REASON = "no rights record in custody covers this work; the binding composite is asked of the corpus lane";
let done = 0;
for (const [work, e] of works) {
  done += 1;
  if (serving.has(work)) { mark(work, e, "SERVING", "ZONE", `serving as ${serving.get(work)}; the standing zone is this pipeline's sealed output and faces the full suite on every deploy`); continue; }
  if (!covered(e.min, e.max)) { mark(work, e, "HOLD", "TEXT", "the verified body does not cover this work's c0 range"); continue; }
  if (!BINDING) { mark(work, e, "HOLD", "RIGHTS", RIGHTS_REASON); continue; }
  if (!has("build-zones")) { mark(work, e, "READY_TO_BUILD", "RIGHTS", null); continue; }
  // serve + zone, refusals recorded verbatim
  const slug = work.split("/").pop();
  const serveOut = join(K3, "build", "fleet", `${slug}.ndjson`);
  try {
    execFileSync("node", [join(HERE, "serve-from-body-v1.mjs"), "--work", work, "--body", BODY,
      "--bridge", BRIDGE, "--binding", BINDING, "--out", serveOut], { stdio: "pipe" });
  } catch (err) { mark(work, e, "HOLD", "SERVE", String(err.stderr || err.message).trim().split("\n")[0].slice(0, 160)); continue; }
  try {
    const zoneArgs = ["--serve", serveOut, "--bridge", BRIDGE, "--store", join(K3, "data", "route-store"),
      "--work", work, "--title", slug.replace(/[-_]+/g, " "), "--title-from-c0",
      "--out", join(K3, "build", "fleet", `${slug}.bin`), "--stamp", new Date().toISOString().slice(0, 10)];
    if (SPANS) zoneArgs.push("--spans", SPANS);
    execFileSync("node", [join(HERE, "build-zone.mjs"), ...zoneArgs], { stdio: "pipe" });
    mark(work, e, "GREEN_BUILT", "ZONE", null);
  } catch (err) { mark(work, e, "HOLD", "ZONE", String(err.stderr || err.message).trim().split("\n")[0].slice(0, 160)); }
  if (done % 200 === 0) console.error(`${done}/${works.size}`);
}

const out = {
  rule: "fleet-rule-v1-a-work-builds-the-day-its-shards-arrive-and-not-a-day-sooner",
  ran_at: new Date().toISOString(),
  inputs: {
    bridge_sha256: createHash("sha256").update(readFileSync(BRIDGE)).digest("hex"),
    body_manifest_sha256: createHash("sha256").update(readFileSync(join(BODY, "c0-active-rebuild-partial-manifest.csv"))).digest("hex"),
    binding: BINDING ? "in custody" : "not in custody",
  },
  works: works.size,
  verdicts: Object.fromEntries([...tally.entries()].sort((a, b) => b[1] - a[1])),
  ledger,
};
writeFileSync(join(K3, "build", "fleet-ledger-v2.json"), JSON.stringify(out, null, 1));
console.log(`fleet ran over ${works.size} works · ledger at build/fleet-ledger-v2.json`);
for (const [k, n] of [...tally.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(6)}  ${k}`);
