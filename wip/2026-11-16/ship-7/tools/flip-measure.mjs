// Task 134 (the owner, 16 November 2026: «if its no pointing why would that ... auto qualify it for all pointings
// rather than none»). Every word place of the 39 books at rest, under «only this pointing»: what the pointing gate
// withholds today (a row its source points otherwise), and under the flip (a row the pointing cannot place, «n», rests
// held back too), each with and without English Wiktionary's own pointed head forms laid on its bare rows from the
// Kaikki records the tree holds (data/dictionary-store). The place's entry and the names gate are asked first, as on
// the page; a row of the place's own entry stays whatever its points; the gate acts only where some row points as the
// place. Ketiv/qere words are counted apart and not judged.
// usage: node flip-measure.mjs <reader dir> <out.json>
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [RD, OUT] = process.argv.slice(2);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const { openRouteStore } = await import(join(RD, "tools/gloss-store-v1.mjs"));
const { placeEntry, bdbEntriesAt, entryVerdict } = await import(join(RD, "tools/entry-gate-v1.mjs"));
const { nameWithheld } = await import(join(RD, "tools/names-gate-v1.mjs"));
const { gradeRow, isPointed, vowelForm } = await import(join(RD, "tools/pointing-grade-v1.mjs"));
const rest = openRouteStore(join(RD, "data/route-store"), { atRest: true });
const MS = rest.index.m_sources;
const factsOf = (row) => { const f = Array.isArray(row) && row.length > 10 ? row[10] : null; return f && typeof f === "object" && !Array.isArray(f) ? f : null; };
const tagHolder = (word, key) => { if (!word) return null; if (word.tg) return word; const t = (word.w || word.kqw || []).filter((r) => r && r.tg); return t.find((r) => r.k === key) || t[0] || null; };
const readWordOfSeveral = (word, r) => r !== word && r.role === "QERE" && (word.w || word.kqw || []).filter((x) => x && x.role === "QERE").length > 1;
const tagsAt = (word, key) => { const h = tagHolder(word, key); return h && key && h.k === key && !readWordOfSeveral(word, h) ? [].concat(h.tg) : null; };

// English Wiktionary's own pointed head forms: per letters key and source key, each Kaikki record's canonical pointed
// forms with the glosses it gives (a row is its record's when the row's text is one of them)
const letters = (t) => [...String(t || "").normalize("NFD")].filter((c) => c >= "\u05D0" && c <= "\u05EA").join("");
const dstore = join(RD, "data/dictionary-store");
const DIX = JSON.parse(readFileSync(join(dstore, "index.json"), "utf8")).m_sources || {};
const KAIKKI = new Set(["kaikki_wiktionary_hebrew", "kaikki_wiktionary_aramaic"]);
const recs = new Map();   // `${srcKey}\u0001${letters}` -> [{ canon: Set, gl: Set }]
for (const f of readdirSync(join(dstore, "shards"))) {
  const db = gz(join(dstore, "shards", f));
  for (const [k, e] of Object.entries(db)) for (const rec of (e && e.records) || []) {
    const sk = (DIX[rec.m] || {}).key;
    if (!KAIKKI.has(sk)) continue;
    const D = rec.D || "";
    if (!D.startsWith("{")) continue;
    let j; try { j = JSON.parse(D); } catch { continue; }
    if (letters(j.word) !== k) continue;
    const canon = new Set((j.forms || []).filter((x) => (x.tags || []).includes("canonical") && isPointed(x.form)).map((x) => vowelForm(x.form)));
    const gl = new Set();
    for (const s of j.senses || []) for (const g of [...(s.glosses || []), ...(s.raw_glosses || [])]) gl.add(g);
    const id = `${sk}\u0001${k}`;
    if (!recs.has(id)) recs.set(id, []);
    recs.get(id).push({ canon, gl });
  }
}
// a bare row's own source's pointing, where its record names one: the vowel forms, or null
const kaikkiCanon = (row, k) => {
  const sk = (MS[row[3]] || {}).key;
  if (!KAIKKI.has(sk)) return null;
  const own = (recs.get(`${sk}\u0001${k}`) || []).filter((o) => o.gl.has(row[1]));
  const c = new Set(); for (const o of own) for (const v of o.canon) c.add(v);
  return c.size ? c : null;
};

