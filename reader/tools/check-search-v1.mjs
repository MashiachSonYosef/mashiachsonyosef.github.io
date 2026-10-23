// THE SEARCH (the owner, 2026-10-18: "hebrew by character ... and any english
// hits like create or be created or cut down", at the top of the book page;
// no transliteration). Index baked by tools/bake-search-index-v1.mjs. Every
// number the page prints is counted again here, in node, from the files the
// page is served (the dictionary store, the route store, the index's he/
// shards, the books' order), never by asking the page's own functions.
//   S1  the field stands above the toggles row, empty, with no results shown
//   S2  a page word's letters, typed: "these letters" is that word, with the
//       store's count of its places; "starting with these letters · N" is
//       every other word that begins so (a final letter matching its medial
//       form), N as the he/ shards count it and at least two, and the hits
//       shown are the first twelve of them, by places, then letters
//   S3  two readings a word's card draws, typed in English: one a per-place
//       source reads ("read so at N places", N counted again, with who reads
//       it) and one only a dictionary gives ("a dictionary reads it so");
//       each label's "N Hebrew words" counted from the route store, pieced as
//       the card pieces it, and the dictionary store
//   S4  with the card shut for real, a hit opens that word's card as the
//       concordance at its first place in this book, and the page stays
//   S5  a reading no source gives says so, and clearing the field clears it
//   S6  a word typed in a pointing other than its first place's is found by
//       its consonants, says "N pointed so" (fewer than all its places), and
//       opens at the first place in this book pointed so, not at the letters'
//       first place (the owner, 2026-10-18: "always find despite voweling, go
//       off consonants only with voweling as best match preferencing")
//   S7  letters that stand only in other books open at the first of their
//       places in the books' order: the address is that book's page with
//       dict=on and the place, and the card there is the concordance
//   S8  the same from a page opened with ?dict=off: the address still says
//       dict=on, and the card is the concordance
//   S9  a pointing typed among the words that start with its letters: the
//       words that stand so, or begin so, come first, each saying how many
//       places stand in the pointing it shows
//   S10 a word typed with its final letter also lists the longer words that
//       go on with the medial form; typed with a medial last letter it finds
//       the word written with the final
//   S11 a query that starts with a final letter is read as its letter (one
//       consonant, one letter): it answers as the medial form does, never
//       "did not answer"
//   S12 the fold's odd inputs: a curly and a straight apostrophe, a reading in
//       angle brackets and its words bare, answer alike, and as many words as
//       the fold written here counts
//   S13 a ketiv/qere pasted from the page, "(ketiv) [qere]", is read by its
//       qere: the qere's word, with how many places stand pointed so
//   S14 the ketiv's letters find the ketiv/qere place, and the hit opens there
//   S15 Escape while a search is on its way clears the box, and the late
//       answer never paints
//   S16 a hit chosen with the keyboard leaves focus inside the card
//   S17 with TAHOT switched off on the rail, a reading TAHOT gives no longer
//       answers for the word it alone reads so, or its count drops
// The words are found on the page or in the data, never named here
// (check-scope-derived S1).
// Usage: node tools/check-search-v1.mjs [url]
import { gunzipSync } from "node:zlib";
import { loadPlaywright, launchOptions } from "./playwright-v1.mjs";
import { defaultZoneUrl } from "./zones-on-disk-v1.mjs";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const START = defaultZoneUrl(/^https?:/u.test(process.argv[2] || "") ? process.argv[2] : "");

// ---------------------------------------------------------------------------
// THE RULES, written here from the index's own statement of them, so the page
// is held to the rule and not to itself
const isLetter = (n) => n >= 0x5d0 && n <= 0x5ea;
const isPoint = (n) => (n >= 0x5b0 && n <= 0x5bc) || n === 0x5bf || n === 0x5c1 || n === 0x5c2 || n === 0x5c7;
const letters = (s) => [...String(s || "").normalize("NFD")].filter((c) => isLetter(c.codePointAt(0))).join("");
const pointing = (s) => [...String(s || "").normalize("NFD")].filter((c) => { const n = c.codePointAt(0); return isLetter(n) || isPoint(n); }).join("");
// the five final letters and the medial letter each one is, for finding
const FINAL = new Map([[0x5da, 0x5db], [0x5dd, 0x5de], [0x5df, 0x5e0], [0x5e3, 0x5e4], [0x5e5, 0x5e6]]);
const medial = (s) => [...String(s || "")].map((c) => String.fromCodePoint(FINAL.get(c.codePointAt(0)) || c.codePointAt(0))).join("");
const endsFinal = (s) => FINAL.has(String(s).codePointAt(String(s).length - 1));
const hasHebrew = (s) => [...String(s || "")].some((c) => { const n = c.codePointAt(0); return n >= 0x590 && n <= 0x5ff; });
// THE FOLD: NFKC; lower case; the curly single quotes and primes are ', the
// curly double quotes are "; "/" and "+" are spaces; [ ] ( ) < > dropped,
// their words kept; white space runs one space; trimmed; one closing period
// dropped
const fold = (t) => String(t || "").normalize("NFKC").toLowerCase()
  .replace(/[\u2018\u2019\u201b\u2032\u02bc]/gu, "'").replace(/[\u201c\u201d\u201e\u2033]/gu, "\"")
  .replace(/[/+]/gu, " ").replace(/[[\]()<>]/gu, "").split(/\s+/u).filter(Boolean).join(" ").replace(/\.$/u, "");
