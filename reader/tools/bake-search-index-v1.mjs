// THE SEARCH INDEX (the owner, 2026-10-18: "and what about a search bar";
// "hebrew by character ... and any english hits like create or be created
// or cut down", at the top of the book page; no transliteration: "not our
// problem"; and on the door, "for books also by exact hebrew or english
// answers"). Two indexes, both arithmetic over files the page already
// serves, nothing typed here:
//
//   he/<first letter's code point>.bin  every LETTERS KEY v1.1 the
//       dictionary store places somewhere: its number of places, its most
//       common pointed form, its first place in the books' order, and every
//       vowel pointing it stands in, with its places (the owner, 2026-10-18:
//       "go off consonants only with voweling as best match preferencing").
//       A pointing is the letters and their points (U+05B0 to U+05BC,
//       U+05BF, U+05C1, U+05C2, U+05C7), canonically ordered; cantillation
//       and meteg are not pointing. At a ketiv/qere place the store writes
//       "(ketiv) [qere]": the place is pointed as its qere reads, and it
//       stands in the row of the ketiv's letters too, since those are the
//       letters the page prints there.
//   en/<hex>.bin  every English reading, folded (below), with the letters
//       it reaches: the route store's routes as the card draws them, pill by
//       pill (below), and the per-place readings of the dictionary store
//       (TAHOT, MACULA), with the number of places a source reads exactly
//       those words, all sources together and each on its own (a reader may
//       switch one off). Shard = first two hex of sha256(the folded text).
//
// THE FOLD (the page folds a query the same way): Unicode NFKC, lower case,
// the curly quotes as straight ones, "/" and "+" read as spaces, brackets,
// parentheses and angle brackets dropped (their words kept), runs of white
// space one space, trimmed. "in/ beginning", "in + beginning" and
// "<in> beginning" fold to "in beginning"; "LORD\u2019s" (U+2019) to "lord's".
//
// A ROUTE IS INDEXED AS ITS PILLS. The card splits a route's text into
// senses at ";" and readings at "," (outside parentheses; a damaged sense is
// held back; a page citation is no reading), keeps a no-derivatives text
// whole, and prints each piece by spanJoin; a search for a pill finds its
// word. The split is the page's own: the bake reads readingSplit,
// senseSplit and isNoDerivs out of zone.html and runs them, so the two
// cannot drift apart. Only the keys a word's card asks for are read (a key
// that is its own letters); a route whose source the store does not name,
// or has struck, is left out, as the card leaves it out.
//
// Only letters that stand at a place are indexed (a hit always opens at a
// place).
//
// Usage: node tools/bake-search-index-v1.mjs
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";
import { join } from "node:path";

const DATA = new URL("../data/", import.meta.url).pathname;
const ZONE = new URL("../zone.html", import.meta.url).pathname;
const OUT = join(DATA, "search-index");
const TMP = `${OUT}.tmp`;
const sha = (b) => createHash("sha256").update(b).digest("hex");
const fail = (m) => { console.error(`REFUSED: ${m}`); rmSync(TMP, { recursive: true, force: true }); process.exit(1); };
const POINT = (n) => (n >= 0x5b0 && n <= 0x5bc) || n === 0x5bf || n === 0x5c1 || n === 0x5c2 || n === 0x5c7;
// a ketiv/qere place's text, "(ketiv) [qere]": the qere is read, the ketiv written
const qereOf = (s) => { const m = /\[([^\]]*)\]/u.exec(String(s || "")); return m ? m[1] : String(s || ""); };
const kqOf = (s) => { const t = String(s || ""); const k = /\(([^)]*)\)/u.exec(t), q = /\[([^\]]*)\]/u.exec(t); return k && q ? { k: k[1], q: q[1] } : null; };
// the letters and points kept first, then put in canonical order: a
// combining grapheme joiner between two points held them out of it
const pointing = (s) => [...qereOf(s).normalize("NFD")].filter((c) => { const n = c.codePointAt(0); return (n >= 0x5d0 && n <= 0x5ea) || POINT(n); }).join("").normalize("NFD");
// a word's pieces of a two-word side, at a space or a maqaf
const wordsOf = (s) => String(s || "").split(/[\s\u05be]+/u).filter(Boolean);
const letters = (s) => [...String(s || "").normalize("NFD")].filter((c) => { const n = c.codePointAt(0); return n >= 0x5d0 && n <= 0x5ea; }).join("");
const fold = (t) => String(t || "").normalize("NFKC").toLowerCase()
  .replace(/[\u2018\u2019\u201b\u2032\u02bc]/gu, "'").replace(/[\u201c\u201d\u201e\u2033]/gu, "\"")
  .replace(/[/+]/gu, " ").replace(/[[\]()<>]/gu, "").split(/\s+/u).filter(Boolean).join(" ").replace(/\.$/u, "");
