#!/usr/bin/env node
// LEDGER: O
// the named stream: which zone bin is published, and its bytes — this names
// each bin's object on the shelf it is moving to, and writes nothing else.
// GUARDS: zone-store-rule-v1-the-door-keeps-the-seals-the-shelf-keeps-the-weight
//
// The shipment: what the ferryman carries when the shelf moves.
//
// The full library will not fit beside the door. At twenty-one bytes a word
// the works held for the shape of their ids alone would add a gigabyte and a
// half to a repository whose host allows one; the answer was wired on
// 2026-08-27 and has stood dark since: the reader reads `base` from the store
// record and verifies every bin that arrives from it against a pin that
// never leaves the door. This lane holds a read token by the key-hygiene
// agreement of that day — write belongs to the ferryman — so what this lane
// can do is name the objects exactly, seal them, and hand the list over.
//
// Each object is named by its seal as well as its name:
//
//     <prefix>/<name>.<first twelve hex of sha256>.bin
//
// so a repinned bin is a new object at a new address and an object once
// written is never rewritten. The reader builds the same name from the same
// pin, which is why the two can never disagree about which bytes a name
// means. Two headers matter and both are stated per object: the content type
// is application/octet-stream, and there is NO content-encoding. The bin is
// gzip on the inside and the page decompresses it itself after hashing the
// raw bytes; a host that declared content-encoding: gzip would hand the page
// the decompressed body, whose hash matches no pin, and every zone would be
// refused at once.
//
// Emits build/zone-shipment-v1/
//   manifest.json   one row per pinned bin: object, source, bytes, sha256,
//                   the two headers, cache-control
//   SHA256SUMS      sha256 and object name, one per line, for the ferryman's
//                   own verification on arrival (the ark discipline)
//   cors.json       the rule the bucket needs so the page's origin may read
//   HANDOFF.md      the steps in order, from this list to a moved shelf
//
// Run: node tools/emit-zone-shipment-v1.mjs [--prefix site/zones]
//        [--origin https://fireandhail.com] [--out build/zone-shipment-v1]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const PREFIX = arg("prefix", "site/zones").replace(/^\/+|\/+$/g, "");
const OUT = arg("out", join(K3, "build", "zone-shipment-v1"));
const ORIGINS = [arg("origin", null), ...(() => {
  // the site's own names, read from the CNAME beside the door and the
  // repository the store record derives, never typed
  const names = [];
  const cname = join(K3, "..", "CNAME");
  if (existsSync(cname)) { const h = readFileSync(cname, "utf8").trim(); if (h) { names.push(`https://${h}`); if (!h.startsWith("www.")) names.push(`https://www.${h}`); } }
  return names;
})()].filter(Boolean);

const RECORD = join(K3, "data", "zone-store-v1.json");
if (!existsSync(RECORD)) { console.error("NO_STORE_RECORD: run tools/emit-zone-store-v1.mjs first"); process.exit(1); }
const store = JSON.parse(readFileSync(RECORD, "utf8"));
const repo = String(store.repository || "").replace(/^https:\/\/github\.com\//, "");
if (repo) { const [owner, name] = repo.split("/"); if (owner && name && name.toLowerCase() === `${owner.toLowerCase()}.github.io`) ORIGINS.push(`https://${name.toLowerCase()}`); }

const rows = Object.entries(store.pins || {}).sort(([a], [b]) => a.localeCompare(b)).map(([file, pin]) => {
  const name = file.replace(/\.bin$/, "");
  return {
    object: `${PREFIX}/${name}.${pin.sha256.slice(0, 12)}.bin`,
    source: `reader/data/zones/${file}`,
    bytes: pin.bytes,
    sha256: pin.sha256,
    headers: { "content-type": "application/octet-stream", "content-encoding": null, "cache-control": "public, max-age=31536000, immutable" },
  };
});
const missing = rows.filter((r) => !existsSync(join(K3, "..", r.source)));
if (missing.length) { console.error(`PINNED_BUT_ABSENT: ${missing.length} — ${missing.slice(0, 3).map((r) => r.source).join(", ")}`); process.exit(1); }

mkdirSync(OUT, { recursive: true });
const total = rows.reduce((n, r) => n + r.bytes, 0);
writeFileSync(join(OUT, "manifest.json"), JSON.stringify({
  schema_version: "ZONE_SHIPMENT_V1",
  rule: store.rule,
  emitted_by: "tools/emit-zone-shipment-v1.mjs",
  from_store_record: "reader/data/zone-store-v1.json",
  prefix: PREFIX,
  naming: "<prefix>/<name>.<sha256 first twelve hex>.bin — the reader derives the same name from the same pin",
  headers_every_object_must_carry: { "content-type": "application/octet-stream", "content-encoding": "NONE — the page hashes the raw bytes and decompresses them itself", "cache-control": "public, max-age=31536000, immutable" },
  counts: { objects: rows.length, bytes: total },
  objects: rows,
}, null, 1) + "\n");
writeFileSync(join(OUT, "SHA256SUMS"), rows.map((r) => `${r.sha256}  ${r.object}`).join("\n") + "\n");
writeFileSync(join(OUT, "cors.json"), JSON.stringify({
  CORSRules: [{
    AllowedOrigins: ORIGINS,
    AllowedMethods: ["GET", "HEAD"],
    AllowedHeaders: ["*"],
    ExposeHeaders: ["Content-Length", "ETag"],
    MaxAgeSeconds: 86400,
  }],
}, null, 1) + "\n");
writeFileSync(join(OUT, "HANDOFF.md"), `# Moving the shelf · zone shipment

${rows.length} objects, ${(total / 1e6).toFixed(1)} MB, named in manifest.json and sealed in SHA256SUMS.

1. Ferryman: put every object at its named key under the bucket, with the
   three headers the manifest states per object and no content-encoding.
   Verify on arrival against SHA256SUMS. Objects are immutable: a name
   carries its seal, so nothing is ever overwritten, only added.
2. Bucket side: public read on the prefix \`${PREFIX}/\` (a public bucket
   domain or a custom domain), and the CORS rule in cors.json so the page's
   origin may read across the border. Origins named: ${ORIGINS.join(", ") || "(none derived — pass --origin)"}.
3. This lane, once handed the public base URL for the prefix:
   \`tools/move-shelf-v1.sh <base>\` — sets the ruled value, proves every
   pin reachable and exact at the new host through
   check-zone-store-reachable-v1, proves the tamper refusal still works,
   and only then takes the bins off the served branch. Fail-closed at every
   step: if a single object is unreachable or wrong, nothing moves.
4. Commit, deploy, and check-zone-store-reachable-v1 runs in every suite
   from then on.

What a fresh checkout does without the bins: \`tools/pull-zones-from-store-v1.mjs\`
fetches every pinned bin from the base and verifies it before writing it.
`);
console.log(`${OUT}: ${rows.length} objects · ${(total / 1e6).toFixed(1)} MB · prefix ${PREFIX}/ · origins ${ORIGINS.join(", ") || "(none)"}`);
