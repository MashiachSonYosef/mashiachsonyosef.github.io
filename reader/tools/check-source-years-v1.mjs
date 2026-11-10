#!/usr/bin/env node
// GUARDS: source-year-rule-v1-a-row-carries-its-sources-year-of-writing-and-an-older-witnesss-year-already-on-it-stands
// LEDGER: -
// no frame letter. A check reads the record and judges it; it is not the
// ledger for one.
//
// THE RULE (tools/apply-source-years-v1.mjs states it in full). The corpus
// lane's years list names the year each source's English was written, for
// the sources it can date. A row of a listed source carries that year in its
// year slot, in the route store and the span store, unless an older year
// already stood on the row: an older witness's year, which the store's fold
// wrote there and which stands until each source has its own row. A year
// that is a catalog's and not the book's own print says so on the card.
//
// The laws:
//
//   Y1  the years list is the bytes its pin names, and the store's index
//       carries its sources, years and marks as the list gives them
//   Y2  every row of a listed source, in the route store and the span
//       store, carries the source's year or an older one: none carries no
//       year, and none a later year
//   Y3  the rows that carry an older year are counted by source and year,
//       and the count is the receipt's
//   Y4  the page prints a mark beside a row's year where the index gives
//       one, and only where the row carries that source's own year
//   Y5  a year held off the rows (data/source-years-v1/HELD.json) says why
//       and until when, the index says the same, and no row of that source
//       carries the held year: the rows keep what they carried
//
// Usage: node tools/check-source-years-v1.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const LIST = join(K3, "data", "source-years-v1", "years-to-apply-v1.1.json"), PIN = join(K3, "data", "source-years-v1", "PIN.json");
const RECEIPT = join(K3, "data", "source-years-receipt-v1.json");
const HELD_FILE = join(K3, "data", "source-years-v1", "HELD.json");
const HELD = existsSync(HELD_FILE) ? (JSON.parse(readFileSync(HELD_FILE, "utf8")).held || {}) : {};
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  -  " + d : ""}`); };
if (!existsSync(LIST) || !existsSync(PIN)) { console.log("SKIPPED — no years list is here (data/source-years-v1/)"); process.exit(3); }
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const listBytes = readFileSync(LIST), pin = JSON.parse(readFileSync(PIN, "utf8")), list = JSON.parse(listBytes.toString("utf8"));
const index = JSON.parse(readFileSync(join(K3, "data", "route-store", "index.json"), "utf8"));
const sy = index.source_years || {};

// Y1
{
  const faults = [];
  if (sha256(listBytes) !== pin.sha256) faults.push("the list is not the bytes its pin names");
  if (!sy.list || sy.list.sha256 !== pin.sha256) faults.push("the index names another list");
  const want = Object.fromEntries(list.years.map((y) => [y.m, y]));
  const got = sy.sources || {};
  for (const [m, y] of Object.entries(want)) {
    const g = got[m];
    if (!g) { faults.push(`${m} is in the list and not in the index`); continue; }
    if (!!g.held !== !!HELD[m]) faults.push(`${m}: the index and the hold record disagree on whether its year is held`);
    if (g.year !== y.year || g.key !== y.key || g.basis !== y.basis || (g.mark_on_the_card || null) !== (y.mark_on_the_card || null)) faults.push(`${m}: the index gives ${g.year} (${g.mark_on_the_card || "no mark"}) and the list ${y.year} (${y.mark_on_the_card || "no mark"})`);
    if (((index.m_sources || {})[m] || {}).key !== y.key && !existsSync(join(K3, "data", "span-store", "index.json"))) faults.push(`${m} is not ${y.key} in the store`);
  }
  for (const m of Object.keys(got)) if (!want[m]) faults.push(`${m} is in the index and not in the list`);
  check("Y1  the years list is the bytes its pin names, and the index carries its sources, years and marks", !faults.length,
    faults.length ? faults.slice(0, 5).join(" · ") : `${list.years.length} sources · list sha256 ${pin.sha256.slice(0, 12)} (relay ${pin.relay})`);
}