const books = Object.keys(JSON.parse(readFileSync(join(RD, "data/default-picks/index.json"), "utf8")).books);
const by = new Map();
const B = (m) => { if (!by.has(m)) by.set(m, { label: (MS[m] || {}).label || "?", stand_today: 0, x_today: 0, n_today_standing: 0, flip_x: 0, flip_n: 0, flipK_x: 0, flipK_n: 0, flipK_kaikki_m: 0, flipK_kaikki_x: 0 }); return by.get(m); };
const T = { places: 0, judged: 0, kq: 0, unpointed_surface: 0, no_rows: 0, attested: 0, attestedK: 0, emptied_today: 0, emptied_flip: 0, emptied_flipK: 0 };
const ex = [];
const gradeCache = new Map();
for (const book of books) {
  const zone = gz(join(RD, "data/zones", `${book}.bin`));
  for (const sec of zone.sections || []) for (const w of sec.words || []) {
    if (w.mark) continue;
    T.places += 1;
    if (w.kq) { T.kq += 1; continue; }
    const k = w.k, s = w.s;
    if (!k || !s || !isPointed(s)) { T.unpointed_surface += 1; continue; }
    const all = rest.routesFor(k) || [];
    if (!all.length) { T.no_rows += 1; continue; }
    T.judged += 1;
    const tags = tagsAt(w, k);
    let routes = all; const ofThis = new Set();
    if (tags) {
      const place = placeEntry(tags);
      if (place) {
        const bdbHere = bdbEntriesAt(place, all.map(factsOf));
        const v = all.map((r) => entryVerdict(factsOf(r), place, bdbHere));
        routes = all.filter((r, i) => v[i] !== "other");
        all.forEach((r, i) => { if (v[i] === "this") ofThis.add(r); });
      }
    }
    if (!w.np) routes = routes.filter((r) => !nameWithheld(factsOf(r), false));
    const ck = `${k}\u0001${s}`;
    let G = gradeCache.get(ck);
    if (!G) {
      const vf = vowelForm(s);
      const g = all.map((r) => gradeRow(r, s));
      const gK = all.map((r, i) => { if (g[i] !== "n") return g[i]; const c = kaikkiCanon(r, k); return c ? (c.has(vf) ? "M" : "X") : "n"; });
      G = { g, gK }; gradeCache.set(ck, G);
    }
    const gi = new Map(all.map((r, i) => [r, i]));
    const att = G.g.includes("m"), attK = G.gK.some((x) => x === "m" || x === "M");
    if (att) T.attested += 1; if (attK) T.attestedK += 1;
    let leftToday = 0, leftFlip = 0, leftFlipK = 0;
    for (const r of routes) {
      const i = gi.get(r), g = G.g[i], gK = G.gK[i], b = B(r[3]), own = ofThis.has(r);
      // today: x withheld where attested
      if (att && !own && g === "x") b.x_today += 1; else { b.stand_today += 1; leftToday += 1; if (g === "n") b.n_today_standing += 1; }
      // the flip: n held back too
      if (att && !own && g !== "m") { if (g === "x") b.flip_x += 1; else b.flip_n += 1; } else leftFlip += 1;
      // the flip with Wiktionary's own pointing laid on its bare rows
      if (gK === "M") b.flipK_kaikki_m += 1; if (gK === "X") b.flipK_kaikki_x += 1;
      if (attK && !own && gK !== "m" && gK !== "M") { if (gK === "x" || gK === "X") b.flipK_x += 1; else b.flipK_n += 1; } else leftFlipK += 1;
    }
    if (!leftToday) T.emptied_today += 1;
    if (!leftFlip) { T.emptied_flip += 1; if (ex.length < 12) ex.push(`${book} ${sec.label} ${s} (${k})`); }
    if (!leftFlipK) T.emptied_flipK += 1;
  }
}
const rows = [...by.entries()].map(([m, o]) => ({ m, ...o })).sort((a, b) => (b.flipK_n + b.flipK_x - b.x_today) - (a.flipK_n + a.flipK_x - a.x_today));
const sum = (f) => rows.reduce((t, r) => t + r[f], 0);
const totals = Object.fromEntries(["stand_today", "x_today", "n_today_standing", "flip_x", "flip_n", "flipK_x", "flipK_n", "flipK_kaikki_m", "flipK_kaikki_x"].map((f) => [f, sum(f)]));
writeFileSync(OUT, JSON.stringify({ places: T, totals, by_source: rows, emptied_examples: ex }, null, 1));
console.log(JSON.stringify(T)); console.log(JSON.stringify(totals));
for (const r of rows.slice(0, 25)) console.log(`${r.m.padEnd(5)} today stand ${String(r.stand_today).padStart(8)} x ${String(r.x_today).padStart(7)} | flip x ${String(r.flip_x).padStart(7)} n ${String(r.flip_n).padStart(7)} | +own pointing x ${String(r.flipK_x).padStart(7)} n ${String(r.flipK_n).padStart(7)}  ${r.label.slice(0, 60)}`);
