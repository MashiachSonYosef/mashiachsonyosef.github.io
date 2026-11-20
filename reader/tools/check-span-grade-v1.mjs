#!/usr/bin/env node
// RUN: tree
// GUARDS: span-grade-rule-v1-a-joined-reading-with-no-pointing-or-pointed-otherwise-where-step-tags-its-words-as-separate-entries-rests-held-back, span-line-rule-v1-a-pointer-leads-no-joined-line-and-under-only-nor-does-a-row-its-place-holds-back, span-order-rule-v1-a-span-row-is-ordered-as-every-row-is-the-tier-before-1940-the-year-then-the-rank
// LEDGER: -
// no frame letter. A check reads the pin, the span store, the zones and the
// pages and judges them; it is not the ledger for one.
//
// A JOINED READING POINTED OTHERWISE RESTS HELD BACK WHERE STEP TAGS ITS
// WORDS AS SEPARATE ENTRIES, AND ONE WITH NO POINTING RESTS HELD BACK. The
// corpus lane graded every row of the span store at every place where it joins
// words (relay v169, data/span-grade/); the owner took card 1 of the four
// cards of 16 November 2026 and that morning's call on a row with no pointing
// (task 134); tools/apply-span-grade-v1.mjs writes on each place of the span
// store the rows it holds back under «only this pointing» (held), and the
// reader leaves them out of the run's card at that place and counts them.
//
// What is held here, each recomputed and none read from a tool's receipt:
//
//   G1  the pin: the list, its rule, its receipt and the two files beside
//       them are the bytes the pin names; the lane's receipt names the list
//       and the rule by the pin's figures, and its second count agrees with
//       that list
//   G2  the list recounted: one line per place, every row graded same, same
//       word, silent or otherwise, counted as the lane's receipt counts them
//   G3  the places: every line finds exactly one served place (its book,
//       verse, first and last word and key, and the rows it grades in the
//       place's order, each under its source), and every served place is
//       found by exactly one line; the book files, every held set aside, are
//       the bytes the lane graded, or the receipt says the store moved
//   G4  held: every place holds back exactly the rows the rule gives,
//       recomputed here from the list and STEP's tags on the zones' words (a
//       silent row; an otherwise row where the place's words, every one
//       tagged, share no number, STEP's letter set aside); no other row, no
//       empty held, no other why
//   G5  the counts: the span store's index (span_grade) and the receipt name
//       the rule and the list by its sha256 and state the counts recounted
//       here, by why, by what STEP's tags say and by source
//   G6  on the page, under «only»: at each card the pin names, and at the
//       first place of the data whose held holds a silent row that rests
//       open and whose reading no row it keeps prints, the run's joined rung
//       leaves out every reading only rows the place holds back print, keeps
//       every reading a row it keeps prints (as «keep» shows it), and counts
//       what it held back by why (window.__spanHeld); the named reading is
//       absent or stands as the pin names it
//   G7  under «keep» the same cards hold nothing back, and every reading the
//       place holds back stands (one the record of dictionary kinds rests shut
//       at rest aside: under «keep» it rests shut as before, the named reading
//       too where only rows that rest shut print it)
//   G8  the line's row: on each book opened, for every key of its file, the
//       row a joined line over the key reads (window.__spanLine) is the first
//       of the key's resting rows that is no pointer (form_of): a pointer never
//       leads a line (v169, section 5)
//   G9  the order: at each card pressed, under «keep», where every pill is a
//       span row's reading, the pills stand in the page's order, as every
//       row's: the tier before 1940, the dated before the undated, the year,
//       then the rank, each reading with the oldest year and the lowest rank
//       of the key's rows that print it (v169, section 5, taken 16 November
//       2026; until then a span row's year ordered nothing)
//
// The places are found in the data, never named: the four cards are the
// pin's (named_cards), and the silent one is the first the data gives.
//
// Run: node tools/check-span-grade-v1.mjs [--node]   (SERVE_DIR=<a reader's
// folder> presses that folder's page instead of this checkout's, against
// this checkout's data: how a wrong page is shown red; --node judges G1 to
// G6's cards and opens no page)
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { numberOf } from "./entry-gate-v1.mjs";
import { openRouteStore, factsOf } from "./gloss-store-v1.mjs";
import { readKinds, restsOffOf } from "./dictionary-kinds-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";

