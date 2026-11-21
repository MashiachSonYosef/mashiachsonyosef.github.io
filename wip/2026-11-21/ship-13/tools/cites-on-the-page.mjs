// Ship 13: the card of a book's first word under «cites here», as check-lattice-orders-v1 presses it: the pills in order.
// node cites-on-the-page.mjs <reader dir> <book>
import path from "node:path";
import { pathToFileURL } from "node:url";
const TREE = process.argv[2], BOOK = process.argv[3] || "amos";
const imp = (f) => import(pathToFileURL(path.join(TREE, "tools", f)).href);
const { loadPlaywright, launchOptions } = await imp("playwright-v1.mjs");
const { serveTree } = await imp("serve-tree-v1.mjs");
const tree = await serveTree(TREE);
const pw = await loadPlaywright();
const b = await pw.chromium.launch(launchOptions());
try {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  await p.addInitScript(() => { try { localStorage.setItem("fh.def.order", "oldest"); localStorage.setItem("fh.pointing-stands-2026-11-06", "1"); localStorage.setItem("fh.masorah", "keep"); } catch (e) { /* no storage */ } });
  await p.goto(`${tree.base}/zone.html?b=${BOOK}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb");
  await p.waitForTimeout(600);
  await p.evaluate(() => { const wb = document.querySelector("section.seg .he-text .wb"); (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click(); });
  await p.waitForTimeout(1500);
  const read = () => p.evaluate(() => { const h = document.querySelector("#hud"); return [...h.querySelectorAll(".r-pills button")].map((x) => x.textContent.trim()); });
  const base = await read();
  await p.evaluate(() => { const r = document.getElementById("rail"); if (r && !r.open) r.open = true; });
  const ok = await p.evaluate(() => { const btn = [...document.querySelectorAll("#defRow .dfp, .def-order .dfp")].find((x) => x.dataset.id === "cites" || x.textContent.trim() === "cites here"); if (!btn || btn.disabled) return false; btn.click(); return true; });
  await p.waitForFunction(() => !!window.__latticeStore, null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(1200);
  const now = await read();
  const state = await p.evaluate(() => { const wb = document.querySelector("section.seg .he-text .wb.active"); const surface = wb ? wb.querySelector(".w").textContent.trim() : null; const s = window.__latticeStore; const gr = s && surface ? s.grades[surface] : null; return { surface, n: gr ? gr.n : null, v: gr && gr.v ? Object.keys(gr.v).slice(0, 4) : null, oc: gr ? gr.o.c : null, masorah: window.__masorah || null, line: wb ? wb.querySelector(".g").textContent.trim() : null }; });
  console.log("pressed", ok, JSON.stringify(state));
  console.log("oldest first:", base.slice(0, 6).join(" | "), "…", base.length);
  console.log("cites here:  ", now.slice(0, 8).join(" | "), "…", now.length);
  console.log("with «word»:", now.map((t, i) => [i, t]).filter(([, t]) => /word/i.test(t)).map(([i, t]) => `${i}:${t}`).join(" | "));
  for (const t of ["[the] words of", "words", "Dibri"]) console.log(`  «${t}» stands at ${base.indexOf(t)} oldest first, ${now.indexOf(t)} under cites here`);
} finally { await b.close(); await tree.close(); }