// Y2, Y3: every row of a listed source
const YEARS = new Map(list.years.map((y) => [y.m, y.year]));
const older = {}; const faults = []; let rows = 0;
const heldRows = {}; const heldFaults = [];
const look = (slots, where) => {
  const year = YEARS.get(String(slots[3])); if (year === undefined) return;
  if (HELD[String(slots[3])]) {   // a held year is on no row of its source
    const t = (heldRows[slots[3]] ||= {}); t[String(slots[4])] = (t[String(slots[4])] || 0) + 1;
    if (String(slots[4]) === String(year) && heldFaults.length < 6) heldFaults.push(`${where}: a row of ${slots[3]} carries the held year ${year}`);
    return;
  }
  rows += 1;
  const s = String(slots[4] ?? ""), has = /^\d{3,4}$/u.test(s) ? Number(s) : null;
  if (has === null) { if (faults.length < 8) faults.push(`${where}: a row of ${slots[3]} carries ${JSON.stringify(slots[4])}`); else faults.push(""); return; }
  if (has > year) { if (faults.length < 8) faults.push(`${where}: a row of ${slots[3]} carries ${has}, later than its source's ${year}`); else faults.push(""); return; }
  if (has < year) { const o = (older[slots[3]] ||= {}); o[has] = (o[has] || 0) + 1; }
};
for (const f of readdirSync(join(K3, "data", "route-store", "shards")).filter((x) => x.endsWith(".bin"))) {
  const body = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "route-store", "shards", f))).toString("utf8"));
  for (const [k, rs] of Object.entries(body)) for (const r of rs) if (Array.isArray(r)) look(r, `store ${k}`);
}
const SPAN = join(K3, "data", "span-store");
if (existsSync(SPAN)) for (const f of readdirSync(SPAN).filter((x) => /^[a-z0-9-]+\.json$/u.test(x) && x !== "index.json")) {
  const file = JSON.parse(readFileSync(join(SPAN, f), "utf8"));
  for (const [k, rs] of Object.entries(file.keys || {})) for (const r of rs) if (r && Array.isArray(r.slots)) look(r.slots, `span store ${f.replace(/\.json$/u, "")} ${k}`);
}
check("Y2  every row of a listed source carries the source's year or an older one, in the store and the span store", rows > 0 && !faults.length,
  faults.length ? `${faults.length} rows off: ${faults.filter(Boolean).slice(0, 4).join(" · ")}` : `${rows.toLocaleString("en-US")} rows of ${YEARS.size - Object.keys(HELD).length} sources${Object.keys(HELD).length ? ` (${Object.keys(HELD).join(", ")} held: Y5)` : ""}`);
{
  const receipt = existsSync(RECEIPT) ? JSON.parse(readFileSync(RECEIPT, "utf8")) : null;
  const last = receipt && Array.isArray(receipt.runs) && receipt.runs.length ? receipt.runs[receipt.runs.length - 1] : null;
  const said = last ? Object.fromEntries(Object.entries(last.sources || {}).filter(([, s]) => Object.keys(s.kept_an_older_year || {}).length).map(([m, s]) => [m, s.kept_an_older_year])) : null;
  const norm = (o) => JSON.stringify(Object.fromEntries(Object.entries(o).sort().map(([m, ys]) => [m, Object.fromEntries(Object.entries(ys).map(([y, c]) => [String(y), c]).sort())])));
  const total = Object.values(older).reduce((a, ys) => a + Object.values(ys).reduce((x, y) => x + y, 0), 0);
  check("Y3  the rows that carry an older year are counted by source and year, and the count is the receipt's", !!said && norm(said) === norm(older),
    `${total.toLocaleString("en-US")} rows: ${Object.entries(older).map(([m, ys]) => `${m} ${Object.entries(ys).map(([y, c]) => `${y}×${c}`).join(" ")}`).join(" · ") || "none"}${said && norm(said) !== norm(older) ? ` · the receipt says ${norm(said)}` : ""}`);
}

// Y4: the page's own rule, read where it is written
{
  const page = readFileSync(join(K3, "zone.html"), "utf8");
  const reads = /const yearMarkOf = \(mId, y\) => \{[^}]*index\.source_years[^}]*mark_on_the_card[^}]*String\(s\.year\) === String\(y\)/su.test(page);
  const uses = (page.match(/yearSaid\(/gu) || []).length, tags = (page.match(/wordingTag\(/gu) || []).length;
  const marks = list.years.filter((y) => y.mark_on_the_card).map((y) => `${y.m} "${y.mark_on_the_card}"`);
  check("Y4  the page prints a mark beside a row's year where the index gives one, only where the row carries that source's own year", reads && uses >= 4 && tags >= 2,
    `${marks.length ? marks.join(", ") : "no source carries a mark"} · the card says a row's year through the rule at ${uses} places and a chip's title at ${tags}`);
}
// Y5
{
  const f = [...heldFaults];
  for (const [m, h] of Object.entries(HELD)) {
    if (!YEARS.has(m)) f.push(`${m} is held and the list does not name it`);
    if (!h.why || !h.until) f.push(`the hold on ${m} does not say why or until when`);
    const g = (sy.sources || {})[m];
    if (!g || !g.held || g.held.why !== h.why || g.held.until !== h.until) f.push(`the index does not carry the hold on ${m} as the record words it`);
  }
  check("Y5  a year held off the rows says why and until when, the index says the same, and no row carries it", !f.length,
    f.length ? f.slice(0, 4).join(" · ") : Object.keys(HELD).length ? Object.entries(HELD).map(([m, h]) => `${m} (${h.year}) until ${h.until}: its rows carry ${Object.entries(heldRows[m] || {}).map(([y, c]) => `${y}×${c}`).join(" ") || "nothing"}`).join(" · ") : "no year is held");
}
console.log(bad ? `FAIL — ${bad} law(s) of source-year-rule-v1 do not hold` : "PASS — every row of a dated source carries its year, and an older witness's year stands");
process.exit(bad ? 1 : 0);
