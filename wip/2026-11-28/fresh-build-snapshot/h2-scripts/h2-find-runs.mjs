// Scratch (builder H2): which verses of a chapter hold a run the line reads whole (a cell with a key) or a chain.
// node h2-find-runs.mjs <site root> <book> <chapter>
import { join } from "node:path";
const [SITE, BOOK, CH] = process.argv.slice(2);
const { serveTree } = await import(join(SITE, "reader", "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(SITE, "reader", "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright(); const tree = await serveTree(SITE); const browser = await pw.chromium.launch(launchOptions());
try {
  const page = await (await browser.newContext({ viewport: { width: 412, height: 915 } })).newPage();
  await page.goto(`${tree.base}/reader/zone.html?b=${BOOK}&maqaf=maqaf`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => typeof window.__materialise === "function", null, { timeout: 60000 });
  const got = await page.evaluate(async (ch) => { const all = [...document.querySelectorAll("section.seg")]; const idx = all.map((s, i) => (s.__sec && String(s.__sec.label).startsWith(`${ch}:`) ? i : -1)).filter((i) => i >= 0); window.__materialise(idx[0], idx[idx.length - 1] + 1); await new Promise((r) => setTimeout(r, 800)); const out = { runs: [], chains: [] }; for (const i of idx) { const s = all[i]; for (const c of s.querySelectorAll(".wjoin")) { if (c.__chain) out.chains.push(s.__sec.label); else if (c.__key) out.runs.push(s.__sec.label); } } return out; }, CH);
  console.log(JSON.stringify({ runs: [...new Set(got.runs)].slice(0, 8), chains: [...new Set(got.chains)].slice(0, 8) }));
} finally { await browser.close(); await tree.close(); }
