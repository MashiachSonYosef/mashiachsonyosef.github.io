// Scratch (builder H2): read what one word's card says on the live reader, at a phone's size, for finding why a law
// is red. Read only: the site root is served on a port the machine gives.
// node h2-probe.mjs <site root> '<job json or [jobs]>'
//   a job: { book, label, n (word number, marks not counted, or "chain"/"run"), query ("a=b&c=d"), ls ({ key: value }
//            set in localStorage before the load), cell (the index of a cell to press after the card opens),
//            pill (a pill's text to press after), wait (ms after the load, default 1200) }
import { join } from "node:path";
const [SITE, JOBS] = process.argv.slice(2);
const R = join(SITE, "reader");
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
let jobs = JSON.parse(JOBS); if (!Array.isArray(jobs)) jobs = [jobs];
const pw = await loadPlaywright();
const tree = await serveTree(SITE);
const browser = await pw.chromium.launch(launchOptions());
const read = () => {
  const hud = document.getElementById("hud");
  const t = (e) => (e ? e.textContent.replace(/\s+/g, " ").trim() : null);
  const pills = [...hud.querySelectorAll(".b-read .r-pills button")];
  const g = window.__probeWb ? window.__probeWb.querySelector(":scope > .g") : null;
  const gc = g ? g.cloneNode(true) : null; if (gc) gc.querySelectorAll(".g-lic").forEach((x) => x.remove());
  return {
    line: gc ? gc.textContent.trim() : null, chip: g && g.querySelector(".g-lic") ? g.querySelector(".g-lic").textContent : null,
    head: t(hud.querySelector(".rows .r-line, .rows .b-line")),
    label: t(hud.querySelector(".b-read .r-label")),
    first: pills[0] ? t(pills[0]) : null, pressed: (pills.find((b) => b.getAttribute("aria-pressed") === "true") || {}).textContent || null,
    pills: pills.slice(0, 12).map((b) => t(b)), n: pills.length,
    cells: [...hud.querySelectorAll(".b-cell .s-pills button")].map((b) => `${t(b)}${b.getAttribute("aria-pressed") === "true" ? "*" : ""}`),
    divs: [...hud.querySelectorAll(".b-div .s-pills button, .b-cut .s-pills button")].map((b) => `${t(b)}${b.getAttribute("aria-pressed") === "true" ? "*" : ""}`),
    notes: [...hud.querySelectorAll(".b-read > p:not(.r-label)")].map(t).slice(0, 4),
    att: t(hud.querySelector(".d-card .att")), say: t(hud.querySelector(".line-unoffered")), roles: [...hud.querySelectorAll(".kq-role")].map(t).slice(0, 4),
    place: hud.classList.contains("place"),
    pools: Object.fromEntries(Object.entries((window.__placeCard && window.__placeCard.pools) || {}).map(([k, v]) => [k, { at: v.at, gave: (v.gave || []).slice(0, 8), why: v.why }])),
  };
};
try {
  for (const job of jobs) {
    const ctx = await browser.newContext({ viewport: job.vp || { width: 412, height: 915 }, ...(job.vp ? {} : { isMobile: true, hasTouch: true }) });
    const page = await ctx.newPage(); const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    if (job.ls) await page.addInitScript((ls) => { try { for (const [k, v] of Object.entries(ls)) localStorage.setItem(k, v); } catch { /* none */ } }, job.ls);
    await page.goto(`${tree.base}/reader/zone.html?b=${job.book}${job.query ? `&${job.query}` : ""}`, { waitUntil: "networkidle" });
    await page.waitForSelector("section.seg", { timeout: 60000 });
    await page.waitForFunction(() => window.__placeCard && typeof window.__materialise === "function", null, { timeout: 60000 });
    await page.waitForTimeout(job.wait ?? 1200);
    const handle = await page.evaluateHandle(async ([label, n]) => {
      const all = [...document.querySelectorAll("section.seg")];
      const sec = all.find((s) => s.__sec && s.__sec.label === label); const i = all.indexOf(sec);
      window.__materialise(Math.max(0, i - 3), i + 4);
      await new Promise((r) => setTimeout(r, 300));
      let wb = [...sec.querySelectorAll(".he-text .wb:not(.mark)")][n - 1];
      if (typeof n === "string") { const cell = [...sec.querySelectorAll(".wjoin")].find((x) => (n === "chain" ? x.__chain : x.__key && !x.__chain)); wb = cell ? cell.querySelector(".wb") : null; }
      window.__probeWb = wb;
      const r = wb.getBoundingClientRect(); window.scrollBy(0, r.top - 120);
      return wb.querySelector(".w span") || wb.querySelector(".w") || wb;
    }, [job.label, job.n]);
    await page.waitForTimeout(500);
    const lineBefore = await page.evaluate(read);
    await handle.tap();
    const settled = () => page.waitForFunction(() => { const b = document.querySelector("#hud .b-read"); return !!b && !b.querySelector(".r-wait") && !!(b.querySelector(".r-pills button") || b.querySelector("p:not(.r-label)")); }, null, { timeout: 15000 }).catch(() => null);
    await settled(); await page.waitForTimeout(700);
    const out = { job, lineBefore: lineBefore.line, ...(job.eval ? { evalBefore: await page.evaluate(job.eval).catch((e) => String(e)) } : {}), open: await page.evaluate(read) };
    if (Number.isInteger(job.cell)) { await page.evaluate((i) => { const c = [...document.querySelectorAll("#hud .b-cell .s-pills button")][i]; if (c) c.click(); }, job.cell); await page.waitForTimeout(400); await settled(); await page.waitForTimeout(500); out.cell = await page.evaluate(read); }
    if (job.after) { out.afterSaid = await page.evaluate(job.after).catch((e) => String(e)); await page.waitForTimeout(1200); await settled(); await page.waitForTimeout(500); out.cell = await page.evaluate(read); }
    if (job.pill) { await page.evaluate((t) => { const b = [...document.querySelectorAll("#hud .b-read .r-pills button")].find((x) => x.textContent === t); if (b) b.click(); }, job.pill); await page.waitForTimeout(800); out.pressed = await page.evaluate(read); }
    out.errors = errors;
    console.log(JSON.stringify(out, null, 1));
    await ctx.close();
  }
} finally { await browser.close(); await tree.close(); }
