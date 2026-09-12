#!/usr/bin/env node
// GUARDS: hoh-sidecar-rule-v1-a-hebrew-definition-is-served-by-volume-and-quotes-only-from-the-floor, hoh-fixture-rule-v1-a-real-chapter-with-entries-made-only-of-its-own-verses
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// A Hebrew-on-Hebrew sidecar, <slug>.hoh.bin, rides beside a book zone and
// carries a dictionary's entries for that book's words, Hebrew defined in
// Hebrew. tools/build-hoh-sidecar-v1.mjs declares how one is written:
// served only from a declared volume, asterisk entries held, nothing past the
// floor in a served volume, strata served by type, gloss projected from the
// store with its M, and — until the posture record says a delivery landed —
// beside a fixture only.
//
// The builder refuses at build time. This reads what was written and asks the
// same questions of the file, because a refusal at build time proves nothing
// about a bin built earlier, built by hand, or edited since; and the one law
// the builder cannot enforce on its own output — where the file may stand —
// is enforced here.
//
//   L1  the builder still declares the rule this check enforces
//   L2  the sidecar names the posture record it was built under, by hash,
//       and that record is the one on disk
//   L3  every served entry stands in a declared volume; every held entry
//       names a known reason and carries no text
//   L4  no served entry is past the floor; no asterisk entry is served
//   L5  only quote and prose strata are emitted; every emitted word carries
//       its surface and its exact key, and the key is the K rule's
//   L6  every emitted word's reading carries its M
//   L7  the counts count what is on disk
//   L8  until the posture record says a delivery landed, a sidecar stands
//       only beside a fixture — and a fixture says so in its own file
//
// Run: node tools/check-hoh-sidecar-v1.mjs [--zones data/zones]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exactK } from "./k-normalization-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ZONES = arg("zones", join(K3, "data", "zones"));
const BUILDER = join(HERE, "build-hoh-sidecar-v1.mjs");
const POSTURE = join(K3, "data", "ben-yehuda-posture-v1.json");

const RULE = "hoh-sidecar-rule-v1-a-hebrew-definition-is-served-by-volume-and-quotes-only-from-the-floor";
const SCHEMA = "ZONE_HOH_V1";
const HELD = new Set(["VOLUME_NOT_DECLARED", "ASTERISK_PENDING_READ"]);
const SERVED_KINDS = new Set(["quote", "prose"]);

let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const note = (arr, s) => { arr.push(arr.length < 12 ? s : null); };
const few = (arr, n = 3) => arr.filter(Boolean).slice(0, n).join(" · ");

// L1
{
  const gone = [];
  if (!existsSync(BUILDER)) gone.push("the builder itself");
  else {
    const src = readFileSync(BUILDER, "utf8");
    if (!src.includes(RULE)) gone.push("the rule id");
    for (const [name, re] of [["the volume clause", /served only from a volume the posture record declares/u], ["the asterisk clause", /no coinage is served/u], ["the floor clause", /The floor is the floor/u], ["the standing clause", /beside a fixture/u]])
      if (!re.test(src)) gone.push(name);
  }
  check("L1  the builder still declares the rule this check enforces", gone.length === 0,
    gone.length ? `${gone.join(", ")} gone from ${BUILDER.split("/").pop()} — this gate has no authority until it is back` : "quoted from the rule declared before output");
}

if (!existsSync(ZONES)) { console.log(`\nSKIPPED — no zones at ${ZONES}`); process.exit(bad ? 1 : 3); }
const sidecars = readdirSync(ZONES).filter((f) => f.endsWith(".hoh.bin")).sort();
if (!sidecars.length) { console.log("\nSKIPPED — no Hebrew-on-Hebrew sidecar is on this shelf, so there is nothing to judge"); process.exit(bad ? 1 : 3); }
const posture = existsSync(POSTURE) ? JSON.parse(readFileSync(POSTURE, "utf8")) : null;
const postureSha = existsSync(POSTURE) ? createHash("sha256").update(readFileSync(POSTURE)).digest("hex") : null;
const served = new Set((posture && posture.served_volumes) || []);
const floor = (posture && posture.floor) || {};
const pastLetters = new Set(floor.letters_past_the_floor || []);
const floorKey = String(floor.ends_at_headword_key || "");
const pastTheFloor = (key) => pastLetters.has(key[0]) || (floorKey && key[0] === floorKey[0] && key > floorKey);
const delivered = !!(posture && posture.delivery && posture.delivery.delivered === true);

