// Scratch (builder H2): line-follows-card's F6 sample, read word by word: under ?default=<id> on a book, the lines
// the check samples (20, evenly over the words built), each card's first pill, and where they differ, the word's
// verse and number. Read only.
// node h2-lfc.mjs <site root> <book> <default id> [sample]
import { join } from "node:path";
const [SITE, BOOK, DFLT, SAMPLE = "20"] = process.argv.slice(2);
const R = join(SITE, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright();
const tree = await serveTree(SITE);
const b = await pw.chromium.launch(launchOptions());
try {
  const q = await b.newPage({ viewport: { width: 412, height: 915 } });
  const errs = []; q.on("pageerror", (e) => errs.push(e.message));
  await q.addInitScript(() => { try { localStorage.clear(); localStorage.setItem("fh.signs", "printed"); } catch { /* fresh */ } });
  await q.goto(`${tree.base}/reader/zone.html?b=${BOOK}${DFLT !== "step" ? `&default=${DFLT}` : ""}`, { waitUntil: "networkidle" });
  await q.waitForSelector("section.seg .he-text .wb");
  await q.waitForFunction(() => { const d = window.__default; return !d || d.ready || d.failed; }, null, { timeout: 30000 }).catch(() => {});
  await q.waitForTimeout(500);
  const lines = await q.evaluate((n) => {
    const all = [...document.querySelectorAll("section.seg .he-text .wb:not(.kq)")];
    const wbs = all.filter((w) => w.querySelector(":scope > .g") && w.querySelector(":scope > .g").getClientRects().length);
    const step = Math.max(1, Math.floor(wbs.length / n));
    return wbs.filter((_, i) => i % step === 0).slice(0, n).map((w) => {
      const g = w.querySelector(":scope > .g"); const chip = g.querySelector(".g-lic");
      const sec = w.closest("section.seg"); const ws = [...sec.querySelectorAll(".he-text .wb:not(.mark)")];
      return { idx: all.indexOf(w), text: (chip ? g.textContent.replace(chip.textContent, "") : g.textContent).trim(), at: `${sec.__sec ? sec.__sec.label : "?"}:${ws.indexOf(w) + 1}`, he: (w.querySelector(".w") || {}).textContent };
    });
  }, Number(SAMPLE));
  for (const l of lines) {
    const c = await q.evaluate(async (i) => {
      const w = [...document.querySelectorAll("section.seg .he-text .wb:not(.kq)")][i];
      w.scrollIntoView({ block: "center" });
      (w.querySelector(".w span") || w.querySelector(".w")).click();
      const t0 = Date.now();
      while (Date.now() - t0 < 4000) { if (document.querySelector("#hud .r-pills button")) break; await new Promise((r) => setTimeout(r, 60)); }
      const pills = [...document.querySelectorAll("#hud .r-pills button")];
      const out = { first: pills[0] ? pills[0].textContent.replace(/\s+/g, " ").trim() : null, pressed: (pills.find((x) => x.getAttribute("aria-pressed") === "true") || {}).textContent || null, n: pills.length, by: pills[0] ? pills[0].dataset.by : null, pools: Object.fromEntries(Object.entries(window.__placeCard.pools || {}).map(([k, v]) => [k, (v.gave || []).slice(0, 6)])) };
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await new Promise((r) => setTimeout(r, 80));
      return out;
    }, l.idx);
    const same = (t) => String(t || "").replace(/<[^<>]*>/gu, "").replace(/​/gu, "").replace(/(\s*\+\s*)+/gu, " + ").replace(/^\s*\+\s*/u, "").replace(/\s*\+\s*$/u, "").trim();
    const ok = !c.first || same(c.first) === same(l.text) || same(c.first).startsWith(same(l.text).slice(0, 12));
    console.log(`${ok ? "  " : "XX"} ${l.at} ${l.he} line «${l.text}» first «${c.first}» pressed «${c.pressed}» (${c.n}, ${c.by})${ok ? "" : ` pools ${JSON.stringify(c.pools)}`}`);
  }
  if (errs.length) console.log("errors:", errs.join(" | "));
} finally { await b.close(); await tree.close(); }
