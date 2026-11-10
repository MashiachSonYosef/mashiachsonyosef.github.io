#!/usr/bin/env node
// RUN: page
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
// TWO DIFFERENCES, AND BOTH ARE RENDERING, NOT READING. A compound is written
// with "/" between its pieces on disk and drawn with " + " on the page:
// "from/ Tekoa" against "from + Tekoa". That is the same reading in two
// spellings of the same separator. And a period closing a reading on disk
// ("Israel.", Strong's list terminator) is not drawn on the line. The
// comparison normalises those two and nothing else, the same two the page's
// own spanJoin applies. Any other difference is a real one and fails.
//
//   L1  the page and the disk agree on every word of the opening screen
//   L2  and the agreement is not vacuous — the screen carried readings
//
// UNDER WHICH ORDER (10 November 2026). The rule was written when the line
// had one order. Since 3 October the page opens "at this place", where a
// word's line is what the source reads at that very place (word.pg, held by
// check-line-reads-the-place-v1), and since 6 November the pointing may
// withhold a reading the field holds (the lattice sidecar's leader, held by
// check-pointing-gate-v1). So the field is the line under "oldest first" with
// the pointing kept, and that is where this holds it: both are set before the
// page loads, with the source signs "as printed" (at rest the line leaves a
// piece that is only a source's sign undrawn: "<the>/ Carmel" stands as
// "Carmel", which is drawing and not reading). Run with nothing set, the
// check failed on 59 of 95 words of
// Amos's opening screen and went unseen for five weeks, because it stood in
// none of the round's chains. A count taken off zone.gloss is a count of what
// a reader meets under oldest first; under the page's own default, the place
// and the pointing are the other two records to read.
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
const norm = (s) => String(s ?? "").split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/, "").trim();

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
// the order and the pointing position the field is the line under
await p.addInitScript(() => { try { localStorage.clear(); localStorage.setItem("fh.def.order", "oldest"); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); localStorage.setItem("fh.masorah", "keep"); localStorage.setItem("fh.parked-2026-10-24", "1"); localStorage.setItem("fh.signs", "printed"); } catch { /* a device that remembers nothing still reads */ } });
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

check("L1  under oldest first, the pointing kept, the page and the disk agree on every word of the opening screen",
  judged > 0 && agree === judged,
  `${agree} of ${judged} agree${bad_.length ? " · " + bad_.join(" · ") : ""}`);
check("L2  and the agreement is not vacuous", judged >= 20, `${judged} words carried a reading`);

console.log(`
  ${BOOK} · ${judged} words compared, disk field against drawn line

  what this buys: a count taken off zone.gloss is a count of what a reader
  meets under oldest first with the pointing kept. Four wrong models were
  built in one day for want of this field.
`);
console.log(bad ? `${bad} FAILED` : "all checks passed");
process.exit(bad ? 1 : 0);
