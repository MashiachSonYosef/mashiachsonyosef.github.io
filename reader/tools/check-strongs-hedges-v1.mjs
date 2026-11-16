#!/usr/bin/env node
// RUN: tree
// GUARDS: strongs-hedges-rule-v1-where-strongs-derivation-of-a-word-hedges-his-own-words-stand-under-his-reading-as-a-note
// LEDGER: -
// no frame letter. A check reads the ledger, the page's file, the store and
// the page, and judges them; it is not the ledger for one.
//
// WHERE STRONG SAYS HE IS NOT SURE, IN HIS OWN WORDS, UNDER HIS READING. The
// corpus lane's ledger (relay v170, data/strongs-hedges-v1/) names every
// entry and clause of Strong's dictionary whose text hedges; the owner took
// card 2 of the four cards on 16 November 2026 («ok go ahead»): under his
// reading on the card, at the 833 entries the store serves whose derivation
// hedges, a note in his own words, «Strong, on where the word comes from:
// probably of foreign derivation; perhaps meaning fire;» (H143), and no mark
// on the reading. tools/bake-strongs-hedges-v1.mjs bakes the page's file from
// the ledger; the page reads it (zone.html, WHERE STRONG SAYS HE IS NOT SURE).
//
//   H1  the pin's bytes: the ledger, its rule, its receipt and its second
//       count are the bytes the pin names, the ledger the sha256 the
//       relay's letter names; the receipt and the second count name the
//       ledger by those bytes, and the second count says AGREE
//   H2  every line, by a second road: the text is split into words at every
//       character that is not a Latin letter, and the hedge words the lane's
//       rule lists are found among them (the two words «or else» as two
//       neighbors, one space between); in the clause the page prints, every
//       one found is a hedge of the line at its place and the line names no
//       other; in the two other clauses every hedge the line names is one
//       found (the rule names eight that are not, all in those clauses)
//   H3  the page's file is the bytes its pin names, and is the ledger's lines
//       of the derivation whose entry the store serves, in the ledger's
//       order, each { text, hedges } as the ledger gives it; it names the
//       source by the key the store's index files it under and the m id the
//       index gives that key, who says the note as the owner's card names
//       him, and of what in the ledger's own words
//   H4  the join, said: a row of the source is of an entry where its facts
//       name it (row[10].n, the corpus lane's row entries ledger); how many
//       of the file's entries a row of the store reaches, by how many rows on
//       how many keys, and which entries none reaches
//   H5  on the page, with every switch lifted: the card of a served word
//       whose key holds a row of the source filed under H143 (the owner's
//       example), the pill of that row pressed: the pill prints the row's
//       reading and nothing of the note; the record carries one line of
//       Strong's derivation, its opening the file's own words, its note his
//       words byte for byte with the hedge words, and only they, in italics,
//       and the note names the source and the entry; then a pill of the same
//       source whose rows' entries do not hedge, pressed: no such line
//
// Run: node tools/check-strongs-hedges-v1.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore, factsOf, printedForm } from "./gloss-store-v1.mjs";
import { readPinned, readPinnedLines, PinFault } from "./pinned-v1.mjs";
import { STRONGS_HEDGES_RULE_ID, STRONGS_HEDGES_SOURCE_KEY, STRONGS_HEDGES_BY, STRONGS_HEDGES_CLAUSE, STRONGS_HEDGES_PAGE_SCHEMA } from "./bake-strongs-hedges-v1.mjs";
import { zonesServed } from "./zones-on-disk-v1.mjs";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { serveTree } from "./serve-tree-v1.mjs";
import { linesOnPage } from "./resting-lines-v1.mjs";
import { STATES } from "./card-readings-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const K3 = join(HERE, "..");
const PINS = join(K3, "data", "strongs-hedges-v1");
const STORE = join(K3, "data", "route-store");
// the ledger's sha256 as the relay's letter names it (FOR-ELIJAH-v170.md, section 7)
const LETTER_LEDGER_SHA256 = "342859133dbfd1186a32c0914a8c4139bdd57304d16296a75940a745cd1b7e15";
// the entry the owner's card 2 gives as its example
const EXAMPLE = "H143";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const nf = (x) => Number(x).toLocaleString("en-US");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const first = (list, n = 3) => list.slice(0, n).join(" · ");

console.log(`— ${STRONGS_HEDGES_RULE_ID} —\n`);
if (!existsSync(join(PINS, "PIN.json"))) { console.log("SKIPPED — no pin of Strong's hedges on this disk (data/strongs-hedges-v1/PIN.json)"); process.exit(3); }
const pin = JSON.parse(readFileSync(join(PINS, "PIN.json"), "utf8"));