const RULE_ID = "span-grade-rule-v1-a-joined-reading-with-no-pointing-or-pointed-otherwise-where-step-tags-its-words-as-separate-entries-rests-held-back";
const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const PINS = join(K3, "data", "span-grade");
const SPAN = join(K3, "data", "span-store");
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const nf = (x) => Number(x).toLocaleString("en-US");
const first = (xs, k = 3) => xs.slice(0, k).join(" | ") + (xs.length > k ? ` (and ${nf(xs.length - k)} more)` : "");
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ");
const low = (t) => spanJoin(t).toLowerCase();
if (!existsSync(join(PINS, "PIN.json"))) { console.log("SKIPPED — no span grade on this disk (data/span-grade/PIN.json)"); process.exit(3); }

// ---- G1: the pin ----------------------------------------------------------------------------------
const pin = JSON.parse(readFileSync(join(PINS, "PIN.json"), "utf8"));
const folder = join(PINS, pin.folder || "");
let lines = [], laneReceipt = null, laneVerify = null;
{
  const faults = [];
  try {
    readPinned(join(folder, pin.rule.file), pin.rule);
    lines = readPinnedLines(join(folder, pin.list.file), pin.list);
    laneReceipt = JSON.parse(readPinned(join(folder, pin.receipt.file), pin.receipt).toString("utf8"));
    for (const b of pin.beside || []) { const bytes = readPinned(join(folder, b.file), b); if (/^verify-receipt/u.test(b.file)) laneVerify = JSON.parse(bytes.toString("utf8")); }
  } catch (e) { if (e instanceof PinFault) faults.push(e.message); else throw e; }
  const out = laneReceipt && (laneReceipt.outputs || [])[0];
  if (laneReceipt && (!out || out.sha256 !== pin.list.sha256 || out.bytes !== pin.list.bytes || out.lines !== pin.list.lines)) faults.push("the lane's receipt names another list than the pin's");
  if (laneReceipt && (laneReceipt.rule || {}).sha256 !== pin.rule.sha256) faults.push("the lane's receipt names another rule than the pin's");
  if (!laneVerify || laneVerify.verdict !== "AGREE" || ((laneVerify.checked || {}).list || {}).sha256 !== pin.list.sha256) faults.push("the lane's second count does not agree with the pin's list");
  check("G1  the pin: the list, its rule, its receipt and the files beside them are the bytes it names; the lane's receipt names the list and the rule so, and its second count agrees", faults.length === 0,
    faults.length ? first(faults) : `relay ${pin.relay} · ${nf(pin.list.lines)} lines · ${2 + (pin.beside || []).length + 1} files`);
}

// ---- G2: the list recounted ---------------------------------------------------------------------------
const GRADES = ["same", "same word", "silent", "otherwise"];
{
  const by = Object.fromEntries(GRADES.map((g) => [g, 0]));
  let odd = 0;
  for (const o of lines) for (const r of o.rows || []) { if (by[r.grade] === undefined) odd += 1; else by[r.grade] += 1; }
  const said = (laneReceipt && laneReceipt.rows_by_grade) || {};
  check("G2  the list recounted: every row graded same, same word, silent or otherwise, counted as the lane's receipt counts them", lines.length > 0 && !odd && laneReceipt && laneReceipt.places === lines.length && GRADES.every((g) => said[g] === by[g]),
    `${nf(lines.length)} places · ${GRADES.map((g) => `${g} ${nf(by[g])}`).join(", ")}${odd ? ` · ${odd} rows of no grade the rule names` : ""} (the lane's receipt: ${GRADES.map((g) => nf(said[g] ?? 0)).join(", ")})`);
}

