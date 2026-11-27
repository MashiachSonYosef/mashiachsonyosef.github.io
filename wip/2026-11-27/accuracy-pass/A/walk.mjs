// Read-only walk (helper A): every word place of the thirty-nine books, every block its card offers at rest (the
// whole form, and each piece of the place's own division), every store row of the twelve Bible dictionaries under the
// block's key, through the page's gates in the page's order (model.mjs, checked against the page on 168 cards).
// Writes, in the folder given: walk-summary.json (every tally), cells.tsv.gz (each block signature with its places),
// departures.tsv.gz (each withheld row counted as «nothing to decide», by signature), homonyms.tsv.gz (each standing
// row whose own entry is not shown to be STEP's, by signature), entry-false-alarms.tsv.gz.
// Usage: node walk.mjs <reader dir> <out dir> [book ...]
import { createWriteStream, writeFileSync } from "node:fs";
import { createGzip } from "node:zlib";
import { join } from "node:path";
import { loadModel, gz } from "./model.mjs";
const [R, OUT, ...ONLY] = process.argv.slice(2);
const M = await loadModel(R);
const books = ONLY.length ? ONLY : M.books;
// each file is written through gzip with its backpressure honored: the walk is one long loop, so it stops at every
// batch of signatures until what it wrote has gone to disk (flushAll), and nothing piles up in memory
const OUTS = [];
const gzOut = (name) => { const g = createGzip({ level: 6 }); const f = createWriteStream(join(OUT, name)); g.pipe(f); const o = { buf: [], write: (s) => { o.buf.push(s); }, flush: async () => { if (!o.buf.length) return; const chunk = o.buf.join(""); o.buf = []; if (!g.write(chunk)) await new Promise((r) => g.once("drain", r)); }, end: async () => { await o.flush(); await new Promise((r) => { f.on("close", r); g.end(); }); } }; OUTS.push(o); return o; };
const flushAll = async () => { for (const o of OUTS) await o.flush(); await new Promise((r) => setImmediate(r)); };
const fCells = gzOut("cells.tsv.gz"), fDep = gzOut("departures-by-signature.tsv.gz"), fHom = gzOut("homonyms.tsv.gz"), fFa = gzOut("entry-false-alarms.tsv.gz"), fOther = gzOut("entry-inferred-and-by-lemma.tsv.gz");
fOther.write("rule\tclass\tsig_id\tbook\tblock\tkey\tform_graded\tstep_tags\tsource_m\tfamily\trank\treading\trow_entry\twhy\tn_places\tfirst_place\n");
fCells.write("sig_id\tbook\tblock\trole\tkey\tform_graded\tstep_tags\ttags_from\tplace_is_a_name\topens_here\tn_places\tplaces\n");
fDep.write("rule\tclass\tsig_id\tbook\tblock\tkey\tform_graded\tstep_tags\tsource_m\tfamily\trank\treading\trow_entry\twhy\tn_places\tfirst_place\n");
fHom.write("cause\tsig_id\tbook\tblock\tkey\tform_graded\tstep_tags\tsource_m\tfamily\trank\treading\trow_entry\tnote\tn_places\tfirst_place\n");
fFa.write("kind\tsig_id\tbook\tblock\tkey\tform_graded\tstep_tags\tsource_m\tfamily\trank\treading\trow_entry\twhy\tn_places\tfirst_place\n");
const T = {}, TO = {}, EX = {}, PC = {}, LEM = {};
const inc = (o, k, n) => { o[k] = (o[k] || 0) + n; };
const example = (k, book, v) => { const a = EX[k] || (EX[k] = []); if (a.length < 5 && !a.some((x) => x.book === book)) a.push({ book, ...v }); };
const clean = (t) => String(t ?? "").replace(/[\t\n\r]+/gu, " ").slice(0, 160);
const entryOf = (f) => (f ? [f.n ? `n:${f.n.join(",")}` : "", f.t ? `t:${f.t.join(",")}` : "", f.b ? `b:${f.b.join(",")}` : "", f.name ? "name" : ""].filter(Boolean).join(" ") : "");
// which numbers STEP parts by letter, over the whole store: a number that two or more lettered tags of STEP's own rows carry
const lettersOfNumber = new Map();
{ const { readdirSync, readFileSync } = await import("node:fs"); const { gunzipSync } = await import("node:zlib");
  for (const f of readdirSync(join(R, "data", "route-store", "shards"))) {
    const body = JSON.parse(gunzipSync(readFileSync(join(R, "data", "route-store", "shards", f))).toString("utf8"));
    for (const rows of Object.values(body)) for (const row of rows) { const fx = M.factsOf(row); if (fx && Array.isArray(fx.t)) for (const t of fx.t) { const n = M.numberOf(t); (lettersOfNumber.get(n) || lettersOfNumber.set(n, new Set()).get(n)).add(t); } }
  } }
