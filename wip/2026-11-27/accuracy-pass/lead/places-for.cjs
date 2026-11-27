// Places for the card probe from plain references: "book chapter:verse word" (the word counted among the verse's words, marks not counted).
// node places-for.cjs <reader dir> <out.json> "micah 3:3 12" "genesis 15:9 7" ...
const z = require('zlib'), fs = require('fs'), path = require('path');
const [, , R, OUT, ...refs] = process.argv;
const zones = new Map();
const zoneOf = (b) => { if (!zones.has(b)) zones.set(b, JSON.parse(z.gunzipSync(fs.readFileSync(path.join(R, 'data/zones', b + '.bin'))))); return zones.get(b); };
const out = [];
for (const ref of refs) {
  const [book, cv, n] = ref.split(/\s+/);
  const zone = zoneOf(book);
  const si = zone.sections.findIndex((s) => s.label === cv || String(s.unit || '').endsWith('-' + cv.replace(':', '-')));
  if (si < 0) { console.error('no section', ref); continue; }
  let k = 0, e = -1;
  zone.sections[si].words.forEach((w, i) => { if (w.mark) return; k++; if (k === Number(n) && e < 0) e = i; });
  if (e < 0) { console.error('no word', ref); continue; }
  out.push({ book, si, e, id: cv, n: Number(n), s: zone.sections[si].words[e].s });
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log('places', out.length, 'of', refs.length);
