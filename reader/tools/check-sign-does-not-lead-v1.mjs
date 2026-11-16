#!/usr/bin/env node
// RUN: tree
// GUARDS: zone-gloss-rule-v8-printed-form-ledger-division-whole-without-a-ledger-at-rest-a-rendering-carrying-strongs-sign-after-every-plain-one-antiquity-1940-lastuary, signed-rendering-rule-v1-on-the-books-the-kinds-record-reaches-a-rendering-that-opens-with-strongs-sign-follows-every-plain-one-in-every-order, witnessed-order-bake-rule-v2-three-columns-as-shipped-each-reading-with-its-own-credit-an-entry-whose-row-prints-only-strongs-signed-renderings-is-refused-where-the-pool-holds-a-plain-one
// LEDGER: -
// no frame letter. A check reads the zones, their lattice sidecars, the
// records of the resting lines, the store and the page, and judges them; it
// is not the ledger for one.
//
// A RENDERING CARRYING STRONG'S SIGN DOES NOT LEAD WHERE THE POOL HOLDS ONE
// WITHOUT IT. The lead's call of 15 November 2026 on call 7 of relay v189:
// «a rendering carrying its source's sign does not lead the line while the
// signs switch rests off», at the grain of the rendering, as an order (rule 7
// of tools/gloss-store-v1.mjs, zone-gloss-rule-v8; the page's
// signed-rendering-rule-v1). Strong's sign is the source-signs ledger's
// STRONG_SIGN at a rendering's head (X, the multiplication sign or +, and a
// space), and the sign held alone in a round bracket there («(+) archer»,
// the M14 declaration's open_paren.holds_sign_alone: the lead's call 1); a
// bracket that holds the sign and words («(X great) delight») is plain. The
// rule's scope is the record of dictionary kinds' (the thirty-nine books,
// asked of each zone's own fields by restsOffIn): the Tikkunei Zohar, a
// Targum beside a book and a fixture keep today's order (the lead's call 2).
// It is a sort, not a filter: a pool whose every reading carries the sign
// keeps its order, so a signed leader stands only where its pool holds no
// plain reading. What is held here, each recomputed:
//
//   G0  the stamp: a zone carries emitted_from.signs_rest_last exactly where
//       the record's scope reaches it, and it is the stamp the rule makes
//       (signsRestLastStamp: the rule, the record's scope, the ruling); each
//       lattice sidecar carries its zone's stamp, and none where its zone
//       carries none
//   G1  one rule, one place: the page's opensWithStrongSign, lifted out of
//       zone.html between its markers and run on its own, answers as the
//       module's does on every reading of the store and on probes of each
//       shape (the module's own block is lifted the same way and run first,
//       which proves it reaches nothing outside itself); and the page's first
//       source sign is that STRONG_SIGN
//   G2  on a zone of the scope, a baked leader opens with the sign only where
//       the pool it was drawn from holds no reading without it, each pool
//       asked as the tool that bakes it asks it, of the store at rest with
//       the sign last: the table (where no name leads) and the orders
//       characters and corpus, and the reading a name displaced (noname): the
//       key's pool; the table's alternate (gloss_m[k].alt): that pool with the
//       line's carriers left out; the license columns: the class's own
//       readings; on the sidecar, o.m and o.x: the groups the pointing ranks
//       (the whole pool); o.c and each verse's c: the groups a citing card
//       carries; o.l, o.la and o.s: the rows the pointing and the stems keep,
//       row by row, as the projector keeps them; e[...].l and .la: those rows
//       after the place's entry and names gates; and hg, the line under «the
//       headword»: the lattice's stack of cards for the headword, where the
//       corpus lane's lattice is on this machine (--lattice <dir> or
//       LATTICE_DIR), else said not judged
//   G3  no piece of a resting line of a work of the scope opens with the
//       sign where the pool at rest of a key the line's word reads (its own,
//       its pieces' or its headword's) holds the piece as a reading and holds
//       a plain one; the line is split at « + », the hidden sign's gap set
//       aside
//   G4  no witnessed entry opens with the sign where the key's pool at rest
//       holds a plain reading; and the refusals each column's receipt types
//       for the sign (strongs_sign_refused, strongs_sign_refused_keys) are
//       this check's own, derived again from the shipped input
//       (data/witnessed-orders-v2.7): the entries whose row, as the bake
//       finds it, prints only signed readings where the key's pool at rest
//       holds a plain one; off the scope no receipt types any
//
// Run: node tools/check-sign-does-not-lead-v1.mjs [--zones <dir>] [--records <dir>] [--only <book,...>] [--page <file>] [--lattice <dir>]
//   --zones reads the zones and their sidecars from another folder than
//   data/zones (a proof on books baked in a scratch folder), --records the
//   records of the resting lines from another than data/resting-lines; the
//   store, the record of kinds and the shipped witnessed input are always
//   this tree's. --only narrows G0, G2, G3 and G4 to the works named, and
//   the check says so on a line of its own: a law judged on some works is
//   not judged on all. --page reads the rule from another copy of the page
//   (G1), to show the check refusing a page that does not carry it.
import { readFileSync, readdirSync, existsSync, createReadStream } from "node:fs";
import { gunzipSync, createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { openRouteStore, opensWithStrongSign, signsRestLastStamp, factsOf, readingKey, isGap, GLOSS_RULE_ID } from "./gloss-store-v1.mjs";
import { readKinds, restsOffIn } from "./dictionary-kinds-v1.mjs";
import { carriesReaderHebrew } from "./zones-on-disk-v1.mjs";
import { licClass } from "./gloss-m-v1.mjs";
import { fnv1a } from "./lattice-lib-v1.mjs";
import { gradeRow, heldByPointing } from "./pointing-grade-v1.mjs";
import { isOtherStem } from "./stem-family-v1.mjs";
import { placeEntry, bdbEntriesAt, entryVerdict } from "./entry-gate-v1.mjs";
import { nameWithheld } from "./names-gate-v1.mjs";
import { leadersKey, PLACE_IS_A_NAME } from "./place-leaders-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const READER = join(HERE, "..");
const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : null; };
const ZONES = arg("zones") || join(READER, "data", "zones");
const RECORDS = arg("records") || join(READER, "data", "resting-lines");
const PAGE = arg("page") || join(READER, "zone.html");
const LATTICE = arg("lattice") || process.env.LATTICE_DIR || null;
const ONLY = (() => { const i = process.argv.indexOf("--only"); return i > 0 && process.argv[i + 1] ? new Set(process.argv[i + 1].split(",").filter(Boolean)) : null; })();
const judged = (name) => !ONLY || ONLY.has(String(name).split(".")[0]);
const STORE = join(READER, "data", "route-store");
const WITNESSED = join(READER, "data", "witnessed-orders-v2.7");
const PAGE_RULE = "signed-rendering-rule-v1-on-the-books-the-kinds-record-reaches-a-rendering-that-opens-with-strongs-sign-follows-every-plain-one-in-every-order";
let bad = 0;
const check = (n, ok, d = "") => { if (!ok) bad += 1; console.log(`${ok ? "  ok  " : "FAIL  "}${n}${d ? "  ·  " + d : ""}`); };
const side = (n, d = "") => console.log(`  --  ${n}${d ? "  ·  " + d : ""}`);
const nf = (x) => Number(x).toLocaleString("en-US");
const first = (list, n = 3) => list.slice(0, n).join(" · ") + (list.length > n ? ` · and ${nf(list.length - n)} more` : "");
const gz = (path) => JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const short = (t) => `«${String(t).slice(0, 40)}»`;