const isPieceNumber = (n) => { const d = Number(String(n).slice(1)); return d >= 9000; };
const totals = { words: 0, marks: 0, pairs: 0, plain: 0, cells: 0, sigs: 0, by_book: {} };
const special = { qatan_only: 0, qatan_only_examples: [], lattice_graded_cells: 0, no_headword_slot_rows: 0 };
let sigId = 0;
const lemCache = new Map();
for (const b of books) {
  const zone = gz(join(R, "data", "zones", `${b}.bin`)), side = gz(join(R, "data", "zones", `${b}.lattice.bin`));
  const namesMarked = !!(zone.emitted_from && zone.emitted_from.toggles && zone.emitted_from.toggles.lattice && zone.emitted_from.toggles.lattice.names);
  const sigs = new Map();
  const add = (cell, place, extra = {}) => {
    const tagsFrom = cell.tagsFrom || null;
    const ppc = cell.pp ? `${cell.pp.a > 0 ? 1 : 0}${cell.pp.a === 0 && cell.pp.b < cell.pp.t - 1 ? "p" : cell.pp.b === cell.pp.t - 1 && cell.pp.a > 0 ? "s" : "-"}` : "x";
    const k = [cell.kind, cell.role, cell.key, cell.pointed || "", cell.tags ? [].concat(cell.tags).join(" ") : "", tagsFrom || "", cell.name ? 1 : 0, ppc, cell.opened ? 1 : 0, cell.divided ? 1 : 0, cell.written ? 1 : 0].join("\u0001");
    let s = sigs.get(k);
    if (!s) { s = { cell: { ...cell, tagsFrom }, places: [], gloss: new Map() }; sigs.set(k, s); }
    s.places.push(place);
    if (extra.gloss) s.gloss.set(extra.gloss, (s.gloss.get(extra.gloss) || 0) + 1);
    totals.cells += 1;
  };
  let nb = 0;
  for (const sec of zone.sections || []) {
    let n = 0;
    for (const w of sec.words || []) {
      if (w.mark) { totals.marks += 1; continue; }
      n += 1; totals.words += 1; nb += 1;
      const place = `${sec.label}:${n}`;
      if (w.w || w.kq) {
        // a pair: its written half (the catalog under the written letters is withheld: the declared weld) and its
        // read half or halves, each asked by its own key and its own tag
        totals.pairs += 1;
        const regs = (w.w || []).filter((r) => r && r.k && !String(r.s || r.k).includes("־"));
        const reads = regs.filter((r) => r.role === "QERE");
        for (const r of regs) {
          const L = M.lettersIn(r.k).length;
          if (r.role === "KETIV") { add({ kind: "pair-written", i: -1, key: r.k, pointed: null, tags: null, name: !namesMarked || !!w.np, pp: null, role: "written", written: true }, place); continue; }
          const pointed = String(r.s || "").replace(/^\[+|\]+$/gu, "") || null;
          const tags = r.tg && reads.length === 1 ? [].concat(r.tg) : null;
          const pg = reads.length === 1 && Array.isArray(w.pg) && w.pg.length > 1 && w.pg.every((p) => p && p.k) && w.pg.map((p) => p.k).join("") === r.k ? w.pg : null;
          add({ kind: "pair-read", i: -1, key: r.k, pointed, tags, tagsFrom: tags ? "tg" : null, name: !namesMarked || !!w.np, pp: L ? { a: 0, b: L - 1, t: L } : null, role: "whole", divided: !!pg }, place);
          if (pg) {
            const cores = pg.filter((p) => p.r === "core"); let a = 0;
            pg.forEach((p) => { const len = M.lettersIn(p.k).length; const once = pg.filter((q) => q.k === p.k).length === 1;
              const t = r.tg && cores.length === 1 && cores[0].k === p.k ? [].concat(r.tg) : null;
              add({ kind: "pair-read-piece", i: 0, key: p.k, pointed: null, tags: t, tagsFrom: t ? "tg" : null, name: !namesMarked || !!w.np, pp: once && len ? { a, b: a + len - 1, t: L } : null, role: p.r }, place, { gloss: String(p.g || "").trim() });
              a += len; });
          }
        }
        continue;
      }
      if (!w.k) continue;
      totals.plain += 1;
      // a word whose only vowel sign is the qatan mark: the page's isPointed says it is not pointed
      if (w.s && !M.isPointed(w.s) && /ׇ/u.test(w.s)) { special.qatan_only += 1; if (special.qatan_only_examples.length < 8) special.qatan_only_examples.push(`${b} ${place} ${w.s}`); }
      const tagsFrom = w.tg ? "tg" : w.te ? "te" : null;
      // STEP's tag against the entries of MACULA's lemma at the place (the store's rows headed by the lemma as MACULA points it)
      if (w.tg && w.hp) {
        let le = lemCache.get(w.hp); if (!le) { le = M.lemmaEntries(w.hp, M.store.routesFor, M.factsOf); lemCache.set(w.hp, le); }
        const pe = M.placeEntry([].concat(w.tg));
        const k = !le.length ? "the lemma heads no numbered row" : !pe ? "no number in STEP's tag" : le.some((q) => pe.numbers.includes(q)) ? "agree" : "disagree";
        inc(LEM, k, 1);
        if (k === "disagree") { inc(LEM, `disagree\t${[].concat(w.tg).join(" ")}\t${w.hp}\t${le.join(",")}`, 1); const a = EX["step-vs-macula-lemma"] || (EX["step-vs-macula-lemma"] = []); if (a.length < 12 && !a.some((q) => q.book === b)) a.push({ book: b, place, form: w.s, step_tag: w.tg, macula_lemma: w.hp, lemma_entries: le }); }
      } else inc(LEM, w.tg ? "no lemma on the word" : "no STEP tag", 1);
      for (const cell of M.cellsOfWord(w, namesMarked)) {
        const gloss = cell.kind === "piece" ? String(cell.gloss || "").trim() : Array.isArray(w.pg) ? w.pg.map((p) => String(p.g || "").trim()).join("/") : "";
        add({ ...cell, tagsFrom: cell.tags ? tagsFrom : null }, place, { gloss });
      }
    }
  }
  totals.by_book[b] = nb;
  totals.sigs += sigs.size;
  // each signature once, tallied with the number of its places
  for (const s of sigs.values()) {
    sigId += 1;
    if (sigId % 300 === 0) await flushAll();
    const c = s.cell, n = s.places.length;
    const blockClass = c.kind === "whole" ? (c.divided ? "whole-of-divided" : "whole") : c.kind === "piece" ? (["core", "prefix", "suffix"].includes(c.role) ? c.role : "other-piece") : c.kind;
    const tagStr = c.tags ? [].concat(c.tags).join(" ") : "";
    fCells.write(`${sigId}\t${b}\t${blockClass}\t${c.role}\t${c.key}\t${c.pointed || ""}\t${tagStr}\t${c.tagsFrom || ""}\t${c.name ? 1 : 0}\t${c.opened ? 1 : 0}\t${n}\t${s.places.join(";")}\n`);
    inc(T, `cells\t${blockClass}`, n); if (c.opened) inc(T, `cells_opened\t${blockClass}`, n);
    if (c.written) {
      // the written half of a pair: every store row under the written letters is withheld (the declared weld)
      for (const row of M.store.routesFor(c.key) || []) { const fam = M.twelve.get(String(row[3])); if (fam) { inc(T, `kq-weld\t${fam}\t${blockClass}\twithheld`, n); example("kq-weld", b, { place: s.places[0], key: c.key, m: String(row[3]), reading: clean(row[1]) }); } }
      continue;
    }
    const ev = M.evalCell({ ...c, side });
    if (ev.gradedBy === "lattice") special.lattice_graded_cells += n;
    const otherAmongAll = ev.rows.some((x) => x.verdict === "other");
    const lettered = ev.place && ev.place.lettered;
    const placeNums = ev.place ? ev.place.numbers : [];
    const stepParts = lettered && placeNums.some((pn) => (lettersOfNumber.get(pn) || new Set()).size > 1);
    // BDB's own entries among the key's rows that carry the place's number
    const bdbSet = ev.bdbHere || new Set();
    const line = (f, a, x, cls, why) => f.write(`${a}\t${cls ? `${cls}\t` : ""}${sigId}\t${b}\t${blockClass}\t${c.key}\t${c.pointed || ""}\t${tagStr}\t${x.m}\t${x.twelve}\t${x.row[0]}\t${clean(x.row[1])}\t${entryOf(x.facts)}\t${why || ""}\t${n}\t${s.places[0]}\n`);
    const glossKeys = new Set([...s.gloss.keys()].map((g) => M.readingKey(g)));
    // which pills of the block carry no sign (the signs switch rests off: a signed pill is not offered while a plain one stands)
    let anyPlainPill = false;
    const standing = [];
    for (const x of ev.rows) {
      if (!Array.isArray(x.row[6])) special.no_headword_slot_rows += 1;
      if (!x.twelve) continue;
      const fam = x.twelve;
      const vclass = x.verdict === "this" ? "entry-is-steps" : x.verdict === "none" ? "no-entry-on-row" : x.verdict === "other" ? "another-entry" : "gate-not-asked";
      const tally = (rule, klass, k = n) => { inc(T, `${rule}\t${fam}\t${blockClass}\t${klass}`, k); if (c.opened) inc(TO, `${rule}\t${fam}\t${klass}`, k); };
      inc(T, `rows\t${fam}\t${blockClass}`, n); if (c.opened) inc(TO, `rows\t${fam}`, n);
      if (x.held === "entry") {
        const base = c.tagsFrom === "te" ? "no-step-tag(lemma)" : x.why === "bdb-entry" ? "inferred" : "b";
        const klass = `${base}:${x.why}`;
        tally("entry", klass);
        example(`entry\t${klass}`, b, { place: s.places[0], key: c.key, form: c.pointed, tags: tagStr, m: x.m, reading: clean(x.row[1]), entry: entryOf(x.facts) });
        // the gate's false alarms, as a machine can see them
        const f = x.facts || {};
        const nums = Array.isArray(f.n) ? f.n : [];
        if (x.why === "number" && nums.some((q) => placeNums.includes(M.numberOf(q)))) { tally("entry-false-alarm", "number-written-otherwise"); line(fFa, "number-written-otherwise", x, null, x.why); }
        const reads = M.store.readingsOf(x.row).map((t) => M.readingKey(t));
        if (x.m === "M4" && reads.some((t) => glossKeys.has(t))) { tally("entry-false-alarm", "steps-own-reading-at-the-place"); line(fFa, "steps-own-reading-at-the-place", x, null, x.why); line(fDep, "entry", x, "c:steps-own-reading-at-this-place-withheld", x.why); example("entry-false-alarm\tsteps-own-reading-at-the-place", b, { place: s.places[0], key: c.key, form: c.pointed, tags: tagStr, m: x.m, reading: clean(x.row[1]), entry: entryOf(x.facts) }); }
        if (c.pointed && x.why === "number" && c.tagsFrom === "tg" && M.gradeRow(x.row, c.pointed, true) === "m") { tally("entry-pointed-as-the-text", fam === "tahot" ? "steps-own-row" : "another-dictionary"); line(fFa, "pointed-as-the-text-yet-another-number", x, null, x.why); }
        if (c.tagsFrom === "te") line(fOther, "entry", x, "no-step-tag:judged-by-maculas-lemma", x.why);
        if (x.why === "bdb-entry") line(fOther, "entry", x, "inferred:the-row-names-no-number-parted-by-bdbs-entry", x.why);
        // where STEP's core tag is one of its piece numbers (H9000 and up: «to him»), a row of MACULA's numbers the
        // same piece otherwise and can never be «this entry»
        if (x.why === "number" && c.tagsFrom === "tg" && placeNums.every(isPieceNumber) && fam === "macula") { tally("entry-piece-number-core", "macula-numbers-the-piece-otherwise"); line(fDep, "entry", x, "c?:the-core-tag-is-a-piece-number-and-macula-numbers-the-piece-otherwise", x.why); }
        continue;
      }
      if (x.held === "name") {
        const f0 = x.facts || {}, lex0 = (Array.isArray(f0.n) ? f0.n : []).filter((q) => !isPieceNumber(q));
        const klass = x.verdict === "this"
          ? (c.tagsFrom === "te" ? "no-step-tag(lemma)" : lex0.some((q) => !placeNums.includes(q)) ? "b:the-row-carries-another-number-too" : lettered && stepParts && !(Array.isArray(f0.t) && f0.t.length) ? "b:step-parts-this-number-by-letter-and-the-row-carries-none" : "c:the-rows-entry-is-steps-entry")
          : x.verdict === "none" ? "b:no-entry-on-row" : (blockClass === "prefix" || blockClass === "suffix" || blockClass === "other-piece") ? "b:a-name-on-a-prefix-or-suffix-block" : "no-step-tag";
        tally("name", klass);
        example(`name\t${klass}`, b, { place: s.places[0], key: c.key, form: c.pointed, tags: tagStr, m: x.m, reading: clean(x.row[1]), entry: entryOf(x.facts) });
        if (klass.startsWith("c:")) line(fDep, "name", x, klass, "the row is of the place's own entry; its source gives it as a name; the place is not listed a name");
        continue;
      }
      if (x.held === "point-x" || x.held === "point-n") {
        const rule = x.held === "point-x" ? "pointed-otherwise" : "unpointed";
        const klass = x.verdict === "unasked" ? "no-step-tag" : otherAmongAll ? "b:key-holds-a-row-of-another-entry" : "c:no-row-of-another-entry-under-the-key";
        tally(rule, klass);
        if (!ev.attestedByTwelve) tally(`${rule}-woken-by-a-shut-dictionary`, klass);
        if (ev.gradedBy === "lattice") tally(`${rule}-graded-by-the-lattice-card`, klass);
        example(`${rule}\t${klass}`, b, { place: s.places[0], key: c.key, form: c.pointed, tags: tagStr, m: x.m, reading: clean(x.row[1]), heads: (x.row[6] || []).join(" "), entry: entryOf(x.facts) });
        if (klass.startsWith("c:")) line(fDep, rule, x, klass, `graded ${x.grade}`);
        continue;
      }
      if (x.held === "piece") {
        const reads = M.store.readingsOf(x.row).map((t) => M.readingKey(t));
        // a headword that carries a prefix's vowel and a dagesh (BDB writes the article so, with the doubling it causes)
        // is read by the rule as the suffix's mappiq: the same headword without the dot is a prefix's
        const dotted = ev.pieceAt === "prefix" && Array.isArray(x.row[6]) && x.row[6].filter(M.isPointed).length > 0 && x.row[6].filter(M.isPointed).every((h) => { const v = M.vowelForm(h); return /\u05BC/u.test(v) && M.PIECE_CLASS[c.key] && M.PIECE_CLASS[c.key](v.replace(/\u05BC/gu, "")) === "prefix"; });
        const klass = dotted ? "c:a-prefixs-vowel-with-a-dagesh-read-as-the-suffixs-mappiq" : reads.some((t) => glossKeys.has(t)) ? "c:steps-own-gloss-of-this-piece-withheld" : "b:its-own-vowels-make-it-the-other-kind";
        tally("piece-class", klass);
        inc(PC, `${c.key}\t${ev.pieceAt}\t${fam}\t${(x.row[6] || []).join(" ")}\t${clean(x.row[1]).slice(0, 60)}\t${klass.slice(0, 1)}`, n);
        example(`piece-class\t${klass}`, b, { place: s.places[0], key: c.key, tags: tagStr, m: x.m, reading: clean(x.row[1]), heads: (x.row[6] || []).join(" "), at: ev.pieceAt });
        if (klass.startsWith("c:")) line(fDep, "piece-class", x, klass, `at a ${ev.pieceAt}`);
        continue;
      }
      if (x.held === "stem") {
        const reads = M.store.readingsOf(x.row).map((t) => M.readingKey(t));
        const own = (x.m === "M4" || x.m === "M3") && reads.some((t) => glossKeys.has(t));
        const klass = own ? "c:the-places-own-reading-withheld" : `b-by-stem:${vclass}`;
        tally("stem", klass);
        example(`stem\t${klass}`, b, { place: s.places[0], key: c.key, form: c.pointed, tags: tagStr, m: x.m, reading: clean(x.row[1]), row_stems: (x.stems || []).join(","), place_stems: (ev.stemsHere || []).join(",") });
        if (own) line(fDep, "stem", x, klass, `row stems ${(x.stems || []).join(",")}; place stems ${(ev.stemsHere || []).join(",")}`);
        continue;
      }
      // the kinds that rest shut (UBS's collocation rows), but at the places the row's own facts name
      let nStand = n;
      if (M.restsOff(x.row, null)) {
        const picked = new Set(((x.facts || {}).picked_at) || []);
        const nPicked = picked.size ? s.places.filter((p) => picked.has(`${b} ${p}`)).length : 0;
        if (n - nPicked) { tally("rests-shut", vclass, n - nPicked); example(`rests-shut\t${vclass}`, b, { place: s.places[0], key: c.key, tags: tagStr, m: x.m, reading: clean(x.row[1]) }); }
        nStand = nPicked;
        if (!nStand) continue;
      }
      if (x.opens) { tally("note-not-pill", vclass, nStand); example(`note-not-pill\t${vclass}`, b, { place: s.places[0], key: c.key, tags: tagStr, m: x.m, reading: clean(x.row[1]) }); continue; }
      const readings = M.store.readingsOf(x.row);
      if (!readings.length) { tally("prints-no-pill", vclass, nStand); continue; }
      let left = readings;
      if (c.kind === "whole" && c.divided) { left = readings.filter((t) => !/\//u.test(t)); if (!left.length) { tally("whole-form-sets-aside-divided-reading", vclass, nStand); example(`whole-form-sets-aside-divided-reading\t${vclass}`, b, { place: s.places[0], key: c.key, tags: tagStr, m: x.m, reading: clean(x.row[1]) }); continue; } }
      const plain = left.filter((t) => !M.hasSourceSign(t));
      if (plain.length) anyPlainPill = true;
      standing.push({ x, fam, vclass, nStand, left, plain });
    }
    for (const { x, fam, vclass, nStand, left, plain } of standing) {
      const tally = (rule, klass, k = nStand) => { inc(T, `${rule}\t${fam}\t${blockClass}\t${klass}`, k); if (c.opened) inc(TO, `${rule}\t${fam}\t${klass}`, k); };
      const signedOut = !plain.length && anyPlainPill;
      if (signedOut) { tally("signs-off", vclass); example(`signs-off\t${vclass}`, b, { place: s.places[0], key: c.key, tags: tagStr, m: x.m, reading: clean(x.row[1]) }); }
      tally("stands", vclass);
      // homonyms: a standing row whose own entry is not shown to be the one STEP's tag names
      const f = x.facts || {}, nums = Array.isArray(f.n) ? f.n : [], ts = Array.isArray(f.t) ? f.t : [], bs = Array.isArray(f.b) ? f.b : [];
      let cause = null, note = "";
      if (x.verdict === "this") {
        const lexNums = nums.filter((q) => !isPieceNumber(q));
        const strangers = lexNums.filter((q) => !placeNums.includes(q));
        if (c.tagsFrom === "te") { cause = "judged by MACULA's lemma (STEP gives no tag)"; }
        else if (lettered && ts.length) cause = strangers.length ? "let through: one of several numbers (letter agrees)" : null;
        else if (strangers.length) { cause = "let through: one of the row's several numbers is the place's"; note = `other numbers ${strangers.join(",")}`; }
        else if (lettered && stepParts) {
          { const L = String(ev.place.tags[0]).slice(-1); cause = `let through: number alone where STEP parts the number by letter (the place's letter ${/[A-F]/u.test(L) ? "A to F" : "G and after"})`; }
          const others = [...new Set(placeNums.flatMap((pn) => [...(lettersOfNumber.get(pn) || [])]))].filter((t) => !ev.place.tags.includes(t));
          note = `STEP's other letters ${others.slice(0, 6).join(",")}${bs.length ? `; BDB entry ${bs.join(",")} of ${bdbSet.size} under this number here` : ""}`;
          if (bs.length && bdbSet.size > 1) tally("homonym-bdb-several-entries-under-one-number", "stands");
        }
        else if (lettered) { tally("homonym-none", "number agrees; STEP gives this number one letter only"); }
        else tally("homonym-none", "number agrees; the place carries no letter");
        if (!cause && lettered && ts.length) tally("homonym-none", "letter agrees");
      } else if (x.verdict === "none") {
        if (!nums.length && !ts.length && !bs.length) cause = "the row carries no entry";
        else { cause = "the row names BDB's entry only and the gate could not part it"; note = `BDB entry ${bs.join(",")}; ${bdbSet.size} BDB entries under the place's number here`; }
        if (c.tagsFrom === "te") note += " (place judged by MACULA's lemma)";
      } else {
        const lexNums = nums.filter((q) => !isPieceNumber(q));
        if (blockClass === "prefix" || blockClass === "suffix" || blockClass === "other-piece") {
          if (!nums.length && !bs.length) cause = "gate not asked (a prefix or suffix block): the row carries no entry";
          else if (lexNums.length === nums.length) cause = "gate not asked (a prefix or suffix block): the row is of an ordinary entry";
          else if (lexNums.length) cause = "gate not asked (a prefix or suffix block): the row carries a word's number beside a piece's";
          else { tally("homonym-none", "a prefix or suffix block; the row carries only STEP's piece numbers (not compared: the zone carries no tag for the piece)"); }
        } else if (blockClass === "core") cause = "gate not asked (a word of two cores, or the place carries no tag)";
        else cause = "gate not asked (the place carries no tag, STEP's or the lemma's)";
      }
      if (cause) { tally("homonym", cause); if (signedOut) tally("homonym-under-signs-off", cause); line(fHom, cause, x, null, note); example(`homonym\t${cause}`, b, { place: s.places[0], key: c.key, form: c.pointed, tags: tagStr, m: x.m, reading: clean(x.row[1]), entry: entryOf(x.facts), note }); }
    }
  }
  process.stderr.write(`${b} ${nb} words, ${sigs.size} signatures\n`);
}
await Promise.all([fCells.end(), fDep.end(), fHom.end(), fFa.end(), fOther.end()]);
writeFileSync(join(OUT, "piece-class-rows.json"), JSON.stringify(PC, null, 0));
writeFileSync(join(OUT, "step-vs-macula-lemma.json"), JSON.stringify(LEM, null, 0));
writeFileSync(join(OUT, "walk-summary.json"), JSON.stringify({ totals, special, tallies: T, tallies_on_the_block_the_card_opens_on: TO, examples: EX, numbers_step_parts_by_letter: [...lettersOfNumber].filter(([, v]) => v.size > 1).length, numbers_with_a_letter: lettersOfNumber.size }, null, 1));
console.log(JSON.stringify(totals).slice(0, 400));
