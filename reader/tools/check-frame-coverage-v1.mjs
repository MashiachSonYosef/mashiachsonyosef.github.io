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
// Neither the frame nor its definitions are typed here. Both are read out of
// data/frame-record-v1.js, which quotes the sealed HUD manifests verbatim and
// names them. If the record changes, this starts asking a different question
// without anybody editing this file — which is the difference between a
// pipeline and a list somebody maintains.
//
// What this does NOT do is enforce the frame. The definitions record says why
// in its own words: the letters are what not to forget, not a spec, and what a
// work needs is recorded nowhere this lane can read. Inventing a requirement
// here would be the same fault this check exists to catch.
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

// ---- the frame and its letters, read from one record ----------------------
//
// This used to scan data/ for any file carrying a "frame" field and take the
// one with the highest manifest_version — so the frame this check ran against
// was whichever proof fixture happened to be lying in the directory. The three
// fixtures that carried it were withdrawn on 2026-08-24 for being publishable
// presentation proofs over a single verse, and the frame went with them: this
// check fell silent, and a silent check reads exactly like a passing one.
//
// The frame is a record now. data/frame-record-v1.js quotes the sealed string
// verbatim, names the manifests it was quoted from and hashes one of them, and
// says in the same file what each letter is.
let DEF = null, defFrom = null;
for (const f of readdirSync(DATA).filter((x) => /^frame-record-v\d+\.js$/u.test(x)).sort()) {
  try {
    DEF = JSON.parse(readFileSync(join(DATA, f), "utf8")
      .replace(/^[\s\S]*?window\.[A-Za-z_0-9]+\s*=\s*Object\.freeze\(/u, "").replace(/\)\s*;?\s*$/u, ""));
    defFrom = f;
  } catch { DEF = null; }
}
if (!DEF || !DEF.sealed_frame) {
  console.log("SKIPPED — data/ carries no frame record, so there is no frame to check coverage against");
  process.exit(3);
}
const frameFrom = defFrom;
const frameVersion = ((DEF.sealed_frame_basis || {}).manifest_version) || 0;
const frame = String(DEF.sealed_frame).split("/");
// Y is the organizational spine and sits above the word frame, so it is
// prepended rather than edited into the recorded string.
if (!frame.includes("Y")) frame.unshift("Y");

console.log(`— the frame, as ${frameFrom} quotes it from manifest version ${frameVersion} —`);
console.log(`  ${frame.join(" · ")}`);
console.log(`  ${frame.length} layers, Y prepended as the spine above the word frame`);
if (DEF) {
  console.log(`\n— what each letter is, as ${defFrom} records it on ${DEF.recorded_on} —`);
  for (const l of frame) console.log(`  ${l.padEnd(9)} ${(DEF.definitions || {})[l] || "— not in that statement —"}`);
  const dropped = Object.entries(DEF.in_the_sealed_frame_and_not_in_this_statement || {})
    .filter(([l]) => frame.includes(l));
  if (dropped.length) {
    console.log(`\n  in the sealed string and not in that statement — reported, not acted on:`);
    for (const [l, why] of dropped) console.log(`     ${l.padEnd(9)} ${why}`);
  }
} else {
  console.log(`\n  no dated statement of what the letters mean is here — the table below is`);
  console.log(`  this lane's reading of them and should be checked against one.`);
}

// ---- what this lane can observe ------------------------------------------
const store = existsSync(join(ROOT, "data", "route-store", "index.json"))
  ? openRouteStore(join(ROOT, "data", "route-store")) : null;

const PROBE = {
  // nodes with no ledger receipt are locators somebody numbered, not the spine
  Y: ({ z }) => {
    const rec = (z.emitted_from || {}).y_ledger || null;
    return rec && rec.fixture ? (z.nodes || []).length : 0;
  },
  // A · "a section of hebrew with 1 license". A sealed unit is exactly that —
  // but only while the work names one licence over all of them, so that is
  // asked first and A is left unmeasured rather than assumed when it is not.
  A: ({ licences, z }) => (licences.size === 1 ? (z.sections || []).length : null),
  // N · "hebrew license" — the licence record itself, named by the work.
  N: ({ licences }) => licences.size,
  // B · "our grouping of As" — the work, carrying the corpus lane's own B id.
  B: ({ z }) => {
    const wr = z.work_receipts || {};
    const s = typeof wr === "string" ? wr : (wr.b_n || "");
    return /B-?\d+/.test(s) ? 1 : 0;
  },
  // V · "commentary" — every commentary entry standing against this work's own
  // sealed units. Joined by unit id, never by filename: a sidecar belongs to
  // whichever work its units are found in.
  V: ({ units, sidecars }) => {
    let n = 0;
    for (const s of sidecars)
      for (const [u, U] of Object.entries(s.units || {})) {
        if (!units.has(u)) continue;
        for (const list of Object.values(U.words || {})) n += list.length;
        n += (U.section || []).length;
      }
    return n;
  },
  W: ({ z }) => {
    let n = 0;
    for (const s of z.sections || []) for (const w of s.words || []) if (w.s) n += 1;
    return n;
  },
  K: ({ keys }) => keys.size,
  COMPspan: ({ z }) => Object.keys(z.spans || {}).length,
  // cells are derived from the component list: n(n+1)/2 per form, never stored
  COMPcell: ({ z }) => Object.values(z.spans || {})
    .reduce((t, sp) => t + (sp[0].length * (sp[0].length + 1)) / 2, 0),
  // P · "the grouper for M, when 2 M's report the exact same D" — one P per
  // definition text that two or more distinct M records report byte-identically.
  P: ({ routes }) => (routes ? routes.P : null),
  R: ({ routes }) => (routes ? routes.R : null),
  D: ({ routes }) => (routes ? routes.D : null),
  M: ({ routes }) => (routes ? routes.M.size : null),
  S: ({ routes }) => (routes ? routes.S : null),
  CIT: ({ routes }) => (routes ? routes.CIT : null),
};

