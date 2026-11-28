// Scratch (builder H2): open the live reader of a tree on one book, press a few words by verse label and word
// number (marks not counted), and print what the sheet holds. Read only; serves the tree on a port the machine gives.
// node h2-smoke.mjs <reader dir> <book> <label:word> ... [--card=spelling|place]
import { join } from "node:path";
const [R, BOOK, ...rest] = process.argv.slice(2);
const want = rest.filter((x) => !x.startsWith("--"));
const card = (rest.find((x) => x.startsWith("--card=")) || "").slice(7);
const { serveTree } = await import(join(R, "tools", "serve-tree-v1.mjs"));
const { loadPlaywright, launchOptions } = await import(join(R, "tools", "playwright-v1.mjs"));
const pw = await loadPlaywright();
const tree = await serveTree(R);
const browser = await pw.chromium.launch(launchOptions());
try {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text()}`); });
  await page.goto(`${tree.base}/zone.html?b=${BOOK}${card ? `&card=${card}` : ""}`, { waitUntil: "networkidle" });
  await page.waitForSelector("section.seg .he-text .wb", { timeout: 60000 });
  await page.waitForTimeout(800);
  console.log("state", JSON.stringify(await page.evaluate(() => window.__placeCard)));
  for (const w of want) {
    const [label, n] = [w.slice(0, w.lastIndexOf(":")), Number(w.slice(w.lastIndexOf(":") + 1))];
    const got = await page.evaluate(async ({ label, n }) => {
      const turn = (ms) => new Promise((r) => setTimeout(r, ms));
      const sec = [...document.querySelectorAll("section.seg")].find((s) => s.__sec && s.__sec.label === label);
      if (!sec) return { fault: `no section ${label}` };
      sec.scrollIntoView({ block: "center" }); await turn(400);
      if (sec.__body && !sec.querySelector(".he-text")) { sec.__body(); await turn(100); }
      const wbs = [...sec.querySelectorAll(".he-text .wb:not(.mark)")];
      const wb = wbs[n - 1]; if (!wb) return { fault: `no word ${n} of ${wbs.length}` };
      (wb.querySelector(".w span") || wb.querySelector(".w") || wb).click();
      const hud = document.getElementById("hud");
      const t0 = performance.now();
      while (performance.now() - t0 < 8000) { const pc = hud.querySelector(".place-card"); if ((pc && [...pc.querySelectorAll("h3")].some((h) => h.textContent === "In the dictionaries") && [...pc.querySelectorAll("[data-ready]")].length) || hud.querySelector(".rows .b-read .r-pills")) break; await turn(60); }
      await turn(300);
      const r = hud.getBoundingClientRect();
      return { place: hud.classList.contains("place"), head: hud.querySelector(".head") ? hud.querySelector(".head").innerText.replace(/\s+/g, " ").slice(0, 200) : null,
        body: (hud.querySelector(".place-card") || hud).innerText.replace(/\s+/g, " ").slice(0, 900), rect: [Math.round(r.top), Math.round(r.height)], line: (wb.querySelector(":scope > .g") || {}).textContent };
    }, { label, n });
    console.log(`\n== ${label} word ${n}`, JSON.stringify(got, null, 1));
    await page.keyboard.press("Escape");
  }
  console.log("\nerrors", JSON.stringify(errors));
  console.log("state", JSON.stringify(await page.evaluate(() => window.__placeCard)));
} finally { await browser.close(); await tree.close(); }
