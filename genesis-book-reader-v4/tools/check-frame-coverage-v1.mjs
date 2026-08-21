#!/usr/bin/env node
// GUARDS: frame-coverage-rule-v1-no-layer-is-on-one-work-and-off-another
//
// Which layers each published work carries — measured, per work, against the
// frame the corpus lane recorded.
//
// Why this exists.
//
// Genesis shipped for months with no COMPspan layer while I Kings had one, and
// nobody could see it, because nothing asked "does every work carry what the
// others carry?" The gap was found by a reader opening a word and noticing it
// offered nothing. The first fix reached for was to add the layer to Genesis —
// which is the same hand-built habit one level up: mend the book somebody
// noticed and leave the rest to be noticed later. There are nine hundred and
// ninety-nine works. No version of that works by hand.
//
// The frame is not typed here. It is read out of the sealed HUD manifests,
// which record it as a string. If the corpus lane adds a layer, this starts
// asking about it without anybody editing this file — which is the difference
// between a pipeline and a list somebody maintains.
//
// What this does NOT do is enforce the frame. It has no standing to say which
// layers a work needs: that is not recorded anywhere it can read, and some
// letters may not be needed at all. The frame is a list of what not to forget,
// not a specification, and inventing a requirement here would be the same
// fault this check exists to catch.
//
// So the table is an observation, and one thing only is asserted: no layer is
// present in one published work and absent from another. That needs no
// judgment about necessity, and it is the shape both real defects took —
// COMPspan on I Kings and not Genesis, Y on Genesis and not I Kings. An
// asymmetry is never intended. A layer no work carries at all is not a
// failure; it is reported and nothing more is said about it.
//
// Run: node tools/check-frame-coverage-v1.mjs

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore } from "./gloss-store-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const ZONES = join(ROOT, "data", "zones");
const DATA = join(ROOT, "data");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };

// ---- the frame, read from the record -------------------------------------
// Highest manifest version wins: a later fixture is a later statement of it.
let frame = null, frameFrom = null, frameVersion = -1;
if (existsSync(DATA)) {
  for (const f of readdirSync(DATA).filter((x) => x.endsWith(".js"))) {
    const s = readFileSync(join(DATA, f), "utf8");
    const m = s.match(/"frame":"([^"]+)"/);
    if (!m) continue;
    const v = s.match(/"manifest_version":(\d+)/);
    const ver = v ? Number(v[1]) : 0;
    if (ver > frameVersion) { frameVersion = ver; frame = m[1].split("/"); frameFrom = f; }
  }
}
if (!frame) { console.log("SKIPPED — no sealed manifest here records the frame"); process.exit(3); }
// Y is the organizational spine and sits above the word frame, so it is
// prepended rather than edited into the recorded string.
if (!frame.includes("Y")) frame.unshift("Y");
console.log(`— the frame, as ${frameFrom} records it at manifest version ${frameVersion} —`);
console.log(`  ${frame.join(" · ")}`);
console.log(`  ${frame.length} layers, Y prepended as the spine above the word frame`);

// ---- what this lane can observe ------------------------------------------
const store = existsSync(join(ROOT, "data", "route-store", "index.json"))
  ? openRouteStore(join(ROOT, "data", "route-store")) : null;
const routesFor = (keys) => {
  if (!store) return null;
  const seen = { R: 0, D: 0, M: new Set(), S: 0, CIT: 0 };
  for (const k of keys) for (const row of store.routesFor(k) || []) {
    const [, text, def, mId, year] = row;
    if (String(text || "").trim()) seen.R += 1;
    if (String(def || "").trim()) seen.D += 1;
    if (mId !== undefined && mId !== null) seen.M.add(mId);
    if (year !== undefined && String(year) !== "S_NO_SOURCE_YEAR") seen.S += 1;
    const m = store.index.m_sources[mId];
    if (m && m.licensePointer) seen.CIT += 1;
  }
  return seen;
};

