#!/usr/bin/env node
// The word on the page and the pill in the card answer to the same store.
//
// A zone bakes one reading per form so the page can paint without fetching 256
// shards; the card computes its readings live from the store itself. Those are
// two paths to one answer, and they only stay one answer while the zone is a
// projection of the store that is actually being served. When the store moves
// and a zone does not, the printed word and the pressed pill disagree — the
// page contradicting itself, which is worse than either being wrong alone.
//
// So: re-project each zone over the store on disk and see whether anything
// moves. Nothing should. This reads the artifacts, not a served page, so it
// takes no URL.
// GUARDS: zone-gloss-rule-v4-reading-level-antiquity-1940-lastuary, regloss-rule-v1-project-the-store-over-a-zones-own-keys
//
import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const load = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const tmp = mkdtempSync(join(tmpdir(), "agrees-"));

// The zone names the gloss table it was projected from. If the store on disk
// cannot reproduce that table, the disagreement is between this store and this
// zone — and the check should say which, not just count moved words.
// Only the works the plan actually serves. This read every work the plan
// named, so it spent three of its passes trying to re-project zones for works
// that had been withdrawn, failed to open the files, and reported that the
// store and the zone disagreed — about a zone that was not there.
const planPA = JSON.parse(readFileSync(join(K3, "build", "build-plan-v1.json"), "utf8"));
const servedPA = planPA.works.filter((w) => (w.serve_state || "SERVED") !== "WITHHELD");
if (!servedPA.length) {
  console.log("SKIPPED — the plan serves no work, so there is no page to agree with the store");
  process.exit(3);
}
for (const book of servedPA.map((w) => w.published_as)) {
  console.log(`— ${book} —`);
  const zonePath = join(K3, "data", "zones", `${book}.bin`);
  const out = join(tmp, `${book}-reprojected.bin`);
  let line = "";
  try {
    line = execFileSync("node", [join(HERE, "regloss-zone.mjs"),
      "--zone", zonePath, "--out", out, "--stamp", "check-page-agrees-with-store-v1"],
      { encoding: "utf8", maxBuffer: 1 << 28 }).trim();
  } catch (e) {
    check("  the zone can be re-projected over the store", false, String(e.message).slice(0, 160));
    continue;
  }
  const before = load(zonePath), after = load(out);
  const g0 = before.gloss || {}, g1 = after.gloss || {};
  const forms = new Set([...Object.keys(g0), ...Object.keys(g1)]);
  const moved = [...forms].filter((k) => g0[k] !== g1[k]);
  check("  every form the page prints is the reading the store gives",
    moved.length === 0,
    moved.length
      ? `${moved.length.toLocaleString()} of ${forms.size.toLocaleString()} forms move — e.g. ${moved.slice(0, 3)
          .map((k) => `${k}: "${g0[k]}" -> "${g1[k]}"`).join(" | ")}`
      : `${forms.size.toLocaleString()} forms hold`);
  check("  and the zone still carries the same count of glossed words",
    (before.counts || {}).glossed_words === (after.counts || {}).glossed_words,
    `${(before.counts || {}).glossed_words} then ${(after.counts || {}).glossed_words}`);
  const declared = ((before.emitted_from || {}).gloss_layer || {}).gloss_table_sha256;
  const rebuilt = ((after.emitted_from || {}).gloss_layer || {}).gloss_table_sha256;
  check("  the store on disk is the store this zone was projected from",
    !!declared && declared === rebuilt,
    declared === rebuilt ? `${String(declared).slice(0, 16)}…`
      : `zone names ${String(declared).slice(0, 16)}…, this store makes ${String(rebuilt).slice(0, 16)}…`);
  if (line) console.log(`        ${line}`);
}
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