const joinSpan = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "");
const readShards = (dir) => {
  const out = {};
  for (const f of readdirSync(dir).filter((x) => /^[0-9a-f]{2}\.bin$/u.test(x)).sort()) Object.assign(out, JSON.parse(gunzipSync(readFileSync(join(dir, f))).toString("utf8")));
  return out;
};
// the page's own split, read out of the page
const zone = readFileSync(ZONE, "utf8");
const grab = (head, end) => {
  const a = zone.indexOf(head);
  if (a < 0 || zone.indexOf(head, a + 1) >= 0) fail(`zone.html does not hold exactly one "${head.trim()}"`);
  const b = zone.indexOf(end, a);
  if (b < 0) fail(`zone.html's "${head.trim()}" has no end`);
  return zone.slice(a, b + end.length);
};
const { readingSplit, senseSplit, isNoDerivs } = new Function(`${grab("\n  const readingSplit = (text) => {\n", "\n  };\n")}${grab("\n  const senseSplit = (text) => {\n", "\n  };\n")}${grab("\n  const isNoDerivs = (key) => ", ";\n")}return { readingSplit, senseSplit, isNoDerivs };`)();
const pills = (text, posture) => {
  if (isNoDerivs(posture)) return [String(text)];
  const out = [];
  for (const sense of senseSplit(text)) { const r = readingSplit(sense); if (!r.damaged) out.push(...r.readings); }
  return out;
};

const dix = JSON.parse(readFileSync(join(DATA, "dictionary-store/index.json"), "utf8"));
const rix = JSON.parse(readFileSync(join(DATA, "route-store/index.json"), "utf8"));
const order = JSON.parse(readFileSync(join(DATA, "book-order-v1.json"), "utf8")).files || [];
const struck = new Set([...((rix.language_admission || {}).struck_m_ids || []), ...((rix.source_strikes || {}).struck_m_ids || [])]);
const store = readShards(join(DATA, "dictionary-store/shards"));
if (Object.keys(store).length !== dix.counts.keys) fail(`the dictionary store holds ${Object.keys(store).length} keys, its index says ${dix.counts.keys}`);

