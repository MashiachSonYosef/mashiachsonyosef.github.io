// Read-only: for every card cards.mjs opened, the pills of the UBS dictionary (M18) and of the SDBH (M17) that stand on it
// by a store row whose facts name more than one Strong's number (so the entry gate, which keeps a row holding one of the
// place's numbers, cannot tell the lemma's words apart). Lists them by block and counts the cards.
// Usage: node homonym-rows.mjs <reader dir> <cards.jsonl> <out dir>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const [R, CARDS, OUT] = process.argv.slice(2);
const { openRouteStore, factsOf } = await import(join(R, "tools", "gloss-store-v1.mjs"));
const store = openRouteStore(join(R, "data", "route-store"));
const num = (t) => { const x = /^[HA]?0*(\d+)/u.exec(String(t)); return x ? `H${x[1]}` : null; };
const byKey = new Map();
const rowsOf = (k) => { if (!byKey.has(k)) byKey.set(k, (store.routesFor(k) || []).filter((r) => r[3] === "M17" || r[3] === "M18")); return byKey.get(k); };
const perBlock = new Map();
let cards = 0, cardsWith = 0, cardsOneBlockWith = 0;
for (const line of readFileSync(CARDS, "utf8").split("\n").filter(Boolean)) {
  const d = JSON.parse(line);
  cards += 1;
  const blk = (d.blocks.find((b) => b[1]) || [])[0];
  const entry = d.card.ds && d.card.ds.entry ? String(d.card.ds.entry).split(/[ ,]+/u).map(num).filter(Boolean) : [];
  if (!blk || !entry.length) continue;
  const rows = rowsOf(blk);
  const hits = [];
  for (const p of d.card.pills) {
    const by = p[1].split(" ");
    for (const m of ["M17", "M18"]) {
      if (!by.includes(m)) continue;
      const row = rows.find((r) => r[3] === m && String(r[1]).replace(/\.$/u, "").split("/").map((x) => x.trim()).filter(Boolean).join(" + ") === p[0]);
      if (!row) continue;
      const f = factsOf(row); const ns = f && Array.isArray(f.n) ? [...new Set(f.n.map(num).filter(Boolean))] : [];
      if (ns.length > 1 && ns.some((n) => !entry.includes(n))) hits.push([m, p[0], ns.join(",")]);
    }
  }
  if (hits.length) {
    cardsWith += 1; if (d.blocks.length === 1) cardsOneBlockWith += 1;
    const k = `${blk}\t${entry.join(",")}`;
    const e = perBlock.get(k) || { cards: 0, first: `${d.label} w${d.wordNo} ${d.he} «${d.now[1]}»`, pills: new Map() };
    e.cards += 1; for (const h of hits) e.pills.set(`${h[0]}: ${h[1].slice(0, 70)}`, h[2]);
    perBlock.set(k, e);
  }
}
const out = ["block\tplace_entry\tcards\tfirst_place\trow_numbers\tpills_of_rows_naming_several_numbers"];
for (const [k, e] of [...perBlock].sort((a, b) => b[1].cards - a[1].cards)) out.push(`${k}\t${e.cards}\t${e.first}\t${[...new Set(e.pills.values())].join(" ")}\t${[...e.pills.keys()].join(" | ")}`);
writeFileSync(join(OUT, "ubs-sdbh-rows-of-several-numbers.tsv"), out.join("\n") + "\n");
console.log(JSON.stringify({ cards, cards_with_such_pills: cardsWith, of_them_one_block: cardsOneBlockWith, blocks: perBlock.size }));
