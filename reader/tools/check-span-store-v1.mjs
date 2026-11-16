// RUN: page
// THE SPAN STORE ON THE PAGE (Moses, relay v75.3; the owner: "an underline
// is one license defining both words"; "right, no +, in fact basically the
// opposite of most compspans"). Judged on disk and on the page:
//   S1  the served store: the index's counts on their axes, every book file's
//       places pointing at rows the file holds, every row's M a licensed
//       source the page can name
//   S2  every place of a book is laid as one cell whose ink is the key, with
//       one line reading the store's first row under a chip, and one blob,
//       but a place whose every word has its own reading at the place reads
//       word by word (call 3, below): its cell and its blob stand, its line
//       its words' own, never the store's row;
//       a place whose first or last word is half of a maqaf compound is
//       drawn inside the compound's cell, its line word by word, and is
//       counted and named here, not passed in silence (an open question for
//       the owner, 2026-10-17: 650 of the 2,845 places)
//   S3  a cell's card opens on the span whole where its line reads it whole:
//       the pills are the rows' readings, the record under the first is that
//       row's D, and a place inside another's is a rung of the longer cell's
//       card, by its own key; a place drawn inside a compound's cell opens
//       the same card from its first word. A cell whose words read their own
//       opens on the word pressed, its own block pressed, the place a rung
//       of the card's row (the joined reading a press away). Places the page
//       does not lay (overlapping a laid one, as the store marks them) are
//       not picked
//   S4  the two sources the shelf lacked (M197, M199) resolve with a license
//   S5  the chain at the top of a word's card names a place the store holds
//       and its inner place by the store's own keys: a rung piece written
//       with a space is a key the store holds (the second review, 2026-10-17:
//       the chain at Genesis 18:5 offered the place spaced)
//   S6  a span card's pills stand in the page's order wherever every pill is
//       a span row's reading: the tier before 1940, the dated before the
//       undated, the year, then the rank, each reading with the oldest year
//       and the lowest rank of the rows that print it. A span row is ordered
//       as every row is (span-order-rule-v1, 16 November 2026: the corpus
//       lane's v169, section 5, «order a span row as a store row is
//       ordered», taken with the owner's card 1). From 10 November until
//       then a span row's year was said and ordered nothing, and this law
//       held the store's own order (by_key: names first). A card where
//       another store's row carries a reading too is not judged here, since
//       that row keeps its own rank and year: the page says which readings
//       stand on span rows alone, __poolOv.
//       Since call 3 (ships 5 and 6) a card opens on the word pressed wherever
//       the run reads its words, so S6 judges only a card that still opens on
//       the span whole; tools/check-span-grade-v1.mjs G9 presses the place's
//       rung and judges the order there
// THE SPAN GRADE (span-grade-rule-v1-a-joined-reading-with-no-pointing-or-
// pointed-otherwise-where-step-tags-its-words-as-separate-entries-rests-held-back,
// 16 November 2026). Under «only», the page's default, a row the place holds
// back (its held, tools/apply-span-grade-v1.mjs) is no pill at that place and
// reads on no line there; and a pointer (a form_of row) leads no line (v169,
// section 5; span-line-rule-v1): S3 takes the line's row as the first row
// that rests open, but a pointer and a row the place holds back, and the
// pills from the rows the place keeps. tools/check-span-grade-v1.mjs judges
// the grade itself.
// THE DICTIONARIES THAT REST SHUT (dictionary-kinds-rule-v1). On a book
// whose zone was baked at rest (its stamp), a span row the record rests
// shut stands on no line, open or shut: S2 takes a cell's line from the
// rows that rest open, and a cell whose every row rests shut draws its
// pieces, counted and named, and fails where it draws a shut row's line;
// while they rest shut such a row is no pill either, so S3 and S6 judge the
// card by the rows that rest open, and the line's reading by the first of
// them, open or shut. The page must say they act where the stamp is, and
// nowhere else. The rule is the record's (tools/dictionary-kinds-v1.mjs),
// asked of each row: a span row carries its source's own M and no facts.
// A RUN READS ITS WORDS (run-reads-its-words-rule-v1, call 3 of relay v189 as
// the lead landed it, 15 November 2026): a run keeps its joined line only
// where some word of it has no reading of its own at the place; a word's own
// reading is its place's pieces, every one saying something, or a place where
// STEP's own words stand (call 4's stands, the default picks' index: step_words
// whose third element is 1). Found here from the zone and the index, never
// from the page; the marks are set aside.
// The books are found in the data, never named here (check-scope-derived
// S1): the first served book with places, and the first whose nested place
// holds an inner key written with a maqaf inside an outer written with a
// space, where the rung's own key differs from its words joined by spaces.
// Usage: node tools/check-span-store-v1.mjs [url] [--books <book>,<book>]
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl, zonesServed } from "./zones-on-disk-v1.mjs";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { openRouteStore, factsOf } from "./gloss-store-v1.mjs";
import { readKinds, restsOffOf } from "./dictionary-kinds-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const DIR = "data/span-store";
const spanBooks = zonesServed("data/zones").filter((bk) => existsSync(`${DIR}/${bk}.json`));
const placesOf = (bk) => JSON.parse(readFileSync(`${DIR}/${bk}.json`, "utf8")).placesList || [];
const firstWithPlaces = spanBooks.find((bk) => placesOf(bk).length > 0);
// call 3: per book, each place whose every word reads its own at the place, «<ref>\u0001<key>» -> its first word's key
const STANDS_BY_BOOK = (() => {
  try { const dp = JSON.parse(readFileSync("data/default-picks/index.json", "utf8")); return new Map(Object.entries(dp.books || {}).map(([bk, e]) => [bk, new Set((e.step_words || []).filter((r) => r[2] === 1).map((r) => r[0]))])); } catch { return new Map(); }
})();
const readsItsWordsIn = (bk) => {
  const out = new Map(), f = `data/zones/${bk}.bin`;
  if (!existsSync(f)) return out;
  const z = JSON.parse(gunzipSync(readFileSync(f)).toString("utf8"));
  const stands = STANDS_BY_BOOK.get(bk) || new Set();
  const says = (w) => Array.isArray(w.pg) && w.pg.length > 0 && w.pg.every((x) => x && String(x.g || "").trim());
  const byRef = new Map(); let n = 0;
  for (const sec of z.sections || []) { const ws = []; for (const w of sec.words || []) { n += 1; if (!w.mark) ws.push({ w, n }); } byRef.set(String(sec.label), ws); }
  for (const pl of placesOf(bk)) {
    const ws = (byRef.get(String(pl.ref)) || []).slice(pl.first - 1, pl.last);
    if (ws.length && ws.every((q) => says(q.w) || stands.has(q.n))) out.set(`${pl.ref}\u0001${pl.key}`, ws[0].w.k || "");
  }
  return out;
};
const firstMaqafInner = spanBooks.find((bk) => placesOf(bk).some((x) => / /u.test(x.key) && (x.contains || []).some((k) => k.includes("\u05be"))));
const firstChainNest = spanBooks.find((bk) => placesOf(bk).some((x) => !/ /u.test(x.key) && (x.contains || []).length));
const BOOKS = arg("books", "") ? arg("books", "").split(",") : [...new Set([firstWithPlaces, firstMaqafInner, firstChainNest].filter(Boolean))];
const ix = JSON.parse(readFileSync(`${DIR}/index.json`, "utf8"));
const store = openRouteStore("data/route-store");
const rix = JSON.parse(readFileSync("data/route-store/index.json", "utf8"));
const served = rix.m_sources;
// the record's rule over the store's own sources, as the page reads it before an overlay's ids join them; a book's
// span rows rest shut only where its zone was baked at rest
const restsOff = restsOffOf(readKinds("data").rec, rix.m_sources, factsOf);
const stampedAtRest = (bk) => { const f = `data/zones/${bk}.bin`; if (!existsSync(f)) return false; const z = JSON.parse(gunzipSync(readFileSync(f)).toString("utf8")); return !!(z.emitted_from && z.emitted_from.rests_off); };
// a span row of a source under a ledger carries the page's division slots beyond the lane's seven (apply-ledger-divisions-v1, 6 November 2026)
const ledgeredKeys = new Set(Object.keys((rix.ledgers && rix.ledgers.sources) || {}));
const slotsOk = (r) => { const key = ((served[r.slots[3]] || (ix.m_sources || {})[r.slots[3]] || {}).key); const n = r.slots.length; return n === 7 || (n <= 9 && ledgeredKeys.has(key) && (r.slots[7] === null || Array.isArray(r.slots[7])) && (n < 9 || Array.isArray(r.slots[8]))); };
const postures = JSON.parse(readFileSync("data/license-postures-v1.json", "utf8")).postures || {};
const ms = { ...served, ...ix.m_sources };
// S1
const files = readdirSync(DIR).filter((f) => f.endsWith(".json") && f !== "index.json");
let places = 0, badRows = 0, badM = 0, rowsSeen = new Set();
for (const f of files) {
  const b = JSON.parse(readFileSync(`${DIR}/${f}`, "utf8"));
  places += b.places;
  if (b.placesList.length !== b.places) badRows += 1;
  for (const p of b.placesList) {
    const rows = b.keys[p.key] || [];
    const ids = new Set(rows.map((r) => r.row_id));
    if (!p.row_ids.every((id) => ids.has(id))) badRows += 1;
    for (const r of rows) { rowsSeen.add(r.row_id); const m = ms[r.slots[3]]; if (!m || !postures[m.licensePosture]) badM += 1; if (!slotsOk(r) || typeof r.slots[1] !== "string" || typeof r.slots[2] !== "string") badRows += 1; }
  }
}
check("S1  the served store: places and rows as the lane counted them, every row the lane's seven slots (and the page's division slots only on a ledgered source's row), every M licensed", places === ix.counts.places.value && badRows === 0 && badM === 0 && files.length === ix.counts.books.value,
  `${places} places [places] in ${files.length} books (index: ${ix.counts.places.value}, ${ix.counts.books.value}) · ${rowsSeen.size} rows seen under keys · ${badRows} bad places or rows · ${badM} rows with no licensed source`);
