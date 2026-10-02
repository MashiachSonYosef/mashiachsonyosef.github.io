#!/usr/bin/env node
// The variant-site grouping: the kq formation's first stage, run on the
// website lane's machine (2026-08-30, the owner's ask — the corpus lane's
// machine is out of disk and this lane holds every input already verified).
//
// The 110 works the fleet holds for RAW_SITE_AWAITS_KQ_REVIEW each carry
// parenthesis- or bracket-wrapped runs of corpus script that no standing
// review covers. The law (Q contract, FRAME era): a Q map must be BUILT per
// work, and its input is an alignment — but each ENCODING CLASS needs one
// alignment rule, not 110 bespoke reviews. So this pass reads every held
// work's own served text and fingerprints how its source encodes the sites:
//
//   P1  a single parenthesized word standing next to a bare twin — the
//       qere-in-parentheses shape, the alignment class MAM answers for
//   P2  a single parenthesized word with no twin — an expansion or gloss,
//       the class that is likely NOT a variant site at all
//   P3  a parenthesized run of two or more words — an editorial insertion
//   B   bracket-wrapped runs, any width
//   IW  a parenthesis INSIDE one word's surface — the packed shape
//
// Nothing is edited, nothing is ruled: this is a census of shapes with
// examples, so the review can be written once per class. The output is the
// grouping ledger + a CSV for the channel.
//
// Run: node tools/group-variant-sites-v1.mjs --body /home/user/body
//        --bridge <csv.gz> --binding build/rights-binding [--jobs 2]
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from "node:fs";
import { execFile } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readServe, wordsOf } from "./zone-lib-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const BODY = arg("body") || (() => { throw new Error("MISSING_ARG --body"); })();
const BRIDGE = arg("bridge") || (() => { throw new Error("MISSING_ARG --bridge"); })();
const BINDING = arg("binding") || (() => { throw new Error("MISSING_ARG --binding"); })();
const JOBS = Number(arg("jobs", "2"));

// the held list comes from the fleet's own ledger — the gate's census, no
// hand-picking; a work is in this pass because the gate held it by name
const LEDGER = JSON.parse(readFileSync(join(K3, "build", "fleet-ledger-v2.json"), "utf8"));
const held = LEDGER.ledger.filter((r) => r.verdict === "HOLD" && /RAW_SITE_AWAITS_KQ_REVIEW/.test(r.reason || ""));
console.error(`${held.length} works held for the kq review — scanning their served text for site shapes`);

const CORPUS = /[\u0590-\u05ff]/u;                       // corpus script, by range
const PAREN_IN_WORD = /\((?=[\u0590-\u05ff])[^()]*\)/u;  // build-zone's own site test
const BRACKET_IN_WORD = /\[(?=[\u0590-\u05ff])[^\][]*\]/u;
const strip = (s) => String(s).replace(/[\u0591-\u05c7]/gu, ""); // points off, letters stay
const bare = (s) => strip(s).replace(/[^\u0590-\u05ff]/gu, "");

const run = (cmd, args) => new Promise((resolve, reject) => {
  execFile(cmd, args, { maxBuffer: 16 * 1024 * 1024 }, (err, stdout, stderr) =>
    err ? reject(Object.assign(err, { stderr })) : resolve(stdout));
});