// the letters that stand somewhere, and how
const at = (q) => { const [c, v] = String(q.ref).split(":").map(Number); const b = order.indexOf(q.book); return [b < 0 ? 1e9 : b, c, v, q.w_page]; };
const before = (a, b) => { for (let i = 0; i < 4; i += 1) if (a[i] !== b[i]) return a[i] < b[i]; return false; };
const placeKey = (q) => `${q.book}|${q.ref}|${q.w_page}`;
const byLetters = new Map();   // letters -> Map(place key -> place)
const stand = (L, q) => { if (!byLetters.has(L)) byLetters.set(L, new Map()); byLetters.get(L).set(placeKey(q), q); };
const kqSeen = new Set(), kqAdded = { ketiv: 0, qere: 0 };
const pointedAt = new Map();   // place -> the text the store prints there
// A PIECE PLACE (dictionary store v1.3, the corpus lane's relay v84) is a
// place where the key's letters stand inside a longer word; its pointed text
// is the whole word's, so it says nothing about the key's own pointing and
// is not where these letters are the word. The index stands on word places,
// as it did before pieces were placed; the pieces it passed over are counted.
const wordPlaces = (g) => g.places.filter((q) => q.kind !== "piece");
let piecePlacesPassedOver = 0;
for (const [L, v] of Object.entries(store)) for (const g of v.readings) { piecePlacesPassedOver += g.places.length - wordPlaces(g).length; }
for (const [L, v] of Object.entries(store)) for (const g of v.readings) for (const q of wordPlaces(g)) {
  stand(L, q);
  if (!pointedAt.has(placeKey(q))) pointedAt.set(placeKey(q), q.pointed);
  const kq = kqOf(q.pointed);
  if (!kq) continue;
  kqSeen.add(placeKey(q));
  for (const [side, text] of [["qere", kq.q], ["ketiv", kq.k]]) for (const w of wordsOf(text)) {
    const X = letters(w);
    if (X && X !== L && !(byLetters.get(X) || new Map()).has(placeKey(q))) { stand(X, q); kqAdded[side] += 1; }
  }
}
// A RUN STANDS AS ITS WORDS DO (the span store, data/span-store/<book>.json):
// a place's key is the run's words, their letters joined by one space; its
// face the words as the store prints them at that place, joined as the ink
// joins them; its readings (below) the rows the run's card draws
const runLetters = (k) => wordsOf(k).map(letters).filter(Boolean).join(" ");
const spanBooks = readdirSync(join(DATA, "span-store")).filter((x) => /^[a-z0-9-]+\.json$/u.test(x)).sort()
  .map((f) => JSON.parse(readFileSync(join(DATA, "span-store", f), "utf8"))).filter((sp) => sp && sp.book && Array.isArray(sp.placesList) && sp.keys);
let spanPlaces = 0;
for (const sp of spanBooks) for (const pl of sp.placesList) {
  const R = runLetters(pl.key);
  if (!R.includes(" ")) continue;
  const parts = String(pl.key).split(/([\s\u05be]+)/u);
  let w = pl.first;
  const face = parts.map((x, i) => (i % 2 ? x : qereOf(pointedAt.get(`${sp.book}|${pl.ref}|${w++}`) || x))).join("");
  stand(R, { book: sp.book, ref: pl.ref, w_page: pl.first, pointed: w - pl.first === pl.last - pl.first + 1 ? face : pl.key, run: true });
  spanPlaces += 1;
}
const he = new Map();      // letters -> [letters, places, pointed, book, ref, w, [[pointing, places]]]
for (const [L, places] of byLetters) {
  if (!places.size) continue;
  // the face and the pointings count places, each once; a ketiv/qere place
  // stands as the word of either side whose letters are this row's, the
  // qere's first; the face is the most common print of the most common
  // pointing, so accents do not split a pointing's count
  const byPoint = new Map();   // pointing -> Map(print -> places)
  for (const q of places.values()) {
    const kq = q.run ? null : kqOf(q.pointed);
    const shown = !kq ? q.pointed : [...wordsOf(kq.q), ...wordsOf(kq.k)].find((x) => letters(x) === L) || null;
    if (!shown) continue;
    const f = q.run ? L : pointing(shown);
    if (!byPoint.has(f)) byPoint.set(f, new Map());
    byPoint.get(f).set(shown, (byPoint.get(f).get(shown) || 0) + 1);
  }
  const total = (m) => [...m.values()].reduce((n, k) => n + k, 0);
  const ranked = [...byPoint].map(([f, m]) => [f, total(m), m]).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  const top = ranked[0] ? [...ranked[0][2]].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0] : L;
  let first = null;
  for (const q of places.values()) if (!first || before(at(q), at(first))) first = q;
  he.set(L, [L, places.size, top, first.book, first.ref, first.w_page, L.includes(" ") ? [] : ranked.filter(([f]) => f && f !== L).map(([f, n]) => [f, n])]);
}

