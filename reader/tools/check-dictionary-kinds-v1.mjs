#!/usr/bin/env node
// RUN: tree
// GUARDS: dictionary-kinds-rule-v1-each-dictionary-is-filed-by-what-it-says-it-is-and-a-kind-or-a-category-it-marks-in-its-own-data-may-rest-shut
// LEDGER: -
// no frame letter. A check reads the record of dictionary kinds, the store's
// index and shards, the overlays' indexes, the zones and the page, and
// judges them; it is not the ledger for one.
//
// EACH DICTIONARY IS FILED BY WHAT IT SAYS IT IS, AND A KIND OR A CATEGORY IT
// MARKS IN ITS OWN DATA MAY REST SHUT. The owner, 15 November 2026: «we need
// to think in terms of each dictionary as a category». The record
// (data/dictionary-kinds-v1.json) files every source the store cites by the
// work it is and the kind of work, in the work's own words where it has
// any, and names what rests shut on a card and under the line at rest;
// tools/dictionary-kinds-v1.mjs holds the rule's functions, and the page
// carries two of them under the same names.
//
// What is held here, each recomputed and none read from a tool's receipt:
//
//   K1  the record holds to the store. It is a record of its schema
//       (kindsFault: its kinds, its families, each family's own words a
//       quote of what the table says it is, or the table's clause that it
//       is silent; each resting entry's words, without a Hebrew letter; the
//       scope). Every source key of the store's index is filed by exactly
//       one family of the store and every family's keys are its index's,
//       each overlay's likewise in families of that overlay, and every
//       resting entry shuts keys of the store and names no family beside it
//       (restsOffOf refuses a record that does not). Every record a
//       family's «where» names is in this tree. Every resting entry rests
//       rows of the store: its keys, M ids and rows, counted from the
//       shards. And the scope: of every zone on this disk a reader opens,
//       it rests shut the thirty-nine books the door files
//       (data/book-order-v1.json), each served, and no other.
//   K2  one rule, one place: the page's restsOffOf and restsOffIds, read
//       out of zone.html and run, answer as the module's do on every row of
//       the store; on a row of every M id of the index, and of ids it does
//       not name, bare and with facts, under the record and under records
//       made here to reach what the record of the day does not (two entries
//       over one row, a fact equal to a value, a fact that is a list holding
//       one); they give the same ids over the index in either order; and
//       they refuse the records the module refuses. The module's own two are
//       lifted out of its source the same way and run first, which proves
//       they reach nothing outside themselves. Until the page carries the
//       rule (the design's part 2) K2 is not judged, the check says so, and
//       it exits 3, never a pass.
//
//   K3  the bakes are at rest. Every zone the record rests shut carries the
//       bake's stamp naming this record (emitted_from.rests_off: its rule,
//       path, version and sha256), and what each resting entry holds shut on
//       the zone's own keys, recounted here; no other zone carries one. On
//       those zones no column of the line names a source shut whole (the
//       line's credit, carriers and alternate; every order column's, the
//       witnessed ones too; the switches' table), and no source a column
//       credits carries the reading only in rows that rest shut (a category
//       a source marks, as English Wiktionary's names). The line is the
//       store's projection: rebuilt here over each zone's own keys, its
//       table and its credits are the store's at rest on a book the record
//       rests shut, and the store's whole on any other (the Tikkunei Zohar
//       and the commentaries keep today's rest). Every lattice sidecar of a
//       book at rest names the record, and no leader it bakes names a
//       source shut whole or stands on rows that rest shut alone (the
//       lattice's own cards are the corpus lane's, read whole); a sidecar of
//       any other work names none. And the headword's reading a word of a
//       zone at rest carries (hg, the line under «the headword», with hm its
//       source) names no source shut whole and stands on a row of its source
//       that rests open.
//   K4  the page at rest, in a browser, on the first book the door files
//       that the record rests shut: a fresh reader finds the dictionaries
//       shut and the sources off exactly as the record of defaults rests
//       them, the page's ids and version the record's; no word asked live at
//       first paint. On a word found in the data whose shut rows print a
//       reading no open row of its key prints, the card shows no pill that
//       stands on sources shut whole alone, says on its withheld line how
//       many it holds back with a press not pressed, and shows one press a
//       reader can press on screen (on a tight card, which folds the
//       withheld line, in the readings' label); one press opens them:
//       exactly that many pills come, each wearing the dotted edge, the
//       press says it stands open and the device keeps it for this record's
//       version, and the card built again shows its press, holding the
//       focus; a reload keeps it open, and the rail's chips are switches;
//       reset shuts them again and leaves the reader's own source switches
//       as they were; the rail's block stands with its chips shut, one per
//       source the stamp holds shut whole, and the rail's line counts as off
//       only the reader's own; the rail's switch pressed from the keyboard
//       keeps the focus; and a reading the press brought, pressed and then
//       shut away with its card, leaves no focus owed to the next card a
//       reader opens. On the first served work the record does not
//       rest shut nothing of it is drawn: no switch, no count, and it does
//       not act there; and its search, every place of which is of a book at
//       rest, answers a reading the book's card held back as the book's own
//       search does, leaving out the sources shut whole. And on the first
//       book at rest with a Targum beside it, a Targum word whose line
//       stands on sources shut whole alone keeps today's rest on its card
//       (its sidecar is out of the scope): nothing held back, no press, and
//       its line's reading a pill of its card.
//   K5  the records and the chain books. Every record of the resting lines
//       names this record among the files its page read, at its sha256; on
//       a book the record rests shut it says it was read with the
//       dictionaries shut, and no line it keeps is credited to a source
//       shut whole; on any other work it says they did not act there. Every
//       chain book says the same of its state at rest, and its lifted state
//       holds them open; no pill of a card at rest stands on sources shut
//       whole alone, and lifted, the book's cards hold such pills again
//       where its stamp says it carries their rows.
//
// Run: node tools/check-dictionary-kinds-v1.mjs [--record-in <folder>] [--page <file>] [--only <work,...>]
//   --record-in reads the record from another folder than data/, and
//   --page reads the rule from another copy of the page than zone.html: the
//   store, the overlays and the zones are always this tree's. They are there
//   to show the check refusing a state it must refuse. K3 to K5 read the
//   tree's zones, records and chain books, and K4 serves the tree itself;
//   --only narrows them to the works named (a commentary goes with its
//   book), for a proof run on a few books baked at rest, and the check says
//   so on a line of its own: a law judged on some works is not judged on
//   all.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { factsOf, openRouteStore, readingKey } from "./gloss-store-v1.mjs";
import { glossMFor } from "./gloss-m-v1.mjs";
import { DICTIONARY_KINDS_RULE_ID, DICTIONARY_KINDS_RECORD, readKinds, restsOffOf, restsOffIds, restsOffIn } from "./dictionary-kinds-v1.mjs";
import { zonesServed, carriesReaderHebrew } from "./zones-on-disk-v1.mjs";
import { wordListsOf } from "./zone-walk-v1.mjs";
import { formsOfRun } from "./weld-forms-v1.mjs";
import { cellsOf } from "./span-slice-v1.mjs";
import { plainWord } from "./gated-card-v1.mjs";
import { restingOff } from "./rows-beside-the-store-v1.mjs";
import { readRecord, recordPath } from "./resting-lines-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const READER = join(HERE, "..");
const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : null; };
const RECORD_IN = arg("record-in") || join(READER, "data");
// --only: the works K3 to K5 are judged on, where a proof narrows them (a commentary goes with its book)
const ONLY = (() => { const i = process.argv.indexOf("--only"); return i > 0 && process.argv[i + 1] ? new Set(process.argv[i + 1].split(",").filter(Boolean)) : null; })();
const judged = (name) => !ONLY || ONLY.has(String(name).split(".")[0]);
const PAGE = arg("page") || join(READER, "zone.html");
const STORE = join(READER, "data", "route-store");
const ZONES = join(READER, "data", "zones");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const side = (n, d = "") => console.log(`  --  ${n}${d ? "  ·  " + d : ""}`);
const nf = (x) => Number(x).toLocaleString("en-US");
const first = (list, n = 3) => list.slice(0, n).join(" · ") + (list.length > n ? ` · and ${list.length - n} more` : "");
const gz = (path) => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));

console.log(`— ${DICTIONARY_KINDS_RULE_ID} —\n`);
if (RECORD_IN !== join(READER, "data")) side("the record is read from another folder", RECORD_IN);
if (PAGE !== join(READER, "zone.html")) side("the rule is read from another copy of the page", PAGE);
if (ONLY) side(`K3 to K5 not judged on every work: narrowed to ${[...ONLY].join(", ")} (--only)`);

// ---- K1: the record holds to the store --------------------------------------------------------------------------
let kinds = null;
try { kinds = readKinds(RECORD_IN); } catch (e) { check("K1  the record is one of its schema", false, e.message); }
if (!kinds) { console.log(`\n${bad} FAILED`); process.exit(1); }
const rec = kinds.rec;
const store = rec.families.filter((f) => f.shelf === "store");
check("K1  the record is one of its schema: its kinds, its families and their own words, its resting entries and its scope hold (kindsFault)", true,
  `${DICTIONARY_KINDS_RECORD} ${rec.version} · sha256 ${kinds.sha256.slice(0, 12)}… · ${rec.families.length} families (${store.length} of the store) under ${Object.keys(rec.kinds).length} kinds · ${rec.rests_off.length} resting entries`);

