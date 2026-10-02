#!/usr/bin/env node
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the ledger for one. The file it writes is a run artifact, not a claim about a work.
//
// A mark that transmits an assertion opens the record of that assertion.
// GUARDS: variant-site-rule-v1-the-mark-opens-a-record-or-the-zone-does-not-board
//
// The five-works review found two raw apparatus sites in the zones serving
// that night: a parenthesis-wrapped form in each targum, printed exactly as
// the source wrote it — so not the markup-leak class — but with no record
// anywhere saying what the wrapping asserts. Typography to guess at. Under
// the pair law's own principle these must be carried as recorded variant
// sites the reader can open, and the owner's pilot ruling makes that record
// layer this lane's work.
//
// Two postures, because two kinds of zone:
//
//   A zone that declares the rule (emitted_from.vs_policy) answers to it
//   whole: every parenthesis-wrapped run of corpus script outside a kq
//   carrier must ride on a vs record, and every vs record must carry the
//   source's own sentence and where it is read from. A record with no
//   sentence is no record.
//
//   A zone that predates the rule is held to the standing ledger
//   (data/variant-sites-standing-v1.json): the sites the review put on the
//   record may stand until the pilot slices retire them, and any site not
//   on that ledger fails the day it appears — a regression, not a legacy.
//
// And the presentation is proved in the real reader, on a fixture cut from
// a zone already served: real corpus text, already licensed and live, with
// an instrument record attached — built under build/, never published.
//
// Run: node tools/check-variant-site-v1.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { createServer } from "node:http";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

// a parenthesis-wrapped run of corpus script — codepoints, never glyphs
const RAW = /\((?=[\u0590-\u05FF])[^()]*\)/u;

const LEDGER = join(K3, "data", "variant-sites-standing-v1.json");
const standing = existsSync(LEDGER)
  ? JSON.parse(readFileSync(LEDGER, "utf8")).standing || {}
  : {};

// 1 · the scan: every served zone, every word
const zonesDir = join(K3, "data", "zones");
const raw = [];         // marked sites carrying no record
let vsCarried = 0;      // sites carried as records
let vsBare = 0;         // records with no sentence or no provenance
for (const slug of zonesOnDisk(zonesDir)) {
  const z = JSON.parse(gunzipSync(readFileSync(join(zonesDir, `${slug}.bin`))).toString("utf8"));
  const declared = !!(z.emitted_from && z.emitted_from.vs_policy);
  for (const sec of z.sections || []) (sec.words || []).forEach((w, j) => {
    if (w.vs) {
      vsCarried += 1;
      if (!(w.vs.said && w.vs.from)) vsBare += 1;
      return;
    }
    if (w.kq) return;   // the ketiv wears its parentheses under its own law
    if (RAW.test(w.s || "")) raw.push({ slug, unit: sec.unit, j, declared });
  });
}
check("no zone that declares the rule ships a marked site without its record",
  raw.filter((s) => s.declared).length === 0,
  raw.filter((s) => s.declared).map((s) => `${s.slug} · ${s.unit} · word ${s.j}`).join(" · ") || "none bare under the rule");
check("every variant-site record carries the source's sentence and its provenance",
  vsBare === 0, vsCarried ? `${vsCarried} carried, ${vsBare} bare` : "none carried yet — the pilot slices bring the first");
const unheld = raw.filter((s) => !s.declared && !(standing[s.slug] && standing[s.slug][s.unit]));
check("every raw site outside the rule stands on the review's record, and no new one has appeared",
  unheld.length === 0,
  unheld.length ? unheld.map((s) => `${s.slug} · ${s.unit} · word ${s.j}`).join(" · ")
    : `${raw.length} standing, all held`);
for (const s of raw.filter((x) => !x.declared && standing[x.slug] && standing[x.slug][x.unit]))
  console.log(`  ..    standing on the record: ${s.slug} · ${s.unit} · word ${s.j} — retires when the pilot slices land`);

