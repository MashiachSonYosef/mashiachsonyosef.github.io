// The whole-form division of a word its place divides: what is left to read there, and what the card's sentence
// must account for. For every such word of the served books whose whole form the store answers for, the store's
// rows are put through the pointing gate and the stem gate as the page puts them, pooled, and the pills that read
// the word in its parts (a "/" in the reading) are set apart, as the page sets them apart on that division.
// Counted: places where pills are left; places where none is left, by what took them (a switch, the parts, both).
// The overlays' rows and the place's own are not asked here, so the page can hold a pill this count does not.
// node whole-form-of-a-divided-word.mjs <reader dir> [how many places to list of each kind]
// It measures; it changes nothing.
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const [reader, many = "3"] = process.argv.slice(2);
const at = (f) => import(pathToFileURL(join(reader, "tools", f)).href);
const { gradeRow, isPointed } = await at("pointing-grade-v1.mjs");
const { isOtherStem } = await at("stem-family-v1.mjs");
const { openRouteStore } = await at("gloss-store-v1.mjs");
const { zonesServed } = await at("zones-on-disk-v1.mjs");
const store = openRouteStore(join(reader, "data", "route-store"));
const rowsOf = (k) => (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]);
const T = {}; const eg = {};
const count = (kind, where) => { T[kind] = (T[kind] || 0) + 1; (eg[kind] ||= []).length < Number(many) && eg[kind].push(where); };
let places = 0;
for (const z of zonesServed(join(reader, "data", "zones"))) {
  const p = join(reader, "data", "zones", `${z}.lattice.bin`);
  if (!existsSync(p)) continue;
  const side = JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
  const zone = JSON.parse(gunzipSync(readFileSync(join(reader, "data", "zones", `${z}.bin`))).toString("utf8"));
  for (const sec of zone.sections || []) {
    let n = 0;
    for (const w of sec.words || []) {
      if (w.mark) continue;
      n += 1;
      if (!w.k || !isPointed(w.s || "") || !Array.isArray(w.pg) || w.pg.length < 2) continue;
      const rows = rowsOf(w.k);
      if (!rows.length) continue;
      places += 1;
      const grades = rows.map((r) => gradeRow(r, w.s));
      const attested = grades.includes("m");
      const afterPointing = attested ? rows.filter((r, j) => grades[j] !== "x") : rows;
      const g = side.grades ? side.grades[w.s] : null;
      const rs = side.stems ? side.stems[w.k] : null;
      const st = g && Array.isArray(g.st) && g.st.length ? g.st : null;
      const afterStem = st && rs ? afterPointing.filter((r) => !isOtherStem(rs[`${r[3]}\u0001${r[0]}\u0001${r[1]}`], st)) : afterPointing;
      const pointing = rows.length - afterPointing.length, stem = afterPointing.length - afterStem.length;
      const pool = store.readingPool(afterStem, "oldest");
      const parts = pool.filter((x) => /\//u.test(String(x.text))).length, whole = pool.length - parts;
      const where = `${z} ${sec.label} word ${n} · ${rows.length} rows · pointing ${pointing}, stem ${stem} · pills ${whole} whole, ${parts} in parts`;
      if (whole) count(stem ? "pills left, and the stem withheld rows (the line must say its count)" : "pills left, the stem withheld nothing", where);
      else if (pointing + stem && parts) count("no pill left: a switch withheld rows AND the rest read the word in its parts", where);
      else if (pointing + stem) count("no pill left: every row withheld by a switch", where);
      else if (parts) count("no pill left: no switch withheld anything, every reading is of the word in its parts", where);
      else count("no pill left: the rows give no reading", where);
    }
  }
}
console.log(`${places.toLocaleString("en-US")} places where a divided word's whole form has rows in the store`);
for (const [k, v] of Object.entries(T).sort((a, b) => b[1] - a[1])) { console.log(`${String(v.toLocaleString("en-US")).padStart(9)}  ${k}`); for (const e of eg[k]) console.log(`             ${e}`); }
