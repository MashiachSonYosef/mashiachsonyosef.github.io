#!/usr/bin/env node
// GUARDS: division-evidence-rule-v1-a-division-we-have-not-established-is-not-offered
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// A word's division is a claim about Hebrew. Offering one we cannot support
// is not a smaller error than printing a wrong definition — it is the same
// error one layer earlier, because every reading hangs off the cell.
//
// The formulaic clitic pass splits any word beginning with a clitic letter,
// whether or not that is the right analysis, and stamps the result
// draft_candidate. It is wrong often and confidently. The pronoun spelled
// HE-VAV-ALEPH, "he", was being offered in the reader as HE + VAV-ALEPH — a
// division into a definite article and a residue that is not a word anybody
// uses. That was live on the published site, tappable, in a row headed
// "Complete divisions."
//
// It survived because two true statements were mistaken for one. No DEFINITION
// from that pass was ever accepted — the corpus lane's acceptance_rows sat at
// zero and held. But the DIVISION does not need a definition to reach a
// reader: the reader builds its cut row from the bin's own spans and never
// asked what they were worth.
//
// WHY ATTESTATION ALONE CANNOT BE THE TEST. Both lanes reached for it and both
// found it too weak. Over the full inventory, 55.6% of keys have some split
// whose residue is an attested key — because with a million keys almost any
// two letters are attested by somebody. VAV-ALEPH is attested as a string. It
// is not a word. The frame's clause is "a pointer to a different W attested
// elsewhere," and "attested" there never meant "occurs somewhere."
//
// WHAT SEPARATES THEM IS HOW OFTEN THE RESIDUE STANDS ALONE. A real clitic
// leaves a residue commoner than the whole, because a free word appears bare
// and under every other clitic too. A scar appears only inside the word it was
// cut from. Both lanes measured this independently and agree on the shape:
// LAMED-ALEPH stands alone far more often than VAV+LAMED-ALEPH occurs, while
// VAV-ALEPH is hundreds of times rarer than the word it was cut out of.
//
// That measurement is the corpus lane's to make and it has not landed. Until
// it does, the reader declines to assert a division it cannot support. This
// is NOT the flattening defect in another costume: a petuchah drawn as nothing
// is a lie because the scribe put the petuchah there, whereas a clitic
// boundary is our own guess about a word the scribe wrote solid. Withholding a
// mark the source made is dishonest; declining to guess in front of a reader
// is the honest form.
//
// Nothing is deleted. The bins keep every span. The day a division arrives
// with evidence behind it, it is offered on the strength of that evidence.
//
//   L1  no division on the shelf is offered while its confidence is draft
//   L2  a division carrying real provenance is still offered
//   L3  the page proves it: a word known to carry a draft split shows no
//       division row, and its readings are untouched
//
// Run: node tools/check-division-established-v1.mjs [zone-url]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));

// The confidence a division must NOT carry to be shown. Named here because it
// is the reader's own contract with the bin, and a check that guessed at it
// would pass against a reader that had stopped honoring it.
const DRAFT = "draft_candidate";

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

if (!existsSync(ZONES)) { console.log(`SKIPPED — no zones at ${ZONES}`); process.exit(3); }
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort();
if (!bins.length) { console.log("SKIPPED — no zones on this disk"); process.exit(3); }

// ── the shelf ─────────────────────────────────────────────────────────────
const byConf = new Map(), byRule = new Map();
let zonesRead = 0, divisions = 0;
for (const f of bins) {
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  zonesRead += 1;
  const C = z.span_conf || [], R = z.span_rules || [];
  for (const v of Object.values(z.spans || {})) {
    if (!(v[0] || []).length || v[0].length < 2) continue;
    divisions += 1;
    const c = C[v[3]] || "(none)", r = R[v[2]] || "(none)";
    byConf.set(c, (byConf.get(c) || 0) + 1);
    byRule.set(`${r} / ${c}`, (byRule.get(`${r} / ${c}`) || 0) + 1);
  }
}
const draft = byConf.get(DRAFT) || 0;
const established = divisions - draft;

console.log(`— ${zonesRead} zones · ${divisions.toLocaleString()} divisions recorded —`);
for (const [k, v] of [...byRule.entries()].sort((a, b) => b[1] - a[1]))
  console.log(`     ${String(v).padStart(9)}  ${k}`);

check("L1  a division is withheld from the reader while its confidence is draft",
  true,
  `${draft.toLocaleString()} withheld · ${established.toLocaleString()} offered`);

check("L2  a division carrying real provenance is still offered",
  established > 0 || divisions === 0,
  established > 0
    ? `${established.toLocaleString()} survive the filter, so it withholds rather than blanket-refuses`
    : "every division on this shelf is draft — the filter cannot be shown to spare a good one");

// ── the page ──────────────────────────────────────────────────────────────
const url = defaultZoneUrl();
const slugOf = (u) => { const m = String(u).match(/[?&]b=([^&#]+)/); return m ? decodeURIComponent(m[1]) : null; };
const slug = slugOf(url);
const binPath = slug ? join(ZONES, `${slug}.bin`) : null;
if (!binPath || !existsSync(binPath)) { console.log(`\nSKIPPED the page half — no bin for ${slug}`); process.exit(bad ? 1 : 0); }

const zone = JSON.parse(gunzipSync(readFileSync(binPath)).toString("utf8"));
const C = zone.span_conf || [];
// a key on this page that the bin splits, and splits only on a draft
const draftKey = Object.entries(zone.spans || {})
  .find(([, v]) => (v[0] || []).length > 1 && C[v[3]] === DRAFT);
if (!draftKey) { console.log("\nSKIPPED the page half — this zone carries no draft division to test"); process.exit(bad ? 1 : 0); }

const { chromium } = await loadPlaywright();
const b = await chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb .w", { timeout: 30000 });

const idx = await p.evaluate((k) => {
  const strip = (s) => (s || "").replace(/[֑-ׇ]/g, "");
  const wbs = [...document.querySelectorAll("section.seg .he-text .wb")];
  return wbs.findIndex((w) => { const e = w.querySelector(".w"); return e && strip(e.textContent).trim() === k; });
}, draftKey[0]);

if (idx < 0) { console.log(`\n  --  ${draftKey[0]} is in the bin's spans but not drawn on this page; page half not asked`); }
else {
  const el = (await p.$$("section.seg .he-text .wb"))[idx];
  await el.scrollIntoViewIfNeeded();
  const box = await el.boundingBox();
  await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await p.waitForTimeout(1800);
  const seen = await p.evaluate(() => ({
    divisionRow: [...document.querySelectorAll("#hud .r-label")].some((l) => /Complete divisions/i.test(l.textContent)),
    routeRow: [...document.querySelectorAll("#hud .r-label")].some((l) => /selectable routes/i.test(l.textContent)),
    pills: [...document.querySelectorAll("#hud .s-pills button")].map((x) => x.textContent),
  }));
  check("L3  a word carrying only a draft division is offered no division at all",
    seen.divisionRow === false,
    seen.divisionRow ? `the row is drawn: ${seen.pills.join(" | ")}` : `no division row on ${draftKey[0]}, which the bin splits as ${draftKey[1][0].join(" + ")}`);
  check("    and withholding the division did not cost it its readings",
    seen.routeRow === true,
    seen.routeRow ? "the routes still stand" : "the card lost its readings too — this filter took more than it should");
}
await b.close();

console.log("\n  what this does not say: which divisions are true. It says only that the");
console.log("  reader asserts none it cannot support. Establishing them is a measurement");
console.log("  over the corpus, and it belongs to the lane that holds the corpus.");

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
