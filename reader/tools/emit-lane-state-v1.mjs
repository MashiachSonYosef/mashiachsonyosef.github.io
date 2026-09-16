#!/usr/bin/env node
// Synthesis lane · lane-state-rule-v1-one-fetch-says-what-this-lane-is-serving
//
// ONE FETCH, SO NEITHER LANE HAS TO ASK.
//
// Two lanes work on this corpus. For most of a month they were invisible to
// each other in both directions: the corpus lane shipped fourteen builds this
// lane never opened, and this lane struck forty-nine sources the corpus lane
// never heard about until it noticed its own store disagreeing. Neither lane
// was hiding anything. There was simply nowhere to look, so looking meant
// asking, and asking meant waiting for somebody to be online.
//
// That is what this file is for. It is a single small JSON document, deployed
// with the site, that says what this lane is serving right now: which store,
// how many sources, which strike and what it cost, how many books stand on the
// shelf and what rides beside them. A peer lane fetches it and knows in one
// request whether it is looking at the same store this lane is.
//
// THREE RULES IT KEEPS, because a summary is the easiest place in a system to
// tell a lie without noticing:
//
//   1. NOTHING IS TYPED. Every number is read out of the artifact that owns
//      it — the store index, the admission record, the zones on disk, the
//      lattice sidecars. A figure somebody typed here would go stale the first
//      time the thing it describes moved, and nothing would say so.
//   2. EVERY COUNT NAMES ITS SET. The same law the owner ruled for the counts
//      panel on the card, and the same one the admission block just had to be
//      repaired for: 27 sources standing beside 49 ids with nothing saying
//      which round was which. A count here carries the set it was taken over.
//   3. IT SAYS WHAT IT IS NOT. A state file reads as complete, so the things
//      it does not cover are named in it rather than left to be discovered by
//      somebody who trusted it.
//
// It carries no path from anybody's machine and no personal name: every field
// is picked by name out of the records, never spread wholesale, because a
// spread copies whatever a record happens to hold today.
//
// Run: node tools/emit-lane-state-v1.mjs [--out data/lane-state-v1.json]

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { zonesOnDisk, zonesServed, SIDECAR_SUFFIXES, baseOfSidecar } from "./zones-on-disk-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const OUT = arg("out", join(K3, "data", "lane-state-v1.json"));
const STORE = join(K3, "data", "route-store");
const ZONES = join(K3, "data", "zones");

export const LANE_STATE_RULE_ID = "lane-state-rule-v1-one-fetch-says-what-this-lane-is-serving";

// THE WORK IS A FUNCTION, AND THE WRITE IS BEHIND A MAIN GUARD.
//
// check-lane-state-v1 imports LANE_STATE_RULE_ID from this file so the rule id
// has one home. Without the guard that import RUNS this tool — the check
// regenerates the very file it is about to verify, and then verifies it
// against itself, which is a check that can never fail and therefore is not
// one. It passed eleven clauses that way before the guard went in.
const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);
const readBin = (p) => (existsSync(p) ? JSON.parse(gunzipSync(readFileSync(p)).toString("utf8")) : null);

