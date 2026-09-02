#!/usr/bin/env node
// check-zone-word-arithmetic-v1 · a zone's numbers agree with its words
//
// The hostile review of 2026-08-22 found genesis.bin asserting 17,807 words
// in its counts while carrying 17,805 in its sections — the counts field
// still speaks at the chain's c0 grain where the words stand at W grain
// (Genesis 1:1 is seven W over eight c0 rows; the sealed HUD is the
// authority for that). Nothing in the suite compared a zone's own numbers to
// its own words, so a page could print a verified-word-for-word receipt over
// a disagreement. Now something does.
//
// The rule: whatever grain a zone's builder chose, the artifact must agree
// with itself — counts.words equals the words its sections carry, and
// sealed_expected_words may only differ where the artifact itself accounts
// for the difference. A zone that disagrees stays RED here, and the red is
// the standing record that its receipts await regeneration by the builder
// that owns the grain, on the machine that builds it. The reader's masthead
// already refuses to print the counts field and counts what it renders.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", "data/zones");

let pass = 0, fail = 0;
const check = (name, ok, detail) => {
  console.log(`${ok ? "  ok  " : "FAIL  "}${name}  ·  ${detail}`);
  ok ? pass++ : fail++;
};

const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin") && !f.endsWith(".commentary.bin")).sort();
if (!bins.length) { console.log("SKIPPED — no zone bins in " + ZONES); process.exit(3); }

for (const f of bins) {
  const z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8"));
  const sum = (z.sections || []).reduce((t, s) => t + (s.words || []).length, 0);
  const counts = Number(z.counts && z.counts.words);
  const sealed = Number(z.counts && z.counts.sealed_expected_words);
  check(`${f}: counts.words equals the words its sections carry`,
    counts === sum,
    counts === sum ? `${sum.toLocaleString()} both` : `counts say ${counts.toLocaleString()}, sections carry ${sum.toLocaleString()} — a ${Math.abs(counts - sum)}-word grain gap its receipts do not account for`);
  if (Number.isFinite(sealed))
    check(`${f}: sealed_expected_words agrees or the gap is the same recorded one`,
      sealed === sum || sealed === counts,
      `sealed ${sealed.toLocaleString()} · sections ${sum.toLocaleString()} · counts ${Number.isFinite(counts) ? counts.toLocaleString() : "?"}`);
}

console.log(fail ? `${fail} FAILED` : "all checks passed");
process.exit(fail ? 1 : 0);
