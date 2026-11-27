// Scratch (fourth cut): the one-line function proposed for reader/place.html, run here on the tag files with
// stand-ins for the page's helpers (el, he, rd, tidy), to see that it runs and what it prints. Not the page.
import { readFileSync, readdirSync } from "node:fs"; import { gunzipSync } from "node:zlib"; import { join } from "node:path";
const P = process.argv[2]; const want = process.argv.slice(3);
const el = (tag, cls, ...kids) => kids.join(""); const he = (s) => s; const rd = (s) => s; const tidy = (s) => String(s).replace(/\s+/g, " ").trim();
function unabridgedFirst(hd, several) {
  const its = hd.head.italics || [];
  const of = (kind) => its.filter((x) => x.kind === kind).map((x) => tidy(x.t));
  const main = of("main_gloss"), open = of("opening");
  // italic runs the file does not class as a grammar word, a word of another language, a verse's wording, an
  // abbreviation or an outline letter: printed as they stand, as the record's italics, with no claim of what they are
  const SKIP = ["main_gloss", "opening", "grammar_word", "other_language", "verse_wording", "abbreviation", "outline_letter"];
  const plain = [...new Set(its.filter((x) => !SKIP.includes(x.kind)).map((x) => tidy(x.t)))];
  const q = (list) => list.map((x) => `«${x}»`).join(", ");
  const said = main.length ? [rd(q(main))]
    : open.length ? [rd(q(open))]
    : plain.length ? [el("span", "gap", "in italics in the record: "), rd(q(plain.slice(0, 3))), plain.length > 3 ? el("span", "gap", ` … (${plain.length})`) : ""]
    : (hd.head.bold || []).length ? [el("span", "gap", `(no meaning in italics; in bold: ${hd.head.bold.map((x) => tidy(x.t)).join(", ")})`)]
    : [el("span", "gap", "(its opening carries no meaning in italics)")];
  return [hd.head.headword ? he(hd.head.headword.t) : "", " ", ...said, several ? el("span", "gap", ` (${hd.language === "BIBLICAL ARAMAIC" ? "Biblical Aramaic" : "Biblical Hebrew"})`) : ""];
}
let n = 0, changed = 0; const seen = new Set();
for (const f of readdirSync(join(P, "entries", "t"))) { const F = JSON.parse(gunzipSync(readFileSync(join(P, "entries", "t", f))).toString("utf8")); for (const [id, hd] of Object.entries(F.unabridged)) { if (seen.has(id)) continue; seen.add(id); n += 1; const line = unabridgedFirst(hd, true).join(""); if (line.includes("in italics in the record: ")) changed += 1; if (want.includes(id)) console.log(id, line); } }
console.log(`${n} records; the proposed line says «in italics in the record» at ${changed}`);
