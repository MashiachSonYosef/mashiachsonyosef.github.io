#!/usr/bin/env node
// RUN: tree
// GUARDS: lattice-delta-rule-v1-a-listed-entry-of-the-lattice-takes-the-corpus-lanes-own-later-names-and-grades-and-every-other-entry-stands-as-the-lattice-has-it
// LEDGER: -
// no frame letter. A check reads the lattice delta's pin, the sidecars, the zones and, where they are on this
// machine, the lattice and the delta's lists, and judges them; it is not the ledger for one.
//
// A LISTED ENTRY OF THE LATTICE TAKES THE CORPUS LANE'S OWN LATER NAMES AND GRADES, AND EVERY OTHER ENTRY STANDS AS
// THE LATTICE HAS IT (tools/lattice-delta-v1.mjs says the rule; tools/project-lattice-v12-v1.mjs applies it, rule 8).
// This is the standing law of it:
//
//   D1  the pin: the rule and the two receipts are the bytes it names; the lane's receipt names each list by the
//       pin's bytes; the second count names the same three files and says it agrees
//   D2  every sidecar projected from the lattice says the delta it was read with: the pin's relay, each list by
//       the pin's sha256 and whether it lands, and its own counts. The counts add up: a book's grades lines are
//       the count the lane's receipt gives the book, and over the books the names lines are the list's lines and
//       the grades lines the list's. A tree that pins no delta carries none on any sidecar
//   D3  with the lattice and the lists on this machine (--lattice <dir> or LATTICE_DIR, --lattice-delta <dir> or
//       LATTICE_DELTA_DIR): on every book all of whose verses joined, each graded surface carries, card for card,
//       the grades the lattice gives it at its first place in the book with the delta's line for that place
//       applied, and the sidecar's counts of lines applied are a recount's. Without them this half says it was
//       not judged. (The names are held by tools/check-lattice-projection-v1.mjs L4c, place by place, which
//       reads the same lists.)
//   D4  the third list lands nothing, and is read beside the zones where it is on this machine: every untagged
//       place of it that stands on its zone as a plain untagged word with a headword of its own is asked by the
//       list's lemma (the zone's headword, hp, is MACULA's lemma by its letters). The places the zone gives no
//       headword are counted and said: the places our text spells otherwise, which wait for their pieces. The
//       list's entries were read from the store of 20 November, so they are counted beside the zone's and not
//       held. No word carries a lemma of the lattice's (tl): that reading was measured on 21 November and not
//       landed.
//
// Run: node tools/check-lattice-delta-v1.mjs [--lattice <dir>] [--lattice-delta <dir>]
import { readFileSync, existsSync, createReadStream } from "node:fs";
import { gunzipSync, createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PinFault } from "./pinned-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
import { LATTICE_DELTA_RULE_ID, LATTICE_DELTA_HOME, LATTICE_DELTA_LISTS, readLatticeDeltaPin, readLatticeDelta, lands } from "./lattice-delta-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const ZONES = join(K3, "data", "zones");
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const LATTICE = arg("lattice", process.env.LATTICE_DIR || null), DELTA = arg("lattice-delta", process.env.LATTICE_DELTA_DIR || null);
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const few = (list, n = 3) => `${list.length} · ${list.slice(0, n).join(" | ")}`;
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const num = (n) => Number(n).toLocaleString("en-US");

const pinPath = join(K3, LATTICE_DELTA_HOME, "PIN.json");
const books = zonesServed(ZONES).filter((z) => existsSync(join(ZONES, `${z}.lattice.bin`)));
if (!existsSync(pinPath)) {
  // a tree that pins no delta: no sidecar may say one
  const say = books.filter((z) => gz(join(ZONES, `${z}.lattice.bin`)).delta);
  check("D2  this tree pins no lattice delta, and no sidecar says one", !say.length, say.length ? few(say) : `${books.length} sidecars`);
  console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
  process.exit(bad ? 1 : 0);
}

