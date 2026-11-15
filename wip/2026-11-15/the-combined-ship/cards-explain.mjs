// The gate's S2 card differences, each pill read under its word's own key: a pill only the old card carries is one
// whose every row rests shut now (the kinds) or that no row prints any more; a pill only the new card carries is one a
// row relay v188 landed prints. usage: node cards-explain.mjs <gate-diff.txt> <live reader> <ship reader> <out.json>
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [DIFF, LIVE_RD, RD, OUT] = process.argv.slice(2);
const { openRouteStore, readingKey } = await import(join(RD, "tools/gloss-store-v1.mjs"));
const ship = openRouteStore(join(RD, "data/route-store"), { atRest: true });
const { openRouteStore: openLive } = await import(join(LIVE_RD, "tools/gloss-store-v1.mjs"));
const live = openLive(join(LIVE_RD, "data/route-store"));
const whole = (st, k) => ((st.routesWhole ? st.routesWhole(k) : st.routesFor(k)) || []);
const rk = (t) => readingKey(String(t || "")).replace(/\s+/gu, " ").trim();
const rec = JSON.parse(readFileSync(join(RD, "data/row-strikes-v1.json"), "utf8"));
const landed = new Set(), moved5 = new Set();
for (const r of rec.rounds || []) { const f = String((r.list && r.list.file) || ""); for (const x of r.rows || []) { if (/v188/u.test(f) && x.action === "land") landed.add(`${x.key}\u0000${x.m}\u0000${rk(x.route)}`); if (/call5/u.test(f) && x.action === "re-key") moved5.add(`${x.m}\u0000${rk(x.route)}`); } }
const zones = new Map();
const zoneOf = (book) => { if (!zones.has(book)) { const b = readFileSync(join(RD, "data/zones", `${book}.bin`)); let z; try { z = JSON.parse(gunzipSync(b).toString("utf8")); } catch { z = JSON.parse(b.toString("utf8")); } zones.set(book, z); } return zones.get(book); };
// a pill's text as the card prints it: a pointer pill reads «English (the row's own words)»; take the row's words too
const forms = (t) => { const s = String(t).replace(/^\*/u, "").trim(); const m = /^(.*?) \((.*)\)$/u.exec(s); return m ? [s, m[1], m[2]] : [s]; };
const keysOf = (w) => [w.k, ...((w.pg || []).map((p) => p.k))].filter(Boolean);
const out = { cards: [], tally: {} };
const text = readFileSync(DIFF, "utf8");
for (const blk of text.split(/\n(?=== )/u)) {
  const head = /^== (\S+) (\d+) card (\d+)/u.exec(blk); if (!head) continue;
  const [book, ch, card] = [head[1], head[2], Number(head[3])];
  const line = (tag) => { const m = new RegExp(`^\\s*${tag}: ?(.*)$`, "mu").exec(blk); return m && m[1].trim() ? m[1].split(" | ") : []; };
  const oldOnly = line("only old"), newOnly = line("only new"), oldAll = line("old"), newAll = line("new");
  const z = zoneOf(book);
  // the gate's S2 opens the first cards of the book's first verse on every chapter page it samples (task 112)
  const sec = z.sections[0];
  // a card is a word's cell: the marks between words are not cards
  const w = sec && sec.words.filter((x) => !x.mark)[card - 1];
  const keys = w ? keysOf(w) : [];
  const verdict = (p, side) => {
    for (const t of forms(p)) {
      const tk = rk(t);
      for (const k of keys) {
        const rowsS = whole(ship, k).filter((r) => rk(r[1]) === tk || ship.readingsOf(r).some((x) => rk(x) === tk));
        if (side === "old") {
          if (rowsS.length && rowsS.every((r) => ship.restsOff(r))) return "kinds: every row that prints it rests shut";
          if (!rowsS.length && whole(live, k).some((r) => rk(r[1]) === tk)) return "the store no longer prints it";
        } else {
          if (rowsS.some((r) => landed.has(`${k}\u0000${r[3]}\u0000${rk(r[1])}`))) return "v188 landed a row that prints it";
          if (rowsS.some((r) => moved5.has(`${r[3]}\u0000${rk(r[1])}`))) return "call 5 moved a row that prints it to this key";
        }
      }
    }
    return "UNEXPLAINED";
  };
  // the same reading on both cards, printed in another hand (the first carrier that prints it changed)
  const sameReading = (p, list) => list.some((q) => rk(q.replace(/^\*/u, "")) === rk(p.replace(/^\*/u, "")));
  const printedBy = (p, side) => { const v = verdict(p, side); return v === "UNEXPLAINED" && sameReading(p, side === "old" ? newOnly : oldOnly) ? "the same reading, printed now by another of its carriers" : v; };
  const o = oldOnly.map((p) => [p, printedBy(p, "old")]), n = newOnly.map((p) => [p, printedBy(p, "new")]);
  // the order of the pills both carry
  const both = oldAll.map((x) => x.replace(/^\*/u, "")).filter((x) => newAll.map((y) => y.replace(/^\*/u, "")).includes(x));
  const bothNew = newAll.map((x) => x.replace(/^\*/u, "")).filter((x) => both.includes(x));
  const orderKept = JSON.stringify(both) === JSON.stringify(bothNew);
  for (const [, v] of [...o, ...n]) out.tally[v] = (out.tally[v] || 0) + 1;
  if (!orderKept) out.tally["order changed"] = (out.tally["order changed"] || 0) + 1;
  out.cards.push({ card: `${book} ${ch} card ${card}`, key: w ? w.k : null, only_old: o, only_new: n, order_kept: orderKept, order: orderKept ? null : { old: both.slice(0, 12), new: bothNew.slice(0, 12) } });
}
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.tally));
for (const c of out.cards) for (const [p, v] of [...c.only_old, ...c.only_new]) if (v === "UNEXPLAINED") console.log("UNEXPLAINED", c.card, JSON.stringify(p));
for (const c of out.cards) if (!c.order_kept) console.log("ORDER", c.card, "old:", c.order.old.slice(0, 6).join(" | "), "|| new:", c.order.new.slice(0, 6).join(" | "));