// ---- H1: the pin's bytes --------------------------------------------------------------------
const pinFaults = [];
const take = (entry, lines = false) => {
  if (!entry || !entry.file) { pinFaults.push("the pin names a file it does not give"); return null; }
  try { return lines ? readPinnedLines(join(PINS, entry.file), entry) : readPinned(join(PINS, entry.file), entry); } catch (e) { if (e instanceof PinFault) { pinFaults.push(e.message); return null; } throw e; }
};
if (pin.schema_version !== "STRONGS_HEDGES_PIN_V1" || pin.rule_id !== STRONGS_HEDGES_RULE_ID) pinFaults.push("the pin is not a pin of Strong's hedges under this rule");
take(pin.rule);
const receiptBytes = take(pin.receipt), secondBytes = take(pin.second_count);
const lines = take(pin.ledger, true) || [];
if ((pin.ledger || {}).sha256 !== LETTER_LEDGER_SHA256) pinFaults.push(`the pin names the ledger as ${String((pin.ledger || {}).sha256).slice(0, 12)}, and the relay's letter as ${LETTER_LEDGER_SHA256.slice(0, 12)}`);
const receipt = receiptBytes ? JSON.parse(receiptBytes.toString("utf8")) : {}, second = secondBytes ? JSON.parse(secondBytes.toString("utf8")) : {};
const out0 = (receipt.outputs || []).find((o) => o.file === (pin.ledger || {}).file);
if (!out0 || out0.sha256 !== pin.ledger.sha256 || out0.bytes !== pin.ledger.bytes || out0.lines !== pin.ledger.lines) pinFaults.push("the lane's receipt does not name the ledger by its pinned bytes");
if (!receipt.rule || receipt.rule.sha256 !== (pin.rule || {}).sha256) pinFaults.push("the lane's receipt names another rule than the pinned one");
if (second.verdict !== "AGREE" || ((second.checked || {}).list || {}).sha256 !== (pin.ledger || {}).sha256) pinFaults.push(`the lane's second count does not AGREE with the pinned ledger (${second.verdict})`);
check("H1  the ledger, its rule, its receipt and its second count are the bytes the pin names, the ledger the bytes the relay's letter names; the receipt and the second count name it so, and the second count says AGREE", pinFaults.length === 0,
  pinFaults.length ? first(pinFaults) : `relay ${pin.relay} · ${nf(lines.length)} lines · ${pin.ledger.sha256.slice(0, 12)}`);

// ---- H2: every line, by a second road ----------------------------------------------------------
// the lane's list of hedge words (its RULE.md, «A hedge»), as its receipt gives it
const WORDS = Array.isArray(receipt.hedge_words) ? receipt.hedge_words : [];
const singles = new Set(WORDS.filter((w) => !w.includes(" ")).map((w) => w.toLowerCase()));
const pairs = WORDS.filter((w) => w.includes(" ")).map((w) => w.toLowerCase().split(" "));
const latin = (c) => /^[A-Za-z]$/u.test(c);
// the hedge words of a text, read character by character: [word as written, start, end]
const foundIn = (text) => {
  const words = [];
  for (let i = 0; i < text.length;) {
    if (!latin(text[i])) { i += 1; continue; }
    let j = i;
    while (j < text.length && latin(text[j])) j += 1;
    words.push([text.slice(i, j), i, j]);
    i = j;
  }
  const out = [];
  words.forEach(([w, a, b], x) => {
    if (singles.has(w.toLowerCase())) out.push([w, a, b]);
    const next = words[x + 1];
    for (const [p, q] of pairs) if (w.toLowerCase() === p && next && next[0].toLowerCase() === q && text.slice(b, next[1]) === " ") out.push([text.slice(a, next[2]), a, next[2]]);
  });
  return out.sort((u, v) => u[1] - v[1]);
};
const lineFaults = [];
let found = 0;
for (const [at, l] of lines.entries()) {
  const where = `line ${at + 1} (${l.entry} ${l.clause})`;
  if (typeof l.text !== "string" || !Array.isArray(l.hedges) || !l.hedges.length) { lineFaults.push(`${where}: no text or no hedges`); continue; }
  const here = foundIn(l.text), named = l.hedges.map((h) => [h.word, ...(Array.isArray(h.at) ? h.at : [])]);
  found += here.length;
  if (l.clause === STRONGS_HEDGES_CLAUSE) { if (!same(here, named)) lineFaults.push(`${where}: the line names ${JSON.stringify(named)}, and the words read here are ${JSON.stringify(here)}`); }
  else if (!named.every((h) => here.some((x) => same(x, h)))) lineFaults.push(`${where}: a hedge the line names is not a hedge word at its place`);
}
check("H2  every line, by a second road (the text read word by word): in the derivation every hedge word is a hedge of the line at its place and the line names no other; in the meaning and the renderings every hedge the line names is a hedge word there", lines.length > 0 && WORDS.length > 0 && lineFaults.length === 0,
  !WORDS.length ? "the receipt lists no hedge words" : lineFaults.length ? `${lineFaults.length} · ${first(lineFaults)}` : `${nf(lines.length)} lines · ${nf(found)} hedge words read`);