// ---- G3: the places ---------------------------------------------------------------------------------
const books = new Map();   // book -> { f, file }
for (const f of readdirSync(SPAN).filter((x) => /^[a-z0-9-]+\.json$/u.test(x) && x !== "index.json").sort()) {
  const file = JSON.parse(readFileSync(join(SPAN, f), "utf8"));
  books.set(file.book, { f, file });
}
const lineOf = new Map();   // place -> line
{
  const faults = [];
  for (const o of lines) {
    const b = books.get(o.book), [a, z] = [o.w[0], o.w[o.w.length - 1]];
    const at = `${o.book} ${o.ref} ${a}-${z}`;
    const here = b ? b.file.placesList.filter((pl) => pl.ref === o.ref && pl.first === a && pl.last === z && pl.key === o.key) : [];
    if (here.length !== 1) { faults.push(`${at}: served ${here.length} times`); continue; }
    const pl = here[0];
    if (lineOf.has(pl)) { faults.push(`${at}: graded twice`); continue; }
    if (JSON.stringify((o.rows || []).map((r) => r.row_id)) !== JSON.stringify(pl.row_ids)) { faults.push(`${at}: the line grades other rows than the place names`); continue; }
    const rows = new Map((b.file.keys[pl.key] || []).map((r) => [r.row_id, r]));
    if (o.rows.some((r) => !rows.has(r.row_id) || String(rows.get(r.row_id).slots[3]) !== String(r.m))) { faults.push(`${at}: a graded row stands under the key under another source, or not at all`); continue; }
    lineOf.set(pl, o);
  }
  let served = 0;
  for (const b of books.values()) for (const pl of b.file.placesList) { served += 1; if (!lineOf.has(pl)) faults.push(`${b.file.book} ${pl.ref} ${pl.first}-${pl.last}: a served place no line grades`); }
  // the lane's bytes: each book file with every held taken out, in the bake's own byte shape
  const laneBytes = (file) => JSON.stringify({ ...file, placesList: file.placesList.map((pl) => { const { held, ...rest } = pl; return rest; }) });
  const set = sha256(Buffer.from([...books.values()].map((b) => `${b.f} ${sha256(Buffer.from(laneBytes(b.file), "utf8"))}\n`).join(""), "utf8"));
  const readAs = ((laneReceipt && laneReceipt.inputs) || {}).span_store ? laneReceipt.inputs.span_store.books_sha256 : null;
  const receipt = existsSync(join(K3, "data", "span-grade-receipt-v1.json")) ? JSON.parse(readFileSync(join(K3, "data", "span-grade-receipt-v1.json"), "utf8")) : null;
  const saysMoved = !!(receipt && receipt.inputs && receipt.inputs.span_store && receipt.inputs.span_store.the_store_was_that_version === false && receipt.inputs.span_store.lane_books_sha256 === set);
  if (set !== readAs && !saysMoved) faults.push(`the book files, held set aside, are ${set.slice(0, 12)}, the lane graded ${String(readAs).slice(0, 12)}, and the receipt does not say the store moved`);
  check("G3  every line finds exactly one served place, with the rows it grades under their sources, and every served place is graded once; the book files, held set aside, are the bytes the lane graded", faults.length === 0 && served === lines.length,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(served)} places in ${books.size} book files · ${set === readAs ? "the lane's bytes, held set aside" : "the store moved, as the receipt says"}`);
}

// ---- G4: held, recomputed ------------------------------------------------------------------------------
const tagsOf = (word) => {
  if (!word) return [];
  const h = word.tg ? word : ((word.w || word.kqw || []).filter((r) => r && r.tg).find((r) => r.k === word.k) || (word.w || word.kqw || []).filter((r) => r && r.tg)[0]);
  return h ? [].concat(h.tg).map(String) : [];
};
const zoneCache = new Map();
const verseOf = (book, ref) => {
  if (!zoneCache.has(book)) {
    const p = join(K3, "data", "zones", `${book}.bin`);
    const m = new Map();
    if (existsSync(p)) for (const sec of JSON.parse(gunzipSync(readFileSync(p)).toString("utf8")).sections || []) m.set(String(sec.label), (sec.words || []).filter((w) => !w.mark));
    zoneCache.set(book, m);
  }
  return zoneCache.get(book).get(String(ref)) || [];
};
const want = new Map();   // place -> { held (object or null), says }
const recount = { held_otherwise: 0, held_silent: 0, otherwise: { one: 0, none: 0, several: 0 }, places_holding: 0, places_holding_every_row: 0, by_source: {} };
{
  const faults = [];
  for (const [pl, o] of lineOf) {
    const words = verseOf(o.book, o.ref).slice(pl.first - 1, pl.last);
    if (words.length !== pl.last - pl.first + 1) { faults.push(`${o.book} ${o.ref}: the zone has no word ${pl.last}`); continue; }
    // the place's numbers, word by word: STEP's tags with its letter set aside
    const nums = words.map((w) => [...new Set(tagsOf(w).map(numberOf).filter(Boolean))]);
    let says = "several";
    if (nums.some((n) => !n.length)) says = "none";
    else if (nums.slice(1).reduce((acc, n) => acc.filter((x) => n.includes(x)), nums[0]).length) says = "one";
    const held = {};
    for (const r of o.rows) {
      const s = (recount.by_source[r.m] ||= { otherwise: 0, silent: 0 });
      if (r.grade === "otherwise") recount.otherwise[says] += 1;
      if (r.grade === "silent") { held[r.row_id] = "silent"; recount.held_silent += 1; s.silent += 1; }
      if (r.grade === "otherwise" && says === "several") { held[r.row_id] = "otherwise"; recount.held_otherwise += 1; s.otherwise += 1; }
    }
    const n = Object.keys(held).length;
    if (n) recount.places_holding += 1;
    if (n && n === o.rows.length) recount.places_holding_every_row += 1;
    want.set(pl, { held: n ? held : null, says });
    const has = pl.held === undefined ? null : pl.held;
    if (has !== null && (typeof has !== "object" || !Object.keys(has).length)) faults.push(`${o.book} ${o.ref} ${pl.first}-${pl.last}: an empty or malformed held`);
    else if (JSON.stringify(has) !== JSON.stringify(n ? held : null)) faults.push(`${o.book} ${o.ref} ${pl.first}-${pl.last}: held ${JSON.stringify(has)}, and the rule gives ${JSON.stringify(n ? held : null)}`);
  }
  check("G4  every place holds back exactly the rows the rule gives, recomputed from the list and STEP's tags: a silent row, and an otherwise row where the place's words share no entry", faults.length === 0 && want.size === lineOf.size,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(recount.held_otherwise + recount.held_silent)} rows held at ${nf(recount.places_holding)} places: otherwise ${nf(recount.held_otherwise)} (of ${nf(recount.otherwise.one + recount.otherwise.none + recount.otherwise.several)}: STEP's one entry ${nf(recount.otherwise.one)}, a word with no tag ${nf(recount.otherwise.none)}, separate entries ${nf(recount.otherwise.several)}), silent ${nf(recount.held_silent)}`);
}