// every English reading, folded, with the letters it reaches
const en = new Map();      // folded -> Map(letters -> { by: Set, exact: Set(place), per: Map(src -> Set(place)) })
const add = (t, L, by, places) => {
  const f = fold(t);
  if (!f || !he.has(L)) return;
  if (!en.has(f)) en.set(f, new Map());
  const m = en.get(f);
  if (!m.has(L)) m.set(L, { by: new Set(), exact: new Set(), per: new Map() });
  const e = m.get(L); e.by.add(by);
  for (const q of places || []) {
    e.exact.add(placeKey(q));
    if (!e.per.has(by)) e.per.set(by, new Set());
    e.per.get(by).add(placeKey(q));
  }
};
let routeRows = 0, struckRows = 0, unnamedRows = 0, otherKeys = 0, pillCount = 0;
const routes = readShards(join(DATA, "route-store/shards"));
for (const [K, rows] of Object.entries(routes)) {
  const L = letters(K);
  // the card asks the store for a word's own letters; an abbreviation or a
  // key carrying a maqaf is another key, and no word's card reads it
  if (K !== L) { otherKeys += 1; continue; }
  for (const row of rows) {
    const m = row[3];
    if (struck.has(m)) { struckRows += 1; continue; }
    const src = rix.m_sources[m];
    if (!src) { unnamedRows += 1; continue; }
    routeRows += 1;
    for (const p of pills(row[1], src.licensePosture)) { pillCount += 1; add(joinSpan(p), L, m, null); }
  }
}
// THE OVERLAYS' ROWS ARE ROWS LIKE THE STORE'S (Jastrow, the Samaritan
// dictionaries): read as the card reads them, each under its own source,
// which the reader may switch off
let overlayRows = 0;
for (const id of readdirSync(join(DATA, "overlays")).sort()) {
  let oix = null;
  try { oix = JSON.parse(readFileSync(join(DATA, "overlays", id, "index.json"), "utf8")); } catch { continue; }
  const rows = readShards(join(DATA, "overlays", id, "shards"));
  for (const [K, rs] of Object.entries(rows)) {
    const L = letters(K);
    if (K !== L) continue;
    for (const row of rs) {
      const src = (oix.m_sources || {})[row[3]];
      if (!src) continue;
      overlayRows += 1;
      for (const p of pills(row[1], src.licensePosture)) add(joinSpan(p), L, row[3], null);
    }
  }
}
// a run's rows, as its card draws them
let spanRows = 0;
for (const sp of spanBooks) for (const pl of sp.placesList) {
  const R = runLetters(pl.key);
  if (!R.includes(" ")) continue;
  for (const r of sp.keys[pl.key] || []) {
    const row = r.slots || [], m = row[3];
    if (struck.has(m) || !rix.m_sources[m]) continue;
    spanRows += 1;
    for (const p of pills(row[1], rix.m_sources[m].licensePosture)) add(joinSpan(p), R, m, null);
  }
}
for (const [L, v] of Object.entries(store)) for (const g of v.readings) add(joinSpan(g.reading), L, g.src, wordPlaces(g));

