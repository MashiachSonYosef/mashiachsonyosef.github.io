// For each span row Moses's v169 grades "otherwise": is each differing word the place's own word by the zone's
// dictionary form (hp), another word, or unknown (no hp)? Read-only probe.
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const [J, ZD] = process.argv.slice(2);
const strip = (t) => [...String(t || "").normalize("NFD")].filter((c) => (c >= "\u05D0" && c <= "\u05EA") || (c >= "\u05B0" && c <= "\u05BC") || c === "\u05C1" || c === "\u05C2" || c === "\u05C7").map((c) => c === "\u05C7" ? "\u05B8" : c).join("").replace(/\u05D5\u05B9/g, "\u05B9\u05D5");
const zones = new Map();
const unitWords = (book, ref) => {
  if (!zones.has(book)) {
    const z = JSON.parse(gunzipSync(readFileSync(`${ZD}/${book}.bin`)).toString("utf8"));
    const m = new Map();
    for (const s of z.sections || []) { const ws = (s.words || []).filter((w) => !w.mark); const r = String(s.unit || "").split("-").slice(-2).join(":"); m.set(r, ws); }
    zones.set(book, m);
  }
  return zones.get(book).get(ref) || null;
};
const out = { own: 0, another: 0, unknown: 0, rows: 0 }; const ex = { own: new Map(), another: new Map(), unknown: new Map() };
for (const line of readFileSync(J, "utf8").split("\n")) {
  if (!line) continue;
  const o = JSON.parse(line);
  const ws = unitWords(o.book, o.ref);
  for (const r of o.rows) {
    if (r.grade !== "otherwise") continue;
    out.rows += 1;
    let verdict = "own";
    for (const d of r.differs || []) {
      const zw = ws ? ws[o.w[0] - 1 + d.word - 1] : null;
      const hp = zw && zw.hp;
      let v;
      if (!hp) v = "unknown";
      else {
        // the row's whole headword, the place's words with the differing ones in the entry's form
        const whole = o.w.map((_, i) => { const dd = (r.differs || []).find((x) => x.word === i + 1); return dd ? dd.entry : (ws ? (ws[o.w[0] - 1 + i] || {}).s : ""); }).join("");
        if (strip(hp) === strip(d.entry) || strip(hp) === strip(whole)) v = "own";
        else v = "another";
      }
      if (v === "another") verdict = "another";
      else if (v === "unknown" && verdict === "own") verdict = "unknown";
      d._hp = hp || null;
    }
    out[verdict] += 1;
    const k = `${o.key} [${(r.differs || []).map((d) => `${d.place}~${d.entry} hp=${d._hp}`).join(" | ")}] ${r.class}`;
    ex[verdict].set(k, (ex[verdict].get(k) || 0) + 1);
  }
}
console.log(JSON.stringify(out));
for (const v of ["another", "own", "unknown"]) { console.log(`\n== ${v}`); for (const [k, n] of [...ex[v]].sort((a, b) => b[1] - a[1])) console.log(String(n).padStart(4), k); }