// ── D1 · the pin ────────────────────────────────────────────────────────
let read = null, pinFault = null;
try { read = readLatticeDeltaPin(pinPath); } catch (e) { if (!(e instanceof PinFault)) throw e; pinFault = e.message; }
if (!read) { check("D1  the pin, its rule and its receipts", false, pinFault); console.log("\n1 FAILED"); process.exit(1); }
const { pin, receipt, verify } = read;
{
  const faults = [];
  if (((receipt.rule || {}).sha256 || null) !== pin.rule.sha256) faults.push("the lane's receipt was not made under the rule the pin names");
  const compared = new Map((Array.isArray(verify.files_compared) ? verify.files_compared : []).map((f) => [f.file, f]));
  for (const k of LATTICE_DELTA_LISTS) { const d = pin.lists[k], c = compared.get(d.file); if (!c || c.bytes !== d.bytes || c.sha256 !== d.sha256) faults.push(`the second count did not compare ${d.file} as the pin names it`); }
  if (!(verify.agree === true && verify.failures === 0)) faults.push("the second count does not say it agrees");
  if (((receipt.names_this_verse || {}).entries_touched ?? 0) + ((receipt.names_this_verse || {}).span_cards_touched ?? 0) !== pin.lists.names_this_verse.lines) faults.push("the names list's lines are not the entries and span cards the lane's receipt counts");
  if ((receipt.grade_v5 || {}).delta_lines !== pin.lists.grade_v5.lines) faults.push("the grades list's lines are not the lines the lane's receipt counts");
  if ((receipt.untagged_places || {}).places !== pin.lists.untagged_places.lines) faults.push("the untagged places' lines are not the places the lane's receipt counts");
  check("D1  the pin: its rule and receipts are the bytes it names, the lane's receipt names each list by them, and the second count agrees", !faults.length,
    faults.length ? few(faults) : `relay ${pin.relay} · names ${num(pin.lists.names_this_verse.lines)} lines, grades ${num(pin.lists.grade_v5.lines)}, untagged places ${num(pin.lists.untagged_places.lines)} (${LATTICE_DELTA_LISTS.filter((k) => lands(pin, k)).length} of 3 land)`);
}

// ── D2 · what each sidecar says ─────────────────────────────────────────
const sidecars = new Map(books.map((z) => [z, gz(join(ZONES, `${z}.lattice.bin`))]));
{
  const faults = [];
  const byBook = (receipt.grade_v5 || {}).entries_with_a_change_by_book || {};
  let names = 0, grades = 0, namesApplied = 0, added = 0, gradeFirst = 0, cards = 0;
  for (const [z, s] of sidecars) {
    const d = s.delta;
    if (!d) { faults.push(`${z}: its sidecar says no delta, and the tree pins one`); continue; }
    if (d.rule !== LATTICE_DELTA_RULE_ID || d.relay !== pin.relay) faults.push(`${z}: its sidecar names another rule or relay`);
    for (const k of LATTICE_DELTA_LISTS) { const has = (d.lists || {})[k], want = pin.lists[k]; if (!has || has.file !== want.file || has.sha256 !== want.sha256 || has.lands !== want.lands) faults.push(`${z}: its sidecar names ${k} otherwise than the pin`); }
    const n = d.names || {}, g = d.grades || {};
    if (![n.lines_for_this_book, n.applied, n.names_added, n.lines_for_span_cards, g.lines_for_this_book, g.applied_at_a_surfaces_first_verse, g.cards_regraded, g.lines_of_a_surface_graded_at_an_earlier_verse].every((x) => Number.isInteger(x) && x >= 0)) { faults.push(`${z}: its sidecar's counts are not whole numbers`); continue; }
    if (n.applied + n.lines_for_span_cards > n.lines_for_this_book) faults.push(`${z}: more names lines applied than listed`);
    if (g.applied_at_a_surfaces_first_verse + g.lines_of_a_surface_graded_at_an_earlier_verse > g.lines_for_this_book) faults.push(`${z}: more grades lines read than listed`);
    if (lands(pin, "grade_v5") && g.lines_for_this_book !== (byBook[z] ?? 0)) faults.push(`${z}: ${g.lines_for_this_book} grades lines, and the lane's receipt counts ${byBook[z] ?? 0} for the book`);
    names += n.lines_for_this_book; grades += g.lines_for_this_book; namesApplied += n.applied; added += n.names_added; gradeFirst += g.applied_at_a_surfaces_first_verse; cards += g.cards_regraded;
  }
  // every book the lists name is a served book with a sidecar, so the books' lines are the lists'
  if (lands(pin, "names_this_verse") && names !== pin.lists.names_this_verse.lines) faults.push(`the sidecars count ${num(names)} names lines, and the list holds ${num(pin.lists.names_this_verse.lines)}`);
  if (lands(pin, "grade_v5") && grades !== pin.lists.grade_v5.lines) faults.push(`the sidecars count ${num(grades)} grades lines, and the list holds ${num(pin.lists.grade_v5.lines)}`);
  check("D2  every sidecar says the delta it was read with, by the pin's bytes, and the books' lines are the lists'", !faults.length,
    faults.length ? few(faults) : `${sidecars.size} sidecars · names ${num(namesApplied)} of ${num(names)} lines applied (${num(added)} names added) · grades ${num(gradeFirst)} lines applied at a surface's first verse (${num(cards)} cards), of ${num(grades)}`);
}

