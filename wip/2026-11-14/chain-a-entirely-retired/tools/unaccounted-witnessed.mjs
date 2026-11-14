// The corpus lane's witnessed orders (data/witnessed-orders-v2.7): every shipped reading no served row accounts for,
// and whether it is a piece the retired comma rule would have cut from a row of that key (at a comma or a semicolon
// outside brackets), or something else (a row struck, re-keyed or retexted since). It measures; it changes nothing.
// node unaccounted-witnessed.mjs <reader dir>
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const R = process.argv[2];
const { openRouteStore, readingKey } = await import(pathToFileURL(join(R, "tools", "gloss-store-v1.mjs")).href);
const store = openRouteStore(join(R, "data", "route-store"));
const FROM = join(R, "data", "witnessed-orders-v2.7");
// the retired cut: pieces at a comma or a semicolon with no bracket open
const cutOld = (text) => {
  const out = []; let depth = 0, cur = "";
  for (const ch of String(text)) {
    if (ch === "(" || ch === "[") depth += 1;
    if ((ch === ")" || ch === "]") && depth > 0) depth -= 1;
    if ((ch === "," || ch === ";") && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
};
const totals = { shipped: 0, unaccounted: 0, piece_of_the_old_cut: 0, other: 0 };
const byOrder = {}, examples = { piece_of_the_old_cut: [], other: [] };
for (const f of readdirSync(FROM).filter((x) => x.endsWith(".bin")).sort()) {
  const book = f.slice(0, -4);
  const shipped = JSON.parse(gunzipSync(readFileSync(join(FROM, f))).toString("utf8"));
  for (const [order, c] of Object.entries(shipped.columns || {})) {
    for (const [k, text] of Object.entries(c.entries || {})) {
      if (typeof text !== "string" || !text) continue;
      totals.shipped += 1;
      const M = (c.m_entries || {})[k];
      const ids = M && Array.isArray(M.by) ? M.by : M && M.m ? store.mIdsOfLabel(M.m) : null;
      if (store.rowOfText(k, text, ids)) continue;
      totals.unaccounted += 1;
      const want = readingKey(text);
      const rows = (store.routesFor(k) || []).filter((r) => store.index.m_sources[r[3]]);
      const piece = rows.find((r) => cutOld(r[1]).length > 1 && cutOld(r[1]).some((p) => readingKey(p) === want));
      const kind = piece ? "piece_of_the_old_cut" : "other";
      totals[kind] += 1;
      byOrder[`${order}: ${kind}`] = (byOrder[`${order}: ${kind}`] || 0) + 1;
      if (examples[kind].length < 8) examples[kind].push(`${book} «${k}» ${order}: «${text}»${piece ? ` — a piece of ${piece[3]}'s «${String(piece[1]).slice(0, 70)}»` : ""}`);
    }
  }
}
console.log(JSON.stringify(totals));
for (const [k, n] of Object.entries(byOrder).sort()) console.log(`${String(n).padStart(6)}  ${k}`);
for (const [kind, list] of Object.entries(examples)) { console.log(`\n${kind}:`); for (const e of list) console.log(`  ${e}`); }
