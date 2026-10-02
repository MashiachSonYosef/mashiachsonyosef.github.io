#!/usr/bin/env node
// GUARDS: zone-store-rule-v1-the-door-keeps-the-seals-the-shelf-keeps-the-weight
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// The crossing, rehearsed before there is a border.
//
// The shelf has not moved yet: base is null and the bins stand beside the
// door. The machinery that will carry them across — sealed object names,
// the page deriving the same name from the same pin, the raw-bytes hash on
// arrival, the refusal — has to be proven to work BEFORE the day it is the
// only path there is, or that day is the first test. So this stands up a
// host of its own: the shipment manifest's objects under their sealed names,
// served with the headers the manifest demands, and a store record whose
// base points at it. Then it asks the three questions.
//
//   L1  the border check passes against the stand-in: every pin reachable,
//       exact, raw, and granted to the page's origin
//   L2  the real reader, told the shelf is across the border, fetches the
//       sealed name, verifies it, renders the text, and holds the hash
//   L3  one object forged on the stand-in — same length, one byte turned —
//       is refused on the page in words, and no text of it is rendered
//
// Needs the shipment (tools/emit-zone-shipment-v1.mjs) and a browser.
//
// Run: node tools/check-zone-store-crossing-v1.mjs
import { readFileSync, existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const RECORD = join(K3, "data", "zone-store-v1.json");
const MANIFEST = join(K3, "build", "zone-shipment-v1", "manifest.json");
if (!existsSync(RECORD)) { console.log("SKIPPED — no store record"); process.exit(3); }
if (!existsSync(MANIFEST)) { console.log("SKIPPED — no shipment at build/zone-shipment-v1; run tools/emit-zone-shipment-v1.mjs"); process.exit(3); }
const store = JSON.parse(readFileSync(RECORD, "utf8"));
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const objects = new Map(manifest.objects.map((o) => [`/${o.object}`, o]));
const SLUG = zonesOnDisk()[0];
if (!SLUG) { console.log("SKIPPED — no zone on disk"); process.exit(3); }

// ── the stand-in host ─────────────────────────────────────────────────────
// Serves the site tree beside the door, and the shipment's objects at their
// sealed names under /shelf/, with the manifest's headers exactly. The store
// record is served with base pointed at /shelf/<prefix>.
const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".js": "text/javascript", ".css": "text/css" };
let tamper = false, origin = null, port = 0;
const srv = createServer((req, res) => {
  const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "").replace(/\\/g, "/");
  const cors = { "access-control-allow-origin": origin };
  try {
    if (p === "/data/zone-store-v1.json") {
      res.writeHead(200, { "content-type": TYPES[".json"] });
      res.end(JSON.stringify({ ...store, base: `http://127.0.0.1:${port}/shelf/${manifest.prefix}` }));
      return;
    }
    if (p.startsWith("/shelf/")) {
      const o = objects.get(p.slice("/shelf".length));
      if (!o) { res.writeHead(404, cors); res.end("no such object"); return; }
      let body = readFileSync(join(K3, "..", o.source));
      if (tamper && o.source.endsWith(`/${SLUG}.bin`)) { body = Buffer.from(body); body[body.length - 12] ^= 0xff; }
      res.writeHead(200, { ...cors, "content-type": o.headers["content-type"], "cache-control": o.headers["cache-control"], "content-length": body.length });
      res.end(body);
      return;
    }
    const body = readFileSync(join(K3, p));
    res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("no"); }
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
port = srv.address().port;
origin = `http://127.0.0.1:${port}`;
const BASE = `${origin}/shelf/${manifest.prefix}`;

// L1 — the border check, against the stand-in. The child fetches from the
// server this very process is running, so the child must run asynchronously:
// a synchronous spawn would hold this event loop, the server would answer
// nothing, and the two would wait on each other until the suite's timeout.
let border = "";
let borderOk = false;
await new Promise((resolve) => {
  execFile("node", [join(HERE, "check-zone-store-reachable-v1.mjs"), "--base", BASE, "--origin", origin, "--jobs", "16"],
    { encoding: "utf8", maxBuffer: 1 << 24 }, (err, stdout, stderr) => {
      border = String(stdout || "") + String(stderr || "");
      borderOk = !err;
      resolve();
    });
});
const borderLine = border.split("\n").find((l) => /^— \d+ pins/.test(l)) || border.split("\n").find((l) => /FAIL/.test(l)) || border.slice(0, 120);
check("L1  the border check passes against the stand-in host", borderOk, borderLine.trim());

// L2 / L3 — the real reader across the rehearsed border. Two browser
// contexts, one per visit, because the objects are served immutable and a
// second visit in the same context would read the honest bin back out of
// the cache and never touch the forgery — which is the cache doing its job,
// and exactly why a forgery has to be met by a reader that has not seen the
// honest object yet.
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const fetched = [];
let ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
let p = await ctx.newPage();
p.on("request", (r) => { if (r.url().includes("/shelf/")) fetched.push(r.url()); });

tamper = false;
await p.goto(`${origin}/zone.html?b=${SLUG}`, { waitUntil: "networkidle" });
try { await p.waitForSelector("section.seg .he-text .wb", { timeout: 30000 }); } catch { /* judged below */ }
const good = await p.evaluate((slug) => ({
  words: document.querySelectorAll("section.seg .he-text .wb").length,
  sha: (window.__binShas || {})[`${slug}.bin`] || null,
  meta: (document.getElementById("meta") || {}).textContent || "",
}), SLUG);
const pin = store.pins[`${SLUG}.bin`];
const sealedName = `${SLUG}.${String(pin.sha256).slice(0, 12)}.bin`;
check("L2  the reader fetches the sealed name across the border", fetched.some((u) => u.endsWith(`/${sealedName}`)),
  fetched.length ? fetched[0].replace(origin, "") : "(no fetch crossed the border)");
check("    verifies it, and renders the text", good.words > 0 && good.sha === pin.sha256,
  good.words > 0 ? `${good.words} words · sha held ${String(good.sha || "").slice(0, 16)}…` : good.meta.slice(0, 90));

await ctx.close();
ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
p = await ctx.newPage();
tamper = true;
await p.goto(`${origin}/zone.html?b=${SLUG}`, { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
const refused = await p.evaluate(() => ({
  meta: (document.getElementById("meta") || {}).textContent || "",
  words: document.querySelectorAll("section.seg .he-text .wb").length,
}));
check("L3  a forged object on the shelf is refused, in words", /^REFUSED/.test(refused.meta) && /sha256/.test(refused.meta), refused.meta.slice(0, 90) || "(silent)");
check("    and no text of it is rendered", refused.words === 0, `${refused.words} words shown`);

await b.close(); srv.close();
console.log("\n  what this does not say: that the real host answers. That is");
console.log("  check-zone-store-reachable-v1's question, asked of the base the record");
console.log("  names, on every suite once the shelf has moved.");
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
