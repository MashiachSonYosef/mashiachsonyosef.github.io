// The same question for the unabridged BDB: each highlighted word and point highlight of a record, under the
// letters of the record's first Hebrew headword.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const [BASE, OUT] = process.argv.slice(2);
const { openRouteStore } = await import(join(BASE, "tools/gloss-store-v1.mjs"));
const store = openRouteStore(join(BASE, "data/route-store"));
const atRest = openRouteStore(join(BASE, "data/route-store"), { atRest: true });
const letters = (s) => String(s).normalize("NFD").replace(/[^א-ת]/gu, "");
const ws = (s) => s.replace(/\s+/gu, " ").trim();
const unesc = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&emsp;/g, " ");
const edge = (s) => s.replace(/^[\s,;:\-—–]+/u, "").replace(/[\s,;:\-—–]+$/u, "");
const ours = (raw) => edge(ws(unesc(raw.replace(/<[^>]+>/gu, " "))));
const key = (t) => String(t).replace(/\.$/u, "").toLowerCase();
const lines = readFileSync(join(OUT, "dl-ubdb-x/unabridged-BDB-Hebrew-lexicon.csv"), "utf8").split("\n").slice(1).filter(Boolean);
const fields = JSON.parse(readFileSync(join(OUT, "m46-fields.json"), "utf8"));
const c = { fields: 0, own: 0, own_longer: 0, other_open: 0, other_shut: 0, no_key_rows: 0, not_served: 0, by: {}, by_shut: {}, no_headword: 0 }; const ex = [], exn = [];
for (const l of lines) {
  const [bid, , content] = l.split("\t");
  const i = content.indexOf("</div>"); const main = i >= 0 ? content.slice(i + 6) : content;
  const m = /<bdbheb>(.*?)<\/bdbheb>|<bdbarc>(.*?)<\/bdbarc>/u.exec(main);
  if (!m) { c.no_headword += 1; continue; }
  const k = letters((m[1] || m[2]).replace(/<[^>]+>/gu, "")); if (!k) { c.no_headword += 1; continue; }
  const seen = new Set();
  for (const [name, raw, kind] of fields[bid].fields) {
    if (kind === "opening") continue;
    const text = ours(raw); if (!text || seen.has(text)) continue; seen.add(text);
    c.fields += 1;
    const rows = store.routesWhole(k) || [];
    if (!rows.length) { c.no_key_rows += 1; continue; }
    if (rows.some((r) => String(r[3]) === "M46" && String(r[1]) === text)) { c.own += 1; continue; }
    if (rows.some((r) => String(r[3]) === "M46" && store.readingsOf(r).some((x) => key(x) === key(text)))) { c.own_longer += 1; continue; }
    const open = new Set((atRest.routesFor(k) || []).map((r) => `${r[3]}\u0001${r[0]}\u0001${r[1]}`));
    const others = rows.filter((r) => String(r[3]) !== "M46" && (String(r[1]) === text || store.readingsOf(r).some((x) => key(x) === key(text))));
    if (others.length) {
      const o = others.filter((r) => open.has(`${r[3]}\u0001${r[0]}\u0001${r[1]}`));
      if (o.length) { c.other_open += 1; c.by[o[0][3]] = (c.by[o[0][3]] || 0) + 1; } else { c.other_shut += 1; c.by_shut[others[0][3]] = (c.by_shut[others[0][3]] || 0) + 1; if (ex.length < 30) ex.push({ k, text, under: others[0][3] }); }
      continue;
    }
    c.not_served += 1; if (exn.length < 40) exn.push({ bid, k, kind, text: text.slice(0, 80) });
  }
}
writeFileSync(join(OUT, "fold-check-m46.json"), JSON.stringify({ c, ex, exn }, null, 1));
console.log(JSON.stringify(c)); console.log(JSON.stringify(ex.slice(0, 8))); console.log(JSON.stringify(exn.slice(0, 25)));