export const laneState = () => {
  const index = readJson(join(STORE, "index.json"));
  const manifest = readJson(join(STORE, "store-manifest-v1.json"));
  const admission = readJson(join(K3, "data", "language-admission-v1.json"));

  // ---- the shelf -----------------------------------------------------------
  //
  // zonesServed, not zonesOnDisk. A check that asks "what does the door offer"
  // wants what is served; the two differ and the difference is a fact worth
  // carrying, so both are here with their names on them.
  const onDisk = zonesOnDisk();
  const served = zonesServed();
  const sidecars = {};
  for (const suffix of SIDECAR_SUFFIXES) {
    const files = existsSync(ZONES) ? readdirSync(ZONES).filter((f) => f.endsWith(suffix)) : [];
    const books = files.map((f) => baseOfSidecar(f));
    sidecars[suffix.replace(/^\.|\.bin$/gu, "")] = {
      books: books.length,
      on_served_books: books.filter((b) => served.includes(b)).length,
    };
  }

  // ---- the lattice ---------------------------------------------------------
  //
  // Taken from the sidecars themselves rather than from a version somebody wrote
  // down, and reported as the SET of schemas present. A single version number
  // would be a claim that the shelf is uniform, which is exactly the thing a
  // peer lane is fetching this to check.
  const latticeSchemas = new Map();
  let latticeOn = 0, latticeBooks = 0;
  for (const b of served) {
    const l = readBin(join(ZONES, `${b}.lattice.bin`));
    if (!l) continue;
    latticeBooks += 1;
    latticeOn += ((l.counts || {}).lattice_on || 0);
    const s = (l.source || {}).schema || null;
    const gen = (l.source || {}).generated || null;
    const key = `${s} · ${gen}`;
    latticeSchemas.set(key, (latticeSchemas.get(key) || 0) + 1);
  }

  // ---- V's counts layer ----------------------------------------------------
  let volumeBooks = 0, volumeScope = null;
  for (const b of served) {
    const v = readBin(join(ZONES, `${b}.volume.bin`));
    if (!v) continue;
    volumeBooks += 1;
    volumeScope = volumeScope || (v.scope || {}).say || null;
  }

  const la = (index && index.language_admission) || {};
  const cum = la.cumulative || {};

  const state = {
    schema_version: "LANE_STATE_V1",
    rule_id: LANE_STATE_RULE_ID,
    lane: "synthesis — the reader, the door, and the store they read",
    what_this_is:
      "one fetch that says what this lane is serving right now, so a peer lane can tell whether it is "
      + "looking at the same store without asking anybody. Every number is read from the artifact that "
      + "owns it at the moment this file is written.",
    built_at: new Date().toISOString(),

    store: {
      scope: "the route store this site serves from",
      version: (index && index.store_version) || null,
      sources: index ? Object.keys(index.m_sources || {}).length : null,
      keys: (index && (index.counts || {}).keys) || null,
      routes: (index && (index.counts || {}).routes) || null,
      shards: (index && (index.counts || {}).shards) || null,
      files_pinned: manifest ? Object.keys(manifest.files || {}).length : null,
      // The version a peer lane most wants is the one BEFORE the strike, because
      // that is the copy it probably still holds.
      version_history: (index && index.store_version_history || []).map((h) => ({ was: h.was, now: h.now, on: h.on || null })),
    },

    language_admission: {
      scope: "every round of the strike, deduplicated by m id",
      rule_id: la.rule_id || null,
      admitted_languages: la.admitted_languages || null,
      rounds: la.rounds || null,
      sources_struck: cum.sources_struck || null,
      routes_struck: Object.prototype.hasOwnProperty.call(cum, "routes_struck") ? cum.routes_struck : null,
      keys_touched: Object.prototype.hasOwnProperty.call(cum, "keys_touched") ? cum.keys_touched : null,
      measured_between: cum.routes_and_keys_from
        ? { before: cum.routes_and_keys_from.before_store_version, after: cum.routes_and_keys_from.after_store_version }
        : null,
      struck_m_ids: la.struck_m_ids || [],
      record: "reader/data/language-admission-v1.json",
      // Named, because it is the difference between "these are the sources this
      // lane rejected" and "these are the sources this lane could not serve".
      reasons: admission
        ? (() => {
          const c = {};
          for (const s of admission.struck_sources || []) c[s.reason] = (c[s.reason] || 0) + 1;
          return c;
        })()
        : null,
    },

    shelf: {
      scope: "the zone files beside the reader, and what rides with them",
      zones_on_disk: onDisk.length,
      zones_served: served.length,
      withheld: onDisk.length - served.length,
      sidecars,
    },

    lattice: {
      scope: "the corpus lane's lattice, as projected onto served books",
      books_carrying_one: latticeBooks,
      words_the_lattice_lands_on: latticeOn,
      // A list, not a number. If two schemas are present, that is the finding.
      schemas_present: [...latticeSchemas].map(([k, n]) => ({ schema_and_generated: k, books: n })),
    },

    counts_layer: {
      scope: "V's commentary counts, where they ride",
      books_carrying_one: volumeBooks,
      counted_over: volumeScope,
    },

    what_this_does_not_say: [
      "which routes were struck for which reason — the record names a reason per SOURCE, and the "
        + "struck-rank record names a rank per KEY, and nothing ties one to the other",
      "that the works not served are unservable — most are held on a named gate, and the gate is in "
        + "the build plan, not here",
      "anything about the corpus lane's own state; this file describes one lane and says so",
      "that these numbers were true a minute ago. It is written by a build, and built_at is when",
    ],
  };

  return state;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const state = laneState();
  writeFileSync(OUT, `${JSON.stringify(state, null, 1)}\n`);
  console.log(`${OUT.replace(`${K3}/`, "")}: store ${state.store.version} · ${state.store.sources} sources · `
    + `${state.shelf.zones_served} of ${state.shelf.zones_on_disk} works served · `
    + `${state.language_admission.sources_struck} struck `
    + `(${(state.language_admission.routes_struck || 0).toLocaleString()} routes) · `
    + `lattice on ${state.lattice.books_carrying_one} book(s)`);
}
