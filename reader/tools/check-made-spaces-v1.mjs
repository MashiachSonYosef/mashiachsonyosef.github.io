#!/usr/bin/env node
// RUN: tree
// GUARDS: made-spaces-rule-v1-a-space-our-build-put-where-a-tag-stood-closes-at-print-as-the-corpus-lanes-list-names-it
// LEDGER: -
// no frame letter. A check reads the lists, the store and the pages and
// judges them; it is not the ledger for one.
//
// A SPACE OUR OWN BUILD MADE CLOSES WHERE A TEXT PRINTS, AND NOTHING ELSE
// MOVES. The store served «Amos , an Israelite prophet» where the provider's
// file holds «Amos, an Israelite prophet»: our build put a space where each
// tag of the provider's XML stood. The corpus lane traces every such space,
// source by source, and lists the places that close (data/made-spaces/, one
// folder per relay with its rule and its receipt; PIN.json names them).
// tools/apply-made-spaces-v1.mjs writes those places on the rows, in slot 9,
// and the readers leave the characters there out when they print. The
// store's texts are not touched.
//
// What is held here, each recomputed and none read from the tool's receipt:
//
//   M1  every relay's lists, its rule, its receipt and its never-closed files
//       are the bytes their pin names; the receipt of the same relay names
//       each file by the same sha256 and gives each list its source, which
//       the store holds under that m id, key and label; no source has two
//   M2  every line is well formed: its closes are spaces of its text, in
//       rising order; its `prints` is the text with them taken out; a kept
//       place is a space that does not close. A never-closed line's places
//       are spaces of its text, or its start or end, and no list closes a
//       space that stands for words taken out
//   M3  every row of the store, read again from the lists: a row of a listed
//       source whose route text or definition text is a line with a close
//       carries exactly those places in slot 9, and no other row carries the
//       slot; no row carries a print slot and a close on its route text; no
//       close stands at a mark its ledger divides at; the span store's rows
//       of the listed sources hold no close
//   M4  the store's index names the rule, the pin, the relays, the lists and
//       the never-closed files, each source's rows as they stand now (the
//       sha256 of their keys and texts) and totals that are a recount's; and
//       it says a source's rows are the rows its list was read from exactly
//       where they stand as they stood when a run found them so (the second
//       sha256 it keeps)
//   M5  the corpus lane's own counts, for each source whose rows are the rows
//       its list was read from: the rows that hold a close, and the rows
//       that still print a space before a comma once closed (the provider's
//       own spaces and the spaces that stand for words taken out, which are
//       never touched). The rows are those rows where the store's own history
//       shows no move but this rule's since the version the relay read, or
//       where they hold the texts the index recorded when that was so. For a
//       source whose rows have moved on, the counts are said and not judged.
//       (That record is the index's own witness: an index whose flag and
//       second sha256 were both rewritten cannot be told from a store that
//       moved on, and its counts are then said, not judged.)
//   M6  by a second road, what prints: a row's route as printed is its line's
//       `prints`; its record as printed is its definition line's; and its
//       readings are that `prints` cut at the row's own marks, each mark's
//       place less the closes before it, or none where the row's facts say it
//       only opens a numbered sense of its entry (sense-openings-rule-v1)
//   M7  the page's own functions, read out of zone.html and run, give what
//       the store reader gives for every row that carries the slot: the
//       route, the record, the readings
//   M8  the front door's card carries the same functions, read out of the
//       built door and run on the same rows
//   M9  no line a zone bakes prints a made space: no reading in a zone's
//       table, nor in a witnessed column, is a row's reading as it stood
//       before closing where no row prints it so now
//   M10 on the page: words whose cards hold such a row are pressed with every
//       switch lifted, for each listed source rows whose route closes and
//       rows whose definition alone does; no pill prints a reading as it
//       stood before closing, the closed reading stands on a pill credited
//       to its source, the record under that pill is the definition as it
//       prints, and the card calls the reading a piece of its record only
//       where the store does
//
// Run: node tools/check-made-spaces-v1.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore, MADE_SPACES_RULE_ID, CLOSES_SLOT, routePrinted, recordPrinted, readingKey, printedForm, factsOf } from "./gloss-store-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
import { pageReading } from "./page-reading-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { linesOnPage } from "./resting-lines-v1.mjs";
import { STATES } from "./card-readings-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const STORE = join(K3, "data", "route-store");
const LISTS = join(K3, "data", "made-spaces");
const HOME = "reader/data/made-spaces";   // the same folder as the index names it
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const nf = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const first = (list, n = 3) => list.slice(0, n).join(" · ");

console.log(`— ${MADE_SPACES_RULE_ID} —\n`);
if (!existsSync(join(LISTS, "PIN.json"))) { console.log("SKIPPED — no made-spaces lists on this disk (data/made-spaces/PIN.json)"); process.exit(3); }
const pin = JSON.parse(readFileSync(join(LISTS, "PIN.json"), "utf8"));
const relays = Array.isArray(pin.relays) ? pin.relays : [];
const store = openRouteStore(STORE);
const index = store.index;