check("S4  the sources the shelf lacked resolve with a licence the page knows", ["M197", "M199"].every((id) => ms[id] && postures[ms[id].licensePosture]), Object.keys(ix.m_sources).map((id) => `${id} ${ms[id].licensePosture}`).join(", "));
// S2, S3 on the page
const pw = await loadPlaywright();
const BASE = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "").split("?")[0];
const b = await pw.chromium.launch(launchOptions());
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; });
await p.addInitScript(() => { try { localStorage.clear(); } catch { /* fresh reader */ } });
for (const book of BOOKS) {
  if (!existsSync(`${DIR}/${book}.json`)) { console.log(`  --  ${book}: no span file; skipped`); continue; }
  await p.goto(`${BASE}?b=${book}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.evaluate(async () => { let g = 0; while (g < 4000) { const n = document.querySelector("section.seg.seg-wait"); if (!n) break; n.scrollIntoView({ block: "center" }); await new Promise((r) => setTimeout(r, 5)); g += 1; } window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 400)); });
  const onDisk = JSON.parse(readFileSync(`${DIR}/${book}.json`, "utf8"));
  // each key's rows as [their source, whether the record rests the row shut on this book]
  const atRest = stampedAtRest(book);
  const shutRow = (r) => atRest && !!restsOff(r.slots);
  const keyRows = Object.fromEntries(Object.entries(onDisk.keys || {}).map(([k, rs]) => [k, rs.map((r) => [r.slots[3], shutRow(r)])]));
  const ownAll = readsItsWordsIn(book);
  const r2 = await p.evaluate(({ placesList, keyRows, ownAll }) => {
    const st = window.__spanStore || { places: 0, laid: 0, skipped: [] };
    const file = window.__spanBook || null;
    // two places the store itself marks as overlapping (neither inside the
    // other) cannot both be cells: the first laid stands, the other is skipped
    const out = { skippedAt: st.skipped.map((x) => `${x.ref}\u0001${x.key}`), absorbed: [], absorbedLoose: [], inner: 0, places: st.places, laid: st.laid, overlapped: st.skipped.filter((x) => x.why === "overlaps a laid span" && x.overlaps && x.overlaps.length).length, skipped: st.skipped.filter((x) => !(x.why === "overlaps a laid span" && x.overlaps && x.overlaps.length)).map((x) => `${x.ref} ${x.key}: ${x.why}`), cells: 0, noCell: [], lineBad: [], blobBad: [], chipBad: [], shutLine: [], wordByWord: [], kindsHere: !!window.__kindsHere, kinds: window.__kinds || null };
    const readsWords = new Set(ownAll);
    const off = new Set(window.__sourcesOff || []);
    const letters = (t) => [...String(t || "")].filter((c) => c >= "\u05d0" && c <= "\u05ea").join("");
    const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ");
    const cells = [...document.querySelectorAll("section.seg .he-text .wjoin")].filter((c) => c.__run && c.__run.spanKey);
    for (const c of cells) {
      out.cells += 1;
      const key = c.__run.spanKey, rows = c.__run.span ? null : null;
      const words = [...c.querySelectorAll(":scope > .wj-ink > .wb")].filter((w) => !w.classList.contains("mark"));   // a paseq inside the place rides in the cell
      const ink = words.map((w, j) => letters(w.querySelector(".w").textContent) + (j < words.length - 1 ? (/\u05be$/u.test(w.querySelector(".w").textContent.trim()) ? "\u05be" : " ") : "")).join("");
      if (ink !== key) out.noCell.push(`${c.__run.label} ${key}: ink ${ink}`);
      const g = c.querySelector(":scope > .g");
      const cl = g ? g.cloneNode(true) : null; const chip = cl && cl.querySelector(".g-lic"); if (chip) chip.remove();
      const text = cl ? cl.textContent.trim() : "";
      // a cell whose every row rests shut (none open, none the reader switched off alone) draws no row of the store:
      // its line is its pieces, never a shut row's
      const ms = keyRows[key] || [];
      const restsShut = ms.length > 0 && ms.some(([, shut]) => shut) && ms.every(([m, shut]) => shut || off.has(m));
      // a place whose every word reads its own at the place (call 3): its words' own lines, word by word, never the store's row
      if (readsWords.has(`${c.__run.label}\u0001${key}`)) {
        if (g && g.dataset.span === key) out.lineBad.push(`${c.__run.label} ${key}: every word reads its own at the place, and the line reads the store's row "${text}"`);
        else if (g && !g.classList.contains("parts")) out.lineBad.push(`${c.__run.label} ${key}: every word reads its own at the place, and the line "${text}" is not drawn word by word`);
        else out.wordByWord.push(`${c.__run.label} ${key}`);
      }
      else if (restsShut) { if (g && g.dataset.span === key) out.lineBad.push(`${c.__run.label} ${key}: line "${text}" read from a row that rests shut`); else out.shutLine.push(`${c.__run.label} ${key}`); }
      else if (!g || g.dataset.span !== key) out.lineBad.push(`${c.__run.label} ${key}: line "${text}" not the store's`);
      if (g && !g.querySelector(".g-lic")) out.chipBad.push(`${c.__run.label} ${key}`);
      if (c.querySelectorAll(":scope > svg.wj-tie").length !== 1) out.blobBad.push(`${c.__run.label} ${key}: ${c.querySelectorAll(":scope > svg.wj-tie").length} blobs`);
    }
    // a laid place with no cell of its own: its words must stand inside one
    // cell (the maqaf compound's), and its first or last word must be half
    // of a compound, or it is lost
    const skippedAt = new Set(out.skippedAt);
    const spanCells = new Set(cells.map((c) => `${c.__run.label}\u0001${c.__run.spanKey}`));
    const secOf = new Map([...document.querySelectorAll("section.seg")].map((s) => [(s.querySelector(".vnum") || {}).textContent, s]));
    for (const pl of placesList) {
      const at = `${pl.ref}\u0001${pl.key}`;
      if (skippedAt.has(at) || spanCells.has(at)) continue;
      const sec = secOf.get(pl.ref);
      const wbs = sec ? [...sec.querySelectorAll(".he-text .wb:not(.mark)")] : [];
      const mine = wbs.slice(pl.first - 1, pl.last);
      const host = mine.length && mine[0].closest(".wjoin");
      const half = (w) => !!w && /\u05be$/u.test(((w.querySelector(".w") || {}).textContent || "").trim());
      const inCompound = half(mine[mine.length - 1]) || half(wbs[pl.first - 2]);
      // a place inside another (store I3) is a rung of the outer cell's card,
      // never a cell of its own: its words stand in the outer cell (S3 judges
      // the rung)
      // (the outer place's cell, or, where the outer place is itself drawn
      // inside a maqaf compound's cell, that cell)
      if (pl.inside_of && host && mine.every((w) => host.contains(w))) { out.inner += 1; continue; }
      if (host && mine.every((w) => host.contains(w)) && inCompound) out.absorbed.push(`${pl.ref} ${pl.key}`);
      else out.absorbedLoose.push(`${pl.ref} ${pl.key}`);
    }
    return out;
  }, { placesList: onDisk.placesList, keyRows, ownAll: [...ownAll.keys()] });
  // the page says the dictionaries that rest shut act on this book exactly where its zone was baked at rest
  const kindsSaid = r2.kindsHere === atRest;
  check(`S2  ${book}: every place laid as one cell whose ink is the key, one line from the store under a chip, one blob, but a place whose every word reads its own at the place, its line word by word`, kindsSaid && r2.laid + r2.overlapped === r2.places && r2.skipped.length === 0 && r2.absorbedLoose.length === 0 && r2.noCell.length === 0 && r2.lineBad.length === 0 && r2.chipBad.length === 0 && r2.blobBad.length === 0,
    `${r2.laid} of ${r2.places} places laid [places]${r2.overlapped ? ` (${r2.overlapped} overlapping another, as the store marks them, not laid)` : ""} · ${r2.cells} cells on the page` + (r2.inner ? ` · ${r2.inner} inside another place, a rung of its cell` : "") + (r2.absorbed.length ? ` · ${r2.absorbed.length} drawn inside a maqaf compound's cell, the line word by word (open question): ${r2.absorbed.slice(0, 3).join(" | ")}` : "") + (r2.shutLine.length ? ` · ${r2.shutLine.length} whose every row rests shut, the line its pieces: ${r2.shutLine.slice(0, 3).join(" | ")}` : "") + (r2.wordByWord.length ? ` · ${r2.wordByWord.length} whose every word reads its own at the place, the line word by word (call 3): ${r2.wordByWord.slice(0, 2).join(" | ")}` : "") + (kindsSaid ? "" : ` · the page says the dictionaries that rest shut ${r2.kindsHere ? "act" : "do not act"} here, and the zone ${atRest ? "was" : "was not"} baked at rest`) + (r2.absorbedLoose.length ? ` · LOST, no cell and no compound: ${r2.absorbedLoose.slice(0, 3).join(" | ")}` : "") + (r2.skipped.length ? ` · skipped: ${r2.skipped.slice(0, 2).join(" | ")}` : "") + (r2.noCell.length ? ` · ink: ${r2.noCell.slice(0, 2).join(" | ")}` : "") + (r2.lineBad.length ? ` · line: ${r2.lineBad.slice(0, 2).join(" | ")}` : "") + (r2.chipBad.length ? ` · no chip: ${r2.chipBad.slice(0, 2).join(" | ")}` : "") + (r2.blobBad.length ? ` · blob: ${r2.blobBad.slice(0, 2).join(" | ")}` : ""));
  // S3: the first spaced place, the first maqaf place, the first nested place, each with a row that rests open
  const file = onDisk;
  // (and, under «only», the page's default, some row the place does not hold back: span-grade-rule-v1)
  const restsOpen = (x) => (file.keys[x.key] || []).some((r) => !shutRow(r) && !(x.held && x.held[r.row_id]));
  const laidAlone = (x) => !r2.skippedAt.includes(`${x.ref}\u0001${x.key}`) && !r2.absorbed.includes(`${x.ref} ${x.key}`) && restsOpen(x);
  const drawnAlone = (x) => laidAlone(x) && !ownAll.has(`${x.ref}\u0001${x.key}`);
  const ownPick = file.placesList.find((x) => laidAlone(x) && ownAll.has(`${x.ref}\u0001${x.key}`) && !x.inside_of && !x.contains.length);
  const absorbedPick = file.placesList.find((x) => r2.absorbed.includes(`${x.ref} ${x.key}`) && !x.inside_of && !x.contains.length && restsOpen(x));
  const picks = [file.placesList.find((x) => drawnAlone(x) && x.key.includes(" ") && !x.inside_of && !x.contains.length), file.placesList.find((x) => drawnAlone(x) && x.key.includes("\u05be") && !x.inside_of && !x.contains.length), (file.placesList.find((x) => drawnAlone(x) && / /u.test(x.key) && (x.contains || []).some((k) => k.includes("\u05be"))) || file.placesList.find((x) => drawnAlone(x) && x.contains && x.contains.length)), absorbedPick && !ownAll.has(`${absorbedPick.ref}\u0001${absorbedPick.key}`) ? { ...absorbedPick, absorbed: true } : null,
    ownPick ? { ...ownPick, words: ownAll.get(`${ownPick.ref}\u0001${ownPick.key}`) } : null].filter(Boolean);
  const r3 = [], r6 = [];
  for (const pl of picks) {
    const got = await p.evaluate(async (pl) => {
      const sec = [...document.querySelectorAll("section.seg")].find((s) => (s.querySelector(".vnum") || {}).textContent === pl.ref);
      const c = sec && [...sec.querySelectorAll(".wjoin")].find((c) => c.__run && c.__run.spanKey === pl.key);
      // a place drawn inside a compound's cell opens from its first word
      const first = sec && pl.absorbed ? [...sec.querySelectorAll(".he-text .wb:not(.mark)")][pl.first - 1] : null;
      if (!c && !first) return { err: "no cell" };
      (c || first).scrollIntoView({ block: "center" }); (c ? c.querySelector(".wb .w") : first.querySelector(".w")).click();
      const t0 = Date.now(); while (Date.now() - t0 < 8000 && !document.querySelector("#hud .r-pills button")) await new Promise((r) => setTimeout(r, 60));
      await new Promise((r) => setTimeout(r, 600));
      const h = document.getElementById("hud");
      const row = h.querySelector(".b-chain") || h.querySelector(".b-cut");
      const cuts = [...(row ? row.querySelectorAll(".s-pills button") : [])].map((x) => ({ t: x.textContent, on: x.getAttribute("aria-pressed") === "true" }));
      // the block pressed on the card's row of blocks, where it has one (a word of the cell, opened on itself)
      const cell = ([...h.querySelectorAll(".b-cell .s-pills button")].find((x) => x.getAttribute("aria-pressed") === "true") || {}).textContent || "";
      const pills = [...h.querySelectorAll(".r-pills button")].map((x) => x.textContent.trim());
      const d = (h.querySelector(".d-text") || {}).textContent || "";
      const lit = ([...h.querySelectorAll('.r-pills button[aria-pressed="true"]')][0] || {}).textContent || "";
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      return { cuts, cell, pills, d, lit: lit.trim(), off: [...(window.__sourcesOff || [])], pool: [...(window.__pool || [])], ov: [...(window.__poolOv || [])], kinds: window.__kinds || null, masorah: window.__masorah || null };
    }, pl);
    // a cell whose words read their own (call 3): the card opens on the word pressed, its own block pressed, the place a
    // rung of the card's row, a press away
    if (pl.words !== undefined) {
      const on = got.cuts && got.cuts.find((x) => x.on);
      const ok = !got.err && !!on && on.t !== pl.key && got.cuts.some((x) => x.t === pl.key) && got.cell === pl.words;
      r3.push({ ok, say: got.err ? `${pl.ref} ${pl.key}: ${got.err}` : `${pl.ref} ${pl.key} (every word reads its own at the place): opens on ${on ? on.t : "nothing"}, the block ${got.cell || "none"} pressed (its first word ${pl.words}), the place ${got.cuts.some((x) => x.t === pl.key) ? "a rung a press away" : "not offered"}` });
      continue;
    }
    // the rows whose source the page has on; identical readings stand as one
    // pill with every record beneath (one-reading-one-pill), so the record
    // shown is that of a row reading as the lit pill reads
    const off = new Set(got.off || []);
    // and, on a book baked at rest, only the rows that rest open while they rest shut: a shut row is then no pill
    const shutNow = atRest && got.kinds !== "open";
    // and under «only» a row the place holds back is no pill there (span-grade-rule-v1)
    const heldHere = (r) => got.masorah === "only" && !!(pl.held && pl.held[r.row_id]);
    const rows = (file.keys[pl.key] || []).filter((r) => !off.has(r.slots[3]) && !(shutNow && shutRow(r)) && !heldHere(r));
    // the line reads the first row that rests open, open or shut, but a pointer (a form_of row leads no line: v169,
    // section 5) and, under «only», a row the place holds back
    const lineRows = (file.keys[pl.key] || []).filter((r) => !off.has(r.slots[3]) && !shutRow(r) && !r.form_of && !heldHere(r));
    const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ");
    // the pool lowercases to group (one reading, one pill), and a row's
    // readings are what the store gives it (gloss-store-v1 readingsOf: the
    // ledger's slots on a ledgered source's row, else the row whole), so a
    // row stands as one pill or as its readings, case aside
    const low = (t) => String(t).toLowerCase();
    const pills = (got.pills || []).map(low);
    const readingsOfRow = (r) => store.readingsOf(r.slots).map((x) => spanJoin(x));
    const asPills = (r) => readingsOfRow(r).every((x) => pills.includes(low(x)));
    const wantR = [...new Set(rows.map((r) => spanJoin(r.slots[1])))];
    const asPillsText = (t) => rows.filter((r) => spanJoin(r.slots[1]) === t).some(asPills);
    // a row reads as a pill whole, or as one of its readings
    const reads = (r, t) => low(spanJoin(r.slots[1])) === low(t) || readingsOfRow(r).some((x) => low(x) === low(t));
    const on = got.cuts && got.cuts.find((x) => x.on);
    const litRows = rows.filter((r) => reads(r, got.lit));
    const dOk = litRows.some((r) => r.slots[2].trim() === got.d.trim());
    // an inner place stands as a piece of a division of the outer card
    // ("outer + inner"), by its own key
    const rungsOk = pl.contains.every((k) => got.cuts.some((x) => x.t.split(" + ").includes(k)));
    const ok = !got.err && on && on.t === pl.key && lineRows.length > 0 && reads(lineRows[0], got.lit) && wantR.every(asPillsText) && dOk && rungsOk;
    // S6: the readings in the page's order (a span row is ordered as every row is: v169, section 5, 16 November
    // 2026): the tier before 1940, the dated before the undated, the year, then the rank, each reading with the oldest
    // year and the lowest rank of the rows that print it (one closing stop is not a different reading), against the
    // pills that read them
    const stopless = (t) => low(t).replace(/\.$/u, "");
    const yearOf = (r) => { const y = Number.parseInt(r.slots[4], 10); return Number.isInteger(y) ? y : Infinity; };
    const byReading = new Map();
    for (const r of rows) for (const x of readingsOfRow(r)) {
      const k = stopless(x), g = byReading.get(k) || { k, year: Infinity, rank: Infinity, at: byReading.size };
      g.year = Math.min(g.year, yearOf(r)); g.rank = Math.min(g.rank, Number(r.slots[0])); byReading.set(k, g);
    }
    const tier = (g) => (Number.isFinite(g.year) && g.year <= 1940 ? 0 : 1), dated = (g) => (Number.isFinite(g.year) ? 0 : 1);
    const storeOrder = [...byReading.values()].sort((a, b) => tier(a) - tier(b) || dated(a) - dated(b) || (dated(a) ? 0 : a.year - b.year) || a.rank - b.rank || a.at - b.at).map((g) => g.k);
    // the pool as the page sorted it, and which of its readings stand on span rows alone (the page's own words: __pool,
    // __poolOv); a reading another store's row also carries keeps that row's rank and year, and its card is not judged
    const pillOrder = (got.pool || []).map(stopless);
    const allSpan = pillOrder.length > 0 && (got.ov || []).length === pillOrder.length && got.ov.every((x) => x === "span-store") && pillOrder.length === storeOrder.length;
    r6.push({ at: `${pl.ref} ${pl.key}`, judged: allSpan, ok: !allSpan || JSON.stringify(pillOrder) === JSON.stringify(storeOrder), pills: pillOrder, store: storeOrder });
    r3.push({ ok, say: got.err ? `${pl.ref} ${pl.key}: ${got.err}` : `${pl.ref} ${pl.key}${pl.absorbed ? " (inside a maqaf compound's cell)" : ""}: opens on ${on ? on.t : "nothing"} · lit "${got.lit}" (the line's row: "${lineRows.length ? spanJoin(lineRows[0].slots[1]) : "none on"}") · ${wantR.filter(asPillsText).length} of ${wantR.length} readings among ${got.pills.length} pills · D ${dOk ? "a row's of the lit reading" : "not a row's"}${pl.contains.length ? ` · rungs ${pl.contains.join(",")} ${rungsOk ? "offered" : "missing"}` : ""}` });
  }
  check(`S3  ${book}: a cell's card opens on the span whole where its line reads it whole, its pills the rows' readings, the record the first row's D, an inner place a rung of the outer card; a cell whose words read their own opens on the word pressed, the place a press away`, r3.length > 0 && r3.every((x) => x.ok), r3.map((x) => x.say).join(" ‖ "));
  check(`S6  ${book}: a span card's pills stand in the page's order where every pill is a span row's reading (the tier before 1940, the year, then the rank: a span row is ordered as every row is)`, r6.every((x) => x.ok),
    r6.map((x) => `${x.at}: ${!x.judged ? "another store's row carries a reading too, not judged" : x.ok ? `${x.pills.length} pills in the page's order` : `pills ${x.pills.join(" | ")} against the page's order ${x.store.join(" | ")}`}`).join(" ‖ "));
  // S5: a nested place the ink writes as one maqaf chain, its first word's card
  const chainNest = file.placesList.find((x) => !/ /u.test(x.key) && (x.contains || []).length);
  if (chainNest) {
    await p.goto(`${BASE}?b=${book}#${chainNest.ref}:${chainNest.first}`, { waitUntil: "networkidle" });
    await p.waitForSelector("section.seg .he-text .wb");
    const t0 = Date.now(); while (Date.now() - t0 < 12000 && !(await p.$("#hud .s-pills button"))) await p.waitForTimeout(100);
    await p.waitForTimeout(600);
    const rows = await p.evaluate(() => [...document.querySelectorAll("#hud .b-chain .s-pills button, #hud .b-cut .s-pills button")].map((x) => x.textContent.trim()));
    const keys = new Set(Object.keys(file.keys || {}));
    const spaced = rows.flatMap((t) => t.split(" + ")).filter((piece) => / /u.test(piece) && !keys.has(piece));
    check(`S5  ${book} ${chainNest.ref} ${chainNest.key}: the chain's rungs name the place and its inner place by the store's keys`, rows.length > 0 && spaced.length === 0, `${rows.join(" | ")}${spaced.length ? ` · not a key: ${[...new Set(spaced)].join(", ")}` : ""}`);
  }
}
await b.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
