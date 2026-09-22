#!/usr/bin/env node
// GUARDS: served-line-rule-v1-the-zones-gloss-field-is-the-line-the-page-draws-and-no-lane-need-model-the-sort
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// THE PAGE'S ANSWER IS ALREADY ON DISK.
//
// On 2026-09-21 two lanes spent a day disagreeing about which reading the
// page puts under a word. One modelled the sort from the shard and was wrong
// four times; the other modelled it from the engine and was wrong once. Both
// were reconstructing something the build had already computed and written
// down: zone.gloss, a map from key to the reading the line draws.
//
// So the rule, and it is worth more than either model:
//
//   for every word the page draws, zone.gloss[key] IS the line. A lane that
//   wants to know what a reader meets reads that field. It does not simulate
//   the comparator, the sense split, the grouping or the tie-break.
//
// ONE DIFFERENCE, AND IT IS RENDERING, NOT READING. A compound is written
// with "/" between its pieces on disk and drawn with " + " on the page:
// "from/ Tekoa" against "from + Tekoa". That is the same reading in two
// spellings of the same separator, so the comparison normalises it and
// nothing else. Any other difference is a real one and fails.
//
//   L1  the page and the disk agree on every word of the opening screen
//   L2  and the agreement is not vacuous — the screen carried readings
//
// Not covered: whether the reading is right, or which source it came from.
// This says only that the field and the line are the same string, so a count
// taken off the field is a count of what a reader meets.
//
// Run: node tools/check-disk-gloss-is-the-line-v1.mjs [url]
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const ARG = process.argv[2] || "";
const BASE = (ARG || "http://127.0.0.1:8899/zone.html").split("?")[0];
const BOOK = (ARG.match(/[?&]b=([a-z0-9-]+)/) || [])[1] || zonesOnDisk()[0];
const ZONE = join(K3, "data", "zones", `${BOOK}.bin`);
if (!existsSync(ZONE)) { console.log(`SKIPPED — no zone on disk for ${BOOK}`); process.exit(3); }

const zone = JSON.parse(gunzipSync(readFileSync(ZONE)).toString("utf8"));
if (!zone.gloss) { console.log(`SKIPPED — ${BOOK} carries no gloss map, so there is no field to hold to the line`); process.exit(3); }

// the one normalisation, and its whole extent: the separator between the
// pieces of a compound
const norm = (s) => String(s ?? "").split("/").map((x) => x.trim()).filter(Boolean).join(" + ").trim();

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${BASE}?b=${BOOK}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(2600);
const drawn = await p.evaluate(() => [...document.querySelectorAll("section.seg")].flatMap((s) =>
  [...s.querySelectorAll(".he-text .wb")].map((wb) => ({
    he: ((wb.querySelector(".w") || {}).textContent || "").trim(),
    g: ((wb.querySelector(":scope > .g") || {}).title || ""),
  }))));
await b.close();

// THE WORDS ARE WALKED IN STEP, and the walk stops the moment the surfaces
// disagree. A comparison that re-aligned itself after a mismatch would be
// comparing different words and calling them equal.
const flat = (zone.sections || []).flatMap((s) => (s.words || []));
let judged = 0, agree = 0;
const bad_ = [];
for (let i = 0; i < drawn.length && i < flat.length; i += 1) {
  if (String(flat[i].s ?? "").trim() !== drawn[i].he) break;
  const g = zone.gloss[flat[i].k];
  if (g === undefined || g === null || g === "") continue;
  judged += 1;
  if (norm(g) === norm(drawn[i].g)) agree += 1;
  else if (bad_.length < 4) bad_.push(`${flat[i].k}: disk ${JSON.stringify(String(g).slice(0, 34))} vs line ${JSON.stringify(String(drawn[i].g).slice(0, 34))}`);
}

check("L1  the page and the disk agree on every word of the opening screen",
  judged > 0 && agree === judged,
  `${agree} of ${judged} agree${bad_.length ? " · " + bad_.join(" · ") : ""}`);
check("L2  and the agreement is not vacuous", judged >= 20, `${judged} words carried a reading`);

console.log(`
  ${BOOK} · ${judged} words compared, disk field against drawn line

  what this buys: a count taken off zone.gloss is a count of what a reader
  meets. Four wrong models were built in one day for want of this field.
`);
console.log(bad ? `${bad} FAILED` : "all checks passed");
process.exit(bad ? 1 : 0);