// ---- H3: the page's file ------------------------------------------------------------------------
const store = openRouteStore(STORE);
const index = store.index;
const pageFaults = [];
const made = (pin.made_here || {}).page || null;
let file = null;
if (!made) pageFaults.push("the pin names no page's file (made_here.page)");
else { const b = take(made); if (b) { try { file = JSON.parse(b.toString("utf8")); } catch (e) { pageFaults.push(`the page's file is not JSON (${e.message})`); } } else pageFaults.push(`the page's file is not the bytes the pin names (${made.file})`); }
const servedSource = lines.filter((l) => l.clause === STRONGS_HEDGES_CLAUSE && l.served === true);
const ms = Object.entries(index.m_sources || {}).filter(([, s]) => s && s.key === STRONGS_HEDGES_SOURCE_KEY).map(([m]) => m);
if (file) {
  if (file.schema_version !== STRONGS_HEDGES_PAGE_SCHEMA || file.rule_id !== STRONGS_HEDGES_RULE_ID) pageFaults.push("the file is not of this rule");
  if (!file.source || file.source.key !== STRONGS_HEDGES_SOURCE_KEY || ms.length !== 1 || file.source.m !== ms[0]) pageFaults.push(`the file names its source ${JSON.stringify(file.source)}, and the store files ${STRONGS_HEDGES_SOURCE_KEY} under ${ms.join(", ") || "nothing"}`);
  if (file.by !== STRONGS_HEDGES_BY) pageFaults.push(`the file says the note is ${file.by}'s`);
  const says = [...new Set(servedSource.map((l) => l.says))];
  if (says.length !== 1 || file.says !== says[0]) pageFaults.push(`the file says the note is on «${file.says}», and the ledger's derivation lines say «${says.join(" | ")}»`);
  const want = servedSource.map((l) => [l.entry, { text: l.text, hedges: l.hedges.map((h) => ({ word: h.word, at: h.at })) }]);
  const have = Object.entries(file.entries || {});
  if (!same(have, want)) {
    const k = have.findIndex((x, i) => !same(x, want[i]));
    pageFaults.push(`the file's entries are not the ledger's ${want.length} served derivation lines in their order: ${have.length} entries, the first that differs ${JSON.stringify(have[k] || null).slice(0, 120)} where the ledger gives ${JSON.stringify(want[k] || null).slice(0, 120)}`);
  }
  const hedges = servedSource.reduce((a, l) => a + l.hedges.length, 0);
  if (!file.counts || file.counts.entries !== want.length || file.counts.hedges !== hedges) pageFaults.push(`the file counts ${JSON.stringify(file.counts && [file.counts.entries, file.counts.hedges])}, the ledger ${want.length} entries and ${hedges} hedges`);
  const stated = (((receipt.over_the_served_entries || {}).by_clause) || {})[STRONGS_HEDGES_CLAUSE];
  if (stated !== want.length) pageFaults.push(`the ledger has ${want.length} served derivation lines and the receipt counts ${stated}`);
}
check("H3  the page's file is the bytes its pin names and is the ledger's served derivation lines, in order, each { text, hedges } as given, with the source as the store files it, who says the note and of what", !!file && pageFaults.length === 0,
  pageFaults.length ? first(pageFaults) : `${nf(Object.keys(file.entries).length)} entries · ${nf(file.counts.hedges)} hedges · ${file.source.key} ${file.source.m} · «${file.by}, on ${file.says}: …» · ${made.sha256.slice(0, 12)}`);

