// which rows headed by a lemma give which numbers (the lemma as \u escapes on argv)
import { join } from "node:path";
const [RD, lemma] = process.argv.slice(2);
const { openRouteStore, factsOf } = await import(join(RD, "tools/gloss-store-v1.mjs"));
const { vowelForm, isPointed } = await import(join(RD, "tools/pointing-grade-v1.mjs"));
const st = openRouteStore(join(RD, "data/route-store"), { atRest: true });
const L = JSON.parse(`"${lemma}"`), vf = vowelForm(L);
const letters = [...L.normalize("NFD")].filter((c) => c >= "א" && c <= "ת").join("");
for (const r of st.routesFor(letters) || []) {
  const heads = Array.isArray(r[6]) ? r[6] : [];
  if (!heads.some((h) => typeof h === "string" && !/[\u0591-\u05AF]/u.test(h) && isPointed(h) && vowelForm(h) === vf)) continue;
  const f = factsOf(r); if (!f || !f.n) continue;
  console.log(JSON.stringify([r[3], f.n, String(r[1]).slice(0, 40), heads.slice(0, 3)]).replace(/[֐-׿]/g, (c) => "\\u" + c.charCodeAt(0).toString(16)));
}