const index = JSON.parse(readFileSync(join(STORE, "index.json"), "utf8"));
const mSources = index.m_sources;
let rule = null;
{
  const faults = [];
  try { rule = restsOffOf(rec, mSources, factsOf); } catch (e) { faults.push(e.message); }
  const indexKeys = new Set(Object.values(mSources).map((s) => s.key));
  for (const f of store) for (const k of f.keys) if (!indexKeys.has(k)) faults.push(`${f.id} files ${k}, which the store's index does not name`);
  const overlays = new Map();   // overlay -> the keys its index names
  for (const f of rec.families.filter((x) => x.shelf === "overlay")) {
    if (!overlays.has(f.overlay)) {
      const p = join(READER, "data", "overlays", f.overlay, "index.json");
      overlays.set(f.overlay, existsSync(p) ? new Set(Object.values(JSON.parse(readFileSync(p, "utf8")).m_sources || {}).map((s) => s.key)) : null);
    }
    const keys = overlays.get(f.overlay);
    if (!keys) faults.push(`${f.id} is filed beside the store in the overlay ${f.overlay}, which has no index here`);
    else for (const k of f.keys) if (!keys.has(k)) faults.push(`${f.id} files ${k}, which the overlay ${f.overlay}'s index does not name`);
  }
  for (const [o, keys] of overlays) for (const k of keys || []) if (!rec.families.some((f) => f.shelf === "overlay" && f.overlay === o && f.keys.includes(k))) faults.push(`the overlay ${o}'s key ${k} is filed by no family of it`);
  const nOverlayKeys = [...overlays.values()].reduce((n, s) => n + (s ? s.size : 0), 0);
  check("K1  every source key of the store's index is filed by exactly one family of the store, every family's keys are its index's (an overlay's in its own), and every resting entry shuts keys of the store and names no family beside it", faults.length === 0,
    faults.length ? first(faults) : `${indexKeys.size} keys of the store (${Object.keys(mSources).length} M ids) in ${store.length} families · ${nOverlayKeys} keys of ${overlays.size} overlays in ${rec.families.length - store.length} families`);
}
{
  const missing = [];
  for (const f of rec.families) for (const [named, path] of Object.entries(f.files)) if (!existsSync(join(READER, path))) missing.push(`${f.id}: ${named} (${path})`);
  const words = rec.families.reduce((n, f) => n + f.own_words.length, 0), silent = rec.families.filter((f) => !f.own_words.length);
  check("K1  every family says what it is in its own words, each a quote of the table's cell, or is silent in the table's own clause; and every record its «where» names is in this tree", missing.length === 0,
    missing.length ? first(missing) : `${words} quotes of ${rec.families.length - silent.length} families · ${silent.length} silent (${silent.map((f) => f.id).join(", ")}) · ${new Set(rec.families.flatMap((f) => Object.values(f.files))).size} records named, every one here`);
}

// ---- the page's copy of the rule, and the module's own, lifted out of their sources the same way --------------------
const HEAD = /\n[ \t]*(?:export )?const restsOffOf = \(rec, mSources, factsOf\) => /gu;
const END = "// end of the kinds' rule (tools/dictionary-kinds-v1.mjs)";
// the rule's two functions as a source holds them, run on their own: { fns } | { absent: true } | { fault }
const lift = (path) => {
  const src = readFileSync(path, "utf8");
  const heads = [...src.matchAll(HEAD)];
  if (!heads.length) return { absent: true };
  if (heads.length > 1) return { fault: `${path} opens the rule ${heads.length} times` };
  const a = heads[0].index + 1;
  const z = src.indexOf(END, a);
  if (z < 0 || src.indexOf(END, z + 1) >= 0) return { fault: `${path} does not close the rule exactly once with "${END}"` };
  const body = src.slice(a, z).replace(/^([ \t]*)export const /gmu, "$1const ");
  try { return { fns: new Function(`${body}\nreturn { restsOffOf, restsOffIds };`)(), lines: body.split("\n").map((l) => l.trim()).filter(Boolean) }; } catch (e) { return { fault: `${path}: the rule does not run on its own (${e.message})` }; }
};
const own = lift(join(HERE, "dictionary-kinds-v1.mjs"));
const page = lift(PAGE);
const copies = [["the module's own block", own]];
if (page.fns) copies.push(["the page's copy", page]);
if (own.fault) check("K2  the module's rule runs on its own, lifted out of its source", false, own.fault);
if (page.fault) check("K2  the page carries the rule once, between the line that opens it and the line that closes it", false, page.fault);
const ruleOf = new Map();   // a copy -> its rule over this index, or the sentence it refused with
for (const [name, c] of copies) if (c.fns) { try { ruleOf.set(name, c.fns.restsOffOf(rec, mSources, factsOf)); } catch (e) { ruleOf.set(name, e.message); } }

// ---- one pass over every row of the store ---------------------------------------------------------------------------
const rowsOfM = new Map();                                       // M id -> rows
const per = new Map(rec.rests_off.map((e) => [e.id, { rows: 0, byFamily: new Map() }]));
const familyOfKey = new Map(store.flatMap((f) => f.keys.map((k) => [k, f.id])));
const differs = new Map(copies.map(([name]) => [name, []]));    // a copy -> where it answered otherwise than the module
const answer = (fn, row) => { const e = fn(row); return e ? e.id : null; };
let rows = 0;
if (rule) {
  const names = readdirSync(join(STORE, "shards")).filter((f) => f.endsWith(".bin")).sort();
  if ((index.counts || {}).shards === 256 && names.length !== 256) { check("K1  the store's shards are all here", false, `${names.length} of the 256 the index counts`); console.log(`\n${bad} FAILED`); process.exit(1); }
  for (const name of names) {
    const shard = gz(join(STORE, "shards", name));
    for (const [key, list] of Object.entries(shard)) for (const row of list) {
      rows += 1;
      rowsOfM.set(row[3], (rowsOfM.get(row[3]) || 0) + 1);
      const mine = rule(row);
      if (mine) {
        const p = per.get(mine.id); p.rows += 1;
        const fam = familyOfKey.get((mSources[row[3]] || {}).key);
        p.byFamily.set(fam, (p.byFamily.get(fam) || 0) + 1);
      }
      for (const [cname] of copies) {
        const theirs = ruleOf.get(cname);
        if (typeof theirs !== "function") continue;
        const t = answer(theirs, row);
        if (t !== (mine ? mine.id : null) && differs.get(cname).length < 50) differs.get(cname).push(`${key} ${row[3]} «${String(row[1]).slice(0, 30)}»: ${t} where the module says ${mine ? mine.id : null}`);
      }
    }
  }
  const dead = rec.rests_off.filter((e) => !per.get(e.id).rows);
  const said = rec.rests_off.map((e) => {
    const p = per.get(e.id);
    const keys = new Set();
    for (const f of store) if ((e.kinds || []).includes(f.kind) || (e.families || []).includes(f.id)) for (const k of f.keys) keys.add(k);
    const ms = Object.keys(mSources).filter((m) => keys.has(mSources[m].key));
    const fams = [...p.byFamily].sort((x, y) => y[1] - x[1]).map(([f, n]) => `${f} ${nf(n)}`).join(", ");
    return `${e.id}: ${keys.size} keys, ${ms.length} M ids (${ms.filter((m) => rowsOfM.get(m)).length} with rows), ${nf(p.rows)} rows${e.fact ? ` carrying ${e.fact} (${fams})` : ""}`;
  });
  check("K1  every resting entry rests rows of the store (counted from the shards, the first entry in the record's order taking a row)", dead.length === 0,
    `${dead.length ? `${dead.map((e) => e.id).join(", ")} rest${dead.length === 1 ? "s" : ""} no row · ` : ""}${said.join(" · ")} · of ${nf(rows)} rows`);
}

// ---- K1: the scope ----------------------------------------------------------------------------------------------------
{
  const faults = [];
  const orderPath = join(READER, "data", "book-order-v1.json");
  const books = existsSync(orderPath) ? JSON.parse(readFileSync(orderPath, "utf8")).files || [] : [];
  if (books.length !== 39) faults.push(`data/book-order-v1.json names ${books.length} books to file, not the thirty-nine`);
  const served = new Set(zonesServed(ZONES));
  const picked = [], left = [];
  for (const f of readdirSync(ZONES).filter((x) => x.endsWith(".bin") && carriesReaderHebrew(x)).sort()) {
    const name = f.replace(/\.bin$/u, "");
    let zone;
    try { zone = gz(join(ZONES, f)); } catch (e) { faults.push(`${f} does not read as a zone (${e.message})`); continue; }
    let shut;
    try { shut = restsOffIn(rec, zone); } catch (e) { faults.push(`${f}: ${e.message}`); continue; }
    (shut ? picked : left).push(name);
  }
  const want = new Set(books);
  for (const b of picked) if (!want.has(b)) faults.push(`${b} rests shut and is not a book the door files`);
  for (const b of books) if (!picked.includes(b)) faults.push(`${b}, a book the door files, does not rest shut`);
  for (const b of picked) if (!served.has(b)) faults.push(`${b} rests shut and is not served`);
  const servedLeft = left.filter((b) => served.has(b));
  check(`K1  the scope (${rec.scope.say}): of the zones on this disk a reader opens, it rests shut the thirty-nine books the door files, each served, and no other`, faults.length === 0,
    faults.length ? first(faults) : `${picked.length} books rest shut · ${left.length} other zones keep today's rest: ${servedLeft.length} served (${servedLeft.join(", ")}), ${left.filter((b) => /\.commentary$/u.test(b)).length} commentaries beside a book, ${left.filter((b) => !served.has(b) && !/\.commentary$/u.test(b)).length} fixtures`);
}

