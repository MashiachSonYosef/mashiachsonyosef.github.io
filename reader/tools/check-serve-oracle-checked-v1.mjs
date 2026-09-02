#!/usr/bin/env node
// GUARDS: mishkan-serve-rule-v1-verify-once-serve-many-oracle-checked
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// THE WALKER VERIFIES ONCE, SERVES MANY, AND THE SEALED CLI STAYS THE ORACLE.
// tools/mishkan-serve-v1.mjs declares it in its own header:
//
//   "Same authorities, same pins, same joins, same output fields as the sealed
//    gen-8 CLI (query-terminal-reader-v1.mjs) — but verified ONCE per process
//    and served many times. The sealed CLI remains the oracle: --oracle N
//    samples N ids and requires field-exact agreement, else exit 1."
//
// Why it exists. A resident reader is fast because it checks the seals once
// and then answers from memory. That is also how it could drift: a join done
// once and done wrong is wrong for every row after it, and nothing inside the
// serve would say so. So the walker samples its own rows against the sealed
// CLI, field for field, refuses on any disagreement, and writes the tally
// into line 1 of the serve NDJSON as provenance.sealed_oracle.report.
// build-zone.mjs and build-commentary-zone.mjs copy that line whole into the
// zone under emitted_from.walk, so a zone on this route carries the verdict
// its text was served under. That verdict is what this check reads.
//
//   L1  the walker still declares the rule and refuses an oracle mismatch
//   L2  no zone wears the other route's oracle line
//   L3  every zone served on this route carries the sealed oracle's verdict
//   L4  every verdict carried is a pass: nothing sampled disagreed
//   L5  the rows the walk served are the words the zone carries
//   L6  every serve output on disk that rides this route carries a passing
//       verdict over exactly the rows it holds
//   L7  a receipt that names this route with the oracle off names the proof
//       that stood in its place
//
// L2 is the builder's own remark, enforced: "a body serve wearing a walk's
// oracle line would be a costume." The shelf today is served from the
// rebuilt body (tools/serve-from-body-v1.mjs, route
// BODY_REBUILD_SERVE__VERIFIED_JULY_BODY), which cites the July manifest and
// not the sealed CLI. A zone on that route claiming the CLI's verdict would
// be claiming a check that never ran, and this is the one law here that has
// something to judge on every zone whichever route served it.
//
// L3 to L6 hold only zones and serve outputs that ride this route. If none is
// on the disk, this check SKIPS rather than passes: a pass over nothing would
// say the oracle was consulted when there is no record that it was.
//
// What this check does NOT prove. It does not re-run the oracle: the sealed
// CLI, the gen-8 pointer and the staged workspace are not on this disk, and
// a check cannot sample what it cannot open. It reads the verdict the walker
// wrote and holds the zone to it. Whether the seals were what the walker says
// they were is check-workspace-staged-v1's question. Whether the sampled ids
// were well chosen is the walker's, and it answers by naming the count.
//
// Run: node tools/check-serve-oracle-checked-v1.mjs [--zones data/zones]
//                                                   [--serves build]
//                                                   [--walker tools/mishkan-serve-v1.mjs]
//                                                   [--receipt data/serve-rebuild-receipt-2026-08-22.json]
import { readFileSync, readdirSync, existsSync, statSync, openSync, readSync, closeSync, createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { gunzipSync } from "node:zlib";

// Row lines of an NDJSON file, counted a line at a time. Line 1 is provenance.
const countRows = async (p) => {
  let n = 0;
  for await (const line of createInterface({ input: createReadStream(p, { encoding: "utf8" }), crlfDelay: Infinity })) if (line) n += 1;
  return n - 1;
};
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const SERVES = arg("serves", join(K3, "build"));
const WALKER = arg("walker", join(K3, "tools", "mishkan-serve-v1.mjs"));
const RECEIPT = arg("receipt", join(K3, "data", "serve-rebuild-receipt-2026-08-22.json"));

// The names the walker writes. Quoted here so a zone can be held to them;
// L1 confirms the walker still writes these very strings, so the day it is
// renamed this check turns red instead of quietly matching nothing.
const RULE = "mishkan-serve-rule-v1-verify-once-serve-many-oracle-checked";
const ROUTE = "TERMINAL_READER_ARTIFACTS__WEBSITE_LANE_RESIDENT_SERVE";
const ORACLE_CLI = /query-current-terminal-reader-v1\.mjs$/;
const SHA256 = /^[0-9a-f]{64}$/;
// The phrase build-zone.mjs writes into a walk's note and nowhere else.
const CLAIMS_CLI = /field-exact against the sealed CLI oracle/i;

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const push = (list, s, cap = 12) => { list.push(list.length < cap ? s : null); };
const named = (list, n = 3) => list.filter(Boolean).slice(0, n).join(" · ");

// ── L1: the declaring file ────────────────────────────────────────────────
if (!existsSync(WALKER)) {
  console.log(`SKIPPED — no walker at ${WALKER}, so the rule this check guards cannot be quoted`);
  process.exit(3);
}
const walkerSrc = readFileSync(WALKER, "utf8");
const declaresRule = walkerSrc.includes(`Rule id: ${RULE}`) && walkerSrc.includes(`walker_rule: "${RULE}"`);
const declaresRoute = walkerSrc.includes(`route: "${ROUTE}"`);
const a = walkerSrc.indexOf("oracle check"), b = walkerSrc.indexOf("const provenance");
const oracleBlock = a > -1 && b > a ? walkerSrc.slice(a, b) : "";
const refuses = oracleBlock.includes("ORACLE_MISMATCH") && oracleBlock.includes("process.exit(1)")
  && /field_exact:\s*exact/.test(oracleBlock) && /mismatches:\s*mismatches\.length/.test(oracleBlock);
const carriesReport = /sealed_oracle:\s*\{[^}]*report:\s*oracleReport/.test(walkerSrc);
const l1 = declaresRule && declaresRoute && refuses && carriesReport;
const l1Detail = l1
  ? "the walker names the rule and the route, exits 1 on a mismatch before any provenance is written, and writes the report into line 1"
  : [!declaresRule && "the rule id is gone from the walker", !declaresRoute && "the route name is gone",
     !refuses && "the mismatch refusal is gone or rewritten", !carriesReport && "the provenance no longer carries the report"]
    .filter(Boolean).join("; ");

// ── the shelf ─────────────────────────────────────────────────────────────
if (!existsSync(ZONES)) { console.log(`SKIPPED — no zones at ${ZONES}`); process.exit(3); }
const bins = readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort();
if (!bins.length) { console.log("SKIPPED — no zones on this disk"); process.exit(3); }

const costume = [], noVerdict = [], notPass = [], countsOff = [];
const onRoute = [];
const routesSeen = new Map();
let zonesRead = 0, instruments = 0, bodyRoute = 0, otherRoute = 0, sampledTotal = 0;
const shelf = new Map(); // slug -> { route, words }

for (const f of bins) {
  let z;
  try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }
  if ((z.emitted_from || {}).test_instrument) { instruments += 1; continue; }
  zonesRead += 1;
  const slug = f.replace(/\.bin$/, "");
  const name = String(z.work || slug);
  const walk = (z.emitted_from || {}).walk || null;
  const route = String(z.route || (walk && walk.route) || "(none)");
  // a walk that names the walk's route under z.route's body route is a
  // costume too; both fields are read, not the first that answers
  const walkRoute = String((walk && walk.route) || "");
  routesSeen.set(route, (routesSeen.get(route) || 0) + 1);
  const c = z.counts || {};
  shelf.set(slug, { route, words: c.words });

  const so = walk && walk.sealed_oracle ? walk.sealed_oracle : null;
  const bo = walk && walk.body_oracle ? walk.body_oracle : null;
  // build-zone spreads a serve's provenance into walk, so the rule may arrive
  // under walker_rule (the walker's field) or rule (serve-from-body's field)
  const claimsRoute = route === ROUTE || walkRoute === ROUTE || !!(walk && (walk.walker_rule === RULE || walk.rule === RULE));

  // L2 — each route's receipts are its own
  const why = [];
  if (!walk) why.push("no walk provenance at all");
  else {
    if (claimsRoute && !so) why.push("claims the sealed-artifact route and carries no sealed oracle");
    if (so && bo) why.push("carries both oracles");
    if (bo && claimsRoute) why.push("a body serve wearing the walk's route or rule");
    if (bo && CLAIMS_CLI.test(String(walk.note || ""))) why.push("a body serve whose note claims the sealed CLI oracle");
    if (so && route !== ROUTE) why.push(`carries the sealed oracle under route ${route}`);
  }
  if (why.length) push(costume, `${name} · ${why.join("; ")}`);

  if (!(so || claimsRoute)) { if (bo) bodyRoute += 1; else otherRoute += 1; continue; }
  onRoute.push(name);

  // L3 — the verdict is there, and it is the sealed CLI's
  const rep = so && so.report && typeof so.report === "object" ? so.report : null;
  const wellFormed = !!rep && Number.isInteger(rep.sampled) && Number.isInteger(rep.field_exact) && Number.isInteger(rep.mismatches);
  const verdictOk = !!so && wellFormed && ORACLE_CLI.test(String(so.module || ""))
    && SHA256.test(String(so.pointer_sha256 || "")) && walk.walker_rule === RULE;
  if (!verdictOk) {
    push(noVerdict, `${name} · ${!so ? "no sealed oracle" : !so.report ? "oracle off (report null)"
      : !wellFormed ? "report is not three integers" : !ORACLE_CLI.test(String(so.module || "")) ? "oracle module is not the sealed CLI"
      : !SHA256.test(String(so.pointer_sha256 || "")) ? "no pointer sha256" : "walk names another rule"}`);
  } else {
    // L4 — and it is a pass. The walker always picks first, last and middle,
    // so a report over a range of three or more ids sampled fewer than three
    // did not come from the walker.
    sampledTotal += rep.sampled;
    const ids = Number(walk.ids_walked);
    const floor = Number.isInteger(ids) && ids > 0 ? Math.min(3, ids) : 1;
    const pass = rep.mismatches === 0 && rep.field_exact === rep.sampled && rep.sampled >= floor;
    if (!pass) push(notPass, `${name} · ${rep.field_exact}/${rep.sampled} field-exact, ${rep.mismatches} mismatched`);
  }

  // L5 — the rows the walk served are the words the zone carries, and the
  // identity oracle allocated that many
  const io = (z.emitted_from || {}).identity_oracle || {};
  const ids = walk.ids_walked, words = c.words, held = Number(c.held) || 0;
  const agree = Number.isInteger(ids) && ids === words
    && (io.sealed_c0_rows === undefined || io.sealed_c0_rows === ids)
    && (c.sealed_expected_words === undefined || c.sealed_expected_words === ids)
    && (walk.found_exact === undefined || walk.found_exact === ids - held);
  if (!agree) push(countsOff, `${name} · walked ${ids} · words ${words} · sealed ${io.sealed_c0_rows ?? c.sealed_expected_words ?? "?"} · found_exact ${walk.found_exact ?? "?"} · held ${held}`);
}

