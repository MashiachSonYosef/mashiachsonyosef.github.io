#!/usr/bin/env node
// GUARDS: zone-commentary-rule-v2-everything-recorded-stands-somewhere
//
// Everything the record carries reaches the page, or is named as held.
//
// This is the check for the largest thing a hostile review of this project
// found. The commentary pack maps 612 segments to Genesis 1:1. The attachment
// map claims 182 of them — the ones whose opening quotation our matcher could
// find in the verse — and its own stats call the remaining 430 "verse
// witnesses". An earlier build emitted only the claimed ones, dropped one more
// on licence without a word, and the page said "181 attached" over a record
// carrying 612. Rashbam and Abarbanel were not on the page at all. Nobody
// could have noticed: the number the page printed was the number it had, and
// the number it had was a third of the number there was.
//
// A cap is not the fault. Every reader has to bound something. The fault is a
// cap nobody can see, which is why the manifest's own rule says a bound must
// be printed. So:
//
//   1. every segment the pack maps to a section the zone carries stands
//      somewhere in the sidecar — on a word, or on the section;
//   2. what cannot be printed is present anyway, by name, with the reason;
//   3. the counts the artifact carries add up to the record's own total;
//   4. and the page's own visible count is the record's, not the subset's.
//
// If this fails, something is being shown as complete that is not.
//
// Run: node tools/check-nothing-dropped-v1.mjs [url]

import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
const pw = await loadPlaywright();
import { defaultZoneUrl, zonesOnDisk } from "./zones-on-disk-v1.mjs";
const SKIP_LABEL = "check-nothing-dropped-v1";
// A check about commentary needs a work that carries some. When none is
// served, that is a fact about the corpus and not a defect in the reader, so
// this says so and stops rather than failing every assertion against a page
// with nothing on it.
{
  const { zonesWithCommentary } = await import("./zones-on-disk-v1.mjs");
  if (!zonesWithCommentary().length) {
    console.log(`SKIPPED — no served work carries a commentary sidecar, so ${SKIP_LABEL} has nothing to open`);
    process.exit(3);
  }
}


import { thePack } from "./planned-packs-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

// Which pack, asked of the record. This check named one by hand, and went on
// naming it after it was withdrawn — so what it actually asserted was that a
// file which no longer exists was not here, and it skipped, and a skip that
// says nothing reads exactly like a pass.
const chosen = thePack(null);
if (!chosen) {
  console.log("SKIPPED — data/work-records-v1.js names no commentary pack, so there is nothing to have dropped");
  process.exit(3);
}
const PACK = join(K3, chosen.pack);
const slug = String(chosen.work_id || "").split("/").pop();
const SIDE = join(K3, "data", "zones", `${slug}-commentary.bin`);
if (!existsSync(PACK) || !existsSync(SIDE)) {
  console.log(`SKIPPED — ${chosen.pack} is named by the record and its sidecar is not built`);
  process.exit(3);
}
const load = (p) => JSON.parse(readFileSync(p, "utf8")
  .replace(/^window\.[A-Za-z_0-9]+\s*=\s*Object\.freeze\(/, "")
  .replace(/^window\.[A-Za-z_0-9]+\s*=\s*/, "")
  .replace(/\)\s*;?\s*$/, "").replace(/;\s*$/, ""));
const pack = load(PACK);
const side = JSON.parse(gunzipSync(readFileSync(SIDE)).toString("utf8"));

// ---- the record's own total ---------------------------------------------
const families = [...(pack.commentary || []), ...(pack.targum || [])];
const recorded = new Map();
for (const f of families)
  for (const s of f.segments || []) recorded.set(s.ref, { s, f });

console.log("— everything the record carries stands somewhere —");
check("  the pack's own count is the one being checked against",
  recorded.size === (pack.counts ? pack.counts.exact_segments : recorded.size),
  `${recorded.size} segments · pack says ${pack.counts && pack.counts.exact_segments}`);

// ---- what the sidecar carries -------------------------------------------
const seen = new Map();
for (const u of Object.values(side.units || {})) {
  for (const list of Object.values(u.words || {})) for (const e of list) seen.set(e.ref, { e, where: "word" });
  for (const e of u.section || []) seen.set(e.ref, { e, where: "section" });
}
const missing = [...recorded.keys()].filter((r) => !seen.has(r));
check("  nothing the record carries is missing from the file", missing.length === 0,
  missing.length ? `${missing.length} missing, e.g. ${missing.slice(0, 3).join(" | ")}` : `${seen.size} of ${recorded.size} present`);