// ---- M1: the pinned bytes, relay by relay ---------------------------------------------------
const pinFaults = [];
if (pin.schema_version !== "MADE_SPACES_PIN_V2" || !relays.length) pinFaults.push("the pin names no relays");
const bytesOf = (relay, p) => {
  const name = `${relay.folder}/${p.file}`, path = join(LISTS, relay.folder, p.file);
  if (!existsSync(path)) { pinFaults.push(`${name} is not here`); return null; }
  const b = readFileSync(path);
  if (b.length !== p.bytes || sha256(b) !== p.sha256) pinFaults.push(`${name} is ${b.length} bytes, ${sha256(b).slice(0, 12)}; its pin names ${p.bytes}, ${String(p.sha256).slice(0, 12)}`);
  return b;
};
const raws = [];        // each list's bytes with its relay and its source, read line by line in M2
const rawsNever = [];   // each never-closed file's, the same
const readAtOf = {};    // relay -> the store version its receipt says the lists were read from
let pinnedFiles = 0;
for (const relay of relays) {
  bytesOf(relay, relay.rule);
  const receipt = bytesOf(relay, relay.receipt);
  pinnedFiles += 2;
  const theirs = receipt ? JSON.parse(receipt.toString("utf8")) : { outputs: [], sources: [], inputs: {} };
  readAtOf[relay.relay] = (((theirs.inputs || {}).route_store || {}).store_version) || null;
  if (!readAtOf[relay.relay]) pinFaults.push(`relay ${relay.relay}: its receipt names no store version it read`);
  const sourceOf = (p) => {
    const name = `${relay.folder}/${p.file}`;
    const out = (theirs.outputs || []).find((o) => o.file === p.file);
    if (!out || out.sha256 !== p.sha256) pinFaults.push(`relay ${relay.relay}: the corpus lane's receipt does not name ${name} by its pin's sha256`);
    const src = (theirs.sources || []).find((s) => s.source_key === p.file.split(".")[0]);
    if (!src) { pinFaults.push(`relay ${relay.relay}: the corpus lane's receipt names no source for ${name}`); return null; }
    const mine = index.m_sources[src.m_id];
    if (!mine || mine.key !== src.source_key || mine.label !== src.label) pinFaults.push(`${src.m_id} is not ${src.source_key} in the store's index`);
    return src;
  };
  for (const p of relay.lists || []) {
    const b = bytesOf(relay, p), src = sourceOf(p);
    pinnedFiles += 1;
    if (src && (!src.list || src.list.sha256 !== p.sha256)) pinFaults.push(`relay ${relay.relay}: its receipt does not give ${src.m_id} the list ${p.file}`);
    if (src && raws.some((r) => r.src.m_id === src.m_id)) pinFaults.push(`two lists name ${src.m_id}`);
    else if (b && src) raws.push({ relay: relay.relay, name: `${relay.folder}/${p.file}`, p, src, text: b.toString("utf8") });
  }
  for (const p of relay.never_closed || []) {
    const b = bytesOf(relay, p), src = sourceOf(p);
    pinnedFiles += 1;
    if (b && src) rawsNever.push({ relay: relay.relay, name: `${relay.folder}/${p.file}`, p, src, text: b.toString("utf8") });
  }
}
check("M1  every relay's lists, rule, receipt and never-closed files are the bytes their pin names; its receipt names each by the same sha256 and gives each list its source, which the store holds so; no source has two lists", pinFaults.length === 0,
  pinFaults.length ? first(pinFaults) : `${relays.length} relays (${relays.map((r) => r.relay).join(", ")}) · ${pinnedFiles} files: ${raws.length} lists, ${rawsNever.length} never-closed, a rule and a receipt each`);

