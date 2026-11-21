// keys of a book that stand under more than one pointing as plain one-form words (candidates for finding 5), and the export menu's DOM
// node explore-forms.mjs <book> [key in latin mask to list]
import { open, T, U } from "./lib.mjs";
const [book, want] = process.argv.slice(2);
const { b, p } = await open(book);
const out = await p.evaluate(() => {
  const z = window.__zone; const by = new Map();
  const bare = (s) => String(s || "").replace(/[֑-ֽֿ֯׀׃׆]/gu, "");   // accents off, vowels kept
  z.sections.forEach((sec, si) => sec.words.forEach((w, wi) => { if (!w.k || w.kq || w.mark) return; if (!by.has(w.k)) by.set(w.k, []); by.get(w.k).push({ si, wi, label: sec.label, s: bare(w.s), tg: w.tg || null, pg: (w.pg || []).length }); }));
  const rows = [];
  for (const [k, xs] of by) { const forms = new Map(); xs.forEach((x) => { if (!forms.has(x.s)) forms.set(x.s, []); forms.get(x.s).push(x); }); const tags = new Set(xs.map((x) => String(x.tg))); if (forms.size > 1 && tags.size > 1) rows.push({ k, n: xs.length, forms: [...forms].map(([s, ys]) => ({ s, at: ys.slice(0, 3).map((y) => `${y.label}:${y.wi + 1}(${y.si})`), tg: ys[0].tg, pg: ys[0].pg })) }); }
  return rows;
});
for (const r of out) { if (want && T(r.k) !== want) continue; console.log(T(r.k), r.n, r.forms.map((f) => `${U(f.s).replace(/U\+/g, "").replace(/ /g, ".")} ${f.tg} pg${f.pg} @${f.at.join(",")}`).join(" | ")); }
const menu = await p.evaluate(async () => { const x = document.querySelector("section.seg .xp-open"); x.click(); await new Promise((r) => setTimeout(r, 600)); const sec = x.closest("section"); const m = sec.querySelector(".xp-menu") || document.querySelector(".xp-menu"); return m ? m.outerHTML.slice(0, 1800) : "no menu"; });
if (!want) console.log(menu);
await b.close();