const PROBE = {
  // nodes with no ledger receipt are locators somebody numbered, not the spine
  Y: (z) => {
    const rec = (z.emitted_from || {}).y_ledger || null;
    return rec && rec.fixture ? (z.nodes || []).length : 0;
  },
  W: (z) => {
    let n = 0;
    for (const s of z.sections || []) for (const w of s.words || []) if (w.s) n += 1;
    return n;
  },
  K: (z) => {
    const k = new Set();
    for (const s of z.sections || []) for (const w of s.words || []) {
      if (w.w) w.w.forEach((r) => r.k && k.add(r.k)); else if (w.k) k.add(w.k);
    }
    return k.size;
  },
  COMPspan: (z) => Object.keys(z.spans || {}).length,
  // cells are derived from the component list: n(n+1)/2 per form, never stored
  COMPcell: (z) => Object.values(z.spans || {})
    .reduce((t, sp) => t + (sp[0].length * (sp[0].length + 1)) / 2, 0),
  B: (z) => {
    const wr = z.work_receipts || {};
    return (typeof wr === "string" ? wr : (wr.b_n || "")) ? 1 : 0;
  },
};

// Layers this lane holds no artifact for. Reported as not visible from here —
// never as missing, because an unobserved layer and an absent one are
// different facts and this check will not blur them.
const NOT_VISIBLE = {
  A: "occurrence-level acquisition identity — corpus lane",
  N: "the N half of the book identity — travels inside B in these artifacts",
  V: "commentary membership and attachment — rides on the sidecars, not the book",
  Z: "not known to this lane; the only Z it holds is z_words, a span in a zone's own words beside v_words in the verse's — see the note to Kyle",
  L: "lemma identity — corpus lane; this lane sees only what a route prints",
  P: "provenance chain position — corpus lane",
};

// ---- every published work, against that frame ----------------------------
const bins = existsSync(ZONES) ? readdirSync(ZONES).filter((f) => f.endsWith(".bin")).sort() : [];
const books = [];
for (const f of bins) {
  const z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8"));
  if (Array.isArray(z.sections) && z.sections.length) books.push({ f, z });
}
check("  there are published works to measure", books.length > 0,
  `${books.length} of ${bins.length} files carry sections`);

const table = [];
for (const { f, z } of books) {
  const keys = new Set();
  for (const s of z.sections || []) for (const w of s.words || []) {
    if (w.w) w.w.forEach((r) => r.k && keys.add(r.k)); else if (w.k) keys.add(w.k);
  }
  const r = routesFor(keys);
  const layers = {};
  for (const l of frame) {
    if (PROBE[l]) layers[l] = PROBE[l](z);
    else if (r && ["R", "D", "S", "CIT"].includes(l)) layers[l] = r[l];
    else if (r && l === "M") layers[l] = r.M.size;
    else layers[l] = null;
  }
  table.push({ file: f, work: z.work || f, layers });
}

console.log("\n— every published work, layer by layer —");
const pad = Math.max(...table.map((t) => String(t.work).length), 8);
console.log(`  ${"work".padEnd(pad)}  ${frame.map((l) => l.padStart(9)).join("")}`);
for (const t of table)
  console.log(`  ${String(t.work).padEnd(pad)}  ` + frame.map((l) =>
    (t.layers[l] === null ? "—" : !t.layers[l] ? "OFF" : t.layers[l].toLocaleString()).padStart(9)).join(""));
console.log("\n  — is this lane holding no artifact that would show the layer:");
for (const [l, why] of Object.entries(NOT_VISIBLE)) if (frame.includes(l)) console.log(`     ${l.padEnd(9)} ${why}`);

// ---- the one assertion ----------------------------------------------------
console.log("\n— no layer is on one work and off another —");
const visible = frame.filter((l) => table.some((t) => t.layers[l] !== null));
const carried = visible.filter((l) => table.some((t) => t.layers[l] > 0));
const nowhere = visible.filter((l) => table.every((t) => !t.layers[l]));
for (const l of carried) {
  const off = table.filter((t) => !t.layers[l]).map((t) => t.work);
  check(`  ${l}`, off.length === 0,
    off.length ? `on ${table.length - off.length}, off: ${off.join(", ")}` : `on all ${table.length}`);
}
if (nowhere.length)
  console.log(`\n  reported, not asserted: no published work carries ${nowhere.join(", ")} —\n` +
    `  either not needed or not yet reached, and this check does not guess which.`);

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
