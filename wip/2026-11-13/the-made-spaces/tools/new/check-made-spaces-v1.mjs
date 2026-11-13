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
// tag of the provider's XML stood. The corpus lane traced every such space
// and listed the places that close (relay v168; data/made-spaces-v1/, with
// its rule). tools/apply-made-spaces-v1.mjs writes those places on the rows,
// in slot 9, and the readers leave the characters there out when they print.
// The store's texts are not touched.
//
// What is held here, each recomputed and none read from the tool's receipt:
//
//   M1  the lists, their rule and the corpus lane's receipt are the bytes
//       their pin names, and that receipt names each list by the same sha256
//   M2  every line is well formed: its closes are spaces of its text, in
//       rising order; its `prints` is the text with them taken out; a kept
//       place is a space that does not close
//   M3  every row of the store, read again from the lists: a row of a listed
//       source whose route text or definition text is a line with a close
//       carries exactly those places in slot 9, and no other row carries the
//       slot; no row carries a print slot and a close on its route text; no
//       close stands at a mark its ledger divides at; the span store's rows
//       of the listed sources hold no close
//   M4  the store's index names the rule and the lists, and its totals are a
//       recount's
//   M5  the corpus lane's own counts, while the store's rows are the rows the
//       lists were read from: the rows that hold a close, and the rows that
//       still print a space before a comma once closed (the provider's own
//       spaces, which are never touched). After the store has moved on these
//       are said and not judged
//   M6  by a second road, what prints: a row's route as printed is its line's
//       `prints`; its record as printed is its definition line's; and its
//       readings are that `prints` cut at the row's own marks, each mark's
//       place less the closes before it
//   M7  the page's own functions, read out of zone.html and run, give what
//       the store reader gives for every row that carries the slot: the
//       route, the record, the readings
//   M8  the front door's card carries the same functions, read out of the
//       built door and run on the same rows
//   M9  no line a zone bakes prints a made space: no reading in a zone's
//       table, nor in a witnessed column, is a row's reading as it stood
//       before closing where no row prints it so now
//   M10 on the page: words whose cards hold such a row are pressed with every
//       switch lifted; no pill prints a reading as it stood before closing,
//       the closed reading stands on a pill credited to its source, the
//       record under that pill is the definition as it prints, and the card
//       calls the reading a piece of its record only where the store does
//
// Run: node tools/check-made-spaces-v1.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore, MADE_SPACES_RULE_ID, CLOSES_SLOT, routePrinted, recordPrinted, readingKey, printedForm } from "./gloss-store-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { linesOnPage } from "./resting-lines-v1.mjs";
import { STATES } from "./card-readings-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const STORE = join(K3, "data", "route-store");
const LISTS = join(K3, "data", "made-spaces-v1");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const nf = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const first = (list, n = 3) => list.slice(0, n).join(" · ");

console.log(`— ${MADE_SPACES_RULE_ID} —\n`);
if (!existsSync(join(LISTS, "PIN.json"))) { console.log("SKIPPED — no made-spaces lists on this disk (data/made-spaces-v1/PIN.json)"); process.exit(3); }
const pin = JSON.parse(readFileSync(join(LISTS, "PIN.json"), "utf8"));
const store = openRouteStore(STORE);
const index = store.index;

// ---- M1: the pinned bytes -------------------------------------------------------------------
const pinFaults = [];
const bytesOf = (p) => {
  const path = join(LISTS, p.file);
  if (!existsSync(path)) { pinFaults.push(`${p.file} is not here`); return null; }
  const b = readFileSync(path);
  if (b.length !== p.bytes || sha256(b) !== p.sha256) pinFaults.push(`${p.file} is ${b.length} bytes, ${sha256(b).slice(0, 12)}; its pin names ${p.bytes}, ${String(p.sha256).slice(0, 12)}`);
  return b;
};
bytesOf(pin.rule);
const theirsBytes = bytesOf(pin.receipt);
const theirs = theirsBytes ? JSON.parse(theirsBytes.toString("utf8")) : { outputs: [], sources: [], inputs: {} };
const LISTED = new Map();   // m id -> { key, file, lines: Map(text -> line), theirs }
const raws = [];
for (const p of pin.lists || []) {
  const b = bytesOf(p);
  const out = (theirs.outputs || []).find((o) => o.file === p.file);
  if (!out || out.sha256 !== p.sha256) pinFaults.push(`the corpus lane's receipt does not name ${p.file} by its pin's sha256`);
  const src = (theirs.sources || []).find((s) => s.source_key === p.file.split(".")[0]);
  if (!src) { pinFaults.push(`the corpus lane's receipt names no source for ${p.file}`); continue; }
  const mine = index.m_sources[src.m_id];
  if (!mine || mine.key !== src.source_key || mine.label !== src.label) pinFaults.push(`${src.m_id} is not ${src.source_key} in the store's index`);
  if (b) raws.push({ p, src, text: b.toString("utf8") });
}
check("M1  the lists, their rule and the corpus lane's receipt are the bytes their pin names, and the receipt names each list by the same sha256", pinFaults.length === 0,
  pinFaults.length ? first(pinFaults) : `relay ${pin.relay} · ${(pin.lists || []).length} lists, the rule and the receipt`);