// ---- K2: one rule, one place --------------------------------------------------------------------------------------------
if (rule && own.fns) {
  // The record of the day does not reach every part of the rule: its two entries never meet on a row, and no entry of
  // it compares a value. So the copies are also run under records made here that do: two entries over one row (the
  // first in the record's order takes it), a fact equal to a value (is), a fact that is a list holding one (has).
  const probe = (id, fields) => ({ id, say: "a probe of this check", ruling: "none: a probe of this check", ...fields });
  const records = [
    ["the record", rec],
    ["two entries over one row", { ...rec, rests_off: [probe("probe-general-name", { kinds: ["general-with-entries"], fact: "name" }), probe("probe-hebrew-entries", { families: ["english-wiktionary-hebrew-entries"] })] }],
    ["a fact equal to a value", { ...rec, rests_off: [probe("probe-pos-prefix", { families: ["english-wiktionary-hebrew-entries"], fact: "pos", is: "prefix" })] }],
    ["a fact that is a list holding a value", { ...rec, rests_off: [probe("probe-labels-slang", { families: ["english-wiktionary-hebrew-entries", "hebrew-wiktionary"], fact: "labels", has: "slang" })] }],
  ];
  // a row of every M id of the index, and of ids it does not name, bare and with facts each of those records reads
  const FACTS = [null, { name: 1 }, { name: 0 }, { pos: "prefix" }, { pos: "noun" }, { pos: ["prefix"] }, { labels: ["slang", "colloquial"] }, { labels: "slang" }, { labels: ["colloquial"] }];
  const probes = [];
  for (const m of [...Object.keys(mSources), "M0", "MSAM2", "PIECE:TAHOT", "M197"]) for (const f of FACTS)
    probes.push([`${m} with ${f ? JSON.stringify(f) : "no facts"}`, f ? [null, null, null, m, null, null, null, null, null, null, f] : [null, null, null, m]]);
  // the index in its own order and turned around: the ids come out in one order whatever the index's
  const indexes = [["the index", mSources], ["the index turned around", Object.fromEntries(Object.entries(mSources).reverse())]];
  // records the module refuses: a key the store's index names that no family files, a family beside the store in an
  // entry, an entry carrying a field the rule does not read
  const lacking = { ...rec, families: rec.families.filter((f) => f.id !== store[0].id) };
  const besides = { ...rec, rests_off: [{ ...rec.rests_off[0], families: [rec.families.find((f) => f.shelf === "overlay").id] }] };
  const unread = { ...rec, rests_off: [{ ...rec.rests_off[0], except: ["M1"] }] };
  const refusals = [["a key filed by no family", lacking], ["an overlay's family in an entry", besides], ["a field the rule does not read", unread]];
  const throws = (fn) => { try { fn(); return false; } catch { return true; } };
  const judge = (cname, fns) => {
    const faults = [...differs.get(cname)];
    if (typeof ruleOf.get(cname) !== "function") faults.unshift(`it refuses the record the module reads: ${ruleOf.get(cname)}`);
    for (const [rname, r] of records) {
      let theirs;
      try { theirs = fns.restsOffOf(r, mSources, factsOf); } catch (e) { faults.push(`under ${rname} it refuses: ${e.message}`); continue; }
      const mine = restsOffOf(r, mSources, factsOf);
      for (const [what, row] of probes) { const t = answer(theirs, row), m = answer(mine, row); if (t !== m) faults.push(`under ${rname}, ${what}: ${t} where the module says ${m}`); }
    }
    for (const [iname, ix] of indexes) {
      let ids;
      try { ids = fns.restsOffIds(rec, ix); } catch (e) { faults.push(`its restsOffIds over ${iname} refuses: ${e.message}`); continue; }
      const mine = restsOffIds(rec, ix);
      if (JSON.stringify(ids) !== JSON.stringify(mine)) faults.push(`its restsOffIds over ${iname} gives ${first(ids, 4)} where the module gives ${first(mine, 4)}`);
    }
    for (const [what, r] of refusals) if (!throws(() => fns.restsOffOf(r, mSources, factsOf)) || !throws(() => restsOffOf(r, mSources, factsOf))) faults.push(`a record with ${what} is not refused by both`);
    return faults;
  };
  const said = (cname) => `${nf(rows)} rows of the store under the record, and ${nf(probes.length)} probe rows under each of ${records.length} records, answered alike · the same ${restsOffIds(rec, mSources).length} ids shut whole over the index in either order · ${refusals.length} records refused by both`;
  const o = judge("the module's own block", own.fns);
  check("K2  the module's rule runs on its own, lifted out of its source as the page's copy is, and answers as the module does", o.length === 0,
    o.length ? first(o) : `${said("the module's own block")} · ids ${first(restsOffIds(rec, mSources), 6)}`);
  if (page.fns) {
    const p = judge("the page's copy", page.fns);
    const same = page.lines.length === own.lines.length && page.lines.every((l, i) => l === own.lines[i]);
    check("K2  the page's restsOffOf and restsOffIds, read out of the page and run, answer as the module's do on every row of the store and every probe, give the same ids, and refuse what the module refuses", p.length === 0,
      p.length ? first(p) : `${said("the page's copy")} · the page's text is ${same ? "the module's, line for line" : "not the module's line for line, and answers alike"}`);
  }
}
const k2Unjudged = !page.fns && !page.fault;
if (k2Unjudged) side("K2  not judged: the page does not carry the rule yet", `${PAGE} holds no line opening "const restsOffOf = (rec, mSources, factsOf) => ", so the page's part of the design has not landed and the rule stands in one place only`);

// ---- K3: the bakes are at rest ------------------------------------------------------------------------------------
// The store twice: whole, and opened at rest (tools/gloss-store-v1.mjs reads the record beside the store and leaves
// out every row it rests shut). A zone the record rests shut was baked over the second; any other over the first.
const storeWhole = openRouteStore(STORE);
let storeAtRest = null;
try { storeAtRest = openRouteStore(STORE, { atRest: true }); } catch (e) { check("K3  the store reader opens the store at rest", false, e.message); }
if (storeAtRest && !(storeAtRest.atRest && storeAtRest.atRest.sha256 === kinds.sha256 && typeof storeAtRest.routesWhole === "function")) {
  check("K3  the store reader opens the store at rest, under this record", false, storeAtRest.atRest ? `it read the record at sha256 ${String(storeAtRest.atRest.sha256).slice(0, 12)}…, this check ${kinds.sha256.slice(0, 12)}…` : "tools/gloss-store-v1.mjs takes no { atRest } and opened the store whole");
  storeAtRest = null;
}
const SHUT_IDS = new Set(restsOffIds(rec, mSources));
const SHUT_LABELS = new Set([...SHUT_IDS].map((m) => (mSources[m] || {}).label).filter(Boolean));
const shutLabelShared = [...SHUT_LABELS].filter((l) => Object.entries(mSources).some(([m, x]) => x.label === l && !SHUT_IDS.has(m)));
// the zone's own keys, as tools/regloss-zone.mjs asks the store under them (its rule 3: every word's key and its
// headword's, the nodes' tokens, each maqaf run's whole forms, the span store's cells); held to the bake below by
// count, against the forms its gloss layer says it glossed and left bare
const zoneKeys = (zone) => {
  const keys = new Set();
  const lists = wordListsOf(zone);
  for (const words of lists) for (const w of words) {
    if (w.w) w.w.forEach((r) => { if (r.k) keys.add(r.k); }); else if (w.k) keys.add(w.k);
    if (w.h) keys.add(w.h);
  }
  for (const n of zone.nodes || []) for (const t of [...(n.name_tokens || []), ...(n.part_tokens || [])]) if (t.k) keys.add(t.k);
  for (const words of lists) {
    let run = [];
    for (const w of words || []) {
      const pj = w.presentation_join;
      run.push(w);
      if (pj && pj.join_next_without_separator && String(pj.why || "").startsWith("maqaf-rule-v2")) continue;
      if (run.length > 1 && run.every((x) => x.k && !x.kq)) for (const f of formsOfRun(run.map((x) => x.k))) if (f.form !== "pieces") keys.add(f.key);
      run = [];
    }
  }
  for (const row of Object.values(zone.spans || {})) for (const c of cellsOf(row[0])) keys.add(c.surface);
  return keys;
};
// who carries a reading under a key, by M id, in a store
const idsCarrying = (st, k, text) => new Set(st.carriersOf(st.routesFor(k) || [], text).map((row) => String(row[3])));
// a credit (the ids behind a reading, or the label its chip names) that names a source shut whole
const namesShut = (ids, label) => ids.some((id) => SHUT_IDS.has(String(id))) || SHUT_LABELS.has(label);
// the ids a credit names that carry the reading in the store whole and in no row that rests open
const onShutRowsAlone = (k, text, ids) => {
  if (typeof text !== "string" || !storeAtRest) return [];
  const whole = idsCarrying(storeWhole, k, text), open = idsCarrying(storeAtRest, k, text);
  return ids.map(String).filter((id) => whole.has(id) && !open.has(id));
};
const k3 = { stamped: 0, whole: 0, stampFaults: [], countFaults: [], shutFaults: [], aloneFaults: [], rebuildFaults: [], sideFaults: [], headFaults: [],
  keys: 0, credits: 0, leaders: 0, sidecars: 0, bareAtRest: 0, rebuilt: 0, headwords: 0 };