console.log(`— ${GLOSS_RULE_ID} · ${PAGE_RULE} —\n`);
if (ZONES !== join(READER, "data", "zones")) side("the zones are read from another folder", ZONES);
if (RECORDS !== join(READER, "data", "resting-lines")) side("the records of the resting lines are read from another folder", RECORDS);
if (PAGE !== join(READER, "zone.html")) side("the rule is read from another copy of the page", PAGE);
if (ONLY) side(`G0, G2, G3 and G4 not judged on every work: narrowed to ${[...ONLY].join(", ")} (--only)`);

const kinds = readKinds(join(READER, "data"));
const STAMP = signsRestLastStamp(kinds.rec);
const store = openRouteStore(STORE);
const rest = openRouteStore(STORE, { atRest: true, signLast: true });
const mSources = store.index.m_sources;
const labelOf = (row) => (mSources[row[3]] || {}).label;

// the zones on this disk a reader opens, with their sidecars, and whether the record's scope reaches each
const works = [];
for (const f of readdirSync(ZONES).filter((x) => x.endsWith(".bin") && carriesReaderHebrew(x)).sort()) {
  const name = f.replace(/\.bin$/u, "");
  if (!judged(name)) continue;
  let zone;
  try { zone = gz(join(ZONES, f)); } catch (e) { check(`G0  ${f} reads as a zone`, false, e.message); continue; }
  works.push({ name, zone, scope: restsOffIn(kinds.rec, zone), sidecar: existsSync(join(ZONES, `${name}.lattice.bin`)) ? join(ZONES, `${name}.lattice.bin`) : null });
}
const inScope = works.filter((w) => w.scope);

