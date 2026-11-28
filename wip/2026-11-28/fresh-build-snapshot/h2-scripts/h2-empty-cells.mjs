// Scratch (builder H2): over every word of every chapter file, the cells the card draws for it at rest (each of
// STEP's parts, and the whole word, for each form), and how many of them the place answers give no pill.
// node h2-empty-cells.mjs <reader dir> <out.tsv>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [R, OUT] = process.argv.slice(2);
const DATA = join(R, "data", "place-answers-v1", "page");
globalThis.fetch = async (url) => { const p = join(DATA, String(url).slice(2)); return existsSync(p) ? new Response(readFileSync(p), { status: 200 }) : new Response("no", { status: 404 }); };
globalThis.document = { createElement: () => ({}) };
const { placeCardOf } = await import(join(R, "tools", "place-card-v1.mjs"));
const card = placeCardOf({ data: "d/", fault: () => {} });
const ix = await card.index();
const LET = (s) => [...String(s || "")].filter((c) => c >= "א" && c <= "ת").length;
let words = 0, cells = 0, empty = 0, pills = 0; const rows = [["book", "verse", "word", "reading", "letters", "why"].join("\t")]; const why = {};
for (const b of ix.books) for (const ch of b.chapters) {
  const doc = JSON.parse(gunzipSync(readFileSync(join(DATA, b.book, `${ch}.json.gz`))).toString("utf8"));
  for (const v of doc.verses) { let n = 0; for (const e of v.e) { if (e.m !== undefined) continue; n += 1; words += 1;
    for (const f of e.f) {
      const reading = e.f.length === 1 ? "form" : f.r === 2 ? "ketiv" : "qere";
      const tp = (f.t && f.t.p) || []; const t = tp.reduce((s, p) => s + LET(p[3]), 0); if (!t) continue;
      const rs = [[0, t - 1]]; let a = 0; for (const p of tp) { const L = LET(p[3]); if (L && !(a === 0 && L === t)) rs.push([a, a + L - 1]); a += L; }
      for (const [x, y] of rs) { cells += 1; const got = await card.pillsAt(doc, v.l, n, reading, x, y, t); pills += got.pills.length;
        if (!got.pills.length) { empty += 1; why[got.why] = (why[got.why] || 0) + 1; rows.push([b.book, v.l, n, reading, `${x}-${y} of ${t}`, got.why].join("\t")); } }
    } } }
}
writeFileSync(OUT, `${rows.join("\n")}\n`);
console.log(JSON.stringify({ words, cells, pills, empty, why }));