const unreadable = [], record = [], volumes = [], floorHits = [], strata = [], unlicensed = [], counts = [], standing = [];
let judged = 0, entriesRead = 0, wordsRead = 0;
for (const f of sidecars) {
  let s; try { s = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { unreadable.push(f); continue; }
  if (s.rule_id !== RULE || s.schema_version !== SCHEMA) { note(record, `${f}: ${s.rule_id || "no rule"} / ${s.schema_version || "no schema"}`); continue; }
  judged += 1;
  const slug = f.replace(/\.hoh\.bin$/u, "");
  // L2
  const src = s.source || {};
  if (!posture) note(record, `${f}: no posture record on disk to judge against`);
  else if (src.posture_sha256 !== postureSha) note(record, `${f}: built under posture ${String(src.posture_sha256 || "?").slice(0, 12)}…, the record on disk is ${postureSha.slice(0, 12)}…`);
  const c = s.counts || {};
  const tally = { served: 0, held_by_volume: 0, held_by_asterisk: 0, words: 0, glossed: 0, quote: 0, prose: 0 };
  for (const [key, e] of Object.entries(s.entries || {})) {
    entriesRead += 1;
    const held = Array.isArray(e.held) ? e.held : [];
    // L3
    if (e.served) { if (!served.has(e.volume)) note(volumes, `${slug}: ${key} served from volume ${e.volume}, which the record does not declare`); tally.served += 1; }
    else {
      if (!held.length || held.some((h) => !HELD.has(h))) note(volumes, `${slug}: ${key} is not served and names ${held.length ? held.join("+") : "no reason"}`);
      if ((e.strata || []).length) note(volumes, `${slug}: ${key} is held and still carries ${e.strata.length} stratum/strata of text`);
      if (held.includes("ASTERISK_PENDING_READ")) tally.held_by_asterisk += 1; else tally.held_by_volume += 1;
      if (held.includes("VOLUME_NOT_DECLARED") && served.has(e.volume)) note(volumes, `${slug}: ${key} held for its volume, but volume ${e.volume} is declared served`);
    }
    // L4
    if (e.served && pastTheFloor(key)) note(floorHits, `${slug}: ${key} is past the floor (${floorKey}) and served`);
    if (e.served && e.asterisk) note(floorHits, `${slug}: ${key} carries an asterisk and is served`);
    if (exactK(e.headword || "") !== key) note(strata, `${slug}: ${key} is not the K of its headword ${e.headword}`);
    // L5, L6
    for (const st of e.strata || []) {
      if (!SERVED_KINDS.has(st.kind)) note(strata, `${slug}: ${key} emits a ${JSON.stringify(st.kind)} stratum`);
      tally[st.kind === "quote" ? "quote" : "prose"] += 1;
      const ws = st.words || [];
      if (!ws.length) note(strata, `${slug}: ${key} emits a ${st.kind} stratum with no words`);
      for (const w of ws) {
        tally.words += 1; wordsRead += 1;
        if (!w.s || !w.k) note(strata, `${slug}: ${key} carries a word without surface or key`);
        else if (exactK(w.s) !== w.k) note(strata, `${slug}: ${key} · ${w.s} keys as ${exactK(w.s)}, the file says ${w.k}`);
        if (w.k && s.gloss && s.gloss[w.k]) { tally.glossed += 1; if (!s.gloss_m || !s.gloss_m[w.k]) note(unlicensed, `${slug}: ${w.k} shows a reading with no M`); }
      }
      if (ws.length && ws.map((w) => w.s).join(" ") !== String(st.text || "")) note(strata, `${slug}: ${key} ${st.kind} text is not the join of its words`);
    }
  }
  // L7
  const expect = (where, got, want) => { if (got !== want) note(counts, `${slug}: ${where} says ${JSON.stringify(got)}, disk says ${want}`); };
  expect("counts.served", c.served, tally.served);
  expect("counts.held_by_volume", c.held_by_volume, tally.held_by_volume);
  expect("counts.held_by_asterisk", c.held_by_asterisk, tally.held_by_asterisk);
  expect("counts.words", c.words, tally.words);
  expect("counts.glossed_words", c.glossed_words, tally.glossed);
  expect("counts.strata_emitted.quote", (c.strata_emitted || {}).quote, tally.quote);
  expect("counts.strata_emitted.prose", (c.strata_emitted || {}).prose, tally.prose);
  expect("counts.entries_on_this_zone", c.entries_on_this_zone, Object.keys(s.entries || {}).length);
  // L8
  const isFixture = slug.startsWith("fixture-");
  const base = existsSync(join(ZONES, `${slug}.bin`)) ? JSON.parse(gunzipSync(readFileSync(join(ZONES, `${slug}.bin`))).toString("utf8")) : null;
  if (!base) note(standing, `${f} has no ${slug}.bin beside it`);
  if (!delivered && !isFixture) note(standing, `${f} stands beside a served zone and the posture record says nothing has been delivered`);
  if (isFixture && !(base && base.fixture && base.fixture.never_served)) note(standing, `${slug}.bin is named a fixture and does not say in its own file that it is never served`);
  if (src.delivered !== delivered) note(standing, `${f} was built believing delivered=${src.delivered}; the record says ${delivered}`);
}

console.log(`\n— ${sidecars.length} sidecar(s) · ${judged} judged · ${entriesRead} entries · ${wordsRead} words · posture: volumes ${[...served].join(",") || "none"} served, delivery ${delivered ? "landed" : "not landed"} —`);
if (unreadable.length) { bad += 1; console.log(`FAIL  ${unreadable.length} unreadable: ${few(unreadable)}`); }
check("L2  the sidecar names the posture record it was built under, and it is the one on disk", record.length === 0, record.length ? few(record) : `sha256 ${String(postureSha || "").slice(0, 12)}… on every sidecar`);
check("L3  every served entry stands in a declared volume; every held entry names its reason and carries no text", volumes.length === 0, volumes.length ? `${volumes.length}: ${few(volumes)}` : "as recorded");
check("L4  no served entry is past the floor, and no asterisk entry is served", floorHits.length === 0, floorHits.length ? few(floorHits) : `floor at ${floorKey || "?"}; nothing crosses it`);
check("L5  only quote and prose strata are emitted, as keyed words under the K rule", strata.length === 0, strata.length ? `${strata.length}: ${few(strata)}` : `${wordsRead} words, each with its surface and its exact key`);
check("L6  every emitted word's reading carries its M", unlicensed.length === 0, unlicensed.length ? `${unlicensed.length}: ${few(unlicensed)}` : "a reading shown is a reading licensed");
check("L7  the counts count what is on disk", counts.length === 0, counts.length ? `${counts.length}: ${few(counts)}` : "served, held, strata, words and readings all count as recorded");
check("L8  until a delivery lands, a sidecar stands only beside a fixture that says it is never served", standing.length === 0, standing.length ? few(standing) : delivered ? "the record says a delivery landed" : `nothing delivered; ${judged} sidecar(s), each beside a fixture`);

console.log("\n  what this does not say: that the card draws the entry, or that the words in it");
console.log("  open (check-hoh-in-card-v1, a browser check). This one says the file keeps the");
console.log("  posture record's word: by volume, by asterisk, by floor, by stratum, by licence.");
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