// ---- M2: every line ---------------------------------------------------------------------------
// the text with the characters at `places` taken out, typed here on its own: one character at a time
const without = (text, places) => { let s = ""; for (let i = 0; i < text.length; i += 1) if (!places.includes(i)) s += text[i]; return s; };
const lineFaults = []; let lines = 0, closing = 0, closes = 0, kept = 0, noted = 0;
const LISTED = new Map();   // m id -> { key, relay, file, sha256, lines: Map(text -> line), theirs, readAt }
const NEVER = new Map();    // m id -> { key, relay, file, sha256, places: Map(text -> the spaces of the text that stand for words taken out) }
const linesOf = (name, p, text) => {
  const rows = text.endsWith("\n") ? text.slice(0, -1).split("\n") : (lineFaults.push(`${name} does not end in a line end`), text.split("\n"));
  if (rows.length !== p.lines) lineFaults.push(`${name} holds ${rows.length} lines; its pin says ${p.lines}`);
  return rows.map((s, at) => { try { return JSON.parse(s); } catch { lineFaults.push(`${name} line ${at + 1} is not JSON`); return null; } });
};
for (const { relay, name, p, src, text } of raws) {
  const map = new Map();
  linesOf(name, p, text).forEach((l, at) => {
    if (!l) return;
    lines += 1;
    const where = `${name} line ${at + 1}`;
    if (typeof l.text !== "string" || !Array.isArray(l.closes) || typeof l.prints !== "string") { lineFaults.push(`${where}: no text, closes or prints`); return; }
    if (map.has(l.text)) lineFaults.push(`${where}: its text is named twice`);
    if (l.closes.some((c, i) => !Number.isInteger(c) || l.text[c] !== " " || (i && c <= l.closes[i - 1]))) lineFaults.push(`${where}: a close is not a space of the text, or the closes do not rise`);
    if ((l.kept || []).some((c) => l.text[c] !== " " || l.closes.includes(c))) lineFaults.push(`${where}: a kept place is not a space of the text, or is one of its closes`);
    if (without(l.text, l.closes) !== l.prints) lineFaults.push(`${where}: prints is not the text with its closes taken out`);
    if (l.closes.length) closing += 1;
    closes += l.closes.length; kept += (l.kept || []).length; if (l.note) noted += 1;
    map.set(l.text, l);
  });
  LISTED.set(src.m_id, { key: src.source_key, relay, file: name, sha256: p.sha256, lines: map, theirs: src, readAt: readAtOf[relay] });
}
let neverTexts = 0, standing = 0, inBoth = 0;
for (const { relay, name, p, src, text } of rawsNever) {
  const places = new Map();
  linesOf(name, p, text).forEach((l, at) => {
    if (!l) return;
    const where = `${name} line ${at + 1}`;
    if (typeof l.text !== "string" || !l.text || !Array.isArray(l.at)) { lineFaults.push(`${where}: no text or no places`); return; }
    if (places.has(l.text)) lineFaults.push(`${where}: its text is named twice`);
    // a place is the space that stands for the words, or the text's start or its end where the words stood there
    if (l.at.some((a) => !Number.isInteger(a) || a < 0 || a > l.text.length || (a !== 0 && a !== l.text.length && l.text[a] !== " "))) lineFaults.push(`${where}: a place is not a space of the text, its start or its end`);
    const spaces = l.at.filter((a) => l.text[a] === " ");
    neverTexts += 1; standing += spaces.length;
    places.set(l.text, spaces);
  });
  NEVER.set(src.m_id, { key: src.source_key, relay, file: name, sha256: p.sha256, places });
  const L = LISTED.get(src.m_id);
  if (L) for (const [t, l] of L.lines) {
    const stands = places.get(t);
    if (!stands) continue;
    inBoth += 1;
    if (l.closes.some((c) => stands.includes(c))) lineFaults.push(`${L.file}: «${t.slice(0, 50)}» closes a space that ${name} says stands for words taken out`);
  }
}
check("M2  every line is well formed: closes are spaces of the text and rise, prints is the text with them taken out, a kept place does not close; a never-closed place is a space, a start or an end, and no list closes a space that stands for words taken out", lineFaults.length === 0,
  lineFaults.length ? first(lineFaults) : `${nf(lines)} lines · ${nf(closing)} with a close · ${nf(closes)} closes · ${kept} made spaces kept · ${noted} with a note · ${nf(neverTexts)} never-closed texts with ${nf(standing)} spaces that stand for words, ${inBoth} of them texts a list names too`);

