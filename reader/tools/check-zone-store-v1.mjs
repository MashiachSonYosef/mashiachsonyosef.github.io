#!/usr/bin/env node
// The door keeps the seals, the shelf keeps the weight — and a bin that
// fails its seal is refused on the page, visibly, in words.
// GUARDS: zone-store-rule-v1-the-door-keeps-the-seals-the-shelf-keeps-the-weight
//
// Two halves. On disk: the store record exists, every served bin carries a
// pin, every pin matches its bin byte for byte, and no pin names a bin that
// is not there while the shelf stands beside the door (base null) — a stale
// record is exactly the drift this rule exists to make loud. In the reader:
// a bin tampered in transit is refused — the page shows the refusal, in
// words, and renders no text — proved by serving the real site with one
// zone's bytes deliberately altered. Then the same page, served honestly,
// renders. The tamper test is the teeth; a verification that has never seen
// a forgery is a verification nobody has watched work.
//
// Run: node tools/check-zone-store-v1.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { zonesOnDisk } from "./zones-on-disk-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const OUT = join(K3, "data", "zone-store-v1.json");
if (!existsSync(OUT)) {
  console.log("FAIL  the store record exists  ·  data/zone-store-v1.json is not here — run tools/emit-zone-store-v1.mjs");
  console.log("\n1 FAILED");
  process.exit(1);
}
const store = JSON.parse(readFileSync(OUT, "utf8"));
const ZONES = join(K3, "data", "zones");
const bins = readdirSync(ZONES).filter((x) => x.endsWith(".bin")).sort();

// 1 · the record against the disk
check("the record declares its rule", store.rule === "zone-store-rule-v1-the-door-keeps-the-seals-the-shelf-keeps-the-weight", String(store.rule));
check("base is null or an https host", store.base === null || /^https:\/\//.test(String(store.base)), String(store.base));
const unpinned = bins.filter((f) => !(store.pins || {})[f]);
check(`every served bin carries a pin (${bins.length} bins)`, unpinned.length === 0, unpinned.join(", ") || "all pinned");
let stale = [];
for (const [f, pin] of Object.entries(store.pins || {})) {
  const p = join(ZONES, f);
  if (!existsSync(p)) { if (store.base === null) stale.push(`${f} pinned but absent`); continue; }
  const b = readFileSync(p);
  if (createHash("sha256").update(b).digest("hex") !== pin.sha256 || b.length !== pin.bytes)
    stale.push(`${f} drifted from its pin`);
}
check("every pin matches its bin, byte for byte", stale.length === 0, stale.join(" · ") || `${Object.keys(store.pins || {}).length} pins exact`);

// 2 · the refusal, watched working in the real reader
const SLUG = zonesOnDisk()[0];
if (!SLUG) { console.log("SKIPPED (render) — no zone on disk"); console.log(bad ? `\n${bad} FAILED` : "\nall checks passed"); process.exit(bad ? 1 : 3); }
const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".bin": "application/octet-stream" };
let tamper = false;
const srv = createServer((req, res) => {
  const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "").replace(/\\/g, "/");
  try {
    let body = readFileSync(join(K3, p));
    if (tamper && p === `/data/zones/${SLUG}.bin`) {
      // one byte altered deep in the gzip body: same length, different text
      body = Buffer.from(body);
      body[body.length - 12] ^= 0xff;
    }
    res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("no"); }
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const B = `http://127.0.0.1:${srv.address().port}`;

const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });

tamper = true;
await p.goto(`${B}/zone.html?b=${SLUG}`, { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
const refused = await p.evaluate(() => ({
  meta: (document.getElementById("meta") || {}).textContent || "",
  words: document.querySelectorAll("section.seg .he-text .wb").length,
}));
check("a tampered bin is refused, in words, on the page",
  /^REFUSED/.test(refused.meta) && /sha256/.test(refused.meta),
  refused.meta.slice(0, 90) || "(silent)");
check("and no text of it is rendered", refused.words === 0, `${refused.words} words shown`);

tamper = false;
await p.goto(`${B}/zone.html?b=${SLUG}`, { waitUntil: "networkidle" });
await p.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
const good = await p.evaluate(() => ({
  words: document.querySelectorAll("section.seg .he-text .wb").length,
  sha: (window.__binShas || {})[`${document.querySelector("meta[name=\"reader-book\"]")?.content || new URLSearchParams(location.search).get("b")}.bin`] || null,
}));
check("the honest bin renders, verified", good.words > 0, `${good.words} words`);
check("and the page holds the hash it verified", !!good.sha && /^[0-9a-f]{64}$/.test(good.sha || ""),
  good.sha ? `${good.sha.slice(0, 16)}…` : "(none recorded)");

await b.close(); srv.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
