#!/usr/bin/env node
// GUARDS: zone-store-rule-v1-the-door-keeps-the-seals-the-shelf-keeps-the-weight
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// The border crossing, checked from this side of it.
//
// check-zone-store-v1 proves the seal on bins that stand beside the door and
// proves the reader refuses a forged one. It says nothing about a shelf that
// stands somewhere else, and with the shelf moved that is the only shelf
// there is. So this asks, of every pin in the record, the question the page
// will ask on every visit — and asks it over the same wire the page uses: a
// plain fetch of the public address, no token, with the page's own origin in
// the request.
//
//   L1  the record names an https base, or this check has nothing to do
//   L2  every pinned bin answers at its sealed address on that base
//   L3  every body is exactly its pin: byte count and sha256
//   L4  no object arrives content-encoded — the page hashes raw bytes and
//       decompresses them itself, so an encoded body is a refusal on every
//       zone at once
//   L5  the host grants the page's origin: access-control-allow-origin
//       names it or names *, or the browser will refuse what the fetch here
//       would accept
//
// Every pin, never a sample. The shelf's whole weight crosses this border;
// a check that looked at a tenth of it would certify a tenth of the site.
//
// Run: node tools/check-zone-store-reachable-v1.mjs [--origin https://fireandhail.com]
//                                                    [--jobs 8]
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const JOBS = Math.max(1, Number(arg("jobs", "8")));
const ORIGIN = arg("origin", (() => {
  const c = join(K3, "..", "CNAME");
  return existsSync(c) && readFileSync(c, "utf8").trim() ? `https://${readFileSync(c, "utf8").trim()}` : "https://localhost";
})());

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

const RECORD = join(K3, "data", "zone-store-v1.json");
if (!existsSync(RECORD)) { console.log("SKIPPED — no store record at data/zone-store-v1.json"); process.exit(3); }
const store = JSON.parse(readFileSync(RECORD, "utf8"));
// --base rehearses the crossing against a stand-in host — the crossing check
// runs this against a local server holding the sealed objects — and is the
// one place an http host is admitted, because a stand-in is not the shelf.
const OVERRIDE = arg("base", null);
if (!OVERRIDE && (store.base === null || store.base === undefined)) {
  console.log("SKIPPED — the shelf stands beside the door (base is null); there is no border to check");
  process.exit(3);
}
const base = String(OVERRIDE || store.base).replace(/\/$/, "");
check("L1  the record names an https base", OVERRIDE ? /^https?:\/\//.test(base) : /^https:\/\//.test(base), OVERRIDE ? `${base} (rehearsal)` : base);
const pins = Object.entries(store.pins || {});

const unreachable = [], wrong = [], encoded = [], uncorsed = [];
let done = 0, bytes = 0;
const one = async ([file, pin]) => {
  const name = file.replace(/\.bin$/, "");
  const url = `${base}/${name}.${String(pin.sha256).slice(0, 12)}.bin`;
  let res;
  try { res = await fetch(url, { headers: { Origin: ORIGIN }, redirect: "manual" }); }
  catch (e) { unreachable.push(`${file} — ${String(e.message || e).slice(0, 60)}`); return; }
  if (res.status !== 200) { unreachable.push(`${file} — HTTP ${res.status}`); return; }
  const ce = res.headers.get("content-encoding");
  if (ce) encoded.push(`${file} — content-encoding: ${ce}`);
  const acao = res.headers.get("access-control-allow-origin");
  if (!(acao === "*" || acao === ORIGIN)) uncorsed.push(`${file} — access-control-allow-origin: ${acao || "(absent)"}`);
  const buf = Buffer.from(await res.arrayBuffer());
  bytes += buf.length;
  const sha = createHash("sha256").update(buf).digest("hex");
  if (buf.length !== pin.bytes || sha !== pin.sha256) wrong.push(`${file} — ${buf.length} bytes, sha ${sha.slice(0, 12)}… (pin ${pin.bytes} bytes, ${String(pin.sha256).slice(0, 12)}…)`);
  done += 1;
};
const queue = [...pins];
await Promise.all(Array.from({ length: JOBS }, async () => { for (;;) { const next = queue.shift(); if (!next) return; await one(next); } }));

console.log(`\n— ${pins.length} pins · ${done} fetched · ${(bytes / 1e6).toFixed(1)} MB crossed from ${base} —`);
check("L2  every pinned bin answers at its sealed address", unreachable.length === 0,
  unreachable.length ? `${unreachable.length} not answering — ${unreachable.slice(0, 3).join(" · ")}` : "all answer");
check("L3  every body is exactly its pin, byte count and sha256", wrong.length === 0,
  wrong.length ? `${wrong.length} wrong — ${wrong.slice(0, 3).join(" · ")}` : `${done} exact`);
check("L4  no object arrives content-encoded", encoded.length === 0,
  encoded.length ? `${encoded.length} encoded — ${encoded.slice(0, 2).join(" · ")}` : "raw bytes throughout, as the page expects");
check(`L5  the host grants the page's origin (${ORIGIN})`, uncorsed.length === 0,
  uncorsed.length ? `${uncorsed.length} without — ${uncorsed.slice(0, 2).join(" · ")}` : "access-control-allow-origin on every object");

console.log("\n  what this does not say: that the page refuses a forged bin from this host.");
console.log("  check-zone-store-v1 proves the refusal with a tamper of its own; the seal is");
console.log("  the same seal on both sides of the border.");
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