// ── the serve outputs ─────────────────────────────────────────────────────
// Line 1 of a serve is its provenance. Read that line alone first, so a
// directory of large files is classified without being loaded; only a file
// that rides this route is read whole, to count the rows it holds.
const firstLine = (p) => {
  const fd = openSync(p, "r");
  try {
    let buf = Buffer.alloc(0), pos = 0;
    const chunk = Buffer.alloc(65536);
    for (;;) {
      const n = readSync(fd, chunk, 0, chunk.length, pos);
      if (n <= 0) break;
      buf = Buffer.concat([buf, chunk.subarray(0, n)]); pos += n;
      const nl = buf.indexOf(10);
      if (nl > -1) return buf.subarray(0, nl).toString("utf8");
      if (buf.length > 16 * 1024 * 1024) break;
    }
    return buf.toString("utf8");
  } finally { closeSync(fd); }
};
const ndjsons = [];
const walkDir = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = join(d, e.name);
    if (e.isDirectory()) walkDir(p);
    else if (e.name.endsWith(".ndjson")) ndjsons.push(p);
  }
};
if (existsSync(SERVES)) {
  if (statSync(SERVES).isDirectory()) walkDir(SERVES);
  else if (SERVES.endsWith(".ndjson")) ndjsons.push(SERVES);
}
ndjsons.sort();
let serveFiles = 0, otherServes = 0, otherNdjson = 0;
const routeServes = [], serveBad = [];
for (const p of ndjsons) {
  let rec;
  try { rec = JSON.parse(firstLine(p)); } catch { otherNdjson += 1; continue; }
  const prov = rec && rec.provenance;
  if (!prov || typeof prov !== "object") { otherNdjson += 1; continue; }
  serveFiles += 1;
  const rides = prov.walker_rule === RULE || prov.route === ROUTE || !!prov.sealed_oracle;
  if (!rides) { otherServes += 1; continue; }
  const rel = relative(K3, p);
  routeServes.push(rel);
  const so = prov.sealed_oracle || null, rep = so && so.report && typeof so.report === "object" ? so.report : null;
  // streamed: a serve output can run past what one string may hold, and a
  // check that dies on a big file reports nothing while looking red
  const rows = await countRows(p);
  const why = [];
  if (prov.walker_rule !== RULE) why.push("names another rule");
  if (!so) why.push("no sealed oracle");
  else if (!rep) why.push("oracle off (report null)");
  else if (!(Number.isInteger(rep.sampled) && rep.mismatches === 0 && rep.field_exact === rep.sampled && rep.sampled >= Math.min(3, Math.max(1, rows))))
    why.push(`${rep.field_exact}/${rep.sampled} field-exact, ${rep.mismatches} mismatched`);
  if (prov.id_count !== rows) why.push(`provenance says ${prov.id_count} ids, the file holds ${rows} rows`);
  if (why.length) push(serveBad, `${rel} · ${why.join("; ")}`);
}

