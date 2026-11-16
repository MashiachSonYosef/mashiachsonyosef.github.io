// Span rows graded otherwise: does STEP's own tag (TAHOT's Strong's number on each word's core, in the zone) name
// one entry over every word of the run (a name or one dictionary entry at this place), or several?
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const [J, ZD] = process.argv.slice(2);
const zones = new Map();
const verse = (book, ref) => {
  if (!zones.has(book)) {
    const z = JSON.parse(gunzipSync(readFileSync(`${ZD}/${book}.bin`)).toString("utf8"));
    const m = new Map();
    for (const s of z.sections || []) { const r = String(s.unit || "").split("-").slice(-2).join(":"); m.set(r, (s.words || []).filter((w) => !w.mark)); }
    zones.set(book, m);
  }
  return zones.get(book).get(ref) || [];
};
const coreTag = (w) => { if (!w) return null; const h = w.tg ? w : (w.w || []).find((r) => r && r.tg && r.k === w.k) || (w.w || []).find((r) => r && r.tg); const t = h && h.tg; return t ? [].concat(t).map(String) : null; };
const res = new Map(); const tot = { one: 0, several: 0, none: 0 };
for (const line of readFileSync(J, "utf8").split("\n")) {
  if (!line) continue;
  const o = JSON.parse(line);
  const ws = verse(o.book, o.ref);
  const tags = o.w.map((i) => coreTag(ws[i - 1]));
  let v;
  if (tags.some((t) => !t)) v = "none";
  else { const common = tags.reduce((a, t) => a.filter((x) => t.includes(x))); v = common.length ? "one" : "several"; }
  for (const r of o.rows) {
    if (r.grade !== "otherwise") continue;
    tot[v] += 1;
    const k = `${v.padEnd(7)} ${o.key} [${tags.map((t) => (t || ["-"]).join("/")).join(" + ")}] ${(r.differs || []).map((d) => d.place + "~" + d.entry).join(" | ")}`;
    res.set(k, (res.get(k) || 0) + 1);
  }
}
console.log(JSON.stringify(tot));
for (const [k, n] of [...res].sort((a, b) => a[0].localeCompare(b[0]) || b[1] - a[1])) console.log(String(n).padStart(4), k);