// ---- H4: the join, said ------------------------------------------------------------------------
// the entries are the ledger's (H3 holds the file to them), so a wrong file is judged on the page against the ledger
const entries = new Set(servedSource.map((l) => l.entry));
const reached = new Map(), keysOf = new Map();   // entry -> rows of the store filed under it; entry -> its keys
let rows = 0, rowsReaching = 0, rowsNamingNone = 0;
for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
  const body = JSON.parse(gunzipSync(readFileSync(join(STORE, "shards", f))).toString("utf8"));
  for (const [k, rs] of Object.entries(body)) for (const row of rs) {
    if (!ms.includes(String(row[3]))) continue;
    rows += 1;
    const n = (factsOf(row) || {}).n;
    if (!Array.isArray(n) || !n.length) { rowsNamingNone += 1; continue; }
    const hit = n.filter((e) => entries.has(e));
    if (hit.length) rowsReaching += 1;
    for (const e of hit) { reached.set(e, (reached.get(e) || 0) + 1); (keysOf.get(e) || keysOf.set(e, new Set()).get(e)).add(k); }
  }
}
const notReached = [...entries].filter((e) => !reached.has(e));
const keys = new Set([...keysOf.values()].flatMap((s) => [...s]));
check("H4  the join: a row of the source is of the entries its own facts name (row[10].n); the ledger's served derivation entries are reached by rows of the store", reached.size > 0,
  `${nf(reached.size)} of the ledger's ${nf(entries.size)} served derivation entries are reached by ${nf(rowsReaching)} of the source's ${nf(rows)} rows, on ${nf(keys.size)} keys · ${nf(rowsNamingNone)} rows of the source name no entry · reached by none: ${notReached.join(" ") || "none"}`);