// ── the receipt ───────────────────────────────────────────────────────────
// A receipt records a serve; it is not the serve. Where it says the sampling
// oracle was off, it must say what stood in its place, and what it says is
// printed so a stranger can weigh it. The zone law above (L3) is the strict
// one: a zone whose walk carries no verdict is red whatever a receipt says.
let receiptSeen = false, receiptOnRoute = false, receiptOk = true, receiptDetail = `no receipt at ${relative(K3, RECEIPT)}`;
const receiptRanges = [];
if (existsSync(RECEIPT)) {
  receiptSeen = true;
  let r = null;
  try { r = JSON.parse(readFileSync(RECEIPT, "utf8")); } catch { r = null; }
  const s = (r && r.serves) || {};
  if (s.walker_rule === RULE || s.route === ROUTE) {
    receiptOnRoute = true;
    const off = /oracle was off/i.test(String(s.authorities || ""));
    const proof = r.proof_in_place_of_the_sampling_oracle || null;
    const proofNamed = !!(proof && typeof proof.method === "string" && proof.method.trim()
      && typeof proof.conclusion === "string" && proof.conclusion.trim());
    receiptOk = !off || proofNamed;
    receiptDetail = off
      ? (proofNamed ? `oracle off; in its place: ${proof.method.slice(0, 96)}` : "the oracle was off and no proof stands in its place")
      : "the receipt records the oracle on";
    for (const g of s.ranges || []) {
      const slug = String(g.work_id || "").split("/").pop();
      const here = shelf.get(slug);
      receiptRanges.push(`${g.work_id} ${Number(g.ids_served).toLocaleString()} ids · ${here
        ? `on the shelf now under ${here.route === ROUTE ? "this route" : "the body route"}, ${Number(here.words).toLocaleString()} words`
        : "not on the shelf now"}`);
    }
  } else if (r) {
    receiptDetail = "the receipt names another route; nothing here to hold it to";
  } else {
    receiptOk = false; receiptDetail = "the receipt does not parse";
  }
}

