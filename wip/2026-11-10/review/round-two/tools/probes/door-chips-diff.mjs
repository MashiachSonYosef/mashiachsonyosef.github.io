// What the door says of each book's name, before and after: the chip under a title ("attested: <source>") and
// the hover of a gloss (title="<source> · <license>" data-m="<id>"). Reads two copies of the door's index.html.
// node door-chips-diff.mjs <index.html before> <index.html after>
import { readFileSync } from "node:fs";
const [a, b] = process.argv.slice(2).map((p) => readFileSync(p, "utf8"));
const rows = (html) => {
  const out = new Map();
  for (const m of html.matchAll(/href="\/([a-z0-9-]+)" title="open this book">([\s\S]*?)(?=href="\/[a-z0-9-]+" title="open this book">|<\/main>|$)/gu)) {
    const body = m[2];
    const att = /attested: ([^<"]+)/u.exec(body);
    const hov = /class="g" title="([^"]+)"(?: data-m="([^"]+)")?/u.exec(body);
    out.set(m[1], { attested: att ? att[1].trim() : null, hover: hov ? hov[1] : null, m: hov ? hov[2] || null : null });
  }
  return out;
};
const A = rows(a), B = rows(b);
let chip = 0, hover = 0, books = 0;
const ex = [];
for (const [slug, y] of B) {
  const x = A.get(slug); if (!x) continue; books += 1;
  if (x.attested !== y.attested) { chip += 1; if (ex.length < 6) ex.push(`${slug} chip: ${x.attested} -> ${y.attested}`); }
  if (x.hover !== y.hover || x.m !== y.m) { hover += 1; if (ex.length < 12) ex.push(`${slug} hover: ${x.hover} [${x.m}] -> ${y.hover} [${y.m}]`); }
}
console.log(`${books} books on both doors · the title's chip names another source at ${chip} · the gloss's hover names another record at ${hover}`);
for (const e of ex) console.log("  " + e);
