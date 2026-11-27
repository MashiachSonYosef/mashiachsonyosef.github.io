// Read-only measure: every word of the thirty-nine books, the block its card opens on (the page's own choice:
// the one core piece of STEP's division, else the word whole), the rows every family of the kinds record holds under
// that block's key, and the page's gates in the page's order (entry, name, pointing, piece class, stem; the kinds
// switch read as open; Jastrow's word senses held back as the page holds them). Counts per family, and a reservoir of
// placings (a word and one reading of the family standing on its card) for the hand-read sample.
// v2: the lattice's baked grade where the word's own surface carries no vowel point the grade reads (the page's fallback);
// a source the owner's ruling rests off by its own switch (data/source-defaults-v1.json) counted apart; the lists the
// corpus lane holds back (send back v1 and v1.1), read as rows under their keys with no facts, as they would land today.
// Usage: node walk2.mjs <reader dir> <out dir> <send-back-v1 dir> <davidson kinds dir>
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { createHash } from "node:crypto";
const [R, OUT, HELD_DIR, DK_DIR] = process.argv.slice(2);
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
const DEFAULTS = JSON.parse(readFileSync(join(R, "data", "source-defaults-v1.json"), "utf8"));
const restsOffByItsSwitch = (row) => { const src = srcOf(row); return !!(src && DEFAULTS.off && DEFAULTS.off[src.key]); };
const SOURCE_SIGN = [/^(X|\u00d7|\+) /u, /\u00bf/u, /<[^>]*>/u, /\[[^\]]*\]/u, / ~ /u];
const hasSourceSign = (t) => SOURCE_SIGN.some((re) => re.test(String(t)));
const fnv1a = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); };
// the held lists: rows under their keys, no facts; Davidson's name mark from the lane's own kinds list
const HELD = new Map();   // key -> rows
const HELD_FAMS = [
  { id: "held-davidson-other-editions", family: "Davidson's seventeen other editions (the held Bible dictionaries list)", kind: "held" },
  { id: "held-etcbc", family: "The ETCBC's lexeme glosses (M8, the held Bible dictionaries list)", kind: "held" },
  { id: "held-step-expanded-strong", family: "STEP's Expanded Strong tags (M51, the held Bible dictionaries list)", kind: "held" },
  { id: "held-panlex-own-language", family: "PanLex's rows admitted by their own language field (M24, M82; held with their source)", kind: "held" },
  { id: "held-harkavy", family: "Harkavy 1925 (refused by the owner by name)", kind: "held" } ];
