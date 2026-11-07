// what the whole-row rule changes for the sources with no ledger: rows, rows the old comma rule divided, pills before and after
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { openRouteStore as openOld } from "<scratchpad>/old/reader/tools/gloss-store-v1.mjs";
const S = "<scratchpad>";
const A = openOld(`${S}/old/reader/data/route-store`);   // the old reader: its readingsOf runs the comma rule for a source with no ledger
const out = {};
for (const ov of readdirSync(`${S}/old/reader/data/overlays`)) {
  const dir = `${S}/old/reader/data/overlays/${ov}/shards`; if (!existsSync(dir)) continue;
  const ix = JSON.parse(readFileSync(`${S}/old/reader/data/overlays/${ov}/index.json`, "utf8"));
  const c = { rows: 0, divided_before: 0, pills_before: 0, pills_after: 0 };
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".bin"))) {
    const body = JSON.parse(gunzipSync(readFileSync(`${dir}/${f}`)).toString("utf8"));
    for (const rows of Object.values(body)) for (const row of rows) {
      // the overlay's ids are not in the store's index: read them as unledgered
      const fake = [row[0], row[1], row[2], "M-overlay", row[4]];
      const old = A.readingsOf(fake);
      c.rows += 1; c.pills_before += old.length; c.pills_after += 1; if (old.length > 1) c.divided_before += 1;
    }
  }
  out[ov] = { ...c, sources: Object.keys(ix.m_sources || {}).length };
}
// the span store's own two sources
{
  const six = JSON.parse(readFileSync(`${S}/old/reader/data/span-store/index.json`, "utf8"));
  const own = new Set(Object.keys(six.m_sources || {}).filter((id) => !A.index.m_sources[id]));
  const c = { rows: 0, divided_before: 0, pills_before: 0, pills_after: 0, sources: own.size };
  for (const f of readdirSync(`${S}/old/reader/data/span-store`).filter((x) => x.endsWith(".json") && x !== "index.json")) {
    const b = JSON.parse(readFileSync(`${S}/old/reader/data/span-store/${f}`, "utf8"));
    const rows = Array.isArray(b.rows) ? b.rows : Array.isArray(b) ? b : Object.values(b.keys || {}).flat();
    for (const row of rows) { if (!Array.isArray(row) || !own.has(String(row[3]))) continue; const old = A.readingsOf([row[0], row[1], row[2], "M-span-own", row[4]]); c.rows += 1; c.pills_before += old.length; c.pills_after += 1; if (old.length > 1) c.divided_before += 1; }
  }
  out["span store's own"] = c;
}
console.log(JSON.stringify(out, null, 1));
