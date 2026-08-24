#!/usr/bin/env node
// GUARDS: w-grain-rule-v1-a-component-system-is-drawn-on-a-W-and-a-W-is-recorded, w-list-rule-v1-the-record-says-which-entries-are-W
//
// The things a zone prints as words have to be the W the record holds.
//
// This is the check for the largest unproven thing in the reader. Every
// component a reader can open — every COMPcell, every COMPspan cover — is
// arithmetic over one W's component list, reached by that W's K. A form with
// n components has n(n+1)/2 contiguous cells and 2^(n-1) complete covers, and
// none of it is stored. So the whole HUD is only as true as the claim that the
// thing it was drawn on is a W.
//
// It is not the same claim as "this is a row of the chain". The sealed HUD for
// Genesis 1:1 records seven W; the chain's c0 numbering for the same verse is
// eight rows, because c0 is the finer grain and one W's components can occupy
// more than one of them. The first word is one W whose COMPspan divides it in
// two. The two c0 rows under it are that division, not two W.
//
// Both mistakes have now been made here, in the same week, in both directions.
// A repair merged c0 rows into words wherever an English definition catalog
// carried a row for the merged key — a catalog deciding Hebrew wordhood. Then
// the repair was pulled back out on the grounds that the chain's row count is
// the record, which split a W the sealed HUD names and left the reader unable
// to open the whole form at all. Neither was reading the W list. Nothing in
// this lane can derive it: a three-component form's middle cover is a
// legitimate cover, so form arithmetic cannot tell two adjacent W from one
// divided W and must never be asked to.
//
// So this asks the only question that settles it, per section, against the
// record: where a sealed HUD lists a section's W, the zone's entries for that
// section are those W, in that order, character for character under NFC — mark
// order differs between the serve output and the HUD and is not a difference in
// text — and each one carries the HUD's own normalized key.
//
// Where no W list is on this disk, the section is counted and named, and this
// FAILS. That is not pedantry about coverage. A COMPspan drawn on an entry
// nobody has shown to be a W is a component system offered over something that
// may not be one, and the honest state of the reader today is that this is
// proven for one section of one work and unproven for the rest.
//
// What ends it: the W list for every section of every published work, in the
// shape the Genesis 1:1 HUD already uses — surface, normalized key, and
// compspanTemplateId per W. That is a corpus-lane artifact.
//
// Run: node tools/check-w-grain-v1.mjs

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { wListsUnder, agreesWith } from "./w-list-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const DATA = join(K3, "data");
const ZONES = join(DATA, "zones");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

if (!existsSync(ZONES)) { console.log("SKIPPED — no zones directory here"); process.exit(3); }

// ---- every W list this disk holds ----------------------------------------
// Found by shape rather than by filename, and read by the same module the zone
// builder refuses on — so a check and a build cannot disagree about what the
// record says.
const wLists = wListsUnder(DATA);

console.log("— the W lists this disk holds —");
check("  at least one sealed W list is here to check against", wLists.size > 0,
  wLists.size ? [...wLists].map(([r, v]) => `${r} · ${v.words.length} W · ${v.file}`).join(" | ") : "none");
if (!wLists.size) { console.log(`\n${bad} FAILED`); process.exit(1); }

// ---- and what each zone prints -------------------------------------------
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort();
let proven = 0, unproven = 0, worksAsked = 0;
const holes = [];

console.log("\n— what a zone prints as a W, against the record —");
for (const f of bins) {
  const z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8"));
  if ((z.emitted_from || {}).test_instrument) continue;
  const secs = (z.sections || []);
  if (!secs.length) continue;
  worksAsked += 1;

  let here = 0;
  for (const sec of secs) {
    const list = wLists.get(`${z.work} ${sec.label}`);
    if (!list) { unproven += 1; continue; }
    here += 1; proven += 1;
    const r = agreesWith(sec.words, list.words);
    check(`  ${z.work} ${sec.label} prints the W the record lists`, r.count && r.surfaces,
      r.count
        ? (r.surfaces ? `${r.printed} of ${r.recorded}, character for character under NFC`
          : `first difference at ${r.firstDifference.at}: "${r.firstDifference.printed}" vs "${r.firstDifference.recorded}"`)
        : `${r.printed} entries against ${r.recorded} W in ${list.file}`);
    check(`    and each carries the record's own key, byte-exact`, r.keys,
      r.count ? (r.keys ? `${r.recorded} of ${r.recorded}` : "a surface agrees and its key does not") : "counts differ");
  }
  if (here < secs.length) holes.push({ work: z.work || f, has: here, of: secs.length });
}
check("  a published work was asked", worksAsked > 0, `${worksAsked} works`);

// ---- and the hole, named rather than deferred -----------------------------
console.log("\n— and every section whose W nobody here can confirm —");
for (const h of holes)
  console.log(`     ${String(h.work).padEnd(28)} ${(h.of - h.has).toLocaleString()} of ${h.of.toLocaleString()} sections carry no W list on this disk`);
check("  every section a zone prints has a W list to be checked against",
  unproven === 0,
  `${proven.toLocaleString()} proven · ${unproven.toLocaleString()} unproven — until a W list arrives for these, every ` +
  `component system the reader opens in them is drawn on an entry nobody has shown to be a W`);

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