// ---- H5: on the page ---------------------------------------------------------------------------
const exampleRows = [...(keysOf.get(EXAMPLE) || [])];
if (!entries.has(EXAMPLE) || !exampleRows.length) check("H5  on the page, a reading of Strong's whose entry's derivation hedges carries his words as a note under its record, and one whose entry's does not carries none", false, `${EXAMPLE} is ${entries.has(EXAMPLE) ? "reached by no row of the store" : "not an entry of the ledger's served derivations"}`);
else {
  // a served word under a key that holds the example's row, and on the same key a row of the source of an entry that does not hedge
  let pick = null;
  outer: for (const b of zonesServed()) {
    const z = JSON.parse(gunzipSync(readFileSync(join(K3, "data", "zones", `${b}.bin`))).toString("utf8"));
    for (const [si, sec] of (z.sections || []).entries()) for (const [e, w] of (sec.words || []).entries()) {
      if (!w.k || w.w || w.kq || !exampleRows.includes(w.k)) continue;
      const rs = (store.routesFor(w.k) || []).filter((r) => ms.includes(String(r[3])));
      const ofEntry = (r, test) => { const n = (factsOf(r) || {}).n; return Array.isArray(n) && n.length && test(n); };
      const mine = rs.find((r) => ofEntry(r, (n) => n.includes(EXAMPLE)) && store.readingsOf(r).length);
      // a reading of the source none of whose rows on the key is filed under an entry that hedges
      const hedging = (r) => ofEntry(r, (n) => n.some((x) => entries.has(x)));
      const plain = rs.find((r) => ofEntry(r, (n) => !n.some((x) => entries.has(x))) && store.readingsOf(r).length === 1
        && !rs.some((o) => hedging(o) && store.readingsOf(o).some((t) => printedForm(t) === printedForm(store.readingsOf(r)[0]))));
      if (!mine || !plain) continue;
      pick = { book: b, section: si, entry: e, label: sec.label, key: w.k, m: String(mine[3]), mine: printedForm(store.readingsOf(mine)[0]), plain: printedForm(store.readingsOf(plain)[0]), plainEntries: factsOf(plain).n };
      break outer;
    }
  }
  if (!pick) check("H5  on the page, a reading of Strong's whose entry's derivation hedges carries his words as a note under its record, and one whose entry's does not carries none", false, `no served word stands under a key that holds the row of ${EXAMPLE} and a row of the source of an entry that does not hedge`);
  else {
    // his words as the ledger gives them, opened as the owner's card opens the note: never the file's, which H3 judges
    const want = servedSource.find((l) => l.entry === EXAMPLE);
    const wantLine = `${STRONGS_HEDGES_BY}, on ${want.says}: ${want.text}`;
    const tree = await serveTree(K3);
    const pw = await loadPlaywright();
    const browser = await pw.chromium.launch(launchOptions());
    const faults = [];
    let got;
    try {
      const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
      const p = await ctx.newPage();
      const errors = [];
      p.on("pageerror", (err) => errors.push(String(err && err.message)));
      await p.goto(`${tree.base}/zone.html?b=${pick.book}`, { waitUntil: "networkidle" });
      await p.evaluate((kv) => { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); }, STATES.lifted.keep);
      await p.reload({ waitUntil: "networkidle" });
      await p.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
      await linesOnPage(p, { from: pick.section, to: pick.section + 1 });
      got = await p.evaluate(async ({ section, entry, m, mine, plain }) => {
        const hud = document.getElementById("hud");
        const turn = () => new Promise((r) => { const c = new MessageChannel(); c.port1.onmessage = () => { c.port1.close(); r(); }; c.port2.postMessage(0); });
        const wait = async (ok, ms = 20000) => { const t0 = performance.now(); while (!ok() && performance.now() - t0 < ms) await turn(); return ok(); };
        const settled = () => { const read = hud.querySelector(":scope > .rows > .b-read"); return !!(read && read.children.length && !read.querySelector(":scope > .r-wait")); };
        const wb = (document.querySelectorAll("section.seg")[section] || document).querySelectorAll(".he-text .wb")[entry];
        if (!wb) return { fault: "the word is not on the page" };
        (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
        if (!(await wait(settled))) return { fault: "the card's readings did not arrive" };
        const pills = () => [...hud.querySelectorAll(":scope > .rows > .b-read > .r-pills > button")];
        const pillOf = (t) => pills().find((x) => x.textContent === t && (x.dataset.by || "").split(/[\s,]+/u).includes(m));
        const lines = () => [...hud.querySelectorAll(".d-card .d-body .sense-notes[data-notes-of=\"derivation\"]")].map((x) => ({
          text: x.textContent, notes: [...x.querySelectorAll(".sense-note")].map((y) => ({ m: y.dataset.m || "", entry: y.dataset.entry || "", text: y.textContent, italic: [...y.querySelectorAll("i")].map((i) => i.textContent) })) }));
        const press = async (t) => {
          const b = pillOf(t);
          if (!b) return null;
          b.click();
          await turn(); await turn();
          // the page's file of the hedges arrives once, after the first paint; a record drawn before it takes the note when it lands
          await wait(() => !!window.__hedges, 10000);
          await turn(); await turn();
          return { pill: b.textContent, pressed: b.getAttribute("aria-pressed"), lines: lines() };
        };
        const a = await press(mine);
        const b = await press(plain);
        const all = pills().map((x) => x.textContent);
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        return { a, b, all, hedges: window.__hedges || null };
      }, pick);
      if (errors.length) faults.push(`the page threw: ${errors[0]}`);
      await ctx.close();
    } finally { await browser.close().catch(() => {}); await tree.close(); }
    const where = `${pick.book} ${pick.label}, entry ${pick.entry} (${pick.key})`;
    if (got.fault) faults.push(`${where}: ${got.fault}`);
    else {
      if (!got.hedges) faults.push(`${where}: the page did not read the file of the hedges`);
      if (!got.a) faults.push(`${where}: no pill credited to ${pick.m} prints «${pick.mine}»`);
      else {
        const one = got.a.lines;
        const wantNotes = [{ m: pick.m, entry: EXAMPLE, text: want.text, italic: want.hedges.map((h) => h.word) }];
        if (one.length !== 1 || one[0].text !== wantLine || !same(one[0].notes, wantNotes)) faults.push(`${where}: under «${pick.mine}» the record's derivation lines are ${JSON.stringify(one).slice(0, 220)}, and the note is «${wantLine}» with ${JSON.stringify(wantNotes[0].italic)} in italics`);
        if (got.a.pill !== pick.mine) faults.push(`${where}: the pill prints «${got.a.pill}», the row's reading «${pick.mine}»`);
      }
      if ((got.all || []).some((t) => t.includes(want.text))) faults.push(`${where}: a pill prints the derivation`);
      if (!got.b) faults.push(`${where}: no pill credited to ${pick.m} prints «${pick.plain}»`);
      else if (got.b.lines.length) faults.push(`${where}: under «${pick.plain}» (${pick.plainEntries.join(", ")}, whose derivation does not hedge) the record carries ${JSON.stringify(got.b.lines).slice(0, 160)}`);
    }
    check("H5  on the page, with every switch lifted: under a reading of Strong's filed under H143 the record carries one line of his derivation, «Strong, on where the word comes from: …», his words byte for byte with the hedge words alone in italics, the note naming the source and the entry, and the pill itself unmarked; under a reading of the same source whose entry's derivation does not hedge, none", faults.length === 0,
      faults.length ? `${faults.length} · ${first(faults)}` : `${where} · «${pick.mine}»: «${got.a.lines[0].text}» (in italics: ${got.a.lines[0].notes[0].italic.join(", ")}) · «${pick.plain}» (${pick.plainEntries.join(", ")}): no line`);
  }
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