// ---- G0: the stamp ---------------------------------------------------------------------------------------------------
{
  const faults = [];
  let sidecars = 0;
  for (const w of works) {
    const said = (w.zone.emitted_from || {}).signs_rest_last;
    if (w.scope && !said) faults.push(`${w.name} is a work of the record's scope and carries no stamp of Strong's sign last: it was not baked so`);
    else if (w.scope && !same(said, STAMP)) faults.push(`${w.name}'s stamp is not the one the rule makes (${JSON.stringify(said).slice(0, 80)})`);
    else if (!w.scope && said) faults.push(`${w.name} carries a stamp of Strong's sign last, and the record's scope does not reach it`);
    if (w.sidecar) {
      sidecars += 1;
      const s = gz(w.sidecar);
      if (!same((s.emitted_from || {}).signs_rest_last, said)) faults.push(`${w.name}.lattice.bin ${(s.emitted_from || {}).signs_rest_last ? "carries another stamp than its zone's" : said ? "carries no stamp, and its zone does" : ""}`);
    }
  }
  check("G0  a zone carries the stamp of Strong's sign last exactly where the record's scope reaches it, the stamp the rule makes, and each lattice sidecar carries its zone's", works.length > 0 && faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${inScope.length} works of the scope stamped (${STAMP.rule.slice(0, 18)}…) · ${works.length - inScope.length} other works unstamped · ${sidecars} sidecars, each its zone's`);
}

// ---- G1: one rule, one place ---------------------------------------------------------------------------------------
const HEAD = /\n[ \t]*(?:export )?const STRONG_SIGN = /gu;
const END = "// end of Strong's sign (tools/gloss-store-v1.mjs)";
const lift = (path) => {
  const src = readFileSync(path, "utf8");
  const heads = [...src.matchAll(HEAD)];
  if (!heads.length) return { absent: true };
  if (heads.length > 1) return { fault: `${path} opens the sign's block ${heads.length} times` };
  const a = heads[0].index + 1, z = src.indexOf(END, a);
  if (z < 0 || src.indexOf(END, z + 1) >= 0) return { fault: `${path} does not close the sign's block exactly once with "${END}"` };
  const body = src.slice(a, z).replace(/^([ \t]*)export const /gmu, "$1const ");
  try { return { fn: new Function(`${body}\nreturn opensWithStrongSign;`)(), lines: body.split("\n").map((l) => l.trim()).filter(Boolean), src }; } catch (e) { return { fault: `${path}: the block does not run on its own (${e.message})` }; }
};
{
  const own = lift(join(HERE, "gloss-store-v1.mjs")), page = lift(PAGE);
  // probes of each shape: the head sign, the sign alone in a bracket, the sign with words in a bracket, a word that
  // only begins with the letter, the sign with no space after it, nothing
  const PROBES = ["X after", "× break, companion", "+ aloud", "(+) archer", "( X ) very", "(×) very.", "(+)valiant(-ly)", "(X great) delight", "(+ be) able",
    "Xerxes", "X", "+", "X-ray", "after X ", " X after", "( X very", "[X] after", "", null, undefined, 5];
  const faults = [];
  let readings = 0, signed = 0, alone = 0;
  if (own.fault || own.absent) faults.push(own.fault || "the module carries no block opening \"export const STRONG_SIGN = \"");
  if (page.fault) faults.push(page.fault);
  if (page.absent) faults.push(`${PAGE} carries no block opening "const STRONG_SIGN = ": the page does not carry the rule`);
  const copies = [["the module's own block", own], ["the page's copy", page]].filter(([, c]) => c.fn);
  for (const p of PROBES) for (const [name, c] of copies) if (c.fn(p) !== opensWithStrongSign(p)) faults.push(`${name} answers ${c.fn(p)} for ${JSON.stringify(p)}, the module ${opensWithStrongSign(p)}`);
  const STRONG_ALONE = /^\(\s*(X|×|\+)\s*\)/u;
  if (copies.length) for (const f of readdirSync(join(STORE, "shards")).filter((x) => x.endsWith(".bin")).sort()) {
    for (const rows of Object.values(gz(join(STORE, "shards", f)))) for (const row of rows) for (const t of store.readingsOf(row)) {
      readings += 1;
      const m = opensWithStrongSign(t);
      if (m) { signed += 1; if (STRONG_ALONE.test(t)) alone += 1; }
      for (const [name, c] of copies) if (c.fn(t) !== m && faults.length < 40) faults.push(`${name} answers ${c.fn(t)} for ${short(t)} (${row[3]}), the module ${m}`);
    }
  }
  // the page's first source sign is that STRONG_SIGN, so the switch and the order read one pattern
  if (page.src && !/\n[ \t]*const SOURCE_SIGN = \[STRONG_SIGN, /u.test(page.src)) faults.push("the page's first source sign (SOURCE_SIGN[0]) is not STRONG_SIGN");
  if (page.src && !page.src.includes(PAGE_RULE)) faults.push(`the page does not name ${PAGE_RULE}`);
  const sameText = own.lines && page.lines && own.lines.length === page.lines.length && own.lines.every((l, i) => l === page.lines[i]);
  check("G1  one rule, one place: the page's opensWithStrongSign, lifted out of the page and run on its own, answers as the module's does on every reading of the store and on probes of each shape, and the page's first source sign is STRONG_SIGN",
    copies.length === 2 && faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${nf(readings)} readings of the store answered alike (${nf(signed)} carry the sign, ${nf(alone)} of them held alone in a bracket) · ${PROBES.length} probes · the page's text is ${sameText ? "the module's, line for line" : "not the module's line for line, and answers alike"}`);
}

// the pool at rest of a key, the sign last, read once per key and omission
const poolCache = new Map();
const poolAt = (k, omit = null) => {
  const id = `${k}\u0001${omit ? [...omit].sort().join(" ") : ""}`;
  if (!poolCache.has(id)) poolCache.set(id, rest.readingPool(rest.routesFor(k) || [], "oldest", null, omit));
  return poolCache.get(id);
};
const plainIn = (groups) => groups.some((g) => !opensWithStrongSign(g.text));

// ---- G2: every baked leader --------------------------------------------------------------------------------------------
{
  const faults = [], seen = new Map();   // what -> [leaders read, signed]
  let hgJudged = 0, hgBooks = 0;
  const judge = (book, what, k, text, groups) => {
    if (typeof text !== "string") return;
    const n = seen.get(what) || seen.set(what, [0, 0]).get(what);
    n[0] += 1;
    if (!opensWithStrongSign(text)) return;
    n[1] += 1;
    if (plainIn(groups)) { n[2] = (n[2] || 0) + 1; faults.push(`${book} ${k}: ${what} ${short(text)} opens with Strong's sign, and its pool holds ${short(groups.find((g) => !opensWithStrongSign(g.text)).text)}`); }
  };
  const classOf = (e) => Math.min(...e.by.map((id) => licClass((mSources[id] || {}).licensePosture)));
  for (const w of inScope) {
    const z = w.zone, names = z.gloss_names || {}, orders = z.gloss_orders || {};
    for (const [k, t] of Object.entries(z.gloss || {})) if (!(Object.hasOwn(names, k) && names[k] === t)) judge(w.name, "the table", k, t, poolAt(k));
    for (const o of ["characters", "corpus", "noname"]) for (const [k, t] of Object.entries(orders[o] || {})) judge(w.name, `the order ${o}`, k, t, poolAt(k));
    for (const [c, cls] of [["licence_pd", 0], ["licence_by", 1], ["licence_by_sa", 2]]) for (const [k, t] of Object.entries(orders[c] || {})) judge(w.name, `the column ${c}`, k, t, poolAt(k).filter((e) => classOf(e) === cls));
    for (const [k, m] of Object.entries(z.gloss_m || {})) if (m && m.alt && Array.isArray(m.by)) judge(w.name, "the table's alternate", k, m.alt.text, poolAt(k, new Set(m.by.map(String))));
    if (!w.sidecar) continue;
    const s = gz(w.sidecar), routes = s.routes || {}, stems = s.stems || {};
    // the rows a surface's leaders were drawn from, graded as the projector grades them (pointing-grade-rule-v5: the
    // row's own headwords, else its lattice card's grade by fingerprint), kept as it keeps them
    const rowsOf = new Map();
    const heldOf = (surface, gr) => {
      if (rowsOf.has(surface)) return rowsOf.get(surface);
      const srows = rest.routesFor(gr.k) || [], fps = new Map(((routes[gr.k] || {}).f || []).map((fp, ix) => [fp, ix]));
      const cache = new Map();
      const gradeOf = (row) => {
        if (cache.has(row)) return cache.get(row);
        let gc = gradeRow(row, surface);
        if (gc === "-") { const ix = labelOf(row) ? fps.get(fnv1a(`${row[1]}|${labelOf(row)}`)) : undefined; gc = ix === undefined ? "-" : gr.g[ix] || "-"; }
        cache.set(row, gc); return gc;
      };
      const st = Array.isArray(gr.st) ? gr.st : null, rs = st ? stems[gr.k] || null : null;
      const otherStem = (row) => !!(rs && isOtherStem(rs[`${row[3]}\u0001${row[0]}\u0001${row[1]}`], st));
      const attested = srows.some((row) => mSources[row[3]] && gradeOf(row) === "m");
      const held = { srows, gradeOf, otherStem, attested, fps };
      rowsOf.set(surface, held);
      return held;
    };
    const kept = ({ srows }, keeps, omit = null) => srows.filter((row) => mSources[row[3]] && !(omit && omit.has(String(row[3]))) && keeps(row));
    for (const [surface, gr] of Object.entries(s.grades || {})) {
      const o = gr.o || {}, k = gr.k;
      // o.m and o.x rank every group of the pool
      judge(w.name, "o.m", k, (o.m || [])[0], poolAt(k));
      judge(w.name, "o.x", k, (o.x || [])[0], poolAt(k));
      // o.c and a verse's own c: the groups a citing card carries
      const citing = (names) => {
        const h = heldOf(surface, gr), ns = new Set(names || []);
        return poolAt(k).filter((g) => rest.carriersOf(h.srows, g.text).some((row) => { const ix = labelOf(row) ? h.fps.get(fnv1a(`${row[1]}|${labelOf(row)}`)) : undefined; return ix !== undefined && ns.has(ix); }));
      };
      if (Array.isArray(o.c)) judge(w.name, "o.c", k, o.c[0], opensWithStrongSign(o.c[0]) ? citing(gr.n) : []);
      for (const at of Object.values(gr.v || {})) if (at && Array.isArray(at.c)) judge(w.name, "a verse's own c", k, at.c[0], opensWithStrongSign(at.c[0]) ? citing(at.n) : []);
      // o.l, o.la and o.s: the rows the pointing and the stems keep, row by row
      const signedRow = [o.l, o.la, o.s].some((x) => Array.isArray(x) && opensWithStrongSign(x[0]));
      if (signedRow) {
        const h = heldOf(surface, gr);
        // the filter's rows (unpointed-row-rule-v1): where some row points the word as the text does, a row pointed
        // otherwise is withheld and a row its source does not point is held back
        const lenient = (row) => (!h.attested || !heldByPointing(h.gradeOf(row))) && !h.otherStem(row);
        judge(w.name, "o.l", k, (o.l || [])[0], rest.readingPool(kept(h, lenient), "oldest"));
        if (Array.isArray(o.l)) judge(w.name, "o.la", k, (o.la || [])[0], rest.readingPool(kept(h, lenient, new Set(o.l[4].map(String))), "oldest"));
        judge(w.name, "o.s", k, (o.s || [])[0], rest.readingPool(kept(h, (row) => h.gradeOf(row) === "m" && !h.otherStem(row)), "oldest"));
      } else for (const x of ["o.l", "o.la", "o.s"]) judge(w.name, x, k, ((o[x.slice(2)]) || [])[0], []);
    }
    // e[...]: the leaders at a kind of place, the rows after the place's entry and names gates, as the projector walks the words
    const asked = new Set(), anyNames = !!s.names;
    for (const sec of z.sections || []) for (const word of sec.words || []) {
      if (word.mark) continue;
      const isName = !anyNames || !!word.np;
      for (const form of [word, ...(word.w || [])]) {
        if (!form || typeof form.s !== "string" || !form.k) continue;
        const surface = form === word ? form.s : form.s.replace(/^\[+|\]+$/gu, "");
        const gr = (s.grades || {})[surface];
        if (!gr || gr.k !== form.k || !gr.e) continue;
        const tags = form.tg ? [].concat(form.tg) : null, key = leadersKey(tags, isName);
        if (key === PLACE_IS_A_NAME || !gr.e[key] || asked.has(`${surface}\u0001${key}`)) continue;
        asked.add(`${surface}\u0001${key}`);
        const at = gr.e[key];
        if (![at.l, at.la].some((x) => Array.isArray(x) && opensWithStrongSign(x[0]))) { judge(w.name, "e[…].l", gr.k, (at.l || [])[0], []); judge(w.name, "e[…].la", gr.k, (at.la || [])[0], []); continue; }
        const h = heldOf(surface, gr), place = tags ? placeEntry(tags) : null;
        const bdbHere = place ? bdbEntriesAt(place, h.srows.map(factsOf)) : null;
        const keeps = (row) => { const v = place ? entryVerdict(factsOf(row), place, bdbHere) : "none"; return v !== "other" && !nameWithheld(factsOf(row), isName) && (v === "this" || !h.attested || !heldByPointing(h.gradeOf(row))) && !h.otherStem(row); };
        judge(w.name, "e[…].l", `${gr.k} at ${key}`, (at.l || [])[0], rest.readingPool(kept(h, keeps), "oldest"));
        if (Array.isArray(at.l)) judge(w.name, "e[…].la", `${gr.k} at ${key}`, (at.la || [])[0], rest.readingPool(kept(h, keeps, new Set(at.l[4].map(String))), "oldest"));
      }
    }
    // hg: the lattice's stack for the headword, where the lattice is on this machine
    const signedHg = [];
    for (const sec of z.sections || []) for (const word of sec.words || []) if (typeof word.hg === "string") { const n = seen.get("hg") || seen.set("hg", [0, 0]).get("hg"); n[0] += 1; if (opensWithStrongSign(word.hg)) { n[1] += 1; signedHg.push(word); } }
    if (signedHg.length && LATTICE && existsSync(join(LATTICE, `positions-${w.name}-v12.jsonl.gz`)) && existsSync(join(LATTICE, `routes-${w.name}-v12.jsonl.gz`))) {
      hgBooks += 1;
      const want = new Set(signedHg.map((x) => x.h));
      const stacks = new Map(), cards = new Map();   // key -> the sorted stacks its places give; key -> its cards' texts
      for await (const line of createInterface({ input: createReadStream(join(LATTICE, `positions-${w.name}-v12.jsonl.gz`)).pipe(createGunzip()), crlfDelay: Infinity })) {
        if (!line) continue;
        for (const m of JSON.parse(line).megacompspan || []) {
          const L = m.lemma;
          if (!L || !want.has(L.key) || !Array.isArray(L.sorted_route_index)) continue;
          const id = L.sorted_route_index.join(",");
          const list = stacks.get(L.key) || stacks.set(L.key, new Map()).get(L.key);
          if (!list.has(id)) list.set(id, L.sorted_route_index);
        }
      }
      for await (const line of createInterface({ input: createReadStream(join(LATTICE, `routes-${w.name}-v12.jsonl.gz`)).pipe(createGunzip()), crlfDelay: Infinity })) {
        if (!line) continue;
        const r = JSON.parse(line);
        if (want.has(r.key)) cards.set(r.key, (r.routes || []).map((c) => c.text));
      }
      for (const word of signedHg) {
        hgJudged += 1;
        const texts = cards.get(word.h) || [], lists = [...(stacks.get(word.h) || new Map()).values()];
        // the headword's card steps past a signed card in the stack's own order: a signed hg stands only where some
        // stack of its key holds no plain card
        if (!lists.some((ix) => ix.every((i) => typeof texts[i] !== "string" || opensWithStrongSign(texts[i]))) && (seen.get("hg")[2] = (seen.get("hg")[2] || 0) + 1)) faults.push(`${w.name} ${word.h}: hg ${short(word.hg)} opens with Strong's sign, and every stack the lattice sorts for its headword holds a plain card`);
      }
    } else if (signedHg.length) side(`G2  hg not judged on ${w.name}: ${signedHg.length} headword line(s) open with the sign, and the corpus lane's lattice is not on this machine (--lattice <dir> or LATTICE_DIR)`);
  }
  const said = [...seen].filter(([, [n]]) => n).map(([what, [n, s]]) => `${what} ${nf(n)}${s ? ` (${nf(s)} signed)` : ""}`);
  const owed = [...seen].filter(([, x]) => x[2]).map(([what, x]) => `${what} ${nf(x[2])}`);
  check("G2  on a zone of the scope a baked leader opens with Strong's sign only where the pool it was drawn from holds no plain reading: the table, its orders and alternate, the license columns, and the sidecar's leaders, each pool asked as its tool asks it",
    inScope.length > 0 && faults.length === 0,
    faults.length ? `${nf(faults.length)} (${owed.join(", ")}) · ${first(faults)}` : `${inScope.length} works · ${said.join(" · ")}${hgBooks ? ` · hg read against the lattice's stacks on ${hgBooks} book(s), ${nf(hgJudged)} signed headword lines` : ""}`);
}

// ---- G3: the resting lines --------------------------------------------------------------------------------------------
{
  const faults = [];
  let records = 0, lines = 0, pieces = 0, signedPieces = 0;
  for (const w of inScope) {
    const path = join(RECORDS, `${w.name}.json.gz`);
    if (!existsSync(path)) { faults.push(`${w.name} has no record of its resting lines at ${path}`); continue; }
    const rec = gz(path);
    records += 1;
    const secs = new Map((w.zone.sections || []).map((s) => [String(s.label), s]));
    for (const [label, units] of rec.sections || []) {
      const sec = secs.get(String(label));
      for (const [at, count, text] of units || []) {
        lines += 1;
        const ps = String(text).split(" + ").filter((p) => !isGap(p));
        pieces += ps.length;
        const signed = ps.filter((p) => opensWithStrongSign(p.trim()));
        if (!signed.length) continue;
        signedPieces += signed.length;
        const words = sec ? (sec.words || []).slice(at, at + count) : [];
        const keys = [...new Set(words.flatMap((x) => [x.k, x.h, ...(x.w || []).map((r) => r.k)]).filter(Boolean))];
        for (const p of signed) for (const k of keys) {
          const pool = poolAt(k);
          if (pool.some((g) => readingKey(g.text) === readingKey(p.trim())) && plainIn(pool)) { faults.push(`${w.name} ${label} (entry ${at}): the line ${short(text)} has the piece ${short(p.trim())}, a reading of ${k} whose pool holds ${short(pool.find((g) => !opensWithStrongSign(g.text)).text)}`); break; }
        }
      }
    }
  }
  check("G3  no piece of a resting line of a work of the scope opens with Strong's sign where the pool at rest of a key its word reads holds the piece and a plain reading (the line split at « + », the hidden sign's gap set aside)",
    records > 0 && faults.length === 0,
    faults.length ? `${nf(faults.length)} · ${first(faults)}` : `${records} records · ${nf(lines)} lines, ${nf(pieces)} pieces · ${nf(signedPieces)} piece(s) open with the sign, each a reading of a pool with no plain one, or of no pool the word reads`);
}

// ---- G4: the witnessed columns ----------------------------------------------------------------------------------------
{
  const COLS = ["witnessed_same_place", "witnessed_entry", "witnessed_entry_and_lists"];
  const faults = [];
  let entries = 0, refusedAll = 0, books = 0, signedEntries = 0;
  for (const w of works) {
    const rec = (w.zone.emitted_from || {}).witnessed_order;
    if (!rec) continue;
    books += 1;
    if (!w.scope) { for (const o of COLS) if (rec.columns && rec.columns[o] && ("strongs_sign_refused" in rec.columns[o])) faults.push(`${w.name} ${o}: the receipt types refusals for Strong's sign, and the record's scope does not reach ${w.name}`); continue; }
    for (const o of COLS) for (const [k, t] of Object.entries((w.zone.gloss_orders || {})[o] || {})) { entries += 1; if (opensWithStrongSign(t) && plainIn(poolAt(k)) && ++signedEntries) faults.push(`${w.name} ${o} ${k}: ${short(t)} opens with Strong's sign, and the key's pool at rest holds ${short(poolAt(k).find((g) => !opensWithStrongSign(g.text)).text)}`); }
    // the refusals derived again from the shipped input, the row found as the bake finds it, over the store whole
    const shippedPath = join(WITNESSED, `${w.name}.bin`);
    if (!existsSync(shippedPath)) { faults.push(`${w.name} carries a witnessed order and ${shippedPath} is not on disk`); continue; }
    const shipped = gz(shippedPath);
    for (const o of COLS) {
      const c = (shipped.columns || {})[o] || {}, want = [];
      for (const [k, text] of Object.entries(c.entries || {})) {
        const M = (c.m_entries || {})[k];
        if (typeof text !== "string" || !text || !(k in (w.zone.gloss || {})) || !M || typeof M !== "object" || !M.lic || !M.m) continue;
        const ids = Array.isArray(M.by) ? M.by : store.mIdsOfLabel(M.m);
        const row = store.rowOfText(k, text, ids);
        const readings = row ? store.readingsOf(row) : [];
        if (readings.length && readings.every((x) => opensWithStrongSign(x)) && plainIn(poolAt(k))) want.push(k);
      }
      const r = (rec.columns || {})[o] || {};
      const got = Array.isArray(r.strongs_sign_refused_keys) ? r.strongs_sign_refused_keys : null;
      refusedAll += want.length;
      if (!got) faults.push(`${w.name} ${o}: the receipt types no refusal for Strong's sign, and the shipped input gives ${want.length}`);
      else if (!same([...got].sort(), [...want].sort()) || r.strongs_sign_refused !== want.length) {
        const extra = got.filter((k) => !want.includes(k)), lost = want.filter((k) => !got.includes(k));
        faults.push(`${w.name} ${o}: the receipt refuses ${r.strongs_sign_refused} (${got.length} keys), this check ${want.length}${extra.length ? `; refused and not owed: ${extra.slice(0, 3).join(" ")}` : ""}${lost.length ? `; owed and not refused: ${lost.slice(0, 3).join(" ")}` : ""}`);
      }
      for (const k of want) if (k in ((w.zone.gloss_orders || {})[o] || {})) faults.push(`${w.name} ${o} ${k}: refused for Strong's sign, and still in the column`);
    }
  }
  check("G4  no witnessed entry opens with Strong's sign where the key's pool at rest holds a plain reading, and each column's receipt types for the sign the refusals the shipped input gives, and off the scope none",
    books > 0 && faults.length === 0,
    faults.length ? `${nf(faults.length)} (${nf(signedEntries)} entries open with the sign over a plain pool, ${nf(faults.length - signedEntries)} receipt faults) · ${first(faults)}` : `${books} books with witnessed columns · ${nf(entries)} entries read on the books of the scope · ${nf(refusedAll)} refused for the sign, each the receipt's`);
}

console.log(bad ? `\n${bad} FAILED` : "\nall checks passed");
process.exit(bad ? 1 : 0);
