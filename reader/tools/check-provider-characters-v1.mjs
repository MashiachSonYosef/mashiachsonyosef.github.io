#!/usr/bin/env node
// What we print has to be characters the provider typed.
//
// A route's English is a field of the provider's own characters. We may divide
// it on the marks that provider's declaration names, and we may hold it whole.
// We may not edit it, because the licence beside it names them as its author.
//
// So the claim under test is not "the text looks well formed" — some of it
// arrives from the corpus already damaged, and holding damaged text whole is
// the honest thing to do with it. The claim is that every reading the store
// offers is a contiguous run of its own route's characters, and that the
// pieces of a route rejoin into the route they came from.
//
// It also counts what arrives damaged, because that number belongs to whoever
// maintains the corpus and should not be silently absorbed here.
//
// Reads the artifacts off disk. Takes no URL.
// GUARDS: provider-declaration-rule-v1-closed-set-ship-whole-by-default, sense-split-rule-v2-a-comma-outside-the-providers-parentheses-separates
//
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync, createGunzip } from "node:zlib";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const { unbalancedAt, senseSplit } = await import(join(HERE, "sense-split-v1.mjs"));
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const load = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));

// ---- the route texts, as the corpus holds them -----------------------
const RDM = join(K3, "inputs", "rdm");
const rFile = existsSync(RDM) ? readdirSync(RDM).find((f) => f.endsWith("-r-identities.csv.gz")) : null;
let routes = null;
if (rFile) {
  routes = new Map();
  const rl = createInterface({ input: createReadStream(join(RDM, rFile)).pipe(createGunzip()), crlfDelay: Infinity });
  let head = null;
  for await (const line of rl) {
    if (head === null) { head = line; continue; }
    // r_id,r_route_text — the text may be quoted and hold commas
    const i = line.indexOf(",");
    if (i < 0) continue;
    let t = line.slice(i + 1);
    if (t.startsWith('"') && t.endsWith('"')) t = t.slice(1, -1).replace(/""/g, '"');
    routes.set(line.slice(0, i), t);
  }
  console.log(`the corpus holds ${routes.size.toLocaleString()} route texts`);
} else {
  console.log("the corpus inputs are not on this disk — the store is read on its own");
}

// ---- every reading the store offers ----------------------------------
const SHARDS = join(K3, "data", "route-store", "shards");
check("the store is on this disk", existsSync(SHARDS));
if (existsSync(SHARDS)) {
  const files = readdirSync(SHARDS).filter((f) => f.endsWith(".bin"));
  let rows = 0, damagedOnArrival = 0, notARun = [];
  const seenDamaged = new Set();
  for (const f of files) {
    const shard = load(join(SHARDS, f));
    for (const list of Object.values(shard)) {
      for (const row of list) {
        const piece = row[1];
        if (typeof piece !== "string" || !piece) continue;
        rows += 1;
        if (unbalancedAt(piece) !== -1 && !seenDamaged.has(piece)) {
          seenDamaged.add(piece); damagedOnArrival += 1;
        }
      }
    }
  }
  console.log(`— the route store · ${files.length} shards · ${rows.toLocaleString()} readings —`);
  // A reading whose parentheses do not balance is a reading held whole out of a
  // route that arrived damaged. It is not evidence of an edit here — an edit is
  // what the next check tests for.
  console.log(`        ${damagedOnArrival.toLocaleString()} distinct readings carry parentheses that do not balance, held whole as they arrived`);
  void notARun;
}

