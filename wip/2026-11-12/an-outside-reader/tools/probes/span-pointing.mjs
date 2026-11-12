// Whether the words the span store joins are pointed as the entry that joins them is: at every place it joins,
// the place's own words (as the text points them) set beside the pointed headwords of the leading row, and of every
// row, graded word by word with the pointing grade's own function (tools/pointing-grade-v1.mjs: cantillation off,
// a word-initial dagesh lene not a pointing). A row with no pointed headword says nothing; one whose pointed
// headwords all differ points the words otherwise.
// node span-pointing.mjs <reader dir> [--tsv out.tsv]
// Nothing is written but the table asked for. It counts; it does not judge.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const argv = process.argv.slice(2);
const ti = argv.indexOf("--tsv"); const TSV = ti >= 0 ? argv[ti + 1] : null; if (ti >= 0) argv.splice(ti, 2);
const R = argv[0];
const { vowelForm, isPointed } = await import(pathToFileURL(join(R, "tools", "pointing-grade-v1.mjs")).href);
const words = (t) => String(t).split(/[\s־]+/u).filter(Boolean);
const form = (ws) => ws.map((w) => vowelForm(w)).join(" ");
const gradeOf = (row, place) => {
  const heads = (Array.isArray(row.slots[6]) ? row.slots[6] : []).filter(isPointed);
  if (!heads.length) return "silent";
  return heads.some((h) => form(words(h)) === place) ? "same" : "otherwise";
};
const T = { places: 0, lead: { same: 0, silent: 0, otherwise: 0 }, anySame: 0, allOtherwise: 0, leadOtherwiseButAnotherSame: 0 };
const byKey = new Map(), rows = [];
for (const f of readdirSync(join(R, "data/span-store")).filter((x) => x.endsWith(".json") && x !== "index.json").sort()) {
  const book = f.replace(/\.json$/u, "");
  const zp = join(R, "data/zones", `${book}.bin`);
  if (!existsSync(zp)) continue;
  const d = JSON.parse(readFileSync(join(R, "data/span-store", f), "utf8"));
  if (!Array.isArray(d.placesList)) continue;
  const z = JSON.parse(gunzipSync(readFileSync(zp)).toString("utf8"));
  const sec = new Map((z.sections || []).map((s) => [s.label, s]));
  for (const p of d.placesList) {
    const list = (d.keys || {})[p.key] || [];
    const s = sec.get(p.ref);
    if (!list.length || !s) continue;
    // the store counts a verse's words with the scribal marks left out (the page's own numbering)
    const ws = (s.words || []).filter((w) => !w.mark).slice(p.first - 1, p.last);
    const place = form(ws.map((w) => w.s));
    const grades = list.map((r) => gradeOf(r, place));
    T.places += 1;
    T.lead[grades[0]] += 1;
    if (grades.includes("same")) T.anySame += 1;
    if (grades.every((g) => g === "otherwise")) T.allOtherwise += 1;
    if (grades[0] === "otherwise" && grades.includes("same")) T.leadOtherwiseButAnotherSame += 1;
    if (grades[0] === "otherwise") {
      const k = `${p.key}\t${list[0].slots[1]}\t${list[0].slots[3]}`;
      if (!byKey.has(k)) byKey.set(k, { n: 0, eg: `${book} ${p.ref}`, place: ws.map((w) => w.s).join(" "), heads: (list[0].slots[6] || []).filter(isPointed).join(" | ") });
      byKey.get(k).n += 1;
    }
    rows.push([book, p.ref, `${p.first}-${p.last}`, p.key, ws.map((w) => w.s).join(" "), list[0].slots[1], list[0].slots[3], grades[0], (list[0].slots[6] || []).filter(isPointed).join(" | "), grades.join(",")]);
  }
}
console.log(`${T.places} places where the span store joins words`);
console.log(`  the leading row's own pointed headword, beside the words as the text points them: the same ${T.lead.same} · it carries no pointed headword ${T.lead.silent} · pointed otherwise ${T.lead.otherwise}`);
console.log(`  some row of the key is pointed as the place is: ${T.anySame} · every row is pointed otherwise: ${T.allOtherwise} · the leading row is pointed otherwise and a later row the same: ${T.leadOtherwiseButAnotherSame}`);
console.log(`  the leading rows pointed otherwise, most places first (${byKey.size} keys):`);
for (const [k, v] of [...byKey].sort((a, b) => b[1].n - a[1].n).slice(0, 40)) { const [key, text, m] = k.split("\t"); console.log(`     ${String(v.n).padStart(4)}  ${key} · the line reads ${JSON.stringify(text.slice(0, 60))} (${m}) · the text has ${v.place} · the entry is headed ${v.heads} · first at ${v.eg}`); }
if (TSV) { writeFileSync(TSV, `${["book", "ref", "words", "key", "as the text points them", "the line reads", "m", "the leading row's pointing", "its pointed headwords", "every row's pointing"].join("\t")}\n${rows.map((r) => r.join("\t")).join("\n")}\n`); console.log(`table: ${TSV} (${rows.length} rows)`); }