// ---- and what cannot be printed says so ---------------------------------
let held = 0, heldNamed = 0, unprintable = 0;
for (const [ref, { s }] of recorded) {
  const he = s.he || {};
  const printable = he.license_disposition === "OPEN_OR_PUBLIC_DOMAIN"
    && he.source_text_present && String(he.proof_text || "").trim();
  if (printable) continue;
  unprintable += 1;
  const got = seen.get(ref);
  if (!got) continue;
  if (got.e.held) { held += 1; if (got.e.family_en && got.e.basis) heldNamed += 1; }
}
check("  every one that cannot be printed is present and marked held", held === unprintable,
  `${held} held of ${unprintable} unprintable`);
check("  and each held one carries its work and the reason", heldNamed === held,
  `${heldNamed} of ${held} name both`);

// ---- the counts the artifact carries add up ------------------------------
{
  const c = side.counts || {};
  const sum = (c.attached || 0) + (c.on_section || 0) + (c.held_licence || 0) + (c.no_text || 0);
  check("  the artifact's own tally adds to the record's total", sum === (c.in_record || -1),
    `${c.attached} on a word + ${c.on_section} on the section + ${c.held_licence} kept off by a licence + ${c.no_text} with no text = ${sum} of ${c.in_record}`);
}
// Nobody has authority to hold a text. A licence can forbid printing one and
// a record can simply be empty, and those are not the same fact — reporting
// the second as the first invents a refusal. So: every segment the record
// carries a body for is printed, and the only thing that may keep one off is
// its own licence, counted out loud.
{
  let withText = 0, printed = 0, byLicence = 0;
  for (const [ref, { s: seg }] of recorded) {
    const he = seg.he || {};
    if (!(he.source_text_present && String(he.proof_text || "").trim())) continue;
    withText += 1;
    const got = seen.get(ref);
    if (got && (got.e.words || []).length) printed += 1;
    else if (got && got.e.held === "licence") byLicence += 1;
  }
  check("  every body the record carries is printed, unless its own licence forbids",
    printed + byLicence === withText,
    `${printed} printed + ${byLicence} forbidden by a licence = ${printed + byLicence} of ${withText} bodies`);
  check("  and what a licence keeps off is counted out loud",
    byLicence === (side.counts || {}).held_licence,
    `${byLicence} measured · ${(side.counts || {}).held_licence} reported`);
}

// ---- and the page prints the record's number, not the subset's -----------
const BASE = (process.argv[2] || "http://127.0.0.1:8899/zone.html").split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.goto(`${BASE}?b=${zonesOnDisk()[0]}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
await p.waitForTimeout(2200);
const shown = await p.evaluate(() => {
  const n = (t) => { const m = /C\s*([\d,]+)/.exec(t || ""); return m ? Number(m[1].replace(/,/g, "")) : null; };
  return {
    index: n(document.querySelector("#cIndex .ci-head b")?.textContent),
    bar: n(document.querySelector("section.seg .c-bar .c-glyph")?.textContent),
    // one mark per line of the verse, so the verse's word-level total is their
    // sum rather than the first one's count
    mark: [...document.querySelectorAll("section.seg .c-mark .c-glyph")]
      .reduce((t, g) => t + (n(g.textContent) || 0), 0),
  };
});
check("  the book's own index counts the whole record", shown.index === recorded.size,
  `page says ${shown.index} · record carries ${recorded.size}`);
check("  the verse's bar and mark together account for it",
  (shown.bar || 0) + (shown.mark || 0) === recorded.size,
  `${shown.mark} on words + ${shown.bar} on the section = ${(shown.bar || 0) + (shown.mark || 0)}`);

// and the held ones are reachable, with their reason in words
await p.evaluate(() => document.querySelector("section.seg .c-bar")?.click());
await p.waitForTimeout(2000);
const heldOnPage = await p.evaluate(() => {
  const ps = [...document.querySelectorAll("section.seg .c-inline.c-held")].filter((x) => !x.hidden);
  return { n: ps.length, said: (ps[0]?.textContent || "").replace(/\s+/g, " ").slice(0, 90) };
});
check("  a commentary with no body says so, and says nothing is being withheld",
  heldOnPage.n === held && /(Not here —|Held —)/.test(heldOnPage.said),
  `${heldOnPage.n} shown · "${heldOnPage.said}…"`);

await p.close(); await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
