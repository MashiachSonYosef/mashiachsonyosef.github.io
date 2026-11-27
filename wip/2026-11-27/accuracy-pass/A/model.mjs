// Read-only model of the page's gates at a card's cell, for the accuracy pass (helper A).
// It imports the tree's own gate functions (tools/*.mjs) and repeats, in the page's order, what poolFor
// (zone.html 8830-9420) does to the store's rows of a key at rest: the entry gate, the names gate, the pointing
// (pointed otherwise; unpointed), the piece class, the stems, the kinds that rest shut, the sense openings.
// Nothing here writes into the tree.
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

export const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));

export const loadModel = async (R) => {
  const T = (f) => import(join(R, "tools", f));
  const { openRouteStore, factsOf, readingKey, opensWithStrongSign, senseOpened, printedForm } = await T("gloss-store-v1.mjs");
  const { placeEntry, placeTags, bdbEntriesAt, entryVerdict, entrySaid, numberOf, tagOf, lemmaEntries } = await T("entry-gate-v1.mjs");
  const { gradeRow, heldByPointing, vowelForm, textForm, isPointed } = await T("pointing-grade-v1.mjs");
  const { stemFamily } = await T("stem-family-v1.mjs");
  const { nameWithheld } = await T("names-gate-v1.mjs");
  const { readKinds, restsOffOf } = await T("dictionary-kinds-v1.mjs");
  const { zonesServed } = await T("zones-on-disk-v1.mjs");
  const store = openRouteStore(join(R, "data", "route-store"));
  const index = store.index;
  const kinds = readKinds(join(R, "data"));
  const restsOff = restsOffOf(kinds.rec, index.m_sources || {}, factsOf);
  // the twelve: the families of kind bible, by M id
  const keyToFam = new Map(); for (const f of kinds.rec.families) for (const k of f.keys) keyToFam.set(k, f);
  const famOf = new Map();
  for (const [m, s] of Object.entries(index.m_sources)) { const f = keyToFam.get(s.key); if (f) famOf.set(m, f); }
  const twelve = new Map([...famOf].filter(([, f]) => f.kind === "bible").map(([m, f]) => [m, f.id]));
  const books = zonesServed(join(R, "data", "zones")).filter((z) => existsSync(join(R, "data", "zones", `${z}.lattice.bin`)));

  // the page's own, copied to the character (zone.html 3431-3449): the kind a one-letter headword points
  const marksOf = (v, letter) => (v.replace(/[ְ-ּׁׂ]/gu, "") === letter ? v.replace(/[^ְ-ּׁׂ]/gu, "") : null);
  const PIECE_CLASS = Object.freeze({
    "ו": (v) => { const m = marksOf(v, "ו"); if (m === null) return null; if (/[ֹֺ]/u.test(m)) return "suffix"; if (/[ְ-ָ]/u.test(m)) return "prefix"; if (/ּ/u.test(m)) return "either"; return null; },
    "ה": (v) => { const m = marksOf(v, "ה"); if (m === null) return null; if (/ּ/u.test(m)) return "suffix"; if (/[ֱֲֶַ]/u.test(m)) return "prefix"; if (/ָ/u.test(m)) return "either"; return null; },
  });
  // zone.html 3644-3646, 3684-3687: the signs
  const STRONG_SIGN = /^(X|×|\+) /u;
  const SOURCE_SIGN = [STRONG_SIGN, /¿/u, /<[^>]*>/u, /\[[^\]]*\]/u, / ~ /u];
  const hasSourceSign = (t) => SOURCE_SIGN.some((re) => re.test(String(t)));
  const signOnly = (t) => /^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+)$/u.test(String(t).trim());
  const lettersIn = (s) => [...String(s || "")].filter((c) => c >= "א" && c <= "ת").join("");
  // zone.html 3291: the lattice's fingerprint of a row
  const fnv1a = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); };

  /** Every store row of a key through the page's gates, in the page's order (poolFor), at one cell.
   *  cell: { key, pointed (the form graded, or null for a piece's cell), tags (the place's tags the cell is asked
   *  with, or null), name (true, false or null), pp (the piece place { a, b, t } or null), side (the book's sidecar) }.
   *  Returns { rows: [{ row, m, twelve, facts, verdict, why, grade, held, shutAlways }], attested, place, bdbHere }.
   *  held: null (stands so far) | "entry" | "name" | "point-x" | "point-n" | "piece" | "stem" | "note" (a sense opening).
   *  The kinds that rest shut are laid by the caller at the place (a row may stand at the places its facts name). */
  const evalCell = ({ key, pointed, tags, name, pp, side }) => {
    const all = store.routesFor(key) || [];
    const facts = all.map(factsOf);
    const place = tags ? placeEntry(tags) : null;
    const bdbHere = place ? bdbEntriesAt(place, facts) : null;
    const out = all.map((row, i) => ({ row, i, m: String(row[3]), twelve: twelve.get(String(row[3])) || null, facts: facts[i], verdict: place ? entryVerdict(facts[i], place, bdbHere) : "unasked", why: null, grade: null, held: null }));
    // 1. the entry gate
    if (place) for (const x of out) if (x.verdict === "other") {
      x.held = "entry";
      const f = x.facts || {}, nums = Array.isArray(f.n) ? f.n : [];
      x.why = !nums.length ? "bdb-entry" : !nums.some((n) => place.numbers.includes(n)) ? "number" : "letter";
    }
    // 2. the names gate
    if (name === false) for (const x of out) if (!x.held && nameWithheld(x.facts, false)) x.held = "name";
    // 4. the pointing: graded over every row of the key; acts where some row points as the place does.
    // As the page (zone.html 8945-8989): a row is graded by its own headwords where the form asked is pointed
    // (isPointed), else, and for a row that carries no headword slot, by the lattice card's grade of it where the
    // sidecar graded this surface (its fingerprint); the gate is asked where either is at hand (lat || own).
    let attested = false, attestedByTwelve = false, gradedBy = null;
    if (pointed) {
      const gr = side && side.grades ? side.grades[pointed] : null;
      const lat = gr && side.routes && side.routes[gr.k] ? side.routes[gr.k] : null;
      const own = isPointed(pointed);
      if (lat || own) {
        gradedBy = own ? "headwords" : "lattice";
        const fpIdx = lat ? new Map(lat.f.map((fp, j) => [fp, j])) : null;
        const beginsWord = !(pp && Number.isInteger(pp.a) && pp.a > 0);
        for (const x of out) {
          let g = own ? gradeRow(x.row, pointed, beginsWord) : "-";
          if (g === "-" && fpIdx) { const ms = index.m_sources[x.row[3]]; const j = fpIdx.get(fnv1a(`${x.row[1]}|${ms ? ms.label : ""}`)); g = j === undefined ? "-" : (gr.g[j] || "-"); }
          x.grade = g;
          if (g === "m") { attested = true; if (x.twelve) attestedByTwelve = true; }
        }
        if (attested) for (const x of out) if (!x.held && x.verdict !== "this") { const h = heldByPointing(x.grade); if (h === "x") x.held = "point-x"; else if (h) x.held = "point-n"; }
      }
    }
    // 5. the piece class: a one-letter piece at the head or the end of a word
    let pieceAt = null;
    {
      const one = lettersIn(key);
      const cls = pp && Number.isInteger(pp.t) && one.length === 1 ? PIECE_CLASS[one] : null;
      pieceAt = cls ? (pp.a === 0 && pp.b < pp.t - 1 ? "prefix" : pp.b === pp.t - 1 && pp.a > 0 ? "suffix" : null) : null;
      if (pieceAt) for (const x of out) {
        const row = x.row;
        let k = "silent";
        if (Array.isArray(row[6])) {
          const ks = row[6].filter(isPointed).map((h) => cls(vowelForm(h)));
          if (!ks.length || ks.some((q) => q === null)) k = "silent"; else if (ks.includes(pieceAt)) k = "this"; else if (ks.includes("either")) k = "silent"; else k = "other";
        }
        x.pieceKind = k;
        if (!x.held && k === "other") x.held = "piece";
      }
    }
    // 6. the stems
    let stemsHere = null;
    if (pointed && side) {
      const gr = side.grades ? side.grades[pointed] : null;
      const st = gr && Array.isArray(gr.st) && gr.st.length ? gr.st : null;
      const rs = st && side.stems ? side.stems[key] : null;
      if (st && rs) {
        stemsHere = st;
        const fams = new Set(st.map(stemFamily));
        for (const x of out) {
          const s = rs[`${x.row[3]}\u0001${x.row[0]}\u0001${x.row[1]}`];
          if (Array.isArray(s) && s.length) { x.stems = s; if (!x.held && !s.some((y) => fams.has(stemFamily(y)))) x.held = "stem"; }
        }
      }
    }
    // 9. the words that open a numbered sense are notes (laid after the kinds by the caller's order; marked here)
    for (const x of out) if (senseOpened(x.row)) x.opens = true;
    return { rows: out, attested, attestedByTwelve, gradedBy, place, bdbHere, pieceAt, stemsHere };
  };

  /** The cells a word's card offers at rest: the whole form, and the pieces of the place's own division.
   *  word: a plain word of the zone (no pair). Returns [{ kind: "whole"|"piece", i, key, pointed, tags, name, pp, role, opened }]. */
  const cellsOfWord = (w, namesMarked) => {
    const name = !namesMarked || !!w.np;
    const pg = Array.isArray(w.pg) && w.pg.length > 1 && w.pg.every((p) => p && p.k && p.s === w.pg[0].s) && w.pg.map((p) => p.k).join("") === w.k ? w.pg : null;
    const tags = placeTags(w);
    const L = lettersIn(w.k).length;
    const cells = [{ kind: "whole", i: -1, key: w.k, pointed: w.s || null, tags, name, pp: L ? { a: 0, b: L - 1, t: L } : null, role: "whole", divided: !!pg }];
    if (pg) {
      const cores = pg.filter((p) => p.r === "core");
      const coreAt = cores.length === 1 ? pg.indexOf(cores[0]) : -1;
      let a = 0;
      pg.forEach((p, i) => {
        const len = lettersIn(p.k).length;
        const once = pg.filter((q) => q.k === p.k).length === 1;
        // coreTagsAt: the single core piece's cell takes the place's tags (any cell of those letters does)
        const t = (w.tg || w.te) && cores.length === 1 && cores[0].k === p.k ? tags : null;
        cells.push({ kind: "piece", i, key: p.k, pointed: null, tags: t, name, pp: once && len ? { a, b: a + len - 1, t: L } : null, role: p.r, gloss: p.g, src: p.s, opened: i === coreAt });
        a += len;
      });
      if (coreAt < 0) cells[0].openedSet = true;   // the card stands on the set whole: one pill, the place's own reading
    } else cells[0].opened = true;
    return cells;
  };

  return { R, store, index, kinds, restsOff, famOf, twelve, books, factsOf, readingKey, opensWithStrongSign, senseOpened, printedForm,
    placeEntry, placeTags, bdbEntriesAt, entryVerdict, entrySaid, numberOf, tagOf, lemmaEntries, gradeRow, heldByPointing, vowelForm, textForm, isPointed,
    stemFamily, nameWithheld, hasSourceSign, signOnly, lettersIn, PIECE_CLASS, evalCell, cellsOfWord };
};