const heldFamOf = (line) => (line.source_class === "davidson" ? HELD_FAMS[0] : line.source_class === "etcbc" ? HELD_FAMS[1] : line.source_class === "step-expanded-strong" ? HELD_FAMS[2] : line.source_class === "panlex" ? HELD_FAMS[3] : line.source_class === "harkavy" ? HELD_FAMS[4] : null);
const heldSurvey = {};
if (HELD_DIR) {
  const kindOfRid = new Map();
  if (DK_DIR) for (const l of readFileSync(join(DK_DIR, "davidson-kinds-v1.jsonl"), "utf8").split("\n")) { if (!l) continue; const j = JSON.parse(l); kindOfRid.set(j.rid, j.kind); }
  const lists = [["landing-bible-dictionaries-v1.jsonl", null], ["landing-harkavy-v1.jsonl", null], ["landing-own-language-v1.jsonl", new Set(["panlex"])]];
  for (const [file, only] of lists) for (const l of readFileSync(join(HELD_DIR, file), "utf8").split("\n")) {
    if (!l) continue; const j = JSON.parse(l); const f = heldFamOf(j); if (!f) continue; if (only && !only.has(j.source_class)) continue;
    const k = j.to_key || j.key;
    const row = [j.rank ?? 0, j.route, j.definition || j.route, j.m, j.year || "S_NO_SOURCE_YEAR", null, Array.isArray(j.headwords) ? j.headwords : []];
    row.__held = f; row.__kind = kindOfRid.get(j.rid) || null; row.__loc = j.record_loc || null; row.__source = j.source;
    if (row.__kind === "NAME" || row.__kind === "PEOPLE") row.__name = true;
    (HELD.get(k) || HELD.set(k, []).get(k)).push(row);
    const o = heldSurvey[f.id] || (heldSurvey[f.id] = { id: f.id, family: f.family, rows: 0, keys: new Set(), headwords_pointed: 0, by_m: {}, by_kind: {} });
    o.rows += 1; o.keys.add(k); if (row[6].some((h) => typeof h === "string" && isPointed(h))) o.headwords_pointed += 1; o.by_m[j.m] = (o.by_m[j.m] || 0) + 1; if (row.__kind) o.by_kind[row.__kind] = (o.by_kind[row.__kind] || 0) + 1;
  }
}
const shardOf = (k) => createHash("sha256").update(k, "utf8").digest("hex").slice(0, 2);
const overlayRows = (id, key) => {
  const o = OV[id], sh = shardOf(key);
  if (!o.shards.has(sh)) { const p = join(o.dir, "shards", `${sh}.bin`); o.shards.set(sh, existsSync(p) ? gz(p) : {}); }
  const rows = o.shards.get(sh)[key]; if (!rows) return [];
  const senses = id === "jastrow" && sensesFit && WS.rows ? WS.rows[key] || null : null;
  return rows.filter((row) => !o.ruled || !row[7] || (row[7].lanes || [row[7].lane]).some((l) => o.ruled.has(l)))
    .map((row) => { const r = row.slice(0, 7); if (row.length > 8) { r[7] = Array.isArray(row[8]) ? row[8] : null; r[8] = Array.isArray(row[9]) ? row[9] : null; } r.__ov = id; r.__sense = !!(senses && senses.some(([rk, m]) => rk === r[0] && m === r[3])); return r; });
};
const srcOf = (row) => (row.__held ? { key: row.__source, label: row.__held.family } : row.__ov ? OV[row.__ov].ix.m_sources[row[3]] : store.index.m_sources[row[3]]);
const readingsOf = (row) => {
  if (row.__held) { const t = String(row[1] ?? "").trim(); return t ? [t] : []; }
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
const FAMS = [...kinds.families.filter((f) => f.kind !== "bible"), ...HELD_FAMS];
const famOfRow = (row) => (row.__held ? row.__held : famOf.get(row[3]));
const stat = new Map(FAMS.map((f) => [f.id, { id: f.id, family: f.family, kind: f.kind,
  words_reached_default_block: 0, words_reached_any_block: 0, words_standing: 0, words_standing_on_piece_block: 0, words_standing_on_whole_block: 0,
  row_placings_before_gates: 0, rows_this_entry: 0, rows_other_entry: 0, rows_no_entry_at_tagged_place: 0, rows_at_untagged_place: 0,
  withheld_entry: 0, withheld_name: 0, withheld_pointed_otherwise: 0, withheld_unpointed: 0, withheld_piece_class: 0, withheld_stem: 0, withheld_word_sense: 0, withheld_own_switch: 0,
  rows_standing: 0, rows_standing_this_entry: 0, rows_standing_no_entry: 0, rows_standing_untagged_place: 0,
  pills_standing: 0, pills_literal_new: 0, pills_with_a_new_word: 0, words_with_a_literal_new_pill: 0, words_with_a_new_word_pill: 0, words_where_the_twelve_stand_nothing: 0,
  piece_rows_standing_no_entry: 0, piece_would_match: 0, piece_would_mismatch_gate_acts: 0, piece_would_mismatch_gate_silent: 0, piece_unpointed_gate_acts: 0, piece_unpointed_gate_silent: 0,
  words_with_a_pill_of_the_places_own_entry: 0, words_standing_if_the_piece_were_graded: 0, pills_if_the_piece_were_graded: 0, pills_hidden_by_the_signs_switch: 0, words_where_every_pill_carries_a_sign: 0, words_standing_in_aramaic_stretches: 0, pills_in_aramaic_stretches: 0, standing_by_davidson_kind: {}, pills_this_entry: 0, pills_no_entry: 0,
  books: {}, top_keys: new Map(), seen: 0, sample: [], seen_this: 0, sample_this: [], seen_none: 0, sample_none: [] }]));
const K_SAMPLE = 400; const K_SPLIT = 240;
const inAramaic = (z, label) => { const [c, v] = String(label).split(":").map(Number); if (z === "daniel") return (c === 2 && v >= 4) || (c > 2 && c <= 7); if (z === "ezra") return (c === 4 && v >= 8) || c === 5 || (c === 6 && v <= 18) || (c === 7 && v >= 12 && v <= 26); if (z === "jeremiah") return c === 10 && v === 11; return false; };
const cache = new Map(); const reachCache = new Map(); const pieceAtt = new Map();
const askBlock = (K, pointed, tags, isName, st, sideStems, pp, side) => {
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
  let attested = false; const own = !!(pointed && isPointed(pointed));
  if (pointed) {
    // the row's own headwords where the surface carries a vowel point the grade reads; else the lattice's baked grade of the card (the page's fallback)
    const gr = (side.grades || {})[pointed]; const lat = gr && side.routes && side.routes[gr.k] ? side.routes[gr.k] : null;
    if (lat || own) {
      const fpIdx = lat ? new Map(lat.f.map((fp, i) => [fp, i])) : null;
      const gradeOf = (row) => { const sg = own ? gradeRow(row, pointed, true) : "-"; if (sg !== "-") return sg; if (!fpIdx) return "-"; const m = store.index.m_sources[row[3]]; const i = fpIdx.get(fnv1a(`${row[1]}|${m ? m.label : ""}`)); return i === undefined ? "-" : (gr.g[i] || "-"); };
      const grades = new Map(all.map((row) => [row, gradeOf(row)]));
      attested = [...grades.values()].includes("m");
      if (attested) routes = routes.filter((row) => { const h = thisEntry.has(row) ? null : heldByPointing(grades.get(row)); if (h) { why.set(row, h === "x" ? "pointed" : "unpointed"); return false; } return true; });
    }
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
  routes = routes.filter((row) => { if (restsOffByItsSwitch(row)) { why.set(row, "switch"); return false; } return true; });
  routes = routes.filter((row) => !senseOpened(row));
  // the overlays' rows: no entry asked; the pointing where the store attests it; the stem; a word sense held back
  let extra = [...overlayRows("jastrow", K), ...overlayRows("samaritan", K)];
  const extraAll = extra.slice();
  extra = extra.filter((row) => { if (restsOffByItsSwitch(row)) { why.set(row, "switch"); return false; } return true; });
  if (attested && own) extra = extra.filter((row) => { const h = heldByPointing(gradeRow(row, pointed, true)); if (h) { why.set(row, h === "x" ? "pointed" : "unpointed"); return false; } return true; });
  if (ofAnotherStem) extra = extra.filter((row) => { if (ofAnotherStem(row)) { why.set(row, "stem"); return false; } return true; });
  extra = extra.filter((row) => { if (row.__sense) { why.set(row, "sense"); return false; } return true; });
  // the held lists' rows, as they would land today: no facts, so no entry is asked; a name mark where the lane's kinds give one; the pointing as any row's
  const heldAll = HELD.get(K) || []; let held = heldAll.slice();
  if (isName === false) held = held.filter((row) => { if (row.__name) { why.set(row, "name"); return false; } return true; });
  if (pointed) {
    const byFam = new Map(); for (const row of heldAll) (byFam.get(row.__held.id) || byFam.set(row.__held.id, []).get(row.__held.id)).push(row);
    const famAttested = new Map([...byFam].map(([id, rows]) => [id, attested || (own && rows.some((r) => gradeRow(r, pointed, true) === "m"))]));
    held = held.filter((row) => { if (!famAttested.get(row.__held.id)) return true; const h = heldByPointing(own ? gradeRow(row, pointed, true) : "-"); if (h) { why.set(row, h === "x" ? "pointed" : "unpointed"); return false; } return true; });
  }
  return { all: [...all, ...extraAll, ...heldAll], standing: [...routes, ...extra, ...held], why, verdictOf, place: !!place };
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
      const ck = [K, gatePointed || "", tags ? tags.join(" ") : "", isName ? 1 : 0, st ? st.join(",") : "", sideStems ? z : "", pp && [...K].length === 1 ? `${pp.a},${pp.b},${pp.t}` : "", gatePointed && !isPointed(gatePointed) ? z : ""].join("\u0001");
      let A = cache.get(ck);
      if (!A) {
        const got = askBlock(K, gatePointed, tags, isName, st, sideStems, pp, side);
        // per family
        const per = new Map();
        const twelve = new Set(), twelveTokens = new Set();
        for (const row of got.standing) { const f = famOfRow(row); if (f && f.kind === "bible") for (const t of readingsOf(row)) { twelve.add(readingKey(t)); for (const x of tokens(t)) twelveTokens.add(x); } }
        for (const row of got.all) {
          const f = famOfRow(row); if (!f || f.kind === "bible") continue;
          const p = per.get(f.id) || per.set(f.id, { before: 0, this: 0, other: 0, none: 0, untagged: 0, wh: {}, standing: [], pills: new Map() }).get(f.id);
          p.before += 1;
          const v = got.verdictOf.get(row);
          if (!got.place || row.__ov || row.__held) { if (!got.place) p.untagged += 1; else p.none += 1; } else if (v === "this") p.this += 1; else if (v === "other") p.other += 1; else p.none += 1;
          const wy = got.why.get(row); if (wy) p.wh[wy] = (p.wh[wy] || 0) + 1;
        }
        for (const row of got.standing) {
          const f = famOfRow(row); if (!f || f.kind === "bible") continue;
          const p = per.get(f.id); p.standing.push(row);
          // signs off, where the page rests: a reading carrying a source's own sign is not offered as a pill (zone.html SOURCE_SIGN)
          for (const t of readingsOf(row)) { if (hasSourceSign(t)) { p.signed = (p.signed || 0) + 1; continue; } const rk = readingKey(t); if (!p.pills.has(rk)) p.pills.set(rk, { text: t, row, literalNew: !twelve.has(rk), newWord: tokens(t).some((x) => !twelveTokens.has(x)) }); }
        }
        A = { per, verdictOf: got.verdictOf, place: got.place, twelveN: twelve.size, twelve: [...twelve].slice(0, 14), all: got.all };
        cache.set(ck, A);
      }
      // reach under any block
      const anyKeys = new Set([key, ...(pg ? pg.map((p) => p.k) : [])]);
      const reachedAny = new Set();
      for (const k2 of anyKeys) { if (!k2) continue; let fs2 = reachCache.get(k2); if (!fs2) { fs2 = new Set(); for (const row of [...(store.routesWhole(k2) || []), ...overlayRows("jastrow", k2), ...overlayRows("samaritan", k2), ...(HELD.get(k2) || [])]) { const f = famOfRow(row); if (f && f.kind !== "bible") fs2.add(f.id); } reachCache.set(k2, fs2); } for (const f of fs2) reachedAny.add(f); }
      for (const f of reachedAny) stat.get(f).words_reached_any_block += 1;
      for (const [fid, p] of A.per) {
        const s = stat.get(fid);
        s.words_reached_default_block += 1; s.row_placings_before_gates += p.before;
        s.rows_this_entry += p.this; s.rows_other_entry += p.other; s.rows_no_entry_at_tagged_place += p.none; s.rows_at_untagged_place += p.untagged;
        s.withheld_entry += p.wh.entry || 0; s.withheld_name += p.wh.name || 0; s.withheld_pointed_otherwise += p.wh.pointed || 0; s.withheld_unpointed += p.wh.unpointed || 0; s.withheld_piece_class += p.wh.class || 0; s.withheld_stem += p.wh.stem || 0; s.withheld_word_sense += p.wh.sense || 0; s.withheld_own_switch += p.wh.switch || 0;
        if (!p.standing.length) continue;
        s.pills_hidden_by_the_signs_switch += p.signed || 0; if (!p.pills.size) { s.words_where_every_pill_carries_a_sign += 1; continue; }
        s.words_standing += 1; if (piece) s.words_standing_on_piece_block += 1; else s.words_standing_on_whole_block += 1;
        const aram = inAramaic(z, sec.label); if (aram) { s.words_standing_in_aramaic_stretches += 1; s.pills_in_aramaic_stretches += p.pills.size; }
        for (const row of p.standing) if (row.__kind) s.standing_by_davidson_kind[row.__kind] = (s.standing_by_davidson_kind[row.__kind] || 0) + 1;
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
        // two projections: only the pills of a row of the place's own entry; and the card as it would be were the core piece asked its own pointing
        { let own = 0, kept = 0; let pa = null;
          for (const pill of p.pills.values()) {
            const v = A.place ? A.verdictOf.get(pill.row) : null;
            if (v === "this") own += 1;
            if (!piece || !pPiece || v === "this") { kept += 1; continue; }
            if (pa === null) { pa = pieceAtt.get(`${K}\u0001${pPiece}`); if (pa === undefined) { pa = A.all.some((r) => lenientGrade(r, pPiece) === "m"); pieceAtt.set(`${K}\u0001${pPiece}`, pa); } }
            if (!pa || lenientGrade(pill.row, pPiece) === "m") kept += 1;
          }
          if (own) s.words_with_a_pill_of_the_places_own_entry += 1;
          if (kept) s.words_standing_if_the_piece_were_graded += 1; s.pills_if_the_piece_were_graded += kept; }
        s.pills_standing += p.pills.size; let ln = 0, nw = 0;
        for (const pill of p.pills.values()) { if (pill.literalNew) ln += 1; if (pill.newWord) nw += 1; }
        s.pills_literal_new += ln; s.pills_with_a_new_word += nw; if (ln) s.words_with_a_literal_new_pill += 1; if (nw) s.words_with_a_new_word_pill += 1;
        if (!A.twelveN) s.words_where_the_twelve_stand_nothing += 1;
        // reservoir over placings (word x pill); and two more, of the pills of a row of the place's own entry and of a row with none
        for (const [rk, pill] of p.pills) {
          s.seen += 1;
          const ev = A.place ? (A.verdictOf.get(pill.row) || "none") : "untagged place";
          if (ev === "this") s.pills_this_entry += 1; else s.pills_no_entry += 1;
          const slot = s.sample.length < K_SAMPLE ? s.sample.length : Math.floor(rnd() * s.seen);
          let slot2 = -1, into = null;
          if (ev === "this") { s.seen_this += 1; into = s.sample_this; slot2 = into.length < K_SPLIT ? into.length : Math.floor(rnd() * s.seen_this); }
          else if (ev === "none") { s.seen_none += 1; into = s.sample_none; slot2 = into.length < K_SPLIT ? into.length : Math.floor(rnd() * s.seen_none); }
          if (slot < K_SAMPLE || (slot2 >= 0 && slot2 < K_SPLIT)) {
            const row = pill.row, src = srcOf(row), fx = factsOf(row) || {};
            const lo = Math.max(0, e - 6), hi = Math.min(words.length, e + 7);
            const rec = { family: fid, book: z, label: sec.label, si, e, n, word: w.s, key: w.k, block: K, block_kind: piece ? "core piece" : "whole word", block_pointed: piece ? pPiece : pointed, tags: tags || null, name_place: isName,
              step_line: pg ? pg.map((x) => String(x.g || "").trim()).join(" + ") : null, lemma: w.hp || null,
              reading: pill.text, rk, m: row[3], source_label: src ? src.label : null, rank: row[0], route_text: String(row[1]).slice(0, 300), definition_text: row[2] ? String(row[2]).slice(0, 400) : null, year: row[4], headwords: Array.isArray(row[6]) ? row[6].slice(0, 6) : null, facts: fx, entry_verdict: A.place ? (A.verdictOf.get(row) || "none") : "untagged place",
              would_be_piece_grade: piece && pPiece ? lenientGrade(row, pPiece) : null, literal_new: pill.literalNew, new_word: pill.newWord, twelve: A.twelve,
              verse_he: words.slice(lo, hi).filter((x) => !x.mark).map((x) => (x === w ? `【${String(x.s).replace(/[֑-ֽ֯]/gu, "")}】` : String(x.s).replace(/[֑-ֽ֯]/gu, ""))).join(" "),
              verse_en: words.slice(lo, hi).filter((x) => !x.mark).map((x) => { const t = Array.isArray(x.pg) ? x.pg.map((y) => String(y.g || "").trim()).join("+") : "?"; return x === w ? `【${t}】` : t; }).join(" | "),
              davidson_kind: row.__kind || null, record_loc: row.__loc ? String(row.__loc).slice(0, 160) : null, aramaic_stretch: aram };
            if (slot < K_SAMPLE) s.sample[slot] = rec;
            if (into && slot2 >= 0 && slot2 < K_SPLIT) into[slot2] = rec;
          }
        }
      }
    }
  }
  process.stderr.write(`${z} done; words ${WORDS}; cache ${cache.size}\n`);
}
const out = [...stat.values()].map((s) => ({ ...s, top_keys: [...s.top_keys.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25), sample: undefined, sample_this: undefined, sample_none: undefined, placings_seen: s.seen }));
for (const o of Object.values(heldSurvey)) o.keys = o.keys.size;
writeFileSync(join(OUT, "walk2-counts.json"), JSON.stringify({ words: WORDS, piece_blocks: PIECE_BLOCKS, whole_blocks: WHOLE_BLOCKS, books: books.length, held_lists: heldSurvey, families: out }, null, 1));
const dump = (name, rows) => writeFileSync(join(OUT, name), rows.map((x) => JSON.stringify(x)).join("\n") + (rows.length ? "\n" : ""));
if (process.env.RESERVOIRS === "1") for (const s of stat.values()) { dump(`reservoir2-${s.id}.jsonl`, s.sample); if (s.sample_this.length) dump(`reservoir2-${s.id}.this.jsonl`, s.sample_this); if (s.sample_none.length && s.sample_this.length) dump(`reservoir2-${s.id}.none.jsonl`, s.sample_none); }
console.log(JSON.stringify({ words: WORDS, piece_blocks: PIECE_BLOCKS, whole_blocks: WHOLE_BLOCKS }));
