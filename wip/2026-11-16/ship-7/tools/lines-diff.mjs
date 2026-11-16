// Ship 7's line comparison: every resting line of the works named, the live tree's record against the new tree's,
// each moved entry listed with its word, the old and new text and credit, and a class:
//   dagesh   the word's first letter carries a dagesh in a letter other than b g d k p t and vav (task 84)
//   span     the old or the new line covers more than one entry (a joined line, task 92)
//   other    the rest (the pointing gate's flip and English Wiktionary's own pointing, task 134; anything else)
// usage: node lines-diff.mjs <live reader dir> <new reader dir> <out.json> [work,...]
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [OLD, NEW, OUT, WORKS0] = process.argv.slice(2);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const works = WORKS0 ? WORKS0.split(",") : readdirSync(join(NEW, "data/resting-lines")).filter((f) => f.endsWith(".json.gz")).map((f) => f.slice(0, -8));
const joining = (s) => { const t = String(s || "").normalize("NFKD").replace(/[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C3-\u05C6]/g, ""); const m = t.match(/^([\u05D0-\u05EA])[\u05B0-\u05BB\u05C1\u05C2\u05C7]*\u05BC/u); return !!m && !"\u05D1\u05D2\u05D3\u05DB\u05E4\u05EA\u05D5".includes(m[1]); };
const T = { works: 0, entries_moved: 0, dagesh: 0, span: 0, other: 0, credit_only: 0 };
const byCredit = new Map(); const list = [];
for (const book of works) {
  let a, b; try { a = gz(join(OLD, "data/resting-lines", `${book}.json.gz`)); b = gz(join(NEW, "data/resting-lines", `${book}.json.gz`)); } catch { continue; }
  T.works += 1;
  let zone = null; try { zone = gz(join(NEW, "data/zones", `${book}.bin`)); } catch {}
  const wordsOf = new Map(); for (const sec of (zone && zone.sections) || []) wordsOf.set(String(sec.label), sec.words || []);
  const at = (rec) => { const m = new Map(); for (const [label, units] of rec.sections || []) { const u = new Map(); for (const x of units || []) for (let j = 0; j < Math.max(1, x[1]); j += 1) u.set(x[0] + j, x); m.set(label, u); } return m; };
  const A = at(a), B = at(b);
  for (const label of new Set([...A.keys(), ...B.keys()])) {
    const ua = A.get(label) || new Map(), ub = B.get(label) || new Map();
    for (const e of new Set([...ua.keys(), ...ub.keys()])) {
      const x = ua.get(e) || null, y = ub.get(e) || null;
      if (x && y && x[0] === y[0] && x[1] === y[1] && x[2] === y[2] && x[3] === y[3]) continue;
      T.entries_moved += 1;
      const w = (wordsOf.get(label) || [])[e] || {};
      const cls = joining(w.s) ? "dagesh" : ((x && x[1] > 1) || (y && y[1] > 1)) ? "span" : "other";
      T[cls] += 1;
      if (x && y && x[2] === y[2] && x[3] !== y[3]) T.credit_only += 1;
      const ck = `${x ? x[3] : "-"} -> ${y ? y[3] : "-"}`; byCredit.set(ck, (byCredit.get(ck) || 0) + 1);
      list.push({ where: `${book} ${label} entry ${e}`, s: w.s || null, k: w.k || null, cls, was: x ? [x[2], x[3], x[1]] : null, now: y ? [y[2], y[3], y[1]] : null });
    }
  }
}
writeFileSync(OUT, JSON.stringify({ totals: T, by_credit: Object.fromEntries([...byCredit].sort((p, q) => q[1] - p[1])), moved: list }, null, 1));
console.log(JSON.stringify(T)); for (const [k, n] of [...byCredit].sort((p, q) => q[1] - p[1]).slice(0, 15)) console.log(String(n).padStart(7), k);
