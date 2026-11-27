// Read-only measure: every word of the thirty-nine books, the block its card opens on (the page's own choice:
// the one core piece of STEP's division, else the word whole), the rows every family of the kinds record holds under
// that block's key, and the page's gates in the page's order (entry, name, pointing, piece class, stem; the kinds
// switch read as open; Jastrow's word senses held back as the page holds them). Counts per family, and a reservoir of
// placings (a word and one reading of the family standing on its card) for the hand-read sample.
// Usage: node walk.mjs <reader dir> <out dir>
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { createHash } from "node:crypto";
const [R, OUT] = process.argv.slice(2);
const T = (f) => import(join(R, "tools", f));
const { openRouteStore, factsOf, readingKey, printedForm, senseOpened, closed } = await T("gloss-store-v1.mjs");
const { placeEntry, placeTags, bdbEntriesAt, entryVerdict } = await T("entry-gate-v1.mjs");
const { gradeRow, heldByPointing, vowelForm, textForm, isPointed } = await T("pointing-grade-v1.mjs");
const { stemFamily } = await T("stem-family-v1.mjs");
const { zonesServed } = await T("zones-on-disk-v1.mjs");
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const kinds = JSON.parse(readFileSync(join(R, "data", "dictionary-kinds-v1.json"), "utf8"));
const store = openRouteStore(join(R, "data", "route-store"));
const famOf = new Map();   // M id -> family (store ids and overlay ids do not collide: the page merges them under their own ids)
const famByKey = new Map(); for (const f of kinds.families) for (const k of f.keys) famByKey.set(`${f.shelf === "overlay" ? f.overlay : ""}\u0000${k}`, f);
for (const [m, s] of Object.entries(store.index.m_sources)) { const f = famByKey.get(`\u0000${s.key}`); if (f) famOf.set(m, f); }
// the overlays
const OV = {};
for (const id of ["jastrow", "samaritan"]) {
  const dir = join(R, "data", "overlays", id), ix = JSON.parse(readFileSync(join(dir, "index.json"), "utf8"));
  const ruled = ix.lanes ? new Set(Object.entries(ix.lanes).filter(([, l]) => l && l.standing === "ruled").map(([x]) => x)) : null;
  OV[id] = { dir, ix, ruled, shards: new Map() };
  for (const [m, s] of Object.entries(ix.m_sources)) { if (store.index.m_sources[m]) throw new Error(`overlay id ${m} collides`); const f = famByKey.get(`${id}\u0000${s.key}`); if (f) famOf.set(m, f); }
}
const WS = JSON.parse(readFileSync(join(R, "data", "word-senses", "jastrow-v2.json"), "utf8"));
const sensesFit = WS.overlay && WS.overlay.store_version === OV.jastrow.ix.store_version;
const shardOf = (k) => createHash("sha256").update(k, "utf8").digest("hex").slice(0, 2);
const overlayRows = (id, key) => {
  const o = OV[id], sh = shardOf(key);
  if (!o.shards.has(sh)) { const p = join(o.dir, "shards", `${sh}.bin`); o.shards.set(sh, existsSync(p) ? gz(p) : {}); }
  const rows = o.shards.get(sh)[key]; if (!rows) return [];
  const senses = id === "jastrow" && sensesFit && WS.rows ? WS.rows[key] || null : null;
  return rows.filter((row) => !o.ruled || !row[7] || (row[7].lanes || [row[7].lane]).some((l) => o.ruled.has(l)))
    .map((row) => { const r = row.slice(0, 7); if (row.length > 8) { r[7] = Array.isArray(row[8]) ? row[8] : null; r[8] = Array.isArray(row[9]) ? row[9] : null; } r.__ov = id; r.__sense = !!(senses && senses.some(([rk, m]) => rk === r[0] && m === r[3])); return r; });
};
const srcOf = (row) => (row.__ov ? OV[row.__ov].ix.m_sources[row[3]] : store.index.m_sources[row[3]]);
const readingsOf = (row) => {
  if (!row.__ov) return store.readingsOf(row);
  const text = String(row[1] ?? ""), src = srcOf(row);
  if (!src || !src.ledger) { const t = text.trim(); return t ? [t] : []; }
  if (Array.isArray(row[8])) return row[8].map(String);
  const cuts = Array.isArray(row[7]) ? row[7] : [];
  if (!cuts.length) { const t = text.trim(); return t ? [t] : []; }
  const pieces = []; let from = 0; for (const i of cuts) { pieces.push(text.slice(from, i)); from = i + 1; } pieces.push(text.slice(from));
  return pieces.map((x) => x.trim()).filter(Boolean);
};
// the page's piece class (zone.html PIECE_CLASS), for a one-letter vav or he at the head or the end of a word
const marksOf = (v, letter) => (v.replace(/[ְ-ּׁׂ]/gu, "") === letter ? v.replace(/[^ְ-ּׁׂ]/gu, "") : null);
const PIECE_CLASS = { "ו": (v) => { const m = marksOf(v, "ו"); if (m === null) return null; if (/[ֹֺ]/u.test(m)) return "suffix"; if (/[ְ-ָ]/u.test(m)) return "prefix"; if (/ּ/u.test(m)) return "either"; return null; },
  "ה": (v) => { const m = marksOf(v, "ה"); if (m === null) return null; if (/ּ/u.test(m)) return "suffix"; if (/[ֱֲֶַ]/u.test(m)) return "prefix"; if (/ָ/u.test(m)) return "either"; return null; } };
