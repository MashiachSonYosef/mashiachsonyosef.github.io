#!/usr/bin/env node
// What MAM's own labels are still saying inside our body.
//
// The Tanakh streams were captured from MAM (Miqra according to the Masorah,
// Hebrew Wikisource, CC BY-SA) with its HTML apparatus riding along, and the
// capture's tokenizer split that HTML on whitespace — so a marked site now
// stands as fragments across adjacent tokens and the build gate reads it as
// markup in the text. The fragments are not noise: they carry MAM's own
// class names, which is MAM saying, in its own words, what each site is.
//
//   mam-kq-k        the written form of a written/read pair
//   mam-kq-q        the read form of that pair
//   mam-kq-trivial  a pair whose difference is orthographic
//   mam-spi-pe      a petuchah — an open paragraph break in the scroll
//   mam-spi-samekh  a setumah — a closed paragraph break
//
// This pass reads every Tanakh-family stream the body covers and counts what
// survives, per book, by label. It edits nothing and rules nothing: it says
// what is recoverable, so the lanes can decide what to build from it. Two
// things ride on the answer — the written/read apparatus the reader already
// has machinery for, and the tradition's own section divisions, which are a
// second way to cut every book and are marked here by MAM itself.
//
// Run: node tools/mam-apparatus-census-v1.mjs --body <dir> --bridge <csv.gz>
//        --binding <dir> [--jobs 2]
import { readFileSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { execFile } from "node:child_process";
import { createInterface } from "node:readline";
import { createReadStream } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const BODY = arg("body") || (() => { throw new Error("MISSING_ARG --body"); })();
const BRIDGE = arg("bridge") || (() => { throw new Error("MISSING_ARG --bridge"); })();
const BINDING = arg("binding") || (() => { throw new Error("MISSING_ARG --binding"); })();
const JOBS = Number(arg("jobs", "2"));

// the works are the fleet ledger's own tanakh-family rows whose body range is
// covered — the gate's census, never a hand-picked list
const LEDGER = JSON.parse(readFileSync(join(K3, "build", "fleet-ledger-v2.json"), "utf8"));
const works = LEDGER.ledger.filter((r) => r.work.startsWith("tanakh/")
  && !/does not cover this work's c0 range/.test(r.reason || ""));
console.error(`${works.length} tanakh-family streams to read`);

// a labeled fragment: MAM's class and the text it wrapped
const LABEL = /class="(mam-[a-z-]+)"\s*>([^<]*)<\/span>/gu;
const HEB = /[\u0590-\u05ff]/u;

const run = (cmd, args) => new Promise((resolve, reject) => {
  execFile(cmd, args, { maxBuffer: 16 * 1024 * 1024 }, (err, stdout, stderr) =>
    err ? reject(Object.assign(err, { stderr })) : resolve(stdout));
});

const readRows = (path) => new Promise((resolve, reject) => {
  const rows = [];
  const rl = createInterface({ input: createReadStream(path, "utf8"), crlfDelay: Infinity });
  rl.on("line", (l) => { if (l.trim()) { try { rows.push(JSON.parse(l)); } catch { /* skip */ } } });
  rl.on("close", () => resolve(rows));
  rl.on("error", reject);
});

const scanWork = async (r) => {
  const slug = r.work.split("/").pop();
  const out = join(K3, "build", "fleet", `mam-${slug}.ndjson`);
  const row = { work: r.work, units: r.units, labels: {}, sites: [], tokens: 0,
    orphan_open: 0, pairs: 0 };
  try {
    await run("node", [join(HERE, "serve-from-body-v1.mjs"), "--work", r.work, "--body", BODY,
      "--bridge", BRIDGE, "--binding", BINDING, "--out", out]);
    // Row 0 is the adapter's provenance, and it names the exact shards these
    // figures were read out of, each with its own sha256. That is the identity
    // of the COPY — which this pass used to throw away with the rest of the
    // header, and which turned out to be the one thing the numbers most needed.
    //
    // One work can hold several stream copies under one filename, the ten-hex
    // content hash inside that filename included. Copies can share row count,
    // C0 span and first id and differ only in whether the source's own class
    // labels survived. So a per-work apparatus figure with no record of which
    // shards produced it is not reproducible, and two lanes counting the same
    // corpus can differ by twelve percent with neither having miscounted.
    const all = await readRows(out);
    const oracle = ((all[0] || {}).provenance || {}).body_oracle || {};
    row.read_from = {
      manifest: oracle.manifest || null,
      manifest_sha256: oracle.manifest_sha256 || null,
      shards: oracle.shards_read || [],
    };
    const rows = all.slice(1);
    row.tokens = rows.length;
    let lastK = -1;
    for (let i = 0; i < rows.length; i += 1) {
      const s = String(rows[i].exact_surface_form || "");
      if (!s.includes("<")) continue;
      // an opening tag that lost its body to the tokenizer
      if (/<span\s*$/u.test(s) || (s.includes("<span") && !s.includes("</span>"))) row.orphan_open += 1;
      LABEL.lastIndex = 0;
      let m;
      while ((m = LABEL.exec(s))) {
        const cls = m[1], text = m[2];
        row.labels[cls] = (row.labels[cls] || 0) + 1;
        if (row.sites.length < 6) row.sites.push({ unit: rows[i].location?.local_unit_id, cls, text });
        // a written form and a read form standing within a few tokens is one
        // site with both halves recoverable
        if (cls === "mam-kq-k") lastK = i;
        if (cls === "mam-kq-q" && lastK >= 0 && i - lastK <= 3) { row.pairs += 1; lastK = -1; }
      }
    }
  } catch (err) {
    row.error = String(err.stderr || err.message).trim().split("\n")[0].slice(0, 120);
  }
  try { unlinkSync(out); } catch { /* nothing written */ }
  return row;
};

mkdirSync(join(K3, "build", "fleet"), { recursive: true });
const results = [];
const queue = [...works];
let done = 0;
await Promise.all(Array.from({ length: Math.max(1, JOBS) }, async () => {
  for (;;) {
    const next = queue.shift();
    if (!next) return;
    results.push(await scanWork(next));
    done += 1;
    if (done % 5 === 0) console.error(`${done}/${works.length}`);
  }
}));
results.sort((a, b) => a.work.localeCompare(b.work));

const totals = {};
for (const r of results) for (const [k, n] of Object.entries(r.labels)) totals[k] = (totals[k] || 0) + n;
const out = {
  rule: "mam-apparatus-census-v1-what-mam-still-says-inside-our-body",
  ran_at: new Date().toISOString(),
  source: "every tanakh-family stream the verified body covers, read by the same adapter the zones are built from; MAM's own class names counted, nothing edited",
  works: results.length,
  totals,
  pairs_recoverable: results.reduce((n, r) => n + r.pairs, 0),
  ledger: results,
};
writeFileSync(join(K3, "build", "mam-apparatus-census-v1.json"), JSON.stringify(out, null, 1));
const csv = ["work,units,tokens,kq_k,kq_q,kq_trivial,pairs,petuchah,setumah,other_labels,orphan_open"];
for (const r of results) {
  const l = r.labels;
  const other = Object.entries(l).filter(([k]) => !/^mam-(kq-k|kq-q|kq-trivial|spi-pe|spi-samekh)$/.test(k))
    .map(([k, n]) => `${k}:${n}`).join(" ");
  csv.push([r.work, r.units, r.tokens, l["mam-kq-k"] || 0, l["mam-kq-q"] || 0, l["mam-kq-trivial"] || 0,
    r.pairs, l["mam-spi-pe"] || 0, l["mam-spi-samekh"] || 0, JSON.stringify(other), r.orphan_open].join(","));
}
writeFileSync(join(K3, "build", "mam-apparatus-census-v1.csv"), csv.join("\n") + "\n");
console.log(`${results.length} streams read · build/mam-apparatus-census-v1.{json,csv}`);
console.log("labels found:", JSON.stringify(totals));
console.log("written/read pairs with both halves recoverable:", out.pairs_recoverable);