// a two-word side of a ketiv/qere, or a run's key, at its spaces and maqafs
const wordsOf = (s) => String(s || "").split(/[\s\u05be]+/u).filter(Boolean);
// a reading as the card prints it: "/" pieces joined with " + ", one closing
// period dropped
const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "");
// a text's senses, at the semicolons outside its parentheses
const senseSplit = (text) => {
  const t = String(text || ""); const out = []; let start = 0, d = 0;
  for (let i = 0; i < t.length; i += 1) {
    if (t[i] === "(") d += 1; else if (t[i] === ")") { if (d > 0) d -= 1; } else if (t[i] === ";" && d === 0) { out.push(t.slice(start, i)); start = i + 1; }
  }
  out.push(t.slice(start));
  return out.map((x) => x.trim()).filter(Boolean);
};
// a sense's readings, at the commas outside its parentheses; a sense whose
// parentheses do not balance is damaged and draws no pill; a page citation
// is not a reading, unless it is all the sense holds
const readingSplit = (text) => {
  const s = String(text); let depth = 0;
  for (const c of s) { if (c === "(") depth += 1; else if (c === ")") { depth -= 1; if (depth < 0) return { readings: [s], damaged: true }; } }
  if (depth !== 0) return { readings: [s], damaged: true };
  const raw = []; let start = 0; depth = 0;
  for (let i = 0; i < s.length; i += 1) { const c = s[i]; if (c === "(") depth += 1; else if (c === ")") depth -= 1; else if (c === "," && depth === 0) { raw.push(s.slice(start, i)); start = i + 1; } }
  raw.push(s.slice(start));
  const pieces = raw.map((x) => x.trim()).filter(Boolean);
  const readings = pieces.filter((x) => !/^p{1,2}\.\s*\d/u.test(x));
  return { readings: readings.length ? readings : pieces, damaged: false };
};
const isNoDerivs = (key) => /(^|[^a-z])nd([^a-z]|$)/iu.test(String(key || "")) || /noderiv/iu.test(String(key || ""));
// a ketiv/qere place reads "(ketiv) [qere]": its pointing is the qere's, and
// the ketiv's letters stand there too
const kqOf = (s) => {
  const t = String(s || "");
  if (!/[([]/u.test(t)) return null;
  return { k: [...t.matchAll(/\(([^()]*)\)/gu)].map((m) => m[1]).join(""), q: [...t.matchAll(/\[([^[\]]*)\]/gu)].map((m) => m[1]).join("") };
};
const pointOfPlace = (s) => { const kq = kqOf(s); return pointing(kq && kq.q ? kq.q : s); };
const num = (s, re) => { const m = String(s || "").match(re); return m ? Number(m[1].replace(/,/gu, "")) : NaN; };

// ---------------------------------------------------------------------------
// THE SERVED FILES, read whole, in node
const fetchBuf = async (u) => {
  for (let i = 0; i < 3; i += 1) {
    try { const r = await fetch(u); if (r.ok) return Buffer.from(await r.arrayBuffer()); if (r.status === 404) return null; } catch { /* once more */ }
  }
  throw new Error(`could not read ${u}`);
};
const asJson = async (u) => { const b = await fetchBuf(u); if (!b) throw new Error(`not served: ${u}`); return JSON.parse(b.toString("utf8")); };
// a file a book may not have (a span store), or nothing
const maybeJson = async (u) => { const b = await fetchBuf(u); return b ? JSON.parse(b.toString("utf8")) : null; };
const asGz = async (u) => { const b = await fetchBuf(u); return b ? JSON.parse(gunzipSync(b).toString("utf8")) : null; };
const inPool = async (items, n, fn) => { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const it = items[i]; i += 1; await fn(it); } })); };
const HEX2 = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));

