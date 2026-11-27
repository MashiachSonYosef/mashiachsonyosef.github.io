// Read-only: walks every shard of the route store once and counts, by source, rows whose route text shows the marks this
// reader met on cards: an empty round bracket "( )", a route that closes a bracket it never opened or opens one it never closes,
// and (for the UBS dictionary and the SDBH) rows whose facts name more than one Strong's number.
// Usage: node scan-store.mjs <reader dir> <out dir>
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [R, OUT] = process.argv.slice(2);
const dir = join(R, "data", "route-store");
const index = JSON.parse(readFileSync(join(dir, "index.json"), "utf8"));
const { factsOf } = await import(join(R, "tools", "gloss-store-v1.mjs"));
const label = (m) => (index.m_sources[m] ? index.m_sources[m].key : m);
const C = {};
const bump = (m, k, ex) => { const s = (C[label(m)] ||= {}); const c = (s[k] ||= { n: 0, ex: [] }); c.n += 1; if (c.ex.length < 5) c.ex.push(ex); };
let rows = 0, files = 0;
const walk = (d) => {
  for (const name of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, name.name);
    if (name.isDirectory()) { walk(p); continue; }
    if (name.name === "index.json" || !/\.(json|gz|bin)$/u.test(name.name)) continue;
    let text;
    try { const buf = readFileSync(p); text = (buf[0] === 0x1f && buf[1] === 0x8b ? gunzipSync(buf) : buf).toString("utf8"); } catch { continue; }
    let data; try { data = JSON.parse(text); } catch { continue; }
    files += 1;
    const each = (key, list) => {
      if (!Array.isArray(list)) return;
      for (const r of list) {
        if (!Array.isArray(r)) continue;
        rows += 1;
        const m = String(r[3]), t = String(r[1] ?? "");
        bump(m, "rows", "");
        if (/\(\s+\)/u.test(t)) bump(m, "empty_round_bracket", `${key}: ${t.slice(0, 80)}`);
        if (t.includes("/")) bump(m, "slash_in_route", `${key}: ${t.slice(0, 90)}`);
        if (/[A-Za-z]\/[A-Za-z]/u.test(t)) bump(m, "slash_between_letters", `${key}: ${t.slice(0, 90)}`);
        const open = (t.match(/\(/gu) || []).length, close = (t.match(/\)/gu) || []).length;
        if (open !== close) bump(m, "round_brackets_unpaired", `${key}: ${t.slice(0, 80)}`);
        const f = factsOf(r);
        if (f && Array.isArray(f.n) && new Set(f.n).size > 1) bump(m, "more_than_one_number", `${key}: ${t.slice(0, 50)} ${f.n.join(",")}`);
        if (f && Array.isArray(f.n) && f.n.length) bump(m, "numbered", "");
      }
    };
    if (Array.isArray(data)) for (const e of data) { if (Array.isArray(e) && typeof e[0] === "string") each(e[0], e[1]); }
    else if (data && typeof data === "object") for (const [k, v] of Object.entries(data.keys || data.routes || data)) each(k, v);
  }
};
walk(dir);
writeFileSync(join(OUT, "store-scan.json"), JSON.stringify({ files, rows, by_source: C }, null, 1));
console.log("files", files, "rows", rows);
for (const [s, v] of Object.entries(C)) {
  const line = Object.entries(v).filter(([k]) => k !== "rows").map(([k, c]) => `${k} ${c.n}`).join(" · ");
  if (/strongs|ubs|sdbh|bdb|tahot|tbesh|macula|davidson|lexical|uhal|biblicaltools/u.test(s)) console.log(s, "rows", v.rows.n, "·", line);
}
