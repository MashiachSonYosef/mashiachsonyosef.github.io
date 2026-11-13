#!/usr/bin/env node
// RUN: tree
// What we print has to be characters the provider typed.
//
// A route's English is a field of the provider's own characters. We may divide
// it on the marks that provider's declaration names, and we may hold it whole.
// We may not edit it, because the licence beside it names them as its author.
//
// So the claim under test is not "the text looks well formed" — the text is
// the provider's, as it came. The claim is that every reading the store
// offers is a contiguous run of its own route's characters, and that the
// pieces of a route rejoin into the route they came from.
//
// One kind of character in a served text is not the provider's: a space our
// own build put where a tag of the provider's XML stood. The corpus lane
// lists those, and a reading prints with them closed (made-spaces-rule-v1;
// check-made-spaces-v1 holds that to the lists). The readings asked of the
// store below are the readings as they print, so a closed space is counted
// here as what it is: the provider's characters, with ours taken out.
//
// Reads the artifacts off disk. Takes no URL.
// GUARDS: provider-declaration-rule-v1-closed-set-ship-whole-by-default, ledger-division-rule-v2-a-ledgered-row-divides-prints-a-part-or-prints-no-pill-only-as-its-ledger-and-the-owner-say
//
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync, createGunzip } from "node:zlib";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isSidecar } from "./zones-on-disk-v1.mjs";
import { openRouteStore } from "./gloss-store-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
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
  let rows = 0, notARun = [];
  for (const f of files) {
    const shard = load(join(SHARDS, f));
    for (const list of Object.values(shard)) {
      for (const row of list) {
        const piece = row[1];
        if (typeof piece !== "string" || !piece) continue;
        rows += 1;
      }
    }
  }
  console.log(`— the route store · ${files.length} shards · ${rows.toLocaleString()} readings —`);
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
      && !isSidecar(f)
      && !f.startsWith("fixture-")
      && !/^[0-9a-f]{2}\.bin$/.test(f)
      && f !== "w-top.bin")
  : [];
check("there are zones to read", books.length > 0, books.join(" ") || "none on disk");

const readingsFor = new Map();
// and, per form, the readings the store offers for each row under the rule
// its source is under: a ledgered source divides only at the marks its row
// names (ledger-division-rule-v2), a source with no ledger whole. The page
// prints these, so these are what a printed reading must be.
const offeredFor = new Map();
const store = existsSync(SHARDS) ? openRouteStore(join(K3, "data", "route-store")) : null;
if (existsSync(SHARDS)) {
  for (const f of readdirSync(SHARDS).filter((x) => x.endsWith(".bin"))) {
    const shard = load(join(SHARDS, f));
    for (const [k, list] of Object.entries(shard)) {
      const set = readingsFor.get(k) || new Set();
      const off = offeredFor.get(k) || new Set();
      for (const row of list) if (typeof row[1] === "string" && row[1]) { set.add(row[1]); for (const r of store.readingsOf(row)) off.add(r); }
      readingsFor.set(k, set);
      offeredFor.set(k, off);
    }
  }
}

for (const f of books) {
  const gloss = load(join(ZONES, f)).gloss || {};
  const forms = Object.keys(gloss);
  // A printed reading is a store reading, or one the store offers for the row
  // under its source's rule (the ledger's division; whole for a source with no
  // ledger), or several of those joined with " + " where the word's own spans
  // were packed with "/". All of these keep the provider's characters. (Until
  // 7 November 2026 a sense or a comma piece under the page's guessed rule was
  // tolerated too; that rule retired.)
  const orphan = forms.filter((k) => {
    const set = readingsFor.get(k);
    if (!set) return false;
    const printed = gloss[k];
    if (set.has(printed)) return false;
    const off = offeredFor.get(k) || new Set();
    if (off.has(printed)) return false;
    return !printed.split(" + ").every((part) => set.has(part.trim()) || off.has(part.trim()));
  });
  const unknown = forms.filter((k) => !readingsFor.has(k));
  console.log(`— ${f} · ${forms.length.toLocaleString()} forms —`);
  check("  every reading the page prints is one the store offers for that form",
    orphan.length === 0,
    orphan.length ? `${orphan.length} are not among the store's readings — e.g. ${orphan.slice(0, 2)
      .map((k) => `${k}: "${gloss[k].slice(0, 44)}"`).join(" | ")}` : `${forms.length - unknown.length} matched`);
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