// written beside the served index and put in its place only when whole
rmSync(TMP, { recursive: true, force: true });
mkdirSync(join(TMP, "he"), { recursive: true }); mkdirSync(join(TMP, "en"), { recursive: true });
const files = [];
const put = (rel, obj) => { const buf = gzipSync(Buffer.from(JSON.stringify(obj)), { level: 9 }); writeFileSync(join(TMP, rel), buf); files.push({ path: rel, bytes: buf.length, sha256: sha(buf) }); };
const byFirst = new Map();
for (const row of he.values()) { const k = row[0].codePointAt(0).toString(16).padStart(4, "0"); if (!byFirst.has(k)) byFirst.set(k, []); byFirst.get(k).push(row); }
for (const [k, rows] of [...byFirst].sort()) put(`he/${k}.bin`, rows.sort((a, b) => (a[0] < b[0] ? -1 : 1)));
const shards = new Map();
for (const [f, m] of en) {
  const h = sha(Buffer.from(f, "utf8")).slice(0, 2);
  if (!shards.has(h)) shards.set(h, {});
  shards.get(h)[f] = [...m].map(([L, e]) => [L, [...e.by].sort(), e.exact.size, Object.fromEntries([...e.per].sort().map(([s, set]) => [s, set.size]))]);
}
for (const [h, obj] of [...shards].sort()) put(`en/${h}.bin`, obj);
const index = {
  rule: "search-index-v1-hebrew-letters-and-english-readings-folded-arithmetic-over-served-stores",
  fold: "NFKC; lower case; U+2018 U+2019 U+201B U+2032 U+02BC as ' and U+201C U+201D U+201E U+2033 as \"; '/' and '+' as spaces; [ ] ( ) < > dropped, their words kept; white space runs one space; trimmed; one closing period dropped",
  routes: "a route is indexed as the card draws it: zone.html's senseSplit then readingSplit (damaged senses held back, page citations no reading), a no-derivatives text whole, each piece by spanJoin; only keys that are their own letters; only sources the store names and has not struck",
  ketiv_qere: "a place written '(ketiv) [qere]' stands in the row of each word of either side (split at a space or a maqaf), as that word is written there; a ketiv's letters may be no key of the dictionary store",
  runs: "a place of the span store (data/span-store/<book>.json) stands as a row keyed by its words' letters joined by one space, its face the words as printed there; its rows feed the English side as its card draws them",
  overlays: "data/overlays/*: each overlay's rows feed the English side as the card draws them, under the overlay's own source ids",
  left_out: "a division piece the card cuts out of a word (a prefix such as \u05d1 'in') is not indexed: only letters that stand as a word, or a run, are",
  letters_key: dix.letters_key,
  he_shard_rule: "he/<the first letter's code point, 4 hex>.bin: [letters, places, pointed, book, ref, w, [[pointing, places]]] sorted by letters; letters are a dictionary-store key, a ketiv's letters, or a run's words' letters joined by one space; pointed is the most common print of the most common pointing",
  pointing: "NFD; the letters U+05D0 to U+05EA and the points U+05B0 to U+05BC, U+05BF, U+05C1, U+05C2, U+05C7, in order; cantillation and meteg dropped",
  en_shard_rule: "en/<first two hex of sha256(utf8(folded))>.bin: { folded: [[letters, [source ids], places a source reads exactly these words, { per-place source: its places }]] }",
  from: { dictionary_store_version: dix.store_version, route_store_version: rix.store_version, zone_split_sha256: sha(Buffer.from(String(readingSplit) + String(senseSplit) + String(isNoDerivs))).slice(0, 12) },
  counts: { letters: he.size, english: en.size, pairs: [...en.values()].reduce((n, m) => n + m.size, 0), route_rows: routeRows, route_pills: pillCount, struck_rows_left_out: struckRows, unnamed_rows_left_out: unnamedRows, other_keys_left_out: otherKeys, kq_places: kqSeen.size, kq_added_to_ketiv_rows: kqAdded.ketiv, kq_added_to_qere_rows: kqAdded.qere, overlay_rows: overlayRows, run_places: spanPlaces, run_rows: spanRows, piece_places_passed_over: piecePlacesPassedOver, files: files.length, bytes: files.reduce((n, f) => n + f.bytes, 0) },
  index_version: sha(Buffer.from(files.map((f) => f.sha256).join("\n"))).slice(0, 12),
  files,
};
writeFileSync(join(TMP, "index.json"), JSON.stringify(index, null, 1) + "\n");
rmSync(OUT, { recursive: true, force: true });
renameSync(TMP, OUT);
console.log(`search index baked: ${index.counts.letters} letters, ${index.counts.english} English readings, ${index.counts.pairs} pairs, ${files.length} files, ${(index.counts.bytes / 1e6).toFixed(1)} MB, version ${index.index_version} (${routeRows} route rows as ${pillCount} pills; left out: ${struckRows} struck, ${unnamedRows} unnamed, ${otherKeys} other keys; ${kqSeen.size} ketiv/qere places; ${overlayRows} overlay rows; ${spanPlaces} run places, ${spanRows} run rows)`);
