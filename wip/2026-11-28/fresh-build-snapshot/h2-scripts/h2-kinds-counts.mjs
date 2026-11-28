// Scratch (builder H2): over every cell the card draws at rest (each of STEP's parts, and the whole word, for each
// form of every word of every chapter file), the pills the card offers before and after what rests shut rests shut
// on it (the kinds record's UBS collocation glosses, not cited at this very word, where no pill that stands gives the
// same reading). A pill is one reading (case folded, "/" joined as " + "), whatever sources give it.
// node h2-kinds-counts.mjs <reader dir> <out.json>
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
const FROM = "א", TO = "ת";
const LET = (s) => [...String(s || "")].filter((c) => c >= FROM && c <= TO).length;
const key = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/u, "").toLowerCase();
const before = [], after = []; let cells = 0, held = 0, cellsHeld = 0; const top = [];
for (const b of ix.books) for (const ch of b.chapters) {
  const doc = JSON.parse(gunzipSync(readFileSync(join(DATA, b.book, `${ch}.json.gz`))).toString("utf8"));
  for (const v of doc.verses) { let n = 0; for (const e of v.e) { if (e.m !== undefined) continue; n += 1;
    for (const f of e.f) {
      const reading = e.f.length === 1 ? "form" : f.r === 2 ? "ketiv" : "qere";
      const tp = (f.t && f.t.p) || []; const t = tp.reduce((s, p) => s + LET(p[3]), 0); if (!t) continue;
      const rs = [[0, t - 1]]; let a = 0; for (const p of tp) { const L = LET(p[3]); if (L && !(a === 0 && L === t)) rs.push([a, a + L - 1]); a += L; }
      for (const [x, y] of rs) {
        cells += 1;
        const got = await card.pillsAt(doc, v.l, n, reading, x, y, t);
        const stand = new Set(got.pills.filter((p) => !(p.colloc && !p.cites)).map((p) => key(p.text)));
        const all = new Set(got.pills.map((p) => key(p.text)));
        before.push(all.size); after.push(stand.size);
        if (all.size !== stand.size) { cellsHeld += 1; held += all.size - stand.size; }
        if (all.size >= 140) top.push(`${b.book} ${v.l}:${n} ${x}-${y} of ${t}: ${all.size} -> ${stand.size}`);
      }
    } } }
}
const stats = (xs) => { const s = [...xs].sort((p, q) => p - q); const at = (q) => s[Math.min(s.length - 1, Math.floor(q * s.length))]; return { median: at(0.5), p95: at(0.95), p99: at(0.99), largest: s[s.length - 1], total: s.reduce((p, q) => p + q, 0) }; };
const rep = { cells, before: stats(before), after: stats(after), held, cells_holding: cellsHeld, cells_140_or_more: top.length, sample_140: top.slice(0, 12) };
writeFileSync(OUT, JSON.stringify(rep, null, 1));
console.log(JSON.stringify(rep));
