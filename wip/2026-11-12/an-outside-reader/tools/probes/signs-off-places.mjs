// What "signs off" (the resting choice) leaves undrawn on the place's own reading, over every served book: the words
// whose place reading has a piece that is a sign and nothing else beside a piece that prints, split by which piece
// the sign is: a prefix or suffix piece (the object marker's, the article's, a preposition's) or the word's own core.
// The sign rule is the page's own (zone.html signOnly), read here from the page file so the two cannot drift.
// node signs-off-places.mjs <reader dir> [--chapter <book> <ch>]
// Nothing is written. It counts; it does not judge.
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const argv = process.argv.slice(2);
const ci = argv.indexOf("--chapter"); const ONLY = ci >= 0 ? { book: argv[ci + 1], ch: argv[ci + 2] } : null; if (ci >= 0) argv.splice(ci, 3);
const R = argv[0];
const page = readFileSync(join(R, "zone.html"), "utf8");
const m = /const signOnly = \(t\) => (\/.+?\/u)\.test\(String\(t\)\.trim\(\)\);/u.exec(page);
if (!m) { console.error("the page's sign rule was not found in zone.html"); process.exit(2); }
const re = new RegExp(m[1].slice(1, m[1].lastIndexOf("/")), "u");
const signOnly = (t) => re.test(String(t).trim());
console.log(`the page's rule: a piece is a sign and nothing else when it matches ${m[1]}`);
const served = JSON.parse(readFileSync(join(R, "data/route-store/index.json"), "utf8"));
void served;
let words = 0, placed = 0, allSigns = 0, hidden = 0, hiddenCore = 0, hiddenAffix = 0;
const coreTexts = new Map(), coreEx = new Map(), affixTexts = new Map();
const lines = [];
for (const f of readdirSync(join(R, "data/zones")).filter((x) => /^[a-z0-9-]+\.bin$/u.test(x)).sort()) {
  const book = f.replace(/\.bin$/u, "");
  if (ONLY && ONLY.book !== book) continue;
  const z = JSON.parse(gunzipSync(readFileSync(join(R, "data/zones", f))).toString("utf8"));
  for (const sec of z.sections || []) {
    if (ONLY && String(sec.label).split(":")[0] !== ONLY.ch) continue;
    (sec.words || []).forEach((w, i) => {
      if (w.mark) return;
      words += 1;
      const pg = Array.isArray(w.pg) ? w.pg : [];
      if (!pg.length || pg.some((p) => !String((p && p.g) || "").trim())) return;
      placed += 1;
      const t = pg.map((p) => String(p.g).trim());
      const signs = t.map(signOnly);
      if (signs.every(Boolean)) { allSigns += 1; if (ONLY) lines.push(`${sec.label}:${i + 1} every piece a sign, so it stands: ${t.join(" + ")}`); return; }
      if (!signs.some(Boolean)) return;
      hidden += 1;
      let core = false;
      pg.forEach((p, j) => { if (!signs[j]) return; if (p.r === "core") { core = true; coreTexts.set(t[j], (coreTexts.get(t[j]) || 0) + 1); if (!coreEx.has(t[j])) coreEx.set(t[j], `${book} ${sec.label}:${i + 1} ${t.join(" + ")}`); } else affixTexts.set(t[j], (affixTexts.get(t[j]) || 0) + 1); });
      if (core) hiddenCore += 1; else hiddenAffix += 1;
      if (ONLY) lines.push(`${sec.label}:${i + 1} ${core ? "THE CORE is the sign" : "a prefix or suffix is the sign"}: ${t.join(" + ")}`);
    });
  }
}
const top = (mp, n) => [...mp].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} ${v}`).join(" · ");
console.log(`${ONLY ? `${ONLY.book} ${ONLY.ch}` : "every served book"}: ${words} words · ${placed} with a place reading on every piece`);
console.log(`  every piece a sign, so the sign stands: ${allSigns}`);
console.log(`  a sign-only piece left undrawn beside a piece that prints: ${hidden} words`);
console.log(`    the undrawn piece is a prefix's or a suffix's: ${hiddenAffix} · ${top(affixTexts, 14)}`);
console.log(`    the undrawn piece is the word's own core: ${hiddenCore} · ${coreTexts.size} distinct texts`);
console.log(`      ${top(coreTexts, 60)}`);
if (!ONLY) console.log(`      first places: ${[...coreTexts].sort((a, b) => b[1] - a[1]).slice(0, 16).map(([k]) => coreEx.get(k)).join(" | ")}`);
for (const l of lines) console.log(`  ${l}`);