// ---- G5: the counts said ------------------------------------------------------------------------------------
{
  const faults = [];
  const ix = JSON.parse(readFileSync(join(SPAN, "index.json"), "utf8"));
  const sg = ix.span_grade || null;
  const rc = existsSync(join(K3, "data", "span-grade-receipt-v1.json")) ? JSON.parse(readFileSync(join(K3, "data", "span-grade-receipt-v1.json"), "utf8")) : null;
  const total = recount.held_otherwise + recount.held_silent;
  if (!sg) faults.push("the span store's index says nothing of the span grade");
  else {
    if (sg.rule_id !== RULE_ID || (sg.list || {}).sha256 !== pin.list.sha256) faults.push("the index names another rule or list");
    const c = sg.counts || {};
    if (c.rows_held !== total || c.rows_held_otherwise !== recount.held_otherwise || c.rows_held_silent !== recount.held_silent || c.places_holding_a_row !== recount.places_holding || c.places_holding_every_row !== recount.places_holding_every_row || c.places !== lineOf.size)
      faults.push(`the index counts ${JSON.stringify(c)}`);
  }
  if (!rc) faults.push("no receipt (data/span-grade-receipt-v1.json)");
  else {
    if (rc.rule_id !== RULE_ID || ((rc.inputs || {}).list || {}).sha256 !== pin.list.sha256) faults.push("the receipt names another rule or list");
    const c = rc.counts || {}, t = c.otherwise_rows_by_step_tags || {};
    const heldBy = (g) => (((c.by_grade || {})[g] || {}).held);
    if (c.rows_held !== total || heldBy("otherwise") !== recount.held_otherwise || heldBy("silent") !== recount.held_silent || heldBy("same") !== 0 || heldBy("same word") !== 0 || t["one entry"] !== recount.otherwise.one || t["a word with no tag"] !== recount.otherwise.none || t["separate entries"] !== recount.otherwise.several)
      faults.push("the receipt's counts are not a recount's");
    for (const [m, s] of Object.entries(recount.by_source)) { const r = (rc.by_source || {})[m] || {}; if ((r.held_otherwise || 0) !== s.otherwise || (r.held_silent || 0) !== s.silent) faults.push(`the receipt holds ${m} back ${r.held_otherwise || 0}+${r.held_silent || 0}, a recount ${s.otherwise}+${s.silent}`); }
  }
  check("G5  the span store's index and the receipt name the rule and the list, and state the counts a recount gives, by why, by what STEP's tags say and by source", faults.length === 0,
    faults.length ? first(faults) : `${nf(total)} rows held back: pointed otherwise ${nf(recount.held_otherwise)}, no pointing ${nf(recount.held_silent)}`);
}