const isLetter = (c) => c >= "א" && c <= "ת";
const lettersOf = (t) => [...String(t || "")].filter(isLetter).join("");
// the pointed letters of a piece, cut from the word's own pointed surface by letter count (null where the letters do not agree)
const clustersOf = (s) => { const out = []; for (const c of [...String(s || "").normalize("NFC")]) { if (isLetter(c)) out.push(c); else if (out.length) out[out.length - 1] += c; } return out; };
const pointedPiece = (surface, pg, at) => {
  const cl = clustersOf(surface); let a = 0; for (let i = 0; i < at; i += 1) a += lettersOf(pg[i].k).length;
  const L = lettersOf(pg[at].k).length; const part = cl.slice(a, a + L);
  return part.map((x) => x[0]).join("") === lettersOf(pg[at].k) ? part.join("") : null;
};
// a lenient grade for a piece: as the page grades a word, and with a first-letter dagesh set aside on both sides
const noFirstDagesh = (v) => v.replace(/^([א-ת][ְ-ֻׁׂ]*)ּ/u, "$1");
const lenientGrade = (row, surface) => {
  const hw = Array.isArray(row[6]) ? row[6].filter((h) => typeof h === "string" && isPointed(h)) : [];
  if (!hw.length) return "n";
  const S = noFirstDagesh(vowelForm(surface));
  return hw.some((h) => noFirstDagesh(vowelForm(h)) === S) ? "m" : "x";
};
const STOP = new Set(["to", "a", "an", "the", "of", "be", "or", "and", "in", "on", "for", "with", "by", "as", "at", "it", "is", "that", "one", "who", "which", "from", "something", "someone", "some", "any"]);
const stem = (w) => w.replace(/(ing|ed|es|s|ly)$/u, "");
const tokens = (t) => String(t).toLowerCase().replace(/[^a-z\s'-]/gu, " ").split(/\s+/u).map((x) => x.replace(/^['-]+|['-]+$/gu, "")).filter((x) => x && !STOP.has(x)).map(stem).filter(Boolean);
// seeded generator
let seed = 20261127; const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const FAMS = kinds.families.filter((f) => f.kind !== "bible");
const stat = new Map(FAMS.map((f) => [f.id, { id: f.id, family: f.family, kind: f.kind,
  words_reached_default_block: 0, words_reached_any_block: 0, words_standing: 0, words_standing_on_piece_block: 0, words_standing_on_whole_block: 0,
  row_placings_before_gates: 0, rows_this_entry: 0, rows_other_entry: 0, rows_no_entry_at_tagged_place: 0, rows_at_untagged_place: 0,
  withheld_entry: 0, withheld_name: 0, withheld_pointed_otherwise: 0, withheld_unpointed: 0, withheld_piece_class: 0, withheld_stem: 0, withheld_word_sense: 0,
  rows_standing: 0, rows_standing_this_entry: 0, rows_standing_no_entry: 0, rows_standing_untagged_place: 0,
  pills_standing: 0, pills_literal_new: 0, pills_with_a_new_word: 0, words_with_a_literal_new_pill: 0, words_with_a_new_word_pill: 0, words_where_the_twelve_stand_nothing: 0,
  piece_rows_standing_no_entry: 0, piece_would_match: 0, piece_would_mismatch_gate_acts: 0, piece_would_mismatch_gate_silent: 0, piece_unpointed_gate_acts: 0, piece_unpointed_gate_silent: 0,
  books: {}, top_keys: new Map(), seen: 0, sample: [] }]));
const K_SAMPLE = 400;
const cache = new Map(); const reachCache = new Map(); const pieceAtt = new Map();
const askBlock = (K, pointed, tags, isName, st, sideStems, pp) => {
  // the store's rows, the page's gates in the page's order
  const all = (store.routesWhole(K) || []).filter((r) => store.index.m_sources[r[3]]);
  const facts = all.map(factsOf);
  let routes = all.slice(); const why = new Map(); const thisEntry = new Set(); const verdictOf = new Map();
  const place = tags ? placeEntry(tags) : null;
  if (place) {
    const bdbHere = bdbEntriesAt(place, facts);
    all.forEach((row, i) => { const v = entryVerdict(facts[i], place, bdbHere); verdictOf.set(row, v); if (v === "this") thisEntry.add(row); if (v === "other") why.set(row, "entry"); });
    routes = routes.filter((row) => !why.has(row));
  }
  if (isName === false) routes = routes.filter((row) => { if ((factsOf(row) || {}).name) { why.set(row, "name"); return false; } return true; });
  let attested = false;
  if (pointed && isPointed(pointed)) {
    const grades = new Map(all.map((row) => [row, gradeRow(row, pointed, true)]));
    attested = [...grades.values()].includes("m");
    if (attested) routes = routes.filter((row) => { const h = thisEntry.has(row) ? null : heldByPointing(grades.get(row)); if (h) { why.set(row, h === "x" ? "pointed" : "unpointed"); return false; } return true; });
  }
  if (pp && [...K].length === 1 && PIECE_CLASS[K]) {
    const at = pp.a === 0 && pp.b < pp.t - 1 ? "prefix" : pp.b === pp.t - 1 && pp.a > 0 ? "suffix" : null;
    if (at) routes = routes.filter((row) => { const ks = (Array.isArray(row[6]) ? row[6] : []).filter(isPointed).map((h) => PIECE_CLASS[K](vowelForm(h))); const kind = !ks.length || ks.some((k) => k === null) ? "silent" : ks.includes(at) ? "this" : ks.includes("either") ? "silent" : "other"; if (kind === "other") { why.set(row, "class"); return false; } return true; });
  }
  let ofAnotherStem = null;
  if (pointed && st && sideStems) {
    const fams = new Set(st.map(stemFamily));
    ofAnotherStem = (row) => { const x = sideStems[`${row[3]}\u0001${row[0]}\u0001${row[1]}`]; return Array.isArray(x) && x.length > 0 && !x.some((y) => fams.has(stemFamily(y))); };
    routes = routes.filter((row) => { if (ofAnotherStem(row)) { why.set(row, "stem"); return false; } return true; });
  }
  routes = routes.filter((row) => !senseOpened(row));
  // the overlays' rows: no entry asked; the pointing where the store attests it; the stem; a word sense held back
  let extra = [...overlayRows("jastrow", K), ...overlayRows("samaritan", K)];
  const extraAll = extra.slice();
  if (attested) extra = extra.filter((row) => { const h = heldByPointing(gradeRow(row, pointed, true)); if (h) { why.set(row, h === "x" ? "pointed" : "unpointed"); return false; } return true; });
  if (ofAnotherStem) extra = extra.filter((row) => { if (ofAnotherStem(row)) { why.set(row, "stem"); return false; } return true; });
  extra = extra.filter((row) => { if (row.__sense) { why.set(row, "sense"); return false; } return true; });
  return { all: [...all, ...extraAll], standing: [...routes, ...extra], why, verdictOf, place: !!place };
};
const books = zonesServed(join(R, "data", "zones")).filter((z) => existsSync(join(R, "data", "zones", `${z}.lattice.bin`)));
let WORDS = 0, PIECE_BLOCKS = 0, WHOLE_BLOCKS = 0;
for (const z of books) {
  const zone = gz(join(R, "data", "zones", `${z}.bin`));
  if (!(zone.route === kinds.scope.zone.route && zone.schema_version === kinds.scope.zone.schema_version)) continue;
  const side = gz(join(R, "data", "zones", `${z}.lattice.bin`));
  for (const [si, sec] of zone.sections.entries()) {
    const words = sec.words || []; let n = 0;
    for (const [e, w] of words.entries()) {
      if (w.mark) continue; n += 1; WORDS += 1;
      let form = w, key = w.k, pointed = w.s;
      if (Array.isArray(w.w)) { form = w.w.find((r) => r && r.role === "QERE" && r.tg) || w.w.find((r) => r && r.role === "QERE") || w.w[0]; key = form.k; pointed = String(form.s || "").replace(/^\[+|\]+$/gu, ""); }
      const holder = w.tg || w.te ? w : form.tg || form.te ? form : null;
      const tags = holder ? placeTags(holder) : null;
      const isName = !!w.np;
      const pg = Array.isArray(w.pg) ? w.pg : null;
      const coreAt = pg ? pg.reduce((at, p, i) => (p && p.r === "core" ? (at === -1 ? i : -2) : at), -1) : -1;
      const piece = pg && pg.length > 1 && coreAt >= 0;
      let K, gatePointed, pp = null, pPiece = null;
      if (piece) { K = pg[coreAt].k; gatePointed = null; PIECE_BLOCKS += 1; let a = 0; for (let i = 0; i < coreAt; i += 1) a += lettersOf(pg[i].k).length; const L = lettersOf(K).length; pp = { a, b: a + L - 1, t: lettersOf(key).length }; pPiece = pointedPiece(pointed, pg, coreAt); }
      else { K = key; gatePointed = pointed; WHOLE_BLOCKS += 1; }
      if (!K) continue;
      const gr = gatePointed ? (side.grades || {})[gatePointed] : null;
      const st = gr && Array.isArray(gr.st) && gr.st.length ? gr.st : null;
      const sideStems = st ? (side.stems || {})[K] || null : null;
      const ck = [K, gatePointed || "", tags ? tags.join(" ") : "", isName ? 1 : 0, st ? st.join(",") : "", sideStems ? z : "", pp && [...K].length === 1 ? `${pp.a},${pp.b},${pp.t}` : ""].join("\u0001");
      let A = cache.get(ck);
      if (!A) {
        const got = askBlock(K, gatePointed, tags, isName, st, sideStems, pp);
        // per family
        const per = new Map();
        const twelve = new Set(), twelveTokens = new Set();
        for (const row of got.standing) { const f = famOf.get(row[3]); if (f && f.kind === "bible") for (const t of readingsOf(row)) { twelve.add(readingKey(t)); for (const x of tokens(t)) twelveTokens.add(x); } }
        for (const row of got.all) {
          const f = famOf.get(row[3]); if (!f || f.kind === "bible") continue;
          const p = per.get(f.id) || per.set(f.id, { before: 0, this: 0, other: 0, none: 0, untagged: 0, wh: {}, standing: [], pills: new Map() }).get(f.id);
          p.before += 1;
          const v = got.verdictOf.get(row);
          if (!got.place || row.__ov) { if (!got.place) p.untagged += 1; else p.none += 1; } else if (v === "this") p.this += 1; else if (v === "other") p.other += 1; else p.none += 1;
          const wy = got.why.get(row); if (wy) p.wh[wy] = (p.wh[wy] || 0) + 1;
        }
        for (const row of got.standing) {
          const f = famOf.get(row[3]); if (!f || f.kind === "bible") continue;
          const p = per.get(f.id); p.standing.push(row);
          for (const t of readingsOf(row)) { const rk = readingKey(t); if (!p.pills.has(rk)) p.pills.set(rk, { text: t, row, literalNew: !twelve.has(rk), newWord: tokens(t).some((x) => !twelveTokens.has(x)) }); }
        }
        A = { per, verdictOf: got.verdictOf, place: got.place, twelveN: twelve.size, twelve: [...twelve].slice(0, 14), all: got.all };
        cache.set(ck, A);
      }
      // reach under any block
      const anyKeys = new Set([key, ...(pg ? pg.map((p) => p.k) : [])]);
      const reachedAny = new Set();
      for (const k2 of anyKeys) { if (!k2) continue; let fs2 = reachCache.get(k2); if (!fs2) { fs2 = new Set(); for (const row of [...(store.routesWhole(k2) || []), ...overlayRows("jastrow", k2), ...overlayRows("samaritan", k2)]) { const f = famOf.get(row[3]); if (f && f.kind !== "bible") fs2.add(f.id); } reachCache.set(k2, fs2); } for (const f of fs2) reachedAny.add(f); }
      for (const f of reachedAny) stat.get(f).words_reached_any_block += 1;
      for (const [fid, p] of A.per) {
        const s = stat.get(fid);
        s.words_reached_default_block += 1; s.row_placings_before_gates += p.before;
        s.rows_this_entry += p.this; s.rows_other_entry += p.other; s.rows_no_entry_at_tagged_place += p.none; s.rows_at_untagged_place += p.untagged;
        s.withheld_entry += p.wh.entry || 0; s.withheld_name += p.wh.name || 0; s.withheld_pointed_otherwise += p.wh.pointed || 0; s.withheld_unpointed += p.wh.unpointed || 0; s.withheld_piece_class += p.wh.class || 0; s.withheld_stem += p.wh.stem || 0; s.withheld_word_sense += p.wh.sense || 0;
        if (!p.standing.length) continue;
        s.words_standing += 1; if (piece) s.words_standing_on_piece_block += 1; else s.words_standing_on_whole_block += 1;
        s.books[z] = (s.books[z] || 0) + 1; s.top_keys.set(K, (s.top_keys.get(K) || 0) + 1);
        s.rows_standing += p.standing.length;
        for (const row of p.standing) {
          const v = A.verdictOf.get(row);
          if (!A.place) s.rows_standing_untagged_place += 1; else if (v === "this") s.rows_standing_this_entry += 1; else s.rows_standing_no_entry += 1;
          if (piece && v !== "this" && pPiece) {
            s.piece_rows_standing_no_entry += 1;
            let pa = pieceAtt.get(`${K}\u0001${pPiece}`);
            if (pa === undefined) { pa = A.all.some((r) => lenientGrade(r, pPiece) === "m"); pieceAtt.set(`${K}\u0001${pPiece}`, pa); }
            const g = lenientGrade(row, pPiece);
            if (g === "m") s.piece_would_match += 1; else if (g === "x") { if (pa) s.piece_would_mismatch_gate_acts += 1; else s.piece_would_mismatch_gate_silent += 1; } else if (pa) s.piece_unpointed_gate_acts += 1; else s.piece_unpointed_gate_silent += 1;
          }
        }
        s.pills_standing += p.pills.size; let ln = 0, nw = 0;
        for (const pill of p.pills.values()) { if (pill.literalNew) ln += 1; if (pill.newWord) nw += 1; }
        s.pills_literal_new += ln; s.pills_with_a_new_word += nw; if (ln) s.words_with_a_literal_new_pill += 1; if (nw) s.words_with_a_new_word_pill += 1;
        if (!A.twelveN) s.words_where_the_twelve_stand_nothing += 1;
        // reservoir over placings (word x pill)
        for (const [rk, pill] of p.pills) {
          s.seen += 1;
          const slot = s.sample.length < K_SAMPLE ? s.sample.length : Math.floor(rnd() * s.seen);
          if (slot < K_SAMPLE) {
            const row = pill.row, src = srcOf(row), fx = factsOf(row) || {};
            const lo = Math.max(0, e - 6), hi = Math.min(words.length, e + 7);
            s.sample[slot] = { family: fid, book: z, label: sec.label, si, e, n, word: w.s, key: w.k, block: K, block_kind: piece ? "core piece" : "whole word", block_pointed: piece ? pPiece : pointed, tags: tags || null, name_place: isName,
              step_line: pg ? pg.map((x) => String(x.g || "").trim()).join(" + ") : null, lemma: w.hp || null,
              reading: pill.text, rk, m: row[3], source_label: src ? src.label : null, rank: row[0], route_text: String(row[1]).slice(0, 300), definition_text: row[2] ? String(row[2]).slice(0, 400) : null, year: row[4], headwords: Array.isArray(row[6]) ? row[6].slice(0, 6) : null, facts: fx, entry_verdict: A.place ? (A.verdictOf.get(row) || "none") : "untagged place",
              would_be_piece_grade: piece && pPiece ? lenientGrade(row, pPiece) : null, literal_new: pill.literalNew, new_word: pill.newWord, twelve: A.twelve,
              verse_he: words.slice(lo, hi).filter((x) => !x.mark).map((x) => (x === w ? `【${String(x.s).replace(/[֑-ֽ֯]/gu, "")}】` : String(x.s).replace(/[֑-ֽ֯]/gu, ""))).join(" "),
              verse_en: words.slice(lo, hi).filter((x) => !x.mark).map((x) => { const t = Array.isArray(x.pg) ? x.pg.map((y) => String(y.g || "").trim()).join("+") : "?"; return x === w ? `【${t}】` : t; }).join(" | ") };
          }
        }
      }
    }
  }
  process.stderr.write(`${z} done; words ${WORDS}; cache ${cache.size}\n`);
}
const out = [...stat.values()].map((s) => ({ ...s, top_keys: [...s.top_keys.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25), sample: undefined, placings_seen: s.seen }));
writeFileSync(join(OUT, "walk-counts.json"), JSON.stringify({ words: WORDS, piece_blocks: PIECE_BLOCKS, whole_blocks: WHOLE_BLOCKS, books: books.length, families: out }, null, 1));
for (const s of stat.values()) writeFileSync(join(OUT, `reservoir-${s.id}.jsonl`), s.sample.map((x) => JSON.stringify(x)).join("\n") + (s.sample.length ? "\n" : ""));
console.log(JSON.stringify({ words: WORDS, piece_blocks: PIECE_BLOCKS, whole_blocks: WHOLE_BLOCKS }));