const scanWork = async (r) => {
  const slug = r.work.split("/").slice(1).join("-");
  const out = join(K3, "build", "fleet", `vs-${slug}.ndjson`);
  const row = { work: r.work, family: r.family, units: r.units, sites: 0,
    shapes: { P1: 0, P2: 0, P3: 0, B: 0, IW: 0 }, examples: [] };
  try {
    await run("node", [join(HERE, "serve-from-body-v1.mjs"), "--work", r.work, "--body", BODY,
      "--bridge", BRIDGE, "--binding", BINDING, "--out", out]);
    const serve = await readServe(out);
    for (const [unit, u] of serve.units) {
      const words = wordsOf(u.rows);
      for (let i = 0; i < words.length; i += 1) {
        const w = words[i];
        if (w.kq || w.vs) continue; // already reviewed shapes are not raw
        const s = String(w.s || "");
        const isParenWhole = /^\((?=[\u0590-\u05ff])[^()]*\)[:\u05c3]?$/u.test(s.trim());
        const hasParen = PAREN_IN_WORD.test(s);
        const hasBracket = BRACKET_IN_WORD.test(s);
        if (!hasParen && !hasBracket) continue;
        row.sites += 1;
        let shape;
        if (hasBracket && !hasParen) shape = "B";
        else if (isParenWhole) {
          // a whole word in parentheses: twin test against its neighbors —
          // same consonants as the word before or after = the qere shape
          const inner = bare(s);
          const prev = i > 0 ? bare(words[i - 1].s) : "";
          const next = i + 1 < words.length ? bare(words[i + 1].s) : "";
          shape = inner && (inner === prev || inner === next) ? "P1" : "P2";
        } else if (/\((?=[\u0590-\u05ff])[^()]*\s[^()]*\)/u.test(s)) shape = "P3";
        else shape = "IW";
        row.shapes[shape] += 1;
        if (row.examples.length < 3) row.examples.push({ unit, word: i, shape, s: s.slice(0, 40) });
      }
      // multi-word parenthetical runs: an opening paren in one word closed in
      // a later word — counted once at the opener
      for (let i = 0; i < words.length; i += 1) {
        const s = String(words[i].s || "");
        if (words[i].kq || words[i].vs) continue;
        if (/\((?=[\u0590-\u05ff])[^()]*$/u.test(s)) {
          for (let j = i + 1; j < Math.min(i + 8, words.length); j += 1) {
            if (/^[^()]*\)/u.test(String(words[j].s || ""))) {
              row.sites += 1; row.shapes.P3 += 1;
              if (row.examples.length < 3) row.examples.push({ unit, word: i, shape: "P3-run", s: s.slice(0, 40) });
              break;
            }
          }
        }
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
const queue = [...held];
let done = 0;
await Promise.all(Array.from({ length: Math.max(1, JOBS) }, async () => {
  for (;;) {
    const next = queue.shift();
    if (!next) return;
    results.push(await scanWork(next));
    done += 1;
    if (done % 10 === 0) console.error(`${done}/${held.length}`);
  }
}));
results.sort((a, c) => a.work.localeCompare(c.work));

// class per work: the dominant shape, with a MIXED flag when no shape holds
// two thirds of the sites — the review rule is chosen per class, so a work
// with two real dialects needs its own eyes and says so
for (const r of results) {
  const total = Object.values(r.shapes).reduce((a, b) => a + b, 0);
  const [top, n] = Object.entries(r.shapes).sort((a, c) => c[1] - a[1])[0];
  r.class = total === 0 ? (r.error ? "ERROR" : "NO_SITES_FOUND") : (n >= total * (2 / 3) ? top : `MIXED_${top}`);
}
const byClass = {};
for (const r of results) byClass[r.class] = (byClass[r.class] || 0) + 1;

const out = {
  rule: "variant-site-grouping-v1-one-alignment-rule-per-encoding-class",
  ran_at: new Date().toISOString(),
  source: "the served text of every work the fleet holds for RAW_SITE_AWAITS_KQ_REVIEW, read by the same adapter the zones are built from",
  works: results.length,
  classes: byClass,
  ledger: results,
};
writeFileSync(join(K3, "build", "variant-site-grouping-v1.json"), JSON.stringify(out, null, 1));
const csv = ["work,family,units,sites,P1,P2,P3,B,IW,class,example"];
for (const r of results)
  csv.push([r.work, r.family, r.units, r.sites, r.shapes.P1, r.shapes.P2, r.shapes.P3, r.shapes.B, r.shapes.IW, r.class,
    JSON.stringify(r.examples[0] ? `${r.examples[0].unit} w${r.examples[0].word}` : "")].join(","));
writeFileSync(join(K3, "build", "variant-site-grouping-v1.csv"), csv.join("\n") + "\n");
console.log(`${results.length} works grouped · build/variant-site-grouping-v1.{json,csv}`);
for (const [k, n] of Object.entries(byClass).sort((a, c) => c[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${k}`);