// ── D3 · the grades, against the lattice and the list ───────────────────
const GRADE_CHAR = { VOWEL_MATCH: "m", NORMALIZED: "n", VOWEL_MISMATCH: "x" };
const here = !!(LATTICE && DELTA && existsSync(LATTICE) && existsSync(DELTA));
const untaggedByBook = new Map();
if (!here) console.log("  --  D3 and the second half of D4 were not judged here: the corpus lane's lattice and the delta's lists are not on this machine (--lattice <dir> or LATTICE_DIR, --lattice-delta <dir> or LATTICE_DELTA_DIR)");
else {
  const faults = [];
  let judged = 0, surfaces = 0, skipped = [];
  for (const [z, s] of sidecars) {
    const pos = join(LATTICE, `positions-${z}-v12.jsonl.gz`);
    if (!existsSync(pos) || !s.delta) continue;
    let d = null;
    try { d = readLatticeDelta(pinPath, DELTA, z, { withUntagged: true }); } catch (e) { if (!(e instanceof PinFault)) throw e; faults.push(`${z}: ${e.message}`); continue; }
    untaggedByBook.set(z, d.untagged);
    const join_ = ((s.emitted_from || {}).join) || {};
    // the surface's first place in the book is the projection's only where every verse joined
    if (join_.verses_held || join_.verses_absent_from_lattice) { skipped.push(z); continue; }
    judged += 1;
    const first = new Map();   // surface -> the grades due
    let applied = 0, regraded = 0, later = 0;
    const rl = createInterface({ input: createReadStream(pos).pipe(createGunzip()), crlfDelay: Infinity });
    for await (const line of rl) {
      if (!line) continue;
      const p = JSON.parse(line);
      if (p.c0 !== "ON") continue;
      for (const [ei, m] of (p.megacompspan || []).entries()) {
        const rg = m.route_grades, r = (s.routes || {})[m.key];
        if (!rg || !r) continue;
        const dg = lands(pin, "grade_v5") ? (d.grades.get(p.j) || new Map()).get(ei) || null : null;
        if (first.has(m.surface)) { if (dg) later += 1; continue; }
        const g = new Array(r.f.length).fill("-");
        for (const [tier, idxs] of Object.entries(rg.grade_of_index || {})) for (const ix of idxs) if (ix < g.length) g[ix] = GRADE_CHAR[tier] || "-";
        if (dg) { for (const [ix, , to] of dg.changes) if (ix < g.length) g[ix] = GRADE_CHAR[to]; applied += 1; regraded += dg.changes.length; }
        first.set(m.surface, g.join(""));
      }
    }
    let wrong = 0;
    for (const [surface, g] of first) { const has = (s.grades || {})[surface]; if (!has) continue; surfaces += 1; if (has.g !== g) { wrong += 1; if (wrong === 1) faults.push(`${z}: ${surface} carries ${has.g.slice(0, 40)} and is due ${g.slice(0, 40)}`); } }
    if (wrong > 1) faults.push(`${z}: ${wrong} surfaces carry other grades than the lattice's with the delta applied`);
    const said = s.delta.grades || {};
    if (said.applied_at_a_surfaces_first_verse !== applied || said.cards_regraded !== regraded || said.lines_of_a_surface_graded_at_an_earlier_verse !== later)
      faults.push(`${z}: its sidecar says ${said.applied_at_a_surfaces_first_verse} lines applied, ${said.cards_regraded} cards, ${said.lines_of_a_surface_graded_at_an_earlier_verse} later; a recount gives ${applied}, ${regraded}, ${later}`);
  }
  check("D3  each graded surface carries the lattice's grades at its first place with the delta's line applied, and the sidecar's counts are a recount's", !faults.length,
    faults.length ? few(faults) : `${num(surfaces)} surfaces on ${judged} books${skipped.length ? `; ${skipped.length} book(s) with a verse held or absent not judged (${skipped.join(", ")})` : ""}`);
}

