// For the card pills cards-explain could not explain, and for every pill whose place in the card's order moved: each
// row under the word's key that prints it, live and ship: its source, whether it rests shut, its facts (entry, name),
// and whether a ship 4 round put it there. usage: node cards-deep.mjs <cards-explain.json> <live reader> <ship reader>
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [CE, LIVE_RD, RD] = process.argv.slice(2);
const ce = JSON.parse(readFileSync(CE, "utf8"));
const { openRouteStore, readingKey, factsOf } = await import(join(RD, "tools/gloss-store-v1.mjs"));
const ship = openRouteStore(join(RD, "data/route-store"), { atRest: true });
const { openRouteStore: openLive } = await import(join(LIVE_RD, "tools/gloss-store-v1.mjs"));
const live = openLive(join(LIVE_RD, "data/route-store"));
const whole = (st, k) => ((st.routesWhole ? st.routesWhole(k) : st.routesFor(k)) || []);
const rk = (t) => readingKey(String(t || "")).replace(/\s+/gu, " ").trim();
const rec = JSON.parse(readFileSync(join(RD, "data/row-strikes-v1.json"), "utf8"));
const touched = new Map();
for (const r of rec.rounds || []) { const f = String((r.list && r.list.file) || ""); if (!/v188|call5/u.test(f)) continue; for (const x of r.rows || []) touched.set(`${x.m}\u0000${rk(x.route)}`, `${/v188/u.test(f) ? "v188" : "call5"} ${x.action}`); }
const forms = (t) => { const s = String(t).replace(/^\*/u, "").trim(); const m = /^(.*?) \((.*)\)$/u.exec(s); return m ? [s, m[1], m[2]] : [s]; };
const show = (key, p) => {
  const ts = forms(p).map(rk);
  const say = (st, tag, atRest) => whole(st, key).map((r, i) => [r, i]).filter(([r]) => ts.includes(rk(r[1])) || st.readingsOf(r).some((x) => ts.includes(rk(x))))
    .map(([r, i]) => { const f = factsOf(r) || {}; return `${tag}#${i} ${r[3]} ${JSON.stringify(r[1]).slice(0, 40)}${atRest && st.restsOff(r) ? " SHUT" : ""}${f.n ? " n=" + JSON.stringify(f.n) : ""}${f.name ? " NAME" : ""}${touched.has(`${r[3]}\u0000${rk(r[1])}`) ? " [" + touched.get(`${r[3]}\u0000${rk(r[1])}`) + "]" : ""}`; });
  return [...say(live, "live", false), ...say(ship, "ship", true)].join(" · ");
};
const seen = new Set();
for (const c of ce.cards) {
  if (seen.has(`${c.key} ${JSON.stringify(c.only_old)}`)) continue; seen.add(`${c.key} ${JSON.stringify(c.only_old)}`);
  for (const [p, v] of [...c.only_old, ...c.only_new]) if (v === "UNEXPLAINED") console.log(`${c.card} «${p}»: ${show(c.key, p)}`);
  if (!c.order_kept) {
    const o = c.order.old, n = c.order.new;
    const moved = o.filter((x, i) => n.indexOf(x) !== i);
    console.log(`ORDER ${c.card}: moved ${moved.slice(0, 4).map((x) => `«${x}»`).join(" ")}`);
    for (const x of moved.slice(0, 3)) console.log(`   «${x}»: ${show(c.key, x)}`);
  }
}
