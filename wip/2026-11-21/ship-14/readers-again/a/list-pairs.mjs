// list the ketiv/qere pairs of a book as the zone holds them, with the line the page prints under each
// node list-pairs.mjs <book>
import { open, T } from "./lib.mjs";
const book = process.argv[2] || "daniel";
const { b, p } = await open(book);
const out = await p.evaluate(() => {
  const z = window.__zone;
  const plain = new Map();
  z.sections.forEach((sec) => (sec.words || []).forEach((w) => { if (w && w.k && !w.kq) plain.set(w.k, (plain.get(w.k) || 0) + 1); }));
  const rows = [];
  z.sections.forEach((sec, si) => (sec.words || []).forEach((w, wi) => {
    if (!w || !w.kq) return;
    const el = document.getElementById(`s${si}`);
    const wbs = el ? [...el.querySelectorAll(".he-text .wb")] : [];
    const kqWb = wbs.filter((x) => x.querySelector(".w [class*=kq], .w .ketiv, .w .qere"));
    rows.push({ si, wi, label: sec.label, roles: w.w.map((x) => `${x.role}:${x.k}`), plainKetiv: plain.get((w.w.find((x) => x.role === "KETIV") || {}).k) || 0, gk: w.w.map((x) => (z.gloss[x.k] ? String([].concat(z.gloss[x.k]).join("|")) : "-")), pg: w.pg ? w.pg.map((x) => x && x.k).join("+") : null, built: wbs.length, nwords: sec.words.length });
  }));
  return rows;
});
console.log("pairs:", out.length);
for (const r of out) console.log(r.si, r.label, "wi", r.wi, T(r.roles.join(" ")), "plainKetiv", r.plainKetiv, "gloss", JSON.stringify(r.gk), "pg", T(r.pg), "built", r.built, "/", r.nwords);
await b.close();
