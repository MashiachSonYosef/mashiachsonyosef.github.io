// Scratch (builder H2): 200 places for the card comparison, by rule: the five words the brief names, then for each of
// the 39 books five words at even steps through the book's words (marks not counted), counted from the zones.
// node h2-places-200.cjs <reader dir> <out.json>
const z = require("zlib"), fs = require("fs"), path = require("path");
const [R, OUT] = process.argv.slice(2);
const ix = JSON.parse(fs.readFileSync(path.join(R, "data/place-answers-v1/page/index.json"), "utf8"));
const named = [["genesis", "1:3", 5], ["genesis", "1:1", 4], ["ruth", "3:12", 5], ["amos", "7:12", 6], ["psalms", "44:15", 6]];
const out = []; const zones = new Map();
const zoneOf = (b) => { if (!zones.has(b)) zones.set(b, JSON.parse(z.gunzipSync(fs.readFileSync(path.join(R, "data/zones", `${b}.bin`))))); return zones.get(b); };
const placeOf = (book, si, e) => { const sec = zoneOf(book).sections[si]; const n = sec.words.slice(0, e + 1).filter((w) => !w.mark).length; return { book, si, e, id: sec.label, n, s: sec.words[e].s }; };
for (const [book, label, n] of named) { const Z = zoneOf(book); const si = Z.sections.findIndex((s) => s.label === label); let k = 0; const e = Z.sections[si].words.findIndex((w) => !w.mark && ++k === n); out.push(placeOf(book, si, e)); }
for (const b of ix.books) {
  const all = []; zoneOf(b.book).sections.forEach((s, si) => s.words.forEach((w, e) => { if (!w.mark) all.push([si, e]); }));
  for (let j = 0; j < 5; j += 1) { const [si, e] = all[Math.floor(((j + 0.5) * all.length) / 5)]; out.push(placeOf(b.book, si, e)); }
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log("places", out.length, "in", new Set(out.map((p) => p.book)).size, "books");