// 2 · the presentation, proved in the real reader
// The fixture is a served zone with an instrument record attached to its own
// raw site — the Hebrew is the zone's, already licensed and live; only the
// record is the fixture's, and it says so in its own words.
const site = raw[0];
if (!site && !vsCarried) {
  console.log("\nSKIPPED (presentation) — no marked site and no carried record to render");
  console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
  process.exit(bad ? 1 : 0);
}
const SAID = "the source transmits this form wrapped, and this sentence is the fixture's instrument record for the wrapping";
const FROM = "the fixture's own instrument record, built by check-variant-site-v1 and never served";
const FIXDIR = join(K3, "build", "vs-fixture");
mkdirSync(FIXDIR, { recursive: true });
const FIX = join(FIXDIR, "fixture-vs-v1.bin");
const SLUG = FIX.split(/[\\/]/).pop().replace(/\.bin$/, "");
const zf = JSON.parse(gunzipSync(readFileSync(join(zonesDir, `${site.slug}.bin`))).toString("utf8"));
const secF = zf.sections.find((s) => s.unit === site.unit);
const carrierBefore = secF.words[site.j].s;
secF.words[site.j].vs = { said: SAID, from: FROM };
zf.emitted_from.vs_policy = "AS_WRITTEN_OPENABLE";
writeFileSync(FIX, gzipSync(Buffer.from(JSON.stringify(zf), "utf8")));

const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".bin": "application/octet-stream" };
const srv = createServer((req, res) => {
  const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "")
    .replace(/\\/g, "/");
  const path = p === `/data/zones/${SLUG}.bin` ? FIX : join(K3, p);
  try {
    const body = readFileSync(path);
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("no"); }
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const B = `http://127.0.0.1:${srv.address().port}`;

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
let pageErr = null; p.on("pageerror", (e) => { pageErr = e.message; });
await p.goto(`${B}/zone.html?b=${SLUG}&fixture=1`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb");
check("the fixture zone renders without a page error", !pageErr, pageErr || "clean");

const proof = await p.evaluate(async () => {
  let guard = 0;
  while (guard < 3000 && !document.querySelector("section.seg .he-text .wb.vs")) {
    const next = document.querySelector("section.seg.seg-wait");
    if (!next) break;
    next.scrollIntoView({ block: "center" });
    await new Promise((r) => setTimeout(r, 8));
    guard += 1;
  }
  const wb = document.querySelector("section.seg .he-text .wb.vs");
  if (!wb) return { found: false };
  wb.scrollIntoView({ block: "center" });
  await new Promise((r) => setTimeout(r, 120));
  const before = wb.querySelector(".w").textContent;
  const marked = getComputedStyle(wb.querySelector(".w")).textDecorationLine.includes("underline");
  wb.click();
  await new Promise((r) => setTimeout(r, 1200));
  const roles = [...document.querySelectorAll("#hud .kq-role")].map((x) => x.textContent);
  const keys = [...document.querySelectorAll("#hud .kq-key")].map((x) => x.textContent);
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await new Promise((r) => setTimeout(r, 250));
  return { found: true, before, after: wb.querySelector(".w").textContent, marked,
    role: roles.find((t) => /^variant site — /.test(t)) || "",
    key: keys.find((t) => /Read from /.test(t)) || "" };
});
check("the marked word wears the mark and opens in the real reader",
  proof.found && proof.marked, proof.found ? "dotted, pressable" : "no vs word rendered");
check("the carrier prints exactly as the source wrote it, wrapping included",
  proof.found && proof.before === carrierBefore);
check("the card prints the record's own sentence as a variant site",
  proof.found && proof.role === `variant site — ${SAID}`,
  proof.found ? proof.role.slice(0, 70) || "(no variant-site line on the card)" : "");
check("and says where the record is read from",
  proof.found && proof.key.includes(`Read from ${FROM}`),
  proof.found ? (proof.key || "(absent)").slice(0, 70) : "");
check("opening the record moved no character of the carrier",
  proof.found && proof.after === proof.before);

await b.close(); srv.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
