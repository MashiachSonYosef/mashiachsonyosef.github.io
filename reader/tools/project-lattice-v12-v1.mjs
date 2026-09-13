#!/usr/bin/env node
// Synthesis lane · lattice-projection-rule-v1-the-lattice-is-projected-over-a-zones-own-positions-and-never-replaces-the-store
//
// THE LATTICE (r2:mishkan/moses-ledgers/lattice-v12/, the corpus lane's
// megacompspan lattice ledger, candidate-only) grades every card of every
// position of the 39 canonical books against the word as the text points
// it, and — since v12 — carries on every card its declared corpus, licence
// class, year and whether it is a transliteration; and on every ON position
// the headword stack under THE RULE of lemma-sort v3, the affix pieces, and
// whether the Leningrad codex spells the word differently.
//
// This tool follows the toggle pipeline (tools/TOGGLE-PIPELINE-v1.md): it
// reads ONE zone and that book's lattice files, joins on the zone's own
// positions, and writes (a) the zone again with three small per-word fields
// and a typed receipt, and (b) a sidecar, <slug>.lattice.bin, that the card
// fetches only when a reader chooses an order the lattice can answer.
//
// The rule, declared before output:
//   1. The store stays the store. Nothing here adds, removes or reorders a
//      reading of the catalog. The lattice's cards are joined to the store's
//      rows by fingerprint (text | source), and a card the store does not
//      hold is counted, never shown; a row the lattice did not grade sorts
//      after the graded ones under every lattice order, never dropped.
//   2. The join is by position, verse by verse, in order, proved by the key:
//      the n-th ON word of a verse in the zone is the n-th ON position of
//      that verse in the lattice, and its key must equal the zone's — a
//      verse that does not prove is held whole and counted.
//   3. On the word:
//        hg  the headword's first reading under lemma-sort v3 (vowel tier,
//            then witness score, then file order) — only where the word
//            carries the headword (h, from the headword projection), the
//            lattice's lemma is that same key, and the stack is in routes;
//        hm  that reading's source and year, so its chip can say who;
//        ld  where the Leningrad codex differs: the kind and its letters.
//   4. In the sidecar, per key the lattice's card fingerprints in the
//      lattice's own order with the transliteration flags, and per pointed
//      surface the tier of each card (m vowel match · n normalized · x vowel
//      mismatch) and which cards cite this verse. Keyed by the pointed
//      surface, because the grade is a fact about the pointing and repeats
//      wherever the pointing does.
//   5. Nothing is taken from the lattice that the owner has not ruled on:
//      pieces (joined words) ride in no field until the welded-form ruling.
//
// Run: node tools/project-lattice-v12-v1.mjs --zone data/zones/genesis.bin
//        --lattice <dir with positions-<book>-v12.jsonl.gz, routes-<book>-v12.jsonl.gz, lattice-<book>-v12.json>
//        --stamp YYYY-MM-DD --out build/lattice/genesis.bin [--sidecar data/zones/genesis.lattice.bin]
import { readFileSync, writeFileSync, createReadStream, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync, createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { join } from "node:path";

import { LATTICE_RULE_ID, SIDECAR_SCHEMA, fnv1a } from "./lattice-lib-v1.mjs";
import { openRouteStore } from "./gloss-store-v1.mjs";
import { senseSplit as readingSplit } from "./sense-split-v1.mjs";
export { LATTICE_RULE_ID, SIDECAR_SCHEMA, fnv1a };
const EXEMPTION_RULE_ID = "single-pass-exemption-v1-a-post-build-write-is-typed-on-the-zone-and-expires-with-its-rebuild";
const GRADE_CHAR = { VOWEL_MATCH: "m", NORMALIZED: "n", VOWEL_MISMATCH: "x" };

const arg = (f, d = null) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const zonePath = arg("--zone"), latticeDir = arg("--lattice"), outPath = arg("--out"), stamp = arg("--stamp");
for (const [f, v] of [["--zone", zonePath], ["--lattice", latticeDir], ["--out", outPath], ["--stamp", stamp]])
  if (!v) { console.error(`missing ${f}`); process.exit(2); }

const zone = JSON.parse(gunzipSync(readFileSync(zonePath)).toString("utf8"));
const slug = zonePath.split("/").pop().replace(/\.bin$/u, "");
const sidecarPath = arg("--sidecar", join(zonePath.replace(/[^/]+$/u, ""), `${slug}.lattice.bin`));
const files = {
  positions: join(latticeDir, `positions-${slug}-v12.jsonl.gz`),
  routes: join(latticeDir, `routes-${slug}-v12.jsonl.gz`),
  receipt: join(latticeDir, `lattice-${slug}-v12.json`),
};
for (const [k, p] of Object.entries(files)) if (!existsSync(p)) { console.error(`LATTICE_FILE_MISSING ${k}: ${p}`); process.exit(1); }
const sha256File = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const latticeReceipt = JSON.parse(readFileSync(files.receipt, "utf8"));
if (!/lattice_ledger\.v12$/u.test(String(latticeReceipt.schema))) { console.error(`NOT_V12: ${latticeReceipt.schema}`); process.exit(1); }
// the shipped hash must be the hash on disk, or this is not the file the lane sealed
for (const [k, want] of [["positions", latticeReceipt.files.positions.sha256], ["routes", latticeReceipt.files.routes.sha256]]) {
  const got = sha256File(files[k]);
  if (got !== want) { console.error(`LATTICE_SHA_MISMATCH ${k}: receipt ${want.slice(0, 12)}…, disk ${got.slice(0, 12)}…`); process.exit(1); }
}

// the store, for the reading pool a card is grouped into, and the witness
// ids its labels stand for — a lattice card names its source by label
const store = openRouteStore(arg("--store", join(zonePath.replace(/data\/zones\/.*$/u, ""), "data", "route-store")));
const labelToM = new Map(Object.entries(store.index.m_sources || {}).map(([id, m]) => [m.label, id]));

// ---- the zone's own keys, so only their routes are kept ------------------
const keysOf = (w) => (w.w ? w.w.map((r) => r.k).filter(Boolean) : w.k ? [w.k] : []);
const wanted = new Set();
for (const sec of zone.sections || []) for (const w of sec.words || []) { for (const k of keysOf(w)) wanted.add(k); if (w.h) wanted.add(w.h); }

// ---- the routes, streamed, kept for the wanted keys only -------------------
const readLines = async (path, onLine) => {
  const rl = createInterface({ input: createReadStream(path).pipe(createGunzip()), crlfDelay: Infinity });
  for await (const line of rl) if (line) onLine(line);
};
const routes = new Map();   // key -> [{ fp, text, src, lic, year, corpus, tr }]
let routeLines = 0, routeCards = 0;
await readLines(files.routes, (line) => {
  routeLines += 1;
  const r = JSON.parse(line);
  if (!wanted.has(r.key)) return;
  routes.set(r.key, (r.routes || []).map((c) => {
    routeCards += 1;
    return { fp: fnv1a(`${c.text}|${c.primary_source}`), text: c.text, src: c.primary_source, lic: c.primary_licence, year: c.year ?? null, corpus: c.declared_corpus, tr: c.is_transliteration === true };
  }));
});

// ---- the positions, grouped by verse, ON only, in file order --------------
const byRef = new Map();
let posLines = 0, posOn = 0;
await readLines(files.positions, (line) => {
  posLines += 1;
  const p = JSON.parse(line);
  if (p.c0 !== "ON") return;      // rule 1 of the lattice: join on kind, not rule; an ink mark is not a word
  posOn += 1;
  if (!byRef.has(p.ref)) byRef.set(p.ref, []);
  byRef.get(p.ref).push(p);
});

// ---- rule 2 · the join, verse by verse, proved by the key ------------------
const stats = { verses: 0, verses_joined: 0, verses_held: 0, verses_absent_from_lattice: 0, words_on: 0,
  hg: 0, hg_skipped_same_as_form: 0, hg_skipped_lemma_not_in_routes: 0, hg_skipped_lemma_differs_from_h: 0, hg_skipped_no_h: 0, hg_skipped_witnesses_differ: 0,
  ld: 0, grades: 0, held_examples: [] };
const grades = {};          // pointed surface -> { k, g, n }
const wordsTouched = [];    // for the recount
for (const sec of zone.sections || []) {
  const on = (sec.words || []).filter((w) => !w.mark && keysOf(w).length);
  if (!on.length) continue;
  stats.verses += 1; stats.words_on += on.length;
  const rows = byRef.get(sec.label);
  if (!rows) { stats.verses_absent_from_lattice += 1; continue; }
  // a position proves when any of its entries (the form; at a pair, the
  // form and the qere) keys as one of the zone's keys for that word
  const keysOfRow = (p) => (p.megacompspan || []).map((m) => m.key).filter(Boolean);
  const matches = (w, p) => keysOfRow(p).some((k) => keysOf(w).includes(k));
  const proved = rows.length === on.length && on.every((w, i) => matches(w, rows[i]));
  if (!proved) {
    stats.verses_held += 1;
    if (stats.held_examples.length < 6) stats.held_examples.push(`${sec.label}: zone ${on.length} words, lattice ${rows.length} positions${rows.length === on.length ? `, first mismatch at ${on.findIndex((w, i) => !matches(w, rows[i])) + 1}` : ""}`);
    continue;
  }
  stats.verses_joined += 1;
  on.forEach((w, i) => {
    const p = rows[i];
    delete w.hg; delete w.hm; delete w.ld;
    // rule 4 · the grades, per pointed surface, over the lattice's own order
    for (const m of p.megacompspan || []) {
      const rg = m.route_grades;
      const list = routes.get(m.key);
      if (!rg || !list || grades[m.surface]) continue;
      const g = new Array(list.length).fill("-");
      for (const [tier, idxs] of Object.entries(rg.grade_of_index || {})) for (const ix of idxs) if (ix < g.length) g[ix] = GRADE_CHAR[tier] || "-";
      const names = (rg.names_this_verse || []).filter((ix) => ix < list.length);
      // THE LINE MOVES, NOT ONLY THE CARD (owner, 2026-09-09): under each
      // lattice order the first card is baked here — the oldest card of the
      // order's leading set, ties in lattice order — so the reading under the
      // word can change without a fetch of the store. Null where the leading
      // set is empty: the order then changes nothing and the line stands.
      // The first card of a set is what the CARD would put first for that
      // set: the store's own reading pool over those cards, oldest first —
      // readings split from route text and grouped across cards, exactly as
      // the page groups them — so the line and the first pill say one thing.
      // The M is the oldest card of the set that carries that reading.
      // The card groups readings across cards (the store's own pool, oldest
      // first), gives each group the best tier any card carrying it earned,
      // and sorts groups by that tier and then their oldest card. The same
      // arithmetic here, so the line and the first pill say one thing; the M
      // is the oldest card carrying the reading, as the card prints it.
      // The rows are the STORE's rows for this key — the same rows, the same
      // years, the same pool the page builds — and each row finds its lattice
      // grade by fingerprint; a row the lattice did not grade ranks after the
      // graded ones, as on the page.
      const srows = store.routesFor(m.key) || [];
      const fpIx = new Map(list.map((c, ix) => [c.fp, ix]));
      const rowIx = (row) => { const src = store.index.m_sources[row[3]]; const ix = src ? fpIx.get(fnv1a(`${row[1]}|${src.label}`)) : undefined; return ix === undefined ? -1 : ix; };
      const readingsOfRow = new Map(srows.map((row, i) => [i, new Set(store.packSplit(row[1]).flatMap((sense) => { const r = readingSplit(sense); return r.damaged ? [] : r.readings.map((t) => t.toLowerCase()); }))]));
      const pool = store.readingPool(srows, "oldest");
      const TIER = { m: 0, n: 1, x: 2 };
      const groupInfo = pool.map((grp) => {
        const key = grp.text.toLowerCase();
        const carriers = srows.map((row, i) => ({ row, i })).filter((x) => store.index.m_sources[x.row[3]] && readingsOfRow.get(x.i).has(key));
        let tier = 3, cites = 1;
        for (const x of carriers) { const ix = rowIx(x.row); if (ix < 0) continue; const t = TIER[g[ix]]; if (t !== undefined && t < tier) tier = t; if (names.includes(ix)) cites = 0; }
        return { text: grp.text, tier, cites, carriers };
      });
      const firstUnder = (rank, only) => {
        const ordered = groupInfo.map((gi, at) => ({ gi, at, r: rank(gi) })).sort((a, b) => a.r - b.r || a.at - b.at);
        const top = ordered[0];
        if (!top || !only(top.gi)) return null;
        // the M the card prints for that reading: its oldest record
        let best = null;
        for (const x of top.gi.carriers) { const y = Number.parseInt(x.row[4], 10); const yy = Number.isInteger(y) ? y : Infinity; if (!best || yy < best.y) best = { row: x.row, y: yy }; }
        if (!best) return null;
        const src = store.index.m_sources[best.row[3]];
        return [top.gi.text, src.label, src.licensePosture, Number.isFinite(best.y) ? best.y : null];
      };
      const o = {
        m: firstUnder((gi) => gi.tier, (gi) => gi.tier === 0),
        x: firstUnder((gi) => ({ 2: 0, 1: 1, 0: 2 }[gi.tier] ?? 3), (gi) => gi.tier === 2),
        c: firstUnder((gi) => gi.cites, (gi) => gi.cites === 0),
      };
      grades[m.surface] = { k: m.key, g: g.join(""), n: names, o };
      stats.grades += 1;
    }
    // rule 3 · hg, the headword's first reading under lemma-sort v3
    const entry = (p.megacompspan || []).find((m) => m.lemma) || null;
    const L = entry && entry.lemma;
    if (!w.h) stats.hg_skipped_no_h += 1;
    else if (!L || L.agree !== "same") stats.hg_skipped_witnesses_differ += 1;
    else if (L.key !== w.h) stats.hg_skipped_lemma_differs_from_h += 1;
    // the headword IS the form: the line already reads under it, and the
    // lattice sorts no stack there (Moses, v12: in_routes false at 112,309
    // such positions is not a gap)
    else if (L.same_as_form === true) stats.hg_skipped_same_as_form += 1;
    else if (!L.in_routes || !Array.isArray(L.sorted_route_index) || !L.sorted_route_index.length || !routes.get(L.key)) stats.hg_skipped_lemma_not_in_routes += 1;
    else {
      const top = routes.get(L.key)[L.sorted_route_index[0]];
      if (top) { w.hg = top.text; w.hm = { m: top.src, lic: top.lic, y: top.year }; stats.hg += 1; }
      else stats.hg_skipped_lemma_not_in_routes += 1;
    }
    // rule 3 · ld, where the Leningrad codex differs
    const ln = p.leningrad;
    if (ln && ln.differs === true) { w.ld = { kind: ln.kind || null, mam: ln.letters_mam || null, other: ln.letters_macula || ln.letters_tahot || null }; stats.ld += 1; }
    wordsTouched.push(w);
  });
}

// ---- the sidecar ----------------------------------------------------------
const sideRoutes = {};
let trCards = 0;
for (const [k, list] of routes) {
  const t = []; list.forEach((c, i) => { if (c.tr) { t.push(i); trCards += 1; } });
  sideRoutes[k] = { f: list.map((c) => c.fp), ...(t.length ? { t } : {}) };
}
const sidecar = {
  schema_version: SIDECAR_SCHEMA, rule_id: LATTICE_RULE_ID, work: slug,
  source: { ledger: "moses-ledgers/lattice-v12/", candidate_only: true, schema: latticeReceipt.schema, generated: latticeReceipt.generated,
    positions: { path: files.positions.split("/").pop(), sha256: latticeReceipt.files.positions.sha256, bytes: statSync(files.positions).size },
    routes: { path: files.routes.split("/").pop(), sha256: latticeReceipt.files.routes.sha256, bytes: statSync(files.routes).size },
    receipt: { path: files.receipt.split("/").pop(), sha256: sha256File(files.receipt) } },
  fingerprint: "fnv1a-32 over the UTF-16 code units of `${text}|${primary_source}`, 8 hex digits; the store row's text and its source's label make the same string",
  grade_chars: { m: "VOWEL_MATCH", n: "NORMALIZED", x: "VOWEL_MISMATCH", "-": "ungraded" },
  first_under: { m: "masoretic — the oldest VOWEL_MATCH card", x: "vowels differ — the oldest VOWEL_MISMATCH card", c: "cites here — the oldest card naming this verse", shape: "[route text, source label, licence key, year] or null when the leading set is empty" },
  counts: { keys: Object.keys(sideRoutes).length, cards: routeCards, transliteration_cards: trCards, surfaces_graded: Object.keys(grades).length, lattice_route_lines: routeLines, lattice_positions: posLines, lattice_on: posOn },
  emitted_from: { rule: LATTICE_RULE_ID, projected_on: stamp, projected_by: "tools/project-lattice-v12-v1.mjs", join: { ...stats } },
  routes: sideRoutes, grades,
};
writeFileSync(sidecarPath, gzipSync(Buffer.from(JSON.stringify(sidecar)), { level: 9 }));

// ---- the receipt on the zone, typed -----------------------------------------
const ef = zone.emitted_from = zone.emitted_from || {};
ef.toggles = ef.toggles || {};
ef.toggles.lattice = {
  rule: LATTICE_RULE_ID,
  source: sidecar.source,
  sidecar: { path: `data/zones/${slug}.lattice.bin`, schema: SIDECAR_SCHEMA },
  join: "verse by verse, in order, ON positions only (kind, not rule), proved by key at every position; a verse that does not prove is held whole",
  projected_on: stamp, projected_by: "tools/project-lattice-v12-v1.mjs",
  counts: { ...stats },
  what_the_word_carries: "hg: the headword's first reading under lemma-sort v3, with hm (source, licence key, year) — only where h is the lattice's lemma and the stack is in routes; ld: the Leningrad difference where the codex spells the word otherwise",
  what_the_sidecar_carries: "per key the cards' fingerprints in lattice order with transliteration flags; per pointed surface the tier of each card and which cite this verse",
  rulings_owed: "pieces (joined words) are in the lattice and are not projected until the welded-form ruling; licence_class puts cc0 in class 0 as the corpus lane's reading, and the page derives its own classes from the posture keys",
};
{
  const pb = ef.post_build && ef.post_build.rule_id === EXEMPTION_RULE_ID ? ef.post_build : { rule_id: EXEMPTION_RULE_ID, by: "", wrote: [], by_field: {}, why: "", expires: "", on: stamp };
  const me = "tools/project-lattice-v12-v1.mjs";
  pb.by = pb.by ? (pb.by.includes(me) ? pb.by : `${pb.by} + ${me}`) : me;
  for (const f of ["emitted_from.toggles"]) { if (!pb.wrote.includes(f)) pb.wrote.push(f); pb.by_field[f] = pb.by_field[f] ? (pb.by_field[f].includes(me) ? pb.by_field[f] : `${pb.by_field[f]} + ${me}`) : me; }
  const why = "the lattice's grades, headword order and edition differences are projected over this zone's own positions";
  pb.why = pb.why ? (pb.why.includes(why) ? pb.why : `${pb.why}; ${why}`) : why;
  const exp = "with this zone's rebuild by a build-zone run that projects the lattice in its single pass";
  pb.expires = pb.expires ? (pb.expires.includes(exp) ? pb.expires : `${pb.expires}; ${exp}`) : exp;
  pb.on = stamp;
  ef.post_build = pb;
}
writeFileSync(outPath, gzipSync(Buffer.from(JSON.stringify(zone), "utf8"), { level: 9 }));
const s = stats;
console.log(`${outPath} · ${s.hg.toLocaleString()} of ${s.words_on.toLocaleString()} words carry the headword's lemma-sorted reading · ${s.ld} differ in Leningrad · verses ${s.verses_joined} joined, ${s.verses_held} held, ${s.verses_absent_from_lattice} absent`);
console.log(`  ${sidecarPath} · ${Object.keys(sideRoutes).length.toLocaleString()} keys, ${routeCards.toLocaleString()} cards (${trCards} transliterations) · ${Object.keys(grades).length.toLocaleString()} pointed surfaces graded · ${(statSync(sidecarPath).size / 1024).toFixed(0)} KB`);
console.log(`  hg skipped: ${s.hg_skipped_no_h} no headword · ${s.hg_skipped_witnesses_differ} witnesses differ · ${s.hg_skipped_lemma_differs_from_h} lemma is not h · ${s.hg_skipped_same_as_form} headword is the form · ${s.hg_skipped_lemma_not_in_routes} stack has no cards in this book`);
if (s.held_examples.length) console.log(`  held: ${s.held_examples.join(" | ")}`);
