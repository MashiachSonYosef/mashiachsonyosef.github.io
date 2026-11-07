// MEASURE: under "only this pointing", with the line's carriers switched off, does the baked alternate name a row the filter withholds?
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { openRouteStore } from "../pt/reader/tools/gloss-store-v1.mjs";
import { fnv1a } from "../pt/reader/tools/lattice-lib-v1.mjs";
const store = openRouteStore("data/route-store");
const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/, "");
const tot = { surfaces: 0, graded_with_alt: 0, alt_withheld: 0, alt_kept: 0, alt_unmapped: 0, name_led: 0, ol_differs_from_table: 0, no_ol: 0 };
const examples = [];
for (const f of readdirSync("data/zones")) {
  if (!f.endsWith(".lattice.bin")) continue;
  const book = f.replace(".lattice.bin", "");
  if (!existsSync(`data/zones/${book}.bin`)) continue;
  const z = JSON.parse(gunzipSync(readFileSync(`data/zones/${book}.bin`)).toString("utf8"));
  const lat = JSON.parse(gunzipSync(readFileSync(`data/zones/${book}.lattice.bin`)).toString("utf8"));
  for (const [s, gr] of Object.entries(lat.grades || {})) {
    tot.surfaces += 1;
    const k = gr.k; const gm = z.gloss_m && z.gloss_m[k]; const line = z.gloss && z.gloss[k];
    if (!gr.o || !("l" in gr.o)) continue;
    const ol = gr.o.l;
    if (!ol) tot.no_ol += 1;
    const nl = !!gr.nl && z.gloss_names && Object.prototype.hasOwnProperty.call(z.gloss_names, k) && z.gloss[k] === z.gloss_names[k];
    if (nl) tot.name_led += 1;
    if (ol && line && !nl && spanJoin(ol[0]).toLowerCase() !== spanJoin(line).toLowerCase()) tot.ol_differs_from_table += 1;
    if (!gm || !gm.alt) continue;
    tot.graded_with_alt += 1;
    const alt = gm.alt;
    const row = store.rowOfText(k, alt.text, alt.by || null);
    if (!row) { tot.alt_unmapped += 1; continue; }
    const src = store.index.m_sources[row[3]];
    const fps = (lat.routes && lat.routes[k] && lat.routes[k].f) || [];
    const ix = fps.indexOf(fnv1a(`${row[1]}|${src.label}`));
    const g = ix >= 0 ? gr.g[ix] : "-";
    const attested = [...gr.g].includes("m");
    if (attested && g === "x") { tot.alt_withheld += 1; if (examples.length < 12) examples.push(`${book} ${s} line «${line}» alt «${alt.text}» (${row[3]}) graded x`); }
    else tot.alt_kept += 1;
  }
}
console.log(JSON.stringify(tot, null, 1));
for (const e of examples) console.log(e);
