// read-only (23 November 2026): every leader baked at a kind of place (a lattice sidecar's grades[surface].e) that
// differs between main and the sandbox, book by book, with every place of the book whose word stands at that kind of
// place. Usage: node leaders-diff-19.mjs <before reader> <after reader> <out.json>
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [B, A, OUT] = process.argv.slice(2);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const { placeTags } = await import(join(A, "tools", "entry-gate-v1.mjs"));
const { leadersKey } = await import(join(A, "tools", "place-leaders-v1.mjs"));
const J = (x) => JSON.stringify(x ?? null);
const out = [];
for (const f of readdirSync(join(A, "data", "zones")).filter((x) => x.endsWith(".lattice.bin")).sort()) {
  const book = f.replace(".lattice.bin", "");
  const a = gz(join(B, "data", "zones", f)).grades || {}, b = gz(join(A, "data", "zones", f)).grades || {};
  const zone = gz(join(A, "data", "zones", `${book}.bin`)), side = gz(join(A, "data", "zones", f));
  const anyNames = !!side.names;
  for (const s of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const ea = (a[s] || {}).e || {}, eb = (b[s] || {}).e || {};
    for (const k of new Set([...Object.keys(ea), ...Object.keys(eb)])) {
      if (J(ea[k]) === J(eb[k])) continue;
      const places = [];
      for (const sec of zone.sections || []) (sec.words || []).forEach((w, e) => { if (!w.mark && w.s === s && leadersKey(placeTags(w), !anyNames || !!w.np) === k) places.push(`${sec.label} word ${e + 1}`); });
      out.push({ book, surface: s, key: (b[s] || a[s]).k, kind: k, own: (b[s] || a[s]).o ? (b[s] || a[s]).o.l : null, before: ea[k] || null, after: eb[k] || null, places });
    }
  }
}
writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
console.log(`${out.length} leaders at a kind of place differ`);
for (const x of out) console.log(`${x.book} ${x.surface} (${x.key}) at ${x.kind}: ${J(x.before && x.before.l && x.before.l[0])} -> ${J(x.after && x.after.l && x.after.l[0])} · surface's own ${J(x.own && x.own[0])} · ${x.places.join(", ")}`);