// Layers this lane holds no artifact for. Reported as not visible from here —
// never as missing, because an unobserved layer and an absent one are
// different facts and this check will not blur them.
const NOT_VISIBLE = {
  Z: "not a layer this lane emits and none it can name — see the definitions record",
  L: "lemma identity — corpus lane; this lane sees only what a route prints, which is R and D",
};

// ---- every published work, against that frame ----------------------------
// Works only. A fixture is a test instrument that says so in its own
// receipt — "not a work · carries no licence identity and is never served"
// — so asking whether it carries a B identity is asking the wrong question
// of the wrong thing, and answering "no" reads as a gap in the frame.
const bins = existsSync(ZONES)
  ? readdirSync(ZONES).filter((f) => f.endsWith(".bin"))
      .filter((f) => !f.startsWith("fixture-"))
      .filter((f) => !/^[0-9a-f]{2}\.bin$/.test(f) && f !== "w-top.bin")
      .sort()
  : [];
// A file with sections is a work a reader opens. A file with units and no
// sections stands against one — it is asked for V and never asked for a frame
// of its own, because it has none: it is the commentary layer of the work its
// unit ids name.
const works = [], cars = [];
for (const f of bins) {
  const z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8"));
  if (Array.isArray(z.sections) && z.sections.length) works.push({ f, z });
  else if (z.units) cars.push(z);
}
check("  there are published works to measure", works.length > 0,
  `${works.length} of ${bins.length} files carry sections · ${cars.length} carry commentary against them`);

const table = [];
for (const { f, z } of works) {
  const keys = new Set();
  for (const s of z.sections || []) for (const w of s.words || []) {
    if (w.w) w.w.forEach((r) => r.k && keys.add(r.k)); else if (w.k) keys.add(w.k);
  }
  const units = new Set((z.sections || []).map((s) => s.unit));

  // the licences this work names, from its own receipts
  const licences = new Set();
  const lr = (z.emitted_from || {}).license_receipts || {};
  const cls = String(lr.per_occurrence || "").match(/rows:\s*([A-Z0-9_-]+)/);
  if (cls) licences.add(cls[1]);

  // one pass over every route this work's keys reach
  let routes = null;
  if (store) {
    routes = { R: 0, D: 0, M: new Set(), S: 0, CIT: 0, P: 0 };
    const byD = new Map();
    for (const k of keys) for (const row of store.routesFor(k) || []) {
      const [, text, def, mId, year] = row;
      if (String(text || "").trim()) routes.R += 1;
      if (String(def || "").trim()) {
        routes.D += 1;
        if (!byD.has(def)) byD.set(def, new Set());
        byD.get(def).add(mId);
      }
      if (mId !== undefined && mId !== null) routes.M.add(mId);
      if (year !== undefined && String(year) !== "S_NO_SOURCE_YEAR") routes.S += 1;
      const m = store.index.m_sources[mId];
      if (m && m.licensePointer) routes.CIT += 1;
    }
    for (const ms of byD.values()) if (ms.size > 1) routes.P += 1;
  }

  const ctx = { z, file: f, keys, units, licences, routes, sidecars: cars };
  const layers = {};
  for (const l of frame) layers[l] = PROBE[l] ? PROBE[l](ctx) : null;
  table.push({ file: f, work: z.work || f, layers, licences: [...licences] });
}

console.log("\n— every published work, layer by layer —");
const pad = Math.max(...table.map((t) => String(t.work).length), 8);
console.log(`  ${"work".padEnd(pad)}  ${frame.map((l) => l.padStart(9)).join("")}`);
for (const t of table)
  console.log(`  ${String(t.work).padEnd(pad)}  ` + frame.map((l) =>
    (t.layers[l] === null ? "—" : !t.layers[l] ? "OFF" : t.layers[l].toLocaleString()).padStart(9)).join(""));
console.log(`\n  A is the sealed unit count and is only reported where the work names one licence:`);
for (const t of table) console.log(`     ${String(t.work).padEnd(pad)}  ${t.licences.join(", ") || "names none"}`);
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