const loadModel = async (DATA) => {
  const [dix, rix, order, six] = await Promise.all(["dictionary-store/index.json", "route-store/index.json", "book-order-v1.json", "search-index/index.json"].map((f) => asJson(DATA + f)));
  const ORDER = order.files || [];
  const bookIx = (b) => { const i = ORDER.indexOf(b); return i < 0 ? 1e9 : i; };
  const at = (q) => [bookIx(q.book), ...String(q.ref).split(":").map(Number), q.w];
  const before = (a, b) => { const x = at(a), y = at(b); for (let i = 0; i < 4; i += 1) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };
  const struck = new Set([...((rix.language_admission || {}).struck_m_ids || []), ...((rix.source_strikes || {}).struck_m_ids || [])]);
  // the per-place sources and the M that carries each one's key on the rail
  const perM = {};
  for (const [id, rs] of Object.entries(dix.readings_sources || {})) perM[id] = Object.keys(rix.m_sources || {}).find((m) => rix.m_sources[m].key === rs.key) || null;
  const places = new Map();      // letters -> Map(place key -> place)
  const kq = new Set();          // letters a ketiv/qere place touches
  const perPlace = new Map();    // folded -> Map(letters -> Map(source -> Set(place key)))
  const perFolds = new Map();    // letters -> Map(source -> Set(folded))
  const routeBy = new Map();     // folded -> Map(letters -> Set(M))
  const odd = { apos: new Map(), angleWhole: new Map(), anglePart: new Map() };   // folded -> what was printed
  const addPlace = (L, q) => { if (!places.has(L)) places.set(L, new Map()); places.get(L).set(q.pk, q); };
  const sawPrinted = (printed, f) => {
    if (/'|\u2019|\u2018|\u02bc/u.test(printed)) { const e = odd.apos.get(f) || { curly: false, straight: false }; if (printed.includes("'")) e.straight = true; if (/[\u2018\u2019\u02bc]/u.test(printed)) e.curly = true; odd.apos.set(f, e); }
    // a reading wholly in angle brackets, and a bracketed word among others
    if (/^<[^<>]+>$/u.test(printed)) { if (!odd.angleWhole.has(f)) odd.angleWhole.set(f, printed); } else if (/(^|[\s+])<[^<>\s]+>([\s+]|$)/u.test(printed) && f.includes(" ") && !odd.anglePart.has(f)) odd.anglePart.set(f, printed);
  };
  await inPool(HEX2, 16, async (h) => {
    const shard = await asGz(`${DATA}dictionary-store/shards/${h}.bin`);
    for (const [L, v] of Object.entries(shard || {})) for (const g of (v && v.readings) || []) {
      const printed = spanJoin(g.reading), f = fold(printed);
      if (f) sawPrinted(printed, f);
      for (const p0 of g.places || []) {
        const q = { book: p0.book, ref: p0.ref, w: p0.w_page, pk: `${p0.book}|${p0.ref}|${p0.w_page}`, pointed: p0.pointed, pt: pointOfPlace(p0.pointed), kq: !!kqOf(p0.pointed) };
        addPlace(L, q);
        if (q.kq) { kq.add(L); const kk = kqOf(p0.pointed); for (const word of [...wordsOf(kk.q), ...wordsOf(kk.k)]) { const kt = letters(word); if (kt && kt !== L) { addPlace(kt, q); kq.add(kt); } } }
        if (!f) continue;
        if (!perPlace.has(f)) perPlace.set(f, new Map());
        const byL = perPlace.get(f); if (!byL.has(L)) byL.set(L, new Map());
        const bySrc = byL.get(L); if (!bySrc.has(g.src)) bySrc.set(g.src, new Set());
        bySrc.get(g.src).add(q.pk);
        if (!perFolds.has(L)) perFolds.set(L, new Map());
        if (!perFolds.get(L).has(g.src)) perFolds.get(L).set(g.src, new Set());
        perFolds.get(L).get(g.src).add(f);
      }
    }
  });
  // the route store, as the card draws it: keys that are letters alone, M
  // ids the store names and has not struck, a no-derivatives text whole and
  // every other text cut into senses and readings
  await inPool(HEX2, 16, async (h) => {
    const shard = await asGz(`${DATA}route-store/shards/${h}.bin`);
    for (const [K, rows] of Object.entries(shard || {})) {
      if (!K || K !== letters(K)) continue;
      for (const row of rows) {
        const m = row[3], src = (rix.m_sources || {})[m];
        if (!src || struck.has(m)) continue;
        const nd = isNoDerivs(src.licensePosture);
        const pieces = nd ? [String(row[1])] : senseSplit(row[1]).flatMap((sense) => { const r = readingSplit(sense); return r.damaged ? [] : r.readings; });
        for (const piece of pieces) {
          const printed = spanJoin(piece), f = fold(printed);
          if (!f) continue;
          sawPrinted(printed, f);
          if (!routeBy.has(f)) routeBy.set(f, new Map());
          const byL = routeBy.get(f); if (!byL.has(K)) byL.set(K, new Set());
          byL.get(K).add(m);
        }
      }
    }
  });
  // the overlays (data/overlays/<id>), read as the route store is, each under
  // its own index's sources
  // which overlays the page reads, from the page's own list of them
  const zoneText = String((await fetchBuf(new URL("../zone.html", DATA).href)) || "");
  const overlayIds = [...zoneText.matchAll(/dir: "data\/overlays\/([a-z0-9-]+)\/"/gu)].map((m) => m[1]);
  for (const id of overlayIds) {
    const oix = await maybeJson(`${DATA}overlays/${id}/index.json`);
    if (!oix) continue;
    await inPool(HEX2, 16, async (h) => {
      const shard = await asGz(`${DATA}overlays/${id}/shards/${h}.bin`);
      for (const [K, rows] of Object.entries(shard || {})) {
        if (!K || K !== letters(K)) continue;
        for (const row of rows) {
          const src = (oix.m_sources || {})[row[3]];
          if (!src) continue;
          const pieces = isNoDerivs(src.licensePosture) ? [String(row[1])] : senseSplit(row[1]).flatMap((sense) => { const r = readingSplit(sense); return r.damaged ? [] : r.readings; });
          for (const piece of pieces) {
            const f = fold(spanJoin(piece));
            if (!f) continue;
            if (!routeBy.has(f)) routeBy.set(f, new Map());
            const byL = routeBy.get(f); if (!byL.has(K)) byL.set(K, new Set());
            byL.get(K).add(row[3]);
          }
        }
      }
    });
  }
  // a run (the span store, data/span-store/<book>.json): its words' letters
  // joined by one space, standing at its first word, read by its rows
  for (const book of ORDER) {
    const sp = await maybeJson(`${DATA}span-store/${book}.json`);
    if (!sp || !Array.isArray(sp.placesList) || !sp.keys) continue;
    for (const pl of sp.placesList) {
      const R = wordsOf(pl.key).map(letters).filter(Boolean).join(" ");
      if (!R.includes(" ")) continue;
      addPlace(R, { book, ref: pl.ref, w: pl.first, pk: `${book}|${pl.ref}|${pl.first}`, pointed: pl.key, pt: R, kq: false });
      for (const r of sp.keys[pl.key] || []) {
        const row = r.slots || [], m = row[3], src = (rix.m_sources || {})[m];
        if (!src || struck.has(m)) continue;
        const pieces = isNoDerivs(src.licensePosture) ? [String(row[1])] : senseSplit(row[1]).flatMap((sense) => { const x = readingSplit(sense); return x.damaged ? [] : x.readings; });
        for (const piece of pieces) {
          const f = fold(spanJoin(piece));
          if (!f) continue;
          if (!routeBy.has(f)) routeBy.set(f, new Map());
          const byL = routeBy.get(f); if (!byL.has(R)) byL.set(R, new Set());
          byL.get(R).add(m);
        }
      }
    }
  }
  // the index's he/ shards, as served: one per first letter
  const he = new Map();
  await inPool((six.files || []).filter((f) => /^he\//u.test(f.path)), 8, async (f) => { he.set(f.path, (await asGz(`${DATA}search-index/${f.path}`)) || []); });
  const shardOf = (L) => he.get(`he/${String(L).codePointAt(0).toString(16).padStart(4, "0")}.bin`) || null;
  // each row's letters with its finals read as medial, worked out once
  const med = new Map();
  for (const rows of he.values()) for (const r of rows) med.set(r, medial(r[0]));
  const exactMemo = new Map();
  const forms = (L) => { const m = new Map(); for (const q of (places.get(L) || new Map()).values()) m.set(q.pt, (m.get(q.pt) || 0) + 1); return m; };
  const sorted = (L, book = null) => [...(places.get(L) || new Map()).values()].filter((q) => !book || q.book === book).sort(before);
  return {
    dix, rix, ORDER, perM, places, kq, perPlace, perFolds, routeBy, odd, before, forms, sorted, shardOf,
    // the rows that are these letters, a final letter matching its medial
    exactOf: (L) => { if (!exactMemo.has(L)) { const F = medial(L); exactMemo.set(L, (shardOf(L) || []).filter((r) => med.get(r) === F)); } return exactMemo.get(L); },
    // every other row that begins with these letters; a pointing typed puts
    // the rows that stand so, or begin so, first; then places; then letters
    startsOf: (L, qv = "") => {
      const F = medial(L);
      const so = (r) => !!qv && [...forms(r[0]).keys()].some((f) => f === qv || f.startsWith(qv));
      return (shardOf(L) || []).filter((r) => med.get(r) !== F && med.get(r).startsWith(F))
        .map((r) => ({ r, so: so(r) }))
        .sort((a, b) => (b.so - a.so) || (b.r[1] - a.r[1]) || (a.r[0] < b.r[0] ? -1 : a.r[0] > b.r[0] ? 1 : 0));
    },
    // where a hit opens: pointed so, this book first; else this book; else
    // the first place in the books' order
    opensAt: (L, book, form = "") => {
      const all = sorted(L);
      const so = form ? all.filter((q) => q.pt === form) : [];
      return so.find((q) => q.book === book) || so[0] || all.find((q) => q.book === book) || all[0] || null;
    },
    // the Hebrew words an English reading answers with, the sources switched
    // off left out (a per-place source by the M carrying its key)
    answers: (f, off) => {
      const out = new Map();
      const get = (L) => { if (!out.has(L)) out.set(L, { by: new Set(), exact: new Set() }); return out.get(L); };
      for (const [L, ms] of routeBy.get(f) || []) { if (!places.has(L)) continue; for (const m of ms) if (!off.has(m)) get(L).by.add(m); }
      for (const [L, bySrc] of perPlace.get(f) || []) {
        if (!places.has(L)) continue;
        for (const [src, set] of bySrc) { if (off.has(src) || (perM[src] && off.has(perM[src]))) continue; const e = get(L); e.by.add(src); for (const pk of set) e.exact.add(pk); }
      }
      return out;
    },
  };
};

// ---------------------------------------------------------------------------
// THE PAGE
const pw = await loadPlaywright();
const browser = await pw.chromium.launch(launchOptions());
const VIEW = { viewport: { width: 412, height: 915 } };
const fresh = () => { try { if (!sessionStorage.getItem("fresh")) { localStorage.clear(); sessionStorage.setItem("fresh", "1"); } } catch { /* fresh reader */ } };
const ctxA = await browser.newContext(VIEW);
await ctxA.addInitScript(fresh);
const watch = (pg) => { pg.on("pageerror", (e) => { console.log("PAGE ERROR:", e.message); bad += 1; }); return pg; };
const open = async (pg, url) => {
  await pg.goto(url, { waitUntil: "networkidle" });
  await pg.waitForSelector("section.seg .he-text .wb", { timeout: 30000 });
  await pg.waitForTimeout(1500);
};
const p = watch(await ctxA.newPage());
await open(p, START);
const here = await p.evaluate(() => ({
  book: (document.querySelector('meta[name="reader-book"]') || {}).content || new URLSearchParams(location.search).get("b") || "",
  built: !!document.querySelector('meta[name="reader-book"]'),
  data: `${new URL((document.querySelector('meta[name="reader-home"]') || {}).content || location.pathname.replace(/[^/]*$/u, ""), location.href).href}data/`,
}));
const BOOK = here.book;
const modelP = loadModel(here.data);
const offOf = (pg) => pg.evaluate(() => { try { const v = JSON.parse(localStorage.getItem("fh.sources.off") || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } }).then((v) => new Set(v));

// the results, settled: each label with the hits under it
const readOut = (pg) => pg.evaluate(() => {
  const o = document.getElementById("searchOut");
  const lettersOf = (s) => [...String(s || "").normalize("NFD")].filter((c) => { const n = c.codePointAt(0); return n >= 0x5d0 && n <= 0x5ea; }).join("");
  const groups = [], notes = [];
  for (const el of o.querySelectorAll("p.lab, p.note, button.hit, button.more")) {
    if (el.matches("p.lab")) groups.push({ lab: el.textContent, hits: [], more: "" });
    else if (el.matches("p.note")) notes.push(el.textContent);
    else if (el.matches("button.hit")) {
      if (!groups.length) groups.push({ lab: "", hits: [], more: "" });
      const t = (sel) => (el.querySelector(sel) || {}).textContent || "";
      groups[groups.length - 1].hits.push({ he: t(".he"), L: lettersOf(t(".he")), meta: t(".meta"), rd: t(".rd") });
    } else if (groups.length) groups[groups.length - 1].more = el.textContent;
  }
  return { hidden: o.hidden, text: o.textContent, notes, groups, hits: groups.flatMap((g) => g.hits) };
});
const settle = async (pg) => {
  await pg.waitForFunction(() => { const o = document.getElementById("searchOut"); return o && !o.hidden && !/^searching/u.test(o.textContent); }, null, { timeout: 20000 }).catch(() => null);
  return readOut(pg);
};
const type = async (pg, q) => { await pg.fill("#searchIn", ""); await pg.waitForTimeout(150); await pg.fill("#searchIn", q); await pg.waitForTimeout(450); return settle(pg); };
const group = (r, re) => r.groups.find((g) => re.test(g.lab)) || { lab: "", hits: [], more: "" };
const EXACT = /^these letters/u, STARTS = /^starting with these letters/u;
// a hit for these letters (a final matching its medial), paging on through
// "more" until it shows: its index among the hits, or -1
const hitIndex = async (pg, L) => {
  for (let i = 0; i < 60; i += 1) {
    const r = await readOut(pg);
    const j = r.hits.findIndex((h) => medial(h.L) === medial(L));
    if (j >= 0) return { i: j, hit: r.hits[j], r };
    const more = pg.locator("#searchOut button.more").first();
    if (!(await more.count())) return { i: -1, hit: null, r };
    await more.click(); await pg.waitForTimeout(150);
  }
  return { i: -1, hit: null, r: await readOut(pg) };
};
// where the card stands open: the active word's verse and its number in it
const cardAt = (pg) => pg.evaluate(() => {
  const hud = document.getElementById("hud"), act = document.querySelector(".he-text .wb.active");
  const out = { open: !!hud && !hud.hidden, dict: !!hud && hud.classList.contains("dict"), pill: (document.getElementById("dictPill") || { getAttribute: () => null }).getAttribute("aria-pressed"),
    hidden: (document.getElementById("searchOut") || {}).hidden, focus: !!hud && hud.contains(document.activeElement), onBody: document.activeElement === document.body,
    book: (document.querySelector('meta[name="reader-book"]') || {}).content || new URLSearchParams(location.search).get("b") || "", mark: window.__searchMark || null, at: "", k: "" };
  if (act) {
    const sec = act.closest("section.seg");
    const label = sec && sec.querySelector(".vnum") ? sec.querySelector(".vnum").textContent.trim() : "";
    out.at = `${label}:${sec ? [...sec.querySelectorAll(".he-text .wb:not(.mark)")].indexOf(act) + 1 : 0}`;
    out.k = act.__word ? act.__word.k : "";
  }
  return out;
});
const waitCard = async (pg, ms = 15000) => {
  const ok = await pg.waitForFunction(() => { const h = document.getElementById("hud"); return h && !h.hidden && !!document.querySelector(".he-text .wb.active"); }, null, { timeout: ms }).then(() => true).catch(() => false);
  if (ok) await pg.waitForTimeout(900);
  return ok;
};
// shut the card for real: focus off the field (where Escape clears the box
// instead), Escape, and the card hidden with no word left active
const closeCard = async (pg) => {
  await pg.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });
  await pg.keyboard.press("Escape");
  await pg.waitForFunction(() => document.getElementById("hud").hidden && !document.querySelector(".wb.active, .wjoin.active"), null, { timeout: 4000 }).catch(() => null);
  return pg.evaluate(() => ({ hud: document.getElementById("hud").hidden, active: !!document.querySelector(".wb.active, .wjoin.active") }));
};
// choose a hit on this page and stay on it: a mark set on the document
// before the press must still be there after
const followHere = async (pg, L, { keys = false } = {}) => {
  const shut = await closeCard(pg);
  const { i } = await hitIndex(pg, L);
  if (i < 0) return { found: false, shut };
  const was = await pg.evaluate(() => { window.__searchMark = String(Math.random()); return { mark: window.__searchMark, book: (document.querySelector('meta[name="reader-book"]') || {}).content || new URLSearchParams(location.search).get("b") || "" }; });
  const btn = pg.locator("#searchOut button.hit").nth(i);
  if (keys) { await btn.focus(); await pg.keyboard.press("Enter"); } else await btn.click();
  const opened = await waitCard(pg);
  const now = await cardAt(pg).catch(() => ({}));
  return { found: true, shut, was, opened, ...now, stayed: now.mark === was.mark && now.book === was.book };
};
// choose a hit that leads to another page: the address it goes to, and the
// card that page opens
const followAway = async (pg, L) => {
  const shut = await closeCard(pg);
  const { i } = await hitIndex(pg, L);
  if (i < 0) return { found: false, shut };
  const from = await pg.evaluate(() => location.pathname + location.search);
  const nav = pg.waitForEvent("framenavigated", { predicate: (fr) => { if (fr !== pg.mainFrame()) return false; const u = new URL(fr.url()); return u.pathname + u.search !== from; }, timeout: 20000 }).catch(() => null);
  await pg.locator("#searchOut button.hit").nth(i).click();
  const fr = await nav;
  const address = fr ? fr.url() : "";
  await pg.waitForLoadState("load").catch(() => null);
  await pg.waitForSelector("section.seg .he-text .wb", { timeout: 30000 }).catch(() => null);
  const opened = await waitCard(pg, 20000);
  return { found: true, shut, address, opened, ...(await cardAt(pg).catch(() => ({}))) };
};
const placeAt = (q) => (q ? `${q.ref}:${q.w}` : "");
const addressOf = (q) => {
  const u = new URL(START);
  return here.built ? `${u.origin}/${q.book}/${String(q.ref).split(":")[0]}/?dict=on#${q.ref}:${q.w}` : `${u.origin}${u.pathname}?b=${encodeURIComponent(q.book)}&dict=on#${q.ref}:${q.w}`;
};

// S1
const s1 = await p.evaluate(() => { const box = document.getElementById("searchBox"), row = document.getElementById("modeRow"); const inp = document.getElementById("searchIn"); return { box: !!box, above: !!box && !!row && (box.compareDocumentPosition(row) & Node.DOCUMENT_POSITION_FOLLOWING) > 0, empty: !!inp && inp.value === "", hidden: document.getElementById("searchOut").hidden }; });
check("S1  the search field stands above the toggles row, empty, with no results shown", s1.box && s1.above && s1.empty && s1.hidden, JSON.stringify(s1));

const M = await modelP;
// nothing is switched off by this check; a source the owner rests off by
// default (data/source-defaults-v1.json) is off on the rail, and is left out
// of every count here as the page leaves it out
const OFF = await offOf(p);
const pageWords = [...new Set((await p.evaluate(() => [...document.querySelectorAll(".he-text .wb:not(.mark)")].filter((x) => x.__word && x.__word.k && !x.__run).map((x) => x.__word.k))).map(letters).filter(Boolean))];
// a word this check can hold to one row: it stands somewhere, no ketiv/qere
// place touches it, and no other row folds to the same letters
const plain = (L) => !!L && M.places.has(L) && !M.kq.has(L) && M.exactOf(L).length === 1 && M.exactOf(L)[0][0] === L;
// the words of this book, by their first place in it
const bookWords = [...M.places].map(([L, m]) => [L, [...m.values()].filter((q) => q.book === BOOK).sort(M.before)]).filter(([, ps]) => ps.length).sort((a, b) => M.before(a[1][0], b[1][0]));

// S2: a page word whose letters begin at least two other words
const L2 = pageWords.find((L) => plain(L) && M.startsOf(L).length >= 2) || null;
let s2 = null;
if (L2) {
  const want = M.startsOf(L2), r = await type(p, L2);
  const ex = group(r, EXACT).hits, st = group(r, STARTS);
  const N = num(st.lab, /·\s*([\d,]+)/u);
  const shown = st.hits.map((h) => h.L), wantShown = want.slice(0, 12).map((x) => x.r[0]);
  s2 = { L: L2, places: M.places.get(L2).size, ex: ex[0] || null, N, want: want.length, shown, wantShown,
    ok: ex.length === 1 && ex[0].L === L2 && num(ex[0].meta, /([\d,]+) places? in all/u) === M.places.get(L2).size
      && N === want.length && N >= 2 && JSON.stringify(shown) === JSON.stringify(wantShown) };
}
check("S2  a word's letters, typed: \"these letters\" is that word with the store's count of its places; \"starting with these letters\" is every other word that begins so, counted as the index counts them, the first twelve by places, then letters",
  !!s2 && s2.ok, s2 ? `${s2.L}: ${s2.ex ? `"${s2.ex.meta}"` : "no exact hit"} (store ${s2.places}) · label ${s2.N} (he/ shards ${s2.want}) · shown ${s2.shown.length}${JSON.stringify(s2.shown) === JSON.stringify(s2.wantShown) ? " in order" : `: ${s2.shown.slice(0, 5).join(" ")} ... want ${s2.wantShown.slice(0, 5).join(" ")} ...`}` : "no page word begins two others");

// S3: the readings a card draws, one a per-place source reads at places and
// one only a dictionary gives
await p.fill("#searchIn", ""); await p.waitForTimeout(300);
let A = null, B = null;
for (let i = 0; i < 25 && !(A && B); i += 1) {
  const ok = await p.evaluate((i) => { const wb = [...document.querySelectorAll(".he-text .wb:not(.mark)")].filter((x) => x.querySelector(".g:not(.bare)") && !x.__run && x.__word && x.__word.k)[i]; if (!wb) return false; wb.scrollIntoView({ block: "center" }); (wb.querySelector(".w span") || wb.querySelector(".w")).click(); return true; }, i);
  if (!ok) break;
  const drawn = await p.waitForSelector('#hud > .rows .b-read .r-pills button[aria-pressed="true"]', { timeout: 8000 }).then(() => true).catch(() => false);
  const got = drawn ? await p.evaluate(() => ({ k: (document.querySelector(".wb.active") || {}).__word ? document.querySelector(".wb.active").__word.k : "", pills: [...document.querySelectorAll("#hud > .rows .b-read .r-pills button")].map((x) => x.textContent.trim()) })) : null;
  await closeCard(p);
  if (!got) continue;
  const L = letters(got.k);
  if (!plain(L)) continue;
  for (const t of got.pills) {
    const f = fold(t);
    if (hasHebrew(t) || f.length < 2 || t.length > 60) continue;
    const ans = M.answers(f, OFF).get(L);
    if (!ans) continue;
    if (!A && ans.exact.size) A = { t, f, L, want: ans.exact.size, n: M.answers(f, OFF).size };
    if (!B && !(M.perPlace.get(f) || new Map()).has(L) && ans.by.size) B = { t, f, L, n: M.answers(f, OFF).size };
  }
}
const s3 = [];
for (const c of [A, B].filter(Boolean)) {
  const r = await type(p, c.t);
  const lab = r.groups[0] ? r.groups[0].lab : "";
  const { hit } = await hitIndex(p, c.L);
  const N = num(lab, /·\s*([\d,]+)\s+Hebrew word/u);
  const ok = !!hit && N === c.n && !!hit.rd && (c === A ? num(hit.meta, /read so at ([\d,]+) place/u) === c.want : /a dictionary reads it so/u.test(hit.meta) && !/read so at/u.test(hit.meta));
  s3.push({ c, ok, say: `"${c.t}": ${lab || r.notes[0] || "no label"} (counted ${c.n}) · ${c.L} ${hit ? `"${hit.meta}" by ${hit.rd || "nobody named"}` : "not among the hits"}${c === A ? ` (store ${c.want} places)` : " (routes only)"}` });
}
check("S3  readings a word's card draws, typed in English: the word is among the hits, \"read so at N places\" where a per-place source reads it, \"a dictionary reads it so\" where only a dictionary does, with who reads it, and as many Hebrew words as the stores give",
  !!A && !!B && s3.every((x) => x.ok), `${s3.map((x) => x.say).join("  |  ")}${!A ? "  |  no card reading a per-place source gives" : ""}${!B ? "  |  no card reading only a dictionary gives" : ""}`);

// S4: the card shut, the hit opens this word's card at its first place here
let s4 = null;
if (A) {
  await type(p, A.t);
  const want = M.opensAt(A.L, BOOK);
  const got = await followHere(p, A.L);
  s4 = { want: placeAt(want), got, ok: got.found && got.shut.hud && !got.shut.active && got.opened && got.stayed && got.at === placeAt(want) && letters(got.k) === A.L && got.dict && got.pill === "true" && got.hidden };
}
check("S4  with the card shut for real, a hit opens that word's card as the concordance at its first place in this book, the results closed and the page the same page",
  !!s4 && s4.ok, s4 ? `shut first ${JSON.stringify(s4.got.shut)} · opened at ${s4.got.at || "nothing"} (store's first here ${s4.want}) · ${letters(s4.got.k)} · concordance ${s4.got.dict}/${s4.got.pill} · same page ${s4.got.stayed} · results hidden ${s4.got.hidden}` : "no reading from S3");

// S5: nothing reads it; clearing clears
await closeCard(p); await p.evaluate(() => window.scrollTo(0, 0));
const r5 = await type(p, "qqqzx vvqk");
await p.fill("#searchIn", ""); await p.waitForTimeout(500);
const cleared = await p.evaluate(() => document.getElementById("searchOut").hidden);
check("S5  a reading no source gives says so, and clearing the field clears the results",
  !r5.hits.length && /no word is read/u.test(r5.notes.join(" ")) && cleared, `"${r5.notes.join(" ")}" · cleared ${cleared}`);

// S6: a pointing other than the one the letters first stand in here
let c6 = null;
for (const [L, ps] of bookWords) {
  if (!plain(L) || [...L].length < 3) continue;
  const q = ps.find((x) => x.pt !== ps[0].pt && x.pt !== L && !x.kq);
  if (q) { c6 = { L, form: q.pt, first: ps[0], so: M.forms(L).get(q.pt) || 0, all: M.places.get(L).size, want: M.opensAt(L, BOOK, q.pt) }; break; }
}
let s6 = null;
if (c6) {
  await closeCard(p);
  const r = await type(p, c6.form);
  const ex = group(r, EXACT).hits[0] || null;
  const got = ex ? await followHere(p, c6.L) : null;
  s6 = { ex, got, ok: !!ex && pointing(ex.he) === c6.form && num(ex.meta, /([\d,]+) pointed so/u) === c6.so && c6.so < c6.all && num(ex.meta, /([\d,]+) places? in all/u) === c6.all
    && !!got && got.opened && got.stayed && got.at === placeAt(c6.want) && got.at !== placeAt(c6.first) && got.dict };
}
check("S6  a word typed in a pointing other than its first place's is found by its consonants, says how many places stand pointed so (fewer than all), and opens at the first place in this book pointed so, not at the letters' first place",
  !!s6 && s6.ok, s6 ? `${c6.L}: ${s6.ex ? `"${s6.ex.meta}" shown ${pointing(s6.ex.he) === c6.form ? "as typed" : "not as typed"}` : "no hit"} (store ${c6.so} pointed so of ${c6.all}) · opened at ${s6.got ? s6.got.at || "nothing" : "-"} (pointed so first here ${placeAt(c6.want)}, letters first here ${placeAt(c6.first)}) · same page ${s6.got ? s6.got.stayed : "-"}` : "no word here stands in two pointings");

// S7, S8: letters that stand only in other books
// letters in two or more other books, the first in the books' order not the
// first by name, so an address that sorts books any other way shows
let c7 = null;
for (const pass of [true, false]) {
  for (const [L, m] of [...M.places].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    if (!plain(L) || [...L].length < 3 || m.size < 2 || m.size > 60) continue;
    const books = [...new Set([...m.values()].map((q) => q.book))];
    if (books.includes(BOOK) || books.length < 2) continue;
    const want = M.opensAt(L, BOOK);
    if (pass && want.book === books.sort()[0]) continue;
    c7 = { L, want, books: books.length }; break;
  }
  if (c7) break;
}
const away = async (pg, label) => {
  const r = await type(pg, c7.L);
  const ex = group(r, EXACT).hits[0] || null;
  const got = ex && ex.L === c7.L ? await followAway(pg, c7.L) : { found: false };
  const ok = got.found && got.address === addressOf(c7.want) && got.opened && got.at === placeAt(c7.want) && letters(got.k) === c7.L && got.dict && got.pill === "true";
  return { ok, say: `${label}: ${c7.L} -> ${got.address || "no address"} (want ${addressOf(c7.want)}) · opened at ${got.at || "nothing"} · concordance ${got.dict}/${got.pill}` };
};
let s7 = null, s8 = null;
if (c7) {
  const p3 = watch(await ctxA.newPage());
  await open(p3, START);
  s7 = await away(p3, "opened plain");
  await p3.close();
  const ctxB = await browser.newContext(VIEW);
  await ctxB.addInitScript(fresh);
  const pB = watch(await ctxB.newPage());
  const u = new URL(START); u.searchParams.set("dict", "off");
  await open(pB, u.href);
  const offAtStart = await pB.evaluate(() => document.getElementById("dictPill").getAttribute("aria-pressed"));
  s8 = await away(pB, `opened ?dict=off (pill ${offAtStart})`);
  s8.ok = s8.ok && offAtStart === "false";
  await ctxB.close();
}
check("S7  letters that stand only in other books open at the first of their places in the books' order: the address is that book's page with dict=on and the place, and its card is the concordance",
  !!s7 && s7.ok, s7 ? s7.say : "no letters stand only outside this book");
check("S8  the same from a page opened with ?dict=off: the address still says dict=on, and the card opens as the concordance",
  !!s8 && s8.ok, s8 ? s8.say : "no letters stand only outside this book");

// S9: a pointing typed among the words that start with its letters
let c9 = null;
for (const [L, ps] of bookWords) {
  if (c9) break;
  if (!plain(L)) continue;
  const base = M.startsOf(L);
  if (base.length < 2 || base.length > 400) continue;
  for (const qv of [...new Set(ps.map((x) => x.pt))].filter((x) => x !== L)) {
    const ranked = M.startsOf(L, qv), n = ranked.filter((x) => x.so).length;
    if (n && n < ranked.length && JSON.stringify(ranked.slice(0, 12).map((x) => x.r[0])) !== JSON.stringify(base.slice(0, 12).map((x) => x.r[0]))) { c9 = { L, qv, ranked, n }; break; }
  }
}
let s9 = null;
if (c9) {
  await closeCard(p);
  const r = await type(p, c9.qv);
  const st = group(r, STARTS), ex = group(r, EXACT).hits[0] || null;
  const want = c9.ranked.slice(0, 12);
  const rows = st.hits.map((h, i) => {
    const w = want[i]; if (!w || h.L !== w.r[0]) return { ok: false, why: `${i + 1}: ${h.L} where ${w ? w.r[0] : "nothing"} belongs` };
    const N = num(h.meta, /([\d,]+) pointed so/u);
    if (!w.so) return { ok: Number.isNaN(N), why: `${i + 1}: ${h.L} says "${h.meta}" but stands in no form of the pointing typed` };
    const fm = M.forms(w.r[0]), face = pointing(h.he);
    const best = Math.max(...[...fm].filter(([f]) => f.startsWith(c9.qv)).map(([, k]) => k));
    return { ok: face.startsWith(c9.qv) && N === (fm.get(face) || 0) && N === best, why: `${i + 1}: ${h.L} shows a form ${face.startsWith(c9.qv) ? "that begins as typed" : "not begun as typed"}, "${h.meta}" (store ${fm.get(face) || 0} of that form, ${best} of the most common form begun so)` };
  });
  s9 = { st, ex, rows, ok: st.hits.length === want.length && rows.every((x) => x.ok) && num(st.lab, /·\s*([\d,]+)/u) === c9.ranked.length
    && !!ex && ex.L === c9.L && num(ex.meta, /([\d,]+) pointed so/u) === (M.forms(c9.L).get(c9.qv) || 0) };
}
check("S9  a pointing typed among the words that start with its letters: the words that stand so, or begin so, come first, each saying how many places stand in the form it shows",
  !!s9 && s9.ok, s9 ? `${c9.L}: ${c9.n} of ${c9.ranked.length} start in the pointing typed · ${s9.st.hits.length} shown (want ${Math.min(12, c9.ranked.length)}) · exact "${s9.ex ? s9.ex.meta : "none"}" (store ${M.forms(c9.L).get(c9.qv) || 0}) · ${(s9.rows.filter((x) => !x.ok).map((x) => x.why).slice(0, 2).join("; ")) || "every row as counted"}` : "no word here starts others in a pointing that reorders them");

// S10: a final letter, and a medial letter where the final stands
const c10 = [...pageWords, ...bookWords.map(([L]) => L)].find((L) => plain(L) && endsFinal(L) && M.startsOf(L).length >= 2) || null;
let s10 = null;
if (c10) {
  await closeCard(p);
  const r1 = await type(p, c10), st = group(r1, STARTS), ex1 = group(r1, EXACT).hits;
  const want = M.startsOf(c10);
  const mid = medial(c10);
  const r2 = await type(p, mid), ex2 = group(r2, EXACT).hits;
  s10 = { st, want, ex1, ex2, ok: ex1.length === 1 && ex1[0].L === c10 && num(st.lab, /·\s*([\d,]+)/u) === want.length && st.hits.length === Math.min(12, want.length)
    && st.hits.every((h) => h.L.startsWith(mid)) && JSON.stringify(st.hits.map((h) => h.L)) === JSON.stringify(want.slice(0, 12).map((x) => x.r[0])) && ex2.length === 1 && ex2[0].L === c10 && num(group(r2, STARTS).lab, /·\s*([\d,]+)/u) === want.length };
}
check("S10 a word typed with its final letter also lists the longer words that go on with the medial form; typed with a medial last letter it finds the word written with the final",
  !!s10 && s10.ok, s10 ? `${c10}: ${s10.ex1.map((h) => h.L).join(" ") || "no exact"} · ${s10.st.lab || "no starting list"} (he/ shards ${s10.want.length}) · every one going on with the medial ${s10.st.hits.every((h) => h.L.startsWith(medial(c10)))} · typed medial: ${s10.ex2.map((h) => h.L).join(" ") || "no exact"}` : "no word here ends in a final letter and begins two others");

// S11: a final letter first
const finalFirst = String.fromCodePoint(c10 ? c10.codePointAt(c10.length - 1) : 0x5dd);
await closeCard(p);
const r11 = await type(p, finalFirst);
const r11m = await type(p, medial(finalFirst));
const said = (r) => JSON.stringify({ notes: r.notes, groups: r.groups.map((g) => g.lab), hits: r.hits.map((h) => h.L) });
check("S11 a query that starts with a final letter is read as its letter: it answers as the medial form does, and never says the index did not answer",
  said(r11) === said(r11m) && !/did not answer/u.test(r11.text) && (r11.hits.length > 0 || r11.notes.some((x) => /no word of these letters stands in the books/u.test(x))),
  `U+${finalFirst.codePointAt(0).toString(16).toUpperCase()}: "${r11.notes.join(" | ") || r11.groups.map((g) => g.lab).join(" | ")}" · ${r11.hits.length} hits · as the medial: ${said(r11) === said(r11m)}`);

// S12: the fold's odd inputs, each pair as one query
// the odd input that answers with the most words, short of a list too long
// to be a reading anyone looks for
const rank = (m) => [...m].filter(([f]) => f.length <= 30 && !hasHebrew(f)).map(([f, v]) => [f, v, M.answers(f, OFF).size]).filter((x) => x[2] > 0 && x[2] <= 3000).sort((a, b) => b[2] - a[2] || (a[0] < b[0] ? -1 : 1));
const aposF = (rank(new Map([...M.odd.apos].filter(([, v]) => v.curly && v.straight)))[0] || rank(M.odd.apos)[0] || [null])[0];
const wholeA = rank(M.odd.angleWhole)[0] || null, partA = rank(M.odd.anglePart)[0] || null;
const pairs = [
  aposF && { what: "curly and straight apostrophe", q1: aposF.replace(/'/gu, "\u2019"), q2: aposF },
  wholeA && { what: "a reading wholly in angle brackets and bare", q1: wholeA[1], q2: fold(wholeA[1]) },
  partA && { what: "a word in angle brackets among others, and bare", q1: partA[1], q2: fold(partA[1]) },
].filter(Boolean);
const s12 = [];
for (const pr of pairs) {
  await closeCard(p);
  const f = fold(pr.q1), want = M.answers(f, OFF).size;
  const r1 = await type(p, pr.q1), r2 = await type(p, pr.q2);
  const n1 = num((r1.groups[0] || {}).lab, /·\s*([\d,]+)\s+Hebrew word/u), n2 = num((r2.groups[0] || {}).lab, /·\s*([\d,]+)\s+Hebrew word/u);
  const same = JSON.stringify(r1.hits.map((h) => [h.L, h.meta])) === JSON.stringify(r2.hits.map((h) => [h.L, h.meta]));
  s12.push({ ok: fold(pr.q2) === f && n1 === want && n2 === want && same && r1.hits.length > 0, say: `${pr.what}: "${pr.q1}" ${n1} / "${pr.q2}" ${n2} (folded "${f}", counted ${want})${same ? " same hits" : " different hits"}` });
}
check("S12 the fold's odd inputs answer alike: a curly and a straight apostrophe, a reading in angle brackets and its words bare, each as many words as the fold counts",
  pairs.length === 3 && s12.every((x) => x.ok), s12.map((x) => x.say).join("  |  ") || "no odd inputs in the data");

// S13: a ketiv/qere pasted from the page
const zoneKq = await p.evaluate(() => { const out = []; for (const s of (window.__zone && window.__zone.sections) || []) for (const w of s.words || []) if (w.kq && /^\([^()]*\)\s*\[[^[\]]*\]$/u.test(String(w.s || "").trim())) out.push({ label: s.label, s: w.s }); return out; });
const kqCases = [...zoneKq, ...[...M.places.values()].flatMap((m) => [...m.values()]).filter((q) => q.kq && /^\([^()]*\)\s*\[[^[\]]*\]$/u.test(String(q.pointed).trim())).slice(0, 200).map((q) => ({ label: `${q.book} ${q.ref}`, s: q.pointed }))];
const c13 = kqCases.find((x) => { const kq0 = kqOf(x.s), Lq = letters(kq0.q); return M.places.has(Lq) && Lq !== letters(kq0.k) && M.exactOf(Lq).length === 1; }) || null;
let s13 = null;
if (c13) {
  await closeCard(p);
  const kq0 = kqOf(c13.s), Lq = letters(kq0.q), so = M.forms(Lq).get(pointing(kq0.q)) || 0;
  const r = await type(p, c13.s), ex = group(r, EXACT).hits[0] || null;
  // the hit shows the qere as pointed, never the brackets
  s13 = { Lq, so, ex, ok: !!ex && ex.L === Lq && pointing(ex.he) === pointing(kq0.q) && !/[([]/u.test(ex.he) && num(ex.meta, /([\d,]+) pointed so/u) === so && so > 0 };
}
check("S13 a ketiv/qere pasted from the page, \"(ketiv) [qere]\", is read by its qere: the qere's word, with how many places stand pointed so",
  !!s13 && s13.ok, s13 ? `${c13.label}${zoneKq.includes(c13) ? " (from the page)" : " (from the store)"}: ${s13.ex ? `${s13.ex.L} "${s13.ex.meta}"` : "no exact hit"} (qere ${s13.Lq}, store ${s13.so} pointed so)` : "no ketiv/qere to paste");

// S14: the ketiv's letters find the ketiv/qere place
let c14 = null;
for (const pass of [BOOK, null]) {
  for (const [L, m] of M.places) {
    if (c14) break;
    for (const q of m.values()) {
      if (!q.kq || (pass && q.book !== pass)) continue;
      const kt = letters(kqOf(q.pointed).k);
      if (!kt || kt === L || M.exactOf(kt).length !== 1) continue;
      const want = M.opensAt(kt, BOOK);
      if (want && want.pk === q.pk) { c14 = { kt, q, want, all: M.places.get(kt).size }; break; }
    }
  }
  if (c14) break;
}
let s14 = null;
if (c14) {
  await closeCard(p);
  const r = await type(p, c14.kt), ex = group(r, EXACT).hits[0] || null;
  let got = null;
  if (ex && c14.want.book === BOOK) got = await followHere(p, c14.kt);
  else if (ex) { const p4 = watch(await ctxA.newPage()); await open(p4, START); await type(p4, c14.kt); got = await followAway(p4, c14.kt); got.stayed = got.address === addressOf(c14.want); await p4.close(); }
  s14 = { ex, got, ok: !!ex && ex.L === c14.kt && num(ex.meta, /([\d,]+) places? in all/u) === c14.all && !!got && got.opened && got.stayed && got.at === placeAt(c14.want) };
}
check("S14 the ketiv's letters find the ketiv/qere place, counted among the places of those letters, and the hit opens there",
  !!s14 && s14.ok, s14 ? `${c14.kt} (written at ${c14.q.book} ${c14.q.ref}:${c14.q.w}, ${c14.q.pt}): ${s14.ex ? `"${s14.ex.meta}"` : "no exact hit"} (store ${c14.all} places) · opened at ${s14.got ? s14.got.at || "nothing" : "-"}` : "no ketiv/qere place whose ketiv letters stand first there");

// S15: Escape while a search is on its way
let s15 = null;
if (A) {
  const p2 = watch(await ctxA.newPage());
  await open(p2, START);
  await p2.route(/\/data\/search-index\//u, async (route) => { await new Promise((res) => setTimeout(res, 1500)); await route.continue().catch(() => null); });
  await p2.fill("#searchIn", A.t);
  await p2.waitForTimeout(700);
  const during = await p2.evaluate(() => ({ hidden: document.getElementById("searchOut").hidden, text: document.getElementById("searchOut").textContent }));
  await p2.focus("#searchIn"); await p2.keyboard.press("Escape");
  await p2.waitForTimeout(3500);
  const after = await p2.evaluate(() => ({ hidden: document.getElementById("searchOut").hidden, hits: document.querySelectorAll("#searchOut button.hit").length, box: document.getElementById("searchIn").value }));
  s15 = { during, after, ok: !during.hidden && /searching/u.test(during.text) && after.hidden && after.hits === 0 && after.box === "" };
  await p2.close();
}
check("S15 Escape while a search is on its way clears the box, and the late answer never paints",
  !!s15 && s15.ok, s15 ? `in flight: "${s15.during.text.slice(0, 40)}" · 3.5 s after Escape: hidden ${s15.after.hidden}, ${s15.after.hits} hits, box "${s15.after.box}"` : "no reading to search for");

// S16: a hit chosen with the keyboard
let s16 = null;
if (L2) {
  await closeCard(p);
  await type(p, L2);
  const want = M.opensAt(L2, BOOK);
  const got = await followHere(p, L2, { keys: true });
  s16 = { want, got, ok: got.found && got.opened && got.focus && !got.onBody && got.at === placeAt(want) };
}
check("S16 a hit chosen with the keyboard opens its card and leaves focus inside it",
  !!s16 && s16.ok, s16 ? `${L2}: opened at ${s16.got.at || "nothing"} (want ${placeAt(s16.want)}) · focus inside the card ${s16.got.focus} · on the body ${s16.got.onBody}` : "no word from S2");

// S17: TAHOT switched off on the rail
const tahotM = M.perM.tahot || null;
let c17 = null;
if (tahotM) {
  const offT = new Set([...OFF, tahotM]);
  for (const [L, ps] of bookWords) {
    if (c17) break;
    if (!plain(L)) continue;
    for (const f of (M.perFolds.get(L) || new Map()).get("tahot") || []) {
      if (f.length < 2 || hasHebrew(f)) continue;
      const on = M.answers(f, OFF).get(L), off = M.answers(f, offT).get(L);
      if (on && (!off || off.exact.size < on.exact.size)) { c17 = { L, f, at: ps[0], on, off: off || null, nOn: M.answers(f, OFF).size }; break; }
    }
  }
}
let s17 = null;
if (c17) {
  await closeCard(p);
  await type(p, c17.f);
  const onHit = (await hitIndex(p, c17.L)).hit;
  const rOn = await readOut(p);
  const ctxC = await browser.newContext(VIEW);
  await ctxC.addInitScript((off) => { try { if (!sessionStorage.getItem("fresh")) { localStorage.clear(); localStorage.setItem("fh.sources.off", JSON.stringify(off)); sessionStorage.setItem("fresh", "1"); } } catch { /* fresh reader */ } }, [tahotM]);
  const pC = watch(await ctxC.newPage());
  await open(pC, START);
  const offC = await offOf(pC);
  const off = M.answers(c17.f, offC), offL = off.get(c17.L) || null;
  const rOff = await type(pC, c17.f);
  const offHit = (await hitIndex(pC, c17.L)).hit;
  const nOn = num((rOn.groups[0] || {}).lab, /·\s*([\d,]+)\s+Hebrew word/u), nOff = num((rOff.groups[0] || {}).lab, /·\s*([\d,]+)\s+Hebrew word/u);
  const metaOk = (hit, e) => (!e ? !hit : !!hit && (e.exact.size ? num(hit.meta, /read so at ([\d,]+) place/u) === e.exact.size : /a dictionary reads it so/u.test(hit.meta)));
  s17 = { offC: [...offC], off, offL, onHit, offHit, nOn, nOff, rOff,
    ok: offC.has(tahotM) && nOn === c17.nOn && metaOk(onHit, c17.on) && metaOk(offHit, offL)
      && (off.size ? nOff === off.size : !rOff.hits.length && /no word is read/u.test(rOff.notes.join(" "))) };
  await ctxC.close();
}
check("S17 with TAHOT switched off on the rail, a reading TAHOT gives no longer answers for the word it alone reads so, or its count drops by TAHOT's places",
  !!s17 && s17.ok, s17 ? `"${c17.f}" (${c17.L}, ${c17.at.ref}:${c17.at.w}) on: ${s17.nOn} words (counted ${c17.nOn}), ${s17.onHit ? `"${s17.onHit.meta}"` : "not among them"} (store ${c17.on.exact.size}) · ${tahotM} off (rail ${s17.offC.join(",")}): ${s17.off.size ? `${s17.nOff} words (counted ${s17.off.size})` : `"${s17.rOff.notes.join(" ")}"`}, ${s17.offHit ? `"${s17.offHit.meta}"` : "not among them"} (store ${s17.offL ? s17.offL.exact.size : "no answer"})` : "no reading TAHOT gives that switching it off would change");

await browser.close();
console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
