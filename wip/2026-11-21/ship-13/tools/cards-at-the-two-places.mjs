// Ship 13: the card at each of the two places whose resting line moves, as the page rests.
// node cards-at-the-two-places.mjs <reader dir> [book@verse@word ...]
import path from "node:path";
import fs from "node:fs";
import zlib from "node:zlib";
import { pathToFileURL } from "node:url";
const TREE = process.argv[2];
const imp = (f) => import(pathToFileURL(path.join(TREE, "tools", f)).href);
const { readCards } = await imp("card-readings-v1.mjs");
const { loadPlaywright, launchOptions } = await imp("playwright-v1.mjs");
const { serveTree } = await imp("serve-tree-v1.mjs");
const want = (process.argv.slice(3).length ? process.argv.slice(3) : ["genesis@14:17@9", "psalms@10:10@5"]).map((s) => { const [book, ref, n] = s.split("@"); return { book, ref, n: Number(n) }; });
const zone = (book) => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(TREE, "data", "zones", `${book}.bin`))));
const tree = await serveTree(TREE);
const pw = await loadPlaywright();
const browser = await pw.chromium.launch(launchOptions());
try {
  for (const r of want) {
    const z = zone(r.book);
    const si = z.sections.findIndex((s) => String(s.label) === r.ref);
    const sec = z.sections[si];
    let n = 0, at = -1;
    sec.words.forEach((w, i) => { if (!w.mark) { n += 1; if (n === r.n) at = i; } });
    const w = sec.words[at];
    console.log(`\n== ${r.book} ${r.ref} word ${r.n} · ${w.s} · tg ${JSON.stringify(w.tg ?? null)} te ${JSON.stringify(w.te ?? null)} · pg ${JSON.stringify((w.pg || []).map((p) => [p.k, p.g, p.s, p.r]))}${w.w ? ` · halves ${JSON.stringify(w.w.map((x) => [x.role, x.k, x.tg ?? null]))}` : ""}`);
    const cards = await readCards(browser, tree.base, r.book, "rest", { from: si, to: si + 1 });
    const card = ((cards.sections[0] || {}).cards || []).find((c) => c.e === at);
    if (!card) { console.log("  no card"); continue; }
    console.log("  divisions", JSON.stringify(card.divisions), "blocks", JSON.stringify(card.blocks));
    console.log("  here", JSON.stringify((card.here || []).map((h) => [h[0], h[1], h[2]])));
    for (const q of card.pills.slice(0, 12)) console.log(`   ${q[3] ? "PRESSED" : "       "} «${q[0]}» by ${q[2]} · ${String(q[1]).slice(0, 100)}`);
    console.log("  pills", card.pills.length, Object.keys(card).filter((k) => !["pills", "here", "divisions", "blocks", "e"].includes(k)).map((k) => `${k}: ${JSON.stringify(card[k]).slice(0, 160)}`).join(" · "));
  }
} finally { await browser.close(); await tree.close(); }