// ── verdicts ──────────────────────────────────────────────────────────────
const nothingOnRoute = onRoute.length === 0 && routeServes.length === 0;
const l2 = costume.length === 0, l3 = noVerdict.length === 0, l4 = notPass.length === 0, l5 = countsOff.length === 0, l6 = serveBad.length === 0;
const anyBad = !l1 || !l2 || !receiptOk || (!nothingOnRoute && !(l3 && l4 && l5 && l6));

// The suite reads the first line of a skip. Say it first, and say what was
// looked for, so an empty shelf cannot read as a clean one.
if (nothingOnRoute && !anyBad) {
  console.log(`SKIPPED — no zone in ${relative(K3, ZONES)} and no serve NDJSON under ${relative(K3, SERVES)} rides route ${ROUTE}; `
    + `${zonesRead} zones read (${[...routesSeen.entries()].map(([r, n]) => `${n} ${r}`).join(", ")}), `
    + `${serveFiles} serve output(s) read, none on this route, so the oracle laws L3 to L6 had nothing to judge`);
}

console.log(`— ${zonesRead} zones · ${onRoute.length} on this route · ${bodyRoute} served from the body · ${otherRoute} on another route`
  + `${instruments ? ` · ${instruments} test instrument(s) set aside` : ""}`
  + ` · ${serveFiles} serve output(s) on disk, ${routeServes.length} on this route`
  + ` · receipt ${receiptSeen ? (receiptOnRoute ? "names this route" : "names another") : "absent"} —\n`);