// ---- M2: every line ---------------------------------------------------------------------------
// the text with the characters at `places` taken out, typed here on its own: one character at a time
const without = (text, places) => { let s = ""; for (let i = 0; i < text.length; i += 1) if (!places.includes(i)) s += text[i]; return s; };
const lineFaults = []; let lines = 0, closing = 0, closes = 0, kept = 0, noted = 0;
for (const { p, src, text } of raws) {
  const map = new Map();
  const rows = text.endsWith("\n") ? text.slice(0, -1).split("\n") : (lineFaults.push(`${p.file} does not end in a line end`), text.split("\n"));
  if (rows.length !== p.lines) lineFaults.push(`${p.file} holds ${rows.length} lines; its pin says ${p.lines}`);
  rows.forEach((s, at) => {
    let l = null;
    try { l = JSON.parse(s); } catch { lineFaults.push(`${p.file} line ${at + 1} is not JSON`); return; }
    lines += 1;
    const where = `${p.file} line ${at + 1}`;
    if (typeof l.text !== "string" || !Array.isArray(l.closes) || typeof l.prints !== "string") { lineFaults.push(`${where}: no text, closes or prints`); return; }
    if (map.has(l.text)) lineFaults.push(`${where}: its text is named twice`);
    if (l.closes.some((c, i) => !Number.isInteger(c) || l.text[c] !== " " || (i && c <= l.closes[i - 1]))) lineFaults.push(`${where}: a close is not a space of the text, or the closes do not rise`);
    if ((l.kept || []).some((c) => l.text[c] !== " " || l.closes.includes(c))) lineFaults.push(`${where}: a kept place is not a space of the text, or is one of its closes`);
    if (without(l.text, l.closes) !== l.prints) lineFaults.push(`${where}: prints is not the text with its closes taken out`);
    if (l.closes.length) closing += 1;
    closes += l.closes.length; kept += (l.kept || []).length; if (l.note) noted += 1;
    map.set(l.text, l);
  });
  LISTED.set(src.m_id, { key: src.source_key, file: p.file, sha256: p.sha256, lines: map, theirs: src });
}
check("M2  every line is well formed: closes are spaces of the text and rise, prints is the text with them taken out, a kept place does not close", lineFaults.length === 0,
  lineFaults.length ? first(lineFaults) : `${nf(lines)} lines · ${nf(closing)} with a close · ${nf(closes)} closes · ${kept} made spaces kept · ${noted} with a note`);