if (!rule) side("K3  not judged: the record does not hold over the store's index (K1)");
if (storeAtRest && rule) {
  const files = readdirSync(ZONES).filter((x) => x.endsWith(".bin") && carriesReaderHebrew(x)).sort();
  for (const f of files) {
    const name = f.replace(/\.bin$/u, "");
    if (!judged(name)) continue;
    let zone;
    try { zone = gz(join(ZONES, f)); } catch { continue; }   // K1 has said it
    let rests;
    try { rests = restsOffIn(rec, zone); } catch { continue; }   // K1 has said it
    const said = (zone.emitted_from || {}).rests_off || null;
    // K3a: the stamp
    if (!rests) { if (said) k3.stampFaults.push(`${name} carries a stamp of the dictionaries that rest shut, and the record does not rest it shut`); }
    else {
      k3.stamped += 1;
      if (!said) k3.stampFaults.push(`${name} rests shut and carries no stamp: it was not baked at rest`);
      else {
        const off = [["rule", DICTIONARY_KINDS_RULE_ID], ["record", DICTIONARY_KINDS_RECORD], ["version", rec.version], ["sha256", kinds.sha256]].filter(([k, v]) => said[k] !== v).map(([k, v]) => `${k} ${JSON.stringify(said[k])} for ${JSON.stringify(v)}`);
        if (off.length) k3.stampFaults.push(`${name}'s stamp names another record: ${off.join(", ")}`);
        const want = rec.rests_off.map((e) => e.id), got = Object.keys(said.entries || {});
        if (JSON.stringify(want) !== JSON.stringify(got)) k3.stampFaults.push(`${name}'s stamp holds the entries ${got.join(", ") || "none"}, the record ${want.join(", ")}`);
      }
    }
    const fixture = /^fixture-/u.test(name);
    if (fixture || !zone.gloss) continue;
    // the zone's own keys, held to the bake by count
    const keys = zoneKeys(zone);
    const gl = (zone.emitted_from || {}).gloss_layer || {};
    if (keys.size !== Number(gl.distinct_forms_glossed) + Number(gl.distinct_forms_bare)) k3.countFaults.push(`${name}: ${keys.size} keys of its own, and its gloss layer glossed ${gl.distinct_forms_glossed} and left ${gl.distinct_forms_bare} bare`);
    k3.keys += keys.size;
    // K3b: what each resting entry holds shut on the zone's keys, and the keys bare at rest, recounted
    if (rests && said) {
      const entries = Object.fromEntries(rec.rests_off.map((e) => [e.id, { say: e.say, ids: {}, keys: 0, rows: 0 }]));
      for (const k of [...keys].sort()) {
        const met = new Set();
        for (const row of storeWhole.routesFor(k) || []) {
          const e = rule(row);
          if (!e) continue;
          const at = entries[e.id], m = String(row[3]);
          at.rows += 1;
          if (!met.has(e.id)) { met.add(e.id); at.keys += 1; }
          if (!met.has(`${e.id}\u0001${m}`)) { met.add(`${e.id}\u0001${m}`); at.ids[m] = (at.ids[m] || 0) + 1; }
        }
      }
      for (const [id, at] of Object.entries(entries)) {
        const theirs = (said.entries || {})[id] || {};
        const idsOff = JSON.stringify(Object.entries(at.ids).sort()) !== JSON.stringify(Object.entries(theirs.ids || {}).sort());
        if (at.say !== theirs.say || at.keys !== theirs.keys || at.rows !== theirs.rows || idsOff) k3.countFaults.push(`${name} ${id}: the stamp says ${theirs.rows} rows on ${theirs.keys} keys of ${Object.keys(theirs.ids || {}).length} ids, a recount ${at.rows} on ${at.keys} of ${Object.keys(at.ids).length}${at.say !== theirs.say ? `, and says «${theirs.say}» for «${at.say}»` : ""}`);
      }
    }
    // K3c and K3d: the columns' credits, on a zone at rest
    const credit = (k, text, m, what) => {
      if (!m || typeof m !== "object") return;
      k3.credits += 1;
      const ids = Array.isArray(m.by) ? m.by.map(String) : [];
      if (namesShut(ids, m.m)) k3.shutFaults.push(`${name} ${k}: ${what} credits «${String(text).slice(0, 40)}» to ${m.m || "?"} [${ids.join(" ")}], which the record rests shut`);
      const alone = onShutRowsAlone(k, text, ids);
      if (alone.length) k3.aloneFaults.push(`${name} ${k}: ${what} credits «${String(text).slice(0, 40)}» to ${alone.join(" ")}, whose only rows carrying it rest shut`);
      if (m.alt && typeof m.alt === "object") credit(k, m.alt.text, m.alt, `${what}'s alternate`);
    };
    if (rests) {
      for (const [k, m] of Object.entries(zone.gloss_m || {})) credit(k, zone.gloss[k], m, "the line");
      for (const [o, col] of Object.entries(zone.gloss_m_orders || {})) for (const [k, m] of Object.entries(col || {})) credit(k, ((zone.gloss_orders || {})[o] || {})[k], typeof m === "string" ? { m } : m, `the column ${o}`);
      const tbl = ((((zone.emitted_from || {}).toggles || {}).sources || {}).sources) || {};
      const inTable = Object.keys(tbl).filter((m) => SHUT_IDS.has(m));
      if (inTable.length) k3.shutFaults.push(`${name}: the switches' table prices ${inTable.join(" ")}, which the record rests shut`);
      const joint = ((((zone.emitted_from || {}).toggles || {}).sources || {}).joint || {}).sets || {};
      const inJoint = Object.keys(joint).filter((set) => set.split(/[\s,|]+/u).some((m) => SHUT_IDS.has(m)));
      if (inJoint.length) k3.shutFaults.push(`${name}: the switches' table prices ${inJoint.length} set(s) holding a source the record rests shut (${inJoint[0]})`);
      // K3g: the headword's reading a word carries (hg, the line under «the headword»; hm its source, by label), a
      // lattice card the projector lays on the word: none of a source shut whole, and none its source gives under the
      // headword only in rows that rest shut (the review of 15 November 2026: Genesis 19:25 read Hebrew WordNet's)
      const gives = (st, w) => (st.routesFor(w.h) || []).filter((r) => (mSources[r[3]] || {}).label === w.hm.m && String(r[1]) === w.hg).length;
      for (const words of wordListsOf(zone)) for (const w of words) {
        if (!w || typeof w.hg !== "string" || !w.hm || !w.h) continue;
        k3.headwords += 1;
        if (SHUT_LABELS.has(w.hm.m)) k3.headFaults.push(`${name} ${w.h}: the headword's reading «${w.hg.slice(0, 40)}» is ${w.hm.m}'s, which the record rests shut`);
        else if (gives(storeWhole, w) && !gives(storeAtRest, w)) k3.headFaults.push(`${name} ${w.h}: the headword's reading «${w.hg.slice(0, 40)}» is credited to ${w.hm.m}, which gives it only in rows that rest shut`);
      }
    }
    // K3e: the line rebuilt over the zone's own keys, of the store it was baked over
    {
      const st = rests ? storeAtRest : storeWhole;
      const names = zone.gloss_names || {};
      let wrong = 0, ex = "", bare = 0;
      for (const k of keys) {
        const g = st.glossFor(k);
        const baked = zone.gloss[k];
        const want = Object.prototype.hasOwnProperty.call(names, k) ? names[k] : g.text === null ? undefined : g.text;
        // a key bare at rest: the store whole reads it, and no row of it rests open
        if (rests && g.text === null && storeWhole.glossFor(k).text !== null) bare += 1;
        if (baked !== want) { wrong += 1; if (!ex) ex = `${k}: the zone «${String(baked).slice(0, 40)}», the store ${rests ? "at rest" : "whole"} «${String(want).slice(0, 40)}»`; }
      }
      const gm = glossMFor(st, zone.gloss).gloss_m;
      let gmWrong = 0, gmEx = "";
      for (const k of new Set([...Object.keys(gm), ...Object.keys(zone.gloss_m || {})])) if (JSON.stringify(gm[k]) !== JSON.stringify((zone.gloss_m || {})[k])) { gmWrong += 1; if (!gmEx) gmEx = k; }
      if (wrong) k3.rebuildFaults.push(`${name}: ${wrong} of ${keys.size} keys read otherwise than the store ${rests ? "at rest" : "whole"} (${ex})`);
      if (gmWrong) k3.rebuildFaults.push(`${name}: ${gmWrong} credits of the line are not the store's ${rests ? "at rest" : "whole"} (first ${gmEx})`);
      if (rests) {
        k3.bareAtRest += bare;
        const said = ((zone.emitted_from || {}).rests_off || {}).keys_bare_at_rest;
        if (said !== undefined && said !== bare) k3.countFaults.push(`${name}: the stamp says ${said} keys bare at rest, a recount ${bare}`);
      } else k3.whole += 1;
      k3.rebuilt += 1;
    }
    // K3f: the lattice sidecar
    const sp = join(ZONES, `${name}.lattice.bin`);
    if (existsSync(sp)) {
      const side = gz(sp);
      k3.sidecars += 1;
      if (!rests) { if (side.rests_off) k3.sideFaults.push(`${name}.lattice.bin names a record of what rests shut, and the record does not rest ${name} shut`); }
      else if (!side.rests_off || side.rests_off.sha256 !== kinds.sha256 || side.rests_off.version !== rec.version) k3.sideFaults.push(`${name}.lattice.bin ${side.rests_off ? `names the record at ${String(side.rests_off.sha256).slice(0, 12)}…` : "names no record of what rests shut"}: its leaders were not baked at rest under this one`);
      else {
        const leader = (k, l, what) => {
          if (!Array.isArray(l)) return;
          k3.leaders += 1;
          const ids = Array.isArray(l[4]) ? l[4].map(String) : [];
          if (namesShut(ids, l[1])) { k3.sideFaults.push(`${name} ${k}: the leader ${what} «${String(l[0]).slice(0, 40)}» is ${l[1]}'s, which the record rests shut`); return; }
          if (ids.length) {
            const open = idsCarrying(storeAtRest, k, l[0]);
            const lost = ids.filter((id) => !open.has(id));
            if (lost.length) k3.sideFaults.push(`${name} ${k}: the leader ${what} «${String(l[0]).slice(0, 40)}» names ${lost.join(" ")}, carrying it in no row that rests open`);
          } else if (!storeAtRest.carriersOf(storeAtRest.routesFor(k) || [], l[0]).some((row) => (mSources[row[3]] || {}).label === l[1])) k3.sideFaults.push(`${name} ${k}: the leader ${what} «${String(l[0]).slice(0, 40)}» is credited to ${l[1]}, which carries it in no row that rests open`);
        };
        for (const [surface, g] of Object.entries(side.grades || {})) {
          for (const [ch, l] of Object.entries(g.o || {})) leader(g.k, l, `${ch} of ${surface}`);
          for (const [tags, at] of Object.entries(g.e || {})) for (const ch of ["l", "la"]) leader(g.k, at && at[ch], `${ch} of ${surface} at ${tags}`);
          for (const [ref, at] of Object.entries(g.v || {})) leader(g.k, at && at.c, `c of ${surface} at ${ref}`);
        }
      }
    }
  }
  check("K3  every zone the record rests shut carries the bake's stamp naming this record, with its resting entries, and no other zone carries one", k3.stamped > 0 && k3.stampFaults.length === 0,
    k3.stampFaults.length ? `${nf(k3.stampFaults.length)} · ${first(k3.stampFaults)}` : `${k3.stamped} zones stamped at rest under ${rec.version} (${kinds.sha256.slice(0, 12)}…) · every other zone unstamped`);
  check("K3  each zone's own keys are the keys its bake asked, and its stamp says what each resting entry holds shut on them and how many keys went bare at rest, as a recount does", k3.countFaults.length === 0,
    k3.countFaults.length ? `${nf(k3.countFaults.length)} · ${first(k3.countFaults)}` : `${nf(k3.keys)} keys of ${k3.rebuilt} zones · ${nf(k3.bareAtRest)} keys bare at rest on the books at rest`);
  check("K3  on a zone at rest no column of the line names a source shut whole: the line's credit, carriers and alternate, every order column's (the witnessed ones too), the switches' table", k3.shutFaults.length === 0,
    k3.shutFaults.length ? `${nf(k3.shutFaults.length)} · ${first(k3.shutFaults)}` : `${nf(k3.credits)} credits read · ${SHUT_IDS.size} ids shut whole under ${SHUT_LABELS.size} labels${shutLabelShared.length ? ` (${shutLabelShared.length} label(s) an open source shares: ${shutLabelShared.join(", ")})` : ", none an open source shares"}`);
  check("K3  on a zone at rest no source a column credits carries the reading only in rows that rest shut (a category a source marks in its own data)", k3.aloneFaults.length === 0,
    k3.aloneFaults.length ? `${nf(k3.aloneFaults.length)} · ${first(k3.aloneFaults)}` : `${nf(k3.credits)} credits, each carried in a row that rests open`);
  check("K3  the line is the store's projection: rebuilt over each zone's own keys, its table and its credits are the store's at rest on a book the record rests shut, and the store's whole on any other", k3.rebuilt > 0 && k3.rebuildFaults.length === 0,
    k3.rebuildFaults.length ? `${nf(k3.rebuildFaults.length)} · ${first(k3.rebuildFaults)}` : `${k3.rebuilt} zones rebuilt: ${k3.rebuilt - k3.whole} at rest, ${k3.whole} whole (the works and commentaries the record does not rest shut keep today's rest)`);
  check("K3  every lattice sidecar of a book at rest names this record, and no leader it bakes names a source shut whole or stands on rows that rest shut alone; a sidecar of any other work names none", k3.sidecars > 0 && k3.sideFaults.length === 0,
    k3.sideFaults.length ? `${nf(k3.sideFaults.length)} · ${first(k3.sideFaults)}` : `${k3.sidecars} sidecars · ${nf(k3.leaders)} leaders read`);
  check("K3  on a zone at rest the headword's reading a word carries (hg, the line under «the headword») names no source shut whole and stands on a row of its source that rests open", k3.headFaults.length === 0,
    k3.headFaults.length ? `${nf(k3.headFaults.length)} · ${first(k3.headFaults)}` : `${nf(k3.headwords)} headword readings on the zones at rest, each its source's in a row that rests open`);
}