// ---- M3: every row of the store -------------------------------------------------------------
const lineOf = (L, text) => { const l = L && L.lines.get(String(text ?? "")); return l && l.closes.length ? l : null; };
const comma = / ,/u;
const rowFaults = [];
const slotted = [];   // [key, row] for every row that carries the slot
const recount = {};   // m id -> { rows, route, definition, either, stillRoute, stillRecord, texts: one line per row }
let storeRows = 0;
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
  const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const [k, rows] of Object.entries(body)) for (const row of rows) {
    storeRows += 1;
    const m = String(row[3]), L = LISTED.get(m);
    // the slot is asked by what it holds: a row may carry a later slot (its facts), whose shape is its own check's
    const has = row[CLOSES_SLOT] ?? null;
    if (!L) { if (has !== null) rowFaults.push(`${f} ${k} (${m}): a row of a source no list names carries the slot`); continue; }
    const c = (recount[m] ||= { rows: 0, route: 0, definition: 0, either: 0, stillRoute: 0, stillRecord: 0, texts: [] });
    c.rows += 1;
    c.texts.push(JSON.stringify([k, row[1] ?? null, row[2] ?? null]));
    const r = lineOf(L, row[1]), d = lineOf(L, row[2]);
    if (r) c.route += 1;
    if (d) c.definition += 1;
    if (r || d) c.either += 1;
    const want = r || d ? [r ? r.closes : null, d ? d.closes : null] : null;
    if (!same(has, want)) rowFaults.push(`${f} ${k} (${m}, rank ${row[0]}): the lists give ${JSON.stringify(want)}, the row carries ${JSON.stringify(has)}`);
    if (r && Array.isArray(row[8])) rowFaults.push(`${f} ${k} (${m}, rank ${row[0]}): a print slot and a close on the route text`);
    if (r && Array.isArray(row[7]) && r.closes.some((x) => row[7].includes(x))) rowFaults.push(`${f} ${k} (${m}, rank ${row[0]}): a close stands at a mark the ledger divides at`);
    if (has) slotted.push([k, row]);
    // what the source's rows still print before a comma once closed, over every row of the source (M5)
    if (comma.test(routePrinted(row))) c.stillRoute += 1;
    if (row[2] && comma.test(recordPrinted(row))) c.stillRecord += 1;
  }
}
let spanRows = 0;
const SPAN = join(K3, "data", "span-store");
if (existsSync(join(SPAN, "index.json"))) for (const f of readdirSync(SPAN).filter((x) => /^[a-z0-9-]+\.json$/u.test(x) && x !== "index.json").sort()) {
  const file = JSON.parse(readFileSync(join(SPAN, f), "utf8"));
  for (const rows of Object.values(file.keys || {})) for (const r of rows) {
    const L = r && Array.isArray(r.slots) ? LISTED.get(String(r.slots[3])) : null;
    if (!L) continue;
    spanRows += 1;
    if (lineOf(L, r.slots[1]) || lineOf(L, r.slots[2])) rowFaults.push(`the span store's ${f}: a row of ${r.slots[3]} holds a text with a close`);
  }
}
const total = (f) => Object.values(recount).reduce((a, c) => a + c[f], 0);
check("M3  every store row carries exactly the closes the lists give its texts, and no other row carries the slot; none has a print slot with a route close, or a close at a ledger's mark; the span store's rows hold none", rowFaults.length === 0,
  rowFaults.length ? `${rowFaults.length} · ${first(rowFaults)}` : `${nf(storeRows)} store rows read · ${nf(total("rows"))} of ${LISTED.size} listed sources · ${nf(total("either"))} carry the slot (${nf(total("route"))} close on the route text, ${nf(total("definition"))} on the definition text) · ${nf(spanRows)} span rows of those sources, none with a close`);

// ---- M4: the index ------------------------------------------------------------------------------
// a source's rows as they stand: the sha256 of one line per row (its key, its route text, its definition text), sorted
const standsAs = (m) => sha256(((recount[m] || {}).texts || []).slice().sort().join("\n") + "\n");
const ms = index.made_spaces || null;
const wantLists = [...LISTED.entries()].map(([m, L]) => ({ m, key: L.key, relay: L.relay, file: `${HOME}/${L.file}`, sha256: L.sha256 }));
const wantNever = [...NEVER.entries()].map(([m, N]) => ({ m, key: N.key, relay: N.relay, file: `${HOME}/${N.file}`, sha256: N.sha256, texts: N.places.size }));
const indexFaults = [];
if (!ms) indexFaults.push("the index names no made spaces (index.made_spaces)");
else {
  if (ms.rule_id !== MADE_SPACES_RULE_ID) indexFaults.push(`the index names the rule ${ms.rule_id}`);
  if (ms.pin !== `${HOME}/PIN.json`) indexFaults.push(`the index names the pin ${ms.pin}`);
  if (!same((ms.relays || []).map((r) => [r.relay, r.folder, r.read_at_store_version]), relays.map((r) => [r.relay, `${HOME}/${r.folder}`, readAtOf[r.relay]]))) indexFaults.push("the index does not name the pin's relays, each with its folder and the store version it read");
  if (!same(ms.lists, wantLists)) indexFaults.push("the index does not name the pinned lists by their sha256");
  if (!same(ms.never_closed, wantNever)) indexFaults.push("the index does not name the pinned never-closed files by their sha256");
  for (const [m, L] of LISTED) {
    const r = (ms.sources || {})[m];
    if (!r || r.key !== L.key || r.relay !== L.relay || r.read_at_store_version !== L.readAt) indexFaults.push(`the index does not say which relay ${m}'s list is of, or the version it was read from`);
    else if (r.texts_sha256 !== standsAs(m)) indexFaults.push(`the index's record of ${m}'s rows (${String(r.texts_sha256).slice(0, 12)}) is not the rows as they stand (${standsAs(m).slice(0, 12)}): the tool has not run since they moved`);
    else if (r.texts_are_as_read !== (typeof r.texts_sha256_as_read === "string" && r.texts_sha256_as_read === r.texts_sha256)) indexFaults.push(`the index says ${m}'s rows ${r.texts_are_as_read ? "are" : "are not"} the rows its list was read from, and its two records of them (as read ${String(r.texts_sha256_as_read).slice(0, 12)}, as they stand ${String(r.texts_sha256).slice(0, 12)}) say otherwise`);
  }
  for (const m of Object.keys(ms.sources || {})) if (!LISTED.has(m)) indexFaults.push(`the index records rows of ${m}, which no list names`);
  const t = ms.totals || {};
  if (t.rows_of_listed_sources !== total("rows") || t.rows_carrying_the_slot !== total("either") || t.rows_with_a_close_on_the_route_text !== total("route") || t.rows_with_a_close_on_the_definition_text !== total("definition"))
    indexFaults.push(`the index's totals (${t.rows_of_listed_sources}, ${t.rows_carrying_the_slot}, ${t.rows_with_a_close_on_the_route_text}, ${t.rows_with_a_close_on_the_definition_text}) are not a recount's (${total("rows")}, ${total("either")}, ${total("route")}, ${total("definition")})`);
}
check("M4  the store's index names the rule, the pin, its relays, the lists and the never-closed files, each source's rows as they stand, and totals that are a recount's", indexFaults.length === 0,
  indexFaults.length ? first(indexFaults) : `applied ${String(ms.applied_on).slice(0, 10)} · this rule's last move of the store ${ms.store_version_before} -> ${ms.store_version} · ${LISTED.size} sources' rows recorded`);