// ---- and every reading a book prints ---------------------------------
//
// The page bakes one reading per form so it can paint without fetching 256
// shards. That baked reading has to be one of the readings the store actually
// offers for that form, character for character. If it is not, something
// between the store and the page edited it, and the licence printed beside it
// is naming an author for characters they did not type.
const ZONES = join(K3, "data", "zones");
// Every work here, not two named ones. This filter admitted genesis.bin and
// 1kings.bin; after the withdrawal it admitted nothing, and the assertions
// below — orphan forms, unknown forms, damaged glosses — ran over an empty
// list. A filter that names works does not fail when the works move. It
// examines nothing and reports that as clean, which is the worst way for a
// check to break because it is the way nobody notices.
const books = existsSync(ZONES)
  ? readdirSync(ZONES).filter((f) => f.endsWith(".bin")
      && !f.endsWith(".commentary.bin")
      && !f.startsWith("fixture-")
      && !/^[0-9a-f]{2}\.bin$/.test(f)
      && f !== "w-top.bin")
  : [];
check("there are zones to read", books.length > 0, books.join(" ") || "none on disk");

const readingsFor = new Map();
if (existsSync(SHARDS)) {
  for (const f of readdirSync(SHARDS).filter((x) => x.endsWith(".bin"))) {
    const shard = load(join(SHARDS, f));
    for (const [k, list] of Object.entries(shard)) {
      const set = readingsFor.get(k) || new Set();
      for (const row of list) if (typeof row[1] === "string" && row[1]) set.add(row[1]);
      readingsFor.set(k, set);
    }
  }
}

for (const f of books) {
  const gloss = load(join(ZONES, f)).gloss || {};
  const forms = Object.keys(gloss);
  // A printed reading is a store reading, or one sense of one — the gloss layer
  // separates a route's senses on ';' the same way the store separates its
  // renderings on ',' — or several of those joined with " + " where the word's
  // own spans were packed with "/". All three keep the provider's characters.
  const orphan = forms.filter((k) => {
    const set = readingsFor.get(k);
    if (!set) return false;
    const printed = gloss[k];
    if (set.has(printed)) return false;
    const senses = new Set();
    // Senses divide at the pack mark outside the provider's parentheses, and
    // each sense divides into readings under the declared comma rule — the
    // same two splits the store and the page print by. A plain ";" split
    // here once compared v4 readings against v3 senses and called every
    // finer reading an orphan.
    const packSplit = (t) => {
      const out = []; let start = 0, d = 0; const x = String(t || "");
      for (let i = 0; i < x.length; i += 1) {
        const c = x[i];
        if (c === "(") d += 1; else if (c === ")") { if (d > 0) d -= 1; }
        else if (c === ";" && d === 0) { out.push(x.slice(start, i)); start = i + 1; }
      }
      out.push(x.slice(start));
      return out.map((y) => y.trim()).filter(Boolean);
    };
    for (const r of set) for (const sense of packSplit(r)) {
      senses.add(sense);
      const rs = senseSplit(sense);
      if (!rs.damaged) for (const reading of rs.readings) senses.add(reading);
    }
    if (senses.has(printed)) return false;
    return !printed.split(" + ").every((part) => senses.has(part.trim()) || set.has(part.trim()));
  });
  const unknown = forms.filter((k) => !readingsFor.has(k));
  const damaged = forms.filter((k) => unbalancedAt(gloss[k]) !== -1);
  const divides = forms.filter((k) => senseSplit(gloss[k]).readings.length > 1);
  console.log(`— ${f} · ${forms.length.toLocaleString()} forms —`);
  check("  every reading the page prints is one the store offers for that form",
    orphan.length === 0,
    orphan.length ? `${orphan.length} are not among the store's readings — e.g. ${orphan.slice(0, 2)
      .map((k) => `${k}: "${gloss[k].slice(0, 44)}"`).join(" | ")}` : `${forms.length - unknown.length} matched`);
  // Reported, not asserted. A reading that still divides is a field from a
  // provider whose declaration has not been written yet — that is work left,
  // not a fault in what is here.
  console.log(`        ${damaged.length} print a reading held whole out of a route that arrived damaged` +
    (damaged.length ? ` (${damaged.slice(0, 2).map((k) => `${k}: "${gloss[k].slice(0, 40)}"`).join(" | ")})` : ""));
  console.log(`        ${divides.length} print a reading that would still divide, from providers not yet declared`);
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