// ---- the cards to press -----------------------------------------------------------------------------
const store = openRouteStore(join(K3, "data", "route-store"));
// a span row the record of dictionary kinds rests shut stands on no card at rest, under «keep» either (dictionary-
// kinds-rule-v1): a span row carries its source's own M and no facts, and rests shut only on a book baked at rest
const restsOff = restsOffOf(readKinds(join(K3, "data")).rec, JSON.parse(readFileSync(join(K3, "data", "route-store", "index.json"), "utf8")).m_sources, factsOf);
const atRestCache = new Map();
const atRest = (book) => {
  if (!atRestCache.has(book)) { const p = join(K3, "data", "zones", `${book}.bin`); atRestCache.set(book, existsSync(p) && !!(JSON.parse(gunzipSync(readFileSync(p)).toString("utf8")).emitted_from || {}).rests_off); }
  return atRestCache.get(book);
};
const shut = (book, r) => atRest(book) && !!restsOff(r.slots);
const placeIn = (book, ref, a, z) => { const b = books.get(book); return b ? b.file.placesList.find((pl) => pl.ref === ref && pl.first === a && pl.last === z) || null : null; };
// a place's readings, as the page draws a row's (the store's readingsOf: the ledger's division where its source has one)
const readingsAt = (book, pl) => {
  const rows = new Map((books.get(book).file.keys[pl.key] || []).map((r) => [r.row_id, r]));
  const held = (want.get(pl) || {}).held || {};
  const heldR = new Set(), keptR = new Set(), openR = new Set(), restsOpenR = new Set();
  for (const id of pl.row_ids) {
    const r = rows.get(id); if (!r) continue;
    for (const x of store.readingsOf(r.slots)) { (held[id] ? heldR : keptR).add(low(x)); if (held[id] && !shut(book, r)) openR.add(low(x)); if (!shut(book, r)) restsOpenR.add(low(x)); }
  }
  // heldOnly: printed by no row the place keeps; heldOpen: and by a held row that rests open, so «keep» shows it;
  // restsOpen: every reading a row of the place that rests open prints, held or kept
  return { heldOnly: [...heldR].filter((x) => !keptR.has(x)), heldOpen: [...openR].filter((x) => !keptR.has(x)), kept: [...keptR], restsOpen: [...restsOpenR], held };
};
const cards = [];
{
  const faults = [];
  for (const c of pin.named_cards || []) {
    const pl = placeIn(c.book, c.ref, c.words[0], c.words[1]);
    if (!pl) { faults.push(`${c.book} ${c.ref}: no place at words ${c.words.join("-")}`); continue; }
    const r = readingsAt(c.book, pl);
    const isHeld = r.heldOnly.includes(low(c.reads)), stands = r.kept.includes(low(c.reads));
    if (c.under_only === "held" ? !isHeld : !stands) { faults.push(`${c.book} ${c.ref}: the pin names «${c.reads}» ${c.under_only === "held" ? "held back" : "standing"} under «only», and the list and the zones give it ${isHeld ? "held back" : stands ? "standing" : "nowhere"}`); continue; }
    cards.push({ book: c.book, pl, reads: c.reads, under_only: c.under_only, ...r, why: "named" });
  }
  // the first place of the data whose held holds a silent row whose reading no row it keeps prints
  outer: for (const [book] of [...books].sort((a, b) => (a[0] < b[0] ? -1 : 1))) for (const pl of books.get(book).file.placesList) {
    const w = want.get(pl);
    if (!w || !w.held || !Object.values(w.held).includes("silent")) continue;
    const r = readingsAt(book, pl);
    const rows = new Map((books.get(book).file.keys[pl.key] || []).map((x) => [x.row_id, x]));
    const silentOnly = r.heldOpen.find((x) => Object.entries(w.held).some(([id, why]) => why === "silent" && !shut(book, rows.get(id)) && store.readingsOf(rows.get(id).slots).some((y) => low(y) === x)));
    if (!silentOnly) continue;
    cards.push({ book, pl, reads: silentOnly, under_only: "held", ...r, why: "the first silent" });
    break outer;
  }
  check("G6  (the cards) the pin's named cards are given so by the list and the zones, and the data gives a silent card", faults.length === 0 && cards.some((c) => c.why === "the first silent") && cards.length === (pin.named_cards || []).length + 1,
    faults.length ? first(faults) : cards.map((c) => `${c.book} ${c.pl.ref} «${c.reads}» ${c.under_only}`).join(" · "));
}