// ---- M5: the corpus lane's own counts -------------------------------------------------------
// by the store's own history: walking back from the store's version over moves that are this rule's (which changes no
// text), is the version the relay read reached?
const history = index.store_version_history || [];
const reachedByThisRuleAlone = (from) => {
  let v = index.store_version;
  for (let i = history.length - 1; v !== from && i >= 0; i -= 1) {
    if (history[i].now !== v || history[i].why !== MADE_SPACES_RULE_ID) return false;
    v = history[i].was;
  }
  return v === from;
};
const countFaults = [], judgedSources = [], saidOnly = [];
for (const [m, L] of LISTED) {
  const stated = ((L.theirs.rows_axis || {}).route_store) || {}, c = recount[m] || { route: 0, definition: 0, either: 0, stillRoute: 0, stillRecord: 0 };
  const sc = stated.space_before_a_comma || {};
  const pairs = [["rows with a close on the route text", c.route, stated.field_1_holds_a_close], ["on the definition text", c.definition, stated.field_2_holds_a_close], ["on either", c.either, stated.either_holds_a_close],
    ["rows whose route still prints a space before a comma", c.stillRoute, (sc.field_1 || {}).rows_that_still_print_one_after_closing], ["rows whose definition still does", c.stillRecord, (sc.field_2 || {}).rows_that_still_print_one_after_closing]];
  const differing = pairs.filter(([, here, there]) => here !== there).map(([what, here, there]) => `${m}: ${what} ${here} here, ${there} in the corpus lane's receipt`);
  const said = `${m} ${nf(c.route)}/${nf(c.definition)}/${nf(c.either)} rows close, ${c.stillRoute} and ${c.stillRecord} still print a space before a comma`;
  const rec = (ms && ms.sources && ms.sources[m]) || null;
  const byHistory = !!L.readAt && reachedByThisRuleAlone(L.readAt);
  const byRecord = !!rec && rec.read_at_store_version === L.readAt && typeof rec.texts_sha256_as_read === "string" && rec.texts_sha256_as_read === standsAs(m);
  if (byHistory && rec && rec.texts_are_as_read !== true) countFaults.push(`${m}: the store's history shows no move but this rule's since ${L.readAt}, and the index says the source's rows are not the rows its list was read from`);
  if (byHistory || byRecord) { countFaults.push(...differing); judgedSources.push(`${said} (as read at ${L.readAt}, ${byHistory ? "by the store's history" : "by the texts the index recorded"})`); }
  else saidOnly.push(`${said}${differing.length ? ` (${differing.length} of the corpus lane's counts differ now)` : ""}, its rows have moved on from ${L.readAt}`);
}
if (judgedSources.length) check("M5  the corpus lane's own counts are the store's, for each source whose rows are the rows its list was read from: the rows that hold a close, and the rows that still print a space before a comma once closed", countFaults.length === 0,
  countFaults.length ? first(countFaults) : `${judgedSources.join(" · ")}${saidOnly.length ? ` · said, not judged: ${saidOnly.join(" · ")}` : ""}`);
else console.log(`  --  M5  said, not judged: no source's rows are the rows its list was read from · ${saidOnly.join(" · ")}`);

// ---- M6: what prints, by a second road -------------------------------------------------------
const printFaults = [];
for (const [k, row] of slotted) {
  const L = LISTED.get(String(row[3]));
  const r = lineOf(L, row[1]), d = lineOf(L, row[2]);
  const where = `${k} (${row[3]}, rank ${row[0]})`;
  const route = r ? r.prints : String(row[1] ?? "");
  if (routePrinted(row) !== route) printFaults.push(`${where}: the route prints «${routePrinted(row).slice(0, 50)}», its line says «${route.slice(0, 50)}»`);
  const record = row[2] ? (d ? d.prints : String(row[2])) : route;
  if (recordPrinted(row) !== record) printFaults.push(`${where}: the record prints «${recordPrinted(row).slice(0, 50)}», its line says «${record.slice(0, 50)}»`);
  if (Array.isArray(row[8])) continue;   // a print slot's texts are the ledger's (and M3 refuses one beside a route close)
  // the readings: the printed route cut at the row's marks, each mark's place less the closes before it
  const shut = r ? r.closes : [];
  const cuts = (Array.isArray(row[7]) ? row[7] : []).map((i) => i - shut.filter((c) => c < i).length);
  const pieces = []; let from = 0;
  for (const i of cuts) { pieces.push(route.slice(from, i)); from = i + 1; }
  pieces.push(route.slice(from));
  // a row that only opens a numbered sense prints as a note and gives no reading (sense-openings-rule-v1)
  const want = (factsOf(row) || {}).opens ? [] : pieces.map((x) => x.trim()).filter(Boolean);
  if (!same(store.readingsOf(row), want)) printFaults.push(`${where}: the readings are ${JSON.stringify(store.readingsOf(row)).slice(0, 80)}, the printed route cut at its marks gives ${JSON.stringify(want).slice(0, 80)}`);
}
check("M6  by a second road: a row's route and record print as their lines' `prints`, and its readings are that printed route cut at the row's own marks", printFaults.length === 0,
  printFaults.length ? `${printFaults.length} · ${first(printFaults)}` : `${nf(slotted.length)} rows · ${slotted.filter(([, row]) => Array.isArray(row[7])).length} of them divided by a ledger`);

// ---- M7: the page's functions -------------------------------------------------------------------
{
  let page = null, why = "";
  try { page = pageReading(readFileSync(join(K3, "zone.html"), "utf8"), index); } catch (e) { why = e.message; }
  const faults = [];
  if (page) for (const [k, row] of slotted) {
    if (page.routePrinted(row) !== routePrinted(row)) faults.push(`${k} (${row[3]}): the route`);
    if (page.recordPrinted(row) !== recordPrinted(row)) faults.push(`${k} (${row[3]}): the record`);
    if (!same(page.readingsOfRow(row), store.readingsOf(row))) faults.push(`${k} (${row[3]}): the readings`);
  }
  check("M7  the page's own functions, read out of zone.html and run, give what the store reader gives for every row that carries the slot", !!page && faults.length === 0,
    !page ? `the page's functions could not be read: ${why}` : faults.length ? `${faults.length} · ${first(faults)}` : `${nf(slotted.length)} rows: the route, the record and the readings agree`);
}

// ---- M8: the front door's card ------------------------------------------------------------------
{
  const doorPath = join(K3, "..", "index.html");
  let door = null, why = "";
  if (!existsSync(doorPath)) why = "no built door beside the reader (index.html)";
  else try {
    const html = readFileSync(doorPath, "utf8");
    const a = html.indexOf("function closed(text, places) {"), z = html.indexOf("function recordPrinted(row) {");
    if (a < 0 || z < a || html.indexOf("function closed(text, places) {", a + 1) >= 0) throw new Error("the door does not hold the three functions once");
    door = new Function(`${html.slice(a, html.indexOf("\n", z))}\n return { routePrinted, recordPrinted };`)();
  } catch (e) { why = e.message; }
  const faults = [];
  if (door) for (const [k, row] of slotted) {
    if (door.routePrinted(row) !== routePrinted(row)) faults.push(`${k} (${row[3]}): the route`);
    if (door.recordPrinted(row) !== recordPrinted(row)) faults.push(`${k} (${row[3]}): the record`);
  }
  check("M8  the front door's card carries the same functions, read out of the built door and run on the same rows", !!door && faults.length === 0,
    !door ? why : faults.length ? `${faults.length} · ${first(faults)}` : `${nf(slotted.length)} rows: the route and the record agree`);
}

// ---- M9: no baked line prints a made space ---------------------------------------------------
// per key: the readings its rows gave before closing that no row prints now (by the printed form, as the pool keys a reading)
const stale = new Map();
{
  const byKey = new Map();
  for (const [k, row] of slotted) if (row[CLOSES_SLOT][0] && !Array.isArray(row[8])) (byKey.get(k) || byKey.set(k, []).get(k)).push(row);
  for (const [k, rows] of byKey) {
    const now = new Set((store.routesFor(k) || []).flatMap((r) => store.readingsOf(r).map(readingKey)));
    const was = new Set();
    for (const row of rows) {
      const text = String(row[1]), ends = [...(Array.isArray(row[7]) ? row[7] : []), text.length];
      ends.forEach((end, x) => { const piece = text.slice(x ? ends[x - 1] + 1 : 0, end).trim(); if (piece && !now.has(readingKey(piece))) was.add(readingKey(piece)); });
    }
    if (was.size) stale.set(k, was);
  }
}
{
  const ZONES = join(K3, "data", "zones");
  const faults = []; let files = 0, tables = 0, readings = 0;
  for (const f of existsSync(ZONES) ? readdirSync(ZONES).filter((x) => x.endsWith(".bin")).sort() : []) {
    let z;
    try { z = JSON.parse(gunzipSync(readFileSync(join(ZONES, f))).toString("utf8")); } catch { continue; }   // not a zone's JSON (a shard of another kind)
    if (!z || typeof z.gloss !== "object" || !z.gloss) continue;
    files += 1;
    const cols = [["the line", z.gloss], ...Object.entries(z.gloss_orders || {}), ...Object.entries(z.gloss_deltas || {})];
    for (const [name, col] of cols) {
      if (!col || typeof col !== "object") continue;
      tables += 1;
      for (const [k, t] of Object.entries(col)) {
        if (typeof t !== "string") continue;
        readings += 1;
        const was = stale.get(k);
        if (was && was.has(readingKey(t))) faults.push(`${f} ${name} ${k}: «${t.slice(0, 50)}»`);
      }
    }
  }
  check("M9  no reading a zone bakes, in its line's table or a witnessed column, is a row's reading as it stood before closing", files > 0 && faults.length === 0,
    !files ? "no zone on this disk" : faults.length ? `${faults.length} · ${first(faults)}` : `${files} zone files · ${tables} tables · ${nf(readings)} readings · ${nf(stale.size)} keys hold a reading that closing changed`);
}

// ---- M10: on the page -----------------------------------------------------------------------------
// served words whose card holds a row of a listed source that the ledger leaves whole and that is the oldest of
// the store's rows carrying its reading, so the record under its pill is that row's unless an older row of a
// dictionary beside the store stands first there. Two kinds, asked of each listed source: a row whose route
// closes, where the pill itself changes; and a row whose route does not close and whose definition does, where the
// pill is as it was and the record under it changes (every row of a source whose routes hold no made space is of
// this kind). A source has a kind where a row of the store is of it
const KINDS = [
  { name: "route", most: 4, of: (r) => !!r[CLOSES_SLOT][0] && readingKey(String(r[1]).trim()) !== readingKey(routePrinted(r).trim()) },
  { name: "record", most: 4, of: (r) => !r[CLOSES_SLOT][0] && !!r[CLOSES_SLOT][1] && !!r[2] && printedForm(String(r[2])) !== printedForm(recordPrinted(r)) },
];
// a row that carries closes, asked by what the slot holds (a row may carry a later slot and none here), and that
// its ledger leaves whole
const whole = (r) => Array.isArray(r[CLOSES_SLOT]) && !Array.isArray(r[7]) && !Array.isArray(r[8]);
// the sources and kinds the store holds a whole row of: [m id, kind]
const ASKED = [...LISTED.keys()].flatMap((m) => KINDS.filter((kind) => slotted.some(([, r]) => String(r[3]) === m && whole(r) && kind.of(r))).map((kind) => [m, kind]));
const tag = (m, kind) => `${m} ${kind.name}`;
const picks = [];
{
  const seen = new Set(), found = Object.fromEntries(ASKED.map(([m, kind]) => [tag(m, kind), 0]));
  outer: for (const b of zonesServed()) {
    const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${b}.bin`))).toString("utf8"));
    for (const [si, sec] of (z.sections || []).entries()) for (const [e, w] of (sec.words || []).entries()) {
      if (!w.k || w.w || seen.has(w.k)) continue;
      const rows = (store.routesFor(w.k) || []).filter((r) => index.m_sources[r[3]]);
      for (const [m, kind] of ASKED) {
        if (found[tag(m, kind)] >= kind.most) continue;
        const row = rows.find((r) => String(r[3]) === m && whole(r) && kind.of(r) && store.carriersOf(rows, routePrinted(r).trim())[0] === r);
        if (!row) continue;
        seen.add(w.k); found[tag(m, kind)] += 1;
        picks.push({ kind: tag(m, kind), book: b, section: si, entry: e, label: sec.label, key: w.k, m, source: index.m_sources[m].label,
          printed: printedForm(routePrinted(row).trim()), record: printedForm(recordPrinted(row)), piece: row[5] === 1, was: [...(stale.get(w.k) || [])] });
        break;
      }
      if (ASKED.every(([m, kind]) => found[tag(m, kind)] >= kind.most)) break outer;
    }
  }
}
const lacking = ASKED.filter(([m, kind]) => !picks.some((pick) => pick.kind === tag(m, kind))).map(([m, kind]) => tag(m, kind));
if (!ASKED.length || lacking.length) check("M10 on the page, a card that holds such a row prints it closed", false, !ASKED.length ? "no row of the store carries the slot whole" : `no served word carries a whole row that leads its reading, of: ${lacking.join(", ")}`);
else {
  const tree = await serveTree(K3);
  const pw = await loadPlaywright();
  const browser = await pw.chromium.launch(launchOptions());
  const faults = [], seenOn = [], judged = Object.fromEntries(ASKED.map(([m, kind]) => [tag(m, kind), 0]));
  let pills = 0;
  try {
    for (const pick of picks) {
      const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
      try {
        const p = await ctx.newPage();
        const errors = [];
        p.on("pageerror", (e) => errors.push(String(e && e.message)));
        await p.goto(`${tree.base}/zone.html?b=${pick.book}`, { waitUntil: "networkidle" });
        // every switch that withholds a reading lifted, as the chain's second reading of a card lifts them
        await p.evaluate((kv) => { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); }, STATES.lifted.keep);
        await p.reload({ waitUntil: "networkidle" });
        await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
        await linesOnPage(p, { from: pick.section, to: pick.section + 1 });
        const got = await p.evaluate(async ({ section, entry, m, printed }) => {
          const hud = document.getElementById("hud");
          const turn = () => new Promise((r) => { const c = new MessageChannel(); c.port1.onmessage = () => { c.port1.close(); r(); }; c.port2.postMessage(0); });
          const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
          const sec = document.querySelectorAll("section.seg")[section];
          const wb = sec ? sec.querySelectorAll(".he-text .wb")[entry] : null;
          if (!wb) return { fault: "the word is not on the page" };
          (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
          const t0 = performance.now();
          while (!settled() && performance.now() - t0 < 20000) await turn();
          if (!settled()) return { fault: "the card's readings did not arrive" };
          const buttons = [...hud.querySelectorAll(":scope > .rows > .b-read > .r-pills > button")];
          const said = buttons.map((x) => [x.textContent, x.dataset.by || ""]);
          const mine = buttons.find((x) => x.textContent === printed && (x.dataset.by || "").split(/[\s,]+/u).includes(m));
          let record = null, cut = null, credited = null;
          if (mine) {
            mine.click();
            await turn(); await turn();
            const d = hud.querySelector(".d-card .d-body .d-text"), att = hud.querySelector(".d-card .d-foot .att");
            record = d ? d.textContent : null;
            credited = att ? att.textContent : null;
            cut = !!hud.querySelector(".d-card .d-cut");
          }
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          return { said, record, cut, credited, found: !!mine };
        }, pick);
        const where = `${pick.book} ${pick.label}, entry ${pick.entry} (${pick.key})`;
        if (errors.length) faults.push(`${where}: the page threw: ${errors[0]}`);
        if (got.fault) { faults.push(`${where}: ${got.fault}`); continue; }
        pills += got.said.length;
        for (const [text] of got.said) if (pick.was.includes(readingKey(text))) faults.push(`${where}: a pill prints «${text.slice(0, 50)}», a reading as it stood before closing`);
        if (!got.found) continue;   // the card opened on a division of the word, where the whole form's rows are a press away
        // the record shown is the oldest carrier's: judged where the card's own source line names this row's source
        if (!String(got.credited || "").startsWith(`${pick.source} · `)) continue;
        seenOn.push(where); judged[pick.kind] += 1;
        if (got.record !== pick.record) faults.push(`${where}: under «${pick.printed.slice(0, 40)}» the record prints «${String(got.record).slice(0, 60)}», and as printed it is «${pick.record.slice(0, 60)}»`);
        // the reading is the row's whole route as it prints, so the card calls it a piece of its record only where the store marks the row as one
        if (got.cut !== pick.piece) faults.push(`${where}: the card ${got.cut ? "says" : "does not say"} «${pick.printed.slice(0, 40)}» is a piece cut out of its record, and the store ${pick.piece ? "marks" : "does not mark"} the row as one`);
      } finally { await ctx.close(); }
    }
  } finally { await browser.close().catch(() => {}); await tree.close(); }
  const unjudged = ASKED.filter(([m, kind]) => !judged[tag(m, kind)]).map(([m, kind]) => tag(m, kind));
  check("M10 on the page, with every switch lifted: no pill prints a reading as it stood before closing; for each listed source the closed reading stands on a pill of its source, the record under it is the definition as it prints, and it is called a piece only where the store marks it one", faults.length === 0 && unjudged.length === 0,
    faults.length ? `${faults.length} · ${first(faults)}` : unjudged.length ? `no card showed the record of a row of: ${unjudged.join(", ")}` : `${picks.length} words pressed · ${nf(pills)} pills read · the record was read under ${ASKED.map(([m, kind]) => `${judged[tag(m, kind)]} of ${picks.filter((pick) => pick.kind === tag(m, kind)).length} ${m} rows whose ${kind.name} closes`).join(", ")}${seenOn.length ? ` (${seenOn[0]})` : ""}`);
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
