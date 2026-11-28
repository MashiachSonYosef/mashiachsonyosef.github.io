// Scratch (builder H2): the words gloss-whole presses for its ruling (the first ten glossed words of the default
// book), each card's longest pill against its line. Read only. node h2-gloss-whole.mjs <site root> [query]
import { join } from "node:path";
const [SITE, Q] = process.argv.slice(2);
const R = join(SITE, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright(); const tree = await serveTree(SITE); const b = await pw.chromium.launch(launchOptions());
try {
  const p = await b.newPage({ viewport: { width: 412, height: 915 } });
  if (process.env.KINDS) await p.addInitScript((v) => { try { localStorage.setItem("fh.kinds", v); } catch { /* none */ } }, process.env.KINDS);
  await p.goto(`${tree.base}/reader/zone.html?b=amos${Q ? `&${Q}` : ""}`, { waitUntil: "networkidle" });
  await p.waitForSelector("section.seg .he-text .wb .g:not(.bare)");
  for (let i = 0; i < 10; i += 1) {
    const ok = await p.evaluate((ix) => { const g = document.querySelectorAll("section.seg .he-text .wb .g:not(.bare)")[ix]; const wb = g && g.closest(".wb"); if (!wb) return false; wb.scrollIntoView({ block: "center" }); wb.click(); return true; }, i);
    if (!ok) break;
    await p.waitForSelector("#hud .r-pills button", { timeout: 20000 }).catch(() => {});
    await p.waitForTimeout(300);
    console.log(i, JSON.stringify(await p.evaluate((i) => { const bs = [...document.querySelectorAll("#hud .r-pills button")]; const g = [...document.querySelectorAll("section.seg .he-text .wb .g:not(.bare)")].map((el) => el.closest(".wb"))[i].querySelector(".g"); const long = bs.map((x) => x.textContent.trim()).sort((a, c) => c.length - a.length)[0] || ""; return { line: g.textContent.trim(), n: bs.length, longest: long, grew: long.length - g.textContent.trim().length, held: (document.querySelector("#hud .kinds-switch") || {}).textContent || null }; }, i)));
    await p.keyboard.press("Escape"); await p.waitForTimeout(100);
  }
} finally { await b.close(); await tree.close(); }
