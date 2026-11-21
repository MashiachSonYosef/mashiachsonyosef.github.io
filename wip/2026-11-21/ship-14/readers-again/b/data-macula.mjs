// Read-only data scan: words whose pieces (pg) carry s:"macula", per book (reads the served zone files, writes nothing).
// node data-macula.mjs [book ...]
import fs from "node:fs"; import zlib from "node:zlib";
const DIR = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s13/reader/data/zones";
const books = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(DIR).filter((f) => f.endsWith(".bin")).map((f) => f.replace(/\.bin$/u, ""));
let total = 0, mixed = 0, pairs = 0; const out = [];
for (const bk of books) {
  let j; try { const raw = fs.readFileSync(`${DIR}/${bk}.bin`); j = JSON.parse((raw[0] === 0x1f ? zlib.gunzipSync(raw) : raw).toString("utf8")); } catch (e) { out.push(`${bk}: unreadable (${e.message.slice(0, 60)})`); continue; }
  for (const s of j.sections || []) (s.words || []).forEach((w, i) => {
    const sides = [["", w.pg]]; if (w.kq) for (const side of ["k", "q"]) if (w.kq[side] && Array.isArray(w.kq[side].pg)) sides.push([`kq.${side}`, w.kq[side].pg]);
    for (const [where, pg] of sides) if (Array.isArray(pg) && pg.some((x) => x && x.s === "macula")) {
      total++; const all = pg.every((x) => x && x.s === "macula"); if (!all) mixed++; if (w.kq) pairs++;
      out.push(`${bk} ${s.label} word ${i} (0-based)${where ? " " + where : ""} pieces=${pg.length} pair=${w.kq ? "yes" : "no"} all-macula=${all} g=${JSON.stringify(pg.map((x) => x.g))}`);
    }
  });
}
console.log(out.join("\n")); console.log("total", total, "of which mixed with another source", mixed, "on pairs", pairs);