// ---- G6, G7, G8: on the page ---------------------------------------------------------------------------
if (process.argv.includes("--node")) console.log("  --  G6 to G9, the page's laws, not judged (--node)");
else if (cards.length) {
  const tree = process.env.SERVE_DIR ? await serveTree(process.env.SERVE_DIR) : await serveTree(K3);
  const pw = await loadPlaywright();
  const browser = await pw.chromium.launch(launchOptions());
  // a card at a place: its run's joined rung pressed, what it offers and what it says it held back
  const press = async (page, c) => page.evaluate(async (c) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const sec = [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === c.ref);
    if (!sec) return { fault: "no section" };
    // only the verse asked for is built: a section builds as it comes near the window
    { let g = 0; while (g < 400 && (sec.classList.contains("seg-wait") || !sec.querySelector(".he-text .wb"))) { sec.scrollIntoView({ block: "center" }); await sleep(25); g += 1; } }
    const cell = [...sec.querySelectorAll(".wjoin")].find((x) => x.__run && x.__run.span && x.__run.span.ref === c.ref && x.__run.span.first === c.first && x.__run.spanKey === c.key);
    const wb = [...sec.querySelectorAll(".he-text .wb:not(.mark)")][c.first - 1];
    const el = cell ? cell.querySelector(".wb .w") : wb && wb.querySelector(".w");
    if (!el) return { fault: "no word to press" };
    el.scrollIntoView({ block: "center" }); el.click();
    const h = document.getElementById("hud");
    const ready = () => !h.querySelector(".r-wait") && !!h.querySelector(".r-pills button, .sources-withheld, .b-read p:not(.r-label)");
    let t = Date.now(); await sleep(150); while (Date.now() - t < 12000 && !ready()) await sleep(50);
    const rung = [...h.querySelectorAll(".b-chain .s-pills button, .b-cut .s-pills button")].find((x) => x.textContent.trim() === c.key);
    if (!rung) return { fault: "the card offers no rung of the place's key" };
    if (rung.getAttribute("aria-pressed") !== "true") { rung.click(); t = Date.now(); await sleep(250); while (Date.now() - t < 12000 && !ready()) await sleep(50); }
    await sleep(300);
    const out = { pool: [...(window.__pool || [])], ov: [...(window.__poolOv || [])], pills: [...h.querySelectorAll(".r-pills button")].map((x) => x.textContent.trim()), held: window.__spanHeld || null, said: ((h.querySelector(".sources-withheld") || h.querySelector(".withheld-line") || {}).textContent || "").trim() };
    if (!out.pills.length) { out.pool = []; out.ov = []; }
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await sleep(150);
    return out;
  }, { ref: c.pl.ref, first: c.pl.first, key: c.pl.key });
  const open = async (book, masorah) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript((m) => { try { localStorage.clear(); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); localStorage.setItem("fh.masorah", m); } catch { /* a fresh reader */ } }, masorah);
    await page.goto(`${tree.base}/zone.html?b=${book}`, { waitUntil: "networkidle" });
    await page.waitForSelector("section.seg .he-text .wb");
    return { page, errors };
  };
  const g6 = [], g7 = [], g8 = { keys: 0, pointerFirst: 0, faults: [] }, g9 = [];
  try {
    for (const book of [...new Set(cards.map((c) => c.book))]) {
      const here = cards.filter((c) => c.book === book);
      const got = {};
      for (const m of ["only", "keep"]) {
        const { page, errors } = await open(book, m);
        got[m] = [];
        for (const c of here) got[m].push(await press(page, c));
        if (m === "only") {
          // G8, on this book: the line's row for every key of its file
          const keys = Object.keys(books.get(book).file.keys);
          const answers = await page.evaluate((keys) => keys.map((k) => (window.__spanLine ? window.__spanLine(k) : null)), keys);
          keys.forEach((k, i) => {
            const a = answers[i];
            g8.keys += 1;
            if (!a) { g8.faults.push(`${book} ${k}: the page answers nothing for the line's row`); return; }
            const formOf = new Set(books.get(book).file.keys[k].filter((r) => r.form_of).map((r) => r.row_id));
            const wantId = a.rows.find((id) => !formOf.has(id)) || null;
            if (a.rows.length && formOf.has(a.rows[0])) g8.pointerFirst += 1;
            if (a.line !== wantId) g8.faults.push(`${book} ${k}: the line reads ${a.line}, and the first resting row that is no pointer is ${wantId}`);
          });
        }
        if (errors.length) (m === "only" ? g6 : g7).push({ ok: false, say: `${book}: page error ${errors[0]}` });
        await page.close();
      }
      here.forEach((c, i) => {
        const only = got.only[i], keep = got.keep[i];
        const at = `${book} ${c.pl.ref} ${c.pl.first}-${c.pl.last} (${c.why})`;
        if (only.fault || keep.fault) { g6.push({ ok: false, say: `${at}: ${only.fault || keep.fault}` }); return; }
        const poolOnly = new Set(only.pool.map(low)), poolKeep = new Set(keep.pool.map(low));
        // a reading only held rows print, on a pill that stands on span rows alone, is gone under «only»
        const spanOnlyOnly = new Set(only.pool.filter((x, j) => only.ov[j] === "span-store").map(low));
        const leaked = c.heldOnly.filter((x) => spanOnlyOnly.has(x));
        const lost = c.kept.filter((x) => poolKeep.has(x) && !poolOnly.has(x));
        const wantHeld = { otherwise: Object.values(c.held).filter((w) => w === "otherwise").length, silent: Object.values(c.held).filter((w) => w === "silent").length };
        const counted = !!only.held && only.held.otherwise === wantHeld.otherwise && only.held.silent === wantHeld.silent;
        const named = c.under_only === "held" ? !poolOnly.has(low(c.reads)) : poolOnly.has(low(c.reads));
        g6.push({ ok: !leaked.length && !lost.length && counted && named,
          say: `${at}: «${c.reads}» ${poolOnly.has(low(c.reads)) ? "stands" : "absent"} (named ${c.under_only}) · ${only.pool.length} readings · held back ${only.held ? `${only.held.otherwise} pointed otherwise, ${only.held.silent} no pointing` : "nothing said"} (the place: ${wantHeld.otherwise}, ${wantHeld.silent})${leaked.length ? ` · held readings still on the card: ${leaked.join(", ")}` : ""}${lost.length ? ` · kept readings gone: ${lost.join(", ")}` : ""}` });
        const back = c.heldOpen.filter((x) => !poolKeep.has(x));
        const keepHeld = !!keep.held && keep.held.otherwise === 0 && keep.held.silent === 0;
        // G9: the page's order over the key's rows that rest open (stopless: one closing stop is not another reading)
        const stopless = (t) => low(t).replace(/\.$/u, "");
        const yearOf = (r) => { const y = Number.parseInt(r.slots[4], 10); return Number.isInteger(y) ? y : Infinity; };
        const groups = new Map();
        for (const r of books.get(book).file.keys[c.pl.key] || []) {
          if (shut(book, r)) continue;
          for (const x of store.readingsOf(r.slots)) { const k = stopless(x), g = groups.get(k) || { k, year: Infinity, rank: Infinity }; g.year = Math.min(g.year, yearOf(r)); g.rank = Math.min(g.rank, Number(r.slots[0])); groups.set(k, g); }
        }
        const tier = (g) => (Number.isFinite(g.year) && g.year <= 1940 ? 0 : 1), dated = (g) => (Number.isFinite(g.year) ? 0 : 1);
        const order = [...groups.values()].sort((a, b) => tier(a) - tier(b) || dated(a) - dated(b) || (dated(a) ? 0 : a.year - b.year) || a.rank - b.rank).map((g) => g.k);
        const pills = keep.pool.map(stopless), judged = pills.length > 1 && keep.ov.length === pills.length && keep.ov.every((x) => x === "span-store") && pills.length === order.length;
        g9.push({ judged, ok: !judged || JSON.stringify(pills) === JSON.stringify(order), say: `${at}: ${!judged ? (pills.length > 1 ? "another store's row carries a reading too, not judged" : "one reading, nothing to order") : JSON.stringify(pills) === JSON.stringify(order) ? `${pills.length} pills in the page's order` : `pills ${pills.join(" | ")} against the page's order ${order.join(" | ")}`}` });
        // the named reading stands under «keep» where a row of the place that rests open prints it, and is absent
        // where only rows that rest shut print it (Deuteronomy 18:1's «the Jewish people», English Wiktionary's,
        // since the owner's twelve of 19 November 2026)
        const namedOpen = c.restsOpen.includes(low(c.reads));
        g7.push({ ok: !back.length && keepHeld && poolKeep.has(low(c.reads)) === namedOpen,
          say: `${at}: «${c.reads}» ${poolKeep.has(low(c.reads)) ? "stands" : "absent"}${namedOpen ? "" : " (only rows that rest shut print it)"} · ${keep.pool.length} readings · held back ${keep.held ? `${keep.held.otherwise}+${keep.held.silent}` : "nothing said"}${back.length ? ` · held readings missing: ${back.join(", ")}` : ""}` });
      });
    }
  } finally { await browser.close().catch(() => {}); await tree.close(); }
  check("G6  under «only» the run's joined rung leaves out every reading only the place's held rows print, keeps every reading a kept row prints, and counts what it held back by why; the named reading as the pin names it", g6.length > 0 && g6.every((x) => x.ok), g6.map((x) => x.say).join(" ‖ "));
  check("G7  under «keep» the same cards hold nothing back, and every reading the place holds back stands", g7.length > 0 && g7.every((x) => x.ok), g7.map((x) => x.say).join(" ‖ "));
  check("G8  the row a joined line reads is the first of the key's resting rows that is no pointer (form_of)", g8.keys > 0 && g8.faults.length === 0,
    g8.faults.length ? first(g8.faults) : `${nf(g8.keys)} keys on ${new Set(cards.map((c) => c.book)).size} books · ${nf(g8.pointerFirst)} whose first resting row is a pointer, which leads no line`);
  check("G9  under «keep» a span card's pills stand in the page's order, as every row's: the tier before 1940, the dated first, the year, then the rank", g9.some((x) => x.judged) && g9.every((x) => x.ok), g9.map((x) => x.say).join(" ‖ "));
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
