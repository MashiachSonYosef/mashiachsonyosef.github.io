// Ship 8 item 1, measured off the projections: at each word carrying te (the entries of MACULA's lemma), the leader
// under "only" before (the live sidecar, no tags) and after (the new sidecar, under te). A proxy for the line; the
// round's line diff is the measure of record.
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [LIVE, OUT, RD, JSON_OUT] = process.argv.slice(2);
const { onlyLeaders } = await import(join(RD, "tools/place-leaders-v1.mjs"));
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const esc = (t) => String(t).replace(/[֐-׿]/gu, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));
const T = { books: 0, te_words: 0, several: 0, leader_moved: 0, leader_same: 0, ungraded: 0 }; const moved = []; const perBook = {};
for (const f of readdirSync(OUT).filter((f) => f.endsWith(".lattice.bin")).sort()) {
  const b = f.replace(/\.lattice\.bin$/u, "");
  const zNew = gz(join(OUT, `${b}.bin`)), sNew = gz(join(OUT, f)), sOld = gz(join(LIVE, `${b}.lattice.bin`));
  const namesSaid = !!(zNew.emitted_from && zNew.emitted_from.toggles && zNew.emitted_from.toggles.lattice && zNew.emitted_from.toggles.lattice.names);
  T.books += 1; perBook[b] = 0;
  for (const sec of zNew.sections || []) for (const w of sec.words || []) {
    if (!w.te) continue;
    T.te_words += 1; perBook[b] += 1; if (Array.isArray(w.te)) T.several += 1;
    const isName = !namesSaid || !!w.np;
    const go = sOld.grades[w.s], gn = sNew.grades[w.s];
    if (!go || !gn) { T.ungraded += 1; continue; }
    const a = onlyLeaders(go, null, isName), z = onlyLeaders(gn, [].concat(w.te), isName);
    const ta = a.l ? a.l[0] : a.la ? a.la[0] : null, tz = z.l ? z.l[0] : z.la ? z.la[0] : null;
    if (ta === tz) { T.leader_same += 1; continue; }
    T.leader_moved += 1;
    moved.push({ book: b, ref: sec.label, s: esc(w.s), te: w.te, before: ta, before_by: a.l ? a.l[4] : a.la ? a.la[4] : null, after: tz, after_by: z.l ? z.l[4] : z.la ? z.la[4] : null });
  }
}
writeFileSync(JSON_OUT, JSON.stringify({ totals: T, perBook, moved }, null, 1));
console.log(JSON.stringify(T)); for (const m of moved.slice(0, 400)) console.log(`${m.book} ${m.ref}: «${m.before}» (${m.before_by}) -> «${m.after}» (${m.after_by})  [${[].concat(m.te).join(" ")}]`);