check("L1  the walker still declares the rule and refuses an oracle mismatch", l1, l1Detail);

check("L2  no zone wears the other route's oracle line",
  l2,
  costume.length ? `${costume.length} costumed — ${named(costume)}`
    : `${bodyRoute} body serves cite the July manifest and none claims the sealed CLI; ${onRoute.length} walks cite the CLI and none claims the manifest`);

if (nothingOnRoute) {
  console.log(`  --  L3 to L6 had no zone and no serve output on route ${ROUTE} to judge; not counted as passed`);
} else {
  check("L3  every zone served on this route carries the sealed oracle's verdict",
    l3,
    noVerdict.length ? `${noVerdict.length} without one — ${named(noVerdict)}`
      : `${onRoute.length} zone(s), each naming the sealed CLI, its pointer sha256 and a report`);

  check("L4  every verdict carried is a pass: nothing sampled disagreed",
    l4,
    notPass.length ? `${notPass.length} not a pass — ${named(notPass)}`
      : `${sampledTotal.toLocaleString()} ids sampled across ${onRoute.length} zone(s), every one field-exact`);

  check("L5  the rows the walk served are the words the zone carries",
    l5,
    countsOff.length ? `${countsOff.length} disagree — ${named(countsOff, 2)}`
      : "ids walked, words carried, rows the identity oracle allocated and found_exact agree on every zone");

  check("L6  every serve output on disk that rides this route carries a passing verdict over exactly the rows it holds",
    l6,
    serveBad.length ? `${serveBad.length} fail — ${named(serveBad)}`
      : routeServes.length ? `${routeServes.length} serve output(s): ${named(routeServes)}`
        : "no serve output on disk rides this route; only the zones spoke");
}

check("L7  a receipt that names this route with the oracle off names the proof that stood in its place", receiptOk, receiptDetail);
for (const line of receiptRanges) console.log(`        ${line}`);

console.log("\n  what this does not say: that the oracle would agree today. The sealed CLI and");
console.log("  the staged workspace are not on this disk, so nothing here re-samples a row;");
console.log("  this check holds each zone and serve output to the verdict the walker wrote");
console.log("  when it ran. The seals themselves are check-workspace-staged-v1's question.");

if (bad) { console.log(`\n${bad} FAILED`); process.exit(1); }
if (nothingOnRoute) {
  console.log(`\nSKIPPED — the laws with evidence held, and the oracle laws had nothing on this disk to judge`);
  process.exit(3);
}
console.log("\nall checks passed");
process.exit(0);