// ── D4 · the third list beside the zones ────────────────────────────────
{
  const faults = [];
  const letters = (t) => [...String(t || "").normalize("NFD")].filter((c) => c >= "\u05D0" && c <= "\u05EA").join("");
  let listed = 0, plain = 0, byHp = 0, noHeadword = 0, noHeadwordListed = 0, sameEntries = 0, otherEntries = 0, notPlain = 0;
  for (const z of books) {
    const zone = gz(join(ZONES, `${z}.bin`));
    for (const sec of zone.sections || []) for (const w of sec.words || []) if (w && w.tl !== undefined) faults.push(`${z} ${sec.label}: ${w.k} carries tl, which no tool of this tree writes`);
    const lines = untaggedByBook.get(z);
    if (!lines) continue;
    const byRef = new Map((zone.sections || []).map((sec) => [String(sec.label), sec]));
    for (const l of lines) {
      listed += 1;
      const sec = byRef.get(l.ref);
      const w = (sec ? (sec.words || []).filter((x) => x && !x.mark && x.s === l.surface) : [])[0] || null;
      if (!w || w.tg || w.w || w.kq || w.kqw || !w.k) { notPlain += 1; continue; }
      plain += 1;
      const own = typeof w.hp === "string" && w.hp ? w.hp : null;
      const theirs = typeof l.lemma === "string" && l.lemma ? l.lemma : null;
      const te = w.te === undefined ? [] : [].concat(w.te), tte = Array.isArray(l.te) ? l.te : [];
      if (!own) { noHeadword += 1; if (theirs && tte.length) noHeadwordListed += 1; continue; }
      byHp += 1;
      if (theirs && letters(theirs) !== letters(own)) faults.push(`${z} ${l.ref}: ${w.k} is asked by its headword ${own}, and the list's lemma is ${theirs}`);
      if (JSON.stringify(te) === JSON.stringify(tte)) sameEntries += 1; else otherEntries += 1;
    }
  }
  check("D4  the third list lands nothing: no word carries a lemma of the lattice's" + (untaggedByBook.size ? ", and each listed untagged place that is a plain untagged word with a headword is asked by the list's lemma" : ""), !faults.length,
    faults.length ? few(faults) : untaggedByBook.size
      ? `of ${num(listed)} listed places ${num(plain)} are plain untagged words (${notPlain} are tagged, paired or not found by their surface): ${byHp} asked by their own headword, the list's lemma (the entries the list's at ${sameEntries}, others at ${otherEntries}: the list read the store of 20 November; not held) · ${noHeadword} carry no headword, ${noHeadwordListed} of them with entries in the list: the places our text spells otherwise, which wait for their pieces`
      : "no word carries tl");
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