// ---- K4: the page at rest, in a browser -----------------------------------------------------------------------------
// The book: the first the door files that the record rests shut. The other: the first served work it does not. The
// words: found in the data, a plain word (gated-card-v1) whose key holds rows of a source shut whole that print a
// reading no row of the key that rests open prints, over the store whole; the first whose card holds something back
// is judged. The tree is served here, as a first visit finds it.
if (rule) {
  const served = zonesServed(ZONES);
  const order = (JSON.parse(readFileSync(join(READER, "data", "book-order-v1.json"), "utf8")).files || []).filter((b) => served.includes(b) && judged(b));
  const scopeOf = (w) => { try { return restsOffIn(rec, gz(join(ZONES, `${w}.bin`))); } catch { return null; } };
  const BOOK = order.find((b) => scopeOf(b) === true) || null;
  const OTHER = served.find((w) => judged(w) && scopeOf(w) === false) || null;
  // words of a work whose cards a shut source alone would print on, at most `most`
  const wordsOf = (w, most) => {
    const z = gz(join(ZONES, `${w}.bin`)), out = [];
    for (const [si, sec] of (z.sections || []).entries()) {
      const words = sec.words || [];
      for (const [e, x] of words.entries()) {
        if (out.length >= most) return out;
        if (!plainWord(words, e)) continue;
        const rows = (storeWhole.routesFor(x.k) || []).filter((r) => mSources[r[3]]);
        const open = new Set(rows.filter((r) => !rule(r)).flatMap((r) => storeWhole.readingsOf(r).map(readingKey)));
        const only = new Set(rows.filter((r) => SHUT_IDS.has(String(r[3]))).flatMap((r) => storeWhole.readingsOf(r).map(readingKey)).filter((t) => !open.has(t)));
        if (only.size) out.push({ section: si, entry: e, label: String(sec.label ?? ""), k: x.k, only: only.size });
      }
    }
    return out;
  };
  // the sources off for a reader who has set nothing: the record of defaults, over the store's index and the overlays'
  const overlayIx = existsSync(join(READER, "data", "overlays")) ? readdirSync(join(READER, "data", "overlays")).sort().map((d) => join(READER, "data", "overlays", d, "index.json")).filter(existsSync).map((f) => JSON.parse(readFileSync(f, "utf8"))) : [];
  const OFF_AT_REST = [...restingOff(READER, [index, ...overlayIx])].sort();
  const IDS = restsOffIds(rec, mSources);
  if (!BOOK) check("K4  the page at rest", false, "no book the door files rests shut on this shelf");
  else {
    const picks = wordsOf(BOOK, 8), others = OTHER ? wordsOf(OTHER, 4) : [];
    const tree = await serveTree(READER);
    const pw = await loadPlaywright();
    const browser = await pw.chromium.launch(launchOptions());
    const errors = [];
    try {
      const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
      const p = await ctx.newPage();
      p.on("pageerror", (e) => errors.push(String(e && e.message)));
      // where the page says it stands: the switch, the record, the reader's sources, the live asks, the rail
      const stateOf = () => p.evaluate(() => {
        const tok = document.querySelector('#railNow [data-toggle="sources"]');
        const k = document.getElementById("kindsRow");
        const kept = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
        return { kinds: window.__kinds || null, here: !!window.__kindsHere, failed: window.__kindsFailed ? String(window.__kindsFault || "failed") : null,
          ids: window.__restsOffIds || null, version: window.__kindsVersion || null, off: [...(window.__sourcesOff || [])].map(String).sort(),
          kept: kept("fh.kinds"), keptOff: kept("fh.sources.off"), live: window.__liveLines || 0, pending: window.__livePending || 0,
          railText: tok ? tok.textContent : null, railTitle: tok ? tok.title : null,
          block: k ? { hidden: !!k.hidden, chips: [...k.querySelectorAll(".kind-chip")].map((c) => ({ key: c.dataset.key || "", ids: (c.dataset.ids || "").split(" ").filter(Boolean), disabled: c.disabled, cls: c.className })),
            opts: Object.fromEntries([...k.querySelectorAll(".kinds-opt")].map((b) => [b.dataset.kinds, b.getAttribute("aria-pressed")])) } : null,
          reset: (() => { const r = document.getElementById("resetPill"); return r ? !!r.disabled : null; })() };
      });
      const settle = async () => {
        await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
        await p.waitForFunction(() => (window.__livePending || 0) === 0, null, { timeout: 30000 }).catch(() => {});
        await p.waitForTimeout(400);
      };
      // a word pressed as a reader presses it, and the card it opens, read: its pills [text, carriers, dotted], what it
      // holds back, and the press on its withheld line
      const pressWord = (pick) => p.evaluate(async ({ section, entry }) => {
        const hud = document.getElementById("hud");
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        const wb = (document.querySelectorAll("section.seg")[section] || document.body).querySelectorAll(".he-text .wb")[entry];
        if (!wb) return false;
        (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
        const t0 = performance.now();
        const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
        while (!settled() && performance.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 25));
        return settled() && !wb.closest(".wjoin");
      }, pick);
      // sw: the press the withheld line carries, in the record's words; seen: the presses a reader can press, each
      // the topmost thing at its own middle, inside the window (a press a tight card folds, or a band clips, is not)
      const cardNow = () => p.evaluate(() => {
        const hud = document.getElementById("hud");
        const pills = hud.querySelector(":scope > .rows > .b-read > .r-pills");
        const sw = hud.querySelector(".withheld-line .kinds-switch");
        const seen = [...hud.querySelectorAll(".kinds-switch")].filter((x) => {
          const r = x.getClientRects()[0];
          if (!r || !r.height || r.top < 0 || r.bottom > window.innerHeight) return false;
          const at = document.elementFromPoint(r.left + Math.min(r.width, 8) / 2, r.top + r.height / 2);
          return !!at && (at === x || x.contains(at));
        }).map((x) => ({ text: x.textContent, pressed: x.getAttribute("aria-pressed"), where: x.closest(".r-label") ? "label" : x.closest(".withheld-line") ? "line" : "other", focused: document.activeElement === x }));
        return { pills: pills ? [...pills.querySelectorAll(":scope > button")].map((x) => [x.textContent, x.dataset.by || "", x.dataset.rests || ""]) : [],
          held: pills ? Number(pills.dataset.kindWithheld || 0) : 0, sw: sw ? { text: sw.textContent, pressed: sw.getAttribute("aria-pressed") } : null,
          seen, tight: hud.classList.contains("tight") };
      });
      // the press a reader can press, pressed as a reader presses it (the withheld line's where none is seen)
      const pressSeen = () => p.evaluate(() => {
        const all = [...document.querySelectorAll("#hud .kinds-switch")];
        const b = all.find((x) => x.getClientRects().length) || all[0];
        if (b) b.click();
      });
      // a fresh reader, the whole book built
      await p.goto(`${tree.base}/zone.html?b=${BOOK}`, { waitUntil: "networkidle" });
      await settle();
      const s0 = await stateOf();
      await p.evaluate(() => window.__materialise(0));
      await settle();
      const sAll = await stateOf();
      const idsSame = JSON.stringify(s0.ids) === JSON.stringify(IDS);
      check(`K4  ${BOOK}, a fresh reader: the dictionaries shut, the page's ids and version the record's, the sources off exactly as the record of defaults rests them, and no word asked live at first paint or with the whole book built`,
        s0.kinds === "shut" && s0.here && !s0.failed && idsSame && s0.version === rec.version && JSON.stringify(s0.off) === JSON.stringify(OFF_AT_REST) && s0.live === 0 && sAll.live === 0 && sAll.pending === 0,
        `__kinds ${s0.kinds} · acting here ${s0.here}${s0.failed ? ` · the record failed: ${s0.failed}` : ""} · ${(s0.ids || []).length} ids shut whole${idsSame ? ", the record's" : `, the record gives ${IDS.length}`} · version ${s0.version} · sources off ${s0.off.join(" ") || "none"} (the record of defaults: ${OFF_AT_REST.join(" ") || "none"}) · live asks ${s0.live} at first paint, ${sAll.live} with every section built`);
      // the card at rest, and the press; a reading the press brought, which the other work's search is asked below
      let pick = null, rest = null, heldReading = null;
      for (const c of picks) {
        if (!(await pressWord(c))) continue;
        const got = await cardNow();
        if (got.held > 0) { pick = c; rest = got; break; }
      }
      if (!pick) check("K4  a card at rest holds back what rests shut and says so with a press", false, `none of the ${picks.length} word(s) found in ${BOOK} whose shut sources alone print a reading holds anything back on its card`);
      else {
        const aloneShut = rest.pills.filter(([, by]) => { const ids = by.split(/[\s,]+/u).filter(Boolean); return ids.length && ids.every((id) => SHUT_IDS.has(id)); });
        check(`K4  ${BOOK} ${pick.label}, entry ${pick.entry}: the card at rest shows no pill that stands on sources shut whole alone, and says on its withheld line how many it holds back, with a press not pressed`,
          !aloneShut.length && !!rest.sw && rest.sw.pressed === "false" && /\bshow$/u.test(rest.sw.text) && rest.held > 0,
          `${rest.pills.length} pills · ${aloneShut.length ? `${aloneShut.length} stand on shut sources alone (${aloneShut.slice(0, 2).map((x) => `«${x[0]}» [${x[1]}]`).join(", ")})` : "none on shut sources alone"} · holds back ${rest.held} · «${rest.sw ? rest.sw.text : "no press"}» pressed ${rest.sw ? rest.sw.pressed : "-"}`);
        // the press is where a reader can press it, whatever the fit folds (the review of 15 November 2026: at
        // 412 by 915 it stood on screen on 4 of Obadiah 1:1-6's 52 cards, the others tight, the withheld line folded)
        const sayPress = (c) => `${c.tight ? "a tight card" : "a card not tight"}; ${c.seen.length ? c.seen.map((x) => `«${x.text}» on the ${x.where}${x.focused ? ", holding the focus" : ""}`).join(", ") : "no press a reader can press"}`;
        check("K4  the card at rest shows one press a reader can press, on screen: on a tight card in the readings' label, which the fit keeps, else on the withheld line",
          rest.seen.length === 1 && rest.seen[0].where === (rest.tight ? "label" : "line") && rest.seen[0].pressed === "false" && /\bshow$/u.test(rest.seen[0].text),
          sayPress(rest));
        await pressSeen();
        await p.waitForFunction(() => { const b = document.querySelector("#hud .kinds-switch"); return !!b && b.getAttribute("aria-pressed") === "true"; }, null, { timeout: 15000 }).catch(() => {});
        await p.waitForTimeout(500);
        const opened = await cardNow();
        const s1 = await stateOf();
        const wasKey = new Set(rest.pills.map(([t]) => readingKey(t)));
        const brought = opened.pills.filter(([t]) => !wasKey.has(readingKey(t)));
        heldReading = brought.length ? brought[0][0] : null;
        check("K4  one press opens them: exactly as many pills come as it held back, each wearing the dotted edge, the press says it stands open, and the device keeps it for this record's version",
          !!opened.sw && opened.sw.pressed === "true" && brought.length === rest.held && brought.every(([, , dotted]) => dotted === "1") && s1.kinds === "open" && s1.kept === `open@${rec.version}`,
          `${brought.length} pills came for ${rest.held} held back (${brought.slice(0, 4).map(([t, by]) => `«${t.slice(0, 30)}» [${by}]`).join(", ")}${brought.length > 4 ? ", …" : ""}) · ${brought.filter(([, , d]) => d === "1").length} dotted · «${opened.sw ? opened.sw.text : "no press"}» pressed ${opened.sw ? opened.sw.pressed : "-"} · __kinds ${s1.kinds} · kept ${s1.kept}`);
        // and the card built again shows its press, which holds the focus the press had: a «show» that made the card
        // tight folded its own «hide» away, and the focus fell to the page (the review of 15 November 2026)
        check("K4  after the press, the card built again shows its press, pressed, where a reader can press it, and it holds the focus",
          opened.seen.length === 1 && opened.seen[0].where === (opened.tight ? "label" : "line") && opened.seen[0].pressed === "true" && opened.seen[0].focused,
          sayPress(opened));
        await p.reload({ waitUntil: "networkidle" });
        await settle();
        const s2 = await stateOf();
        check("K4  a reload keeps them open, and the rail's chips are switches", s2.kinds === "open" && !!s2.block && s2.block.opts.open === "true" && s2.block.chips.length > 0 && s2.block.chips.every((c) => !c.disabled),
          `__kinds ${s2.kinds} · the rail's switch ${s2.block ? JSON.stringify(s2.block.opts) : "absent"} · ${s2.block ? s2.block.chips.filter((c) => !c.disabled).length : 0} of ${s2.block ? s2.block.chips.length : 0} chips switch`);
        const wasReset = s2.reset;
        if (s2.reset === false) { await p.click("#resetPill"); await p.waitForTimeout(1500); }
        const s3 = await stateOf();
        check("K4  reset shuts them again and leaves the reader's own source switches as they were", wasReset === false && s3.kinds === "shut" && s3.kept === "shut" && JSON.stringify(s3.off) === JSON.stringify(s2.off) && s3.keptOff === s2.keptOff && s3.reset === true,
          `the reset pill ${wasReset === false ? "pressed" : "could not be pressed"} · __kinds ${s3.kinds} · kept ${s3.kept} · sources off ${s3.off.join(" ") || "none"} (were ${s2.off.join(" ") || "none"}) · the reset pill now ${s3.reset ? "at its default" : "still pressable"}`);
        // the rail's block: one chip per source key the stamp holds shut whole on this book, all shut while shut
        const stamp = (gz(join(ZONES, `${BOOK}.bin`)).emitted_from || {}).rests_off || {};
        const wantKeys = new Set();
        for (const e of rec.rests_off.filter((x) => !x.fact)) for (const [m, n] of Object.entries(((stamp.entries || {})[e.id] || {}).ids || {})) if (n > 0 && mSources[m]) wantKeys.add(mSources[m].key);
        const chips = s3.block ? s3.block.chips : [];
        const chipKeys = new Set(chips.map((c) => c.key));
        const keysSame = chipKeys.size === wantKeys.size && [...wantKeys].every((k) => chipKeys.has(k));
        check("K4  the rail's block stands with one chip per source the stamp holds shut whole on the book, each shut and switching nothing while shut, never a source chip of the strip",
          !!s3.block && !s3.block.hidden && s3.block.opts.shut === "true" && chips.length > 0 && keysSame && chips.every((c) => c.disabled && c.ids.length && c.ids.every((id) => SHUT_IDS.has(id)) && !/\bdfp\b/u.test(c.cls)),
          s3.block ? `${chips.length} chips (${chips.filter((c) => c.disabled).length} shut) for ${wantKeys.size} keys the stamp holds${keysSame ? "" : `; the chips' keys ${[...chipKeys].slice(0, 4).join(", ")} …`}` : "no block on the rail");
        const offN = (/(\d+) off\b/u.exec(s3.railText || "") || [])[1];
        const shutN = (/(\d+) more rest shut/u.exec(s3.railTitle || "") || [])[1];
        check("K4  the rail's line counts as off only the reader's own switches, and its title says how many more rest shut",
          s3.railText !== null && Number(offN || 0) === s3.off.length && !/shut/u.test(s3.railText) && Number(shutN) === chips.length,
          `«${String(s3.railText).trim()}» · title «${String(s3.railTitle).slice(-80)}»`);
        // the rail's switch from the keyboard: each press draws the block anew, and the focus stays on the switch the
        // reader stands on (the review of 15 November 2026: it fell to the page on every press, at 1280, 412 and 320)
        await p.evaluate(() => { const t = document.querySelector('#railNow [data-toggle="sources"]'); if (t) t.click(); });
        await p.waitForTimeout(800);
        const byKey = async (id) => {
          const took = await p.evaluate((x) => { const b = document.querySelector(`#kindsRow .kinds-opt[data-kinds="${x}"]`); if (!b) return false; b.focus(); return document.activeElement === b; }, id);
          if (took) { await p.keyboard.press("Enter"); await p.waitForTimeout(1200); }
          return p.evaluate((x) => { const a = document.activeElement; return { took: !!a, on: a && a.classList && a.classList.contains("kinds-opt") ? a.dataset.kinds : a === document.body ? "the page" : `${a.tagName.toLowerCase()}.${a.className}`, kinds: window.__kinds, want: x }; }, id).then((r) => ({ ...r, took }));
        };
        const kOpen = await byKey("open"), kShut = await byKey("shut");
        check("K4  the rail's switch pressed from the keyboard opens and shuts them, and the focus stays on the switch pressed",
          kOpen.took && kOpen.kinds === "open" && kOpen.on === "open" && kShut.took && kShut.kinds === "shut" && kShut.on === "shut",
          [kOpen, kShut].map((r) => `«${r.want}» ${r.took ? `pressed: __kinds ${r.kinds}, the focus on ${r.on === r.want ? `«${r.on}»` : r.on}` : "could not take the focus"}`).join(" · "));
        // A FOCUS OWED TO NO CARD. A reading the press brought, pressed, and the press then shut again: the sections are
        // laid again and the card closes, so no card is built under the press, and the next card a reader opens with a
        // pointer keeps the focus where it was: its own press does not take it, where a Space would open them (the
        // review of 15 November 2026: Genesis 1:22's fifth word, «Peru», then 1:28's seventh). Asked in a tall window,
        // where a card is seldom tight and its press, on the withheld line, could take the focus at all
        await p.setViewportSize({ width: 1600, height: 2400 });
        await p.waitForTimeout(500);
        let pick2 = null;
        for (const c of picks) {
          if (c === pick || !(await pressWord(c))) continue;
          if ((await cardNow()).held > 0) { pick2 = c; break; }
        }
        if (!pick2) side(`K4  a focus owed to no card not judged: no second word of ${BOOK} found holds anything back`);
        else {
          await pressWord(pick);
          await pressSeen();
          await p.waitForFunction(() => { const b = document.querySelector("#hud .kinds-switch"); return !!b && b.getAttribute("aria-pressed") === "true"; }, null, { timeout: 15000 }).catch(() => {});
          await p.waitForTimeout(500);
          const brought = await p.evaluate(() => { const x = document.querySelector('#hud .r-pills > button[data-rests="1"]'); if (!x) return null; x.click(); return x.textContent; });
          await p.waitForTimeout(800);
          await pressSeen();
          await p.waitForTimeout(1500);
          const shut = await p.evaluate(() => ({ kinds: window.__kinds, card: !document.getElementById("hud").hidden }));
          await p.mouse.click(2, 2);
          await pressWord(pick2);
          await p.waitForTimeout(600);
          const after = await p.evaluate(() => { const a = document.activeElement; return { onPress: !!(a && a.classList && a.classList.contains("kinds-switch")), on: a === document.body ? "the page" : a ? `${a.tagName.toLowerCase()}.${a.className}` : "nothing" }; });
          check(`K4  a reading the press brought, pressed, then shut away with its card: the next card a reader opens (${pick2.label}, entry ${pick2.entry}, at 1600 by 2400) does not take the focus to its press`,
            !!brought && shut.kinds === "shut" && !after.onPress,
            `«${brought ? brought.slice(0, 30) : "no dotted pill"}» pressed · shut again: __kinds ${shut.kinds}, the card ${shut.card ? "still open" : "closed"} · the next card's focus: ${after.on}`);
        }
      }
      await ctx.close();
      // the other work: nothing of the kinds drawn, and a shut source's pill still stands there
      if (!OTHER) side("K4  the other work not judged: every served work rests shut");
      else {
        const ctx2 = await browser.newContext({ viewport: { width: 412, height: 915 } });
        const q = await ctx2.newPage();
        q.on("pageerror", (e) => errors.push(String(e && e.message)));
        await q.goto(`${tree.base}/zone.html?b=${OTHER}`, { waitUntil: "networkidle" });
        await q.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
        await q.waitForTimeout(600);
        const t0 = await q.evaluate(() => ({ here: !!window.__kindsHere, ids: (window.__restsOffIds || []).length, failed: !!window.__kindsFailed, block: (() => { const k = document.getElementById("kindsRow"); return !!k && !k.hidden; })() }));
        await q.evaluate(() => window.__materialise(0));
        await q.waitForTimeout(600);
        let seen = null;
        for (const c of others) {
          const ok = await q.evaluate(async ({ section, entry }) => {
            const hud = document.getElementById("hud");
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
            const wb = (document.querySelectorAll("section.seg")[section] || document.body).querySelectorAll(".he-text .wb")[entry];
            if (!wb) return null;
            (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
            const t1 = performance.now();
            const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
            while (!settled() && performance.now() - t1 < 20000) await new Promise((r) => setTimeout(r, 25));
            const pills = hud.querySelector(":scope > .rows > .b-read > .r-pills");
            return { held: pills ? Number(pills.dataset.kindWithheld || 0) : 0, sw: !!hud.querySelector(".kinds-switch"), pills: pills ? [...pills.querySelectorAll(":scope > button")].map((x) => x.dataset.by || "") : [] };
          }, c);
          if (!ok) continue;
          const alone = ok.pills.filter((by) => { const ids = by.split(/[\s,]+/u).filter(Boolean); return ids.length && ids.every((id) => SHUT_IDS.has(id)); }).length;
          seen = { c, ...ok, alone };
          if (alone) break;
        }
        check(`K4  ${OTHER}, which the record does not rest shut: nothing of them is drawn, no switch, no count, they do not act there, and a pill a source shut elsewhere carries alone still stands on its card`,
          !t0.here && !t0.failed && !t0.block && !!seen && seen.held === 0 && !seen.sw && seen.alone > 0,
          `acting here ${t0.here} · the rail's block ${t0.block ? "drawn" : "not drawn"}${seen ? ` · ${seen.c.label}, entry ${seen.c.entry}: holds back ${seen.held}, ${seen.sw ? "a press drawn" : "no press"}, ${seen.alone} pill(s) of shut sources alone stand` : ` · none of the ${others.length} word(s) found opened a card`}`);
        // ITS SEARCH IS THE BOOKS' SEARCH. Every place the index answers is of a book the record rests shut, so on this
        // work too the search leaves out the sources shut whole while they stand shut, and a reading the book's card
        // held back is answered here exactly as on the book's own page (the review of 15 November 2026: «peru» on the
        // Tikkunei Zohar's page found Genesis 1:22's word by ConceptNet and OmegaWiki, a card that held them back)
        if (!heldReading) side(`K4  ${OTHER}'s search not judged: no reading was brought by the press on ${BOOK}`);
        else {
          const askSearch = async (work) => {
            await q.goto(`${tree.base}/zone.html?b=${work}`, { waitUntil: "networkidle" });
            await q.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
            await q.fill("#searchIn", heldReading);
            await q.waitForFunction(() => { const o = document.getElementById("searchOut"); return !!o && !o.hidden && o.children.length > 0; }, null, { timeout: 20000 }).catch(() => {});
            await q.waitForTimeout(800);
            return q.evaluate(() => ({ ids: (window.__restsOffIds || []).length, out: (document.getElementById("searchOut") || {}).textContent.replace(/\s+/gu, " ").trim() }));
          };
          const atBook = await askSearch(BOOK), atOther = await askSearch(OTHER);
          check(`K4  ${OTHER}'s search answers «${heldReading.slice(0, 40)}», which ${BOOK}'s card held back as shut, as ${BOOK}'s own search does: the sources shut whole are left out of it there too`,
            !!atBook.out && atBook.out === atOther.out && atOther.ids === IDS.length,
            `${BOOK}: «${atBook.out.slice(0, 120)}» · ${OTHER}: «${atOther.out.slice(0, 120)}»${atBook.out === atOther.out ? " (the same)" : ""} · ${atOther.ids} ids shut whole named on ${OTHER}`);
        }
        await ctx2.close();
      }
      // a word of the Targum beside a book at rest: its sidecar is one the record's scope leaves whole (a
      // ZONE_COMMENTARY_V2 zone carries no stamp), so its line was baked over the store whole, and its card keeps
      // today's rest with it: nothing held back, no press, no dotted pill, and the reading its line reads a pill of
      // it. The page gated such a card by its book's stamp, and the line read what the card held back as shut (the
      // review of 15 November 2026: at Obadiah 1:1 the Targum's word read «pronominal possessive enclitics», Wikidata's,
      // under a card that said it was shut; 3,465 keys at 6,462 word places over the 21 sidecars)
      const TBOOK = order.find((b) => scopeOf(b) === true && existsSync(join(ZONES, `${b}.commentary.bin`))) || null;
      if (!TBOOK) side("K4  a Targum's word not judged: no book at rest on this shelf carries a Targum beside it");
      else {
        const cz = gz(join(ZONES, `${TBOOK}.commentary.bin`));
        // the keys whose line stands on sources shut whole alone: what a gated card would hold back, every reading of it
        const tkeys = Object.entries(cz.gloss_m || {}).filter(([k, m]) => cz.gloss && cz.gloss[k] && m && Array.isArray(m.by) && m.by.length && m.by.every((id) => SHUT_IDS.has(String(id)))).map(([k]) => k);
        const ctx3 = await browser.newContext({ viewport: { width: 412, height: 915 } });
        const t = await ctx3.newPage();
        t.on("pageerror", (e) => errors.push(String(e && e.message)));
        await t.goto(`${tree.base}/zone.html?b=${TBOOK}&commentary=on`, { waitUntil: "networkidle" });
        await t.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
        await t.evaluate(() => window.__materialise(0));
        await t.waitForTimeout(600);
        // every section's Targum drawn, as its own switch draws it
        await t.evaluate(() => { const c = document.getElementById("layerC"); if (c && c.getAttribute("aria-pressed") !== "true") { c.hidden = false; c.click(); } });
        await t.waitForTimeout(1500);
        await t.evaluate(() => window.__materialise(0));
        await t.waitForTimeout(800);
        const tw = await t.evaluate(async (keys) => {
          const want = new Set(keys);
          const bare = (s) => String(s || "").replace(/[\u0591-\u05c7]/gu, "");
          const wb = [...document.querySelectorAll(".c-inline .wb")].find((x) => want.has(bare((x.querySelector(".w") || {}).textContent)));
          if (!wb) return null;
          const g = wb.querySelector(".g") ? wb.querySelector(".g").cloneNode(true) : null;
          if (g) for (const lic of g.querySelectorAll(".g-lic")) lic.remove();
          const hud = document.getElementById("hud");
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          wb.scrollIntoView({ block: "center" });
          (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
          const t1 = performance.now();
          const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
          while (!settled() && performance.now() - t1 < 20000) await new Promise((r) => setTimeout(r, 25));
          const pills = hud.querySelector(":scope > .rows > .b-read > .r-pills");
          return { k: bare((wb.querySelector(".w") || {}).textContent), line: g ? g.textContent.trim() : "", held: pills ? Number(pills.dataset.kindWithheld || 0) : 0,
            press: !!hud.querySelector(".kinds-switch"), dotted: pills ? pills.querySelectorAll(':scope > button[data-rests="1"]').length : 0,
            pills: pills ? [...pills.querySelectorAll(":scope > button")].map((x) => x.textContent) : [] };
        }, tkeys);
        check(`K4  ${TBOOK}'s Targum, a sidecar the record leaves whole: a word's card on the book at rest keeps today's rest, holding nothing back, with no press and no dotted pill, and the reading its line reads is a pill of its card`,
          !!tw && tw.held === 0 && !tw.press && tw.dotted === 0 && tw.pills.includes(tw.line),
          tw ? `«${tw.k}», its line «${tw.line}» (shut sources alone) ${tw.pills.includes(tw.line) ? "stands on its card" : "is no pill of its card"} · holds back ${tw.held} · ${tw.press ? "a press drawn" : "no press"} · ${tw.dotted} dotted of ${tw.pills.length} pills`
            : `none of the ${tkeys.length} key(s) whose line stands on shut sources alone was found among the Targum's words drawn`);
        await ctx3.close();
      }
      check("K4  the pages threw nothing", errors.length === 0, errors.slice(0, 2).join(" | "));
    } finally { await browser.close().catch(() => {}); await tree.close(); }
  }
}

// ---- K5: the records of the resting lines, and the chain books ----------------------------------------------------
{
  const recFaults = [], chainFaults = [];
  let records = 0, lines = 0, atRestRecs = 0;
  const scopeOf = new Map();
  for (const w of zonesServed(ZONES).filter(judged)) { try { scopeOf.set(w, restsOffIn(rec, gz(join(ZONES, `${w}.bin`)))); } catch { /* K1 has said it */ } }
  for (const [w, rests] of scopeOf) {
    const r = readRecord(recordPath(READER, w));
    if (!r) { recFaults.push(`${w}: no record of its resting lines`); continue; }
    records += 1;
    const files = (r.read_off && r.read_off.files) || {};
    if (files[DICTIONARY_KINDS_RECORD] !== kinds.sha256) recFaults.push(`${w}: its page read ${files[DICTIONARY_KINDS_RECORD] ? `the record of what rests shut at ${String(files[DICTIONARY_KINDS_RECORD]).slice(0, 12)}…` : "no record of what rests shut"}`);
    const state = (r.read_off && r.read_off.state) || {};
    const want = rests ? "shut" : null;
    if (!Object.prototype.hasOwnProperty.call(state, "kinds") || state.kinds !== want) recFaults.push(`${w}: read with the dictionaries that rest shut ${JSON.stringify(state.kinds)}, and ${rests ? "the record rests it shut" : "the record does not rest it shut, so they do not act there (null)"}`);
    if (!rests) continue;
    atRestRecs += 1;
    for (const [label, units] of r.sections || []) for (const [first0, , text, credited] of units) {
      lines += 1;
      const ids = String(credited).split(" ").filter(Boolean);
      if (ids.some((id) => SHUT_IDS.has(id))) recFaults.push(`${w} ${label} entry ${first0}: «${String(text).slice(0, 40)}» is credited to ${ids.join(" ")}, which the record rests shut`);
    }
    for (const u of r.unnamed || []) if (SHUT_LABELS.has(u[2])) recFaults.push(`${w}: a line is credited by the label ${u[2]}, which the record rests shut`);
  }
  check("K5  every record of the resting lines names this record among the files its page read, says the dictionaries were shut where the record rests the work shut and not acting elsewhere, and credits no line to a source shut whole", records > 0 && recFaults.length === 0,
    recFaults.length ? `${nf(recFaults.length)} · ${first(recFaults)}` : `${records} records · ${atRestRecs} read with the dictionaries shut, ${nf(lines)} lines, none credited to a source shut whole`);
  const { chainedBooks, CHAIN_FILE, CHAIN_SHORT } = await import("./build-chain-book-v2.mjs");
  const CHAIN = join(READER, "..", "chain");
  const books = chainedBooks(CHAIN).filter(judged);
  // the chain names a source by the fingerprint of its label, taken here with node's own sha256
  const short = (x) => createHash("sha256").update(String(x), "utf8").digest("hex").slice(0, CHAIN_SHORT);
  const shutShorts = new Set([...SHUT_LABELS].filter((l) => !shutLabelShared.includes(l)).map(short));
  let restPills = 0, liftedShut = 0, booksRead = 0;
  for (const b of books) {
    const c = JSON.parse(gunzipSync(readFileSync(join(CHAIN, b, CHAIN_FILE))).toString("utf8"));
    booksRead += 1;
    const rests = scopeOf.get(b);
    const st = (c.read_off && c.read_off.states) || {};
    const restPage = (st.rest || {}).page || {}, liftedPage = (st.lifted || {}).page || {};
    if (restPage.kinds !== (rests ? "shut" : null)) chainFaults.push(`${b}: its cards at rest were read with the dictionaries that rest shut ${JSON.stringify(restPage.kinds)}`);
    if (liftedPage.kinds !== (rests ? "open" : null)) chainFaults.push(`${b}: its cards lifted were read with the dictionaries that rest shut ${JSON.stringify(liftedPage.kinds)}, not ${rests ? "open" : "null"}`);
    if (!rests) continue;
    const alone = (pill) => { const by = Array.isArray(pill.by) && pill.by.length ? pill.by : [pill.s]; return by.length > 0 && by.every((x) => shutShorts.has(x)); };
    let restAlone = 0, liftedAlone = 0;
    for (const sec of c.sections || []) for (const cell of sec.cells || []) {
      for (const [which, card] of [["rest", cell.rest], ["lifted", cell.lifted]]) {
        if (!card || card.pool === null || card.pool === undefined) continue;
        for (const pill of c.pools[card.pool] || []) {
          if (which === "rest") restPills += 1;
          if (!alone(pill)) continue;
          if (which === "rest") restAlone += 1; else liftedAlone += 1;
        }
      }
    }
    liftedShut += liftedAlone;
    if (restAlone) chainFaults.push(`${b}: ${restAlone} pills of its cards at rest stand on sources the record rests shut whole, alone`);
    const zone = gz(join(ZONES, `${b}.bin`));
    const held = (((zone.emitted_from || {}).rests_off || {}).entries || {});
    const wholeRows = rec.rests_off.filter((e) => !e.fact).reduce((n, e) => n + Number((held[e.id] || {}).rows || 0), 0);
    if (wholeRows && !liftedAlone) chainFaults.push(`${b}: its stamp holds ${wholeRows} rows of sources shut whole, and no card of it lifted holds a pill of theirs alone`);
  }
  if (!books.length) side("K5  the chain books not judged: no chain book on this shelf", CHAIN);
  else check("K5  every chain book's cards at rest were read with the dictionaries shut and lifted with them open, and no pill at rest stands on sources shut whole alone; lifted, such pills are back", chainFaults.length === 0,
    chainFaults.length ? `${nf(chainFaults.length)} · ${first(chainFaults)}` : `${booksRead} chain books · ${nf(restPills)} pills at rest · ${nf(liftedShut)} pills lifted that sources shut whole alone carry`);
}

console.log(bad ? `\n${bad} FAILED` : k2Unjudged ? "\nSKIPPED — K1 holds; K2 is not judged until the page carries the rule, and a law not judged is not passed" : "\nall checks passed");
process.exit(bad ? 1 : k2Unjudged ? 3 : 0);
