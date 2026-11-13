// The dictionary store's records of the sources the made-spaces lists name: how many of their R and D texts are
// list texts with a close, and how many hold a space before a stop and are in no list. It measures; it changes nothing.
// node dictionary-store-made-spaces.mjs <reader dir> <lists dir>
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
const [reader, lists] = process.argv.slice(2);
const dir = join(reader, "data", "dictionary-store");
const ix = JSON.parse(readFileSync(join(dir, "index.json"), "utf8"));
const byM = new Map();
for (const f of readdirSync(lists).filter((x) => x.endsWith(".jsonl"))) {
  const key = f.split(".")[0];
  const m = Object.entries(ix.m_sources).filter(([, s]) => s.key === key).map(([id]) => id);
  const map = new Map();
  for (const line of readFileSync(join(lists, f), "utf8").split("\n").filter(Boolean)) { const l = JSON.parse(line); map.set(l.text, l); }
  for (const id of m) byM.set(id, map);
  console.log(`${f}: ${map.size} lines · m ids ${m.join(", ")}`);
}
const stop = /\s[,;.:?!]/u;
const T = {};
const of = (m) => (T[m] ||= { records: 0, R: 0, D: 0, R_listed_with_a_close: 0, D_listed_with_a_close: 0, R_space_before_a_stop: 0, D_space_before_a_stop: 0, R_stop_and_not_listed: 0, D_stop_and_not_listed: 0, examples: [] });
for (const name of readdirSync(join(dir, "shards")).sort()) {
  const body = JSON.parse(gunzipSync(readFileSync(join(dir, "shards", name))).toString("utf8"));
  for (const [k, v] of Object.entries(body)) for (const r of v.records || []) {
    const map = byM.get(r.m); if (!map) continue;
    const t = of(r.m); t.records += 1;
    for (const f of ["R", "D"]) {
      const s = String(r[f] || ""); if (!s) continue;
      t[f] += 1;
      const l = map.get(s);
      if (l && l.closes.length) t[`${f}_listed_with_a_close`] += 1;
      if (stop.test(s)) { t[`${f}_space_before_a_stop`] += 1; if (!l) { t[`${f}_stop_and_not_listed`] += 1; if (t.examples.length < 6) t.examples.push(`${k} ${f}: ${s.slice(0, 140)}`); } }
    }
  }
}
console.log(JSON.stringify(T, null, 1));
