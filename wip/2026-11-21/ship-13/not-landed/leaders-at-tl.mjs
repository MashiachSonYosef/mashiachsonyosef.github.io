// Ship 13: at every word that gains an entry from the lattice's lemma (tl), the leader under "only" before and after.
// node leaders-at-tl.mjs <reader dir> <old zones dir> <new zones dir>
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [reader, oldDir, newDir] = process.argv.slice(2);
const { onlyLeaders } = await import(join(reader, "tools/place-leaders-v1.mjs"));
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const out = []; let same = 0, moved = 0, words = 0;
for (const f of readdirSync(newDir).filter((x) => x.endsWith(".lattice.bin")).sort()) {
  const b = f.replace(/\.lattice\.bin$/u, "");
  const zo = gz(join(oldDir, `${b}.bin`)), zn = gz(join(newDir, `${b}.bin`)), so = gz(join(oldDir, f)), sn = gz(f.startsWith("/") ? f : join(newDir, f));
  const namesRead = !!((((zn.emitted_from || {}).toggles || {}).lattice || {}).names);
  zn.sections.forEach((sec, si) => (sec.words || []).forEach((w, wi) => {
    if (w.tl === undefined) return;
    words += 1;
    const wo = zo.sections[si].words[wi];
    const isName = !namesRead || !!w.np;
    const was = onlyLeaders(so.grades[w.s], wo.tg || wo.te || null, isName), now = onlyLeaders(sn.grades[w.s], w.tg || w.te || null, isName);
    const n = (sec.words || []).slice(0, wi + 1).filter((x) => !x.mark).length;
    const t = (x) => (x.l ? `«${x.l[0]}» [${String(x.l[1]).slice(0, 28)}]` : "bare");
    const graded = !!sn.grades[w.s];
    if (JSON.stringify(was.l) === JSON.stringify(now.l) && was.nl === now.nl) { same += 1; return; }
    moved += 1;
    out.push(`${b} ${sec.label}:${n} ${w.s} · lemma ${w.tl} · ${[].concat(w.te).join(" ")}${isName ? " (a name place)" : ""}${w.pg ? " (carries pieces)" : ""}${graded ? "" : " (surface not graded)"} · ${t(was)}${was.nl ? " name leads" : ""} -> ${t(now)}${now.nl ? " name leads" : ""}`);
  }));
}
console.log(`${words} words carry tl · the leader under "only" is the same at ${same} and moves at ${moved}`);
for (const l of out) console.log("  " + l);