// ---- M3: every row of the store -------------------------------------------------------------
const lineOf = (L, text) => { const l = L && L.lines.get(String(text ?? "")); return l && l.closes.length ? l : null; };
const rowFaults = [];
const slotted = [];   // [key, row] for every row that carries the slot
const recount = {};   // m id -> { rows, route, definition, either }
let storeRows = 0;
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
  const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const [k, rows] of Object.entries(body)) for (const row of rows) {
    storeRows += 1;
    const m = String(row[3]), L = LISTED.get(m);
    const has = row.length > CLOSES_SLOT ? row[CLOSES_SLOT] : null;
    if (row.length > CLOSES_SLOT + 1) rowFaults.push(`${f} ${k} (${m}): ${row.length} slots`);
    if (!L) { if (has !== null || row.length > CLOSES_SLOT) rowFaults.push(`${f} ${k} (${m}): a row of a source no list names carries the slot`); continue; }
    const c = (recount[m] ||= { rows: 0, route: 0, definition: 0, either: 0 });
    c.rows += 1;
    const r = lineOf(L, row[1]), d = lineOf(L, row[2]);
    if (r) c.route += 1;
    if (d) c.definition += 1;
    if (r || d) c.either += 1;
    const want = r || d ? [r ? r.closes : null, d ? d.closes : null] : null;
    if (!same(has, want)) rowFaults.push(`${f} ${k} (${m}, rank ${row[0]}): the lists give ${JSON.stringify(want)}, the row carries ${JSON.stringify(has)}`);
    if (r && Array.isArray(row[8])) rowFaults.push(`${f} ${k} (${m}, rank ${row[0]}): a print slot and a close on the route text`);
    if (r && Array.isArray(row[7]) && r.closes.some((x) => row[7].includes(x))) rowFaults.push(`${f} ${k} (${m}, rank ${row[0]}): a close stands at a mark the ledger divides at`);
    if (has) slotted.push([k, row]);
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
const ms = index.made_spaces || null;
const wantLists = [...LISTED.entries()].map(([m, L]) => ({ m, key: L.key, file: `reader/data/made-spaces-v1/${L.file}`, sha256: L.sha256 }));
const indexFaults = [];
if (!ms) indexFaults.push("the index names no made spaces (index.made_spaces)");
else {
  if (ms.rule_id !== MADE_SPACES_RULE_ID) indexFaults.push(`the index names the rule ${ms.rule_id}`);
  if (!same(ms.lists, wantLists)) indexFaults.push("the index does not name the pinned lists by their sha256");
  const t = ms.totals || {};
  if (t.rows_of_listed_sources !== total("rows") || t.rows_carrying_the_slot !== total("either") || t.rows_with_a_close_on_the_route_text !== total("route") || t.rows_with_a_close_on_the_definition_text !== total("definition"))
    indexFaults.push(`the index's totals (${t.rows_of_listed_sources}, ${t.rows_carrying_the_slot}, ${t.rows_with_a_close_on_the_route_text}, ${t.rows_with_a_close_on_the_definition_text}) are not a recount's (${total("rows")}, ${total("either")}, ${total("route")}, ${total("definition")})`);
}
check("M4  the store's index names the rule and the lists, and its totals are a recount's", indexFaults.length === 0,
  indexFaults.length ? first(indexFaults) : `applied ${String(ms.applied_on).slice(0, 10)} · store ${ms.store_version_before} -> ${ms.store_version}`);

// ---- M5: the corpus lane's own counts -------------------------------------------------------
// the rows are the rows the lists were read from while nothing has changed the store since the slot was written on that version
const listedAt = (((theirs.inputs || {}).route_store || {}).store_version) || null;
const sameRows = !!ms && ms.store_version_before === listedAt && ms.store_version === index.store_version;
const comma = / ,/u;
const still = {};   // m id -> rows that still print a space before a comma: [in the route as printed, in the record as printed]
for (const [, row] of slotted) {
  const s = (still[String(row[3])] ||= [0, 0]);
  if (lineOf(LISTED.get(String(row[3])), row[1]) && comma.test(routePrinted(row))) s[0] += 1;
  if (row[2] && lineOf(LISTED.get(String(row[3])), row[2]) && comma.test(recordPrinted(row))) s[1] += 1;
}
const countFaults = [], said = [];
for (const [m, L] of LISTED) {
  const stated = ((L.theirs.rows_axis || {}).route_store) || {}, c = recount[m] || { route: 0, definition: 0, either: 0 }, s = still[m] || [0, 0];
  const sc = stated.space_before_a_comma || {};
  const pairs = [["rows with a close on the route text", c.route, stated.field_1_holds_a_close], ["on the definition text", c.definition, stated.field_2_holds_a_close], ["on either", c.either, stated.either_holds_a_close],
    ["rows whose route still prints a space before a comma", s[0], (sc.field_1 || {}).rows_that_still_print_one_after_closing], ["rows whose definition still does", s[1], (sc.field_2 || {}).rows_that_still_print_one_after_closing]];
  for (const [what, here, there] of pairs) if (here !== there) countFaults.push(`${m}: ${what} ${here} here, ${there} in the corpus lane's receipt`);
  said.push(`${m} ${nf(c.route)}/${nf(c.definition)}/${nf(c.either)} rows close, ${s[0]} and ${s[1]} still print a space before a comma (the provider's own)`);
}
if (sameRows) check("M5  the corpus lane's own counts are the store's: the rows that hold a close, and the rows that still print a space before a comma once closed", countFaults.length === 0,
  countFaults.length ? first(countFaults) : `${said.join(" · ")} · the store's rows are the rows the lists were read from (${listedAt})`);
else console.log(`  --  M5  said, not judged: the store has moved on from the version the lists were read from (${listedAt}; the slot was written on ${ms ? ms.store_version_before : "none"}, the store is ${index.store_version}) · ${said.join(" · ")}${countFaults.length ? ` · ${countFaults.length} of the corpus lane's counts differ now` : ""}`);

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
  const want = pieces.map((x) => x.trim()).filter(Boolean);
  if (!same(store.readingsOf(row), want)) printFaults.push(`${where}: the readings are ${JSON.stringify(store.readingsOf(row)).slice(0, 80)}, the printed route cut at its marks gives ${JSON.stringify(want).slice(0, 80)}`);
}
check("M6  by a second road: a row's route and record print as their lines' `prints`, and its readings are that printed route cut at the row's own marks", printFaults.length === 0,
  printFaults.length ? `${printFaults.length} · ${first(printFaults)}` : `${nf(slotted.length)} rows`);

// ---- M7: the page's functions -------------------------------------------------------------------
{
  const zone = readFileSync(join(K3, "zone.html"), "utf8");
  const grab = (head, end) => { const a = zone.indexOf(head); if (a < 0 || zone.indexOf(head, a + 1) >= 0) throw new Error(`zone.html does not hold exactly one "${head.trim()}"`); const b = zone.indexOf(end, a); return zone.slice(a, b + end.length); };
  let page = null, why = "";
  try {
    page = new Function("index", `${grab("\n  const closed = (text, places, from = 0, to = text.length) => {\n", "\n  };\n")}${grab("\n  const routePrinted = (row) => ", ";\n")}${grab("\n  const recordPrinted = (row) => ", ";\n")}${grab("\n  const readingsOfRow = (row) => {\n", "\n  };\n")} return { routePrinted, recordPrinted, readingsOfRow };`)(index);
  } catch (e) { why = e.message; }
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
// served words whose card holds a row of a listed source that the ledger leaves whole, whose route closes, and
// whose closed reading no other row of the key prints: so its pill stands on that row alone, and the record under
// the pill is that row's
const picks = [];
{
  const seen = new Set();
  outer: for (const b of zonesServed()) {
    const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${b}.bin`))).toString("utf8"));
    for (const [si, sec] of (z.sections || []).entries()) for (const [e, w] of (sec.words || []).entries()) {
      if (!w.k || w.w || seen.has(w.k) || !stale.has(w.k)) continue;
      const rows = (store.routesFor(w.k) || []).filter((r) => index.m_sources[r[3]]);
      const row = rows.find((r) => LISTED.has(String(r[3])) && r.length > CLOSES_SLOT && r[CLOSES_SLOT][0] && !Array.isArray(r[7]) && !Array.isArray(r[8])
        && readingKey(String(r[1]).trim()) !== readingKey(routePrinted(r).trim())
        && !rows.some((o) => o !== r && store.readingsOf(o).some((x) => readingKey(x) === readingKey(routePrinted(r).trim()))));
      if (!row) continue;
      seen.add(w.k);
      picks.push({ book: b, section: si, entry: e, label: sec.label, key: w.k, m: String(row[3]), label_of_m: index.m_sources[row[3]].label,
        printed: printedForm(routePrinted(row).trim()), record: printedForm(recordPrinted(row)), piece: row[5] === 1, was: [...stale.get(w.k)] });
      if (picks.length >= 6) break outer;
    }
  }
}
if (!picks.length) check("M10 on the page, a card that holds such a row prints it closed", false, "no served word carries a whole row whose route closes and whose closed reading stands on it alone");
else {
  const tree = await serveTree(K3);
  const pw = await loadPlaywright();
  const browser = await pw.chromium.launch(launchOptions());
  const faults = [], seenOn = [];
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
          let record = null, cut = null;
          if (mine) {
            mine.click();
            await turn(); await turn();
            const d = hud.querySelector(".d-card .d-body .d-text");
            record = d ? d.textContent : null;
            cut = !!hud.querySelector(".d-card .d-cut");
          }
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          return { said, record, cut, found: !!mine };
        }, pick);
        const where = `${pick.book} ${pick.label}, entry ${pick.entry} (${pick.key})`;
        if (errors.length) faults.push(`${where}: the page threw: ${errors[0]}`);
        if (got.fault) { faults.push(`${where}: ${got.fault}`); continue; }
        pills += got.said.length;
        for (const [text] of got.said) if (pick.was.includes(readingKey(text))) faults.push(`${where}: a pill prints «${text.slice(0, 50)}», a reading as it stood before closing`);
        if (!got.found) continue;   // the card opened on a division of the word, where the whole form's rows are a press away
        seenOn.push(where);
        if (got.record !== pick.record) faults.push(`${where}: under «${pick.printed.slice(0, 40)}» the record prints «${String(got.record).slice(0, 60)}», and as printed it is «${pick.record.slice(0, 60)}»`);
        // the reading is the row's whole route as it prints, so the card calls it a piece of its record only where the store marks the row as one
        if (got.cut !== pick.piece) faults.push(`${where}: the card ${got.cut ? "says" : "does not say"} «${pick.printed.slice(0, 40)}» is a piece cut out of its record, and the store ${pick.piece ? "marks" : "does not mark"} the row as one`);
      } finally { await ctx.close(); }
    }
  } finally { await browser.close().catch(() => {}); await tree.close(); }
  check("M10 on the page, with every switch lifted: no pill prints a reading as it stood before closing; the closed reading stands on a pill of its source, the record under it is the definition as it prints, and it is called a piece only where the store marks it one", faults.length === 0 && seenOn.length > 0,
    faults.length ? `${faults.length} · ${first(faults)}` : !seenOn.length ? `${picks.length} words pressed and none of their cards offered the row` : `${picks.length} words pressed · ${nf(pills)} pills read · the closed reading and its record stood on ${seenOn.length} of the cards (${seenOn[0]})`);
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
